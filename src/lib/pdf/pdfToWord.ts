import { zipSync, strToU8 } from 'fflate';
import { loadPdfJs } from './pdfjsWorker';

/**
 * Client-side PDF to Word (.docx) text extraction & OpenXML ZIP packaging engine.
 * Extracts real text content streams from PDF pages using pdfjs-dist and packages
 * a standards-compliant OpenXML .docx archive (ZIP container with [Content_Types].xml,
 * _rels/.rels, word/_rels/document.xml.rels, and word/document.xml).
 */
export async function pdfToWord(
  file: File,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  onProgress?.('Loading PDF for text extraction...');
  const pdfjsLib = await loadPdfJs();

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

    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    docxXmlContent += `
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Page ${i}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${escapeXml(pageText || `[Page ${i} contains non-selectable visual image streams]`)}</w:t></w:r></w:p>`;
  }

  docxXmlContent += `
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  onProgress?.('Packaging OpenXML Word (.docx) container...');
  const zippedBytes = zipSync({
    '[Content_Types].xml': strToU8(contentTypesXml),
    '_rels/.rels': strToU8(rootRelsXml),
    'word/_rels/document.xml.rels': strToU8(documentRelsXml),
    'word/document.xml': strToU8(docxXmlContent),
  });

  return new Blob([zippedBytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
