import { describe, it, expect } from 'vitest';
import { convertImagesToPdf } from '@/lib/pdf/imagesToPdf';
import { PDFDocument } from 'pdf-lib';

describe('Images to PDF Engine', () => {
  it('converts tiny PNG and JPEG files with rotation into a valid PDF document', async () => {
    // 1x1 transparent PNG base64
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBinary = Buffer.from(pngBase64, 'base64');
    const mockPngFile = new File([pngBinary], 'test.png', { type: 'image/png' });

    // 1x1 JPEG base64
    const jpgBase64 =
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    const jpgBinary = Buffer.from(jpgBase64, 'base64');
    const mockJpgFile = new File([jpgBinary], 'photo.jpg', { type: 'image/jpeg' });

    const result = await convertImagesToPdf([mockPngFile, mockJpgFile], {
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 'small',
      rotations: [90, 0],
    });

    expect(result.filename).toBe('Kindpdf_Converted_Images.pdf');
    expect(result.blob.type).toBe('application/pdf');

    const pdfBuffer = await result.blob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    expect(pdfDoc.getPageCount()).toBe(2);
    expect(pdfDoc.getPage(0).getRotation().angle).toBe(90);
  });

  it('throws error when no image files are passed', async () => {
    await expect(convertImagesToPdf([])).rejects.toThrow();
  });
});
