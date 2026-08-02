import { PDFDocument } from 'pdf-lib';
import { ERROR_MESSAGES, HumanError } from '../errors/messages';

export interface ValidationResult {
  isValid: boolean;
  pageCount: number;
  error?: HumanError;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * Validates a PDF file for size, format, encryption, and corruption.
 * Reads ArrayBuffer and counts pages using pdf-lib safely.
 */
export async function validatePdfFile(file: File): Promise<ValidationResult> {
  // 1. Validate File Extension & MIME Type
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.INVALID_FORMAT };
  }

  // 2. Validate Size Limit (100 MB)
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.TOO_LARGE };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 3. Inspect PDF Magic Bytes (%PDF-)
    if (bytes.length < 5) {
      return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.INVALID_FORMAT };
    }
    const header = String.fromCharCode(...bytes.subarray(0, 5));
    if (header !== '%PDF-') {
      return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.INVALID_FORMAT };
    }

    // 4. Try Loading with pdf-lib to check encryption & corruption
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
      if (pdfDoc.isEncrypted) {
        return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.ENCRYPTED };
      }
      const pageCount = pdfDoc.getPageCount();
      return { isValid: true, pageCount };
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('encrypted') || msg.includes('password')) {
        return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.ENCRYPTED };
      }
      return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.CORRUPTED };
    }
  } catch (err) {
    return { isValid: false, pageCount: 0, error: ERROR_MESSAGES.CORRUPTED };
  }
}
