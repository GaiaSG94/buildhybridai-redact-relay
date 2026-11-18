# STYLE — Redact Relay · direction « Wall » (validée et **verrouillée** le 2026-11-18)

> **/lock** : fin des explorations. Toute évolution passe par `/delta` sur ce style, sans nouvelle direction.

Desktop 1440 × 900 uniquement. Source : `planches/v5/01-wall.html`, déclinée dans `planches/v5/page-0*.html`.
(L'ancienne déclinaison Tiles, faite par erreur, est archivée dans `planches/v5/archive-tiles/`.)

## Concept

Le transcript est un **mur** posé sur un terrain rocheux, dans la brume : **un mot par bloc de béton**, dans l'ordre de lecture. Les fragments sensibles sont des **blocs de verre rouge incandescent, en retrait dans le mur**, qui portent leur type (NAME, EMAIL…), jamais la valeur. Ils restent sur l'appareil ; seul le reste du mur est relayé au cloud. L'interface est un **HUD** : des plaques blanches posées sur la scène, comme des étiquettes.

Principes empruntés (jamais l'asset ni la mise en page) : Igloo (blocs lumineux sur terrain gris, lumière de cinéma, HUD en plaques blanches) et Lorenzo Lottici (cubes lumineux dans l'obscurité).

## Palette

| Rôle | Hex | Usage |
|---|---|---|
| Brume / ciel | `#8f949c` | fond et brouillard exponentiel (densité 0,011) |
| Roche | `#9a9ea5` (texture `#84878c` ± bruit) | terrain, pierres éparses |
| Béton clair | `#bebfbe` (face) / `#b4b5b4` (tranche) | blocs de mots |
| Encre gravée | `#222428` | mots sur les blocs |
| Rouge incandescent | `#ff3b2a` (UI) · verre `#ff5a44`, émission `#ff3a20` | **seul accent** : blocs retenus, compteur, repère du slider |
| Plaque HUD | `#f4f5f6` | toutes les cartes d'interface |
| Encre HUD | `#0e1013` | texte HUD, bouton principal, légende sombre |
| LOCAL | `#3ddc84` | carré lumineux de statut |
| CLOUD | `#ffb454` (texte `#8a5200`) | statut cloud, état « non configuré » |

## Typographie

- **Instrument Sans** (SIL OFL), embarquée : mots gravés sur les blocs (600) ; texte du HUD (400-600) ; compteur 86 px / 600, interlettrage −0,05 em.
- **IBM Plex Mono** (SIL OFL) : étiquettes HUD en majuscules (10-11 px, interlettrage 0,04-0,06 em) ; type gravé lumineux sur les blocs rouges.
- Échelle : 10 · 10,5 · 13 · 15 · 16 (aperçu du résumé) · 86 (compteur).

## Scène 3D (Three.js r158, embarqué)

- **Caméra** : perspective, fov 27, position (−5 ; 6,5 ; 43), regard vers (3,6 ; 3,2 ; 0) ; le mur occupe la moitié gauche, le HUD la droite.
- **Lumière** :
  - clé froide `#eef3ff` (2,1) en haut à gauche, ombres PCF douces (carte 4096) ;
  - ciel/sol `#c9d2e0` / `#4a4d52` (0,55) ;
  - exposition ACES 0,82.
- **Mur** :
  - blocs `RoundedBox` 1,02 de haut, 1,25 de profondeur, joints de 0,07 ; largeur proportionnelle au mot ;
  - appareillage en quinconce (une rangée sur deux décalée de 0,45) ;
  - rotation de 0,22 rad, socle en béton sous le mur.
- **Blocs retenus** :
  - verre physique (clearcoat 1), en retrait de 0,55 ;
  - face émissive avec le type gravé ;
  - halo additif et lumière ponctuelle rouge (portée 4,5).
- **Terrain** : collines en bruit fractal, qui se lèvent au-delà de 15 unités, perdues dans la brume ; pierres icosaèdres facettées.

## Composants HUD

- **Plaque** : fond `#f4f5f6`, sans rayon, ombre 1 px, mono majuscule ; variante sombre (encre) pour la légende.
- **En haut** : logotype à gauche, onglets Transcript / History, statut à droite (carré lumineux + texte).
- **Carte cloud** (380 px, en haut à droite) : titre mono « Relayed to the cloud » + statut CLOUD, puis Overview (16 px) et Decisions / Actions / Risks séparés par des filets.
- **Historique compact** (380 px) sous la carte.
- **Compteur** : en bas à gauche, « 06 » rouge et légende mono.
- **Légende du transcript** : plaque sombre.
- **Contrôles** (en bas à droite) :
  - slider : filet encre, repère rouge ;
  - boutons rectangulaires, bord 1 px, principal plein encre ;
  - Save en lien souligné.
- **Tiroir d'historique** : plaque de 520 px sur toute la hauteur, voile gris et flou sur la scène. Les entrées sont encadrées ; l'entrée ouverte a un liseré rouge à gauche.

## États

| État | Scène | HUD |
|---|---|---|
| App | 6 blocs rouges en retrait | carte cloud remplie, tout est actif |
| Non configuré | aucun bloc rouge : les vraies valeurs restent en béton (rien n'est rédigé) | statut ambre « Not configured » ; carte « Setup required » avec le message exact du code et les 4 clés `VITE_FIREBASE_*` ; compteur « 00 » grisé ; les 3 boutons désactivés (opacité 0,35) |
| Historique | scène voilée | tiroir ouvert ; contrôles et légende masqués |
| Mode avion | identique à App : la rédaction locale marche | statut « Offline · local only » ; carte cloud avec sections vides « — » ; Summarize désactivé avec l'étiquette OFFLINE, Save désactivé ; historique « needs the cloud » |

## Mouvement (pour l'implémentation)

- **Construction** : les blocs se posent un à un dans l'ordre de lecture (40 ms d'écart, chute de 0,6 avec un léger rebond).
- **Rédaction** : chaque bloc sensible recule de 0,55 en 380 ms (`cubic-bezier(.22,1,.36,1)`), puis son verre s'allume (montée de l'émission en 240 ms). Le compteur s'incrémente à chaque bloc.
- Brume immobile, pas d'autre animation décorative.

## Interdits rappelés

Une seule couleur d'accent (rouge) ; vert et orange réservés aux signaux LOCAL / CLOUD. Aucune marque tierce, aucun emoji, pas de mobile ni de responsive. Aucune reprise d'asset ni de mise en page des références.
