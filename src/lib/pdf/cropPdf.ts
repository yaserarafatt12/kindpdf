import { PDFDocument } from 'pdf-lib';

export interface CropOptions {
  /** Margin from left in percentage (0-100) */
  left: number;
  /** Margin from top in percentage (0-100) */
  top: number;
  /** Margin from right in percentage (0-100) */
  right: number;
  /** Margin from bottom in percentage (0-100) */
  bottom: number;
  /** Page selection: 'all', 'odd', 'even', or range string like '1-3,5,8' */
  pageSelection: 'all' | 'odd' | 'even' | string;
}

/**
 * Parse a page selection string into 0-based page indices.
 */
export function parsePageSelection(totalPages: number, selection: string): number[] {
  if (selection === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (selection === 'odd') {
    return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 0); // 0-based: page 1,3,5 = index 0,2,4
  }
  if (selection === 'even') {
    return Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 1); // 0-based: page 2,4,6 = index 1,3,5
  }

  // Parse custom range string like "1-3,5,8-10"
  const indices: Set<number> = new Set();
  const parts = selection.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          indices.add(i - 1); // Convert to 0-based
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Crop PDF pages by setting CropBox with margin percentages.
 * This is a non-destructive crop — hidden content may still exist in the file.
 */
export async function cropPdf(
  file: File,
  options: CropOptions,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('PDF document has no pages.');
  }

  const selectedPages = parsePageSelection(totalPages, options.pageSelection);
  if (selectedPages.length === 0) {
    throw new Error('No pages matched the selection criteria.');
  }

  onProgress?.(`Cropping ${selectedPages.length} page(s)...`);

  for (const pageIndex of selectedPages) {
    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();

    // Calculate crop box from percentage margins
    const cropLeft = (options.left / 100) * width;
    const cropBottom = (options.bottom / 100) * height;
    const cropRight = width - (options.right / 100) * width;
    const cropTop = height - (options.top / 100) * height;

    const cropWidth = cropRight - cropLeft;
    const cropHeight = cropTop - cropBottom;

    if (cropWidth <= 0 || cropHeight <= 0) {
      throw new Error(`Invalid crop area on page ${pageIndex + 1}. Margins are too large.`);
    }

    // Set CropBox (non-destructive crop)
    page.setCropBox(cropLeft, cropBottom, cropWidth, cropHeight);
  }

  onProgress?.('Saving cropped PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Crop complete!');

  return pdfBytes;
}
