# Task Checklist: LocalPDF — Sprint 1 (Merge PDF Foundation)

## Phase 1: Project Setup & Core Foundations
- [x] Task 1: Project Directory Setup & Documentation Specifications (`docs/product-requirements.md`, `docs/architecture.md`, `docs/privacy.md`, `docs/decisions.md`)
- [ ] Task 2: Build `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `.gitignore`, `LICENSE`, `CHANGELOG.md`, `README.md`
- [ ] Task 3: Build Base Layout & Navigation Header (`src/app/layout.tsx`, `src/app/page.tsx`, `src/components/PrivacyNotice.tsx`)

## Phase 2: File Dropzone & Validation Engine
- [ ] Task 4: Build File Validation Utilities (`src/lib/files/validateFile.ts`, `formatFileSize.ts`, `src/lib/errors/messages.ts`)
- [ ] Task 5: Build `FileDropzone.tsx` component with drag-and-drop & native file selection

## Phase 3: Merge PDF Queue & Reordering
- [ ] Task 6: Build `FileCard.tsx` displaying document name, size, page count, and remove button
- [ ] Task 7: Implement Drag-and-Drop file reordering in the merge queue

## Phase 4: Local PDF Merge Engine & Export
- [ ] Task 8: Build `src/lib/pdf/mergePdfs.ts` using `pdf-lib` to merge multiple PDF files in browser
- [ ] Task 9: Build `ProcessingProgress.tsx` component & `downloadBlob.ts` download utility
- [ ] Task 10: Write Vitest Unit Tests (`tests/unit/validateFile.test.ts` & `tests/unit/mergePdfs.test.ts`)
