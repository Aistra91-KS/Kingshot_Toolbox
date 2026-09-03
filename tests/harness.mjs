/* ==========================================================================
   Harnais de test — Kingshot Toolbox

   Le site n'a ni build ni modules : les fichiers de `js/` posent des fonctions
   globales, que le navigateur assemble page par page. On reproduit ça dans Node
   avec un contexte `vm` : les scripts s'y chargent DANS L'ORDRE DES PAGES, sans
   être modifiés, et les tests appellent ensuite leurs globales.

   C'est ce qui permet de tester le code RÉELLEMENT SERVI, sans y ajouter le
   moindre `export` — donc sans toucher à la contrainte « aucun build » (MAP §9).

   Ce que le contexte fournit :
     · `fetch`        lit `data/…` sur le disque, avec le même contrat (ok/json)
     · `localStorage` en mémoire, vide à chaque test — donc les valeurs par défaut
     · `document`     inerte : `getElementById` rend `null`, ce qui suffit à faire
                      sortir les IIFE de fin de fichier avant tout rendu
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Les scripts d'une page boutique d'événement, dans l'ordre du HTML. */
export const SHOP_SCRIPTS = ['js/storage-keys.js', 'js/shop-core.js', 'js/shop-event.js'];

export function createContext(files = SHOP_SCRIPTS) {
  const store = new Map();
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    URL, URLSearchParams, TextDecoder, Intl,
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear()
    },
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {}, removeEventListener() {},
      documentElement: {}, body: {}
    },
    location: { search: '', href: 'http://localhost/', pathname: '/' },
    history: { replaceState() {} },
    // Le `fetch` du site prend des chemins relatifs à la racine du dépôt.
    async fetch(file) {
      const p = path.join(ROOT, String(file));
      if (!fs.existsSync(p)) {
        return { ok: false, status: 404, json: async () => { throw new Error('404 ' + file); } };
      }
      const txt = fs.readFileSync(p, 'utf8');
      return { ok: true, status: 200, text: async () => txt, json: async () => JSON.parse(txt) };
    }
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = () => {};
  vm.createContext(ctx);
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  return ctx;
}

/* Évalue du code DANS le contexte. Indispensable : les `let` de premier niveau
   d'un script vivent dans la portée lexicale globale du contexte, pas sur son
   objet global — on ne peut donc ni les lire ni les écrire de l'extérieur. */
export const run = (ctx, code) => vm.runInContext(code, ctx);

/* Une boutique d'événement, prête à calculer.
   `plan` reprend exactement la forme persistée par shop-event.js. */
export async function loadEventShop(slug, plan = {}) {
  const ctx = createContext();
  await run(ctx, 'scLoadAll()');
  run(ctx, `SE_DATA = ${JSON.stringify(readJson(`data/events/${slug}.json`))};`);
  run(ctx, `var __slug = ${JSON.stringify(slug)};
            function spShop(){ return SC_EVENTS.find(s => s.slug === __slug); }`);
  const full = {
    played: null, buys: {}, open: true, excluded: {},
    purchaseOk: false, outsideBuys: 0, explore: 0, ...plan
  };
  if (full.played == null) full.played = run(ctx, 'seDays()');
  run(ctx, `SE_PLAN = ${JSON.stringify(full)};`);
  if (!run(ctx, 'spShop()')) throw new Error(`boutique « ${slug} » introuvable dans shopcalc_events.json`);
  return ctx;
}

export function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
