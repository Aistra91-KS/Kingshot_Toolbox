# MAP §11 · Pages générées

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 11. Pages générées

**72 des 124 pages sortent d'un gabarit** : 20 pages boutique, 14 pages de bâtiments, 38 pages Héros (sommaire + 37 fiches).

```
python3 tools/build_pages.py           écrit les pages
python3 tools/build_pages.py --check   échoue si une page servie ne correspond plus à son gabarit (CI)
python3 tools/sync_drawer.py           réécrit le bloc drawer figé dans toutes les pages
python3 tools/sync_drawer.py --check   échoue si une page est en retard sur le manifeste (CI)
```

Ce n'est pas un build : les scripts tournent à la main avant le commit et **leur sortie est commitée**. Pages sert le même HTML statique complet, et le contenu existe sans JavaScript (§9 `09b`).

### Où éditer quoi
| Ce que tu veux changer | Le fichier à ouvrir |
|---|---|
| Gabarit commun (head, scripts, structure) | `tools/templates/shop.html`, `building.html`, `hero.html`, `heroes-index.html` |
| Titre, description, nom FR/EN, intro d'une page | `tools/pages-shop.json`, `tools/pages-building.json` |
| Un bloc propre à une page | `tools/partials/<slug>.<rôle>.html` (rôles des boutiques : `head`, `lang-alt`, `page-script`, `scripts`) |
| Une fiche Héros, jusqu'à son intro | `data/heroes_db.json` |
| Navigation du drawer | `js/site-config.js`, puis `sync_drawer.py` |
| Une page `shop/*`, `database/buildings/*`, `database/heroes/*` | aucun : l'édition serait perdue |

### Ce qui se déduit ne se déclare pas
- Une boutique charge `shop-event.js` et reçoit `<div id="sp-event">` parce qu'elle a un `data/events/<slug>.json` ; elle affiche « Chest contents » parce qu'elle figure dans `shopcalc_chests.json` ; la nav des bâtiments suit l'ordre de `pages-building.json`.
- **Héros** : un héros ajouté à `heroes_db.json` entre au sommaire tout seul et reçoit une fiche quand son `conquestSkills` arrive. Sommaire rangé par génération, la plus récente en haut (`sections_index()`), puis par `tri_heros` (rareté, nom) ; la génération n'est pas répétée sur les cartes du sommaire (`sous_titre(..., gen=False)`). La nav des fiches se découpe en groupes titrés (`groupes_nav()`) : même classe de troupe, même génération, autres héros ; un rare ou un épique ouvre sur sa rareté. Chaque héros n'y figure qu'une fois, génération la plus récente en tête de groupe. Trente-six pastilles d'un bloc ne disaient pas lesquelles se comparent au héros ouvert.
- **Bâtiments, deux familles** : les huit qui montent à l'ère Or Véritable ont un tableau en partial (`tools/partials/<slug>.table.html`, colonnes TrueGold et TG Trempé) ; les six autres (Entrepôt, Moulin, Scierie, Carrière, Mine de fer, Poste de garde) ont un tableau reconstruit depuis `buildings_db.json` (puissance, FR compris). La famille se déduit de l'existence du partial. `fmt_qte()` refuse une valeur que son format arrondirait. La nav sépare les deux familles par leur intitulé.
- **Les tableaux en partial restent recopiés** : les libellés FR des prérequis et des durées n'existent que dans le HTML. Les tirer de `truegold_db.json` suppose d'abord de déplacer ces traductions dans la donnée.

### Le drawer figé
Même bloc sur les 123 pages qui chargent `header.js` (404.html est autonome, §2). `sync_drawer.py` le déduit de `site-config.js` lu par Node (pas par regex), et les quatre gabarits ont un emplacement `{{DRAWER}}`. Libellés tels quels, `&` compris, comme les pose `hdrBuildDrawer()`, pour que le bloc figé et celui du JS ne divergent pas. La jumelle française reçoit la nav en français. La sortie de Node se lit en UTF-8 déclaré (`encoding='utf-8'`) : sous Windows, Python la décodait en cp1252 et écrivait « BÃ¢timents » dans la jumelle.

### Hors gabarit
- **`fr/shop/theater-shop.html`** : français en dur, `<base href="../../">`, `hreflang` inversés. Toute modification du gabarit boutique s'y reporte à la main. `--check` compare les listes de scripts et de feuilles de style des deux jumelles et échoue si elles divergent.
- **`shop/items.html`, `shop/items-euro.html`, `database/buildings/index.html`** : pages uniques. Ajouter un bâtiment demande donc deux gestes : une entrée dans `pages-building.json` et une carte dans `database/buildings/index.html`.
- `_config.yml` exclut `tools/` et `tests/` de la publication (sinon les gabarits seraient servis avec leurs `{{EMPLACEMENTS}}`).

### Rédaction des pages boutique
Titre, description et intro présentent les deux lectures (€/$ et gemmes), puisque la page s'ouvre en €/$. La phrase d'intro commune (« La page s'ouvre sur la lecture €/$ et bascule en gemmes d'un clic ») est reportée à la main sur le jumeau FR. Couverture euro mesurée de 63 % (Arène) à 100 %.
