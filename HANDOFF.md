# HANDOFF — redact-relay

## opencode — 2026-11-21 (07b implémentation design)

Écarts volontaires planches → produit, soumis à Gaia (aucun validé en silence) :

1. **[Gaia]** Éditeur de transcript absent des planches (transcript figé) ;
   ajouté comme plaque HUD « Edit transcript » ouverte par `edit` dans la
   plaque sombre du bas. À valider, ou `/delta` pour une autre affordance.
2. **[Gaia]** Plaque d'erreur ajoutée (échecs réseau/modèle, non couverts par
   les planches). Même gabarit, filet rouge.
3. **[info]** Latences réelles à la place des valeurs de démo (412 ms/1,84 s) ;
   médianes en infobulle du statut, aucun élément visuel ajouté.
4. **[info]** Firestore : `held` + 4 sections du résumé stockés (dérivés du
   texte assaini uniquement) parce que le tiroir verrouillé les affiche.
5. **[info]** Exposition ~5-10 % plus claire au centre du mur (three r158 npm
   n'a pas `scene.environmentIntensity`, présent dans le build des planches).
