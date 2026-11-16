import './ui/style.css';
import { loadConfig } from './config';
import { initFirebase } from './firebase';
import { createModels, runRedaction, runSummary, type RedactorBundle } from './models';
import { saveSummary, listSummaries } from './store/firestore';
import {
  queryAppElements,
  redactionOptions,
  setNotice,
  showHistory,
  showRun,
  showSanitized,
  showSummary,
  type AppElements,
} from './ui/views';

const SAMPLE = [
  'Alice Martin (alice.martin@acme-corp.com) opens the Acme review.',
  'Budget owner is +33 6 12 34 56 78, card 4111 1111 1111 1111.',
  'The API key is key_live_9f2c8ab31d and the room is 12 rue de la Paix, Paris.',
  'We decided to ship the beta on Friday; Sam will own the migration.',
].join('\n');

export function mount(root: HTMLElement): void {
  const elements = queryAppElements(root);
  const config = loadConfig();
  const bundle = initFirebase(config);
  elements.transcript.value = SAMPLE;

  if (!bundle) {
    setNotice(elements, 'Firebase is not configured: copy .env.example to .env.local.');
    elements.redactButton.disabled = true;
    elements.summarizeButton.disabled = true;
    elements.saveButton.disabled = true;
    return;
  }
  const models: RedactorBundle = createModels(bundle.ai, config.cloudModel);
  bindRedact(elements, models);
  bindSummarize(elements, models);
  bindSave(elements, bundle.app);
  void refreshHistory(elements, bundle.app);
}

const bindRedact = (elements: AppElements, models: RedactorBundle): void => {
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
        const run = await runRedaction(models, text, redactionOptions(elements));
        showRun(elements, run, text);
        showSanitized(elements, run);
      } catch (error) {
        setNotice(elements, `Redaction failed: ${describe(error)}`);
      } finally {
        elements.redactButton.disabled = false;
      }
    })();
  });
}

const bindSummarize = (elements: AppElements, models: RedactorBundle): void => {
  elements.summarizeButton.addEventListener('click', () => {
    void (async () => {
      const sanitized = elements.preview.querySelector('.sanitized')?.textContent ?? '';
      if (!sanitized) {
        setNotice(elements, 'Redact the transcript before summarizing.');
        return;
      }
      elements.summarizeButton.disabled = true;
      try {
        showSummary(elements, await runSummary(models, sanitized));
      } catch (error) {
        setNotice(elements, `Summary failed: ${describe(error)}`);
      } finally {
        elements.summarizeButton.disabled = false;
      }
    })();
  });
}

const bindSave = (elements: AppElements, app: Parameters<typeof saveSummary>[0]): void => {
  elements.saveButton.addEventListener('click', () => {
    void (async () => {
      const sanitized = elements.preview.querySelector('.sanitized')?.textContent ?? '';
      if (!sanitized) {
        setNotice(elements, 'Nothing to save yet.');
        return;
      }
      try {
        await saveSummary(app, sanitized);
        await refreshHistory(elements, app);
        setNotice(elements, 'Saved to Firestore.');
      } catch (error) {
        setNotice(elements, `Save failed: ${describe(error)}`);
      }
    })();
  });
}

const refreshHistory = async (elements: AppElements, app: Parameters<typeof saveSummary>[0]): Promise<void> => {
  try {
    showHistory(elements, await listSummaries(app));
  } catch {
    showHistory(elements, []);
  }
}

const describe = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
}

const root = document.getElementById('app');
if (root) {
  mount(root);
}
