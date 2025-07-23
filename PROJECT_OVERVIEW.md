# BravoConvert - 이미지 및 PDF 변환 웹 애플리케이션

## 🚀 프로젝트 개요

**BravoConvert**는 온라인에서 무료로 사용할 수 있는 강력한 이미지 및 PDF 변환 도구입니다. 사용자가 이미지와 PDF 파일을 빠르고 쉽게 변환할 수 있도록 설계되었습니다.

- **메인 기능**: 이미지 포맷 변환 (PNG, JPG, WEBP, AVIF 등) + PDF → 이미지 변환
- **특징**: 100% 무료, 설치 불필요, 브라우저에서 바로 사용, 서버리스 처리
- **기술 스택**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, PDF.js

## 📁 프로젝트 구조

```
png-converter/
├── src/
│   ├── app/
│   │   ├── convert/
│   │   │   ├── img/page.tsx           # 이미지 변환 페이지
│   │   │   ├── pdf/page.tsx           # PDF 변환 페이지
│   │   │   ├── all/page.tsx           # 통합 변환 페이지
│   │   │   ├── doc-to-pdf/page.tsx    # 문서 → PDF 변환
│   │   │   ├── subtitle/page.tsx      # 자막 변환
│   │   │   └── text/page.tsx          # 텍스트 변환
│   │   ├── faq/page.tsx               # FAQ 페이지
│   │   ├── how-to-use/page.tsx        # 사용법 페이지
│   │   ├── privacy-policy/page.tsx    # 개인정보처리방침
│   │   ├── terms/page.tsx             # 서비스 약관
│   │   ├── layout.tsx                 # 레이아웃
│   │   ├── page.tsx                   # 메인 페이지
│   │   └── globals.css                # 전역 스타일
│   ├── components/
│   │   ├── ui/
│   │   │   ├── CustomDropdown.tsx     # 커스텀 드롭다운 컴포넌트
│   │   │   ├── button.tsx             # 버튼 컴포넌트
│   │   │   └── card.tsx               # 카드 컴포넌트
│   │   ├── image-converter/
│   │   │   ├── FileList.tsx           # 파일 리스트 컴포넌트
│   │   │   ├── SortableItem.tsx       # 정렬 가능한 아이템
│   │   │   ├── formats.ts             # 지원 포맷 정의
│   │   │   └── types.ts               # 타입 정의
│   │   ├── ImageConverter.tsx         # 이미지 변환 메인 컴포넌트
│   │   ├── PDFConverter.tsx           # PDF 변환 메인 컴포넌트
│   │   ├── UnifiedConverter.tsx       # 통합 변환 컴포넌트
│   │   ├── Navigation.tsx             # 네비게이션 컴포넌트
│   │   ├── ClientRoot.tsx             # 클라이언트 루트
│   │   ├── AdSense.tsx                # 광고 컴포넌트
│   │   ├── AdToggle.tsx               # 광고 토글
│   │   ├── AnchorAd.tsx               # 앵커 광고
│   │   └── InFeedAd.tsx               # 인피드 광고
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.json                # 영어 번역
│   │       ├── ko.json                # 한국어 번역
│   │       └── ...                    # 기타 언어
│   └── lib/
│       └── utils.ts                   # 유틸리티 함수
├── backend/
│   ├── app.py                         # 백엔드 API
│   ├── requirements.txt               # Python 의존성
│   └── ...                           # 기타 백엔드 파일
├── public/                            # 정적 파일
├── tailwind.config.js                 # Tailwind 설정
├── package.json                       # 의존성 관리
└── tsconfig.json                      # TypeScript 설정
```

## 🎨 디자인 시스템

### 색상 테마
- **기본**: 화이트-블랙 베이스
- **포인트 컬러**: 그레이 톤 (호버 효과 등)
- **일관성**: 모든 컴포넌트에서 통일된 색상 사용

### 디자인 특징
- **라운드 디자인**: 모든 요소에 둥근 모서리 적용 (`rounded-xl`, `rounded-2xl`)
- **그림자 효과**: 카드와 드롭다운에 부드러운 그림자
- **호버 효과**: 명확한 상호작용 피드백 (`hover:bg-gray-200`)
- **애니메이션**: Framer Motion을 활용한 부드러운 전환
- **아이콘**: lucide-react 아이콘 사용으로 일관된 디자인

## 🔧 주요 기능

### 1. 이미지 변환 (`ImageConverter.tsx`)

#### 지원 포맷
**입력 포맷:**
- BMP, CR3, DNG, HEIC, JFIF, JPG, PNG, TIFF, GIF

**출력 포맷:**
- WEBP, AVIF, BMP, GIF, ICO, JFIF, JPG, PNG, TIFF, PDF

#### 핵심 기능
- ✅ **드래그 앤 드롭**: 파일을 드래그해서 쉽게 추가
- ✅ **일괄 변환**: 여러 파일을 한 번에 변환
- ✅ **실시간 미리보기**: 썸네일로 변환 전후 비교
- ✅ **개별 다운로드**: 파일별로 개별 다운로드
- ✅ **ZIP 다운로드**: 여러 파일을 ZIP으로 한 번에 다운로드
- ✅ **변환 정보**: 파일 크기, 변환 시간 표시
- ✅ **파일 정렬**: 드래그 앤 드롭으로 파일 순서 변경
- ✅ **자동 포맷 감지**: 업로드된 파일의 포맷을 자동으로 감지
- ✅ **PDF 변환**: 여러 이미지를 하나의 PDF로 병합

#### 변환 프로세스
1. 사용자가 포맷 선택 (PNG → WEBP)
2. 파일 추가 (드래그 앤 드롭 또는 클릭)
3. "Convert All" 버튼으로 일괄 변환
4. 개별 다운로드 또는 "Save All"로 ZIP 다운로드

### 2. PDF 변환 (`PDFConverter.tsx`)

#### 지원 기능
- ✅ **PDF → 이미지**: PDF의 각 페이지를 JPG/PNG로 변환
- ✅ **페이지별 변환**: 모든 페이지를 개별 이미지로 변환
- ✅ **미리보기**: PDF 첫 페이지 미리보기
- ✅ **개별 다운로드**: 페이지별 개별 다운로드
- ✅ **ZIP 다운로드**: 모든 페이지를 ZIP으로 다운로드
- ✅ **진행률 표시**: 변환 진행 상황 실시간 표시

#### 기술 스택
- **PDF.js**: PDF 렌더링 및 텍스트 추출
- **Canvas API**: PDF 페이지를 이미지로 변환
- **JSZip**: 여러 이미지를 ZIP으로 압축

### 3. 커스텀 드롭다운 (`CustomDropdown.tsx`)

#### 기능
- ✅ **완전한 커스터마이징**: HTML select 제약 없이 자유로운 디자인
- ✅ **라운드 박스**: 드롭다운 리스트 박스까지 완전히 라운드
- ✅ **2열 그리드**: 옵션들이 2열로 배치되어 스크롤 최소화
- ✅ **애니메이션**: 열림/닫힘 시 부드러운 애니메이션
- ✅ **키보드 지원**: ESC 키로 닫기, 외부 클릭 감지
- ✅ **접근성**: ARIA 속성 완벽 지원

#### 사용법
```tsx
<CustomDropdown
  options={[
    { label: "PNG", value: "PNG" },
    { label: "WEBP", value: "WEBP" }
  ]}
  value={selectedValue}
  onChange={(value) => handleChange(value)}
  size="lg" // sm, md, lg
/>
```

### 4. 네비게이션 (`Navigation.tsx`)

#### 기능
- ✅ **반응형 디자인**: 데스크톱/모바일 대응
- ✅ **모바일 메뉴**: 햄버거 메뉴와 드롭다운
- ✅ **Sticky 헤더**: 스크롤 시에도 상단 고정
- ✅ **글래스모피즘**: 반투명 배경과 블러 효과
- ✅ **드롭다운 메뉴**: 변환 도구들을 카테고리별로 정리

#### 메뉴 구성
- Converters (드롭다운)
  - Image Converter
  - PDF to Image
- How to Use
- FAQ  
- Privacy Policy
- Terms of Service

### 5. 광고 시스템

#### 광고 컴포넌트들
- **AdSense**: Google AdSense 통합
- **AdToggle**: 광고 표시/숨김 토글
- **AnchorAd**: 화면 하단 고정 광고
- **InFeedAd**: 콘텐츠 사이 인피드 광고

#### 광고 배치 전략
- 페이지 진입 시 첫 인상에서 가시성 높은 위치
- 콘텐츠 사이에 자연스럽게 삽입
- 사용자 경험을 해치지 않는 선에서 효율적 배치

## 🛠️ 기술적 특징

### 성능 최적화
- **클라이언트 사이드 변환**: 파일이 서버에 업로드되지 않아 빠름
- **Canvas API**: 브라우저 네이티브 기능으로 고품질 변환
- **메모리 관리**: URL.revokeObjectURL로 메모리 누수 방지
- **PDF.js**: PDF 처리의 표준 라이브러리 사용

### 사용자 경험 (UX)
- **즉시 피드백**: 드래그 앤 드롭 시 즉시 반응
- **진행 상태**: 변환 중/완료 상태 명확 표시
- **에러 처리**: 잘못된 파일 포맷 시 친화적 알림
- **파일 정렬**: 드래그 앤 드롭으로 파일 순서 변경 가능

### 접근성 (Accessibility)
- **키보드 네비게이션**: 모든 기능을 키보드로 접근 가능
- **ARIA 속성**: 스크린 리더 지원
- **시맨틱 HTML**: 의미있는 HTML 구조

### 다국어 지원
- **i18n 구조**: 영어, 한국어 등 다국어 지원 준비
- **번역 파일**: JSON 기반 번역 시스템

## 🎯 향후 개발 계획

### 예정된 기능
1. **다국어 UI**: 영어, 한국어 완전 지원
2. **고급 이미지 처리**: 리사이징, 압축, 회전, 크롭 기능
3. **PDF → 텍스트**: PDF에서 텍스트 추출 기능
4. **문서 → PDF**: 다양한 문서 형식을 PDF로 변환

### 개선 계획
- 변환 옵션 추가 (품질 설정, 리사이징 등)
- 배치 처리 성능 향상
- 더 많은 파일 포맷 지원
- 클라우드 저장소 연동
- 사용자 설정 저장 (로컬 스토리지)

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📝 주요 변경 이력

### v1.2 (현재)
- ✅ PDF 변환 기능 추가 (PDF → 이미지)
- ✅ 파일 정렬 기능 추가 (드래그 앤 드롭)
- ✅ 자동 포맷 감지 기능
- ✅ 이미지 → PDF 변환 기능
- ✅ lucide-react 아이콘으로 통일
- ✅ 다국어 지원 구조 준비

### v1.1
- ✅ 이미지 변환 기능 구현
- ✅ 커스텀 드롭다운 컴포넌트 개발
- ✅ 네비게이션 시스템 구축
- ✅ 광고 시스템 통합
- ✅ 반응형 디자인 적용
- ✅ 라운드 디자인 시스템 확립

### v1.0
- ✅ 기본 이미지 변환 기능
- ✅ 드래그 앤 드롭 업로드
- ✅ ZIP 다운로드 기능

---

**BravoConvert**는 사용자 중심의 직관적인 인터페이스와 강력한 변환 기능을 제공하는 현대적인 웹 애플리케이션입니다. 서버리스 아키텍처로 개인정보를 보호하면서도 고성능의 변환 서비스를 제공합니다. 