# MAP §5 · Charte graphique

> Fiche de la cartographie du projet. Sommaire et règles de lecture : `MAP.md` à la racine.

## 5. Charte graphique (DA) : « Royal Gold / Black Edition »

Or éclatant sur noir profond, turquoise pour la validation, rubis pour l'alerte. Définie par variables CSS dans `css/style.css` (`:root` = sombre, `[data-theme="light"]` = clair).

### Variables du thème SOMBRE (`:root`)
| Variable | Valeur | Usage |
|---|---|---|
| `--bg-dark` | `#0a0a0a` | Fond principal |
| `--bg-panel` | `#161616` | Panels / cartes |
| `--control-bg` | `#1f1f1f` | Contrôles |
| `--input-bg` | `#252525` | Inputs |
| `--text-light` | `#f0e8d5` | Texte principal (ivoire) |
| `--text-muted` | `#938c81` | Texte secondaire (4,95:1 sur `--control-bg` ; `#8a8378` n'en tenait que 4,4) |
| `--accent` | `#f5b840` | **Or** (liseré, titres, focus) |
| `--accent-text` | `var(--accent)` | L'or **employé comme couleur de texte**. Identique à `--accent` en sombre, foncé en clair (voir ci-dessous) |
| `--accent-hover` | `#d49820` | Or foncé (hover) |
| `--border` | `#2a2a2a` | Bordures |
| `--success` | `#4ecdc4` | Turquoise (validation / CTA) |
| `--warning` | `#ff8c42` | Orange (alerte) |
| `--table-header` | `#1c1c1c` | Entêtes de table |
| `--table-row-alt` | `#131313` | Alternance de lignes |
| `--growth-color` | `#4ecdc4` | Arbre Croissance |
| `--eco-color` | `#f5b840` | Arbre Économie |
| `--battle-color` | `#e74c5c` | Arbre Combat |
| `--box-bg` / `--box-header` | `#1c1c1c` / `#252525` | Cartes de recherche |
| `--step-bg` / `--step-hover` | `#161616` / `#202020` | Étapes de recherche |
| `--shadow` | `rgba(0,0,0,.6)` | Ombre |
| `--header-height` / `--header-offset` | `60px` / `80px` | Header fixe + décalage body |

### Variables du thème CLAIR (`[data-theme="light"]`)
`--bg-dark #f5f7fb` · `--bg-panel #ffffff` · `--control-bg #f0f4fa` · `--input-bg #ffffff` · `--text-light #1a1a1a` · `--text-muted #646b78` (4,86:1 ; `#6b7280` tenait 4,4) · `--accent #c89020` (or antique) · `--accent-text #8a6410` (5:1 ; l'or antique ne tenait que 2,4 à 2,8:1 en texte sur ces fonds) · `--accent-hover #a07418` · `--border #d4dce8` · `--success #00897b` · `--warning #e65100` · `--table-header #eaf0f8` · `--table-row-alt #f5f8fc` · `--growth #00897b` · `--eco #c89020` · `--battle #c62828` · `--box-bg #ffffff` · `--box-header #eaf0f8` · `--step-bg #f5f8fc` · `--step-hover #e8eff7` · `--shadow rgba(0,0,0,.08)`.

**Or en texte et en contour de focus : `var(--accent-text, var(--accent))`**, jamais `var(--accent)` seul. L'or antique du thème clair sert aux bordures, fonds et boutons ; en texte il ne tient que 2,4 à 2,8:1 (3:1 exigé pour un contour). Le repli garde l'or d'origine si `style.css` est en cache sans la variable. Même logique : violet de l'Or trempé `#7b3fc4` en clair (`db.css`), pastille « Top » sur `#2563EB`, texte noir sur le bouton de langue actif du hub.

### Police, rayons, thème
Police système `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`, aucune webfont hors `pets.html`. Rayons par composant : cartes 12 px, panneaux et tableaux 8, contrôles 6, champs 4, pilules 20 à 25. Thème : `data-theme` sur `<html>`, clé `hub_theme` (défaut `dark`), appliqué dans le `<head>` avant le premier rendu (§9 `09a`).

### Cartes du hub
`.hub-card` : liseré doré en haut (`border-top: 3px solid var(--accent)`), reflet doré qui balaie la carte au survol (`::before`, 0,6 s) et `translateY(-5px)` ; `overflow:hidden` obligatoire. Pas d'autre effet décoratif.

### Exception assumée : `pets.html`
Palette nature en `oklch`, carte blanche translucide, webfonts Cormorant Garamond + Karla, pastilles colorées par génération (`--gen-1…7`). Le header reste standard. Tout est isolé dans `pets.css`, `pets-plan.css`, `pets.js`, `pets-plan.js` ; la barre d'onglets et le volet du plan sont construits par `pets-plan.js`. Sous 880 px, la promenade devient une colonne qui défile et le sentier une frise de pastilles en bas. Page en attente de refonte (septembre 2026).

### Header : pastille profil et mode condensé
Pastille profil à droite. Sur ordinateur, quand la rangée d'outils est rognée (`hdrEvaluateAdaptive`, avec hystérésis), le header passe en `.hdr-condensed` : langue et thème vont dans le panneau profil. Sous 820 px, toute la navigation est dans le drawer, précédée du bloc profil. Tout est dans `header.js`.

### Pied de page (`js/footer.js`, `.site-footer`)
- Sur toutes les pages sauf `pets.html`. Le lien Discord n'apparaît que si `SITE.discord` est renseigné (même règle pour le bloc « Une erreur, une idée ? » d'`about.html`).
- `footer.js` est toujours le dernier script : le bouton mobile de sauvegarde (`.backup-fab`) doit exister avant lui pour qu'il lui réserve sa place (`sf-has-fab`).
- Bande collée aux bords : `margin: 44px -20px -20px` + `width: calc(100% + 40px)`, jamais `flex-basis` (sous 768 px le body est en colonne et `flex-basis` y régit la hauteur).
- Sous 768 px, un enfant du body en `flex:1` perd sa hauteur déclarée (la base flexible la remplace) : `flex: none` rend la main à `height`. C'est ce qui figeait l'onglet Plan des familiers.
- Le body est en `display:flex` + `flex-wrap: wrap` ; le pied de page en `flex: 0 0 auto` ; `min-width: 0` sur `body > .main-content, body > .db-page`.
- **`.page-row`** (`ftrWrapPageRow()`) : sur les pages à sidebar, sidebar et contenu sont regroupés pour que le pied de page passe dessous. **Décision d'Aistra, ne pas la défaire** : la sidebar garde sa hauteur pleine, le vide à droite est assumé ; pas de `z-index` sur le pied de page (il masquait le bouton « Sauvegarde globale »). Seuls les enfants en flux sont regroupés : tout nouvel élément de chrome ajouté au body doit être `fixed`.
- Contraste en thème clair : `.cl-tag`, `.cl-ver`, `.cl-latest`, `.sf-version` ont des teintes assombries (≥ 4,9:1) ; `.sf-link` a `--bg-dark` pour fond.

### Modales de détail (Caserne, Experts)
Tiroir latéral de 400 px sur ordinateur, plein écran à onglets sous 820 px. Une section = `data-mtab="<clé>"` dans `#modal-body` + la clé déclarée dans `PAGES` de `modal-tabs.js` ; un panneau vide masque son onglet.
