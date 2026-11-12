# 사이트 리뉴얼 Phase 4 구현 계획: 콘텐츠 페이지

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가이드(영문 7 + 목록, 한국어 2 + 목록), FAQ, How to use, About, Contact, Changelog, Privacy Policy, Terms, 404를 설계 7.4절의 콘텐츠 페이지 형식으로 다시 그린다.

**Architecture:** 공통 머리 `ContentHeader`(살구 알약 라벨, H1, 한 줄, 날짜 보조 글자)와 기존 `Prose`(본문 720px, 표·그림 880px까지)로 모든 콘텐츠 페이지를 감싼다. 본문 안의 팔레트 클래스는 스크립트로 토큰에 일대일 대응시키고, 머리와 카드 격자처럼 구조가 바뀌는 부분만 손으로 고친다. FAQ는 네이티브 `<details>` 기반 `Accordion`(정적 HTML에 답이 남아야 해서), 가이드 목록은 홈 `ToolCard`와 같은 카드, 404는 도구 카드 네 장.

**Tech Stack:** Next.js 14.2 static export, Tailwind 3.4, shadcn/ui 토큰, lucide-react, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-12-site-redesign-design.md` 7.4절(콘텐츠 페이지), 5절(토큰), 9절(불변 목록), 10절 Phase 4.

## Global Constraints

- 문구·수치·링크·URL·메타데이터·JSON-LD·`alternates`는 한 글자도 바꾸지 않는다(9절). 분량을 줄이지 않는다. 수치는 계속 `src/data/*.json`에서 읽는다.
- E2E가 매칭하는 것 유지: "The comment survived every time", "메모는 매번 살아남았습니다", "모든 필드가 사라졌습니다.", `pdf-metadata-sample.pdf` 링크(href `/guides/pdf-metadata-sample.pdf`), `/guides/` 셸 테스트.
- 토큰 클래스만: `gray-*`, `brand-*`, `blue-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, `text-black`, `bg-black`, `from-*`/`to-*` 그라데이션 금지. 그림자는 `shadow-soft`/`shadow-cta`만. `hover:-translate-y-*`, `hover:shadow-xl` 금지.
- 상태 색은 의미대로: "발견/남음"은 `status-found`, "없음/지워짐"은 `status-clean`, 오류는 `destructive`. 장식에 쓰지 않는다.
- 한국어 페이지는 `break-keep`, 링크의 `(영문)` 표시 유지.
- `SiteHead.tsx`, `src/lib/*`, `src/data/*.json`, `public/workers/*`는 수정하지 않는다.
- 게이트: `npx tsc --noEmit`, 해당 spec. 커밋은 작업마다, 명시한 경로만, 메시지 끝 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. push·merge·deploy 하지 않는다(사용자가 디플로이하자고 할 때까지 로컬).

## Review Focus

1. **FAQ 답이 정적 HTML에 있는가**: 접힌 답도 `out/faq/index.html`에 들어 있어야 검색 엔진이 읽는다. → Task 2.
2. **넓은 표가 있는 가이드를 375px에서**: 표가 페이지 가로 넘침을 만들지 않고 자기 상자 안에서 스크롤된다. → Task 1 헬퍼 (b), 각 작업이 사용.
3. **키보드로 FAQ**: Tab으로 질문에 가고 Enter/Space로 열고 닫는다. → Task 2.
4. **H1이 하나**: 머리를 바꾸면서 H1이 둘이 되거나 사라지지 않는다. → Task 1 헬퍼 (c).
5. **한국어 가이드의 영문 링크 표시**: `(영문)`과 `hrefLang="en"`이 그대로. → Task 4.

---

## 파일 구조

```
src/components/content/content-header.tsx   (새) 라벨 알약 + H1 + 한 줄 + 보조 글자(meta)
src/components/ui/accordion.tsx             (새) <details>/<summary> 기반 Accordion, AccordionItem
src/components/tool/prose.tsx               표·그림 880px, 카드 격자·코드·표 테두리 토큰 스타일 추가
scripts/ 아님 — 변환 스크립트는 .superpowers/ 에 (커밋 안 함)
tests/e2e/content-design.spec.ts            (새) 콘텐츠 페이지 공통 검사
src/app/(en)/faq, guides/**, how-to-use, about, contact, changelog, privacy-policy, terms, page-not-found
src/app/(ko)/ko/guides/**
```

---

### Task 1: ContentHeader, Prose 확장, 공통 테스트 헬퍼, 첫 페이지(About)

**Interfaces — Produces:**
- `ContentHeader({ label, title, intro, meta, lang }: { label: string; title: ReactNode; intro?: ReactNode; meta?: ReactNode; lang?: "ko" })` — `<header>` 안에 `span.rounded-full.bg-muted.text-caption`(라벨), `h1.text-h1`(모바일 30px), `p.text-lg.text-muted-foreground`(intro), `p.text-sm.text-muted-foreground`(meta). 왼쪽 정렬, `max-w-[720px]`.
- `Prose`에 `wide` 처리: `[&_table]`의 감싸는 `div`·`figure`는 `.prose-wide` 클래스로 `lg:-mx-20`(최대 880px). 표 감싸개는 `overflow-x-auto`.
- `tests/e2e/content-design.spec.ts`의 `expectContentRedesigned(page, url)`: 375×812에서 (a) 팔레트 클래스 0개(도구 템플릿과 같은 선택자 + `[class*="from-black"]`, `[class*="blue-"]`), (b) `scrollWidth <= 375`, (c) `h1` 정확히 1개, (d) `header` 안 라벨 알약(`[data-content-label]`) 존재.
- 변환 스크립트 `.superpowers/content_to_tokens.py <page>`: 바깥 `main`/`max-w-4xl` → `PageContainer`, 기존 header → 표시(수동 교체 지점), `article` 감싸개 → `Prose as="article"`, h2 아이콘 → `IconTile size="sm" tone="blue"`, 팔레트 → 토큰 대응표(`text-gray-7/8/600` → `text-muted-foreground`, `text-black` → `text-foreground`, `bg-gray-50/100` → `bg-muted`, `border-gray-*`·`border-black` → `border-border`, `bg-blue-50`·`border-blue-200` → `bg-primary-soft`, `bg-white` → `bg-card`, `bg-black`·그라데이션 숫자 배지 → `bg-primary text-primary-foreground`, `text-red-700` → `text-destructive-foreground`, `text-green-700` → `text-status-clean-foreground`, `bg-amber-50`/`border-amber-200` → `bg-status-found`, `bg-green-50` → `bg-status-clean`), `shadow-lg`/`hover:shadow-xl`/`transition-all duration-300` 제거, 남은 팔레트 클래스 목록 출력.

- [ ] Step 1: `content-design.spec.ts`에 헬퍼와 `"About uses the content template"` 작성 → 실행 FAIL.
- [ ] Step 2: `content-header.tsx`, Prose 확장, 변환 스크립트 작성. About에 적용(머리는 `ContentHeader label="About"`).
- [ ] Step 3: `npx tsc --noEmit && npx playwright test tests/e2e/content-design.spec.ts tests/e2e/shell.spec.ts` PASS → 커밋 `feat(design): content page header and the About page`.

### Task 2: FAQ와 Accordion

- `Accordion` = `<div>` 목록, `AccordionItem({ question, children })` = `<details className="group rounded-field bg-card shadow-soft">` + `<summary>`(질문 `h3` 안, 오른쪽 `ChevronDown`이 `group-open:rotate-180`, `motion-reduce:transition-none`) + 답 `div`. 카테고리는 `h2`.
- 테스트 `faq.spec`(content-design.spec 안): 템플릿 검사; `page.request.get("/faq/")` 본문에 첫 카테고리 마지막 질문의 답 문장이 있다; 질문에 focus → Enter → 답 보임 → Enter → 숨음.
- [ ] RED → 구현 → `npx playwright test tests/e2e/content-design.spec.ts` PASS → 커밋 `feat(design): FAQ as an accordion`.

### Task 3: 영문 가이드 목록과 가이드 7편

- 목록: `ContentHeader label="Guides"`, 가이드 카드 격자는 `ToolCard`(아이콘 tone 순환 blue/yellow/green/pink/peach, `cta="Read the guide"`, `body`=기존 설명, `points`=기존 finding이 있으면 한 줄). 카드 아래 기존 본문은 Prose.
- 각 가이드: `ContentHeader label="Guide"`, meta = 기존 `Published … · Updated …` 그대로(`<time>` 유지). 본문 Prose, 표는 `prose-wide` 감싸개, 측정 결과 상자(초록/주황 의미 있는 것)는 상태 토큰.
- 테스트: 8페이지 각각 `expectContentRedesigned`; 기존 editor/korean spec 통과.
- [ ] RED → 변환 스크립트 + 머리 수동 교체 → PASS → 커밋 `feat(design): English guides on the content template`.

### Task 4: 한국어 가이드 목록과 가이드 2편

- 라벨 `가이드`, 한국어 페이지 `break-keep`, `(영문)`·`hrefLang="en"` 유지.
- 테스트: 3페이지 `expectContentRedesigned`; `korean.spec` 통과; `/ko/guides/` 영문 링크에 `hreflang="en"`이 그대로 있다.
- [ ] RED → 구현 → PASS → 커밋 `feat(design): Korean guides on the content template`.

### Task 5: How to use, Contact, Changelog, Privacy Policy, Terms

- 라벨: "How to use", "Contact", "Changelog", "Legal", "Legal". Changelog 항목은 날짜를 보조 글자로 한 카드 목록. How to use의 단계 번호 배지는 `bg-primary text-primary-foreground`.
- 테스트: 5페이지 `expectContentRedesigned`.
- [ ] RED → 구현 → PASS → 커밋 `feat(design): remaining static pages on the content template`.

### Task 6: 404

- 같은 셸, H1 "Page not found" 유지, 문장 두 줄 유지, 기존 버튼 세 개 유지 + 그 아래 도구 카드 네 장(Image Converter, PDF to Image, Image Editor, Merge & Split PDF — 홈과 같은 `ToolCard`, cta "Open").
- 테스트: `/page-not-found/`에 `ToolCard` 링크 4개(`/convert/img/`, `/convert/pdf/`, `/edit/image/`, `/edit/pdf/`)와 `expectContentRedesigned`.
- [ ] RED → 구현 → PASS → 커밋 `feat(design): 404 with the tool cards`.

### Task 7: Phase 4 게이트

- 전체 스위트(`--grep-invert production`), 미리보기 서버 멈추고 `rm -rf .next && npm run build`, `out/faq/index.html`에 답 문장, Lighthouse 접근성(FAQ, 가이드 1편, 한국어 가이드 1편, About) 100, 스크린샷 `docs/superpowers/plans/screenshots/phase4/`, `CLAUDE.md` 디자인 절 갱신(Phase 4 완료), 미리보기 서버 재시작.
- 커밋 `docs: phase 4 content pages in the design system section`.

## Self-review 메모

- 7.4절 항목: 머리(라벨·H1·한 줄·날짜) → Task 1 `ContentHeader`; Prose 720/880 → Task 1; FAQ Accordion → Task 2; 가이드 목록 카드 → Task 3·4; 404 → Task 6. 대상 페이지 목록 전부 Task 1–6에 있음.
- `expectContentRedesigned`는 Task 1이 만들고 2–6이 쓴다. `ContentHeader` props 이름은 모든 작업에서 같다.
