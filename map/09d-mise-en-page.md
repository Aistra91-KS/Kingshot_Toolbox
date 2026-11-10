# MAP §9 · Conventions (4/4) : chargement, tableaux, champs, tiroir

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 9. Mise en page : chargement, tableaux, champs, tiroir

**Décalages de mise en page (CLS) : réserver la place de ce qui arrive après les données.** Mesure de septembre 2026 (Chromium, processeur ×4, 1,6 Mbit/s, première visite) : 57 pages sur 122 dépassaient 0,1 sur mobile, jusqu'à 0,87. Google classe « mauvais » au-delà de 0,25. Les réglages qui les ramènent sous 0,1, à respecter sur toute nouvelle page :
- **Bouton d'aide et bandeau de première visite écrits en dur**, juste après l'ancre de `HelpSystem.init` (`help.js` les reprend au lieu d'en créer : `mountButton` / `mountBanner`). Le bandeau est `hidden` et un script en ligne de trois lignes l'affiche avant le premier rendu si `help_seen_<id>` ne vaut pas `1`. Sa règle `.help-banner[hidden]{display:none}` est obligatoire (`display:flex` l'emporterait). Pages : hub, `shop_calc`, `event-roi`, les deux référentiels, `research_calc` et le gabarit boutique (bouton seul). Le texte en dur doit rester celui du `summary` de la page : `help.js` le réécrit de toute façon, mais un texte de longueur différente bougerait.
- **`.table-container.is-loading`** (`style.css`, `min-height:100vh`) : posée dans le HTML, retirée par le script au premier rendu, erreur comprise. Bases Recherches et Académie de guerre, référentiels, suggestions de Recherches.
- **Boutiques** (`shop.css`, sous `.sx-hero-text h1`) : réserves en `:empty` sur les pastilles, la barre d'action, le panier, le podium et le tableau, chacune égale à la PLUS PETITE hauteur rendue relevée sur les 20 boutiques (EN et FR). `.sx-page-event` est posée par `build_pages.py` (`EVENT_SHOPS`) et reportée à la main sur le jumeau français. Sous 480 px le texte de l'en-tête passe d'emblée sous la vignette, là où il finit toujours.
- **Fiches Familiers et Experts** (`db.css`) : hauteurs minimales des sections, bornes basses mesurées sur les 14 + 8 fiches. Une fiche nettement plus courte laisserait un vide : les revoir alors.
- **`.db-page` en `border-box` sous 820 px** (`style.css`) : en `content-box`, son `max-width:100%` laissait déborder les 20 px de marge interne dès qu'un large tableau était rendu. La page perdait sa marge droite et s'élargissait à l'arrivée des données.
- **Hub en `align-items:flex-start`** : centré, l'en-tête s'affichait au milieu de l'écran pendant le chargement puis remontait. `has-app-header` est écrit en dur sur son `<body>`, comme sur les autres pages.
- **Hors périmètre** : `pets.html` (0,99 sur mobile, la promenade s'écrase tant que `pets-plan.js` n'a pas construit la scène), laissée en l'état en attendant sa refonte. Restent au-dessus de 0,1 sur ordinateur : l'Académie de guerre (outil, 0,49), TrueGold (0,22), les trois arbres BDD de l'Académie de guerre (0,16) et Recherches (0,14).

**Champs de saisie sur téléphone : 16 px de texte et 44 px de haut.** En dessous de 16 px, Safari sur iPhone zoome toute la page quand on touche le champ. Appliqué à tout le site sous 560 px par le bloc « TÉLÉPHONE » en fin de `style.css` (tout `input`, `select` et `textarea` sous `body.has-app-header`) ; les boutiques gardent en plus leur bloc, plus précis, en fin de `shop.css` (steppers, MAX, bascules). Les champs à 44 px imposent `box-sizing: border-box` (sinon 50 px avec bordures et marge) et des cellules de tableau à 4 px de marge verticale, sans quoi chaque ligne de boutique montait à 71 px. La croix du bandeau d'aide a une zone de toucher de 44 px (marges négatives, bandeau inchangé).

**Tiroir mobile fermé = `inert`** (`header.js`) : il n'est que poussé hors de l'écran, et sans `inert` ses 25 liens restaient dans l'ordre de tabulation. L'ouverture met le focus sur « Fermer », la fermeture le rend au bouton menu. Les menus du header ont leur `:focus-visible` (liseré doré).

**Tableaux de la base de données : aucune barre de défilement interne au-dessus de 820 px** (demande d'Aistra, septembre 2026). Ni horizontale ni verticale : un tableau trop large se resserre, il ne défile pas. Sous 820 px, le défilement horizontal avec première colonne figée reste la règle (style.css), il y est souvent inévitable. Ce qui le permet :
- **Coûts des Recherches en notation courte** (`cost()`, `db-research.js`) : « 18M », « 3,7M », « 930K », comme à l'Académie de guerre. Sans perte : tous les coûts d'au moins 10 000 ont au plus trois chiffres significatifs, et une valeur qui en aurait plus resterait écrite en entier. La puissance reste en entier.
- **Colonnes de texte qui passent à la ligne** : nom de recherche, temps, prérequis, effet. En disposition automatique, le navigateur ne coupe que si la place manque. Largeurs minimales : prérequis 120 px, effet 150 px, nom 120 px.
- **Écrans de 821 à 1 200 px** (fin de `db.css`) : texte à 12 px, marges de cellule de 6 px, intitulés sur deux lignes, minimums réduits ; **de 821 à 900 px** en plus, l'icône répétée sur chaque palier des Recherches s'efface (elle reste sur la ligne de groupe). Ces blocs sont en FIN de fichier à dessein : ils doivent passer après les minimums qu'ils assouplissent.
- **Espaces insécables** entre « niv. »/« Lv. » et le numéro, et avant « % » en français : sinon le numéro ou le signe se retrouvait seul à la ligne.
- Contrôle : balayage de 821 à 1 401 px par pas de 20, français et anglais, plus 1 920 px, sur les 60 pages `database/*` : aucun défilement interne. Tout nouveau tableau BDD doit passer ce même contrôle.

**Zones de toucher sous 560 px** (fin de `style.css`, audit du 10/11/2026). Puces `.db-switch-item` à 36 px de haut, cases à cocher à 22 px avec un `label` de 44 px (c'est le libellé qu'on touche), bouton d'aide à 44 px, bascule de langue du hub à 40 px. La pastille de version et le lien Cookies du pied de page gardent leur dessin : un `::after` élargit leur zone.

**Indice de défilement : `.kt-more-right`.** Sous 820 px, une boîte qui défile en largeur et dont il reste du contenu à droite s'estompe sur son bord (masque, pas ombre : les lignes ont un fond opaque). La classe est posée par `hdrScrollHints()` en fin de `header.js`, pour tous les tableaux d'un coup ; une nouvelle boîte défilante s'ajoute à sa liste `BOXES`. Feuille ou script en cache sans l'autre : rien ne s'affiche, rien ne casse.

**Ruban de puces en tête de fiche.** Sous 560 px, `nav.db-switch:not(.footer)` tient sur une ligne qui défile, et `hdrScrollHints()` y amène la puce active une fois à l'ouverture. Empilées, les 14 puces des bâtiments prenaient 250 px avant le tableau. La liste du pied de fiche (`.footer`) reste entière.

**Info-bulle « i » (`HelpSystem.tip`)** : un clic dessus est arrêté en phase de capture (`help.js`) et n'ouvre que la bulle. Il ne remonte plus au `<th onclick>` qui trie le tableau, ni au `<label>` qui le contient. Au doigt (`pointer:coarse`), un `::before` invisible porte la zone de tap à 35 px autour du rond de 15 px.

**Intro de boutique coupée à trois lignes** sous 560 px (`shop.css`), dépliée puis repliée par le bouton `.sx-more` du gabarit (`hidden` dans le HTML, affiché par la seule feuille de style : une feuille en cache le laisse invisible). Ses deux libellés, « Lire la suite » et « Réduire », basculent par l'attribut `hidden` et non par une règle CSS, pour la même raison. Le texte reste entier dans la page. À reporter à la main sur le jumeau français.

**Référentiels d'objets sous 560 px** : la colonne Catégorie s'efface et le nom passe à la ligne, pour que la valeur soit dans l'écran (`shop.css`, `:has(> #ie-tbody)` et `:has(> #item-tbody)` côté en-tête comme côté cellules).

**Accueil et Caserne sous 560 px** : cartes du hub en ligne (icône, titre, deux lignes de texte, chevron à la place de « Ouvrir »), soit 72 px au lieu de 250 ; Caserne à deux héros par ligne.

**Bandeau cookies** : `consent.js` écrit le texte en deux longueurs (`.ksc-long`, `.ksc-short`) et sa propre feuille montre la courte sous 600 px. À 390 px le bandeau passe de 266 à 160 px environ. Les deux textes se modifient ensemble.
