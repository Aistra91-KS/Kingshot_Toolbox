# MAP §6 · Données (1/3) : fichiers de `data/`

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 6. Données

JSON édités à la main dans `data/`, sans script générateur ni CSV commité. Textes bilingues en `{EN, FR}`. Le relevé en argent réel a sa fiche (`06b`), le plan des familiers aussi (`06c`).

### `research_db.json`
Liste de 720 paliers : `{Tree, Name, Fr Name, Level, Time (d/h/m/s), Global Time, Bread, Wood, Stone, iron, Gold, Etage, reqs[], Academy, Power, Buff Type, Buff Value, Buff Unit, Image}`.
- `reqs` ne liste que les prérequis **croisés** ; le niveau précédent de la même recherche est implicite (`isAvailable()`).
- `Buff Type` est le libellé anglais ; la traduction vit dans `BUFF_FR` de `db-research.js`. `Academy`, `Power`, `Buff *` servent les pages `database/research/*` ; le calculateur n'utilise qu'`Image`.
- `Iron Gathering V` s'appelle `Iron Mining V` : la table `RS_RENAMED` de `research_script.js` reprend la progression des anciens noms, ne pas la retirer.
- Source : `kingshotoptimizer.com`, recoupée avec la base LordRush (53 coûts corrigés le 20/09/2026).

### `buildings_db.json`
`{_meta, categories, buildings[]}` : les niveaux **standard** 1 à 30 des 19 bâtiments, avant l'Or Véritable. Complète `truegold_db.json` (niveaux Or Véritable), ne le recouvre pas.
- Bâtiment `{id, name{EN,FR}, category, maxStd, levels[]}` ; niveau `{level, tc, req[], bread, wood, stone, iron, time (s), power}`.
- `tc` = niveau de Centre-ville exigé ; `req` = prérequis au format du jeu (`"Embassy Lv. 29"`). Un `req` vers un bâtiment absent de la base ou de `PRE_ORDER` est **ignoré** exprès (la Tour de défense bloquerait Moulin et Scierie sans moyen de la lever).
- Source : `kingshotoptimizer.com`, 310 niveaux recoupés avec LordRush sans écart.

### `truegold_db.json`
`rangeDataTTG`, `bldgMap`, `defaultBuildings`, `dbDataRaw`, `levelsReference`, `buildingsConfig`. L'ordre de `defaultBuildings` est l'ordre d'affichage : `normalizeBuildingOrder()` le réapplique après `loadData()`, sinon les sauvegardes garderaient l'ancien.

### `truegold_war_db.json`
`{meta, scoring, trees}` ; `scoring = {pointsPerDust:1000, pointsPerSpeedupMinute:60}` ; `trees` = 3 arbres × recherches × niveaux (`req` même arbre, `reqWA` palier du bâtiment). Généré depuis un CSV non commité.

### `truegold_war_advanced_db.json`
`{meta, categories, techs}` : 92 techs, 1 010 niveaux, 4 catégories. Tech `{id, baseId, tier, name{EN,FR}, category, effect{EN,FR}, effectUnit, iconSlug, maxLevel, unlockWA, totals, levels[]}` ; niveau `{level, reqWA, req[{techId,level}], ttg, dust, gold, bread, wood, stone, iron, time, effectTotal, effectDelta, raw}`.
- `time` en minutes. `effectTotal` = bonus cumulé à ce niveau, `effectDelta` = gain du niveau.
- Précision mixte : `dust`, `ttg`, `time` exacts ; ressources arrondies par la source (`17K`), `raw` garde le texte d'origine.
- **Français relevé en jeu** par Aistra le 28/09/2026 : `name.FR` et `effect.FR` des 92 techs. Seuls les noms de catégorie restent à `null` (non affichés). Ne jamais inventer ni traduire automatiquement un libellé manquant.
- Lu par la page Académie de guerre via `WA_Optimizer.advancedTree`, qui le ramène à la forme d'un arbre de base (`req` → `{r, lvl}`, `gold` → `coin`) : voir §12 `12b`.

### `heroes_db.json`
Liste de 37 héros : `{id, name, generation, rarity, troopType, goodJoinerBear, GoodJoinerBearRank?, conquestSkills[], skills[], widget?}`.
- `name` est une chaîne (nom en jeu), qui sert aussi de nom de portrait (`img/heroes/<name>.webp`).
- Compétence `{name{EN,FR}, effect{EN,FR}, levels[5]}`. Les 37 héros ont leurs compétences de conquête depuis le 22/09/2026 ; un héros sans `conquestSkills` n'a pas de fiche (§11).
- `widget` = Équipement exclusif des légendaires (25) : `{name, effectConquest{name, description, levels[5]}, effectExpe{…}}` (affichage : §9 `09c`).

### `beartrap_joiners_db.json`
`{_meta, byGeneration}` : `byGeneration[gen] = {S:[ids], A, B, C, D}`, rang du héros comme joiner, 8 générations. À ne pas confondre avec `organizerTierList` (en dur dans `beartrap.js`), qui classe les meneurs de rally : **les deux se mettent à jour ensemble** à chaque génération. `tierListFor()` retombe sur la génération connue juste en dessous si la page et le script ne sont pas de la même version (cache). Doublon d'id : le meilleur rang l'emporte.

### `masters_db.json`
Liste de 8 experts : `{id, name, title, affinityBonus, affinityMilestones[{level,affinity,emblems,bonus}], passive, skills[], affinity}`.
- `effect` remplace le ou les « X » de la phrase : `"+27%"`, ou `"(a;b)"` pour deux valeurs (deux colonnes dans la fiche, §3).
- Milliers à l'anglaise dans le JSON (`"(50,000;60%)"`), affichés selon la langue par `effLocale()` (présent dans `db-masters.js` et `masters.js`).
- `affinityBonus` et `TextToInclude` nomment la stat du bonus d'affinité : seule source, le panneau « Stats d'Affinité Max » en jeu. Facultatifs : sans eux la page perd l'information sans casser.
- Textes FR d'Isnor et d'Aena relevés en jeu, pas traduits ; les noms de talent (`passive.name.FR`) viennent d'Aistra. Noms propres fixés : *Eternity's Reach* = l'Éternité à Portée, *Cesares Guards* = Gardes Césarès, *Charm Design* = Plans de Talisman, *Charm Guide* = Guide des Talismans, *Copper Ore* = Minerai de Cuivre.

### `shopcalc_items.json` (référentiel gemmes)
Liste de 94 objets : `{id, name{EN,FR}, img?, category, gemValue, skin?}`.
- Accélérateurs restreints (entraînement, icône casque) saisis comme généraux (`1h_general_speedup`, `5m_general_speedup`) sur toutes les boutiques : une minute vaut une minute (choix d'Aistra). Deux lignes du même objet au même palier sont alors normales.
- `img` découple le nom affiché du fichier d'icône : `scImg()` prend `img`, sinon `name.EN`. **Renommer un `name.EN` sans vérifier `img/Item/` casse l'icône sans erreur.**
- `skin: true` (7 entrées) = variante visuelle appelée par `skinId`, sans `category` ni `gemValue`. Un `skinId` inconnu échoue sans erreur : vérifier après ajout.

### `shopcalc_classic.json`, `shopcalc_chests.json`, `shopcalc_events.json`
- Classiques : `{id, slug, name, resourceName, resourceShort, items[{itemId, qty, cost}]}`. Coffres : `{id, slug, name, items[…, skinId?]}`.
- Événements : `{id, slug, name, startsAt?, endsAt, trackOwned?, resourceName, items…}`. `trackOwned` ajoute la colonne « Déjà pris » (§13), `startsAt` lui donne son plafond.
- `items[].tier` = palier de prix : le même objet vendu plusieurs fois à prix croissant, une ligne par palier, colonne « Palier » triable, podium dédoublonné par `itemId`.
- `endsAt`, `startsAt`, `trackOwned`, `tier` sont des champs **admin**, réappliqués depuis le fichier à chaque chargement : un vieux stockage ne peut pas les masquer.
- `slug` (nom de la page, clé de `scFindBySlug()`) a été ajouté **à côté** de `id`, jamais à sa place : les éditions des joueurs sont rangées par `id`, le renommer les effacerait.

### `shopcalc_euro.json`
Relevé en argent réel des packs payants : `map/06b-releve-euro.md`.

### `events/<slug>.json` (contenu d'un événement)
`{_meta, missions[], freeDailyPack, waypost, stallMilestones[], travelMilestones?, seasonalMissions[], packs[]}`, distinct de la boutique. `_meta = {event, slug, days, tier, updatedAt, source, note, stallName?, travelName?}` ; `event` = `id` de la boutique et clé de persistance des achats (§8).
- Lot de récompenses, même forme partout : `{coins?, stall?, travel?, items[]}` ; un item est `{itemId, qty}` (chiffré) ou `{label:{EN,FR}, qty}` (listé, jamais chiffré, règle du « — »). `eurExclude: true` sort un objet du total en euros.
- Décochés à l'ouverture : `_meta.excludePackItemsByDefault` (tout ce que versent les packs) et `_meta.excludedByDefault` (liste précise), cumulables.
- Packs : `once` (lot `immediate` une fois puis `daily`), `requires` (exige l'achat d'un autre pack), `perDay` (plafond journalier, compteur cyclique) **ou** `maxTotal` (stock sur toute la période, librement réparti), `lastDay`, `priceEur`/`priceUsd` toujours renseignés, `short{EN,FR}` pour la colonne « Provenance ».
- `doublesDailyMissions` : un pass qui double les récompenses des missions du jour d'achat à la fin ; `{coins, stall, travel, itemIds[]}` dit ce qui est doublé. Ni le pack gratuit ni la piste gratuite ne sont des missions.
- `orderRewards {coins[], then}` : la monnaie versée par des commandes que le joueur compte lui-même (`SE_PLAN.orders`) ; `coins[i]` paie la (i+1)-ième, `then` chacune des suivantes. Sa présence suffit à afficher la tuile « Monnaie prévue ». Libellé et bulle : `_meta.ordersName`, `_meta.ordersTip` ; `_meta.exploreTip` remplace de même la bulle de la piste d'exploration, qui parle d'Amulettes par défaut.
- `travelMilestones {from, every, reward}` : piste répétée sans plafond. `stallMilestones` : liste finie. `seasonalMissions` : réclamées une fois (`minDays`, `requiresPurchase`), jamais doublées.
- `requiresPurchase` : en jeu, n'importe quel achat valide la mission. Mission **saisonnière** → une case « validée ? » (`purchaseOk`) ; mission **quotidienne** → compteur « jours d'achat ailleurs » (`outsideBuys`). Une case sur une quotidienne la validerait tous les jours.
- La monnaie principale n'est jamais nommée ici (`resourceName` de la boutique). Noms FR : Minstrel Legends = Légendes des Ménestrels, Waypost Sojourner = Visiteur de Passage, Stall Points = Points de Vente.
- Contrôles chiffrés rejoués par `tests/shop-event.test.mjs`. Le F2P du Stand d'Aventure vaut 32 388 gemmes, pas les 30 588 du tableur : l'écart est la piste de voyage, ne pas le « corriger ». Chaque source y donne autant de Points de Vente que de Pièces d'Aventure : un écart signale une ligne manquante.

### `events/theater-shop.json`
Même schéma, plus :
- **Deux échéances** : `_meta.endsAt` (fin de l'événement, explorations et packs) et `endsAt` de la boutique dans `shopcalc_events.json`, 24 h plus tard pour dépenser les Jetons. Ne jamais borner un plan sur la fermeture de la boutique. Entre les deux, l'optimiseur affiche « L'événement est terminé ».
- `_meta.startsAt` + `_meta.days` numérotent les jours. **Ces dates valent pour une édition** : les reprendre à la suivante, sinon zéro jour restant.
- `missions[]` : 5 + 5 + 10 amulettes gratuites, + 20 pour un achat. `seasonalMissions[]` : cadeau d'ouverture de 10, **déduit** d'un écart en jeu, à confirmer.
- `explorationMilestones[] {points, reward}` : piste d'objets **cumulative** ; le joueur saisit lui-même les Amulettes dépensées (`SE_PLAN.explore`), `_meta.exploreName` nomme le champ.
- Pas de monnaie versée : la tuile « Monnaie attendue » est masquée (`seHasCoins()`) et `_meta.currencyNote` explique pourquoi. Les Amulettes sont des `label` (listées, jamais chiffrées). Le petit coffre cadeau d'alliance des packs est volontairement absent.

### `events/fantasy-theater.json` (mécanique du tirage)
`{_meta, pity, jump, fanstars, theater, fortress, rules}`.
- `pity.chances` = chance de monter à la n-ième tentative (10/30/60/80/100 %, remis à zéro à chaque montée) ; `jump` = saut de 1, 2 ou 3 étages ; `fanstars.drops` au sommet, 5 pour la Forteresse.
- `costByFloor` indexé par l'étage de **départ** (Théâtre jusqu'à 6, Forteresse jusqu'à 7).
- `theater.tokensByFloor` = valeurs par défaut relevées sur un serveur, modifiables dans la page ; `fortress.tokensByFloor` ne porte que le sommet.
- `rules.failTokenMultiplier` (10) : une exploration ratée paie 10 × son coût en Jetons. Relevé en jeu le 04/09/2026 ; il ne change pas l'arbitrage pousser/encaisser, seulement les montants. Absent du fichier, il vaut 0.
- `theater.amuletLabel` doit être **exactement** le `label` des amulettes de `theater-shop.json`.

### `changelog.json`
`{_meta, releases[]}`, la plus récente en premier. Release `{version, date "AAAA-MM-JJ", changes[]}`, sans titre de version. Change `{type: new|improved|fixed, title?{EN,FR}, text{EN,FR}, href?, linkLabel?}` : chaque modification a son titre. Plan de page h1 → h2 (version) → h3 (modification).
- Numérotation `MAJEURE.FONCTIONNALITÉ.CORRECTIF` : 2ᵉ chiffre pour une fonctionnalité, 3ᵉ pour le reste ; `SITE.version` suit. Les 0.x gardent leur numérotation.
- Les ancres viennent du numéro (`v1-13-1`) : **renuméroter une version publiée casse les liens des annonces Discord.**

### `pets_db.json`
`{_meta, pets[]}` : 14 familiers, 7 générations. Pet `{id, name{EN,FR}, generation, maxLevel, skill{name, desc, cooldown?, effects[{label, note, values[]}]}, advancements[{growthManual, nutrientPotion, promotionMedallion}], petFood[]}`.
- Palier de compétence = nombre d'avancements faits ; l'avancement au cap N débloque le palier N/10 sans changer le niveau.
- `values[]` : une valeur par palier ; `desc` garde le « X » ; `petFood[i]` = coût du niveau i+1 à i+2 ; `note` n'est plus affiché. Source : Excel non commité, FR relu à la main.

### `pets_event.json`
Barème de l'événement KVK « Entraînement Animalier », à part car il peut changer d'une édition à l'autre. `advancementScore[cap]` = score gagné en avançant à ce cap ; `pointsPerScore` (50, vérifié en jeu le 09/09/2026) ; les niveaux entre deux caps ne rapportent rien ; `chest.choices` = ce qu'un coffre offre **au choix** (manuels, potions ou médaillon). Si le barème change, le noter dans `_meta.notes`. Les quantités restent dans `pets_db.json`.
