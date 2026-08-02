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

    // Attempting to load without ignoreEncryption must fail because it's encrypted!
    await expect(PDFDocument.load(encryptedArrayBuffer)).rejects.toThrow();
  });

  it('throws error when user password is empty during protect', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    await expect(protectPdfDocument(mockFile, { userPassword: '' })).rejects.toThrow();
  });

  it('unlocks encrypted PDF with correct password and rejects wrong password', async () => {
    // 1. Create original PDF
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 400]);
    const originalBytes = await doc.save();
    const originalFile = new File([originalBytes.buffer as ArrayBuffer], 'secret_doc.pdf', { type: 'application/pdf' });

    // 2. Protect with password 'mypassword123'
    const protectedRes = await protectPdfDocument(originalFile, { userPassword: 'mypassword123' });
    const encryptedFile = new File([await protectedRes.blob.arrayBuffer()], 'secret_doc_protected.pdf', { type: 'application/pdf' });

    // 3. Unlock with WRONG password -> must throw error
    await expect(unlockPdfDocument(encryptedFile, 'wrongpass')).rejects.toThrow('Kata sandi yang Anda masukkan salah');

    // 4. Unlock with CORRECT password -> must succeed
    const unlockedRes = await unlockPdfDocument(encryptedFile, 'mypassword123');
    expect(unlockedRes.filename).toBe('Kindpdf_secret_doc_protected_Unlocked.pdf');

    // 5. Verify unlocked PDF loads cleanly without any encryption error
    const unlockedBytes = await unlockedRes.blob.arrayBuffer();
    const verifiedDoc = await PDFDocument.load(unlockedBytes);
    expect(verifiedDoc.getPageCount()).toBe(1);
  });
});
