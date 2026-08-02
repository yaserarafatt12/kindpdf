import { describe, it, expect } from 'vitest';
import { removePagesFromPdf, extractPagesFromPdf } from '@/lib/pdf/pageOperations';
import { PDFDocument } from 'pdf-lib';

describe('Page Operations Engine (Remove & Extract)', () => {
  it('removes specific pages from a 5-page PDF correctly', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    // Remove pages 2 and 4 (should leave 3 pages: 1, 3, 5)
    const result = await removePagesFromPdf(mockFile, [2, 4]);

    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(3);
    expect(result.filename).toBe('sample_Removed_Pages.pdf');
  });

  it('throws error when attempting to remove ALL pages', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 3; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    await expect(removePagesFromPdf(mockFile, [1, 2, 3])).rejects.toThrow();
  });

  it('extracts specific pages into a single PDF correctly', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    // Extract pages 1 and 5
    const result = await extractPagesFromPdf(mockFile, [1, 5], false);

    expect(result.isZip).toBe(false);
    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(2);
  });
});
