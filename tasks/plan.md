# Master Implementation Plan: Kindpdf (Privacy-First In-Browser PDF Suite)

**Blueprint Reference:** `localpdf_ilovepdf_full_feature_audit_prd.md`  
**Goal:** Build a 100% original, privacy-first, in-browser local PDF toolkit containing 29 tools categorized into 6 core modules, delivering 100% client-side execution (zero server upload for local tools), robust Web Worker performance, TDD-backed reliability, and responsive UI/UX.

---

## Technical Stack & Architecture Guidelines

1. **Frontend Architecture (`frontend-ui-engineering` & `ui-ux-pro-max`)**:
   - **Framework**: Next.js 14 App Router (TypeScript, React 18).
   - **Styling**: Vanilla Tailwind CSS, Light Mode default (`bg-slate-100` background, `bg-white` container cards with sharp `border-2 border-slate-300` outlines).
   - **Icons**: Custom Vector SVG Icons (`src/components/icons/CustomPdfIcons.tsx`), no raw emojis or generic un-styled icons.
   - **Layout**: Clean Hero title, compact inline tool cards, 3-line hamburger menu drawer (`Menu`) with full suite list, interactive dropdown i18n (`EN` | `ID`).

2. **Core Binary PDF Processing Engines**:
   - **Client-Side Primary**: `pdf-lib` (ArrayBuffer manipulation, merging, splitting, extracting, page rotation, embedding images, PDF metadata).
   - **Client-Side Rendering**: `pdfjs-dist` (HTML5 Canvas page thumbnail rendering & page preview).
   - **Compression & Archiving**: `fflate` (Zip archiving for multi-file exports).
   - **Web Workers**: Offload heavy PDF parsing & binary serialization to Web Workers to keep UI thread at 60 FPS without freezing.

3. **Privacy & Security Boundaries (`security-and-hardening`)**:
   - **Zero-Server Guarantee**: Local tools process PDF data 100% in browser RAM.
   - **Memory Lifecycle**: Immediate `URL.revokeObjectURL(blobUrl)` and IndexedDB session cleanup after file download.
   - **Magic Bytes Validation**: Strict `%PDF-` header check, password encryption detection, and corrupted file handling.
   - **No Raw Stack Traces**: Human-readable error messages for users.

4. **Testing Strategy (`test-driven-development`)**:
   - **Unit Tests**: Vitest suite in `tests/unit/` covering file validation, PDF merge, split, extract, rotate, and error handling.
   - **E2E Tests**: Playwright suite in `tests/e2e/` for visual interaction & file upload workflows.

---

## 6 Product Subsystems & 29 Tools Roadmap

### Phase 1: Core Organize PDF Module (Sprint 1)
- [x] **Tool 1: Merge PDF** (Combine multiple PDFs with reordering, page count validation, and instant download).
- [ ] **Tool 2: Split PDF** (Split by custom range, e.g. `1-3,5,8-10`, every N pages, or extract all pages to ZIP).
- [ ] **Tool 3: Remove Pages** (Interactive thumbnail grid to select and delete specific pages).
- [ ] **Tool 4: Extract Pages** (Extract chosen pages into a new single PDF or separate files).
- [ ] **Tool 5: Organize Pages** (Reorder via drag-and-drop, rotate 90°/180°/270°, and delete pages).

### Phase 2: Convert to/from PDF & Image Tools (Sprint 2)
- [ ] **Tool 6: JPG/PNG to PDF** (Convert images to PDF with custom margins, orientation, and page size).
- [ ] **Tool 7: PDF to JPG/PNG** (Render PDF pages as high-DPI images and download as ZIP).
- [ ] **Tool 8: Rotate PDF** (Rotate all or selected pages permanently).

### Phase 3: PDF Security & Annotations (Sprint 3)
- [ ] **Tool 9: Protect PDF** (Add AES-256 password encryption to PDF).
- [ ] **Tool 10: Unlock PDF** (Remove password encryption using valid user key).
- [ ] **Tool 11: Add Page Numbers** (Insert customizable page numbers with 9 alignment positions).
- [ ] **Tool 12: Add Watermark** (Overlay text/image watermark with opacity and rotation controls).

### Phase 4: Advanced Local Tools & Optimization (Sprint 4)
- [ ] **Tool 13: Crop PDF** (Interactive canvas crop box for page margin trimming).
- [ ] **Tool 14: Edit PDF (Overlay)** (Add text, drawings, and shapes on top of PDF pages).
- [ ] **Tool 15: Scan to PDF** (Webcam/Camera capture with edge cropping and multi-page PDF generation).

---

## Verification & Definition of Done (`planning-and-task-breakdown`)

- [ ] All Vitest unit tests pass (`npm test`).
- [ ] Next.js production build succeeds (`npm run build`).
- [ ] Responsive UI verified on mobile (375px), tablet (768px), and desktop (1440px).
- [ ] Memory leak audit: Blob URLs revoked, Web Workers terminated cleanly.
- [ ] Git commits formatted atomically.
