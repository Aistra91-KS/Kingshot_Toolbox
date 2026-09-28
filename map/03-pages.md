# MAP §3 · Pages

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 3. Pages

Le socle (`site-config`, `storage-keys`, `profiles`, `lang`, `header`, `footer`) est sous-entendu dans la colonne JS ; il est détaillé sous le tableau.

| Page | Rôle | JS propres | CSS en plus de `style.css` | Données |
|---|---|---|---|---|
| `index.html` | Hub, cartes par catégorie | `hub.js` | — | `SITE` |
| `research_calc.html` | Ordre de recherche optimal | `research_script.js` | — | `research_db.json` |
| `truegold_calc.html` | Planificateur de bâtiments : onglet « Avant l'Or Véritable » (14 bâtiments, niveaux 1 à 30, modification groupée) et onglet « Or Véritable » | `truegold_pre.js`, `truegold_script.js` | — | `buildings_db.json`, `truegold_db.json`, `masters_db.json` |
| `waracademy.html` | Recherches Or Véritable : onglets Base (3 arbres de troupes) et Avancées (92 techs), un seul plan | `wa_optimizer.js`, `waracademy.js` | `waracademy.css` | `truegold_war_db.json`, `truegold_war_advanced_db.json` |
| `beartrap_calc.html` | Répartition des marches | `beartrap.js` | — | `heroes_db.json`, `beartrap_joiners_db.json`, caserne (stockage) |
| `vikings.html` | Répartition troupes Vikings | `vikings.js` | — | formations du Piège à Ours (stockage) |
| `caserne.html` | Héros du joueur | `caserne.js`, `modal-tabs.js` | — | `heroes_db.json` |
| `masters.html` | Experts et affinités | `masters.js`, `modal-tabs.js` | — | `masters_db.json` |
| `pets.html` | Promenade + onglet Plan d'avancement (§6 `06c`) | `pets.js`, `pets-plan.js` | `pets.css`, `pets-plan.css`, 2 webfonts | `pets_db.json`, `pets_event.json` |
| `shop_calc.html` | Sommaire : 6 boutiques permanentes, 3 coffres | `shop-core.js`, `shop_calc.js` | `db.css`, `shop.css` | les 5 `shopcalc_*.json` |
| `event-roi.html` | Sommaire : 10 boutiques d'événement + lecture du % (`window.SX_INDEX = 'events'`) | idem | idem | idem |
| `item-values.html` | Méthode des deux référentiels ; texte pur en `data-en`/`data-fr` | aucun (ni `help.js` ni `shop-core.js`) | `db.css`, `shop.css` | — |
| `shop/<boutique>.html` | En-tête, podium, tableau, mode édition ; lectures $ / € et gemmes (§13) | `shop-core.js`, `shop-page.js` (+ `shop-event.js` si événement) | `db.css`, `shop.css` | idem + `window.SHOP_SLUG` |
| `shop/theater-shop.html` et sa jumelle `fr/` | + optimiseur d'amulettes sous le détail des gains (§13) | + `shop-theater.js` | + `.stx-` | + `events/fantasy-theater.json` |
| `shop/items.html` | Référentiel gemmes, éditable | `shop-core.js`, `shop-items.js` | `db.css`, `shop.css` | `shopcalc_items.json` |
| `shop/items-euro.html` | Relevé en argent réel, lecture seule, aperçu du pack au survol (§6 `06b`, §9 `09b`) | `shop-core.js`, `shop-items-euro.js` | `db.css`, `shop.css` | + `shopcalc_euro.json` |
| `about.html`, `changelog.html` | Texte en dur / versions | script en ligne / `changelog.js` | `db.css` | — / `changelog.json` |
| `database/buildings/*` | Tables d'amélioration (8 Or Véritable + 6 ordinaires), générées | script en ligne | `db.css` | dans le HTML |
| `database/heroes/*` | Fiches héros générées ; `db-heroes.js` ne fait que langue et niveau 1 à 5 | `db-heroes.js` | `db.css`, `db-heroes.css` | dans le HTML |
| `database/research/*` | 3 arbres, palier par palier, recherche texte | `db-research.js` | `db.css` | `research_db.json` |
| `database/waracademy/*` | 3 arbres + recherches avancées (92 techs) | script en ligne, recopié sur 4 pages | `db.css` | `truegold_war_db.json`, `truegold_war_advanced_db.json` |
| `database/masters/*`, `database/pets/*` | Fiches Experts / Familiers | `db-masters.js` / `db-pets.js` | `db.css` | `masters_db.json` / `pets_db.json` |

**Socle, dans cet ordre**, sur les pages outils et boutiques : `site-config.js` → `storage-keys.js` → `profiles.js` → `lang.js` → `help.js` → script de page → `header.js` → `backup.js` → `footer.js`, **toujours en dernier** (§5).
Les pages `database/*` ne chargent que `site-config.js`, `lang.js`, `profiles.js` (pour l'interface des profils du header), `header.js`, leur script de rendu et `footer.js` : ni aide, ni sauvegarde, ni `storage-keys.js`. `pets.html` n'a ni `help.js` ni `footer.js`.

**Fiches Experts et Familiers** (`db-masters.js`, `db-pets.js`) : le « X » qui change avec le palier est doré (`highlightX()`, « XP » épargné) ; un effet d'Expert à deux valeurs `(a;b)` s'affiche sur deux colonnes « Effet 1 / Effet 2 ».
