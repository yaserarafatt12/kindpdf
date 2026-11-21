import { PDFDocument, PageSizes, degrees } from 'pdf-lib';

export interface ImageToPdfOptions {
  pageSize: 'A4' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'large';
  rotations?: number[];
}

function isPngMagicBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isJpegMagicBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

/**
 * Transcodes WebP (or any browser-decodable image format) into PNG bytes via HTML5 Canvas.
 */
async function transcodeImageFileToPngBytes(file: File): Promise<Uint8Array> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('WEBP image conversion requires a browser canvas environment.');
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas 2D context unavailable for image conversion.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(objectUrl);

        const base64Data = dataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const pngBytes = new Uint8Array(binaryStr.length);
        for (let b = 0; b < binaryStr.length; b++) {
          pngBytes[b] = binaryStr.charCodeAt(b);
        }
        resolve(pngBytes);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image file "${file.name}".`));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts multiple image files (JPG, PNG, WEBP) into a single PDF document 100% in browser RAM.
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
      onProgress(
        i + 1,
        imageFiles.length + 1,
        `Embedding image ${i + 1} of ${imageFiles.length}...`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBytes = new Uint8Array(arrayBuffer);

    let embeddedImage;
    if (isPngMagicBytes(rawBytes)) {
      embeddedImage = await pdfDoc.embedPng(rawBytes);
    } else if (isJpegMagicBytes(rawBytes)) {
      embeddedImage = await pdfDoc.embedJpg(rawBytes);
    } else {
      // WebP or non-native format: transcode to PNG via browser canvas
      const pngBytes = await transcodeImageFileToPngBytes(file);
      embeddedImage = await pdfDoc.embedPng(pngBytes);
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
    const availWidth = Math.max(10, pageWidth - marginSize * 2);
    const availHeight = Math.max(10, pageHeight - marginSize * 2);

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

    const rot = options.rotations?.[i] || 0;
    if (rot % 360 !== 0) {
      page.setRotation(degrees(rot % 360));
    }
  }

  if (onProgress) {
    onProgress(imageFiles.length + 1, imageFiles.length + 1, 'Finalizing PDF generation...');
  }

  const pdfBytes = await pdfDoc.save();
  const firstBase = imageFiles[0].name.replace(/\.[^/.]+$/, '');
  const filename =
    imageFiles.length === 1 ? `${firstBase}.pdf` : `Kindpdf_Converted_Images.pdf`;
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  return { blob, filename };
}
