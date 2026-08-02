import { describe, it, expect } from 'vitest';
import { protectPdfDocument, unlockPdfDocument } from '@/lib/pdf/pdfSecurity';
import { PDFDocument } from 'pdf-lib';

describe('PDF Security Engine (Protect & Unlock)', () => {
  it('protects a PDF document with real password encryption', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    const result = await protectPdfDocument(mockFile, { userPassword: 'secret123' });
    expect(result.filename).toBe('Kindpdf_sample_Protected.pdf');
    expect(result.blob.type).toBe('application/pdf');

    const encryptedArrayBuffer = await result.blob.arrayBuffer();

    // Verification 1: Attempting to load without ignoreEncryption must fail because it's encrypted!
    await expect(PDFDocument.load(encryptedArrayBuffer)).rejects.toThrow();

    // Verification 2: Loading with ignoreEncryption succeeds
    const loadedEncryptedDoc = await PDFDocument.load(encryptedArrayBuffer, { ignoreEncryption: true });
    expect(loadedEncryptedDoc.getPageCount()).toBe(1);
  });

  it('throws error when user password is empty', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    await expect(protectPdfDocument(mockFile, { userPassword: '' })).rejects.toThrow();
  });
});
