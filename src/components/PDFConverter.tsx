"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, 
  Download, 
  FileText, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Image,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDropdown from "@/components/ui/CustomDropdown";
import JSZip from "jszip";
import { GlobalWorkerOptions } from "pdfjs-dist";

// 변환 옵션
const CONVERT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' }
];

// 변환된 페이지 타입
interface ConvertedPage {
  pageNumber: number;
  blobUrl: string;
  thumbnailUrl: string;
  filename: string;
}

export default function PDFConverter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const convertedPagesRef = useRef<ConvertedPage[]>([]);
  
  // 🎯 모든 상태를 최상단에 선언 (Hooks 순서 고정)
  const [isReady, setIsReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertOption, setConvertOption] = useState(CONVERT_OPTIONS[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  const clearConvertedPages = useCallback(() => {
    convertedPagesRef.current.forEach((page) => URL.revokeObjectURL(page.blobUrl));
    convertedPagesRef.current = [];
    setConvertedPages([]);
  }, []);

  useEffect(() => () => {
    convertedPagesRef.current.forEach((page) => URL.revokeObjectURL(page.blobUrl));
  }, []);

  // 🎯 모든 함수들을 상태 선언 직후에 배치
  // 에러 표시 함수
  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  // PDF.js 로드 함수 - 한 번만 로드하고 재사용
  const loadPDFJS = useCallback(async () => {
    if (pdfjsLib) {
      return pdfjsLib; // 이미 로드된 경우 재사용
    }
    
    try {
      console.log('📦 PDF.js 라이브러리 dynamic import 중...');
      const pdfjs = await import('pdfjs-dist');
      console.log('✅ PDF.js 라이브러리 로딩 완료');
      setPdfjsLib(pdfjs);
      return pdfjs;
    } catch (error) {
      console.error('❌ PDF.js 라이브러리 로딩 실패:', error);
      showError('PDF 라이브러리를 로드할 수 없습니다.');
      throw error;
    }
  }, [pdfjsLib, showError]);

  // PDF.js 초기화 - useEffect로 한 번만 실행
  useEffect(() => {
    let isMounted = true;
    
    const initializePDFJS = async () => {
      console.log('🔄 PDF.js 초기화 시작...');
      
      // Worker 설정 - 로컬 파일만 사용 (안정성 최우선)
      if (typeof window !== "undefined") {
        const workerSrc = `${window.location.origin}/pdf.worker.min.js`;
        GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('✅ PDF.js Worker 설정 완료:', workerSrc);
      }
      
      // 컴포넌트가 여전히 마운트되어 있을 때만 상태 업데이트
      if (isMounted) {
        setIsReady(true);
        console.log('🎉 PDF.js 초기화 완료 - 파일 업로드 준비됨!');
      }
    };

    initializePDFJS();

    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // PDF 파일 검증
  const validatePdfFile = useCallback((file: File): boolean => {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('PDF 파일만 업로드할 수 있습니다.');
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      showError('파일 크기가 50MB를 초과합니다.');
      return false;
    }
    
    return true;
  }, [showError]);

  // PDF 미리보기 렌더링 - 안정성 개선
  const renderPreview = useCallback(async (file: File) => {
    if (!canvasRef.current) {
      console.warn('Canvas ref가 없습니다');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🖼️ PDF 미리보기 렌더링 시작');

      const pdfjs = await loadPDFJS();
      
      console.log('📄 PDF 파일 로딩 시작');
      
      // 1. PDF 로딩 (URL.createObjectURL 사용)
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      console.log(`✅ PDF 로딩 완료: 총 ${pdf.numPages} 페이지`);

      // 2. 첫 페이지 가져오기
      const page = await pdf.getPage(1);
      console.log('✅ 첫 페이지 로딩 완료');

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('CanvasContext를 가져올 수 없습니다');
      }

      // 3. 뷰포트 설정 (PDF.js v3+ 호환)
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      console.log(`🖼️ Canvas 설정 완료 (Width: ${viewport.width}, Height: ${viewport.height})`);

      // 4. Canvas 크기 설정
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 5. 렌더링 실행
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      console.log('✅ PDF 미리보기 렌더링 완료');

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPreviewUrl(dataUrl);

    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ PDF 미리보기 렌더링 실패:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        showError(`PDF 미리보기 생성 실패: ${error.message}`);
      } else {
        console.error('❌ PDF 미리보기 렌더링 실패(원시값):', JSON.stringify(error));
        showError('PDF 미리보기 생성 중 알 수 없는 오류가 발생했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadPDFJS, showError]);

  // 파일 선택 버튼 클릭 핸들러
  const handleAddFileClick = useCallback((e?: React.MouseEvent) => {
    console.log('🖱️ Add File 영역 클릭됨');
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isReady) {
      console.warn('⚠️ PDF 라이브러리가 아직 준비되지 않음');
      showError('PDF 라이브러리가 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    // 숨겨진 파일 input 생성하고 클릭
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,application/pdf';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        const file = files[0];
        console.log('📄 파일 선택됨:', { name: file.name, size: file.size, type: file.type });
        
        // PDF.js 초기화 상태 재확인
        if (!isReady) {
          console.warn('⚠️ PDF.js가 아직 초기화되지 않음');
          showError('PDF 라이브러리 초기화 중입니다. 잠시 후 다시 시도해주세요.');
          return;
        }
        
        if (validatePdfFile(file)) {
          console.log('✅ 파일 유효성 검사 통과');

          // 상태 초기화
          clearConvertedPages();
          setPreviewUrl(null);
          setSelectedFile(file);
          console.log('✅ 파일 선택 완료');

          // PDF 미리보기 렌더링 - 초기화 완료 상태에서만 실행
          console.log('🖼️ PDF 미리보기 시작');
          await renderPreview(file);
        }
      }
      
      // 임시 파일 입력 요소 제거
      document.body.removeChild(fileInput);
    };
    
    // DOM에 추가하고 클릭
    document.body.appendChild(fileInput);
    console.log('✅ 파일 선택 대화상자 열기');
    fileInput.click();
  }, [clearConvertedPages, isReady, renderPreview, showError, validatePdfFile]);

  // 드래그 오버 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 드래그 앤 드롭 처리
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // PDF.js 초기화 상태 확인
      if (!isReady) {
        console.warn('⚠️ PDF.js가 아직 초기화되지 않음 (드래그앤드롭)');
        showError('PDF 라이브러리 초기화 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      if (validatePdfFile(file)) {
        clearConvertedPages();
        setPreviewUrl(null);
        setSelectedFile(file);
        
        console.log('🖼️ PDF 미리보기 시작 (드래그앤드롭)');
        await renderPreview(file);
      }
    }
  }, [clearConvertedPages, isReady, renderPreview, showError, validatePdfFile]);

  // PDF를 이미지로 변환
  const convertPdfToImages = useCallback(async () => {
    // PDF.js 초기화 및 파일 상태 확인
    if (!selectedFile) {
      showError('변환할 PDF 파일을 선택해주세요.');
      return;
    }
    
    if (!isReady) {
      showError('PDF 라이브러리 초기화 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    if (!canvasRef.current) {
      showError('캔버스를 초기화할 수 없습니다.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    clearConvertedPages();
    console.log('🔄 PDF 변환 시작...');

    try {
      const pdfjs = await loadPDFJS();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const results: ConvertedPage[] = [];

      console.log(`📖 총 ${totalPages}페이지 변환 시작`);

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas context 없음');

          // 고화질 렌더링
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;

          // 이미지 변환
          const mimeType = convertOption.value === 'png' ? 'image/png' : 'image/jpeg';
          const quality = convertOption.value === 'jpg' ? 0.95 : undefined;

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), mimeType, quality);
          });

          // 썸네일 생성
          const thumbnailViewport = page.getViewport({ scale: 0.3 });
          canvas.height = thumbnailViewport.height;
          canvas.width = thumbnailViewport.width;
          await page.render({ canvasContext: context, viewport: thumbnailViewport }).promise;
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

          const blobUrl = URL.createObjectURL(blob);
          const filename = `${selectedFile.name.replace('.pdf', '')}_page_${pageNum}.${convertOption.value}`;
            
          results.push({
            pageNumber: pageNum,
            blobUrl,
            thumbnailUrl,
            filename
          });
          convertedPagesRef.current = [...results];

          const progressPercent = Math.round((pageNum / totalPages) * 100);
          setProgress(progressPercent);
          setConvertedPages([...results]);
          
          console.log(`✅ 페이지 ${pageNum}/${totalPages} 완료 (${progressPercent}%)`);

        } catch (pageError) {
          console.error(`❌ 페이지 ${pageNum} 변환 실패:`, pageError);
        }
      }

      console.log(`🎉 변환 완료: ${results.length}개 페이지`);

    } catch (err) {
      console.error('❌ PDF 변환 실패:', err);
      showError('PDF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
      setProgress(100);
    }
  }, [selectedFile, isReady, convertOption, loadPDFJS, showError, clearConvertedPages]);

  // 개별 파일 다운로드
  const downloadPage = useCallback((page: ConvertedPage) => {
    const link = document.createElement('a');
    link.href = page.blobUrl;
    link.download = page.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 전체 ZIP 다운로드
  const downloadAllPages = useCallback(async () => {
    if (convertedPages.length === 0) return;

    try {
      const zip = new JSZip();
      const fileName = selectedFile?.name?.replace('.pdf', '') || 'converted';

      for (const page of convertedPages) {
        const response = await fetch(page.blobUrl);
        const blob = await response.blob();
        zip.file(page.filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${fileName}_all_pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      console.error('❌ ZIP 다운로드 실패:', error);
      showError('전체 다운로드 중 오류가 발생했습니다.');
    }
  }, [convertedPages, selectedFile, showError]);

  // 🎯 조건부 렌더링 - early return 제거하고 여기서 처리
  if (!isReady) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-2 bg-transparent h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-gray-300 text-gray-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Initializing PDF Engine
          </h2>
          <p className="text-gray-600">
            Setting up conversion system...
          </p>
        </div>
      </div>
    );
  }

  // 🎯 메인 렌더링 (PDF.js 준비 완료 후)
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-2 bg-transparent h-full">
      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 페이지 헤더 */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-2 drop-shadow-none">
          PDF to Image Converter
        </h1>
        <p className="text-lg md:text-2xl text-black font-bold mb-1">
          Convert your PDF files to high-quality images quickly and easily
        </p>
        <p className="text-black font-extrabold">
          100% Free, No installation required!
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-xl"
        >
          <div className="flex items-center gap-2 justify-center">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            <p className="text-gray-700 font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* 파일 업로드 영역 */}
      <motion.div
        className={`border-2 border-dotted border-gray-400 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center transition-all mb-8 p-6 ${
          selectedFile ? 'bg-gray-50' : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md hover:border-gray-500 cursor-pointer'
        }`}
        whileHover={!selectedFile ? { scale: 1.01 } : undefined}
        {...(!selectedFile ? {
          onClick: handleAddFileClick,
          onDrop: handleDrop,
          onDragOver: handleDragOver,
        } : {})}
      >
        {!selectedFile ? (
          <>
            <UploadCloud className="mx-auto mb-4 text-black" size={56} />
            <div className="text-2xl font-bold mb-1 text-black">Add PDF Files</div>
            <div className="text-black text-base">
              Drag & drop or{" "}
              <span 
                className="text-black font-bold cursor-pointer underline hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFileClick(e);
                }}
              >
                Select PDF Files
              </span>
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Supported format: PDF (Max 50MB)
            </div>
            
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-900" />
                <p className="text-gray-900 font-medium text-sm">
                  PDF Engine Ready - Upload to Start Converting!
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* 파일 미리보기 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-900" />
                  <h3 className="text-xl font-bold text-gray-900">Selected PDF</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFileClick}
                    disabled={!isReady}
                    className="rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400 shadow-lg transition-all duration-300"
                  >
                    Change File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      clearConvertedPages();
                    }}
                    className="rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400 shadow-lg transition-all duration-300"
                  >
                    Remove
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Generating preview...</p>
                </div>
              ) : previewUrl ? (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Preview (First Page):
                  </div>
                  <div className="border border-gray-300 rounded-lg overflow-hidden max-w-full">
                    <img 
                      src={previewUrl} 
                      alt="PDF Preview" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              ) : null}
              
              <div className="text-sm text-gray-600">
                File: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            </div>

            {/* 변환 버튼 */}
            <div className="flex gap-2 mt-4 justify-end w-full">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-900 font-medium">Output Format:</span>
                </div>
                <div className="w-32">
                  <CustomDropdown
                    options={CONVERT_OPTIONS}
                    value={convertOption.value}
                    onChange={(value: string) => {
                      const found = CONVERT_OPTIONS.find(option => option.value === value);
                      if (found) setConvertOption(found);
                    }}
                    size="lg"
                  />
                </div>
              </div>
              <Button
                onClick={convertPdfToImages}
                disabled={isConverting || !isReady}
                className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {isConverting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
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
        )}
      </motion.div>

      {/* 변환 결과 */}
      {convertedPages.length > 0 && isReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image className="w-6 h-6 text-gray-900" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Converted Pages ({convertedPages.length})
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddFileClick}
                  disabled={!isReady}
                  className="rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 hover:border-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-4 py-2"
                >
                  Convert Another PDF
                </Button>
                <Button
                  onClick={downloadAllPages}
                  className="rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-6 py-2"
                >
                  <Download size={16} className="mr-2" />
                  Download All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedPages.map((page) => (
                <motion.div
                  key={page.pageNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
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
                      className="rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-3 py-1 text-xs"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 프로그레스 바 */}
      {isConverting && (
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
