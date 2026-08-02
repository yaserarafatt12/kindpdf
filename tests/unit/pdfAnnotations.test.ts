import { describe, it, expect } from 'vitest';
import { addPageNumbersToPdf, addWatermarkToPdf } from '@/lib/pdf/pdfAnnotations';
import { PDFDocument } from 'pdf-lib';

describe('PDF Annotations Engine (Page Numbers & Watermark)', () => {
  it('adds page numbers to a 3-page PDF document', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    doc.addPage([300, 400]);
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'report.pdf', { type: 'application/pdf' });

    const result = await addPageNumbersToPdf(mockFile, {
      position: 'bottom-center',
      format: 'page_of_total',
      fontSize: 10,
      margin: 20,
    });

    expect(result.filename).toBe('report_PageNumbers.pdf');
    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(3);
  });

  it('adds watermark text to a PDF document', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]);
    const pdfBytes = await doc.save();
    const mockFile = new File([pdfBytes.buffer as ArrayBuffer], 'draft.pdf', { type: 'application/pdf' });

    const result = await addWatermarkToPdf(mockFile, {
      text: 'CONFIDENTIAL',
      fontSize: 40,
      opacity: 0.2,
      rotation: 45,
    });

    expect(result.filename).toBe('draft_Watermarked.pdf');
    const resultBuffer = await result.blob.arrayBuffer();
    const resultDoc = await PDFDocument.load(resultBuffer);
    expect(resultDoc.getPageCount()).toBe(1);
  });
});
