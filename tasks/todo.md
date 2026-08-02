# Kindpdf — Task Checklist (`tasks/todo.md`)

## Sprint 1: Foundation & Core Organize PDF Module

- [x] **Task 1.1**: Scaffold workspace with Next.js 14, TypeScript, Tailwind CSS, `pdf-lib`, `pdfjs-dist`, Vitest, Playwright.
- [x] **Task 1.2**: Implement core PDF validation (`validateFile.ts`) checking `%PDF-` magic bytes, password encryption, max size (100MB), and corruption.
- [x] **Task 1.3**: Implement client-side Merge PDF engine (`mergePdfs.ts`) with progress callback.
- [x] **Task 1.4**: Build Header with `Kindpdf` logo, 3-line hamburger drawer menu, `EN` | `ID` dropdown, and Light mode default.
- [x] **Task 1.5**: Build compact Tool Grid layout with custom vector SVG icons matching iLovePDF.
- [x] **Task 1.6**: Build simple Merge PDF workspace with prominent primary `Pilih Berkas PDF` CTA button.
- [ ] **Task 1.7**: Implement Split PDF engine (`splitPdfs.ts`) supporting custom range parsing (e.g. `1-3,5,8-10`), N-page splitting, and ZIP export.
- [ ] **Task 1.8**: Build Split PDF UI workspace & Vitest tests.
- [ ] **Task 1.9**: Implement Remove Pages & Extract Pages engines (`removePages.ts`, `extractPages.ts`).
- [ ] **Task 1.10**: Build Interactive Thumbnail Grid component with page selection checkboxes.
- [ ] **Task 1.11**: Implement Organize Pages engine (reorder, rotate, delete) with Web Worker offloading.

## Checkpoint 1: Sprint 1 Verification
- [ ] Run `npm test` and verify 100% unit tests pass.
- [ ] Run `npm run build` and verify clean static generation.
- [ ] Perform manual QA on mobile (375px) and desktop (1440px).
