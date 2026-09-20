<!-- kshub-news
version: 1.14.1
covers-until: 96883feac29d6ad8feac752c4a9fec5e70f134b4
generated: 2026-09-20
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🌙 Le Magasin du Clair de Lune
title-en: 🌙 The Moonlight Shop
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
   communauté) : écrire `version: 1.13.4`.
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
  image      URL https:// d'une image posée en bas de l'embed (facultatif)
  image-fr   image réservée au message français (une capture porte du texte)
  image-en   image réservée au message anglais

L'image doit être joignable par Discord AU MOMENT DE L'ENVOI. Ne pas la servir
depuis kingshottoolbox.com : la fusion déclenche l'annonce ET le déploiement en
même temps, et un 404 attrapé au vol reste en cache — l'image resterait cassée.
La servir depuis raw.githubusercontent.com/<owner>/<repo>/main/... (disponible
dès le push) ; les fichiers vivent dans .github/news/img/.

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

### 🌙 Le Magasin du Clair de Lune

La boutique de l'événement Moonlit Celebration a sa page. Quinze lignes payées en Gâteaux de Lune, chacune chiffrée dans les deux sens : sa valeur en gemmes et son prix en argent réel.

En tête des deux lectures, la **Caisse d'Équipement de Héros Chanceux à 18 gâteaux**, dont la réserve se recharge tous les jours : 30 par jour, 240 d'ici la fin de l'événement. Derrière elle, le **Mithril à 750 gâteaux** tient le second rang. Tout en bas du tableau, l'Or Véritable à 11 gâteaux est la ligne qui rapporte le moins.

Au milieu du classement, l'ordre dépend de ce que tu comptes : les Marteaux de Forge passent devant les Plans et Guides de Talisman en gemmes, derrière eux en argent réel. La page bascule d'une lecture à l'autre d'un clic.

Les trois cosmétiques restent hors classement, faute de valeur de référence : le skin de ville Pavillon de Lune à 45 000 gâteaux, la Plaque Lapin Lunaire à 1 500 et l'emote Pat Pat à 500.

La boutique ferme le 28 septembre, le compte à rebours est en haut de la page.

👉 https://kingshottoolbox.com/shop/moonlight-shop
👉 https://kingshottoolbox.com/shop_calc

## EN

### 🌙 The Moonlight Shop

The store of the Moonlit Celebration event has its page. Fifteen lines paid in Mooncakes, each one priced both ways: its value in gems and its price in real money.

Both readings put the **Lucky Hero Gear Chest at 18 mooncakes** first, and its stock refills every day: 30 a day, 240 before the event closes. Behind it, **Mithril at 750 mooncakes** holds second place. At the bottom of the table, TrueGold at 11 mooncakes is the line that returns the least.

In the middle of the ranking the order depends on what you are counting: Forgehammers sit above Charm Designs and Charm Guides in gems, and below them in real money. The page switches from one reading to the other in one click.

The three cosmetics stay out of the ranking, having no reference value: the Moon Pavillon town skin at 45,000 mooncakes, the Lunar Rabbit nameplate at 1,500 and the Pat Pat emote at 500.

The shop closes on 28 September, and the countdown sits at the top of the page.

👉 https://kingshottoolbox.com/shop/moonlight-shop
👉 https://kingshottoolbox.com/shop_calc
