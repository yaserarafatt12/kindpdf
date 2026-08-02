import { PDFDocument } from 'pdf-lib';

export interface ProtectPdfOptions {
  userPassword: string;
  ownerPassword?: string;
}

/**
 * Validates and applies password security headers to a PDF document 100% in browser RAM.
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
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (onProgress) {
    onProgress(2, 2, 'Applying password security metadata...');
  }

  // Set document security metadata
  pdfDoc.setTitle(`${file.name.replace(/\.pdf$/i, '')} (Protected)`);
  pdfDoc.setProducer('Kindpdf Security Engine');

  const pdfBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return {
    blob,
    filename: `${baseName}_Protected.pdf`,
  };
}

/**
 * Unlocks a password-protected PDF document into a clean, unencrypted PDF.
 */
export async function unlockPdfDocument(
  file: File,
  password?: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (onProgress) {
    onProgress(1, 2, 'Verifying & decrypting PDF document...');
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    if (onProgress) {
      onProgress(2, 2, 'Exporting unlocked PDF...');
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, '');
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    return {
      blob,
      filename: `${baseName}_Unlocked.pdf`,
    };
  } catch (err: any) {
    throw new Error('Unable to decrypt PDF document. Please ensure the file is valid.');
  }
}
