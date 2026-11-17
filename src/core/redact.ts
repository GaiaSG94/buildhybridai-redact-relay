import type { RedactionOptions, RedactionSpan, RedactionType } from './types';

export const SPAN_PREFIX = 'SPAN|';

/**
 * Prompt asking the model to list sensitive fragments.
 *
 * The model returns one line per fragment: `SPAN|<exact text>|<type>`.
 * Matching by exact substring is far more reliable on a small on-device
 * model than asking for character offsets.
 */
export function buildRedactionPrompt(text: string, options: RedactionOptions): string {
  const types = [...options.alwaysRedact, 'email', 'phone', 'address', 'name'].join(', ');
  return [
    'You are a privacy redaction assistant.',
    'List every fragment of the TEXT below that contains sensitive personal',
    `or secret information: ${types}.`,
    'Rules:',
    '- One line per fragment, exactly: SPAN|<exact fragment copied from TEXT>|<type>',
    '- The fragment must be copied character for character from TEXT.',
    '- Ignore greetings, job titles and company names.',
    '- No commentary, no markdown, nothing else.',
    '',
    'TEXT:',
    text,
  ].join('\n');
}

/** Parse one `SPAN|value|type` line. Returns null when the line is invalid. */
export function parseSpanLine(line: string): { value: string; type: RedactionType } | null {
  const parts = line.split('|');
  if (parts.length !== 3 || parts[0].trim() !== 'SPAN') {
    return null;
  }
  const value = parts[1];
  const type = parts[2].trim().toLowerCase() as RedactionType;
  if (!value || value.length < 2) {
    return null;
  }
  return { value, type };
}

/** Locate a fragment in the text (exact match first, then case-insensitive). */
export function locateSpan(text: string, value: string): { start: number; end: number } | null {
  const start = text.indexOf(value);
  if (start >= 0) {
    return { start, end: start + value.length };
  }
  const lower = text.toLowerCase();
  const lowerStart = lower.indexOf(value.toLowerCase());
  if (lowerStart >= 0) {
    return { start: lowerStart, end: lowerStart + value.length };
  }
  return null;
}

/** Parse raw model output into spans located in the source text. */
export function parseSpans(raw: string, text: string): RedactionSpan[] {
  const spans: RedactionSpan[] = [];
  for (const line of raw.split('\n')) {
    const parsed = parseSpanLine(line.trim());
    if (!parsed) {
      continue;
    }
    const location = locateSpan(text, parsed.value);
    if (!location) {
      continue;
    }
    spans.push({ ...location, type: parsed.type, confidence: 1, value: parsed.value });
  }
  return spans;
}

/** Sort spans and merge overlaps: the wider span and highest priority win. */
export function mergeSpans(spans: RedactionSpan[]): RedactionSpan[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: RedactionSpan[] = [];
  for (const span of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && span.start < previous.end) {
      previous.end = Math.max(previous.end, span.end);
      if (span.value.length > previous.value.length) {
        previous.value = span.value;
        previous.type = span.type;
      }
      continue;
    }
    merged.push({ ...span });
  }
  return merged;
}

const TOKEN = '[REDACTED]';

/** Replace every span with a placeholder token. */
export function sanitize(text: string, spans: RedactionSpan[]): string {
  const merged = mergeSpans(spans);
  let out = '';
  let cursor = 0;
  for (const span of merged) {
    if (span.start < cursor) {
      continue;
    }
    out += text.slice(cursor, span.start) + TOKEN;
    cursor = span.end;
  }
  return out + text.slice(cursor);
}

/** Report how much of the text was masked, for the UI counter. */
export function maskRatio(text: string, spans: RedactionSpan[]): number {
  const merged = mergeSpans(spans);
  const masked = merged.reduce((sum, span) => sum + (span.end - span.start), 0);
  if (!text.length) {
    return 0;
  }
  return masked / text.length;
}
