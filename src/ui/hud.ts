import type { MeetingSummary } from '../core/types';

export type WallMode = 'app' | 'unconfigured' | 'history' | 'offline';

export const MODES: readonly WallMode[] = ['app', 'unconfigured', 'history', 'offline'];

/** Apply a mode: toggle [data-show] chips and disable [data-dis] controls. */
export function applyMode(root: HTMLElement, mode: WallMode): void {
  root.dataset.mode = mode;
  root.querySelectorAll<HTMLElement>('[data-show]').forEach((el) => {
    const show = (el.dataset.show ?? '').split(/\s+/).filter(Boolean);
    el.hidden = !show.includes(mode);
  });
  root.querySelectorAll<HTMLButtonElement>('[data-dis]').forEach((el) => {
    const dis = (el.dataset.dis ?? '').split(/\s+/).filter(Boolean);
    el.disabled = dis.includes(mode);
  });
}

/** Counter engraving: zero-padded, as on the boards. */
export const formatCount = (n: number): string => String(Math.max(0, Math.floor(n))).padStart(2, '0');

/** Dark caption plate: line/char census, as on the boards. */
export const formatCap = (text: string, view: 'held' | 'original'): string => {
  const lines = text ? text.split('\n').length : 0;
  return `Transcript · ${lines} ${lines === 1 ? 'line' : 'lines'} · ${text.length} chars · view: ${view}`;
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** Compact stamp for the history chip: dd.mm · hh:mm. */
export const formatStamp = (createdAt: number): string => {
  const d = new Date(createdAt);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Full stamp for the drawer: dd.mm.yyyy · hh:mm. */
export const formatStampFull = (createdAt: number): string => {
  const d = new Date(createdAt);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** First line of an entry, as engraved on the drawer cards. */
export const firstLine = (sanitized: string, max = 60): string => {
  const line = sanitized.split('\n')[0] ?? '';
  return line.length > max ? `${line.slice(0, max)}…` : line;
};

/** Run latency as engraved next to the status square: ms under 1 s, else s. */
export const formatLatency = (ms: number): string => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`);

export interface HistoryEntry {
  sanitized: string;
  createdAt: number;
  held: number;
  summary?: MeetingSummary;
}
