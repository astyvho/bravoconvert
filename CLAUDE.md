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

# Build for production
npm run build

# Start production server
npm start
```

Note: This project does not include linting or testing commands. ESLint is configured but no npm script is defined.

## Architecture & Key Components

### Application Structure
- **Next.js 14 App Router**: Uses the new app directory structure
- **Client-side processing**: All file conversions happen in the browser using Canvas API, PDF.js, jsPDF, and JSZip
- **TypeScript**: Strict typing throughout with path aliases (`@/*` → `./src/*`)
- **Tailwind CSS**: Utility-first styling with custom components

### Core Components

#### File Conversion Logic
- **ImageConverter** (`src/components/ImageConverter.tsx`): Main image conversion component using useReducer for state management, supports drag-and-drop file reordering with @dnd-kit/sortable
- **PDFConverter** (`src/components/PDFConverter.tsx`): PDF-to-image conversion using PDF.js, renders each page to canvas then converts to blob URLs
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
- Page components in `src/app/*/page.tsx` (convert/img, convert/pdf, faq, etc.)
- Reusable UI components in `src/components/ui/`
- Feature-specific components in `src/components/`
- Type definitions co-located with components (e.g., `image-converter/types.ts`)

### Supported Formats
- **Image inputs**: BMP, CR3, DNG, HEIC, JFIF, JPG, PNG, TIFF, GIF
- **Image outputs**: WEBP, AVIF, BMP, GIF, ICO, JFIF, JPG, PNG, TIFF, PDF
- **PDF processing**: Up to 50MB files, output to JPG/PNG

## Important Implementation Details

### File Processing Flow
1. Files are validated against supported formats on upload
2. Canvas API handles image format conversion with quality preservation
3. PDF.js renders PDF pages to canvas, then converts to image blobs
4. JSZip creates downloadable archives for batch operations
5. URL.revokeObjectURL() called for memory management


### State Management Patterns

#### ImageConverter Reducer Actions
- File management (ADD_FILES, REMOVE_FILE, REORDER_FILES)
- Format selection (SET_ADD_FORMAT, SET_CONVERT_FORMAT)  
- Conversion process (START_CONVERSION, UPDATE_PROGRESS, SET_RESULTS)
- UI state (TOGGLE_REORDER_MODE, SET_VIEW_MODE)


### SEO & Analytics
- Comprehensive meta tags and keywords in layout.tsx
- Google Analytics (G-2QXJN1E3TF) and AdSense integration
- RSS feed at /feed.xml and sitemap generation
- Domain verification for Google Search Console and Naver

### Internationalization Structure
- i18n folder prepared with locale JSON files (en, ko, de, es, fr, ja, zh)
- next-international and next-intl dependencies available but not fully implemented

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
