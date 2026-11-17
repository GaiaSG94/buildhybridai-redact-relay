import { DEFAULT_REDACTION_OPTIONS, type RedactionOptions } from '../core/types';
import { renderHighlighted, renderSanitized } from './highlight';
import { renderSummary } from './summary-view';
import type { RedactionRun, MeetingSummary } from '../core/types';

export interface AppElements {
  transcript: HTMLTextAreaElement;
  sensitivity: HTMLInputElement;
  redactButton: HTMLButtonElement;
  summarizeButton: HTMLButtonElement;
  saveButton: HTMLButtonElement;
  badge: HTMLElement;
  stats: HTMLElement;
  notice: HTMLElement;
  preview: HTMLElement;
  summaryPanel: HTMLElement;
  history: HTMLElement;
}

export function queryAppElements(root: HTMLElement): AppElements {
  return {
    transcript: requireInput(root, '#transcript'),
    sensitivity: requireInput(root, '#sensitivity'),
    redactButton: requireInput(root, '#redact'),
    summarizeButton: requireInput(root, '#summarize'),
    saveButton: requireInput(root, '#save'),
    badge: requireInput(root, '#badge'),
    stats: requireInput(root, '#stats'),
    notice: requireInput(root, '#notice'),
    preview: requireInput(root, '#preview'),
    summaryPanel: requireInput(root, '#summary-panel'),
    history: requireInput(root, '#history'),
  };
}

function requireInput<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) {
    throw new Error(`missing element: ${selector}`);
  }
  return found;
}

export function redactionOptions(elements: AppElements): RedactionOptions {
  const sensitivity = Number(elements.sensitivity.value);
  if (Number.isNaN(sensitivity) || sensitivity < 0 || sensitivity > 1) {
    return DEFAULT_REDACTION_OPTIONS;
  }
  return { ...DEFAULT_REDACTION_OPTIONS, sensitivity };
}

export function showRun(elements: AppElements, run: RedactionRun, text: string): void {
  setBadge(elements.badge, run.source);
  elements.stats.textContent =
    `${run.spans.length} fragment(s) blocked - ${run.latencyMs} ms - ` +
    `${run.source === 'on_device' ? 'nothing left this device' : 'cloud fallback used'}`;
  elements.preview.replaceChildren(renderHighlighted(text, run.spans));
}

export function showSanitized(elements: AppElements, run: RedactionRun): void {
  elements.preview.replaceChildren(renderSanitized(run.sanitized));
}

export function setBadge(badge: HTMLElement, source: RedactionRun['source']): void {
  badge.dataset.source = source;
  badge.textContent = source === 'on_device' ? 'LOCAL' : 'CLOUD';
}

export function showSummary(elements: AppElements, summary: MeetingSummary): void {
  elements.summaryPanel.replaceChildren(renderSummary(summary));
}

export function showHistory(elements: AppElements, entries: string[]): void {
  const list = document.createElement('ul');
  list.className = 'history-list';
  for (const entry of entries) {
    const item = document.createElement('li');
    item.textContent = entry;
    list.appendChild(item);
  }
  elements.history.replaceChildren(list);
}

export function setNotice(elements: AppElements, message: string | null): void {
  elements.notice.textContent = message ?? '';
  elements.notice.hidden = !message;
}
