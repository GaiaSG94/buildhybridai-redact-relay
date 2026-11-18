# STYLE — Redact Relay · direction « Tiles » (validée le 2026-11-18)

Desktop 1440 × 900 uniquement. Source : `planches/v5/03-tiles.html`, déclinée dans `planches/v5/page-0*.html`.

## Concept

Le transcript est un **jeu de tuiles posé sur un plateau**, un mot par tuile. La rédaction sur l'appareil **retourne les tuiles sensibles face cachée** : le dos est rouge laqué et ne montre que le type (NAME, EMAIL…), jamais la valeur. Le cloud ne « joue » qu'avec les tuiles face visible. Le compteur, c'est **une pile de jetons** : un jeton par fragment retenu.

## Palette

| Rôle | Hex | Usage |
|---|---|---|
| Noyer (table) | `#784a2c` → `#3a2416` | fond de scène (texture procédurale) |
| Feutre | `#1f3a2c` | plateau de jeu |
| Cadre du plateau | `#6b4426` | bois verni (clearcoat) |
| Ivoire tuile | `#f0e7d2` (face) / `#e9dcc0` (tranche) | tuiles face visible |
| Encre | `#1b130d` / `#22170f` | texte des tuiles, texte UI |
| Rouge scellé | `#c8261a` (UI) / `#b01a0e` (dos de tuile) | **seule couleur d'accent** : tuiles retournées, jetons, bouton principal, compteur |
| Or | `#e8b866` | type imprimé sur le dos des tuiles |
| Carton | `#f3ead8` | cartes UI (résumé, barre de contrôle, tiroir) |
| Post-it | `#f6e7b8` | uniquement l'état « non configuré » |
| LOCAL | `#4cf092` | point lumineux dans la pastille de statut |
| CLOUD | `#c77a1c` | mention « Cloud · 1.84 s » sur la carte |

## Typographie

- **Archivo** (variable, SIL OFL), embarquée en base64 :
  - titres en 800 / largeur 112-120 % ;
  - mots sur les tuiles en 700 ;
  - compteur en 800 / largeur 70 %.
- **IBM Plex Mono** (SIL OFL) : étiquettes, métadonnées, types sur le dos des tuiles. Majuscules, interlettrage 0,06-0,1 em.
- Échelle UI : 10,5 (mono) · 14,5 · 17 · 22 · 26-30 (titres de carte) · 64 (compteur).

## Scène 3D (Three.js r158, embarqué)

- **Caméra** : perspective, fov 30, vue plongeante à environ 50° ; le plateau occupe les 2/3 gauche.
- **Lumière** :
  - clé chaude `#ffd2a0` venant d'une fenêtre en haut à gauche ; ombres douces PCF, carte 4096 ;
  - ciel/sol `#ffe7cc` / `#3a2010` ;
  - reflets d'environnement « room » (PMREM).
- **Matières** :
  - tuile ivoire : clearcoat 0,5, mot gravé (bump) ;
  - dos rouge : clearcoat 1, croisillons et cartouche ;
  - jetons : tranche à bandes, face avec le chiffre ;
  - feutre mat ;
  - noyer à cernes procéduraux.
- **Irrégularité contrôlée** : les tuiles ont un léger décalage et une légère rotation (± 0,03 rad face visible, ± 0,09 rad face cachée, pour qu'on sente le geste).

## Composants (HTML par-dessus la scène)

- **Barre haute** : logotype « Redact **Relay** » (Relay en rouge), onglets en mono, pastille de statut à droite (fond encre translucide, point LOCAL).
- **Carte de résumé** : carton ligné, inclinée de 1,2°, filets épais encre entre les 4 sections (Overview / Decisions / Actions / Risks), historique en pied.
- **Barre de contrôle** : carton, slider de sensibilité avec poignée en jeton rouge, boutons à bord 2 px et ombre portée pleine de 3 px (« touche » de jeu) ; principal = rouge.
- **Compteur** : chiffre géant rouge et légende mono, en bas à gauche, sur la table.
- **Tiroir d'historique** : panneau carton de 560 px à droite, voile sombre sur la scène, entrées en cartes ; l'entrée ouverte est bordée de rouge.

## États

| État | Scène | UI |
|---|---|---|
| App (après rédaction) | tuiles sensibles retournées, 6 jetons | résumé rempli, boutons actifs |
| Non configuré | tout face visible (rien n'est rédigé), aucun jeton, plateau agrandi | post-it épinglé avec le message exact du code + les 4 clés `VITE_FIREBASE_*` requises ; les 3 boutons désactivés (opacité 0,38, sans ombre) |
| Historique | scène voilée | tiroir ouvert ; barre de contrôle atténuée |
| Mode avion | identique à App (la rédaction locale marche) | pastille « Offline · local only » ; carte de résumé désaturée avec des sections vides « — » ; Save et Summarize désactivés, Summarize porte l'étiquette OFFLINE |

## Mouvement (pour l'implémentation)

- **Rédaction** : chaque tuile sensible se soulève de 0,4, pivote de 180° sur l'axe long et retombe. Durée 420 ms, courbe `cubic-bezier(.22,1,.36,1)`, décalage de 60 ms entre tuiles.
- **Jetons** : chaque jeton tombe sur la pile au moment où sa tuile retombe, avec un léger rebond (`cubic-bezier(.34,1.56,.64,1)`).
- Pas d'autre animation décorative.

## Interdits rappelés

Aucune marque tierce, aucun emoji, aucune couleur d'accent autre que le rouge scellé (vert et orange limités aux signaux LOCAL et CLOUD), pas de mobile ni de responsive.
