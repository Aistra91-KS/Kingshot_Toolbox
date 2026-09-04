# Audit de dette technique — Kingshot Toolbox

**Généré le** 2026-09-03 · **Commit auditée** `21a180d` · **Périmètre** dépôt public complet
**Volume** 31 428 lignes de code source (12 474 HTML · 14 435 JS · 4 519 CSS) + 50 154 lignes de JSON de données · 70 pages HTML · 31 modules JS · 99 commits sur 12 jours

> **Suivi — 3 septembre 2026, après décision de Paul.** Les chantiers 1, 2, 3 et 5 du rapport
> sont **faits** (commits `c1bdae5`, `85464b2`, `fbc000c`) : les constats correspondants sont
> marqués **RÉSOLU** ci-dessous. Le chantier 4 (découper `SUGGERER_KINGSHOT`) est **écarté** —
> TrueGold est considéré comme terminé, et refactorer un moteur stabilisé déplacerait le risque
> sans rien rapporter au joueur : A03 et A04 passent en **choix assumé**. Une erreur de l'audit
> a par ailleurs été corrigée : A17 n'était pas une dette (cf. « Ce qui a l'air mauvais »).
>
> **Relecture de la branche (4 septembre).** Deux régressions introduites par ce lot ont été
> rattrapées : `tools/` et `tests/` seraient partis en ligne (GitHub Pages publie tout le dépôt —
> `_config.yml` les exclut désormais), et le jumeau français n'était couvert par aucun garde-fou
> (`--check` compare maintenant les scripts et feuilles des deux jumelles). La relecture a aussi
> trouvé **deux bugs qui vivaient déjà sur `main`**, hors périmètre de l'audit, corrigés dans la
> foulée : le barème de jetons du Théâtre lisait « 1 600 » comme 1 (séparateur de milliers), et
> la Sauvegarde Globale oubliait le Théâtre depuis toute page autre que la sienne.

---

## Résumé exécutif

1. ~~**La duplication HTML est la dette n°1**~~ — **RÉSOLU** (`fbc000c`). Pour mémoire : 78 lignes identiques sont recopiées dans ≥15 des 19 pages boutique ; les 9 pages `database/buildings/` ne diffèrent que de **24 lignes sur 654**. Le churn le prouve : chaque page boutique a été modifiée 12 à 13 fois en 12 jours, presque toujours pour le même changement répété à la main. Coût réel : toute évolution du gabarit = 19 à 32 éditions, avec le risque d'en oublier une.
2. **`SUGGERER_KINGSHOT()` fait 981 lignes** — **écarté par décision** (TrueGold est terminé). (`js/truegold_script.js:739`) — plus de la moitié du plus gros fichier du dépôt. Elle enchaîne validation, indexation, glouton, résolution exacte KVK et rendu HTML. Ses propres commentaires `// ==== SECTION ====` dessinent déjà les coutures de l'extraction.
3. ~~**Deux conventions de nombres dans le même tableau.**~~ — **RÉSOLU** (`c1bdae5`). `spNum()` (`js/shop-page.js:228`) formate avec la locale du **navigateur**, `scFmtNum()` (`js/shop-core.js:509`) avec la langue du **site**. Résultat visible aujourd'hui en français : `12,000` et `×10.00` dans la lecture gemmes, `13,89 €` et `0,0012` dans la lecture argent réel — sur la même page.
4. ~~**Les 5 fichiers JSON chargés en série**~~ — **RÉSOLU** (`c1bdae5`). (`js/shop-core.js:657`), chacun avec revalidation réseau. Cinq allers-retours enchaînés là où un `Promise.all` en ferait un seul temps d'attente.
5. **Aucun README** à la racine d'un dépôt public. `MAP.md` et `CLAUDE.md` sont excellents mais s'adressent à Claude, pas à un visiteur de GitHub.
6. **`MAP.md` se contredit lui-même** : 6 valeurs `derived` en ligne 117, 13 en ligne 371 (la réalité est 13). Trois autres compteurs ont dérivé. C'est le fichier le plus modifié du dépôt (38 commits) — il vit, mais ses chiffres écrits à la main non.
7. **Primitives d'interface dupliquées** : 8 fonctions d'échappement, 13 formateurs de nombres, 7 implémentations de modale indépendantes. Aucune n'est fausse ; ensemble elles garantissent que la prochaine correction n'en touchera qu'une.
8. **Accessibilité des modales** : 5 des 7 modales n'écoutent pas `Escape`, et **aucune** ne gère le focus (aucun `.focus()` dans tout le dépôt). Un utilisateur au clavier reste piégé derrière la boîte.
9. **17 objets du référentiel n'ont pas d'image**, ce qui laisse 13 lignes muettes réparties sur 6 boutiques ; 2 packs cités n'ont pas la leur, ce qui casse leur aperçu au survol.
10. **Ce qui va bien, et qu'il faut protéger** — auquel s'ajoutent désormais 7 tests et une CI : intégrité référentielle des données **parfaite** (0 identifiant orphelin sur 3 fichiers de boutiques + le relevé €), **0 fonction morte**, sitemap complet (68/68), versions `site-config` ↔ `changelog` alignées, `data-i18n` appliqué à 419 endroits contre 16 ternaires résiduels.

---

## Modèle mental de l'architecture

**Ce que le système est réellement.** Un site statique GitHub Pages, sans build ni backend, qui rend des **outils de calcul de jeu** à partir de **JSON de données** et de **saisies joueur persistées en `localStorage`**. Trois couches, et une seule est vraiment structurée :

- **Couche chrome (partagée, saine)** — `site-config.js` (manifeste unique de navigation), `header.js`, `footer.js`, `lang.js` (bascule FR/EN à chaud par événement `langChanged`), `storage-keys.js` (registre de clés + `safeParse`), `profiles.js` (proxy transparent sur `localStorage` isolant les profils), `help.js` (modale + bulles), `backup.js`. Cette couche est bien pensée : un point d'entrée par responsabilité, des conventions écrites, et `profiles.js` réussit le tour de force d'isoler les données par profil sans qu'aucun appelant ne le sache.
- **Couche boutiques (la plus récente, la plus disciplinée)** — `shop-core.js` (données + calcul), `shop-page.js` (rendu générique piloté par `window.SHOP_SLUG`), `shop-event.js`, `shop-theater.js`, `shop-items*.js`. C'est la seule famille où **une page HTML est un gabarit vide** rempli par un moteur partagé. Le prix payé est un couplage de cache assumé et documenté (§9 de `MAP.md`) : les `<script>` n'ont pas de cache-busting, donc une page ne peut pas appeler un nom global né dans le même lot que le core.
- **Couche outils historiques (chacun son royaume)** — `truegold_script.js` (1 838 l.), `beartrap.js` (1 617 l.), `waracademy.js`, `caserne.js`, `masters.js`, `pets.js`, `vikings.js`, `research_script.js`. Chacun refait à sa façon ce que les autres font déjà : charger un JSON, formater un nombre, échapper une chaîne, ouvrir une modale, lire la langue. Ce ne sont pas de mauvais fichiers — ce sont **sept fois le même fichier écrit sept fois**.

**Le fait générateur de la dette.** Le dépôt a 12 jours et 99 commits : c'est un projet en accélération, pas un projet négligé. La contrainte fondatrice — *pas de build, GitHub Pages, le HTML doit être lisible par un moteur de recherche sans exécuter le JS* (`MAP.md` §9) — est parfaitement justifiée pour le référencement, et elle **interdit la seule solution habituelle à la duplication HTML** (un moteur de gabarit à l'exécution). D'où 70 pages qui se recopient. La sortie n'est pas d'abandonner la contrainte, c'est d'accepter un **générateur hors ligne** dont la sortie est commitée : le HTML servi reste statique et complet, mais il cesse d'être écrit à la main.

**Divergence avec la documentation.** `MAP.md` décrit fidèlement l'architecture — mieux que la plupart des dépôts de cette taille. Ses **chiffres**, en revanche, ont dérivé (§ findings D01–D05) : ils sont recopiés à la main dans la prose alors qu'ils sont tous calculables depuis les données.

---

## Findings

Sévérité : **Critique** (casse ou trompe l'utilisateur) · **Haute** (coût récurrent avéré) · **Moyenne** (frottement réel) · **Basse** (hygiène).
Effort : **S** < 1 h · **M** 1 h – 1 j · **L** > 1 j.

| ID | Catégorie | Fichier:Ligne | Sév. | Eff. | Description | Recommandation |
|----|-----------|---------------|------|------|-------------|----------------|
| A01 **RÉSOLU** | Duplication | `shop/arena.html:1-42` (×19) | Haute | M | 78 lignes identiques partagées par ≥15 des 19 pages boutique : `<head>`, gtag, garde de thème, JSON-LD, fil d'Ariane, blocs de scripts. Churn de 12-13 commits par page confirme l'édition répétée. | Générateur hors ligne `tools/build-pages.py` : gabarit + `pages.json` (slug, titres, descriptions, intro FR/EN) → HTML commité. Aucune sortie de la contrainte « pas de build en ligne ». |
| A02 **RÉSOLU** | Duplication | `database/buildings/barracks.html:1` (×9) | Haute | M | 654 lignes par page, **24 seulement diffèrent** d'une page à l'autre. ~5 670 lignes de recopie pure. | Même générateur qu'A01 ; ces pages sont les plus mécaniques du dépôt. |
| A03 **ÉCARTÉ** | God function | `js/truegold_script.js:739` | Haute | L | `SUGGERER_KINGSHOT()` = 981 lignes, 15 paramètres positionnels, 5 responsabilités (garde-fous, indexation, glouton, solveur KVK exact, rendu HTML). | Extraire selon ses propres bandeaux `// ====` : `tgValidateInputs()`, `tgBuildIndex()`, `tgGreedy()`, `tgSolveKvk()`, `tgRenderPlan()`. Passer un objet d'options au lieu de 15 positionnels. |
| A04 **ÉCARTÉ** | God file | `js/truegold_script.js:1` | Moyenne | L | 1 838 lignes : données, calcul, rendu, application du plan, i18n. | Scinder en `truegold-core.js` (calcul pur) / `truegold-ui.js` après A03. |
| A05 | God file | `js/beartrap.js:1` | Moyenne | L | 1 617 lignes, 3 modales, 2 chargeurs de données, l'optimiseur et le rendu. | Sortir d'abord les 3 modales (A14), puis l'optimiseur en module pur. |
| A06 | God function | `js/wa_optimizer.js:108` | Moyenne | M | `runPlan()` = 242 lignes. | Extraire la boucle de sélection et la mise en forme du plan. |
| A07 | God function | `js/shop-theater.js:560` | Moyenne | M | `stRender()` = 194 lignes, construit 5 tableaux d'affilée en concaténation de chaînes. | Une fonction de rendu par tableau ; `stRender()` ne fait plus qu'assembler. |
| A08 | God function | `js/beartrap.js:1263` | Moyenne | M | `selectHeroesForMarches()` = 161 lignes mêlant sélection et affichage. | Séparer sélection (pure) et rendu. |
| A09 | God function | `js/masters.js:288` | Moyenne | M | `updateMasterUI()` = 160 lignes. | Découper par bloc d'interface. |
| A10 | God function | `js/shop-event.js:228` | Moyenne | M | `seCompute()` = 154 lignes : c'est le cœur du calcul d'événement, sans test ni point d'entrée isolé. | Extraire les sous-calculs (missions, paliers, packs) en fonctions pures nommées. |
| A11 | Jumeaux | `js/db-masters.js:35` ↔ `js/db-pets.js:32` | Moyenne | S | Les deux pages de base de données partagent squelette, `esc()`, `fmt()`, le `fetch` avec contrôle `r.ok` et la boucle de rendu — copiés, pas factorisés. | Extraire `js/db-table.js` (esc, fmt, fetch, tri, filtre) ; les deux fichiers ne gardent que leurs colonnes. |
| A12 | Duplication | `js/beartrap.js:417`, `js/changelog.js:30`, `js/db-masters.js:35`, `js/db-pets.js:32`, `js/footer.js:55`, `js/header.js:299`, `js/shop-core.js:213` | Moyenne | S | **7 fonctions d'échappement** distinctes, aux périmètres différents (`scEscAttr` n'échappe pas `>`, les autres si). | Une seule `ktEsc()` dans un `js/util.js` chargé en premier. Attention à la règle de cache §9 : introduire le nom **avant** de l'appeler depuis les pages. |
| A13 | Duplication | `js/shop-page.js:228`, `js/shop-core.js:503-525`, `js/shop-event.js:394`, `js/shop-theater.js:332`, `js/truegold_script.js:1728`, `js/research_script.js:185`, `js/db-masters.js:39`, `js/db-pets.js:36` | Haute | M | **13 formateurs de nombres**. Voir C01 : ils ne donnent pas le même résultat. | Un module `format.js` : `num`, `fix`, `money`, `ratio`, tous dérivés de `scLang()`. |
| A14 | Duplication | `js/backup.js:165`, `js/beartrap.js:258`, `js/caserne.js:439`, `js/masters.js:244`, `js/header.js:647`, `js/help.js:100` | Moyenne | M | **6 implémentations de modale** avec chacune son ouverture, sa fermeture, son overlay. Seules `help.js` et `header.js` écoutent `Escape` (cf. X02). | Une `ktModal(open/close)` partagée, reprenant le meilleur des deux (Escape + clic sur l'overlay + retrait du listener). |
| A15 | Absence de couche | `js/beartrap.js:291,308,477`, `js/caserne.js:212`, `js/masters.js:161`, `js/truegold_script.js:415`, `js/vikings.js:121`, `js/pets.js:463` | Moyenne | M | `heroes_db.json` chargé par 2 modules, `masters_db.json` par 4, `pets_db.json` par 4. Aucun cache : deux outils sur la même page refont le même appel, chacun avec sa propre normalisation. | `js/data.js` : `ktData.get('masters_db')` avec mémoïsation par URL et une seule normalisation. |
| A16 | Duplication | 11 sites, dont `js/caserne.js:137,362,591`, `js/masters.js:181,188,254,292`, `js/backup.js:138,175` | Basse | S | `window.GlobalLang ? GlobalLang.get() : (localStorage.getItem('hub_lang') \|\| 'EN')` recopié 11 fois — un repli défensif contre un `lang.js` absent qui ne peut pas arriver (il est chargé avant partout). | Appeler `GlobalLang.get()` directement ; ou une `ktLang()` unique si le repli est jugé nécessaire. |
| A18 | Code mort | `css/style.css:1814-1840`, `css/style.css:1952-1956` | Basse | S | Bloc `.shop-item-card` / `.sic-*` (~34 déclarations) : plus aucune classe `sic-` n'apparaît dans le HTML ou le JS — vestige des cartes d'objets remplacées par `.sx-table`. | Supprimer le bloc après un `grep -r "sic-"` de confirmation. |
| A19 | Code mort | `css/*.css` | Basse | S | 32 classes CSS déclarées et jamais employées (4,5 % de 705). Outre `sic-*` : `.sc-shop`, `.shop-card-grid`, `.event-grid`, `.hub-footer`, `.is-improved`, `.is-new`, `.collapsed`. | Passe de nettoyage unique, puis vérification visuelle des 3 familles de pages. |
| A20 | CSS | `css/style.css` (62 occurrences) | Moyenne | M | 62 `!important` dans un seul fichier de 2 893 lignes : symptôme d'une guerre de spécificité entre le chrome global et les feuilles d'outils. | Traiter par lots : chaque `!important` retiré doit être remplacé par une spécificité correcte, pas par une autre exception. |
| A21 | CSS | `css/style.css` (119 hexa), `css/shop.css` (47) | Moyenne | M | 183 couleurs en dur contre 39 variables `--*` déclarées : la charte graphique par variables n'est appliquée qu'à moitié. Les couleurs de catégorie sont même dupliquées en JS (`js/shop-core.js:199-203`). | Remonter les hexa récurrents en variables ; exposer les couleurs de catégorie en CSS et les lire depuis le JS via `getComputedStyle`, ou l'inverse — une seule source. |
| C01 **RÉSOLU** | Cohérence | `js/shop-page.js:228` vs `js/shop-core.js:509` | **Critique** | S | `spNum()` = `toLocaleString()` **sans locale** → suit le navigateur ; `scFmtNum()` suit `scLang()`. Les deux servent le même tableau (`shop-page.js:271,275,317,320,328,344`). En FR aujourd'hui : `12,000` / `120,000` à côté de `13,89 €` / `0,0012`. | `spNum` délègue à `scFmtNum`. Un paramètre sur une fonction existante — compatible avec la règle de cache §9. |
| C02 **RÉSOLU** | Cohérence | `js/shop-page.js:208,359`, `js/shop-page.js:178` | Haute | S | Le ratio de la lecture gemmes passe par `toFixed(2)`, qui écrit **toujours** un point décimal, quand la lecture € passe par `scFmtRatio()` localisé. En FR : `×10.00` contre `0,0012`. | Router `toFixed` vers `scFmtFix()` (`shop-core.js:503`), déjà localisé. |
| C03 | Contrats | `js/research_script.js:113,133`, `js/truegold_script.js:614`, `js/beartrap.js:616`, `js/waracademy.js:210`, `js/pets.js:26` | Moyenne | S | 18 `JSON.parse` bruts contre 22 `safeParse`, alors que `MAP.md` §8 impose `safeParse` sans exception. Un `localStorage` corrompu (édition manuelle, quota, extension) casse la page au lieu de retomber sur le défaut. | Remplacer par `safeParse(STORAGE_KEYS.x, défaut)`. Les `JSON.parse(JSON.stringify(...))` de clonage ne sont pas concernés. |
| C04 | Contrats | `js/pets.js:26` | Moyenne | S | `pets.js` définit sa propre constante `LS_KEY` au lieu de passer par `STORAGE_KEYS` — donc hors registre, hors export `backup.js`, hors isolation par profil de `profiles.js`. | Déclarer la clé dans `js/storage-keys.js` et l'utiliser. **Prévoir la migration** de l'ancienne clé, sinon les données des joueurs actuels disparaissent. |
| C05 | Cohérence | `js/caserne.js:508` | Basse | S | Seul site à lire `localStorage.getItem('hub_lang')` **sans** le garde `window.GlobalLang`, contrairement aux 10 autres (A16). | Aligner sur `GlobalLang.get()`. |
| C06 | i18n | `js/header.js`, `js/research_script.js`, `js/truegold_script.js`, `js/waracademy.js` (16 sites) | Basse | M | 16 ternaires `lang === 'FR' ? … : …` en dur, contre 419 `data-i18n`. Ces 16 chaînes ne suivent pas la bascule à chaud si elles ne sont pas re-rendues. | Verser dans les dictionnaires existants. |
| C07 | Contrats | `js/truegold_script.js:750-757` | Moyenne | S | La fonction de calcul retourne des **messages d'erreur traduits** (`"❌ Error: Building data missing."`) comme valeur de retour : le calcul, l'i18n et le rendu se mélangent dans le type de retour. | Retourner `{ok:false, code:'NO_BUILDINGS'}` ; la couche de rendu choisit le message. |
| C08 | Validation | tous les `fetch` de `data/*.json` | Moyenne | M | Aucune validation de schéma aux frontières : un JSON amputé d'un champ produit `undefined` propagé jusqu'à l'écran (`NaN`, ligne vide) plutôt qu'une erreur nette. | Un `assertShape()` minimal par fichier (clés obligatoires, types) au chargement, qui journalise et bascule sur le défaut. |
| E01 | Erreur avalée | `js/shop-event.js:816` | Haute | S | `catch(e){}` autour du `fetch` du fichier d'événement : un fichier absent ou invalide fait **disparaître silencieusement** toute la section événement d'une page boutique. Rien à l'écran, rien en console. | `console.error` + état visible (« données d'événement indisponibles »). |
| E02 | Erreur avalée | `js/research_script.js:150` | Moyenne | S | `catch(e) {}` autour de la restauration des saisies : une sauvegarde corrompue est effacée sans un mot. | Journaliser et prévenir l'utilisateur que ses saisies n'ont pas pu être relues. |
| E03 | Robustesse | `js/beartrap.js:291,308`, `js/truegold_script.js:415`, `js/vikings.js:121`, `js/feedback.js:246` | Moyenne | S | 5 `fetch` sans contrôle `res.ok` : une 404 renvoie du HTML, `.json()` lève, et selon le site l'erreur est avalée. `db-masters.js:162` et `db-pets.js:134` montrent la bonne pratique (`if (!r.ok) throw`). | Généraliser le contrôle `r.ok`, idéalement dans la couche A15. |
| E04 | Observabilité | 28 sites, dont `js/research_script.js:99`, `js/truegold_script.js:258,303` | Basse | S | 28 `console.*` en production, dont des messages de progression en français avec emoji (`📂 Tentative de chargement`). | Garder les `console.error`, supprimer les `console.log` de progression. |
| E05 | Observabilité | `js/shop-core.js:590,605,611,650,656` | Basse | S | En cas d'échec de chargement, les globales retombent sur `[]`/`{}` : la page s'affiche **vide et sans erreur**, ce qui ressemble à « cette boutique n'a rien ». | Distinguer « vide » de « pas chargé » et l'afficher. |
| P01 **RÉSOLU** | Performance | `js/shop-core.js:657` | Haute | S | `scLoadAll()` enchaîne 5 `await` séquentiels sur des fichiers **indépendants** (80 Ko au total), chacun en `cache:'no-cache'` donc avec revalidation réseau. 5 allers-retours en série avant le premier rendu. Vérifié : aucun chargeur ne lit les globales d'un autre. | `await Promise.all([...])`. Gain direct sur les 19 pages boutique et le sommaire. |
| P02 | Performance | `shop/arena.html:8` (×70) | Basse | S | Le script gtag est chargé dans le `<head>` sans `async`, avant tout contenu. Les scripts du site, eux, sont correctement en fin de `<body>`. | Ajouter `async` (recommandé par Google) ou déplacer en fin de corps. |
| P03 | Performance | `js/shop-core.js:587` | Basse | S | `cache:'no-cache'` sur tous les JSON force une revalidation à chaque visite. Le choix est **documenté et justifié** (`shop-core.js:583-586`) ; il coûte quand même un aller-retour par fichier. | Combiner avec P01 : parallélisé, le coût devient un seul aller-retour au lieu de cinq. |
| S01 | Sécurité | dépôt entier | Basse | S | Aucune `Content-Security-Policy` (même en `<meta>`), alors que le site injecte massivement du HTML par `innerHTML` (127 sites). Les entrées sont échappées partout où elles sont utilisateur — la CSP serait une seconde barrière, pas la première. | `<meta http-equiv="Content-Security-Policy">` restrictive (`script-src 'self' googletagmanager`) — à tester, le gtag et les gardes inline demandent des exceptions. |
| X01 | a11y | `js/backup.js:103`, `js/shop-page.js:83,84,137,409`, `js/shop-items-euro.js:131,132`, `js/beartrap.js:1197,1198` | Moyenne | S | 9 boutons **à icône seule** sans `aria-label` ni `title` : un lecteur d'écran annonce « bouton ». Concerne la fermeture de modale, les pastilles € / $, le crayon et la corbeille. | `aria-label` avec le libellé traduit (les dictionnaires existent déjà). |
| X02 | a11y | `js/backup.js:165`, `js/caserne.js:439`, `js/masters.js:244`, `js/beartrap.js:258`, `js/modal-tabs.js:101` | Moyenne | M | 5 modales sur 7 n'écoutent pas `Escape`. `js/help.js:144` et `js/header.js:106` le font, et `help.js:95` retire même son listener à la fermeture — le bon modèle existe dans le dépôt. | Le régler d'un coup via la modale partagée d'A14. |
| X03 | a11y | tout le dépôt | Moyenne | M | **Aucun `.focus()`** dans les 14 435 lignes de JS : aucune modale ne prend le focus à l'ouverture, ne le piège, ni ne le rend au déclencheur à la fermeture. Navigation clavier cassée dès qu'une modale s'ouvre. | Dans la modale partagée : focus sur le premier élément, piège `Tab`, restitution à la fermeture. |
| X04 | a11y | `js/shop-page.js:76-77` | Basse | S | Les pastilles de lecture portent `role="tab"` et `aria-selected` sans `role="tabpanel"` associé ni `aria-controls` : un rôle ARIA annoncé mais incomplet. | Soit compléter (`aria-controls` vers `#sp-table`), soit retomber sur des boutons `aria-pressed`. |
| D01 | Doc | `MAP.md:117` vs `MAP.md:371` | Moyenne | S | Contradiction interne : « 58 objets relevés + **6** calculés » ligne 117, « **Treize** entrées » ligne 371. Réel : 58 relevés, **13** `derived`. | Corriger la ligne 117 ; mieux, cf. D06. |
| D02 | Doc | `MAP.md:163` | Basse | S | « Captures des packs payants (**34**) » — réel : **37** fichiers dans `img/packs/`. | Corriger / automatiser. |
| D03 | Doc | `MAP.md:191` | Basse | S | `items-euro.html` décrit comme listant « **57 / 87** » objets — réel : **63** objets chiffrables (58 relevés + 13 dérivés, moins les recouvrements). | Corriger / automatiser. |
| D04 | Doc | `MAP.md:326` | Basse | S | « `.sx-reflinks` **écrit en dur dans les 16 pages** » — réel : **19** pages boutique le portent. | Corriger / automatiser. |
| D05 | Doc | `shop/arena.html:54` et 16 autres pages | Moyenne | M | Les intros et `meta description` écrites en dur annoncent « face à sa valeur de référence **en gemmes** », alors que la lecture par défaut est désormais l'argent réel (commit `2258b71`). Le texte indexé par Google décrit une page que le visiteur ne voit plus au premier chargement. | Réécrire les 17 intros + descriptions (décision éditoriale/SEO — cf. Q4), idéalement via le générateur d'A01. |
| D06 | Doc | `MAP.md` (méthode) | Moyenne | S | Les 4 dérives ci-dessus ont la même cause : des compteurs recopiés à la main dans la prose alors qu'ils sont tous calculables depuis `data/`. | `tools/check-counts.py` qui recalcule et compare aux nombres de `MAP.md` ; branché en GitHub Action, il transforme une dérive silencieuse en échec de CI. |
| D07 | Doc | racine du dépôt | Moyenne | S | **Aucun README.** Un visiteur de GitHub tombe sur `CLAUDE.md` et `MAP.md`, tous deux écrits pour l'agent, en français, et longs. | README court : ce qu'est le site, l'URL, la pile, comment servir en local (avec le piège des URL sans `.html`), et un lien vers `MAP.md`. |
| R01 | Ressources | `data/shopcalc_items.json` ↔ `img/Item/` | Moyenne | S | **17 objets sur 91 n'ont pas d'image**. 13 lignes visibles en sont privées, réparties sur 6 boutiques (`arena` ×2, `swordland` ×3, `dragons-caravan` ×3, `polar-shop` ×3, `alliance-championship` ×1, `summit-contest-champion` ×1). L'image étant posée en `background-image`, l'échec est **silencieux** : une case vide, pas d'icône cassée. | Fournir les 8 fichiers réellement affichés en priorité (`fragment_of_a_specific_mythical_hero`, `rare_general_hero_shard`, `custom_nameplate`, `town_skin`, `teleport_skin`…). Les 9 autres (cosmétiques jamais vendus en boutique) peuvent attendre. |
| R02 | Ressources | `data/shopcalc_euro.json` → `img/packs/` | Moyenne | S | 2 packs **cités par un objet** n'ont pas d'image : `custom-arms-set-common-custom-chest`, `weekly-deal-lucky-chest`. `CLAUDE.md` prévoit explicitement ce cas — l'aperçu au survol est cassé. | Demander les 2 captures à Paul. |
| R03 | Données | `data/shopcalc_euro.json` (`packs`) | Basse | S | 63 packs déclarés, **35 cités** : 28 entrées ne chiffrent aucun objet. Volontaire (mémoire entre régénérations) ou résidu ? Cf. Q3. | Trancher, puis documenter le choix dans `MAP.md` §7. |
| T01 **RÉSOLU** | Tests | dépôt entier | Haute | L | **Aucun test, aucun harnais.** Les moteurs de calcul les plus délicats — solveur KVK exact (`truegold_script.js:1039`), tirage du Théâtre (`shop-theater.js:26`, validé une fois par Monte-Carlo mais sans test rejouable), `seCompute()` (`shop-event.js:228`) — ne sont vérifiés qu'à l'œil. Un contrôle chiffré existe pourtant, écrit en prose dans `MAP.md:372` (« 4 jours joués, 1 achat ailleurs → 230 essences »). | Ces contrôles en prose **sont déjà des tests** : les transcrire en `tests/*.mjs` lancés par `node --test`, sans framework ni dépendance. Commencer par les 3 scénarios chiffrés que `MAP.md` documente. |
| T02 **RÉSOLU** | Tests | `js/shop-theater.js:21` | Moyenne | M | Le commentaire affirme une validation Monte-Carlo (300 000 tirages, écart < 0,15 pt) qui n'existe nulle part dans le dépôt : elle a été faite une fois puis jetée. | Committer le script de simulation dans `tools/` : il redevient rejouable après chaque modification du moteur. |

---

## Top 5 — si vous ne corrigez rien d'autre

### 1. C01 + C02 — Un seul formateur de nombres (Critique, S)

C'est le seul bug de cet audit que **le joueur voit aujourd'hui**, en français, sur les 19 pages boutique.

```js
// AVANT — js/shop-page.js:228
function spNum(n){ return Number(n||0).toLocaleString(); }   // locale du NAVIGATEUR
// et ligne 208 / 359
`×${r.ratio.toFixed(2)}`                                     // point décimal, toujours

// APRÈS
function spNum(n){ return scFmtNum(Number(n)||0); }          // locale du SITE (shop-core.js:509)
`×${scFmtFix(r.ratio,2)}`                                    // scFmtFix existe déjà : shop-core.js:503
```

`scFmtNum` et `scFmtFix` existent déjà dans le core et y sont exportés depuis longtemps : la règle de cache §9 est respectée (aucun nom nouveau appelé depuis une page). Vérifier ensuite les 13 autres formateurs et les faire converger vers `js/format.js`.

### 2. A01 + A02 — Un générateur de pages hors ligne (Haute, M)

Le vrai coût n'est pas les lignes dupliquées, c'est que **chaque évolution du gabarit se paie 19 à 32 fois**, à la main, avec un oubli possible à chaque fois.

```
AVANT   shop/arena.html … shop/trial-shop.html      19 fichiers × ~97 lignes, 78 lignes identiques
        database/buildings/*.html                    9 fichiers × 654 lignes, 24 lignes de différence

APRÈS   tools/templates/shop.html                    1 gabarit
        tools/pages.json                             19 entrées {slug, titleEN/FR, descEN/FR, introEN/FR, crumb}
        tools/build-pages.py                         ~80 lignes, sans dépendance
        shop/*.html                                  générés PUIS COMMITÉS — GitHub Pages sert
                                                     exactement le même HTML statique qu'aujourd'hui
```

La contrainte « le maillage doit exister sans JS » (`MAP.md` §9) est **préservée** : la génération est hors ligne, pas à l'exécution. Ajouter une Action GitHub qui régénère et échoue si la sortie diffère du commit empêche la dérive entre gabarit et pages.

### 3. A03 — Découper `SUGGERER_KINGSHOT()` (Haute, L)

```
AVANT   js/truegold_script.js:739   SUGGERER_KINGSHOT(15 paramètres positionnels) — 981 lignes
                                    │ garde-fous          (l. 749-759)
                                    │ utilitaires         (l. 760-772)
                                    │ préparation données (l. 773-860)
                                    │ glouton             (l. 861-1038)
                                    │ solveur KVK exact   (l. 1039-1400)
                                    └ rendu HTML du plan  (l. 1400-1720)

APRÈS   tgValidateInputs(opts) -> {ok, code}
        tgBuildIndex(ranges)   -> {parBatiment, prerequis, coûts}
        tgGreedy(état, opts)   -> plan
        tgSolveKvk(état, opts) -> plan | null   (retombe sur tgGreedy au-delà de KVK_MAX_ETATS)
        tgRenderPlan(plan, lang) -> HTML
        SUGGERER_KINGSHOT(opts) = enchaînement des 5, ~40 lignes
```

Les bandeaux `// ==== … ====` de la fonction **sont déjà** les frontières d'extraction : le découpage ne demande aucune décision d'architecture, seulement de la rigueur. À faire après T01, pour disposer d'un filet.

### 4. P01 — Charger les 5 JSON en parallèle (Haute, S)

```js
// AVANT — js/shop-core.js:657
async function scLoadAll(){
  await scLoadItems(); await scLoadClassic(); await scLoadEvents();
  await scLoadChests(); await scLoadEuro();
}
// 5 allers-retours EN SÉRIE, tous revalidés (cache:'no-cache')

// APRÈS
async function scLoadAll(){
  await Promise.all([scLoadItems(), scLoadClassic(), scLoadEvents(),
                     scLoadChests(), scLoadEuro()]);
}
// 1 temps d'attente au lieu de 5 — vérifié : aucun chargeur ne lit les globales d'un autre
```

Une ligne, aucun nom nouveau, effet sur les 20 pages qui appellent `scLoadAll()`.

### 5. T01 — Trois tests, sans framework (Haute, L → M si on s'arrête aux 3 scénarios)

`MAP.md` contient déjà des **contrôles chiffrés en prose** — c'est-à-dire des tests écrits en français qui ne s'exécutent pas :

```
AVANT   MAP.md:372  « 4 jours joués, aucun achat dans l'événement mais 1 achat ailleurs
                      → 230 essences, identique au stock en jeu de Paul »
                    → vérifié à la main, une fois, en août

APRÈS   tests/shop-event.test.mjs
          test('Caravane du Dragon — 4 jours, 1 achat ailleurs → 230 essences', …)
          test('Stand d\'Aventure — J3, pass J1, 2 packs → 300 pièces / 200 points / 2 paliers', …)
          test('Théâtre — coûts du tirage contre 300k simulations Monte-Carlo', …)
        $ node --test tests/          # zéro dépendance, zéro build
```

Ces trois-là couvrent les calculs où une régression serait à la fois invisible à l'écran et coûteuse pour le joueur.

---

## Quick wins — faible effort, effet immédiat

- [ ] **C01** `spNum` délègue à `scFmtNum` — `js/shop-page.js:228`
- [ ] **C02** ratio via `scFmtFix` — `js/shop-page.js:208,359` (+ le sous-titre KPI l. 178)
- [ ] **P01** `Promise.all` dans `scLoadAll` — `js/shop-core.js:657`
- [ ] **E01** journaliser l'échec de chargement d'événement — `js/shop-event.js:816`
- [ ] **E03** contrôler `res.ok` sur 5 `fetch` — `beartrap.js:291,308`, `truegold_script.js:415`, `vikings.js:121`, `feedback.js:246`
- [ ] **X01** `aria-label` sur 9 boutons à icône — `shop-page.js:83,84,137,409` en tête
- [ ] **R02** demander à Paul les 2 captures de packs manquantes
- [ ] **R01** ajouter les 8 images d'objets réellement affichées
- [ ] **D01–D04** corriger les 4 compteurs de `MAP.md` (lignes 117, 163, 191, 326)
- [ ] **D07** écrire un README
- [ ] **A18** supprimer le bloc CSS `.sic-*` mort — `css/style.css:1814-1840`
- [ ] **E04** retirer les `console.log` de progression (garder les `console.error`)
- [ ] **C05** aligner `caserne.js:508` sur `GlobalLang.get()`
- [ ] **P02** `async` sur le script gtag

---

## Ce qui a l'air mauvais mais ne l'est pas

- **70 pages HTML sans framework ni build.** J'ai cherché longtemps l'argument pour recommander un générateur de site statique (Eleventy, Astro). Il ne tient pas : la contrainte de `MAP.md` §9 — le maillage interne et le contenu indexable doivent exister **sans exécuter le JS** — est un choix de référencement correct, et il est tenu. Ma recommandation A01 est un générateur **hors ligne dont la sortie est commitée**, précisément pour ne pas toucher à ce qui est servi. Migrer vers un vrai SSG ajouterait une chaîne d'outillage à un projet d'une personne, pour un gain nul côté visiteur.
- **15 balises `<script>` par page, aucune n'est `defer`.** Faux problème : elles sont toutes en **fin de `<body>`** (`shop/arena.html:85-95`), donc non bloquantes. Seul le gtag est dans le `<head>` (P02, mineur). Bundler ces 11 fichiers casserait le cache par fichier, qui est justement ce qui permet aujourd'hui de ne rejouer que le fichier modifié.
- **169 `addEventListener` pour 2 `removeEventListener`.** Ressemble à une fuite ; ce n'en est pas une. Tous les listeners globaux sont posés **une seule fois au chargement du module** (`js/header.js:105`, `js/help.js:85-90`, `js/footer.js:172`…), et les listeners d'éléments meurent avec le nœud lors du remplacement par `innerHTML`. Le seul listener ajouté dynamiquement — `js/help.js:144` — est **correctement retiré** en `js/help.js:96`.
- **9 boutiques sur 15 n'ont pas de vignette `img/shops/<slug>.webp`.** J'allais le lever en finding ; la page les rend en **mosaïque 2×2 des icônes d'objets**, et c'est joli. Le repli est délibéré et fonctionne : ce n'est pas un trou, c'est un choix de conception.
- **Les tuiles grisées du sommaire des boutiques.** Elles ne signalent pas des images manquantes mais des boutiques **terminées** (badge « Terminé » + opacité réduite). Comportement voulu.
- **Une clé d'API en clair dans `js/site-config.js:46`.** `SITE.feedback.key` est publique par construction : elle part dans le JS servi à tout le monde. Le commentaire l'assume explicitement et précise que le script Apps Script valide ses entrées et plafonne le débit. Le vrai secret (webhook Discord, adresse mail) vit dans le script, pas ici. Rien à corriger — ne pas « sécuriser » cette clé en la déplaçant, ce serait du théâtre.
- **`cache:'no-cache'` sur tous les JSON.** A l'air d'un contournement ; c'est une décision documentée (`js/shop-core.js:583-586`) après une panne réelle où une page neuve lisait une liste de boutiques périmée. Le coût (revalidation, réponse 304 de quelques octets) est le bon prix pour ce problème. Le corriger, c'est P01 (paralléliser), pas retirer le `no-cache`.
- **Re-rendu complet du tableau par `innerHTML` à chaque saisie.** Les champs utilisent `onchange`, pas `oninput` (`js/shop-page.js:316,319,327,339`) : le re-rendu a lieu à la validation, pas à la frappe, sur des tableaux de 30 lignes au plus. Aucun gain réel à passer à un rendu incrémental, et beaucoup de complexité à la clé.
- **`scEscAttr()` n'échappe pas `>`.** Correct pour son usage : dans une valeur d'attribut entre guillemets, `>` n'a aucun pouvoir. À unifier tout de même (A12), mais ce n'est pas une faille.
- **`fr/shop/theater-shop.html`, seule page sur 70 sous `/fr/`.** Je l'avais versée en constat (A17) et posée en question ouverte : c'était une erreur d'audit, `MAP.md:223` la documente comme un **pilote délibéré** — deux adresses, une par langue, qui se citent par `hreflang`, pour tester ce que Google attend d'un site bilingue là où le modèle « un HTML anglais que le JS traduit » ne fait jamais exister le français. Une page suffit à un pilote ; c'est le résultat qui décidera de l'étendre.

- **`profiles.js` remplace `localStorage` par un proxy.** Le genre d'astuce qui vieillit mal — sauf qu'ici elle est la raison pour laquelle 30 modules ont gagné le multi-profil sans changer une ligne. Le seul module qui y échappe est `pets.js` (C04), et c'est parce qu'il contourne le registre de clés, pas à cause du proxy.

---

## Questions ouvertes pour le mainteneur

1. ~~**`fr/shop/theater-shop.html`** — début d'un schéma d'URL par langue, ou orphelin ?~~ **Répondu par `MAP.md:223`** : pilote délibéré. La question n'aurait pas dû être posée.
2. **`data/shopcalc_items.json`, 17 objets sans image** — les 9 cosmétiques (`emote`, `avatar_frame`, `town_skin`…) sont-ils voués à rester sans image, ou les captures viendront-elles ? Cela change la priorité de R01.
3. **28 packs déclarés dans `shopcalc_euro.json` mais cités par aucun objet** — mémoire volontaire entre deux régénérations depuis l'Excel, ou résidu ? (R03)
4. **Intros et `meta description` des 17 pages boutique** (D05) — je ne les ai pas touchées : ce sont les textes indexés par Google, et les réécrire est une décision éditoriale, pas une correction technique. Faut-il les aligner sur la lecture argent réel devenue le défaut ?
5. ~~**`beartrap.js` et `truegold_script.js`** — encore en évolution ou stabilisés ?~~ **Tranché par Paul** : TrueGold est terminé, on n'y touche pas (A03/A04 écartés). La question reste entière pour `beartrap.js`.
6. **`data/shopcalc_euro.json`** est régénéré d'un bloc depuis un Excel non commité (`Pack_ks.xlsx`) — le script de génération existe-t-il quelque part ? S'il est refait à la main à chaque livraison, c'est un candidat sérieux pour `tools/`, avec les mêmes bénéfices que D06.

---

*Audit conduit par lecture directe du code, analyse du churn git, vérification en navigateur (Chromium/Playwright) et contrôles d'intégrité sur les données. Chaque finding cite un fichier et une ligne vérifiés sur `21a180d`.*
