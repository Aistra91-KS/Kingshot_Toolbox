# MAP §9 · Conventions (3/4) : pièges déjà rencontrés

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 9. Pièges déjà rencontrés

Chaque piège est silencieux : rien dans la console, seulement un rendu faux ou vide.

- **Apostrophe dans un nom d'image servi en `url('...')`** : `encodeURIComponent` ne l'encode pas, elle referme la chaîne CSS et l'icône reste vide, sans 404. Toujours enchaîner `.replace(/'/g, '%27')` (posé dans `caserne.js` et `masters.js` pour `Forager's Luck`, `Finder's Keepers`…). Sans danger dans un `<img src="…">` à guillemets doubles.
- **Lookbehind dans une expression régulière** : non supporté par Safari < 16.4 et les iOS de cette génération, où c'est une erreur d'**analyse** : le fichier entier refuse de se charger, la page reste sur son squelette statique, sans message. Capturer la lettre qui précède et rendre la chaîne intacte quand il y en a une (`/([A-Za-z]?)X(?![A-Za-z])/`), comme `caserne.js` et `masters.js`.
- **Dépendance `GlobalLang` non définie** : `lang.js` doit être chargé **avant** tout script qui appelle `GlobalLang` ; toujours garder le fallback `window.GlobalLang ? GlobalLang.get() : 'FR'` (déjà en place dans header/help/backup). Ordre de chargement critique.
- **Fonction `getRawNumber` manquante** : helper local à `beartrap.js` (nettoie espaces + `parseInt`). N'existe **pas** globalement : ne pas l'appeler depuis un autre script sans la (re)définir.
- **Formatage des nombres dépendant de la locale** : l'UI formate les milliers via `toLocaleString('fr-FR')` (espaces). Les inputs numériques FR **refusent le `.`** ; côté saisie, nettoyer (`replace(/\D/g,'')` / strip espaces) **avant** `parseInt`/`parseFloat`. Ne pas parser directement `el.value` formaté.
- **`fetch` de données** : chemins relatifs (`data/….json`), toujours vérifier `response.ok` et afficher un message clair (TrueGold dit « le fichier existe-t-il ? »). Revalidation obligatoire : §9 `09a`.
- **Embeds Discord fusionnés** : deux embeds d'un même message qui portent la **même `url`** sont regroupés par Discord en un seul bloc, et la description du second est perdue (c'est le mécanisme d'affichage multi-images). Ne jamais mettre `url` sur les embeds FR/EN de `announce.js` : le lien vers le site passe par `author`.
- **Équipement Exclusif d'un héros (`widget`)**, trois pièges :
  1. **5 paliers pour un sélecteur qui va à 10** : la Conquête se lit aux niveaux **impairs** (1/3/5/7/9), l'Expédition aux **pairs** (2/4/6/8/10), `getWidgetEffectValue()` (`caserne.js`). Un `levels[]` de 10 entrées ferait donc afficher une valeur sur deux. Au niveau 0 (et 1 côté Expédition) l'effet vaut `"0%"` et s'affiche grisé.
  2. **Substitution des « X »** (`formatWidgetDesc`, `caserne.js`) : une phrase à **une** valeur voit **tous** ses « X »/« X% » remplacés (regex globale) : ne jamais laisser un X littéral ailleurs dans le texte, dans aucune des deux langues. Une phrase à **deux** valeurs utilise le format `"(a,b)"` (**virgule**, contrairement au `"(a;b)"` des Experts, §6) et les valeurs sont injectées **dans l'ordre du texte**. Le `%` fait partie de la valeur : écrire `X%` dans la phrase et `"15%"` dans `levels`.
  3. **Les icônes sont résolues par `name.EN` exact** (espaces conservés ici ; `img/MasterSkill/` est le seul dossier à les remplacer par des underscores) : `img/widgetname/<widget.name.EN>.webp` (l'arme) et `img/widgetskill/<effect.name.EN>.webp` (les 2 effets). Renommer ou corriger un `name.EN` casse l'image sans erreur, d'où la coquille `Offenseive Defense` (Yang) qu'il faut **conserver** telle quelle.
  Un héros sans `widget` ne casse rien : `renderModalWidget()` masque le conteneur et `modal-tabs.js` retire l'onglet « Équipement » sur mobile. Un équipement manquant ne se voit donc pas.
