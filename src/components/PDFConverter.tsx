"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { AlertCircle, Download, FileImage, FileText, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PageContainer from "@/components/site/page-container";
import ActionBar from "@/components/tool/action-bar";
import DropZone from "@/components/tool/drop-zone";
import IconTile from "@/components/tool/icon-tile";
import StatusBadge from "@/components/tool/status-badge";
import ToolLayout from "@/components/tool/tool-layout";
import ToolPageHeader from "@/components/tool/tool-page-header";
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
  const [dragging, setDragging] = useState(false);
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
      console.log('Importing PDF.js...');
      const pdfjs = await import('pdfjs-dist');
      console.log('PDF.js loaded');
      setPdfjsLib(pdfjs);
      return pdfjs;
    } catch (error) {
      console.error('PDF.js failed to load:', error);
      showError('Could not load the PDF library. Please reload the page and try again.');
      throw error;
    }
  }, [pdfjsLib, showError]);

  // PDF.js 초기화 - useEffect로 한 번만 실행
  useEffect(() => {
    let isMounted = true;
    
    const initializePDFJS = async () => {
      console.log('Initialising PDF.js...');
      
      // Worker 설정 - 로컬 파일만 사용 (안정성 최우선)
      if (typeof window !== "undefined") {
        const workerSrc = `${window.location.origin}/pdf.worker.min.js`;
        GlobalWorkerOptions.workerSrc = workerSrc;
        console.log('PDF.js worker configured:', workerSrc);
      }
      
      // 컴포넌트가 여전히 마운트되어 있을 때만 상태 업데이트
      if (isMounted) {
        setIsReady(true);
        console.log('PDF.js ready for uploads');
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
      showError('Only PDF files can be converted here.');
      return false;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      showError('This file is over the 50MB limit. Try splitting the document into smaller parts.');
      return false;
    }
    
    return true;
  }, [showError]);

  // PDF 미리보기 렌더링 - 안정성 개선
  const renderPreview = useCallback(async (file: File) => {
    if (!canvasRef.current) {
      console.warn('Canvas ref is not attached');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Rendering PDF preview');

      const pdfjs = await loadPDFJS();
      
      console.log('Loading PDF file');
      
      // 1. PDF 로딩 (URL.createObjectURL 사용)
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      console.log(`PDF loaded: ${pdf.numPages} pages`);

      // 2. 첫 페이지 가져오기
      const page = await pdf.getPage(1);
      console.log('First page loaded');

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get a 2D canvas context.');
      }

      // 3. 뷰포트 설정 (PDF.js v3+ 호환)
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      console.log(`Canvas sized ${viewport.width}x${viewport.height}`);

      // 4. Canvas 크기 설정
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 5. 렌더링 실행
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      console.log('Preview rendered');

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPreviewUrl(dataUrl);

    } catch (error) {
      if (error instanceof Error) {
        console.error('Preview rendering failed:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        showError(`Could not generate a preview: ${error.message}`);
      } else {
        console.error('Preview rendering failed (raw):', JSON.stringify(error));
        showError('Something went wrong while generating the preview.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadPDFJS, showError]);

  // 파일 선택 버튼 클릭 핸들러
  const handleAddFileClick = useCallback((e?: React.MouseEvent) => {
    console.log('Add File area clicked');
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isReady) {
      console.warn('PDF library not ready yet');
      showError('The PDF library is still loading. Please try again in a moment.');
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
        console.log('File selected:', { name: file.name, size: file.size, type: file.type });
        
        // PDF.js 초기화 상태 재확인
        if (!isReady) {
          console.warn('PDF.js not initialised yet');
          showError('The PDF library is still starting up. Please try again in a moment.');
          return;
        }
        
        if (validatePdfFile(file)) {
          console.log('File passed validation');

          // 상태 초기화
          clearConvertedPages();
          setPreviewUrl(null);
          setSelectedFile(file);
          console.log('File selection complete');

          // PDF 미리보기 렌더링 - 초기화 완료 상태에서만 실행
          console.log('Starting preview');
          await renderPreview(file);
        }
      }
      
      // 임시 파일 입력 요소 제거
      document.body.removeChild(fileInput);
    };
    
    // DOM에 추가하고 클릭
    document.body.appendChild(fileInput);
    console.log('Opening file picker');
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
        console.warn('PDF.js not initialised yet (drag and drop)');
        showError('The PDF library is still starting up. Please try again in a moment.');
        return;
      }
      
      if (validatePdfFile(file)) {
        clearConvertedPages();
        setPreviewUrl(null);
        setSelectedFile(file);
        
        console.log('Starting preview (drag and drop)');
        await renderPreview(file);
      }
    }
  }, [clearConvertedPages, isReady, renderPreview, showError, validatePdfFile]);

  // PDF를 이미지로 변환
  const convertPdfToImages = useCallback(async () => {
    // PDF.js 초기화 및 파일 상태 확인
    if (!selectedFile) {
      showError('Choose a PDF file to convert first.');
      return;
    }
    
    if (!isReady) {
      showError('The PDF library is still starting up. Please try again in a moment.');
      return;
    }
    
    if (!canvasRef.current) {
      showError('Could not prepare the canvas used for rendering.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    clearConvertedPages();
    console.log('Starting conversion...');

    try {
      const pdfjs = await loadPDFJS();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const results: ConvertedPage[] = [];

      console.log(`Converting ${totalPages} pages`);

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('No 2D canvas context available.');

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
          
          console.log(`Page ${pageNum}/${totalPages} done (${progressPercent}%)`);

        } catch (pageError) {
          console.error(`Page ${pageNum} failed:`, pageError);
        }
      }

      console.log(`Conversion complete: ${results.length} pages`);

    } catch (err) {
      console.error('PDF conversion failed:', err);
      showError('Something went wrong while converting the PDF. Try again, or use a smaller file.');
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
      console.error('ZIP download failed:', error);
      showError('Something went wrong while preparing the download.');
    }
  }, [convertedPages, selectedFile, showError]);

  // 페이지 헤더는 준비 상태와 무관하게 항상 렌더링한다.
  // 이 컴포넌트가 로딩 게이트 뒤에 전부 숨어 있으면 정적 HTML에 h1이 사라지고
  // 크롤러에게는 "Initializing..." 화면만 남는다.
  const pageHeader = (
    <ToolPageHeader
      crumb={["Tools", "PDF to Image"]}
      title="PDF to Image Converter"
      intro="Convert your PDF files to high-quality images quickly and easily"
      icon={FileImage}
      chips={[{ label: "PDF" }, { label: "Up to 50 MB" }, { label: "PNG or JPG" }, { label: "Nothing uploaded", ok: true }]}
    />
  );

  // 🎯 조건부 렌더링 - early return 제거하고 여기서 처리
  if (!isReady) {
    return (
      <PageContainer className="pb-6">
        {pageHeader}
        <Card className="mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">Loading the converter…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This takes a moment on first visit. Your files stay on your device.
          </p>
        </Card>
      </PageContainer>
    );
  }

  const errorAlert = error && (
    <p role="alert" className="mb-4 flex items-center gap-2 rounded-field bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      {error}
    </p>
  );

  const dropZone = (
    <DropZone
      title="Add PDF Files"
      note="Drag & drop or choose a file. Supported format: PDF (Max 50MB)"
      dragging={dragging}
      onDragEnter={e => { e.preventDefault(); setDragging(true); }}
      onDragOver={handleDragOver}
      onDragLeave={e => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={e => { setDragging(false); handleDrop(e); }}
      actions={<Button onClick={handleAddFileClick}>Select PDF Files</Button>}
    >
      <div className="mt-5">
        <StatusBadge status="clean">PDF Engine Ready - Upload to Start Converting!</StatusBadge>
      </div>
    </DropZone>
  );

  const main = selectedFile && (
    <Card data-tool-main className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={FileText} tone="blue" size="sm" />
          <div className="min-w-0">
            <h2 className="text-h3">Selected PDF</h2>
            <p className="truncate text-sm text-muted-foreground">
              File: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleAddFileClick} disabled={!isReady}>
            Change File
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              clearConvertedPages();
            }}
          >
            Remove
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">
          <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">Generating preview...</p>
        </div>
      ) : previewUrl ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            Preview (First Page):
          </p>
          <div className="overflow-hidden rounded-field bg-muted p-3">
            <img src={previewUrl} alt="PDF Preview" className="mx-auto h-auto max-h-80 w-auto max-w-full rounded-[12px] object-contain" />
          </div>
        </div>
      ) : null}
    </Card>
  );

  const panel = selectedFile && (
    <Card data-tool-panel className="p-5">
      <h2 id="pdf-output-format" className="text-h3">Output format</h2>
      <div role="radiogroup" aria-labelledby="pdf-output-format" className="mt-3 grid grid-cols-2 gap-2">
        {CONVERT_OPTIONS.map(option => {
          const checked = convertOption.value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setConvertOption(option)}
              className={`flex min-h-[44px] flex-col items-start rounded-field px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? "bg-primary text-primary-foreground shadow-cta" : "border-2 border-border bg-card text-foreground hover:bg-muted"}`}
            >
              <span className="text-sm font-bold">{option.label}</span>
              <span className={`text-xs ${checked ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {option.value === "png" ? "Text and diagrams" : "Photos and scans"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Pages are rendered at 144 DPI in your browser. Nothing is uploaded.
      </p>
      {isConverting && <Progress className="mt-5" value={progress} label="Conversion progress" />}
      <ActionBar className="mt-5">
        <Button size="lg" className="w-full" onClick={convertPdfToImages} disabled={isConverting || isLoading || !isReady}>
          {isConverting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Converting... {progress}%
            </>
          ) : (
            <>
              <Download aria-hidden="true" />
              Convert to Images
            </>
          )}
        </Button>
      </ActionBar>
    </Card>
  );

  const results = convertedPages.length > 0 && (
    <Card className="p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-h3">
          <ImageIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          Converted Pages ({convertedPages.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleAddFileClick} disabled={!isReady}>
            Convert Another PDF
          </Button>
          <Button onClick={downloadAllPages}>
            <Download aria-hidden="true" />
            Download All
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {convertedPages.map(page => (
          <div key={page.pageNumber} className="rounded-field bg-muted p-3">
            <img
              src={page.thumbnailUrl}
              alt={`Page ${page.pageNumber}`}
              className="mb-3 h-32 w-full rounded-[12px] bg-card object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Page {page.pageNumber}</span>
              <Button size="sm" variant="secondary" onClick={() => downloadPage(page)}>
                <Download aria-hidden="true" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // 🎯 메인 렌더링 (PDF.js 준비 완료 후)
  return (
    <PageContainer className="pb-6">
      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {pageHeader}
      <div className="mt-6">
        {errorAlert}
        <ToolLayout main={selectedFile ? main : dropZone} panel={selectedFile ? panel : null} results={results || undefined} />
      </div>
    </PageContainer>
  );
}
