# Product Requirements Document (PRD): Kindpdf

**Project Name:** Kindpdf  
**Version:** 1.0.0 (Production Release)  
**Date:** August 2, 2026  
**Status:** Completed (23 Active Tools Defined in Manifest)  

---

## 1. Executive Summary

Kindpdf is a client-side, privacy-first web application designed to reduce data security risks associated with cloud-based PDF processing. By executing binary document manipulation within browser RAM memory using WebAssembly and client-side JavaScript engines, Kindpdf processes documents locally without uploading files to remote API servers.

---

## 2. Product Architecture & 5 Subsystems (23 Active Tools)

All active tools are registered in a single typed manifest (`src/lib/tools/manifest.ts`):

### 2.1 Subsystem 1: Organize & Pages (5 Tools)
1. **Merge PDF** (`Stable`, Popular) — Combine multiple PDF files with drag-and-drop page reordering.
2. **Split PDF** (`Stable`, Popular) — Separate PDF by page range (`1-3,5`), N pages per file, or extract to ZIP.
3. **Organize Pages** (`Stable`, Popular) — Reorder, rotate (90°, 180°, 270°), or delete pages visually (*Includes Remove Pages and Rotate Pages functions*).
4. **Extract Pages** (`Stable`) — Extract selected pages into a new PDF or ZIP archive.
5. **Crop PDF** (`Stable`) — Trim margins using CropBox controls.

### 2.2 Subsystem 2: Convert to PDF (4 Tools)
6. **Images to PDF** (`Stable`, Popular) — Convert JPG, PNG, WEBP images to PDF with custom margins.
7. **DOCX to PDF** (`Beta`) — Text-first conversion of Word documents (.docx) to PDF.
8. **HTML / Notes to PDF** (`Beta`) — Convert formatted text and HTML notes into PDF documents.
9. **Scan to PDF** (`Beta`) — Capture physical documents using webcam/camera with filters.

### 2.3 Subsystem 3: Convert from PDF (4 Tools)
10. **PDF to Images** (`Stable`, Popular) — Render PDF pages into PNG/JPG images exported as ZIP.
11. **PDF to DOCX** (`Beta`) — Text extraction from PDF pages into editable `.docx`.
12. **Extract Text / OCR** (`Experimental`) — Extract embedded text layers and pattern streams directly in browser.
13. **PDF/A Preparation** (`Experimental`) — Embed ISO 19005 metadata markers for archival.

### 2.4 Subsystem 4: Edit & Annotate (4 Tools)
14. **Edit PDF** (`Beta`) — Add text, shapes, and lines overlay on top of PDF pages.
15. **Add Page Numbers** (`Stable`) — Insert customizable page numbers with 6 alignment positions.
16. **Add Watermark** (`Stable`) — Overlay text watermarks with opacity and rotation sliders.
17. **Add Signature** (`Stable`) — Visual electronic signature image overlay with optional date stamp.

### 2.5 Subsystem 5: Security & Maintenance (6 Tools)
18. **Protect PDF** (`Experimental`) — Add user password security dictionary restrictions.
19. **Unlock PDF** (`Experimental`) — Remove password security restrictions using valid user key.
20. **Visual Blackout** (`Experimental`) — Apply solid black rectangles over sensitive areas on PDF pages.
21. **Compare PDF** (`Beta`) — Side-by-side structural analysis and page count comparison report.
22. **Basic PDF Recovery** (`Experimental`) — Re-serialize clean xref tables for mildly corrupted files.
23. **Basic PDF Optimization** (`Experimental`, Popular) — Re-encode PDF object streams to optimize file structure.

---

## 3. Non-Functional Requirements & Security Guarantees

- **Local Execution**: All PDF binary operations execute within browser RAM memory without external file uploads.
- **Strict File Validation**: Files are checked for `%PDF-` magic bytes headers prior to processing.
- **Resource Cleanup**: Download URLs created with `URL.createObjectURL()` are released via `URL.revokeObjectURL()` after download.
- **Automated Testing**: 36 automated unit tests passing across all engines and manifest integrity.
- **Static Next.js Build**: Pre-rendered Next.js 14 App Router static output.
