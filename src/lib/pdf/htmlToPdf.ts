import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

export interface HtmlToPdfOptions {
  title?: string;
  content: string; // Plain text or simplified HTML content
  fontSize?: number;
  pageSize?: 'a4' | 'letter';
}

/**
 * Convert text/HTML content to PDF document client-side.
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
  if (options.title) {
    page.drawText(options.title, {
      x: margin,
      y: currentY - 24,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.5),
    });
    currentY -= 45;
  }

  // Strip HTML tags for clean text rendering
  const cleanText = options.content.replace(/<[^>]*>?/gm, '');
  const lines = cleanText.split('\n');

  onProgress?.('Rendering document pages...');

  for (const rawLine of lines) {
    // Simple line wrapping
    const words = rawLine.split(' ');
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
