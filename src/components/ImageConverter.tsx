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
import { FileItem, ResultItem } from "./image-converter/types";
import { ADD_FORMATS, TO_FORMATS } from "./image-converter/formats";

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
    case 'RESET_STATE':
        return initialState;
    default:
      return state;
  }
}

export default function ImageConverter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { fileArr, resultArr, isLoading, progress, isReorderMode, originalFileOrder, viewMode, addFormat, toFormat } = state;
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

  const convertToFormat = useCallback((dataUrl: string, format: string) =>
    new Promise<{ blob: Blob; thumb: string }>(resolve => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
            blob => {
              resolve({ blob: blob!, thumb: canvas.toDataURL("image/webp", 0.7) });
            },
            `image/${format}`
          );
      };
      img.src = dataUrl;
    }), []);

  const convertIndividualImages = async () => {
    dispatch({ type: 'START_CONVERSION' });
    const results: (ResultItem | null)[] = [...resultArr];
    for (let idx = 0; idx < fileArr.length; idx++) {
      if (results[idx]) { // Skip already converted
        dispatch({ type: 'UPDATE_PROGRESS', payload: ((idx + 1) / fileArr.length) * 100 });
        continue;
      }
      const item = fileArr[idx];
      const t0 = performance.now();
      const dataUrl = await fileToDataUrl(item.file);
      const { blob, thumb } = await convertToFormat(dataUrl, toFormat.label.toLowerCase());
      const t1 = performance.now();
      const outName = item.file.name.replace(/\.[^/.]+$/, `.${toFormat.label.toLowerCase()}`);
      
      results[idx] = {
        url: URL.createObjectURL(blob),
        outName,
        inSize: (item.file.size / 1024).toFixed(0) + " KB",
        outSize: (blob.size / 1024).toFixed(0) + " KB",
        time: ((t1 - t0) / 1000).toFixed(2),
        thumb,
        blob, // blob을 직접 저장
      };
      
      dispatch({ type: 'SET_RESULTS', payload: [...results] });
      dispatch({ type: 'UPDATE_PROGRESS', payload: ((idx + 1) / fileArr.length) * 100 });
    }
    setTimeout(() => dispatch({ type: 'FINISH_CONVERSION' }), 500);
  };

  const convertImagesToPdf = async () => {
    dispatch({ type: 'START_CONVERSION' });
    const pdf = new jsPDF();
    let isFirstPage = true;
    for (let i = 0; i < fileArr.length; i++) {
        const item = fileArr[i];
        dispatch({ type: 'UPDATE_PROGRESS', payload: (i / fileArr.length) * 100 });
        const dataUrl = await fileToDataUrl(item.file);
        const img = await new Promise<HTMLImageElement>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve(image);
            image.src = dataUrl;
        });

        const { width: imgWidth, height: imgHeight } = img;
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
    }
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BravoConvert_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
