import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';

export interface SplitRange {
  start: number; // 1-indexed
  end: number;   // 1-indexed
}

export type SplitMode = 'custom' | 'fixed' | 'all';

export interface SplitPdfOptions {
  mode: SplitMode;
  ranges?: SplitRange[];      // For custom mode
  pagesPerFile?: number;       // For fixed mode (e.g. split every N pages)
}

/**
 * Parses user input string like "1-3, 5, 8-10" into structured SplitRange array.
 * Validates against maxPageCount.
 */
export function parseRangeString(input: string, maxPageCount: number): SplitRange[] {
  if (!input || !input.trim()) return [];

  const rawParts = input.split(',').map((p) => p.trim()).filter(Boolean);
  const result: SplitRange[] = [];

  for (const part of rawParts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range "${part}". Start page must be at least 1 and less than or equal to end page.`);
      }

      const validEnd = Math.min(end, maxPageCount);
      const validStart = Math.min(start, maxPageCount);

      if (validStart <= maxPageCount) {
        result.push({ start: validStart, end: validEnd });
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        throw new Error(`Invalid page number "${part}". Must be a positive integer.`);
      }
      if (pageNum <= maxPageCount) {
        result.push({ start: pageNum, end: pageNum });
      }
    }
  }

  return result;
}

export interface SplitPdfResult {
  isZip: boolean;
  blob: Blob;
  filename: string;
}

/**
 * Splits a PDF file into multiple PDF documents or a single extracted PDF.
 * Processes 100% in browser RAM.
 */
export async function splitPdfFile(
  file: File,
  options: SplitPdfOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<SplitPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('PDF document has zero pages.');
  }

  const baseName = file.name.replace(/\.pdf$/i, '');
  const zipFiles: Record<string, Uint8Array> = {};
  const generatedPdfs: { filename: string; bytes: Uint8Array }[] = [];

  if (options.mode === 'all') {
    // Mode 'all': Extract every single page into an individual PDF
    for (let i = 0; i < totalPages; i++) {
      if (onProgress) {
        onProgress(i + 1, totalPages, `Extracting page ${i + 1} of ${totalPages}...`);
      }
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);

      const pdfBytes = await newDoc.save();
      const pageFilename = `${baseName}_page_${i + 1}.pdf`;
      zipFiles[pageFilename] = pdfBytes;
      generatedPdfs.push({ filename: pageFilename, bytes: pdfBytes });
    }
  } else if (options.mode === 'fixed') {
    // Mode 'fixed': Split every N pages
    const n = options.pagesPerFile || 1;
    let fileIdx = 1;

    for (let i = 0; i < totalPages; i += n) {
      const pageIndexes: number[] = [];
      for (let j = i; j < Math.min(i + n, totalPages); j++) {
        pageIndexes.push(j);
      }

      if (onProgress) {
        onProgress(fileIdx, Math.ceil(totalPages / n), `Creating split file ${fileIdx}...`);
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndexes);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const partFilename = `${baseName}_part_${fileIdx}.pdf`;
      zipFiles[partFilename] = pdfBytes;
      generatedPdfs.push({ filename: partFilename, bytes: pdfBytes });
      fileIdx++;
    }
  } else if (options.mode === 'custom' && options.ranges && options.ranges.length > 0) {
    // Mode 'custom': User-defined ranges
    const ranges = options.ranges;

    for (let r = 0; r < ranges.length; r++) {
      const range = ranges[r];
      const pageIndexes: number[] = [];
      for (let p = range.start - 1; p <= range.end - 1; p++) {
        if (p >= 0 && p < totalPages) {
          pageIndexes.push(p);
        }
      }

      if (pageIndexes.length === 0) continue;

      if (onProgress) {
        onProgress(r + 1, ranges.length, `Generating range ${range.start}-${range.end}...`);
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndexes);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const rangeFilename = `${baseName}_pages_${range.start}-${range.end}.pdf`;
      zipFiles[rangeFilename] = pdfBytes;
      generatedPdfs.push({ filename: rangeFilename, bytes: pdfBytes });
    }
  } else {
    throw new Error('Invalid split configuration.');
  }

  if (generatedPdfs.length === 0) {
    throw new Error('No valid PDF pages were selected to split.');
  }

  // If only 1 PDF was generated, return single PDF blob directly
  if (generatedPdfs.length === 1) {
    const single = generatedPdfs[0];
    const blob = new Blob([single.bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return {
      isZip: false,
      blob,
      filename: single.filename,
    };
  }

  // If multiple PDFs were generated, compress into a ZIP archive
  if (onProgress) {
    onProgress(totalPages, totalPages, 'Archiving split PDF files into ZIP...');
  }

  const zippedBytes = zipSync(zipFiles);
  const zipBlob = new Blob([zippedBytes.buffer as ArrayBuffer], { type: 'application/zip' });

  return {
    isZip: true,
    blob: zipBlob,
    filename: `${baseName}_Split_Files.zip`,
  };
}
