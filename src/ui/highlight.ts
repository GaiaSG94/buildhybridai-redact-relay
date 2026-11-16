import type { RedactionSpan } from '../core/types';

/** Render the text with redacted spans highlighted. */
export function renderHighlighted(text: string, spans: RedactionSpan[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'highlight';
  let cursor = 0;
  for (const span of [...spans].sort((a, b) => a.start - b.start)) {
    if (span.start < cursor) {
      continue;
    }
    appendPlain(container, text.slice(cursor, span.start));
    appendMasked(container, span);
    cursor = span.end;
  }
  appendPlain(container, text.slice(cursor));
  return container;
}

function appendPlain(container: HTMLElement, chunk: string): void {
  if (chunk) {
    container.appendChild(document.createTextNode(chunk));
  }
}

function appendMasked(container: HTMLElement, span: RedactionSpan): void {
  const mark = document.createElement('mark');
  mark.className = 'mask';
  mark.textContent = span.value;
  mark.dataset.type = span.type;
  container.appendChild(mark);
}

/** Render the sanitized preview with placeholder tokens. */
export function renderSanitized(sanitized: string): HTMLElement {
  const pre = document.createElement('pre');
  pre.className = 'sanitized';
  pre.textContent = sanitized;
  return pre;
}
