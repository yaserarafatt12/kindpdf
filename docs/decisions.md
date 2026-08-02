# Architectural Decision Records (ADR) — LocalPDF

**Project Name:** LocalPDF  
**Tagline:** Your documents never leave your device.  

---

## ADR-001: Separation of Concerns — `pdf-lib` for Modification vs `PDF.js` for Rendering

### Status
Accepted

### Context
Processing PDF files requires two distinct capabilities:
1. Low-level document modification (merging pages, splitting streams, page rotation, extracting page trees).
2. Canvas rendering for visual thumbnails and page previews.

### Decision
- Use **`pdf-lib`** for all PDF creation, page extraction, merging, and binary ArrayBuffer generation.
- Use **`PDF.js` (Mozilla)** for rendering page thumbnails onto HTML5 canvas elements.

### Consequences
- **Positive:** Leverages the specialized strengths of both industry-standard libraries. `pdf-lib` provides clean immutable PDF modifications, while `PDF.js` provides reliable canvas rendering.
- **Negative:** Slightly larger bundle size; mitigated by dynamic imports and code splitting.

---

## ADR-002: Offloading Heavy PDF Tasks to In-Browser Web Workers

### Status
Accepted

### Context
Merging 10 PDF files or rendering thumbnails for a 50-page document requires intense CPU computation. Executing this on the main UI thread freezes the browser tab and blocks user interactions.

### Decision
Implement Web Workers (`src/workers/pdf.worker.ts`) to handle PDF parsing, array buffer operations, and thumbnail rendering off the main thread.

### Consequences
- **Positive:** Smooth 60 FPS UI experience with progress indicators even during heavy document merges.

---

## ADR-003: Ephemeral File Memory Management vs `localStorage`

### Status
Accepted

### Context
`LocalStorage` in web browsers is limited to ~5 MB and designed for small text key-value pairs. Storing large PDF files (e.g. 20 MB) in `localStorage` throws quota errors and degrades performance.

### Decision
PDF `File` objects and `ArrayBuffer` instances are kept exclusively in ephemeral React state. Rendered canvas URLs are created via `URL.createObjectURL` and explicitly revoked with `URL.revokeObjectURL` when no longer needed.

### Consequences
- **Positive:** Zero browser storage quota errors, high performance.
- **Negative:** Refreshing the browser page resets the current working session (by design for privacy & security).
