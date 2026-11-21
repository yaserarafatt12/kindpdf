import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { sanitizeWinAnsi } from './sanitizeText';

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

  let dateOffsetY = 38;

  if (options.signatureDataUrl) {
    const base64Data = options.signatureDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const isPng = options.signatureDataUrl.includes('image/png');
    const embeddedImg = isPng
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

    const sigW = ((options.width ?? 25) / 100) * pWidth;
    const sigH = (sigW / Math.max(1, embeddedImg.width)) * Math.max(1, embeddedImg.height);
    dateOffsetY = sigH + 14;

    page.drawImage(embeddedImg, {
      x: pdfX,
      y: pdfY - sigH,
      width: sigW,
      height: sigH,
    });
  }

  if (options.signatureText) {
    const safeSigText = sanitizeWinAnsi(options.signatureText).trim();
    if (safeSigText) {
      const sigFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      page.drawText(safeSigText, {
        x: pdfX,
        y: pdfY - 20,
        size: 20,
        font: sigFont,
        color: rgb(0.1, 0.1, 0.5),
      });
    }
  }

  if (options.dateText) {
    const safeDateText = sanitizeWinAnsi(`Date: ${options.dateText}`).trim();
    if (safeDateText) {
      const dateFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText(safeDateText, {
        x: pdfX,
        y: Math.max(10, pdfY - dateOffsetY),
        size: 10,
        font: dateFont,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  onProgress?.('Finalizing signature...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Signing complete!');

  return pdfBytes;
}
