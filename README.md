# BravoConvert

온라인 이미지 변환 플랫폼으로 다양한 이미지 형식 간 변환을 빠르고 쉽게 할 수 있습니다.

## 🚀 주요 기능

- 🖼️ **이미지 변환**: PNG, JPG, WebP, GIF, BMP 등 다양한 형식 간 변환 지원 ✅
- 📄 **PDF 변환**: PDF를 이미지로 변환 ✅
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원 ✅
- ⚡ **빠른 처리**: 브라우저에서 바로 처리되는 클라이언트 사이드 변환 ✅

## 🛠️ 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **PDF.js** - PDF 렌더링
- **jsPDF** - PDF 생성
- **JSZip** - 파일 압축

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd png-converter
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 접속
- Frontend: http://localhost:3000

## 🎯 사용법

### 이미지 변환
1. `/convert/img` 페이지 방문
2. 이미지 파일 업로드 (드래그 앤 드롭 지원)
3. 원하는 변환 형식 선택
4. 변환 버튼 클릭 후 다운로드

### PDF 변환
1. `/convert/pdf` 페이지 방문
2. PDF 파일 업로드
3. 이미지 형식 선택 (JPG, PNG)
4. 변환 후 개별 또는 ZIP 파일로 다운로드

## 🔧 개발 스크립트

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start
```

## 📁 프로젝트 구조

```
png-converter/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── convert/
│   │   │   ├── img/        # 이미지 변환 페이지
│   │   │   ├── pdf/        # PDF 변환 페이지
│   │   │   └── ...
│   │   └── ...
│   ├── components/          # React 컴포넌트
│   │   ├── ImageConverter.tsx
│   │   ├── PDFConverter.tsx
│   │   └── ...
│   └── lib/                # 유틸리티
└── public/                 # 정적 파일
```

## 🌟 주요 특징

### 사용자 친화적 UI
- 드래그 앤 드롭 파일 업로드
- 실시간 변환 진행률 표시
- 반응형 디자인
- 직관적인 인터페이스

### 클라이언트 사이드 처리
- 브라우저에서 직접 변환 처리
- 서버 업로드 없이 빠른 변환
- 개인정보 보호 (파일이 서버로 전송되지 않음)
- 오프라인에서도 작동

## 🚧 개발 예정 기능

- 🎨 **이미지 편집**: 크기 조정, 압축, 회전 등
- 🔄 **배치 최적화**: 더 빠른 일괄 처리
- 📐 **고급 설정**: 품질 조정, 색상 프로필 등

## 🤝 기여

이슈 리포트와 풀 리퀘스트를 환영합니다!

## 📄 라이선스

MIT License"# bravoconvert" 
