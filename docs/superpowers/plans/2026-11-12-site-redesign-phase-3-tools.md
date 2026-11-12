# 사이트 리뉴얼 Phase 3 구현 계획: 나머지 네 도구

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Image Converter, PDF to Image, Image Editor, Merge & Split PDF 네 도구 화면과 그 페이지를 Phase 2에서 확정한 도구 템플릿(ToolPageHeader → 작업 영역 → 결과 → AdSlot → Prose)으로 다시 그린다.

**Architecture:** 각 도구 컴포넌트는 상태·처리 로직·reducer 액션을 그대로 두고 렌더 트리만 `src/components/tool/*`과 `src/components/ui/*`로 바꾼다. 컴포넌트가 `PageContainer`와 `ToolPageHeader`까지 그리고(EXIF 뷰어와 같은 방식), 페이지는 `MetadataRemovalNotice`를 `notice` prop으로 넘긴 뒤 아래에 `AdSlot`과 `Prose` 설명을 둔다. 새 프리미티브는 처음 필요한 작업에서 만든다: `Select`·`Progress`(Task 2), `Tabs`(Task 5).

**Tech Stack:** Next.js 14.2 static export, React 18, Tailwind 3.4, shadcn/ui (Radix), framer-motion 12, lucide-react, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-12-site-redesign-design.md` (이하 "설계"), 특히 7.3절(도구 템플릿과 도구별 작업 영역), 7.5절(모바일), 9절(불변 목록), 10절 Phase 3.

## Global Constraints

- 설계 9절의 문구·역할·라벨을 바꾸지 않는다. 이 단계에서 특히: H1 "Image Converter", "PDF to Image Converter", "Edit an image in your browser", "Merge and split PDF files"; 버튼 "Export image", "Extract pages", "Merge PDFs", "Merge 2 PDFs", "Split into 3 files", "Undo", "Redo", "Reset", "Right 90°", "Flip horizontally", "Flip vertically", "Move b.pdf up"; 라벨 "Choose a JPG, PNG, or WebP image", "Choose PDF files to merge", "Choose a PDF to split", "Width (px)", "Height (px)", "Format", "JPEG background color value", "Replace image", "Edited image preview", "Pages (1–3)", "Every page as its own PDF"; tab "Split a PDF"; 상태 문구 "Output: 400 × 300px" 류, "2 files · 5 pages", "5 pages from 2 files", "This PDF is password-protected or encrypted", "Add at least two readable PDFs."; `data-metadata-notice`.
- 한국어 `MetadataRemovalNotice`가 인용하는 변환기 버튼명 "Select Images", "Convert All"을 유지한다(설계 9절).
- 처리 로직은 손대지 않는다: `src/lib/*`, `public/workers/*`, `src/data/*.json`, `SiteHead.tsx`, 각 컴포넌트의 핸들러·reducer·state 훅. URL, 메타데이터, JSON-LD도 그대로.
- 편집기는 변환기와 분리 유지(AGENTS.md). 반전 버튼은 회전 버튼과 같은 모양 규칙이고 눌린 상태 색을 따로 두지 않는다. 형식 선택은 네이티브 `<select>` 유지(설계 7.3).
- 새 화면에는 토큰 클래스만: `gray-*`, `brand-*`, `red-*`, `green-*`, `amber-*`, `black`, `white` 같은 팔레트 클래스 금지. 그림자는 `shadow-soft`, `shadow-cta`만. `hover:-translate-y-*`, `backdrop-blur` 금지.
- 모바일(<1024px): 작업 영역이 위, 패널이 아래(`panelFirstOnMobile` 끔). 패널의 주 버튼은 `ActionBar`로 감싼다.
- 모션은 `useReducedMotion`이 참이면 일반 요소로 그린다(인라인 style 없음).
- `/ko/` 밖 사용자 문구는 영어.
- 게이트: 작업마다 `npx tsc --noEmit`(ESLint는 설치돼 있지 않음 — Phase 0–2 ruling 유지)와 해당 spec 파일. 개발 서버가 `.next`를 쓰는 동안 `npm run build`를 돌리지 않는다.
- 커밋은 작업마다, 명시한 경로만 스테이징(`git add --all` 금지: `AGENTS.md`, `.claude/`, `IMAGE_EDITOR_HANDOFF.md`, `dev-server.*.log`는 커밋하지 않는다). 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. push·merge·deploy 하지 않는다.

## Review Focus

1. **한국어 안내가 인용하는 버튼명**: `?lang=ko&from=exif`로 변환기에 오면 안내문이 "Select Images", "Convert All"을 말한다. 두 이름의 버튼이 실제로 있어야 한다. → Task 2 테스트.
2. **375px 폰에서 네 도구**: 가로 넘침이 없고, 작업 영역이 패널보다 위에 있다. → Task 2–5가 `tools-design.spec.ts`에 각자 케이스를 추가.
3. **키보드 사용자**: 변환기 출력 형식 `Select`를 키보드로 열고 고를 수 있어야 하고, Merge & Split 탭은 화살표 키로 옮겨진다. → Task 2, Task 5.
4. **이미지 → PDF 모드**: 출력을 PDF로 바꾸면 패널 주 버튼이 "Convert to PDF (N images)"가 되고, 순서 바꾸기 중엔 비활성. → Task 2.
5. **동의 배너가 열린 폰**: 도구 페이지에서도 `ActionBar`가 배너 위에 고정되지 않는다. → Task 2(변환기로 대표 확인).

---

## 파일 구조

```
src/components/ui/select.tsx           (새) shadcn Select, rounded-field 토큰
src/components/ui/progress.tsx         (새) role=progressbar 막대, Radix 없이
src/components/ui/tabs.tsx             (새) shadcn Tabs (@radix-ui/react-tabs 설치)
src/components/MetadataRemovalNotice.tsx   살구색 알림 카드로 재스타일 (문구·동작 그대로)
src/components/ImageConverter.tsx      렌더 트리 교체, `notice?: ReactNode` prop
src/components/image-converter/FileList.tsx, SortableItem.tsx   토큰으로 재스타일 (dnd 그대로)
src/components/PDFConverter.tsx        렌더 트리 교체
src/components/ImageEditor.tsx         렌더 트리 교체, `notice?: ReactNode` prop
src/components/PdfOrganizer.tsx        렌더 트리 교체, Tabs
src/app/(en)/convert/img/page.tsx, convert/pdf/page.tsx, edit/image/page.tsx, edit/pdf/page.tsx
                                       <main> → 컴포넌트 → PageContainer(AdSlot + Prose article)
tests/e2e/converter.spec.ts            (새) 변환기 특성 테스트 + 디자인 테스트
tests/e2e/pdf-converter.spec.ts        (새) PDF→이미지 특성 테스트
tests/e2e/tools-design.spec.ts         (새) 네 도구 공통: 팔레트 클래스 없음, 375px 넘침 없음, 작업 영역이 패널 위
```

공통 테스트 헬퍼(`rejectOptionalCookies`, PNG/PDF 픽스처 생성)는 각 spec 파일에 둔다(기존 spec들과 같은 방식).

---

### Task 1: 변환기와 PDF 변환기 특성 테스트

두 도구는 지금 동작을 지키는 E2E가 없다. 렌더 트리를 갈아엎기 전에 현재 동작을 고정한다. 이 작업의 테스트는 **지금 코드에서 통과해야** 한다(특성 테스트). 이후 작업에서 바뀌면 안 되는 사용자 동작만 확인하고, 형식 드롭다운은 건드리지 않는다(기본값 PNG→WEBP).

**Files:**
- Create: `tests/e2e/converter.spec.ts`, `tests/e2e/pdf-converter.spec.ts`

- [ ] **Step 1: 테스트 작성**
  - `converter.spec.ts` › `"converts two PNGs to WebP and downloads them together"`: 64×48 PNG 2장을 `page.locator('input[type=file]').first().setInputFiles(...)` → 두 파일 이름이 보임 → `getByRole("button", { name: "Convert All" })` 클릭 → `getByRole("button", { name: "Download All" })` 보임 → 클릭 시 download의 `suggestedFilename()`이 `"BravoConvert.zip"`, JSZip으로 열면 `.webp` 파일 2개.
  - `converter.spec.ts` › `"names the Select Images and Convert All buttons the Korean notice quotes"`: `/convert/img/?from=exif&lang=ko` → `[data-metadata-notice]`에 "Select Images"와 "Convert All" 글자 → "Select Images" 이름의 클릭 가능한 요소가 있고(`getByText("Select Images", { exact: true })` 보임), PNG 1장 추가 후 `getByRole("button", { name: "Convert All" })` 보임.
  - `pdf-converter.spec.ts` › `"renders each page of a PDF and downloads them all"`: pdf-lib로 2쪽 PDF(폭 500·600) 생성 → `/convert/pdf/` → "Loading the converter…"가 사라질 때까지 대기 → `input[type=file]`에 넣음 → `getByRole("button", { name: "Convert to Images" })` 클릭 → `getByText("Converted Pages (2)")` 보임 → "Download All" 클릭 → zip 안에 `.png` 2개 → 첫 번째 개별 `getByRole("button", { name: "Download", exact: true })` 클릭 시 `.png` 다운로드.
- [ ] **Step 2: 실행** — Run: `npx playwright test tests/e2e/converter.spec.ts tests/e2e/pdf-converter.spec.ts` / Expected: 3 passed (현재 코드 그대로). 실패하면 테스트가 현재 동작을 잘못 적은 것이니 테스트를 고친다.
- [ ] **Step 3: 커밋** — `git add tests/e2e/converter.spec.ts tests/e2e/pdf-converter.spec.ts` → `test(e2e): pin image and PDF converter behaviour before the redesign`

---

### Task 2: Image Converter

**Files:**
- Create: `src/components/ui/select.tsx`, `src/components/ui/progress.tsx`, `tests/e2e/tools-design.spec.ts`
- Modify: `src/components/ImageConverter.tsx` (렌더 부분, 약 889행 이후), `src/components/image-converter/FileList.tsx`, `src/components/image-converter/SortableItem.tsx`, `src/components/MetadataRemovalNotice.tsx`, `src/app/(en)/convert/img/page.tsx`, `tests/e2e/converter.spec.ts`

**Interfaces:**
- Produces: `Select, SelectTrigger, SelectValue, SelectContent, SelectItem` (shadcn 표준 이름, `@radix-ui/react-select` — 이미 설치됨). Trigger는 `h-11 rounded-field bg-card shadow-soft`, Content는 `rounded-field`.
- Produces: `Progress({ value, label }: { value: number; label: string })` — `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label={label}`, 막대 `bg-primary`, 바탕 `bg-muted`, `rounded-full h-2`.
- Produces: `ImageConverter({ notice }: { notice?: ReactNode })`, `ImageEditor`도 Task 4에서 같은 prop.
- Produces: `MetadataRemovalNotice` — 마크업 `aside[data-metadata-notice]`, `lang`, 문구, 링크 그대로. 클래스만 아래 결정대로.
- Produces: `tests/e2e/tools-design.spec.ts`의 헬퍼 `expectRedesigned(page, url, setup?)`: (a) `document.querySelectorAll('[class*="gray-"],[class*="brand-"],[class*="bg-white"],[class*="text-black"]')`가 0개, (b) 375×812에서 `document.documentElement.scrollWidth <= 375`, (c) `[data-tool-panel]`이 있으면 `[data-tool-main]`의 top이 패널 top보다 작다.

살구색 결정: 설계 7.3은 "살구색 알림 카드"라고 쓰지만 5절 토큰엔 살구색 토큰이 따로 없고 주황(`status-found`)은 "발견" 전용이다. 홈 히어로의 살구 알약(Phase 2에서 `bg-muted`로 정리)과 같은 이유로, 알림 카드는 `bg-muted text-foreground` 바탕에 `IconTile`(tone "blue", size "sm")의 방패 아이콘을 쓴다. 이 결정은 Task 2 첫 ruling으로 ledger에 남긴다.

- [ ] **Step 1: 실패하는 테스트 작성**
  - `tools-design.spec.ts` › `"Image Converter uses the redesigned template"`: `expectRedesigned(page, "/convert/img/", 파일 2장 추가)`.
  - `converter.spec.ts` › `"output format is a labelled select you can drive with the keyboard"`: PNG 2장 추가 → `getByRole("combobox", { name: "Output format" })` focus → `Enter` → `getByRole("option", { name: "PDF" })`로 `ArrowDown`… 대신 option 클릭 없이 키보드: `press("Enter")`, `press("End")`, `press("Enter")` → combobox 텍스트가 "PDF" → `getByRole("button", { name: "Convert to PDF (2 images)" })` 보임.
  - `converter.spec.ts` › `"the metadata notice sits inside the tool header"`: `/convert/img/?from=exif` → `page.locator("header [data-metadata-notice]")` 보임, 그리고 H1 "Image Converter"보다 아래(boundingBox y).
  - `converter.spec.ts` › `"on a phone with the consent banner open the action bar is not pinned"`: 375×812, 배너를 닫지 않음, PNG 1장 추가 → `[data-action-bar]`의 `data-fixed`가 `"false"`; "Reject" 클릭 후 `"true"`.
  - `converter.spec.ts` › `"progress is reported as a progressbar while converting"`: PNG 3장 → Convert All 클릭 직후 `getByRole("progressbar", { name: "Conversion progress" })`가 나타나거나 이미 "Download All"이 보임(둘 중 하나, `expect.poll`). 짧은 변환이 테스트를 불안정하게 하면 이 테스트는 지우고 ruling으로 남긴다.
- [ ] **Step 2: 실행** — Run: `npx playwright test tests/e2e/converter.spec.ts tests/e2e/tools-design.spec.ts` / Expected: 새 테스트 FAIL(콤보박스 없음, `gray-` 클래스 있음 등), Task 1 테스트는 PASS.
- [ ] **Step 3: 구현**
  - `select.tsx`, `progress.tsx` 작성.
  - `ImageConverter` 반환을 `PageContainer` → `ToolPageHeader`(crumb ["Tools","Image Converter"], title "Image Converter", intro "JPG, PNG and WebP in — WebP, JPG, PNG or PDF out.", icon `ImageIcon`, chips `JPG`, `PNG`, `WebP`, `Up to 10 MB each`, `{ label: "Nothing uploaded", ok: true }`, children `notice`) → 숨은 input → `ToolLayout`. 지금 두 번째 문장(형식 쌍에 따라 바뀌는 문장)은 패널 맨 위 설명으로 옮긴다.
  - 파일 없을 때: `ToolLayout main={DropZone}` + `panel={null}`. DropZone title "Add Images to Convert", note "Drag & drop or paste with Ctrl+V / ⌘V. JPG/JPEG, PNG and WebP, up to 10 MB each.", actions = `Button` "Select Images". 드롭·붙여넣기 핸들러는 기존 것 연결, 클릭으로 열기도 유지.
  - 파일 있을 때 main(`data-tool-main`): `Card` 안에 PDF 모드 순서 안내 + "Reorder"/"Done Reordering"/"Reset Order" (Button secondary sm) + 재스타일한 `FileList`, 아래 "+ Add More"(PDF 모드 아닐 때) 와 오류 alert.
  - panel(`data-tool-panel`): `Card` — "Convert" 묶음: 라벨 "Input format"/"Output format"의 `Select` 두 개(값·dispatch 그대로, `aria-label`이 아닌 `<label htmlFor>` 또는 `aria-labelledby`로 이름을 붙인다), 형식 문장, `Separator`, "Image options" 섹션(Compress 토글 `aria-expanded` 유지, Quality range, Target size (KB) input, "Reset all"; PDF 모드에선 숨김 — 지금과 같다), 개인정보 두 줄(`text-caption text-muted-foreground`), 진행 중이면 `Progress value={progress} label="Conversion progress"`, 그리고 `ActionBar` 안에 상태별 주 버튼 하나: 미변환 있음 → "Convert All"(`Converting... N%`), 전부 변환됨 → "Download All", PDF 모드 → "Convert to PDF (N images)"(reorder 중 비활성).
  - `FileList`/`SortableItem`: 카드 `rounded-field bg-card shadow-soft`, 보조 글자 `text-muted-foreground`, 순번 배지 `bg-primary text-primary-foreground`, "Converted" 상태 `StatusBadge` tone clean, 개별 "Download" `Button size="sm"`, 제거 버튼 `ghost`. 격자/목록 토글은 `Button variant="ghost" size="icon"` + `aria-pressed`. 이름·aria-label·dnd 로직 그대로.
  - `MetadataRemovalNotice` 재스타일(위 결정), 래퍼 여백은 `mt-4`.
  - 페이지: `<main>` → `<ImageConverter notice={<MetadataRemovalNotice tool="converter" />} />` → `<PageContainer className="pb-16"><AdSlot slot="convert-img-below-tool" /><Prose as="article" className="mt-12 space-y-12">…</Prose></PageContainer>`. 설명 h2의 아이콘은 EXIF 페이지처럼 `IconTile size="sm" tone="blue" className="hidden sm:inline-flex"`, 내부 회색 박스는 `rounded-field bg-muted p-5`. 문장은 한 글자도 바꾸지 않는다.
- [ ] **Step 4: 실행** — Run: `npx tsc --noEmit && npx playwright test tests/e2e/converter.spec.ts tests/e2e/tools-design.spec.ts tests/e2e/exif-viewer.spec.ts tests/e2e/korean.spec.ts` / Expected: 모두 PASS(EXIF→변환기 핸드오프, 한국어 안내 포함).
- [ ] **Step 5: 커밋** — 위 Files 경로만 → `feat(design): image converter on the tool template`

---

### Task 3: PDF to Image

**Files:**
- Modify: `src/components/PDFConverter.tsx` (렌더 부분, 약 425행 이후), `src/app/(en)/convert/pdf/page.tsx`, `tests/e2e/pdf-converter.spec.ts`, `tests/e2e/tools-design.spec.ts`

**Interfaces:**
- Consumes: `Progress` (Task 2), `expectRedesigned` (Task 2).

- [ ] **Step 1: 실패하는 테스트 작성**
  - `tools-design.spec.ts` › `"PDF to Image uses the redesigned template"`: `expectRedesigned(page, "/convert/pdf/", PDF 하나 넣고 "Convert to Images"까지)`.
  - `pdf-converter.spec.ts` › `"output format is a two-option radio group"`: PDF 넣은 뒤 `getByRole("radiogroup", { name: "Output format" })` 안에 radio "PNG"(checked)와 "JPG" → "JPG" 클릭 → Convert → 첫 개별 Download가 `.jpg`.
  - `pdf-converter.spec.ts` › `"the heading is in the static HTML before the engine loads"`: `page.request.get("/convert/pdf/")` 본문에 `PDF to Image Converter`와 `<h1`이 있다(지금 주석의 의도를 지키는 테스트, 현재도 PASS일 수 있음 — 그래도 남긴다).
- [ ] **Step 2: 실행** — Run: `npx playwright test tests/e2e/pdf-converter.spec.ts tests/e2e/tools-design.spec.ts -g "PDF"` / Expected: radiogroup·template 테스트 FAIL.
- [ ] **Step 3: 구현**
  - `pageHeader`를 `ToolPageHeader`(crumb ["Tools","PDF to Image"], title "PDF to Image Converter", intro "Convert your PDF files to high-quality images quickly and easily", icon `FileImage`, chips `PDF`, `Up to 50 MB`, `PNG or JPG`, `{ label: "Nothing uploaded", ok: true }`)로. 준비 전 화면도 같은 헤더 + `Card` 안의 로딩 문구(문구 그대로, 스피너는 `text-muted-foreground`, reduced-motion이면 `animate-spin` 대신 정지 아이콘은 쓰지 않아도 됨 — CSS 전역 reduced-motion 규칙이 이미 처리).
  - 파일 없을 때: `DropZone` title "Add PDF Files", note "Supported format: PDF (Max 50MB)", actions `Button` "Select PDF Files". "PDF Engine Ready…" 줄은 `StatusBadge` tone clean 한 줄로.
  - 파일 있을 때 main: `Card` — 파일 이름·크기, 첫 쪽 미리보기(`rounded-field bg-muted`), "Change File"/"Remove"(`secondary sm`). panel: `Card` — 제목 "Output format", `role="radiogroup" aria-label="Output format"` 의 두 선택지(EXIF FormatPicker와 같은 `rounded-field` 버튼 모양, 각 `role="radio" aria-checked`), 짧은 설명(PNG: 글자·도표, JPG: 사진 — 페이지 설명과 같은 사실만), 진행 중 `Progress label="Conversion progress"`, `ActionBar` 안에 "Convert to Images"(`Converting... N%`).
  - 결과(`ToolLayout results`): `Card` — "Converted Pages (N)", "Convert Another PDF"(secondary), "Download All"(primary), 페이지 썸네일 그리드(`grid-cols-2 sm:grid-cols-3`), 각 칸에 "Page N"과 "Download"(`secondary sm`). 페이드-업은 reduced-motion이면 끔.
  - 오류는 `role="alert"` 의 `rounded-field bg-destructive/10 text-destructive` 줄.
  - 페이지: `<div className="min-h-screen bg-white py-8">` 래퍼를 `<main>`으로 바꾸고(지금 이 페이지만 `<main>`이 없다) Task 2와 같은 `PageContainer`/`AdSlot slot="convert-pdf-below-tool"`/`Prose` 구조. 문장 그대로.
- [ ] **Step 4: 실행** — Run: `npx tsc --noEmit && npx playwright test tests/e2e/pdf-converter.spec.ts tests/e2e/tools-design.spec.ts tests/e2e/editor.spec.ts` / Expected: PASS.
- [ ] **Step 5: 커밋** — `feat(design): PDF to image converter on the tool template`

---

### Task 4: Image Editor

**Files:**
- Modify: `src/components/ImageEditor.tsx` (상수 `TOOL_BUTTON`/`PANEL`/`LABEL`/`INPUT`와 349행 이후 렌더), `src/app/(en)/edit/image/page.tsx`, `tests/e2e/editor.spec.ts`, `tests/e2e/tools-design.spec.ts`

**Interfaces:**
- Consumes: `notice` prop 방식(Task 2), `expectRedesigned`.
- Produces: `ImageEditor({ notice }: { notice?: ReactNode })`.

결정: 편집 상태의 별도 머리말("Image Editor" 라벨 + H1 "Make it fit, then save it")은 없애고 두 상태 모두 같은 `ToolPageHeader`(H1 "Edit an image in your browser")를 쓴다. 설계 7.3의 "ToolPageHeader가 항상 맨 위"를 따르기 위해서이고, 이 H1은 9절 목록에 있다. ledger에 ruling으로 남긴다.

- [ ] **Step 1: 실패하는 테스트 작성**
  - `tools-design.spec.ts` › `"Image Editor uses the redesigned template"`: `expectRedesigned(page, "/edit/image/", 이미지 하나 넣기)`.
  - `editor.spec.ts` › `"history and replace are icon buttons with tooltips above the preview"`: 이미지 넣기 → `getByRole("button", { name: "Undo" })`의 boundingBox가 `getByLabel("Edited image preview")`보다 위 → Undo에 hover하면 `getByRole("tooltip", { name: "Undo" })` 보임 → `getByLabel("Replace image")`가 정확히 1개(input)이고 `getByRole("button", { name: "Replace image" })`도 1개.
  - `editor.spec.ts` › `"flip buttons look like the rotate buttons after toggling"`: 이미지 넣기 → "Flip horizontally" 클릭 → 그 버튼과 "Right 90°"의 computed `backgroundColor`·`color`가 같다.
  - `editor.spec.ts` › `"the panel groups are separated"`: 패널(`[data-tool-panel]`) 안에 h2 "Resize", "Rotate & flip", "Export" 순서, 그 사이 `role="separator"`가 2개 이상.
- [ ] **Step 2: 실행** — Run: `npx playwright test tests/e2e/editor.spec.ts tests/e2e/tools-design.spec.ts -g "Editor|editor|flip|panel groups|tooltips"` / Expected: 새 테스트 FAIL, 기존 editor 흐름 테스트 PASS.
- [ ] **Step 3: 구현**
  - 상수 교체: 도구 버튼은 `Button variant="secondary" size="sm"`(회전·반전 공용, 반전도 눌린 색 없음), 라벨 `text-sm font-medium text-foreground`, 입력 `h-11 w-full rounded-field border-2 border-border bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring`(네이티브 `<select>`에도 같은 클래스). 체커 배경 색은 토큰이 아닌 인라인 style이라 `rgb(var(--muted))`/`rgb(var(--border))`로 바꾼다.
  - 빈 상태: `PageContainer` → `ToolPageHeader`(crumb ["Tools","Image Editor"], title "Edit an image in your browser", intro "Resize, rotate, flip, and export JPG, PNG, or WebP files. Your image stays on your device.", icon `ImageIcon`, chips `JPG`, `PNG`, `WebP`, `One image · Up to 10 MB`, `{ label: "Nothing uploaded", ok: true }`, children `notice`) → `DropZone`(title "Drop an image here", note "or paste from your clipboard with Ctrl+V / ⌘V", actions `Button` "Choose image", children = 기존 숨은 input 그대로) → 오류.
  - 편집 상태: 같은 헤더 → 오류 → `ToolLayout`. main(`data-tool-main`): `Card` — 위 막대: 파일명·크기, 그리고 `TooltipProvider` 안의 아이콘 버튼 Undo/Redo/Reset/Replace(`Button variant="ghost" size="icon"`, Undo·Redo는 기존 `aria-label`, Reset은 `aria-label="Reset"`, Replace는 **`aria-label` 없이** `<span className="sr-only">Replace image</span>` — `getByLabel("Replace image")`가 input 하나만 잡게), 확대/축소 묶음. 가운데 캔버스(체커). 아래 막대 "Output: W × Hpx".
  - panel(`data-tool-panel`): `Card` 하나 — h2 "Resize"(비율 잠금 토글 `aria-pressed`, 켜짐 `bg-primary-soft text-primary`), Width/Height, 25/50/75/100% → `Separator` → h2 "Rotate & flip" 네 버튼 → `Separator` → h2 "Export" Format `<select>`, Quality, JPEG 배경, File name, 그리고 `ActionBar` 안 "Export image"(`Exporting…`/`Downloaded`) → 그 아래 `ghost` "Remove image".
  - 페이지: `<main>` → `<ImageEditor notice={<MetadataRemovalNotice tool="editor" />} />` → `PageContainer`/`AdSlot slot="edit-image-below-tool"`/`Prose`. 문장 그대로.
- [ ] **Step 4: 실행** — Run: `npx tsc --noEmit && npx playwright test tests/e2e/editor.spec.ts tests/e2e/tools-design.spec.ts tests/e2e/exif-viewer.spec.ts tests/e2e/korean.spec.ts` / Expected: PASS.
- [ ] **Step 5: AGENTS.md 편집기 검증 5–8 수동 확인** — 1440·390 폭에서 업로드/편집 상태, 비율 잠금, 90/180/270 회전, 두 반전, undo/redo/reset, 교체, JPG/PNG/WebP 내보내기(확장자·크기·방향), 투명 PNG → JPG 배경색. 기존 `editor.spec` 흐름이 대부분을 자동으로 덮고, 스크린샷 두 장(`docs/superpowers/plans/screenshots/phase3/editor-*.png`, gitignore됨)으로 눈 확인. 결과를 ledger에 한 줄.
- [ ] **Step 6: 커밋** — `feat(design): image editor on the tool template`

---

### Task 5: Merge & Split PDF

**Files:**
- Create: `src/components/ui/tabs.tsx` (`npm install @radix-ui/react-tabs`, `package.json`·`package-lock.json` 포함)
- Modify: `src/components/PdfOrganizer.tsx` (상수와 195행 이후 렌더), `src/app/(en)/edit/pdf/page.tsx`, `tests/e2e/pdf-organizer.spec.ts`, `tests/e2e/tools-design.spec.ts`

**Interfaces:**
- Produces: `Tabs, TabsList, TabsTrigger, TabsContent` (shadcn 표준). List `rounded-full bg-muted p-1`, 활성 trigger `bg-card shadow-soft text-foreground`.

- [ ] **Step 1: 실패하는 테스트 작성**
  - `tools-design.spec.ts` › `"Merge & Split uses the redesigned template"`: `expectRedesigned(page, "/edit/pdf/", PDF 두 개 넣기)`.
  - `pdf-organizer.spec.ts` › `"mode tabs move with the arrow keys"`: `getByRole("tab", { name: "Merge PDFs" })` focus → `ArrowRight` → `getByRole("tab", { name: "Split a PDF" })`가 `aria-selected="true"` → `getByLabel("Choose a PDF to split")`가 붙어 있다.
  - `pdf-organizer.spec.ts` › `"every tab points at a panel that exists"`: 각 tab의 `aria-controls` id를 가진 요소가 문서에 있다(활성 탭 기준).
  - `pdf-organizer.spec.ts` › `"the primary action lives in the side panel"`: 1280 폭에서 PDF 두 개 → `getByRole("button", { name: "Merge 2 PDFs" })`가 `[data-tool-panel]` 안에 있다.
- [ ] **Step 2: 실행** — Run: `npx playwright test tests/e2e/pdf-organizer.spec.ts tests/e2e/tools-design.spec.ts -g "Merge|tab|panel"` / Expected: 새 테스트 FAIL.
- [ ] **Step 3: 구현**
  - 헤더: `PageContainer` → `ToolPageHeader`(crumb ["Tools","Merge & Split PDF"], title "Merge and split PDF files", intro 기존 문장 그대로, icon `FileText`, chips `PDF`, `Up to 30 files`, `50 MB each · 150 MB total`(상수에서 계산한 문자열), `{ label: "Nothing uploaded", ok: true }`).
  - `Tabs value={mode} onValueChange={v => switchMode(v as Mode)}`, `TabsList aria-label="PDF tool mode"`, trigger "Merge PDFs"/"Split a PDF"(아이콘 포함), 그리고 `TabsContent value="merge"`와 `value="split"` 각각에 같은 작업 영역을 렌더(Radix가 비활성 쪽을 마운트하지 않으므로 input ref 하나로 충분).
  - 작업 영역 `ToolLayout`: 해당 모드에 파일이 없으면 main = `DropZone`(title·버튼·note 문구 그대로, children = 기존 숨은 input), panel null. 있으면 main(`data-tool-main`) = DropZone(작게) + Merge: `Card` "Merge order" + 요약 줄 + `ol`(행: 순번, 이름, 페이지·크기 또는 오류 `text-destructive`, 위/아래/제거 `ghost icon` — aria-label 그대로) / Split: `Card` 파일 이름·페이지 수. panel(`data-tool-panel`) = Merge: 요약 + `ActionBar`("Merge N PDFs"/"Merge PDFs"/"Working…") + "Clear list"(secondary) + "Add at least two readable PDFs." / Split: fieldset(라디오 두 개, 라벨 문구 그대로, `rounded-field` 카드형), "Pages (1–N)" input, `ActionBar`("Extract pages"/"Split into N files").
  - 결과(`results`, `aria-live="polite"` 유지): 각 결과 `Card` — 이름, 상세, `<a download>` "Download"(`buttonVariants()` 클래스, 링크 역할 유지).
  - 페이지: `PageContainer`/`AdSlot slot="edit-pdf-below-tool"`/`Prose`, 표는 `Prose` 기본 표 스타일, `SECTION` 상수 제거. 문장·수치 그대로.
- [ ] **Step 4: 실행** — Run: `npx tsc --noEmit && npx playwright test tests/e2e/pdf-organizer.spec.ts tests/e2e/tools-design.spec.ts` / Expected: PASS.
- [ ] **Step 5: 커밋** — `feat(design): merge and split PDF on the tool template`

---

### Task 6: Phase 3 게이트

**Files:**
- Modify: `CLAUDE.md` (Design System 첫 문단: Phase 3 완료, 남은 것은 콘텐츠 페이지와 정리), 필요하면 이 계획의 Self-review 메모

- [ ] **Step 1: 전체 스위트** — Run: `npx playwright test --grep-invert production > .superpowers/phase3-suite.log 2>&1; tail -5 .superpowers/phase3-suite.log` / Expected: 전부 passed (Phase 2 끝 43개 + 이 계획의 새 테스트).
- [ ] **Step 2: 빌드** — 미리보기 서버를 멈추고 `rm -rf .next && npm run build` / Expected: 성공, `out/edit/image/index.html`, `out/convert/img/index.html`, `out/convert/pdf/index.html`, `out/edit/pdf/index.html` 존재. `npx wrangler deploy --dry-run`이 인증 없이 돌면 `out`을 읽는지 확인, 인증 때문에 못 돌면 ledger에 사실대로.
- [ ] **Step 3: 접근성** — 네 도구 페이지 Lighthouse accessibility(데스크톱) / Expected: 각 100. 아니면 원인을 고치고 해당 작업 테스트에 대비 테스트 추가.
- [ ] **Step 4: 스크린샷** — 네 도구 × (1440, 375) × (빈 상태, 작업 상태)를 `docs/superpowers/plans/screenshots/phase3/`에(커밋 안 함).
- [ ] **Step 5: 문서와 커밋** — `CLAUDE.md` 갱신 → `docs: phase 3 tool screens in the design system section`
- [ ] **Step 6: 미리보기 서버 다시 시작** — 사용자가 로컬에서 볼 수 있게 `bravoconvert-dev`.

---

## 다음 계획 (이 문서 범위 밖)

- Phase 4: 콘텐츠 페이지(가이드, FAQ Accordion, 정적 페이지, 404, 한국어 가이드).
- Phase 5: `brand-*`, `CustomDropdown`, 미사용 i18n 패키지 제거, 운영 대비 Lighthouse 비교, 배포(사용자 확인 후).

## Self-review 메모

- 설계 7.3 다섯 도구 중 남은 넷 → Task 2–5. `MetadataRemovalNotice` 위치 → Task 2(변환기)·Task 4(편집기). 템플릿 4·5번(AdSlot, Prose) → 각 작업의 페이지 단계. 모바일 순서 → `expectRedesigned` (c).
- 10절 완료 기준(`editor.spec`, `pdf-organizer.spec` 통과, 수동 점검) → Task 4 Step 5, Task 6.
- `notice` prop 이름은 Task 2와 Task 4에서 같다. `expectRedesigned`는 Task 2에서 만들고 3–5가 쓴다. `Progress`의 label "Conversion progress"는 Task 2·3 공통.
