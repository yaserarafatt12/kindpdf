import { describe, it, expect } from 'vitest';
import { validatePdfFile } from '../../src/lib/files/validateFile';
import { PDFDocument } from 'pdf-lib';

describe('validatePdfFile', () => {
  it('should reject non-PDF file extension', async () => {
    const fakeFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const result = await validatePdfFile(fakeFile);
    expect(result.isValid).toBe(false);
    expect(result.error?.type).toBe('INVALID_FORMAT');
  });

  it('should reject corrupted PDF bytes without %PDF- header', async () => {
    const fakeFile = new File(['NOT_A_PDF_FILE_HEADER'], 'corrupted.pdf', { type: 'application/pdf' });
    const result = await validatePdfFile(fakeFile);
    expect(result.isValid).toBe(false);
    expect(result.error?.type).toBe('INVALID_FORMAT');
  });

  it('should validate a valid PDF file and return correct page count', async () => {
    // Generate a valid 2-page dummy PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 400]);
    pdfDoc.addPage([600, 400]);
    const pdfBytes = await pdfDoc.save();

    const validFile = new File([pdfBytes], 'sample.pdf', { type: 'application/pdf' });
    const result = await validatePdfFile(validFile);
    expect(result.isValid).toBe(true);
    expect(result.pageCount).toBe(2);
    expect(result.error).toBeUndefined();
  });
});
