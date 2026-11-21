import { describe, expect, it } from 'vitest';
import { heldWidthOf, packRows, wallWords, widthOf } from '../src/ui/wall/words';
import { parseSpans } from '../src/core/redact';

const SAMPLE = [
  'Alice Martin (alice.martin@acme-corp.com) opens the Acme review.',
  'Budget owner is +33 6 12 34 56 78, card 4111 1111 1111 1111.',
].join('\n');

const RAW = [
  'SPAN|Alice Martin|name',
  'SPAN|alice.martin@acme-corp.com|email',
  'SPAN|+33 6 12 34 56 78|phone',
].join('\n');

describe('wallWords', () => {
  it('turns held fragments into single tagged tokens', () => {
    const words = wallWords(SAMPLE, parseSpans(RAW, SAMPLE));
    const alice = words.find((w) => w.tag === 'name');
    expect(alice?.t).toBe('Alice Martin');
    const email = words.find((w) => w.tag === 'email');
    // Closing paren glues to the previous block, as on the boards.
    expect(email?.t).toBe('alice.martin@acme-corp.com)');
    expect(words.some((w) => w.t === 'alice.martin@acme-corp.com' && !w.tag)).toBe(false);
  });

  it('never leaves a standalone paren word', () => {
    const words = wallWords(SAMPLE, parseSpans(RAW, SAMPLE));
    expect(words.some((w) => w.t === '(' || w.t === ')')).toBe(false);
    expect(words.some((w) => w.t === 'opens')).toBe(true);
  });

  it('returns plain words when nothing is held', () => {
    const words = wallWords(SAMPLE, []);
    expect(words.every((w) => w.tag === null)).toBe(true);
    expect(words[0].t).toBe('Alice');
  });
});

describe('packRows', () => {
  it('packs into rows within the row limit', () => {
    const words = wallWords(SAMPLE, []);
    const rows = packRows(words, false);
    for (const row of rows) {
      const width = row.reduce((s, b) => s + b.bw + 0.07, -0.07);
      expect(width).toBeLessThanOrEqual(21.001);
    }
  });

  it('sizes held blocks by type, never by value', () => {
    const words = wallWords(SAMPLE, parseSpans(RAW, SAMPLE));
    const rows = packRows(words, true);
    const held = rows.flat().filter((b) => b.tag);
    expect(held.length).toBe(3);
    for (const block of held) {
      expect(block.bw).toBeGreaterThanOrEqual(2.6);
      expect(block.bw).toBeLessThanOrEqual(heldWidthOf(block.tag as never) + 0.001);
    }
  });
});

describe('widths', () => {
  it('has a floor and scales with text length', () => {
    expect(widthOf('a')).toBe(1.5);
    expect(widthOf('abcdefghij')).toBeGreaterThan(widthOf('abc'));
  });
});
