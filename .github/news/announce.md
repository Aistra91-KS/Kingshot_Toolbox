<!-- kshub-news
version: 2.11
covers-until: 6941c7ddf726d5560046d738c10abb855cd7a2f6
generated: 2026-08-28
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 📊 Cet événement valait-il ton argent ?
title-en: 📊 Was that event worth your money?
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

### 📊 La question qu'on se pose à la fin d'un événement

« J'ai mis 25 € dans cet événement… est-ce que ça les valait ? » Deux boutiques d'événement répondent désormais, chiffre à l'appui.

Tu coches les packs achetés **chaque jour** — ou rien du tout si tu es F2P — et la page additionne **tout** ce que l'événement distribue : missions quotidiennes, packs gratuits, pistes gratuites, paliers, et le contenu des packs eux-mêmes. Elle compare ce total à ce que tu as réellement payé et sort **un seul pourcentage**.

100 %, c'est ta mise récupérée. En dessous, c'est rouge. Au-dessus, ça vire à l'orange, puis au vert à mesure que l'affaire s'améliore.

👉 https://kingshottoolbox.com/shop/adventure-stall.html
👉 https://kingshottoolbox.com/shop/dragons-caravan.html

### 🪙 La monnaie d'événement compte aussi

Les pièces ou essences gagnées n'ont pas de valeur en elles-mêmes : elles valent ce que tu en tires. Un bouton les reporte donc dans le tableau de la boutique juste en dessous, et les objets que tu y choisis reviennent aussitôt nourrir ta valeur récupérée.

### 🔍 Et le détail, ligne par ligne

Un tableau dépliable liste chaque récompense avec son total en gemmes et en argent réel, et surtout **d'où vient chaque quantité** : les missions, un pass, un palier, tel pack précis. Survole, tu as le décompte complet.

Un skin qui ne t'intéresse pas ? Une endurance que tu n'utilises jamais ? **Décoche** : l'objet quitte le total et le pourcentage à l'instant. La valorisation devient la tienne, pas une théorie. Tes réponses restent sur ton appareil, par événement et par profil.

### 💶 Les prix réels ont été rafraîchis

Le relevé des packs payants passe de 33 à **59 packs**. Trois objets se révèlent distribués en bien plus grande quantité qu'on le croyait, et coûtent donc bien moins cher à l'unité — les **Fils Dorés** et le **Satin** en particulier.

👉 https://kingshottoolbox.com/shop/items-euro.html

## EN

### 📊 The question you ask when an event ends

"I put €25 into this event… was it worth it?" Two event shops now answer, with numbers.

Tick the packs you bought **on each day** — or nothing at all if you play for free — and the page adds up **everything** the event hands out: daily missions, free packs, free tracks, milestones, and the contents of the packs themselves. It compares that total to what you actually paid and gives you **one percentage**.

100% means you got your money back. Below that it shows red. Above, it turns orange, then green as the deal gets better.

👉 https://kingshottoolbox.com/shop/adventure-stall.html
👉 https://kingshottoolbox.com/shop/dragons-caravan.html

### 🪙 The event currency counts too

The coins or essences you earn are worth nothing on their own — they are worth what you take with them. One button drops them into the shop table just below, and the items you pick there feed straight back into the value you recovered.

### 🔍 And the breakdown, line by line

An expandable table lists every reward with its total in gems and in real money, and above all **where each quantity comes from**: the missions, a pass, a milestone, one specific pack. Hover a cell for the full count.

A skin you don't care about? Stamina you never use? **Untick it** — the item leaves the total and the percentage at once. The figure becomes yours, not a theory. Your answers stay on your device, per event and per profile.

### 💶 Real-money prices refreshed

The paid-pack survey grows from 33 to **59 packs**. Three items turn out to be handed out in far bigger amounts than we thought, so they cost far less per unit — **Gilded Threads** and **Satin** especially.

👉 https://kingshottoolbox.com/shop/items-euro.html
