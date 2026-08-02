import { PDFDocument } from 'pdf-lib';

/**
 * Re-parse and repair damaged PDF xref tables or trailer dictionaries locally.
 */
export async function repairPdf(
  file: File,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Attempting to re-parse PDF document...');
  const arrayBuffer = await file.arrayBuffer();

  // Load with permissive parsing flags
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    parseSpeed: 1,
  });

  onProgress?.('Re-building clean PDF object structures...');
  const pageCount = pdfDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('Could not recover any pages from the file.');
  }

  onProgress?.(`Successfully recovered ${pageCount} page(s). Re-encoding clean xref stream...`);
  const repairedBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.('Repair complete!');

  return repairedBytes;
}
