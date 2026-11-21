import { describe, it, expect } from 'vitest';
import { renderPdfToImages } from '@/lib/pdf/pdfToImages';
import { LOCAL_PDF_WORKER_SRC, loadPdfJs } from '@/lib/pdf/pdfjsWorker';
import fs from 'fs';
import path from 'path';

describe('PDF to Images & Local PDF.js Worker Configuration', () => {
  it('module exposes renderPdfToImages function', () => {
    expect(typeof renderPdfToImages).toBe('function');
  });

  it('ships local public/pdf.worker.min.js matching LOCAL_PDF_WORKER_SRC', async () => {
    expect(LOCAL_PDF_WORKER_SRC).toBe('/pdf.worker.min.js');
    const workerPath = path.resolve(process.cwd(), 'public', 'pdf.worker.min.js');
    expect(fs.existsSync(workerPath)).toBe(true);
    const stat = fs.statSync(workerPath);
    expect(stat.size).toBeGreaterThan(500_000);

    const pdfjs = await loadPdfJs();
    expect(pdfjs).toBeDefined();
    expect(typeof pdfjs.getDocument).toBe('function');
  });
});
