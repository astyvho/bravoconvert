# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BravoConvert is a Next.js 14 web application providing free online file conversion tools for images and PDFs. The application runs entirely client-side for privacy and performance, with no server uploads required.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (static export to ./out)
npm run build

# Build, then serve the export through Wrangler locally
npm run preview        # `npm start` is an alias for this

# Playwright end-to-end tests
npm run test:e2e               # tests/e2e/*.spec.ts against a local server
npm run test:production        # production.spec.ts against https://bravoconvert.com
```

Note: ESLint is configured (`eslint.config.mjs`) but has no npm script — run it with `npx eslint .`. Typecheck with `npx tsc --noEmit`.

## Architecture & Key Components

### Application Structure
- **Next.js 14 App Router**: Uses the new app directory structure
- **Client-side processing**: All file conversions happen in the browser using Canvas API, PDF.js, jsPDF, and JSZip
- **TypeScript**: Strict typing throughout with path aliases (`@/*` → `./src/*`)
- **Tailwind CSS**: Utility-first styling with custom components

### Core Components

#### File Conversion Logic
- **ImageConverter** (`src/components/ImageConverter.tsx`): Main image conversion component using useReducer for state management, supports drag-and-drop file reordering with @dnd-kit/sortable. It does not encode anything itself — it posts work to the worker below.
- **image-worker.js** (`public/workers/image-worker.js`): Where image conversion actually happens, off the main thread. Reads the JPEG orientation flag, draws through `createOrientedCanvas`, and encodes with `OffscreenCanvas.convertToBlob`. Because output is re-encoded from decoded pixels, source EXIF never carries over. A target size is reached by binary-searching quality over 7 attempts, so it is approached rather than calculated.
- **ImageEditor** (`src/components/ImageEditor.tsx`): Single-image resize/rotate/flip at `/edit/image/`, separate from the converter by design — do not merge editing controls into ImageConverter (see AGENTS.md).
- **PDFConverter** (`src/components/PDFConverter.tsx`): PDF-to-image conversion using PDF.js, renders each page to canvas then converts to blob URLs
- **PdfOrganizer** (`src/components/PdfOrganizer.tsx`) at `/edit/pdf/`: merge, page-range extraction, and split-every-page. The logic lives in `src/lib/pdf-tools.ts` (pdf-lib `copyPages`, so pages are copied, never rasterized). Measured trade-offs: bookmarks and accessibility tags (StructTreeRoot) do not carry over, and split-every-page totals ~2× the source because each file carries its own fonts. Encrypted PDFs are rejected.
- **ExifViewer** (`src/components/ExifViewer.tsx`) at `/view/exif/`: read-only metadata check with a six-item privacy checklist. Reading lives in `src/lib/photo-metadata.ts`. **exifr has no WebP parser** ("Unknown file format"), so WebP's RIFF `EXIF` chunk is extracted by hand and passed to exifr as TIFF bytes. `reviveValues: false` keeps EXIF dates as the original strings — they carry no timezone, and reviving them shifts the wall-clock time into the viewer's zone.
- **CustomDropdown** (`src/components/ui/CustomDropdown.tsx`): Custom select component with 2-column grid layout, animations, and keyboard navigation

#### State Management Patterns
- ImageConverter uses useReducer with actions for ADD_FILES, REMOVE_FILE, REORDER_FILES, SET_CONVERT_FORMAT, etc.
- PDFConverter uses multiple useState hooks with careful ordering to avoid React hooks violations
- File processing is async with progress tracking and error handling

#### Client-side Processing Libraries
- **PDF.js**: PDF rendering and page extraction
- **jsPDF**: Creating PDFs from images  
- **JSZip**: Bundling multiple files for download
- **Canvas API**: Image format conversion and rendering

### Design System
- **Round design**: All components use rounded corners (`rounded-xl`, `rounded-2xl`)
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Consistent hover states**: `hover:bg-gray-200` throughout
- **lucide-react icons**: Consistent icon system
- **Framer Motion**: Smooth animations and transitions

### File Structure Patterns
- Page components in `src/app/*/page.tsx` — tools at `convert/img`, `convert/pdf`, `edit/image`; content at `guides/*`, `faq`, `how-to-use`, `about`, `contact`, `changelog`, `privacy-policy`, `terms`
- Reusable UI components in `src/components/ui/`
- Feature-specific components in `src/components/`
- Type definitions co-located with components (e.g., `image-converter/types.ts`)
- Generated measurement data in `src/data/*.json`, produced by `scripts/` (see Guide Data Generation) — edit the script and re-run it, never hand-edit the JSON

### Supported Formats

Verified against the source, not aspirational. The format lists live in
`src/components/image-converter/formats.ts`; the ceilings are constants in the
components themselves.

| Tool | Accepts | Produces | Ceiling |
|---|---|---|---|
| Image Converter (`/convert/img/`) | JPG / JPEG / JPE / JFIF, PNG, WebP | WebP, JPG, PNG, PDF | 10 MB per image |
| Image Editor (`/edit/image/`) | JPG / JPEG, PNG, WebP | JPG, PNG, WebP | 10 MB, 16,384 px per side, 64 megapixels |
| PDF Converter (`/convert/pdf/`) | PDF | PNG, JPG | 50 MB per document |
| PDF Merge & Split (`/edit/pdf/`) | PDF | PDF, or ZIP of single-page PDFs | 50 MB per file; merge ≤ 30 files and 150 MB total |
| EXIF Viewer (`/view/exif/`) | JPG, PNG, WebP | nothing — read-only | 25 MB |

**HEIC, RAW (CR2/CR3/DNG), TIFF, GIF, BMP, SVG and AVIF are not supported as
input.** Input is validated by MIME type, so renaming an extension does not get a
file past the check. Do not describe any of these as supported in marketing copy
or guides — an earlier revision of this file claimed they were, and the guides had
to be corrected.

PDF rendering specifics that content frequently needs: `PDFConverter.tsx` renders
at `scale = 2.0`, and since PDF user space is 72 units per inch that is **144 DPI**
(A4 → 1190×1684 px). JPG output is encoded at **quality 0.95**, which on a
text-heavy page produces a file roughly 1.5× the size of the PNG output. Encrypted
or password-protected PDFs cannot be opened.

## Important Implementation Details

### File Processing Flow
1. Files are validated by MIME type and size on upload
2. Image conversion is handed to `public/workers/image-worker.js`, which decodes to an ImageBitmap, applies EXIF orientation, and re-encodes with `OffscreenCanvas.convertToBlob` — the re-encode is why output carries no source metadata
3. PDF.js renders PDF pages to canvas at scale 2.0, then converts to image blobs
4. JSZip creates downloadable archives for batch operations
5. URL.revokeObjectURL() called for memory management

Nothing is ever uploaded. Every size ceiling above exists because the file has to
fit in the visitor's own memory, which is also why large jobs fail on phones
before they fail on desktops.


### State Management Patterns

#### ImageConverter Reducer Actions
- File management (ADD_FILES, REMOVE_FILE, REORDER_FILES)
- Format selection (SET_ADD_FORMAT, SET_CONVERT_FORMAT)  
- Conversion process (START_CONVERSION, UPDATE_PROGRESS, SET_RESULTS)
- UI state (TOGGLE_REORDER_MODE, SET_VIEW_MODE)


### SEO & Analytics
- Comprehensive meta tags and keywords in layout.tsx
- Google Analytics (G-2QXJN1E3TF) and AdSense (`ca-pub-6552891879490275`) tags load on **every** page from the layout head, unconditionally. Storage is governed by the denied-by-default Consent Mode v2 block above them, which `ConsentManager` updates. Do not gate the script tags behind consent — doing so previously left crawlers and the AdSense reviewer seeing a site with no ad code.
- Feeds at both `/rss` and `/feed.xml`; `sitemap.ts` generates `/sitemap.xml`
- `next.config.js` sets `trailingSlash: true`. Every `alternates.canonical` and every sitemap entry **must** end in a slash or Google gets a 308. Note that Next.js already appends the slash when rendering `<Link href="/faq">`, so the emitted HTML is correct even where the JSX omits it — check rendered output, not JSX, before "fixing" this.
- Domain verification for Google Search Console and Naver

### Guide Data Generation

The `/guides` articles are built on measured numbers rather than rules of thumb.
Three scripts produce that evidence, and the pages import the JSON, so re-running a
script updates every figure on the site:

- `node scripts/generate-guide-assets.mjs` → `src/data/format-benchmarks.json` plus imagery in `public/guides/`. Encodes test images through Canvas `toBlob` in Playwright's Chromium — deliberately the same encode path the site uses, so the numbers are the site's own output.
- `node scripts/generate-exif-demo.mjs` → `src/data/exif-demo.json`. Builds a JPEG with a real EXIF block (make, model, timestamp, orientation, GPS), round-trips it through the worker's canvas path, and re-parses with `exifr` to prove metadata does not survive.

- `node --experimental-strip-types scripts/generate-pdf-tool-data.mjs` → `src/data/pdf-tool-benchmarks.json`. Prints two tagged, bookmarked PDFs from Chromium and runs them through `src/lib/pdf-tools.ts` — the exact code `/edit/pdf/` uses — then checks size, bookmarks, tags, and that text is still extractable.

All three need `npx playwright install chromium` once.

### Deployment

`git push` to `main` triggers a **Cloudflare Pages** build that serves
bravoconvert.com. Verify with
`npx wrangler pages deployment list --project-name=bravoconvert`, then curl the
real domain — the CDN can serve the previous HTML for 60–90 seconds after the
deployment shows Active, and the Pages preview URL for a production deployment
returns 404 publicly, so it is useless for verification.

`npm run deploy` publishes to a **separate Workers project** that is not attached
to the custom domain. It does not update production; do not use it to ship.

### Internationalization Structure
- `src/i18n` holds locale JSON files (en, ko, de, es, fr, ja, zh), but nothing imports them
- `next-international` and `next-intl` are installed and unused — no locale routing exists
- **The site ships in English.** User-facing strings must be English; Korean belongs only in code comments. A batch of Korean error messages shipped in `PDFConverter.tsx` until 2026-09-02 and had to be translated.

## Development Guidelines

### Component Patterns
- Use "use client" directive for interactive components
- Co-locate types with components when feature-specific
- Implement proper loading states and error boundaries
- Use Canvas API for client-side image processing
- Implement drag-and-drop with @dnd-kit libraries

### Styling Conventions
- Follow the established round design system
- Use Tailwind utilities with consistent spacing
- Implement hover states for interactive elements
- Use backdrop-blur and transparency for glass effects
- Maintain consistent button and card styling patterns

### Performance Considerations
- All file processing happens client-side for privacy
- Use proper cleanup (URL.revokeObjectURL) to prevent memory leaks
- Implement progress tracking for long operations
- Use lazy loading and code splitting where appropriate
