# CLAUDE.md — Guide de travail (Kingshot_Toolbox)

> À lire au début de **chaque** session (Claude Code le charge automatiquement).
> **Ce fichier dit comment travailler. `MAP.md` dit comment le site est fait** — quand une règle
> technique est décrite là-bas, elle n'est pas recopiée ici, seulement citée.
> Interlocuteur : Aistra. On discute en **français**.

---

## Principes communs (Claude Code **et** Claude Cowork)

1. **Point d'entrée** : lire `MAP.md` avant toute tâche, n'ouvrir ensuite que les fichiers concernés.
2. **Branche dédiée sur le dépôt public, `main` directement sur le miroir privé.** Sur `Kingshot_Toolbox`, jamais de travail direct sur `main` : une erreur y part en ligne. Sur `ToolBoxPrivate`, les commits vont sur `main` — rien n'y est publié, c'est justement l'endroit où l'on essaie (cf. son `README.md`). Toute autre demande explicite d'Aistra prime.
3. **Être proactif sur les questions** : avant de coder / produire un livrable, si un choix de périmètre, de design ou d'architecture est ambigu, poser la (les) question(s) nécessaire(s) pour garantir la viabilité du travail. Ne pas deviner sur les décisions structurantes ; les défauts raisonnables sont OK pour le reste (les annoncer).
4. **Être proactif sur les skills** : les skills enregistrés sont un *plus* ajouté pour améliorer l'outil. Les **considérer et les invoquer sans attendre** dès qu'une tâche correspond à leur usage — préciser lequel et pourquoi. Exemples :
   - `ui-ux-pro-max` → tout travail UI/UX (design, mise en page, couleurs, responsive).
   - `/code-review` → relire un diff à la recherche de bugs.
   - `/simplify` → passe qualité / simplification sur le code modifié.
   - `dataviz` → tout graphique / visualisation de données.
   - `docx` / `pdf` / `pptx` / `xlsx` → dès qu'un de ces formats est en entrée ou en sortie.
   - `/security-review` → audit sécurité (peu pertinent sur ce site statique, mais à garder en tête).
   - `/ecc-review` → revue du diff avec la grille ECC. En plus de `/code-review` quand le diff touche un moteur de calcul ou une boutique.
   - `/ecc-silent-failures` → dès qu'on touche à `js/` : erreurs avalées, `catch` vides, replis qui masquent un bug.
   - `/ecc-seo` → toute modification de balises, de canoniques, de `sitemap.xml`, de `robots.txt` ou de `llms.txt`.
   - `/ecc-a11y` → toute page ou composant manipulé au clavier, tout tableau, tout formulaire.

   Les quatre commandes `/ecc-*` s'invoquent d'elles-mêmes dès que le travail en cours les concerne, sauf indication contraire d'Aistra. Elles viennent d'ECC (`github.com/affaan-m/ECC`, licence MIT), posé dans l'environnement cloud par un script de démarrage et non dans le dépôt : ni plugin ni hooks, rien en contexte tant qu'elles ne servent pas. Si elles manquent, c'est que l'environnement n'a pas ce script : le dire à Aistra plutôt que d'improviser une revue maison.
5. **Vérifier avant de conclure** : tester/valider (navigateur, checks, comparaison avant/après) et rapporter fidèlement — y compris les échecs ou ce qui n'a pas été fait.
6. **Tenir `MAP.md` à jour** à chaque changement de fichiers / d'architecture.
7. **Écrire humain, jamais « IA »** : tout texte destiné à être lu (site, commits, annonces, livrables) évite les marqueurs d'écriture LLM catalogués par [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). Les sections « Markup », « Citations » et « Discrepancies » de cette page sont propres à Wikipédia et ne s'appliquent pas ici. Le reste, si :
   - **Ponctuation** : pas de tiret cadratin en prose. Une virgule, une parenthèse, un deux-points ou deux phrases font le travail. Le `—` reste légitime dans un tableau pour dire « pas de valeur ». Guillemets et apostrophes **droits** (`"` `'`), jamais courbes.
   - **Mise en forme** : pas de liste dont chaque puce est un titre en gras suivi de deux-points. Pas d'émoji dans un titre ni devant une puce. Pas de gras posé mécaniquement sur chaque occurrence d'un terme. En anglais, intertitres en casse de phrase, pas en Title Case.
   - **Rythme** : pas de triplets systématiques (« rapide, simple et fiable »). Pas de « non seulement… mais aussi », ni de « ce n'est pas X, c'est Y ». Pas de paragraphe de conclusion qui redit ce qui vient d'être écrit (« En résumé », « Au final », « Overall »).
   - **Fond** : pas d'emphase sur l'importance ou l'héritage du sujet (« joue un rôle clé », « témoigne de », « stands as a testament »). Pas d'analyse collée en participe présent (« soulignant son importance », « reflecting », « highlighting », « ensuring », « showcasing »). Pas d'attribution vague (« certains joueurs estiment », « il est généralement admis ») ni de « il est important de noter ». Pas de fausse gamme (« de X à Y » quand X et Y ne sont pas sur la même échelle).
   - **Vocabulaire à éviter** : *crucial*, *vital*, *key* (adjectif), *robust*, *seamless*, *leverage*, *foster*, *enhance*, *streamline*, *showcase*, *underscore*, *delve*, *tapestry*, *landscape*, *realm*, *multifaceted*, *nuanced*, *vibrant*, *rich*, *nestled*, *boasts*, *groundbreaking*, et leurs équivalents français (« riche », « incontournable », « au cœur de », « véritable »).

   Un chiffre, un fait ou une mesure valent mieux que l'adjectif qui les annonce. Le lecteur est un joueur, pas un prospect.
8. **Entretien de ce fichier** : Aistra indiquera au fil des sessions les infos à ajouter ou corriger ici. Le garder concis et actionnable — une règle déjà écrite dans `MAP.md` se cite, elle ne se recopie pas.

---

## Claude Code (sessions de développement)

- **Git** : brancher depuis `main` à jour → commits clairs → `git push -u origin <branche>` (miroir privé : voir principe 2).
- **PR** : ne PAS ouvrir de pull request sauf demande explicite. Une PR mergée est finie : repartir de `main` pour tout suivi (ne pas empiler sur l'historique mergé).
- **Messages de commit / PR** : en **anglais**, langage courant compréhensible par un joueur non développeur (cf. `MAP.md` §9).
- **Numéro de version : c'est Aistra qui décide quand il change — jamais de ma propre initiative.**
  Livrer le travail **sans toucher** à `SITE.version` ni ajouter d'entrée dans `data/changelog.json`, puis le lui proposer : lui seul tranche s'il y a une nouvelle version, et laquelle. Un bump non demandé passe en ligne au premier merge et il faut ensuite le défaire (arrivé en v1.13.5, défait aussitôt). Une fois qu'il l'a demandé, appliquer le schéma `MAJEURE.FONCTIONNALITÉ.CORRECTIF` — 2ᵉ chiffre pour une **fonctionnalité** (nouvel outil, nouvelle page, refonte d'une section), 3ᵉ pour tout le reste. Détail du format dans `MAP.md` §6 (`changelog.json`) et §9 (« Publier une version »).
- **Périmètre de la page Nouveautés (`data/changelog.json`) : ce n'est pas un fourre-tout.**
  Elle informe le joueur des **évolutions et nouveautés des pages du site** — un nouvel outil, une nouvelle page, du contenu ajouté, un chiffre corrigé, un confort d'usage qui se voit à l'écran. Ce qui ne change rien pour qui ouvre une page n'y a **pas sa place** : favicon, SEO, refactor, outillage, CI, documentation. Le test : « qu'est-ce que ça change pour quelqu'un qui ouvre une page du site ? » — si la réponse est « rien », ça ne va pas dans le changelog.
- **Annonces Discord** (`.github/news/announce.md`, mécanique en `MAP.md` §7) : **toujours inclure le lien direct de chaque page concernée** par l'annonce (`https://kingshottoolbox.com/<page>`) — le lecteur doit pouvoir ouvrir la nouveauté sans avoir à la chercher. Règle systématique, à ne plus demander. Committer `announce.md` **seul**, et mettre `covers-until` au SHA du commit qui a publié l'annonce précédente.
- **Relevé des packs (`data/shopcalc_euro.json`) — la procédure.** Aistra fournit **périodiquement** un Excel `Pack_ks.xlsx` à jour (onglets *Data Pack In game* / *Trad* / *Liste item*). L'onglet **`Liste item`** donne le **mode de calcul** de chaque objet, et ses quatre valeurs sont exactement les quatre couches du site : `/ Quantité` = relevé nu, `Barême` = barème, `Calcul autre` = `derived`, `Pondération` = `weights`. La colonne **`Prix`** de l'onglet *Data* porte le prix du pack **en dollars**, et n'est plus la même pour tous. À chaque livraison :
  1. **Régénérer `items` d'un bloc** depuis l'Excel — les quantités relevées font foi, **y compris à la baisse** : ce qui existait avant n'était qu'une estimation.
  2. **Conserver les quatre blocs `derived`, `speedups`, `affinity` et `weights`** : ils ne viennent pas de l'Excel, ils corrigent ce que le relevé seul dit mal, et les écraser ramènerait les incohérences qu'ils réparent.
  3. **Relire dans l'Excel les deux `basis`, et eux seuls** : `speedups.basis` (le pack le meilleur en **minutes par euro**) et `affinity.basis` (le meilleur en **points d'affinité par euro**, tous jetons confondus). Ce sont des **totaux par pack** qu'`items` ne permet pas de retrouver.
  4. **Ne jamais toucher `data/shopcalc_items.json`** (valeurs en gemmes) à cette occasion.
  5. **Demander à Aistra l'image d'un pack manquante** (`img/packs/<id>.webp`) : sans elle, l'aperçu au survol est cassé.
  6. Un objet du relevé **absent du référentiel** est laissé de côté et **signalé**, jamais ajouté d'office.

  Tout le reste — périmètre du relevé, meilleur prix unitaire, égalité tranchée au moins cher, paliers de prix, `price`/`priceUsd`, Multipack, contrôle par capture en jeu, ce que fait chacun des quatre blocs — est décrit dans `MAP.md` §6 (`shopcalc_euro.json`). **S'y référer plutôt que de raisonner de mémoire** : les règles y sont chiffrées et illustrées de cas réels.
- **Accélérateurs restreints (boutiques)** : un accélérateur d'entraînement (icône casque) se relève **comme un accélérateur général** (`1h_general_speedup` / `5m_general_speedup`), jamais comme un nouvel objet du référentiel. Règle systématique sur **toutes** les boutiques — une minute vaut une minute. Cf. `MAP.md` §6.
- **Site statique GitHub Pages** : aucun build, aucun backend. Tester en servant le repo localement (`python3 serve.py` à la racine, cf. `MAP.md` §9) + Chromium préinstallé (`/opt/pw-browsers/chromium`, Playwright déjà configuré). **Attention** : les adresses du site n'ont plus de `.html`, donc `python3 -m http.server` ne résout plus les liens internes — il faut un serveur qui essaie `X.html` quand `/X` est demandé, comme le fait GitHub Pages (cf. `MAP.md` §9).
- **Pages générées (26 sur 71)** : les pages `shop/*.html` et `database/buildings/*.html` **ne s'éditent plus à la main** — elles sortent de `tools/build_pages.py` (cf. `MAP.md` §11). Modifier une page directement, c'est un changement perdu à la prochaine génération, et la CI le refuse (`--check`). Après toute modification du gabarit ou des données : relancer `python3 tools/build_pages.py` et **committer la sortie**.
- **Ce qui est publié** : GitHub Pages sert **tout le dépôt** sauf ce qu'exclut `_config.yml`. Tout nouveau dossier d'outillage doit y être ajouté — sinon il part en ligne à l'adresse du site.
- **Jumeau français** : `fr/shop/theater-shop.html` n'est pas généré. Toute modification du gabarit boutique doit être **reportée à la main** dessus (cf. `MAP.md` §11).
- **Tests** : `node --test` à la racine, zéro dépendance (cf. `MAP.md` §10). Les lancer avant de conclure dès qu'on touche à `shop-core.js`, `shop-event.js`, `shop-theater.js`, `wa_optimizer.js` ou `pets-plan.js`.
- **Respecter les conventions du projet** (cf. `MAP.md` §9) : navigation via `site-config.js` uniquement, i18n (`data-i18n` / `data-en`/`data-fr` + event `langChanged`), clés `STORAGE_KEYS` + `safeParse`, charte graphique (variables CSS), styles BDD partagés dans `css/db.css`.
- **Cache des `<script>` : ne jamais appeler depuis une page un nom global né dans le même lot côté `shop-core.js`.** Aucun cache-busting sur le site : un visiteur de retour peut mélanger une page neuve et un core en cache, et un `ReferenceError` tue le rendu en plein milieu (chiffres périmés à l'écran, aperçus au survol morts) — invisible en local. Ajouter un paramètre à une fonction existante, oui ; un nouveau nom appelé d'un autre fichier, non. Cf. `MAP.md` §9.
- **Ne pas casser la logique existante** : lors d'un nettoyage/refactor, ne supprimer que du code prouvé non référencé et vérifier le rendu avant/après.

---

## Claude Cowork (sessions cowork)

- **Mêmes principes communs** ci-dessus : branche (ou `main` sur le miroir), skills proactifs, questions de cadrage, mise à jour de `MAP.md`/`CLAUDE.md` si le repo évolue.
- **Orienté livrables** : privilégier les skills de production de documents quand c'est le format attendu (`docx`, `pdf`, `pptx`, `xlsx`, `dataviz`).
- **Cadrer le livrable avant de le produire** : confirmer le format, le périmètre et le destinataire du résultat attendu.
- **Toute modification du dépôt** passe par le même circuit, avec vérification et rapport clair.
