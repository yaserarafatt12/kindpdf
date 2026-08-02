import { PDFDocument, degrees } from 'pdf-lib';

export interface PageTransformation {
  pageNumber: number; // 1-indexed original page number
  rotation: number;   // 0, 90, 180, or 270 degrees
}

export interface OrganizePagesOptions {
  // Ordered list of 1-indexed original page numbers to keep in output
  pageOrder: number[];
  // Rotation per original 1-indexed page number
  rotations: Record<number, number>;
}

/**
 * Reorders, rotates, and excludes deleted pages from a PDF document 100% in browser RAM.
 */
export async function organizePdfDocument(
  file: File,
  options: OrganizePagesOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  if (options.pageOrder.length === 0) {
    throw new Error('All pages were removed. At least one page must remain.');
  }

  if (onProgress) {
    onProgress(1, 3, 'Preparing organized PDF document...');
  }

  const newDoc = await PDFDocument.create();

  for (let i = 0; i < options.pageOrder.length; i++) {
    const originalPageNum = options.pageOrder[i];
    const pageIndex = originalPageNum - 1;

    if (pageIndex < 0 || pageIndex >= totalPages) continue;

    if (onProgress) {
      onProgress(i + 1, options.pageOrder.length, `Processing page ${i + 1} of ${options.pageOrder.length}...`);
    }

    const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);

    // Apply rotation if present
    const rotationAngle = options.rotations[originalPageNum] || 0;
    if (rotationAngle !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }

    newDoc.addPage(copiedPage);
  }

  const pdfBytes = await newDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  if (onProgress) {
    onProgress(3, 3, 'Done!');
  }

  return {
    blob,
    filename: `${baseName}_Organized.pdf`,
  };
}
