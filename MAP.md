# MAP — hub-kingshot

> Cartographie du projet. **Point d'entrée avant toute tâche** : lis ce fichier, puis n'ouvre que les fichiers concernés.

---

## 1. Vue d'ensemble

- **Live** : https://aistra91-ks.github.io/hub-kingshot/
- **Repo** : `Aistra91-KS/hub-kingshot`
- **Type** : site statique hébergé sur **GitHub Pages** (pas de backend, pas de build).
- **Stack** : HTML / CSS / JS **vanilla** (aucun framework, aucun bundler) + **GitHub Actions** (notif Discord).
- **Langues** : **FR / EN**, bascule à chaud (aucun rechargement).
- **Architecture** : Portail → Hub (catégories) → Outils. Toute la navigation est pilotée par un manifeste unique `js/site-config.js`.
- **Persistance** : `localStorage` uniquement (clés centralisées dans `js/storage-keys.js`), export/import JSON via `js/backup.js`.

---

## 2. Arborescence

```
hub-kingshot/
├── index.html                    Hub (page d'accueil) : grille de cartes par catégorie
├── research_calc.html            Outil Recherches (arbres Croissance/Éco/Combat)
├── truegold_calc.html            Outil TrueGold (planif. amélioration bâtiments)
├── waracademy.html               Outil Académie de Guerre (planif. recherches troupes TG)
├── beartrap_calc.html            Outil Piège à Ours (répartition des marches)
├── vikings.html                  Outil Vikings (répartition troupes/défense)
├── caserne.html                  Outil Caserne / Héros (beta) — source des héros
├── masters.html                  Outil Experts / Masters (beta) — affinités & skills
├── shop_calc.html                Outil Shop Calc (coût boutique vs valeur gemmes)
├── pets.html                     Outil Familiers (promenade verticale : fiches pets le long d'un sentier)
│
├── css/
│   ├── style.css                 Feuille principale (thèmes, header, hub, contrôles, tables, boutons, responsive)
│   ├── waracademy.css            Styles spécifiques Académie de Guerre (préfixe .wa-)
│   └── pets.css                  Styles page Familiers (scène « sentier », décor CSS, DA nature distincte)
│
├── js/
│   ├── site-config.js            ★ Manifeste unique : jeux, catégories, outils, registre d'icônes Lucide
│   ├── storage-keys.js           ★ Source unique des clés localStorage + safeParse()
│   ├── lang.js                   ★ GlobalLang : get/set langue, applyI18n(dict), event 'langChanged'
│   ├── header.js                 ★ Header contextuel généré depuis SITE + thème + modales globales
│   ├── help.js                   Module d'aide générique (bouton "?", modale, bandeau, tooltips)
│   ├── backup.js                 Sauvegarde globale (export/import .json par module)
│   ├── hub.js                    Rendu de la grille du hub depuis SITE
│   ├── research_script.js        Logique Recherches (fetch research_db.json)
│   ├── truegold_script.js        Logique TrueGold (fetch truegold_db.json + masters_db.json)
│   ├── wa_optimizer.js           Optimiseur Académie de Guerre (3 modes) — logique pure
│   ├── waracademy.js             UI Académie de Guerre : arbre CSS grid + connecteurs SVG (fetch truegold_war_db.json)
│   ├── beartrap.js               Logique Piège à Ours (fetch heroes_db.json + lit caserne via localStorage)
│   ├── vikings.js                Logique Vikings (réutilise formations Piège à Ours via localStorage)
│   ├── caserne.js                Logique Caserne (fetch heroes_db.json)
│   ├── masters.js                Logique Experts (fetch masters_db.json)
│   ├── shop_calc.js              Logique Shop Calc (fetch 4 fichiers shopcalc_*.json)
│   └── pets.js                   Logique Familiers (promenade verticale scroll-jack ; données en dur, i18n GlobalLang)
│
├── data/                         Données consommées par les calculateurs (JSON éditées à la main)
│   ├── research_db.json          720 lignes (arbres de recherche, coûts/temps par palier)
│   ├── truegold_db.json          Bâtiments TrueGold (rangeData, bldgMap, config, référence paliers)
│   ├── truegold_war_db.json      Académie de Guerre : {meta, scoring, trees} — généré depuis un CSV
│   ├── heroes_db.json            34 héros (génération, rareté, type, skills bilingues)
│   ├── masters_db.json           4 experts (paliers d'affinité, passif, skills)
│   ├── shopcalc_items.json       86 objets (valeur en gemmes) — référentiel
│   ├── shopcalc_classic.json     Boutiques classiques (contenu + coûts)
│   ├── shopcalc_events.json      Boutiques d'événement (avec endsAt)
│   └── shopcalc_chests.json      Coffres personnalisés (composition)
│
├── database/
│   └── buildings/                Base de données bâtiments (pages statiques, tables inline)
│       ├── index.html            Sommaire des bâtiments
│       ├── town-center.html      Table d'amélioration Centre-ville
│       ├── embassy.html          Ambassade
│       ├── command-center.html   Base de commandement
│       ├── war-academy.html      Académie de Guerre (bâtiment)
│       ├── infirmary.html        Infirmerie
│       ├── barracks.html         Quartiers
│       ├── stable.html           Écurie
│       └── range.html            Stand de Tir
│
│   └── waracademy/               Base de données recherches Académie de Guerre (pages statiques, table depuis JSON)
│       ├── index.html            Sommaire des 3 arbres
│       ├── infantry.html         Table recherches Infanterie
│       ├── archer.html           Table recherches Archers
│       └── cavalry.html          Table recherches Cavalerie
│
├── img/                          Assets (WebP jeu, PNG items/héros, SVG icônes)
│   ├── logo/                     favicon.svg, favicon-32.png, apple-touch-icon.png
│   ├── buildings/                Vignettes bâtiments (.webp)
│   ├── WarAcademy/               Icônes recherches Académie de Guerre (.webp)
│   ├── heroes/                   Portraits héros (.png)
│   ├── Master/ + MasterSkill/    Portraits experts + icônes skills experts
│   ├── skills/ + widgetname/ + widgetskill/  Icônes skills héros & widgets
│   ├── Item/                     Icônes objets boutique/ressources
│   └── pets/                     Images des familiers (.webp, 14 fichiers)
│
└── .github/
    ├── workflows/discord-news.yml   Workflow : notif Discord des commits (cron 2 h)
    └── scripts/news.js              Script Node : parse commits → message Discord bilingue
```

---

## 3. Pages

| Page | Rôle | JS liés | CSS | Données |
|---|---|---|---|---|
| `index.html` | Hub : cartes par catégorie | `hub.js` (+ socle) | `style.css` | — (lit `SITE`) |
| `research_calc.html` | Optimiseur de recherches | `research_script.js` | `style.css` | `research_db.json` |
| `truegold_calc.html` | Planif. bâtiments TrueGold | `truegold_script.js` | `style.css` | `truegold_db.json`, `masters_db.json` (affinité) |
| `waracademy.html` | Planif. recherches troupes TG | `wa_optimizer.js`, `waracademy.js` | `style.css`, `waracademy.css` | `truegold_war_db.json` |
| `beartrap_calc.html` | Répartition marches Piège à Ours | `beartrap.js` | `style.css` | `heroes_db.json` + caserne (localStorage) |
| `vikings.html` | Répartition troupes Vikings | `vikings.js` | `style.css` | formations Piège à Ours (localStorage) |
| `caserne.html` | Gestion héros (beta) | `caserne.js` | `style.css` | `heroes_db.json` |
| `masters.html` | Experts & affinités (beta) | `masters.js` | `style.css` | `masters_db.json` |
| `shop_calc.html` | Coût boutique vs gemmes | `shop_calc.js` | `style.css` | `shopcalc_items/classic/events/chests.json` |
| `pets.html` | Familiers : promenade verticale (fiches pets) | `pets.js` + `header.js`, `lang.js`, `site-config.js` | `style.css`, `pets.css` (+ webfonts) | en dur dans `pets.js` (→ `pets_db.json` prévu) |
| `database/buildings/*.html` | Tables d'amélioration bâtiments | inline + `header.js`, `lang.js`, `site-config.js` | `style.css` | données inline (HTML) |
| `database/waracademy/*.html` | Tables recherches Académie (3 arbres) | inline + `header.js`, `lang.js`, `site-config.js` | `style.css` | `truegold_war_db.json` (fetch) |

**Socle chargé sur toutes les pages outils** (ordre) : `site-config.js` → `storage-keys.js` → `lang.js` → `help.js` → *(script de page)* → `header.js` → `backup.js`.
Les pages `database/buildings/*` et `pets.html` n'incluent que `site-config.js` + `lang.js` + `header.js` (pas de help/backup). `pets.html` charge en plus `css/pets.css` et deux webfonts Google (Cormorant Garamond + Karla).

---

## 4. Système bilingue (i18n)

Deux mécanismes, tous deux réagissant à l'event global **`langChanged`** émis par `GlobalLang.set()` :

1. **Dictionnaire + `data-i18n`** (pages outils) :
   - Chaque script de page déclare un objet `const i18n = { FR:{clé:…}, EN:{clé:…} }`.
   - Dans le HTML : `<span data-i18n="clé">…</span>` (et `data-i18n-placeholder="clé"` pour les inputs).
   - `GlobalLang.applyI18n(i18n[lang])` remplace `textContent` / `placeholder`.
2. **Attributs inline `data-en` / `data-fr`** (pages `database/buildings/*`) :
   - `<td data-en="Bread" data-fr="Pain">Pain</td>` — un petit script inline applique `data-<lang>` sur `[data-en][data-fr]`.

**Langue** : stockée sous `hub_lang` (clé propre à `GlobalLang`, défaut `EN`). Le `<select>` du header et les boutons `.lang-btn` du hub sont synchronisés via `GlobalLang.applyToSelect` / `applyToButtons`.

**Où ajouter une clé** :
- Page outil → ajoute la clé dans les blocs `FR` **et** `EN` de l'objet `i18n` du script concerné, puis pose `data-i18n="clé"` dans le HTML.
- Page bâtiment → soit ajoute au `dict {FR,EN}` inline + `data-i18n`, soit utilise directement `data-en`/`data-fr` sur l'élément.
- Libellé de navigation (nom d'outil/catégorie) → dans `site-config.js` (`name: {EN, FR}`), jamais en dur.

---

## 5. Charte graphique (DA) — « Royal Gold / Black Edition »

Or éclatant sur noir profond, turquoise pour la validation, rubis pour l'alerte. Définie par variables CSS dans `css/style.css` (`:root` = sombre, `[data-theme="light"]` = clair).

### Variables — thème SOMBRE (`:root`)
| Variable | Valeur | Usage |
|---|---|---|
| `--bg-dark` | `#0a0a0a` | Fond principal |
| `--bg-panel` | `#161616` | Panels / cartes |
| `--control-bg` | `#1f1f1f` | Contrôles |
| `--input-bg` | `#252525` | Inputs |
| `--text-light` | `#f0e8d5` | Texte principal (ivoire) |
| `--text-muted` | `#8a8378` | Texte secondaire |
| `--accent` | `#f5b840` | **Or** (liseré, titres, focus) |
| `--accent-hover` | `#d49820` | Or foncé (hover) |
| `--border` | `#2a2a2a` | Bordures |
| `--success` | `#4ecdc4` | Turquoise (validation / CTA) |
| `--warning` | `#ff8c42` | Orange (alerte) |
| `--table-header` | `#1c1c1c` | Entêtes de table |
| `--table-row-alt` | `#131313` | Alternance de lignes |
| `--growth-color` | `#4ecdc4` | Arbre Croissance |
| `--eco-color` | `#f5b840` | Arbre Économie |
| `--battle-color` | `#e74c5c` | Arbre Combat |
| `--box-bg` / `--box-header` | `#1c1c1c` / `#252525` | Cartes de recherche |
| `--step-bg` / `--step-hover` | `#161616` / `#202020` | Étapes de recherche |
| `--shadow` | `rgba(0,0,0,.6)` | Ombre |
| `--header-height` / `--header-offset` | `60px` / `80px` | Header fixe + décalage body |

### Variables — thème CLAIR (`[data-theme="light"]`)
`--bg-dark #f5f7fb` · `--bg-panel #ffffff` · `--control-bg #f0f4fa` · `--input-bg #ffffff` · `--text-light #1a1a1a` · `--text-muted #6b7280` · `--accent #c89020` (or antique) · `--accent-hover #a07418` · `--border #d4dce8` · `--success #00897b` · `--warning #e65100` · `--table-header #eaf0f8` · `--table-row-alt #f5f8fc` · `--growth #00897b` · `--eco #c89020` · `--battle #c62828` · `--box-bg #ffffff` · `--box-header #eaf0f8` · `--step-bg #f5f8fc` · `--step-hover #e8eff7` · `--shadow rgba(0,0,0,.08)`.

### Police & rayons
- **Police** : `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` (système, aucune webfont).
- **Rayons** : pas de variable dédiée — valeurs par composant : cartes `12px`, panels/tables `8px`, contrôles `6px`, inputs `4px`, boutons pilule `20–25px`, ronds `50%`.
- **Thème** : attribut `data-theme` sur `<html>`, stocké sous **`hub_theme`** (défaut `dark`). Bascule via `toggleHeaderTheme()`.

### Convention cartes (signature visuelle)
`.hub-card` = **liseré doré** en haut (`border-top: 3px solid var(--accent)`) + **reflet doré au survol** : pseudo-élément `::before` (dégradé `rgba(245,184,64,.08)`) qui **balaie de gauche à droite** (`left: -100% → 100%`, `transition .6s`) + `translateY(-5px)`. `overflow:hidden` obligatoire sur la carte. Ne pas réinventer d'autre effet décoratif.

### Exception assumée — page Familiers (`pets.html`)
`pets.html` **s'écarte volontairement** de la DA Royal Gold : scène « sentier » en palette nature/jour (verts + terre, valeurs `oklch`), carte info blanche translucide, **webfonts** Cormorant Garamond + Karla. Header + sidebar restent en DA standard. Choix validé ; tout est isolé dans `css/pets.css` + `js/pets.js`.
---

## 6. Données

Toutes les données sont des **JSON éditées à la main** dans `data/` (pas de script générateur ni de CSV commités). Les textes sont bilingues via objets `{EN, FR}`.

| Fichier | Format / schéma |
|---|---|
| `research_db.json` | **Liste** de 720 entrées : `{Tree, Name, Fr Name, Level, Time (d/h/m/s), coûts ressources…}` (18 champs). |
| `truegold_db.json` | **Objet** : `rangeDataTTG`, `bldgMap`, `defaultBuildings`, `dbDataRaw`, `levelsReference`, `buildingsConfig`. |
| `truegold_war_db.json` | **Objet** `{meta, scoring, trees}`. `meta.warAcademyMaxLevel`; `scoring = {pointsPerDust:1000, pointsPerSpeedupMinute:60}`; `trees` = 3 arbres × recherches × niveaux (`req` = prérequis même arbre, `reqWA` = palier bâtiment requis). Note meta : « généré depuis `tools/data-src/war_academy.csv` » (CSV **non** commité). |
| `heroes_db.json` | **Liste** de 34 héros : `{id, name{EN,FR}, generation, rarity, troopType, goodJoinerBear, skills[]}`. |
| `masters_db.json` | **Liste** de 4 experts : `{id, name, title, affinityBonus, affinityMilestones[{level,affinity,emblems,bonus}], passive, skills[], affinity}`. |
| `shopcalc_items.json` | **Liste** de 86 objets : `{id, name{EN,FR}, category, gemValue}` (référentiel de valeur). |
| `shopcalc_classic.json` | **Liste** de boutiques : `{id, name, items[{itemId, qty, cost}]}`. |
| `shopcalc_events.json` | **Liste** de boutiques d'événement : `{id, name, endsAt, resourceName, items…}`. |
| `shopcalc_chests.json` | **Liste** de coffres : `{id, name, items[…]}`. |
| `pets_db.json` *(prévu)* | **Liste** de familiers : `{name{EN,FR}, rarity, lvl, atk, def, hp, bonus{EN,FR}, skills[{n{EN,FR}, d{EN,FR}}]}`. Actuellement **en dur** dans `js/pets.js` (MVP). |

**Provenance** : édition manuelle directe dans le JSON déployé. Aucune génération via GitHub Actions.

---

## 7. Automatisations (GitHub Actions)

Un seul workflow : **`discord-news.yml`** (notification Discord des mises à jour).
- **Déclencheurs** : cron `0 */2 * * *` (toutes les 2 h, best-effort) + `workflow_dispatch` (bouton manuel).
- **Mécanique** : restaure le SHA du dernier commit notifié (cache `actions/cache`), collecte `git log <SINCE>..HEAD` (1er run → fenêtre « 2 hours ago »), passe la liste des commits à `.github/scripts/news.js`.
- **`news.js`** : parse les commits, mappe chaque fichier modifié à une **page** (`fileToPage`), traduit FR↔EN (`SRC_LANG` via `vars`), et POST un message groupé sur le **`DISCORD_WEBHOOK`** (`secrets`). Le pointeur SHA n'avance **que** si l'envoi réussit (retry au run suivant).
    - **Buckets `fileToPage`** (libellés `PAGE_LABELS`, ordre `PAGE_ORDER`) : `waracademy` (waracademy / wa_optimizer / truegold_war_db), `buildings` (database/buildings, img/buildings), `truegold`, `shop`, `beartrap`, `caserne`, `research`, `masters` (masters / heroes_db),`vikings`, `pets` (pets / img/pets), `home` (index.html / hub.js), `multi` (>2 pages touchées), `general` (défaut). ⚠️ Ordre des tests : `waracademy` avant `truegold`, `buildings` avant la règle `index.html`→`home`.
- **Secrets/vars** : `secrets.DISCORD_WEBHOOK`, `vars.SRC_LANG`.

---

## 8. Persistance (localStorage)

Clés « chrome » (hors registre) : **`hub_lang`** (langue, défaut `EN`), **`hub_theme`** (thème, défaut `dark`), `help_seen_<id>` (bandeaux d'aide vus).

Clés métier — source unique **`js/storage-keys.js`** (`window.STORAGE_KEYS`) :
| Clé JS | Valeur localStorage |
|---|---|
| `caserneHeroes` | `caserne_user_heroes` |
| `caserneFilters` | `caserne_filters` |
| `masters` | `masters_user_data` |
| `researchDb` | `research_calc_db_v9` |
| `researchInputs` | `research_calc_inputs_v9` |
| `beartrap` | `beartrap_data` |
| `truegold` | `tg_calc_data_v3` |
| `waracademy` | `wa_calc_data_v1` |
| `vikings` | `vikings_data` |
| `shopcalcItems` | `shopcalc_items` |
| `shopcalcClassic` | `shopcalc_classic` |
| `shopcalcEvents` | `shopcalc_events` |
| `shopcalcTab` | `shopcalc_tab` |
| `shopcalcCollapsed` | `shopcalc_collapsed` |

Lecture sûre via `safeParse(key, fallback)` (try/catch → fallback si JSON corrompu). Export/import ciblé par module dans `backup.js` (`BACKUP_MODULES`).
**Partage de données inter-outils** : `beartrap.js` lit `caserneHeroes`; `vikings.js` réutilise `beartrap` (formations/troupes).

---

## 9. Conventions & pièges connus

**Conventions**
- **Manifeste unique** : ajouter un jeu / une catégorie / un outil = éditer **uniquement `site-config.js`** (jamais coder la nav en dur).
- **Notifications Discord** : tout nouvel outil/page doit aussi être ajouté à `.github/scripts/news.js` (`fileToPage` + `PAGE_LABELS` + `PAGE_ORDER`), sinon ses commits tombent dans `general`. Respecter l'ordre des tests (règles spécifiques avant `truegold` / `index.html`).
- **Clés localStorage** : toujours passer par `STORAGE_KEYS` + `safeParse` (jamais de chaîne littérale).
- **i18n** : toute chaîne visible passe par un dictionnaire `{FR,EN}` + `data-i18n` (ou `data-en`/`data-fr` sur les pages bâtiments). Réagir à `langChanged`.
- **Icônes** : SVG Lucide **inline** (offline) via `SITE_ICONS`/`iconSvg()` (site-config) et `HEADER_ICONS`/`hdrSvg()` (header). Ajouter une nouvelle icône dans **les deux** registres si utilisée dans le header.
- **Images jeu** : WebP ; prévoir un fallback (`onerror`).
- **Header actif dans un sous-dossier** : définir `window.HDR_ACTIVE_HREF = '<href du manifeste>'` **avant** `header.js` (utilisé par toutes les pages `database/buildings/*`).
- **Modales** : utiliser `showAppAlert` / `showAppConfirm` (header.js), pas `alert()`/`confirm()`.
- **DA** : respecter les variables CSS ; cartes = liseré doré + reflet au survol (cf. §5).

**Pièges déjà rencontrés**
- **Dépendance `GlobalLang` non définie** : `lang.js` doit être chargé **avant** tout script qui appelle `GlobalLang` ; toujours garder le fallback `window.GlobalLang ? GlobalLang.get() : 'FR'` (déjà en place dans header/help/backup). Ordre de chargement critique.
- **Fonction `getRawNumber` manquante** : helper local à `beartrap.js` (nettoie espaces + `parseInt`). N'existe **pas** globalement — ne pas l'appeler depuis un autre script sans la (re)définir.
- **Formatage des nombres dépendant de la locale** : l'UI formate les milliers via `toLocaleString('fr-FR')` (espaces). Les inputs numériques FR **refusent le `.`** ; côté saisie, nettoyer (`replace(/\D/g,'')` / strip espaces) **avant** `parseInt`/`parseFloat`. Ne pas parser directement `el.value` formaté.
- **Gestion d'erreurs des `fetch`** : tous les chargements de données sont des `fetch('data/….json')` relatifs (sensibles au chemin de déploiement Pages). Toujours vérifier `response.ok` et prévoir un message clair (ex. TrueGold affiche un diagnostic « le fichier existe-t-il ? »). Un `data/` mal résolu casse silencieusement l'outil.

---

*Fin de MAP.md — proposer une mise à jour ciblée de ce fichier à chaque changement de fichiers/architecture.*
