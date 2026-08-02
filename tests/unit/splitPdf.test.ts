import { describe, it, expect } from 'vitest';
import { parseRangeString, splitPdfFile } from '@/lib/pdf/splitPdf';
import { PDFDocument } from 'pdf-lib';

describe('Split PDF Engine', () => {
  it('parses valid range strings correctly', () => {
    const parsed = parseRangeString('1-3, 5, 8-10', 10);
    expect(parsed).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
  });

  it('throws error for invalid range strings', () => {
    expect(() => parseRangeString('5-2', 10)).toThrow();
    expect(() => parseRangeString('abc', 10)).toThrow();
  });

  it('splits a dummy 5-page PDF by range into a single PDF blob if only 1 range generated', async () => {
    // Create a 5-page PDF
    const doc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'test_doc.pdf', { type: 'application/pdf' });

    const result = await splitPdfFile(mockFile, {
      mode: 'custom',
      ranges: [{ start: 1, end: 3 }],
    });

    expect(result.isZip).toBe(false);
    expect(result.filename).toBe('test_doc_pages_1-3.pdf');
    expect(result.blob.type).toBe('application/pdf');

    // Verify page count of generated PDF
    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(3);
  });

  it('splits a dummy 5-page PDF in mode "all" into a ZIP archive', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'multi_page.pdf', { type: 'application/pdf' });

    const result = await splitPdfFile(mockFile, { mode: 'all' });

    expect(result.isZip).toBe(true);
    expect(result.filename).toBe('multi_page_Split_Files.zip');
    expect(result.blob.type).toBe('application/zip');
  });
});
