import { PDFDocument } from 'pdf-lib';
import { loadPdfJs } from './pdfjsWorker';

export interface PageTextDiff {
  pageNumber: number;
  matches: boolean;
  doc1Snippet: string;
  doc2Snippet: string;
}

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
  textMatch?: boolean;
  pageDiffs?: PageTextDiff[];
}

/**
 * Compare two PDF files locally and generate structural + text analysis report.
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

  onProgress?.('Comparing structural properties & text layers...');

  let textMatch = doc1Pages === doc2Pages;
  const pageDiffs: PageTextDiff[] = [];

  try {
    const pdfjsLib = await loadPdfJs();
    const [pDoc1, pDoc2] = await Promise.all([
      pdfjsLib.getDocument({ data: buf1.slice(0) }).promise,
      pdfjsLib.getDocument({ data: buf2.slice(0) }).promise,
    ]);

    const maxPages = Math.min(Math.max(doc1Pages, doc2Pages), 30);
    for (let i = 1; i <= maxPages; i++) {
      let text1 = '';
      let text2 = '';

      if (i <= doc1Pages) {
        const page1 = await pDoc1.getPage(i);
        const tc1 = await page1.getTextContent();
        text1 = tc1.items.map((item: any) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
      }
      if (i <= doc2Pages) {
        const page2 = await pDoc2.getPage(i);
        const tc2 = await page2.getTextContent();
        text2 = tc2.items.map((item: any) => item.str || '').join(' ').replace(/\s+/g, ' ').trim();
      }

      const matches = i <= doc1Pages && i <= doc2Pages && text1 === text2;
      if (!matches) {
        textMatch = false;
      }

      pageDiffs.push({
        pageNumber: i,
        matches,
        doc1Snippet: text1 ? text1.slice(0, 140) : i <= doc1Pages ? '[No selectable text]' : '[Page not present]',
        doc2Snippet: text2 ? text2.slice(0, 140) : i <= doc2Pages ? '[No selectable text]' : '[Page not present]',
      });
    }
  } catch {
    // Fallback gracefully if PDF.js text layer diff is skipped
  }

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
    textMatch,
    pageDiffs,
  };
}
