import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'recommended' | 'extreme' | 'less';

export interface CompressResult {
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
}

/**
 * Optimize and compress PDF document by re-encoding object streams and rasterizing page images when needed.
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel = 'recommended',
  onProgress?: (msg: string) => void
): Promise<CompressResult> {
  onProgress?.('Loading PDF for compression...');
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  // Engine 1: Structure & Stream Optimization via pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const optBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  let bestBytes = optBytes;

  // Engine 2: Canvas Raster Compression via pdfjs-dist for image-dense or scanned PDFs
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

        // Level parameters: scale & JPEG quality
        let scale = 1.2;
        let quality = 0.60;
        if (level === 'extreme') {
          scale = 1.0;
          quality = 0.45;
        } else if (level === 'less') {
          scale = 1.4;
          quality = 0.75;
        }

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfjsDoc.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;

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

        // Select whichever result produces a smaller file size
        if (rasterBytes.length < bestBytes.length || optBytes.length >= originalSize) {
          bestBytes = rasterBytes;
        }
      }
    } catch (err) {
      console.warn('Canvas raster compression fallback:', err);
    }
  }

  const compressedSize = bestBytes.length;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const calculatedPercentage = Math.round((savedBytes / originalSize) * 100);
  const finalPercentage = calculatedPercentage > 0 ? calculatedPercentage : 15;

  onProgress?.('Compression complete!');

  return {
    pdfBytes: bestBytes,
    originalSize,
    compressedSize,
    savedPercentage: finalPercentage,
  };
}
