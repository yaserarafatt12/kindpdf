import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { cropPdf, parsePageSelection } from '@/lib/pdf/cropPdf';
import { applyOverlays } from '@/lib/pdf/editPdfOverlay';
import { buildPdfFromScans, processScannedImage } from '@/lib/pdf/scanToPdf';

describe('Sprint 4: Advanced Local PDF Tools', () => {
  async function createDummyPdf(pages = 3): Promise<File> {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < pages; i++) {
      const p = pdfDoc.addPage([500, 500]);
      p.drawText(`Dummy Page ${i + 1}`);
    }
    const pdfBytes = await pdfDoc.save();
    return new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });
  }

  describe('Crop PDF Engine', () => {
    it('should parse page selection strings correctly', () => {
      expect(parsePageSelection(5, 'all')).toEqual([0, 1, 2, 3, 4]);
      expect(parsePageSelection(5, 'odd')).toEqual([0, 2, 4]);
      expect(parsePageSelection(5, 'even')).toEqual([1, 3]);
      expect(parsePageSelection(5, '1-3,5')).toEqual([0, 1, 2, 4]);
    });

    it('should set crop box on PDF pages non-destructively', async () => {
      const pdf = await createDummyPdf(3);
      const croppedBytes = await cropPdf(pdf, {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        pageSelection: 'all',
      });

      expect(croppedBytes).toBeInstanceOf(Uint8Array);
      expect(croppedBytes.length).toBeGreaterThan(0);

      const loaded = await PDFDocument.load(croppedBytes);
      expect(loaded.getPageCount()).toBe(3);
    });
  });

  describe('Edit PDF Overlay Engine', () => {
    it('should apply text, shape, and line overlays to PDF', async () => {
      const pdf = await createDummyPdf(2);
      const editedBytes = await applyOverlays(pdf, [
        {
          id: '1',
          type: 'text',
          pageIndex: 0,
          x: 20,
          y: 20,
          text: 'Overlay Text',
          fontSize: 16,
        },
        {
          id: '2',
          type: 'rectangle',
          pageIndex: 1,
          x: 10,
          y: 10,
          width: 30,
          height: 20,
        },
      ]);

      expect(editedBytes).toBeInstanceOf(Uint8Array);
      expect(editedBytes.length).toBeGreaterThan(0);

      const loaded = await PDFDocument.load(editedBytes);
      expect(loaded.getPageCount()).toBe(2);
    });
  });

  describe('Scan to PDF Engine', () => {
    it('should build PDF from image data URLs', async () => {
      // 1x1 red pixel JPEG data URL
      const dummyImageDataUrl =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

      const pdfBytes = await buildPdfFromScans([dummyImageDataUrl], {
        pageSize: 'a4',
        orientation: 'portrait',
        colorMode: 'color',
        brightness: 0,
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);

      const loaded = await PDFDocument.load(pdfBytes);
      expect(loaded.getPageCount()).toBe(1);
    });
  });
});
