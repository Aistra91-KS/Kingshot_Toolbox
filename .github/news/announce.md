<!-- kshub-news
version: 1.14.0
covers-until: bf3c084e1cbe7efa921470fe13842ca9fd2e75c8
generated: 2026-09-14
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: ⚔️ Deux experts, trois héros et la génération 8
title-en: ⚔️ Two experts, three heroes and generation 8
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

### ⚔️ Deux experts, trois héros et la génération 8

**Isnor et Aena** rejoignent les Experts. Chacun a sa fiche complète : les cent niveaux d'affinité et le bonus qu'ils donnent, le coût en emblèmes de chaque percée, l'expertise passive sur onze niveaux, et les quatre compétences avec l'effet, le coût d'EXP, les manuscrits et la puissance de chaque niveau.

Leur français vient du jeu, pas d'une traduction : les Gardes Césarès, l'Éternité à Portée et les Guides des Talismans s'écrivent comme tu les lis en jeu. Côté affinité, Isnor donne **Létalité et Santé des escouades** et Aena **Attaque et Défense**, 15 % chacun à l'affinité maximale.

👉 https://kingshottoolbox.com/database/masters/isnor
👉 https://kingshottoolbox.com/database/masters/aena
👉 https://kingshottoolbox.com/masters

**Diego, Liz et Luna** sont dans Ma Caserne, compétences d'expédition et équipement exclusif compris. Le filtre de génération gagne sa huitième case, et elle démarre cochée même si tu avais déjà réglé tes filtres : les nouveaux héros ne peuvent pas se cacher derrière un réglage pris avant leur sortie.

👉 https://kingshottoolbox.com/caserne

**Le Piège à Ours ouvre la génération 8.** Le menu s'arrêtait à 7 : il fallait se faire passer pour un serveur plus ancien, et les trois héros les plus récents étaient ignorés. La génération 8 a maintenant son classement de meneurs de rally et son classement de joiners, les trente-sept héros placés.

👉 https://kingshottoolbox.com/beartrap_calc

## EN

### ⚔️ Two experts, three heroes and generation 8

**Isnor and Aena** join the Masters. Each gets a full page: the hundred affinity levels and the bonus they grant, the emblem cost of every breakthrough, the passive expertise over eleven levels, and the four skills with the effect, EXP cost, manuscripts and power of each level.

On affinity, Isnor grants **Squad Lethality and Health** and Aena **Squad Attack and Defense**, fifteen percent each at full affinity.

👉 https://kingshottoolbox.com/database/masters/isnor
👉 https://kingshottoolbox.com/database/masters/aena
👉 https://kingshottoolbox.com/masters

**Diego, Liz and Luna** are in My Barracks, expedition skills and exclusive gear included. The generation filter gained its eighth box, and it starts ticked even if you had already set your filters, so the new heroes cannot hide behind a setting you made before they existed.

👉 https://kingshottoolbox.com/caserne

**The Bear Trap opens generation 8.** The menu stopped at 7, so you had to pretend to be on an older server and the three newest heroes were ignored. Generation 8 now has its own rally leader ranking and its own joiner ranking, all thirty-seven heroes placed.

👉 https://kingshottoolbox.com/beartrap_calc
