import { describe, expect, it } from 'vitest';
import { buildSummaryPrompt, parseSummary } from '../src/core/summary';

describe('parseSummary', () => {
  it('reads the four sections', () => {
    const raw = [
      'OVERVIEW: The team agreed on the beta date.',
      'DECISION: Ship the beta on Friday.',
      'DECISION: Freeze the API on Thursday.',
      'ACTION: Sam owns the migration.',
      'RISK: The migration has no rollback plan.',
    ].join('\n');
    const summary = parseSummary(raw);
    expect(summary.overview).toBe('The team agreed on the beta date.');
    expect(summary.decisions).toHaveLength(2);
    expect(summary.actions).toEqual(['Sam owns the migration.']);
    expect(summary.risks).toHaveLength(1);
  });

  it('ignores unknown lines', () => {
    const summary = parseSummary('Thanks for joining!\nDECISION: Keep it simple.');
    expect(summary.decisions).toEqual(['Keep it simple.']);
    expect(summary.overview).toBe('');
  });

  it('accepts bulleted items', () => {
    const summary = parseSummary('- ACTION: Review the logs.');
    expect(summary.actions).toEqual(['Review the logs.']);
  });
});

describe('buildSummaryPrompt', () => {
  it('mentions the four sections and the transcript', () => {
    const prompt = buildSummaryPrompt('sanitized text');
    expect(prompt).toContain('OVERVIEW:');
    expect(prompt).toContain('DECISION:');
    expect(prompt).toContain('ACTION:');
    expect(prompt).toContain('RISK:');
    expect(prompt).toContain('sanitized text');
  });
});
