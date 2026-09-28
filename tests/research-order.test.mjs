/* Ordre de recherche proposé par l'outil Recherches : `rsPlanOptimal()` de
   js/research_script.js, sur la vraie base (data/research_db.json, 720 niveaux).

   Ce que ces tests verrouillent, c'est ce que le joueur suit à la lettre :
   - l'ordre est jouable en jeu : chaque ligne a ses prérequis au moment où elle
     vient, en comptant les lignes qui la précèdent ;
   - hors KVK, Tool Enhancement puis Tooling Up passent devant dès qu'ils sont
     débloqués, et une case décochée les rend au tri par temps ;
   - en KVK, le plan tient dans le stock d'accélérateurs, s'arrête seulement quand
     la recherche suivante ne tient plus, et plus de stock ne donne jamais moins de
     recherches.

   Le script branche ses écouteurs dès son chargement : on lui donne des éléments
   de page factices, et son démarrage reste en attente de la base (un `fetch` qui ne
   répond jamais, comme un réseau très lent). Le test charge la base lui-même et
   appelle le moteur, sans rien modifier du code servi. */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createContext, run, ROOT, readJson } from './harness.mjs';

const ARBRES = ['Growth', 'Economy', 'Battle'];
const BASE = readJson('data/research_db.json');

function moteur() {
  const ctx = createContext([]);
  ctx.fetch = () => new Promise(() => {});
  run(ctx, `document.getElementById = () => ({ value: '', checked: true, addEventListener(){} });`);
  for (const f of ['js/storage-keys.js', 'js/research_script.js']) {
    run(ctx, fs.readFileSync(path.join(ROOT, f), 'utf8'));
  }
  run(ctx, `initialDb = ${JSON.stringify(BASE)}; initData();
    db.forEach(it => { it.discountedSeconds = it['Time (d)'] * 86400 + it['Time (h)'] * 3600 + it['Time (m)'] * 60 + it['Time (s)']; });`);
  return ctx;
}

// Un compte déjà avancé, tiré au sort mais toujours le même : des recherches cochées
// avec toute leur chaîne de prérequis, comme les coche la Sélection rapide.
function compteAvance(ctx, graine, n) {
  run(ctx, `(() => {
    let s = ${graine};
    const rnd = k => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % k; };
    for (let i = 0; i < ${n}; i++) { const it = db[rnd(db.length)]; it.Researched = true; cascadeCheckReqs(it); }
  })()`);
}

const plan = (ctx, opts) => JSON.parse(run(ctx, `JSON.stringify((() => {
  const p = rsPlanOptimal(${JSON.stringify({ allowedTrees: ARBRES, maxRows: 8, ...opts })});
  const cle = it => it && { Name: it.Name, Level: it.Level, Tree: it.Tree, s: it.discountedSeconds };
  return { rows: p.rows.map(cle), extraCount: p.extraCount, longItem: cle(p.longItem), plannedTime: p.plannedTime, leftover: p.leftover };
})())`));
const etat = ctx => JSON.parse(run(ctx, `JSON.stringify(db.map(it => ({ Name: it.Name, Level: it.Level, Tree: it.Tree,
  reqs: it.reqs || [], Researched: !!it.Researched, s: it.discountedSeconds })))`));

// La règle du jeu, écrite ici indépendamment du script : un niveau exige le niveau
// d'en dessous et chacun de ses prérequis.
function niveaux(liste) {
  const n = {};
  for (const it of liste) if (it.Researched && it.Level > (n[it.Name] || 0)) n[it.Name] = it.Level;
  return n;
}
function jouable(it, n) {
  if (it.Level > 1 && (n[it.Name] || 0) < it.Level - 1) return false;
  return it.reqs.every(r => (n[r.name] || 0) >= r.level);
}
const cle = it => it.Name + '|' + it.Level;
const rang = it => it.Name.startsWith('Tool Enhancement') ? 0 : it.Name.startsWith('Tooling Up') ? 1 : 2;

// Rejoue le plan ligne à ligne et rend, pour chaque ligne, ce qui était jouable juste avant.
function rejouer(base, lignes) {
  const n = niveaux(base), fait = new Set(base.filter(it => it.Researched).map(cle));
  return lignes.map(l => {
    const it = base.find(x => cle(x) === cle(l));
    const dispo = base.filter(x => !fait.has(cle(x)) && ARBRES.includes(x.Tree) && jouable(x, n));
    const ok = jouable(it, n) && !fait.has(cle(it));
    fait.add(cle(it)); if (it.Level > (n[it.Name] || 0)) n[it.Name] = it.Level;
    return { it, dispo, ok };
  });
}

test('le plan se joue dans l\'ordre, sur un compte neuf comme sur des comptes avancés', () => {
  for (const [graine, n] of [[0, 0], [7, 40], [11, 150], [23, 400]]) {
    const ctx = moteur();
    if (n) compteAvance(ctx, graine, n);
    const base = etat(ctx);
    const p = plan(ctx, { kvk: true, budgetSeconds: 30 * 86400, maxRows: 10000 });
    assert.ok(p.rows.length > 0, `plan vide (graine ${graine})`);
    for (const { it, ok } of rejouer(base, p.rows)) {
      assert.ok(ok, `${it.Name} niv. ${it.Level} proposé sans ses prérequis (graine ${graine})`);
    }
  }
});

test('hors KVK, Tool Enhancement puis Tooling Up passent devant, le reste au plus court', () => {
  for (const [graine, n] of [[0, 0], [7, 40], [11, 150]]) {
    const ctx = moteur();
    if (n) compteAvance(ctx, graine, n);
    const base = etat(ctx);
    const p = plan(ctx, { maxRows: 60 });
    for (const { it, dispo } of rejouer(base, p.rows)) {
      const meilleur = Math.min(...dispo.map(rang));
      assert.equal(rang(it), meilleur, `${it.Name} niv. ${it.Level} passe devant une priorité (graine ${graine})`);
      const plusCourt = Math.min(...dispo.filter(x => rang(x) === meilleur).map(x => x.s));
      assert.ok(it.s <= plusCourt + 0.1, `${it.Name} niv. ${it.Level} n'est pas le plus court de son rang`);
    }
  }
});

test('une priorité décochée rend sa branche au tri par temps', () => {
  const ctx = moteur();
  compteAvance(ctx, 7, 40);
  run(ctx, `inputs.prioToolEnhancement = { checked: false }; inputs.prioToolingUp = { checked: false };`);
  const base = etat(ctx);
  const p = plan(ctx, { maxRows: 60 });
  for (const { it, dispo } of rejouer(base, p.rows)) {
    assert.ok(it.s <= Math.min(...dispo.map(x => x.s)) + 0.1, `${it.Name} niv. ${it.Level} garde sa priorité`);
  }
});

test('en KVK, le plan tient dans le stock et ne s\'arrête que quand la suivante ne tient plus', () => {
  for (const jours of [0.02, 1, 2, 7]) {
    const ctx = moteur();
    compteAvance(ctx, 11, 150);
    const base = etat(ctx), budget = Math.round(jours * 86400);
    const p = plan(ctx, { kvk: true, budgetSeconds: budget, maxRows: 10000 });
    const somme = p.rows.reduce((t, r) => t + r.s, 0);
    assert.ok(Math.abs(somme - p.plannedTime) < 1e-6);
    assert.ok(p.plannedTime <= budget, `plan de ${p.plannedTime} s pour ${budget} s de stock`);
    assert.ok(Math.abs(p.leftover - (budget - p.plannedTime)) < 1e-6);
    // En KVK le tri est au plus court, sans priorité : chaque ligne est la plus courte jouable.
    const pas = rejouer(base, p.rows);
    for (const { it, dispo } of pas) assert.ok(it.s <= Math.min(...dispo.map(x => x.s)) + 0.1);
    // Après la dernière ligne, la plus courte encore jouable dépasse ce qui reste.
    const n = niveaux(base), fait = new Set(base.filter(it => it.Researched).map(cle));
    for (const r of p.rows) { fait.add(cle(r)); if (r.Level > (n[r.Name] || 0)) n[r.Name] = r.Level; }
    const reste = base.filter(x => !fait.has(cle(x)) && ARBRES.includes(x.Tree) && jouable(x, n));
    if (reste.length) {
      assert.ok(Math.min(...reste.map(x => x.s)) > p.leftover, 'une recherche tenait encore dans le stock');
      // La ligne au-delà du stock est la plus longue à portée.
      assert.equal(p.longItem.s, Math.max(...reste.map(x => x.s)));
    }
  }
});

test('plus d\'accélérateurs ne donne jamais moins de recherches', () => {
  const ctx = moteur();
  compteAvance(ctx, 23, 60);
  let avant = -1;
  for (const heures of [0, 1, 6, 24, 72, 240, 720]) {
    const p = plan(ctx, { kvk: true, budgetSeconds: heures * 3600, maxRows: 8 });
    const total = p.rows.length + p.extraCount;
    assert.ok(total >= avant, `${heures} h : ${total} recherches contre ${avant} avec moins de stock`);
    avant = total;
  }
});

test('un arbre décoché n\'apparaît pas, une recherche faite non plus', () => {
  const ctx = moteur();
  compteAvance(ctx, 11, 150);
  const faites = new Set(etat(ctx).filter(it => it.Researched).map(cle));
  const p = plan(ctx, { allowedTrees: ['Economy'], kvk: true, budgetSeconds: 10 * 86400, maxRows: 10000 });
  assert.ok(p.rows.length > 0);
  for (const r of p.rows) {
    assert.equal(r.Tree, 'Economy');
    assert.ok(!faites.has(cle(r)), `${r.Name} niv. ${r.Level} est déjà fait`);
  }
});
