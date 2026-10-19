<!-- kshub-news
version: 1.15.6
covers-until: f5725f87dca017a10561bd104745a73759e7b45c
generated: 2026-10-19
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: Mise à jour de Kingshot du 19/10
title-en: Kingshot update of 19 October
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

### Les valeurs en argent réel suivent

La mise à jour de lundi a changé plusieurs packs, et le relevé a été refait :

- La Carte Hebdo Accélérer donne 11 340 minutes au lieu de 7 140 pour 6 € : chaque accélérateur général coûte environ 37 % de moins.
- La Carte Hebdo d'Or Véritable donne 207 Or Véritable au lieu de 144.
- La Carte Mensuelle Ultra passe à 17 000 gemmes au lieu de 14 000 : la gemme, la Clé en Or et les lots d'EXP VIP baissent.
- Nouveau pack relevé, l'Offre quotidienne Fragment universel : c'est maintenant la source la moins chère de fragments universels de héros mythique.
- Les caisses à choisir des cartes hebdo comptent pour leur contenu. La Carte hebdo Équipement devient la moins chère pour l'EXP d'Amélioration, les Caisses d'Équipement de Héros Chanceux et les Marteaux de Forge.

Les boutiques chiffrées en argent réel suivent ces nouveaux prix.

👉 https://kingshottoolbox.com/shop/items-euro

### Wilson : Prime Viking

Un coffre tous les 100 000 points au lieu de 200 000, et deux fois plus de coffres à chaque niveau (de 2 à 20). La puissance de la compétence, affichée à 0, suit maintenant le tableau du jeu.

👉 https://kingshottoolbox.com/database/masters/wilson

## EN

### Real-money values follow

Monday's update changed several packs, and the survey was done again:

- The Speedup Weekly Card gives 11,340 minutes instead of 7,140 for $5: every general speedup costs about 37% less.
- The Truegold Weekly Card gives 207 TrueGold instead of 144.
- The Ultra Value Monthly Card goes up to 17,000 gems from 14,000: gems, the Gold Key and the VIP XP bundles get cheaper.
- New pack in the survey, Daily Deals - General Shard: it is now the cheapest source of universal mythic hero shards.
- The pick-one crates of the weekly cards count for what they hold. The Gear Weekly Card becomes the cheapest source of Enhancement XP, Lucky Hero Gear Chests and Forgehammers.

Shops valued in real money follow these new prices.

👉 https://kingshottoolbox.com/shop/items-euro

### Wilson: Viking Bounty

One chest every 100,000 points instead of 200,000, and twice as many chests at every level (2 to 20). The skill's power, shown as 0 until now, follows the in-game table.

👉 https://kingshottoolbox.com/database/masters/wilson
