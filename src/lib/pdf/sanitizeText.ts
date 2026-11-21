/**
 * Sanitizes text strings for safe encoding with pdf-lib StandardFonts (WinAnsi encoding).
 * Prevents runtime "WinAnsi cannot encode" crashes on CRLF (\r), tabs (\t),
 * smart quotes, dashes, emojis, or non-Latin1 Unicode characters.
 */
export function sanitizeWinAnsi(text: string, preserveNewlines = false): string {
  if (!text) return '';

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/\u00A0/g, ' ')
    .replace(/\u00AD/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '*');

  let out = '';
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code === 0x0a) {
      out += preserveNewlines ? '\n' : ' ';
    } else if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa1 && code <= 0xff)) {
      out += normalized[i];
    }
  }
  return out;
}

/**
 * Decodes common XML and HTML character entities (&amp;, &lt;, &gt;, &quot;, &apos;, &nbsp;, numeric).
 */
export function decodeXmlEntities(input: string): string {
  if (!input) return '';
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&amp;/gi, '&');
}
