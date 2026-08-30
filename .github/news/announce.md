<!-- kshub-news
version: 1.13
covers-until: f7c893a970451647730fb1b8e96d445512d98860
generated: 2026-08-30
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: 💬 Un bouton pour me dire ce qui cloche
title-en: 💬 A button to tell me what is wrong
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

### 💬 Dis-moi ce qui cloche, sans quitter la page

Une valeur qui te paraît fausse, un outil qui bloque, une idée pour en améliorer un : il y a maintenant un bouton **« Un retour ? »** dans l'en-tête de chaque page — et dans le menu latéral sur téléphone.

Tu dis de quoi il s'agit (bug, valeur erronée, idée, autre), tu écris, tu envoies. **Aucun compte, aucune adresse mail à donner.** Le formulaire t'annonce exactement ce qui part avec ton message — la page où tu étais, ta langue et la version du site, rien de plus — et te confirme à l'écran une fois qu'il est bien arrivé.

Laisse ton pseudo en jeu si tu veux que je puisse revenir vers toi. Sinon, écris et pars : je lis tout.

👉 https://kingshottoolbox.com/

## EN

### 💬 Tell me what is wrong, without leaving the page

A value that looks wrong, a tool that breaks, an idea to make one better: there is now a **Feedback** button in the header of every page — and in the side menu on phones.

Say what it is about (a bug, a wrong value, an idea, something else), write, send. **No account, no email address to hand over.** The form tells you exactly what travels with your message — the page you were on, your language and the site version, nothing more — and confirms on screen once it has really arrived.

Leave your in-game name if you want me to be able to get back to you. Otherwise write and go: I read everything.

👉 https://kingshottoolbox.com/
