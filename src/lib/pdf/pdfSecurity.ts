import { PDFDocument } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';

export interface ProtectPdfOptions {
  userPassword: string;
  ownerPassword?: string;
}

/**
 * Validates and applies real RC4 128-bit PDF encryption to a PDF document 100% in browser RAM.
 */
export async function protectPdfDocument(
  file: File,
  options: ProtectPdfOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (!options.userPassword || !options.userPassword.trim()) {
    throw new Error('Password cannot be empty.');
  }

  if (onProgress) {
    onProgress(1, 2, 'Loading PDF document...');
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBytes = new Uint8Array(arrayBuffer);

  if (onProgress) {
    onProgress(2, 2, 'Encrypting PDF streams & setting password protection...');
  }

  // Real PDF Standard Security Handler Encryption (RC4 128-bit)
  const encryptedBytes = await encryptPDF(
    inputBytes,
    options.userPassword,
    options.ownerPassword || options.userPassword
  );

  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([encryptedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    filename: `Kindpdf_${baseName}_Protected.pdf`,
  };
}

/**
 * Unlocks a password-protected PDF document into a clean, unencrypted PDF.
 * Validates password correctness and decrypts streams cleanly.
 */
export async function unlockPdfDocument(
  file: File,
  password?: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (onProgress) {
    onProgress(1, 2, 'Verifying PDF encryption status...');
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBytes = new Uint8Array(arrayBuffer);

  const check = await isEncrypted(inputBytes);
  if (!check.encrypted) {
    throw new Error('Dokumen PDF ini tidak terenkripsi / tidak memiliki kata sandi.');
  }

  if (!password || !password.trim()) {
    throw new Error('Kata sandi diperlukan untuk membuka dokumen PDF terenkripsi.');
  }

  if (onProgress) {
    onProgress(2, 2, 'Decrypting streams and removing password protection...');
  }

  try {
    const decryptedBytes = await decryptPDF(inputBytes, password.trim());

    const baseName = file.name.replace(/\.pdf$/i, '');
    const blob = new Blob([decryptedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    return {
      blob,
      filename: `Kindpdf_${baseName}_Unlocked.pdf`,
    };
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('password')) {
      throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
    }
    throw new Error(msg || 'Gagal membuka enkripsi dokumen PDF.');
  }
}
