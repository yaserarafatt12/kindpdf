import { describe, it, expect } from 'vitest';
import { organizePdfDocument } from '@/lib/pdf/organizePages';
import { PDFDocument } from 'pdf-lib';

describe('Organize Pages Engine (Rotate, Reorder, Delete)', () => {
  it('reorders and rotates pages correctly', async () => {
    // Create 4-page PDF
    const doc = await PDFDocument.create();
    for (let i = 0; i < 4; i++) {
      doc.addPage([300, 400]);
    }
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'doc.pdf', { type: 'application/pdf' });

    // Reorder: 4, 1, 3 (deletes page 2), rotate page 4 by 90 deg
    const result = await organizePdfDocument(mockFile, {
      pageOrder: [4, 1, 3],
      rotations: { 4: 90 },
    });

    expect(result.filename).toBe('doc_Organized.pdf');

    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(3);

    // Verify first page (original page 4) has rotation 90
    const firstPage = resultDoc.getPage(0);
    expect(firstPage.getRotation().angle).toBe(90);
  });

  it('throws error when pageOrder is empty', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'doc.pdf', { type: 'application/pdf' });

    await expect(
      organizePdfDocument(mockFile, { pageOrder: [], rotations: {} })
    ).rejects.toThrow();
  });
});
