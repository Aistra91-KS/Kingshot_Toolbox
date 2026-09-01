# CLAUDE.md — Guide de travail (Kingshot_Toolbox)

> À lire au début de **chaque** session (Claude Code le charge automatiquement).
> Complète `MAP.md`, qui reste la cartographie technique du projet.
> Interlocuteur : Paul. On discute en **français**.

---

## Principes communs (Claude Code **et** Claude Cowork)

1. **Point d'entrée** : lire `MAP.md` avant toute tâche, n'ouvrir ensuite que les fichiers concernés.
2. **Toujours travailler dans une branche dédiée**, jamais directement sur `main` — sauf si Paul le demande explicitement pour la tâche en cours.
3. **Être proactif sur les questions** : avant de coder / produire un livrable, si un choix de périmètre, de design ou d'architecture est ambigu, poser la (les) question(s) nécessaire(s) pour garantir la viabilité du travail. Ne pas deviner sur les décisions structurantes ; les défauts raisonnables sont OK pour le reste (les annoncer).
4. **Être proactif sur les skills** : les skills enregistrés sont un *plus* ajouté pour améliorer l'outil. Les **considérer et les invoquer sans attendre** dès qu'une tâche correspond à leur usage — préciser lequel et pourquoi. Exemples :
   - `ui-ux-pro-max` → tout travail UI/UX (design, mise en page, couleurs, responsive).
   - `/code-review` → relire un diff à la recherche de bugs.
   - `/simplify` → passe qualité / simplification sur le code modifié.
   - `dataviz` → tout graphique / visualisation de données.
   - `docx` / `pdf` / `pptx` / `xlsx` → dès qu'un de ces formats est en entrée ou en sortie.
   - `/security-review` → audit sécurité (peu pertinent sur ce site statique, mais à garder en tête).
5. **Vérifier avant de conclure** : tester/valider (navigateur, checks, comparaison avant/après) et rapporter fidèlement — y compris les échecs ou ce qui n'a pas été fait.
6. **Tenir `MAP.md` à jour** à chaque changement de fichiers / d'architecture.
7. **Entretien de ce fichier** : Paul indiquera au fil des sessions les infos à ajouter ou corriger ici. Le garder concis et actionnable.

---

## Claude Code (sessions de développement)

- **Git** : brancher depuis `main` à jour → commits clairs → `git push -u origin <branche>`.
- **PR** : ne PAS ouvrir de pull request sauf demande explicite. Une PR mergée est finie : repartir de `main` pour tout suivi (ne pas empiler sur l'historique mergé).
- **Messages de commit / PR** : en **anglais**, langage courant compréhensible par un joueur non développeur (cf. `MAP.md` §9).
- **Annonces Discord** (`.github/news/announce.md`) : **toujours inclure le lien direct de chaque page concernée** par l'annonce (`https://kingshottoolbox.com/<page>`) — le lecteur doit pouvoir ouvrir la nouveauté sans avoir à la chercher. Règle systématique, à ne plus demander. Committer `announce.md` **seul** (cf. `MAP.md` §7), et mettre `covers-until` au SHA du commit qui a publié l'annonce précédente.
- **Relevé des packs (`data/shopcalc_euro.json`)** : Paul fournit **périodiquement** un Excel `Pack_ks.xlsx` à jour (onglets *Data Pack In game* / *Trad* / *Qt Max + Valeur unitaire*). À chaque livraison, **régénérer le fichier d'un bloc** depuis cet Excel : les quantités relevées font foi, **y compris à la baisse** — ce qui existait avant n'était qu'une estimation. Règles : un objet = le(s) pack(s) qui en donnent le **plus** (tous les packs coûtent le même prix, donc « le plus » = « le moins cher à l'unité ») ; **un** pack → son image illustre l'objet (`img/packs/<id>.webp`) ; **plusieurs** → la page affiche « Multipack » et aucune image, mais le JSON les liste tous. **Ne jamais toucher `data/shopcalc_items.json`** (valeurs en gemmes) à cette occasion. Un objet du relevé absent du référentiel est laissé de côté et signalé, jamais ajouté d'office. **Conserver les trois blocs `derived`, `speedups` et `weights`** : ils ne viennent pas de l'Excel, ils corrigent ce que le relevé seul dit mal (cf. `MAP.md` §7), et une régénération qui les écraserait ramènerait les incohérences qu'ils réparent. Seul `speedups.basis` se **relit** dans l'Excel à chaque livraison : c'est le pack qui donne le plus de minutes d'accélérateur TOUTES durées confondues, un total que `items` ne permet pas de retrouver.

- **Accélérateurs restreints (boutiques)** : un accélérateur d'entraînement (icône casque) se relève **comme un accélérateur général** (`1h_general_speedup` / `5m_general_speedup`), jamais comme un nouvel objet du référentiel. Règle systématique sur **toutes** les boutiques, pour garder `shopcalc_items.json` court — une minute vaut une minute. Cf. `MAP.md` §6.

- **Site statique GitHub Pages** : aucun build, aucun backend. Tester en servant le repo localement + Chromium préinstallé (`/opt/pw-browsers/chromium`, Playwright déjà configuré).
- **Respecter les conventions du projet** (cf. `MAP.md`) : navigation via `site-config.js` uniquement, i18n (`data-i18n` / `data-en`/`data-fr` + event `langChanged`), clés `STORAGE_KEYS` + `safeParse`, charte graphique (variables CSS), styles BDD partagés dans `css/db.css`.
- **Ne pas casser la logique existante** : lors d'un nettoyage/refactor, ne supprimer que du code prouvé non référencé et vérifier le rendu avant/après.

---

## Claude Cowork (sessions cowork)

- **Mêmes principes communs** ci-dessus : branche dédiée, skills proactifs, questions de cadrage, mise à jour de `MAP.md`/`CLAUDE.md` si le repo évolue.
- **Orienté livrables** : privilégier les skills de production de documents quand c'est le format attendu (`docx`, `pdf`, `pptx`, `xlsx`, `dataviz`).
- **Cadrer le livrable avant de le produire** : confirmer le format, le périmètre et le destinataire du résultat attendu.
- **Toute modification du dépôt** passe aussi par une branche (sauf indication contraire), avec vérification et rapport clair.
