import type { MeetingSummary } from './types';

/** Prompt for the in-cloud model: summarize sanitized text only. */
export function buildSummaryPrompt(sanitized: string): string {
  return [
    'Summarize the meeting transcript below.',
    'The transcript has already been sanitized: never mention or guess any',
    'redacted information.',
    'Answer with exactly four sections, one line per item, no markdown:',
    'OVERVIEW: one sentence.',
    'DECISION: one line per decision taken.',
    'ACTION: one line per action item, with owner and due date when present.',
    'RISK: one line per risk or open question.',
    '',
    'TRANSCRIPT:',
    sanitized,
  ].join('\n');
}

/** Parse the four-section summary produced by the model. */
export function parseSummary(raw: string): MeetingSummary {
  const summary: MeetingSummary = {
    overview: '',
    decisions: [],
    actions: [],
    risks: [],
  };
  for (const line of raw.split('\n')) {
    const clean = line.trim().replace(/^[-*]\s*/, '');
    if (!clean) {
      continue;
    }
    const upper = clean.toUpperCase();
    if (upper.startsWith('OVERVIEW:')) {
      summary.overview = valueAfter(clean, 'OVERVIEW:');
    } else if (upper.startsWith('DECISION:')) {
      pushIfValue(summary.decisions, clean, 'DECISION:');
    } else if (upper.startsWith('ACTION:')) {
      pushIfValue(summary.actions, clean, 'ACTION:');
    } else if (upper.startsWith('RISK:')) {
      pushIfValue(summary.risks, clean, 'RISK:');
    }
  }
  return summary;
}

function valueAfter(line: string, marker: string): string {
  return line.slice(line.toUpperCase().indexOf(marker) + marker.length).trim();
}

function pushIfValue(list: string[], line: string, marker: string): void {
  const value = valueAfter(line, marker);
  if (value) {
    list.push(value);
  }
}
