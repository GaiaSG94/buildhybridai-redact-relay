# SCRIPT — redact-relay (vidéo démo ≤ 3 min, YouTube public)

Format : 16:9, 1920x1080, anglais (sous-titres anglais possibles), pas de musique
copyrightée, pas de marque tierce à l'écran. Enregistrement : voix off optionnelle
(ElevenLabs → fallback Kokoro) ou texte à l'écran.

## Shot list (2 min 50)

| # | Temps | Plan | Ce qu'on voit / dit |
|---|---|---|---|
| 1 | 0:00–0:20 | Écran, titre | Logo texte « Redact Relay » + phrase : *Your meeting notes, minus the secrets.* Repo GitHub en petit. |
| 2 | 0:20–0:50 | App, transcript préchargé | 5 lignes de réunion avec email, téléphone, carte, clé API, adresse. Voix off : « This transcript holds five secrets. » |
| 3 | 0:50–1:20 | Clic « Redact on device » | Badge qui passe **LOCAL**, compteur « 5 fragment(s) blocked — 180 ms — nothing left this device », fragments soulignés en rouge. |
| 4 | 1:20–1:50 | Mode avion (bandeau Chrome) | Relance la rédaction : ça fonctionne encore. Voix off : « No network? Still redacted. Nothing sensitive left the device. » |
| 5 | 1:50–2:15 | Texte assaini + « Summarize in cloud » | Badge **CLOUD**, résumé en 4 sections (Overview / Decisions / Actions / Risks). Voix off : « Only the redacted transcript reaches the cloud. » |
| 6 | 2:15–2:40 | Onglet Réseau | Requête sortante = texte assaini uniquement. Voix off : « The raw text never leaves the browser. » |
| 7 | 2:40–2:55 | Repo + garde CI | README : usage runtime de Firebase AI Logic, licence, tests verts (20/20). |
| 8 | 2:55–3:00 | Carte finale | « #BuildHybridAI · Redact Relay · Web/Chrome » + URL du repo. |

## Captures à prendre (avant le montage)

1. App avec transcript + 5 fragments surlignés (badge LOCAL visible).
2. App en mode avion avec le même résultat.
3. Résumé cloud 4 sections.
4. Onglet Réseau (payload assaini).
5. README repo (section « How Firebase AI Logic is used »).
6. GitHub Actions verte (badge).

## Prérequis

- App déployée avec la config Firebase réelle (App Check debug token non
  accepté en prod → utiliser reCAPTCHA).
- Chrome stable avec le modèle embarqué disponible pour le plan « LOCAL » ;
  sinon le badge affiche CLOUD (prévoir une capture alternative et le dire
  dans la description).
