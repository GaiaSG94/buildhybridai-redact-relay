# DESIGN — journal

Versions datées, jamais écrasées. Écrit par Claude.

## V1 — 2026-11-18 · exploration de la page App

**Livré** : `PAGES.md`, `REFS.md`, `planches/v1/01-cockpit.html`, `02-boundary.html`, `03-redline.html` (1440 × 900, polices système, aucun réseau).

**Données de démo** : le transcript `SAMPLE` de `src/main.ts`, tel quel. 6 fragments (name, email, phone, other = numéro de carte, secret, address) ; types tirés de `src/core/types.ts` (« card » n'existe pas, donc `other`). Latence locale 412 ms et cloud 1,84 s : ce sont des valeurs de démo, pas des mesures. Les entrées d'historique reprennent la première ligne du texte assaini, parce que Firestore ne stocke aucun titre.

**Les 3 directions**
1. **Cockpit** : la direction du brief (palette `SPEC.md` §7). Deux volets, une mono pour l'éditeur et les chiffres, et en bas à gauche un compteur encadré de vert comme hook. Il garde la structure du code actuel, donc c'est la moins chère à implémenter.
2. **Boundary** : même palette, mais l'écran est coupé en trois zones : *This device* / *Boundary* / *Cloud*. Au centre, la frontière est une colonne hachurée qui affiche « 06 held back » en très grand, avec le détail par type. On voit aussi le texte exact envoyé au cloud. Les étapes 01-02-03 remplacent les boutons et la grille est dessinée en filets, une idée prise à Santalarch.
3. **Redline** : la variante qui s'écarte du brief. Thème clair « papier », transcript en grand corps, fragments caviardés par des barres noires étiquetées en rouge, compteur en bandeau de tête. Il s'éloigne de la palette fixée : à garder seulement si on accepte de modifier `SPEC.md` §7.

**Recommandation** : **02 Boundary**. Le jury doit *voir* que rien ne passe la frontière. Ici la frontière est un vrai objet à l'écran, posé entre l'appareil et le cloud, et le gros « 06 » se lit en vidéo même en vignette. La palette et les types de rédaction du code restent les mêmes : seule la mise en page change.

**Questions ouvertes** : voir `PAGES.md` § Questions produit.

## V2 — 2026-11-18 · refonte après rejet de V1

**Retour de Gaia** : « aucune » des 3 directions V1 ; « ça fait slop IA, pas du tout la qualité des refs ; je veux du moderne ».

**Diagnostic V1 (ce qui faisait slop)** : police de secours Arial (aucune police réelle embarquée) ; pastilles arrondies à point lumineux ; micro-libellés mono en majuscules numérotés 01/02/03 partout ; cartes bordées dans des cartes ; fonds teintés `color-mix` ; trois couleurs d'accent en concurrence ; hachures décoratives ; tout au même petit corps, sans hiérarchie.

**Règles V2** :
- Inter + JetBrains Mono embarquées en base64 (SIL OFL), donc une vraie typographie, toujours sans réseau.
- Grand corps (transcript 23-27 px, titres 68-330 px), approche serrée sur les grandes tailles.
- Libellés en casse normale. La mono est réservée aux chiffres et aux badges.
- Monochrome + rouge pour la rédaction. Vert et orange seulement dans les badges LOCAL/CLOUD, en aplat à angles vifs, sans point.
- Filets fins pour la structure, aucune ombre, aucun dégradé.

**Les 3 directions** (`planches/v2/`)
1. **Split** : l'écran est coupé en deux. Moitié claire = l'appareil (transcript surligné), moitié noire = le cloud (texte reçu + résumé). En bas, de part et d'autre de la coupure : « 6 fragments blocked » | « 0 sensitive fragments received ».
2. **Statement** : sombre, principe Vercel. Une phrase géante en tête (« 6 fragments never left this device. ») puis deux colonnes calmes : transcript / résumé. Barre d'actions en pied.
3. **Grid** : clair, principe Santalarch. Grille de 12 colonnes visible, « 6 » géant en rouge, fragments en aplat noir, résumé en 4 colonnes alignées sur la grille.

**Recommandation** : **01 Split**. Le pitch du produit devient la composition elle-même : ce que l'appareil voit / ce que le cloud reçoit, et « 6 | 0 » se comprend en une seconde dans la vidéo.

## V3 — 2026-11-18 · identité visuelle

**Retour de Gaia sur V2** : « aucun » ; « slop IA, pas d'identité visuelle, aucun travail des couleurs, des détails, des motifs ». L'image « Label Lens » collée par erreur est **ignorée** (consigne explicite).

**Diagnostic V2** : propre mais générique. Monochrome + une couleur, grande typo : c'est le gabarit par défaut de toute app IA. Pas de concept, pas de motif, aucun détail qui n'appartienne qu'à ce produit.

**Méthode V3** : chaque direction part d'une **métaphore de la confidentialité**, qui dicte ensuite le motif, la palette, la typo et le traitement des fragments rédigés. Motifs générés par calcul (guilloches = hypotrochoïdes, ruban, grain) et polices à caractère embarquées (SIL OFL), toujours sans réseau.

1. **Security Print** (`01-security-print.html`) : l'information protégée prend l'apparence d'un billet ou d'un chèque.
   - Motif : rosace guillochée qui porte le compteur, avec un texte circulaire « sealed on this device » ; fragments remplis de guilloches vermillon ; micro-texte sous l'en-tête ; rosaces dans les coins du document ; double filet or ; registre d'historique avec points de conduite.
   - Palette : vélin `#ece5d5`, encre verte `#14352c`, or `#a8843f`, vermillon `#c4381c`, cuivre `#b05a24` (CLOUD), vert `#1d7a50` (LOCAL).
   - Typo : Instrument Serif (italique pour les chiffres) / Instrument Sans / IBM Plex Mono.
2. **Privacy Glass** (`02-privacy-glass.html`) : le cloud regarde la réunion à travers du verre cannelé.
   - Motif : fragments givrés (texte flouté + cannelures + liseré corail) ; dalle de verre cannelé avec flou d'arrière-plan pour le côté cloud ; lumières diffuses menthe, ambre et corail ; grain.
   - Palette : nuit `#071012`, givre `#e4efec`, menthe `#57f0b5` (LOCAL), ambre `#ffb454` (CLOUD), corail `#ff6b57`.
   - Typo : Bricolage Grotesque (largeur variable) / Martian Mono.
3. **Seal Tape** (`03-seal-tape.html`) : l'appareil scelle les fragments au ruban d'inviolabilité avant l'expédition.
   - Motif : ruban rouge micro-imprimé « SEALED ON DEVICE », bords déchirés, légèrement de biais ; papier listing à perforations ; slider en mètre ruban jaune ; bloc compteur « 06 » géant barré de ruban ; manifeste d'expédition à filets épais.
   - Palette : béton `#e2e0da`, graphite `#17181a`, rouge scellé `#e3261c`, jaune mètre `#f0d34a`, vert `#19a45c` (LOCAL), ambre `#ffb454` (CLOUD).
   - Typo : Archivo (étendu 125 % / condensé 62 %) / IBM Plex Mono.

**Conséquence** : les trois directions sortent de la palette de `SPEC.md` §7. La direction retenue devra la remplacer.

**Recommandation** : **03 Seal Tape** pour la vidéo, parce que le ruban rouge se lit instantanément, même en vignette, et que le geste « sceller avant d'expédier » *est* le pitch. **01 Security Print** est la plus raffinée et la plus singulière.

## V4 — 2026-11-18 · matière et lumière

**Retour de Gaia sur V3** : « slop IA ; la matière, les couleurs, les motifs n'ont pas été travaillés ; pas d'identité visuelle ». Consignes ajoutées :
- **Ordi uniquement** : aucun téléphone, mobile ou responsive, sauf si le hackathon l'exige (ce n'est pas le cas ici).
- **Aller voir les références des jeux**.

**Références des jeux** (`~/hackatons-pipeline/2026-12-09-reddit-gameday-2026/Best-Daily-Game/*/app/PROMPT-DESIGN.md` §4) : la famille « matière » regroupe Shutabug, Primal Instinct et Igloo. Ouvertes le 2026-11-18 :
- **Shutabug** : galerie 3D courbe sur ivoire, objets sous lumière de studio douce, interface minuscule reléguée aux bords.
- **Primal Instinct** : reste bloqué sur son écran de chargement (glyphe crème, silhouettes floues sur noir) dans le navigateur intégré. Décodage complet repris de `gameday-cadenas/app/G-DESIGN/REFS.md` : pierre gravée en lumière rasante, relief lisible par la lumière seule.
- **Igloo** : bloqué au chargement (site WebGL), donc **non décodé** ; je n'en tire rien.

**Diagnostic V3** : des motifs dessinés à plat en CSS, sans volume ni lumière. Ce n'est pas de la matière.

**Méthode V4** : un petit moteur de rendu de relief embarqué dans chaque planche, sans dépendance. Il part d'une carte de hauteur et d'un albédo, puis calcule les normales, la lumière directionnelle, les ombres portées sur le relief, l'occlusion des creux et le spéculaire. Le transcript devient un **objet physique éclairé** ; l'interface reste petite, sur les bords.

1. **Basalt** (`planches/v4/01-basalt.html`, principes de Primal Instinct) : dalle de basalte aux bords éclatés, lumière rasante chaude depuis le haut-gauche qui retombe dans le noir. Transcript gravé et rechampi crème (Instrument Serif), données sensibles **arrachées au burin** (entailles brutes, pierre fraîche plus claire), « 6 » gravé en grand. Colonne cloud en crème sur noir, cadres pointillés.
2. **Wax** (`planches/v4/02-wax.html`, principes de Shutabug) : papier coton imprimé en creux (Archivo) posé de biais sur fond ivoire, lumière de studio douce. Chaque donnée sensible est couverte d'un **scellé de cire rouge brillant**, avec son type pressé dedans. Grand sceau en relief : « 6 » et texte circulaire « sealed on this device ».
3. **Milled** (`planches/v4/03-milled.html`) : plaque d'aluminium brossé, chanfreinée, vissée par 4 vis à six pans creux, texte gravé au laser (Martian Mono). Données sensibles **fraisées** en poches avec traces d'outil, « 06 » fraisé, voyant LED vert « on device ». Boutons et slider en métal.

**Recommandation** : **02 Wax**. Le sceau de cire dit « scellé, rien n'est sorti » sans explication, il se lit instantanément en vidéo, et c'est l'objet le plus réussi des trois.

**Note** : la mémoire de session n'a pas pu enregistrer les règles « ordi uniquement » et « anti-slop » (chemin trop long) ; elles sont consignées ici.

## V5 — 2026-11-18 · scènes 3D narratives

**Retour de Gaia sur V4** : « slop IA ; matière, couleurs, motifs pas travaillés ; pas d'identité visuelle ». Consignes : regarder les références design de la **catégorie jeu**, puis « appuie-toi sur les designs des refs design de narratif jeu, de 3D matière aussi ».

**Références consultées** (webdesign-inspiration.com, 2026-11-18) :
- **Industrie « Jeux Vidéo »** (22 sites). À retenir :
  - Firewatch : paysage en couches, une seule teinte du clair au sombre, silhouettes.
  - Den of Wolves : gris pâle, glitch rouge, logotype condensé.
  - Foot Locker Home Game : plateau de jeu, trames, couleurs franches.
  - Meow Mart : monde entièrement illustré.
  - Knucklebon.es : matière réelle (bois).
- **Style « 3D »** (42 sites). À retenir :
  - Igloo (vignette) : construction de blocs lumineux sur terrain rocheux gris, lumière de cinéma, HUD en étiquettes blanches.
  - Lorenzo Lottici : grille de cubes lumineux dans le noir.
  - zypsy : forme 3D brillante.
- **Principe commun** : l'identité vient d'un *monde* (scène, objet, personnage) qui raconte, pas d'une décoration d'interface.

**Méthode V5** : vraies scènes 3D (Three.js r158, MIT, intégré dans chaque fichier ; aucun réseau). Chaque scène raconte le trajet des données ; l'interface est en surimpression, en style HUD ou jeu.

1. **Wall** (`planches/v5/01-wall.html`, principes Igloo/Lottici) : le transcript est un mur, un mot par bloc de béton gravé, posé sur un terrain rocheux dans la brume froide. Les 6 fragments sensibles sont des blocs de verre rouge incandescent, en retrait, qui portent leur type. HUD en plaques blanches.
2. **Relay** (`planches/v5/02-relay.html`, principe Firewatch) : paysage au crépuscule en crêtes d'une seule teinte, pins en silhouette. La cabane (l'appareil) garde 6 paquets rouges en cage ; un câble lumineux monte vers une tour-relais, et des paquets propres partent vers un nuage. Le transcript s'affiche dans une **boîte de dialogue de jeu**, les fragments en barres incandescentes ; le résumé est un « journal de quête ».
3. **Tiles** (`planches/v5/03-tiles.html`, principe plateau de jeu) : table en noyer, plateau de feutre, une tuile ivoire gravée par mot. Les tuiles sensibles sont **retournées face cachée** (dos laqué rouge, croisillons, type en or). Pile de 6 jetons avec le « 6 », lumière chaude rasante de fenêtre, carte de score papier pour le résumé.

**Recommandation** : **02 Relay**. C'est la seule qui raconte une histoire en une image (appareil → frontière → cloud), elle a une vraie palette travaillée sur une seule teinte, et sa boîte de dialogue de jeu garde le transcript lisible pour la vidéo.

**Limites** : Igloo n'a été vu qu'en vignette (le site ne charge pas dans le navigateur intégré). Les scènes sont rendues une fois, sans animation.

## V5.1 — 2026-11-18 · style validé : Tiles

**Décision de Gaia** : direction **03 Tiles** retenue.

**Livré** :
- `STYLE.md` : palette, typographie, scène 3D, composants, états, mouvement.
- Les 4 pages en continuité stricte, générées depuis un même gabarit :
  - `planches/v5/page-01-app.html` : App ;
  - `page-02-non-configure.html` : rien n'est rédigé, donc tout est face visible ; post-it avec le message exact du code et les clés requises ; boutons désactivés ;
  - `page-03-historique.html` : tiroir ;
  - `page-04-mode-avion.html` : rédaction locale active, cloud désaturé, Save et Summarize désactivés.

**Décisions prises par défaut (à confirmer, cf. `PAGES.md` § Questions)** :
- l'historique est un **tiroir** (liste de départ du brief) ;
- le nombre de fragments par entrée est **affiché**, ce qui suppose de le stocker dans Firestore (aujourd'hui seul `sanitized` + `createdAt` le sont) ;
- le cas « cloud fallback » n'a pas de planche.

**Prochaine étape** : revue des 3 nouvelles pages, puis `/lock` quand toutes sont validées.

## V5.2 — 2026-11-18 · correction : style validé = Wall

**Correction de Gaia** : le « 3 » ne désignait pas Tiles. La planche à valider est **01 Wall** (capture fournie).

**Fait** :
- La déclinaison Tiles (pages + STYLE) est archivée dans `planches/v5/archive-tiles/`, pas supprimée.
- `STYLE.md` est réécrit pour Wall.
- Les 4 pages sont régénérées depuis le gabarit Wall, dans `planches/v5/` :
  - `page-01-app.html` ;
  - `page-02-non-configure.html` : aucun bloc retenu, vraies valeurs visibles, carte « Setup required », compteur « 00 », boutons désactivés ;
  - `page-03-historique.html` : tiroir HUD sur scène voilée ;
  - `page-04-mode-avion.html` : rédaction locale active, carte cloud vide, Summarize et Save désactivés.

Les décisions par défaut de V5.1 tiennent toujours (historique en tiroir ; nombre de fragments affiché, donc à stocker ; pas de planche pour le cas « cloud fallback »).

## V6 — 2026-11-18 · /lock

**Décision de Gaia** : les 4 pages sont validées (« Validées, /lock »). Le style **Wall** est verrouillé : fin des explorations.

**Référence pour l'implémentation** :
- style : `STYLE.md` ;
- planches : `planches/v5/page-01-app.html`, `page-02-non-configure.html`, `page-03-historique.html`, `page-04-mode-avion.html` ;
- statuts : `PAGES.md`, toutes les pages à « validée ».

**Reste ouvert pour l'implémentation** (cf. `PAGES.md` § Questions) :
- stocker le nombre de fragments dans Firestore, puisque l'historique l'affiche ;
- le cas « cloud fallback » n'a pas de planche ; il reprend les règles de l'état App, avec le statut CLOUD sur la rédaction.
