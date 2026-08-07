<!-- kshub-news
version: 1
covers-until: 26472c7445d4433cfae1caba04d07cca4fa9b8bf
generated: 2026-08-07
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🛍️ La page Boutique se refait une beauté
title-en: 🛍️ The Shop page gets a makeover
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

### 🛍️ Chaque boutique a désormais sa propre page

Fini l'écran unique bourré d'onglets : **Valeur Boutique** est devenu un sommaire rangé en trois familles — **Boutiques d'Événement**, **Boutiques Permanentes** et **Coffres** — et chacune des 12 boutiques a sa page dédiée, avec la place qu'il faut pour tout afficher.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop_calc.html

Les boutiques d'événement **terminées ne disparaissent plus** : leur carte passe en grisé mais reste cliquable, pour comparer une ancienne édition avec celle en cours.

### 🧮 Le gros morceau : le panier

Tu ne te contentes plus de regarder quel objet est le plus rentable — **tu prépares tes achats**.

Renseigne ta monnaie, puis choisis tes quantités ligne par ligne avec les boutons **−** / **+** (ou **MAX**, qui prend tout ce que ton solde permet sans dépasser le stock). Quatre compteurs se mettent à jour en direct : **ta monnaie**, **le dépensé**, **le restant** et **la valeur obtenue en gemmes**.

Concrètement : 10 000 pièces, tu prends 10 Mithril à 750 → il te reste **2 500 pièces**, et tu vois immédiatement ce que tu peux encore t'offrir avec.

Un **récapitulatif reste collé en bas de l'écran** pendant que tu parcours la liste, et ton panier est conservé quand tu reviens sur la page.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop/polar-shop.html

### 📊 Un tableau à la place des cartes

Chaque boutique s'affiche en **une ligne par objet** : trois à quatre fois plus d'objets à l'écran, et des colonnes qui se comparent d'un coup d'œil. Le tri se fait **par meilleure affaire d'office**, et n'importe quelle colonne est cliquable pour changer d'ordre. Les trois meilleurs rapports valeur/prix restent mis en avant en haut de page.

Le **compte à rebours affiche maintenant les jours ET les heures**, et la colonne « Dispo » explique son calcul (par exemple *2/jour × 6j*).

### ✏️ Ta boutique ne colle pas ? Corrige-la

Le bouton **crayon** ouvre un mode édition : quantités, coûts et stock restant deviennent modifiables, tu peux ajouter ou retirer des objets, et tout remettre d'origine d'un clic. Pratique quand ta boutique en jeu diffère de la version chargée.

### 🏗️ TrueGold : palier de serveur

Le planificateur proposait des améliorations qui n'existent pas encore sur ton serveur. Un sélecteur **Palier de serveur** (TG3 / TG5 / TG8 / TG10) en haut de la Configuration cadre désormais les suggestions. Les bâtiments déjà au-dessus du palier sont signalés et comptent toujours comme prérequis. Le **bonus de construction (PAN)** a rejoint le panneau Configuration, pour gagner de la place.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/truegold_calc.html

## EN

### 🛍️ Every shop now has its own page

No more single screen crammed with tabs: **Shop Value** is now a summary sorted into three families — **Event Shops**, **Permanent Shops** and **Chests** — and each of the 12 shops has its own page, with the room it needs to show everything.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop_calc.html

Finished event shops **no longer disappear**: their card turns grey but stays clickable, so you can compare a past run with the one currently live.

### 🧮 The big one: the shopping cart

You are no longer just looking at which item is the best value — **you plan your purchases**.

Enter how much currency you have, then pick quantities line by line with the **−** / **+** buttons (or **MAX**, which takes everything your balance allows without going over the stock). Four counters update live: **your currency**, **spent**, **remaining** and **value obtained in gems**.

In practice: 10,000 coins, you take 10 Mithril at 750 → you have **2,500 coins left**, and you immediately see what else you can afford with them.

A **summary stays pinned to the bottom of the screen** while you go through the list, and your cart is kept for when you come back.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/shop/polar-shop.html

### 📊 A table instead of cards

Each shop is now **one line per item**: three to four times more items on screen, and columns you can compare at a glance. It sorts by **best deal first** by default, and any column header can be clicked to reorder. The three best value-for-money picks still get highlighted at the top.

The **countdown now shows days AND hours**, and the "Available" column explains its own maths (for example *2/day × 6d*).

### ✏️ Shop doesn't match? Fix it

The **pencil** button opens an edit mode: quantities, costs and remaining stock become editable, you can add or remove items, and reset everything back to the original in one click. Handy when your in-game shop differs from the loaded version.

### 🏗️ TrueGold: server tier

The planner was suggesting upgrades that don't exist on your server yet. A **Server tier** dropdown (TG3 / TG5 / TG8 / TG10) at the top of Configuration now frames the suggestions. Buildings already past your tier are flagged and still count as prerequisites. The **construction bonus (PAN)** moved into the Configuration panel to save room.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/truegold_calc.html
