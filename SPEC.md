# SPEC — buildhybridai-redact-relay

Date : 2026-11-16. Idée : `IDEE.md`. Critères : `CRITERES.md` (généré).
Repo : https://github.com/GaiaSG94/buildhybridai-redact-relay (clone : `app/`).

## 1. Architecture

- **Stack** : TypeScript + Vite (vanilla DOM, zéro framework), vitest.
- **Firebase AI Logic** (`firebase/ai`) :
  - `getAI(app, { backend: new GoogleAIBackend() })` — usage au runtime (critère « importé et appelé »). Backend **Gemini Developer API** (plan Spark, free tier, aucun moyen de paiement) ; `AgentPlatformBackend` (ex-Vertex) exigerait un compte de facturation Blaze → écarté.
  - Rédacteur = modèle **hybride** `mode: PREFER_ON_DEVICE` (Gemini Nano local via Prompt API Chrome, fallback cloud) ; `response.inferenceSource` → badge LOCAL/CLOUD.
  - Résumeur = modèle **cloud uniquement** (`ONLY_IN_CLOUD`, `VITE_CLOUD_MODEL`).
- **App Check** : `initializeAppCheck` (ReCaptchaV3Provider ; debug provider si `VITE_APPCHECK_DEBUG=1`).
- **Firestore** : collection `summaries` = texte assaini uniquement (+ `createdAt`).

## 2. Données / pipeline (purement testable)

1. Prompt de rédaction → le modèle local renvoie `SPAN|<fragment exact>|<type>` (une ligne par fragment). Le matching par texte exact est plus fiable qu'un offset sur un petit modèle.
2. `parseSpans` : résolution des offsets (exact → insensible à la casse → rejet).
3. `mergeSpans` : tri + fusion des chevauchements (span la plus large gagne).
4. `sanitize` : remplacement par `[REDACTED]` → **seul ce texte part au cloud**.
5. Prompt résumé → 4 sections `OVERVIEW:/DECISION:/ACTION:/RISK:` parsées.

## 3. Écrans

| Écran | Contenu |
|---|---|
| Barre haute | Titre + badge LOCAL/CLOUD (état du dernier run) |
| Volet gauche | Textarea transcript (échantillon préchargé), slider de sensibilité (0-1, défaut 0.6), boutons « Redact on device » / « Summarize in cloud » / « Save », stats (nb fragments bloqués, latence, source) |
| Volet droit | Aperçu rédaction (fragments surlignés rouges → bascule texte assaini), résumé 4 sections, historique Firestore |

Notice de configuration si `VITE_FIREBASE_*` absents (mode non configuré, boutons désactivés).

## 4. Intégrations imposées (critères 1-1)

| Critère | Implémentation |
|---|---|
| Firebase AI Logic au runtime | `src/firebase.ts` + `src/models.ts` (`getGenerativeModel` hybride + cloud) |
| App Check requis | `src/firebase.ts:initAppCheck` (debug tokens acceptés par le hackathon) |
| Inférence hybride (thème) | PREFER_ON_DEVICE + `inferenceSource` affiché + mode avion démontrable |
| Repo public + licence OSS | MIT à la racine du repo (visible dans About) |
| Vidéo YouTube ≤ 3 min | script de démo 5 étapes dans le README (à tourner à l'étape 8) |
| Description EN | README EN + description Devpost à écrire à la soumission |
| Démo hébergée | à déployer (Firebase Hosting ou GitHub Pages statique) avant la deadline |
| Pas de secrets | `.env.example` avec placeholders + garde CI du template |

## 5. Plan de test

- **Unitaires (vitest, sans réseau)** : parsing des lignes SPAN, localisation (exact/insensible/absent), fusion des chevauchements, sanitize (tokens, texte intact, cas vide), ratio masqué, parsing du résumé (4 sections, lignes inconnues, puces), prompts contiennent les sections requises. 20 tests verts.
- **Manuel** : mode avion (réduction locale OK), badge LOCAL→CLOUD, résumé généré sur texte assaini, Firestore save/load, console sans erreur.
- **CI** : template pr-pipeline (`npm ci`, `npm test`, `npm run build`, garde secrets, check-limits).

## 6. Limites connues

- Nano 4 nécessite Chrome/Chromium avec le modèle embarqué disponible ; sinon fallback cloud (badge l'indique — voulu).
- Matching par fragment exact : peut rater des reformulations ; atténué par le slider + types always-redact (secret/iban/ssn).
- Comptes multi-utilisateurs non scopés (Firestore ouvert en lecture sur ses propres docs à durcir).

## 7. Brief UI (étape 6, pour Claude)

- **Ton** : produit de sécurité, sombre, précis, « cockpit » — pas de couleurs criardes.
- **Palette** : fond `#10131a`, panneaux `#171b24`, texte `#e7ecf3`, muted `#93a1b5`, accent LOCAL vert `#3ddc84`, CLOUD orange `#ffb454`, fragments rédigés rouge `#ff5d5d`.
- **Signatures visuelles** : le badge LOCAL/CLOUD (pilule monospace) doit être lisible en vidéo ; les fragments sensibles sont surlignés avec un soulignement rouge ; le compteur « N fragment(s) blocked - X ms - nothing left this device » est le hook de la démo.
- **Interdits** : logos/marques tierces (YouTube/Google/Firebase) dans l'UI, gradients criards, emoji.
- **Contraintes** : desktop-first (démo vidéo 16:9), anglophone, accessible (focus visible, contrastes AA).
