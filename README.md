# Kindpdf — Privacy-First In-Browser PDF Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-36%20Automated%20Tests%20Passing-646cff?logo=vitest)](https://vitest.dev/)

**Kindpdf** is a client-side, privacy-first web application providing a suite of **23 active PDF tools** executing within browser memory. Documents are processed locally without uploading files to remote API servers.

---

## Table of Contents
1. [Overview & Problem Statement](#1-overview--problem-statement)
2. [Single Source of Truth Tool Manifest (23 Active Tools)](#2-single-source-of-truth-tool-manifest-23-active-tools)
3. [Memory Lifecycle & Privacy Guarantees](#3-memory-lifecycle--privacy-guarantees)
4. [Technology Stack & Core Engines](#4-technology-stack--core-engines)
5. [Architecture & Data Flow](#5-architecture--data-flow)
6. [Getting Started & Installation](#6-getting-started--installation)
7. [Running Tests](#7-running-tests)
8. [Production Build](#8-production-build)
9. [Project Directory Structure](#9-project-directory-structure)
10. [Performance & Web Worker Optimization](#10-performance--web-worker-optimization)
11. [Security & Validation Lifecycle](#11-security--validation-lifecycle)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Error Handling & User Feedback](#13-error-handling--user-feedback)
14. [Architectural Decision Records (ADR)](#14-architectural-decision-records-adr)
15. [AI Usage Disclosure](#15-ai-usage-disclosure)
16. [Contributing Guidelines](#16-contributing-guidelines)
17. [License](#17-license)

---

## 1. Overview & Problem Statement

### The Problem
Traditional online PDF tools require users to upload confidential documents (invoices, financial statements, medical records, ID scans) to third-party cloud servers for simple tasks like merging, splitting, compressing, or watermarking. This introduces privacy risks, potential data breach exposure, and compliance challenges.

### The Solution
**Kindpdf** processes documents using client-side JavaScript binary manipulation engines (`pdf-lib`, `pdfjs-dist`, `fflate`). All operations run **locally in browser RAM** without uploading document content to external servers.

---

## 2. Single Source of Truth Tool Manifest (23 Active Tools)

Kindpdf defines all 23 active tool routes in a single typed manifest (`src/lib/tools/manifest.ts`) categorized by status (`stable`, `beta`, `experimental`):

| Tool | Status | Category | Capability Scope & Technical Notes |
|------|--------|----------|-----------------------------------|
| **Merge PDF** | `Stable` | Organize | Combine multiple PDFs with drag-and-drop page reordering. |
| **Split PDF** | `Stable` | Organize | Separate by range (`1-3,5`), N pages per file, or extract to ZIP. |
| **Organize Pages** | `Stable` | Organize | Reorder, rotate (90°, 180°, 270°), or delete pages visually. |
| **Extract Pages** | `Stable` | Organize | Extract selected pages into a new PDF or ZIP archive. |
| **Crop PDF** | `Stable` | Organize | Trim visible CropBox margins. Outside area may persist in stream. |
| **Images to PDF** | `Stable` | Convert to | Convert JPG, PNG, WEBP images to PDF with custom margins. |
| **DOCX to PDF** | `Beta` | Convert to | Text-first DOCX parser. Complex layouts and custom fonts may vary. |
| **HTML / Notes to PDF** | `Beta` | Convert to | Convert text & HTML notes to PDF documents. |
| **Scan to PDF** | `Beta` | Convert to | Capture physical documents using webcam/camera with filters. |
| **PDF to Images** | `Stable` | Convert from | Render PDF pages into PNG/JPG images exported as ZIP. |
| **PDF to DOCX** | `Beta` | Convert from | Text stream extraction from PDF pages into editable `.docx`. |
| **Extract Text / OCR** | `Experimental` | Convert from | Extract embedded text layers and pattern streams directly in browser. |
| **PDF/A Preparation** | `Experimental` | Convert from | Embeds ISO 19005 metadata markers. Full audit requires veraPDF. |
| **Edit PDF** | `Beta` | Edit | Add text, shapes, and lines overlay on top of PDF pages. |
| **Add Page Numbers** | `Stable` | Edit | Insert page numbers with 6 alignment positions and custom formats. |
| **Add Watermark** | `Stable` | Edit | Overlay text watermarks with opacity and rotation sliders. |
| **Add Signature** | `Stable` | Edit | Visual electronic signature image overlay with optional date stamp. |
| **Protect PDF** | `Experimental` | Security | Adds password security dictionary restrictions. |
| **Unlock PDF** | `Experimental` | Security | Removes password security restrictions using valid user key. |
| **Visual Blackout** | `Experimental` | Security | Visual solid black rectangle overlay. Text streams should be audited. |
| **Compare PDF** | `Beta` | Utilities | Side-by-side structural analysis and page count comparison report. |
| **Basic PDF Recovery** | `Experimental` | Utilities | Re-serializes clean xref tables for mildly corrupted files. |
| **Basic PDF Optimization**| `Experimental` | Utilities | Re-encodes PDF object streams to optimize file structure. |

*Note: Remove Pages and Rotate Pages functions are integrated directly into the Organize Pages workspace UI.*

---

## 3. Memory Lifecycle & Privacy Guarantees

- **Local Execution**: Document data is processed locally in browser RAM memory without sending files to remote API servers.
- **Memory Management**: Files are processed in browser memory. Kindpdf releases application references and generated object URLs when they are no longer needed. Final memory reclamation is managed by the browser engine.
- **Telemetry-Free**: No analytics tracking or document logging is performed.

---

## 4. Technology Stack & Core Engines

| Category | Technology / Library | Usage |
|----------|----------------------|-------|
| **Frontend Framework** | Next.js 14 (App Router, React 18, TypeScript) | Web application architecture & routing |
| **Styling System** | Vanilla Tailwind CSS (Light Mode default) | Responsive UI components & dark mode support |
| **Primary PDF Engine** | `pdf-lib` (v1.17+) | Binary PDF creation, merging, splitting, CropBox, annotations |
| **PDF Renderer** | `pdfjs-dist` (v3.11+) | HTML5 Canvas page thumbnail & preview rendering |
| **Compression & Zip** | `fflate` (v0.8+) | Client-side ZIP archiving for multi-file exports |
| **Icons** | Original Vector Icons | Clean document-processing iconography |
| **Automated Testing** | Vitest (v1.6+) | 36 automated unit tests passing |
| **E2E Testing** | Playwright | End-to-end user workflow testing |

---

## 5. Architecture & Data Flow

```
[ User Browser RAM ]
      │
      ├──> 1. File Upload (Magic Bytes Check %PDF-)
      │
      ├──> 2. PDF Engine (pdf-lib / pdfjs-dist)
      │      ├── ArrayBuffer Manipulation
      │      ├── Canvas Page Thumbnail Render
      │      └── Binary Output Generation
      │
      └──> 3. Blob Download (URL.createObjectURL -> URL.revokeObjectURL)
```

---

## 6. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yaserarafatt12/02-local-pdf.git
   cd 02-local-pdf
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**:
   Navigate to `http://localhost:3000`.

---

## 7. Running Tests

Kindpdf includes automated unit test suites covering manifest integrity, file validation, PDF engines, security, annotations, and conversion tools.

```bash
# Run unit test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

**Automated Test Status**: `36 automated unit tests passing`.

---

## 8. Production Build

To validate type checking, linting, and build static output pages for production:

```bash
npm run build
npm run start
```

---

## 9. Project Directory Structure

```
02-local-pdf/
├── docs/                        # Architectural & design documentation
│   ├── product-requirements.md  # PRD document
│   ├── architecture.md          # Architecture & data boundary spec
│   ├── privacy.md               # Privacy & memory lifecycle guarantee
│   └── decisions.md             # ADRs
├── public/                      # Static assets & pdf.worker.js
├── src/
│   ├── app/                     # Next.js App Router (layout.tsx, page.tsx)
│   ├── components/              # Workspace UI components (23 tool workspaces)
│   │   ├── icons/               # Original vector icons
│   │   ├── Header.tsx           # Main navigation bar with i18n dropdown
│   │   ├── ToolGrid.tsx         # Manifest-driven tool grid & popular shortcuts
│   │   ├── FileDropzone.tsx     # Standardized file dropzone component
│   │   └── ...                  # Individual tool workspace components
│   └── lib/
│       ├── errors/              # Human-readable error messages
│       ├── files/               # File validation (%PDF-), size format, download
│       ├── i18n/                # English / Indonesian dictionaries
│       ├── pdf/                 # PDF processing binary engines
│       └── tools/               # Single Source of Truth Tool Manifest (manifest.ts)
├── tasks/                       # Task planning & checklists (plan.md, todo.md)
├── tests/                       # Automated test suites
│   ├── e2e/                     # Playwright E2E tests
│   └── unit/                    # Vitest unit test suites
├── .gitignore
├── LICENSE                      # MIT License
├── package.json
└── README.md
```

---

## 10. Performance & Web Worker Optimization

- **Offloaded Rendering**: Heavy PDF page canvas rendering is executed asynchronously to avoid blocking the UI thread.
- **Memory Streaming**: Binary buffers are processed using typed arrays (`Uint8Array`, `ArrayBuffer`) for speed.
- **60 FPS Responsiveness**: Tool UI interactions and thumbnail grid drag-and-drop remain smooth.

---

## 11. Security & Validation Lifecycle

- **Magic Bytes Verification**: Uploaded files are checked for `%PDF-` binary headers prior to processing.
- **Password Protection Handling**: Encrypted PDFs are identified without triggering runtime crashes.
- **Resource Cleanup**: Download URLs created with `URL.createObjectURL()` are released via `URL.revokeObjectURL()` after file download to assist browser memory management.

---

## 12. Internationalization (i18n)

Kindpdf supports bilingual localization:
- **English (`EN`)** (Default)
- **Indonesian (`ID`)**

The active language can be toggled from the header dropdown menu. All UI labels, tool descriptions, and error messages update dynamically.

---

## 13. Error Handling & User Feedback

- **Human Error Messages**: Technical exceptions are caught and mapped to clear human-readable error messages.
- **Error Categories**: Format errors, file size limits (>100MB), corrupted xref tables, password locks, and memory limits are clearly communicated with resolution suggestions.

---

## 14. Architectural Decision Records (ADR)

See [docs/decisions.md](docs/decisions.md) for technical decision logs:
- **ADR-001**: Choice of `pdf-lib` for client-side binary PDF manipulation.
- **ADR-002**: Client-side memory architecture without remote API endpoints.
- **ADR-003**: `pdfjs-dist` HTML5 Canvas thumbnail rendering strategy.

---

## 15. AI Usage Disclosure

In accordance with transparent developer standards:
> *"Artificial Intelligence was utilized to assist in initial boilerplate scaffolding, UI component layout, and error message refinement. All source code, PDF processing logic, unit tests, and security boundaries were reviewed, verified, and tuned by the developer."*

---

## 16. Contributing Guidelines

Contributions are welcome! Please ensure:
1. All changes include corresponding Vitest unit tests in `tests/unit/`.
2. Code follows TypeScript strict mode.
3. Single source of truth manifest (`src/lib/tools/manifest.ts`) is updated for tool additions.

---

## 17. License

This project is open-source software licensed under the [MIT License](LICENSE).

---

&copy; 2026 **Kindpdf**. Built with Next.js & TypeScript.
