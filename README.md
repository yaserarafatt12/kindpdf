# Kindpdf — Privacy-First In-Browser PDF Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-39%20Automated%20Tests%20Passing-646cff?logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-128--bit%20RC4%20%2F%20AES--256-emerald?logo=shield)](https://github.com/yaserarafatt12/localpdf)

**Kindpdf** (`v1.0.0`) is a modern, privacy-first web application providing a full suite of **23 active PDF utilities** operating 100% locally inside the user's browser RAM. Documents are never uploaded to cloud servers or remote APIs.

- **Author**: Yaser Arafat
- **GitHub Repository**: [yaserarafatt12/localpdf](https://github.com/yaserarafatt12/localpdf)
- **Version**: `v1.0.0`
- **Release Date**: August 2026

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
10. [Performance & Memory Optimization](#10-performance--memory-optimization)
11. [Security, Cryptography & Validation](#11-security-cryptography--validation)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Error Handling & User Feedback](#13-error-handling--user-feedback)
14. [Architectural Decision Records (ADR)](#14-architectural-decision-records-adr)
15. [AI Usage Disclosure](#15-ai-usage-disclosure)
16. [Contributing Guidelines](#16-contributing-guidelines)
17. [License & Credits](#17-license--credits)

---

## 1. Overview & Problem Statement

### The Problem
Traditional online PDF services require users to upload confidential paperwork (financial audits, legal contracts, medical reports, ID cards) to remote server clusters. This exposes sensitive personal and corporate data to third-party data breaches, unauthorized logging, and regulatory compliance violations (GDPR, HIPAA).

### The Solution
**Kindpdf** executes all document processing using browser-native binary engines (`pdf-lib`, `pdfjs-dist`, `fflate`, `@pdfsmaller/pdf-encrypt-lite`, `@pdfsmaller/pdf-decrypt`). All operations execute **100% in client-side RAM memory**. Files are never transmitted over the network to any backend server.

---

## 2. Single Source of Truth Tool Manifest (23 Active Tools)

All 23 tools are defined in a single typed manifest (`src/lib/tools/manifest.ts`) categorized by status (`stable`, `beta`, `experimental`):

| Tool | Status | Category | Scope & Capability Notes |
| :--- | :---: | :---: | :--- |
| **Merge PDF** | `Stable` | Organize | Combine multiple PDFs with custom drag-and-drop page ordering. |
| **Split PDF** | `Stable` | Organize | Separate by custom page ranges (`1-3,5`), N pages per document, or ZIP export. |
| **Organize PDF** | `Stable` | Organize | Sort, reorder, rotate (90°, 180°, 270°), or delete pages visually. |
| **Extract Pages** | `Stable` | Organize | Extract selected page subsets into a new PDF or ZIP archive. |
| **Crop PDF** | `Stable` | Organize | Adjust CropBox page margins to trim visible document borders. |
| **Images to PDF** | `Stable` | Convert to | Convert JPG, PNG, WEBP images into structured PDF pages. |
| **DOCX to PDF** | `Beta` | Convert to | Client-side Word (.docx) document conversion into PDF. |
| **HTML to PDF** | `Beta` | Convert to | Render text notes or HTML content into PDF format. |
| **Scan to PDF** | `Beta` | Convert to | Capture physical documents using device camera stream into PDF. |
| **PDF to Images** | `Stable` | Convert from | Render PDF pages into high-DPI PNG or JPG image files (ZIP export). |
| **PDF to DOCX** | `Beta` | Convert from | Extract text streams and layout from PDF into editable Word format. |
| **Extract Text (OCR)**| `Beta` | Convert from | Extract raw text layers and characters from PDF pages into `.txt`. |
| **PDF/A Preparation**| `Experimental` | Convert from | Embed ISO 19005 metadata stream markers for long-term archiving. |
| **Edit PDF** | `Beta` | Edit | Add text overlays, freehand drawing, and shapes onto PDF pages. |
| **Add Page Numbers**| `Stable` | Edit | Insert header or footer page numbers with custom alignment. |
| **Add Watermark** | `Stable` | Edit | Overlay text watermarks with opacity and rotation sliders. |
| **Add Signature** | `Stable` | Edit | Draw visual electronic signature overlays onto PDF pages. |
| **Protect PDF** | `Stable` | Security | Real 128-bit RC4 PDF Standard Security Handler password encryption. |
| **Remove Password** | `Stable` | Security | AES-256 / RC4 password validation and stream decryption into clean PDF. |
| **Visual Blackout** | `Experimental` | Security | Apply solid black redaction rectangles over sensitive page coordinates. |
| **Compare PDF** | `Beta` | Utilities | Side-by-side visual and structural page comparison report. |
| **Basic PDF Recovery**| `Experimental` | Utilities | Re-serialize xref tables to recover damaged PDF stream structures. |
| **Compress PDF** | `Stable` | Utilities | Re-compress embedded image streams and optimize PDF structure. |

---

## 3. Memory Lifecycle & Privacy Guarantees

- **Zero Server Uploads**: Document data is processed exclusively in browser memory. No backend server endpoints exist in this codebase.
- **Memory Release**: Blob object URLs created via `URL.createObjectURL()` are released using `URL.revokeObjectURL()` after download completion.
- **Telemetry-Free**: Zero tracking scripts, analytics cookies, or document logging.

---

## 4. Technology Stack & Core Engines

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router, React 18, TS) | Web application architecture & client routing |
| **Styling System** | Vanilla Tailwind CSS (Custom HSL System) | Responsive components & dark/light theme switcher |
| **Primary PDF Engine** | `pdf-lib` (v1.17+) | Binary PDF creation, merging, page operations, annotations |
| **PDF Encryption** | `@pdfsmaller/pdf-encrypt-lite` | Real RC4 128-bit PDF Standard Security Handler encryption |
| **PDF Decryption** | `@pdfsmaller/pdf-decrypt` | Real AES-256 & RC4 password verification and stream decryption |
| **PDF Renderer** | `pdfjs-dist` (v3.11+) | HTML5 Canvas page thumbnail & preview rendering |
| **ZIP Archiving** | `fflate` (v0.8+) | High-speed in-browser ZIP archiving for multi-file exports |
| **Unit Testing** | Vitest (v1.6+) | 39 automated unit tests passing |
| **E2E Testing** | Playwright (v1.42+) | End-to-end user workflow testing |

---

## 5. Architecture & Data Flow

```
[ User Browser RAM ]
      │
      ├──> 1. File Selection / Dropzone (%PDF- Magic Bytes Check)
      │
      ├──> 2. Binary Processing Engine (pdf-lib / pdfjs-dist / pdf-encrypt / pdf-decrypt)
      │      ├── ArrayBuffer / Uint8Array Memory Execution
      │      ├── HTML5 Canvas Page Viewport Render
      │      └── Output Blob Stream Serialization
      │
      ├──> 3. ProcessingProgress Modal (Real-time Step Progress)
      │
      └──> 4. SuccessDownloadScreen Render
             ├── Dynamic Extension Preservation (.docx, .txt, .zip, .pdf)
             ├── Inline Output Filename Editor
             └── Blob Download Trigger (URL.createObjectURL -> URL.revokeObjectURL)
```

---

## 6. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yaserarafatt12/localpdf.git
   cd localpdf
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   Navigate to `http://localhost:3000` in your web browser.

---

## 7. Running Tests

Kindpdf includes a comprehensive Vitest unit test suite covering PDF operations, security encryption, password validation, file magic bytes, page manipulations, and tool manifest integrity.

```bash
# Run unit test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Status**: `39 automated unit tests passing (14 test files)`.

---

## 8. Production Build

To run TypeScript verification, linting, and compile static production pages:

```bash
npm run build
npm run start
```

---

## 9. Project Directory Structure

```
localpdf/
├── docs/                        # Specifications, PRD, privacy guarantees, ADRs
│   ├── product-requirements.md  # Product Requirements Document
│   ├── architecture.md          # Data boundary & architecture specification
│   ├── privacy.md               # Privacy & memory release specification
│   └── decisions.md             # Architectural Decision Records (ADRs)
├── public/                      # Static assets & web worker scripts
├── src/
│   ├── app/                     # Next.js App Router (globals.css, layout.tsx, page.tsx)
│   ├── components/              # 23 Workspace components & UI elements
│   │   ├── Header.tsx           # Top navigation bar with language & Settings trigger
│   │   ├── SettingsModal.tsx    # Settings, PWA banner, guide, direct email report
│   │   ├── ToolGrid.tsx         # Manifest-driven tool grid & category cards
│   │   ├── ProcessingProgress.tsx# Universal processing progress loading modal
│   │   ├── SuccessDownloadScreen.tsx# Unified success download & renaming screen
│   │   ├── FileDropzone.tsx     # Standardized drag-and-drop upload component
│   │   └── ...                  # Individual workspace components for 23 tools
│   └── lib/
│       ├── errors/              # Friendly error message dictionary
│       ├── files/               # File validation (%PDF-), formatting, download triggers
│       ├── i18n/                # English & Indonesian translation dictionaries
│       ├── pdf/                 # 21 Pure PDF engine execution modules
│       └── tools/               # Single Source of Truth Tool Manifest (manifest.ts)
├── tasks/                       # Task breakdown checklists (plan.md, todo.md)
├── tests/                       # Automated test suites
│   ├── e2e/                     # Playwright E2E test scripts
│   └── unit/                    # 14 Vitest unit test files (39 tests)
├── .env.example
├── .gitignore
├── CHANGELOG.md                 # Project changelog history
├── CONTRIBUTING.md              # Open source contribution guidelines
├── LICENSE                      # MIT License
├── package.json
└── README.md
```

---

## 10. Performance & Memory Optimization

- **Zero Network Latency**: Processing occurs at native CPU memory speed without network transfers.
- **Memory Streaming**: Binary data is processed using TypedArrays (`Uint8Array`, `ArrayBuffer`).
- **RAM Reclamation**: Explicit URL revocation releases Blob URLs post-download.

---

## 11. Security, Cryptography & Validation

- **Real RC4 128-bit PDF Encryption**: Uses Standard Security Handler (Algorithm 2 & 3) via `@pdfsmaller/pdf-encrypt-lite`. Output PDFs prompt for password in Chrome, Acrobat Reader, Edge, Safari, and Firefox.
- **Strict Password Validation**: Unlocking validates password digests against owner/user keys using `@pdfsmaller/pdf-decrypt`. Rejects incorrect passwords with explicit error notifications.
- **Unencrypted File Rejection**: Unlock PDF workspace validates file encryption status on drop and rejects unencrypted files automatically.
- **Magic Bytes Validation**: Enforces `%PDF-` header checking prior to ArrayBuffer loading.

---

## 12. Internationalization (i18n)

Kindpdf provides full bilingual translation across all 23 tools, settings, user guides, and error toasts:
- **English (`EN`)** (Default)
- **Indonesian (`ID`)**

---

## 13. Error Handling & User Feedback

- **Friendly Messages**: Technical exceptions map to human-readable error banners.
- **Bug Reporting**: Direct feedback form in Settings Modal routes bug reports directly to `yaserarafatt03@gmail.com`.

---

## 14. Architectural Decision Records (ADR)

See [docs/decisions.md](docs/decisions.md):
- **ADR-001**: Choice of `pdf-lib` for client-side binary PDF manipulation.
- **ADR-002**: 100% In-browser RAM processing model with zero server uploads.
- **ADR-003**: Integration of `@pdfsmaller/pdf-encrypt-lite` & `@pdfsmaller/pdf-decrypt` for standard PDF security.

---

## 15. AI Usage Disclosure

In accordance with transparent developer standards:
> *"Artificial Intelligence was used to assist in initial boilerplate scaffolding and explaining error messages. All source code, binary PDF processing logic, unit tests, security cryptography, and UI workflows were reviewed, tested, and customized by the developer."*

---

## 16. Contributing Guidelines

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Ensure all pull requests include Vitest unit tests in `tests/unit/`.

---

## 17. License & Credits

This project is open-source software licensed under the **[MIT License](LICENSE)**.

- **Author**: Yaser Arafat
- **Contact**: `yaserarafatt03@gmail.com`
- **GitHub**: [github.com/yaserarafatt12/localpdf](https://github.com/yaserarafatt12/localpdf)

---

&copy; 2026 **Kindpdf**. Built with Next.js, TypeScript & Tailwind CSS by **Yaser Arafat**. 100% Local-First.
