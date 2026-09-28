# MAP §9 · Conventions (2/4) : SEO, boutiques, interface

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 9. Conventions (suite) : SEO, boutiques, interface

### SEO du `<head>`
- **Bloc standard, dans cet ordre** : `charset` → `viewport` → `theme-color #0a0a0a` → `title` → `meta description` → `canonical` → Open Graph + `twitter:card` → favicons → CSS. `og:title` = le titre sans « | Kingshot Toolbox », `og:description` = la description, `og:url` = la canonique, `og:image` = `img/logo/og-image.png` en absolu.
- **Titres et descriptions : « - » simple, jamais le cadratin** (préférence d'Aistra pour l'affichage Google).
- **Longueurs** : titre complet, « | Kingshot Toolbox » compris, en 70 caractères au plus ; description en 160 au plus. Le suffixe reste sur toutes les pages (choix d'Aistra, 23/09/2026) : c'est le début du titre qui s'allège, « Kingshot » n'y est pas répété quand la place manque. `titre()` et `description()` de `build_pages.py` refusent de générer une fiche Héros hors limites.
- **Canonique absolue** (`https://kingshottoolbox.com/<chemin>`, l'accueil sur la racine) : seule URL absolue du HTML. Elle correspond exactement à la ligne de `sitemap.xml` (dépôt public), les deux listes se vérifient en 1:1.
- **JSON-LD** en fin de `<head>`, validé par `json.loads` avant commit : `WebSite` + `Organization` sur l'accueil ; `WebApplication` sur les 8 pages outils ; `BreadcrumbList` sur toute page à fil d'Ariane `.db-breadcrumb` (libellés EN, reflet du fil visible) et sur les 8 outils (2 maillons, accueil → outil : les catégories n'ont pas d'URL). Le dernier maillon vaut exactement la canonique.
- **Un seul `<h1>`** : le nom visible (BDD, boutiques), le titre de page (Caserne, Experts), ou un `h1` masqué accessible portant le nom de l'outil sur les outils sans titre visible. Jamais de bourrage de mots-clés.
- **Sitemap à valider par son URL publiée** (`https://kingshottoolbox.com/sitemap.xml`), jamais par la vue `blob/` de github.com, servie en `text/html`. Il se soumet aussi dans Google Search Console. `robots.txt` à la racine du domaine fait autorité.

### Maillage sans JavaScript
- **Tout lien interne existe en HTML brut.** Header et pied de page sont injectés par le JS, et les robots d'IA (GPTBot, OAI-SearchBot, ChatGPT-User) ne l'exécutent pas : sans maillage en dur, les outils étaient des culs-de-sac. D'où, écrits en dur : la grille du hub dans `index.html` (avec `.hub-intro`, clé `hubIntro`), les cartes de `shop_calc.html`, les `db-switch` des pages `database/*`, et le drawer.
- **Le drawer figé** (`#hdr-drawer-overlay` + `#hdr-drawer`, libellés EN) est dans toutes les pages qui chargent `header.js`, **avant** les `<script>` de fin : `header.js` ne crée le sien que s'il n'en trouve pas, et un bloc placé après donnerait deux drawers. Il sort de `tools/sync_drawer.py` (§11). `hdrBuildDrawer()` le remplace ensuite par la version complète.
- **L'ombre du drawer n'existe que tiroir ouvert** (`.hdr-drawer.open`) : fermé, il est seulement poussé hors écran et son ombre débordait sur le bord droit de toutes les pages, nette en thème clair. `.hdr-drawer-raw`, retirée par `hdrBuildDrawer()`, n'est plus qu'une ceinture.
- La **source de vérité reste `js/site-config.js`** : `hub.js` re-rend la grille, et un outil ajouté se recopie dans `index.html` depuis le rendu anglais.

### Favicon
- **4 balises en dur** dans chaque `<head>` : `favicon.svg`, `favicon-96.png`, `favicon-32.png`, `apple-touch-icon.png` (chemins relatifs). Le robot favicon de Google n'exécute pas le JS ; le bloc de `header.js` n'est qu'un filet si la page n'a aucun `link[rel=icon]`. Google exige au moins 48×48 (multiple de 48) : c'est le rôle du 96. Les PNG et `favicon.ico` (16+32+48) se régénèrent depuis `favicon.svg` (cairosvg).
- **`favicon.svg` est le dessin du petit format** (16 px dans Google, 24 px dans le header ; 1 px = 4 unités sur 64). Trois règles, à vérifier en rendant le SVG à 16 px : fond perdu de 0 à 64 (le cercle de Google laisse sinon des éclats blancs) ; aucun détail sous 4 unités ; glyphe à moins de ~27 unités du centre (32, 32).
- **Les grands formats gardent le dessin détaillé** : `apple-touch-icon.png` (180 px) et `logo-512.png` (logo du JSON-LD) ne se régénèrent pas depuis `favicon.svg` et n'ont pas de source SVG dans le dépôt.
- Google lit un favicon par nom de domaine, sur la page d'accueil : celui d'`index.html` vaut pour tout `kingshottoolbox.com`.

### Boutiques : deux valorisations
- **Argent réel (€/$) et gemmes, jamais mis en rapport** : aucun taux gemme↔euro n'est calculé nulle part. L'argent réel s'affiche à la première visite (lisible sans connaître le jeu).
- **La bascule substitue des colonnes, n'en ajoute aucune** (`Valeur gemmes` ↔ `Valeur €`, `Ratio (×N)` ↔ `Ratio`, `Valeur` ↔ `Valeur € tot.`) : largeur et comportement mobile inchangés. Le tri suit (`SP_TWIN`).
- **La vue vit dans l'URL** et dans la clé chrome `shop_view` (§8). Seule la vue non par défaut s'écrit (`?v=gem`) ; `?v=eur` reste accepté en entrée pour les liens déjà partagés.
- **Règle du « — » (non négociable)** : une valeur € inconnue affiche `—` en Valeur €, Ratio et Valeur € tot., sort du classement (pas de barre, jamais « Top », en fin de tri dans les deux sens). Jamais `0`, qui en ferait la pire affaire et inverserait le podium des boutiques mal couvertes. La ligne reste achetable, et la tuile « Valeur obtenue » annonce la couverture (« sur 19 des 21 objets valorisés »). En code, `scEurUnit()` rend `null`.
- **Podium dédoublonné par `itemId`**, le tableau garde toutes ses lignes (une boutique vend parfois le même objet sur trois lignes).
- **Décimales adaptatives** (`scFmtEur`, `scFmtRatio`) : un `toFixed()` fixe rendrait identiques des valeurs distinctes. Valeur € : ≥100 → 0 décimale, ≥1 → 2, ≥0,01 → 3, sinon 4. Ratio : ≥10 → 1, ≥0,1 → 3, ≥0,001 → 4, sinon 6. Le symbole se place selon la langue (« 35,94 € », « €35.94 »), jamais selon la devise.
- **Les deux référentiels se renvoient l'un à l'autre** (`shop/items.html` ↔ `shop/items-euro.html`) par un `.sx-reflinks` en dur. Le `data-i18n` va sur le `<span>` du libellé, pas sur le `<a>` : `applyI18n` écrit un `textContent` qui effacerait l'icône.

### Valeur corrigée : comptée partout, jamais muette
Les quatre blocs du relevé € (`derived`, `speedups`, `affinity`, `weights`, §6 `06b`) donnent des valeurs que `scEurUnit()` rend comme les autres : elles comptent dans toutes les boutiques. Leur origine se voit donc partout : pastille `.ie-tag.is-derived` / `.is-scaled` / `.is-weighted` dans « Pack d'origine », encadré déplié sous le tableau (`#ie-derived`, `ieRenderRules()`) qui donne raisonnement et calcul, info-bulle des boutiques par `scEurWhy()` (le calcul, pas le mot « Calculé »).
- **« Pack d'origine » nomme le pack d'où vient le prix** (`scEurPacks()` arbitre, la recherche par pack suit). Accélérateurs et jetons d'affinité affichent le pack du barème (`basis.packs`). Une valeur déduite n'affiche aucun pack, sauf si sa règle en nomme un (`derived[id].packs`, cas des caisses de ressources).
- **Le calcul affiché repart des chiffres relevés** (prix du pack, quantité), jamais du prix unitaire arrondi : « 0,167 € × 100 » donnerait 16,70 € au lieu de 16,67 €. La base d'affinité s'écrit donc en divisions (« (6,00 € ÷ 24 000) × ses propres points »), `scFmtEur()` s'arrêtant à quatre décimales.
- Les chaînes de dérivations ne bouclent pas : `scEurResolve()` porte les objets déjà traversés.

### Aperçu du pack (`shop/items-euro.html`)
Le nom d'un pack à image est un `<button>`. Trois entrées : survol maintenu 320 ms (sinon clignotement), focus clavier (`:focus-visible`), clic (qui sert aussi au toucher). `iePvPin` retient l'intention (épinglé ou non), pas l'affichage : une simple bascule au clic lisait un état que le focus de la souris venait de changer. Aperçu en `position:fixed` sur le `<body>` (le conteneur `overflow-x` le rognerait), refermé à tout défilement. Un « Multipack » reste du texte.

### Version et annonces
- **Publier une version** (sur décision d'Aistra, cf. `CLAUDE.md`) : entrée en tête de `data/changelog.json` et `SITE.version` au même numéro, dans le même commit. L'entrée et l'annonce Discord couvrent le même périmètre.
- **Discord** : rien à maintenir dans `.github/` pour un nouvel outil, il figurera dans la prochaine annonce rédigée (§7).

### Accessibilité des champs et contrôles
- **Tout champ a un nom accessible qui suit la langue**, dans cet ordre de préférence : `for="<id>"` ; `aria-labelledby` vers un libellé déjà traduit par `data-i18n` (libellé partagé ou placé après) ; `aria-label` construit avec le dictionnaire actif (`tx`) pour les champs générés. `title` seul ne suffit pas (même nom pour toutes les lignes). Mesure au 22/09/2026 : 0 champ sans nom.
- **Champ répété** : un en-tête nomme la colonne, pas la ligne. `spFieldLabel()` (`shop-page.js`) compose le nom depuis des clés déjà en place (`hQty`, `hCost`, `hTake`, `hRestant`, `hTier`), sans clé nouvelle pour rester lisible par un `shop-core.js` en cache. Sur une page statique, `<label class="kt-sr">` (visible des seuls lecteurs d'écran). Un `placeholder` n'est pas un nom.
- **`applyI18n` n'écrit que du `textContent`** : un `aria-label` se traduit à la main, dans la même fonction que les textes.
- **Onglets = `<button role="tab">`**, jamais des `<div>` (inatteignables au clavier). Patron de `research_calc.html` et `truegold_calc.html` : `tablist` nommé, `aria-controls`/`aria-selected`, tabindex glissant, flèches + Début/Fin, panneaux `role="tabpanel"` `tabindex="0"`. Le clic se lit sur le bouton, pas sur `e.target`. `.tab` porte `font: inherit`.
- **Modales** : `showAppAlert` / `showAppConfirm` / `showAppToast` (header.js), jamais `alert()`/`confirm()`. Toute fenêtre passe par `window.ktModal(overlay, opts)` : rôle et nom, focus entré, retenu, rendu au déclencheur, pile pour les fenêtres empilées, **Échap = annuler, jamais valider**. Le focus initial se retente sur plusieurs cadres (`.backup-overlay` devient visible au fil d'une transition). Depuis un autre fichier, appel sous garde `window.ktModal` avec repli (cache, §9 `09a`). Le toast sert aux confirmations après une action réussie.
- **Calcul au bouton** (deux onglets du Planificateur, Académie de guerre ; décision d'Aistra du 28/09/2026) : la suggestion ne se recalcule qu'au bouton « Calculer la suggestion ». Rien avant le premier clic ; ensuite, une valeur qui compte change et le plan reste affiché, grisé et `inert`, sous un bandeau « relance le calcul ». Aucune action ne relance seule (ni Appliquer, ni un onglet). Recherches n'a pas de bouton (décision d'Aistra) : son calcul prend moins de 20 ms et suit chaque saisie, « Fait » compris. `window.ktCalcBar({ output, bar, run })` (header.js) tient le bouton, le statut `role="status"` et le grisé ; la page dit si son plan est à jour en comparant l'**empreinte** des valeurs lues par le calcul à celle du dernier calcul (`tgPlanSig`, `preSig`, `waSig`) : un réglage d'affichage ne grise rien, et revenir à ses valeurs rend le plan de nouveau applicable. « Appliquer » contrôle cette empreinte à l'ouverture et à la validation, et le focus passe ensuite au bouton de calcul (le plan devenu inerte ne peut plus le recevoir). La barre est écrite dans le HTML (place réservée, icône comprise) et traduite dès l'ouverture par `hdrCalcBarsStatic` ; sans `ktCalcBar` (header.js en cache), la page la masque et recalcule à chaque saisie comme avant.

### Retours joueurs (`js/feedback.js`)
- **Chargé au premier clic** par `hdrOpenFeedback()` (aucune page ne le référence). Promesse mémorisée contre le double clic, remise à `null` en cas d'échec pour qu'un clic retente.
- **Transport** : `Content-Type: text/plain` (un `application/json` déclenche un préflight qu'Apps Script ne traite pas) ; Apps Script répond toujours 200, c'est le champ `ok` du corps qui fait foi.
- `SITE.feedback` (`url` + `key`) est public par nature ; mail et webhook vivent dans le script Google. `url` vide ⇒ ni bouton ni entrée de drawer. Anti-spam doublé : côté page (une minute, 5 par jour, champ piège) et côté script (plafond horaire), le second seul faisant foi.
- **Le bouton « Un retour ? » se masque sous 820 px et en `.hdr-condensed`**, comme langue et thème : l'entrée `.drawer-fb` est alors le seul chemin. Un bouton de plus dans la zone droite avance le seuil de condensation d'environ 48 px.

### Divers
- **Icônes** : SVG Lucide inline, dans les deux registres `SITE_ICONS`/`iconSvg()` (site-config) et `HEADER_ICONS`/`hdrSvg()` (header). Un nom inconnu rend une chaîne vide, sans erreur : comparer les `icon: "…"` du manifeste aux clés des deux registres après tout ajout.
- **Images du jeu** : WebP, avec repli `onerror`.
- **Header actif dans un sous-dossier** : `window.HDR_ACTIVE_HREF = '<href du manifeste>'` avant `header.js`.
- **Charte** : variables CSS, cartes à liseré doré et reflet au survol (§5).
- **Commits d'Aistra** : une modification sur plusieurs fichiers passe par `github.dev` en un seul commit (jamais d'état intermédiaire cassé en ligne). Message en anglais, titre en langage courant puis un corps lisible par un joueur (Maj+Entrée pour la ligne vide).
