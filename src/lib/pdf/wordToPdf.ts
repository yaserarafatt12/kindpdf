import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { unzipSync } from 'fflate';
import { sanitizeWinAnsi, decodeXmlEntities } from './sanitizeText';

/**
 * Client-side Word (.docx) to PDF conversion engine.
 * Parses word/document.xml inside .docx ZIP container and builds PDF via pdf-lib.
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
    unzipped = {};
  }

  const documentXmlPath = Object.keys(unzipped).find(
    (path) => path === 'word/document.xml' || path.endsWith('/document.xml')
  );

  let paragraphs: string[] = [];

  if (documentXmlPath && unzipped[documentXmlPath]) {
    const xmlText = new TextDecoder('utf-8').decode(unzipped[documentXmlPath]);
    paragraphs = extractParagraphsFromWordXml(xmlText);
  } else {
    // Fallback if plain text or raw XML buffer was provided
    const rawText = new TextDecoder('utf-8', { fatal: false }).decode(zipData);
    if (rawText.includes('<w:document') || rawText.includes('<w:t')) {
      paragraphs = extractParagraphsFromWordXml(rawText);
    } else {
      const cleaned = sanitizeWinAnsi(rawText, true).trim();
      paragraphs = cleaned
        ? cleaned.split('\n').map((l) => l.trim()).filter(Boolean)
        : [sanitizeWinAnsi(file.name.replace(/\.(docx|doc)$/i, '')) || 'Document'];
    }
  }

  if (paragraphs.length === 0) {
    paragraphs = [sanitizeWinAnsi(file.name.replace(/\.(docx|doc)$/i, '')) || 'Document'];
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
  const rawTitle = file.name.replace(/\.(docx|doc)$/i, '');
  const docTitle = sanitizeWinAnsi(rawTitle) || 'Document';
  page.drawText(docTitle, {
    x: margin,
    y: currentY - 20,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.5),
  });
  currentY -= 40;

  for (const rawParagraph of paragraphs) {
    const pText = sanitizeWinAnsi(rawParagraph).trim();
    if (!pText) continue;

    const words = pText.split(/\s+/);
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

      currentY -= lineHeight + 6;
    }
  }

  onProgress?.('Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Conversion complete!');

  return pdfBytes;
}

function extractParagraphsFromWordXml(xmlText: string): string[] {
  const paragraphs: string[] = [];
  const pBlocks = xmlText.match(/<w:p[\s>][\s\S]*?<\/w:p>/g);

  if (pBlocks && pBlocks.length > 0) {
    for (const pBlock of pBlocks) {
      const tMatches = pBlock.match(/<w:t[^>]*>[\s\S]*?<\/w:t>/g) || [];
      let pText = '';
      for (const tMatch of tMatches) {
        const inner = tMatch.replace(/<[^>]+>/g, '');
        pText += decodeXmlEntities(inner);
      }
      const clean = sanitizeWinAnsi(pText).trim();
      if (clean) {
        paragraphs.push(clean);
      }
    }
  } else {
    const textMatches = xmlText.match(/<w:t[^>]*>[\s\S]*?<\/w:t>/g) || [];
    for (const match of textMatches) {
      const text = decodeXmlEntities(match.replace(/<[^>]+>/g, ''));
      const clean = sanitizeWinAnsi(text).trim();
      if (clean) {
        paragraphs.push(clean);
      }
    }
  }

  return paragraphs;
}
