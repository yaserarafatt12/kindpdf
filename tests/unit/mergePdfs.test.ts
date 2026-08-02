import { describe, it, expect } from 'vitest';
import { mergePdfFiles } from '../../src/lib/pdf/mergePdfs';
import { PDFDocument } from 'pdf-lib';

describe('mergePdfFiles', () => {
  it('should throw an error if fewer than 2 files are provided', async () => {
    const file1 = new File(['dummy'], 'doc1.pdf', { type: 'application/pdf' });
    await expect(mergePdfFiles([file1])).rejects.toThrow();
  });

  it('should successfully merge 2 valid PDF documents into one PDF with combined page count', async () => {
    // Create doc A (2 pages)
    const docA = await PDFDocument.create();
    docA.addPage([500, 500]);
    docA.addPage([500, 500]);
    const bytesA = await docA.save();
    const fileA = new File([bytesA], 'docA.pdf', { type: 'application/pdf' });

    // Create doc B (3 pages)
    const docB = await PDFDocument.create();
    docB.addPage([500, 500]);
    docB.addPage([500, 500]);
    docB.addPage([500, 500]);
    const bytesB = await docB.save();
    const fileB = new File([bytesB], 'docB.pdf', { type: 'application/pdf' });

    const progressMessages: string[] = [];
    const mergedBytes = await mergePdfFiles([fileA, fileB], (_, __, msg) => {
      progressMessages.push(msg);
    });

    expect(mergedBytes).toBeInstanceOf(Uint8Array);
    expect(mergedBytes.length).toBeGreaterThan(0);
    expect(progressMessages.length).toBeGreaterThan(0);

    // Verify merged PDF page count is 2 + 3 = 5 pages
    const loadedMergedDoc = await PDFDocument.load(mergedBytes);
    expect(loadedMergedDoc.getPageCount()).toBe(5);
  });
});
