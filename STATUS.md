# STATUS buildhybridai-redact-relay

Phase: design-impl (07b)
Etat: review (PR ouverte)
Round: R1
Maj: 2026-11-21 23:20

## opencode

- Idée : ébauche 1 de `../../IDEES.md`, retenue R1 ; `IDEE.md` + `SPEC.md` (archi, pipelines, intégrations imposées, plan de test, brief UI pour Claude).
- **Repo créé et mergé** : https://github.com/GaiaSG94/buildhybridai-redact-relay (public, MIT, topics posés, BaptisteFaisy invité, protection `main` ok). Clone local : `app/`.
- **V1 livrée** (TS + Vite, zéro framework) : pipeline `src/core/*` (prompt `SPAN|...`, parse/merge/sanitize), hybride `src/models.ts` (PREFER_ON_DEVICE + fallback cloud, badge LOCAL/CLOUD), Firestore texte assaini, 20 tests verts, CI verte.
- **07b (2026-11-21) — design Wall verrouillé porté au produit** :
  - scène Wall en TS (`src/ui/wall/` : kit noise/textures + scène data-driven + animations STYLE.md) via three@0.158 npm + addons officiels ;
  - HUD fidèle aux planches (`index.html` + `src/ui/style.css`, polices Instrument Sans / IBM Plex Mono embarquées base64 OFL dans `src/ui/fonts.css`) ;
  - 4 modes = 4 pages de PAGES.md : `app`, `unconfigured`, `history` (tiroir), `offline` (réel, navigator.onLine) ;
  - mouvement : construction 40 ms + rebond, recul 380 ms cubic-bezier(.22,1,.36,1), allumage 240 ms, compteur incrémenté par bloc ;
  - Firestore : `held` + sections du résumé stockés (texte assaini uniquement) — le tiroir verrouillé les affiche ;
  - revue : `G-DESIGN/DESIGN.md` § « Revue d'implémentation », captures 1440×900 `G-DESIGN/revue/` (planches + produit + montages `compare-*.png`), outil `tools/capture.mjs` (puppeteer-core) ;
  - écarts volontaires soumis à Gaia dans `HANDOFF.md` (éditeur de transcript, plaque d'erreur, exposition +5-10 %).
  - Gates : 39/39 tests vitest (13 nouveaux), `tsc --noEmit` propre, build OK, check-limits 0 (hors dist/ non versionné).
- Prochaine étape : validation des écarts (HANDOFF) → déploiement (Firebase Hosting) + vidéo ≤ 3 min (étape 8) avant le **30/11 23:00 Paris**.
- Points ouverts (H) : projet Firebase (config + App Check reCAPTCHA + clé de déploiement) ; inscription Devpost ; quota API Sheets (grouper les écritures).

## Claude

- 2026-11-18 : **design verrouillé (/lock)**. Direction **Wall** validée par Gaia après 5 tours d'exploration (V1-V5, journal complet dans `G-DESIGN/DESIGN.md`).
- Référence d'implémentation : `G-DESIGN/STYLE.md` + 4 planches validées `G-DESIGN/planches/v5/page-01-app.html`, `page-02-non-configure.html`, `page-03-historique.html`, `page-04-mode-avion.html` (scènes Three.js r158 embarquées, desktop 1440×900 uniquement).
- Ouvert pour l'implémentation : stocker le nombre de fragments par entrée Firestore (affiché dans l'historique) ; le cas « cloud fallback » suit les règles de l'état App.
