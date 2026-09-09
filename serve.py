#!/usr/bin/env python3
"""Serveur local pour Kingshot Toolbox.

Le site est publié sur GitHub Pages, qui sert `foo.html` aussi bien sous `/foo`
que sous `/foo.html`. Tous les liens internes du site sont écrits dans la forme
courte, sans `.html` (cf. MAP.md section 9). Un `python3 -m http.server` ne
connaît que les noms de fichiers : il rend donc 404 sur chaque lien interne, et
toute la navigation paraît cassée alors qu'elle est bonne en ligne.

Ce script reproduit les quatre règles de GitHub Pages :

    /            ->  index.html
    /foo         ->  foo.html, ou redirection vers /foo/ si c'est un dossier
    /foo/        ->  foo/index.html
    tout le reste->  404.html, avec un vrai code 404

Il faut un serveur HTTP, ouvrir index.html directement depuis le disque ne
suffit pas : les calculateurs lisent leurs données dans data/*.json par fetch(),
que le navigateur refuse sur une adresse file://.

Usage, depuis la racine du dépôt :

    python3 serve.py            puis ouvrir http://localhost:8000
    python3 serve.py 8080       pour choisir un autre port

Sous Windows, remplacer `python3` par `py` ou `python`.
Zéro dépendance : la bibliothèque standard suffit.
"""

import http.server
import os
import posixpath
import sys
from urllib.parse import unquote, urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler avec la résolution d'adresses de GitHub Pages."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        local = self.translate_path(self.path)

        # /foo -> /foo/ quand foo est un dossier : c'est ce que fait Pages, et
        # sans la barre finale les liens relatifs de la page partiraient d'un
        # cran trop haut.
        if not path.endswith('/') and os.path.isdir(local):
            self.send_response(301)
            self.send_header('Location', path + '/')
            self.end_headers()
            return None

        # /foo -> foo.html
        if not path.endswith('/') and not os.path.exists(local):
            if os.path.isfile(local + '.html'):
                self.path = path + '.html'

        # Fichier introuvable : la page 404 du site, avec son vrai code.
        target = self.translate_path(self.path)
        if os.path.isdir(target):
            if not os.path.isfile(os.path.join(target, 'index.html')):
                return self.send_404()
        elif not os.path.isfile(target):
            return self.send_404()

        return super().send_head()

    def send_404(self):
        page = os.path.join(ROOT, '404.html')
        if not os.path.isfile(page):
            self.send_error(404, 'File not found')
            return None
        body = open(page, 'rb').read()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command == 'HEAD':
            return None
        self.wfile.write(body)
        return None

    def log_message(self, fmt, *args):
        # Une ligne par requête, sans l'horodatage qui noie la sortie.
        sys.stderr.write('%s\n' % (fmt % args))


def main():
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            sys.exit('Port invalide : %s' % sys.argv[1])

    server = http.server.ThreadingHTTPServer(('', port), PagesHandler)
    print('Kingshot Toolbox sur http://localhost:%d' % port)
    print('Ctrl+C pour arrêter.')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nArrêté.')
        server.server_close()


if __name__ == '__main__':
    main()
