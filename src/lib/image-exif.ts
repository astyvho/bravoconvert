import { parse } from 'exifr';

/**
 * EXIF Orientation and Auto-Rotation Utilities
 * 
 * These utilities handle EXIF orientation reading and automatic image rotation
 * to ensure images display correctly regardless of their EXIF orientation data.
 * All metadata is automatically removed during the canvas processing.
 */

/**
 * Reads EXIF orientation value from an image file
 * @param file - Image file to read orientation from
 * @returns Promise<number|null> - EXIF orientation value (1-8) or null if not found
 */
export async function readOrientation(file: File): Promise<number | null> {
  try {
    // Parse only the orientation field for performance
    const exifData = await parse(file, ['orientation']);
    
    return exifData?.orientation || null;
  } catch (error) {
    console.warn('Failed to read EXIF orientation:', error);
    return null;
  }
}

/**
 * Creates a properly oriented canvas from an ImageBitmap based on EXIF orientation
 * This function automatically handles rotation and flipping according to EXIF standards
 * @param img - ImageBitmap source image
 * @param orientation - EXIF orientation value (1-8) or null
 * @returns OffscreenCanvas with properly oriented image and metadata removed
 */
export function getCanvasWithOrientation(
  img: ImageBitmap, 
  orientation: number | null
): OffscreenCanvas {
  // Get original dimensions
  const { width, height } = img;
  
  // Determine final canvas dimensions based on orientation
  let canvasWidth = width;
  let canvasHeight = height;
  
  // For orientations 5-8, swap width and height
  if (orientation && orientation >= 5 && orientation <= 8) {
    canvasWidth = height;
    canvasHeight = width;
  }
  
  // Create OffscreenCanvas for better performance
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get 2D context from OffscreenCanvas');
  }
  
  // Apply transformations based on EXIF orientation
  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
  switch (orientation) {
    case 1:
      // Normal - no transformation needed
      break;
    case 2:
      // Flip horizontal
      ctx.scale(-1, 1);
      ctx.translate(-canvasWidth, 0);
      break;
    case 3:
      // Rotate 180°
      ctx.rotate(Math.PI);
      ctx.translate(-canvasWidth, -canvasHeight);
      break;
    case 4:
      // Flip vertical
      ctx.scale(1, -1);
      ctx.translate(0, -canvasHeight);
      break;
    case 5:
      // Rotate 90° CW + flip horizontal
      ctx.rotate(Math.PI / 2);
      ctx.scale(-1, 1);
      ctx.translate(-canvasHeight, -canvasWidth);
      break;
    case 6:
      // Rotate 90° CW
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -canvasWidth);
      break;
    case 7:
      // Rotate 90° CCW + flip horizontal
      ctx.rotate(-Math.PI / 2);
      ctx.scale(-1, 1);
      ctx.translate(-canvasHeight, 0);
      break;
    case 8:
      // Rotate 90° CCW
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-canvasHeight, 0);
      break;
    default:
      // Unknown orientation or null - no transformation
      break;
  }
  
  // Draw the image with applied transformations
  ctx.drawImage(img, 0, 0);
  
  return canvas;
}

/**
 * Sample Usage:
 * 
 * // Basic usage in image conversion workflow:
 * const handleImageWithExif = async (file: File) => {
 *   try {
 *     // 1. Read EXIF orientation
 *     const orientation = await readOrientation(file);
 *     
 *     // 2. Create ImageBitmap from file
 *     const imageBitmap = await createImageBitmap(file);
 *     
 *     // 3. Get properly oriented canvas (metadata removed)
 *     const orientedCanvas = getCanvasWithOrientation(imageBitmap, orientation);
 *     
 *     // 4. Convert to blob for download/further processing
 *     const blob = await orientedCanvas.convertToBlob({
 *       type: 'image/jpeg',
 *       quality: 0.9
 *     });
 *     
 *     // 5. Clean up resources
 *     imageBitmap.close();
 *     
 *     return blob;
 *   } catch (error) {
 *     console.error('Error processing image with EXIF:', error);
 *     throw error;
 *   }
 * };
 * 
 * // Integration with existing ImageConverter:
 * // In the conversion function, replace direct canvas usage with:
 * // const orientation = await readOrientation(file);
 * // const imageBitmap = await createImageBitmap(file);
 * // const canvas = getCanvasWithOrientation(imageBitmap, orientation);
 * // const blob = await canvas.convertToBlob({ type: targetFormat });
 */