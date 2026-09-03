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
        rendus['shop/%s.html' % slug] = fill(template, {
            'SLUG': slug,
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
                "    <script>window.HDR_ACTIVE_HREF = 'shop_calc'; "
                "window.SHOP_SLUG = '%s';</script>\n" % slug),
            'EXTRA_SCRIPTS': (
                ('    <script src="js/shop-event.js"></script>\n' if est_evenement(slug) else '')
                + partial(slug, 'scripts')),
        })
    return rendus


# ------------------------------------------------------------- bâtiments BDD

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
        # La nav suit l'ORDRE DU FICHIER : une entrée déplacée dans le JSON se
        # déplace dans les 8 pages d'un coup.
        nav = ''.join(
            ('<span class="db-switch-item active" data-en="%s" data-fr="%s">%s</span>'
             if q['slug'] == p['slug'] else
             '<a class="db-switch-item" href="database/buildings/%s"' % q['slug']
             + ' data-en="%s" data-fr="%s">%s</a>')
            % (q['name']['EN'], q['name']['FR'], q['name']['EN'])
            for q in pages)
        rendus['database/buildings/%s.html' % p['slug']] = fill(template, {
            'SLUG': p['slug'],
            'TITLE': p['title'],
            'DESCRIPTION': p['description'],
            'NAME_EN': p['name']['EN'],
            'NAME_FR': p['name']['FR'],
            'NAV': nav,
            'TABLE': partial(p['slug'], 'table').rstrip('\n'),
        })
    return rendus


FAMILLES = [build_shops, build_buildings]


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

    if check:
        if differents:
            print('Ces pages ne correspondent plus à leur gabarit :')
            for d in differents:
                print('  ' + d)
            print('\nRelance `python3 tools/build_pages.py`, puis commite la sortie.')
            return 1
        print('%d pages conformes à leur gabarit.' % len(rendus))
        return 0

    print('%d pages générées, %d réécrites.' % (len(rendus), len(ecrits)))
    for e in ecrits:
        print('  ' + e)
    return 0


if __name__ == '__main__':
    sys.exit(main())
