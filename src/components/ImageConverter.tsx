"use client";
import { useRef, useReducer, useCallback, useMemo, useEffect } from "react";
import JSZip from "jszip";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download, GripVertical, Sparkles } from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import jsPDF from "jspdf";
import { arrayMove } from '@dnd-kit/sortable';

import { FileList } from "./image-converter/FileList";
import { FileItem, ResultItem, ConvertOptions } from "./image-converter/types";
import { ADD_FORMATS, TO_FORMATS } from "./image-converter/formats";
import { readOrientation, getCanvasWithOrientation } from "@/lib/image-exif";

/**
 * ImageConverter Component with EXIF Auto-Rotation Support
 * 
 * Features:
 * - Automatic EXIF orientation detection and correction
 * - Metadata removal during conversion process
 * - User toggleable options for autorotate and stripMetadata
 * - Fallback to basic conversion if EXIF processing fails
 * - Support for all EXIF orientations (1-8)
 * - Performance optimized with OffscreenCanvas and ImageBitmap
 * 
 * Quick Test Checklist:
 * - iPhone vertical photo upload with autorotate ON/OFF comparison
 * - stripMetadata ON should remove EXIF from re-encoded results
 * - Multiple file selection should apply options to all files
 */

// Reducer state and actions
type State = {
  fileArr: FileItem[];
  resultArr: (ResultItem | null)[];
  isLoading: boolean;
  progress: number;
  isReorderMode: boolean;
  originalFileOrder: FileItem[];
  viewMode: 'card' | 'list';
  addFormat: typeof ADD_FORMATS[0];
  toFormat: typeof TO_FORMATS[0];
  autorotate: boolean;
  stripMetadata: boolean;
};

type Action =
  | { type: 'ADD_FILES'; payload: File[] }
  | { type: 'REMOVE_FILE'; payload: number }
  | { type: 'REORDER_FILES'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'RESET_ORDER' }
  | { type: 'SET_CONVERT_FORMAT'; payload: typeof TO_FORMATS[0] }
  | { type: 'SET_ADD_FORMAT'; payload: typeof ADD_FORMATS[0] }
  | { type: 'START_CONVERSION' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_RESULTS'; payload: (ResultItem | null)[] }
  | { type: 'FINISH_CONVERSION' }
  | { type: 'TOGGLE_REORDER_MODE' }
  | { type: 'SET_VIEW_MODE'; payload: 'card' | 'list' }
  | { type: 'TOGGLE_AUTOROTATE' }
  | { type: 'TOGGLE_STRIP_METADATA' }
  | { type: 'RESET_STATE' };

const initialState: State = {
  fileArr: [],
  resultArr: [],
  isLoading: false,
  progress: 0,
  isReorderMode: false,
  originalFileOrder: [],
  viewMode: 'list', // 기본값을 list로 변경
  addFormat: ADD_FORMATS[6], // PNG
  toFormat: TO_FORMATS[0], // WEBP
  autorotate: true, // 기본값 ON
  stripMetadata: true, // 기본값 ON
};

const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_FILES': {
      const newFiles = action.payload
        .filter(f => !state.fileArr.some(p => p.file.name === f.name && p.file.size === f.size))
        .map(f => ({ file: f, format: state.toFormat.label.toLowerCase(), id: `${f.name}_${f.size}` }));

      const combined = [...state.fileArr, ...newFiles];
      let finalOrder = combined;
      if (state.toFormat.label === "PDF") {
        finalOrder = combined.sort((a, b) => naturalSort(a.file.name, b.file.name));
      }
      
      return {
        ...state,
        fileArr: finalOrder,
        resultArr: finalOrder.map(() => null),
        originalFileOrder: state.toFormat.label === "PDF" ? [...finalOrder] : state.originalFileOrder,
      };
    }
    case 'REMOVE_FILE': {
        const newFileArr = state.fileArr.filter((_, i) => i !== action.payload);
        const newResultArr = state.resultArr.filter((_, i) => i !== action.payload);
        return { ...state, fileArr: newFileArr, resultArr: newResultArr };
    }
    case 'REORDER_FILES': {
        const { oldIndex, newIndex } = action.payload;
        return {
            ...state,
            fileArr: arrayMove(state.fileArr, oldIndex, newIndex),
            resultArr: arrayMove(state.resultArr, oldIndex, newIndex),
        };
    }
    case 'RESET_ORDER':
      return { ...state, fileArr: [...state.originalFileOrder], resultArr: state.originalFileOrder.map(() => null) };
    case 'SET_ADD_FORMAT':
    case 'SET_CONVERT_FORMAT':
        return { ...initialState, addFormat: action.type === 'SET_ADD_FORMAT' ? action.payload : state.addFormat, toFormat: action.type === 'SET_CONVERT_FORMAT' ? action.payload : state.toFormat };
    case 'START_CONVERSION':
      return { ...state, isLoading: true, progress: 0 };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_RESULTS':
      return { ...state, resultArr: action.payload };
    case 'FINISH_CONVERSION':
      return { ...state, isLoading: false, progress: 100 };
    case 'TOGGLE_REORDER_MODE':
      return { ...state, isReorderMode: !state.isReorderMode };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_AUTOROTATE':
      return { ...state, autorotate: !state.autorotate };
    case 'TOGGLE_STRIP_METADATA':
      return { ...state, stripMetadata: !state.stripMetadata };
    case 'RESET_STATE':
        return initialState;
    default:
      return state;
  }
}

export default function ImageConverter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { fileArr, resultArr, isLoading, progress, isReorderMode, originalFileOrder, viewMode, addFormat, toFormat, autorotate, stripMetadata } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memory Leak Prevention: Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      resultArr.forEach(result => {
        if (result?.url) {
          URL.revokeObjectURL(result.url);
        }
      });
    };
  }, [resultArr]);

  // 파일 형식 자동 감지 함수
  const detectFileFormat = useCallback((file: File) => {
    // MIME 타입으로 우선 감지
    if (file.type) {
      const format = ADD_FORMATS.find(f => f.mime === file.type);
      if (format) return format;
    }
    
    // 파일 확장자로 감지
    const extension = file.name.toLowerCase().split('.').pop();
    const extensionMap = {
      'bmp': 'image/bmp',
      'cr3': 'image/x-canon-cr3',
      'dng': 'image/x-adobe-dng',
      'heic': 'image/heic',
      'heif': 'image/heic',
      'jfif': 'image/jfif',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'jpe': 'image/jpeg',
      'png': 'image/png',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'gif': 'image/gif',
    };
    
    const mimeType = extensionMap[extension as keyof typeof extensionMap];
    if (mimeType) {
      return ADD_FORMATS.find(f => f.mime === mimeType);
    }
    
    return null;
  }, []);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    // 이미지 파일만 필터링
    const imageFiles = fileArray.filter(f => {
      return f.type.startsWith('image/') || 
             ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'heic', 'heif', 'jfif', 'cr3', 'dng']
               .includes(f.name.toLowerCase().split('.').pop() || '');
    });
    
    if (imageFiles.length === 0) {
      alert('No image files found. Please select image files.');
      return;
    }
    
    // 첫 번째 파일의 형식을 기준으로 addFormat 자동 설정
    const firstFile = imageFiles[0];
    const detectedFormat = detectFileFormat(firstFile);
    
         if (detectedFormat && detectedFormat.label !== addFormat.label) {
       // 자동으로 입력 형식 변경
       dispatch({ type: 'SET_ADD_FORMAT', payload: detectedFormat });
       console.log(`Auto-detected input format: ${detectedFormat.label}`);
       
       // 사용자에게 자동 감지 알림 (선택적)
       if (imageFiles.length === 1) {
         console.log(`Auto-detected ${detectedFormat.label} format from your image!`);
       } else {
         console.log(`Auto-detected ${detectedFormat.label} format from your images!`);
       }
     }
    
    // 현재 또는 감지된 형식과 일치하는 파일들만 필터링
    const targetFormat = detectedFormat || addFormat;
    const validFiles = imageFiles.filter(f => {
      const fileFormat = detectFileFormat(f);
      return fileFormat?.mime === targetFormat.mime;
    });
    
    if (validFiles.length === 0) {
      alert(`No valid ${targetFormat.label} files found.`);
      return;
    }
    
    if (validFiles.length < imageFiles.length) {
      const filteredCount = imageFiles.length - validFiles.length;
      console.log(`${filteredCount} file${filteredCount > 1 ? 's were' : ' was'} filtered out (different format)`);
    }
    
    if (imageFiles.length < fileArray.length) {
      const nonImageCount = fileArray.length - imageFiles.length;
      console.log(`${nonImageCount} non-image file${nonImageCount > 1 ? 's were' : ' was'} filtered out`);
    }
    
    dispatch({ type: 'ADD_FILES', payload: validFiles });
  }, [addFormat, detectFileFormat]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    } catch (error) {
      console.error('Error handling file drop:', error);
      alert('Error processing dropped files. Please try again.');
    }
  }, [addFiles]);

  const fileToDataUrl = useCallback((file: File): Promise<string> =>
    new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string);
      reader.readAsDataURL(file);
    }), []);

  /**
   * Main conversion pipeline with EXIF autorotate and metadata stripping
   * 
   * Pipeline flow:
   * 1. Extract file as ArrayBuffer → Blob → ImageBitmap for optimal processing
   * 2. Read EXIF orientation (if autorotate enabled)
   * 3. Apply orientation transformation on OffscreenCanvas
   * 4. Re-encode to target format (strips metadata automatically)
   * 5. Generate thumbnail and cleanup resources
   * 
   * Testing checklist:
   * - iPhone vertical photo with autorotate ON/OFF comparison
   * - JPEG/WebP quality 0.6/0.9 file size comparison
   * - Multi-file processing with progress tracking
   * - Memory usage during batch processing
   */
  const convertToFormat = useCallback(async (file: File, format: string, options: ConvertOptions = {}): Promise<{ blob: Blob; thumb: string }> => {
    const { autorotate: enableAutorotate = true, stripMetadata: enableStripMetadata = true } = options;
    
    try {
      // 1) File processing pipeline: ArrayBuffer → Blob → ImageBitmap
      const ab = await file.arrayBuffer();
      const blob = new Blob([ab], { type: file.type || 'application/octet-stream' });
      const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'default' });
      
      // 2) EXIF autorotate branch
      const orientation = enableAutorotate ? await readOrientation(file) : null;
      const canvas = enableAutorotate 
        ? getCanvasWithOrientation(bmp, orientation)
        : (() => {
            const c = new OffscreenCanvas(bmp.width, bmp.height);
            c.getContext('2d')!.drawImage(bmp, 0, 0);
            return c;
          })();
      
      // 3) Strip metadata via re-encoding (guaranteed by format conversion)
      const outType = `image/${format}`;
      const outQuality = (outType === 'image/jpeg' || outType === 'image/webp') ? 0.9 : undefined;
      
      // Note: Re-encoding automatically removes EXIF/ICC metadata (stripMetadata effect)
      // TODO: Future enhancement - when stripMetadata=false, preserve original EXIF data
      const outBlob = ('convertToBlob' in canvas)
        ? await (canvas as any).convertToBlob({ type: outType, quality: outQuality })
        : await new Promise<Blob>(res => (canvas as any).toBlob(res, outType, outQuality ?? 0.92));
      
      // 4) Generate thumbnail for UI display
      const thumbCanvas = document.createElement('canvas');
      const thumbCtx = thumbCanvas.getContext('2d');
      
      if (thumbCtx) {
        const scale = Math.min(200 / canvas.width, 200 / canvas.height);
        const thumbWidth = canvas.width * scale;
        const thumbHeight = canvas.height * scale;
        
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
      }
      
      const thumb = thumbCanvas.toDataURL('image/webp', 0.7);
      
      // 5) Memory management - cleanup resources
      bmp.close();
      
      return { blob: outBlob, thumb };
      
    } catch (error) {
      console.warn('EXIF processing failed, falling back to basic conversion:', error);
      
      // Fallback pipeline for error cases
      return new Promise<{ blob: Blob; thumb: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({ 
                    blob, 
                    thumb: canvas.toDataURL("image/webp", 0.7) 
                  });
                } else {
                  reject(new Error('Failed to create blob in fallback'));
                }
              },
              `image/${format}`,
              format === 'jpeg' ? 0.9 : undefined
            );
          };
          img.onerror = () => reject(new Error('Failed to load image in fallback'));
          img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file in fallback'));
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const convertIndividualImages = async () => {
    dispatch({ type: 'START_CONVERSION' });
    const results: (ResultItem | null)[] = [...resultArr];
    let successCount = 0;
    let failureCount = 0;
    
    for (let idx = 0; idx < fileArr.length; idx++) {
      if (results[idx]) { // Skip already converted
        successCount++;
        dispatch({ type: 'UPDATE_PROGRESS', payload: ((idx + 1) / fileArr.length) * 100 });
        continue;
      }
      
      const item = fileArr[idx];
      const t0 = performance.now();
      
      try {
        // Use main conversion pipeline with proper error handling
        const { blob, thumb } = await convertToFormat(item.file, toFormat.label.toLowerCase(), { autorotate, stripMetadata });
        const t1 = performance.now();
        const outName = item.file.name.replace(/\.[^/.]+$/, `.${toFormat.label.toLowerCase()}`);
        
        results[idx] = {
          url: URL.createObjectURL(blob),
          outName,
          inSize: (item.file.size / 1024).toFixed(0) + " KB",
          outSize: (blob.size / 1024).toFixed(0) + " KB",
          time: ((t1 - t0) / 1000).toFixed(2),
          thumb,
          blob,
        };
        
        successCount++;
        console.log(`✓ Converted ${item.file.name} (${successCount}/${fileArr.length})`);
        
      } catch (error) {
        failureCount++;
        console.error(`✗ Failed to convert ${item.file.name}:`, error);
        
        // Keep slot as null for failed conversions
        results[idx] = null;
      }
      
      // Update progress and UI
      dispatch({ type: 'SET_RESULTS', payload: [...results] });
      dispatch({ type: 'UPDATE_PROGRESS', payload: ((idx + 1) / fileArr.length) * 100 });
    }
    
    // Summary notification
    if (failureCount > 0) {
      console.warn(`Conversion completed: ${successCount} successful, ${failureCount} failed`);
    } else {
      console.log(`All ${successCount} files converted successfully!`);
    }
    
    setTimeout(() => dispatch({ type: 'FINISH_CONVERSION' }), 500);
  };

  const convertImagesToPdf = async () => {
    dispatch({ type: 'START_CONVERSION' });
    const pdf = new jsPDF();
    let isFirstPage = true;
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < fileArr.length; i++) {
        const item = fileArr[i];
        dispatch({ type: 'UPDATE_PROGRESS', payload: (i / fileArr.length) * 100 });
        
        try {
          // Use same pipeline as individual conversion for consistency
          const ab = await item.file.arrayBuffer();
          const blob = new Blob([ab], { type: item.file.type || 'application/octet-stream' });
          const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'default' });
          
          // Apply autorotate branch
          const orientation = autorotate ? await readOrientation(item.file) : null;
          const canvas = autorotate 
            ? getCanvasWithOrientation(bmp, orientation)
            : (() => {
                const c = new OffscreenCanvas(bmp.width, bmp.height);
                c.getContext('2d')!.drawImage(bmp, 0, 0);
                return c;
              })();
          
          // Convert to JPEG for PDF with quality control
          const jpegBlob = ('convertToBlob' in canvas)
            ? await (canvas as any).convertToBlob({ type: 'image/jpeg', quality: 0.9 })
            : await new Promise<Blob>(res => (canvas as any).toBlob(res, 'image/jpeg', 0.9));
            
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
            reader.readAsDataURL(jpegBlob);
          });
          
          // Calculate page dimensions
          const { width: imgWidth, height: imgHeight } = canvas;
          const { width: a4Width, height: a4Height } = { width: 595, height: 842 }; // A4 in points
          const imgRatio = imgWidth / imgHeight;
          const a4Ratio = a4Width / a4Height;
          
          let pdfWidth = a4Width;
          let pdfHeight = a4Height;
          if (imgRatio > a4Ratio) {
              pdfHeight = a4Width / imgRatio;
          } else {
              pdfWidth = a4Height * imgRatio;
          }

          if (isFirstPage) {
              pdf.deletePage(1);
              isFirstPage = false;
          }
          pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'landscape' : 'portrait');
          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          
          // Memory cleanup
          bmp.close();
          successCount++;
          console.log(`✓ Added to PDF: ${item.file.name} (${successCount}/${fileArr.length})`);
          
        } catch (error) {
          failureCount++;
          console.error(`✗ Failed to process ${item.file.name} for PDF:`, error);
          
          // Try fallback method for failed images
          try {
            const dataUrl = await fileToDataUrl(item.file);
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new window.Image();
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error('Failed to load image'));
                image.src = dataUrl;
            });

            const { width: imgWidth, height: imgHeight } = img;
            const { width: a4Width, height: a4Height } = { width: 595, height: 842 };
            const imgRatio = imgWidth / imgHeight;
            const a4Ratio = a4Width / a4Height;
            
            let pdfWidth = a4Width;
            let pdfHeight = a4Height;
            if (imgRatio > a4Ratio) {
                pdfHeight = a4Width / imgRatio;
            } else {
                pdfWidth = a4Height * imgRatio;
            }

            if (isFirstPage) {
                pdf.deletePage(1);
                isFirstPage = false;
            }
            pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'landscape' : 'portrait');
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            successCount++;
            failureCount--; // Adjust counters since fallback succeeded
            console.log(`✓ Added to PDF (fallback): ${item.file.name}`);
            
          } catch (fallbackError) {
            console.error(`✗ Fallback also failed for ${item.file.name}:`, fallbackError);
            // Skip this image and continue with others
          }
        }
    }
    
    if (successCount === 0) {
      console.error('No images could be processed for PDF');
      alert('Failed to create PDF: No images could be processed.');
      dispatch({ type: 'FINISH_CONVERSION' });
      return;
    }
    
    // Generate and download PDF
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BravoConvert_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Summary notification
    if (failureCount > 0) {
      console.warn(`PDF created: ${successCount} images included, ${failureCount} failed`);
    } else {
      console.log(`PDF created successfully with all ${successCount} images!`);
    }
    
    setTimeout(() => dispatch({ type: 'FINISH_CONVERSION' }), 500);
  };

  const handleConvertAll = () => {
    if (toFormat.label === "PDF") {
      convertImagesToPdf();
    } else {
      convertIndividualImages();
    }
  };

  const handleDownload = useCallback((idx: number) => {
    const meta = resultArr[idx];
    if (!meta) return;
    const a = document.createElement("a");
    a.href = meta.url;
    a.download = meta.outName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultArr]);

  const handleSaveAll = useCallback(async () => {
    const validResults = resultArr.filter((meta): meta is ResultItem => !!meta);
    if (validResults.length === 1) {
      handleDownload(resultArr.findIndex(r => !!r));
    } else if (validResults.length > 1) {
      try {
        const zip = new JSZip();
        
        // 저장된 blob을 직접 사용
        for (const meta of validResults) {
          zip.file(meta.outName, meta.blob);
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "BravoConvert.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error creating ZIP file:', error);
        alert('Error creating ZIP file. Please try downloading files individually.');
      }
    }
  }, [resultArr, handleDownload]);

  const isOrderChanged = useMemo(() => {
    if (originalFileOrder.length === 0 || fileArr.length !== originalFileOrder.length) return false;
    return !fileArr.every((file, index) => file.id === originalFileOrder[index].id);
  }, [fileArr, originalFileOrder]);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-2 bg-transparent h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          try {
            addFiles(e.target.files);
          } catch (error) {
            console.error('Error handling file input:', error);
            alert('Error processing selected files. Please try again.');
          }
        }}
      />
      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-2 drop-shadow-none">
          Image Converter <span className="text-black">{addFormat.label} to {toFormat.label}</span>
        </h1>
        <p className="text-lg md:text-2xl text-black font-bold mb-1">
          {toFormat.label === "PDF" 
            ? `Convert multiple ${addFormat.label} images into a single PDF file.`
            : `Convert your ${addFormat.label} images to ${toFormat.label} quickly and easily.`
          }
        </p>
        <p className="text-sm text-gray-600 mb-2 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gray-600 mr-2" />
          Just drag & drop any image format - we'll auto-detect the input type!
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-4 mb-8 rounded-2xl bg-white shadow-lg border border-gray-200 p-6">
        <div className="w-40">
          <CustomDropdown
            options={ADD_FORMATS.map(f => ({ label: f.label, value: f.label }))}
            value={addFormat.label}
            onChange={(value) => {
              const found = ADD_FORMATS.find(f => f.label === value);
              if (found) dispatch({ type: 'SET_ADD_FORMAT', payload: found });
            }}
            size="lg"
            gridLayout={true}
          />
        </div>
        <span className="text-2xl text-black">→</span>
        <div className="w-40">
          <CustomDropdown
            options={TO_FORMATS.map(f => ({ label: f.label, value: f.label }))}
            value={toFormat.label}
            onChange={(value) => {
              const found = TO_FORMATS.find(f => f.label === value);
              if (found) dispatch({ type: 'SET_CONVERT_FORMAT', payload: found });
            }}
            size="lg"
            gridLayout={true}
          />
        </div>
      </div>

      {/* EXIF Options - Compact placement above upload area */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-gray-600 mb-4">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={autorotate}
            onChange={() => dispatch({ type: 'TOGGLE_AUTOROTATE' })}
            className="w-3.5 h-3.5 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-1"
            aria-label="Auto-rotate images"
          />
          <span className="font-medium">Auto-rotate images</span>
        </label>
        
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-800 transition-colors">
          <input
            type="checkbox"
            checked={stripMetadata}
            onChange={() => dispatch({ type: 'TOGGLE_STRIP_METADATA' })}
            className="w-3.5 h-3.5 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-1"
            aria-label="Strip metadata"
          />
          <span className="font-medium">Strip metadata</span>
        </label>
      </div>

      <motion.div
        className={`border-2 border-dotted border-gray-400 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center transition-all mb-8 p-6 ${
          isLoading ? 'bg-gray-100 opacity-50 cursor-not-allowed' : fileArr.length > 0 ? 'bg-gray-50' : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md hover:border-gray-500 cursor-pointer'
        }`}
        whileHover={fileArr.length === 0 && !isLoading ? { scale: 1.01 } : undefined}
        {...(fileArr.length === 0 && !isLoading ? {
          onClick: () => fileInputRef.current?.click(),
          onDrop: handleDrop,
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
          },
          onDragEnter: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
          },
        } : {})}
      >
        {fileArr.length === 0 ? (
          <>
            <UploadCloud className="mx-auto mb-4 text-black" size={56} />
            <div className="text-2xl font-bold mb-1 text-black">
              Add Images to Convert
            </div>
            <div className="text-black text-base mb-2">
              Drag & drop or {" "}
              <span className="text-black font-bold cursor-pointer underline hover:text-gray-700" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Select Images
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Any format supported: PNG, JPG, WEBP, GIF, BMP, HEIC, TIFF & more
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            {toFormat.label === "PDF" && fileArr.length > 1 && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <GripVertical size={16} />
                    {isReorderMode ? `Drag to reorder images` : "Images are auto-sorted by name"}
                  </p>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      className={`rounded-xl shadow-lg transition-all duration-300 ${
                        isReorderMode 
                          ? "bg-black text-white hover:bg-gray-800" 
                          : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400"
                      }`}
                      onClick={() => dispatch({ type: 'TOGGLE_REORDER_MODE' })}
                    >
                      {isReorderMode ? "Done Reordering" : "Reorder"}
                    </Button>
                    {isReorderMode && (
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400 shadow-lg transition-all duration-300" 
                        onClick={() => dispatch({ type: 'RESET_ORDER' })} 
                        disabled={!isOrderChanged}
                      >
                        Reset Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="w-full">
              <FileList
                fileArr={fileArr}
                resultArr={resultArr}
                onRemove={(idx) => dispatch({ type: 'REMOVE_FILE', payload: idx })}
                onDownload={handleDownload}
                isPdfMode={toFormat.label === "PDF"}
                onReorder={(oldIndex, newIndex) => dispatch({ type: 'REORDER_FILES', payload: { oldIndex, newIndex }})}
                isReorderMode={isReorderMode}
                isOrderChanged={isOrderChanged}
                viewMode={viewMode}
                onViewModeChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
              />
            </div>
            <div className="flex gap-2 mt-4 justify-end w-full">
              {toFormat.label !== "PDF" && (
                <Button 
                  className="rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isLoading}
                >
                  + Add More
                </Button>
              )}
              {toFormat.label !== "PDF" && resultArr.some(r => !r) && (
                <Button 
                  className="rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
                  onClick={handleConvertAll} 
                  disabled={isLoading}
                >
                  {isLoading ? `Converting... ${Math.round(progress)}%` : "Convert All"}
                </Button>
              )}
              {toFormat.label !== "PDF" && fileArr.length > 0 && resultArr.every(r => r) && (
                <Button 
                  className="rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
                  onClick={handleSaveAll} 
                  disabled={isLoading}
                >
                  <Download className="mr-0" size={16} />
                  Download All
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {toFormat.label === "PDF" && fileArr.length > 0 && (
        <div className="flex items-center justify-center gap-4 mb-8 rounded-2xl bg-white shadow-lg border border-gray-200 p-6">
          <Button 
            onClick={handleConvertAll} 
            disabled={isLoading || isReorderMode} 
            className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isLoading ? `Converting... ${Math.round(progress)}%` : `Convert to PDF (${fileArr.length} images)`}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-black h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
