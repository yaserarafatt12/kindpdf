/**
 * Shared PDF.js loader with local worker configuration (/pdf.worker.min.js).
 * Ensures zero external CDN dependency, zero CORS failure, and 100% offline reliability.
 */
export const LOCAL_PDF_WORKER_SRC = '/pdf.worker.min.js';

export async function loadPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = LOCAL_PDF_WORKER_SRC;
  }
  return pdfjsLib;
}

export interface PagePreviewResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Renders a single 1-indexed PDF page to a JPEG data URL in the browser.
 * Safely returns null in non-DOM/SSR environments.
 */
export async function renderPdfPagePreview(
  file: File,
  pageNumber: number = 1,
  scale: number = 1.15
): Promise<PagePreviewResult | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const clampedPage = Math.max(1, Math.min(pdfDoc.numPages, pageNumber));
    const page = await pdfDoc.getPage(clampedPage);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    return {
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    };
  } catch (err) {
    console.warn('PDF page preview render fallback:', err);
    return null;
  }
}
