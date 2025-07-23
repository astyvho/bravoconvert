"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Download, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDropdown from "@/components/ui/CustomDropdown";
import JSZip from 'jszip';

// 변환 옵션
const CONVERT_OPTIONS = [
  { label: "JPG", value: "jpg" },
  { label: "PNG", value: "png" },
];

// 변환된 페이지 타입
interface ConvertedPage {
  pageNumber: number;
  blobUrl: string;
  thumbnailUrl: string;
  filename: string;
}

export default function PDFConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [convertOption, setConvertOption] = useState(CONVERT_OPTIONS[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // PDF.js를 클라이언트에서만 동적으로 로드
  useEffect(() => {
    if (!isClient) return;

    const loadPDFJS = async () => {
      try {
        // 동적 import로 PDF.js 로드
        const pdfjs = await import('pdfjs-dist');
        
        // Worker 비활성화 - 메인 스레드에서 안전하게 처리
        if (typeof window !== 'undefined') {
          // Worker 사용하지 않음 (CORS 및 404 오류 방지)
          pdfjs.GlobalWorkerOptions.workerSrc = 'data:text/javascript;base64,';
        }
        
        setPdfjsLib(pdfjs);
        setPdfJsLoaded(true);
      } catch (error) {
        console.error('PDF.js 로드 실패:', error);
        showError('PDF.js 라이브러리를 로드할 수 없습니다.');
      }
    };

    // 약간의 지연을 두어 클라이언트 환경이 완전히 준비된 후 로드
    const timer = setTimeout(() => {
      loadPDFJS();
    }, 100);

    return () => clearTimeout(timer);
  }, [isClient]);

  // PDF.js 로드 완료 시 대기 중인 파일 처리
  useEffect(() => {
    if (pdfJsLoaded && pendingFile) {
      setSelectedFiles([pendingFile]);
      renderPdfPreview(pendingFile);
      setPendingFile(null);
    }
  }, [pdfJsLoaded, pendingFile]);

  // 에러 토스트 표시
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // 5초 후 자동 제거
  };

  // PDF 파일 검증
  const validatePdfFile = (file: File): boolean => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('PDF 파일만 업로드할 수 있습니다.');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB 제한
      showError('파일 크기가 50MB를 초과합니다.');
      return false;
    }
    return true;
  };

  // PDF 첫 페이지를 캔버스에 렌더링
  const renderPdfPreview = useCallback(async (file: File) => {
    if (!pdfjsLib || !canvasRef.current || !isClient) {
      setPendingFile(file);
      return;
    }

    setIsLoading(true);
    setFileLoaded(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // 첫 페이지

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context를 가져올 수 없습니다.');
      }
      
      // 뷰포트 설정 (스케일 1.5로 고화질)
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 페이지 렌더링
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // 미리보기 URL 생성
      setPreviewUrl(canvas.toDataURL());
      setFileLoaded(true); // 파일 로딩 완료
    } catch (err) {
      console.error('PDF 렌더링 실패:', err);
      showError('PDF 파일을 읽을 수 없습니다. 파일이 손상되었을 수 있습니다.');
      setFileLoaded(false);
    } finally {
      setIsLoading(false);
    }
  }, [pdfjsLib, isClient]);

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isClient) return;
    
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validatePdfFile(file)) {
        setConvertedPages([]); // 이전 결과 초기화
        setPreviewUrl(null); // 이전 미리보기 초기화
        setFileLoaded(false); // 파일 로드 상태 초기화
        
        if (pdfJsLoaded) {
          setSelectedFiles([file]);
          renderPdfPreview(file);
        } else {
          // PDF.js 로딩 대기 중
          setPendingFile(file);
          setIsLoading(true);
        }
      }
    }
  };

  // 드래그 앤 드롭 처리
  const handleDrop = (e: React.DragEvent) => {
    if (!isClient) return;
    
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validatePdfFile(file)) {
        setConvertedPages([]); // 이전 결과 초기화
        setPreviewUrl(null); // 이전 미리보기 초기화
        setFileLoaded(false); // 파일 로드 상태 초기화
        
        if (pdfJsLoaded) {
          setSelectedFiles([file]);
          renderPdfPreview(file);
        } else {
          // PDF.js 로딩 대기 중
          setPendingFile(file);
          setIsLoading(true);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // PDF를 이미지로 변환
  const convertPdfToImages = async (file: File) => {
    if (!pdfjsLib || !canvasRef.current || !isClient) {
      showError('PDF.js가 아직 로드되지 않았습니다.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setConvertedPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const convertedResults: ConvertedPage[] = [];

      // 각 페이지를 순차적으로 변환
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Canvas context를 가져올 수 없습니다.');
          }

          // 고화질 렌더링을 위한 스케일 설정
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // 페이지 렌더링
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // 이미지 포맷 설정
          const mimeType = convertOption.value === 'png' ? 'image/png' : 'image/jpeg';
          const quality = convertOption.value === 'jpg' ? 0.95 : undefined;

          // Blob 생성
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, mimeType, quality);
          });

          // 썸네일 생성 (작은 크기)
          const thumbnailScale = 0.3;
          const thumbnailViewport = page.getViewport({ scale: thumbnailScale });
          canvas.height = thumbnailViewport.height;
          canvas.width = thumbnailViewport.width;

          await page.render({
            canvasContext: context,
            viewport: thumbnailViewport
          }).promise;

          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

          // 결과 저장
          const blobUrl = URL.createObjectURL(blob);
          const filename = `${file.name.replace('.pdf', '')}_page_${pageNum}.${convertOption.value}`;
          
          convertedResults.push({
            pageNumber: pageNum,
            blobUrl,
            thumbnailUrl,
            filename
          });

          // 진행률 업데이트
          setProgress(Math.round((pageNum / totalPages) * 100));
          
          // 실시간 결과 업데이트
          setConvertedPages([...convertedResults]);

        } catch (pageError) {
          console.error(`페이지 ${pageNum} 변환 실패:`, pageError);
          showError(`페이지 ${pageNum} 변환에 실패했습니다.`);
        }
      }

      if (convertedResults.length > 0) {
        console.log(`${convertedResults.length}개 페이지 변환 완료`);
      }

    } catch (err) {
      console.error('PDF 변환 실패:', err);
      showError('PDF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
      setProgress(100);
    }
  };

  const handleConvert = () => {
    if (!isClient) return;
    
    if (selectedFiles.length === 0) {
      showError('변환할 PDF 파일을 선택해주세요.');
      return;
    }
    
    convertPdfToImages(selectedFiles[0]);
  };

  // 개별 파일 다운로드
  const downloadPage = (page: ConvertedPage) => {
    if (!isClient) return;
    
    const link = document.createElement('a');
    link.href = page.blobUrl;
    link.download = page.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 전체 파일 ZIP 다운로드
  const downloadAllPages = async () => {
    if (!isClient || convertedPages.length === 0) return;

    try {
      const zip = new JSZip();
      const fileName = selectedFiles[0]?.name?.replace('.pdf', '') || 'converted';

      // 모든 페이지를 ZIP에 추가
      for (const page of convertedPages) {
        const response = await fetch(page.blobUrl);
        const blob = await response.blob();
        zip.file(page.filename, blob);
      }

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${fileName}_all_pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 메모리 정리
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('ZIP 다운로드 실패:', error);
      showError('전체 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 클라이언트가 아닌 경우 로딩 표시
  if (!isClient) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-2 bg-transparent h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PDF to Image Converter
          </h1>
          <p className="text-gray-600 mb-8">
            Loading PDF converter...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-2 bg-transparent h-full">
      {/* 파일 선택 input: 숨김 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 숨겨진 캔버스 (렌더링용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 에러 토스트 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {/* Hero 영역 */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-2 drop-shadow-none">
          PDF to Image <span className="text-black">Converter</span>
        </h1>
        <p className="text-lg md:text-2xl text-black font-bold mb-1">
          Convert your PDF files to images quickly and easily.
        </p>
        <p>
          <span className="text-black font-extrabold">100% Free</span>, No installation required!
        </p>
      </div>

      {/* Drag & Drop 영역 - 조건부 렌더링 */}
      {!fileLoaded ? (
        <div
          className="border-2 border-dotted border-gray-400 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center transition-all cursor-pointer mb-8 p-6 bg-gray-100 hover:bg-gray-200 hover:shadow-md hover:border-gray-500"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
            <UploadCloud className="mx-auto mb-4 text-black" size={56} />
            <div className="text-2xl font-bold mb-1 text-black">Add PDF Files</div>
            <div className="text-black text-base">
              Drag & drop or{" "}
              <span
                className="text-blue-600 font-bold cursor-pointer underline hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Select PDF Files
              </span>
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Supported format: PDF
            </div>
          </div>
        ) : (
          <div className="mb-8">
          {/* 파일 미리보기 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Selected PDF</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviewUrl(null);
                  setFileLoaded(false);
                  setConvertedPages([]);
                }}
                className="border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                Remove
              </Button>
            </div>
            
            {previewUrl && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Preview (First Page):</div>
                <div className="border border-gray-300 rounded-lg overflow-hidden max-w-full">
                  <img 
                    src={previewUrl} 
                    alt="PDF Preview" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              File: {selectedFiles[0]?.name}
            </div>
          </div>
        </div>
        )}

      {/* 변환 옵션 및 버튼 */}
      {fileLoaded && (
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-black font-medium">Output Format:</span>
                <CustomDropdown
                  options={CONVERT_OPTIONS}
                  value={convertOption.value}
                  onChange={(value) => {
                    const found = CONVERT_OPTIONS.find(option => option.value === value);
                    if (found) setConvertOption(found);
                  }}
                  size="md"
                />
              </div>
              
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {isConverting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Converting... {progress}%
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download size={20} />
                    Convert to Images
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 변환 결과 */}
      {convertedPages.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                Converted Pages ({convertedPages.length})
              </h3>
              <Button
                onClick={downloadAllPages}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedPages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="mb-3">
                    <img 
                      src={page.thumbnailUrl} 
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Page {page.pageNumber}
                    </span>
                    <Button
                      onClick={() => downloadPage(page)}
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 