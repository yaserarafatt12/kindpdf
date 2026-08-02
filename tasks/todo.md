# Kindpdf — Task Checklist (`tasks/todo.md`)

## Sprint 1: Foundation & Core Organize PDF Module (100% COMPLETE)
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

## Sprint 2: Convert to/from PDF & Image Tools (100% COMPLETE)
- [x] **Task 2.1**: Implement Images to PDF engine (`imagesToPdf.ts`) converting JPG, PNG, WEBP with page size (A4/Fit), orientation, margin controls & Vitest tests (2 unit tests passing).
- [x] **Task 2.2**: Implement PDF to Images engine (`pdfToImages.ts`) rendering PDF pages to high-DPI PNG/JPG images and exporting as ZIP & Vitest tests (1 unit test passing).

## Sprint 3: PDF Security & Annotations Suite (100% COMPLETE)
- [x] **Task 3.1**: Implement Protect PDF engine (`pdfSecurity.ts`) with user password encryption & UI workspace.
- [x] **Task 3.2**: Implement Unlock PDF engine (`pdfSecurity.ts`) with password decryption & UI workspace.
- [x] **Task 3.3**: Implement Add Page Numbers engine (`pdfAnnotations.ts`) with 6 alignment positions, format, font size controls & UI workspace.
- [x] **Task 3.4**: Implement Add Watermark engine (`pdfAnnotations.ts`) with text overlay, opacity, rotation angle, font size controls & UI workspace.

## Sprint 4: Advanced Local Tools & Optimization (100% COMPLETE)
- [x] **Task 4.1**: Implement Crop PDF engine (`cropPdf.ts`) with CropBox percentage margins, page selection parsing & UI workspace.
- [x] **Task 4.2**: Implement Edit PDF Overlay engine (`editPdfOverlay.ts`) with text, rectangle, circle, and line annotations & UI workspace.
- [x] **Task 4.3**: Implement Scan to PDF engine (`scanToPdf.ts`) with camera capture, grayscale/B&W filters, brightness adjustment & UI workspace.

## Checkpoint 4: Sprint 4 Verification
- [x] Run `npm test` and verify 100% unit tests pass (25/25 passed).
- [x] Run `npm run build` and verify clean static page generation.
- [x] Sprint 4 (Advanced Local Tools Suite) 100% COMPLETE!
