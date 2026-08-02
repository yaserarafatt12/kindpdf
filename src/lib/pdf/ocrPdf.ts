export interface OcrResult {
  extractedText: string;
  pageCount: number;
}

/**
 * Client-side text layer & character extraction engine for PDF documents.
 * Extracts real selectable text characters and structure streams using pdfjs-dist.
 */
export async function ocrPdf(
  file: File,
  language: 'eng' | 'ind' = 'eng',
  onProgress?: (msg: string) => void
): Promise<OcrResult> {
  onProgress?.('Loading PDF for text layer analysis...');
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const baseName = file.name.replace(/\.pdf$/i, '');

  let extractedText = `=== OCR Text Extraction Report ===\nDocument: ${baseName}\nTotal Pages: ${pageCount}\nLanguage: ${language.toUpperCase()}\n\n`;

  for (let i = 1; i <= pageCount; i++) {
    onProgress?.(`Extracting text layer from page ${i} of ${pageCount}...`);
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();

    const pageTextItems = textContent.items.map((item: any) => item.str || '').join(' ').trim();

    extractedText += `--- Page ${i} ---\n`;
    if (pageTextItems) {
      extractedText += `${pageTextItems}\n\n`;
    } else {
      extractedText += `[Page ${i} contains visual image scans without embedded text characters.]\n\n`;
    }
  }

  onProgress?.('Text extraction complete!');

  return {
    extractedText,
    pageCount,
  };
}
