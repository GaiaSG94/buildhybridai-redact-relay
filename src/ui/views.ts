import { renderSummaryRows } from './summary-rows';
import {
  applyMode,
  firstLine,
  formatCap,
  formatCount,
  formatStamp,
  formatStampFull,
  type HistoryEntry,
  type WallMode,
} from './hud';

export interface AppElements {
  screen: HTMLElement;
  transcript: HTMLTextAreaElement;
  sensitivity: HTMLInputElement;
  sensValue: HTMLElement;
  redactButton: HTMLButtonElement;
  summarizeButton: HTMLButtonElement;
  saveButton: HTMLButtonElement;
  statusOnline: HTMLElement;
  statusText: HTMLElement;
  summaryRows: HTMLElement;
  cloudLatency: HTMLElement;
  histRows: HTMLElement;
  drawerEntries: HTMLElement;
  countValue: HTMLElement;
  capText: HTMLElement;
  cap: HTMLElement;
  capEdit: HTMLElement;
  tabHistory: HTMLElement;
  tabTranscript: HTMLElement;
  drawerClose: HTMLButtonElement;
  editor: HTMLElement;
  editorArea: HTMLTextAreaElement;
  editorApply: HTMLButtonElement;
  editorCancel: HTMLButtonElement;
  notice: HTMLElement;
  wall: HTMLCanvasElement;
}

export function queryAppElements(root: HTMLElement): AppElements {
  const el = (id: string): HTMLElement => {
    const found = root.id === id ? root : root.querySelector<HTMLElement>(`#${id}`);
    if (!found) {
      throw new Error(`missing element: #${id}`);
    }
    return found;
  };
  return {
    screen: el('screen'),
    transcript: el('transcript') as HTMLTextAreaElement,
    sensitivity: el('sensitivity') as HTMLInputElement,
    sensValue: el('sensitivity-value'),
    redactButton: el('redact') as HTMLButtonElement,
    summarizeButton: el('summarize') as HTMLButtonElement,
    saveButton: el('save') as HTMLButtonElement,
    statusOnline: el('status-online'),
    statusText: el('status-online-text'),
    summaryRows: el('summary-rows'),
    cloudLatency: el('cloud-latency'),
    histRows: el('hist-rows'),
    drawerEntries: el('drawer-entries'),
    countValue: el('count-value'),
    capText: el('cap-text'),
    cap: el('cap'),
    capEdit: el('cap-edit'),
    tabHistory: el('tab-history-main'),
    tabTranscript: el('tab-transcript-side'),
    drawerClose: el('drawer-close') as HTMLButtonElement,
    editor: el('editor'),
    editorArea: el('editor-area') as HTMLTextAreaElement,
    editorApply: el('editor-apply') as HTMLButtonElement,
    editorCancel: el('editor-cancel') as HTMLButtonElement,
    notice: el('notice'),
    wall: el('wall-canvas') as HTMLCanvasElement,
  };
}

export const setMode = (elements: AppElements, mode: WallMode): void => applyMode(elements.screen, mode);

export function setCount(elements: AppElements, held: number): void {
  elements.countValue.textContent = formatCount(held);
}

export function setCap(elements: AppElements, view: 'held' | 'original'): void {
  elements.capText.textContent = formatCap(elements.transcript.value, view);
}

export function setStatus(elements: AppElements, text: string, warn: boolean): void {
  elements.statusText.textContent = text;
  elements.statusOnline.classList.toggle('warn', warn);
}

export function setCloudLatency(elements: AppElements, text: string): void {
  elements.cloudLatency.textContent = text;
}

export function setSummary(elements: AppElements, summary: Parameters<typeof renderSummaryRows>[0]): void {
  elements.summaryRows.replaceChildren(renderSummaryRows(summary));
}

export function setNotice(elements: AppElements, message: string | null): void {
  elements.notice.textContent = message ?? '';
  elements.notice.hidden = !message;
}

export function setSensitivity(elements: AppElements, value: number): void {
  elements.sensValue.textContent = value.toFixed(2);
}

export function renderHistoryChip(elements: AppElements, entries: HistoryEntry[]): void {
  const frag = document.createDocumentFragment();
  for (const entry of entries.slice(0, 3)) {
    const row = document.createElement('div');
    const when = document.createElement('span');
    when.textContent = formatStamp(entry.createdAt);
    const held = document.createElement('span');
    held.textContent = `${entry.held} held`;
    row.append(when, held);
    frag.appendChild(row);
  }
  elements.histRows.replaceChildren(frag);
}

export function renderDrawer(
  elements: AppElements,
  entries: HistoryEntry[],
  openIndex: number,
  onOpen: (index: number) => void,
): void {
  const frag = document.createDocumentFragment();
  entries.forEach((entry, index) => {
    const card = document.createElement('article');
    card.className = index === openIndex ? 'entry open' : 'entry';
    const head = document.createElement('div');
    head.className = 'eh';
    const stamp = document.createElement('span');
    stamp.textContent = formatStampFull(entry.createdAt);
    const held = document.createElement('b');
    held.textContent = `${entry.held} held`;
    head.append(stamp, held);
    head.addEventListener('click', () => onOpen(index));
    card.appendChild(head);
    const first = document.createElement('p');
    first.className = 'first';
    first.textContent = `${firstLine(entry.sanitized)}…`;
    card.appendChild(first);
    if (index === openIndex && entry.summary) {
      card.appendChild(renderSummaryRows(entry.summary));
    }
    frag.appendChild(card);
  });
  elements.drawerEntries.replaceChildren(frag);
}

export const openEditor = (elements: AppElements, open: boolean): void => {
  elements.editor.hidden = !open;
  if (open) {
    elements.editorArea.value = elements.transcript.value;
  }
};
