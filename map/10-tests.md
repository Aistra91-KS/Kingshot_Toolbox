# MAP §10 · Tests

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 10. Tests

**`node --test`** à la racine : rien à installer ni à construire. 110 tests en 11 fichiers (septembre 2026), environ 5 s. La CI les lance à chaque push (§7).

**Le harnais** (`tests/harness.mjs`) charge les `js/*.js` **sans les modifier**, dans l'ordre du HTML, dans un contexte `vm` : `fetch` lit `data/` sur le disque, `localStorage` est en mémoire (chaque test part des défauts), `document.getElementById` rend `null` (les IIFE de fin de fichier sortent avant tout rendu). On teste donc le code servi, sans `export`. Les `let` de premier niveau vivent dans la portée lexicale du contexte : les lire et les écrire via `run(ctx, '…')`. `Date` suit l'horloge réelle, ou une date figée passée en `{ now }` à `createContext` et `loadEventShop`.

### Ce qui est couvert
| Fichier | Code | Ce qui est verrouillé |
|---|---|---|
| `shop-event` | `seCompute` | contrôles réels de §13 : Caravane du Dragon 4 jours + achat déclaré = 230 essences (195 sans), Stand d'Aventure F2P 5 jours = 32 388 gemmes, autant de Points de Vente que de Pièces d'Aventure par source |
| `euro-affinity` | `scEurUnit`, bloc `affinity` | même prix du point sur les trois jetons, Cor en cuivre chiffré, pack affiché = pack de la base, `basis.points` = somme du `detail` (attrape une base mal relue), la règle ne déborde pas sur les objets voisins |
| `euro-ceiling` | drapeau `ceiling` de `derived` | sous plafond l'objet vaut ses gemmes, un pack moins cher reprend la main, un plus cher ne change rien, une règle sans plafond décide toujours |
| `theater-draw` | `ftClimbCostFrom`, `ftComputeReach`, `ftAttemptsFrom` | forme close contre une simulation Monte-Carlo indépendante, générateur grainé (un échec est un vrai écart) |
| `pets-plan` | `ptPlanCompute`, `ptLadder`, `ptRankAll`, `ptFilterPets`, `ptIsStarted` | optimum comparé à une énumération exhaustive (le premier glouton se trompait de 10 %), contre-exemple à 775 000 points de l'audit du 08/09/2026, `proven` jamais annoncé à tort, prix en coffres lu dans `chest.choices`, `"false"` non compté comme fait, filtre (exclus, identifiant inconnu, familier ajouté, « commencé » = trace réelle du joueur) |
| `beartrap-distribution` | `btDistributeTroops` | trois relevés à la main, cas limites, 5 000 tirages grainés : capacité et stock jamais dépassés, jamais moins que l'ancienne version, marches de même capacité à 2 troupes près |
| `research-order` | `rsPlanOptimal`, sur la vraie base | ordre jouable en jeu (prérequis réunis ligne à ligne, compte neuf et comptes avancés tirés au sort), Tool Enhancement puis Tooling Up devant hors KVK, case décochée rendue au tri par temps, plan KVK dans le stock et arrêté seulement quand la suivante ne tient plus, ligne au-delà du stock = la plus longue à portée, plus de stock jamais moins de recherches. Le démarrage de la page reste en attente (`fetch` sans réponse) et le test charge la base lui-même |
| `wa-coins` | optimiseur de l'Académie de guerre | budget de pièces : plan inchangé sans budget, jamais dépassé, moins de pièces jamais un plus gros plan, niveau « en cours » payé en entier, partage toujours payable |
| `writing` | texte du site (règle n°7 de `CLAUDE.md`) | aucune apostrophe ni guillemet courbe, aucun cadratin entre deux mots, dans les chaînes de `js/`, les scripts en ligne, le texte et les attributs des pages et gabarits, et `data/` (hors clés `_…`, `meta`, `…Note` et entrées 0.x du changelog). Lecteur de chaînes maison, sans dépendance, vérifié une fois contre acorn sur tout `js/` |
| `wa-advanced` | arbre avancé de l'Académie de guerre (`advancedTree`, `suggest`) | conversion fidèle (92 techs, 1 010 niveaux, or = pièces), plan des arbres de base inchangé sans l'arbre avancé, plan jouable sur 80 tirages grainés (palier TG, prérequis, TTG, poussière et pièces jamais dépassés), 30 000 points par TTG, plus de TTG jamais moins de points, rien avant TG5, suggestion globale KvK jamais sous l'onglet de base ni l'onglet avancé |
| `wa-exchange` | échanges contre TrueGold | pièces d'abord, échange à 5 TG avant celui à 10 TG, plafonds (20 ; 200 par semaine), échange indivisible, jamais plus que le stock, ligne décochée sautée |

Non couverts à ce jour : les calculs du Planificateur de bâtiments (§15). Ils vivent dans des fonctions qui lisent la page (`SUGGERER_KINGSHOT`, `updateAllRowCosts`, l'IIFE de `truegold_pre.js`) : les tester demande d'abord d'en sortir un moteur pur, comme `rsPlanOptimal`.

### Trois règles
- **Un contrôle chiffré écrit en prose dans la cartographie est un test à transcrire**, de préférence à un test inventé : il vient d'un relevé en jeu.
- **Un test qui ne peut pas échouer ne protège rien** : après l'avoir écrit, casser le code couvert et vérifier qu'il vire au rouge.
- **Un test qui lit le jour porte sa date** (`{ now }`) : les tests Clair de Lune se jouent au 3e jour de l'événement. Sans date, deux d'entre eux ont échoué le 28/09/2026, jour de sa fin, sans que rien n'ait changé dans le code.
