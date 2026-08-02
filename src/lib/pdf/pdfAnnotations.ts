import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export type PageNumberPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface PageNumberOptions {
  position: PageNumberPosition;
  format: 'number' | 'page_of_total'; // '1' or 'Page 1 of 5'
  fontSize: number;
  margin: number;
}

/**
 * Inserts page numbers into each page of a PDF document.
 */
export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions = { position: 'bottom-center', format: 'page_of_total', fontSize: 10, margin: 20 },
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < totalPages; i++) {
    if (onProgress) {
      onProgress(i + 1, totalPages, `Numbering page ${i + 1} of ${totalPages}...`);
    }

    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const pageNumText =
      options.format === 'page_of_total'
        ? `Page ${i + 1} of ${totalPages}`
        : `${i + 1}`;

    const textWidth = font.widthOfTextAtSize(pageNumText, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x = (width - textWidth) / 2;
    let y = options.margin;

    switch (options.position) {
      case 'top-left':
        x = options.margin;
        y = height - options.margin - textHeight;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - options.margin - textHeight;
        break;
      case 'top-right':
        x = width - options.margin - textWidth;
        y = height - options.margin - textHeight;
        break;
      case 'bottom-left':
        x = options.margin;
        y = options.margin;
        break;
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = options.margin;
        break;
      case 'bottom-right':
        x = width - options.margin - textWidth;
        y = options.margin;
        break;
    }

    page.drawText(pageNumText, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    filename: `${baseName}_PageNumbers.pdf`,
  };
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  rotation: number; // e.g. 45 degrees
}

/**
 * Overlays a semi-transparent text watermark across every page of a PDF document.
 */
export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions = { text: 'CONFIDENTIAL', fontSize: 50, opacity: 0.2, rotation: 45 },
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (!options.text || !options.text.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < totalPages; i++) {
    if (onProgress) {
      onProgress(i + 1, totalPages, `Watermarking page ${i + 1} of ${totalPages}...`);
    }

    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: Math.max(0.05, Math.min(1.0, options.opacity)),
      rotate: degrees(options.rotation),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    filename: `${baseName}_Watermarked.pdf`,
  };
}
