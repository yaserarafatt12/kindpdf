import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ScanOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape';
  colorMode: 'color' | 'grayscale' | 'bw';
  brightness: number; // -100 to 100
}

/**
 * Capture frame from an HTMLVideoElement and return JPEG base64 Data URL.
 */
export function captureFrameFromVideo(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable.');
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Process a captured image Data URL with color filters & brightness adjustment.
 */
export function processScannedImage(
  dataUrl: string,
  colorMode: 'color' | 'grayscale' | 'bw',
  brightness: number
): Promise<string> {
  // If no processing required, return dataUrl directly
  if (colorMode === 'color' && brightness === 0) {
    return Promise.resolve(dataUrl);
  }

  if (typeof Image === 'undefined') {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const bFactor = brightness * 2.55; // convert -100..100 to -255..255

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] + bFactor;
        let g = data[i + 1] + bFactor;
        let b = data[i + 2] + bFactor;

        if (colorMode === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray;
          g = gray;
          b = gray;
        } else if (colorMode === 'bw') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          const bw = gray > 128 ? 255 : 0;
          r = bw;
          g = bw;
          b = bw;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => reject(new Error('Failed to load image for filter processing.'));
    img.src = dataUrl;
  });
}

/**
 * Combine multiple scanned image Data URLs into a PDF document.
 */
export async function buildPdfFromScans(
  images: string[],
  options: ScanOptions,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Initializing PDF generator...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    onProgress?.(`Processing scan ${i + 1} of ${images.length}...`);

    // Process image filter
    const processedUrl = await processScannedImage(images[i], options.colorMode, options.brightness);
    const base64Data = processedUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const embeddedImage = await pdfDoc.embedJpg(imageBytes);

    let pageWidth = embeddedImage.width;
    let pageHeight = embeddedImage.height;

    if (options.pageSize === 'a4') {
      [pageWidth, pageHeight] = PageSizes.A4;
    } else if (options.pageSize === 'letter') {
      [pageWidth, pageHeight] = PageSizes.Letter;
    }

    if (options.orientation === 'landscape') {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw image centered & fitted
    const scale = Math.min(pageWidth / embeddedImage.width, pageHeight / embeddedImage.height);
    const drawW = embeddedImage.width * scale;
    const drawH = embeddedImage.height * scale;
    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }

  onProgress?.('Saving PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.('Complete!');

  return pdfBytes;
}
