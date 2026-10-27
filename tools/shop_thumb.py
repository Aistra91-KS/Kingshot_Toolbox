#!/usr/bin/env python3
"""Vignette 16:9 d'une boutique tirée d'une ICÔNE du jeu (un coffre, pas une capture).

    python3 tools/shop_thumb.py "img/coffre halloween.PNG" halloween-chest

écrit img/shops/halloween-chest.webp. Demande Pillow (`pip install pillow`).

Pourquoi : la carte cadre sa vignette en `object-fit: cover` calé en haut, réglé pour
les captures d'écran (titre de la boutique en haut, cf. MAP.md §13). Une icône carrée
y perdait toute sa moitié basse. Ici l'icône est détourée de son fond de capture,
centrée en entier dans un 16:9, sur un fond tiré d'elle-même (agrandie, floutée,
assombrie). Le fond est opaque exprès : la mosaïque de secours est dessinée sous la
photo, un fond transparent la laisse voir.
"""

import os
import sys
from collections import deque

from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LARGEUR, HAUTEUR = 480, 270
REMPLISSAGE = 0.86      # hauteur de l'icône dans la vignette


def detoure(chemin, tolerance=28):
    """L'icône sans le fond uni de la capture, repéré par remplissage depuis les
    bords : la couleur du coin, à `tolerance` près (somme des écarts RVB)."""
    im = Image.open(chemin).convert('RGB')
    w, h = im.size
    px = im.load()
    ref = px[0, 0]
    fond = [[False] * w for _ in range(h)]
    file = deque()
    for x in range(w):
        file.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        file.extend([(0, y), (w - 1, y)])
    while file:
        x, y = file.popleft()
        if fond[y][x] or sum(abs(a - b) for a, b in zip(px[x, y], ref)) > tolerance:
            continue
        fond[y][x] = True
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not fond[ny][nx]:
                file.append((nx, ny))
    masque = Image.new('L', (w, h), 0)
    mp = masque.load()
    for y in range(h):
        for x in range(w):
            if not fond[y][x]:
                mp[x, y] = 255
    # Un pixel rogné puis un bord adouci : sans le rognage, un liseré du fond de
    # capture restait autour de l'icône, visible sur le fond flouté.
    masque = masque.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    icone = im.convert('RGBA')
    icone.putalpha(masque)
    return icone.crop(masque.point(lambda v: 255 if v > 128 else 0).getbbox())


def compose(icone):
    th = round(HAUTEUR * REMPLISSAGE)
    tw = round(icone.width * th / icone.height)
    devant = icone.resize((tw, th), Image.LANCZOS)
    grand = icone.resize((LARGEUR, round(icone.height * LARGEUR / icone.width)), Image.LANCZOS)
    haut = (grand.height - HAUTEUR) // 2
    grand = grand.crop((0, haut, LARGEUR, haut + HAUTEUR))
    fond = Image.new('RGBA', (LARGEUR, HAUTEUR), (30, 22, 14, 255))
    fond.alpha_composite(grand)
    fond = ImageEnhance.Brightness(fond.filter(ImageFilter.GaussianBlur(18))).enhance(0.55)
    fond.alpha_composite(devant, ((LARGEUR - tw) // 2, (HAUTEUR - th) // 2))
    return fond.convert('RGB')


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    source, slug = sys.argv[1], sys.argv[2]
    sortie = os.path.join(ROOT, 'img', 'shops', slug + '.webp')
    compose(detoure(source)).save(sortie, 'WEBP', quality=88, method=6)
    print(os.path.relpath(sortie, ROOT))


if __name__ == '__main__':
    main()
