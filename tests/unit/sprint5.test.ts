import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { signPdf } from '@/lib/pdf/signPdf';
import { redactPdf } from '@/lib/pdf/redactPdf';
import { comparePdfs } from '@/lib/pdf/comparePdf';
import { repairPdf } from '@/lib/pdf/repairPdf';
import { compressPdf } from '@/lib/pdf/compressPdf';

describe('Sprint 5: PDF Utility & Security Suite', () => {
  async function createDummyPdf(pages = 2): Promise<File> {
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < pages; i++) {
      const p = pdfDoc.addPage([400, 400]);
      p.drawText(`Page ${i + 1}`);
    }
    const bytes = await pdfDoc.save();
    return new File([bytes], 'sample.pdf', { type: 'application/pdf' });
  }

  it('should sign PDF with text and date', async () => {
    const file = await createDummyPdf(2);
    const signed = await signPdf(file, {
      pageIndex: 0,
      x: 10,
      y: 80,
      signatureText: 'John Doe',
      dateText: '2026-08-02',
    });

    expect(signed).toBeInstanceOf(Uint8Array);
    const loaded = await PDFDocument.load(signed);
    expect(loaded.getPageCount()).toBe(2);
  });

  it('should apply black redaction boxes to PDF page', async () => {
    const file = await createDummyPdf(2);
    const redacted = await redactPdf(file, [
      { pageIndex: 0, x: 10, y: 10, width: 50, height: 20 },
    ]);

    expect(redacted).toBeInstanceOf(Uint8Array);
    const loaded = await PDFDocument.load(redacted);
    expect(loaded.getPageCount()).toBe(2);
  });

  it('should compare two PDFs and return report', async () => {
    const f1 = await createDummyPdf(2);
    const f2 = await createDummyPdf(3);

    const report = await comparePdfs(f1, f2);
    expect(report.doc1Pages).toBe(2);
    expect(report.doc2Pages).toBe(3);
    expect(report.pageCountMatch).toBe(false);
  });

  it('should repair PDF structure', async () => {
    const file = await createDummyPdf(2);
    const repaired = await repairPdf(file);

    expect(repaired).toBeInstanceOf(Uint8Array);
    const loaded = await PDFDocument.load(repaired);
    expect(loaded.getPageCount()).toBe(2);
  });

  it('should compress PDF and report delta', async () => {
    const file = await createDummyPdf(2);
    const res = await compressPdf(file, 'recommended');

    expect(res.pdfBytes).toBeInstanceOf(Uint8Array);
    expect(res.originalSize).toBeGreaterThan(0);
  });
});
