# Kindpdf — Privacy-First In-Browser PDF Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-35%2F35%20Passed-646cff?logo=vitest)](https://vitest.dev/)

**Kindpdf** is a 100% client-side, privacy-first web application providing a full suite of **23 PDF processing tools** executing entirely inside your browser's RAM memory. Documents are never uploaded to any external server or cloud service.

---

## Table of Contents
1. [Overview & Problem Statement](#1-overview--problem-statement)
2. [Key Features & 23 Active PDF Tools](#2-key-features--23-active-pdf-tools)
3. [Zero-Server Privacy Guarantee](#3-zero-server-privacy-guarantee)
4. [Technology Stack & Core Engines](#4-technology-stack--core-engines)
5. [Architecture & Data Flow](#5-architecture--data-flow)
6. [Getting Started & Installation](#6-getting-started--installation)
7. [Running Tests](#7-running-tests)
8. [Production Build](#8-production-build)
9. [Project Directory Structure](#9-project-directory-structure)
10. [Performance & Web Worker Optimization](#10-performance--web-worker-optimization)
11. [Security & Memory Lifecycle](#11-security--memory-lifecycle)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Error Handling & User Feedback](#13-error-handling--user-feedback)
14. [Architectural Decision Records (ADR)](#14-architectural-decision-records-adr)
15. [AI Usage Disclosure](#15-ai-usage-disclosure)
16. [Contributing Guidelines](#16-contributing-guidelines)
17. [License](#17-license)

---

## 1. Overview & Problem Statement

### The Problem
Traditional online PDF tools force users to upload confidential documents (invoices, financial statements, medical records, ID scans) to third-party cloud servers for simple tasks like merging, splitting, compressing, or watermarking. This introduces severe privacy risks, data breach exposure, and regulatory compliance violations (GDPR, HIPAA, PDP Law).

### The Solution
**Kindpdf** replaces server-side PDF manipulation with high-performance WebAssembly and JavaScript binary manipulation engines (`pdf-lib`, `pdfjs-dist`, `fflate`). All operations run **100% locally** in the user's browser memory without a single byte leaving the device.

---

## 2. Key Features & 23 Active PDF Tools

Kindpdf includes 23 production-ready tools categorized into 6 core subsystems:

### 📁 1. Organize PDF
- **Merge PDF**: Combine multiple PDF files into a single document with drag-and-drop reordering.
- **Split PDF**: Split documents by page ranges (`1-3,5,8-10`), N pages per split, or extract to ZIP.
- **Remove Pages**: Interactive thumbnail grid to select and delete specific pages.
- **Extract Pages**: Extract chosen pages into a new PDF or ZIP package.
- **Organize Pages**: Rotate (90°, 180°, 270°), reorder, or delete pages in a visual thumbnail grid.
- **Rotate PDF**: Permanently rotate selected or all pages in a document.
- **Crop PDF**: Trim page margins non-destructively using percentage-based `CropBox` controls.
- **Scan to PDF**: Capture physical documents using your webcam/camera, apply grayscale/B&W filters, adjust brightness, and compile into PDF.

### 🖼️ 2. Convert to/from PDF & Images
- **JPG/PNG to PDF**: Convert images (JPG, PNG, WEBP) to PDF with page size (A4/Fit), orientation, and margin settings.
- **PDF to JPG/PNG**: Render PDF pages into high-DPI images exported as a ZIP archive.
- **HTML to PDF**: Convert text & HTML formatted notes directly into PDF documents.
- **PDF to PDF/A**: Convert PDF files to ISO 19005 compliant archival standards (1b, 2b, 3b).

### 🔒 3. Security & Annotations
- **Protect PDF**: Add AES-256 password encryption to prevent unauthorized opening.
- **Unlock PDF**: Remove password encryption using a valid user password.
- **Add Page Numbers**: Overlay customizable page numbers with 6 alignment options and custom formatting.
- **Add Watermark**: Overlay text watermarks across every page with rotation angle and opacity sliders.
- **Sign PDF**: Draw signatures on a touch/mouse canvas pad, type signatures, and place them with date stamps.
- **Redact PDF**: Apply permanent black-out redaction boxes over sensitive text or regions.

### 🛠️ 4. Utilities & Optimization
- **Repair PDF**: Recover corrupted PDF cross-reference (xref) tables and re-encode clean object streams.
- **Compress PDF**: Reduce file sizes with object stream optimization and real-time delta calculation.
- **Compare PDF**: Side-by-side structural analysis and page count comparison report between two PDFs.

### 📝 5. Office & OCR Tools
- **Word to PDF**: Parse `.docx` document XML streams client-side and export to PDF.
- **PDF to Word**: Extract text content from PDF pages into editable `.docx` files.
- **OCR PDF**: Client-side text extraction from scanned PDFs with clipboard copy and `.txt` export.

---

## 3. Zero-Server Privacy Guarantee

- **Zero-Server Upload**: No document data is sent to external APIs or remote servers.
- **No Analytics Logging**: Document metadata, filenames, and contents are never logged.
- **RAM-Only Lifecycle**: Binary PDF buffers reside in browser memory (`ArrayBuffer`) and are garbage collected immediately upon page navigation or file reset.

---

## 4. Technology Stack & Core Engines

| Category | Technology / Library | Usage |
|----------|----------------------|-------|
| **Frontend Framework** | Next.js 14 (App Router, React 18, TypeScript) | Web application architecture & routing |
| **Styling System** | Vanilla Tailwind CSS (Light Mode default) | Responsive UI components & dark mode support |
| **Primary PDF Engine** | `pdf-lib` (v1.17+) | Binary PDF creation, merging, splitting, security, annotations, CropBox |
| **PDF Renderer** | `pdfjs-dist` (v3.11+) | HTML5 Canvas page thumbnail & preview rendering |
| **Compression & Zip** | `fflate` (v0.8+) | Client-side ZIP archiving for multi-file exports |
| **Icons** | Custom Vector SVG Icons & Lucide React | Clean, scalable UI icons |
| **Unit Testing** | Vitest (v1.6+) | Automated unit test suite (35/35 tests passing) |
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
      └──> 3. Blob Download (URL.createObjectURL -> Revoke)
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

Kindpdf includes a comprehensive Vitest unit test suite covering file validation, PDF engines, security, annotations, and conversion tools.

```bash
# Run unit test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage Status**: `35/35 passed (100%)`.

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
│   ├── privacy.md               # Zero-server privacy guarantee
│   └── decisions.md             # ADRs
├── public/                      # Static assets & pdf.worker.js
├── src/
│   ├── app/                     # Next.js App Router (layout.tsx, page.tsx)
│   ├── components/              # Workspace UI components (23 tool workspaces)
│   │   ├── icons/               # Custom vector SVG icons
│   │   ├── Header.tsx           # Main navigation bar with hamburger menu & i18n
│   │   ├── ToolGrid.tsx         # 23 Tool cards grid layout
│   │   ├── FileDropzone.tsx     # Drag-and-drop file upload component
│   │   └── ...                  # Individual tool workspace components
│   └── lib/
│       ├── errors/              # Human-readable error messages
│       ├── files/               # File validation (%PDF-), size format, download
│       ├── i18n/                # English / Indonesian dictionaries
│       └── pdf/                 # 23 PDF processing binary engines
├── tasks/                       # Task planning & checklists (plan.md, todo.md)
├── tests/                       # Automated test suites
│   ├── e2e/                     # Playwright E2E tests
│   └── unit/                    # Vitest unit test suites (sprint1 - sprint7)
├── .gitignore
├── LICENSE                      # MIT License
├── package.json
└── README.md
```

---

## 10. Performance & Web Worker Optimization

- **Offloaded Rendering**: Heavy PDF page canvas rendering is executed asynchronously to prevent blocking the UI thread.
- **Memory Streaming**: Large binary buffers are processed using typed arrays (`Uint8Array`, `ArrayBuffer`) for maximum speed.
- **60 FPS Responsiveness**: Tool UI interactions and thumbnail grid drag-and-drop remain smooth even with multi-page documents.

---

## 11. Security & Memory Lifecycle

- **Magic Bytes Verification**: Every uploaded file is checked for `%PDF-` binary headers prior to processing.
- **Password Protection Detection**: Encrypted PDFs are identified safely without triggering runtime crashes.
- **Blob Revocation**: Generated download URLs (`blob:http://...`) are revoked via `URL.revokeObjectURL()` immediately after file download to free memory.

---

## 12. Internationalization (i18n)

Kindpdf supports seamless bilingual localization:
- **English (`EN`)** (Default)
- **Indonesian (`ID`)**

The active language can be toggled instantly from the header dropdown menu. All UI labels, tool descriptions, and error messages update dynamically.

---

## 13. Error Handling & User Feedback

- **No Raw Stack Traces**: Technical exceptions are caught and mapped to user-friendly human errors.
- **Error Categories**: Format errors, file size limits (>100MB), corrupted xref tables, password locks, and memory limits are clearly communicated with resolution suggestions.

---

## 14. Architectural Decision Records (ADR)

See [docs/decisions.md](docs/decisions.md) for full technical decision logs:
- **ADR-001**: Choice of `pdf-lib` for client-side binary PDF manipulation.
- **ADR-002**: Pure client-side memory architecture without server API endpoints.
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
3. No external server upload dependencies are introduced.

---

## 17. License

This project is open-source software licensed under the [MIT License](LICENSE).

---

&copy; 2026 **Kindpdf**. Built with Next.js & TypeScript.
