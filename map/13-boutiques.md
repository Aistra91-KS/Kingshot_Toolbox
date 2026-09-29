# MAP §13 · Boutiques et événements

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 13. Boutiques et événements

> Conventions des pages `shop/*.html` et de la valorisation d'événement. Gabarit : §11. Données : §6. Deux valorisations, règle du « — », valeur corrigée : §9 `09b`.

### Trois sommaires, découpés par question (décidé avec Aistra, septembre 2026)
- **`shop_calc`** : « qu'est-ce que j'achète avec cette monnaie ? » (6 boutiques permanentes, 3 coffres). URL indexée conservée, contenu changé. Une carte en tête mène aux boutiques d'événement, pour les anciens signets.
- **`event-roi`** : « cet événement valait-il le coup ? » (11 boutiques d'événement, lecture du % de retour).
- **`item-values`** : « combien vaut cet objet ? » (les deux référentiels et la méthode).
- **Aucune URL supprimée** : seules les cartes ont déménagé.
- **Un seul script** (`shop_calc.js`) pour les trois : une section absente est ignorée ; l'aide se choisit par `window.SX_INDEX` posé avant le script (absent : aide des boutiques, moins précise, jamais fausse).
- **Textes des deux pages neuves en `data-en`/`data-fr`**, pas dans `i18nShop` : une clé ajoutée au dictionnaire laisserait en anglais un visiteur au `shop-core.js` en cache.
- **Cartes écrites en dur** (liens, noms, monnaies) ; `shop_calc.js` n'hydrate que vignette, nombre d'objets, badge de statut et ordre des événements.

### Page boutique
- Hors de `database/` : elle porte de l'état joueur et charge le socle complet (`storage-keys` → `profiles` → `help` → `backup`).
- **En dur** : `<base href>`, `title`, description, `h1`, intro, `window.SHOP_SLUG` (reconstruits en JS, ils feraient sauter le bouton d'aide). Le reste est rendu par `shop-page.js` dans `#sp-thumb`, `#sp-facts` (ancre de l'aide), `#sp-actions`, `#sp-cart`, `#sp-podium`, `#sp-table`, `#sp-switch`.
- **Sous le tableau** : `.sx-reflinks` en dur vers les deux référentiels (là où l'on doute d'un chiffre), puis les raccourcis vers les autres boutiques (`#sp-switch`). Un seul filet horizontal, porté par `.sx-reflinks`.
- **Titre d'une boutique** : `Kingshot <boutique> - Gem & Real-Money Value` (les deux lectures, §11), sans « Kingshot » en tête quand le titre dépasserait 70 caractères (§9 `09b`). La monnaie, inconnue avant l'événement, reste dans description, intro et tableau. Le nom de l'événement remplace celui de la boutique s'il diffère (`Blizzard Brawl Shop`) ; `h1` et fil d'Ariane gardent le nom en jeu.
- **Un tableau, une ligne par objet** (`table.sx-table`), 3 à 4 fois plus dense qu'une grille. Colonnes en trois blocs : coût (Qté, Coût), valeur (Valeur, Ratio), ce qu'on peut en tirer (Restant, Max fin, Obtenable, Coût obt., événements seulement, séparés par `.sep`). Seul le podium garde des visuels.
- **Mode édition** (crayon, `SP_EDIT`, non persisté exprès) : quantité, coût, stock, ajout, retrait, réinitialisation. Colonne de suppression en `sticky; right:0`.
- **Panier** : `si.take` = nombre de lots. `scComputeRows()` en deux passes (coût de la sélection, puis `canTake` de chaque ligne). Quatre tuiles (monnaie, dépensé, restant, valeur obtenue). Panier et édition s'excluent. Pas de remplissage automatique (écarté par Aistra).
- **Re-rendu après saisie** : `spAfterEdit()` diffère d'un tick (remplacer le tableau depuis le `change` d'un champ lève une DOMException au `blur`) ; `spSnapshotTable()`/`spRestoreTable()` rendent défilement et focus.
- **Récapitulatif `.sx-cartbar`** : `sticky; bottom:0` hors du `<table>` (un `tfoot` sticky n'apparaît qu'après défilement dans Chromium), contenu aligné à gauche (`.backup-fab` occupe la droite).
- **Largeurs** : `body:not(.hub-body)` est en flex, un `.db-page` sans largeur y suit son contenu et `auto-fill` retombe sur une colonne (selon les polices du système). `shop.css` pose `width:100%; min-width:0`. `.sx-table` reprend `width:100%`, la colonne du nom absorbe le reste.

### Sommaire, vignettes, échéances
- **Événement terminé = page conservée** : carte grisée (`.sx-card.is-ended`) mais cliquable, bandeau d'archive. Ajouter une boutique : une entrée JSON, une page (gabarit), une carte au sommaire, une ligne `sitemap.xml`, un lien `llms.txt`.
- **Vignettes** : `img/shops/<slug>.webp`, sinon mosaïque des 4 objets les plus chers (`scThumbHtml`). Place réservée par `.sx-thumb-slot` au même `aspect-ratio: 16/9` (sans elle, CLS 0,389). Un visuel reçu sous un autre nom ou format (`brewmaster stall.png`) n'est jamais lu : le convertir en `<slug>.webp` recadré en 16:9 sur le titre, car `object-fit: cover` rogne les côtés d'une capture plus large.
- **« Voir plus » sans JavaScript** : deux lignes de cartes, plafond 4 (< 884 px), 6 (884 à 1 159 px), 8 (≥ 1 160 px), seuils relevés sur la grille (`minmax(260px,1fr)`, `gap:16px`). Case `.sx-more-cb` **avant** la grille, `.sx-grid.is-clamped`, `<label class="sx-more">` ; tout en CSS (`nth-child`, `:checked ~`, `:has()`). Case et libellé portent `hidden`, levé seulement dans le bloc `@supports selector(:has(*))` : un CSS en cache montre la grille entière. Un repli en JS faisait sauter la page (CLS 0,68 sur mobile). Découpe au nombre de cartes, jamais à la hauteur.
- **Compte à rebours** : `scTimeLeft()`/`scTimeLeftTxt()` (affichage) est distinct de `scResetsLeft()` (resets à 00h UTC, entre dans les calculs) : ne jamais les fusionner. Attributs facultatifs sur `[data-ends-at]` : `data-ends-full`, `data-ends-state`, `data-ends-label`. Une seule pastille dans `spRenderHero()`. Au changement d'état, `scStartCountdowns()` émet `endsStateChanged`, écouté par `spRenderAll` et `scRefreshIndex` (événement, pas appel).

### Valorisation d'un événement (`js/shop-event.js`, `#sp-event`)
« Ce que l'événement m'a coûté contre ce qu'il m'a rapporté », en % d'argent réel. Branchés : Stand d'Aventure, Caravane du Dragon, Magasin du Théâtre, Clair de Lune, Stand Alchimique. Leur carte sur `event-roi` porte la pastille « ROI » ; les textes de la page les désignent par cette pastille plutôt que par un nombre, qui avait vieilli (« trois » quand il y en avait quatre).
- **Ajouter un événement = un fichier `data/events/<slug>.json`** : `build_pages.py` en déduit `<div id="sp-event">` et le script (`est_evenement()`). Relancer la génération, committer.
- **Module optionnel** : en 404 il n'affiche rien. `shop-page.js` ne le connaît que par `window.ShopEvent` (`spNotifyEvent()`) ; garde de `seAfter()` obligatoire (`spRenderAll()` passe avant la fin du chargement).
- **Le % reste en €/$** : la valeur en gemmes s'affiche à côté, jamais divisée par la dépense. Sans achat, pas de % : la tuile dit « F2P ».
- **Le panier compte dans la valeur** : c'est lui qui donne une valeur aux pièces d'événement.
- **Crans du %** (`seTier`, décidés par Aistra) : < 100 rouge, 100 à 120 orange, 120 à 140 neutre, 140 à 180 vert clair, 180+ vert. Toujours avec le libellé. Teintes `.sxe-t-*` propres au bloc (contraste).
- **Montants : `seFmtMoney()`, 2 décimales fixes** (`scFmtEur()` est fait pour des prix unitaires : 119,99 € y devenait « 120 € »).
- **Détail des gains** : colonne « Provenance » (source tracée par `seAdd()`, deux plus gros apports en pastilles + « +n », détail en info-bulle), ligne de total, case par objet (décoché : grisé, hors total et hors valorisation, persisté dans `excluded`, clé itemId ou `x:<label EN>`). `.sxe-rewards` rend la largeur à la Provenance.
- **« Utiliser comme budget »** recopie les pièces prévues dans « Ma monnaie », jamais automatiquement.
- **Placée sous le tableau** (décision d'Aistra).
- **Extension `window.seExtras(host, c)`**, appelée en fin de `seRender()` avant la remise du focus : c'est là que le Théâtre greffe son optimiseur. `seCompute(upTo)` (`ShopEvent.compute`) borne aux `upTo` premiers jours. Un greffon lit `c` sans recalculer, se redessine seul pour ses propres saisies, gère son focus et ses `<details>`, et détache un contrôle emprunté avant d'écraser son `innerHTML`.

**Règles du fichier d'événement** (toutes couvertes par `tests/shop-event.test.mjs`) :
- **`lastDay`** : un pack qui ferme avant l'événement (Clair de Lune : 7 jours sur 8). Borne posée dans `seBuysCount()`, à la source, pour qu'un plan enregistré avant cesse de compter l'achat fermé. Case inerte, mention « jusqu'au J7 ».
- **`requires`** : un pack qui en exige un autre, pour tout l'événement. Borne dans `seBuysCount()` et refus dans `seToggle()`. Condition affichée en permanence. Un `requires` inconnu ne bloque rien ; un cycle s'arrête sur un garde.
- **`_meta.excludePackItemsByDefault`** : le contenu des packs part décoché, **par règle et non par liste** (une liste oublie les packs relevés plus tard). Objets sans itemId non décochés.
- **`_meta.excludedByDefault`** : liste d'itemId décochés sur un plan neuf. Piège : les gros packs versent `1000_exp_vip`, les petits `100_exp_vip` ; le test compare la liste à tout ce que versent les packs.
- Un plan enregistré garde ses cases : `seDefaultExcluded()` ne sert qu'au premier chargement.
- **« Déjà pris »** (`trackOwned`, §6) : les lots achetés les jours passés, plafonnés par le stock de tout l'événement (d'où `startsAt`). Ils comptent dans la valeur, jamais dans le solde (« Dépensé » dit « dont N déjà dépensés »). Le « Dispo » prend la plus basse de deux bornes : jours restants, stock restant. Le plafond est appliqué par `scCompute`, pas par le champ.
- **Monnaie gagnée par des commandes** (Stand Alchimique) : les Bons d'Alchimie ne sortent ni des packs ni des missions, mais des commandes réussies, dont le coût en Breuvages dépend des essais du joueur. Il saisit ses commandes terminées, `orderRewards` en tire les Bons (§6). Une Commande Spéciale jouée à ×k se saisit comme k commandes, exact tant que sa base vaut 5 000. `seF2P()` ne remet à zéro ni les commandes ni les Breuvages utilisés.
- **Monnaie sans lien fixe avec un pack** (Amulettes au Théâtre, Lanternes au Clair de Lune, Breuvages Magiques au Stand Alchimique) : listée sans `itemId`, avec un `label`, jamais chiffrée ; `_meta.currencyNote` explique. Ne pas inventer de taux.
- **Case fermée** : texte en `role="img"` + `aria-label` sur la case, pas en `.kt-sr` (en `position:absolute` dans un tableau qui défile, il élargissait la page à 689 px sur 390).
