# MAP §14 · Revues locales du miroir privé

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 14. Revues locales du miroir privé

`tools/reviews/2026-09-20/` contient la revue du commit `9b95512` : rapport PDF avant/après, source HTML, constats structurés, scripts de reproduction et résultats des contrôles. Ce livrable est propre à ToolBoxPrivate ; le dossier `tools/` est déjà exclu de la publication par `_config.yml`.

`tools/reviews/2026-09-28/AUDIT_ECC_2026-09-28.md` : audit des quatre grilles ECC (revue, erreurs silencieuses, SEO, accessibilité) sur tout l'écart entre le miroir et le public avant fusion, avec avant/après et la liste des adresses à ajouter au `sitemap.xml` et au `llms.txt` du public. Corrections dans `d138bad`.

**État des 15 constats.** Les trois P1 (F01 sauvegarde importée exécutant du JavaScript, F02 contenu de module non validé à l'import, F03 plan TrueGold périmé encore applicable), les neuf P2 (F04 gain de puissance, F05 bonus PAN sans effet, F06 stockage interdit, F07 registre de profils mal formé, F08 succès de profil non enregistré, F09 bonus de recherche hors domaine, F10 onglets inaccessibles au clavier, F11 focus des fenêtres, F12 champs de boutique sans nom) et F15 (alerte française en anglais) sont **corrigés**, chacun rejoué dans Chromium sur sa reproduction d'origine. Restent ouverts **F13** (la langue ne change pas quand son enregistrement échoue) et **F14** (404 d'images masqués par les replis). Les règles qui en découlent sont écrites là où elles se cherchent : §8 pour l'import et les profils, §9 pour les dialogues, les onglets et les noms accessibles, §12 pour la puissance, le PAN et le domaine du bonus de recherche.
