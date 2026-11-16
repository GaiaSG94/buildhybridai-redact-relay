export type RedactionType =
  | 'email'
  | 'phone'
  | 'secret'
  | 'iban'
  | 'ssn'
  | 'address'
  | 'name'
  | 'other';

export const REDACTION_TYPES: readonly RedactionType[] = [
  'email',
  'phone',
  'secret',
  'iban',
  'ssn',
  'address',
  'name',
  'other',
];

/** A sensitive span located in the source text. */
export interface RedactionSpan {
  start: number;
  end: number;
  type: RedactionType;
  confidence: number;
  value: string;
}

export interface RedactionOptions {
  /** Minimum confidence (0-1) a span must reach to be redacted. */
  sensitivity: number;
  /** Redaction types that are always redacted regardless of confidence. */
  alwaysRedact: RedactionType[];
}

export const DEFAULT_REDACTION_OPTIONS: RedactionOptions = {
  sensitivity: 0.6,
  alwaysRedact: ['secret', 'iban', 'ssn'],
};

/** What actually happened during a redaction run. */
export interface RedactionRun {
  sanitized: string;
  spans: RedactionSpan[];
  source: 'on_device' | 'in_cloud';
  latencyMs: number;
}

export interface MeetingSummary {
  overview: string;
  decisions: string[];
  actions: string[];
  risks: string[];
}
