import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImageToPdfOptions {
  pageSize: 'A4' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'large';
}

/**
 * Converts multiple image files (JPG, PNG) into a single PDF document 100% in browser RAM.
 */
export async function convertImagesToPdf(
  imageFiles: File[],
  options: ImageToPdfOptions = { pageSize: 'A4', orientation: 'portrait', margin: 'small' },
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('Please select at least one image file to convert.');
  }

  if (onProgress) {
    onProgress(1, imageFiles.length + 1, 'Initializing PDF document...');
  }

  const pdfDoc = await PDFDocument.create();

  // Margin calculation (points)
  let marginSize = 0;
  if (options.margin === 'small') marginSize = 20;
  if (options.margin === 'large') marginSize = 40;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (onProgress) {
      onProgress(i + 1, imageFiles.length + 1, `Embedding image ${i + 1} of ${imageFiles.length}...`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = PageSizes.A4[0];
    let pageHeight = PageSizes.A4[1];

    if (options.pageSize === 'fit') {
      pageWidth = imgWidth + marginSize * 2;
      pageHeight = imgHeight + marginSize * 2;
    } else if (options.orientation === 'landscape') {
      pageWidth = PageSizes.A4[1];
      pageHeight = PageSizes.A4[0];
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate scaled dimensions within margin
    const availWidth = pageWidth - marginSize * 2;
    const availHeight = pageHeight - marginSize * 2;

    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) {
    onProgress(imageFiles.length + 1, imageFiles.length + 1, 'Finalizing PDF generation...');
  }

  const pdfBytes = await pdfDoc.save();
  const firstBase = imageFiles[0].name.replace(/\.[^/.]+$/, '');
  const filename = imageFiles.length === 1 ? `${firstBase}.pdf` : `Kindpdf_Converted_Images.pdf`;
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return { blob, filename };
}
