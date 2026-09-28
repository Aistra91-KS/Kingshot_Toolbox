# MAP — Kingshot_Toolbox

> Cartographie du projet, en deux étages. **Ce fichier est le sommaire** : il se lit en entier avant toute tâche. Le détail vit dans le dossier `map/`, une fiche par section : n'ouvrir que celles que la tâche concerne.

**Renvois.** Le code, `CLAUDE.md` et les fiches citent « MAP.md §9 » ou « MAP §6 » : le numéro désigne la fiche `map/NN-…` du tableau ci-dessous (§9 se lit dans `map/09a` à `map/09d`). La numérotation ne change pas, pour que ces quelque 250 renvois restent justes.

**Entretien.** Une modification se note dans la fiche de sa section, pas ici. Ce sommaire ne change que si une fiche naît, disparaît ou change de rôle. Taille à tenir : moins de 15 Ko pour ce fichier, moins de 40 Ko par fiche. Au-delà, une fiche se coupe en deux (`09a`, `09b`…), à un endroit où le sujet change, et le tableau ci-dessous suit. Le 22 septembre 2026, `MAP.md` d'un seul tenant pesait 276 Ko : trop pour être lu d'un bloc, il se lisait par morceaux et coûtait des dizaines de milliers de jetons à chaque session.

---

## 1. Vue d'ensemble

- **Live** : https://kingshottoolbox.com/
- **Repo** : `Aistra91-KS/Kingshot_Toolbox` (anciennement `Hub-Kingshot` : `/hub-kingshot/` → `/Kingshot_Toolbox/` sur GitHub Pages, puis la **racine** de `kingshottoolbox.com`). Le site ne dépend plus de son chemin de déploiement — cf. la règle `<base href>` relatif au §9.
- **Type** : site statique hébergé sur **GitHub Pages** (pas de backend, pas de build).
- **Stack** : HTML / CSS / JS **vanilla** (aucun framework, aucun bundler) + **GitHub Actions** (notif Discord).
- **Langues** : **FR / EN**, bascule à chaud (aucun rechargement).
- **Architecture** : Hub (catégories) → Outils. Site mono-jeu (Kingshot). Toute la navigation est pilotée par un manifeste unique `js/site-config.js`.
- **Persistance** : `localStorage` uniquement (clés centralisées dans `js/storage-keys.js`), export/import JSON via `js/backup.js`.

---

## Les fiches

| § | Fiche | Ce qu'on y trouve | À ouvrir quand… |
|---|---|---|---|
| 2 | `map/02-arborescence.md` | Chaque fichier et dossier du dépôt, avec son rôle | on cherche où vit quelque chose, on ajoute ou retire un fichier |
| 3 | `map/03-pages.md` | Chaque page : rôle, scripts, feuilles de style, données ; socle de scripts commun | on touche une page ou on en crée une |
| 4 | `map/04-i18n.md` | Bilinguisme : `data-i18n`, `data-en`/`data-fr`, `langChanged`, pilote « une URL par langue » | on ajoute un texte visible |
| 5 | `map/05-charte.md` | Variables de couleur des deux thèmes, `--accent-text`, cartes, header, pied de page, modales | on touche une couleur, un composant visuel, le header ou le pied de page |
| 6 | `map/06-donnees.md` | Schéma de chaque fichier de `data/` | on lit ou modifie un JSON |
| 6 | `map/06b-releve-euro.md` | Relevé en argent réel (`shopcalc_euro.json`) : périmètre, prix unitaire, paliers, les quatre blocs de correction | on met à jour le relevé des packs (procédure dans `CLAUDE.md`) |
| 6 | `map/06c-plan-familiers.md` | Plan d'avancement des familiers : règles du jeu et méthode d'optimisation | on touche `js/pets-plan.js` ou `pets_event.json` |
| 7 | `map/07-automatisations.md` | Workflow d'annonce Discord, clés d'en-tête de `announce.md` | on prépare une annonce |
| 8 | `map/08-persistance.md` | Clés `localStorage`, profils, `safeParse`, bandeaux de panne, sauvegarde | on lit ou écrit une donnée du joueur |
| 9 | `map/09a-conventions-code.md` | Conventions de code : manifeste, cache des données et des scripts, adresses, `<base>`, stockage | on écrit du JavaScript ou on ajoute une page |
| 9 | `map/09b-conventions-pages.md` | SEO du `<head>`, maillage, favicon, règles des boutiques, formulaires, onglets, icônes, commits, version | on touche au `<head>`, à une boutique ou à un composant d'interface |
| 9 | `map/09c-pieges.md` | Pièges déjà rencontrés, avec leur cause | on débogue |
| 9 | `map/09d-mise-en-page.md` | Réserves de hauteur au chargement (CLS), tableaux BDD sans défilement, champs sur téléphone, tiroir mobile | on crée une page, un tableau ou un champ |
| 10 | `map/10-tests.md` | Tests `node --test` : harnais, fichiers, ce que chacun vérifie | on touche un moteur de calcul |
| 11 | `map/11-pages-generees.md` | `tools/build_pages.py`, gabarits, partials, drawer figé, jumeau français | on touche une page de `shop/` ou `database/buildings|heroes/` |
| 12 | `map/12a-outils-recherches-batiments.md` | Recherches et Planificateur de bâtiments (deux onglets, « Appliquer les modifications ») | on touche `research_script.js`, `truegold_*.js` |
| 12 | `map/12b-outils-autres.md` | Piège à Ours, Académie de guerre (modes, échanges, pièces), images des Experts | on touche `beartrap.js`, `waracademy.js`, `wa_optimizer.js`, `masters.js` |
| 13 | `map/13-boutiques.md` | Sommaires, page boutique, panier, compte à rebours, valorisation d'événement | on touche une boutique ou un événement |
| 14 | `map/14-revues-miroir.md` | Revues de code archivées dans le miroir privé | on reprend une revue passée |
| 15 | `map/15-prochain-audit.md` | Points laissés en suspens, à reposer au prochain audit | on lance un audit |

## À savoir avant toute modification

Une ligne par règle ; le détail est dans la fiche citée.

- La navigation ne se code jamais en dur : tout passe par `js/site-config.js` (§9, `09a`), puis `python3 tools/sync_drawer.py` (§11).
- Les pages de `shop/`, `database/buildings/` et `database/heroes/` sont générées : on modifie le gabarit ou la donnée, puis `python3 tools/build_pages.py` (§11). Le jumeau `fr/shop/theater-shop.html` se reporte à la main.
- Aucun cache-busting : jamais un nouveau nom global appelé depuis un autre fichier ; toujours `window.x` sous condition (§9, `09a`).
- Tout texte visible existe en anglais dans le HTML et en français dans `data-fr` ou le dictionnaire de la page (§4).
- Toute valeur du joueur passe par `STORAGE_KEYS` et `safeParse` (§8).
- Les adresses n'ont pas de `.html`, le `<base href>` est relatif, les canoniques sont absolues (§9, `09a` et `09b`).
- L'or en texte ou en contour de focus s'écrit `var(--accent-text, var(--accent))` (§5).
- Ce qui arrive après les données réserve sa place ; un tableau de la base de données ne défile jamais dans sa boîte au-dessus de 820 px (§9, `09d`).
- Tests : `node --test` à la racine avant de conclure dès qu'un moteur de calcul change (§10).

*Fin du sommaire. À chaque changement de fichiers ou d'architecture, mettre à jour la fiche concernée (et ce tableau si une fiche change de rôle).*
