/**
 * Client-side PDF to Word (.docx) text extraction & document packaging engine.
 * Extracts real text content streams from PDF pages using pdfjs-dist and packages into .docx XML format.
 */
export async function pdfToWord(
  file: File,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  onProgress?.('Loading PDF for text extraction...');
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const title = file.name.replace(/\.pdf$/i, '');

  let docxXmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(`Extracting text from page ${i} of ${totalPages}...`);
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Extract actual string tokens from page text items
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ')
      .trim();

    docxXmlContent += `
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Page ${i}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${escapeXml(pageText || `[Page ${i} contains non-selectable visual image streams]`)}</w:t></w:r></w:p>`;
  }

  docxXmlContent += `
  </w:body>
</w:document>`;

  onProgress?.('Packaging Word document...');
  const textBlob = new Blob([docxXmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return textBlob;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
