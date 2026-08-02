import { describe, it, expect } from 'vitest';
import { convertImagesToPdf } from '@/lib/pdf/imagesToPdf';
import { PDFDocument } from 'pdf-lib';

describe('Images to PDF Engine', () => {
  it('converts tiny PNG file into a valid PDF document', async () => {
    // 1x1 transparent PNG base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const binary = Buffer.from(pngBase64, 'base64');
    const mockPngFile = new File([binary], 'test.png', { type: 'image/png' });

    const result = await convertImagesToPdf([mockPngFile], {
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 'small',
    });

    expect(result.filename).toBe('test.pdf');
    expect(result.blob.type).toBe('application/pdf');

    const pdfBuffer = await result.blob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it('throws error when no image files are passed', async () => {
    await expect(convertImagesToPdf([])).rejects.toThrow();
  });
});
