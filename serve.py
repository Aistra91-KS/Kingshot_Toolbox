#!/usr/bin/env python3
"""Serveur local pour Kingshot Toolbox.

Le site est publié sur GitHub Pages, qui sert `foo.html` aussi bien sous `/foo`
que sous `/foo.html`. Tous les liens internes du site sont écrits dans la forme
courte, sans `.html` (cf. MAP.md section 9). Un `python3 -m http.server` ne
connaît que les noms de fichiers : il rend donc 404 sur chaque lien interne, et
toute la navigation paraît cassée alors qu'elle est bonne en ligne. L'extension
Live Server de VS Code a le même défaut et n'offre aucun réglage pour le corriger.

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
    python3 serve.py --live     recharge la page ouverte à chaque enregistrement
                                d'un fichier .html, .css, .js ou .json
    python3 serve.py --open     ouvre le site dans le navigateur au démarrage

Sous Windows, remplacer `python3` par `py` ou `python`. Dans VS Code, la tâche
« Site local » (Ctrl+Maj+B) lance `--live --open` : c'est l'équivalent de Live
Server, avec la navigation entre pages qui fonctionne.

`--live` ajoute un petit script à chaque page servie, qui interroge le serveur
toutes les 700 ms. Il reste hors du mode par défaut : une page qui interroge en
boucle ne devient jamais « au repos » pour un test navigateur.

Zéro dépendance : la bibliothèque standard suffit.
"""

import http.server
import io
import os
import sys
import threading
import time
import webbrowser
from urllib.parse import unquote, urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))

# Rechargement automatique (--live).
RELOAD_PATH = '/__reload'
WATCHED_EXT = ('.html', '.css', '.js', '.json')
SKIPPED_DIRS = {'.git', 'node_modules', '__pycache__'}
LIVE = False
# Le jeton change à chaque modification ET à chaque redémarrage du serveur :
# une page restée ouverte pendant un redémarrage se recharge d'elle-même.
_token = '%d-0' % time.time()

RELOAD_SCRIPT = (
    '<script>(function(){var t=%s;function p(){'
    "fetch('" + RELOAD_PATH + "',{cache:'no-store'})"
    '.then(function(r){return r.text()})'
    '.then(function(v){if(v!==t)location.reload()},'
    # Serveur arrêté : on continue d'interroger, il peut revenir.
    'function(){})'
    '.then(function(){setTimeout(p,700)})}setTimeout(p,700)})();</script>'
)


def _snapshot():
    """Empreinte des fichiers surveillés : chemin et date de modification."""
    entries = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIPPED_DIRS]
        for name in filenames:
            if name.endswith(WATCHED_EXT):
                path = os.path.join(dirpath, name)
                try:
                    entries.append((path, os.stat(path).st_mtime_ns))
                except OSError:
                    pass  # supprimé entre os.walk et os.stat : vu au tour suivant
    return hash(tuple(sorted(entries)))


def _watch():
    global _token
    start, version = _token.split('-')[0], 0
    last = _snapshot()
    while True:
        time.sleep(0.4)
        current = _snapshot()
        if current != last:
            last, version = current, version + 1
            _token = '%s-%d' % (start, version)


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler avec la résolution d'adresses de GitHub Pages."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Revalider à chaque fois : une modification se voit dès le rechargement,
        # sans vider le cache. Les fichiers inchangés repartent en 304.
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        path = unquote(urlsplit(self.path).path)

        if LIVE and path == RELOAD_PATH:
            return self.send_bytes(200, 'text/plain; charset=utf-8', _token.encode())

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
            target = os.path.join(target, 'index.html')
            if not os.path.isfile(target):
                return self.send_404()
        elif not os.path.isfile(target):
            return self.send_404()

        if LIVE and target.endswith('.html'):
            return self.send_page(200, target)
        return super().send_head()

    def send_404(self):
        page = os.path.join(ROOT, '404.html')
        if not os.path.isfile(page):
            self.send_error(404, 'File not found')
            return None
        return self.send_page(404, page)

    def send_page(self, code, file):
        body = open(file, 'rb').read()
        if LIVE:
            script = (RELOAD_SCRIPT % ('"%s"' % _token)).encode()
            end = body.lower().rfind(b'</body>')
            if end == -1:
                body += script
            else:
                body = body[:end] + script + body[end:]
        return self.send_bytes(code, 'text/html; charset=utf-8', body)

    def send_bytes(self, code, content_type, body):
        # send_head renvoie un fichier que do_GET recopie et que do_HEAD ignore.
        self.send_response(code)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        return io.BytesIO(body)

    def log_message(self, fmt, *args):
        # Les interrogations du rechargement noieraient tout le reste.
        if self.path == RELOAD_PATH:
            return
        # Une ligne par requête, sans l'horodatage qui noie la sortie.
        sys.stderr.write('%s\n' % (fmt % args))


def main():
    global LIVE
    port = 8000
    args = sys.argv[1:]
    LIVE = '--live' in args
    should_open = '--open' in args
    rest = [a for a in args if a not in ('--live', '--open')]
    if rest:
        try:
            port = int(rest[0])
        except ValueError:
            sys.exit('Argument invalide : %s' % rest[0])

    server = http.server.ThreadingHTTPServer(('', port), PagesHandler)
    url = 'http://localhost:%d/' % port
    print('Kingshot Toolbox sur %s' % url)
    if LIVE:
        threading.Thread(target=_watch, daemon=True).start()
        print('Rechargement automatique actif.')
    print('Ctrl+C pour arrêter.')
    if should_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nArrêté.')
        server.server_close()


if __name__ == '__main__':
    main()
