# Kingshot Toolbox

Calculators, optimizers and a database for the game Kingshot. Live at
**[kingshottoolbox.com](https://kingshottoolbox.com/)**.

Static site: plain HTML, CSS and JavaScript, no framework and no build step.
Everything you enter is kept in your own browser, and no server ever receives it.

## Running it from a local copy

Download or clone the repository, then from its root folder:

```
python3 serve.py
```

Open <http://localhost:8000>. Pass a port number to use another one
(`python3 serve.py 8080`). On Windows, use `py serve.py` or `python serve.py`.

**Opening `index.html` straight off the disk does not work.** Two things break:

1. The calculators read their data from `data/*.json` through `fetch()`, which
   browsers refuse on a `file://` address. Every tool would come up empty.
2. Internal links are written without the `.html` ending, because that is the
   address the live site publishes and the one Google indexes. A plain file
   listing has no way to match `/waracademy` to `waracademy.html`.

`serve.py` fixes both. It is the standard library only, no packages to install,
and it resolves addresses the same way GitHub Pages does: `/waracademy` serves
`waracademy.html`, `/database/pets/` serves `database/pets/index.html`, and
anything missing gets the site's own 404 page.

If you would rather not use Python, any static server with clean-URL support
works. Two that need no config:

```
npx serve .
npx http-server -e html
```

## Repository layout

`MAP.md` describes every folder and file, the conventions the site follows, and
the reasoning behind them. Start there. `CLAUDE.md` holds the working rules for
this repository.

## Tests

```
node --test
```

No dependencies. The suite covers the calculation engines behind the shops, the
War Academy planner and the pet advancement planner.

## Reusing this

The code is here to be read and learned from. If you run a copy of the site
somewhere public, please change the Google Analytics id in the page headers and
the feedback form endpoint, so your visitors' data does not land in someone
else's account.

Kingshot Toolbox is a fan project. It is not affiliated with, endorsed by or
sponsored by Century Games.
