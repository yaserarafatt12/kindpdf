import { PDFDocument, rgb } from 'pdf-lib';

export interface SignatureOptions {
  /** 0-based page index */
  pageIndex: number;
  /** X coordinate percentage (0-100) */
  x: number;
  /** Y coordinate percentage (0-100) */
  y: number;
  /** Signature image Data URL (PNG/JPEG from signature pad or upload) */
  signatureDataUrl?: string;
  /** Signature text (if typed signature) */
  signatureText?: string;
  /** Optional date string */
  dateText?: string;
  /** Width percentage */
  width?: number;
  /** Height percentage */
  height?: number;
}

/**
 * Add visual signature (drawn image or typed signature + date) to PDF.
 */
export async function signPdf(
  file: File,
  options: SignatureOptions,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading PDF for signing...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const totalPages = pdfDoc.getPageCount();
  if (options.pageIndex < 0 || options.pageIndex >= totalPages) {
    throw new Error('Invalid page index selected for signature.');
  }

  const page = pdfDoc.getPage(options.pageIndex);
  const { width: pWidth, height: pHeight } = page.getSize();

  // Convert percentage coordinates to PDF points (inverting Y for PDF coordinate system)
  const pdfX = (options.x / 100) * pWidth;
  const pdfY = pHeight - (options.y / 100) * pHeight;

  onProgress?.('Embedding signature...');

  if (options.signatureDataUrl) {
    const base64Data = options.signatureDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const isPng = options.signatureDataUrl.includes('image/png');
    const embeddedImg = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);

    const sigW = ((options.width ?? 25) / 100) * pWidth;
    const sigH = (sigW / embeddedImg.width) * embeddedImg.height;

    page.drawImage(embeddedImg, {
      x: pdfX,
      y: pdfY - sigH,
      width: sigW,
      height: sigH,
    });
  }

  if (options.signatureText) {
    page.drawText(options.signatureText, {
      x: pdfX,
      y: pdfY - 20,
      size: 20,
      color: rgb(0.1, 0.1, 0.5),
    });
  }

  if (options.dateText) {
    page.drawText(`Date: ${options.dateText}`, {
      x: pdfX,
      y: pdfY - 38,
      size: 10,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  onProgress?.('Finalizing signature...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Signing complete!');

  return pdfBytes;
}
