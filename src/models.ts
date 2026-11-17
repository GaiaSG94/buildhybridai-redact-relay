import {
  getGenerativeModel,
  InferenceMode,
  InferenceSource,
  type AI,
  type GenerativeModel,
} from 'firebase/ai';
import {
  buildRedactionPrompt,
  parseSpans,
  sanitize,
} from './core/redact';
import { buildSummaryPrompt, parseSummary } from './core/summary';
import type { MeetingSummary, RedactionOptions, RedactionRun } from './core/types';

/** Hybrid model: prefer the on-device model, fall back to the cloud. */
export function createRedactor(ai: AI, cloudModel: string): GenerativeModel {
  return getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    onDeviceParams: { createOptions: { expectedOutputs: [{ type: 'text' }] } },
    inCloudParams: { model: cloudModel },
  });
}

/** Cloud-only model: summaries never run on-device (long context). */
export function createSummarizer(ai: AI, cloudModel: string): GenerativeModel {
  return getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: { model: cloudModel },
  });
}

export interface RedactorBundle {
  redactor: GenerativeModel;
  summarizer: GenerativeModel;
}

export function createModels(ai: AI, cloudModel: string): RedactorBundle {
  return { redactor: createRedactor(ai, cloudModel), summarizer: createSummarizer(ai, cloudModel) };
}

/** Run the on-device-first redaction and return spans plus telemetry. */
export async function runRedaction(
  models: RedactorBundle,
  text: string,
  options: RedactionOptions,
): Promise<RedactionRun> {
  const started = performance.now();
  const result = await models.redactor.generateContent(buildRedactionPrompt(text, options));
  const raw = result.response.text();
  const source = result.response.inferenceSource === InferenceSource.IN_CLOUD
    ? 'in_cloud'
    : 'on_device';
  const spans = parseSpans(raw, text);
  return {
    sanitized: sanitize(text, spans),
    spans,
    source,
    latencyMs: Math.round(performance.now() - started),
  };
}

/** Summarize sanitized text in the cloud. */
export async function runSummary(
  models: RedactorBundle,
  sanitized: string,
): Promise<MeetingSummary> {
  const result = await models.summarizer.generateContent(buildSummaryPrompt(sanitized));
  return parseSummary(result.response.text());
}
