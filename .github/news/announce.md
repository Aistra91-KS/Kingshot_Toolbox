<!-- kshub-news
version: 1.14.2
covers-until: 35c67f13e24f59dbd8f947e40aeb0c61d1ef13dc
generated: 2026-09-22
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🔬 Les Recherches, six bâtiments et trois pages Boutique
title-en: 🔬 Academy research, six buildings and three shop pages
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

### 🔬 Les recherches de l'Académie ont leur base de données

Les 720 recherches de l'Académie se consultent maintenant palier par palier, sur les trois arbres Croissance, Économie et Combat : coût en pain, bois, pierre, fer et or, temps de recherche, puissance gagnée, niveau d'Académie exigé et bonus obtenu.
👉 https://kingshottoolbox.com/database/research/

Six bâtiments rejoignent la base Bâtiments : l'Entrepôt, le Moulin, la Scierie, la Carrière, la Mine de Fer et le Poste de Garde. Ils s'arrêtent avant l'Or Véritable, leur tableau donne donc les ressources, le temps de construction et la puissance de chaque niveau, sans colonne Or Véritable.
👉 https://kingshottoolbox.com/database/buildings/

Dans la foulée, la page TrueGold devient le **Planificateur de Bâtiments**. Elle ne couvre plus seulement les niveaux Or Véritable : un second onglet planifie tout ce qui vient avant, là où le mur est la ressource et le temps de construction.
👉 https://kingshottoolbox.com/truegold_calc

Les boutiques tiennent maintenant sur trois pages plutôt qu'une. Valeur Boutique garde les boutiques permanentes et les coffres personnalisés. Les boutiques d'événement déménagent sur Rentabilité des Événements, à côté de ce qu'un événement te rend face à ce qu'il t'a coûté. Et les deux référentiels, en gemmes et en argent réel, ont leur porte d'entrée.
👉 https://kingshottoolbox.com/shop_calc
👉 https://kingshottoolbox.com/event-roi
👉 https://kingshottoolbox.com/item-values

Côté Clair de Lune, **Désirs du Cœur** et **Grands Desseins** entrent dans le calcul de rentabilité, avec leur fermeture au J7 et le second qui ne s'ouvre qu'une fois le premier acheté. Et si l'événement a commencé sans toi, la colonne « Déjà pris » prend ce que tu as ramassé jusque-là : le stock restant baisse d'autant, et le rendement le compte.
👉 https://kingshottoolbox.com/shop/moonlight-shop

Deux corrections pour finir. Les en-têtes des tableaux de base de données restaient à gauche pendant que leurs chiffres partaient à droite ; ils sont alignés. Et la Clé en Or s'affichait à 6,00 €, le prix du coffre entier dont elle sortait, là où ses 1 500 gemmes la placent à 1,29 €. L'EXP VIP suit la même règle, 1 EXP VIP valant 2 gemmes.
👉 https://kingshottoolbox.com/shop/items-euro

## EN

### 🔬 The Academy researches have their database

The 720 Academy researches can now be read level by level, across the three Growth, Economy and Battle trees: bread, wood, stone, iron and gold cost, research time, power gained, the Academy level required and the bonus obtained.
👉 https://kingshottoolbox.com/database/research/

Six buildings join the buildings database: Storehouse, Mill, Sawmill, Quarry, Iron Mine and Guard Station. They stop before TrueGold, so their table gives the resources, the build time and the power of every level, with no TrueGold column.
👉 https://kingshottoolbox.com/database/buildings/

The TrueGold page follows, and becomes the **Building Planner**. It no longer covers the TrueGold levels alone: a second tab plans everything that comes before, where the wall is resources and build time.
👉 https://kingshottoolbox.com/truegold_calc

The shops now sit on three pages instead of one. Shop Value keeps the permanent shops and the custom chests. The event shops move to Event ROI, next to what an event hands you back against what it cost you. And the two reference tables, in gems and in real money, have a front door of their own.
👉 https://kingshottoolbox.com/shop_calc
👉 https://kingshottoolbox.com/event-roi
👉 https://kingshottoolbox.com/item-values

On the Moonlight side, **Heartfelt Desires** and **Grand Visions** join the return calculation, with their day 7 close and the second one locked until the first is bought. And if the event started without you, the "Already taken" column takes what you have picked up so far: the stock left drops by that much, and the return counts it.
👉 https://kingshottoolbox.com/shop/moonlight-shop

Two fixes to close. Database table headers sat on the left while their figures went to the right; they line up. And the Gold Key showed at 6.00 EUR, the price of the whole chest it came in, where its 1,500 gems put it at 1.29 EUR. VIP EXP follows the same rule, 1 VIP EXP being worth 2 gems.
👉 https://kingshottoolbox.com/shop/items-euro
