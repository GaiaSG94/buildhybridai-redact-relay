# IDEE — buildhybridai-redact-relay (Web/Chrome)

Extrait de `../../IDEES.md` (ébauche 1, retenue R1 le 2026-11-16). Critères : `../../../criteres/index.json#buildhybridai-2026` + `../../FICHE.md` + `CRITERES.md` (généré).

## Pitch (1 phrase)

Compagnon de réunion « privacy first » : le transcript est **nettoyé sur l'appareil** (Gemini Nano 4 détecte et rédige PII/emails/secrets en local) **avant** que le cloud Gemini ne reçoive quoi que ce soit — le compte-rendu n'est généré que sur du texte assaini.

## Problème / cible

Les outils de notes de réunion IA envoient tout au cloud : secrets d'entreprise, données RH, clients. Cible : équipes qui veulent l'IA sans exposer leurs échanges (avocats, RH, santé, startups).

## Features

- Éditeur/paste de transcript avec rédaction en temps réel (barres rouges sur les segments sensibles, compteur « N blocked », undo/cursor de sensibilité).
- Badge `LOCAL` (Nano 4) vs `CLOUD` (Gemini) visible par segment + latence affichée.
- Compte-rendu cloud généré sur texte assaini (résumé, actions, décisions).
- Firebase : App Check (requis), Remote Config (patterns de rédaction à chaud), Firestore (comptes-rendus), Authentication.

## Différenciation

L'inférence hybride **est la fonctionnalité** (pas un gadget) : « rien de sensible ne part en ligne » répond au critère *Technological Implementation* (usage hybrid inference) et *Potential Impact* (problème réel démontré).

## Risques

- Faux positifs de rédaction → curseur de sensibilité + « undo » dans la démo.
- Disponibilité de Gemini Nano 4 selon version Chrome → version testée documentée dans le README.

## Pourquoi ça gagne

- Démo vidéo ≤ 3 min très lisible : paste d'un faux transcript bourré de PII → barres rouges en direct → compte-rendu propre.
- Produit complet (pas un PoC) : auth, persistance, réglages → critère *Design*.
- Idée non évidente : le local comme filtre de confidentialité, pas comme fallback hors-ligne.

## Livrables visés (critères 1-1)

| Livrable | Plan |
|---|---|
| Repo public GitHub + licence OSS (Apache-2.0) | Firebase AI Logic importé et appelé au runtime (Nano 4 + cloud) |
| Vidéo YouTube publique ≤ 3 min EN | footage web app, scénario PII → compte-rendu |
| Démo hébergée | web app déployée + App Check debug token |
| Description EN | usage Firebase AI Logic, features, value prop, résumé période |
| Catégorie sélectionnée | Web/Chrome (vise Grand Prix + Best Web/Chrome) |
