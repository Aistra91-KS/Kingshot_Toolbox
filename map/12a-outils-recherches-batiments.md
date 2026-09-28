# MAP §12 · Outils (1/2) : Recherches, Planificateur de bâtiments

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 12. Outils : règles de calcul et d'affichage

> Ce que chaque optimiseur garantit, ce qu'il refuse, et les arbitrages déjà tranchés. Les conventions transverses sont au §9.

### Recherches (`research_calc.html`, `js/research_script.js`)

**Ordre des suggestions** (`rsPlanOptimal`, fonction pure qui rend `{rows, extraCount, longItem, plannedTime, leftover}` ; `renderOptimal` ne fait qu'afficher).
- **Deux priorités passent devant, hors KVK** : `PRIORITY_RESEARCH`, dans cet ordre, Tool Enhancement (vitesse de recherche, se rembourse ici) puis Tooling Up (vitesse de construction, se rembourse sur TrueGold). Chacune a sa case dans « Recherches prioritaires » ; décochée, `priorityOf()` rend `null` et la recherche retombe au tri par temps (jamais « rang plus grand »). Repères distincts : éclair « Vitesse de recherche », marteau « Vitesse de construction » (`RS_ICONS`, locales au fichier pour le cache).
- **Reconnaissance au nom anglais**, le seul stable : la base écrit le niveau V « Amélioration de l'outil V » et les autres « des outils » (coquille connue, qui fait aussi échapper ce niveau à la recherche texte des pages BDD).
- **Pas de retour sur investissement chiffré** : il faudrait le % de vitesse par niveau, absent du dépôt. Décision d'Aistra : en tête, sans chiffrer. La priorité ne joue que sur ce qui est déjà débloqué.
- **Le mode KVK vise le nombre** (décision d'Aistra, ne pas l'inverser) : `speedFirst` coupé, plus court d'abord. Le badge reste visible.
- **La dernière ligne du mode KVK dépasse volontairement le stock** : la plus longue recherche à portée, que les bonus de KVK raccourciront le plus. Rang réel (`rows + extraCount + 1`), temps en `--warning`, phrase `.sugg-sep` en trois formulations (plan vide, plan non vide, reste d'accélérateurs affiché seulement s'il atteint la seconde). Affichage à 8 lignes + compteur (choix d'Aistra) ; la boucle se déroule en entier.
- **Coût mesuré** : `renderOptimal` 1,4 ms hors KVK, 17 ms en KVK, 37 ms à 999 jours d'accélérateurs. `updateUI()` complet ~168 ms, dominé par les 720 lignes d'arbres.

**Calcul au bouton** (§9 `09b`) : `rsComputePlan()` calcule, `renderOptimal()` ne fait plus que dessiner `rsPlan` (donc aussi à la langue). Empreinte `rsSig()` : bonus, mode KVK, accélérateurs, arbres ciblés, deux priorités, cases cochées ; « Masquer terminées » et « Sélection rapide » n'en font pas partie.

**Bouton « Fait » par ligne** (`markSuggestionDone`) : coche la recherche **et toujours sa chaîne de prérequis**, indépendamment de la Sélection rapide. Sur la première ligne, action immédiate ; sauter des lignes passe par `showAppConfirm` qui nomme les recherches concernées (5 au plus). Compte annoncé et appliqué viennent de `pendingReqsOf`. Puis la liste se recalcule tout de suite, seule exception au calcul au bouton, et le focus revient au premier bouton du tableau reconstruit.

**Sélection rapide** (`#auto-reqs`, opt-in, persistée dans `researchInputs`, visible sur les onglets d'arbres) : cocher coche toute la chaîne (`cascadeCheckReqs`, mêmes règles qu'`isAvailable`), décocher décoche ce qui en dépend (`cascadeUncheckDeps`, par passes jusqu'à stabilité). Un toast annonce les cases modifiées en plus (silence si 0). Pire cas : 102 cases, ~2 ms.

**Un seul champ de bonus** : la statistique de vitesse de la ville compte déjà Ministre, KVK et Royaume, les anciennes cases les comptaient deux fois. Repli des anciens réglages : `bonusFolded` (§9 `09a`).

**Domaine du bonus** (`rsReadBonus`) : pourcentage fini, positif, plafonné à 100 000 %. Hors domaine, la valeur est refusée (message `bonusRange`, `aria-invalid`, calcul sans bonus) et **pas enregistrée** : `saveData()` écrit le bonus qui a servi, sinon la page rouvrirait en erreur. L'attribut `min` ne valide rien seul.

**Affichage** : sous 600 px la colonne « Arbre » passe sous le nom (`.sugg-tree-sm`) et le bouton garde sa seule coche ; nom accessible complet (`btnDoneAria`), repère compact en `role="img"`. Notes `.group-hint` et `.sugg-sep` en teintes dédiées (`--text-muted` ne tient que 4,4:1 sur `--control-bg`) ; en thème clair, `#8a6410` (badge), `#00695c` (bouton), `#b23c00` (temps de la ligne longue), liseré de focus en `--text-light`.

### Planificateur de bâtiments (`truegold_calc.html`)

**Deux onglets** : « Avant l'Or Véritable » (`js/truegold_pre.js`, niveaux 1 → 30, la contrainte est pain, bois, pierre et fer par milliards) et « Or Véritable » (`js/truegold_script.js`). Le panneau latéral suit l'onglet ; les bonus de vitesse sont partagés. `truegold_pre.js` relit ces champs par `getElementById` au lieu d'appeler `computeTotalVitesse()` (cache, §9 `09a`). Onglet retenu dans la clé chrome `tg_tab` (§8).

**Ordre que le jeu autorise** : chaque niveau porte son prérequis de Centre-ville (`tc`) et de bâtiment (`req`) ; `blockerOf()` déroule le moins cher parmi ce qui est jouable. Ce qui reste hors de portée est listé **avec le prérequis qui bloque**.

**Les 14 bâtiments et leur ordre sont une donnée de code** (`PRE_ORDER`) : Centre-ville, Ambassade, Camp d'Infanterie, Camp de Lanciers, Camp d'Archers, Base de commandement, Infirmerie, Académie, Poste de garde, Entrepôt, Moulin, Scierie, Carrière, Mine de fer. Ordre du jeu décidé par Aistra, donc pas d'intertitre de catégorie. `blockerOf()` ne cherche un prérequis que parmi ces 14 (un prérequis sur un bâtiment écarté bloquerait pour toujours).

**Puissance gagnée = puissance(cible) − puissance(départ)** : `power` de `buildings_db.json` est la puissance totale à ce niveau. La somme des paliers traversés annonçait 8,3 fois trop.

**Bonus PAN, par amélioration** : `max(0, temps × facteur − heures PAN)` pour chaque niveau, comme l'onglet Or Véritable (plus bas). `compute()` accumule des secondes effectives. Quand PAN vient du Conseil des Experts, `truegold_script.js` émet `panChanged`, écouté par `truegold_pre.js` (un événement, pas un appel : rien ne lève si l'un est en cache).

**Modification groupée** (`renderBulk()` / `bulkApply()`) : tous ou les seuls cochés, niveau actuel, cible ou les deux. Un bâtiment plafonné plus bas prend son maximum (Poste de garde : 10) ; une cible sous le niveau actuel est remontée ; le compte annoncé est celui des lignes qui ont vraiment bougé. Redessinée à la langue seulement (sinon les listes reviendraient au défaut) ; `.pre-bulk:empty` la masque si elle est vide.

**Camps de troupes renommés** (20/09/2026) : Camp d'Infanterie, de Lanciers, d'Archers, partout où le joueur les lit (`buildings_db.json` **y compris les chaînes `req`**, `truegold_db.json` `bldgMap`, pages bâtiments). Slugs d'URL (`/database/buildings/barracks`) et clés internes (`"Barracks"`) inchangés. `blockerOf()` retrouve un prérequis par `name.EN` : renommer un bâtiment sans ses `req` rend le prérequis introuvable, donc ignoré en silence.

**Première visite** : onglet « Or Véritable » (`initTabs()`, remplacé par `tg_tab` dès que le joueur a basculé), mode KVK (max points) depuis le 20/09/2026 (`selected` dans le HTML et repli de `saveData()` alignés).

**Mode, score cible et accélérateurs sont communs aux deux onglets** (panneau partagé depuis le 20/09/2026). « Appliquer » côté Avant l'Or Véritable retranche les accélérateurs en écrivant les champs puis en émettant un `input` (événement, jamais appel croisé).

**Saisie des stocks** (`parseStock()`) : `500k`, `1.5M`, `2B`, `md`, point ou virgule décimale, espaces ignorés **insécable compris** (le champ est réécrit « 500 000 » au flou). Une saisie incomprise rend `null` et l'appelant garde la dernière valeur valable. Pas d'`inputmode="numeric"` sur ces quatre champs (le pavé mobile n'a pas de lettres) ; `#scoreCible` le garde.

#### Onglet Avant l'Or Véritable (`truegold_pre.js`)
- **Les points KVK ne viennent que des minutes d'accélérateur**, 30 points la minute. Les ressources bornent ce qu'on peut lancer, elles ne marquent rien.
- **Glouton à trois ordres** (moins cher, plus long, meilleur rapport minutes/ressource), le meilleur au sens du mode est retenu. Départage en mode points : points, puis accélérateurs gardés, puis ressources.
- **Minutes entières** (`minutesAccel()`) : `ceil(sec / 60)`, un accélérateur d'une minute ne sert qu'un chantier (même arrondi que l'onglet Or Véritable). Un chantier rendu gratuit par PAN coûte 0.
- **Niveau courant à partir de 0** : un bâtiment non posé est au niveau 0, son premier chantier compte. Défaut 1 (ville sortie du tutoriel), seule une valeur illisible y retombe. La barre groupée propose aussi 0.
- Un niveau instantané n'arrête pas le plan (on s'arrête au stock d'accélérateurs épuisé) ; sans accélérateurs, le panneau dit pourquoi le mode points n'a rien à faire ; le plan porte une **révision** contrôlée à l'ouverture et à la validation de la confirmation (constat F03, §14).

#### Onglet Or Véritable (`truegold_script.js`)
- **Palier serveur** (`#serverTier` : TG3, TG5, TG8, TG10, défaut TG8) : au palier N le dernier niveau en jeu est `TGN-0`. Le plafond ne touche que l'optimiseur (`niveauOuvert()` dans `executerPlan()`) ; le tableau garde tous les niveaux. Les bâtiments déjà au-dessus sont gelés (toujours prérequis) et listés dans un bandeau en tête du plan.
- **Temps de construction** (`computeTotalVitesse`, `computeReductionTempsBase`) : `base × (1 − 20 % si Bouchées Doubles) / (1 + vitesse + loup)`, puis PAN en forfait (`Math.max(0, Math.ceil(t) − panRedMin)`). Les trois calculs (lignes, glouton, KVK exact) passent par ces deux fonctions, jamais de formule réécrite sur place. Le Loup Gris est un bonus de vitesse, déjà inclus dans la stat de la fiche joueur quand il est actif (`wolfHint`). Les Bouchées Doubles sont le seul bonus multiplicatif, hors du pool. Mal rangés, les temps sortaient 15 % trop courts.
- **Plan en séries chronologiques** (`.tg-plan`) : niveaux consécutifs d'un bâtiment, dans l'ordre réel. Un bâtiment réapparaît autant que l'escalier des prérequis l'impose : ne jamais regrouper par bâtiment. Chaque série est un `<details>` (`.tg-serie`, mention « débloque #n »), état déplié gardé par `TG_OPEN_SERIES`.
- **Mode KVK résolu exactement** (`resoudreKVKExact`) ; Max bâtiments et Score cible restent gloutons. Le glouton ne savait pas investir dans un bâtiment qui en débloque un meilleur, et départageait deux jumeaux par l'ordre des lignes (décocher un bâtiment faisait gagner des points). L'exhaustif tient parce que l'état se résume au vecteur de niveaux (mémoïsation, valeur empaquetée `points × 16 + premier coup`, chemin relu par `reconstruire()`), que `transfosNecessaires()` donne en O(1) le minimum de transformations du creuset, et que la règle des files borne la profondeur. `regrouper()` réordonne en séries, `rejouer()` valide. Au-delà de `KVK_MAX_ETATS` (60 000), repli sur le glouton avec une variante par bâtiment écarté. Mesures : médiane 16 états, p99 21 000, ~25 ms au pire sur 250 scénarios.

**Calcul au bouton** (§9 `09b`), un par onglet. Or Véritable : `runCalculatorInner` au bouton, `tgSyncCalc` dans `triggerUpdate` à la place du calcul différé, empreinte `tgPlanSig()` (champs du panneau, PAN compris, et bâtiments). Avant l'Or Véritable : `renderStrategy` au bouton, « Ce qu'il faut » reste un total en direct, empreinte `preSig()` (bâtiments, stock, et les champs partagés relus par `planifier()`). Un changement de langue redessine un plan à jour (même calcul) et laisse un plan périmé tel quel.

#### « Appliquer les modifications » (TrueGold et Académie de guerre)
CTA doré partagé (`.plan-apply`, `style.css`) qui réécrit la page comme si le plan était fait : niveaux, stocks, creuset (TG débité, TTG crédité du gain moyen, `transfoUtilisees`), puis recalcul. Il écrase des saisies : `showAppConfirm` avec récapitulatif avant/après (`.apply-diff`), puis toast. Décisions d'Aistra, ne pas les inverser : l'étape « en cours » monte quand même ; le creuset s'applique à son gain moyen (1,45 TTG) avec invitation à corriger ; pas d'annulation. Source : le dernier plan calculé (`TG_LAST_PLAN`, `lastPlan` côté Académie), le bouton et le plan affiché naissent du même calcul. Applicable seulement si l'empreinte des valeurs saisies est celle du calcul (`plan.sig`), contrôlée à l'ouverture et à la validation : la révision `TG_INPUT_REV` ne sert plus de garde, elle rendait inapplicable un plan redevenu à jour.
