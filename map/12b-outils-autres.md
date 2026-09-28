# MAP §12 · Outils (2/2) : Piège à Ours, Académie de guerre, Experts

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine. Le Planificateur de bâtiments et le bouton « Appliquer les modifications » sont dans `12a`.

## 12. Outils (suite)

### Piège à Ours (`beartrap.js`)

**Répartition des troupes** (`btDistributeTroops`, fonction pure : une capacité par marche en entrée, héros manquants déduits ; un `{inf, cav, arc}` par marche en sortie). Chaque type de troupe se partage selon **la part de chaque marche dans la capacité qui reste à remplir**. Ordre de remplissage inchangé (minimums infanterie et cavalerie, puis archers, cavalerie, infanterie).
- L'ancienne version ne plafonnait que les archers : la première marche vidait la cavalerie, et à 4 marches les deux dernières sortaient à 2 087 puis 0. Les totaux étaient justes, la composition non.
- **Dépassement de la part pour le seul surplus** : ce que les marches suivantes ne pourraient pas contenir (`troupes restantes − capacité des suivantes`).
- **Part arrondie au-dessus** : arrondie en dessous, 5 fantassins sur 6 marches donnaient 0 à la première, et `displayResults()` masquait tout le plan. Dépassement d'au plus 1 par type et par marche.
- **`displayResults()` teste que toutes les marches sont vides**, pas seulement la première (trois héros manquants la vident).
- Vérifié sur 40 000 tirages : capacités et stocks jamais dépassés, jamais moins de troupes envoyées qu'avant, écart entre marches de même capacité ramené de 34 768 à 2, cas à une marche identique. Le test embarque l'ancienne boucle comme témoin (§10).
- Vikings n'est pas concerné : `vikings.js` calcule une composition unique pour toutes les marches.

**La marche Hôte reprend les héros des autres marches** (`marchHolding`, `planHeroMoves`, `bestFreeHero`). Règles arrêtées par Aistra, ne pas les assouplir sans lui :
- **Seule l'Hôte reprend** (sinon le dernier qui édite gagne). `suggestHeroesForModal()` ne remplit `usedHeroIds` que hors Hôte ; à valeur égale, un héros libre est préféré.
- **La marche dépouillée est recomplétée** par le meilleur héros libre du même type ; pour un capitaine de joiner, `bestFreeHero()` préfère un héros autorisé par l'alliance. Sans remplaçant, le créneau reste vide et le récapitulatif le dit.
- **Rien ne bouge avant « Enregistrer »** : les déplacements attendent dans `pendingHeroMoves` ; annuler ou décocher « Hôte » les oublie. À l'application, on revérifie que la marche source détient toujours le héros.
- **La liste déroulante suit la même règle que le bouton** : hors Hôte, les héros pris ailleurs sont masqués ; sur l'Hôte, l'option nomme la marche qui les tient, avec la même confirmation.
- Libellés avec leurs propres guillemets (`heldBy`, `moveLeaves`, gabarits `%h`/`%m`) : chevrons en français, droits en anglais.
- Un seul écouteur `change` par liste (`sel.dataset.heroBound`) : `populateHeroDropdowns()` est rappelée à chaque changement de génération.
- Les marches générées automatiquement ne reprennent rien (`selectHeroesForMarches()`).

### Académie de guerre (`waracademy.js`, `wa_optimizer.js`)

**Rôle de chaque mode, tranché par Aistra, ne pas « corriger » l'un en l'autre** : Max recherches vise le nombre de recherches ; KVK vise les points, et un plan qui ne touche qu'un des arbres cochés est la bonne réponse (cocher un arbre dit « tu peux », pas « tu dois ») ; Score cible vise le moindre coût pour un score.

**Trois onglets, trois suggestions** (demande d'Aistra, 27/09/2026) : « Recherches de base » (les trois arbres de troupes), « Recherches avancées » (92 techs de TG5 à TG8, `truegold_war_advanced_db.json`) et « Suggestion globale ». **L'onglet ouvert décide des arbres du plan** (`enabledTrees`, `state.activeSection`) : base seule (troupes cochées), avancé seul (cases des troupes grisées), ou les deux mélangés quand c'est plus rentable. Seul l'onglet global partage poussière, TTG, pièces et accélérateurs entre les deux familles ; il n'affiche pas d'arbre, les niveaux se règlent dans les deux autres. La sortie rappelle la portée sous son titre (`.wa-out-scope`). En KvK, `suggest` essaie aussi les arbres de base sans l'arbre avancé : sans ce jeu, la suggestion globale perdait contre l'onglet de base dans 22 tirages sur 200 (jusqu'à 3,4 %). Elle ne fait plus jamais moins bien qu'un des deux onglets (test `wa-advanced`).
- **Conversion** : `WA_Optimizer.advancedTree` en fait un quatrième arbre (`id: 'advanced'`, `req {techId, level}` → `{r, lvl}`, `gold` → `coin`). L'or de l'arbre avancé est la même monnaie que les pièces (confirmé par Aistra).
- **TTG** : quatrième ressource contrainte (`ttgBudget`, null = illimité), **30 000 points KvK** par TTG comme sur la page TrueGold. Dans les ordres de sélection, un TTG pèse 30 poussières (son poids en points) : sans TTG, les formules redonnent exactement les anciennes. Vérifié sur 300 plans de base : identiques.
- **Pas de paquet `chain` sur l'arbre avancé** : score identique dans 120 scénarios sur 120, calcul 2,5 fois plus long. Un ordre pesant le TTG selon la rareté des stocks n'a jamais gagné sur 200 scénarios : retiré. `collectNeeds` s'arrête dès que le paquet dépasse un budget restant (même résultat, moins de calcul).
- **Coût** : 43 ms au pire pour un plan combiné (TG8, 200 jours d'accélérateurs) ; 159 ms pour tout le partage des pièces (211 plans) dans Chrome.
- **Affichage** : un bloc repliable par palier (celui du niveau 1), une rangée par rang de prérequis, une colonne par troupe dans l'ordre du jeu (Infanterie, Cavalerie, Archers, `TROOP_COL`, différent des onglets de base). Deux recherches sans troupe sur une rangée vont aux bords dans l'ordre des données, sauf celles de `ADV_SIDE` (Infirmeries à gauche, Bandage rapide à droite, comme en jeu). Entre deux rangées, une branche dessinée comme en jeu (`advLinkHtml`, `.wa-adv-link`) : trait épais, barre aux coins arrondis là où l'arbre se partage ou se rejoint, trois traits droits entre deux rangées de troupes. Elle s'allume (or, ou couleur de la troupe) quand la carte du bas a ses prérequis du niveau 1. Sous 620 px, un trait au milieu, toujours éteint entre deux rangées de troupes, car les cartes empilées n'y sont pas reliées. Saisie par −/+ ou au clavier dans le champ, bornée au maximum ; les cartes se mettent à jour en place (`refreshAdv`). Icônes : `img/WarAcademy/advanced/<iconSlug>.webp`, 25 fichiers (une par famille, communes à tous les paliers), tirés le 27/09/2026 de kingshotoptimizer.com (`/images/research-trees/truegold/<slug>.png`, 256 px ramenés à 128, WebP 84) ; le slug se déduit de l'identifiant sans son numéro de palier (`advIconSlug`).
- **Noms et effets en français** relevés en jeu (§6). Le bonus d'un niveau sort du moteur en anglais (« +30% Infantry Attack ») : `advBuff` remplace l'effet anglais par celui de la langue affichée, sur la carte et dans le plan.
- **Creuset** (demande d'Aistra, comme le Planificateur de bâtiments) : saisie « Transformations utilisées (max 100) » et case d'usage, sous les échanges de poussière. Table `rangeDataTTG` lue dans `truegold_db.json` (même source que le Planificateur, 100 transformations, paliers de 20 : 20 TG → 1,45 TTG jusqu'à 160 → 3,71). TTG détenu = `floor(stock + gain moyen)` ; ne joue que si le plan touche l'arbre avancé (`planUsesAdv`).
  - **Le même « TrueGold à convertir » paie échanges et creuset.** `recompute` essaie d'abord la relaxation (tout le TG offert aux deux) : si le plan reste payable une fois le creuset ramené au minimum (`kMinPour`), il est gardé. Sinon, chaque nombre de transformations est classé en évaluation allégée, puis 0, le maximum et les 3 meilleurs sont évalués pour de bon. Contrôlé contre l'exhaustif sur deux cas (600 et 4 000 TG, échange à 10 TG coché) : même optimum. Pire cas mesuré : 1 339 plans, 150 ms.
  - Départage `meilleurPlan` : le TG du creuset compte dans `tgDepense`.
  - « Appliquer » crédite le gain moyen, débite le TG, incrémente `transfoUsed`, et prévient que le gain est une moyenne (décision d'Aistra côté Planificateur, reprise ici).
- **Cache** : `advancedTree` est appelé sous `typeof` ; sans lui ou sans le fichier, la page tourne comme avant et l'onglet avancé le dit.

**Mode KVK glouton** : l'exhaustif dépasse 2 millions d'états dès 3 000 poussière. On garde le meilleur plan parmi `KVK_ORDERS` (`kvk`, `classic`, `dustdense`, `chain`) :
- **Ordre `chain`** : un niveau verrouillé par un prérequis est valorisé comme un paquet (niveaux manquants + lui), densité portée par sa première marche jouable. Le nœud de palier de troupe (2 765 pts/poussière) se cache derrière ~8 600 poussière de niveaux à 1 631. Garde-fous : le paquet doit tenir dans le budget de poussière **et** d'accélérateurs ; la première marche doit appartenir au paquet.
- **Relance sur chaque arbre seul** : le plan optimal concentre (13 540 poussières sur un arbre à 15 000). Coût borné : 4 ordres × (1 + nb d'arbres).
- Résultat : +4 à +6,5 % de points, à 0,4 % de l'optimum (1,8 % sur gros budgets), aucune régression sur 600 scénarios, 2 à 16 ms. Classique et Score cible ne passent pas par là.

**Échanges de poussière** (`DUST_TRADES`, `planTrades(besoin, stock)`, `besoin = null` rend la capacité maximale) : 5 000 pièces → 1 (200 par semaine), 5 TG → 13 (20 par semaine), 10 TG → 13 (sans plafond).
- **L'ordre du tableau est la priorité** : pièces d'abord (elles ne servent à rien d'autre sur le site), puis 5 TG avant 10 TG (deux fois plus de poussière par TrueGold, que l'autre page dépense aussi).
- **Budget en deux temps** (`recompute`) : le plan reçoit toute la capacité déclarée, puis on ne facture que le manque réel (`effDust − stock`). Sinon 100 TG déclarés partaient en entier quand 25 suffisaient.
- **Échange indivisible** : le surplus reste en stock et s'annonce (`outTradeOver`).
- Le champ dit « TrueGold à convertir », jamais « ton stock ».
- **Panneau entre l'arbre et la suggestion** (demande d'Aistra, `.wa-trade*`), une ligne cochable par échange (`state.tradeUse` → `stock.use`), celle à 10 TG décochée d'office. Colonne « dans ce plan » : « — » (autorisé, pas utilisé) contre « non utilisé » (décoché).
- Cellules mises à jour une par une (`renderTradeRows`) pour ne pas voler le focus. Sous 600 px, cartes empilées avec étiquettes `data-label`.
- Appel à `planTrades` gardé par `typeof` (cache, §9 `09a`).
- Plafonds hebdomadaires : le joueur saisit les échanges déjà faits ; « Appliquer » les incrémente, le joueur les remet à zéro au reset.

**Le coût en pièces des recherches est une contrainte** (`coinBudget`, `levels[].coin`) : débité dans les trois chemins qui engagent un niveau, en entier pour un niveau « en cours ». `coinBudget = null` redonne l'ancien comportement.
- Pièces à 0 = non comptées : la sortie affiche la quantité nécessaire. Saisies, elles bornent le plan (puce `dépensé / budget (reste)`).
- **Partage de la bourse entre recherches et échanges** : tous les partages sont classés par une évaluation allégée (`opts.rank`, un plan au lieu de 16), puis les meilleurs, leurs voisins et les deux extrémités sont réévalués. **Pas un balayage exact** : même score dans 60 scénarios sur 60 mesurés. Balayage complet hors KVK ou avec peu de candidats. Pas de dichotomie (courbe non unimodale, jusqu'à 9,8 % perdus).
- **Départage : le moins de TrueGold, puis le moins de pièces** (`meilleurPlan`). L'inverse brûlait le TrueGold en laissant dormir les pièces.
- **Bornes du balayage** : stock de pièces, plafond entamé, case de la ligne, rien d'autre. Une borne « poussière absorbable » a été essayée et retirée : ne pas la réintroduire.
- Coût mesuré à WA10 (le vrai pire cas) : 9 ms sans pièces, 68 ms au pire monté à la main (le balayage complet y coûtait ~900 ms).
- « Appliquer » débite le total (recherches + échanges) et ne touche pas aux pièces non déclarées.
- **Bloc de suggestion** : section des échanges avant le plan, suivie des stocks **après échanges et avant plan** (les nombres à recopier), comme les « Nouveaux stocks » de TrueGold. Pas d'émoji sur ces lignes (demande d'Aistra).
- **Séparateur de milliers pendant la frappe** (`MONTANTS`, `setMontant`, `formaterMontant`, `.wa-num` en `type="text" inputmode="numeric"`), curseur replacé après le même nombre de chiffres. Écouteur posé au `boot`, pas en attribut HTML ; `setMontant` teste `el.type` (un HTML en cache au champ numérique serait vidé).

### Experts (`masters.html`, `js/masters.js`)

**Portraits, deux jeux** : `img/Master/<Nom>.webp` (96 à 124 px) pour les pages `database/masters/*`, à ne pas remplacer ; `img/Master/hd/<Nom>.webp` (600×800) pour `masters.html` seul, via `masterPortrait()`, les 8 Experts équipés depuis le 21/09/2026. Les vignettes agrandies ×3 pixellisaient.
- **Ratio 3:4** (`.master-portrait` 240×320) : rogner la capture, ne jamais fabriquer de bande de fond. Des salissures collées au cadre se rebouchent par extrapolation **locale** du dégradé (un modèle global se trompait de 31 niveaux à cause du vignettage).
- Le bandeau du tiroir (`#modal-header-bg`, `cover` + `center 20%`) ne montre que 16 à 36 % de la hauteur : cadrer pour qu'il montre les yeux. Aena : cadrage `(10, 40, 402, 563)` puis Lanczos vers 600×800, WebP qualité 84 méthode 6 (31 Ko). Isnor : mise à l'échelle sur la hauteur, 25 px rognés de chaque côté.

**Icônes de compétence (`img/MasterSkill/`)** : la capture se détoure, elle ne se recadre pas. Cadre doré, ornements et badge « Lv. N » restent ; seul le fond crème (`#FFF9F2`) devient transparent, en remontant depuis le bord (jamais un seuil de couleur) et en retirant la part de fond des pixels de bord (sinon halo). Exception connue : les 8 icônes de compétence d'Isnor et d'Aena sont des découpes propres en 48 px sans cadre. Mélange assumé tant qu'on n'a pas les sources.
