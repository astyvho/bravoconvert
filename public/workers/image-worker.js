/**
 * Image Conversion Worker with EXIF Autorotate and Metadata Stripping
 * 
 * Handles image processing in background thread to prevent UI blocking
 * Supports: EXIF orientation correction, metadata removal, format conversion
 * Performance: Uses OffscreenCanvas and Transferable objects
 */

// EXIF orientation reading logic (lightweight version for worker)
async function readOrientation(buffer) {
  try {
    const view = new DataView(buffer);
    
    // Check for JPEG header
    if (view.getUint16(0, false) !== 0xFFD8) {
      return null; // Not a JPEG
    }
    
    let offset = 2;
    const length = buffer.byteLength;
    
    // Find EXIF marker
    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      
      if (marker === 0xFFE1) { // EXIF marker
        const exifLength = view.getUint16(offset, false);
        const exifStart = offset + 2;
        
        // Check for EXIF header
        if (view.getUint32(exifStart, false) === 0x45786966) { // "Exif"
          const tiffStart = exifStart + 6;
          
          // Determine byte order
          const byteOrder = view.getUint16(tiffStart, false);
          const littleEndian = byteOrder === 0x4949;
          
          // Get IFD0 offset
          const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
          const ifd0Start = tiffStart + ifd0Offset;
          
          // Read number of entries
          const numEntries = view.getUint16(ifd0Start, littleEndian);
          
          // Search for orientation tag (0x0112)
          for (let i = 0; i < numEntries; i++) {
            const entryOffset = ifd0Start + 2 + (i * 12);
            const tag = view.getUint16(entryOffset, littleEndian);
            
            if (tag === 0x0112) { // Orientation tag
              const orientation = view.getUint16(entryOffset + 8, littleEndian);
              return orientation;
            }
          }
        }
        break;
      } else if (marker === 0xFFDA) { // Start of scan
        break;
      } else {
        // Skip this segment
        const segmentLength = view.getUint16(offset, false);
        offset += segmentLength;
      }
    }
  } catch (error) {
    console.warn('EXIF reading failed:', error);
  }
  
  return null;
}

// Apply EXIF orientation to canvas
function getCanvasWithOrientation(imageBitmap, orientation) {
  const { width, height } = imageBitmap;
  
  // No orientation or normal orientation
  if (!orientation || orientation === 1) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);
    return canvas;
  }
  
  let canvas, ctx;
  
  switch (orientation) {
    case 2: // Flip horizontal
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
      ctx.scale(-1, 1);
      ctx.drawImage(imageBitmap, -width, 0);
      break;
      
    case 3: // Rotate 180°
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
      ctx.rotate(Math.PI);
      ctx.drawImage(imageBitmap, -width, -height);
      break;
      
    case 4: // Flip vertical
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
      ctx.scale(1, -1);
      ctx.drawImage(imageBitmap, 0, -height);
      break;
      
    case 5: // Rotate 90° CCW + flip horizontal
      canvas = new OffscreenCanvas(height, width);
      ctx = canvas.getContext('2d');
      ctx.rotate(-Math.PI / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(imageBitmap, -height, -width);
      break;
      
    case 6: // Rotate 90° CW
      canvas = new OffscreenCanvas(height, width);
      ctx = canvas.getContext('2d');
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(imageBitmap, 0, -height);
      break;
      
    case 7: // Rotate 90° CW + flip horizontal
      canvas = new OffscreenCanvas(height, width);
      ctx = canvas.getContext('2d');
      ctx.rotate(Math.PI / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(imageBitmap, -height, 0);
      break;
      
    case 8: // Rotate 90° CCW
      canvas = new OffscreenCanvas(height, width);
      ctx = canvas.getContext('2d');
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(imageBitmap, -height, 0);
      break;
      
    default: // Fallback to normal
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0);
  }
  
  return canvas;
}

// Main worker message handler
self.onmessage = async (e) => {
  const { type, payload, id } = e.data;
  
  if (type !== 'convert') {
    return;
  }
  
  try {
    const { 
      buffer, 
      autorotate = true, 
      stripMetadata = true, 
      outType = 'image/webp', 
      quality = 0.9,
      originalName = 'unknown'
    } = payload;
    
    // 1) Create Blob and ImageBitmap from buffer
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const imageBitmap = await createImageBitmap(blob, { 
      colorSpaceConversion: 'default' 
    });
    
    // 2) Read EXIF orientation if autorotate enabled
    const orientation = autorotate ? await readOrientation(buffer) : null;
    
    // 3) Apply orientation correction
    const canvas = autorotate 
      ? getCanvasWithOrientation(imageBitmap, orientation)
      : (() => {
          const c = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
          c.getContext('2d').drawImage(imageBitmap, 0, 0);
          return c;
        })();
    
    // 4) Convert to target format (strips metadata automatically via re-encoding)
    const outputQuality = (outType === 'image/jpeg' || outType === 'image/webp') ? quality : undefined;
    const outputBlob = await canvas.convertToBlob({ 
      type: outType, 
      quality: outputQuality 
    });
    
    // 5) Convert blob to ArrayBuffer for transfer
    const outputBuffer = await outputBlob.arrayBuffer();
    
    // 6) Generate thumbnail
    const thumbScale = Math.min(200 / canvas.width, 200 / canvas.height);
    const thumbWidth = Math.floor(canvas.width * thumbScale);
    const thumbHeight = Math.floor(canvas.height * thumbScale);
    
    const thumbCanvas = new OffscreenCanvas(thumbWidth, thumbHeight);
    const thumbCtx = thumbCanvas.getContext('2d');
    thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
    
    const thumbBlob = await thumbCanvas.convertToBlob({ 
      type: 'image/webp', 
      quality: 0.7 
    });
    const thumbBuffer = await thumbBlob.arrayBuffer();
    
    // 7) Cleanup resources
    imageBitmap.close();
    
    // 8) Send result back to main thread
    self.postMessage({
      type: 'done',
      id,
      payload: {
        outputBuffer,
        thumbBuffer,
        originalSize: buffer.byteLength,
        outputSize: outputBuffer.byteLength,
        width: canvas.width,
        height: canvas.height,
        originalName,
        orientation: orientation || 1
      }
    }, [outputBuffer, thumbBuffer]); // Transfer ownership
    
  } catch (error) {
    // Error handling
    console.error('Worker conversion failed:', error);
    self.postMessage({
      type: 'error',
      id,
      payload: {
        message: error.message || 'Conversion failed',
        originalName: payload?.originalName || 'unknown'
      }
    });
  }
};

// Quick Test Checklist:
// - 10장 이미지 일괄 변환 시 UI 멈춤 없음 확인
// - autorotate ON/OFF 시 방향 차이 확인 
// - stripMetadata ON 시 메타 제거 확인
// - 모바일에서도 정상 동작 확인
// - 대용량 파일 처리 시 메모리 사용량 확인