# MAP §6 · Données (2/3) : relevé en argent réel, `shopcalc_euro.json`

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine. Procédure de mise à jour depuis `Pack_ks.xlsx` : `CLAUDE.md`.

## 6. Données (suite) : `shopcalc_euro.json`

Seconde valorisation, en argent réel, tirée du relevé en jeu des packs payants. Fichier **admin en lecture seule** : aucune édition joueur, aucun stockage, régénérable d'un bloc. Les deux valorisations (gemmes, argent réel) sont **indépendantes** : aucun taux gemme↔euro n'est calculé nulle part.

### Schéma
`{_meta, packs, items, derived, speedups, affinity, weights}`.
- **Périmètre** : seuls les packs achetables au moins une fois par mois (ni événement, ni VIP, ni pack unique).
- `_meta` : `tier` (palier de serveur), `packPrice` / `packPriceUsd` = prix **par défaut** (6 € / 5 $) partagé par la plupart des packs, `updatedAt`, `source`, `note`.
- `packs` : `id -> {FR, EN, price?, priceUsd?}`. L'`id` (slug du nom anglais) est aussi le nom de l'image `img/packs/<id>.webp`.
- `items` : indexé par l'`id` de `shopcalc_items.json`, `{qty, packs[]}`.

### Prix d'un pack
- `price` et `priceUsd` sont facultatifs **mais vont ensemble** (`scEurPackPrice(pid)`) : un pack qui n'en déclare qu'un retombe entièrement sur le défaut, faux mais cohérent entre € et $ donc repérable.
- Paliers : 5 $ → 6 €, 10 $ → 12 €, 20 $ → 24 €. Hors défaut : Carte Mensuelle Ultra et Privilège de Recherche (12 € / 10 $), Ranger de la nature (24 € / 20 $).
- Recouper avec la capture en jeu quand il y en a une : la colonne `Prix` de l'Excel s'est déjà trompée (Ranger saisi à 10 $).

### Quel pack pour un objet
- `packs[]` = les packs au **meilleur prix unitaire** (prix du pack ÷ quantité), `qty` = la quantité qu'ils donnent. Le prix unitaire n'est **jamais stocké** : `scEurUnit()` le calcule à l'affichage.
- À prix unitaire égal entre deux tarifs, le **moins cher** est retenu (Ranger à 24 € = 4 × Rencontre Frontalière à 6 € : on affiche le pack à 6 €) ; `scEurRawPrice()` reprend le minimum si le fichier est mal régénéré.
- Un seul pack : son image illustre l'objet. Plusieurs : « Multipack », sans image.
- **Coffre personnalisé** : on y choisit 3 objets, éventuellement identiques, donc un objet « Au Choix » compte pour 3 fois la ligne. Depuis la livraison du 13/09/2026, la colonne `Valeur` de l'Excel porte **déjà** le triple : ne pas remultiplier, ne pas « corriger » vers le tiers. Contrôle à chaque livraison : l'Or, les deux Marques de Dressage, le Coffre d'Avancement Animal, la Caisse d'Équipement de Héros Chanceux, les Guides et Plans de Talisman ne bougent pas sans raison.
- Couverture partielle assumée (59 objets relevés, 66 chiffrés avec les calculés) : un objet non couvert vaut `null`, **jamais 0** (règle du « — », §9 `09b`).

### Les quatre blocs de correction
Aucun ne vient de l'Excel : **les conserver** quand on régénère `items`. Aucun ne stocke de prix, seulement un lien, un facteur ou un nombre de points ; ordre de calcul `derived` → `speedups` → `affinity` → `items`, puis `weights` (`scEurUnit()`, `scEurResolve()`).

**`derived`** `id -> {fromId, factor | from:[{id, factor}], packs?, ceiling?, how{FR,EN}}` : déduit un prix d'un ou plusieurs objets (`from[]` additionne) et **l'emporte sur le relevé**.
- Une règle irrésolue (base absente, facteur invalide, cycle) rend « — », jamais le relevé ; dans une somme, un terme irrésolu annule tout. Chaque terme a sa propre copie du chemin anti-cycle (deux termes peuvent partager une base).
- `ceiling: true` en fait un **plafond** : le relevé reprend la main si un pack vend moins cher, et `scEurRuleDecides()` dit alors qui décide (la colonne « Pack d'origine » suit). Utilisé pour la Clé en Or (1 500 gemmes → 1,29 €) et les lots d'EXP VIP de 10 et 100 (1 point = 2 gemmes).
- Cas réels : Caisse Mythique personnalisée = × 100 la Caisse Chanceuse ; Marche Rapide 1 = × 0,5 la 2 ; fragment ciblé de héros mythique = × 0,8 l'universel ; EXP VIP 1 000 et 10 000 = × 10 et × 100 le lot de 100 ; EXP de héros 1 000 et 5 000 = × 0,1 et × 0,5 le lot de 10 000 ; caisses de ressources personnalisées alignées sur le pain (Niv. 1 = 1 × `10k_bread`, Niv. 2 = 10 ×, Niv. 3 = 100 ×), **hors `weights`** puisqu'elles héritent déjà de la pondération du pain.
- Trois caisses du Chef valent ce qu'elles **rendent** (espérance du butin, calculée en amont ; le fichier ne garde que le résultat) : Matériaux de Talisman, Matériaux d'Équipement, Variétés d'Équipement. Leur ligne d'audit donne la somme nommée puis en divisions exactes, parce que les prix unitaires du tableau sont arrondis.

**`speedups`** `{basis{packs[], minutes, detail[]}, minutes{id -> durée}, how}` : prix d'**une minute** = prix du pack de base ÷ `basis.minutes` (`scEurBasisPrice()`, avec le prix de CE pack). Base : le pack le meilleur en minutes par euro (Carte Hebdo Accélérer, 7 140 min pour 6 €). Chaque accélérateur vaut sa durée, ce qui chiffre aussi l'Accélérateur 8h qu'aucun pack ne vend.

**`affinity`** `{basis{packs[], points, detail[]}, points{id -> points}, how}` : même idée pour les trois jetons d'affinité d'expert (Cor en cuivre 10 points, Coupe en argent 100, Épices d'élite 1 000). La base est le **pack** le plus généreux en points par euro, jetons additionnés, pas le jeton le moins cher (Rencontre Frontalière : 24 000 points pour 5 $). Chiffre aussi le Cor en cuivre. Un test vérifie que `basis.points` = somme de son `detail`.

`speedups.basis` et `affinity.basis` **se relisent dans l'Excel** à chaque livraison : ce sont des totaux par pack, invisibles dans `items`. Les objets chiffrés par barème affichent `basis.packs` comme pack d'origine (§9 `09b`).

**`weights`** `[{factor, ids[], how}]` : pondération **assumée**, un choix éditorial. × 0,25 sur bois, pain, pierre et fer, qui s'accumulent seuls en jouant ; l'or et les gemmes en sont exclus.
