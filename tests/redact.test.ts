import { describe, expect, it } from 'vitest';
import {
  buildRedactionPrompt,
  locateSpan,
  maskRatio,
  mergeSpans,
  parseSpanLine,
  parseSpans,
  sanitize,
} from '../src/core/redact';
import { DEFAULT_REDACTION_OPTIONS } from '../src/core/types';

const TEXT = 'Alice Martin (alice.martin@acme-corp.com) calls +33 6 12 34 56 78.';

describe('parseSpanLine', () => {
  it('reads a well formed line', () => {
    expect(parseSpanLine('SPAN|alice.martin@acme-corp.com|email')).toEqual({
      value: 'alice.martin@acme-corp.com',
      type: 'email',
    });
  });

  it('rejects lines without the SPAN marker', () => {
    expect(parseSpanLine('alice@example.com')).toBeNull();
    expect(parseSpanLine('SPAN|only-one-field')).toBeNull();
  });

  it('rejects empty fragments', () => {
    expect(parseSpanLine('SPAN||email')).toBeNull();
  });
});

describe('locateSpan', () => {
  it('finds an exact fragment', () => {
    expect(locateSpan(TEXT, 'alice.martin@acme-corp.com')?.start).toBe(14);
  });

  it('falls back to a case insensitive match', () => {
    expect(locateSpan(TEXT, 'ALICE.MARTIN@ACME-CORP.COM')).not.toBeNull();
  });

  it('returns null for an unknown fragment', () => {
    expect(locateSpan(TEXT, 'nobody@example.com')).toBeNull();
  });
});

describe('parseSpans', () => {
  it('keeps only fragments present in the source text', () => {
    const raw = ['SPAN|alice.martin@acme-corp.com|email', 'SPAN|ghost@example.com|email'].join('\n');
    const spans = parseSpans(raw, TEXT);
    expect(spans).toHaveLength(1);
    expect(spans[0].value).toBe('alice.martin@acme-corp.com');
  });

  it('ignores prose around the spans', () => {
    const raw = 'Here you go:\nSPAN|+33 6 12 34 56 78|phone\nThat is all.';
    expect(parseSpans(raw, TEXT)).toHaveLength(1);
  });
});

describe('mergeSpans', () => {
  it('merges overlapping spans and keeps the widest value', () => {
    const spans = parseSpans(
      ['SPAN|Alice Martin|name', 'SPAN|Alice|secret'].join('\n'),
      TEXT,
    );
    const merged = mergeSpans(spans);
    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe('Alice Martin');
  });

  it('keeps disjoint spans apart', () => {
    const spans = parseSpans(
      ['SPAN|Alice Martin|name', 'SPAN|+33 6 12 34 56 78|phone'].join('\n'),
      TEXT,
    );
    expect(mergeSpans(spans)).toHaveLength(2);
  });
});

describe('sanitize', () => {
  it('replaces every fragment with a token', () => {
    const spans = parseSpans(
      ['SPAN|alice.martin@acme-corp.com|email', 'SPAN|+33 6 12 34 56 78|phone'].join('\n'),
      TEXT,
    );
    const result = sanitize(TEXT, spans);
    expect(result).not.toContain('alice.martin@acme-corp.com');
    expect(result).not.toContain('+33 6 12 34 56 78');
    expect(result.match(/\[REDACTED\]/g)).toHaveLength(2);
  });

  it('keeps the rest of the text untouched', () => {
    const spans = parseSpans('SPAN|+33 6 12 34 56 78|phone', TEXT);
    expect(sanitize(TEXT, spans)).toContain('Alice Martin');
  });

  it('returns the text unchanged when there is no span', () => {
    expect(sanitize(TEXT, [])).toBe(TEXT);
  });
});

describe('maskRatio', () => {
  it('measures the masked share of the text', () => {
    const spans = parseSpans('SPAN|Alice Martin|name', TEXT);
    expect(maskRatio(TEXT, spans)).toBeCloseTo(12 / TEXT.length, 5);
  });

  it('returns zero for an empty text', () => {
    expect(maskRatio('', [])).toBe(0);
  });
});

describe('buildRedactionPrompt', () => {
  it('asks for the strict span format and includes the text', () => {
    const prompt = buildRedactionPrompt(TEXT, DEFAULT_REDACTION_OPTIONS);
    expect(prompt).toContain('SPAN|');
    expect(prompt).toContain(TEXT);
  });
});
