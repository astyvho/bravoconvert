# BravoConvert 디자인 리뉴얼 설계

- 작성일: 2026-11-12
- 상태: 초안, 승인 대기
- 범위: bravoconvert.com 전체 화면의 시각 디자인과 UI 컴포넌트 체계. 파일 처리 로직과 URL 구조는 바꾸지 않는다.

## 1. 의도

사이트의 자리매김은 "사진을 보내기 전에 무엇이 드러나는지 확인하고 지운다"이다. 지금 화면은 그 역할을 하기에 표정이 없다. 색과 글자 크기 체계가 없어 모든 페이지가 "검은 글씨, 회색 테두리, 둥근 모서리" 하나로 보이고, 네비게이션만 그림자와 블러로 떠 있어 깊이감 규칙이 서로 어긋난다. 다섯 도구 화면은 제각각 짜여 있어 하나를 익혀도 다음 도구에서 다시 배워야 한다.

리뉴얼의 목적은 두 가지다. 처음 온 사람이 안심하고 사진을 올리게 만드는 것, 그리고 다섯 도구를 한 가지 틀로 묶어 한 번 배우면 전부 쓸 수 있게 하는 것.

## 2. 목표, 비목표, 금기

**목표**

- 사이트 전체에 하나의 디자인 토큰 체계(색, 글꼴, 크기, 간격, 모서리, 그림자)를 세우고 모든 화면이 그 토큰만 쓴다.
- 접근성 프리미티브(Radix) 위에 세운 컴포넌트 라이브러리로 손으로 만든 드롭다운, 모바일 메뉴, 탭 등을 대체한다.
- 홈을 "따뜻한 도우미" 방향으로 다시 짠다 (5절).
- 다섯 도구 화면이 하나의 도구 화면 템플릿을 공유한다 (7.3절).
- 콘텐츠 페이지(가이드, FAQ 등)가 같은 토큰과 본문 스타일을 쓴다.
- 영문과 한국어 페이지가 같은 컴포넌트를 쓴다.

**비목표**

- 다크 모드. 토큰은 CSS 변수로 두어 나중에 가능하게만 한다. 지금 있는 `ThemeToggle`은 제거한다.
- 새 기능. 변환·편집·검사 기능은 지금 그대로다.
- 페이지 추가나 URL 변경. 한국어 페이지 범위(`KO_PATHS`)도 그대로다.
- 문구 전면 재작성. 말투는 부드럽게 다듬되 제목, 도구 이름, 테스트가 매칭하는 문구는 유지한다 (9절).
- Tailwind 4 업그레이드. 3.4에 머문다.

**금기 (기술적으로 되더라도 실패로 보는 것)**

- 광고나 동의 배너가 업로드 영역, 미리보기, 다운로드 버튼을 가리는 것.
- 애드센스·GA 스크립트 로드가 동의 뒤로 밀리는 것 (CLAUDE.md의 이유 참고).
- 사진 처리 코드(`public/workers/image-worker.js`, `src/lib/pdf-tools.ts`, `src/lib/photo-metadata.ts`, `src/lib/file-handoff.ts`)에 손대는 것.
- 포인트 색이 상태색(주황=발견, 초록=없음)과 헷갈리는 것.
- 모바일에서 도구가 데스크톱보다 못 쓰게 되는 것. 방문의 큰 몫이 폰이다.
- 정적 export가 깨지는 것 (`output: 'export'`, `trailingSlash: true`, 두 개의 루트 레이아웃).

## 3. 제약

- Next.js 14 App Router, 정적 export, Cloudflare Pages. 서버 컴포넌트에서 쓸 수 없는 것(이벤트 핸들러 등)은 클라이언트 컴포넌트로 격리한다.
- `(en)`과 `(ko)` 루트 레이아웃이 분리돼 있고 둘 다 `SiteHead`, `SiteFooter`를 공유한다. 헤더·푸터·동의 배너는 이 공유 지점에서 바꾼다.
- Playwright E2E(`tests/e2e/*.spec.ts`)가 제목, 버튼 이름, aria-label, 상태 문구를 그대로 매칭한다. 9절의 목록은 바뀌면 안 된다.
- 애드센스 재심사 중이다. 콘텐츠 분량을 줄이지 않고, 광고 자리는 템플릿에 예약만 한다 (`AdSense` 컴포넌트는 승인 전까지 `null`을 반환한다).
- 번들 크기. 사이트의 가치는 가벼운 클라이언트 처리다. 컴포넌트 라이브러리는 쓰는 조각만 들여온다.
- 한국어 페이지는 `break-keep`과 한국어 글꼴이 필요하다.

## 4. 검토한 접근과 선택

**만드는 방법** (사용자가 1번을 골랐다)

1. **shadcn/ui 체계 완성 (선택).** Radix 프리미티브 + Tailwind + CSS 변수 토큰. 저장소에 이미 `button.tsx`, `card.tsx`, `cva`, `clsx`, `tailwind-merge`, `@radix-ui/react-select`가 들어와 있으나 토큰이 정의되지 않아 쓰이지 않는다. 컴포넌트 코드를 직접 소유하므로 방향대로 마음껏 다듬을 수 있고 번들은 Radix 조각만 늘어난다. 단점은 컴포넌트를 하나씩 들여오고 기존 5,000줄을 옮겨 심는 손이 많이 든다는 것.
2. **Radix Themes.** 가장 빨리 정돈된 모습이 나오지만 Radix 특유의 생김새를 벗어나기 어렵고, 기존 Tailwind 코드와 두 체계가 섞인다.
3. **지금처럼 Tailwind 수작업 + 토큰만 추가.** 가장 싸지만 접근성 있는 드롭다운·시트·탭을 또 직접 만들어야 하고, 지금 상태로 흘러온 원인을 그대로 안고 간다.

HeroUI, Mantine, MUI 같은 대형 키트는 정적 사이트치고 번들이 크고 생김새가 강해 제외했다.

**디자인 방향** (목업을 보고 사용자가 골랐다)

- A "조용한 검사 리포트": 중립 웜 그레이, Inter, 가는 테두리, 그림자 없음. 신뢰감이 먼저.
- B "따뜻한 도우미" (선택, 도구 화면까지 전부): 크림 바탕, 둥근 글꼴, 알약 버튼, 파스텔 아이콘 타일, 부드러운 그림자, 두 단 히어로.
- 섞기(홈은 B, 도구 리포트 밀도는 A)도 제안했으나 사용자가 B 전부를 골랐다.

**포인트 색** (크림 바탕 위 네 가지를 비교하고 사용자가 골랐다): 지금의 파랑(#2563eb)은 차가워 크림 위에서 붙여 놓은 느낌이 나고, 테라코타는 발견 배지와 같은 계열이라 충돌하고, 먹색은 화사함이 준다. **남보라(indigo, #4f46e5)**가 따뜻한 바탕과 어울리면서 주황·초록 상태색에서 가장 멀고 신뢰감을 지킨다.

목업 파일은 `.superpowers/brainstorm/617-1794460059/content/`에 있다 (`direction-a-vs-b.html`, `accent-on-warm-v2.html`). 저장소에는 올리지 않는다.

## 5. 디자인 방향: 따뜻한 도우미

### 5.1 톤

친근하고 부담 없는 도우미. "우리가 함께 본다"는 말투. 화려하지 않고 포근하다. 장식은 색면과 둥근 모양으로 내고, 일러스트 이미지 파일은 쓰지 않는다 (홈 히어로의 "사진 카드"도 CSS 그라데이션과 말풍선 컴포넌트로 그린다).

### 5.2 색 토큰

모든 색은 `globals.css`의 CSS 변수로 정의하고 `tailwind.config.js`에서 `hsl(var(--token))`로 매핑한다. shadcn 관례 이름을 따른다.

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `background` | #fff8f1 | 페이지 바탕 |
| `card` / `popover` | #ffffff | 카드, 패널, 메뉴 |
| `foreground` | #2a2420 | 본문 글자 |
| `muted-foreground` | #6b5f55 | 보조 글자 (본문 크기에서 쓸 수 있는 최소 대비) |
| `muted` | #fef0e0 | 눌린 내비 항목, 은은한 강조면 |
| `border` / `input` | #f1e2d2 | 테두리, 점선 드롭 영역 |
| `primary` | #4f46e5 (indigo-600) | 주 버튼, 선택 상태, 링크, 진행 막대 |
| `primary-hover` | #4338ca | 주 버튼 hover |
| `primary-soft` | #eef2ff | 선택된 행 배경 |
| `ring` | #c7d2fe | 포커스 링, 선택된 행 테두리 |
| `status-found` | 배경 #fef3c7, 글자 #b45309 | "발견" 배지와 아이콘 타일 |
| `status-clean` | 배경 #dcfce7, 글자 #15803d | "없음/지워짐" 배지와 아이콘 타일 |
| `destructive` | 배경 #fee2e2, 글자 #b91c1c | 오류 메시지 |
| 파스텔 타일 | #dbeafe(파랑), #fef3c7(노랑), #dcfce7(초록), #fee2e2(분홍), #fef0e0(살구) | 홈 단계·도구 카드의 아이콘 타일. 의미 없음, 구분용 |

규칙:

- 포인트 색은 주 행동과 선택 상태에만 쓴다. 장식에 쓰지 않는다.
- 주황과 초록은 상태에만 쓴다. 홈의 파스텔 타일에서 노랑·초록을 쓸 때는 배지와 같은 모양(알약)으로 만들지 않는다.
- `#8a7d72` 같은 더 옅은 글자색은 18px 이상이거나 없어도 되는 정보(파일 크기 보조 표기 등)에만 쓴다. 크림 바탕에서 본문 크기 대비 4.5:1이 안 된다.
- 동의 배너의 수락 버튼은 지금처럼 중립(먹색)으로 둔다. 포인트 색을 주지 않는다.

### 5.3 글꼴과 크기

- 영문: **Plus Jakarta Sans** 400/500/600/700/800, `next/font/google`으로 빌드 때 셀프 호스팅 (`display: swap`). 영문 레이아웃의 `<body>`에 변수로 건다.
- 한국어: **Pretendard Variable**. `(ko)` 레이아웃에서 jsDelivr의 dynamic-subset CSS를 `<link>`로 불러오고 `font-family: Pretendard Variable, Pretendard, Plus Jakarta Sans, system-ui`. 저장소에 글꼴 파일을 넣지 않는다.
- 숫자(파일 크기, 좌표, 픽셀 수)는 `font-variant-numeric: tabular-nums`. 모노스페이스는 쓰지 않는다.
- 크기 체계 (Tailwind 이름 → 용도):
  - `display`: 52px/1.06, 800, 자간 -0.035em. 홈 H1만.
  - `h1`: 36px/1.15, 800, -0.03em. 도구·콘텐츠 페이지 H1.
  - `h2`: 26px/1.2, 800, -0.03em.
  - `h3`: 17px/1.3, 700.
  - `body`: 16px/1.6. 본문.
  - `small`: 14px/1.55. 카드 설명, 목록 메타.
  - `caption`: 12px/1.4, 600. 배지, 칩, 라벨.
  - 모바일에서 `display`는 36px, `h1`은 30px.

### 5.4 모양

- 모서리: 버튼·배지·칩·세그먼트는 알약(9999px). 카드 24px. 입력·드롭 영역 내부·목록 행 16px. 아이콘 타일 16px (48px 크기), 12px (36px 크기).
- 테두리: 카드는 테두리 없이 그림자만. 입력과 보조 버튼은 2px `border`. 드롭 영역은 2px 점선 `border`.
- 그림자 두 단계만: `shadow-card` `0 8px 30px rgba(120,70,20,.07)`, `shadow-primary` `0 6px 16px rgba(79,70,229,.25)` (주 버튼). 다른 그림자는 쓰지 않는다. 헤더는 그림자 없이 바탕색 위에 알약 내비만 흰색으로 띄운다.
- 버튼 높이: 기본 44px, 작은 것 36px, 히어로 CTA 48px. 아이콘은 lucide 18px.
- 간격: 섹션 사이 64px(모바일 48px), 카드 안 24px, 목록 행 12px 세로.

### 5.5 움직임

- framer-motion은 유지하되 세 군데에만 쓴다: 드롭 영역에 파일을 끌어올 때의 강조, 결과(리포트·변환 결과)가 나타날 때의 짧은 페이드-업, 시트·메뉴 열림(Radix가 처리). 그 밖의 hover 효과는 CSS transition 150ms.
- `prefers-reduced-motion`이면 전부 끈다.
- 지금의 `hover:-translate-y-1`, 그라데이션 덮개, `backdrop-blur`는 모두 제거한다.

### 5.6 아이콘

lucide-react 유지. 홈의 단계·도구 카드와 리포트 여섯 항목에는 파스텔 타일 위에 아이콘을 놓는다. 이모지는 쓰지 않는다 (목업에서는 자리표시였다).

## 6. 컴포넌트 체계

### 6.1 설치

- `npx shadcn@latest init`을 Tailwind 3.4 설정으로 실행해 `components.json`을 만든다. `baseColor`는 neutral, CSS 변수 사용. 생성된 변수 값을 5.2의 토큰으로 바꾼다.
- 기존 `src/components/ui/button.tsx`와 `card.tsx`는 Tailwind 4 템플릿으로 생성된 것이라(`shadow-xs`, `@container` 등) Tailwind 3에서 일부 클래스가 안 먹는다. 둘 다 CLI로 다시 생성해 덮어쓴다.
- `@radix-ui/react-slot`이 `button.tsx`에서 쓰이지만 `package.json`에 없다. 설치한다.
- 미사용 의존성 `next-international`, `next-intl`, `src/i18n`은 정리 단계(10절 Phase 5)에서 제거한다.

### 6.2 들여올 shadcn 컴포넌트와 쓰임

| 컴포넌트 | 쓰임 |
|---|---|
| Button | 모든 버튼. variant: `primary`(남보라, 그림자), `secondary`(흰 바탕 2px 테두리), `ghost`, `link`, `destructive`. size: `sm` 36, `md` 44, `lg` 48, `icon` |
| Card | 카드, 패널. 테두리 없이 `shadow-card` |
| Badge | 상태 배지 `found`/`clean`, 중립 칩 |
| Tabs | PDF 병합·분할의 탭(기존 `role="tab"` 유지) |
| Select | `CustomDropdown` 대체 (이미지 변환기의 출력 형식, 품질 프리셋) |
| NativeSelect (스타일 입힌 `<select>`) | 이미지 편집기의 Export "Format". E2E가 `selectOption`을 쓰므로 네이티브 `<select>`여야 한다. Radix Select나 Tabs로 바꾸지 않는다 |
| Sheet | 모바일 내비게이션 |
| DropdownMenu | 데스크톱 "Tools" 메뉴 (hover 타이머 손코드 제거) |
| Tooltip | 아이콘 버튼 설명 (회전·반전·실행취소) |
| Progress | 변환 진행 막대 |
| Accordion | FAQ |
| Separator, Skeleton, Checkbox, Input, Label, Slider | 패널 내부 |
| Sonner (toast) | "다운로드 시작", "ZIP 준비됨" 같은 짧은 알림. 결과 자체는 toast로 대체하지 않는다 |

### 6.3 사이트 전용 합성 컴포넌트 (`src/components/site/`, `src/components/tool/`)

- `SiteHeader`: 로고(남보라 둥근 마크 + 워드마크), 알약 내비(Tools 메뉴, Guides, FAQ, About), 오른쪽 언어 전환 + 주 CTA "Check a photo"(한국어 "사진 확인하기"). 모바일은 햄버거 → Sheet. `Navigation.tsx`를 대체하되 `locale`, `KO_PATHS` 기반 언어 전환 로직은 그대로 옮긴다.
- `SiteFooter`: 토큰만 바꾼다.
- `ConsentBanner`: `ConsentManager`의 마크업만 새 토큰으로. 동작과 `role`, 버튼 이름("Reject", "거부")은 유지.
- `PageContainer`: 최대 폭 1120px, 좌우 24px(모바일 16px).
- `ToolPageHeader`: 브레드크럼, 아이콘 타일 + H1 + 한 줄 설명, 형식 칩(받아들이는 형식, 용량·개수 한도, "Nothing uploaded" 초록 칩). 다섯 도구가 모두 이것으로 시작한다.
- `DropZone`: 흰 카드 안 점선 영역, 아이콘 타일, 제목, 보조문, 버튼. 끌어올 때 강조. 숨은 `<input type=file>`의 `aria-label`은 기존 문구 유지.
- `FileList` / `FileRow`: 썸네일 52px, 이름, 메타(크기·픽셀, tabular-nums), 오른쪽 배지나 동작. 선택된 행은 `primary-soft` 배경 + `ring` 2px 외곽선. 순서 바꾸기는 기존 @dnd-kit 유지.
- `ReportPanel` + `ReportRow` + `StatusBadge`: EXIF 리포트. 행마다 36px 파스텔 타일 아이콘(발견=노랑, 없음=초록), 항목 이름, 값, 배지. 값은 실제 값(좌표, 시각, 기기명)을 그대로 보여준다. 홈의 샘플 리포트 카드도 같은 부품으로 그린다.
- `FormatSegment`: 알약 모양으로 붙여 놓은 **버튼 묶음**이다. 선택 상태가 없다. EXIF 뷰어의 "Remove it now"를 누르면 펼쳐지고(`aria-expanded` 유지), 그 안의 형식 버튼("Clean copy as JPG" 등) 하나를 누르면 지금처럼 **그 자리에서 바로** 깨끗한 사본이 내려간다. 2단계(고르고 나서 다른 버튼으로 실행)로 바꾸지 않는다. 기존 `role="group"`, `aria-label="Save the clean copy as"`, 버튼 이름, "Shrink the long side to 2048 px" 체크는 유지한다. 첫 번째 버튼(원본 형식)만 남보라 채움으로 강조해 "이걸 누르면 된다"를 보여준다. 목업의 세그먼트 컨트롤 모양은 이 버튼 묶음의 시각 표현일 뿐이다.
- `ActionBar`: 패널 하단의 주 버튼 + 보조 버튼 + 한 줄 안내. 모바일에서는 화면 하단에 고정하되, **동의 배너가 열려 있는 동안에는 고정하지 않고 패널 안에 그대로 둔다** (배너가 버튼을 덮는 일이 없게). 동의 상태는 `ConsentManager`가 이미 `localStorage`로 알고 있으므로 작은 컨텍스트나 훅으로 "배너 열림" 하나만 공유한다. 두 컴포넌트가 서로의 높이를 알 필요는 없다.
- `AdSlot`: 점선 테두리 없는 빈 예약 영역. `AdSense`가 `null`을 반환하는 동안 높이 0으로 접힌다. 템플릿의 정해진 자리에만 둔다.
- `Prose`: 콘텐츠 페이지와 도구 아래 설명 article의 본문 스타일 (h2 아이콘 타일, 목록, 표, 인용). Tailwind typography 플러그인 대신 직접 정의한다.
- `StepCard`, `ToolCard`, `TaskCard`, `RevealItem`: 홈 전용 카드들.
- `HeroStage`: 홈 히어로 오른쪽의 기울어진 사진 카드 + 말풍선 3개. 말풍선 내용은 `src/data/exif-demo.json`의 실제 값에서 가져온다.

### 6.4 제거

`ThemeToggle.tsx`, `CustomDropdown.tsx`, `Navigation.tsx`의 수작업 드롭다운과 타이머, `globals.css`의 `bg-white` 강제, `tailwind.config.js`의 `brand` 팔레트(토큰으로 대체), 그라데이션·블러·`shadow-lg`·`shadow-xl`·`hover:-translate-y-1`의 모든 사용.

## 7. 화면별 설계

### 7.1 공통 셸

- 헤더 72px, 바탕색과 같은 색, 아래 테두리 없음. 스크롤해도 고정(sticky), 블러 없음.
- 본문 위 여백: 헤더 아래 24px. 지금의 `pt-8` 래퍼는 없앤다.
- 푸터: 위 여백 72px, 한 줄 저작권 + 링크. 테두리 없음.
- 동의 배너: 아래 16px 띄운 흰 카드, 24px 모서리, `shadow-card`. 모바일에서 세로 쌓임. **다시 열기는 떠 있는 알약 대신 푸터의 링크 버튼("Privacy choices" / 기존 한국어 문구)으로 옮긴다.** 떠 있는 알약은 모바일 하단 고정 `ActionBar`와 자리를 다투기 때문이다.

### 7.2 홈 (`/`, `/ko/`)

순서대로:

1. **히어로** (lg 이상 두 단, 아래로는 한 단): 왼쪽에 살구색 알약 라벨("Free · private · right in your browser"), H1 (문구 유지: "Check what a photo reveals before you share it" / 한국어 기존 H1 유지), 한 문단, 주 CTA "Check a photo" + 보조 "Try the sample", 그 아래 작은 점 세 개(Nothing is uploaded · No sign-up · Clean copy in one tap). 오른쪽 `HeroStage`.
2. **드롭 카드** (`HomePhotoDrop`를 `DropZone`으로 다시 그림, 핸드오프 동작 유지).
3. **샘플 리포트 카드** "Here's what we check": 왼쪽 사진 영역, 오른쪽 `ReportPanel`에 `exif-demo.json`의 여섯 항목. 하단에 "Remove it now"(→ `/view/exif/?sample=1`)와 "Check another".
4. **세 단계** `StepCard` × 3 (Check, Clean, Share), 가운데 정렬, 64px 타일.
5. **도구 네 장** `ToolCard` × 4.
6. **기존 콘텐츠 섹션** 유지: "Tested, not assumed" 표, "What a photo can say about you" 여섯 항목(`RevealItem`), "Common tasks"(`TaskCard`), "What removing metadata does not do", 벤치마크 표, 가이드 안내. 모두 `Prose`와 새 카드로 다시 그리되 문장은 그대로.

한국어 홈도 같은 구성이며 문구는 지금 한국어판을 쓴다.

### 7.3 도구 화면 템플릿 (다섯 도구 공통)

위에서 아래로, 순서는 바꾸지 않는다:

1. `ToolPageHeader`
2. **작업 영역**: lg 이상에서 2단 그리드 (왼쪽 1fr, 오른쪽 400px 패널, 패널은 `sticky top-24`). 모바일은 세로로 쌓고 패널의 `ActionBar`는 하단 고정.
   - 파일이 없을 때: 왼쪽 자리에 `DropZone`이 전체 폭으로 오고 패널은 숨긴다.
3. **결과 영역**: 변환 결과 목록, 다운로드, ZIP. 결과가 생기면 작업 영역 아래에 카드로 나타난다 (페이드-업).
4. `AdSlot` (승인 전까지 0 높이)
5. **설명 article** (`Prose`): 지금 각 페이지의 설명 콘텐츠 그대로.

도구별 작업 영역:

- **EXIF Viewer** (`/view/exif/`, `/ko/view/exif/`): 왼쪽 `FileList`(사진 ≤30, 행마다 "N found"/"Clean" 배지, 아래 "Drop more photos here"), 헤더에 "Add more"와 "Remove from all". 오른쪽 `ReportPanel`(선택된 사진) + "Remove it now" 섹션(`FormatSegment` + "Shrink the long side to 2048 px" 체크 + 주 버튼). 지운 뒤의 finish card(Share, Download again, Another format, Check another)와 인앱 브라우저 길게 누르기 안내는 패널 안에서 상태만 바뀐다.
- **Image Converter** (`/convert/img/`): 왼쪽 `FileList`(순서 바꾸기 유지, 격자/목록 보기 토글), 오른쪽 패널에 출력 형식(`Select`), 품질·목표 크기, "Convert" 주 버튼, 진행 `Progress`. 결과 카드에 개별 다운로드와 ZIP.
- **PDF to Image** (`/convert/pdf/`): 왼쪽에 페이지 썸네일 그리드, 오른쪽 패널에 PNG/JPG 선택과 "Convert" 버튼.
- **Image Editor** (`/edit/image/`): 왼쪽에 큰 미리보기 캔버스(상단에 Undo/Redo/Reset/Replace 아이콘 버튼 + Tooltip), 오른쪽 패널에 Resize / Rotate & flip / Export 세 묶음(`Separator`로 구분). 회전과 반전 버튼은 같은 모양 규칙(AGENTS.md).
- **Merge & Split PDF** (`/edit/pdf/`): 상단 `Tabs`(Merge a PDF / Split a PDF, 기존 탭 이름 유지), 왼쪽 파일 목록(위/아래 이동 버튼 이름 유지), 오른쪽 패널에 페이지 범위 입력과 주 버튼.

`MetadataRemovalNotice`(`?from=exif` 배너)는 `ToolPageHeader` 바로 아래 살구색 알림 카드로 그린다.

### 7.4 콘텐츠 페이지

`/guides/*`, `/faq/`, `/how-to-use/`, `/about/`, `/contact/`, `/changelog/`, `/privacy-policy/`, `/terms/`, `/page-not-found/`, `/ko/guides/*`.

- 페이지 머리: 라벨(살구 알약, 예: "Guide"), H1, 한 줄, 날짜나 읽는 시간이 있으면 보조 글자.
- 본문은 `Prose` 최대 폭 720px. 표와 그림은 본문 폭을 넘어 880px까지 허용.
- FAQ는 `Accordion`. 가이드 목록은 `ToolCard`와 같은 카드.
- 404는 같은 셸에 H1과 도구 네 장.

### 7.5 모바일 (375px 기준)

- 헤더: 로고, 언어 전환, 햄버거. CTA는 Sheet 안으로.
- 히어로 한 단, `HeroStage`는 H1 아래로 내려오며 높이 260px.
- 도구 화면은 세로. 패널의 주 버튼은 하단 고정 `ActionBar`(흰 카드, `shadow-card`, 안전 영역 패딩). 고정 바가 결과나 목록 마지막 항목을 가리지 않도록 본문 아래에 바 높이만큼 여백. 동의 배너가 열려 있으면 고정하지 않는다 (6.3절).
- 세로 쌓기 순서는 템플릿의 prop(`panelFirstOnMobile`)으로 도구마다 정한다. **EXIF 뷰어는 패널(선택한 사진의 리포트)이 목록 위에 온다.** 이 도구의 결과물은 리포트이고 목록은 최대 30행이라 아래로 밀리면 못 본다. 목록에서 다른 행을 누르면 패널로 스크롤해 올린다. 나머지 네 도구는 작업 영역이 위, 패널이 아래다.
- 터치 목표 44px 이상.

## 8. 접근성과 품질 기준

- 글자 대비 4.5:1 이상 (큰 글자 3:1). 5.2의 색으로 확인했고, 빌더는 구현 뒤 자동 검사(Lighthouse 또는 axe)로 다시 확인한다.
- 포커스 링은 `ring` 색 2px, offset 2px. 마우스 클릭에는 보이지 않게(`focus-visible`).
- 모든 아이콘 전용 버튼에 접근 가능한 이름. 기존 이름 유지 (9절).
- `prefers-reduced-motion` 존중.
- 두 레이아웃의 `viewport.maximumScale: 1`을 **제거한다.** 확대를 막는 것은 Lighthouse·axe의 `meta-viewport` 감사 실패 사유이고 접근성 95 목표와 양립하지 않는다. iOS에서 입력에 초점이 갈 때 자동 확대되는 것은 입력 글자 크기를 16px 이상으로 두어 막는다.
- Lighthouse 성능 점수가 지금보다 떨어지지 않게. 글꼴 추가가 LCP에 주는 영향은 `next/font`의 셀프 호스팅과 `swap`으로 흡수한다. 모바일 LCP 2.5초 이내.

## 9. 바꾸면 안 되는 것

- URL, 메타데이터(`title`, `description`, `alternates`, Open Graph), JSON-LD, 사이트맵, 피드. (`viewport`의 `maximumScale`만 예외, 8절.)
- 버튼 이름을 바꾸면 그 이름을 인용하는 문구도 함께 고친다. 예: 한국어 `MetadataRemovalNotice`는 이미지 변환기의 "Select Images", "Convert All" 버튼명을 그대로 인용한다.
- `SiteHead`의 Consent Mode 기본값, GA·AdSense 스크립트, 검증 메타 태그.
- `KO_PATHS`와 언어 전환 동작, `?lang=ko`·`?from=exif`·`?handoff=1`·`?sample=1` 쿼리 동작.
- E2E가 매칭하는 문구와 역할. 전부는 `tests/e2e/*.spec.ts`를 보면 되고 핵심은 다음이다.
  - H1: "Check what a photo reveals before you share it", "보내기 전에, 사진에 뭐가 남아 있는지 보세요", "EXIF viewer", "EXIF 뷰어", "Image Converter", "PDF to Image Converter", "Edit an image in your browser", "Merge and split PDF files"
  - 버튼: "Remove it now", "바로 지우기", "Remove from all", "Check another", "Try a sample photo", "샘플 사진으로 해보기", "Export image", "Extract pages", "Merge PDFs", "Merge 2 PDFs", "Split into 3 files", "Undo", "Redo", "Reset", "Right 90°", "Flip horizontally", "Flip vertically", "Move b.pdf up", "Reject", "거부", "Clean copy as JPG/WebP", "PNG로 받기"
  - 라벨: "Choose photos to check", "확인할 사진 선택", "Choose a JPG, PNG, or WebP image", "Choose a JPG, PNG, or WebP photo", "Choose PDF files to merge", "Choose a PDF to split", "Width (px)", "Height (px)", "Format", "JPEG background color value", "Replace image", "Edited image preview", "Shrink the long side to 2048 px (smaller file)", "Pages (1–3)", "Every page as its own PDF", group "Save the clean copy as", tab "Split a PDF"
  - 상태 문구: "The clean copy was checked again: no identifying information found.", "All 2 clean copies were checked again: …", "2 photos · 2 carry identifying information", "No identifying metadata found in this file.", "Cleaned", "Output: 400 × 300px" 류, "2 files · 5 pages", "5 pages from 2 files", "This PDF is password-protected or encrypted", "Add at least two readable PDFs."
- 처리 로직 파일과 reducer 액션. 컴포넌트는 표현만 바꾼다.
- 콘텐츠 분량과 측정 수치(`src/data/*.json`에서 읽는 값).

## 10. 단계

각 단계는 그 자체로 배포할 수 있어야 한다. 중간 상태에서 옛 스타일과 새 스타일이 한 사이트에 섞여 보이는 것은 허용한다 (토큰이 먼저 들어가므로 옛 화면도 바탕색과 글꼴은 새것을 입는다).

- **Phase 0 기반**: 토큰(`globals.css`, `tailwind.config.js`), 글꼴, shadcn 설치와 `button`·`card` 재생성, `PageContainer`, `SiteHeader`(+Sheet, DropdownMenu), `SiteFooter`, `ConsentBanner`, 404. `ThemeToggle` 제거. 완료 기준: 모든 페이지가 새 셸 안에 뜨고 E2E 전부 통과.
- **Phase 1 홈**: 영문·한국어 홈, `HeroStage`, `DropZone`, `ReportPanel`(홈용), 카드들. 완료 기준: 홈 두 언어 E2E 통과, 모바일 375px 확인.
- **Phase 2 EXIF 뷰어**: `ToolPageHeader`, `FileList`, `ReportPanel`(도구용), `FormatSegment`, `ActionBar`, `AdSlot`, `Prose`로 영문·한국어 뷰어. 이 단계에서 도구 템플릿이 확정된다. 완료 기준: `exif-viewer.spec.ts`, `korean.spec.ts` 통과, 30장 올렸을 때 폰에서 쓸 수 있음.
- **Phase 3 나머지 도구**: Image Converter(`CustomDropdown` → `Select`), PDF to Image, Image Editor, Merge & Split. 완료 기준: `editor.spec.ts`, `pdf-organizer.spec.ts` 통과, 각 도구 수동 점검(AGENTS.md의 편집기 검증 절차 포함).
- **Phase 4 콘텐츠 페이지**: `Prose`, `Accordion` FAQ, 가이드 목록·본문, 나머지 정적 페이지.
- **Phase 5 정리**: 죽은 코드와 의존성 제거(`next-intl`, `next-international`, `src/i18n`, `CustomDropdown`, `brand` 팔레트), CLAUDE.md의 "Design System" 절을 새 토큰과 컴포넌트 목록으로 갱신, Lighthouse 비교, `production.spec.ts`로 배포 확인.

## 11. 검증

- 매 단계: `npx tsc --noEmit`, `npx eslint .`, `npm run build`(+ `out/` 존재), `npm run test:e2e`.
- 시각: 데스크톱 1280과 모바일 375에서 모든 도구의 빈 상태·작업 상태·결과 상태 스크린샷. 한국어 페이지 글꼴 적용 확인.
- 접근성: Lighthouse 접근성 95 이상, 키보드만으로 EXIF 뷰어 전체 흐름(올리기 → 지우기 → 다운로드) 완료.
- 성능: 홈·EXIF 뷰어 모바일 Lighthouse 성능이 리뉴얼 전과 같거나 높음. 첫 로드 JS가 리뉴얼 전보다 20% 이상 늘지 않음.
- 배포 후: CLAUDE.md의 절차대로 Cloudflare Pages 배포 확인 후 실제 도메인 curl, `npm run test:production`.

## 12. 빌더에게 맡기는 것

- 토큰의 HSL 변환 값과 Tailwind 이름 짓기.
- 컴포넌트 파일 분할과 디렉터리 구성 세부.
- 각 도구 컴포넌트를 템플릿으로 옮길 때 내부 상태 관리 코드를 어떻게 쪼갤지 (reducer와 액션은 유지).
- 썸네일 생성, 가상 스크롤 등 30장 목록의 성능 처리 방식.
- Sonner 알림을 어디에 쓰고 어디에 쓰지 않을지 (결과는 항상 화면에 남아야 한다).
- Phase 안의 커밋 단위.

## 13. 설계자가 정한 것 (사용자가 직접 고르지 않은 결정)

사용자가 고른 것은 접근 1번, 방향 B 전부, 포인트 색 남보라, 세 가지다. 나머지는 설계자의 판단이며 검토 때 뒤집어도 된다.

1. **H1과 테스트 문구는 유지한다.** B 목업의 "Your photo may be saying more than you think"는 검색 순위를 받치는 키워드가 빠지고 E2E도 깨지므로 쓰지 않는다. 부드러운 말투는 라벨, 보조 문장, 빈 상태, 안내 문구에서만 낸다.
2. **이모지 대신 lucide 아이콘을 파스텔 타일 위에 쓴다.** 플랫폼마다 모양이 다른 이모지는 피한다.
3. **리포트 값은 실제 값을 그대로 보여준다.** 홈의 샘플 카드도 좌표와 시각을 그대로 쓴다. "Central Seoul"처럼 풀어 쓰면 사용자가 자기 사진에서 무엇을 보게 될지 알 수 없다.
4. **글꼴은 Plus Jakarta Sans(영문)와 Pretendard(한국어).** Inter를 버린다.
5. **다크 모드는 뺀다.**
6. **Tailwind 3.4 유지, Tailwind 4 업그레이드 안 함.**
7. **광고 자리는 템플릿에 한 곳(작업 영역과 설명 사이)만 예약한다.** 승인 뒤 추가 위치는 별도 결정.
8. **framer-motion은 유지하되 세 군데로 제한한다.**
9. **단계는 홈 → EXIF 뷰어 → 나머지 도구 → 콘텐츠 순.** 사이트의 중심이 EXIF 뷰어이므로 템플릿을 거기서 확정한다.

빌더 검토(설계 문서만 읽은 엔지니어의 질문) 뒤에 추가로 정한 것:

10. **EXIF 뷰어의 "Remove it now"는 지금처럼 한 번 누르면 바로 내려받는다.** 형식 버튼 묶음은 선택 상태가 없다. 목업의 세그먼트 모양 때문에 2단계로 읽힐 수 있어 6.3절에 못 박았다.
11. **이미지 편집기의 Export "Format"은 네이티브 `<select>`를 유지한다.** E2E가 `selectOption`을 쓴다. 스타일만 입힌다.
12. **동의 배너가 열려 있으면 모바일 `ActionBar`를 고정하지 않고, 배너 다시 열기 버튼은 푸터로 옮긴다.** 하단 고정 요소 셋이 한 자리를 다투던 문제의 해법이다.
13. **EXIF 뷰어 모바일에서는 리포트 패널이 목록 위에 온다.** 템플릿은 도구별로 순서를 정할 수 있는 prop을 가진다.
14. **`viewport.maximumScale: 1`을 제거한다.** 접근성 감사 실패 사유이고, iOS 입력 확대는 16px 입력으로 막는다.
