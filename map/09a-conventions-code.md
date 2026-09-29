# MAP §9 · Conventions (1/4) : code, données, stockage

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 9. Conventions & pièges connus

### Structure et navigation
- **Manifeste unique** : une catégorie ou un outil s'ajoute dans `site-config.js` seulement, jamais de navigation en dur. Puis `python3 tools/sync_drawer.py` (§11).
- **Nouvelle page** : `js/footer.js` en dernier script (sauf `pets.html`), une ligne dans `sitemap.xml` et `llms.txt` (dépôt public), le drawer figé, le script de thème dans le `<head>`, le bloc SEO (§9 `09b`), les réserves de hauteur (§9 `09d`).
- **Un outil ajouté peut disparaître quelques minutes** chez un visiteur de retour : grille du hub et drawer, écrits en dur, sont réécrits par un `site-config.js` encore en cache (10 min sur Pages), qui ne connaît pas l'outil. Transitoire, sans parade côté page ; le lien direct marche toujours, d'où l'URL obligatoire dans les annonces Discord.

### Cache : aucun cache-busting sur le site
- **Données** : tout `fetch` de `data/*.json` revalide (`scFetchData()` dans les boutiques, `{ cache: 'no-cache' }` ailleurs). Sans cela, une page neuve lisait l'ancien JSON pendant 10 minutes : boutique introuvable, marches vides, fiches d'experts vides, précisément le jour d'une annonce.
- **Scripts** : jamais un nouveau nom global appelé depuis un **autre** fichier. Un visiteur peut recevoir la page neuve avec l'ancien `shop-core.js` : `ReferenceError` en plein rendu, chiffres périmés, aperçus morts, invisible en local. Ajouter un paramètre à une fonction existante passe ; un nom neuf ne passe pas (d'où `iePackPriceOf()` qui enveloppe `scEurPackPrice(pid)`). Un appel à un script d'une autre fonctionnalité se fait par `window.x` sous condition.

### État sauvegardé
- **Il ne porte que le choix du joueur**, jamais une copie des données : ce qui vient du fichier se relit dans le fichier (`initData()` de Recherches ne reprend de la sauvegarde que les `Researched`). Sinon une correction de données n'atteint jamais les habitués. Une recherche renommée demande une correspondance (`RS_RENAMED`).
- **Retirer une case qui s'ajoutait à un champ chiffré** baisse le total en silence : Recherches et TrueGold replient une fois les anciennes cases de bonus dans le champ (`bonusFolded`, idempotent, après la conversion en %). Même schéma pour toute case future.
- **Un état relu qui indexe des tables se borne au chargement** (`floor`, `pity` du Théâtre : sinon « NaN % »).

### Adresses et chemins
- **Adresses sans `.html` partout** : `X.html` → `/X`, `dir/index.html` → `/dir/`. Canonique, `hreflang`, `og:url`, JSON-LD, sitemap, `llms.txt`, `href` du changelog et tous les liens internes (en dur et fabriqués par le JS) suivent la même forme. Exceptions : `404.html` et le jeton Google. Les fichiers gardent leur `.html` sur le disque.
- **Tester avec `python3 serve.py`** à la racine : il rejoue Pages (`/X` → `X.html`, `/dir/` → `index.html`, `/dir` → redirection, le reste → 404). `python3 -m http.server` et l'extension Live Server ne résolvent pas les liens, et `file://` bloque les `fetch`. `--live` recharge la page à chaque enregistrement (tâche VS Code « Site local », miroir seulement) ; il reste hors du mode par défaut, car ses interrogations en boucle empêchent une page d'être « au repos » pour un test navigateur.
- **`<base href>` relatif** (`../` pour `shop/*`, `../../` pour `database/*/*`) : le site ne dépend pas de son chemin de déploiement. Jamais de chemin absolu.
- **Lien vers l'accueil = `./`**, jamais `index.html` (la canonique est la racine).

### `<head>` de chaque page
- **Script de thème en premier**, juste après `<meta charset>` : il pose `data-theme` avant le premier rendu (sans lui, flash sombre animé à chaque navigation).
- **Google Analytics** (`G-M1QG4XSD3K`), mode « basique » de Consent Mode (décision d'Aistra, 28/09/2026) : l'extrait en ligne, juste après le script de thème, ne fait que définir `gtag`, poser `gtag('consent', 'default', …)` à `denied` sur les quatre signaux et `gtag('js', …)`. **Pas de `gtag.js` ni de `config` dans la page** : `js/consent.js` (en `defer` avant `</head>`) les ajoute seulement si le visiteur a accepté. Sans accord, rien ne part vers Google, pas même un ping sans cookie, que la CNIL conteste. Toutes les pages sauf le jeton Google ; la 404 charge `/js/consent.js` en absolu (pas de `<base>`).
- **Première ligne de l'extrait** : `if (navigator.webdriver) window['ga-disable-G-M1QG4XSD3K'] = true;`. Un navigateur piloté (Chrome sans interface, Playwright, Selenium) pose ce drapeau, et l'interrupteur officiel de Google coupe toute mesure, même après « Accepter » : les robots et nos propres tests ne comptent pas comme visiteurs. `gtag()` remplit toujours `dataLayer`, un test peut donc y lire les événements.
- **Bandeau (`consent.js`)** : « Refuser » et « Accepter » côte à côte, même style (CNIL : refuser aussi simple qu'accepter). Accepter accorde les quatre signaux, dont `ad_storage` et `ad_personalization` sans lesquels les signaux Google n'accumulent rien. Choix gardé 6 mois sous `ks_consent` (§8) puis redemandé ; `config` avec `cookie_expires` à 13 mois et `cookie_update: false` (pas de prolongation à chaque visite). Chaque refus coupe la mesure et efface les cookies `_ga*`, pas seulement après un accord en cours : un accord expiré se lit comme « pas de choix », et ses cookies de 13 mois restaient. Stockage interdit : ni bandeau ni mesure. Un refus qui ne s'écrit pas (stockage plein) efface l'accord précédent, sans quoi la page suivante le relirait et rechargerait GA ; si l'effacement échoue aussi, le bandeau reste ouvert sur « Choix actuel : accepté ». Tout élément `data-consent-open` rouvre le bandeau (lien « Cookies » du pied de page, bouton de la page À propos, qui décrit ce qui est collecté sous `#privacy`). Le fichier injecte ses propres styles et n'expose aucun nom global. Sur la 404, sans `lang.js`, la langue vient de `hub_lang`. Le bandeau porte `data-nosnippet` : Google exécute le JavaScript et pourrait sinon en tirer l'extrait de n'importe quelle page.
- **Le bandeau ne cache jamais le focus** (WCAG 2.4.11) : tant qu'il est ouvert, `<html>` reçoit sa hauteur en `scroll-padding-bottom` et en `padding-bottom` (le pied de page peut remonter au-dessus), un élément qui prend le focus dessous est remonté, et s'il vit dans un bloc qui ne suit pas la page (colonne `sticky` des Recherches), le bandeau passe à droite. Hauteur plafonnée à l'écran, avec défilement interne (zoom à 400 %). `tests/consent.test.mjs` vérifie que chaque page a l'extrait et `consent.js` ensemble (§10).
- **Événements GA4 en plus des pages vues** : `help_open` (`source`) et `help_banner_close` dans `help.js`, `language_change` dans `GlobalLang.set()` et dans les deux remplaçants des pages Théâtre, `currency_change` dans `scSetCur()`, `theme_change`, `tab_change` et `tool_use` dans `header.js` (`hdrTrack`, fin de fichier). Chaque fichier appelle `gtag` lui-même sous garde `typeof`, jamais un helper d'un autre fichier (cache décalé, ci-dessus), et aucune valeur saisie ne part : la page À propos le promet.
- **Un nouvel onglet porte un nom stable** (`id`, `data-target` ou `data-tab`) : `tab_change` ne retombe sur le texte qu'en dernier recours, et FR et EN compteraient alors séparément. Les paramètres `source`, `language`, `theme`, `tab`, `currency` et `field` se déclarent comme dimensions personnalisées dans GA (Admin > Définitions personnalisées), sinon les rapports ne les montrent pas.

### Aide des pages
- **Le mode d'emploi se complète, il ne se réécrit pas** : `shop-page.js` pose une aide commune et appelle `window.spHelpExtras(cfg)` si un module l'a définie (le Théâtre y ajoute son chapitre `cfg.sections`). Poser ce hook au premier niveau du fichier, jamais après un `await`.

### Événements et optimiseurs (Théâtre surtout)
- **`seCompute(upTo)` est la seule source** de ce qu'un plan d'événement verse (§13) : un module qui recalcule de son côté rate `outsideBuys`, les lignes décochées, etc.
- **Un plan projette l'avenir**, il ne se compare pas au jeu : deux chiffres, « en poche aujourd'hui » (seul comparable) et « à dépenser d'ici la fin ». Un reste négatif signale une source de revenu manquante : ne jamais le masquer par `Math.max(0, …)` (ligne de rapprochement `stReconcileHtml`).
- **« Ne pas encaisser » ≠ « pousser »** : distinguer « l'autre branche gagne » de « aucune action n'est payable ». Un `null` à deux sens se teste, il ne se replie pas en `|| 0`.
- **Boutons d'action plutôt que steppers** pour reporter une dépense (`stAct()`) : une montée de +1, +2 ou +3 étages ne coûte qu'une exploration.
- **Le conseil pousser/encaisser est une plage, pas un seuil** : il dépend de l'étage, du compteur de garantie et du budget, sans monotonie. `ftAdviceRange()` rend les deux bornes de la plage qui contient le budget ; jamais de chiffre unique ni de dichotomie. `ftSolveValue()` résout la table une fois pour tous les budgets (mémoïsée par zone et barème).

### Stockage du navigateur
- **Toujours `STORAGE_KEYS` + `safeParse`** (§8) : jamais de chaîne littérale ni de `JSON.parse` nu. Un `JSON.parse` nu au chargement du Piège à Ours emportait tout le `DOMContentLoaded` sur une page d'apparence normale. Exception : les clés chrome (`hub_theme`, `hub_lang`, `shop_view`, `shop_currency`, `fb_*`).
- **Par origine** : changer de nom de domaine rend toutes les données invisibles (arrivé au passage à `kingshottoolbox.com`). À préparer avant tout changement d'adresse : page de reprise avec export par presse-papier et import par collage (l'ancienne `migrate.html` est dans l'historique git). Safari efface le stockage après 7 jours sans visite.
- **Le stockage peut être refusé** (cookies bloqués) : `profiles.js` expose alors une API inerte et prévient. Limite assumée : quelques lectures directes dans les modules lèvent encore une erreur console.
- **Création du registre ≠ migration des clés** : seule une page qui charge `storage-keys.js` pose `mig` ; la migration est idempotente et ne retire une clé à plat qu'après l'avoir recopiée.

### Interface
- **Texte visible : guillemets et apostrophes droits, pas de cadratin entre deux mots** (règle n°7 de `CLAUDE.md`, verrouillée par `tests/writing.test.mjs`). Dans une chaîne JS, l'apostrophe s'échappe selon le délimiteur (`'l\'objet'`) ; dans un attribut HTML écrit en dur, le guillemet s'écrit `&quot;`. Restent permis le « — » seul (pas de valeur), « — Objet — », la signature « — Aistra » et les chevrons du français.
- **`style.css` raye toutes les tables** (`tbody tr:nth-child(even)`, spécificité 0,1,2) : pour surligner une ligne, qualifier (`.sxe-grid tbody tr.ma-classe`) et doubler la règle sur les colonnes `sticky` à fond opaque.
- **Pas de bloc essentiel dans un `<details>` dont l'état plié est enregistré** : un clic le ferait disparaître durablement.
- **Une pastille `.sx-fact` en `nowrap` élargit la page** sur téléphone quand son texte est long : `white-space: normal` dans les barres d'outils. Pour trouver un débordement, masquer les enfants du `<body>` un par un ; l'overlay `fixed` en `width: 100%` n'est qu'un symptôme.

### Donnée non tranchée
- La Caisse de ressources Niv. 3 : la règle déduite la met à 0,160 € (100 × Niv. 1), un pack la vend 0,075 €. L'un des deux est faux ; seul le jeu peut trancher (comparer ce que rendent une Niv. 1 et une Niv. 3). Laissé tel quel.
