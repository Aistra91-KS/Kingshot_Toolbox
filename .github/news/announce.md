<!-- kshub-news
version: 2.0
covers-until: 7579338655af4e6123ea6a6c0be20af6effec242
generated: 2026-08-23
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🏰 Kingshot Toolbox 2.0 : une adresse à soi
title-en: 🏰 Kingshot Toolbox 2.0: an address of its own
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

### 🏰 Une adresse à soi

Jusqu'ici, la boîte à outils habitait à cette adresse : `aistra91-ks.github.io/Kingshot_Toolbox/`. Difficile à retenir, franchement pénible à dicter en vocal, et pas vraiment le genre de lien qu'on a envie de partager.

C'est réglé. Le site a maintenant **son propre nom de domaine** :

👉 https://kingshottoolbox.com

**Tes anciens liens continuent de fonctionner** : ils redirigent automatiquement vers la nouvelle adresse, donc rien ne casse, ni pour toi ni pour les guides qui pointent vers l'outil. Mais si tu as un lien épinglé quelque part — favoris du navigateur, salon d'alliance, message d'accueil — c'est le bon moment pour le remplacer.

Trois autres choses ont bougé au passage :

**L'icône du site** s'affiche enfin dans l'onglet de ton navigateur, au lieu de la page blanche générique. Elle devrait aussi apparaître à côté du site dans les résultats Google dans les prochaines semaines.

**Les liens partagés ici** ont désormais une vraie vignette illustrée au lieu d'une ligne de texte nue. Colle l'adresse dans un salon, tu verras la différence tout de suite.

**Une page d'erreur maison** remplace celle de GitHub quand un lien est mort, avec les raccourcis vers l'accueil et les principaux outils.
👉 https://kingshottoolbox.com/404.html

Rien à réinstaller, rien à reconfigurer : tes données restent là où elles ont toujours été, sur ton appareil.

## EN

### 🏰 An address of its own

Until now, the toolbox lived at this address: `aistra91-ks.github.io/Kingshot_Toolbox/`. Hard to remember, genuinely painful to read out on voice chat, and not the kind of link you feel like sharing.

That's sorted. The site now has **its own domain name**:

👉 https://kingshottoolbox.com

**Your old links still work**: they redirect to the new address automatically, so nothing breaks — not for you, and not for the guides pointing at the tools. But if you have a link pinned somewhere — browser bookmarks, alliance channel, welcome message — now is a good time to swap it.

Three other things changed along the way:

**The site icon** finally shows up in your browser tab instead of the blank generic page. It should also appear next to the site in Google results over the coming weeks.

**Links shared here** now come with a proper preview card instead of a bare line of text. Paste the address in a channel and you'll see the difference straight away.

**A custom error page** replaces GitHub's default one when a link is dead, with shortcuts back to the home page and the main tools.
👉 https://kingshottoolbox.com/404.html

Nothing to reinstall, nothing to set up again: your data stays exactly where it has always been, on your own device.
