<!-- kshub-news
version: 1.15.8
covers-until: 18fb34636457386ec1e439b23bfd4c27b3c178f1
generated: 2026-11-02
ping-fr: <@&1458880135208894721>
ping-en: <@&1458880409764102267>
title-fr: Le mode KVK des Recherches et une Académie de Guerre plus efficace
title-en: KVK mode in Research and a sharper War Academy
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

### Recherches : le mode KVK retire le temps de tes accélérateurs

En mode KVK, « Fait » retire maintenant le temps de la recherche du stock d'accélérateurs du panneau latéral, avec celui des prérequis cochés en même temps. Chaque recherche compte son temps arrondi à la minute du dessus, puisqu'un accélérateur ne sert qu'une recherche. Un nouveau bouton « Appliquer les modifications » coche d'un coup tout ce que ton stock finance, après un récapitulatif de ton stock avant et après.

👉 https://kingshottoolbox.com/research_calc

### Académie de Guerre : une suggestion KvK qui rapporte plus

La suggestion KvK vidait souvent un budget avant l'autre et proposait tout en base ou tout en avancé. Elle choisit maintenant la recherche lancée en dernier, dont la poussière compte en entier même si elle reste en cours, puis cherche encore mieux pendant quelques secondes après le clic. Le plan s'affiche tout de suite et se remplace à chaque amélioration ; « Garder ce plan » arrête la recherche. Sur 120 comptes tirés au sort, l'ancienne suggestion restait en moyenne 12 % sous le meilleur plan possible quand les accélérateurs manquaient. La nouvelle s'en approche à moins de 0,2 %, en mélangeant recherches de base et avancées quand ça rapporte plus.

### Académie de Guerre : Provisions limitées, prérequis et sauvegarde

La recherche avancée Provisions limitées a sa ligne dans les échanges de poussière : 5 TrueGold pour 13 poussières, 2 échanges par semaine et par niveau, 20 au niveau 10. Le plan la remplit juste après la ligne normale à 5 TrueGold, avant celle à 10.

Dans l'onglet Recherches avancées, régler une recherche monte tout ce qu'elle exige : Provisions limitées au niveau 3 met Infirmeries d'or véritable, Bandage rapide et les quatre recherches qu'ils demandent au niveau 3. Baisser une recherche baisse ce qui en dépend, et la case « Prérequis automatiques » coupe ce réglage.

Le bouton « Sauvegarde Globale » est maintenant en bas du panneau latéral de la page, comme sur les autres outils.

👉 https://kingshottoolbox.com/waracademy

## EN

### Research: KVK mode takes the time off your speedups

In KVK mode, "Done" now takes the research's time off the speedup stock in the side panel, along with any prerequisites ticked with it. Each research counts its time rounded up to the minute, since one speedup only serves one research. A new "Apply these changes" button ticks off everything your stock pays for in one go, after a summary of your stock before and after.

👉 https://kingshottoolbox.com/research_calc

### War Academy: a KvK suggestion that scores more

The KvK suggestion often used up one budget before the other and came out all basic or all advanced. It now chooses the research it starts last, whose dust counts in full even if it stays in progress, then keeps looking for a better plan for a few seconds after the click. The plan shows right away and is replaced with each improvement; "Keep this plan" stops the search. On 120 random accounts, the old suggestion was on average 12% short of the best possible plan when speedups were scarce. The new one comes within 0.2%, mixing basic and advanced research when that scores more.

### War Academy: Limited Supply, prerequisites and backup

The advanced research Limited Supply has its row in the dust exchanges: 5 TrueGold for 13 dust, 2 exchanges a week per level, 20 at level 10. The plan fills it right after the normal 5-TrueGold row, before the 10-TrueGold one.

On the Advanced research tab, setting a research to a level raises everything it requires: Limited Supply at level 3 puts Truegold Infirmaries, Quick Bandage and the four researches behind them at level 3. Lowering a research lowers what depends on it, and the "Auto-set prerequisites" box turns this off.

The "Global Backup" button now sits at the bottom of the page's side panel, like on the other tools.

👉 https://kingshottoolbox.com/waracademy
