import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { sanitizeWinAnsi, decodeXmlEntities } from './sanitizeText';

export interface HtmlToPdfOptions {
  title?: string;
  content: string; // Plain text or simplified HTML content
  fontSize?: number;
  pageSize?: 'a4' | 'letter';
}

/**
 * Convert text/HTML content to PDF document client-side.
 * Safely handles CRLF line endings, HTML block tags, HTML entities, and Unicode typography.
 */
export async function htmlToPdf(
  options: HtmlToPdfOptions,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Initializing PDF generator...');
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [pageWidth, pageHeight] = options.pageSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const fontSize = options.fontSize || 12;
  const lineHeight = fontSize * 1.4;

  let currentY = pageHeight - margin;

  // Title
  const safeTitle = options.title ? sanitizeWinAnsi(options.title).trim() : '';
  if (safeTitle) {
    page.drawText(safeTitle, {
      x: margin,
      y: currentY - 24,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.5),
    });
    currentY -= 45;
  }

  // Convert block-level HTML tags to newlines and list items to bullet points before stripping tags
  const normalizedHtml = (options.content || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|tr|blockquote|section|article|header|footer)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '* ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>?/gm, '');

  const decodedText = decodeXmlEntities(normalizedHtml);
  const cleanText = sanitizeWinAnsi(decodedText, true);
  const lines = cleanText.split('\n');

  onProgress?.('Rendering document pages...');

  for (const rawLine of lines) {
    const trimmedRight = rawLine.replace(/\s+$/g, '');
    if (!trimmedRight.trim()) {
      currentY -= lineHeight * 0.5;
      if (currentY - lineHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      continue;
    }

    const words = trimmedRight.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > contentWidth && currentLine) {
        if (currentY - lineHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        page.drawText(currentLine, {
          x: margin,
          y: currentY - fontSize,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      if (currentY - lineHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      page.drawText(currentLine, {
        x: margin,
        y: currentY - fontSize,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });

      currentY -= lineHeight;
    }
  }

  onProgress?.('Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Conversion complete!');

  return pdfBytes;
}
