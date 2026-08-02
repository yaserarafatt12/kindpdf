# Kindpdf — Feature Captions & Technical Workflow Report (23 Active Tools)

**Project:** Kindpdf (Privacy-First In-Browser PDF Suite)  
**Date:** August 2, 2026  
**Architecture:** 100% Client-side RAM processing via `pdf-lib`, `pdfjs-dist`, and `fflate`. Zero server uploads.

---

## 📁 Subsystem 1: Organize & Pages (5 Tools)

### 1. Merge PDF
- **Status**: `Stable` | **Popular**: Yes
- **UI Container Caption**: `"Combine multiple PDF files into a single document in your desired order."`
- **Technical Workflow**:
  1. User uploads 2+ PDF files via drag-and-drop or file picker.
  2. Browser validates `%PDF-` magic bytes header for each file in memory.
  3. `pdf-lib` creates a new blank `PDFDocument` instance in RAM.
  4. Iterates through each file according to user-selected sequence, copying all pages into target document (`copyPages`).
  5. Serializes result to `Uint8Array`, creates a Blob download URL (`URL.createObjectURL`), and revokes object URL upon download.

### 2. Split PDF
- **Status**: `Stable` | **Popular**: Yes
- **UI Container Caption**: `"Separate one page or a whole set into independent PDF files or ZIP."`
- **Technical Workflow**:
  1. User uploads 1 PDF and selects Split Mode (Custom Range like `1-3,5`, N-page chunks, or Extract All Pages).
  2. Engine parses target page indices using `splitPdf.ts`.
  3. `pdf-lib` copies specified page ranges into new target `PDFDocument` instances.
  4. If single range output -> downloads `.pdf`. If multi-range output -> packages files into a `.zip` archive via `fflate`.

### 3. Organize Pages
- **Status**: `Stable` | **Popular**: Yes
- **UI Container Caption**: `"Reorder, rotate (90°, 180°, 270°), or delete pages visually."`
- **Technical Workflow**:
  1. User uploads PDF document.
  2. `pdfjs-dist` renders HTML5 Canvas thumbnails for every page asynchronously.
  3. User drags thumbnails to reorder, clicks rotate buttons (90° increments), or clicks delete icon to mark deletion.
  4. `pdf-lib` constructs a new PDF matching the new page sequence, applies `page.setRotation()`, and excludes deleted page indices.

### 4. Extract Pages
- **Status**: `Stable` | **Popular**: No
- **UI Container Caption**: `"Extract specific pages from your PDF into a brand new document."`
- **Technical Workflow**:
  1. User uploads PDF and enters page numbers (e.g. `1, 4-7`).
  2. `pdf-lib` initializes a clean PDF document in RAM and copies target pages.
  3. Downloads extracted result as a new PDF document.

### 5. Crop PDF
- **Status**: `Stable` | **Popular**: No
- **UI Container Caption**: `"Trim page margins and resize visible area using CropBox controls."`
- **Technical Workflow**:
  1. User uploads PDF and adjusts Top, Right, Bottom, Left margin sliders (in %).
  2. Engine calculates target bounding box coordinates (`x`, `y`, `width`, `height`).
  3. `pdf-lib` sets `page.setCropBox(x, y, width, height)` non-destructively without modifying underlying vector streams.

---

## 🔄 Subsystem 2: Convert to PDF (4 Tools)

### 6. Images to PDF
- **Status**: `Stable` | **Popular**: Yes
- **UI Container Caption**: `"Convert JPG, PNG, and WEBP images to PDF with custom margins."`
- **Technical Workflow**:
  1. User uploads JPG, PNG, or WEBP image files.
  2. Engine embeds binary image buffers into `pdf-lib` (`embedJpg` / `embedPng`).
  3. Computes layout scaling based on Page Size (A4 vs Fit Image), Orientation (Portrait/Landscape), and Margin padding.
  4. Draws image onto PDF page canvas (`page.drawImage`) and exports single PDF.

### 7. DOCX to PDF
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Text-first conversion of Word documents (.docx) to PDF."`
- **Technical Workflow**:
  1. User uploads Word `.docx` file.
  2. `fflate.unzipSync` unzips OpenXML `.docx` container in browser to extract `word/document.xml`.
  3. DOM parser extracts paragraph `<w:p>` and text `<w:t>` nodes.
  4. `pdf-lib` wraps text into PDF pages with Helvetica/Standard fonts.

### 8. HTML / Notes to PDF
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Convert formatted text and HTML notes into clean PDF documents."`
- **Technical Workflow**:
  1. User types formatted text or HTML code in live rich text editor.
  2. Engine parses HTML tags (`<h1>`, `<p>`, `<b>`, `<ul>`) into formatted text streams.
  3. `pdf-lib` renders text blocks onto A4 page margins with line wrapping and page pagination.

### 9. Scan to PDF
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Capture physical documents using camera and compile into PDF."`
- **Technical Workflow**:
  1. User opens device camera via WebRTC `navigator.mediaDevices.getUserMedia`.
  2. Captures page snapshots; HTML5 canvas applies color filters (Original, Grayscale, B&W) and brightness adjustments.
  3. Converts canvas frame to PNG data URL and compiles into multi-page PDF via `pdf-lib`.

---

## 📤 Subsystem 3: Convert from PDF (4 Tools)

### 10. PDF to Images
- **Status**: `Stable` | **Popular**: Yes
- **UI Container Caption**: `"Render and extract PDF pages into high-DPI PNG or JPG image files."`
- **Technical Workflow**:
  1. User uploads PDF.
  2. `pdfjs-dist` loads document in browser Web Worker thread.
  3. Renders each page onto high-resolution HTML5 Canvas (`scale: 2.0` for 300 DPI sharpness).
  4. Converts canvas to image Blobs and packages all page images into a `.zip` archive via `fflate`.

### 11. PDF to DOCX
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Text extraction from PDF into editable Word documents (.docx)."`
- **Technical Workflow**:
  1. User uploads PDF.
  2. `pdfjs-dist` extracts text content items and positional streams from each page.
  3. Builds OpenXML `.docx` XML structures (`document.xml`) containing extracted paragraph blocks.
  4. `fflate` zips XML files into a valid `.docx` file for download.

### 12. Extract Text / OCR
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Extract selectable text from PDF documents directly in browser."`
- **Technical Workflow**:
  1. User uploads PDF and selects language (English / Indonesian).
  2. `pdfjs-dist` extracts embedded text layers and pattern streams from document.
  3. Formats text with page demarcation headers (`--- Page X ---`).
  4. Displays text area in UI with one-click "Copy Text" to clipboard and "Download .TXT" export.

### 13. PDF/A Preparation
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Embed ISO 19005 metadata streams and producer tags for archival."`
- **Technical Workflow**:
  1. User uploads PDF and selects conformance profile (PDF/A-1b, PDF/A-2b, PDF/A-3b).
  2. `pdf-lib` injects ISO 19005 XML metadata streams (`pdfaExtension`, `pdfaid:part`, `pdfaid:conformance`).
  3. Removes interactive JavaScript actions and outputs archival-prepared PDF.

---

## ✏️ Subsystem 4: Edit & Annotate (4 Tools)

### 14. Edit PDF
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Add text, shapes, and lines overlay on top of PDF pages."`
- **Technical Workflow**:
  1. User uploads PDF and chooses annotation tool (Text, Rectangle, Circle, Line).
  2. Places overlay elements onto target page preview with custom colors, opacity, and font sizes.
  3. Engine maps relative percentage coordinates to PDF page points (`pt`).
  4. `pdf-lib` draws overlay primitives onto PDF page vectors (`drawText`, `drawRectangle`, `drawCircle`, `drawLine`).

### 15. Add Page Numbers
- **Status**: `Stable` | **Popular**: No
- **UI Container Caption**: `"Insert customizable page numbers with flexible alignment into PDF."`
- **Technical Workflow**:
  1. User uploads PDF and chooses position (6 alignment spots: Top/Bottom x Left/Center/Right), format (`Page X`, `X of Y`), font size, and margin offset.
  2. `pdf-lib` measures page dimensions (`page.getSize()`).
  3. Calculates exact alignment coordinates and draws page number text on selected pages.

### 16. Add Watermark
- **Status**: `Stable` | **Popular**: No
- **UI Container Caption**: `"Overlay custom text watermarks across every page of your PDF."`
- **Technical Workflow**:
  1. User uploads PDF and inputs watermark text (e.g. `CONFIDENTIAL`).
  2. Configures rotation angle (e.g. 45° diagonal), opacity (e.g. 30%), and color.
  3. `pdf-lib` calculates center coordinates of each page, applies `rotate: degrees(angle)` and `opacity`, and overlays text.

### 17. Add Signature
- **Status**: `Stable` | **Popular**: No
- **UI Container Caption**: `"Draw or type signature image overlay with optional date stamp."`
- **Technical Workflow**:
  1. User draws signature on HTML5 Canvas pad or types signature name.
  2. Optionally toggles auto date stamp.
  3. Converts signature canvas to PNG data URL.
  4. `pdf-lib` embeds PNG signature image and renders it on chosen page at user-selected position and scale.

---

## 🛡️ Subsystem 5: Security & Maintenance (6 Tools)

### 18. Protect PDF
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Encrypt your PDF with password security restrictions."`
- **Technical Workflow**:
  1. User uploads PDF and enters user password.
  2. Engine injects security dictionary and user password restriction parameters on export via `pdf-lib`.

### 19. Unlock PDF
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Remove password encryption restrictions using valid user key."`
- **Technical Workflow**:
  1. User uploads protected PDF and enters valid decryption password.
  2. `pdf-lib` decrypts document object streams using supplied password key.
  3. Exports clean, unrestricted PDF document without password lock.

### 20. Visual Blackout
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Apply solid black rectangles over sensitive areas on PDF pages."`
- **Technical Workflow**:
  1. User uploads PDF and draws redaction box coordinates over sensitive areas (NIK, Bank Account, Address).
  2. Engine draws solid black filled rectangles (`color: rgb(0,0,0)`) over target page coordinates.

### 21. Compare PDF
- **Status**: `Beta` | **Popular**: No
- **UI Container Caption**: `"Compare two PDF documents side-by-side to detect structural differences."`
- **Technical Workflow**:
  1. User uploads Document A and Document B.
  2. Engine compares page counts, file sizes, metadata, dimensions, and object stream structures.
  3. Renders side-by-side comparison report with difference indicators.

### 22. Basic PDF Recovery
- **Status**: `Experimental` | **Popular**: No
- **UI Container Caption**: `"Attempt re-parsing and re-encoding of damaged PDF object streams."`
- **Technical Workflow**:
  1. User uploads damaged/corrupted PDF file.
  2. Engine re-parses binary object tokens, bypassing broken cross-reference (`xref`) offset pointers.
  3. Re-serializes clean xref table and object stream structure.

### 23. Basic PDF Optimization
- **Status**: `Experimental` | **Popular**: Yes
- **UI Container Caption**: `"Re-encode PDF object streams to optimize file structure."`
- **Technical Workflow**:
  1. User uploads PDF and chooses optimization preset (Recommended, Extreme, Less).
  2. Engine removes duplicate metadata, compresses uncompressed object streams, and re-encodes PDF layout.
  3. Displays initial vs optimized file size and percentage reduction.
