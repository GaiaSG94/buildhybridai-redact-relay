import { describe, expect, it } from 'vitest';
import {
  firstLine,
  formatCap,
  formatCount,
  formatLatency,
  formatStamp,
  formatStampFull,
} from '../src/ui/hud';

describe('formatCount', () => {
  it('zero-pads to two digits', () => {
    expect(formatCount(0)).toBe('00');
    expect(formatCount(6)).toBe('06');
    expect(formatCount(42)).toBe('42');
  });
});

describe('formatCap', () => {
  it('counts lines and chars like the boards', () => {
    const cap = formatCap('hello\nworld', 'held');
    expect(cap).toBe('Transcript · 2 lines · 11 chars · view: held');
  });
  it('switches the view label', () => {
    expect(formatCap('abc', 'original')).toContain('view: original');
  });
});

describe('stamps', () => {
  const t = new Date(2026, 10, 18, 10, 42).getTime();
  it('compact stamp for the history chip', () => {
    expect(formatStamp(t)).toBe('18.11 · 10:42');
  });
  it('full stamp for the drawer', () => {
    expect(formatStampFull(t)).toBe('18.11.2026 · 10:42');
  });
});

describe('formatLatency', () => {
  it('ms under one second, s above', () => {
    expect(formatLatency(412)).toBe('412 ms');
    expect(formatLatency(1840)).toBe('1.84 s');
  });
});

describe('firstLine', () => {
  it('truncates long lines with an ellipsis', () => {
    const line = firstLine('x'.repeat(80));
    expect(line.length).toBe(61);
    expect(line.endsWith('…')).toBe(true);
  });
});
