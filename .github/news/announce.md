<!-- kshub-news
version: 1.13.5
covers-until: 9d39424b95eaf9e9c103195c06845b98dbfa505d
generated: 2026-09-09
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🐾 Le plan d'avancement des familiers
title-en: 🐾 The pet advancement planner
image-fr: https://raw.githubusercontent.com/Aistra91-KS/Kingshot_Toolbox/main/.github/news/img/1.13.5-pets-plan-fr.webp
image-en: https://raw.githubusercontent.com/Aistra91-KS/Kingshot_Toolbox/main/.github/news/img/1.13.5-pets-plan-en.webp
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

### 🐾 Un plan d'avancement pour tes familiers

La page Familiers gagne un **second onglet**. Tu dis ce que tu as en stock — nourriture, manuels de croissance, potions nutritives, médaillons de promotion et coffres d'avancement — et l'outil cherche **quels familiers avancer, dans quel ordre**, et combien de points ça rapporte à l'**Entraînement Animalier**.

Seuls les **avancements** rapportent : la nourriture n'est qu'un péage pour atteindre le cap suivant. Et le coffre est un **choix, pas un lot** — 7 manuels **ou** 2 potions **ou** 1 médaillon. C'est là qu'est tout l'arbitrage, alors l'outil tranche la répartition à ta place et te dit combien en ouvrir en quoi.

Deux choses qui font gagner du temps. **Décoche les familiers que tu n'as pas débloqués** : ils quittent d'un coup le plan, le classement et la ligne « ce qui t'arrête ». Et une fois le plan réalisé en jeu, le bouton **Appliquer les modifications** fait monter tes familiers, coche leurs avancements et met ton stock à jour — les matériaux qu'un coffre a versés en trop compris.

Le plan part des niveaux que tu as déjà saisis dans la promenade. Quand l'outil a eu le temps de vérifier qu'**aucun autre plan ne fait mieux** avec ton stock, il te le dit ; quand il n'a pas pu, il le dit aussi plutôt que de te promettre un maximum qu'il ne tient pas.

👉 https://kingshottoolbox.com/pets

## EN

### 🐾 An advancement plan for your pets

The Pets page gets a **second tab**. Tell it what you have in stock — pet food, growth manuals, nutrient potions, promotion medallions and advancement chests — and it works out **which pets to advance, and in what order**, and how many points that scores in **Beast Training**.

Only **advancements** score: pet food is just the toll to reach the next cap. And the chest is a **choice, not a bundle** — 7 manuals **or** 2 potions **or** 1 medallion. That is where the whole trade-off lives, so the tool decides the split for you and tells you how many to open as what.

Two things that save time. **Untick the pets you have not unlocked** and they leave the plan, the ranking and the "what stops you" line at once. And once you have carried the plan out in game, the **Apply these changes** button moves your pets up, ticks their advancements and updates your stock — including the spare materials a chest handed over.

The plan starts from the levels you already entered on the trail. When the tool has had time to check that **no other plan does better** with your stock, it says so; when it has not, it says that too, rather than promising a maximum it cannot back up.

👉 https://kingshottoolbox.com/pets
