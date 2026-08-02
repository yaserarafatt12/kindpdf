# Changelog — Kindpdf (Local PDF Suite)

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-02 (Official v1.0.0 Release)

### 🚀 Initial Public Release
- **23 Active PDF Utilities**: Built complete browser-native PDF suite (Merge, Split, Organize, Extract, Crop, Images to PDF, DOCX to PDF, HTML to PDF, Scan to PDF, PDF to Images, PDF to DOCX, Extract Text/OCR, PDF/A, Edit PDF, Page Numbers, Watermark, Signature, Protect PDF, Remove Password, Visual Blackout, Compare PDF, Repair PDF, Compress PDF).
- **Real PDF Cryptography**: Integrated `@pdfsmaller/pdf-encrypt-lite` for standard 128-bit RC4 PDF encryption and `@pdfsmaller/pdf-decrypt` for stream decryption and strict password verification.
- **Settings & Help Manual Modal**: Added SettingsModal with PWA offline app banner, light/dark mode switch, EN/ID language switcher, full user manual accordion, direct email bug reporting (`yaserarafatt03@gmail.com`), and author credit for Yaser Arafat.
- **Dynamic File Renaming**: Preserved original output extensions (`.docx`, `.txt`, `.zip`, `.pdf`) on user inline renaming.
- **Mobile Flexbox Truncation**: Standardized active file card containers across all 23 workspaces with `min-w-0 flex-1`, `truncate`, and `shrink-0` to eliminate horizontal button overflow on mobile viewports.
- **Testing & Quality**: Added 14 Vitest test suites comprising 39 automated unit tests with 100% pass rate.
- **Documentation**: Completed full PRD, Architecture spec, Privacy policy, ADRs, and English README.
