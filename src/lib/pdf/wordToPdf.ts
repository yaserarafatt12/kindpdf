import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { unzipSync } from 'fflate';

/**
 * Client-side Word (.docx) to PDF conversion engine.
 * Parses document.xml inside .docx ZIP container and builds PDF via pdf-lib.
 */
export async function wordToPdf(
  file: File,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Reading Word document container...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('Unpacking .docx structure...');
  const zipData = new Uint8Array(arrayBuffer);

  let unzipped: Record<string, Uint8Array> = {};
  try {
    unzipped = unzipSync(zipData);
  } catch {
    // If not a valid zip container, fallback to filename header
    unzipped = {};
  }

  const documentXmlPath = Object.keys(unzipped).find(
    (path) => path === 'word/document.xml' || path.endsWith('/document.xml')
  );

  let paragraphs: string[] = [];

  if (documentXmlPath && unzipped[documentXmlPath]) {
    const xmlText = new TextDecoder('utf-8').decode(unzipped[documentXmlPath]);
    // Extract text from <w:t> XML tags
    const textMatches = xmlText.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
    let currentParagraph = '';

    for (const match of textMatches) {
      const text = match.replace(/<[^>]+>/g, '');
      currentParagraph += text;

      if (match.endsWith('</w:t>')) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
    }

    if (currentParagraph) paragraphs.push(currentParagraph);
  } else {
    // Fallback if raw text
    paragraphs = [file.name.replace(/\.docx$/i, '')];
  }

  onProgress?.('Generating PDF document...');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [pageWidth, pageHeight] = PageSizes.A4;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const fontSize = 11;
  const lineHeight = 16;
  let currentY = pageHeight - margin;

  // Title
  const docTitle = file.name.replace(/\.(docx|doc)$/i, '');
  page.drawText(docTitle, {
    x: margin,
    y: currentY - 20,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.5),
  });
  currentY -= 40;

  for (const pText of paragraphs) {
    if (!pText.trim()) continue;

    const words = pText.split(' ');
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

      currentY -= lineHeight + 6; // paragraph spacing
    }
  }

  onProgress?.('Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Conversion complete!');

  return pdfBytes;
}
