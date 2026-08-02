import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { htmlToPdf } from '@/lib/pdf/htmlToPdf';
import { convertToPdfA } from '@/lib/pdf/pdfToPdfA';

describe('Sprint 6: Client-Side Conversion Extras', () => {
  async function createDummyPdf(): Promise<File> {
    const pdfDoc = await PDFDocument.create();
    const p = pdfDoc.addPage([300, 300]);
    p.drawText('Sample PDF/A input');
    const bytes = await pdfDoc.save();
    return new File([bytes], 'input.pdf', { type: 'application/pdf' });
  }

  it('should generate PDF from HTML/text content', async () => {
    const pdfBytes = await htmlToPdf({
      title: 'Unit Test Document',
      content: 'Hello world! This is a test conversion.',
      pageSize: 'a4',
      fontSize: 12,
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    const loaded = await PDFDocument.load(pdfBytes);
    expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('should convert PDF to PDF/A archival standard', async () => {
    const file = await createDummyPdf();
    const pdfaBytes = await convertToPdfA(file, '2b');

    expect(pdfaBytes).toBeInstanceOf(Uint8Array);
    expect(pdfaBytes.length).toBeGreaterThan(0);

    const loaded = await PDFDocument.load(pdfaBytes);
    expect(loaded.getTitle()).toBe('input');
    expect(loaded.getCreator()).toContain('Kindpdf');
  });
});
