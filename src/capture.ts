import { parseSpans, sanitize } from './core/redact';
import type { MeetingSummary } from './core/types';
import { setMode, setCount, setCap, setStatus, setCloudLatency, setSummary, renderHistoryChip, renderDrawer, type AppElements } from './ui/views';
import { formatLatency, type HistoryEntry } from './ui/hud';
import type { WallScene } from './ui/wall/scene';

const SPAN_LINES = [
  'SPAN|Alice Martin|name',
  'SPAN|alice.martin@acme-corp.com|email',
  'SPAN|+33 6 12 34 56 78|phone',
  'SPAN|4111 1111 1111 1111|other',
  'SPAN|key_live_9f2c8ab31d|secret',
  'SPAN|12 rue de la Paix, Paris|address',
].join('\n');

const SUMMARY: MeetingSummary = {
  overview: 'Budget ownership and access details were discussed; the beta plan was agreed.',
  decisions: ['Ship the beta on Friday.'],
  actions: ['Sam owns the migration.'],
  risks: ['A live API key was spoken aloud. Rotate it before Friday.'],
};

const HISTORY: HistoryEntry[] = [
  {
    sanitized: '[REDACTED] ([REDACTED]) opens the Acme review.\nBudget owner is [REDACTED], card [REDACTED].\nNothing else was held.',
    createdAt: new Date(2026, 10, 18, 10, 42).getTime(),
    held: 6,
    summary: SUMMARY,
  },
  {
    sanitized: '[REDACTED] joins the platform team on Monday.',
    createdAt: new Date(2026, 10, 17, 16, 5).getTime(),
    held: 4,
  },
  {
    sanitized: 'Quarterly numbers for [REDACTED] are due Friday.',
    createdAt: new Date(2026, 10, 14, 9, 30).getTime(),
    held: 3,
  },
];

interface CaptureState {
  current: { sanitized: string; held: number } | null;
  summary: MeetingSummary | null;
  view: 'held' | 'original';
  history: HistoryEntry[];
  openIndex: number;
}

export type CaptureMode = 'app' | 'unconfigured' | 'history' | 'offline';

const captureMode = (): CaptureMode | null => {
  const param = new URLSearchParams(window.location.search).get('capture');
  return param === 'app' || param === 'unconfigured' || param === 'history' || param === 'offline' ? param : null;
};

const loadRun = (elements: AppElements, scene: WallScene, state: CaptureState): void => {
  const spans = parseSpans(SPAN_LINES, elements.transcript.value);
  state.current = { sanitized: sanitize(elements.transcript.value, spans), held: spans.length };
  state.summary = SUMMARY;
  state.view = 'held';
  scene.setRedaction(elements.transcript.value, spans, (count) => setCount(elements, count));
  setCap(elements, 'held');
  setSummary(elements, SUMMARY);
  setCloudLatency(elements, 'CLOUD · 1.84 s');
};

const loadHistory = (elements: AppElements, state: CaptureState): void => {
  state.history = HISTORY;
  renderHistoryChip(elements, HISTORY);
  renderDrawer(elements, HISTORY, 0, (index) => {
    state.openIndex = index;
    renderDrawer(elements, HISTORY, index, (next) => {
      state.openIndex = next;
    });
  });
};

/**
 * Demo/capture harness: builds the locked-board state from the real pipeline
 * (parse + sanitize) without Firebase. Only active with ?capture=<mode>.
 */
export function maybeCapture(elements: AppElements, scene: WallScene, state: CaptureState): boolean {
  const mode = captureMode();
  if (!mode) {
    return false;
  }
  if (mode === 'unconfigured') {
    setMode(elements, 'unconfigured');
  } else {
    loadRun(elements, scene, state);
    if (mode === 'app') {
      setStatus(elements, `Local · Gemini Nano · ${formatLatency(412)}`, false);
      setMode(elements, 'app');
    } else if (mode === 'history') {
      setStatus(elements, `Local · Gemini Nano · ${formatLatency(412)}`, false);
      loadHistory(elements, state);
      setMode(elements, 'history');
    } else {
      setStatus(elements, `Offline · local only · ${formatLatency(412)}`, false);
      setMode(elements, 'offline');
    }
  }
  document.title = 'capture-ready';
  (window as unknown as { wallIdleStop?: boolean }).wallIdleStop = true;
  return true;
}
