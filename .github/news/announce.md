<!-- kshub-news
version: 1.15.0
covers-until: c7c92c72070cc2c6aeb6c390cfcd300c9bf39ac7
generated: 2026-09-28
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: La base de données Héros et les recherches avancées de l'Académie de Guerre
title-en: The Heroes database and the advanced War Academy research
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

### Les héros ont leur base de données

Les 37 héros ont maintenant leur fiche, disposée comme l'écran du jeu : les compétences de conquête à gauche, le portrait au centre, les compétences d'expédition à droite. Un sélecteur de 1 à 5 réécrit toutes les valeurs de la page d'un clic, et un tableau en dessous donne les cinq niveaux côte à côte. Le widget du héros suit quand il en a un.

Le sommaire est rangé par génération, la 8 en tête. En bas de chaque fiche, les autres héros sont regroupés : même type de troupe, même génération, puis le reste.
👉 https://kingshottoolbox.com/database/heroes/

Les noms et textes français des compétences suivent maintenant le jeu pour la plupart des héros, et Ma Caserne en profite aussi.
👉 https://kingshottoolbox.com/caserne

### L'Académie de Guerre passe aux recherches avancées

La page gagne deux onglets. **Recherches avancées** planifie les 92 recherches qui s'ouvrent de TG5 à TG8, disposées comme en jeu avec leurs icônes et les branches qui les relient. **Suggestion globale** les mélange aux trois arbres de troupes quand c'est plus rentable, en partageant poussière, Or Véritable trempé, pièces et accélérateurs. En mode KvK, elle ne fait jamais moins bien que l'un ou l'autre onglet pris seul.

L'Or Véritable trempé devient un stock à part, à 30 000 points KvK l'unité. Et le creuset arrive, comme sur le Planificateur de Bâtiments : indique tes transformations déjà faites (100 au total), et le plan peut changer du TrueGold en Or Véritable trempé, 20 TrueGold pour environ 1,45 au début, jusqu'à 160 pour environ 3,71 sur les dernières. Le même TrueGold paie aussi les échanges de poussière, et le plan choisit le partage qui rapporte le plus.
👉 https://kingshottoolbox.com/waracademy

### Du confort sur tout le site

Les pages ne sautent plus quand leurs données arrivent. Sur téléphone, 57 pages bougeaient nettement ; il n'en reste qu'une, l'outil Familiers, dont la refonte est prévue. Sur ordinateur, les tableaux de recherches de l'Académie et de l'Académie de Guerre tiennent dans l'écran sans barre de défilement horizontale.
👉 https://kingshottoolbox.com/database/research/
👉 https://kingshottoolbox.com/database/waracademy/

En thème clair, le texte doré passe à un or plus foncé, plus facile à lire, et les menus s'utilisent maintenant au clavier. Sur téléphone, le champ de monnaie des boutiques d'événement ne décale plus la page sur le côté et ne déclenche plus le zoom sur iPhone.
👉 https://kingshottoolbox.com/event-roi

Deux corrections pour finir. Quinze niveaux du Centre-ville et de la Base de commandement affichaient leurs prérequis avec une double virgule. Et quand la mise à jour des chiffres échoue en cours de route, chaque outil le signale désormais, là où il laissait des chiffres périmés à l'écran sans rien dire.
👉 https://kingshottoolbox.com/database/buildings/town-center

## EN

### The heroes have their database

All 37 heroes now have a page, laid out like the game's own screen: conquest skills on the left, the portrait in the middle, expedition skills on the right. A 1 to 5 selector rewrites every value on the page in one click, and a table underneath gives the five levels side by side. The hero's widget follows when there is one.

The index is sorted by generation, generation 8 first. At the bottom of each page the other heroes are grouped: same troop type, same generation, then the rest.
👉 https://kingshottoolbox.com/database/heroes/

The French skill names and texts now follow the game for most heroes, and My Barracks picks them up too.
👉 https://kingshottoolbox.com/caserne

### The War Academy takes on the advanced research

The page gains two tabs. **Advanced research** plans the 92 researches that open from TG5 to TG8, laid out as in the game with their icons and the branches between them. **Global suggestion** mixes them with the three troop trees when that earns more, sharing dust, Tempered TrueGold, coins and speedups. In KvK mode it never does worse than either tab on its own.

Tempered TrueGold becomes a stock of its own, worth 30,000 KvK points each. And the crucible arrives, as on the Building Planner: enter the transformations you have already made (100 in all), and the plan can turn TrueGold into Tempered TrueGold, 20 TrueGold for about 1.45 at first, up to 160 for about 3.71 on the last ones. The same TrueGold also pays for the dust exchanges, and the plan picks the split that earns the most.
👉 https://kingshottoolbox.com/waracademy

### Smoother across the site

Pages no longer jump when their data arrives. On phones, 57 pages moved noticeably; one is left, the Pets tool, which is due for a redesign. On computers, the Academy and War Academy research tables fit the screen without a sideways scrollbar.
👉 https://kingshottoolbox.com/database/research/
👉 https://kingshottoolbox.com/database/waracademy/

In the light theme, gold text takes a darker gold that is easier to read, and the menus now work from the keyboard. On a phone, the currency field of event shops no longer pushes the page sideways or sets off the zoom on iPhone.
👉 https://kingshottoolbox.com/event-roi

Two fixes to close. Fifteen Town Center and Command Center levels listed their requirements with a double comma. And when a refresh of the figures fails halfway, every tool now says so, where it used to leave outdated numbers on screen without a word.
👉 https://kingshottoolbox.com/database/buildings/town-center
