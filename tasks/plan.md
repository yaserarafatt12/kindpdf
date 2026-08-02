# Implementation Plan: LocalPDF — Sprint 1 (Merge PDF Foundation)

## Overview

Build the foundation and first core tool (**Merge PDF**) for **LocalPDF** using Next.js 14, React 18, TypeScript, Tailwind CSS, and `pdf-lib`. Sprint 1 delivers a fully working 100% in-browser PDF merge utility with drag-and-drop file upload, file reordering, page count calculation, file validation, progress state, and direct blob download.

## Architectural Decisions

- **ADR-001:** Use `pdf-lib` for in-browser PDF merging and `pdfjs-dist` for page rendering.
- **ADR-002:** Execute heavy PDF operations asynchronously off the main thread.
- **ADR-003:** Ephemeral React state memory management with zero `localStorage` file persistence.

---

## Sprint 1 Task List (7-Day Roadmap)

### Phase 1: Project Setup & Core Foundations
- [ ] Task 1: Initialize Next.js 14 App Router codebase, Tailwind CSS design system, `pdf-lib`, `pdfjs-dist`, Vitest, and Playwright configurations.
- [ ] Task 2: Build UI Shell & Privacy Header (`PrivacyNotice.tsx`, Header with `LocalPDF by edsheero` brand, and Navigation bar).

### Checkpoint: Foundations
- [ ] Next.js dev server starts cleanly without errors.
- [ ] Tailwind CSS design system and typography initialized.

### Phase 2: File Dropzone & Validation Engine
- [ ] Task 3: Build `FileDropzone.tsx` component supporting drag-and-drop & native file picker for PDF files.
- [ ] Task 4: Build file validation utilities (`lib/files/validateFile.ts`) inspecting magic bytes, file size limits (< 100 MB), password encryption, and corrupted files with human-friendly error messages.

### Checkpoint: File Validation
- [ ] Corrupted, encrypted, non-PDF, and oversized files rejected with clear human error toasts.
- [ ] Valid PDF files load into state cleanly.

### Phase 3: Merge PDF Queue & Reordering
- [ ] Task 5: Build `FileCard.tsx` component displaying document name, size, page count, and delete button.
- [ ] Task 6: Implement drag-and-drop file reordering queue using HTML5 Drag and Drop API.

### Phase 4: Local PDF Merge Engine & Export
- [ ] Task 7: Build `lib/pdf/mergePdfs.ts` using `pdf-lib` to load multiple ArrayBuffers, copy pages into a new PDF document, and export as `Blob`.
- [ ] Task 8: Build `ProcessingProgress.tsx` component with progress percentage, cancel action, and direct Blob download helper (`lib/files/downloadBlob.ts`).

### Checkpoint: Merge PDF Tool Complete
- [ ] 100% in-browser PDF merge works end-to-end.
- [ ] All Vitest unit tests pass 100%.
- [ ] Files processed locally without server upload.
