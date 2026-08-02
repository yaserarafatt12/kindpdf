import { PDFDocument } from 'pdf-lib';

export interface ComparisonReport {
  doc1Name: string;
  doc2Name: string;
  doc1Pages: number;
  doc2Pages: number;
  pageCountMatch: boolean;
  doc1Size: number;
  doc2Size: number;
  sizeDiffBytes: number;
  isIdenticalSize: boolean;
}

/**
 * Compare two PDF files locally and generate structural analysis report.
 */
export async function comparePdfs(
  file1: File,
  file2: File,
  onProgress?: (msg: string) => void
): Promise<ComparisonReport> {
  onProgress?.('Loading Document 1...');
  const buf1 = await file1.arrayBuffer();
  const pdf1 = await PDFDocument.load(buf1);

  onProgress?.('Loading Document 2...');
  const buf2 = await file2.arrayBuffer();
  const pdf2 = await PDFDocument.load(buf2);

  const doc1Pages = pdf1.getPageCount();
  const doc2Pages = pdf2.getPageCount();

  onProgress?.('Comparing structural properties...');

  return {
    doc1Name: file1.name,
    doc2Name: file2.name,
    doc1Pages,
    doc2Pages,
    pageCountMatch: doc1Pages === doc2Pages,
    doc1Size: file1.size,
    doc2Size: file2.size,
    sizeDiffBytes: Math.abs(file1.size - file2.size),
    isIdenticalSize: file1.size === file2.size,
  };
}
