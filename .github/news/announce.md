<!-- kshub-news
version: none
covers-until: 6a19a06c457fb04388ca636fb9ed0b6933062046
generated: 2026-09-03
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🧭 Sais-tu ce que valent tes Amulettes ?
title-en: 🧭 Do you know what your Amulets are worth?
-->

<!--
GABARIT — mode d'emploi

0. AVANT de rédiger : ajouter l'entrée de la version dans `data/changelog.json`
   (en tête de « releases ») et porter `SITE.version` (js/site-config.js) au même
   numéro. Annonce Discord et page « Nouveautés » couvrent le même périmètre.
   Renseigner ensuite la clé `version:` de l'en-tête ci-dessus — la publication
   est REFUSÉE si cette version n'existe pas dans le changelog, et le message
   d'erreur du workflow dit quoi corriger.
   Le lien vers l'entrée (changelog.html#v1-9) est ajouté automatiquement en fin
   de chaque embed : inutile de l'écrire à la main.
   Annonce qui ne change rien sur le site (événement en jeu, message à la
   communauté) : écrire `version: none`.
1. Demander l'annonce. Le texte complet de ce fichier est renvoyé prêt à coller
   (il repart de `covers-until` pour lister les commits parus depuis).
2. Coller ce fichier en entier, puis committer SEUL (aucun autre fichier).
   Le commit déclenche la publication sur Discord.
3. Pour republier sans nouveau commit : onglet Actions -> Discord Announce -> Run workflow.
   (Cocher « Aperçu seul » pour vérifier le rendu sans rien envoyer. En aperçu,
   les contrôles du point 0 avertissent au lieu de bloquer.)

Les commentaires HTML ne sont jamais publiés : tant que les deux sections
ci-dessous restent vides, aucun message n'est envoyé.

TOUJOURS inclure le lien direct des pages concernées par l'annonce
(https://kingshottoolbox.com/<page>) — le lecteur doit pouvoir ouvrir la
nouveauté sans avoir à la chercher.

Clés de l'en-tête :
  version    OBLIGATOIRE — version annoncée (ex. 1.9), qui doit exister dans
             data/changelog.json ; ou `none` si l'annonce ne touche pas au site
  ping       mention ajoutée au message (ex. @here ou <@&123456789012345678>)
  ping-fr    mention réservée au message français
  ping-en    mention réservée au message anglais
  color      couleur de l'embed en hexa (défaut F5B840, l'or de la charte)
  title-fr   titre de l'embed français
  title-en   titre de l'embed anglais

Mentionner un rôle : une mention ne notifie QUE sous la forme <@&IDENTIFIANT>.
Écrite en clair (@MonRole), elle s'affiche mais ne prévient personne.
Relever l'identifiant : Discord -> Paramètres du serveur -> Rôles -> clic droit
sur le rôle -> « Copier l'identifiant » (mode développeur activé).

Un ping par langue force l'envoi en DEUX messages (français puis anglais) :
la mention vit dans le message, pas dans l'embed, donc un message unique ne
peut pinguer qu'un seul rôle. Avec la clé `ping` seule, tout tient en un seul
message tant que les deux textes cumulés restent sous 5 200 caractères.
-->

## FR

### 🧭 Sais-tu ce que valent tes Amulettes ?

Le Magasin du Théâtre est la seule boutique dont on ne peut pas acheter la monnaie directement : les packs versent des Amulettes Fantaisie, et ce sont les étages atteints dans le tirage du Théâtre qui donnent les Jetons Fantaisie affichés dans la boutique. Une nouvelle section, sous le détail des gains de la page, comble ce chaînon manquant.

Elle lit ton plan d'achat déjà coché au-dessus et affiche combien d'amulettes tu devrais avoir **en poche aujourd'hui** — le seul chiffre comparable au jeu —, les chances exactes d'atteindre chaque étage, et l'étage où encaisser rapporte le plus de jetons par amulette.

Le plus utile au quotidien : un conseil **pousser ou encaisser**, calculé pour l'étage et le compteur d'échecs où tu es, avec le budget exact où ce conseil bascule — la réponse dépend de ton état, pas d'une règle unique. Trois boutons (« échouer », « monter », « encaisser ») reportent d'un clic ce qui vient de se passer en jeu, et le bouton « Comment ça marche ? » de la page détaille tout le reste.

👉 https://kingshottoolbox.com/fr/shop/theater-shop
👉 https://kingshottoolbox.com/shop/theater-shop (en anglais)

## EN

### 🧭 Do you know what your Amulets are worth?

The Theater Shop is the only shop whose currency you cannot buy directly: packs pay Fantasy Amulets, and it's the floors you reach in the Theater's draw that hand out the Fantasy Tokens the shop is priced in. A new section under the reward breakdown fills that missing link.

It reads the purchase plan you've already ticked above and shows how many amulets you should be holding **today** — the only figure that should match the game —, the exact odds of reaching each floor, and which floor pays the most tokens per amulet to cash in on.

The most useful part day to day: a **push or cash in** verdict, worked out for the floor and failed-push counter you're actually on, with the exact budget where that advice flips — the answer depends on your state, not a single rule. Three buttons ("failed", "went up", "cashed in") report what just happened in game with one click, and the page's "How does it work?" button walks through the rest.

👉 https://kingshottoolbox.com/shop/theater-shop
