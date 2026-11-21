import { mergeSpans } from '../../core/redact';
import type { RedactionSpan, RedactionType } from '../../core/types';

/** One block of the wall: a word, or a held fragment tagged by type. */
export interface WallWord {
  t: string;
  tag: RedactionType | null;
  pre?: string;
}

export const ROW_LIMIT = 21;
export const ROW_GAP = 0.07;

/** Width (world units) of the block carrying `text`. */
export const widthOf = (text: string): number => Math.max(1.5, 0.37 * text.length + 0.7);

/** Width of a held block: sized by its engraved type, never by its value. */
export const heldWidthOf = (tag: RedactionType): number => Math.max(2.6, widthOf(tag.toUpperCase()) + 0.6);

/** Split plain text into word blocks, gluing stray punctuation like the boards. */
const splitPlain = (chunk: string, out: WallWord[]): void => {
  chunk.split(/\s+/).forEach((w, i) => {
    if (!w) {
      return;
    }
    if (i === 0 && out.length && !/^[A-Za-z0-9]/.test(w) && w.length <= 2) {
      out[out.length - 1].t += w;
      return;
    }
    if (/^[(]$/.test(w)) {
      out.push({ t: w, tag: null, pre: '(' });
      return;
    }
    out.push({ t: w, tag: null });
  });
};

/** Words in reading order: held fragments become single tagged tokens. */
export function wallWords(text: string, spans: RedactionSpan[]): WallWord[] {
  const merged = mergeSpans(spans);
  const out: WallWord[] = [];
  let cursor = 0;
  for (const span of merged) {
    splitPlain(text.slice(cursor, span.start), out);
    out.push({ t: span.value, tag: span.type });
    cursor = span.end;
  }
  splitPlain(text.slice(cursor), out);
  const res: WallWord[] = [];
  for (let i = 0; i < out.length; i++) {
    if (out[i].pre && out[i + 1]) {
      const next = out[i + 1];
      res.push({ ...next, t: next.tag ? next.t : '(' + next.t, pre: '(' });
      i++;
    } else {
      res.push(out[i]);
    }
  }
  return res;
}

export interface WallBlock extends WallWord {
  bw: number;
}

/** Pack words into rows of bounded width (brick bond handled by the scene). */
export function packRows(words: WallWord[], held: boolean): WallBlock[][] {
  const rows: WallBlock[][] = [];
  let row: WallBlock[] = [];
  let w = 0;
  for (const it of words) {
    const bw = it.tag && held ? heldWidthOf(it.tag) : widthOf(it.t);
    if (w + bw > ROW_LIMIT && row.length) {
      rows.push(row);
      row = [];
      w = 0;
    }
    row.push({ ...it, bw });
    w += bw + ROW_GAP;
  }
  if (row.length) {
    rows.push(row);
  }
  return rows;
}
