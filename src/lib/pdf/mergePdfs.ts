import { PDFDocument } from 'pdf-lib';

export interface MergeProgressCallback {
  (current: number, total: number, message: string): void;
}

/**
 * Merges multiple PDF files into a single Uint8Array / Blob entirely in-browser.
 * Operates on ArrayBuffers without any server uploads.
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: MergeProgressCallback,
  lang: 'en' | 'id' = 'en'
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error(lang === 'en' ? 'At least 2 PDF documents are required to merge.' : 'Minimal 2 dokumen PDF diperlukan untuk digabungkan.');
  }

  // Create a new merged PDF document
  const mergedPdf = await PDFDocument.create();
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    if (onProgress) {
      const msg =
        lang === 'en'
          ? `Reading & merging file ${i + 1} of ${totalFiles}: ${file.name}`
          : `Membaca & menggabungkan berkas ${i + 1} dari ${totalFiles}: ${file.name}`;
      onProgress(i + 1, totalFiles, msg);
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfToCopy = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfToCopy, pdfToCopy.getPageIndices());

    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  if (onProgress) {
    const finalMsg =
      lang === 'en' ? 'Finalizing PDF document merge...' : 'Finalisasi penyusunan dokumen PDF...';
    onProgress(totalFiles, totalFiles, finalMsg);
  }

  const mergedBytes = await mergedPdf.save();
  return mergedBytes;
}
