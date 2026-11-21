import { describe, it, expect } from 'vitest';
import { wordToPdf } from '@/lib/pdf/wordToPdf';
import { pdfToWord } from '@/lib/pdf/pdfToWord';
import { ocrPdf } from '@/lib/pdf/ocrPdf';
import { PDFDocument } from 'pdf-lib';
import { unzipSync } from 'fflate';

describe('Sprint 7: Office & OCR Conversion Suite', () => {
  it('should convert Word docx file to PDF', async () => {
    const dummyDocx = new File(['dummy docx content'], 'sample.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const pdfBytes = await wordToPdf(dummyDocx);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  });

  it('should extract text from PDF to a valid OpenXML .docx ZIP container and round-trip back to PDF', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([300, 300]);
    page.drawText('KindPDF Roundtrip OpenXML Test');
    const bytes = await pdfDoc.save();
    const pdfFile = new File([bytes], 'test.pdf', { type: 'application/pdf' });

    const docxBlob = await pdfToWord(pdfFile);
    expect(docxBlob).toBeInstanceOf(Blob);
    expect(docxBlob.size).toBeGreaterThan(0);

    // Verify the generated .docx is a genuine OpenXML ZIP archive with required files
    const docxBuffer = await docxBlob.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(docxBuffer));
    expect(unzipped['[Content_Types].xml']).toBeDefined();
    expect(unzipped['_rels/.rels']).toBeDefined();
    expect(unzipped['word/document.xml']).toBeDefined();

    // Round-trip the generated .docx directly through wordToPdf
    const roundtripDocxFile = new File([docxBuffer], 'roundtrip.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const roundtripPdfBytes = await wordToPdf(roundtripDocxFile);
    const loadedRoundtripPdf = await PDFDocument.load(roundtripPdfBytes);
    expect(loadedRoundtripPdf.getPageCount()).toBeGreaterThanOrEqual(1);
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
