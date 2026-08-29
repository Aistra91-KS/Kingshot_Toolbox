<!-- kshub-news
version: 2.12
covers-until: 0739845889b5a0a2ddca088dc4a4d7b6469dc130
generated: 2026-08-29
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: ❄️ Nouvelle boutique : le Magasin du Blizzard
title-en: ❄️ New shop: the Blizzard Shop
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

### ❄️ Le Magasin du Blizzard est dans l'outil

Ses 7 objets, leur prix en Emblèmes de Duel et le stock restant sur chacun sont en ligne, avec le compte à rebours jusqu'à la fermeture — le **31 août à 00h UTC**.

Le classement se lit vite : six lignes sur sept rendent **exactement la même valeur** par emblème. La septième, les 100 Points d'EXP d'Amélioration, en rend deux fois moins : c'est la seule à laisser de côté.

👉 https://kingshottoolbox.com/shop/blizzard-shop.html

## EN

### ❄️ The Blizzard Shop is in the toolbox

Its 7 items, their price in Brawl Emblems and the stock left on each one are up, along with the countdown to closing time — **31 August, 00:00 UTC**.

The ranking reads fast: six of the seven lines give back **exactly the same value** per emblem. The seventh, the 100 Enhancement XP Component, gives half as much, so it is the one to leave alone.

👉 https://kingshottoolbox.com/shop/blizzard-shop.html
