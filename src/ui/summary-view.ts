import type { MeetingSummary } from '../core/types';

/** Render the four summary sections as a definition-style list. */
export function renderSummary(summary: MeetingSummary): HTMLElement {
  const root = document.createElement('div');
  root.className = 'summary';
  addSection(root, 'Overview', [summary.overview], 'overview');
  addSection(root, 'Decisions', summary.decisions, 'decisions');
  addSection(root, 'Actions', summary.actions, 'actions');
  addSection(root, 'Risks', summary.risks, 'risks');
  return root;
}

function addSection(root: HTMLElement, title: string, items: string[], kind: string): void {
  const heading = document.createElement('h3');
  heading.textContent = title;
  root.appendChild(heading);
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'none';
    root.appendChild(empty);
    return;
  }
  const list = document.createElement('ul');
  list.className = kind;
  for (const item of items) {
    const entry = document.createElement('li');
    entry.textContent = item;
    list.appendChild(entry);
  }
  root.appendChild(list);
}
