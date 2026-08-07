# MAP — Kingshot_Toolbox

> Cartographie du projet. **Point d'entrée avant toute tâche** : lis ce fichier, puis n'ouvre que les fichiers concernés.

---

## 1. Vue d'ensemble

- **Live** : https://aistra91-ks.github.io/Kingshot_Toolbox/
- **Repo** : `Aistra91-KS/Kingshot_Toolbox` (anciennement `Hub-Kingshot` — le chemin GitHub Pages est passé de `/hub-kingshot/` à `/Kingshot_Toolbox/`, cf. `<base href>` des pages `database/*`).
- **Type** : site statique hébergé sur **GitHub Pages** (pas de backend, pas de build).
- **Stack** : HTML / CSS / JS **vanilla** (aucun framework, aucun bundler) + **GitHub Actions** (notif Discord).
- **Langues** : **FR / EN**, bascule à chaud (aucun rechargement).
- **Architecture** : Hub (catégories) → Outils. Site mono-jeu (Kingshot). Toute la navigation est pilotée par un manifeste unique `js/site-config.js`.
- **Persistance** : `localStorage` uniquement (clés centralisées dans `js/storage-keys.js`), export/import JSON via `js/backup.js`.

---

## 2. Arborescence

```
Kingshot_Toolbox/
├── index.html                    Hub (page d'accueil) : grille de cartes par catégorie
├── research_calc.html            Outil Recherches (arbres Croissance/Éco/Combat)
├── truegold_calc.html            Outil TrueGold (planif. amélioration bâtiments)
├── waracademy.html               Outil Académie de Guerre (planif. recherches troupes TG)
├── beartrap_calc.html            Outil Piège à Ours (répartition des marches)
├── vikings.html                  Outil Vikings (répartition troupes/défense)
├── caserne.html                  Outil Caserne / Héros — source des héros
├── masters.html                  Outil Experts / Masters (beta) — affinités & skills
├── shop_calc.html                Sommaire des Boutiques (beta) — 3 familles : Événement / Permanentes / Coffres
├── pets.html                     Outil Familiers (promenade verticale : fiches pets le long d'un sentier)
│
├── shop/                         Une page par boutique (structure calquée sur database/*, cf. §5)
│   ├── items.html                Valeur des objets : référentiel gemmes (ex-onglet « Data Item »)
│   ├── polar-shop.html           Événement · Magasin Polaire
│   ├── summit-contest-champion.html   Événement · Ligue Suprême (Champion)
│   ├── summit-contest-ordinary.html   Événement · Ligue Suprême (Ordinaire)
│   ├── golden-ball-shop.html     Événement · Ballon d'or (terminé — page conservée en archive)
│   ├── arena.html                Permanente · Arène
│   ├── alliance-championship.html     Permanente · Championnat d'Alliance
│   ├── swordland.html            Permanente · Swordland
│   ├── kingdom-of-power.html     Permanente · Royaume du Pouvoir
│   ├── tidal-shop.html           Permanente · Magasin des Marées
│   ├── trial-shop.html           Permanente · Magasin du Défi
│   ├── gear-boost-chest.html     Coffre · Boost d'Équipement
│   └── war-chant-chest.html      Coffre · Chant de Guerre
│
├── css/
│   ├── style.css                 Feuille principale (thèmes, header, hub, contrôles, tables, boutons, responsive) + surcouches BDD (mobile : scroll contenu + 1ʳᵉ colonne figée ; `.hl-x` = « X » doré ; `.db-section` tables compactes + en-têtes num. à droite). NB : les styles de cartes objet `.shop-item-card`/`.sic-*`/`.shop-card-grid` (~40 lignes) ne sont plus référencés depuis le passage des boutiques au tableau
│   ├── db.css                    Styles partagés des pages Base de Données (extrait des <style> inline des 35 pages ; classes .db-index/.db-wide/.db-cards-sm + scoping .table-container vs .db-section — cf. §5)
│   ├── shop.css                  Styles Boutiques (préfixe `.sx-`) : sommaire par famille, cartes+vignettes, badges de statut, en-tête de page boutique, podium, **tableau `.sx-table` + mode édition** ; plus `.sc-item-img` et `.shop-toolbar`
│   ├── waracademy.css            Styles spécifiques Académie de Guerre (préfixe .wa-)
│   └── pets.css                  Styles page Familiers (scène « sentier », décor CSS, DA nature distincte)
│
├── js/
│   ├── site-config.js            ★ Manifeste unique : identité (name/home), catégories, outils, registre d'icônes Lucide
│   ├── storage-keys.js           ★ Source unique des clés localStorage + safeParse()
│   ├── profiles.js               ★ Profils (comptes multiples) : registre kt_profiles + proxy transparent sur localStorage (données métier rangées par profil kt::<id>::<clé>) + migration + API window.Profiles. Chargé juste après storage-keys.js (avant tout script de page)
│   ├── lang.js                   ★ GlobalLang : get/set langue, applyI18n(dict), event 'langChanged'
│   ├── header.js                 ★ Header contextuel généré depuis SITE + thème + modales globales
│   ├── help.js                   Module d'aide générique (bouton "?", modale, bandeau, tooltips)
│   ├── modal-tabs.js             Onglets mobiles des modales Caserne/Experts (panneaux [data-mtab], < 820px)
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
│   ├── shop-core.js              ★ Socle Boutiques : i18n partagé, chargement des 4 shopcalc_*.json, helpers, vignettes, compte à rebours, calcul des lignes
│   ├── shop_calc.js              Sommaire des boutiques : hydrate les cartes écrites en dur (vignette, statut, compteur)
│   ├── shop-page.js              Rendu d’une page boutique (window.SHOP_SLUG) : en-tête, podium, tableau (1 ligne/objet) + mode édition (crayon)
│   ├── shop-items.js             Page « Valeur des objets » (référentiel gemmes éditable)
│   ├── db-masters.js             Rendu des pages BDD Experts (fetch masters_db.json ; window.MASTER_ID)
│   ├── db-pets.js                Rendu des pages BDD Familiers (fetch pets_db.json ; window.PET_ID)
│   └── pets.js                   Logique Familiers (promenade verticale scroll-jack ; fetch pets_db.json ; sélecteur de niveau → palier/skill/coûts ; i18n GlobalLang)
│
├── data/                         Données consommées par les calculateurs (JSON éditées à la main)
│   ├── research_db.json          720 lignes (arbres de recherche, coûts/temps par palier)
│   ├── truegold_db.json          Bâtiments TrueGold (rangeData, bldgMap, config, référence paliers)
│   ├── truegold_war_db.json      Académie de Guerre : {meta, scoring, trees} — généré depuis un CSV
│   ├── heroes_db.json            34 héros (génération, rareté, type, skills bilingues)
│   ├── beartrap_joiners_db.json  Tier-list joiners Piège à Ours : rang (S>A>B>C>D) par génération de serveur (IDs héros)
│   ├── masters_db.json           6 experts (paliers d'affinité, passif, skills)
│   ├── shopcalc_items.json       91 objets (valeur en gemmes) — référentiel
│   ├── shopcalc_classic.json     Boutiques classiques (contenu + coûts)
│   ├── shopcalc_events.json      Boutiques d'événement (avec endsAt)
│   ├── shopcalc_chests.json      Coffres personnalisés (composition)
│   └── pets_db.json              14 familiers / 7 générations : skill (nom/desc + valeurs/palier) + coûts nourriture/avancement — bilingue {EN,FR}
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
│   └── masters/                  Base de données Experts (index + 1 page/expert, tables depuis JSON)
│       ├── index.html            Sommaire des 6 experts
│       └── <expert>.html         valora, pan, roman, cassia, guinevere, wilson (fetch masters_db.json)
│
│   └── pets/                     Base de données Familiers (index + 1 page/familier, tables depuis JSON)
│       ├── index.html            Sommaire des 14 familiers
│       └── <pet>.html            gray-wolf, lynx, bison, … (fetch pets_db.json)
│
├── img/                          Assets (WebP partout, sauf favicons logo/ en PNG, SVG icônes)
│   ├── logo/                     favicon.svg, favicon-32.png, apple-touch-icon.png (PNG conservés : fallback favicon + icône iOS non compatibles WebP)
│   ├── buildings/                Vignettes bâtiments (.webp)
│   ├── WarAcademy/               Icônes recherches Académie de Guerre (.webp)
│   ├── heroes/                   Portraits héros (.webp)
│   ├── Master/ + MasterSkill/    Portraits experts + icônes skills experts (.webp)
│   │   └── Master/hd/            Portraits pleine page 600×800 pour `masters.html` uniquement (cf. §5)
│   ├── skills/ + widgetname/ + widgetskill/  Icônes skills héros & widgets (.webp)
│   ├── Item/                     Icônes objets boutique/ressources (.webp) — **nom de fichier = `name.EN` de l'objet** (`scImg()`), carré ~100–200 px, fond transparent. **18 objets n'ont pas encore d'icône** (skins, VIP, emote, mégaphone…) : la case reste vide, sans erreur
│   ├── shops/                    *(à créer)* Vignettes de boutique `<slug>.webp`, format **16:9** (~640×360). Facultatif : sans fichier, la carte affiche la mosaïque des 4 meilleurs objets
│   └── pets/                     Familiers : portraits (.webp ×14) + sous-dossier skills/ (icônes compétence, .webp ×14)
│
└── .github/
    ├── workflows/discord-announce.yml  Workflow : publie l'annonce (déclenché par le commit de announce.md)
    ├── scripts/announce.js             Script Node : lit announce.md → 2 embeds Discord (FR + EN)
    └── news/announce.md                Annonce en attente : en-tête `covers-until` + sections `## FR` / `## EN`
```

---

## 3. Pages

| Page | Rôle | JS liés | CSS | Données |
|---|---|---|---|---|
| `index.html` | Hub : cartes par catégorie | `hub.js` (+ socle) | `style.css` | — (lit `SITE`) |
| `research_calc.html` | Optimiseur de recherches | `research_script.js` | `style.css` | `research_db.json` |
| `truegold_calc.html` | Planif. bâtiments TrueGold | `truegold_script.js` | `style.css` | `truegold_db.json`, `masters_db.json` (affinité) |
| `waracademy.html` | Planif. recherches troupes TG | `wa_optimizer.js`, `waracademy.js` | `style.css`, `waracademy.css` | `truegold_war_db.json` |
| `beartrap_calc.html` | Répartition marches Piège à Ours | `beartrap.js` | `style.css` | `heroes_db.json`, `beartrap_joiners_db.json` (tier-list) + caserne (localStorage) |
| `vikings.html` | Répartition troupes Vikings | `vikings.js` | `style.css` | formations Piège à Ours (localStorage) |
| `caserne.html` | Gestion héros | `caserne.js`, `modal-tabs.js` | `style.css` | `heroes_db.json` |
| `masters.html` | Experts & affinités (beta) | `masters.js`, `modal-tabs.js` | `style.css` | `masters_db.json` |
| `shop_calc.html` | Sommaire des boutiques : 3 familles + accès au référentiel (beta) | `shop-core.js`, `shop_calc.js` | `style.css`, `db.css`, `shop.css` | `shopcalc_items/classic/events/chests.json` |
| `shop/<boutique>.html` | Une boutique : en-tête, podium, tableau (1 ligne/objet) + mode édition | `shop-core.js`, `shop-page.js` | `style.css`, `db.css`, `shop.css` | idem (via `window.SHOP_SLUG`) |
| `shop/items.html` | Valeur des objets : référentiel gemmes éditable | `shop-core.js`, `shop-items.js` | `style.css`, `db.css`, `shop.css` | `shopcalc_items.json` |
| `pets.html` | Familiers : promenade verticale (fiches pets) | `pets.js` + `header.js`, `lang.js`, `site-config.js` | `style.css`, `pets.css` (+ webfonts) | `pets_db.json` |
| `database/buildings/*.html` | Tables d'amélioration bâtiments | inline + `header.js`, `lang.js`, `site-config.js` | `style.css`, `db.css` | données inline (HTML) |
| `database/waracademy/*.html` | Tables recherches Académie (3 arbres) | inline + `header.js`, `lang.js`, `site-config.js` | `style.css`, `db.css` | `truegold_war_db.json` (fetch) |
| `database/masters/*.html` | Fiches Experts : affinité, passif, compétences | `db-masters.js` + `header.js`, `lang.js`, `site-config.js` | `style.css`, `db.css` | `masters_db.json` (fetch) |
| `database/pets/*.html` | Fiches Familiers : compétence/palier, avancements, nourriture | `db-pets.js` + `header.js`, `lang.js`, `site-config.js` | `style.css`, `db.css` | `pets_db.json` (fetch) |

**Socle chargé sur toutes les pages outils** (ordre) : `site-config.js` → `storage-keys.js` → `profiles.js` → `lang.js` → `help.js` → *(script de page)* → `header.js` → `backup.js`.
Les pages `database/buildings/*` et `database/waracademy/*` n'incluent que `site-config.js` + `lang.js` + `profiles.js` + `header.js` (pas de help/backup ; `profiles.js` y sert uniquement l'UI de profils du header — pas de données métier à isoler) ; `database/masters/*` et `database/pets/*` ajoutent en plus leur script de rendu dédié (`db-masters.js` / `db-pets.js`), qui pose `window.MASTER_ID` / `window.PET_ID` et gère l'i18n de la page (dict + `data-en`/`data-fr`). **Les 35 pages `database/*` chargent `css/style.css` puis `css/db.css`** (feuille partagée extraite des anciens `<style>` inline). `pets.html` charge `site-config.js` + `storage-keys.js` + `lang.js` + `header.js` + `pets.js` + `backup.js` (sauvegarde des niveaux via `STORAGE_KEYS.pets`), sans `help.js`, plus `css/pets.css` et deux webfonts Google (Cormorant Garamond + Karla).

**Conventions d'affichage des fiches BDD (Experts/Familiers)** — pilotées par `db-masters.js` / `db-pets.js` :
- **Placeholder « X » doré** : le « X »/« X% » des descriptions (la valeur qui change au palier) est mis en valeur via `<span class="hl-x">` (helper `highlightX()`, X isolé seulement — « XP » n'est pas touché). Style dans `style.css`.
- **Effets à deux valeurs → deux colonnes** : quand un `effect` d'Expert vaut `(a;b)` (deux X dans la phrase, cf. §6), `db-masters.js` éclate la colonne « Effet » en **« Effet 1 » / « Effet 2 »** (helpers `effIsDual()` / `effParts()` / `effHead()` / `effCells()`), valeurs en `.num` (compactes). Un effet simple reste sur une colonne `.c-eff`.
- **Lisibilité tableaux** : tables au contenu (`.db-section table { width:auto }`) avec en-têtes numériques alignés à droite (`th.num`) pour coller les titres aux valeurs ; sur mobile (≤ 820px) chaque table défile dans sa boîte (`.tbl-scroll`), 1ʳᵉ colonne (palier) figée, page sans débordement (cf. §5).
---

## 4. Système bilingue (i18n)

Deux mécanismes, tous deux réagissant à l'event global **`langChanged`** émis par `GlobalLang.set()` :

1. **Dictionnaire + `data-i18n`** (pages outils) :
   - Chaque script de page déclare un objet `const i18n = { FR:{clé:…}, EN:{clé:…} }`.
   - Dans le HTML : `<span data-i18n="clé">…</span>` (et `data-i18n-placeholder="clé"` pour les inputs).
   - `GlobalLang.applyI18n(i18n[lang])` remplace `textContent` / `placeholder`.
2. **Attributs inline `data-en` / `data-fr`** (pages `database/buildings/*`) :
   - `<td data-en="Bread" data-fr="Pain">Pain</td>` — un petit script inline applique `data-<lang>` sur `[data-en][data-fr]`.

**Langue** : stockée sous `hub_lang` (clé propre à `GlobalLang`, défaut `EN`). Sur desktop, le header expose un **bouton rond « globe + code »** (`.app-header-lang`, jumeau visuel du bouton thème) qui bascule FR⇄EN via `GlobalLang.set()` (`hdrInitLangToggle`/`hdrUpdateLangCode` dans `header.js`) ; sous 820px et en mode condensé il est masqué (langue reprise dans le drawer / le panneau profil). Les boutons `.lang-btn` du hub restent synchronisés via `GlobalLang.applyToButtons` (`applyToSelect` demeure un utilitaire générique, plus utilisé par le header).

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
`pets.html` **s'écarte volontairement** de la DA Royal Gold : scène « sentier » en palette nature/jour (verts + terre, valeurs `oklch`), carte info blanche translucide, **webfonts** Cormorant Garamond + Karla. Pastilles de la sidebar colorées **par génération** (`--gen-1…7`), étoiles de palier (`--star`), sélecteur de niveau + pips de valeurs propres à cette page. Header reste en DA standard. Choix validé ; tout est isolé dans `css/pets.css` + `js/pets.js`.
**Mobile (< 880px)** : la promenade laisse place à une colonne centrée qui défile — image (`.pet-flow-img`) au-dessus de la carte, toutes deux dans `#petFlow` (`display:contents` sur desktop, donc sans effet hors mobile). Le décor reste fixe derrière ; `.animals` et la parallaxe sont hors circuit. Le sentier devient une frise de pastilles numérotées (`.pp-dot .pp-n`) ancrée en bas ; navigation par balayage **horizontal** (le vertical est rendu au défilement de la fiche).


**Header — pastille profil + adaptatif (Option B)** : la zone droite du header porte une pastille profil (avatar à initiale + anneau coloré par profil, réutilise le mécanisme `.hdr-dd`). Sur desktop, quand la rangée d'outils est **rognée** (mesure : `need = cat + hdr-tools.scrollWidth` vs `hdr-center.clientWidth`, avec **hystérésis** anti-clignotement, cf. `hdrEvaluateAdaptive`), le header passe en `.hdr-condensed` : langue + thème quittent la barre et se replient dans le panneau profil (`.pfp-chrome`), rendant la place aux outils. Sous 820px la nav (dont langue/thème) vit dans le drawer, qui reçoit en tête un bloc profil. Toute l'UI profil est dans `header.js` (`hdrBuildProfile`, `hdrOpenProfilesModal`, `hdrInitAdaptive`…).

**Palier serveur (TrueGold)** : sélecteur `#serverTier` (TG3 / TG5 / TG8 / TG10, **défaut TG8**), 1ᵉʳ paramètre du groupe *Configuration*. L'âge du serveur ouvre les paliers par crans : au palier N, le dernier niveau existant en jeu est `TGN-0` (`TGN-1` n'est pas encore sorti). Le plafond ne s'applique **qu'à l'optimiseur** — `niveauOuvert(label, palier)` écarte les améliorations candidates dans `executerPlan()` ; le tableau garde tous les niveaux sélectionnables et les totaux par ligne sont inchangés. Les bâtiments **déjà au-dessus** du palier sont gelés (ils comptent toujours comme prérequis) et listés dans un bandeau ⚠️ en tête du plan — bandeau affiché aussi quand aucun scénario n'est possible. Persisté avec le reste sous `STORAGE_KEYS.truegold`.

**Plan d'amélioration TrueGold (`.tg-plan`)** : le résultat de l'optimiseur est affiché en **séries chronologiques** — des niveaux consécutifs d'un même bâtiment, numérotées dans l'ordre réel d'exécution. Un bâtiment **réapparaît** autant de fois que l'escalier des prérequis l'impose (Centre-ville ⇄ Ambassade + bâtiments de troupes) ; ne jamais regrouper par bâtiment, la liste deviendrait inapplicable en jeu. Chaque série est un `<details>` (`.tg-serie`) : l'en-tête donne totaux TG/TTG, durée, points KVK, statut et la mention `🔓 débloque #n …` (calculée en croisant les prérequis TG de la série suivante) ; le corps déplié contient le tableau niveau par niveau (`.tg-steps`, largeur au contenu, colonnes num. à droite, ombres de bord CSS pour le scroll mobile). L'état déplié survit aux re-rendus via `TG_OPEN_SERIES` (clé `bâtiment|départ>arrivée`).

**Optimiseur TrueGold — mode KVK résolu exactement** (`resoudreKVKExact`, `truegold_script.js`) : les modes *Max bâtiments* et *Score cible* restent gloutons (un niveau à la fois, meilleur poids immédiat) ; le mode **KVK (max points)**, lui, explore **toutes** les combinaisons. Le glouton y était structurellement piégé : il ne peut pas « investir » dans un bâtiment sans intérêt propre mais qui en débloque un bien plus rentable (l'Écurie TG7 ouvre le Centre-ville TG7-1), et deux bâtiments jumeaux au poids identique (Stand de tir / Écurie, mêmes coûts et mêmes temps) étaient départagés par le seul **ordre des lignes du tableau** — le joueur pouvait donc gagner des points en *décochant* un bâtiment. Ce qui rend l'exhaustif possible :
- **l'état se résume au vecteur de niveaux** (+ le bâtiment en construction) : TG, TTG et accélérateurs restants s'en déduisent, donc deux ordres menant aux mêmes niveaux sont un seul état → mémoïsation (valeur empaquetée en un nombre : `points × 16 + premier coup`, le chemin est relu par `reconstruire()` — garder un tableau par état coûtait des dizaines de Mo quand l'exploration est abandonnée) ;
- **le nombre de transformations n'a plus de boucle 0..100** : pour un plan donné, `transfosNecessaires()` donne en O(1) le minimum de transformations qui le finance (les deux stocks étant monotones). Le bloc TRIM ne s'applique donc plus aux plans exacts ;
- **la règle des files borne la profondeur** : le plan s'arrête dès 2 constructions lancées sans accélérateurs.
Le score ne dépendant pas de l'ordre, `regrouper()` réordonne le plan pour qu'il se lise en quelques séries (cf. `.tg-plan`) et `rejouer()` valide le résultat — sinon on garde l'ordre brut. **Garde-fou** : au-delà de `KVK_MAX_ETATS` (60 000) on rend la main au glouton, qui rejoue alors ses 3 stratégies **plus une variante par bâtiment écarté** (l'astuce manuelle du joueur, automatisée). Mesures : médiane 16 états, p99 21 000, `runCalculator` ~25 ms au pire sur 250 scénarios, ~150 ms sur les cas extrêmes qui déclenchent le repli.

**Optimiseur Académie de Guerre — mode KVK** (`wa_optimizer.js`) : **reste glouton** (un niveau à la fois, pas de retour arrière) — contrairement à TrueGold, l'exhaustif est hors de portée : les 3 arbres dépassent **2 millions d'états** dès 3 000 poussière, là où TrueGold en compte une centaine. Le mode KVK garde donc le meilleur plan parmi plusieurs candidats (`KVK_ORDERS`), et le même piège qu'à TrueGold y était présent : on gagnait des points en **décochant un arbre**. Deux ajouts le corrigent :
- **Ordre `'chain'`** : un niveau verrouillé par un *prérequis* (pas par le palier d'Académie, qui ne s'achète pas) est valorisé comme un **paquet** — tous les niveaux manquants + lui-même — dont la densité (points/poussière) est portée par sa première marche jouable. Sans ça le glouton ne pouvait jamais investir dans une suite de niveaux médiocres qui ouvre une bien meilleure affaire : le **nœud de palier de troupe** vaut 2 765 pts/poussière (le meilleur de la base) mais se cache derrière ~8 600 poussière de niveaux à 1 631 (les pires). Face à trois arbres quasi symétriques, l'ancien glouton entamait les trois chaînes et n'en finissait aucune. La part déjà payée sortant du calcul, une chaîne entamée devient de plus en plus attractive → elle est terminée. **Deux garde-fous obligatoires** : ne s'engager que si le paquet tient dans le budget restant **de poussière ET d'accélérateurs**, et ne retenir comme première marche qu'un niveau *appartenant* au paquet (un prérequis déjà satisfait est enregistré à coût nul, son niveau suivant est hors paquet et donc non financé).
- **Relance sur chaque arbre seul** : le plan optimal **concentre** — à 15 000 poussière il met 13 540 dans un arbre et laisse les deux autres au minimum. Aucun glouton réparti ne propose ça ; le même glouton limité à un arbre, si. Coût borné : 4 ordres × (1 + nb d'arbres) plans.

Résultat : **+4 à +6,5 %** de points dans la plage concernée, à ≤ 0,4 % de l'optimum réel (sauf gros budgets, ~1,8 % restants) ; sur 600 scénarios aléatoires, 123 améliorés (+12 % en moyenne) et **aucune régression**. Coût : 2 à 16 ms dans Chromium, derrière le debounce de 160 ms de la page. Les modes *Classique* et *Score cible* ne passent pas par ce chemin et rendent une sortie **identique**. *(Note : l'en-tête du module affirmait que le temps ne contraignait qu'en mode Classique — faux depuis plusieurs versions, corrigé.)*

**Portraits d'Experts — deux jeux d'images selon la taille d'affichage** :
- `img/Master/<Nom>.webp` (96–124 px) : vignettes d'origine, utilisées par les pages `database/masters/*` qui les affichent en 84–92 px. Nettes à cette taille, et légères. **Ne pas les remplacer.**
- `img/Master/hd/<Nom>.webp` (600×800) : portraits pleine page pour `masters.html` seul, servis par le helper `masterPortrait()` de `js/masters.js`. Le cadre `.master-portrait` fait 320 px de haut (et `#modal-header-bg` 400×150) : les vignettes d'origine y subissaient un agrandissement ×2,6 à ×3,2, d'où la pixellisation — que des `filter: blur()` masquaient au prix d'une image floue (supprimés).
- **Ratio 3:4 imposé** : `.master-portrait` fait 240×320, donc une source 600×800 n'est pas recadrée par `background-size: cover`. Les captures de jeu n'ont pas ce ratio ; elles sont calées en *contain* puis les bandes manquantes sont comblées en moyennant les pixels du bord (le fond doré est un dégradé lisse, la jointure est invisible). Rogner quelques pixels de bordure sur la source est nécessaire : les captures portent des salissures collées au cadre qui ressortiraient à la jointure.

**Boutiques — une page par boutique (`shop/*.html`)** : structure calquée sur `database/*` mais **hors** de `database/` — ces pages portent de l'état utilisateur (monnaie, stock restant) et chargent donc le socle complet (`storage-keys` → `profiles` → `help` → `backup`), là où les pages BDD sont en lecture pure. Conventions :
- **`shop_calc.html` reste l'URL du sommaire** (déjà indexée, référencée par `site-config.js`) : elle a changé de rôle, pas d'adresse. Trois familles y sont listées — Événement / Permanentes / Coffres — plus un accès au référentiel `shop/items.html`.
- **Les cartes du sommaire sont écrites en dur** (liens, noms, monnaies via `data-en`/`data-fr`), comme les sommaires `database/*/index.html` : le maillage interne doit exister sans exécuter le JS. `shop_calc.js` n'hydrate que ce qui dépend des données ou de l'heure (vignette, nombre d'objets, badge de statut) puis réordonne les événements.
- **Une page boutique** = `<base href>`, `title`/`meta description`/`h1`/intro **en dur** (jamais reconstruits par le JS, sinon le bouton d'aide accroché après le `h1` saute au changement de langue), plus `window.SHOP_SLUG` ; tout le reste est rendu par `shop-page.js` dans des conteneurs vides (`#sp-thumb`, `#sp-facts`, `#sp-actions`, `#sp-cart`, `#sp-podium`, `#sp-table`, `#sp-switch`). Le bouton d'aide est ancré sur `#sp-facts`. Les raccourcis vers les autres boutiques (`#sp-switch`, classe `db-switch footer`) sont **sous le tableau** : on choisit une autre boutique après avoir lu celle-ci, pas avant.
- **Le contenu d'une boutique est un tableau, une ligne par objet** (`table.sx-table`) — pas une grille de cartes : à surface égale il montre 3 à 4 fois plus d'objets, et les colonnes se comparent en diagonale. Les colonnes racontent trois blocs : *ce que ça coûte* (Qté, Coût) → *ce que ça vaut* (Valeur gemmes, Ratio) → *ce que tu peux en tirer* (Restant, Max fin, Obtenable, Coût obt., événements seulement, séparés par un filet `.sep`). Seul le podium des 3 meilleures affaires garde des visuels.
- **Mode édition (crayon)** : les boutiques d'événement restent ajustables — quantité, coût, stock restant, ajout et retrait d'objets, réinitialisation à la version du fichier. Ces champs n'apparaissent **que** dans le mode édition (`SP_EDIT`, volontairement non persisté : personne ne doit rester en édition sans le savoir), déclenché par le bouton `.sx-edit-toggle`. La colonne de suppression est `position:sticky; right:0` — une action qui sort du champ au scroll horizontal est une action perdue.
- **Panier / budget (boutiques d'événement)** : `si.take` = nombre de **lots** retenus (un objet se vend souvent par lot, d'où la colonne « Qté » qui reste la taille du lot). `scComputeRows()` calcule en **deux passes** — d'abord le coût de la sélection, ensuite seulement le `canTake` de chaque ligne, qui dépend du solde restant donc de toutes les autres lignes. Quatre tuiles en tête (`#sp-cart`) : monnaie, dépensé, **restant**, valeur obtenue. Panier et mode édition **s'excluent** : l'un consomme la boutique, l'autre la corrige. Pas de remplissage automatique — écarté par Paul : le joueur choisit lui-même.
- **Re-rendu après saisie** : `spAfterEdit()` diffère la reconstruction d'un tick (`setTimeout 0`), et `spSnapshotTable()`/`spRestoreTable()` remettent en place le **défilement du `.table-container` et le focus** (`[data-i]` + `[data-role]` sur les contrôles du panier) : sans eux, chaque clic sur le « + » d'une ligne du bas ramenait le tableau en haut et faisait perdre le bouton sous le curseur. Remplacer le tableau depuis le `change` d'un champ détruit ce champ pendant que le navigateur traite son `blur` — ce qui lève une DOMException. Le report coalesce aussi les appels rapprochés.
- **Largeur de page — piège** : `body:not(.hub-body)` est en `display:flex` (style.css §282, héritage des pages calculateur à sidebar). Un `.db-page` sans largeur explicite y devient un **flex item dimensionné par son contenu** : sa largeur ne suit plus l'écran, et `repeat(auto-fill, …)` — qui exige une largeur connue — retombe sur **une seule colonne**. Le symptôme est sournois : le nombre de colonnes dépendait des **polices du système** (3 sous Linux, 1 sous Windows, à code identique). `shop.css` corrige avec `body:not(.hub-body) .db-page { width:100%; min-width:0 }`. Les pages `database/*` ont le même défaut latent, masqué par leurs tableaux larges qui forcent la largeur.
- **Récapitulatif du panier (`.sx-cartbar`)** : barre `position:sticky; bottom:0` placée **hors du `<table>`**, après `.table-container`. Ne pas la remettre en `<tfoot>` : Chromium ne colle un `tfoot` sticky qu'une fois le défilement entamé, donc elle serait invisible à l'arrivée sur la page. Son contenu est **aligné à gauche** parce que `.backup-fab` (style.css) est en `position:fixed` à droite avec `z-index:9000` et passera toujours devant.
- **Largeur des tables** : `style.css` cale les tables BDD sur leur contenu (`.db-section table.db-table { width:auto }`) ; `shop.css` rétablit `width:100%` pour `.sx-table` et laisse la colonne du nom absorber le reste, sinon une boutique à 6 colonnes laisse la moitié de la page vide.
- **Événement terminé = page conservée**. Supprimer une URL indexée est le seul vrai dégât SEO possible ici, et les boutiques reviennent d'une saison à l'autre. La carte du sommaire passe en grisé (`.sx-card.is-ended`, vignette en `grayscale`) **et reste cliquable** ; la page affiche un bandeau d'archive. Ajouter une boutique = 1 entrée JSON + 1 page + 1 carte au sommaire + 1 ligne `sitemap.xml`.
- **Vignettes** : `img/shops/<slug>.webp` si le fichier existe, sinon **mosaïque de secours** des 4 objets de plus forte valeur de la boutique (`scThumbHtml`) — l'image réelle recouvre la mosaïque, un `onerror` la retire si elle manque. Aucune image à produire pour que le sommaire soit présentable.
- **Compte à rebours** : `scTimeLeft()`/`scTimeLeftTxt()` (affichage en J+H, rafraîchi chaque minute sur `[data-ends-at]`) est **distinct** de `scResetsLeft()` (nombre de réinitialisations 00h UTC restantes, qui multiplie le stock des objets à reset quotidien). Ne jamais fusionner les deux : l'un est cosmétique, l'autre entre dans les calculs.

**Modales de détail (Caserne / Experts)** : tiroir latéral 400px sur desktop, plein écran + onglets sous 820px. Les sections de `#modal-body` portent `data-mtab="<clé>"` ; `js/modal-tabs.js` génère la barre `.mtabs` et n'affiche qu'un panneau à la fois (classe `.mtab-on`). Un panneau vide masque son onglet. Ajouter une section = poser `data-mtab` + déclarer la clé dans `PAGES` du module.


## 6. Données

Toutes les données sont des **JSON éditées à la main** dans `data/` (pas de script générateur ni de CSV commités). Les textes sont bilingues via objets `{EN, FR}`.

| Fichier | Format / schéma |
|---|---|
| `research_db.json` | **Liste** de 720 entrées : `{Tree, Name, Fr Name, Level, Time (d/h/m/s), coûts ressources…}` (18 champs). |
| `truegold_db.json` | **Objet** : `rangeDataTTG`, `bldgMap`, `defaultBuildings`, `dbDataRaw`, `levelsReference`, `buildingsConfig`. L'ordre de `defaultBuildings` est aussi l'**ordre d'affichage canonique** du tableau : `normalizeBuildingOrder()` (truegold_script.js) le réapplique après `loadData()`, sinon l'ordre resterait figé dans les sauvegardes des joueurs existants. |
| `truegold_war_db.json` | **Objet** `{meta, scoring, trees}`. `meta.warAcademyMaxLevel`; `scoring = {pointsPerDust:1000, pointsPerSpeedupMinute:60}`; `trees` = 3 arbres × recherches × niveaux (`req` = prérequis même arbre, `reqWA` = palier bâtiment requis). Note meta : « généré depuis `tools/data-src/war_academy.csv` » (CSV **non** commité). |
| `heroes_db.json` | **Liste** de 34 héros : `{id, name{EN,FR}, generation, rarity, troopType, goodJoinerBear, skills[]}`. |
| `beartrap_joiners_db.json` | **Objet** `{_meta, byGeneration}`. `byGeneration[gen]` = `{S:[ids], A:[…], B, C, D}` (rang du héros-joiner à cette génération de serveur, IDs = `heroes_db.json`). Cumulatif et sujet au power-creep (un même héros change de rang selon la gen). En cas de doublon d'id, le **meilleur** rang prime. Converti depuis une tier-list communautaire (xlsx non commité). |
| `masters_db.json` | **Liste** de 6 experts : `{id, name, title, affinityBonus, affinityMilestones[{level,affinity,emblems,bonus}], passive, skills[], affinity}`. **Convention `effect`** (passif & skills) : chaîne remplaçant le(s) « X » de la phrase. Une seule valeur → ex. `"+27%"`. **Deux valeurs** (phrase à deux X) → format `"(a;b)"` (ex. `"(5;20)"`) : la BDD l'éclate en deux colonnes « Effet 1 »/« Effet 2 » (cf. §3). |
| `shopcalc_items.json` | **Liste** de 91 objets : `{id, name{EN,FR}, category, gemValue, skin?:true}` (référentiel de valeur). Les entrées **`skin: true`** (4 à ce jour) sont des *variantes visuelles* référencées par `skinId` dans les boutiques/coffres : elles n'ont ni `category` ni `gemValue` (la valeur reste celle de l'objet porteur, ex. `town_skin`), et fournissent le nom affiché entre parenthèses + l'image de la carte. Un `skinId` qui ne correspond à aucun id **échoue en silence** (parenthèse absente, image de l'objet porteur) — vérifier le référencement croisé après ajout. |
| `shopcalc_classic.json` | **Liste** de boutiques : `{id, slug, name, resourceName, resourceShort, items[{itemId, qty, cost}]}`. |
| `shopcalc_events.json` | **Liste** de boutiques d'événement : `{id, slug, name, endsAt, resourceName, items…}`. |
| `shopcalc_chests.json` | **Liste** de coffres : `{id, slug, name, items[… , skinId?]}`. |

**`slug` (boutiques)** : c'est le nom de fichier de la page (`shop/<slug>.html`) et la clé de résolution de `scFindBySlug()`. Il a été **ajouté à côté de `id`, jamais à la place** : les éditions des joueurs sont persistées par `id` dans `shopcalcEvents`, renommer un `id` effacerait leurs données. Les `id` gardent donc leur casse d'origine (`Polar_Shop`, `Summit_Contest_Champion_store`) pendant que les `slug` sont en kebab-case.
| `pets_db.json` | **Objet** `{_meta, pets[]}`. Chaque pet : `{id, name{EN,FR}, generation, maxLevel, skill{name{EN,FR}, desc{EN,FR}, cooldown?, effects[{label{EN,FR}, note{EN,FR}, values[]}]}, advancements[{growthManual, nutrientPotion, promotionMedallion}], petFood[]}`. 14 pets / 7 gén. **Conventions** : palier skill = **nb d'avancements faits** (caps aux niv. 10,20,…,`maxLevel` ; l'avancement au cap `N` débloque le palier `N/10` et **ne change pas le niveau** ; niveau `N` ≠ avancement fait → modèle à 2 statuts, cf. Masters) ; `values[]` = 1 valeur/palier (nb = `maxLevel/10` = nb d'`advancements`) ; `desc` garde le placeholder `X`/`X%` (remplacé au palier courant) ; `petFood[i]` = coût niv (i+1)→(i+2), longueur `maxLevel-1` ; le champ `note` existe mais **n'est plus affiché**. **Provenance** : converti depuis `Pets_data.xlsx` (non commité), FR relu à la main. |

**Provenance** : édition manuelle directe dans le JSON déployé. Aucune génération via GitHub Actions.

---

## 7. Automatisations (GitHub Actions)

Un seul workflow : **`discord-announce.yml`** (annonce Discord rédigée à la main, plus aucune traduction automatique).
- **Déclencheur** : push sur `main` touchant `.github/news/announce.md` (= committer ce fichier publie l'annonce) + `workflow_dispatch` avec entrée `dry_run` (aperçu sans envoi).
- **Mécanique** : `announce.js` lit `.github/news/announce.md`, extrait l'en-tête `<!-- kshub-news … -->` et les sections `## FR` / `## EN`, et POST un message à 2 embeds sur le `DISCORD_WEBHOOK` (`secrets`). Les commentaires HTML ne sont jamais publiés → gabarit vide = aucun envoi.
- **Pointeur** : la clé `covers-until` (SHA) de l'en-tête indique jusqu'où portait l'annonce précédente. Elle sert à lister les commits à couvrir au moment de rédiger la suivante. Aucun cache Actions, aucun commit de bot.
- **Clés d'en-tête** : `covers-until`, `generated`, `ping` (mention, optionnel), **`ping-fr` / `ping-en`** (mention propre à chaque langue), `color` (hexa, défaut `F5B840`), `title-fr`, `title-en`.
- **Mentions** : la mention vit dans le `content` du **message**, jamais dans l'embed (une mention écrite dans un embed s'affiche mais **ne notifie personne**). Un message ne portant qu'un seul `content`, renseigner `ping-fr` et/ou `ping-en` **force l'envoi en deux messages** (FR puis EN), chacun avec sa mention. La clé `ping` seule garde l'ancien comportement (mention sur le premier message). Une mention de rôle ne notifie que sous la forme `<@&ID>` — en clair (`@MonRôle`) elle reste du texte mort.
- **Limites Discord** : 4096 car./embed, 6000 car. cumulés → au-delà de 5200 car. (FR+EN), le script scinde en deux messages au lieu de tronquer.
- **Convention** : committer `announce.md` **seul**. S'il part avec des modifs de site, celles-ci glissent simplement sur l'annonce suivante.
- **Secrets** : `secrets.DISCORD_WEBHOOK`. `vars.SRC_LANG` n'est plus utilisé.

---

## 8. Persistance (localStorage)

Clés « chrome » (hors registre, **globales — partagées entre profils**) : **`hub_lang`** (langue, défaut `EN`), **`hub_theme`** (thème, défaut `dark`), `help_seen_<id>` (bandeaux d'aide vus), **`kt_profiles`** (registre des profils).

**Profils (comptes multiples)** — `js/profiles.js` (chargé tôt) installe un **proxy transparent sur `localStorage`** : les scripts continuent d'appeler `localStorage.getItem/setItem(STORAGE_KEYS.x)` sans modification, mais chaque **clé métier** (toute valeur de `STORAGE_KEYS`) est rangée sous `kt::<profileId>::<clé>` pour le profil actif. Les clés chrome ci-dessus restent globales. Au 1ᵉʳ chargement, les données « à plat » existantes sont **migrées** vers le 1ᵉʳ profil (aucune perte). API `window.Profiles` : `list/get/active/activeId`, `create/rename/remove/switch` (bascule = `location.reload()` + toast), `consumeSwitchToast`. Registre `kt_profiles` = `{v, activeId, profiles:[{id, name, color}]}`. UI dans `header.js` (pastille desktop + panneau, bloc drawer mobile, modale « Gérer les profils » réutilisant la DA `.backup-*`). L'export/import de `backup.js` opère automatiquement sur le profil actif (via le proxy) — pratique pour transférer un profil vers un autre appareil.

Clés métier — source unique **`js/storage-keys.js`** (`window.STORAGE_KEYS`) :
| Clé JS | Valeur localStorage |
|---|---|
| `caserneHeroes` | `caserne_user_heroes` |
| `caserneFilters` | `caserne_filters` |
| `masters` | `masters_user_data` |
| `researchDb` | `research_calc_db_v9` |
| `researchInputs` | `research_calc_inputs_v9` |
| `beartrap` | `beartrap_data` |
| `beartrapJoiners` | `beartrap_joiners` |
| `truegold` | `tg_calc_data_v3` |
| `waracademy` | `wa_calc_data_v1` |
| `vikings` | `vikings_data` |
| `shopcalcItems` | `shopcalc_items` |
| `shopcalcClassic` | `shopcalc_classic` |
| `shopcalcEvents` | `shopcalc_events` |
| `shopcalcTab` | `shopcalc_tab` |
| `shopcalcCollapsed` | `shopcalc_collapsed` |
| `pets` | `pets_levels` |

Lecture sûre via `safeParse(key, fallback)` (try/catch → fallback si JSON corrompu). Export/import ciblé par module dans `backup.js` (`BACKUP_MODULES`).
**Partage de données inter-outils** : `beartrap.js` lit `caserneHeroes`; `vikings.js` réutilise `beartrap` (formations/troupes).
**Bonus de capacité liés à une compétence** (auto, mais toujours modifiables — même principe que le bonus PAN de TrueGold) :
- **Bonus Expert** (Bear Trap) ← compétence « Avantage primitif » (`savage_advantage`) de **Valora** : `masters_db.json` (valeur/niveau) + `masters` localStorage (niveau saisi page Experts).
- **Bonus Animal** (Bear Trap **et** Vikings) ← compétence du **Puissant Bison** (`mighty-bison`) : `pets_db.json` (valeur/palier) + `pets` localStorage (palier atteint page Familiers).
- Le champ se remplit tout seul (badge 🟢 Auto). Dès que l'utilisateur l'édite il passe en ✏️ Manuel ; le bouton ↺ resynchronise sur la compétence. Le mode auto/manuel est persisté (`cap-expert-auto`/`cap-animal-auto` dans `beartrap`, `animalAuto` dans `vikings`).

**Héros joiners autorisés (Bear Trap)** : le bouton « 🛡️ Héros autorisés » ouvre une modale (`#joiner-auth-modal`) listant les joiners de la **génération de serveur** sélectionnée, groupés par rang (`beartrap_joiners_db.json`). L'utilisateur coche ceux que son alliance permet ; **C et D décochés par défaut** + badge « Non recommandé ». Choix persistés **par génération** dans `beartrapJoiners`.
**Portée (important)** : la tier-list + l'autorisation ne s'appliquent qu'au **capitaine** de chaque marche *joiner* (slot 1, seul héros portant l'effet du rally) — capitaine choisi parmi les héros autorisés, base niveau+compétences puis **rang** (S→D) en départage. Les **renforts** (slots 2 & 3) n'influencent que la **capacité** de la marche (via leur niveau : `penalty = 13470 − capacité(niveau)`, cumulée sur les 3 héros) : on prend **n'importe quel héros débloqué**, **un par autre type** (composition imposée inf/cav/arc), au plus haut niveau, en **réservant** les capitaines potentiels (autorisés) pour les autres marches. Le mode **Hôte/organisateur** garde son ancienne logique (`organizerTierList`).

---

## 9. Conventions & pièges connus

**Conventions**
- **Manifeste unique** : ajouter une catégorie / un outil = éditer **uniquement site-config.js**. SITE.nameetSITE.home alimentent le logo du header. (jamais coder la nav en dur).
- **Notifications Discord** : plus aucun mapping à maintenir. Un nouvel outil n'exige aucune modification de `.github/` — il apparaîtra dans la prochaine annonce rédigée.
- **Clés localStorage** : toujours passer par `STORAGE_KEYS` + `safeParse` (jamais de chaîne littérale).
- **i18n** : toute chaîne visible passe par un dictionnaire `{FR,EN}` + `data-i18n` (ou `data-en`/`data-fr` sur les pages bâtiments). Réagir à `langChanged`.
- **Icônes** : SVG Lucide **inline** (offline) via `SITE_ICONS`/`iconSvg()` (site-config) et `HEADER_ICONS`/`hdrSvg()` (header). Ajouter une nouvelle icône dans **les deux** registres si utilisée dans le header.
- **Images jeu** : WebP ; prévoir un fallback (`onerror`).
- **Header actif dans un sous-dossier** : définir `window.HDR_ACTIVE_HREF = '<href du manifeste>'` **avant** `header.js` (utilisé par toutes les pages `database/buildings/*`).
- **Modales** : utiliser `showAppAlert` / `showAppConfirm` (header.js), pas `alert()`/`confirm()`.
- **DA** : respecter les variables CSS ; cartes = liseré doré + reflet au survol (cf. §5).
- **Commits** : toute modification touchant **plusieurs fichiers** se fait via **`github.dev`** et part en **un seul commit final** — jamais d'états intermédiaires cassés en ligne. Message **en anglais** : titre en langage courant + corps compréhensible par un joueur non développeur, dans le budget de longueur du §7.Dans `github.dev`, la boîte de message est multiligne (**Shift+Entrée**) : ligne 1 = titre, ligne vide, puis le corps. Tout mettre sur une seule ligne rend l'intégralité de la news **en gras** sur Discord (le corps devient partie du `subject`).

**Pièges déjà rencontrés**
- **Dépendance `GlobalLang` non définie** : `lang.js` doit être chargé **avant** tout script qui appelle `GlobalLang` ; toujours garder le fallback `window.GlobalLang ? GlobalLang.get() : 'FR'` (déjà en place dans header/help/backup). Ordre de chargement critique.
- **Fonction `getRawNumber` manquante** : helper local à `beartrap.js` (nettoie espaces + `parseInt`). N'existe **pas** globalement — ne pas l'appeler depuis un autre script sans la (re)définir.
- **Formatage des nombres dépendant de la locale** : l'UI formate les milliers via `toLocaleString('fr-FR')` (espaces). Les inputs numériques FR **refusent le `.`** ; côté saisie, nettoyer (`replace(/\D/g,'')` / strip espaces) **avant** `parseInt`/`parseFloat`. Ne pas parser directement `el.value` formaté.
- **Gestion d'erreurs des `fetch`** : tous les chargements de données sont des `fetch('data/….json')` relatifs (sensibles au chemin de déploiement Pages). Toujours vérifier `response.ok` et prévoir un message clair (ex. TrueGold affiche un diagnostic « le fichier existe-t-il ? »). Un `data/` mal résolu casse silencieusement l'outil.
- **Embeds Discord fusionnés** : deux embeds d'un même message qui portent la **même `url`** sont regroupés par Discord en un seul bloc, et la description du second est perdue (c'est le mécanisme d'affichage multi-images). Ne jamais mettre `url` sur les embeds FR/EN de `announce.js` — le lien vers le site passe par `author`.

---

*Fin de MAP.md — proposer une mise à jour ciblée de ce fichier à chaque changement de fichiers/architecture.*
