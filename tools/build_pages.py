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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync_drawer

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
    paire « une URL par langue » (MAP.md §4) lui ajoute ses `hreflang`, le lien
    visible vers sa jumelle française, la redirection de son bouton de langue et
    son optimiseur d'amulettes."""
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
    drawer = sync_drawer.bloc_complet('EN')
    rendus = {}
    for p in json.loads(read('tools/pages-shop.json')):
        slug = p['slug']
        par = parent(slug)
        rendus['shop/%s.html' % slug] = fill(template, {
            'DRAWER': drawer,
            'SLUG': slug,
            **par,
            # Réserves de hauteur propres aux boutiques d'événement (css/shop.css) :
            # leur en-tête porte en plus le champ de monnaie et le panier.
            'PAGE_CLASS': ' sx-page-event' if slug in EVENT_SHOPS else '',
            'TITLE': p['title'],
            'DESCRIPTION': p['description'],
            'NAME_EN': p['name']['EN'],
            'NAME_FR': p['name']['FR'],
            'INTRO_EN': p['intro']['EN'],
            'INTRO_FR': p['intro']['FR'],
            'HEAD_EXTRA': partial(slug, 'head'),
            'LANG_ALT': partial(slug, 'lang-alt'),
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
    drawer = sync_drawer.bloc_complet('EN')
    rendus = {}
    for p in pages:
        tg = est_truegold(p['slug'])
        rendus['database/buildings/%s.html' % p['slug']] = fill(template, {
            'DRAWER': drawer,
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


# ------------------------------------------------------------- héros BDD

HEROES = json.loads(read('data/heroes_db.json'))
TRAP = json.loads(read('data/beartrap_joiners_db.json'))['byGeneration']

# Le slug vient du nom, mais il est FIGÉ ici : c'est une adresse indexée, et un
# renommage en jeu ne doit pas la changer sans qu'on le décide. Deux cas que la
# dérivation automatique ne devinerait pas : « Long Fei » garde son tiret, et
# l'esperluette de « Wee & Woo » tombe, elle n'a rien à faire dans une URL.
SLUGS = {
    '0001': 'forrest',  '0002': 'seth',     '0003': 'edwin',    '0004': 'olive',
    '0005': 'quinn',    '0006': 'howard',   '0007': 'diana',    '0008': 'gordon',
    '0009': 'chenko',   '0010': 'fahd',     '0011': 'yeonwoo',  '0012': 'amane',
    '0013': 'saul',     '0014': 'helga',    '0015': 'amadeus',  '0016': 'jabel',
    '0017': 'hilde',    '0018': 'marlin',   '0019': 'zoe',      '0020': 'jaeger',
    '0021': 'petra',    '0022': 'eric',     '0023': 'margot',   '0024': 'alcar',
    '0025': 'rosa',     '0026': 'thrud',    '0027': 'long-fei', '0028': 'vivian',
    '0029': 'sophia',   '0030': 'triton',   '0031': 'yang',     '0032': 'wee-woo',
    '0033': 'charles',  '0034': 'ava',      '0035': 'diego',    '0036': 'liz',
    '0037': 'luna',
}

# `rarity` vaut « Rare », « Epic » et « legendary », la dernière en minuscule. On vit
# avec — js/caserne.js le fait depuis le début, et une correction de masse toucherait
# des sauvegardes locales indexées par id. On normalise donc à la lecture.
RARETE = {
    'rare':      ({'EN': 'Rare', 'FR': 'Rare'}, 1),
    'epic':      ({'EN': 'Epic', 'FR': 'Épique'}, 2),
    'legendary': ({'EN': 'Legendary', 'FR': 'Légendaire'}, 3),
}
# Les libellés de troupe sont ceux de la Caserne, sans l'émoji que ses filtres y accolent.
TROUPE = {
    'infantry': {'EN': 'Infantry', 'FR': 'Infanterie'},
    'cavalry':  {'EN': 'Cavalry', 'FR': 'Cavalerie'},
    'archer':   {'EN': 'Archers', 'FR': 'Archers'},
}

GEN = {'EN': 'Gen.', 'FR': 'Gén.'}
# Les icônes de compétence cherchées sur le disque et absentes, comptées pendant la
# génération. Sans ce relevé, 91 icônes de conquête manquantes ne se voyaient qu'en
# ouvrant une page : le générateur posait sa réserve et se taisait.
ICONES_MANQUANTES = set()
# Les deux familles de compétences partagent img/skills/, nommé par le nom anglais.
# Deux noms existent des deux côtés (Margot « Ambush » et Yang « Ambush », Hilde
# « Intimidation » et Charles « Intimidation ») : sans rien, la fiche de conquête
# sert l'icône d'une compétence d'EXPÉDITION d'un autre héros. La capture de
# conquête va donc dans img/skills/conquest/, lu en premier pour ce côté-là. Ce
# relevé garde les noms qui se partagent encore une image, faute de cette capture :
# une image fausse ne se voit pas comme une image manquante.
ICONES_PARTAGEES = set()
RX_X = re.compile(r'([A-Za-z]?)X(%?)(?![A-Za-z])')


def echap(txt):
    return txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def attr(txt):
    return echap(txt).replace('"', '&quot;')


def parts(valeur):
    """« (2%,3%) » vaut deux valeurs, le reste une seule."""
    m = re.match(r'^\((.*)\)$', valeur)
    return [v.strip() for v in m.group(1).split(',')] if m else [valeur.strip()]


def fill_effect(texte, valeur):
    """Remplace les X par la valeur du niveau, de la MÊME lecture que caserneFillX()
    (js/caserne.js) et que js/db-heroes.js. Les trois doivent rester identiques : une
    lecture qui diverge affiche une valeur à un endroit et pas à l'autre.

    Un X collé à une lettre reste intact, celui d'EXP ou de max n'est pas une valeur.
    La lettre qui précède est capturée plutôt que testée en arrière, parce que Safari
    avant la 16.4 ne connaît pas le lookbehind."""
    vals = parts(valeur)
    etat = {'i': 0}

    def remplace(m):
        if m.group(1):
            return m.group(0)
        v = vals[min(etat['i'], len(vals) - 1)]
        etat['i'] += 1
        return '<b class="hb-v">%s</b>' % echap(v)

    return RX_X.sub(remplace, echap(texte))


def rang_piege(hid):
    """Le rang du héros au Piège à Ours, génération par génération, regroupé en
    tranches de rang constant. `data/beartrap_joiners_db.json` liste les rangs D
    explicitement et couvre huit générations : un héros change parfois de rang en
    route, et donner un rang unique serait faux pour la moitié des joueurs."""
    par_gen = {}
    for gen in sorted(TRAP, key=int):
        for rang, ids in TRAP[gen].items():
            if hid in ids:
                par_gen[int(gen)] = rang
    if not par_gen:
        return []
    tranches = []
    for g in sorted(par_gen):
        if tranches and tranches[-1][0] == par_gen[g] and tranches[-1][2] == g - 1:
            tranches[-1][2] = g
        else:
            tranches.append([par_gen[g], g, g])
    return tranches


def phrase_piege(hid, lang):
    tranches = rang_piege(hid)
    if not tranches:
        return None
    tete = {'EN': 'Bear Trap joiner tier: ', 'FR': 'Rang de joiner au Piège à Ours : '}[lang]
    if len(tranches) == 1:
        rang, debut, _ = tranches[0]
        return tete + {'EN': '%s from %s %d on.', 'FR': '%s dès la %s %d.'}[lang] % (
            rang, GEN[lang], debut)
    bouts = []
    for rang, debut, fin in tranches:
        plage = ('%s %d' % (GEN[lang], debut) if debut == fin
                 else '%s %d-%d' % (GEN[lang], debut, fin))
        bouts.append('%s %s %s' % (rang, {'EN': 'in', 'FR': 'en'}[lang], plage))
    return tete + ', '.join(bouts) + '.'


def enumere(noms, lang):
    """« A, B et C » : la dernière virgule tombe au profit du « et »."""
    if len(noms) == 1:
        return noms[0]
    return {'EN': ' and ', 'FR': ' et '}[lang].join([', '.join(noms[:-1]), noms[-1]])


def widget_en(h):
    """Le nom anglais du widget, pour « the %s widget ». Celui de Zoe s'appelle déjà
    « The Unrighteous » : sans ce retrait, la page disait « the The Unrighteous »."""
    n = h['widget']['name']['EN']
    return n[4:] if n.startswith('The ') else n


def intro(h, lang):
    """L'introduction cite chaque compétence par son nom : c'est le texte que lit
    Google, et c'est ce qu'un joueur cherche quand il tape le nom d'une compétence
    sans savoir de quel héros elle vient."""
    conq = enumere([s['name'][lang] for s in h['conquestSkills']], lang)
    expe = enumere([s['name'][lang] for s in h['skills']], lang)
    if lang == 'EN':
        txt = ("%s's full skill sheet: conquest skills %s, expedition skills %s"
               % (h['name'], conq, expe))
        if h.get('widget'):
            txt += ', and the %s widget' % widget_en(h)
        return txt + '. Every value, from level 1 to level 5.'
    txt = ('La fiche complète de %s : les compétences de conquête %s, les compétences '
           "d'expédition %s" % (h['name'], conq, expe))
    if h.get('widget'):
        txt += ', et le widget %s' % h['widget']['name']['FR']
    return txt + '. Toutes les valeurs, du niveau 1 au niveau 5.'


def titre(h):
    """Le titre mène par ce que la page apporte, comme les pages boutique (MAP.md §13).
    « Values » tombe quand le héros n'a pas de widget : promettre une section absente
    est le seul vrai défaut d'un titre.

    Le contrôle de longueur tourne à chaque génération plutôt que de faire confiance
    aux noms d'aujourd'hui : Google coupe vers 60 caractères, et le titre complet,
    « | Kingshot Toolbox » compris, doit tenir en 70 (MAP.md §9). « Kingshot » n'est
    pas répété en tête, le suffixe le porte déjà."""
    if h.get('widget'):
        t = '%s Skills - Conquest, Expedition & Widget' % h['name']
    else:
        t = '%s Skills - Conquest & Expedition Values' % h['name']
    if len(t) > 51:
        raise SystemExit('titre trop long pour %s (%d caractères) : %s' % (h['name'], len(t), t))
    return echap(t)


def description(h):
    """Courte, et distincte de l'introduction : celle-ci cite chaque compétence par son
    nom, ce qui est bon dans la page et trop long pour un extrait de résultat. La
    maison tient entre 119 et 175 caractères."""
    w = ' and the %s widget' % widget_en(h) if h.get('widget') else ''
    d = ('%s in Kingshot: %d conquest skills, %d expedition skills%s, with every '
         'effect and every value from level 1 to 5.'
         % (h['name'], len(h['conquestSkills']), len(h['skills']), w))
    if len(d) > 160:
        raise SystemExit('meta description trop longue pour %s (%d caractères)'
                         % (h['name'], len(d)))
    return attr(d)


def sous_titre(h, lang, suffixe='', gen=True):
    """`gen=False` au sommaire : la génération y est déjà l'intertitre de la section,
    la répéter sur chaque carte n'apprendrait rien."""
    rar = RARETE[h['rarity'].lower()][0][lang]
    tr = TROUPE[h['troopType'].lower()][lang]
    if not gen:
        return '%s &middot; %s%s' % (rar, tr, suffixe)
    return '%s &middot; %s %d &middot; %s%s' % (rar, GEN[lang], h['generation'], tr, suffixe)


def controle_niveaux(nom_heros, s):
    """Cinq niveaux, ni plus ni moins. Le script de page sait borner un tableau plus
    court, mais il le ferait en silence : une compétence à trois valeurs afficherait
    la même au niveau 3, 4 et 5 sans que rien ne le dise. Le contrôle tourne à la
    génération, là où la correction se fait."""
    n = len(s.get('levels') or [])
    if n != 5:
        raise SystemExit('%s, compétence « %s » : %d niveau(x) au lieu de 5'
                         % (nom_heros, s['name']['EN'], n))


def icone_competence(nom_en, cote):
    """Le chemin de l'icône d'une compétence. La conquête regarde d'abord dans
    img/skills/conquest/ : c'est là que se range la capture d'un nom que porte aussi
    une compétence d'expédition, sans quoi les deux fiches montreraient la même."""
    if cote == 'conq':
        propre = 'img/skills/conquest/%s.webp' % nom_en
        if exists(propre):
            return propre
    return 'img/skills/%s.webp' % nom_en


def carte_competence(s, cote):
    """Une carte de l'écran de compétences. L'effet emporte ses deux gabarits et ses
    cinq valeurs en attributs, et le HTML servi est rendu au NIVEAU 5 en anglais : la
    page dit déjà tout avant que js/db-heroes.js n'applique la langue et le niveau.

    L'icône est cherchée SUR LE DISQUE, jamais déclarée : une compétence de conquête
    dont la capture n'est pas encore faite garde sa place, sans image cassée. Les
    noms portés par les deux familles passent par img/skills/conquest/ (cf.
    ICONES_PARTAGEES)."""
    icone = icone_competence(s['name']['EN'], cote)
    if not exists(icone):
        ICONES_MANQUANTES.add(icone)
    img = ('<img class="hb-ico" src="%s" alt="" onerror="this.remove()">' % attr(icone)
           if exists(icone) else '<span class="hb-ico hb-ico-vide" aria-hidden="true"></span>')
    return '\n'.join((
        '            <div class="hb-card hb-%s">' % cote,
        '              %s' % img,
        '              <div class="hb-card-body">',
        '                <span class="hb-name" data-en="%s" data-fr="%s">%s</span>'
        % (attr(s['name']['EN']), attr(s['name']['FR']), echap(s['name']['EN'])),
        '                <p class="hb-eff" data-tpl-en="%s" data-tpl-fr="%s" data-levels="%s">%s</p>'
        % (attr(s['effect']['EN']), attr(s['effect']['FR']),
           attr('|'.join(s['levels'])), fill_effect(s['effect']['EN'], s['levels'][4])),
        '              </div>',
        '            </div>',
    ))


def colonne(titre_en, titre_fr, classe, skills, cote):
    return '\n'.join(
        ['          <div class="hb-col %s">' % classe,
         '            <h2 class="hb-col-title" data-en="%s" data-fr="%s">%s</h2>'
         % (titre_en, titre_fr, titre_en)]
        + [carte_competence(s, cote) for s in skills]
        + ['          </div>'])


def ecran(h):
    """Les trois colonnes de l'écran de compétences : conquête à gauche, portrait au
    centre, expédition à droite. L'ordre du document est celui de la lecture une fois
    la grille tombée sous 980 px, le portrait remontant en tête par `order`."""
    out = ['        <div class="hb-screen" data-rarity="%s">' % h['rarity'].lower(),
           colonne('Conquest', 'Conquête', 'hb-col-conq', h['conquestSkills'], 'conq'),
           '          <div class="hb-mid">',
           '            <div class="hb-frame"><img class="hb-portrait" src="img/heroes/%s.webp" alt="" onerror="this.remove()"></div>'
           % attr(h['name']),
           '            <p class="hb-sub" data-en="%s" data-fr="%s">%s</p>'
           % (sous_titre(h, 'EN'), sous_titre(h, 'FR'), sous_titre(h, 'EN')),
           '            <div class="hb-levels" role="group" aria-labelledby="hb-lv-label">',
           '              <span class="hb-lv-label" id="hb-lv-label" data-en="Skill level" data-fr="Niveau de compétence">Skill level</span>',
           '              <div class="hb-lv-row">']
    for n in range(1, 6):
        out.append('                <button type="button" class="hb-lv" data-lv="%d" aria-pressed="%s">%d</button>'
                   % (n, 'true' if n == 5 else 'false', n))
    out += ['              </div>',
            # Le clic réécrit toutes les valeurs de la page, loin du bouton qui a le
            # focus : sans ce message, rien ne le dit à un lecteur d'écran (WCAG 4.1.3).
            '              <span class="db-sr" role="status" aria-live="polite" id="hb-lv-say"></span>',
            '            </div>',
            '          </div>',
            colonne('Expedition', 'Expédition', 'hb-col-expe', h['skills'], 'expe'),
            '        </div>']
    return '\n'.join(out)


def cellule(valeur):
    """Une valeur à deux nombres se lit « 60% · 10% » dans un tableau : les parenthèses
    du fichier sont une notation de stockage, pas quelque chose à montrer au joueur."""
    return ' &middot; '.join(echap(v) for v in parts(valeur))


def table_niveaux(skills, cle, titre_en, titre_fr, col_en, col_fr, entetes, section=True):
    """Une ligne par compétence, une colonne par niveau. Le conteneur qui défile porte
    `tabindex` et un `role="region"` nommé par le titre qui le précède : sans quoi un
    tableau plus large que l'écran est inatteignable au clavier."""
    pad = '        ' if section else '            '
    out = []
    if section:
        out += [pad + '<div class="db-section">',
                pad + '  <h2 id="%s" data-en="%s" data-fr="%s">%s</h2>'
                % (cle, titre_en, titre_fr, titre_en)]
    out += [pad + '  <div class="table-container" tabindex="0" role="region" aria-labelledby="%s">' % cle,
            pad + '    <table class="db-table">',
            pad + '      <thead><tr><th scope="col" data-en="%s" data-fr="%s">%s</th>'
            % (col_en, col_fr, col_en)]
    for n, (en, fr) in enumerate(entetes, 1):
        out.append(pad + '        <th scope="col" class="num" data-lv="%d" data-en="%s" data-fr="%s">%s</th>'
                   % (n, en, fr, en))
    out += [pad + '      </tr></thead>', pad + '      <tbody>']
    for s in skills:
        out.append(pad + '        <tr>')
        out.append(pad + '          <th scope="row" data-en="%s" data-fr="%s">%s</th>'
                   % (attr(s['name']['EN']), attr(s['name']['FR']), echap(s['name']['EN'])))
        for n, v in enumerate(s['levels'], 1):
            out.append(pad + '          <td class="num" data-lv="%d">%s</td>' % (n, cellule(v)))
        out.append(pad + '        </tr>')
    out += [pad + '      </tbody>', pad + '    </table>', pad + '  </div>']
    if section:
        out.append(pad + '</div>')
    return '\n'.join(out)


NIVEAUX = [('Lv. %d' % n, 'Niv. %d' % n) for n in range(1, 6)]
NIVEAUX_WIDGET = [('Lv. %d-%d' % (2 * n + 1, 2 * n + 2), 'Niv. %d-%d' % (2 * n + 1, 2 * n + 2))
                  for n in range(5)]


def bloc_widget(h):
    """Les 12 Rares et Épiques n'ont pas de widget : la section disparaît, sans une
    ligne pour le dire (décision d'Aistra, comportement de Lordrush).

    L'effet de conquête progresse aux niveaux impairs du widget, celui d'expédition aux
    pairs : c'est la règle de getWidgetEffectValue() dans js/caserne.js, et c'est ce que
    disent les cinq colonnes « Niv. 1-2 » à « Niv. 9-10 ». Les deux effets partagent le
    sélecteur de niveau de la page, leurs cinq valeurs se lisant dans le même ordre.

    La présence d'un widget se DÉDUIT de la donnée, elle n'est pas déclarée à côté."""
    w = h.get('widget')
    if not w:
        return ''
    effets = [(w['effectConquest'], 'Conquest', 'Conquête'),
              (w['effectExpe'], 'Expedition', 'Expédition')]
    ico = 'img/widgetname/%s.webp' % w['name']['EN']
    out = ['        <div class="db-section">',
           '          <h2 id="tbl-widget" data-en="Widget" data-fr="Widget">Widget</h2>',
           '          <div class="m-block">',
           '            <div class="m-block-head">']
    if exists(ico):
        out.append('              <img class="m-ico" src="%s" alt="" onerror="this.remove()">' % attr(ico))
    out += ['              <div>',
            '                <div class="m-block-name" data-en="%s" data-fr="%s">%s</div>'
            % (attr(w['name']['EN']), attr(w['name']['FR']), echap(w['name']['EN'])),
            '                <div class="m-block-tag" data-en="Exclusive gear" data-fr="Équipement exclusif">Exclusive gear</div>',
            '              </div>',
            '            </div>']
    for eff, lab_en, lab_fr in effets:
        i = 'img/widgetskill/%s.webp' % eff['name']['EN']
        out.append('            <div class="hb-weff">')
        if exists(i):
            out.append('              <img class="m-ico" src="%s" alt="" onerror="this.remove()">' % attr(i))
        out += ['              <div>',
                '                <span class="hb-name" data-en="%s" data-fr="%s">%s</span>'
                % (attr(eff['name']['EN']), attr(eff['name']['FR']), echap(eff['name']['EN'])),
                '                <span class="m-block-tag" data-en="%s" data-fr="%s">%s</span>'
                % (lab_en, lab_fr, lab_en),
                '                <p class="hb-eff m-block-desc" data-tpl-en="%s" data-tpl-fr="%s" data-levels="%s">%s</p>'
                % (attr(eff['description']['EN']), attr(eff['description']['FR']),
                   attr('|'.join(eff['levels'])),
                   fill_effect(eff['description']['EN'], eff['levels'][4])),
                '              </div>',
                '            </div>']
    out.append(table_niveaux([{'name': e['name'], 'levels': e['levels']} for e, _, _ in effets],
                             'tbl-widget', '', '', 'Effect', 'Effet', NIVEAUX_WIDGET,
                             section=False))
    out += ['          </div>', '        </div>']
    return '\n'.join(out)


def bloc_piege(h):
    """Le rang du héros au Piège à Ours, et le lien vers le calculateur. La phrase et
    le lien sont deux éléments : le script réécrit un `textContent` au changement de
    langue, et un lien posé dedans n'y survivrait pas."""
    en, fr = phrase_piege(h['id'], 'EN'), phrase_piege(h['id'], 'FR')
    if not en:
        return ''
    return ('        <p class="hb-trap"><span data-en="%s" data-fr="%s">%s</span> '
            '<a href="beartrap_calc" data-en="Bear Trap calculator &rarr;" '
            'data-fr="Calculateur Piège à Ours &rarr;">Bear Trap calculator &rarr;</a></p>'
            % (attr(en), attr(fr), echap(en)))


def tri_heros(h):
    """Rareté décroissante, puis génération décroissante, puis nom : l'ordre de
    `sortHeroes(..., 'rarity-desc')` dans js/caserne.js. Le sommaire et la nav des
    fiches rangent d'abord par génération (`sections_index`, `nav_heros`) et
    n'appliquent ce tri qu'à génération égale."""
    return (-RARETE[h['rarity'].lower()][1], -h['generation'], h['name'])


def a_une_fiche(h):
    """Un héros a une fiche quand son relevé de conquête est fait. Déduit de la donnée,
    jamais déclaré : le jour où `conquestSkills` arrive, la fiche suit."""
    return bool(h.get('conquestSkills'))


TROUPE_NAV = {
    'infantry': ('Infantry heroes', "Héros d'infanterie"),
    'cavalry':  ('Cavalry heroes', 'Héros de cavalerie'),
    'archer':   ('Archer heroes', 'Héros archers'),
}
RARETE_NAV = {
    'rare': ('Rare heroes', 'Héros rares'),
    'epic': ('Epic heroes', 'Héros épiques'),
}


def groupes_nav(h):
    """Les groupes de la nav d'une fiche, du plus proche au plus lointain : même classe
    de troupe, même génération, le reste. Un héros rare ou épique ouvre sur sa rareté,
    puisqu'il se compare d'abord aux autres rares ou épiques. Chaque héros ne figure
    que dans le premier groupe qui le prend ; un groupe vide disparaît."""
    tr, rar, g = h['troopType'].lower(), h['rarity'].lower(), h['generation']
    groupes = []
    if rar in RARETE_NAV:
        groupes.append((RARETE_NAV[rar], lambda q: q['rarity'].lower() == rar))
    groupes.append((TROUPE_NAV[tr], lambda q: q['troopType'].lower() == tr))
    groupes.append((('Generation %d heroes' % g, 'Héros de génération %d' % g),
                    lambda q: q['generation'] == g))
    groupes.append((('Other heroes', 'Autres héros'), lambda q: True))
    return groupes


def nav_heros(courant):
    """Les héros répartis par `groupes_nav`, la génération la plus récente en tête de
    chaque groupe, puis `tri_heros`. Le héros courant reste en <span> dans son premier
    groupe : c'est le repère « vous êtes ici ». Seuls les héros qui ONT une fiche y
    figurent : un lien vers une page qui n'existe pas est un 404, et une pastille
    morte n'apprend rien."""
    h = next(q for q in HEROES if q['id'] == courant)
    restants = sorted((q for q in HEROES if a_une_fiche(q)),
                      key=lambda q: (-q['generation'], tri_heros(q)))
    out = []
    for (en, fr), garde in groupes_nav(h):
        pris = [q for q in restants if garde(q)]
        if not pris or pris == [h]:
            continue
        restants = [q for q in restants if q not in pris]
        out.append('<span class="db-switch-label" data-en="%s" data-fr="%s">%s</span>'
                   % (attr(en), attr(fr), echap(en)))
        for q in pris:
            nom = echap(q['name'])
            if q['id'] == courant:
                out.append('<span class="db-switch-item active">%s</span>' % nom)
            else:
                out.append('<a class="db-switch-item" href="database/heroes/%s">%s</a>'
                           % (SLUGS[q['id']], nom))
    return ''.join(out)


CARTE = ('      <%(balise)s class="db-card hb-card-idx%(soon)s" data-rarity="%(rar)s"%(href)s>\n'
         '        <img class="db-card-img" src="img/heroes/%(img)s.webp" alt="" onerror="this.remove()">\n'
         '        <span class="db-card-text">\n'
         '          <span class="db-card-name">%(nom)s</span>\n'
         '          <span class="db-card-sub" data-en="%(sub_en)s" data-fr="%(sub_fr)s">%(sub_en)s</span>\n'
         '        </span>\n'
         '      </%(balise)s>\n')


def carte_index(h):
    """Un héros dont le relevé de conquête manque reste au sommaire, en carte grisée et
    sans lien : c'est ce qui permet de publier sans attendre les 37."""
    fiche = a_une_fiche(h)
    bientot = {'EN': ' &middot; Skills coming soon',
               'FR': ' &middot; Compétences bientôt disponibles'}
    return CARTE % {
        'balise': 'a' if fiche else 'div',
        'soon': '' if fiche else ' hb-card-soon',
        'href': ' href="database/heroes/%s"' % SLUGS[h['id']] if fiche else '',
        'rar': h['rarity'].lower(),
        'img': attr(h['name']),
        'nom': echap(h['name']),
        'sub_en': sous_titre(h, 'EN', '' if fiche else bientot['EN'], gen=False),
        'sub_fr': sous_titre(h, 'FR', '' if fiche else bientot['FR'], gen=False),
    }


def sections_index():
    """Une section par génération, la plus récente en haut : c'est elle que le joueur
    vient chercher. Dans une génération, l'ordre reste celui de `tri_heros` (rareté,
    puis nom), qui ne départage vraiment que la génération 1, la seule à mêler les
    trois raretés. Les générations se lisent dans la donnée : un héros de génération 9
    ouvre sa section sans second geste."""
    out = []
    for g in sorted({h['generation'] for h in HEROES}, reverse=True):
        heros = sorted((h for h in HEROES if h['generation'] == g), key=tri_heros)
        en, fr = 'Generation %d' % g, 'Génération %d' % g
        out.append('        <section class="db-section" aria-labelledby="gen-%d">\n'
                   '          <h2 id="gen-%d" data-en="%s" data-fr="%s">%s</h2>\n'
                   '          <div class="db-grid">\n%s          </div>\n'
                   '        </section>\n'
                   % (g, g, en, fr, en, ''.join(carte_index(h) for h in heros)))
    return ''.join(out)


def collisions_icones():
    noms = {'conquestSkills': set(), 'skills': set()}
    for h in HEROES:
        for cle in noms:
            for s in h.get(cle) or []:
                noms[cle].add(s['name']['EN'])
    return sorted(n for n in noms['conquestSkills'] & noms['skills']
                  if exists('img/skills/%s.webp' % n)
                  and not exists('img/skills/conquest/%s.webp' % n))


def build_heroes():
    """Le sommaire et les fiches, du même générateur. Contrairement à
    `database/buildings/index.html`, qui s'édite à la main, un héros ajouté à
    `data/heroes_db.json` apparaît au sommaire sans second geste."""
    gabarit = read('tools/templates/hero.html')
    drawer = sync_drawer.bloc_complet('EN')
    ICONES_PARTAGEES.update(collisions_icones())
    rendus = {}

    for h in sorted(HEROES, key=tri_heros):
        if not a_une_fiche(h):
            continue
        for comp in h['conquestSkills'] + h['skills']:
            controle_niveaux(h['name'], comp)
        if h.get('widget'):
            for cle in ('effectConquest', 'effectExpe'):
                controle_niveaux(h['name'], h['widget'][cle])
        slug = SLUGS[h['id']]
        rendus['database/heroes/%s.html' % slug] = fill(gabarit, {
            'SLUG': slug,
            'RARITY': h['rarity'].lower(),
            'NAME': echap(h['name']),
            'TITLE': titre(h),
            'DESCRIPTION': description(h),
            'INTRO_EN': attr(intro(h, 'EN')),
            'INTRO_FR': attr(intro(h, 'FR')),
            'INTRO_TXT': echap(intro(h, 'EN')),
            'TRAP': bloc_piege(h),
            'SCREEN': ecran(h),
            'TABLES': (table_niveaux(h['conquestSkills'], 'tbl-conq',
                                     'Conquest skills by level',
                                     'Compétences de conquête par niveau',
                                     'Skill', 'Compétence', NIVEAUX)
                       + '\n'
                       + table_niveaux(h['skills'], 'tbl-expe',
                                       'Expedition skills by level',
                                       "Compétences d'expédition par niveau",
                                       'Skill', 'Compétence', NIVEAUX)),
            'WIDGET': bloc_widget(h),
            'NAV': nav_heros(h['id']),
            'DRAWER': drawer,
        })

    idx_en = ('All %d Kingshot heroes, their conquest and expedition skills and their '
              'widgets: every effect and every value, from level 1 to level 5. Pick a hero.'
              % len(HEROES))
    idx_fr = ("Les %d héros de Kingshot, leurs compétences de conquête et d'expédition et "
              'leurs widgets : chaque effet et chaque valeur, du niveau 1 au niveau 5. '
              'Choisis un héros.' % len(HEROES))
    rendus['database/heroes/index.html'] = fill(read('tools/templates/heroes-index.html'), {
        'DESCRIPTION': attr(idx_en),
        'INTRO_EN': attr(idx_en),
        'INTRO_FR': attr(idx_fr),
        'INTRO_TXT': echap(idx_en),
        'SECTIONS': sections_index(),
        'DRAWER': drawer,
    })
    return rendus


FAMILLES = [build_shops, build_buildings, build_heroes]


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
    if ICONES_PARTAGEES:
        print('%d nom(s) de compétence porté(s) par la conquête ET par l\'expédition : '
              'la même image sert les deux, donc une des deux fiches montre une icône '
              "qui n'est pas la sienne :" % len(ICONES_PARTAGEES))
        for n in sorted(ICONES_PARTAGEES):
            print('  img/skills/%s.webp' % n)
    if ICONES_MANQUANTES:
        print('%d icône(s) de compétence absente(s) de img/skills/ — la carte garde sa '
              'place, sans image :' % len(ICONES_MANQUANTES))
        for i in sorted(ICONES_MANQUANTES)[:5]:
            print('  ' + i)
        if len(ICONES_MANQUANTES) > 5:
            print('  … et %d autre(s)' % (len(ICONES_MANQUANTES) - 5))
    print('%d pages générées, %d réécrites.' % (len(rendus), len(ecrits)))
    for e in ecrits:
        print('  ' + e)
    return 0


if __name__ == '__main__':
    sys.exit(main())
