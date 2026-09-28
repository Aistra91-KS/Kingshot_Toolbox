# MAP §8 · Persistance

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 8. Persistance (localStorage)

### Clés « chrome » (globales, hors `STORAGE_KEYS`, jamais exportées)
`hub_lang` (défaut `EN`), `hub_theme` (défaut `dark`), `help_seen_<id>`, `kt_profiles` (registre des profils), `shop_view` (`eur` par défaut / `gem`), `shop_currency` (sans valeur, suit la langue : `EUR` en FR, `USD` en EN), `tg_tab` (`tab-pre` / `tab-tg`), et pour le formulaire de retour `fb_last`, `fb_day`, `fb_cid`. Ce sont des préférences ou des garde-fous du **navigateur**, pas des données de joueur : dans `STORAGE_KEYS`, `profiles.js` les isolerait par profil (le garde-fou anti-spam repartirait à zéro) et `backup.js` les exporterait.

### Profils (`js/profiles.js`)
Proxy transparent sur `localStorage` : chaque clé de `STORAGE_KEYS` est rangée sous `kt::<profileId>::<clé>` pour le profil actif, les scripts n'en savent rien. Migration des données « à plat » vers le premier profil au premier chargement. API `window.Profiles` : `list/get/active/activeId`, `create/rename/remove/switch` (bascule = rechargement), `consumeSwitchToast`. Registre `{v, activeId, mig, profiles:[{id, name, color}]}` ; `mig` n'est posé que par une page qui charge `storage-keys.js`.
- Mutations **transactionnelles** (`commit()`) : sur une copie, publiée seulement si l'écriture réussit. `create()` rend le profil ou `null`. La suppression écrit le registre **avant** de purger les données.
- Registre validé sur les identifiants (absent, dupliqué, contenant « : ») : invalide, il est mis de côté sous `kt_profiles__corrompu` et reconstruit (`scanProfileIds()`) ; nom et couleur se réparent sur place.
- `backup.js` travaille sur le profil actif, ce qui permet de transférer un profil d'un appareil à l'autre.

### Clés métier (`js/storage-keys.js`, `window.STORAGE_KEYS`)
| Clé JS | Valeur | À savoir |
|---|---|---|
| `caserneHeroes` | `caserne_user_heroes` | |
| `caserneFilters` | `caserne_filters` | Porte `knownGens` : une génération absente de cette liste est nouvelle et démarre cochée. Sans le champ, seule la plus récente est recochée. `loadFilters()` vérifie que la valeur est un objet |
| `masters` | `masters_user_data` | |
| `researchDb`, `researchInputs` | `research_calc_db_v9`, `research_calc_inputs_v9` | `bonusAsPercent: true` marque le bonus saisi en %, **ne pas le retirer** (sinon ×100 une seconde fois) |
| `beartrap`, `beartrapJoiners` | `beartrap_data`, `beartrap_joiners` | autorisations de joiners par génération |
| `truegold` | `tg_calc_data_v3` | |
| `waracademy` | `wa_calc_data_v1` | niveaux avancés sous `advanced.<id>` dans `levels`, plus `ttgBudget`, `transfoUsed`, `creusetUse` et `activeSection` (`base`, `advanced` ou `global`, qui fixe aussi les arbres du plan) |
| `vikings` | `vikings_data` | |
| `shopcalcItems`, `shopcalcClassic`, `shopcalcEvents`, `shopcalcTab`, `shopcalcCollapsed` | `shopcalc_*` | |
| `shopcalcEventPlans` | `shopcalc_event_plans` | `{<id événement>: {played, buys:{<packId>:{<jour>:n}}, open}}` pour tous les événements |
| `pets` | `pets_levels` | |
| `petsPlanOff` | `pets_plan_off` | Les familiers **exclus** du plan (un nouveau y entre seul) |
| `petsPlan` | `pets_plan_stock` | Stock de l'onglet Plan, séparé des niveaux à dessein |
| `theaterOptimizer` | `theater_optimizer_data` | `{floor, pity, tokens{1..8}, toksOpen}` seulement ; le reste vit dans `shopcalcEventPlans` |

### Lire, écrire, avertir
- Lecture : `safeParse(key, fallback)`. Stockage refusé : repli silencieux. Valeur illisible : copie de l'original sous `kt::<profil>::<clé>__corrompu` **avant** tout écrasement, puis bandeau `ktWarnCorrupt()`. `safeParse` rend tel quel tout JSON valide : vérifier la forme (un `null` importé a déjà vidé la Caserne).
- Écriture : `window.ktSafeSet(key, value)` (rend `false` en cas d'échec) et `ktWarnUnsaved()`.
- Toujours appeler ces fonctions par `window.` et sous condition : `storage-keys.js` peut être en cache dans une version qui ne les connaît pas (§9 `09a`).

| Bandeau | Position | Quand |
|---|---|---|
| `ktWarnCorrupt()` | haut | sauvegarde relue illisible |
| `ktWarnDataFailure()` | haut | un fichier de `data/` n'est pas arrivé (bouton Réessayer) |
| `ktWarnStale()` | haut | un rendu s'est interrompu : chiffres périmés |
| `ktWarnProfilesReset()` | haut | registre des profils reconstruit |
| `ktWarnUnsaved()` | bas | une écriture a échoué : exporter avant de partir |

Les bandeaux du haut s'empilent dans `#kt-alerts`, un par nature, avec leur croix, et se retraduisent sur `langChanged` (`data-kt-fr` / `data-kt-en`). `scWarnDataFailure()` des boutiques passe par `window.ktTopBanner` quand il existe.
**Filet global** : `storage-keys.js` écoute `error` et `unhandledrejection` et appelle `ktWarnStale()` pour toute exception non rattrapée venant d'un script du site (le nom de fichier ou la pile doit contenir `location.origin`). `unhandledrejection` couvre les démarrages `async` des boutiques. TrueGold garde ses appels explicites dans `runCalculator()` (et pas autour du debounce `scheduleCalculation()`).

### Sauvegarde (`js/backup.js`)
Export et import par module (`BACKUP_MODULES`). L'export lit chaque module séparément (un module abîmé est exclu et nommé). L'import valide l'enveloppe **puis** chaque clé contre sa forme attendue (`BACKUP_SHAPES`, tableau ou dictionnaire selon la clé ; fiches de héros en nombres finis) **avant** la première écriture. Un échec en cours d'écriture rétablit l'état antérieur en deux passes. Les validateurs décrivent ce que le module sait relire, pas plus, pour rester compatibles avec d'autres versions.

### Données partagées entre outils
- `beartrap.js` lit `caserneHeroes` ; `vikings.js` réutilise `beartrap`.
- Bonus automatiques, toujours modifiables (badge Auto / Manuel, bouton ↺) : **Bonus Expert** du Piège à Ours = compétence « Avantage primitif » de Valora (`masters_db.json` + niveau saisi page Experts) ; **Bonus Animal** (Piège à Ours et Vikings) = compétence du Puissant Bison (`pets_db.json` + palier page Familiers).
- Héros joiners autorisés (Piège à Ours) : modale par génération de serveur, rangs C et D décochés par défaut. La tier-list ne choisit que le **capitaine** de chaque marche joiner ; les renforts (slots 2 et 3) ne jouent que sur la capacité (`penalty = 13470 − capacité(niveau)`) : n'importe quel héros débloqué, un par type, les capitaines potentiels réservés. La marche Hôte garde `organizerTierList`.
