import { zipSync } from 'fflate';
import { loadPdfJs } from './pdfjsWorker';

export interface PdfToImagesOptions {
  format: 'png' | 'jpeg';
  quality: number; // 0.1 to 1.0 (for JPEG)
  dpiScale: number; // 1.0 = standard, 2.0 = high DPI (300 DPI equivalent)
}

/**
 * Renders PDF document pages into PNG or JPEG image blobs 100% in browser.
 */
export async function renderPdfToImages(
  file: File,
  options: PdfToImagesOptions = { format: 'png', quality: 0.92, dpiScale: 1.5 },
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ isZip: boolean; blob: Blob; filename: string }> {
  const pdfjsLib = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  if (totalPages === 0) {
    throw new Error('PDF document has zero pages.');
  }

  const baseName = file.name.replace(/\.pdf$/i, '');
  const ext = options.format === 'jpeg' ? 'jpg' : 'png';
  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const generatedImages: { filename: string; bytes: Uint8Array }[] = [];
  const zipFiles: Record<string, Uint8Array> = {};

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
      onProgress(i, totalPages, `Rendering page ${i} of ${totalPages} as ${ext.toUpperCase()}...`);
    }

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: options.dpiScale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context creation failed.');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background so transparent PDFs render cleanly in JPEG & PNG
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const dataUrl = canvas.toDataURL(mimeType, options.quality);
    const base64Data = dataUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let b = 0; b < binaryStr.length; b++) {
      bytes[b] = binaryStr.charCodeAt(b);
    }

    const imageFilename = `${baseName}_page_${i}.${ext}`;
    generatedImages.push({ filename: imageFilename, bytes });
    zipFiles[imageFilename] = bytes;
  }

  if (generatedImages.length === 1) {
    const single = generatedImages[0];
    const blob = new Blob([single.bytes.buffer as ArrayBuffer], { type: mimeType });
    return {
      isZip: false,
      blob,
      filename: single.filename,
    };
  }

  if (onProgress) {
    onProgress(totalPages, totalPages, 'Archiving image files into ZIP...');
  }

  const zippedBytes = zipSync(zipFiles);
  const zipBlob = new Blob([zippedBytes.buffer as ArrayBuffer], { type: 'application/zip' });

  return {
    isZip: true,
    blob: zipBlob,
    filename: `${baseName}_Images.zip`,
  };
}
