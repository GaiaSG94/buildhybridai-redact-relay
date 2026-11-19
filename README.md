# Redact Relay

Meeting notes where the AI never sees your secrets first.

Redact Relay is a web app built on **Firebase AI Logic hybrid inference**:
the transcript is analyzed **on the device** (Gemini Nano via the Chrome
Prompt API) and every sensitive fragment is masked **before** anything is
sent to the cloud. Only the sanitized text reaches Gemini in the cloud to
produce the meeting summary (decisions, actions, risks).

## Why it matters

Cloud note-taking tools upload the whole conversation. Confidential
details — client names, phone numbers, API keys, IBANs — end up on a
third-party server by default. Redact Relay makes the on-device model the
first line of defense: the cloud model receives a redacted transcript, and
the UI shows where every inference ran.

## How Firebase AI Logic is used

- `getAI(app, { backend: new GoogleAIBackend() })` — Firebase
  AI Logic is initialized at runtime (`src/firebase.ts`), on the Gemini
  Developer API free tier (no payment method, no billing).
- `getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE,
  onDeviceParams, inCloudParams })` — **hybrid inference**: the SDK prefers
  the on-device model and falls back to the cloud model
  (`src/models.ts`). The response's `inferenceSource` drives the LOCAL /
  CLOUD badge shown for every run.
- `initializeAppCheck(...)` — App Check protects every cloud call
  (`src/firebase.ts`), with the debug provider for local development.
- Firebase Firestore stores sanitized summaries only
  (`src/store/firestore.ts`).

## Quickstart

```bash
npm ci
cp .env.example .env.local   # fill with your Firebase project values
npm run dev
```

Environment variables are documented in `.env.example`. Never commit real
values. For local development set `VITE_APPCHECK_DEBUG=1` so App Check uses
the debug provider.

Commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm test` | Unit tests (vitest) for the redaction and summary pipelines |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build |

## Architecture

```
src/
  core/redact.ts    pure redaction pipeline (prompt, span parsing, merge, sanitize)
  core/summary.ts   pure summary pipeline (prompt, four-section parser)
  core/types.ts     shared types (spans, options, summary)
  firebase.ts       Firebase + App Check + Firebase AI Logic bootstrap
  models.ts         hybrid redactor (prefer on-device) + cloud summarizer
  ui/               DOM rendering (highlighted spans, sanitized view, summary)
  store/firestore.ts sanitized summaries persistence
tests/              vitest unit tests (no network)
```

## Demo script (3 minutes)

1. Paste the sample transcript (preloaded) — it contains an email, a
   phone number, a card number, an API key and an address.
2. Press **Redact on device**: the badge shows `LOCAL`, the counter shows
   how many fragments were blocked and the latency; every fragment is
   highlighted in red.
3. Open **airplane mode** and run the redaction again: it still works —
   the fragments never left the machine.
4. Press **Summarize in cloud**: the badge switches to `CLOUD`, and the
   summary is generated from the sanitized text only.
5. Search the network tab / Firestore: the raw transcript is nowhere.

## Limitations

- The on-device model requires a Chromium browser with the built-in model
  available (`Prompt API`); on other browsers the SDK falls back to the
  cloud model — the badge shows which path was used.
- Fragment matching is exact-text based, which keeps small-model output
  reliable but can miss paraphrased fragments; the sensitivity slider and
  the always-redact types (secret, IBAN, SSN) mitigate this.
- Firestore persistence currently stores sanitized text only; authenticated
  multi-user scoping is planned.

## Built with

TypeScript, Vite, vitest, Firebase (AI Logic, App Check, Firestore).

## Measurements

The line under the toolbar is computed from the runs that actually happened
(`src/core/metrics.ts`): how many inferences ran, how many of them ran on the
device, the median device latency, the median cloud latency, and the share of
runs that stayed on the device. These are the numbers quoted in the demo and in
the submission — nothing is hard-coded, nothing is estimated.

```text
Measurements: 5 run(s) - 3 local - 2 cloud - median local 184 ms - median cloud 1.29 s - 60% of runs computed on device
```
