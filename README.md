# LocalPDF

> Privacy-first PDF tools that process documents directly in your browser. **Your documents never leave your device.**

---

## Why LocalPDF?

Many online PDF tools require uploads, accounts, subscriptions, or expose users to excessive advertising. **LocalPDF** performs supported operations locally in your browser whenever possible:

- 🔒 **100% Zero-Server Processing:** Files are loaded into local memory (`ArrayBuffer`) and never uploaded to any cloud server.
- ⚡ **Instant & Private:** No upload or download network bottlenecks.
- 🚫 **No Accounts or Subscriptions:** Free, ad-free, and open source forever.

---

## Planned Core Features (v1.0.0)

- [x] **Merge PDF:** Combine multiple PDF documents, reorder files, and export a unified PDF.
- [ ] **Split PDF:** Extract specific page ranges (`1-3, 5, 8-10`) or split into single pages.
- [ ] **Organize Pages:** Reorder, rotate (90°, 180°, 270°), and delete pages visually.
- [ ] **Extract Pages:** Pull selected pages into a new document.
- [ ] **Images to PDF:** Convert JPG, PNG, WEBP images to PDF with custom page size and margin controls.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Clean Utility Design System)
- **PDF Engines:** `pdf-lib` (Creation & Editing) + `pdfjs-dist` (Thumbnail Rendering)
- **Asynchronous Work:** Web Workers API
- **Testing:** Vitest (Unit) + Playwright (E2E)

---

## Privacy Policy

Files are processed locally and are **not** uploaded to an application server. See complete privacy specifications in [`docs/privacy.md`](docs/privacy.md).

---

## License

Distributed under the [MIT License](LICENSE).

---

*LocalPDF by edsheero*
