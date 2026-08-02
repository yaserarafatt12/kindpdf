import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'recommended' | 'extreme' | 'less';

export interface CompressResult {
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
}

/**
 * Perform real client-side PDF file compression using stream optimization and canvas image downscaling.
 * STRICT GUARANTEE: Never inflates file size beyond original input size.
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel = 'recommended',
  onProgress?: (msg: string) => void
): Promise<CompressResult> {
  onProgress?.('Loading PDF for compression...');
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  // Engine 1: Structure & Object Stream Compression via pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const optBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  // Start with stream-optimized bytes
  let bestBytes = optBytes;

  // Engine 2: Canvas Downscaling (ONLY used if it produces a smaller binary than both original and optBytes!)
  if (typeof window !== 'undefined') {
    try {
      onProgress?.('Optimizing page image streams...');
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
      const pdfjsDoc = await loadingTask.promise;
      const numPages = pdfjsDoc.numPages;

      if (numPages > 0) {
        const newPdfDoc = await PDFDocument.create();

        // Downscale parameters
        let scale = 0.80;
        let quality = 0.50;
        if (level === 'extreme') {
          scale = 0.65;
          quality = 0.35;
        } else if (level === 'less') {
          scale = 0.90;
          quality = 0.65;
        }

        for (let i = 1; i <= numPages; i++) {
          onProgress?.(`Compressing page ${i} of ${numPages}...`);
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({ canvasContext: ctx, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64Data = dataUrl.split(',')[1];
            const binaryStr = atob(base64Data);
            const imgBytes = new Uint8Array(binaryStr.length);
            for (let b = 0; b < binaryStr.length; b++) {
              imgBytes[b] = binaryStr.charCodeAt(b);
            }

            const embeddedImg = await newPdfDoc.embedJpg(imgBytes);
            const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
            newPage.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: viewport.width / scale,
              height: viewport.height / scale,
            });
          }
        }

        const rasterBytes = await newPdfDoc.save({ useObjectStreams: true });

        // ONLY use rasterBytes if it is STRICTLY smaller than both bestBytes AND originalSize!
        if (rasterBytes.length < bestBytes.length && rasterBytes.length < originalSize) {
          bestBytes = rasterBytes;
        }
      }
    } catch (err) {
      console.warn('Canvas raster compression fallback:', err);
    }
  }

  // Final Guardrail: If bestBytes is larger than original file, fall back to raw original bytes
  let finalBytes = bestBytes;
  if (bestBytes.length > originalSize) {
    finalBytes = new Uint8Array(arrayBuffer);
  }

  const compressedSize = finalBytes.length;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);

  onProgress?.('Compression complete!');

  return {
    pdfBytes: finalBytes,
    originalSize,
    compressedSize,
    savedPercentage,
  };
}
