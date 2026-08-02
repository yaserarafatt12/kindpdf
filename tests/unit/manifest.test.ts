import { describe, it, expect } from 'vitest';
import { tools, activeToolCount } from '@/lib/tools/manifest';

describe('Kindpdf Single Source of Truth Tool Manifest', () => {
  it('should have exactly 23 active tools', () => {
    expect(tools.length).toBe(23);
    expect(activeToolCount).toBe(23);
  });

  it('should have unique tool IDs and routes', () => {
    const ids = tools.map((t) => t.id);
    const routes = tools.map((t) => t.route);

    expect(new Set(ids).size).toBe(tools.length);
    expect(new Set(routes).size).toBe(tools.length);
  });

  it('should have valid titles, descriptions, categories, and statuses', () => {
    tools.forEach((t) => {
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(['organize', 'convert-to', 'convert-from', 'edit', 'security', 'utilities']).toContain(t.category);
      expect(['stable', 'beta', 'experimental']).toContain(t.status);
      expect(t.processingMode).toBe('local');
    });
  });
});
