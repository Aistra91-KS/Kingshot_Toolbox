#!/usr/bin/env python3
"""Générateur de pages — Kingshot Toolbox

    python3 tools/build_pages.py           écrit les pages
    python3 tools/build_pages.py --check   ne touche à rien, sort en erreur si une
                                           page servie diffère de ce que le gabarit produit

Pourquoi un générateur alors que le site n'a « aucun build » : les deux ne se
contredisent pas. Ce script tourne À LA MAIN, avant le commit, et sa sortie est
COMMITÉE. GitHub Pages sert exactement le même HTML statique et complet qu'avant —
la contrainte de MAP.md §9 (le contenu doit exister sans exécuter le JS) est
intacte. Ce qui change, c'est qu'on cesse d'écrire 17 fois la même chose à la main :
avant, toucher au gabarit d'une page boutique se payait 17 éditions et un oubli
possible à chaque fois.

Ce qui vit où :
  · tools/templates/<famille>.html   le gabarit, avec ses {{EMPLACEMENTS}}
  · tools/pages-<famille>.json       ce qui change d'une page à l'autre, et RIEN d'autre
  · tools/partials/<slug>.<rôle>.html   le cas particulier d'UNE page, gardé en HTML
                                        plutôt qu'en pavé au milieu du JSON
  · <famille>/<slug>.html            la sortie, commitée

Principe directeur : **ce qui se déduit ne se déclare pas.** Une boutique charge
shop-event.js parce qu'elle a un fichier d'événement ; elle affiche « Chest contents »
parce qu'elle est listée dans shopcalc_chests.json. Rien de tout cela n'est répété
dans le JSON, donc rien ne peut s'y désynchroniser.

Ne sont PAS générées : shop/items.html et shop/items-euro.html (deux pages uniques,
avec leur propre corps et leurs propres scripts) — les mettre dans un gabarit à deux
exemplaires ne rapporterait rien.
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


def exists(path):
    return os.path.exists(os.path.join(ROOT, path))


def fill(template, slots):
    """Remplace les {{EMPLACEMENTS}} et vérifie qu'il n'en reste aucun : un
    emplacement oublié partirait tel quel dans une page publiée."""
    out = template
    for key, value in slots.items():
        out = out.replace('{{%s}}' % key, value)
    reste = set(re.findall(r'\{\{(\w+)\}\}', out))
    if reste:
        raise SystemExit('emplacement(s) non remplis : %s' % ', '.join(sorted(reste)))
    return out


def partial(slug, role):
    """Bloc propre à UNE page. Aujourd'hui seul le Magasin du Théâtre en a : la
    paire « une URL par langue » (MAP.md §4) lui ajoute ses `hreflang`, la
    redirection de son bouton de langue et son optimiseur d'amulettes."""
    rel = 'tools/partials/%s.%s.html' % (slug, role)
    return read(rel) if exists(rel) else ''


# ---------------------------------------------------------------- boutiques

CHESTS = {s['slug'] for s in json.loads(read('data/shopcalc_chests.json'))}
EVENT_SHOPS = {s['slug'] for s in json.loads(read('data/shopcalc_events.json'))}


def parent(slug):
    """Le sommaire dont dépend une page boutique — fil d'Ariane, JSON-LD et outil
    surligné dans l'en-tête. Les boutiques d'événement sont listées par `event-roi`,
    les permanentes et les coffres par `shop_calc` (cf. MAP.md §13). Un parent qui ne
    liste plus sa page est un cul-de-sac : le lien remonte vers une grille où la page
    d'où l'on vient n'apparaît pas."""
    if slug in EVENT_SHOPS:
        return {'PARENT_HREF': 'event-roi',
                'PARENT_EN': 'Event shops', 'PARENT_FR': "Boutiques d'événement"}
    return {'PARENT_HREF': 'shop_calc', 'PARENT_EN': 'Shops', 'PARENT_FR': 'Boutiques'}


def est_evenement(slug):
    """Une boutique d'événement est une boutique qui A un fichier d'événement.
    Déduit, jamais déclaré : la page ne peut donc plus charger shop-event.js sans
    le conteneur qui l'accueille, ni l'inverse."""
    return exists('data/events/%s.json' % slug)


SECTIONS_BOUTIQUE = (
    '        <div class="db-section"><h2 data-i18n="bestDeals">Best deals</h2>'
    '<div class="sx-podium" id="sp-podium"></div></div>\n'
    '        <div class="db-section"><h2 data-i18n="allItems">All items</h2>'
    '<div id="sp-table"></div></div>\n')

SECTIONS_COFFRE = (
    '        <div class="db-section"><h2 data-i18n="bestPick">Best pick</h2>'
    '<div class="sx-podium" id="sp-podium"></div></div>\n'
    '        <div class="db-section"><h2 data-i18n="chestContent">Chest contents</h2>'
    '<div id="sp-table"></div></div>\n')

# La section événement se place APRÈS le tableau, dont elle compte le panier :
# on lit d'abord la boutique, on fait les comptes ensuite.
EVENT_SLOT = (
    '\n'
    "        <!-- Valorisation de l'événement (js/shop-event.js) : APRÈS le tableau, dont elle\n"
    "             compte le panier — on lit d'abord la boutique, on fait les comptes ensuite. -->\n"
    '        <div id="sp-event"></div>\n'
    '\n')


def build_shops():
    template = read('tools/templates/shop.html')
    rendus = {}
    for p in json.loads(read('tools/pages-shop.json')):
        slug = p['slug']
        par = parent(slug)
        rendus['shop/%s.html' % slug] = fill(template, {
            'SLUG': slug,
            **par,
            'TITLE': p['title'],
            'DESCRIPTION': p['description'],
            'NAME_EN': p['name']['EN'],
            'NAME_FR': p['name']['FR'],
            'INTRO_EN': p['intro']['EN'],
            'INTRO_FR': p['intro']['FR'],
            'HEAD_EXTRA': partial(slug, 'head'),
            'SECTIONS': SECTIONS_COFFRE if slug in CHESTS else SECTIONS_BOUTIQUE,
            'EVENT_SLOT': EVENT_SLOT if est_evenement(slug) else '',
            'PAGE_SCRIPT': partial(slug, 'page-script') or (
                "    <script>window.HDR_ACTIVE_HREF = '%s'; "
                "window.SHOP_SLUG = '%s';</script>\n" % (par['PARENT_HREF'], slug)),
            'EXTRA_SCRIPTS': (
                ('    <script src="js/shop-event.js"></script>\n' if est_evenement(slug) else '')
                + partial(slug, 'scripts')),
        })
    return rendus


# ------------------------------------------------------------- bâtiments BDD

# Deux familles de bâtiments, deux tableaux. Huit bâtiments montent jusqu'à l'ère
# Or Véritable : leurs paliers coûtent du TrueGold et du TG Trempé, et leur tableau
# est un partial écrit à la main (cf. la docstring de build_buildings). Les autres
# s'arrêtent aux niveaux ordinaires : ni TrueGold ni TG Trempé, mais la puissance
# que chaque niveau rapporte, et leur tableau sort de data/buildings_db.json.
#
# La famille se DÉDUIT de l'existence du partial, elle n'est pas déclarée dans
# pages-building.json : un bâtiment ne peut donc pas prétendre à des colonnes
# TrueGold sans le tableau qui les remplit, ni l'inverse.

INTRO_TG = ('Full per-level upgrade costs: TrueGold, Tempered TrueGold, '
            'resources and build time.')
INTRO_STD = ('Full per-level upgrade costs: resources, build time and the power '
             'each level adds. This building has no TrueGold levels.')

THEAD_TG = '\n'.join((
    '              <th scope="col" data-i18n="cLevel">Level</th>',
    '              <th scope="col" data-i18n="cReq">Requirements</th>',
    '              <th scope="col" class="num" data-i18n="cTG">TrueGold</th>',
    '              <th scope="col" class="num" data-i18n="cTTG">Tempered TG</th>',
    '              <th scope="col" class="num" data-i18n="cBread">Bread</th>',
    '              <th scope="col" class="num" data-i18n="cWood">Wood</th>',
    '              <th scope="col" class="num" data-i18n="cStone">Stone</th>',
    '              <th scope="col" class="num" data-i18n="cIron">Iron</th>',
    '              <th scope="col" data-i18n="cTime">Time</th>',
))

THEAD_STD = '\n'.join((
    '              <th scope="col" class="num" data-i18n="cLvl">Level</th>',
    '              <th scope="col" data-i18n="cReq">Requirements</th>',
    '              <th scope="col" class="num" data-i18n="cBread">Bread</th>',
    '              <th scope="col" class="num" data-i18n="cWood">Wood</th>',
    '              <th scope="col" class="num" data-i18n="cStone">Stone</th>',
    '              <th scope="col" class="num" data-i18n="cIron">Iron</th>',
    '              <th scope="col" data-i18n="cTime">Time</th>',
    '              <th scope="col" class="num" data-i18n="cPower">Power</th>',
))


def est_truegold(slug):
    return exists('tools/partials/%s.table.html' % slug)


def nav_batiments(pages, courant):
    """La nav suit l'ORDRE DU FICHIER : une entrée déplacée dans le JSON se déplace
    dans les 14 pages d'un coup. Les deux familles sont séparées par leur intitulé,
    parce qu'un joueur qui passe d'une pastille à l'autre ne trouve pas le même
    tableau des deux côtés — sans le dire, les colonnes changent sans prévenir."""
    out, famille = [], None
    for q in pages:
        tg = est_truegold(q['slug'])
        if tg != famille:
            famille = tg
            out.append('<span class="db-switch-label" data-en="%s" data-fr="%s">%s</span>'
                       % (('TrueGold', 'Or Véritable', 'TrueGold') if tg else
                          ("Before TrueGold", "Avant l'Or Véritable", 'Before TrueGold')))
        if q['slug'] == courant:
            out.append('<span class="db-switch-item active" data-en="%s" data-fr="%s">%s</span>'
                       % (q['name']['EN'], q['name']['FR'], q['name']['EN']))
        else:
            out.append('<a class="db-switch-item" href="database/buildings/%s"'
                       ' data-en="%s" data-fr="%s">%s</a>'
                       % (q['slug'], q['name']['EN'], q['name']['FR'], q['name']['EN']))
    return ''.join(out)


# -------------------------------------------- tableau des niveaux ordinaires

BDB = json.loads(read('data/buildings_db.json'))
BDB_PAR_ID = {b['id']: b for b in BDB['buildings']}
# Les prérequis de la base nomment les bâtiments en anglais ("Defense Tower Lv. 1").
# Le français vient de la base elle-même, jamais d'une table écrite à côté.
NOMS_FR = {b['name']['EN']: b['name']['FR'] for b in BDB['buildings']}


def fmt_qte(n):
    """Le format des tableaux bâtiments déjà publiés : 27M, 3.3M, 840k, 30.

    Vérifié sur les six bâtiments concernés — aucune valeur au-dessus de 1000 n'a
    de chiffre significatif en dessous de la centaine, donc la décimale unique ne
    perd rien. Un contrôle le redit à chaque génération plutôt que de le supposer."""
    n = int(n)
    if n == 0:
        return '—'
    for seuil, suffixe in ((1000000, 'M'), (1000, 'k')):
        if n >= seuil:
            if n % (seuil // 10):
                raise SystemExit(
                    'valeur %d trop fine pour le format %s des tableaux bâtiments' % (n, suffixe))
            return ('%.1f' % (n / seuil)).rstrip('0').rstrip('.') + suffixe
    return str(n)


def fmt_duree(sec, fr):
    """Durée écrite comme dans les tableaux déjà publiés : "1d 6h 14m" / "1j 6h 14m",
    les tranches nulles passées."""
    sec = int(sec)
    j, reste = divmod(sec, 86400)
    h, reste = divmod(reste, 3600)
    m, s = divmod(reste, 60)
    bouts = [(j, 'j' if fr else 'd'), (h, 'h'), (m, 'm'), (s, 's')]
    return ' '.join('%d%s' % (v, u) for v, u in bouts if v) or '0s'


def fmt_prerequis(lv, fr):
    """Le niveau de Centre-ville exigé, puis les autres bâtiments s'il y en a.

    Un prérequis que la base ne sait pas traduire s'arrête ici plutôt que de partir
    en anglais sur la page française. C'est le même piège que `blockerOf()` (MAP.md
    §12) : les `req` nomment un bâtiment par son libellé anglais, et un renommage
    qui oublie de les suivre ne se voit nulle part."""
    out = []
    if lv.get('tc'):
        out.append('%s %s %d' % ('Centre-ville' if fr else 'Town Center',
                                 'Niv.' if fr else 'Lv.', lv['tc']))
    for r in lv.get('req') or []:
        if fr:
            # "Defense Tower Lv. 1" -> "Tour de défense Niv. 1"
            nom, sep, niveau = r.partition(' Lv. ')
            if nom not in NOMS_FR:
                raise SystemExit(
                    'prérequis « %s » sans nom français dans data/buildings_db.json' % nom)
            r = '%s Niv. %s' % (NOMS_FR[nom], niveau) if sep else NOMS_FR[nom]
        out.append(r)
    return ', '.join(out) or '—'


def table_standard(slug):
    """Le tableau des niveaux 1 → max, reconstruit depuis data/buildings_db.json.

    Contrairement aux huit tableaux TrueGold, gardés en partial parce que leurs
    libellés français n'existent nulle part ailleurs, ici la base porte les deux
    langues : le HTML se déduit donc entièrement, et une correction de données se
    répercute d'une seule commande."""
    b = BDB_PAR_ID[slug]
    lignes = ['<tbody>']
    for lv in b['levels']:
        req_en, req_fr = fmt_prerequis(lv, False), fmt_prerequis(lv, True)
        tps_en, tps_fr = fmt_duree(lv['time'], False), fmt_duree(lv['time'], True)
        puiss = int(lv['power'])
        lignes += [
            '        <tr>',
            '          <td class="num c-lbl">%d</td>' % lv['level'],
            '          <td class="c-req" data-en="%s" data-fr="%s">%s</td>' % (req_en, req_fr, req_en),
            '          <td class="num">%s</td>' % fmt_qte(lv['bread']),
            '          <td class="num">%s</td>' % fmt_qte(lv['wood']),
            '          <td class="num">%s</td>' % fmt_qte(lv['stone']),
            '          <td class="num">%s</td>' % fmt_qte(lv['iron']),
            '          <td class="c-time" data-en="%s" data-fr="%s">%s</td>' % (tps_en, tps_fr, tps_en),
            '          <td class="num" data-en="%s" data-fr="%s">%s</td>'
            % ('{:,}'.format(puiss), '{:,}'.format(puiss).replace(',', ' '),
               '{:,}'.format(puiss)),
            '        </tr>',
        ]
    lignes.append('      </tbody>')
    return '\n'.join(lignes)


def build_buildings():
    """Les 9 pages de bâtiments ne différaient que de 24 lignes sur 654. Le gabarit
    en reprend 104 ; le reste est ou bien déduit (la nav, où le bâtiment courant
    devient un `<span>` au lieu d'un lien), ou bien le tableau de niveaux de la page,
    gardé tel quel dans son partial.

    Le tableau N'EST PAS régénéré depuis `data/truegold_db.json` (`dbDataRaw`), qui
    porte pourtant les mêmes chiffres : les libellés FR des prérequis et des durées
    n'existent que dans le HTML, et les reconstruire risquerait de modifier en
    silence des données publiées. C'est un chantier suivant, pas un effet de bord
    de celui-ci.

    `database/buildings/index.html` n'est pas générée : c'est le sommaire, il n'a ni
    tableau ni nav de bâtiments."""
    template = read('tools/templates/building.html')
    pages = json.loads(read('tools/pages-building.json'))
    rendus = {}
    for p in pages:
        tg = est_truegold(p['slug'])
        rendus['database/buildings/%s.html' % p['slug']] = fill(template, {
            'SLUG': p['slug'],
            'TITLE': p['title'],
            'DESCRIPTION': p['description'],
            'NAME_EN': p['name']['EN'],
            'NAME_FR': p['name']['FR'],
            'INTRO_KEY': 'bldgIntro' if tg else 'bldgIntroStd',
            'INTRO_EN': INTRO_TG if tg else INTRO_STD,
            'THEAD': THEAD_TG if tg else THEAD_STD,
            'NAV': nav_batiments(pages, p['slug']),
            'TABLE': (partial(p['slug'], 'table').rstrip('\n') if tg
                      else table_standard(p['slug'])),
        })
    return rendus


FAMILLES = [build_shops, build_buildings]


# ------------------------------------------------------- jumeau français

# La paire « une URL par langue » (MAP.md §4) : deux fichiers pour une même page,
# dont un seul est généré. L'anglaise sort du gabarit, la française est écrite à la
# main — texte français en dur, `<base href="../../">`, hreflang inversés : elle ne
# rentre pas dans le gabarit sans y ajouter une dimension de langue, ce qui n'a pas
# lieu d'être tant que le pilote ne concerne qu'une page.
#
# Le risque est donc réel : une modification du gabarit passe sur l'anglaise et pas
# sur la française, sans que rien ne le signale. On ne peut pas comparer les deux
# pages ligne à ligne (elles diffèrent légitimement), mais on peut comparer ce dont
# la DÉRIVE CASSE VRAIMENT la page : la liste des scripts et des feuilles de style.
# C'est exactement ce qui a déjà dû être rattrapé à la main deux fois.
JUMEAUX = [('shop/theater-shop.html', 'fr/shop/theater-shop.html')]


def check_jumeaux():
    ecarts = []
    for en, fr in JUMEAUX:
        if not (exists(en) and exists(fr)):
            continue
        for quoi, motif in (('scripts', r'<script src="js/([\w-]+)\.js"'),
                            ('feuilles de style', r'<link rel="stylesheet" href="css/([\w-]+)\.css"')):
            a, b = re.findall(motif, read(en)), re.findall(motif, read(fr))
            if a != b:
                ecarts.append('%s vs %s : %s\n    anglaise : %s\n    française: %s'
                              % (en, fr, quoi, a, b))
    return ecarts




def main():
    check = '--check' in sys.argv[1:]
    rendus = {}
    for f in FAMILLES:
        rendus.update(f())

    ecrits, differents = [], []
    for rel, contenu in sorted(rendus.items()):
        actuel = read(rel) if exists(rel) else None
        if actuel == contenu:
            continue
        if check:
            differents.append(rel)
        else:
            with open(os.path.join(ROOT, rel), 'w', encoding='utf-8') as f:
                f.write(contenu)
            ecrits.append(rel)

    ecarts = check_jumeaux()

    if check:
        if ecarts:
            print('Le jumeau français a dérivé de son anglaise :')
            for e in ecarts:
                print('  ' + e)
            print()
        if differents:
            print('Ces pages ne correspondent plus à leur gabarit :')
            for d in differents:
                print('  ' + d)
            print('\nRelance `python3 tools/build_pages.py`, puis commite la sortie.')
        if differents or ecarts:
            return 1
        print('%d pages conformes à leur gabarit, jumeau français aligné.' % len(rendus))
        return 0

    for e in ecarts:
        print('ATTENTION — le jumeau français a dérivé : ' + e)
    print('%d pages générées, %d réécrites.' % (len(rendus), len(ecrits)))
    for e in ecrits:
        print('  ' + e)
    return 0


if __name__ == '__main__':
    sys.exit(main())
