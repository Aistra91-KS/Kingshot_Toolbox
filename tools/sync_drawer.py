#!/usr/bin/env python3
"""Le bloc drawer figé, régénéré depuis js/site-config.js.

    python3 tools/sync_drawer.py           réécrit le bloc dans toutes les pages
    python3 tools/sync_drawer.py --check   ne touche à rien, échoue sur une page en retard

Pourquoi : le maillage interne doit exister sans JavaScript (MAP.md §9), donc chaque
page porte en dur la nav du drawer dans son état fermé. C'est le même bloc partout,
recopié 86 fois — ajouter un outil au manifeste demandait jusqu'ici 86 éditions à la
main, et un oubli ne se voyait nulle part. Le bloc se DÉDUIT maintenant du manifeste :
il ne peut plus s'en désynchroniser.

La jumelle française (fr/shop/theater-shop.html, cf. MAP.md §4) reçoit la même nav
en français : son rendu est épinglé en FR, un drawer anglais y jurerait.
"""

import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# La ligne à remplacer. Tout ce qui la précède (l'overlay et le commentaire qui
# explique le procédé) est identique partout et n'a pas à être régénéré.
MOTIF = re.compile(r'<aside class="hdr-drawer hdr-drawer-raw" id="hdr-drawer" aria-hidden="true">.*?</aside>',
                   re.S)


def manifeste():
    """SITE, lu par Node plutôt que par une expression régulière : le manifeste est
    du JavaScript, et une regex sur du JavaScript finit toujours par se tromper.
    `SITE` est un `const` de premier niveau, qui ne devient pas une propriété du
    contexte — d'où l'affectation explicite à la fin du script évalué."""
    js = ("const fs=require('fs'),vm=require('vm');"
          "const ctx={window:{},document:{}};vm.createContext(ctx);"
          "vm.runInContext(fs.readFileSync(process.argv[1],'utf8')"
          "+';__out=JSON.stringify({categories:SITE.categories,tools:SITE.tools,ui:SITE.ui});',ctx);"
          "process.stdout.write(ctx.__out);")
    try:
        out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'js/site-config.js')],
                             capture_output=True, text=True, encoding='utf-8', check=True)
    except FileNotFoundError:
        raise SystemExit('node est introuvable : il sert à lire js/site-config.js, '
                         'qui est du JavaScript. Installe Node, ou édite le drawer à la main.')
    except subprocess.CalledProcessError as e:
        raise SystemExit('js/site-config.js ne se charge pas :\n' + (e.stderr or '').strip())
    return json.loads(out.stdout)


# Les libellés partent TELS QUELS, « & » compris (« KVK Tools & Calculators »).
# C'est ce que fait déjà hdrBuildDrawer() dans js/header.js, et donc ce que portent
# les 86 pages : échapper ici ferait diverger le bloc figé de celui que le JS pose
# par-dessus, et réécrirait 86 fichiers pour un caractère que le navigateur lit
# pareil des deux façons.
def bloc(lang='EN'):
    S = manifeste()
    ui = S.get('ui') or {}
    nav = []
    for cat in S['categories']:
        nav.append('<div class="drawer-cat">%s</div>' % cat['name'][lang])
        for tid in cat['tools']:
            tool = S['tools'].get(tid)
            if not tool:
                raise SystemExit("l'outil « %s » de la catégorie « %s » n'est pas au registre"
                                 % (tid, cat['id']))
            badge = ''
            if tool.get('badge'):
                libelle = (ui.get(tool['badge']) or {}).get(lang) or tool['badge'].capitalize()
                badge = '<span class="hdr-badge">%s</span>' % libelle
            nav.append('<a href="%s" class="drawer-tool"><span>%s</span>%s</a>'
                       % (tool['href'], tool['name'][lang], badge))
    return ('<aside class="hdr-drawer hdr-drawer-raw" id="hdr-drawer" aria-hidden="true">'
            '<nav class="drawer-nav">%s</nav></aside>' % ''.join(nav))


# Le bloc complet tel qu'il se pose dans une page : le commentaire qui explique le
# procédé, l'overlay, puis la nav. `tools/build_pages.py` le demande ici plutôt que
# d'en garder une copie — deux copies finiraient par diverger.
PREAMBULE = """    <!-- Maillage interne sans JavaScript : la nav du drawer, figee en dur, dans son
         etat ferme (position:fixed + translateX(100%) => hors ecran). Placee AVANT
         les scripts : header.js la reutilise au lieu d en creer une seconde, puis
         hdrBuildDrawer() en remplace le contenu par sa version complete. Le rendu
         final est inchange, et .hdr-drawer-raw coupe l ombre portee tant que le JS
         n a pas hydrate. Cf. MAP.md SS9 : le maillage doit exister sans JS. -->
    <div class="hdr-drawer-overlay" id="hdr-drawer-overlay"></div>
    """


def bloc_complet(lang='EN'):
    return PREAMBULE + bloc(lang)


def pages():
    for base, dirs, fichiers in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in ('.git', 'tools', 'tests', 'node_modules')]
        for f in fichiers:
            if f.endswith('.html'):
                yield os.path.join(base, f)


def applique(check=False):
    """Renvoie les pages réécrites, celles en retard, et celles que le motif n'a pas
    su reconnaître.

    Ce troisième cas est le piège : une page dont le balisage a dérivé (un attribut
    déplacé, une balise refermée autrement) ne correspond plus au motif, `sub` n'y
    touche pas, et la page ressort IDENTIQUE — donc « à jour » pour un test naïf.
    Elle garderait un drawer périmé sans que rien ne le signale. On compte donc les
    remplacements, et on nomme les pages où il n'y en a pas eu."""
    blocs = {'EN': bloc('EN'), 'FR': bloc('FR')}
    ecrits, retard, muettes = [], [], []
    for chemin in sorted(pages()):
        src = open(chemin, encoding='utf-8').read()
        if 'id="hdr-drawer"' not in src:
            continue
        rel = os.path.relpath(chemin, ROOT).replace(os.sep, '/')
        voulu = blocs['FR'] if rel.startswith('fr/') else blocs['EN']
        neuf, n = MOTIF.subn(lambda m: voulu, src)
        if n != 1:
            muettes.append('%s (%d bloc(s) reconnu(s))' % (rel, n))
            continue
        if neuf == src:
            continue
        (retard if check else ecrits).append(rel)
        if not check:
            open(chemin, 'w', encoding='utf-8').write(neuf)
    return ecrits, retard, muettes


def main():
    check = '--check' in sys.argv[1:]
    ecrits, retard, muettes = applique(check)
    if muettes:
        print('Ces pages portent un drawer que le motif ne reconnaît plus :')
        for m in muettes:
            print('  ' + m)
        print("Leur balisage a dérivé : elles garderaient un drawer périmé en silence.\n")
    if check:
        if retard:
            print('Ces pages ne portent plus le drawer du manifeste :')
            for r in retard:
                print('  ' + r)
            print('\nRelance `python3 tools/sync_drawer.py`, puis commite la sortie.')
        if retard or muettes:
            return 1
        print('Drawer conforme au manifeste sur toutes les pages.')
        return 0
    print('%d page(s) mise(s) à jour.' % len(ecrits))
    for e in ecrits:
        print('  ' + e)
    return 1 if muettes else 0


if __name__ == '__main__':
    sys.exit(main())
