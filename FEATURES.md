# 주요 기능 정리 (BravoConvert - 이미지 및 PDF 변환기)

## 1. 이미지 변환 기능
- **다중 포맷 변환**: PNG, JPG, WEBP, AVIF, BMP, GIF, ICO, JFIF, TIFF, PDF 변환
- **다중 파일 업로드**: 드래그 앤 드롭 및 파일 선택으로 일괄 업로드
- **일괄 변환**: 업로드된 모든 이미지를 한 번에 변환
- **자동 포맷 감지**: 업로드된 파일의 포맷을 자동으로 감지하여 입력 형식 설정
- **변환 정보 표시**: 변환 속도, 용량, 시간 등 상세 정보 제공

## 2. PDF 변환 기능
- **PDF → 이미지**: PDF의 각 페이지를 JPG/PNG로 변환
- **페이지별 변환**: 모든 페이지를 개별 이미지로 변환
- **PDF 미리보기**: 첫 페이지 미리보기 기능
- **진행률 표시**: 변환 진행 상황 실시간 표시
- **파일 크기 제한**: 최대 50MB PDF 파일 지원

## 3. 다운로드 기능
- **개별 다운로드**: 변환된 이미지/PDF 페이지별 개별 다운로드
- **ZIP 다운로드**: 2개 이상 변환 시 ZIP 파일로 일괄 다운로드 (JSZip 사용)
- **파일명 유지**: 변환 파일명은 원본명 유지 (확장자만 변경)
- **메모리 관리**: URL.revokeObjectURL로 메모리 누수 방지

## 4. 파일 관리 기능
- **파일 정렬**: 드래그 앤 드롭으로 파일 순서 변경 (이미지 변환기)
- **파일 삭제**: 개별 파일 삭제 기능
- **파일 검증**: 지원되지 않는 파일 형식 자동 필터링
- **에러 처리**: 잘못된 파일 포맷 시 친화적 알림

## 5. UI/UX
- **드래그 앤 드롭**: 직관적인 파일 업로드 인터페이스
- **카드형 리스트 UI**: 썸네일, 용량, 시간, 다운로드, 삭제 등 표시
- **반응형 디자인**: 모바일/데스크톱 모두 최적화
- **ShadCN UI**: 일관된 UI 컴포넌트 시스템
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **lucide-react 아이콘**: 일관된 아이콘 시스템
- **Framer Motion**: 부드러운 애니메이션 효과
- **라운드 디자인**: 모든 요소에 둥근 모서리 적용
- **글래스모피즘**: 반투명 배경과 블러 효과

## 6. 네비게이션/푸터
- **상단 네비게이션**: 
  - Converters 드롭다운 (Image Converter, PDF to Image)
  - How to Use, FAQ, Privacy Policy, Terms of Service
- **반응형 메뉴**: 모바일용 햄버거 메뉴
- **Sticky 헤더**: 스크롤 시에도 상단 고정
- **하단 푸터**: 저작권, 정책/가이드 링크

## 7. 페이지 구성
- **메인 페이지** (`/`): 서비스 소개 및 주요 기능 안내
- **이미지 변환** (`/convert/img`): 이미지 포맷 변환 도구
- **PDF 변환** (`/convert/pdf`): PDF를 이미지로 변환
- **통합 변환** (`/convert/all`): 모든 변환 도구 통합
- **사용법** (`/how-to-use`): 상세한 사용 가이드
- **FAQ** (`/faq`): 자주 묻는 질문
- **개인정보처리방침** (`/privacy-policy`): 개인정보 보호 정책
- **이용약관** (`/terms`): 서비스 이용 약관

## 8. SEO/접근성
- **SEO 최적화**: title, description, keywords, viewport 등 메타태그 적용
- **시맨틱 HTML**: 의미있는 HTML 구조
- **접근성**: 키보드 네비게이션, ARIA 속성 지원
- **성능 최적화**: Lighthouse Performance > 90

## 9. 광고 시스템
- **Google AdSense**: 광고 수익화 시스템
- **광고 배치**: 헤더, 콘텐츠 사이, 푸터 등 전략적 배치
- **사용자 경험**: 광고가 사용자 경험을 해치지 않는 선에서 배치
- **반응형 광고**: 모바일/데스크톱에 최적화된 광고 크기

## 10. 기술적 특징
- **서버리스 아키텍처**: 100% 브라우저 기반 처리
- **개인정보 보호**: 파일이 서버에 업로드되지 않음
- **Canvas API**: 브라우저 네이티브 기능으로 고품질 변환
- **PDF.js**: PDF 처리의 표준 라이브러리
- **JSZip**: 다중 파일 압축 및 다운로드
- **jsPDF**: 이미지를 PDF로 변환

## 11. 지원 포맷

### 이미지 변환기 입력 포맷
- BMP, CR3, DNG, HEIC, JFIF, JPG, PNG, TIFF, GIF

### 이미지 변환기 출력 포맷
- WEBP, AVIF, BMP, GIF, ICO, JFIF, JPG, PNG, TIFF, PDF

### PDF 변환기
- **입력**: PDF 파일 (최대 50MB)
- **출력**: JPG, PNG

## 12. 향후 개발 계획
- **다국어 지원**: 영어, 한국어 완전 지원
- **고급 이미지 처리**: 리사이징, 압축, 회전, 크롭 기능
- **PDF → 텍스트**: PDF에서 텍스트 추출 기능
- **문서 → PDF**: 다양한 문서 형식을 PDF로 변환
- **클라우드 저장소 연동**: Google Drive, Dropbox 등
- **사용자 설정 저장**: 로컬 스토리지를 통한 설정 저장 