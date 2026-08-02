import { describe, it, expect } from 'vitest';
import { renderPdfToImages } from '@/lib/pdf/pdfToImages';

describe('PDF to Images Engine', () => {
  it('module exposes renderPdfToImages function', () => {
    expect(typeof renderPdfToImages).toBe('function');
  });
});
