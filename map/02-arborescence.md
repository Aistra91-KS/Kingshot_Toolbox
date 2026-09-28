# MAP §2 · Arborescence

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 2. Arborescence

Une ligne par fichier ou dossier : son rôle, et la fiche qui le détaille. La cartographie est commune au site public et au miroir privé ; ce qui n'existe que d'un côté est signalé.

```
Kingshot_Toolbox/
├── index.html              Hub : grille de cartes écrite en dur (maillage sans JS, §9 09b), re-rendue par hub.js depuis SITE
├── research_calc.html      Outil Recherches (3 arbres, ordre optimal) · §12 12a
├── truegold_calc.html      Planificateur de bâtiments, 2 onglets : avant l'Or Véritable / ère Or Véritable. Adresse indexée, ne pas renommer · §12 12a
├── waracademy.html         Académie de guerre : recherches de base et avancées · §12 12b
├── beartrap_calc.html      Piège à Ours : répartition des marches · §12 12b
├── vikings.html            Vikings : répartition troupes/défense
├── caserne.html            Caserne : les héros du joueur, source des autres outils
├── masters.html            Experts : affinités et compétences
├── pets.html               Familiers : promenade + onglet Plan d'avancement (§6 06c) ; DA à part (§5)
├── shop_calc.html          Sommaire des boutiques permanentes et des coffres · §13
├── event-roi.html          Sommaire des 10 boutiques d'événement + lecture du % de retour · §13
├── item-values.html        Porte d'entrée des deux référentiels (gemmes, argent réel) et leur méthode
├── about.html              À propos : auteur, données locales, mentions
├── changelog.html          Nouveautés, rendu depuis data/changelog.json
├── 404.html                Autonome (styles en ligne, liens en / absolu), noindex, hors sitemap
├── favicon.ico             16/32/48 px, pour les robots qui ne lisent pas le HTML · §9 09b
├── _config.yml             Seul rôle : ce que GitHub Pages ne publie PAS (tools/, tests/, map/, .md de travail)
├── serve.py                Serveur local qui rejoue la résolution d'adresses de Pages (§9 09a) ; non publié
├── README.md               Page du dépôt sur GitHub ; non publié
├── MAP.md, map/            Cette cartographie ; non publiés
├── CLAUDE.md               Méthode de travail ; non publié
├── sitemap.xml, robots.txt, llms.txt, CNAME, google…html   Public seulement : sitemap sans .html, robots, sommaire pour IA, domaine, jeton Search Console
│
├── fr/shop/theater-shop.html   Jumelle française du Théâtre (pilote « une URL par langue », §4), écrite à la main (§11)
├── shop/                   2 référentiels écrits à la main (items, items-euro) + 19 boutiques générées (liste : tools/pages-shop.json) · §13
├── database/
│   ├── buildings/          Sommaire + 14 bâtiments, générés (tools/pages-building.json ; slugs barracks/stable/range gardés) · §11
│   ├── heroes/             Sommaire + 37 fiches héros, générés · §11
│   ├── research/           Sommaire + 3 arbres (db-research.js)
│   ├── waracademy/         Sommaire + 3 arbres + recherches avancées (script en ligne recopié sur 4 pages)
│   ├── masters/            Sommaire + 8 experts (db-masters.js)
│   └── pets/               Sommaire + 14 familiers (db-pets.js)
│
├── css/
│   ├── style.css           Feuille principale : thèmes, header, hub, contrôles, tableaux, responsive · §5
│   ├── db.css              Pages Base de données ; le défilement vertical appartient à la page, jamais au tableau · §9 09d
│   ├── shop.css            Boutiques (préfixes .sx-, .sxe- pour la valorisation d'événement, .stx- pour le Théâtre) · §13
│   ├── db-heroes.css       Fiches héros (.hb-)
│   ├── waracademy.css      Académie de guerre (.wa-)
│   ├── pets.css            Page Familiers, DA nature
│   └── pets-plan.css       Onglet Plan d'avancement (.pp-)
│
├── js/
│   ├── site-config.js      ★ Manifeste unique : identité, catégories, outils, icônes
│   ├── storage-keys.js     ★ Clés localStorage, safeParse, bandeaux de panne, filet d'erreurs global · §8
│   ├── profiles.js         ★ Profils : proxy sur localStorage (kt::<id>::<clé>), migration · §8
│   ├── lang.js             ★ GlobalLang, applyI18n, événement langChanged · §4
│   ├── header.js           ★ Header et drawer depuis SITE, thème, modales globales
│   ├── consent.js          Bandeau de cookies et chargement de gtag.js après accord ; `defer` avant `</head>` sur toutes les pages · §9 09a
│   ├── footer.js           ★ Pied de page (toujours le dernier script ; absent de pets.html) · §5
│   ├── help.js             Aide : bouton, bandeau, modale, info-bulles ; reprend bouton et bandeau écrits en dur · §9 09d
│   ├── backup.js           Sauvegarde globale export/import · §8
│   ├── feedback.js         Formulaire de retour, chargé au premier clic par header.js
│   ├── modal-tabs.js       Onglets mobiles des modales Caserne/Experts
│   ├── hub.js, changelog.js
│   ├── research_script.js, truegold_script.js, truegold_pre.js (onglet avant l'Or Véritable, autonome)
│   ├── wa_optimizer.js (logique pure) + waracademy.js (interface)
│   ├── beartrap.js, vikings.js, caserne.js, masters.js, pets.js, pets-plan.js
│   ├── shop-core.js        ★ Socle boutiques : chargement des shopcalc_*.json, i18n, calcul des lignes · §13
│   ├── shop_calc.js        Les deux sommaires (window.SX_INDEX choisit l'aide)
│   ├── shop-page.js        Une page boutique (window.SHOP_SLUG)
│   ├── shop-event.js       Valorisation d'événement, seulement si data/events/<slug>.json existe · §13
│   ├── shop-theater.js     Optimiseur d'amulettes du Théâtre (branché par window.seExtras)
│   ├── shop-items.js, shop-items-euro.js   Les deux référentiels
│   └── db-research.js, db-masters.js, db-pets.js, db-heroes.js   Rendu des pages Base de données
│
├── data/                   JSON édités à la main · schémas au §6
│   ├── research_db.json (720 paliers), buildings_db.json (19 bâtiments, 14 planifiés), truegold_db.json
│   ├── truegold_war_db.json, truegold_war_advanced_db.json (92 techs, 1 010 niveaux)
│   ├── heroes_db.json (37 héros), beartrap_joiners_db.json, masters_db.json (8), pets_db.json (14), pets_event.json
│   ├── shopcalc_items.json (94 objets, gemmes), shopcalc_classic/events/chests.json (6 / 10 / 3)
│   ├── shopcalc_euro.json  Relevé argent réel : 59 objets, 69 packs · §6 06b
│   ├── changelog.json
│   └── events/             adventure-stall, dragons-caravan, moonlight-shop, theater-shop (contenu d'événement) ; fantasy-theater (mécanique du tirage)
│
├── img/                    WebP partout (PNG pour logo/ seulement)
│   ├── logo/               favicon.svg (dessin simplifié) + PNG dérivés, apple-touch-icon, og-image, logo-512 · §9 09b
│   ├── Item/               Icône d'objet = name.EN exact ; un objet sans icône laisse la case vide
│   ├── packs/              Aperçus des packs (<id>.webp, 560×760 max) pour items-euro
│   ├── shops/              Vignettes 16:9 facultatives (sinon mosaïque)
│   ├── research/<arbre>/   Icônes des recherches ; chemin porté par le champ Image de research_db.json
│   ├── skills/ (+ conquest/), widgetname/, widgetskill/, heroes/   Héros ; conquest/ départage les noms communs aux deux familles (§11)
│   ├── Master/ (+ hd/), MasterSkill/, WarAcademy/ (+ advanced/), buildings/, pets/ (+ skills/)
│
├── tools/                  Hors ligne, jamais publié · §11
│   ├── build_pages.py      Génère les 71 pages à gabarit ; --check vérifie sans écrire
│   ├── sync_drawer.py      Recopie le drawer figé dans toutes les pages depuis site-config.js
│   ├── templates/          shop.html, building.html, hero.html, heroes-index.html
│   ├── pages-shop.json, pages-building.json   Ce qui change d'une page à l'autre (l'ordre des bâtiments = ordre de la nav)
│   ├── partials/           Cas d'une seule page : 3 blocs du Théâtre, 8 tableaux Or Véritable
│   └── reviews/            Miroir seulement : revues de code archivées (§14)
│
├── tests/                  node --test à la racine, sans dépendance · §10
│   ├── harness.mjs         Charge js/ tel quel dans un contexte vm
│   └── beartrap-distribution, euro-affinity, euro-ceiling, pets-plan, research-order, shop-event, theater-draw, wa-coins, wa-exchange, writing (.test.mjs)
│
├── .github/                Public seulement : tests.yml (node --test + build_pages --check), discord-announce.yml + scripts/announce.js + news/ · §7
└── RELEVE_CONQUETE.md, TRAVAUX_2026-09-20.md, database_hero.md, .vscode/   Miroir seulement : documents de travail (cf. son README)
```
