import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'recommended' | 'extreme' | 'less';

export interface CompressResult {
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
}

/**
 * Optimize and compress PDF document by re-encoding object streams and optimizing PDF structures.
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel = 'recommended',
  onProgress?: (msg: string) => void
): Promise<CompressResult> {
  onProgress?.('Loading PDF for compression...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress?.('Optimizing object streams and compressing structures...');

  // Re-save with object stream compression enabled
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const originalSize = file.size;
  const compressedSize = pdfBytes.length;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);

  onProgress?.('Compression complete!');

  return {
    pdfBytes,
    originalSize,
    compressedSize,
    savedPercentage,
  };
}
