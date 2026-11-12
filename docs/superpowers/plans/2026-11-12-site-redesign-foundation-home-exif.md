# 사이트 리뉴얼 1차 구현 계획: 기반, 홈, EXIF 뷰어

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 문서의 Phase 0–2를 구현한다. 디자인 토큰과 shadcn/ui 컴포넌트 체계를 세우고, 공통 셸(헤더·푸터·동의 배너)과 홈(영문·한국어), EXIF 뷰어(영문·한국어)를 "따뜻한 도우미" 방향으로 다시 그린다. 끝나면 도구 화면 템플릿이 확정되어 나머지 네 도구(Phase 3)와 콘텐츠 페이지(Phase 4), 정리(Phase 5)는 각각 별도 계획으로 이어진다.

**Architecture:** 색·글꼴·모서리·그림자는 `globals.css`의 CSS 변수와 `tailwind.config.js` 매핑으로만 존재하고, 화면은 그 토큰 이름만 쓴다. shadcn/ui 프리미티브(`src/components/ui/`) 위에 사이트 전용 합성 컴포넌트(`src/components/site/`, `src/components/tool/`, `src/components/home/`)를 올리고, 기존 `ExifViewer`·`HomePhotoDrop`·`ConsentManager`는 **상태와 처리 로직은 그대로 두고 표현만** 새 컴포넌트로 바꾼다. 기존 `brand` 팔레트는 Phase 5 전까지 남겨 두되 값을 남보라로 돌려, 아직 손대지 않은 화면도 새 포인트 색을 입는다.

**Tech Stack:** Next.js 14.2 (App Router, `output: 'export'`), React 18, Tailwind CSS 3.4, shadcn/ui (Radix), class-variance-authority, lucide-react, framer-motion 12, Playwright (`tests/e2e/`, Chromium at `C:\Program Files\Google\Chrome\Application\chrome.exe`, dev server `npm run dev` on 127.0.0.1:3000).

**Spec:** `docs/superpowers/specs/2026-11-12-site-redesign-design.md` (이하 "설계"). 모든 작업은 설계의 5절(토큰), 6절(컴포넌트), 7절(화면), 9절(불변 목록)을 전제로 한다.

## Global Constraints

- Tailwind 3.4.17 유지. Tailwind 4로 올리지 않는다. Next 14.2.35, React 18 유지.
- 정적 export 유지: `output: 'export'`, `trailingSlash: true`, `(en)`·`(ko)` 두 루트 레이아웃. 서버 컴포넌트에 이벤트 핸들러를 넣지 않는다.
- 설계 9절의 문구·역할·라벨은 한 글자도 바꾸지 않는다. 특히 H1 "Check what a photo reveals before you share it", "EXIF viewer", "EXIF 뷰어", 버튼 "Remove it now", "바로 지우기", "Remove from all", "Check another", "Try a sample photo", "샘플 사진으로 해보기", "Reject", "거부", 그룹 "Save the clean copy as", 라벨 "Choose photos to check", "확인할 사진 선택", "Choose a JPG, PNG, or WebP photo", 체크 "Shrink the long side to 2048 px (smaller file)", `data-check`, `data-none`, `data-done`, `data-home-drop`, `data-metadata-notice` 속성.
- `SiteHead.tsx`(Consent Mode, GA, AdSense, 검증 태그), `src/lib/*`, `public/workers/*`, `src/data/*.json`은 수정하지 않는다.
- 포인트 색 `primary`는 주 버튼·선택 상태·링크·진행 막대에만. 주황은 "발견", 초록은 "없음/지워짐"에만.
- 본문 크기 글자는 `foreground` 또는 `muted-foreground`(#6b5f55)만. `#8a7d72` 계열은 18px 이상에만.
- 그림자는 `shadow-card`, `shadow-primary` 둘뿐. `backdrop-blur`, `hover:-translate-y-*`, 그라데이션 덮개는 새 코드에 쓰지 않는다.
- 이모지를 UI에 쓰지 않는다. 아이콘은 lucide-react.
- `/ko/` 밖의 사용자 문구는 영어. 한국어 페이지는 `break-keep`.
- 커밋은 작업마다 하고, 메시지는 `feat(design): …`, `refactor(design): …`, `test(e2e): …` 형식. 스테이징은 명시한 경로만 (`git add --all` 금지: `AGENTS.md`, `dev-server.*.log`, `IMAGE_EDITOR_HANDOFF.md`, `.claude/`가 작업 트리에 있다). 각 커밋 메시지 끝에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- 매 작업 끝: `npx tsc --noEmit`, `npx eslint .` 통과.

## Review Focus

설계가 요구하지만 어느 작업의 기본 테스트도 저절로 건드리지 않는 입력·상황. 각 줄의 테스트는 해당 작업 안에 단계로 들어가 있다.

1. **동의 배너가 열린 채 폰에서 EXIF 뷰어를 쓸 때** 하단 고정 `ActionBar`가 배너와 겹치면 안 된다. 배너가 열려 있는 동안 바는 고정되지 않아야 한다. → Task 10.
2. **사진 30장을 폰에서 올렸을 때** 리포트가 목록 아래로 밀려 안 보이면 안 된다. 리포트 패널이 목록보다 위에 와야 하고 가로 스크롤이 생기면 안 된다. → Task 9.
3. **`prefers-reduced-motion: reduce`인 방문자**에게 결과 카드 페이드-업과 드롭 영역 강조 애니메이션이 돌면 안 된다. → Task 10.
4. **키보드만 쓰는 방문자**가 헤더 Tools 메뉴를 열고 닫고(Enter/Esc) 모바일 시트 안에 포커스가 갇혀야 한다. → Task 3.
5. **320px 폭(아이폰 SE 가로 여백 포함)**에서 히어로의 사진 카드와 말풍선이 가로 넘침을 만들면 안 된다. → Task 6, Task 7.

---

## 파일 구조

새로 만들거나 바꾸는 파일과 책임. Phase 3 이후에 또 쓰일 것은 `tool/`에, 홈에만 쓰이는 것은 `home/`에 둔다.

```
src/app/globals.css                      토큰(CSS 변수), base 스타일, reduced-motion
tailwind.config.js                       토큰 → Tailwind 이름 매핑, 글자 크기 체계
components.json                          shadcn 설정 (Tailwind 3, CSS 변수)
src/app/(en)/layout.tsx                  글꼴 변수, viewport, 새 셸 조립
src/app/(ko)/layout.tsx                  Pretendard 링크, 같은 셸
src/components/ui/*.tsx                  shadcn 생성물 (button, card, badge, sheet, dropdown-menu, checkbox, separator, tooltip)
src/components/site/page-container.tsx   최대 폭 1120 컨테이너
src/components/site/site-header.tsx      새 헤더 (Navigation.tsx 대체)
src/components/site/site-header-text.ts  Navigation.tsx의 TEXT 표를 옮긴 것
src/components/site/SiteFooter.tsx       토큰으로 다시 그림 + "Privacy choices" 버튼
src/components/site/consent-context.tsx  배너 열림 상태 공유 (Provider + useConsentBanner)
src/components/ConsentManager.tsx        마크업만 새 토큰, reopen 알약 제거
src/components/home/hero-stage.tsx       기울어진 사진 카드 + 말풍선 3개
src/components/home/step-card.tsx, tool-card.tsx, task-card.tsx, reveal-item.tsx
src/components/tool/icon-tile.tsx        파스텔 타일 위 lucide 아이콘
src/components/tool/status-badge.tsx     found / clean / neutral 배지
src/components/tool/report-panel.tsx     ReportPanel, ReportRow
src/components/tool/drop-zone.tsx        드롭 영역 (홈·도구 공용)
src/components/tool/tool-page-header.tsx 브레드크럼 + 타일 + H1 + 한 줄 + 칩
src/components/tool/tool-layout.tsx      2단 작업 영역, panelFirstOnMobile
src/components/tool/file-list.tsx        FileList, FileRow
src/components/tool/action-bar.tsx       패널 하단 버튼 줄, 모바일 고정 규칙
src/components/tool/ad-slot.tsx          광고 예약 자리
src/components/tool/prose.tsx            설명 article 본문 스타일 (최소판)
src/lib/demo-report.ts                   exif-demo.json → 여섯 항목 리포트 데이터
src/components/HomePhotoDrop.tsx         DropZone 사용으로 표현만 교체
src/app/(en)/page.tsx, src/app/(ko)/ko/page.tsx           홈
src/components/ExifViewer.tsx            표현만 템플릿으로 교체
src/app/(en)/view/exif/page.tsx, src/app/(ko)/ko/view/exif/page.tsx   AdSlot + Prose
src/app/(en)/page-not-found/page.tsx     새 버튼·컨테이너
tests/e2e/design-system.spec.ts, shell.spec.ts, home.spec.ts   새 테스트
tests/e2e/exif-viewer.spec.ts            모바일 순서·배너 겹침·reduced-motion 추가
삭제: src/components/Navigation.tsx, src/components/ThemeToggle.tsx
```

---

## Phase 0 · 기반

### Task 1: 디자인 토큰과 글꼴

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.js`
- Modify: `src/app/(en)/layout.tsx:1-10, 46-50, 58-66`
- Modify: `src/app/(ko)/layout.tsx:1-7, 30-34, 36-52`
- Test: `tests/e2e/design-system.spec.ts`

**Interfaces:**
- Produces: Tailwind 색 이름 `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`, `primary`, `primary-foreground`, `primary-hover`, `primary-soft`, `destructive`, `destructive-foreground`, `status-found`, `status-found-foreground`, `status-clean`, `status-clean-foreground`, `tile-blue`, `tile-yellow`, `tile-green`, `tile-pink`, `tile-peach`; 기존 `brand-50/100/200/600/700/800/900`은 남보라 값으로 재지정(50 #eef2ff, 100 #e0e7ff, 200 #c7d2fe, 600 #4f46e5, 700 #4338ca, 800 #3730a3, 900 #312e81).
- Produces: `fontFamily.sans = ["var(--font-sans)", "system-ui", "sans-serif"]`; `fontSize.display|h1|h2|h3|caption`; `borderRadius.card = 24px`, `field = 16px`, `tile = 16px`, `tile-sm = 12px`; `boxShadow.card`, `boxShadow.primary` (설계 5.4의 값 그대로).
- Produces: `<body>`에 글꼴 변수 `--font-sans`가 붙는다 (영문: Plus Jakarta Sans, 한국어: Pretendard Variable 우선).

- [ ] **Step 1: 실패하는 테스트 작성** `tests/e2e/design-system.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("pages use the warm token palette and the new fonts", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-color", "rgb(255, 248, 241)");
  await expect(body).toHaveCSS("color", "rgb(42, 36, 32)");
  expect(await body.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/Plus[ _]Jakarta[ _]Sans/); // next/font 는 "__Plus_Jakarta_Sans_…" 이름을 만든다
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /^(?!.*maximum-scale)/);

  await page.goto("/ko/");
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/Pretendard/);
  await expect(page.locator('link[href*="pretendard"]')).toHaveCount(1);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/design-system.spec.ts`
Expected: FAIL (`background-color`가 `rgb(255, 255, 255)`).

- [ ] **Step 3: `globals.css`에 토큰과 base 스타일 작성**

`@layer base { :root { … } }`에 설계 5.2의 색을 **RGB 채널 값**으로 둔다 (HSL 변환은 반올림으로 색이 1~2 어긋나 테스트의 정확한 `rgb()` 값과 맞지 않는다; shadcn 컴포넌트는 클래스 이름만 쓰므로 채널 형식은 상관없다):

```css
--background: 255 248 241;  --foreground: 42 36 32;
--card: 255 255 255;        --card-foreground: 42 36 32;
--popover: 255 255 255;     --popover-foreground: 42 36 32;
--muted: 254 240 224;       --muted-foreground: 107 95 85;
--border: 241 226 210;      --input: 241 226 210;
--primary: 79 70 229;       --primary-foreground: 255 255 255;
--primary-hover: 67 56 202; --primary-soft: 238 242 255;   --ring: 199 210 254;
--status-found: 254 243 199;   --status-found-foreground: 180 83 9;
--status-clean: 220 252 231;   --status-clean-foreground: 21 128 61;
--destructive: 254 226 226;    --destructive-foreground: 185 28 28;
--tile-blue: 219 234 254; --tile-yellow: 254 243 199; --tile-green: 220 252 231; --tile-pink: 254 226 226; --tile-peach: 254 240 224;
--radius: 1rem;
```

`html { @apply bg-white }`, `body { @apply bg-white text-black; font-family: Inter … }`를 지우고 `body { @apply bg-background text-foreground antialiased; font-family: var(--font-sans), system-ui, sans-serif; font-feature-settings: "tnum" }`, 그리고

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 4: `tailwind.config.js`에 매핑 작성**

`theme.extend.colors`에 Interfaces의 이름을 `"rgb(var(--background) / <alpha-value>)"` 형식으로 (Tailwind 3.1+의 `<alpha-value>` 자리표시 덕에 `bg-destructive/80` 같은 투명도 수식어가 그대로 된다), `brand`는 hex 그대로(Interfaces 값). `fontFamily`, `fontSize`(`display: ["52px", { lineHeight: "1.06", letterSpacing: "-0.035em", fontWeight: "800" }]`, `h1: ["36px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "800" }]`, `h2: ["26px", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "800" }]`, `h3: ["17px", { lineHeight: "1.3", fontWeight: "700" }]`, `caption: ["12px", { lineHeight: "1.4", fontWeight: "600" }]`), `borderRadius`, `boxShadow`를 Interfaces대로. `plugins`는 빈 배열 유지 (`tailwindcss-animate`는 Task 2에서 shadcn이 요구하면 그때 추가).

- [ ] **Step 5: 영문 레이아웃에 글꼴과 viewport**

`src/app/(en)/layout.tsx`: `import { Plus_Jakarta_Sans } from "next/font/google"`, `const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-sans", display: "swap" })`, `<html lang="en" className={sans.variable}>`. `viewport`에서 `maximumScale: 1` 삭제. `<body className="antialiased text-black">` → `<body>`.

- [ ] **Step 6: 한국어 레이아웃에 Pretendard**

`src/app/(ko)/layout.tsx`: 같은 `Plus_Jakarta_Sans` 변수를 `<html>`에 걸고, `<head>` 안 `<SiteHead />` 뒤에
`<link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />`
`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />`.
`<body className="break-keep" style={{ fontFamily: '"Pretendard Variable", Pretendard, var(--font-sans), system-ui, sans-serif' }}>`. `maximumScale: 1` 삭제.

- [ ] **Step 7: 테스트 통과 확인**

Run: `npx playwright test tests/e2e/design-system.spec.ts`
Expected: PASS. 그리고 `npx playwright test` 전체 PASS (문구는 그대로이므로 기존 테스트가 깨지면 안 된다).

- [ ] **Step 8: 커밋**

```bash
git add src/app/globals.css tailwind.config.js "src/app/(en)/layout.tsx" "src/app/(ko)/layout.tsx" tests/e2e/design-system.spec.ts
git commit -m "feat(design): warm token palette, Plus Jakarta Sans and Pretendard, indigo accent"
```

### Task 2: shadcn/ui 설치와 Button·Card 재생성

**Files:**
- Create: `components.json`
- Modify (덮어쓰기): `src/components/ui/button.tsx`, `src/components/ui/card.tsx`
- Create (CLI 생성): `src/components/ui/badge.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `checkbox.tsx`, `separator.tsx`, `tooltip.tsx`
- Modify: `package.json` (CLI가 추가하는 `@radix-ui/*`, `tailwindcss-animate`)

**Interfaces:**
- Produces: `Button` with `variant: "primary" | "secondary" | "ghost" | "link" | "destructive"` (default `primary`), `size: "sm" | "md" | "lg" | "icon"` (default `md`), `asChild`. 높이 sm 36 / md 44 / lg 48 / icon 44×44. 모두 `rounded-full`.
- Produces: `buttonVariants` (링크를 버튼처럼 그릴 때 `<Link className={buttonVariants({ variant, size })}>`).
- Produces: `Card`(`rounded-card bg-card shadow-card`, 테두리 없음, 패딩 없음 — 패딩은 쓰는 쪽이 준다), `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`.
- Produces: `Badge` with `variant: "found" | "clean" | "neutral"` (Task 5의 `StatusBadge`가 감싼다).
- Produces: shadcn 그대로의 `Sheet*`, `DropdownMenu*`, `Checkbox`, `Separator`, `Tooltip*`.

- [ ] **Step 1: `components.json` 작성**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.js", "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: 컴포넌트 생성**

Run: `npx shadcn@latest add button card badge sheet dropdown-menu checkbox separator tooltip --overwrite --yes`
Expected: 8개 파일이 `src/components/ui/`에 생기고 `package.json`에 `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-checkbox`, `@radix-ui/react-separator`, `@radix-ui/react-tooltip`가 추가된다. CLI가 `globals.css`의 `:root` 블록을 덮어썼으면 Task 1의 값으로 되돌린다 (`git diff src/app/globals.css`로 확인). CLI가 `tailwindcss-animate`를 설치하고 `plugins`에 넣었으면 그대로 둔다.

- [ ] **Step 3: Tailwind 4 전용 클래스 제거**

Run: `grep -rnE "shadow-xs|@container|has-data-|\bsize-\[|outline-hidden|ring-ring/50" src/components/ui`
Expected: 결과가 없어야 한다. 있으면 `shadow-xs → shadow-sm`, `outline-hidden → outline-none`, `has-data-[…] → has-[…]`로 고치고 `@container` 클래스는 지운다.

- [ ] **Step 4: `button.tsx`를 설계의 버튼으로 바꾼다**

`buttonVariants`를 다음으로 교체 (Slot/asChild 구조는 CLI 생성물 유지):

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover",
        secondary: "border-2 border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
      size: { sm: "h-9 px-4 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]", icon: "h-11 w-11" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

- [ ] **Step 5: `card.tsx`와 `badge.tsx` 조정**

`Card`의 클래스를 `"rounded-card bg-card text-card-foreground shadow-card"`로 (테두리·패딩·gap 제거). `Badge`의 variants를 `found: "bg-status-found text-status-found-foreground"`, `clean: "bg-status-clean text-status-clean-foreground"`, `neutral: "bg-muted text-muted-foreground"`로 바꾸고 base에 `rounded-full px-2.5 py-1 text-caption whitespace-nowrap`.

- [ ] **Step 6: 타입·린트 확인**

Run: `npx tsc --noEmit && npx eslint .`
Expected: 오류 없음. (`src/components/ui/*`에서 lint가 `react/display-name` 등을 내면 그 파일 상단 주석으로 끄지 말고 코드를 고친다.)

- [ ] **Step 7: 커밋**

```bash
git add components.json package.json package-lock.json src/components/ui tailwind.config.js src/app/globals.css
git commit -m "feat(design): shadcn/ui primitives on Tailwind 3 with pill buttons and shadow cards"
```

### Task 3: 공통 셸 — 헤더, 푸터, 동의 배너, 404

**Files:**
- Create: `src/components/site/page-container.tsx`, `src/components/site/site-header.tsx`, `src/components/site/site-header-text.ts`, `src/components/site/consent-context.tsx`
- Modify: `src/components/site/SiteFooter.tsx`, `src/components/ConsentManager.tsx:76-107`, `src/app/(en)/layout.tsx`, `src/app/(ko)/layout.tsx`, `src/app/(en)/page-not-found/page.tsx`
- Delete: `src/components/Navigation.tsx`, `src/components/ThemeToggle.tsx`
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: `PageContainer({ className?, children })` → `<div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">`.
- Produces: `SiteHeader({ locale }: { locale: Locale })`. 데스크톱(lg↑): 로고, 가운데 알약 내비(`DropdownMenu` "Tools" + Guides/FAQ/About 링크), 오른쪽 언어 전환 링크(기존 `hrefLang`/`lang` 속성과 `switchHref` 계산 로직 그대로) + `Button` "Check a photo"/"사진 확인하기" → `/view/exif/` 또는 `/ko/view/exif/`. 모바일: 로고, 언어 전환, 햄버거 `Button size="icon" variant="ghost" aria-label={t.toggle}` → `Sheet side="right"` 안에 도구 5개와 링크 전부. **도구 링크 5개는 SEO를 위해 항상 정적 HTML에 있어야 한다**: 데스크톱 메뉴가 닫혀 있어도 `<nav aria-label="Tools">` 안에 `sr-only` 링크 목록을 둔다.
- Produces: `ConsentBannerProvider({ children })`와 `useConsentBanner(): { open: boolean; setOpen(v: boolean): void }` — `ConsentManager`가 `open`을 올리고, 푸터와 Task 9의 `ActionBar`가 읽는다.
- Produces: `SiteFooter`에 `type="button"` "Privacy choices"/"개인정보 선택" 버튼 (`useConsentBanner().setOpen(true)`), 떠 있는 reopen 알약은 사라진다.
- Consumes: Task 2의 `Button`, `Sheet`, `DropdownMenu`.

- [ ] **Step 1: 실패하는 테스트** `tests/e2e/shell.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("desktop Tools menu opens with the keyboard and lists the five tools", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Tools" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveCount(5);
  await expect(menu.getByRole("menuitem", { name: /EXIF Viewer/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile menu is a sheet that traps focus and links every page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.getByRole("button", { name: "Toggle menu" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Merge & Split PDF" })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("the consent banner can be reopened from the footer and the floating pill is gone", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.getByRole("region", { name: "Privacy choices" })).toBeHidden();
  await expect(page.locator("button.fixed")).toHaveCount(0);
  await page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" }).click();
  await expect(page.getByRole("region", { name: "Privacy choices" })).toBeVisible();
});

test("tool links are in the static HTML of every page", async ({ request }) => {
  for (const path of ["/", "/ko/", "/view/exif/", "/guides/"]) {
    const html = await (await request.get(path)).text();
    for (const href of ["/view/exif/", "/convert/img/", "/convert/pdf/", "/edit/image/", "/edit/pdf/"]) expect(html, `${path} links ${href}`).toContain(`href="${href}`);
  }
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/shell.spec.ts`
Expected: FAIL (role `menu`/`dialog` 없음, 푸터에 버튼 없음).

- [ ] **Step 3: `consent-context.tsx`와 `ConsentManager` 수정**

`"use client"` 컨텍스트: `createContext<{ open: boolean; setOpen: (v: boolean) => void }>`. `ConsentManager`는 내부 `isOpen` 대신 컨텍스트의 `open/setOpen`을 쓰고(마운트 시 `readConsent() === null`이면 `setOpen(true)`), 배너 마크업을 `fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-card bg-card p-4 shadow-card sm:flex sm:items-center sm:gap-4`로, 버튼은 `Button variant="secondary" size="sm"`(Reject)와 `Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 shadow-none"`(Accept, 중립 먹색 유지). 84~105행의 reopen 버튼 블록을 삭제한다. `role="region"`, `aria-label={t.region}`, 버튼 문구는 그대로.

- [ ] **Step 4: `site-header-text.ts`로 TEXT 이동, `site-header.tsx` 작성**

`Navigation.tsx`의 `TEXT`와 `Item` 타입을 그대로 옮긴다. `SiteHeader`는 `"use client"`, `usePathname`/`cameFromKorean`/`switchHref`/`home` 계산을 Navigation에서 그대로 가져온다. 데스크톱 내비는 `<nav className="hidden lg:flex items-center gap-0.5 rounded-full bg-card p-1 shadow-card">`, 항목은 `Link`에 `rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground`, 현재 경로 항목은 `bg-muted text-foreground`. Tools는 `DropdownMenuTrigger asChild`로 감싼 같은 모양의 `button`(`aria-label` 없이 글자 "Tools"/"도구"), `DropdownMenuContent`에 5개 `DropdownMenuItem asChild > Link` (label 굵게, note는 `text-caption text-muted-foreground`). 헤더 전체는 `<header className="sticky top-0 z-50 bg-background">` 높이 72px.

- [ ] **Step 5: 레이아웃 조립과 삭제**

두 레이아웃에서 `Navigation` → `SiteHeader`, `<body>` 직계를 `<ConsentBannerProvider><ConsentManager …/><SiteHeader …/><div className="pt-6">{children}</div><SiteFooter …/></ConsentBannerProvider>`. `Navigation.tsx`, `ThemeToggle.tsx` 삭제 (`grep -rn "ThemeToggle\|components/Navigation" src`가 비어야 한다).

- [ ] **Step 6: `SiteFooter` 다시 그리기**

외곽 카드·그림자·블러 제거. `<footer className="mt-16 border-t border-border">` 안에 `PageContainer`, 도구 `nav`(aria-label 유지)와 페이지 링크는 `text-sm font-semibold text-muted-foreground hover:text-foreground`, 마지막 줄에 `© {year} BravoConvert`와 `Button variant="link" size="sm"` "Privacy choices"/"개인정보 선택". 푸터는 클라이언트 훅을 쓰므로 버튼만 `"use client"` 소형 컴포넌트 `PrivacyChoicesButton({ label })`로 분리하고 `SiteFooter`는 서버 컴포넌트로 남긴다.

- [ ] **Step 7: 404 페이지**

`PageContainer` + `text-h1` 제목 + `Button asChild`(primary: 홈, secondary: EXIF Viewer, 한국어 홈). 문구 유지.

- [ ] **Step 8: 테스트 통과 확인**

Run: `npx playwright test tests/e2e/shell.spec.ts tests/e2e/korean.spec.ts tests/e2e/editor.spec.ts -g "consent layout|Korean pages|language switch|sheet|Tools menu|reopened|static HTML"`
Expected: PASS. 이어서 `npx playwright test` 전체 PASS.

- [ ] **Step 9: 커밋**

```bash
git add src/components/site src/components/ConsentManager.tsx "src/app/(en)/layout.tsx" "src/app/(ko)/layout.tsx" "src/app/(en)/page-not-found/page.tsx" tests/e2e/shell.spec.ts
git rm src/components/Navigation.tsx src/components/ThemeToggle.tsx
git commit -m "feat(design): new site shell with pill navigation, sheet menu and footer privacy choices"
```

---

## Phase 1 · 홈

### Task 4: 공용 조각 — IconTile, StatusBadge, ReportPanel, 데모 리포트 데이터

**Files:**
- Create: `src/components/tool/icon-tile.tsx`, `src/components/tool/status-badge.tsx`, `src/components/tool/report-panel.tsx`, `src/lib/demo-report.ts`
- Test: `tests/e2e/home.spec.ts` (Task 6에서 통과시킨다; 여기서는 타입만)

**Interfaces:**
- Produces: `IconTile({ icon: LucideIcon; tone?: "blue" | "yellow" | "green" | "pink" | "peach" | "found" | "clean"; size?: "sm" | "md" | "lg"; className? })` — sm 36/`rounded-tile-sm`, md 48/`rounded-tile`, lg 64/`rounded-[22px]`; tone은 `bg-tile-*` 또는 `bg-status-found text-status-found-foreground` / `bg-status-clean text-status-clean-foreground`.
- Produces: `StatusBadge({ status: "found" | "clean" | "neutral"; children })` → Task 2 `Badge`.
- Produces: `ReportItem = { id: "location" | "time" | "device" | "serial" | "person" | "software"; label: string; value: string | null; found: boolean }`.
- Produces: `ReportPanel({ title: string; summary: ReactNode; items: ReportItem[]; footer?: ReactNode; dense?: boolean })`와 `ReportRow({ item, icon })`: 행 = `IconTile size="sm" tone={found ? "found" : "clean"}` + label(`text-sm font-bold`) + value(`text-[13px] text-muted-foreground tabular-nums break-words`, value가 null이면 `t.notFound` 류의 문구를 호출자가 넣은 `value`) + `StatusBadge`. 항목별 아이콘은 `REPORT_ICONS: Record<ReportItem["id"], LucideIcon>` = MapPin, Clock, Camera, Fingerprint, User, PenLine (ExifViewer의 `Check.icon`과 같은 짝).
- Produces: `demoReport(locale: Locale): ReportItem[]` — `src/data/exif-demo.json`의 `before`에서 `latitude`/`longitude` → location `"51.50806, -0.12806"`, `DateTimeOriginal` → time `"2026-05-17 14:32:08"`(`formatExifDate` 사용), `Make`+`Model` → device `"BravoCam BC-900 Demo"`, serial/person/software는 `found: false`, value `null`. label은 영문 "Where it was taken" 등 홈 `revealed` 배열의 label 6개, 한국어는 `(ko)/ko/page.tsx`의 `revealed` label 6개.
- Produces: `demoReportCounts(locale)` → `{ found: 3, total: 6 }` (표시용).

- [ ] **Step 1: 네 파일 작성** (Interfaces의 시그니처 그대로)

`ReportPanel`은 `Card` 안에 `CardHeader`(제목 + 오른쪽 `StatusBadge status="found"` 요약은 `summary` prop으로 받음), `CardContent`에 행 목록(`divide-y divide-muted`), `footer`가 있으면 `CardFooter`. `dense`면 행 패딩 `py-2`, 아니면 `py-3`.

- [ ] **Step 2: 타입 확인**

Run: `npx tsc --noEmit && npx eslint src/components/tool src/lib/demo-report.ts`
Expected: 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/tool/icon-tile.tsx src/components/tool/status-badge.tsx src/components/tool/report-panel.tsx src/lib/demo-report.ts
git commit -m "feat(design): icon tile, status badge and report panel primitives"
```

### Task 5: DropZone과 HomePhotoDrop

**Files:**
- Create: `src/components/tool/drop-zone.tsx`
- Modify: `src/components/HomePhotoDrop.tsx:45-89`

**Interfaces:**
- Produces: `DropZone({ title: string; note?: string; dragging: boolean; busy?: boolean; icon?: LucideIcon; actions: ReactNode; children?: ReactNode; className?; ...dragHandlers })` — 흰 `Card` `p-3` 안에 `rounded-field border-2 border-dashed border-border bg-[hsl(var(--background))] p-8 text-center` 영역; `dragging`이면 `border-primary bg-primary-soft`. 가운데 `IconTile icon={icon ?? Upload} tone="blue" size="lg"`, 제목 `text-h3`, note `text-sm text-muted-foreground`, 그 아래 `actions`(버튼 줄, `flex flex-wrap justify-center gap-3`). 드래그 이벤트 핸들러는 그대로 바깥 요소에 전달 (`onDragEnter/Over/Leave/Drop`). framer-motion `motion.div`로 `dragging` 시 `scale: 1.01`만, `useReducedMotion()`이면 생략.
- Consumes: Task 2 `Button`, `Card`; Task 4 `IconTile`.
- HomePhotoDrop: 상태·`go`·`onDrop`·숨은 input·`data-home-drop`·`aria-label` 불변. 버튼은 `Button size="lg"`(아이콘 FileSearch + `t.choose`)와 `Button asChild variant="secondary" size="lg"` 안 `Link`(`t.sample`).

- [ ] **Step 1: 작성**

- [ ] **Step 2: 기존 테스트로 확인**

Run: `npx playwright test tests/e2e/exif-viewer.spec.ts -g "home page and the converter" tests/e2e/korean.spec.ts -g "Korean home sends"`
Expected: PASS (드롭·선택·핸드오프 동작 불변).

- [ ] **Step 3: 커밋**

```bash
git add src/components/tool/drop-zone.tsx src/components/HomePhotoDrop.tsx
git commit -m "feat(design): shared DropZone and warm home photo drop"
```

### Task 6: 영문 홈

**Files:**
- Create: `src/components/home/hero-stage.tsx`, `src/components/home/step-card.tsx`, `src/components/home/tool-card.tsx`, `src/components/home/task-card.tsx`, `src/components/home/reveal-item.tsx`
- Modify: `src/app/(en)/page.tsx:144-end`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Produces: `HeroStage({ locale })` — `relative h-[260px] lg:h-[420px]` 안에 기울어진(`-rotate-3`) 살구 그라데이션 카드(`rounded-card shadow-card`, 사진 파일 없음)와 말풍선 3개(`Card` 소형, `IconTile size="sm"`): `demoReport(locale)`에서 location 값 "51.50806, -0.12806"(tone found), device 값 "BravoCam BC-900 Demo"(tone found), 세 번째 "Clean copy ready"/"깨끗한 사본 준비됨"(tone clean). 말풍선 위치는 `absolute` 퍼센트 좌표라 320px에서도 넘치지 않게 `right-0` 기준, 컨테이너 `overflow-hidden`은 쓰지 않는다(그림자 잘림) 대신 부모 `PageContainer`가 폭을 제한한다.
- Produces: `StepCard({ index: "01"|"02"|"03"; icon; tone; title; body; href; cta })`, `ToolCard({ icon; tone; title; body; href })`, `TaskCard({ task; how; tool; href })`, `RevealItem({ icon; label; body })`. 전부 서버 컴포넌트, `Card` 기반, 문구는 props.
- Consumes: `demoReport`, `ReportPanel`, `DropZone`(HomePhotoDrop 경유), `Button`, `buttonVariants`, `IconTile`, `StatusBadge`.

- [ ] **Step 1: 실패하는 테스트** `tests/e2e/home.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("home hero keeps its heading and shows the sample report with real values", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Check what a photo reveals before you share it" })).toBeVisible();
  const stage = page.getByTestId("hero-stage");
  await expect(stage).toContainText("51.50806, -0.12806");
  await expect(stage).toContainText("BravoCam BC-900 Demo");
  const report = page.getByTestId("sample-report");
  await expect(report.getByText("Found", { exact: true })).toHaveCount(3);
  await expect(report.getByText("Not present", { exact: true })).toHaveCount(3);
  await expect(report.getByRole("link", { name: "Remove it now" })).toHaveAttribute("href", "/view/exif/?sample=1");
  await expect(page.getByRole("link", { name: "Try the sample" })).toHaveAttribute("href", "/view/exif/?sample=1");
  for (const href of ["/convert/img/", "/convert/pdf/", "/edit/image/", "/edit/pdf/"]) await expect(page.getByTestId("tool-cards").locator(`a[href="${href}"]`)).toBeVisible();
  await expect(page.getByText("None of the fields survived.")).toBeVisible();
});

test("home has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/home.spec.ts`
Expected: FAIL (`hero-stage` 없음).

- [ ] **Step 3: 홈 카드 컴포넌트 5개와 HeroStage 작성** (Interfaces대로; `HeroStage` 루트에 `data-testid="hero-stage"`)

- [ ] **Step 4: `page.tsx` 다시 쓰기**

JSON-LD `<script>`와 `metadata`, 데이터 배열(`revealed`, `steps`, `commonTasks`, `otherTools`, `demoLabels`)은 그대로 두고 JSX만 설계 7.2 순서로:
1. `<section className="grid gap-10 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-16">` 왼쪽: `Badge variant="neutral"`가 아닌 살구 알약 `<span className="rounded-full bg-muted px-3.5 py-1.5 text-caption text-status-found-foreground">Free · private · right in your browser</span>`, `<h1 className="text-[36px] leading-[1.1] font-extrabold tracking-tight lg:text-display">` 기존 문구, 기존 설명 문단(`text-lg text-muted-foreground`), 버튼 줄(`Button asChild size="lg"` → Link "Check a photo" `/view/exif/`; `Button asChild variant="secondary" size="lg"` → Link "Try the sample" `/view/exif/?sample=1`), 점 세 개 줄. 오른쪽 `HeroStage`.
2. `<HomePhotoDrop locale="en" />` (최대 폭 760 가운데).
3. `<section>` 제목 `text-h2` "Here's what we check" + 설명, `Card`에 2단(`lg:grid-cols-[300px_1fr]`): 왼쪽 살구 그라데이션 사진 자리, 오른쪽 `ReportPanel title="Report" summary={<StatusBadge status="found">3 of 6 found</StatusBadge>} items={demoReport("en").map(i => ({ ...i, value: i.value ?? "Not present" }))}`에 `data-testid="sample-report"`, footer에 `buttonVariants()`를 입힌 Link "Remove it now"(`/view/exif/?sample=1`)와 secondary Link "Check another"(`/view/exif/`). 배지 문구는 found → "Found", 아니면 "Not present".
4. 세 단계 `StepCard` × 3 (`steps` 배열, tone blue/yellow/green, 제목에서 "1. " 접두는 떼고 `index`로 표시).
5. `<div data-testid="tool-cards">` 안 `ToolCard` × 4 (tone blue/pink/yellow/green).
6. 기존 섹션들(표, revealed→`RevealItem`, commonTasks→`TaskCard`, "What removing metadata does not do", 벤치마크, 가이드 안내)을 `text-h2` 제목과 `Card`/`RevealItem`으로. 문장 불변. 표는 `rounded-field border border-border overflow-hidden`, 캡션 배지는 `StatusBadge`.
`<main>`은 `PageContainer`로 감싸고 `min-h-screen bg-white`는 제거.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/editor.spec.ts -g "consent layout" tests/e2e/exif-viewer.spec.ts -g "home page"`
Expected: PASS.

- [ ] **Step 6: 커밋**

```bash
git add src/components/home "src/app/(en)/page.tsx" tests/e2e/home.spec.ts
git commit -m "feat(design): warm home with hero stage, sample report card and tool cards"
```

### Task 7: 한국어 홈

**Files:**
- Modify: `src/app/(ko)/ko/page.tsx` (JSX 부분)
- Test: `tests/e2e/home.spec.ts` (케이스 추가)

- [ ] **Step 1: 테스트 추가**

```ts
test("Korean home mirrors the English structure with Korean copy", async ({ page }) => {
  await page.goto("/ko/");
  await expect(page.getByRole("heading", { level: 1, name: "보내기 전에, 사진에 뭐가 남아 있는지 보세요" })).toBeVisible();
  await expect(page.getByTestId("hero-stage")).toContainText("51.50806, -0.12806");
  await expect(page.getByTestId("sample-report").getByText("있음", { exact: true })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "샘플로 먼저 해보기" })).toHaveAttribute("href", "/ko/view/exif/?sample=1");
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx playwright test tests/e2e/home.spec.ts -g "Korean home"` → FAIL.

- [ ] **Step 3: 한국어 홈 JSX를 Task 6과 같은 구조로** — 데이터 배열과 `metadata`, 문구 불변. 배지 문구는 found → "있음", 아니면 "없음". 히어로 알약 "무료 · 업로드 없음 · 브라우저에서 바로", 세 번째 말풍선 "깨끗한 사본 준비됨", 리포트 제목 "검사 결과", 요약 "6개 중 3개 있음". 주 CTA "사진 확인하기" → `/ko/view/exif/`.

- [ ] **Step 4: 통과 확인** — Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/korean.spec.ts` → PASS.

- [ ] **Step 5: 커밋**

```bash
git add "src/app/(ko)/ko/page.tsx" tests/e2e/home.spec.ts
git commit -m "feat(design): Korean home on the new home components"
```

---

## Phase 2 · EXIF 뷰어 (도구 템플릿 확정)

### Task 8: 도구 템플릿 조각 — ToolPageHeader, ToolLayout, FileList, ActionBar, AdSlot, Prose

**Files:**
- Create: `src/components/tool/tool-page-header.tsx`, `tool-layout.tsx`, `file-list.tsx`, `action-bar.tsx`, `ad-slot.tsx`, `prose.tsx`

**Interfaces:**
- Produces: `ToolPageHeader({ crumb: string; title: string; titleAs?: "h1"; intro: string; icon: LucideIcon; tone?: IconTile tone; chips: { label: string; ok?: boolean }[]; children? })` — 브레드크럼 `text-[13px] text-muted-foreground`("Tools / <b>EXIF Viewer</b>"), `IconTile size="lg"` + `<h1 className="text-h1">` + intro(`text-base text-muted-foreground`), 칩 줄(`ok`면 `bg-status-clean text-status-clean-foreground` + Check 아이콘, 아니면 `bg-card text-muted-foreground shadow-card`), `children`은 헤더 아래 알림 자리(`MetadataRemovalNotice`가 Phase 3에서 들어간다).
- Produces: `ToolLayout({ main: ReactNode; panel: ReactNode | null; panelFirstOnMobile?: boolean; results?: ReactNode })` — `panel`이 null이면 `main`만 전체 폭. 아니면 `grid gap-5 lg:grid-cols-[1fr_400px] lg:items-start`, 패널은 `lg:sticky lg:top-24`. `panelFirstOnMobile`이면 모바일에서 패널 `order-first`(lg에서는 `lg:order-none`). `results`는 그리드 아래 `mt-6`.
- Produces: `FileList({ label: string; children })` (`<ul aria-label={label} className="divide-y divide-muted">`), `FileRow({ thumbUrl: string; name: string; meta: string; badge: ReactNode; selected?: boolean; onSelect?: () => void; ariaCurrent?: "true" })` — `<li>` 하나를 렌더하고 그 안이 `button` 전체 행 (테스트가 `listitem` 수를 센다), `grid grid-cols-[52px_1fr_auto] gap-3.5 items-center rounded-field px-3.5 py-3 text-left`, 선택 시 `bg-primary-soft ring-2 ring-ring`, 썸네일 `h-[52px] w-[52px] rounded-tile-sm object-cover bg-muted`.
- Produces: `ActionBar({ children; className? })` — `"use client"`, `useConsentBanner().open`이 false이고 화면이 lg 미만이면 `fixed inset-x-0 bottom-0 z-40 bg-card p-4 shadow-card pb-[calc(1rem+env(safe-area-inset-bottom))]`와 함께 문서 끝에 같은 높이의 스페이서(`h-24 lg:hidden`)를 렌더; open이거나 lg 이상이면 패널 안 일반 블록(`flex flex-col gap-2 pt-4`). 루트에 `data-action-bar` 속성과 `data-fixed="true|false"`.
- Produces: `AdSlot({ slot: string; className? })` — `AdSense` 호출을 감싸고, 그것이 `null`이면 자신도 `null` (높이 0). 자리 표시 테두리 없음.
- Produces: `Prose({ children; className? })` — `max-w-[720px] text-base leading-7 text-foreground [&_h2]:text-h2 [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-h3 [&_h3]:mt-8 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:p-3 [&_td]:p-3 [&_strong]:text-foreground`. (Phase 4에서 확장.)

- [ ] **Step 1: 여섯 파일 작성**

- [ ] **Step 2: 타입·린트** — Run: `npx tsc --noEmit && npx eslint src/components/tool` → 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/tool
git commit -m "feat(design): tool page template pieces (header, layout, file list, action bar, ad slot, prose)"
```

### Task 9: EXIF 뷰어 — 헤더, 드롭 영역, 2단 작업 영역, 사진 목록

**Files:**
- Modify: `src/components/ExifViewer.tsx:756-860` (헤더·드롭·배치 블록·목록)
- Test: `tests/e2e/exif-viewer.spec.ts` (케이스 추가)

**Interfaces:**
- Consumes: Task 8 전부, Task 5 `DropZone`, Task 4 `StatusBadge`, Task 2 `Button`.
- 상태(`items`, `activeId`, `picking`, `batch`, …)와 모든 핸들러, `STRINGS`, `pickOptions`, `FormatPicker`의 역할/aria, `DoneCard`의 `data-done`/`role="status"`는 건드리지 않는다.

- [ ] **Step 1: 실패하는 테스트 추가** (`exif-viewer.spec.ts` 끝)

```ts
test("with many photos on a phone the report sits above the list and nothing overflows", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  const files: string[] = [];
  for (let i = 0; i < 30; i++) {
    const file = testInfo.outputPath(`p${i}.png`);
    await page.setContent(`<div style="width:64px;height:48px;background:hsl(${i * 12} 70% 50%)"></div>`);
    await page.locator("div").screenshot({ path: file });
    files.push(file);
  }
  await page.goto("/view/exif/");
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(files);
  await expect(page.getByText("30 photos · 0 carry identifying information")).toBeVisible();
  const list = page.getByRole("list", { name: "Photos you added" });
  await expect(list.getByRole("listitem")).toHaveCount(30);
  const report = page.getByTestId("exif-report");
  expect((await report.boundingBox())!.y).toBeLessThan((await list.boundingBox())!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx playwright test tests/e2e/exif-viewer.spec.ts -g "many photos"` → FAIL (`exif-report` 없음).

- [ ] **Step 3: 헤더와 드롭 영역 교체**

`<section className="mx-auto w-full max-w-5xl px-4 pb-12">` → `<PageContainer className="pb-12">`. 756~762행의 헤더를 `ToolPageHeader crumb={locale === "ko" ? "도구 / EXIF 뷰어" : "Tools / EXIF Viewer"} title={t.title} intro={t.intro} icon={ImageIcon} tone="blue" chips={[{label:"JPG"},{label:"PNG"},{label:"WebP"},{label: t.limits(formatBytes(MAX_FILE_SIZE))},{label: t.badge, ok: true}]}`로 (H1 문구는 `t.title` 그대로 → "EXIF viewer"/"EXIF 뷰어" 유지). 드롭 블록(764~786행)을 `DropZone title={t.drop} note={t.limits(...)} dragging={dragging} busy={busy} actions={<><Button size="lg" onClick=… disabled={busy}>{busy ? t.reading : t.choose}</Button><Button variant="secondary" size="lg" onClick={openSample} disabled={busy}>{t.sample}</Button></>} onDragEnter=… onDragOver=… onDragLeave=… onDrop={onDrop}>` + 숨은 input 그대로.

- [ ] **Step 4: 작업 영역을 `ToolLayout`으로**

`{active && (<div ref={resultsRef} …>` 안을 `ToolLayout panelFirstOnMobile main={…} panel={…} results={…}`로 재배치:
- `main`: `multi`일 때 `Card`에 `CardHeader`("Photos · {items.length}" 제목 + 오른쪽 `Button size="sm" variant="secondary"` Add photos, `Button size="sm"` "Remove from all"(기존 `aria-expanded`/`aria-controls`/onClick 그대로)), 그 아래 `picking === "batch" && picker("batch")`, `batch && <DoneCard …>`(기존 그대로), `FileList label={t.listLabel}`에 `items.map → FileRow`(썸네일, 이름, `formatBytes`, 배지 `StatusBadge status={cleaned?.remaining === 0 ? "clean" : item.found ? "found" : "neutral"}` 문구 기존 그대로, `selected={current}`, `ariaCurrent`), 맨 아래 작은 점선 "Drop more photos here"는 생략(기존에 없음). `multi`가 아닐 때 `main`은 미리보기 `Card`(큰 이미지 `max-h-[420px] w-full rounded-field object-contain bg-muted`, 아래 파일명·크기·픽셀).
- `panel`: Task 10에서 채운다. 이 작업에서는 기존 "privacy check" 카드(958행 블록)를 `Card`로 감싼 뒤 루트에 `data-testid="exif-report"`를 붙여 패널 자리에 둔다.
- `results`: 기존 "Need more than a clean copy?"(`data-clean`), 카메라 설정, 전체 필드 카드를 순서대로 `Card`로.

- [ ] **Step 5: 통과 확인** — Run: `npx playwright test tests/e2e/exif-viewer.spec.ts tests/e2e/korean.spec.ts` → 전부 PASS (새 케이스 포함).

- [ ] **Step 6: 커밋**

```bash
git add src/components/ExifViewer.tsx tests/e2e/exif-viewer.spec.ts
git commit -m "refactor(design): EXIF viewer on the tool template with file list and report panel slot"
```

### Task 10: EXIF 뷰어 — 리포트 패널, Remove it now, 완료 카드, 모바일 액션 바

**Files:**
- Modify: `src/components/ExifViewer.tsx:386-440` (FormatPicker, DoneCard), 패널 부분
- Test: `tests/e2e/exif-viewer.spec.ts` (케이스 추가)

**Interfaces:**
- Consumes: `ReportPanel`/`ReportRow`/`REPORT_ICONS`, `StatusBadge`, `ActionBar`, `Checkbox`, `Button`.
- `FormatPicker`는 **버튼 묶음 그대로**: 루트 `role="group" aria-label={t.pickTitle}` 유지, 버튼은 `Button variant={option.primary ? "primary" : "secondary"} size="md" className="h-auto flex-col items-start py-2.5"` (label + note 두 줄), 그리드 유지. 체크는 `Checkbox id="shrink"` + `<label htmlFor="shrink">{t.shrink}</label>` (접근 가능한 이름이 "Shrink the long side to 2048 px (smaller file)"로 유지되는지 확인).
- 패널 = `Card` + `data-testid="exif-report"`: 머리에 `t.checkTitle` + `StatusBadge`(foundCount>0 → found `t.found` 수, 아니면 clean), 본문에 `results` 여섯 항목을 `ReportRow`로 (**발견된 것 행은 `data-check={id}` 유지, 발견 안 된 것은 지금처럼 한 줄 `data-none`에 `data-check` span들 유지** — 테스트가 `[data-none] [data-check="serial"]`를 본다), location 행 아래 OpenStreetMap 링크 유지. 그 아래 요약 상자(`foundSummary`/`noneSummary`, `role` 없음 유지) 와 `ActionBar`에 "Remove it now"(`aria-expanded`, `aria-controls` 유지) 또는 공유 버튼, `picking === "single" && picker("single")`, `cleanError`, `activeCleaned && <DoneCard …>`.

- [ ] **Step 1: 실패하는 테스트 추가**

```ts
test("on a phone the action bar never sits under the consent banner", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
  const bar = page.locator("[data-action-bar]");
  await expect(bar).toHaveAttribute("data-fixed", "false");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(bar).toHaveAttribute("data-fixed", "true");
  await expect(page.getByRole("button", { name: "Remove it now" })).toBeInViewport();
});

test("reduced motion disables the result animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  const report = page.getByTestId("exif-report");
  await expect(report).toBeVisible();
  await expect(report).toHaveAttribute("data-motion", "off");
  expect(await report.evaluate(el => el.getAttribute("style") ?? "")).not.toMatch(/opacity|transform/);
});

test("an in-app browser gets the press-and-hold preview after cleaning", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone) KAKAOTALK 10.0", viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/view/exif/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await page.getByRole("button", { name: "Remove it now" }).click();
  await page.getByRole("group", { name: "Save the clean copy as" }).getByRole("button", { name: /Clean copy as JPG/ }).click();
  await expect(page.getByText("Press and hold an image below to save it.")).toBeVisible();
  await context.close();
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx playwright test tests/e2e/exif-viewer.spec.ts -g "action bar|reduced motion|in-app"` → FAIL.

- [ ] **Step 3: `FormatPicker`, `DoneCard`, 패널 작성** (Interfaces대로). 패널 루트는 `useReducedMotion()`이 false일 때만 `motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.2}}`로 감싸고, true면 일반 `div`를 쓴다(inline style이 전혀 붙지 않게). 루트에 `data-testid="exif-report"`와 `data-motion={reduced ? "off" : "on"}`. `DoneCard`는 `ok`면 `bg-status-clean text-status-clean-foreground`, 아니면 `bg-status-found text-status-found-foreground`, 버튼은 `Button`(share primary, 나머지 secondary size sm), 미리보기 그리드 유지.

- [ ] **Step 4: 통과 확인** — Run: `npx playwright test tests/e2e/exif-viewer.spec.ts tests/e2e/korean.spec.ts tests/e2e/shell.spec.ts` → 전부 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/components/ExifViewer.tsx tests/e2e/exif-viewer.spec.ts
git commit -m "feat(design): EXIF report panel, one-tap clean copy picker and consent-aware action bar"
```

### Task 11: EXIF 페이지 설명 영역과 광고 자리 (영문·한국어)

**Files:**
- Modify: `src/app/(en)/view/exif/page.tsx:47-end`, `src/app/(ko)/ko/view/exif/page.tsx` (같은 패턴)

- [ ] **Step 1: 영문 페이지** — `<main className="min-h-screen bg-white pt-2">` → `<main>`. `<ExifViewer />` 뒤에 `<PageContainer><AdSlot slot="exif-below-tool" /><Prose as article className="mt-12">…</Prose></PageContainer>`. `<article className="… md:rounded-3xl md:border …">`의 카드 꾸밈을 없애고 `Prose` 안에 기존 내용 그대로. `SECTION`/`ICON` 상수의 h2는 `text-h2 flex items-center gap-3`, 아이콘은 `IconTile size="sm" tone="blue"`.

- [ ] **Step 2: 한국어 페이지** — 같은 처리. 크롤러용 정적 콘텐츠 분량 불변.

- [ ] **Step 3: 확인** — Run: `npx playwright test tests/e2e/exif-viewer.spec.ts tests/e2e/korean.spec.ts tests/e2e/editor.spec.ts -g "consent layout"` → PASS. `curl -s http://127.0.0.1:3000/view/exif/ | grep -c "What a photo can say about you"` → 1.

- [ ] **Step 4: 커밋**

```bash
git add "src/app/(en)/view/exif/page.tsx" "src/app/(ko)/ko/view/exif/page.tsx"
git commit -m "feat(design): EXIF pages use Prose and the reserved ad slot"
```

### Task 12: Phase 0–2 게이트 — 전체 검증, 스크린샷, 문서

**Files:**
- Modify: `CLAUDE.md` ("Design System" 절)
- Create: `docs/superpowers/plans/screenshots/2026-11-12-phase2-*.png` (검토용, 커밋하지 않는다 — `.gitignore`에 `docs/superpowers/plans/screenshots/` 추가)

- [ ] **Step 1: 전체 검사**

Run: `npx tsc --noEmit && npx eslint . && npm run build && npx playwright test`
Expected: 모두 PASS, `out/index.html`, `out/ko/index.html`, `out/view/exif/index.html`, `out/404.html` 존재.

- [ ] **Step 2: 스크린샷** — Playwright 스크립트 한 번으로 1280과 375에서 `/`, `/ko/`, `/view/exif/`(빈 상태, 샘플 열린 상태, 지운 상태)를 저장한다. 결과를 보고 설계 5절과 어긋나는 색·그림자·간격이 있으면 이 작업 안에서 고친다.

- [ ] **Step 3: Lighthouse** — Run: `npx lighthouse http://127.0.0.1:3000/view/exif/ --preset=desktop --only-categories=accessibility,performance --quiet --chrome-flags="--headless" --output=json --output-path=./.lighthouse-exif.json` (파일은 커밋하지 않음). Expected: accessibility ≥ 95. 미달이면 보고서의 감사 항목을 고친다. 모바일(`--form-factor=mobile`)로 `/`도 한 번.

- [ ] **Step 4: CLAUDE.md 갱신** — "Design System" 절을 새 토큰(`background` 크림, `primary` 남보라, 상태색), 글꼴, `shadow-card`/`shadow-primary` 둘뿐, 컴포넌트 위치(`ui/`, `site/`, `tool/`, `home/`)로 바꾸고, "Phase 3–5 전까지 `/convert/*`, `/edit/*`, 콘텐츠 페이지는 옛 스타일이며 `brand-*` 클래스는 남보라로 재지정된 임시 호환"이라고 적는다.

- [ ] **Step 5: 커밋**

```bash
git add CLAUDE.md .gitignore
git commit -m "docs: design system section for the redesign foundation"
```

---

## 다음 계획 (이 문서 범위 밖)

- **Phase 3 계획** `2026-11-xx-site-redesign-tools.md`: Image Converter(`CustomDropdown` → `Select`, 결과 ZIP 카드), PDF to Image, Image Editor(네이티브 `<select>` 유지, Tooltip 아이콘 버튼), Merge & Split(`Tabs`). `MetadataRemovalNotice`를 `ToolPageHeader children`으로. Task 8의 Interfaces를 그대로 소비한다.
- **Phase 4 계획**: `Prose` 확장, `Accordion` FAQ, 가이드 목록·본문, 정적 페이지.
- **Phase 5 계획**: `brand-*` 제거, `CustomDropdown`·`next-intl`·`next-international`·`src/i18n` 삭제, Lighthouse 비교, 배포 검증.

## Self-review 메모

- 설계 7.3의 "파일이 없을 때 패널 숨김"은 Task 9 Step 4의 `active && …` 분기와 `ToolLayout panel={null}`로 충족. "다른 행을 누르면 패널로 스크롤"은 기존 `resultsRef` 스크롤 로직이 패널 위에 있으므로 유지됨.
- 설계 6.3 `HeroStage` 말풍선 값 출처(`exif-demo.json`)는 Task 4 `demoReport`로 고정.
- 설계 13-14(`maximumScale` 제거)는 Task 1, 13-12(배너·액션 바·푸터 이동)는 Task 3과 Task 8/10, 13-13(모바일 순서)은 Task 8 `panelFirstOnMobile`과 Task 9 테스트로 고정.
- Review Focus 5개는 각각 Task 10(1, 3), Task 9(2), Task 3(4), Task 6(5)의 테스트에 들어 있다.
