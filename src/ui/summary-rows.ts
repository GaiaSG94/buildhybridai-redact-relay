import type { MeetingSummary } from '../core/types';

const row = (label: string, text: string, ov: boolean, ghost: boolean): HTMLElement => {
  const div = document.createElement('div');
  div.className = ov && ghost ? 'row ov ghost' : ov ? 'row ov' : ghost ? 'row ghost' : 'row';
  const span = document.createElement('span');
  span.textContent = label;
  const p = document.createElement('p');
  p.textContent = text;
  div.append(span, p);
  return div;
};

const flat = (items: string[]): string => items.join(' · ');

/** The four cloud rows of the summary plate (ghost when nothing ran yet). */
export function renderSummaryRows(summary: MeetingSummary | null): DocumentFragment {
  const frag = document.createDocumentFragment();
  if (!summary) {
    frag.append(
      row('Overview', '—', true, true),
      row('Decisions', '—', false, true),
      row('Actions', '—', false, true),
      row('Risks', '—', false, true),
    );
    return frag;
  }
  frag.append(
    row('Overview', summary.overview, true, false),
    row('Decisions', flat(summary.decisions), false, false),
    row('Actions', flat(summary.actions), false, false),
    row('Risks', flat(summary.risks), false, false),
  );
  return frag;
}
