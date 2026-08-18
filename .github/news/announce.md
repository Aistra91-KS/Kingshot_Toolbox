<!-- kshub-news
version: 1.9
covers-until: 6a4b460b97cb9bc47c21c8ee93afa190e86c2177
generated: 2026-08-18
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 🔻 Un pied de page pour tout le site, et les équipements des derniers héros
title-en: 🔻 A footer across the whole site, and the newest heroes' gear
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

### ⚔️ Les équipements exclusifs des trois derniers héros

**Wee & Woo**, **Charles** et **Ava** ont enfin leur Équipement Exclusif dans la Caserne : le nom de l'arme, et surtout le détail de ses deux effets — **Conquête** et **Expédition** — niveau par niveau, comme pour tous les autres héros légendaires.

Jusqu'ici leur fiche n'affichait rien à cet endroit, sans le moindre message : l'onglet disparaissait, tout simplement.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/caserne.html

### 🔻 Un pied de page arrive sur tout le site

Toutes les pages du site se terminent désormais par un **pied de page**. Il tient sur une bande, en bas, et rassemble ce qui n'avait jusqu'ici sa place nulle part — à commencer par deux nouvelles pages.

**📜 Nouveautés** — ce qui a changé sur le site, et quand. Chaque version est datée et numérotée, chaque ligne indique s'il s'agit d'une **nouveauté**, d'une **amélioration** ou d'un **correctif**, et renvoie vers la page concernée. L'historique remonte au 23 juillet : dix versions y sont déjà retracées.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/changelog.html

**👋 À propos** — qui est derrière l'outil et pourquoi il existe, mais surtout ce que deviennent les données que tu saisis : **tout reste dans ton navigateur**. Aucun compte, aucun serveur, aucune publicité, aucun traceur. Le bouton « Sauvegarde Globale » reste le moyen de transférer tes données d'un appareil à l'autre.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/about.html

### 🔧 Corrections

- Les **traductions françaises des héros** ont été relues, dans la Caserne comme dans la base de données.
- La carte du **Coffre personnalisé Chant de Guerre** affiche enfin son image.

## EN

### ⚔️ Exclusive gear for the three newest heroes

**Wee & Woo**, **Charles** and **Ava** finally have their Exclusive Gear in the Heroes page: the weapon's name, and above all the breakdown of its two effects — **Conquest** and **Expedition** — level by level, like every other legendary hero.

Until now their card showed nothing there, without a word: the tab simply disappeared.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/caserne.html

### 🔻 A footer arrives across the whole site

Every page on the site now ends with a **footer**. It sits as a band at the bottom and gathers what had nowhere to live until now — starting with two new pages.

**📜 What's new** — what changed on the site, and when. Every version is dated and numbered, every line says whether it is something **new**, an **improvement** or a **fix**, and links to the page it concerns. The history goes back to 23 July: ten versions are already listed.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/changelog.html

**👋 About** — who is behind the toolbox and why it exists, but above all what happens to the data you enter: **everything stays in your browser**. No account, no server, no ads, no trackers. The "Global Backup" button remains the way to move your data from one device to another.

👉 https://aistra91-ks.github.io/Kingshot_Toolbox/about.html

### 🔧 Fixes

- The **French hero translations** have been reviewed, on the Heroes page and in the database.
- The **War Chant Custom Chest** card finally shows its picture.
