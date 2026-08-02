import { describe, it, expect } from 'vitest';
import { wordToPdf } from '@/lib/pdf/wordToPdf';
import { pdfToWord } from '@/lib/pdf/pdfToWord';
import { ocrPdf } from '@/lib/pdf/ocrPdf';
import { PDFDocument } from 'pdf-lib';

describe('Sprint 7: Office & OCR Conversion Suite', () => {
  it('should convert Word docx file to PDF', async () => {
    const dummyDocx = new File(['dummy docx content'], 'sample.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const pdfBytes = await wordToPdf(dummyDocx);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it('should extract text from PDF to Word docx blob', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([300, 300]);
    const bytes = await pdfDoc.save();
    const pdfFile = new File([bytes], 'test.pdf', { type: 'application/pdf' });

    const docxBlob = await pdfToWord(pdfFile);
    expect(docxBlob).toBeInstanceOf(Blob);
    expect(docxBlob.size).toBeGreaterThan(0);
  });

  it('should run OCR text extraction on PDF', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([300, 300]);
    const bytes = await pdfDoc.save();
    const pdfFile = new File([bytes], 'test.pdf', { type: 'application/pdf' });

    const res = await ocrPdf(pdfFile, 'eng');
    expect(res.extractedText).toContain('OCR Text Extraction Report');
    expect(res.pageCount).toBe(1);
  });
});
