"use client";
import { useRef, useReducer, useCallback, useMemo, useEffect, useState } from "react";
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
// Worker handles EXIF processing, no longer need main thread imports
// import { readOrientation, getCanvasWithOrientation } from "@/lib/image-exif";

/**
 * Browser-based image conversion component
 * 
 * Features:
 * - Metadata removal during conversion process
 * - Batch conversion and ZIP download
 * - Performance optimized with OffscreenCanvas and ImageBitmap
 * 
 * Quick Test Checklist:
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
  addFormat: ADD_FORMATS[1], // PNG
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
  
  // Worker management
  const workerRef = useRef<Worker | null>(null);
  const conversionQueueRef = useRef<{
    id: string;
    fileIndex: number;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }[]>([]);
  const activeConversionsRef = useRef(0);
  const MAX_CONCURRENT_CONVERSIONS = 2;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [quality, setQuality] = useState(85);
  const [targetSizeKb, setTargetSizeKb] = useState('');

  const conversionOptions = useMemo<ConvertOptions>(() => ({
    autorotate,
    stripMetadata,
    quality: compressionEnabled ? quality / 100 : 0.92,
    targetBytes: compressionEnabled && targetSizeKb ? Number(targetSizeKb) * 1024 : undefined,
  }), [autorotate, stripMetadata, compressionEnabled, quality, targetSizeKb]);

  const resetConvertedResults = useCallback(() => {
    resultArr.forEach((result) => {
      if (result?.url) URL.revokeObjectURL(result.url);
      if (result?.thumb) URL.revokeObjectURL(result.thumb);
    });
    if (fileArr.length > 0) dispatch({ type: 'SET_RESULTS', payload: fileArr.map(() => null) });
  }, [fileArr, resultArr]);

  // Worker initialization and cleanup
  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker('/workers/image-worker.js');
    
    // Handle worker messages
    workerRef.current.onmessage = (e) => {
      const { type, id, payload } = e.data;
      
      const queueItem = conversionQueueRef.current.find(item => item.id === id);
      if (!queueItem) return;
      
      // Remove from queue
      conversionQueueRef.current = conversionQueueRef.current.filter(item => item.id !== id);
      activeConversionsRef.current--;
      
      if (type === 'done') {
        queueItem.resolve(payload);
      } else if (type === 'error') {
        queueItem.reject(new Error(payload.message));
      }
      
      // Process next item in queue
      processQueue();
    };
    
    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
      const pendingConversions = conversionQueueRef.current;
      conversionQueueRef.current = [];
      activeConversionsRef.current = 0;
      pendingConversions.forEach(item => item.reject(new Error('Image worker stopped unexpectedly.')));
      workerRef.current?.terminate();
      workerRef.current = null;
    };
    
    return () => {
      // Cleanup worker and object URLs
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      resultArr.forEach(result => {
        if (result?.url) {
          URL.revokeObjectURL(result.url);
        }
        if (result?.thumb) {
          URL.revokeObjectURL(result.thumb);
        }
      });
    };
  }, []);
  
  // Memory Leak Prevention: Revoke object URLs on result changes
  useEffect(() => {
    return () => {
      resultArr.forEach(result => {
        if (result?.url) {
          URL.revokeObjectURL(result.url);
        }
        if (result?.thumb) {
          URL.revokeObjectURL(result.thumb);
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
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'jpe': 'image/jpeg',
      'jfif': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
    };
    
    const mimeType = extensionMap[extension as keyof typeof extensionMap];
    if (mimeType) {
      return ADD_FORMATS.find(f => f.mime === mimeType);
    }
    
    return null;
  }, []);

  const addFiles = useCallback((files: FileList | File[] | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    // 이미지 파일만 필터링
    const imageFiles = fileArray.filter(f => {
      return ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
             ['jpg', 'jpeg', 'jpe', 'jfif', 'png', 'webp']
               .includes(f.name.toLowerCase().split('.').pop() || '');
    });
    
    if (imageFiles.length === 0) {
      alert('No supported images found. Please select JPG, PNG, or WebP files.');
      return;
    }

    const oversizedFiles = imageFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} image(s) exceed the 10MB per-file limit and were not added.`);
    }
    const sizeValidFiles = imageFiles.filter(file => file.size <= MAX_IMAGE_SIZE);
    if (sizeValidFiles.length === 0) return;
    
    // 첫 번째 파일의 형식을 기준으로 addFormat 자동 설정
    const firstFile = sizeValidFiles[0];
    const detectedFormat = detectFileFormat(firstFile);
    
         if (detectedFormat && detectedFormat.label !== addFormat.label) {
       // 자동으로 입력 형식 변경
       dispatch({ type: 'SET_ADD_FORMAT', payload: detectedFormat });
       console.log(`Auto-detected input format: ${detectedFormat.label}`);
       
       // 사용자에게 자동 감지 알림 (선택적)
       if (sizeValidFiles.length === 1) {
         console.log(`Auto-detected ${detectedFormat.label} format from your image!`);
       } else {
         console.log(`Auto-detected ${detectedFormat.label} format from your images!`);
       }
     }
    
    // 현재 또는 감지된 형식과 일치하는 파일들만 필터링
    const targetFormat = detectedFormat || addFormat;
    const validFiles = sizeValidFiles.filter(f => {
      const fileFormat = detectFileFormat(f);
      return fileFormat?.mime === targetFormat.mime;
    });
    
    if (validFiles.length === 0) {
      alert(`No valid ${targetFormat.label} files found.`);
      return;
    }
    
    if (validFiles.length < sizeValidFiles.length) {
      const filteredCount = sizeValidFiles.length - validFiles.length;
      console.log(`${filteredCount} file${filteredCount > 1 ? 's were' : ' was'} filtered out (different format)`);
    }
    
    if (imageFiles.length < fileArray.length) {
      const nonImageCount = fileArray.length - imageFiles.length;
      console.log(`${nonImageCount} non-image file${nonImageCount > 1 ? 's were' : ' was'} filtered out`);
    }
    
    dispatch({ type: 'ADD_FILES', payload: validFiles });
  }, [addFormat, detectFileFormat, MAX_IMAGE_SIZE]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isLoading || !event.clipboardData) return;

      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      )) return;

      const imageItems = Array.from(event.clipboardData.items)
        .filter(item => item.kind === 'file' && ['image/jpeg', 'image/png', 'image/webp'].includes(item.type));
      if (imageItems.length === 0) return;

      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        '-',
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
      ].join('');
      const extensionByMime: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };
      const pastedFiles = imageItems.flatMap((item, index) => {
        const blob = item.getAsFile();
        if (!blob) return [];
        const suffix = imageItems.length > 1 ? `-${index + 1}` : '';
        return [new File(
          [blob],
          `pasted-image-${timestamp}${suffix}.${extensionByMime[item.type]}`,
          { type: item.type, lastModified: now.getTime() },
        )];
      });

      if (pastedFiles.length > 0) {
        event.preventDefault();
        addFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles, isLoading]);

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
   * Worker-based conversion queue processing
   * Limits concurrent conversions to prevent memory issues
   */
  const processQueue = useCallback(() => {
    // Queue processing is simplified - worker messages are sent directly
    // This function is kept for compatibility but doesn't need to do anything
    // since messages are sent immediately in convertWithWorker
  }, []);
  
  /**
   * Worker-based conversion with queue management
   * 
   * Pipeline moved to worker:
   * - UI blocking prevention
   * - Better memory management  
   * - Transferable objects for performance
   * - Concurrent processing with limits
   */
  // Fallback conversion using main thread
  const convertWithCanvas = useCallback(async (
    file: File, 
    format: string,
    options: ConvertOptions = {}
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create image element
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas conversion failed'));
              return;
            }
            if (blob.type !== `image/${format}`) {
              reject(new Error(`This browser cannot encode image/${format}.`));
              return;
            }
            
            blob.arrayBuffer().then(outputBuffer => {
              // Create thumbnail
              const thumbCanvas = document.createElement('canvas');
              const thumbCtx = thumbCanvas.getContext('2d');
              if (!thumbCtx) {
                reject(new Error('Thumbnail canvas context not available'));
                return;
              }
              thumbCanvas.width = 150;
              thumbCanvas.height = 150;
              thumbCtx.drawImage(img, 0, 0, 150, 150);
              
              thumbCanvas.toBlob((thumbBlob) => {
                if (!thumbBlob) {
                  reject(new Error('Thumbnail creation failed'));
                  return;
                }
                
                thumbBlob.arrayBuffer().then(thumbBuffer => {
                  resolve({
                    outputBuffer,
                    thumbBuffer,
                    originalSize: file.size,
                    outputSize: outputBuffer.byteLength,
                    width: img.width,
                    height: img.height,
                    originalName: file.name,
                    orientation: 1
                  });
                });
              }, 'image/webp', 0.7);
            });
          }, `image/${format}`, format === 'jpeg' || format === 'webp' ? options.quality ?? 0.85 : undefined);
        };
        
        img.onerror = () => reject(new Error('Image load failed'));
        const sourceUrl = URL.createObjectURL(file);
        img.onload = ((originalOnload) => () => {
          URL.revokeObjectURL(sourceUrl);
          originalOnload?.call(img, new Event('load'));
        })(img.onload);
        img.onerror = () => {
          URL.revokeObjectURL(sourceUrl);
          reject(new Error('Image load failed'));
        };
        img.src = sourceUrl;
        
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const convertWithWorker = useCallback(async (
    file: File, 
    fileIndex: number, 
    format: string, 
    options: ConvertOptions = {}
  ): Promise<any> => {
    // Try worker first, fallback to canvas if it fails
    try {
      if (!workerRef.current) {
        console.warn('Worker not available, using fallback');
        return await convertWithCanvas(file, format, options);
      }
      
      const { autorotate: enableAutorotate = true, stripMetadata: enableStripMetadata = true } = options;
      // The File remains intact after this transferable buffer is detached, so the
      // main-thread fallback can safely read the image again.
      const buffer = await file.arrayBuffer();

      const workerResult = await new Promise<any>((resolve, reject) => {
        const id = `${file.name}_${fileIndex}_${Date.now()}`;
        
        // Set timeout for worker response
        const timeout = setTimeout(() => {
          conversionQueueRef.current = conversionQueueRef.current.filter(item => item.id !== id);
          activeConversionsRef.current = Math.max(0, activeConversionsRef.current - 1);
          reject(new Error('Image worker timed out.'));
        }, 15000);
        
        // Store promise handlers for this conversion
        conversionQueueRef.current.push({
          id,
          fileIndex,
          resolve: (result) => {
            clearTimeout(timeout);
            resolve(result);
          },
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        });
        activeConversionsRef.current++;
        
        // Send to worker with transferable
        workerRef.current!.postMessage({
          type: 'convert',
          id,
          payload: {
            buffer,
            autorotate: enableAutorotate,
            stripMetadata: enableStripMetadata,
            outType: `image/${format}`,
            quality: (format === 'jpeg' || format === 'webp') ? options.quality ?? 0.85 : undefined,
            targetBytes: options.targetBytes,
            originalName: file.name
          }
        }, [buffer]); // Transfer ownership
      });
      return workerResult;
    } catch (error) {
      console.warn('Worker failed, using fallback:', error);
      return await convertWithCanvas(file, format, options);
    }
  }, [convertWithCanvas]);

  const convertIndividualImages = async () => {
    dispatch({ type: 'START_CONVERSION' });
    const results: (ResultItem | null)[] = [...resultArr];
    let successCount = 0;
    let failureCount = 0;
    
    // Process all files concurrently with worker queue
    const conversionPromises = fileArr.map(async (item, idx) => {
      if (results[idx]) { // Skip already converted
        successCount++;
        return;
      }
      
      const t0 = performance.now();
      
      try {
        const outputExtension = toFormat.label.toLowerCase();
        const outputCodec = outputExtension === 'jpg' ? 'jpeg' : outputExtension;
        // Use worker-based conversion
        const workerResult = await convertWithWorker(
          item.file, 
          idx,
          outputCodec,
          conversionOptions
        );
        
        const t1 = performance.now();
        const outName = item.file.name.replace(/\.[^/.]+$/, `.${outputExtension}`);
        
        // Create blobs from worker results
        const outputBlob = new Blob([workerResult.outputBuffer], { 
          type: `image/${outputCodec}`
        });
        const thumbBlob = new Blob([workerResult.thumbBuffer], { 
          type: 'image/webp' 
        });
        const thumb = URL.createObjectURL(thumbBlob);
        
        results[idx] = {
          url: URL.createObjectURL(outputBlob),
          outName,
          inSize: (workerResult.originalSize / 1024).toFixed(0) + " KB",
          outSize: (workerResult.outputSize / 1024).toFixed(0) + " KB",
          time: ((t1 - t0) / 1000).toFixed(2),
          thumb,
          blob: outputBlob,
          savings: Math.round((1 - workerResult.outputSize / workerResult.originalSize) * 100),
          width: workerResult.width,
          height: workerResult.height,
        };
        
        successCount++;
        console.log(`✓ Converted ${item.file.name} (${successCount}/${fileArr.length})`);
        
        // Update progress
        dispatch({ type: 'SET_RESULTS', payload: [...results] });
        dispatch({ type: 'UPDATE_PROGRESS', payload: ((successCount + failureCount) / fileArr.length) * 100 });
        
      } catch (error) {
        failureCount++;
        console.error(`✗ Failed to convert ${item.file.name}:`, error);
        
        // Keep slot as null for failed conversions
        results[idx] = null;
        
        // Update progress
        dispatch({ type: 'UPDATE_PROGRESS', payload: ((successCount + failureCount) / fileArr.length) * 100 });
      }
    });
    
    // Wait for all conversions to complete
    await Promise.all(conversionPromises);
    
    // Final update
    dispatch({ type: 'SET_RESULTS', payload: [...results] });
    
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
    
    // Process images sequentially for PDF (order matters)
    for (let i = 0; i < fileArr.length; i++) {
        const item = fileArr[i];
        dispatch({ type: 'UPDATE_PROGRESS', payload: (i / fileArr.length) * 100 });
        
        try {
          // Use worker for consistent processing
          const workerResult = await convertWithWorker(
            item.file, 
            i,
            'jpeg', // PDF requires JPEG
            { autorotate, stripMetadata }
          );
          
          // Create JPEG blob from worker result
          const jpegBlob = new Blob([workerResult.outputBuffer], { type: 'image/jpeg' });
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
            reader.readAsDataURL(jpegBlob);
          });
          
          // Calculate page dimensions using worker result
          const { width: imgWidth, height: imgHeight } = workerResult;
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
          Drag and drop or paste JPG, PNG or WebP images — the input type is detected automatically.
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
              Drag & drop, paste with Ctrl+V / ⌘V, or {" "}
              <span className="text-black font-bold cursor-pointer underline hover:text-gray-700" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Select Images
              </span>
            </div>
            <div className="text-sm text-gray-600">
          Supported formats: JPG/JPEG, PNG and WebP (maximum 10MB per file)
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

      {toFormat.label !== "PDF" && (
        <section className="mb-6 space-y-4" aria-labelledby="image-optimization-title">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <h2 id="image-optimization-title" className="text-lg font-bold text-black">Image options</h2>
              <p className="text-sm text-gray-600">Optionally reduce the converted image file size.</p>
            </div>
            {compressionEnabled && (
              <button
                type="button"
                className="shrink-0 text-sm font-medium underline text-gray-700 hover:text-black"
                onClick={() => {
                  resetConvertedResults();
                  setCompressionEnabled(false);
                  setQuality(85);
                  setTargetSizeKb('');
                }}
              >
                Reset all
              </button>
            )}
          </div>

          <div className={`rounded-2xl bg-white shadow-lg border p-5 transition-colors ${compressionEnabled ? 'border-black' : 'border-gray-200'}`}>
            <button type="button" aria-expanded={compressionEnabled} disabled={toFormat.label === 'PNG'} className="flex w-full items-center justify-between gap-4 text-left disabled:cursor-not-allowed disabled:opacity-60" onClick={() => { resetConvertedResults(); setCompressionEnabled((enabled) => !enabled); }}>
              <span>
                <span className="flex items-center gap-2 text-base font-bold text-black">Compress</span>
                <span className="mt-1 block text-sm text-gray-600">Balance image quality and file size.{toFormat.label === 'PNG' ? ' Choose JPG or WebP to use compression.' : ''}</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${compressionEnabled ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>{compressionEnabled ? 'On' : 'Optional'}</span>
            </button>

            {compressionEnabled && toFormat.label !== 'PNG' && (
              <div className="mt-5 grid gap-5 border-t border-gray-100 pt-5 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Quality: {quality}%
                  <input type="range" min="10" max="100" step="1" value={quality} onChange={(event) => { resetConvertedResults(); setQuality(Number(event.target.value)); }} className="mt-4 w-full accent-black" />
                  <span className="mt-1 flex justify-between text-xs font-normal text-gray-500"><span>Smaller file</span><span>Higher quality</span></span>
                </label>
                <label className="text-sm font-medium text-gray-700">Target size (KB) <span className="font-normal text-gray-500">— optional</span>
                  <input type="number" min="10" inputMode="numeric" value={targetSizeKb} onChange={(event) => { resetConvertedResults(); setTargetSizeKb(event.target.value); }} placeholder="No size limit" className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-black focus:border-black focus:outline-none" />
                  <span className="mt-1 block text-xs font-normal text-gray-500">We reduce quality only as much as needed to approach this size.</span>
                </label>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Processing description */}
      <div className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto space-y-2">
        <p><span className="font-medium text-gray-700">Private by design:</span> Image conversion runs locally in your browser.</p>
        <p><span className="font-medium text-gray-700">Fresh output:</span> Converted JPG, PNG and WebP files are newly encoded without copying source EXIF metadata.</p>
      </div>

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
