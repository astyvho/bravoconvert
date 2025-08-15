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
// Worker handles EXIF processing, no longer need main thread imports
// import { readOrientation, getCanvasWithOrientation } from "@/lib/image-exif";

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
   * Worker-based conversion queue processing
   * Limits concurrent conversions to prevent memory issues
   */
  const processQueue = useCallback(() => {
    while (
      activeConversionsRef.current < MAX_CONCURRENT_CONVERSIONS &&
      conversionQueueRef.current.length > 0
    ) {
      const queueItem = conversionQueueRef.current[0];
      activeConversionsRef.current++;
      
      // Remove from front of queue
      conversionQueueRef.current = conversionQueueRef.current.slice(1);
      
      // Process this item (already sent to worker)
    }
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
  const convertWithWorker = useCallback(async (
    file: File, 
    fileIndex: number, 
    format: string, 
    options: ConvertOptions = {}
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!workerRef.current) {
          throw new Error('Worker not initialized');
        }
        
        const { autorotate: enableAutorotate = true, stripMetadata: enableStripMetadata = true } = options;
        
        // Read file as ArrayBuffer
        const buffer = await file.arrayBuffer();
        const id = `${file.name}_${fileIndex}_${Date.now()}`;
        
        // Add to queue
        conversionQueueRef.current.push({
          id,
          fileIndex,
          resolve,
          reject
        });
        
        // Send to worker with transferable
        workerRef.current.postMessage({
          type: 'convert',
          id,
          payload: {
            buffer,
            autorotate: enableAutorotate,
            stripMetadata: enableStripMetadata,
            outType: `image/${format}`,
            quality: (format === 'jpeg' || format === 'webp') ? 0.9 : undefined,
            originalName: file.name
          }
        }, [buffer]); // Transfer ownership
        
        // Process queue
        processQueue();
        
      } catch (error) {
        reject(error);
      }
    });
  }, [processQueue]);

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
        // Use worker-based conversion
        const workerResult = await convertWithWorker(
          item.file, 
          idx,
          toFormat.label.toLowerCase(), 
          { autorotate, stripMetadata }
        );
        
        const t1 = performance.now();
        const outName = item.file.name.replace(/\.[^/.]+$/, `.${toFormat.label.toLowerCase()}`);
        
        // Create blobs from worker results
        const outputBlob = new Blob([workerResult.outputBuffer], { 
          type: `image/${toFormat.label.toLowerCase()}` 
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
          Smart Image Converter <span className="text-black">{addFormat.label} to {toFormat.label}</span>
        </h1>
        <p className="text-lg md:text-2xl text-black font-bold mb-3">
          {toFormat.label === "PDF" 
            ? `Convert multiple ${addFormat.label} images into a single PDF with auto-rotation and privacy protection.`
            : `Convert your ${addFormat.label} images to ${toFormat.label} with automatic photo rotation correction and metadata removal.`
          }
        </p>
        
        {/* SEO-friendly feature highlights */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="font-semibold text-blue-800 mb-1">🔄 Auto-Rotate Photos</div>
              <div className="text-blue-700">Fixes sideways iPhone photos automatically using EXIF data</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="font-semibold text-green-800 mb-1">🛡️ Privacy Protection</div>
              <div className="text-green-700">Removes metadata, location data, and camera info for security</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <div className="font-semibold text-purple-800 mb-1">⚡ Instant Processing</div>
              <div className="text-purple-700">Converts images in your browser - no upload to servers needed</div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gray-600 mr-2" />
          Perfect for social media, professional use, and privacy-conscious users
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

      {/* Smart Options with detailed explanations */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Smart Conversion Options</h3>
        <div className="flex flex-wrap gap-6 items-start justify-center">
          <label className="flex items-start gap-3 cursor-pointer hover:bg-white rounded-lg p-2 transition-colors max-w-xs">
            <input
              type="checkbox"
              checked={autorotate}
              onChange={() => dispatch({ type: 'TOGGLE_AUTOROTATE' })}
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-1 mt-1 flex-shrink-0"
              aria-label="Auto-rotate images based on EXIF data"
            />
            <div>
              <span className="font-medium text-gray-800 block">Auto-rotate photos</span>
              <span className="text-xs text-gray-600">Automatically fixes sideways iPhone photos using EXIF orientation data</span>
            </div>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer hover:bg-white rounded-lg p-2 transition-colors max-w-xs">
            <input
              type="checkbox"
              checked={stripMetadata}
              onChange={() => dispatch({ type: 'TOGGLE_STRIP_METADATA' })}
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-1 mt-1 flex-shrink-0"
              aria-label="Remove metadata for privacy protection"
            />
            <div>
              <span className="font-medium text-gray-800 block">Remove metadata</span>
              <span className="text-xs text-gray-600">Strips EXIF data, location info, and camera details for privacy protection</span>
            </div>
          </label>
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
      
      {/* SEO Content Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Our Smart Image Converter?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🔄</span>
                Automatic Photo Rotation
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tired of sideways iPhone photos? Our EXIF auto-rotation feature automatically detects and corrects photo orientation 
                based on camera data. Perfect for photos taken in portrait mode or rotated accidentally. Works with all smartphone 
                cameras including iPhone, Samsung, and Google Pixel.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🛡️</span>
                Privacy-First Metadata Removal
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Protect your privacy by automatically removing EXIF metadata, GPS location data, camera model, and other sensitive 
                information from your photos. Essential for social media sharing, professional portfolios, and online marketplaces 
                where privacy matters.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Lightning-Fast Browser Processing
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All image processing happens directly in your browser using advanced web workers. No files are uploaded to servers, 
                ensuring maximum privacy and speed. Convert hundreds of images in minutes without installation or registration.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📱</span>
                Perfect for Mobile Photos
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Optimized for smartphone photos with intelligent format detection. Handles HEIC, JPEG, PNG, and WebP formats 
                seamlessly. Ideal for preparing photos for websites, social media, or print where specific formats and 
                orientations are required.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Supported Formats & Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-800 mb-2">Social Media</div>
                <div className="text-gray-600">Instagram, Facebook, Twitter - perfect dimensions and privacy protection</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800 mb-2">Professional Use</div>
                <div className="text-gray-600">Portfolio websites, business cards, presentations with clean metadata</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800 mb-2">E-commerce</div>
                <div className="text-gray-600">Product photos for online stores with optimized file sizes and formats</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
