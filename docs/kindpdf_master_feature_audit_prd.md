# LocalPDF — Audit Lengkap Fitur Kindpdf + Blueprint Implementasi

**Snapshot:** 2 Agustus 2026  
**Tujuan:** dokumen kerja untuk agent pengembang.  
**Catatan:** katalog dapat berubah menurut wilayah, paket, web/mobile/desktop, dan eksperimen antarmuka. Jangan memakai merek, teks, ikon, atau layout Kindpdf. Bangun produk orisinal.

## 1. Inventaris 29 alat

### Organize PDF
1. Merge PDF
2. Split PDF
3. Remove Pages
4. Extract Pages
5. Organize PDF
6. Scan to PDF

### Optimize PDF
7. Compress PDF
8. Repair PDF
9. OCR PDF

### Convert to PDF
10. JPG to PDF
11. Word to PDF
12. PowerPoint to PDF
13. Excel to PDF
14. HTML to PDF

### Convert from PDF
15. PDF to JPG
16. PDF to Word
17. PDF to PowerPoint
18. PDF to Excel
19. PDF to PDF/A

### Edit PDF
20. Rotate PDF
21. Add Page Numbers
22. Add Watermark
23. Crop PDF
24. Edit PDF

### PDF Security
25. Unlock PDF
26. Protect PDF
27. Sign PDF
28. Redact PDF
29. Compare PDF

Fitur yang perlu dicek ulang tiap rilis: Smart Range/AI-assisted Split, variasi editor, fitur tim, dan alat AI baru bila muncul.

---

## 2. Komponen bersama

Semua alat wajib memakai komponen yang sama:

- Drag-and-drop dan tombol pilih berkas
- Validasi magic bytes, MIME, ekstensi, ukuran, jumlah file, jumlah halaman
- Deteksi PDF rusak dan terenkripsi
- Daftar file, reorder, remove, add more
- Thumbnail lazy-render
- Progress, cancel, retry, dan error manusiawi
- Penanda jelas “Diproses lokal” atau “Diproses aman di server”
- Download, download ZIP, restart, dan delete now
- Bahasa Indonesia dan Inggris
- Keyboard navigation, fokus terlihat, aria-live, touch target memadai
- Mobile, tablet, dan desktop
- Unit test, integration test, dan manual QA

State minimum:

```ts
type ToolState =
  | "idle"
  | "validating"
  | "ready"
  | "configuring"
  | "processing"
  | "success"
  | "error"
  | "cancelled";
```

Model dasar:

```ts
interface PdfAsset {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  encrypted?: boolean;
  status: "validating" | "ready" | "error";
}

interface PdfPageRef {
  id: string;
  documentId: string;
  sourcePageIndex: number;
  displayOrder: number;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
  deleted: boolean;
  cropBox?: { x: number; y: number; width: number; height: number };
}
```

---

## 3. Matriks local-first

| Alat | Lokal | Server |
|---|---:|---:|
| Merge, Split, Remove, Extract, Organize | Sangat cocok | Opsional |
| Scan, JPG to PDF, PDF to JPG | Sangat cocok | Opsional |
| Rotate, Page Numbers, Watermark, Crop | Sangat cocok | Opsional |
| Edit PDF overlay | Cocok | Opsional |
| Compress, Repair, OCR | Terbatas | Disarankan |
| Office conversions | Tidak realistis penuh | Wajib |
| HTML to PDF | Terbatas | Disarankan |
| PDF/A | Sulit | Disarankan |
| Protect/Unlock | Terbatas | Disarankan |
| Sign visual | Cocok | Opsional |
| Digital signature/workflow | Tidak | Wajib |
| Redact aman | Tidak cukup dengan overlay | Wajib/engine kuat |
| Compare | Terbatas | Disarankan |

---

# 4. Spesifikasi 29 alat

## 4.1 Merge PDF

**Isi:** pilih beberapa PDF, tambah file, reorder, hapus, lihat jumlah halaman/ukuran, gabungkan, beri nama hasil.

**Implementasi:** `pdf-lib` untuk load/copyPages/save; Web Worker; `dnd-kit`; server opsional memakai `qpdf`.

**Edge case:** encrypted, corrupt, AcroForm, bookmark, attachment, ukuran halaman berbeda, dokumen bertanda tangan.

**Done:** urutan benar, jumlah halaman benar, UI tidak freeze, cancel bekerja, hasil terbuka di viewer umum.

## 4.2 Split PDF

**Mode:** rentang `1-3,5,8-10`, setiap N halaman, extract all pages, satu output per range, satu output gabungan, ZIP.

**Smart Range opsional:** ekstrak teks/OCR, model memberi batas dokumen, pengguna wajib konfirmasi.

**Implementasi:** range parser teruji; copy pages; `fflate` untuk ZIP.

**Done:** overlap, duplikat, angka di luar batas, dan sintaks salah ditangani tanpa crash.

## 4.3 Remove Pages

**Isi:** thumbnail, multi-select, odd/even, range, delete, undo.

**Implementasi:** buat PDF baru dari halaman yang tidak dihapus.

**Done:** minimal satu halaman tersisa dan halaman terhapus benar-benar tidak ada.

## 4.4 Extract Pages

**Mode:** halaman pilihan menjadi satu PDF; setiap halaman terpisah; setiap rentang terpisah; ZIP.

**Done:** urutan sesuai pilihan, kualitas tidak turun, nama hasil konsisten.

## 4.5 Organize PDF

**Isi:** reorder, rotate, delete, duplicate opsional, blank page opsional, multi-select, undo/redo, zoom thumbnail.

**Implementasi:** command history; jangan mutasi file sumber pada tiap klik.

**Done:** dokumen 200 halaman tetap lancar dengan virtualization dan lazy rendering.

## 4.6 Scan to PDF

**Isi:** camera capture, edge detection, crop, perspective correction, rotate, grayscale/BW, brightness, multi-page, reorder.

**Implementasi:** `getUserMedia`, Canvas/WebGL, OpenCV.js, `pdf-lib`.

**Done:** izin hanya setelah aksi pengguna, kamera dapat dihentikan, hasil tidak diunggah dalam mode lokal.

## 4.7 Compress PDF

**Level:** extreme, recommended, less compression.

**Teknik:** downsample image, recompress, font subset, stream compression, deduplicate object, remove unused object.

**Implementasi:** Ghostscript/qpdf/MuPDF/SDK dalam container sandbox.

**Done:** jumlah halaman sama, link dan teks tetap bila tidak diraster, ukuran sebelum/sesudah tampil, kualitas dibandingkan.

## 4.8 Repair PDF

**Target:** xref/trailer/object stream/EOF rusak.

**Implementasi:** `qpdf --check`, MuPDF repair, Ghostscript rewrite, beberapa strategi fallback.

**Done:** berkas sehat tidak rusak, kegagalan dijelaskan, parser dijalankan terisolasi.

## 4.9 OCR PDF

**Isi:** pilih bahasa, page range, auto-rotate, deskew, searchable PDF, TXT/Word opsional.

**Implementasi:** OCRmyPDF/Tesseract/PaddleOCR; preprocess; invisible text layer; confidence report.

**Done:** teks scan dapat dicari, posisi cukup sejajar, confidence rendah tidak disembunyikan.

## 4.10 JPG to PDF

**Input:** JPG/JPEG/PNG/WEBP; reorder; page size; orientation; margin; quality; one PDF/multiple PDFs.

**Implementasi:** normalisasi EXIF, embed image, proses bertahap agar memori aman.

**Done:** aspect ratio dan orientation benar, transparansi PNG ditangani.

## 4.11 Word to PDF

**Input:** DOC/DOCX/ODT.

**Implementasi:** LibreOffice headless dalam container atau SDK komersial; font pack jelas; macro tidak dieksekusi.

**Done:** tabel, gambar, header/footer wajar; font substitution dilaporkan.

## 4.12 PowerPoint to PDF

**Input:** PPT/PPTX/ODP; all slides/range; full slide/handout opsional.

**Implementasi:** LibreOffice atau SDK.

**Done:** urutan dan rasio slide benar; animasi/video tidak dijanjikan hidup.

## 4.13 Excel to PDF

**Input:** XLS/XLSX/ODS/CSV.

**Kontrol:** sheet, print area, portrait/landscape, fit width, margin, gridline, header/footer.

**Implementasi:** LibreOffice atau SDK.

**Done:** sheet, page break, width, formula, dan hidden sheet ditangani jelas.

## 4.14 HTML to PDF

**Input:** URL publik; HTML mentah opsional.

**Kontrol:** page size, margin, orientation, scale, background, delay, header/footer.

**Implementasi:** Chromium/Playwright.

**Security:** cegah SSRF; blok localhost, private IP, metadata cloud, protokol selain HTTP/HTTPS, redirect berbahaya.

**Done:** URL publik bekerja dan jaringan internal tidak dapat diakses.

## 4.15 PDF to JPG

**Mode:** render setiap halaman atau extract embedded images; DPI; quality; range; ZIP.

**Implementasi:** PDF.js/PDFium, Worker, OffscreenCanvas.

**Done:** mode render dan extract tidak disamakan; orientation dan DPI benar.

## 4.16 PDF to Word

**Isi:** text/layout reconstruction, table, image, columns, header/footer, OCR untuk scan.

**Implementasi realistis:** SDK komersial untuk fidelity tinggi. Custom: PyMuPDF/pdfminer + layout/table detection + `python-docx`.

**Done:** bedakan “text extraction” dan “layout-preserving”; multi-column dan table diuji.

## 4.17 PDF to PowerPoint

**Mode:** visual fidelity (page as image) atau editable (object reconstruction).

**Implementasi:** render background; atau detect text/image/vector lalu `python-pptx`/SDK.

**Done:** satu page satu slide; mode image tidak diklaim editable.

## 4.18 PDF to Excel

**Isi:** page/table selection, preview, header detection, merge tables, format number/date.

**Implementasi:** Camelot/Tabula untuk text PDF; OCR + table model untuk scan; export XLSX.

**Done:** angka tidak berubah menjadi tanggal tanpa sengaja dan user dapat koreksi area tabel.

## 4.19 PDF to PDF/A

**Target:** PDF/A-1b, 2b, 3b opsional.

**Implementasi:** embed fonts, ICC profile, normalize metadata, remove unsupported actions/encryption, convert, validate dengan veraPDF.

**Done:** jangan menyebut PDF/A sebelum lolos validator.

## 4.20 Rotate PDF

**Isi:** all/selected pages; 90/180/270; thumbnail; undo.

**Done:** ukuran halaman tidak berubah dan viewer berbeda menampilkan rotasi sama.

## 4.21 Add Page Numbers

**Kontrol:** 9 positions, margin, font, size, color, format `1`, `Page 1`, `1 of N`, start number, skip first, range.

**Implementasi:** embed font, hitung text bounds, hormati CropBox dan rotation.

**Done:** nomor tidak terpotong dan logic start/skip benar.

## 4.22 Add Watermark

**Tipe:** text/image.

**Kontrol:** opacity, rotation, scale, position, tile, range, above/below content, color/font.

**Done:** transparansi, aspect ratio, page range, dan layering benar.

## 4.23 Crop PDF

**Isi:** drag-resize area; one/all/odd/even/range; numeric margins; reset; preview.

**Implementasi:** CropBox/MediaBox untuk crop non-destructive atau render ulang untuk permanen.

**Penting:** crop bukan redaction; konten tersembunyi dapat tetap ada.

**Done:** page size berbeda ditangani dan user mendapat peringatan privasi.

## 4.24 Edit PDF

**V1 overlay:** add text/image/shape, drawing, highlight, underline, strikeout, links opsional, undo/redo.

**V2 true editing:** edit existing text/object; jauh lebih sulit dan biasanya butuh SDK.

**Done:** koordinat preview sama dengan output; zoom tidak menggeser objek; white rectangle tidak disebut redaction.

## 4.25 Unlock PDF

**Isi:** input PDF + password sah; hapus encryption.

**Implementasi:** qpdf/PDFBox.

**Larangan:** brute force atau bypass tanpa otorisasi.

**Done:** password tidak masuk log/URL; password salah ditolak; output utuh.

## 4.26 Protect PDF

**Isi:** open password, confirm, strength meter, permissions opsional, AES-256 bila kompatibel.

**Implementasi:** qpdf/PDFBox.

**Done:** password tidak masuk analytics; viewer umum meminta password; permission restriction dijelaskan bukan perlindungan mutlak.

## 4.27 Sign PDF

**Bedakan:**
1. Tanda tangan visual
2. E-sign workflow
3. Digital signature kriptografis

**V1:** draw/type/upload, initials, date, place/resize.

**V2:** multiple signers, email invite, field assignment, order, reminder, audit trail, OTP.

**V3:** PFX/PKCS#12, CMS/PAdES, TSA, OCSP/CRL.

**Done:** label fitur jujur dan modifikasi setelah signature terdeteksi.

## 4.28 Redact PDF

**Isi:** rectangle, search-and-redact, page range, preview, apply permanently, remove metadata/hidden text/attachments.

**Implementasi:** hapus object text/image/vector; rebuild; sanitize; validate via text extraction dan pixel inspection.

**Larangan:** kotak hitam overlay saja.

**Done:** teks tidak dapat dicari/copy dan konten tidak muncul setelah overlay dihapus.

## 4.29 Compare PDF

**Mode:** text diff, visual diff, side-by-side, overlay, heatmap, summary, report.

**Implementasi:** text + bounding boxes; render page pada DPI sama; alignment; pixel diff dengan threshold.

**Done:** added/removed page, moved text, dan noise antialias ditangani.

---

# 5. Platform tambahan

## Web
Akun opsional, history, batch, cloud import/export, share link, delete now, tool chaining, localization, premium quota.

## Mobile
Scanner, camera, share sheet, file manager, offline local tools, biometric lock opsional, annotation, signature, background task.

## Desktop
Offline processing, batch, file association, local Office conversion, reader/editor, auto-update.

## API
Endpoint minimum:

```http
POST /v1/uploads/presign
POST /v1/jobs
GET /v1/jobs/{id}
POST /v1/jobs/{id}/cancel
GET /v1/jobs/{id}/outputs
DELETE /v1/jobs/{id}
```

Wajib: API key, rate limit, idempotency, webhook signature, expiring URL, quota, tenant isolation, audit log.

## Business/Admin
Team, roles, billing, usage dashboard, SSO/SAML bila enterprise, retention policy, regional storage, audit events, tool restrictions.

---

# 6. Stack rekomendasi

Frontend:

- Next.js, React, TypeScript, Tailwind
- PDF.js, pdf-lib
- Web Workers, Comlink opsional
- dnd-kit
- IndexedDB
- Vitest, Playwright

Backend:

- FastAPI atau Node.js
- PostgreSQL
- Redis + BullMQ/Celery
- S3-compatible storage
- Docker sandbox
- OpenTelemetry

Engine:

- qpdf/PDFBox: manipulation, encrypt/decrypt
- Ghostscript/MuPDF: compression/repair
- OCRmyPDF/Tesseract/PaddleOCR: OCR
- LibreOffice: Office to PDF
- Chromium/Playwright: HTML to PDF
- veraPDF: PDF/A validation
- Camelot/Tabula: tables
- Sharp/OpenCV: image processing

Lisensi wajib diperiksa: Ghostscript, MuPDF, dan iText memiliki AGPL/commercial options. PDF.js Apache 2.0; pdf-lib MIT; qpdf Apache 2.0; Tesseract Apache 2.0.

---

# 7. Security dan privacy

Mode lokal:

- Jangan kirim file atau filename ke server/analytics
- Jangan simpan file di localStorage
- Revoke object URL
- Hapus IndexedDB session
- Worker untuk parser berat

Mode server:

- TLS dan encryption at rest
- Random object key
- Signed URL singkat
- Isolated temp directory/container
- CPU, memory, dan timeout limit
- Malware/decompression-bomb checks
- Path traversal dan SSRF protection
- Password tidak masuk log
- Auto-delete dan delete now
- Tenant isolation

Contoh kebijakan:

> File server dihapus otomatis maksimal dua jam setelah proses. Pengguna dapat menghapus lebih cepat. Alat berlabel local tidak mengirim dokumen ke server.

Hanya tulis klaim yang benar-benar diterapkan.

---

# 8. Roadmap realistis

## v0.1
Shared upload + Merge PDF.

## v1.0 local-first
Merge, Split, Organize, Remove, Extract, Rotate, JPG to PDF, PDF to JPG, Page Numbers, Watermark, Crop.

## v1.1
Scan, Edit overlay, Protect/Unlock.

## v2.0 server
Compress, Repair, OCR, HTML to PDF, PDF/A.

## Cloud/advanced
Office conversions, Compare, Redact aman, Signature workflow, API.

---

# 9. Definition of Done

```markdown
- [ ] Input, batas, dan privacy mode terdokumentasi
- [ ] Happy path lulus
- [ ] Invalid, corrupt, encrypted, dan large file diuji
- [ ] Cancel, retry, dan progress bekerja
- [ ] UI tidak freeze
- [ ] Output dibuka di Chrome, Firefox, dan Adobe Reader
- [ ] Jumlah halaman dan kualitas diverifikasi
- [ ] Keyboard dan mobile diuji
- [ ] Indonesia dan Inggris tersedia
- [ ] Unit dan integration test tersedia
- [ ] README, architecture, privacy, dan changelog diperbarui
```

Test fixtures minimum:

```text
simple-text.pdf
mixed-page-sizes.pdf
landscape-pages.pdf
scanned-document.pdf
forms.pdf
annotations.pdf
bookmarks.pdf
encrypted-user-password.pdf
malformed-xref.pdf
large-image-pages.pdf
multilingual-id-en.pdf
two-column.pdf
tables.pdf
signed.pdf
attachments.pdf
```

---

# 10. Prompt siap tempel untuk agent

```text
You are implementing LocalPDF, an original privacy-first PDF toolkit.

Rules:
1. Do not copy Kindpdf branding, copy, icons, or layout.
2. Implement only the assigned tool and its required shared components.
3. State clearly whether processing is local or server-side.
4. Never upload files in local mode.
5. Never expose raw stack traces.
6. Do not call an overlay a redaction.
7. Do not call an image signature a digital signature.
8. Do not bypass PDF passwords.
9. Add tests for corrupt, encrypted, malformed, and large files.
10. Use Web Workers for heavy browser processing.
11. Prioritize output correctness over animation.
12. Update README, architecture, privacy, and changelog.
13. Stop and report licensing concerns before using AGPL components.
14. Meet all acceptance criteria before marking a tool complete.

For each tool:
- Write the user flow
- Define types and states
- Implement validation
- Implement processing
- Implement progress/cancel/retry
- Implement human-readable errors
- Add unit and integration tests
- Add manual QA
- Document limitations
```

---

# 11. Checklist verifikasi “no miss”

```markdown
## Katalog
- [ ] Organize PDF
- [ ] Optimize PDF
- [ ] Convert to PDF
- [ ] Convert from PDF
- [ ] Edit PDF
- [ ] PDF Security
- [ ] Homepage cards
- [ ] Footer list
- [ ] Pricing
- [ ] Help center
- [ ] Release/blog terbaru

## Per alat
- [ ] Input format
- [ ] File and batch limits
- [ ] All controls
- [ ] Cloud integrations
- [ ] Premium-only options
- [ ] Mobile/desktop differences
- [ ] Output format
- [ ] Error states
- [ ] Post-processing actions

## Platform
- [ ] Web
- [ ] iOS
- [ ] Android
- [ ] Desktop
- [ ] API
- [ ] Business/Admin
- [ ] Account/history
- [ ] Privacy/retention
- [ ] New AI features
```

---

# 12. Sumber utama

1. Kindpdf public catalog — https://www.Kindpdf.com/
2. Kindpdf Merge PDF — https://www.Kindpdf.com/merge_pdf
3. Kindpdf Split PDF — https://www.Kindpdf.com/split_pdf
4. Kindpdf Crop PDF article — https://www.Kindpdf.com/blog/how-to-crop-a-pdf-online-and-trim-margins-easily
5. PDF.js — https://mozilla.github.io/pdf.js/
6. pdf-lib — https://pdf-lib.js.org/
7. qpdf — https://qpdf.readthedocs.io/
8. OCRmyPDF — https://ocrmypdf.readthedocs.io/
9. Tesseract — https://tesseract-ocr.github.io/
10. LibreOffice — https://www.libreoffice.org/
11. Playwright — https://playwright.dev/
12. veraPDF — https://verapdf.org/
13. OWASP File Upload — https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
14. OWASP SSRF Prevention — https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
15. WCAG 2.2 — https://www.w3.org/TR/WCAG22/
16. Local-First Software — https://www.inkandswitch.com/local-first/
17. ISO 32000 overview — https://www.iso.org/standard/75839.html
18. PDF/A resources — https://pdfa.org/resource/pdfa-in-a-nutshell/
