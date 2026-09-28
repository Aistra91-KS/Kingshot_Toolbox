# MAP §6 · Données (3/3) : plan d'avancement des familiers

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine. La page Familiers est en attente de refonte (septembre 2026).

### Plan d'avancement des familiers (`js/pets-plan.js`)

Question du joueur : avec mon stock, quels familiers j'avance, dans quel ordre, pour combien de points à l'Entraînement Animalier ?

**Règles du jeu.** Seuls les avancements rapportent (la nourriture n'est qu'un péage vers le cap suivant). Les avancements d'un familier sont ordonnés. Le coffre est un **choix** (7 manuels **ou** 2 potions **ou** 1 médaillon) : l'optimiseur décide de la répartition et l'affiche.

**Propriété du moteur** : l'ordre ne change pas ce qu'on peut se payer (le surplus d'un coffre reste en stock). Un plan se résume donc à un vecteur « combien d'avancements par familier » ; l'ordre affiché sert seulement au joueur (le plus rentable d'abord).

**Méthode, en deux temps, les deux à garder.**
1. Six façons de priser une étape, remplies gloutonnement puis raffinées par recherche locale ; on garde la meilleure.
2. Séparation-évaluation `ptExact`, amorcée par ce résultat et bornée à 140 ms : jamais pire, parfois mieux ; `proven: true` si elle a tout balayé, et la page le dit. Sans ce second temps, un audit a trouvé un stock à 750 000 points au lieu de 775 000 (verrouillé en test, §10).
- La borne de `ptExact` doit rester une **vraie borne supérieure** : coffres comptés en équivalents continus, jamais en coffres réellement ouverts (arrondis), sinon « prouvé optimal » deviendrait faux. Un test le confronte à une énumération exhaustive.
- Coût : 3 à 5 familiers, prouvé en moins de 6 ms ; 14 familiers, prouvé environ 1 fois sur 3 dans les 140 ms. D'où un recalcul temporisé de 220 ms (`scheduleResult`), saisie comme cases du filtre.

**Saisie des montants (`ptParseAmount`)** : on efface d'abord les séparateurs de milliers (devant exactement trois chiffres) ; ce qui reste suivi d'un suffixe k/M est un décimal (« 1,2M ») ; sans suffixe, on ne garde que les chiffres (« 1,200k » = 1 200 000).

**Coffre-équivalent** (7 manuels = 2 potions = 1 médaillon = 1 coffre) : unité du classement. Le taux se lit dans `chest.choices` de `pets_event.json`, jamais en dur (`DEFAULT_CHOICES` n'est qu'un repli), légende comprise.

**Avancement fait** (`ptAdvDone`) seulement si la sauvegarde dit `true`, `1`, `"1"` ou `"true"` : la chaîne `"false"` est vraie en JavaScript.

**« Ce qui t'arrête »** : la nourriture (en plus du reste) et les matériaux (en nature **ou** en coffres) sur deux lignes, avec un « ou » explicite ; le nombre de coffres est celui qui manque après le plan (`chestsShort`).

**Filtre des familiers** : décocher ceux qu'on n'a pas ; raccourcis tout / rien / « seulement les commencés » (désactivé sur un profil vierge). Un familier écarté sort du plan, du classement et de « ce qui t'arrête ». Deux décisions à garder : on stocke les **exclus** (`petsPlanOff`), pour qu'un familier ajouté entre au plan tout seul ; le filtre vit dans la colonne du plan, pas dans la colonne collante du stock (un élément collant plus haut que l'écran n'expose jamais son bas).

**« Appliquer les modifications »** (même geste et mêmes classes que TrueGold et l'Académie de guerre) : les familiers montent aux caps du plan, le stock devient `plan.left` (surplus des coffres compris). Les niveaux sont relus au moment de **valider** ; la promenade est prévenue par `window.petsSyncFromStorage()`, appelé sous garde (cache, §9 `09a`).

**État de départ** : niveaux et avancements de la promenade (`pets` en stockage), relus à chaque ouverture de l'onglet ; avertissement si rien n'a été saisi.
