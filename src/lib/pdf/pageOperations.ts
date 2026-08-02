import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';

/**
 * Removes specific 1-indexed page numbers from a PDF document.
 * Returns a new PDF document bytes with remaining pages.
 */
export async function removePagesFromPdf(
  file: File,
  pagesToRemove: number[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  const removeSet = new Set(pagesToRemove);
  const keepPageIndexes: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!removeSet.has(i + 1)) {
      keepPageIndexes.push(i);
    }
  }

  if (keepPageIndexes.length === 0) {
    throw new Error('Cannot remove all pages. At least one page must remain in the document.');
  }

  if (onProgress) {
    onProgress(1, 2, 'Generating PDF without removed pages...');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, keepPageIndexes);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  if (onProgress) {
    onProgress(2, 2, 'Done!');
  }

  return {
    blob,
    filename: `${baseName}_Removed_Pages.pdf`,
  };
}

/**
 * Extracts specific 1-indexed page numbers from a PDF document into a single PDF or ZIP archive.
 */
export async function extractPagesFromPdf(
  file: File,
  pagesToExtract: number[],
  separateFiles: boolean = false,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ isZip: boolean; blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  const validIndexes = pagesToExtract
    .filter((p) => p >= 1 && p <= totalPages)
    .map((p) => p - 1);

  if (validIndexes.length === 0) {
    throw new Error('No valid pages selected to extract.');
  }

  const baseName = file.name.replace(/\.pdf$/i, '');

  if (!separateFiles) {
    // Single merged PDF of extracted pages
    if (onProgress) {
      onProgress(1, 2, 'Extracting selected pages into a new PDF...');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, validIndexes);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    if (onProgress) {
      onProgress(2, 2, 'Done!');
    }

    return {
      isZip: false,
      blob,
      filename: `${baseName}_Extracted.pdf`,
    };
  } else {
    // Separate individual PDFs packed in ZIP
    const zipFiles: Record<string, Uint8Array> = {};

    for (let i = 0; i < validIndexes.length; i++) {
      const pIdx = validIndexes[i];
      if (onProgress) {
        onProgress(i + 1, validIndexes.length, `Extracting page ${pIdx + 1}...`);
      }

      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pIdx]);
      newDoc.addPage(copiedPage);

      const pdfBytes = await newDoc.save();
      zipFiles[`${baseName}_page_${pIdx + 1}.pdf`] = pdfBytes;
    }

    const zippedBytes = zipSync(zipFiles);
    const zipBlob = new Blob([zippedBytes.buffer as ArrayBuffer], { type: 'application/zip' });

    return {
      isZip: true,
      blob: zipBlob,
      filename: `${baseName}_Extracted_Pages.zip`,
    };
  }
}
