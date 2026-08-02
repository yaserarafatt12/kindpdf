# Kindpdf — Task Checklist (`tasks/todo.md`)

## Sprint 1: Foundation & Core Organize PDF Module

- [x] **Task 1.1**: Scaffold workspace with Next.js 14, TypeScript, Tailwind CSS, `pdf-lib`, `pdfjs-dist`, Vitest, Playwright.
- [x] **Task 1.2**: Implement core PDF validation (`validateFile.ts`) checking `%PDF-` magic bytes, password encryption, max size (100MB), and corruption.
- [x] **Task 1.3**: Implement client-side Merge PDF engine (`mergePdfs.ts`) with progress callback.
- [x] **Task 1.4**: Build Header with `Kindpdf` logo, 3-line hamburger drawer menu, `EN` | `ID` dropdown, and Light mode default.
- [x] **Task 1.5**: Build compact Tool Grid layout with custom vector SVG icons matching iLovePDF.
- [x] **Task 1.6**: Build simple Merge PDF workspace with prominent primary `Pilih Berkas PDF` CTA button.
- [x] **Task 1.7**: Implement Split PDF engine (`splitPdf.ts`) supporting custom range parsing (e.g. `1-3,5,8-10`), N-page splitting, and ZIP export.
- [x] **Task 1.8**: Build Split PDF UI workspace & Vitest tests (4 unit tests passing).
- [x] **Task 1.9**: Implement Extract Pages engine (`pageOperations.ts`) with single PDF or ZIP output options & Vitest tests (3 unit tests passing).
- [x] **Task 1.10**: Implement Remove Pages & Organize Pages interactive thumbnail preview grid (rotate 90°/180°/270°, reorder, delete pages) & Vitest tests (2 unit tests passing).

## Checkpoint 1: Sprint 1 Verification
- [x] Run `npm test` and verify 100% unit tests pass (14/14 passed).
- [x] Run `npm run build` and verify clean static generation.
- [x] Sprint 1 (Core Organize PDF Suite: Merge, Split, Extract, Organize, Remove Pages) 100% COMPLETE!
