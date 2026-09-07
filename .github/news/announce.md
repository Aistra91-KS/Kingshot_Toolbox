<!-- kshub-news
version: 1.13.4
covers-until: aaab67add7feabc120b691c0c470114a0d2fefe9
generated: 2026-09-07
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: ⚔️ L'Académie de Guerre achète ta poussière
title-en: ⚔️ The War Academy planner now buys your dust
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

### ⚔️ L'Académie de Guerre achète ta poussière

La poussière d'Or Véritable ne se ramasse pas qu'en jeu : **trois échanges en produisent chaque semaine**, et le planificateur sait enfin compter dessus.

Un nouveau panneau, entre l'arbre et la suggestion, donne une ligne à chaque échange — 5 000 pièces contre 1 poussière, 5 TrueGold contre 13, 10 TrueGold contre 13. Tu coches ceux que tu acceptes de faire : **décoche les deux lignes TrueGold et le plan n'y touchera jamais**. Tu saisis ce que tu es prêt à y mettre et les échanges déjà faits cette semaine (les plafonds sont hebdomadaires), et l'outil ne convertit **que ce dont le plan a vraiment besoin** — souvent bien moins que tout ce que tu déclares, parce qu'un plan est plus souvent limité par tes accélérateurs que par ta poussière.

Les échanges à faire sont listés **en tête du résultat**, avant les recherches : c'est l'ordre à suivre en jeu, il faut la poussière en main avant de lancer la première. Suivent les stocks qu'ils te laissent, prêts à recopier dans tes saisies.

### 🪙 Et un vrai correctif : les pièces ne comptaient pas

Chaque niveau de recherche coûte des pièces — près de **900 000** sur un plan d'un mois — et l'outil ne les regardait pas du tout. Il pouvait donc te proposer un plan que tu n'avais pas les moyens de payer. Laisse le champ « Pièces disponibles » vide et il t'annonce simplement la quantité nécessaire ; renseigne-le et il borne le plan, en partageant tes pièces entre ce que coûtent les recherches et ce que coûtent les échanges.

### 🐺 TrueGold : le Loup Gris était du mauvais côté du calcul

Sur la page TrueGold, le Loup Gris était traité comme une coupe sur le temps restant, alors que c'est un **bonus de vitesse de construction** qui s'additionne à ton Bonus Vitesse, au 1er Ministre et au KVK. Tous les temps sortaient environ **15 % trop courts** : un Centre-ville qui passe de TG7 à TG8 affichait 5j 20h par étape là où le jeu en demande 6j 18h.

Attention à ne pas le compter deux fois : la vitesse affichée sur ta fiche en jeu **inclut déjà le loup** quand sa compétence est active. Si c'est à ce moment-là que tu l'as relevée, laisse la case décochée.

👉 https://kingshottoolbox.com/waracademy
👉 https://kingshottoolbox.com/truegold_calc

## EN

### ⚔️ The War Academy planner now buys your dust

TrueGold Dust isn't only picked up in game: **three exchanges produce it every week**, and the planner can finally count on them.

A new panel between the tree and the suggestion gives each exchange its own row — 5,000 coins for 1 dust, 5 TrueGold for 13, 10 TrueGold for 13. Tick the ones you agree to make: **untick the two TrueGold rows and the plan will never touch your stock**. Enter what you're willing to spend and how many exchanges you've already made this week (the caps are weekly), and the tool converts **only what the plan really needs** — often far less than you declare, because a plan is bound by your speedups more often than by your dust.

The exchanges to make are listed **at the top of the result**, before the researches: that's the order to follow in game, since you need the dust in hand before starting the first one. The stocks they leave you with come right after, ready to copy back into your inputs.

### 🪙 And a real fix: coins were not being counted

Every research level costs coins — close to **900,000** across a month-long plan — and the tool wasn't reading that at all. It could hand you a plan you simply couldn't pay for. Leave "Coins available" empty and it just tells you how many you'll need; fill it in and it bounds the plan, splitting your coins between what the researches cost and what the exchanges cost.

### 🐺 TrueGold: the Grey Wolf was on the wrong side of the maths

On the TrueGold page the Grey Wolf was treated as a cut on the time left, when it's really a **construction speed bonus** that adds to your Speed bonus, Ground Works and KVK. Every build time was coming out about **15% short**: a Town Center going TG7 to TG8 read 5d 20h per step where the game asks for 6d 18h.

Careful not to count it twice: the speed stat on your in-game profile **already includes the wolf** while its skill is up. If that's when you read it, leave the box unchecked.

👉 https://kingshottoolbox.com/waracademy
👉 https://kingshottoolbox.com/truegold_calc
