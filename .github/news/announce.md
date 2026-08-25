<!-- kshub-news
version: 2.0
covers-until: 6fb3ad73acc71724108d870239015b4439c20332
generated: 2026-08-25
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🐉 Deux nouvelles boutiques d'événement
title-en: 🐉 Two new event shops
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

### 🐉 La Caravane du Dragon et le Stand d'Aventure

Les deux boutiques d'événement du moment ont maintenant leur page dans la boîte à outils.

Le principe ne change pas : chaque objet est mis face à sa valeur en gemmes, pour voir d'un coup d'œil ce qui mérite vraiment ta monnaie.

**Caravane du Dragon** — 20 objets, payés en Essence Draconique, jusqu'au **31 août à 00h UTC**
👉 https://kingshottoolbox.com/shop/dragons-caravan.html

**Stand d'Aventure** — 21 objets, payés en Pièces d'Aventure, jusqu'au **30 août à 00h UTC**
👉 https://kingshottoolbox.com/shop/adventure-stall.html

Sur chaque page :

**Les 3 meilleures affaires** sont mises en avant tout en haut, avant même le tableau.

**Un panier** : tu entres ta monnaie, tu coches les lots que tu comptes prendre, et le restant se recalcule ligne par ligne. Pas de remplissage automatique — c'est toi qui choisis.

**Le stock restant** est suivi jusqu'à la fin de l'événement. Pour les trois offres du Stand d'Aventure qui se rechargent chaque jour à 00h UTC (Or Véritable, fragments mythiques, marteaux de forge), la colonne compte toutes les recharges qu'il te reste, pas seulement celle du jour.

**Un crayon** pour ajuster quantités, coûts et stock si ta boutique en jeu ne colle pas tout à fait. Tes corrections restent sur ton appareil.

Toutes les boutiques du jeu sont regroupées ici :
👉 https://kingshottoolbox.com/shop_calc.html

## EN

### 🐉 Dragon's Caravan and Adventure Stall

The two event shops running right now have their own page in the toolbox.

Same idea as always: every item is set against its value in gems, so you can see at a glance what actually deserves your currency.

**Dragon's Caravan** — 20 items, paid in Dragon Essence, until **31 August, 00:00 UTC**
👉 https://kingshottoolbox.com/shop/dragons-caravan.html

**Adventure Stall** — 21 items, paid in Adventure Coins, until **30 August, 00:00 UTC**
👉 https://kingshottoolbox.com/shop/adventure-stall.html

On each page:

**The three best deals** are called out at the top, before the table even starts.

**A cart**: enter your currency, tick the lots you plan to buy, and the balance updates line by line. No auto-fill — you do the picking.

**Remaining stock** is tracked to the end of the event. For the three Adventure Stall offers that refill every day at 00:00 UTC (TrueGold, Mythic hero shards, Forgehammers), the column counts every refill you have left, not just today's.

**A pencil button** to adjust quantities, costs and stock if your in-game shop doesn't quite match. Your corrections stay on your device.

Every shop in the game is gathered here:
👉 https://kingshottoolbox.com/shop_calc.html
