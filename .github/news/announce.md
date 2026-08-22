<!-- kshub-news
version: 1.10
covers-until: a3e4b3432623883bd827aa71ca073249a7d9f5bc
generated: 2026-08-22
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: ⚡ Fini de cocher les recherches une par une
title-en: ⚡ No more ticking researches one by one
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
(https://aistra91-ks.github.io/Kingshot_Toolbox/<page>) — le lecteur doit
pouvoir ouvrir la nouveauté sans avoir à la chercher.

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

### ⚡ La Sélection rapide : dis à l'outil où tu en es en quelques clics

La première visite sur la page **Recherches** demandait de cocher des centaines de cases une par une, niveau par niveau, pour indiquer où tu en étais. C'est terminé.

Sur les onglets d'arbre (Expansion, Économie, Combat), le panneau de gauche propose désormais **« Sélection rapide »**. Une fois l'option activée, il te suffit de cocher **le niveau le plus haut que tu as atteint** dans une recherche : tout ce qu'elle exige se coche avec elle — les niveaux inférieurs et toutes les recherches nécessaires, en remontant l'arbre jusqu'à sa racine. Sur l'arbre Combat, la recherche la plus profonde coche ainsi **102 prérequis d'un seul clic**.

Le geste fonctionne aussi dans l'autre sens : **décocher** une recherche retire tout ce qui en dépend. De quoi corriger une erreur sans repasser derrière — « en fait je suis au niveau 4, pas au niveau 8 » se règle en un clic.

À chaque fois, un petit message t'indique combien de cases ont été mises à jour automatiquement. L'option est désactivée par défaut — rien ne change si tu n'en veux pas — et elle se souvient de ton choix d'une visite à l'autre.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/research_calc.html

## EN

### ⚡ Quick Select: tell the toolbox where you stand in a few clicks

Setting up the **Research** page for the first time meant ticking hundreds of boxes one by one, level by level, just to say how far you had got. Not any more.

On the tree tabs (Growth, Economy, Battle), the side panel now offers **“Quick Select”**. Once the option is on, just tick **the highest level you have reached** in a research: everything it requires gets ticked along with it — the levels below it and every research needed, all the way up the tree to its root. On the Battle tree, the deepest research fills in **102 prerequisites in a single click**.

It works the other way round too: **unticking** a research clears everything that depends on it. Fixing a mistake no longer means a cleanup pass — “actually I'm at level 4, not level 8” takes one click.

Each time, a short message tells you how many boxes were updated automatically. The option is off by default — nothing changes if you would rather not use it — and it remembers your choice from one visit to the next.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/research_calc.html
