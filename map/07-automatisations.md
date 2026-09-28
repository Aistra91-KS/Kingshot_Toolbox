# MAP §7 · Automatisations

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine. Dépôt public seulement : le miroir privé n'a pas de `.github/`.

## 7. Automatisations (GitHub Actions)

**`tests.yml`** : `node --test`, puis `python3 tools/build_pages.py --check` et `python3 tools/sync_drawer.py --check`, à chaque push et sur les PR.

**`discord-announce.yml`** : publie l'annonce rédigée à la main dans `.github/news/announce.md`.
- Déclencheur : un push sur `main` qui touche `announce.md` (le committer **seul**), ou `workflow_dispatch` avec `dry_run` pour un aperçu.
- `announce.js` lit l'en-tête `<!-- kshub-news … -->` et les sections `## FR` / `## EN`, puis envoie deux embeds au webhook `secrets.DISCORD_WEBHOOK`. Gabarit vide (commentaires seuls) = rien n'est envoyé.
- Clés d'en-tête : `version` (obligatoire, doit exister dans `changelog.json`, sinon refus ; `none` pour une annonce hors site), `covers-until` (SHA du commit de l'annonce précédente), `generated`, `ping`, `ping-fr`, `ping-en`, `color`, `title-fr`, `title-en`, `image`, `image-fr`, `image-en`.
- Le lien `changelog.html#v<version>` est ajouté automatiquement en fin d'embed.
- Images : `https://` seulement, servies depuis `raw.githubusercontent.com/…/main/.github/news/img/…`, **jamais depuis `kingshottoolbox.com`** (au moment du merge, Pages n'est pas encore déployé ; Discord met le 404 en cache). Même image sur les deux embeds : gardée sur le dernier seulement.
- Mentions : dans le `content` du message, jamais dans l'embed (ne notifierait personne) ; un rôle s'écrit `<@&ID>`. `ping-fr` / `ping-en` forcent deux messages.
- Au-delà de 5 200 caractères (FR + EN), le script coupe en deux messages au lieu de tronquer.
