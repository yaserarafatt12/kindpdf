# Kindpdf — Task Checklist (`tasks/todo.md`)

## Sprint 1: Foundation & Core Organize PDF Module (100% COMPLETE)
- [x] **Task 1.1**: Scaffold workspace with Next.js 14, TypeScript, Tailwind CSS, `pdf-lib`, `pdfjs-dist`, Vitest, Playwright.
- [x] **Task 1.2**: Implement core PDF validation (`validateFile.ts`) checking `%PDF-` magic bytes, password encryption, max size (100MB), and corruption.
- [x] **Task 1.3**: Implement client-side Merge PDF engine (`mergePdfs.ts`) with progress callback.
- [x] **Task 1.4**: Build Header with `Kindpdf` logo, 3-line hamburger drawer menu, `EN` | `ID` dropdown, and Light mode default.
- [x] **Task 1.5**: Build compact Tool Grid layout with original vector icons based on document-processing conventions.
- [x] **Task 1.6**: Build Merge PDF workspace with prominent primary `Pilih Berkas PDF` CTA button.
- [x] **Task 1.7**: Implement Split PDF engine (`splitPdf.ts`) supporting custom range parsing (e.g. `1-3,5,8-10`), N-page splitting, and ZIP export.
- [x] **Task 1.8**: Build Split PDF UI workspace & Vitest tests.
- [x] **Task 1.9**: Implement Extract Pages engine (`pageOperations.ts`) with single PDF or ZIP output options & Vitest tests.
- [x] **Task 1.10**: Implement Organize Pages interactive thumbnail preview grid (rotate 90°/180°/270°, reorder, delete pages) & Vitest tests.

## Sprint 2: Convert to/from PDF & Image Tools (100% COMPLETE)
- [x] **Task 2.1**: Implement Images to PDF engine (`imagesToPdf.ts`) converting JPG, PNG, WEBP with page size (A4/Fit), orientation, margin controls & Vitest tests.
- [x] **Task 2.2**: Implement PDF to Images engine (`pdfToImages.ts`) rendering PDF pages to high-DPI PNG/JPG images and exporting as ZIP & Vitest tests.

## Sprint 3: PDF Security & Annotations Suite (100% COMPLETE)
- [x] **Task 3.1**: Implement Protect PDF engine (`pdfSecurity.ts`) with user password encryption & UI workspace (`Experimental`).
- [x] **Task 3.2**: Implement Unlock PDF engine (`pdfSecurity.ts`) with password decryption & UI workspace (`Experimental`).
- [x] **Task 3.3**: Implement Add Page Numbers engine (`pdfAnnotations.ts`) with 6 alignment positions, format, font size controls & UI workspace (`Stable`).
- [x] **Task 3.4**: Implement Add Watermark engine (`pdfAnnotations.ts`) with text overlay, opacity, rotation angle, font size controls & UI workspace (`Stable`).

## Sprint 4: Advanced Local Tools Suite (100% COMPLETE)
- [x] **Task 4.1**: Implement Crop PDF engine (`cropPdf.ts`) with CropBox percentage margins, page selection parsing & UI workspace (`Stable`).
- [x] **Task 4.2**: Implement Edit PDF Overlay engine (`editPdfOverlay.ts`) with text, rectangle, circle, and line annotations & UI workspace (`Beta`).
- [x] **Task 4.3**: Implement Scan to PDF engine (`scanToPdf.ts`) with camera capture, grayscale/B&W filters, brightness adjustment & UI workspace (`Beta`).

## Sprint 5: PDF Utility & Security Extras (100% COMPLETE)
- [x] **Task 5.1**: Implement Add Signature engine (`signPdf.ts`) with drawing canvas pad, typed name option, position sliders & UI workspace (`Stable`).
- [x] **Task 5.2**: Implement Visual Blackout engine (`redactPdf.ts`) with solid black redaction boxes per page & UI workspace (`Experimental`).
- [x] **Task 5.3**: Implement Compare PDF engine (`comparePdf.ts`) with structural analysis & side-by-side comparison report UI (`Beta`).
- [x] **Task 5.4**: Implement Basic PDF Recovery engine (`repairPdf.ts`) with xref stream recovery & clean object re-serialization UI (`Experimental`).
- [x] **Task 5.5**: Implement Basic PDF Optimization engine (`compressPdf.ts`) with object stream optimization & delta calculation UI (`Experimental`).

## Sprint 6: Client-Side Conversion Extras (100% COMPLETE)
- [x] **Task 6.1**: Implement HTML / Notes to PDF engine (`htmlToPdf.ts`) with rich text/HTML document formatting & UI workspace (`Beta`).
- [x] **Task 6.2**: Implement PDF/A Preparation engine (`pdfToPdfA.ts`) with ISO 19005 metadata & archival compliance UI (`Experimental`).

## Sprint 7: Office & OCR Conversion Suite (100% COMPLETE)
- [x] **Task 7.1**: Implement DOCX to PDF engine (`wordToPdf.ts`) text-first parsing `.docx` XML container streams & UI workspace (`Beta`).
- [x] **Task 7.2**: Implement PDF to DOCX engine (`pdfToWord.ts`) extracting text content into editable `.docx` & UI workspace (`Beta`).
- [x] **Task 7.3**: Implement Extract Text / OCR engine (`ocrPdf.ts`) with browser text layer extraction, copy, and `.txt` export UI (`Experimental`).

## Sprint 8: Truthfulness & Manifest Audit (100% COMPLETE)
- [x] **Task 8.1**: Create Single Source of Truth Tool Manifest (`src/lib/tools/manifest.ts`) mapping exactly 23 active standalone tools.
- [x] **Task 8.2**: Add manifest integrity unit tests in `tests/unit/manifest.test.ts` (36 unit tests passing total).
- [x] **Task 8.3**: Align README, PRD, AI Disclosure, and todo.md with honest technical terms (`Add Signature`, `Visual Blackout`, `Basic PDF Optimization`, `Basic PDF Recovery`, `DOCX to PDF`, `Extract Text / OCR`, `PDF/A Preparation`).
