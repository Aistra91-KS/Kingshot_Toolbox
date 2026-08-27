<!-- kshub-news
version: 2.1
covers-until: 86664619013dbe3e21c0fcec1ce5206c35b42a05
generated: 2026-08-27
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 💶 Ce que les boutiques coûtent vraiment
title-en: 💶 What the shops really cost
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

### 💶 Une seconde lecture des boutiques : en argent réel

Jusqu'ici, chaque objet de boutique était comparé à sa valeur en gemmes. C'est utile, mais ça ne dit pas ce qu'un objet coûte **vraiment**.

Deux pastilles en haut de chaque page boutique font désormais basculer entre les deux lectures :

**💎 Gemmes** — la lecture habituelle.
**€ Euros** — ce que l'objet coûte réellement, calculé depuis le pack payant où il apparaît : prix du pack ÷ quantité obtenue.

Les deux lectures sont **indépendantes**. Aucun taux de change n'est calculé entre gemmes et euros : ce sont deux façons de regarder la même boutique, jamais mises en rapport. Les prix s'affichent en euros ou en dollars, au choix, et ta préférence te suit d'une boutique à l'autre.

Tous les objets ne peuvent pas être chiffrés. Ceux qu'aucun pack ne vend affichent « — » et **sortent du classement** — ils ne sont pas comptés à zéro, ce qui les ferait passer pour la pire affaire de la boutique. Ils restent achetables, ils ne créditent simplement aucune valeur, et la tuile de bilan annonce combien de tes objets ont un prix connu.

👉 https://kingshottoolbox.com/shop_calc.html

### 📋 Prix réel des objets

Une nouvelle page liste le prix en argent réel de chaque objet qu'un pack permet de chiffrer, avec **le pack d'où vient le chiffre**. Un prix te paraît faux ? Tu peux remonter à sa source.

👉 https://kingshottoolbox.com/shop/items-euro.html

### 🐉 Nouvelle boutique : le Magasin de Pronostique du Tyran

Neuf objets, payés en Marques Draconiques, jusqu'au **2 septembre à 00h UTC**. Six des neuf sont exactement au même tarif : les deux exceptions sont donc là où tes marques rapportent vraiment le plus.

👉 https://kingshottoolbox.com/shop/flamedragon-tyrant-prediction.html

Au passage : le podium des meilleures affaires n'affiche plus deux fois le même objet quand une boutique le propose sur plusieurs lignes, et le bonus du planificateur de Recherches se saisit maintenant en pourcentage, comme sur les autres planificateurs.

## EN

### 💶 A second way to read the shops: real money

Until now, every shop item was compared to its value in gems. That helps, but it does not tell you what an item **really** costs.

Two pills at the top of every shop page now switch between the two readings:

**💎 Gems** — the usual reading.
**€ Euros** — what the item really costs, worked out from the paid pack it appears in: the pack's price divided by how many you get.

The two readings are **independent**. No exchange rate is ever worked out between gems and euros: they are two ways of looking at the same shop, never set against each other. Prices show in euros or dollars, as you prefer, and your choice follows you from shop to shop.

Not every item can be priced. The ones no pack sells show a dash and are **left out of the ranking** — never counted as zero, which would wrongly make them look like the worst deal in the shop. They can still be bought; they simply add no value, and the summary tile tells you how many of your items have a known price.

👉 https://kingshottoolbox.com/shop_calc.html

### 📋 Real-money item values

A new page lists the real-money price of every item a pack can put a price on, along with **the pack each figure comes from**. A price looks wrong? You can trace it back to its source.

👉 https://kingshottoolbox.com/shop/items-euro.html

### 🐉 New shop: the Flamedragon Tyrant Prediction Shop

Nine items, paid in Dragonclaw Marks, until **2 September, 00:00 UTC**. Six of the nine are priced at exactly the same rate, so the two that are not are where your marks actually go furthest.

👉 https://kingshottoolbox.com/shop/flamedragon-tyrant-prediction.html

Also in this update: the best-deals podium no longer shows the same item twice when a shop lists it on several lines, and the Research planner's bonus is now typed as a percentage, like the other planners.
