import './ui/style.css';
import { loadConfig } from './config';
import { initFirebase, type FirebaseBundle } from './firebase';
import { createModels, runRedaction, runSummary, type RedactorBundle } from './models';
import { saveSummary, listSummaries, type SaveInput } from './store/firestore';
import { formatMetrics, summarize, type TimedRun } from './core/metrics';
import { DEFAULT_REDACTION_OPTIONS, type MeetingSummary, type RedactionRun } from './core/types';
import {
  queryAppElements,
  setMode,
  setCount,
  setCap,
  setStatus,
  setCloudLatency,
  setSummary,
  setNotice,
  setSensitivity,
  renderHistoryChip,
  renderDrawer,
  openEditor,
  type AppElements,
} from './ui/views';
import { createWallScene, type WallScene } from './ui/wall/scene';
import { formatLatency, type HistoryEntry, type WallMode } from './ui/hud';
import { maybeCapture } from './capture';

const SAMPLE = [
  'Alice Martin (alice.martin@acme-corp.com) opens the Acme review.',
  'Budget owner is +33 6 12 34 56 78, card 4111 1111 1111 1111.',
  'The API key is key_live_9f2c8ab31d and the room is 12 rue de la Paix, Paris.',
  'We decided to ship the beta on Friday; Sam will own the migration.',
].join('\n');

interface AppState {
  firebase: FirebaseBundle | null;
  models: RedactorBundle | null;
  runs: TimedRun[];
  current: { sanitized: string; held: number } | null;
  summary: MeetingSummary | null;
  view: 'held' | 'original';
  history: HistoryEntry[];
  openIndex: number;
}

const baseMode = (state: AppState): WallMode => {
  if (!state.models) {
    return 'unconfigured';
  }
  return navigator.onLine ? 'app' : 'offline';
};

const resetRun = (elements: AppElements, state: AppState): void => {
  state.current = null;
  state.summary = null;
  state.view = 'original';
  setCount(elements, 0);
  setSummary(elements, null);
  setCloudLatency(elements, 'CLOUD');
  setStatus(elements, 'Local · Gemini Nano', false);
  setCap(elements, 'original');
};

const openDrawer = (elements: AppElements, state: AppState, open: number): void => {
  state.openIndex = open;
  renderDrawer(elements, state.history, state.openIndex, (index) => openDrawer(elements, state, index));
};

const refreshHistory = async (elements: AppElements, state: AppState): Promise<void> => {
  if (!state.firebase) {
    state.history = [];
  } else {
    try {
      state.history = await listSummaries(state.firebase.app);
    } catch {
      state.history = [];
    }
  }
  renderHistoryChip(elements, state.history);
};

const bindRedact = (elements: AppElements, state: AppState, scene: WallScene): void => {
  elements.redactButton.addEventListener('click', () => {
    void (async () => {
      const text = elements.transcript.value;
      if (!text.trim()) {
        setNotice(elements, 'Paste a transcript first.');
        return;
      }
      setNotice(elements, null);
      elements.redactButton.disabled = true;
      try {
        const run = await runRedaction(state.models as RedactorBundle, text, {
          ...DEFAULT_REDACTION_OPTIONS,
          sensitivity: Number(elements.sensitivity.value),
        });
        applyRun(elements, state, scene, run);
      } catch (error) {
        setNotice(elements, `Redaction failed: ${describe(error)}`);
      } finally {
        elements.redactButton.disabled = false;
      }
    })();
  });
};

const applyRun = (elements: AppElements, state: AppState, scene: WallScene, run: RedactionRun): void => {
  state.current = { sanitized: run.sanitized, held: run.spans.length };
  state.runs.push({ source: run.source, latencyMs: run.latencyMs });
  state.view = 'held';
  scene.setRedaction(elements.transcript.value, run.spans, (count) => setCount(elements, count));
  setCap(elements, 'held');
  if (run.source === 'in_cloud') {
    setStatus(elements, `Cloud fallback · ${formatLatency(run.latencyMs)}`, true);
  } else {
    setStatus(elements, `Local · Gemini Nano · ${formatLatency(run.latencyMs)}`, false);
  }
  elements.statusText.title = formatMetrics(summarize(state.runs));
  state.summary = null;
  setSummary(elements, null);
  setCloudLatency(elements, 'CLOUD');
};

const bindSummarize = (elements: AppElements, state: AppState): void => {
  elements.summarizeButton.addEventListener('click', () => {
    void (async () => {
      if (!state.current) {
        setNotice(elements, 'Redact the transcript before summarizing.');
        return;
      }
      elements.summarizeButton.disabled = true;
      try {
        const started = performance.now();
        const summary = await runSummary(state.models as RedactorBundle, state.current.sanitized);
        const latencyMs = Math.round(performance.now() - started);
        state.runs.push({ source: 'in_cloud', latencyMs });
        state.summary = summary;
        setSummary(elements, summary);
        setCloudLatency(elements, `CLOUD · ${formatLatency(latencyMs)}`);
        elements.statusText.title = formatMetrics(summarize(state.runs));
      } catch (error) {
        setNotice(elements, `Summary failed: ${describe(error)}`);
      } finally {
        elements.summarizeButton.disabled = false;
      }
    })();
  });
};

const bindSave = (elements: AppElements, state: AppState): void => {
  elements.saveButton.addEventListener('click', () => {
    void (async () => {
      if (!state.current || !state.firebase) {
        setNotice(elements, 'Nothing to save yet.');
        return;
      }
      try {
        const input: SaveInput = {
          sanitized: state.current.sanitized,
          held: state.current.held,
          summary: state.summary ?? undefined,
        };
        await saveSummary(state.firebase.app, input);
        await refreshHistory(elements, state);
        setNotice(elements, 'Saved to Firestore.');
      } catch (error) {
        setNotice(elements, `Save failed: ${describe(error)}`);
      }
    })();
  });
};

const describe = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const bindChrome = (elements: AppElements, state: AppState, scene: WallScene): void => {
  elements.sensitivity.addEventListener('input', () => {
    const value = Number(elements.sensitivity.value);
    setSensitivity(elements, value);
    elements.sensitivity.style.setProperty('--fill', `${value * 100}%`);
  });
  elements.cap.addEventListener('click', (event) => {
    if (event.target === elements.capEdit || !state.current) {
      return;
    }
    state.view = state.view === 'held' ? 'original' : 'held';
    scene.setView(state.view);
    setCap(elements, state.view);
  });
  elements.capEdit.addEventListener('click', () => openEditor(elements, true));
  elements.editorApply.addEventListener('click', () => {
    elements.transcript.value = elements.editorArea.value;
    openEditor(elements, false);
    resetRun(elements, state);
    scene.setTranscript(elements.transcript.value, true);
  });
  elements.editorCancel.addEventListener('click', () => openEditor(elements, false));
  elements.tabHistory.addEventListener('click', () => {
    if (navigator.onLine && state.models) {
      openDrawer(elements, state, -1);
      setMode(elements, 'history');
    }
  });
  elements.tabTranscript.addEventListener('click', () => setMode(elements, baseMode(state)));
  elements.drawerClose.addEventListener('click', () => setMode(elements, baseMode(state)));
  window.addEventListener('online', () => setMode(elements, baseMode(state)));
  window.addEventListener('offline', () => {
    if (state.models) {
      setMode(elements, 'offline');
    }
  });
};

export function mount(root: HTMLElement): void {
  const elements = queryAppElements(root);
  const state: AppState = {
    firebase: null,
    models: null,
    runs: [],
    current: null,
    summary: null,
    view: 'original',
    history: [],
    openIndex: -1,
  };
  elements.transcript.value = SAMPLE;
  setMode(elements, 'unconfigured');
  setCount(elements, 0);
  setSummary(elements, null);
  setSensitivity(elements, Number(elements.sensitivity.value));
  elements.sensitivity.style.setProperty('--fill', `${Number(elements.sensitivity.value) * 100}%`);
  setCap(elements, 'original');
  void (async () => {
    const scene = await createWallScene(elements.wall);
    scene.setTranscript(elements.transcript.value, true);
    if (maybeCapture(elements, scene, state)) {
      return;
    }
    const bundle = initFirebase(loadConfig());
    if (!bundle) {
      return;
    }
    state.firebase = bundle;
    state.models = createModels(bundle.ai, loadConfig().cloudModel);
    setMode(elements, baseMode(state));
    bindRedact(elements, state, scene);
    bindSummarize(elements, state);
    bindSave(elements, state);
    bindChrome(elements, state, scene);
    void refreshHistory(elements, state);
  })();
}

const root = document.getElementById('screen');
if (root) {
  mount(root);
}
