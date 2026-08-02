import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type OverlayType = 'text' | 'rectangle' | 'circle' | 'line';

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface OverlayItem {
  id: string;
  type: OverlayType;
  /** 0-based page index */
  pageIndex: number;
  /** X coordinate in percentage (0-100) from page left */
  x: number;
  /** Y coordinate in percentage (0-100) from page top */
  y: number;
  /** Text content (for text overlay) */
  text?: string;
  /** Font size in pt (default 16) */
  fontSize?: number;
  /** Font color */
  color?: ColorRGB;
  /** Opacity (0 to 1) */
  opacity?: number;
  /** Width in percentage (0-100) of page width */
  width?: number;
  /** Height in percentage (0-100) of page height */
  height?: number;
  /** Fill color for shapes */
  fillColor?: ColorRGB;
  /** Stroke color for shapes */
  strokeColor?: ColorRGB;
  /** Stroke width in pt */
  strokeWidth?: number;
}

/**
 * Apply array of text and shape overlays onto a PDF document.
 */
export async function applyOverlays(
  file: File,
  overlays: OverlayItem[],
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading PDF for editing...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('PDF document contains no pages.');
  }

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  onProgress?.(`Applying ${overlays.length} overlay element(s)...`);

  for (const item of overlays) {
    if (item.pageIndex < 0 || item.pageIndex >= totalPages) {
      continue;
    }

    const page = pdfDoc.getPage(item.pageIndex);
    const { width: pWidth, height: pHeight } = page.getSize();

    // Convert percentage coordinates to PDF points
    // Note: PDF coordinate system (0,0) is BOTTOM-left, whereas web UI is TOP-left
    const pdfX = (item.x / 100) * pWidth;
    const pdfY = pHeight - (item.y / 100) * pHeight; // Invert Y

    const color = item.color ? rgb(item.color.r / 255, item.color.g / 255, item.color.b / 255) : rgb(0, 0, 0);
    const opacity = item.opacity ?? 1;

    if (item.type === 'text' && item.text) {
      const fontSize = item.fontSize ?? 16;
      page.drawText(item.text, {
        x: pdfX,
        y: pdfY - fontSize, // Adjust for top baseline
        size: fontSize,
        font: helveticaFont,
        color,
        opacity,
      });
    } else if (item.type === 'rectangle') {
      const rectWidth = ((item.width ?? 20) / 100) * pWidth;
      const rectHeight = ((item.height ?? 10) / 100) * pHeight;

      const fillColor = item.fillColor
        ? rgb(item.fillColor.r / 255, item.fillColor.g / 255, item.fillColor.b / 255)
        : undefined;
      const strokeColor = item.strokeColor
        ? rgb(item.strokeColor.r / 255, item.strokeColor.g / 255, item.strokeColor.b / 255)
        : color;

      page.drawRectangle({
        x: pdfX,
        y: pdfY - rectHeight,
        width: rectWidth,
        height: rectHeight,
        color: fillColor,
        borderColor: strokeColor,
        borderWidth: item.strokeWidth ?? 2,
        opacity,
      });
    } else if (item.type === 'circle') {
      const radius = (((item.width ?? 10) / 2) / 100) * pWidth;

      const fillColor = item.fillColor
        ? rgb(item.fillColor.r / 255, item.fillColor.g / 255, item.fillColor.b / 255)
        : undefined;
      const strokeColor = item.strokeColor
        ? rgb(item.strokeColor.r / 255, item.strokeColor.g / 255, item.strokeColor.b / 255)
        : color;

      page.drawCircle({
        x: pdfX + radius,
        y: pdfY - radius,
        size: radius,
        color: fillColor,
        borderColor: strokeColor,
        borderWidth: item.strokeWidth ?? 2,
        opacity,
      });
    } else if (item.type === 'line') {
      const targetX = pdfX + ((item.width ?? 20) / 100) * pWidth;
      const targetY = pdfY - ((item.height ?? 0) / 100) * pHeight;

      page.drawLine({
        start: { x: pdfX, y: pdfY },
        end: { x: targetX, y: targetY },
        thickness: item.strokeWidth ?? 2,
        color,
        opacity,
      });
    }
  }

  onProgress?.('Saving edited PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Edit complete!');

  return pdfBytes;
}
