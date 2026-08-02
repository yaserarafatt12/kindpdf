import { PDFDocument, rgb } from 'pdf-lib';

export interface RedactRegion {
  pageIndex: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
}

/**
 * Apply permanent black-box redaction rectangles over specified areas of PDF pages.
 */
export async function redactPdf(
  file: File,
  regions: RedactRegion[],
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading PDF for redaction...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('PDF document has no pages.');
  }

  onProgress?.(`Applying ${regions.length} redaction area(s)...`);

  for (const region of regions) {
    if (region.pageIndex < 0 || region.pageIndex >= totalPages) continue;

    const page = pdfDoc.getPage(region.pageIndex);
    const { width: pWidth, height: pHeight } = page.getSize();

    const pdfX = (region.x / 100) * pWidth;
    const pdfY = pHeight - (region.y / 100) * pHeight;
    const rectW = (region.width / 100) * pWidth;
    const rectH = (region.height / 100) * pHeight;

    // Draw solid black rectangle over redaction zone
    page.drawRectangle({
      x: pdfX,
      y: pdfY - rectH,
      width: rectW,
      height: rectH,
      color: rgb(0, 0, 0),
      opacity: 1,
    });
  }

  onProgress?.('Saving redacted PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Redaction complete!');

  return pdfBytes;
}
