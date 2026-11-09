<!-- kshub-news
version: 1.16.0
covers-until: dac7861615887b8504e2fecdb0e3dcdc8a6c95a3
generated: 2026-11-09
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: Le Planificateur de l'île et deux nouveaux Experts
title-en: The Island Planner and two new Masters
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

### Nouveau : le Planificateur de l'île (bêta)

Indique les niveaux de ta Fontaine Vitale, de tes Réservoirs et de tes bâtiments, et l'outil te dit quoi faire ensuite : monter la Fontaine dès que sa prospérité est atteinte, puis les Réservoirs, puis les bâtiments qui apportent la prospérité manquante pour le moins d'Essence d'Eau. Chaque étape donne son coût et le temps que met ta production à la payer, et le bouton coché met ton île à jour une fois l'étape faite en jeu. Les 76 bâtiments ont leur nom et leur image du jeu, en français comme en anglais.

👉 https://kingshottoolbox.com/island_calc

### Deux nouveaux Experts : Olander et Catherine

Ils ont leur fiche dans la base de données, avec paliers d'affinité, expertise passive et chaque compétence niveau par niveau, et ils apparaissent dans l'outil Experts. Leurs textes français sont ceux du jeu. Au passage, la colonne du coût en EXP donne maintenant le coût de chaque niveau pour Valora, Pan, Roman et Cassia (elle affichait un cumul), et l'affinité de Guinevere et Wilson est remplie.

👉 https://kingshottoolbox.com/database/masters/olander
👉 https://kingshottoolbox.com/database/masters/catherine
👉 https://kingshottoolbox.com/masters

### Traductions et corrections

Les 18 compétences de Diego, Liz et Luna reprennent le texte français du jeu, et 13 d'entre elles prennent leur nom du jeu. Aucun chiffre ne change.

👉 https://kingshottoolbox.com/database/heroes/diego
👉 https://kingshottoolbox.com/database/heroes/liz
👉 https://kingshottoolbox.com/database/heroes/luna

Santé de Fer de Diana réduit le coût en endurance de 10 à 20 %, et Noble Voie de Hilde donne 3 à 15 % d'Attaque et 2 à 10 % de Défense (les deux étaient inversées).

👉 https://kingshottoolbox.com/database/heroes/diana
👉 https://kingshottoolbox.com/database/heroes/hilde

Le pack quotidien à 20 $ du Magasin du Clair de Lune et de la Boutique d'Aventure coûte 23,99 €, pas 24,99 €. À l'Arène, le Fragment Universel de Héros Rare coûte 250 jetons, pas 150.

👉 https://kingshottoolbox.com/shop/moonlight-shop
👉 https://kingshottoolbox.com/shop/adventure-shop
👉 https://kingshottoolbox.com/shop/arena

## EN

### New: the Island Planner (beta)

Enter the levels of your Fountain of Life, your Reservoirs and your buildings, and the tool tells you what to do next: raise the Fountain as soon as its prosperity is reached, then the Reservoirs, then the buildings that bring the missing prosperity for the least Water Essence. Each step gives its cost and how long your production takes to pay for it, and the tick button updates your island once the step is done in game. The 76 buildings have their in-game name and picture, in English and in French.

👉 https://kingshottoolbox.com/island_calc

### Two new Masters: Olander and Catherine

They have their database page, with affinity milestones, passive expertise and every skill level by level, and they appear in the Masters tool. On the way, the EXP cost column now gives the cost of each level for Valora, Pan, Roman and Cassia (it showed a running total), and the affinity of Guinevere and Wilson is filled in.

👉 https://kingshottoolbox.com/database/masters/olander
👉 https://kingshottoolbox.com/database/masters/catherine
👉 https://kingshottoolbox.com/masters

### Translations and fixes

The 18 skills of Diego, Liz and Luna now use the French wording of the game, and 13 of them take their in-game French name. No number changes.

👉 https://kingshottoolbox.com/database/heroes/diego
👉 https://kingshottoolbox.com/database/heroes/liz
👉 https://kingshottoolbox.com/database/heroes/luna

Diana's Iron Constitution reduces stamina cost by 10 to 20%, and Hilde's Noble Path gives 3 to 15% Attack and 2 to 10% Defense (the two were swapped).

👉 https://kingshottoolbox.com/database/heroes/diana
👉 https://kingshottoolbox.com/database/heroes/hilde

The $20 daily pack of the Moonlight Shop and the Adventure Shop costs €23.99, not €24.99. In the Arena, the Rare General Hero Shard costs 250 tokens, not 150.

👉 https://kingshottoolbox.com/shop/moonlight-shop
👉 https://kingshottoolbox.com/shop/adventure-shop
👉 https://kingshottoolbox.com/shop/arena
