# PAGES — Redact Relay

Desktop 1440 × 900, une seule application web. Statut : `à dessiner` / `en revue` / `validée`.

| # | Page | Rôle | Contenu clé | Statut |
|---|---|---|---|---|
| 1 | **App** | Écran principal et unique de la démo : prouver que la rédaction se fait sur l'appareil avant tout envoi au cloud. | Barre haute (titre + badge LOCAL/CLOUD du dernier run) ; volet gauche : transcript, slider de sensibilité (0-1, défaut 0.60), 3 boutons (Redact on device / Summarize in cloud / Save), stats ; volet droit : aperçu surligné ↔ texte assaini, résumé 4 sections (Overview, Decisions, Actions, Risks), historique. | validée · `planches/v5/page-01-app.html` |
| 2 | **État non configuré** | Ce que voit quelqu'un qui clone le repo sans clés Firebase : l'app reste lisible, rien n'est cassé. | Même layout que App ; notice « Firebase is not configured » ; les 3 boutons désactivés ; transcript d'exemple préchargé. | validée · `planches/v5/page-02-non-configure.html` |
| 3 | **Historique** | Retrouver les comptes-rendus enregistrés (Firestore, texte assaini uniquement). | Liste des entrées enregistrées ; ouverture d'une entrée dans le volet droit. | validée · `planches/v5/page-03-historique.html` (tiroir) |
| 4 | **Mode avion** | État dégradé assumé : la rédaction locale marche hors ligne, le cloud est grisé. C'est la preuve la plus forte pour la vidéo. | Badge LOCAL ; stats « nothing left this device » ; bouton Summarize et historique grisés avec raison affichée. | validée · `planches/v5/page-04-mode-avion.html` |

## Questions produit (à trancher par Gaia, non inventées)

1. **Historique : tiroir ou section ?** `SPEC.md` §3 place l'historique *dans* le volet droit ; le brief parle d'un *tiroir*. Les planches V1 le montrent en section compacte en bas du volet droit. Faut-il une page « tiroir » dédiée ?
2. **Contenu d'une entrée d'historique** : le code stocke `sanitized` + `createdAt`. Les planches affichent date + première ligne du texte assaini + nombre de fragments. Le nombre de fragments n'est pas stocké aujourd'hui : on l'ajoute, ou on l'enlève de l'UI ?
3. **Cas « cloud fallback »** (Nano indisponible, la rédaction part au cloud) : le code l'affiche déjà (`cloud fallback used`). Est-ce une 5e page ou un état de la page App ?
