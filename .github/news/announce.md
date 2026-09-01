<!-- kshub-news
version: 1.13
covers-until: 215d33cb0fcf134e96716e893b2eaefdb536af84
generated: 2026-09-01
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🎭 Le Magasin du Théâtre, palier par palier
title-en: 🎭 The Theater Shop, tier by tier
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

### 🎭 Le Magasin du Théâtre, palier par palier

La boutique de l'événement Théâtre Fantastique a sa page, et elle ne ressemble pas aux autres : **le même objet y est vendu trois fois, à trois prix croissants**. En jeu, seule la couleur de la carte te le dit. Sur la page, chaque ligne porte son **palier** — or, violet, bleu — et le tableau continue de tout classer par rentabilité.

C'est ce classement qui rend l'échelle lisible. Exemple : le **Mithril du palier 2** (×100) reste un meilleur achat que l'**Or Véritable du palier 1** (×90). Autrement dit, creuser un palier cher sur un bon objet peut rapporter plus que rester au palier 1 d'un objet moyen.

Les 28 lignes y sont, avec leur coût en Jetons Fantaisie, leur stock et leur valeur — en gemmes **et** en euros, les deux lectures sont complètes. Coche ce que tu comptes prendre, le solde et la valeur obtenue se recalculent tout seuls.

Petit essai au passage : cette page a **sa propre adresse française**. Si ça donne quelque chose, j'étendrai aux autres.

👉 https://kingshottoolbox.com/fr/shop/theater-shop
👉 https://kingshottoolbox.com/shop/theater-shop (en anglais)

## EN

### 🎭 The Theater Shop, tier by tier

The store of the Fantasy Theater event has its page, and this one is unlike the others: **the same item is sold three times, at three rising prices**. In game only the colour of the card tells you which is which. On the page every line carries its **tier** — gold, purple, blue — and the table still ranks everything by value.

That ranking is what makes the ladder readable. For example: **Mithril at tier 2** (×100) is still a better buy than **TrueGold at tier 1** (×90). Digging into an expensive tier on a good item can beat staying at tier 1 on an average one.

All 28 lines are there, with their Fantasy Token cost, their stock and their value — in gems **and** in euros, both readings are complete. Tick what you plan to buy and the balance and the value you get update as you go.

👉 https://kingshottoolbox.com/shop/theater-shop
