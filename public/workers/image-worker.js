/* BravoConvert image conversion worker. File contents never leave the browser. */

function readJpegOrientation(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;
    if ((marker & 0xff00) !== 0xff00 || offset + 2 > view.byteLength) break;

    const length = view.getUint16(offset, false);
    if (length < 2 || offset + length > view.byteLength) break;

    if (marker === 0xffe1 && length >= 10 && view.getUint32(offset + 2, false) === 0x45786966) {
      const tiff = offset + 8;
      const littleEndian = view.getUint16(tiff, false) === 0x4949;
      const firstIfd = tiff + view.getUint32(tiff + 4, littleEndian);
      if (firstIfd + 2 > view.byteLength) return 1;
      const entries = view.getUint16(firstIfd, littleEndian);

      for (let index = 0; index < entries; index += 1) {
        const entry = firstIfd + 2 + index * 12;
        if (entry + 12 > view.byteLength) break;
        if (view.getUint16(entry, littleEndian) === 0x0112) {
          const value = view.getUint16(entry + 8, littleEndian);
          return value >= 1 && value <= 8 ? value : 1;
        }
      }
    }
    offset += length;
  }
  return 1;
}

function createOrientedCanvas(bitmap, orientation) {
  const swapDimensions = orientation >= 5 && orientation <= 8;
  const width = swapDimensions ? bitmap.height : bitmap.width;
  const height = swapDimensions ? bitmap.width : bitmap.height;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to initialize image canvas.');

  switch (orientation) {
    case 2: context.transform(-1, 0, 0, 1, width, 0); break;
    case 3: context.transform(-1, 0, 0, -1, width, height); break;
    case 4: context.transform(1, 0, 0, -1, 0, height); break;
    case 5: context.transform(0, 1, 1, 0, 0, 0); break;
    case 6: context.transform(0, 1, -1, 0, width, 0); break;
    case 7: context.transform(0, -1, -1, 0, width, height); break;
    case 8: context.transform(0, -1, 1, 0, 0, height); break;
  }

  context.drawImage(bitmap, 0, 0);
  return canvas;
}

async function encodeToTarget(canvas, type, quality, targetBytes) {
  let outputBlob = await canvas.convertToBlob({ type, quality });
  if (!targetBytes || !['image/jpeg', 'image/webp'].includes(type) || outputBlob.size <= targetBytes) return outputBlob;

  let low = 0.1;
  let high = Math.max(0.1, quality || 0.85);
  let best = outputBlob;
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const candidateQuality = (low + high) / 2;
    const candidate = await canvas.convertToBlob({ type, quality: candidateQuality });
    if (candidate.size < best.size) best = candidate;
    if (candidate.size <= targetBytes) {
      best = candidate;
      low = candidateQuality;
    } else {
      high = candidateQuality;
    }
  }
  return best;
}

async function convertImage(payload) {
  const { buffer, autorotate, outType, quality, originalName, targetBytes } = payload;
  const orientation = autorotate ? readJpegOrientation(buffer) : 1;
  const sourceBlob = new Blob([buffer]);
  const bitmap = await createImageBitmap(sourceBlob, { imageOrientation: 'none' });

  try {
    const canvas = createOrientedCanvas(bitmap, orientation);
    const outputBlob = await encodeToTarget(canvas, outType, quality, targetBytes);
    if (outputBlob.type !== outType) {
      throw new Error(`This browser cannot encode ${outType}.`);
    }

    const scale = Math.min(150 / canvas.width, 150 / canvas.height, 1);
    const thumbWidth = Math.max(1, Math.round(canvas.width * scale));
    const thumbHeight = Math.max(1, Math.round(canvas.height * scale));
    const thumbCanvas = new OffscreenCanvas(thumbWidth, thumbHeight);
    const thumbContext = thumbCanvas.getContext('2d');
    if (!thumbContext) throw new Error('Unable to create thumbnail.');
    thumbContext.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
    const thumbBlob = await thumbCanvas.convertToBlob({ type: 'image/webp', quality: 0.75 });

    return {
      outputBuffer: await outputBlob.arrayBuffer(),
      thumbBuffer: await thumbBlob.arrayBuffer(),
      originalSize: buffer.byteLength,
      outputSize: outputBlob.size,
      width: canvas.width,
      height: canvas.height,
      originalName,
      orientation,
    };
  } finally {
    bitmap.close();
  }
}

self.onmessage = async (event) => {
  const { type, id, payload } = event.data || {};
  if (type !== 'convert' || !id || !payload) return;

  try {
    const result = await convertImage(payload);
    self.postMessage(
      { type: 'done', id, payload: result },
      [result.outputBuffer, result.thumbBuffer],
    );
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      payload: { message: error instanceof Error ? error.message : 'Image conversion failed.' },
    });
  }
};
