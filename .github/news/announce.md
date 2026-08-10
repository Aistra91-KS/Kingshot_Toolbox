<!-- kshub-news
version: 1
covers-until: 68e2cff86e7c820a10ae5f958a9840bb898c555f
generated: 2026-08-10
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: ✅ Ton plan s'applique maintenant en un clic
title-en: ✅ Your plan now applies in one click
-->

<!--
GABARIT — mode d'emploi

1. Demander l'annonce. Le texte complet de ce fichier est renvoyé prêt à coller
   (il repart de `covers-until` pour lister les commits parus depuis).
2. Coller ce fichier en entier, puis committer SEUL (aucun autre fichier).
   Le commit déclenche la publication sur Discord.
3. Pour republier sans nouveau commit : onglet Actions -> Discord Announce -> Run workflow.
   (Cocher « Aperçu seul » pour vérifier le rendu sans rien envoyer.)

Les commentaires HTML ne sont jamais publiés : tant que les deux sections
ci-dessous restent vides, aucun message n'est envoyé.

TOUJOURS inclure le lien direct des pages concernées par l'annonce
(https://aistra91-ks.github.io/Kingshot_Toolbox/<page>) — le lecteur doit
pouvoir ouvrir la nouveauté sans avoir à la chercher.

Clés facultatives de l'en-tête :
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

### ✅ Fini de tout retaper à la main

Jusqu'ici, quand tu avais réalisé le plan proposé en jeu, il fallait revenir sur la page et ressaisir un par un tes niveaux, tes stocks et tes accélérateurs. Un nouveau bouton **« Appliquer les modifications »**, tout en bas du plan, le fait pour toi.

Un clic, une fenêtre de confirmation qui te montre **exactement ce qui va changer** — chaque bâtiment ou recherche concerné, et chaque stock avant → après — et la page se met à jour :

- tes bâtiments et tes recherches montent aux niveaux du plan
- ton Or Véritable, ton Or Véritable Trempé, tes poussières et tes accélérateurs baissent de ce que le plan dépense
- ton compteur de transformations grimpe du nombre de transformations utilisées
- l'outil enchaîne aussitôt sur le plan suivant

Deux précisions : une construction laissée en cours est comptée comme faite (tu l'as déjà payée), et l'Or Véritable Trempé issu du Creuset est la **moyenne attendue** — corrige-le à la main si tes tirages ont été plus ou moins chanceux.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/truegold_calc.html
👉 https://aistra91-ks.github.io/Kingshot_Toolbox/waracademy.html

### 📚 Toutes les recherches avancées d'Or Véritable

Une nouvelle page de base de données rassemble l'arbre **War Academy Advanced** en entier : **92 recherches, 1 010 niveaux**, avec le coût en poussière, en Or Véritable Trempé, en ressources et le temps de chaque niveau. Filtres par catégorie (Combat, Capacité, Économie, Spécial) et recherche par nom.

Les noms français ne sont pas encore affichés : la mise à jour n'est pas sortie sur nos serveurs, donc les libellés officiels n'existent pas encore. Ils seront ajoutés dès leur parution, sans traduction inventée entre-temps.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/database/waracademy/advanced.html

### 🏆 Des plans KvK plus rentables

Les deux planificateurs se faisaient piéger de la même façon : ils ne savaient pas investir dans une suite de niveaux médiocres qui en débloque un excellent. Résultat, tu pouvais **gagner des points en décochant un bâtiment ou un arbre** — la preuve que la suggestion n'était pas la meilleure.

- **TrueGold** explore désormais *toutes* les combinaisons possibles en mode KvK au lieu d'avancer au coup par coup : le plan rendu est le meilleur, pas juste un bon.
- **Académie de Guerre** sait maintenant s'engager dans une chaîne de prérequis et la terminer, plutôt que d'entamer les trois arbres sans en finir aucun. Gain mesuré : **+4 à +6,5 % de points** sur les budgets concernés, sans aucun cas dégradé.

### 🔧 Correction

La valeur en gemmes du **Mithril** a été corrigée dans le référentiel des objets.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop/items.html

## EN

### ✅ No more retyping everything by hand

Until now, once you had carried out the suggested plan in game, you had to come back to the page and re-enter your levels, your stocks and your speedups one by one. A new **"Apply these changes"** button, right at the bottom of the plan, does it for you.

One click, a confirmation window showing you **exactly what will change** — every building or research concerned, and every stock before → after — and the page updates:

- your buildings and researches jump to the plan's levels
- your TrueGold, Tempered TrueGold, dust and speedups go down by what the plan spends
- your transformation counter goes up by the transformations used
- the tool immediately works out the next plan from there

Two things worth knowing: a build left running counts as done (you have already paid for it), and the Tempered TrueGold from the Crucible is the **expected average** — correct it by hand if your rolls were luckier or worse.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/truegold_calc.html
👉 https://aistra91-ks.github.io/Kingshot_Toolbox/waracademy.html

### 📚 Every Advanced TrueGold research

A new database page gathers the whole **War Academy Advanced** tree: **92 researches, 1,010 levels**, with the dust, Tempered TrueGold, resource costs and time for each level. Filter by category (Combat, Capacity, Economy, Special) and search by name.

French names aren't shown yet: the update hasn't reached our servers, so the official labels don't exist anywhere. They'll be added as soon as they're out, with no made-up translation in the meantime.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/database/waracademy/advanced.html

### 🏆 Better-paying KvK plans

Both planners fell into the same trap: they couldn't invest in a run of poor levels that unlocks a far better one. As a result, you could **earn more points by unticking a building or a tree** — proof the suggestion wasn't the best one.

- **TrueGold** now explores *every* possible combination in KvK mode instead of moving one step at a time: the plan you get is the best one, not just a good one.
- **War Academy** now commits to a prerequisite chain and finishes it, instead of starting all three trees and completing none. Measured gain: **+4 to +6.5% points** in the affected range, with no case made worse.

### 🔧 Fix

The gem value of **Mithril** has been corrected in the item reference.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop/items.html
