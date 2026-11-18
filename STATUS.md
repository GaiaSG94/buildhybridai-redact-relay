# STATUS buildhybridai-redact-relay

Phase: build
Etat: doing
Round: R1
Maj: 2026-11-17 00:12

## opencode

- Idée : ébauche 1 de `../../IDEES.md`, retenue R1 ; `IDEE.md` + `SPEC.md` (archi, pipelines, intégrations imposées, plan de test, brief UI pour Claude).
- **Repo créé et mergé** : https://github.com/GaiaSG94/buildhybridai-redact-relay (public, MIT, topics posés, BaptisteFaisy invité, protection `main` ok). Clone local : `app/`.
- **V1 livrée** (TS + Vite, zéro framework) :
  - `src/core/redact.ts` — pipeline pur : prompt `SPAN|<fragment>|<type>`, parsing, localisation (exact → insensible à la casse), fusion des chevauchements, `sanitize` → `[REDACTED]`, ratio masqué.
  - `src/core/summary.ts` — prompt + parsing 4 sections (`OVERVIEW/DECISION/ACTION/RISK`).
  - `src/firebase.ts` — `getAI(app, { backend: new GoogleAIBackend() })` + `initializeAppCheck` (debug provider en local).
  - `src/models.ts` — **inférence hybride** : rédacteur `InferenceMode.PREFER_ON_DEVICE` (fallback cloud), résumeur `ONLY_IN_CLOUD`, badge `LOCAL/CLOUD` via `response.inferenceSource`.
  - `src/ui/*` — aperçu surligné, vue assainie, résumé, historique ; `src/store/firestore.ts` — Firestore (texte **assaini** uniquement).
  - 20 tests vitest verts (`npm test`), `tsc --noEmit` propre, build vite OK, CI verte (ci / ci-budget / couche0) et PR mergée.
- API vérifiée sur le paquet installé (`@firebase/ai` 3.1.0 via `firebase@13.4.0`) : `InferenceMode`, `InferenceSource`, `HybridParams`, `OnDeviceParams` (options Chrome Prompt API : pas de `temperature`).
- Sheet (verrou `agent-gaia`) : `taches` ideation/repo/code/readme = done ; `projets` repo + statut `build` + note.
- **Prochaine étape** : étape 6 design (Claude, brief UI dans `SPEC.md` §7) puis implémentation design ; ensuite déploiement (Firebase Hosting) + vidéo ≤ 3 min (étape 8) avant le **30/11 23:00 Paris**.
- **Points ouverts (H)** : créer le projet Firebase (config + App Check reCAPTCHA + clé de déploiement) ; inscription Devpost « Join Hackathon » ; le quota de l'API Sheets (429/min) impose de grouper les écritures Sheet.

## Claude

- 2026-11-18 : **design verrouillé (/lock)**. Direction **Wall** validée par Gaia après 5 tours d'exploration (V1-V5, journal complet dans `G-DESIGN/DESIGN.md`).
- Référence d'implémentation : `G-DESIGN/STYLE.md` + 4 planches validées `G-DESIGN/planches/v5/page-01-app.html`, `page-02-non-configure.html`, `page-03-historique.html`, `page-04-mode-avion.html` (scènes Three.js r158 embarquées, desktop 1440×900 uniquement).
- Ouvert pour l'implémentation : stocker le nombre de fragments par entrée Firestore (affiché dans l'historique) ; le cas « cloud fallback » suit les règles de l'état App.
