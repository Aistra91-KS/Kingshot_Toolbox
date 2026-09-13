/* Piège à Ours — répartition des troupes entre les marches (`btDistributeTroops`).

   Ce que ces tests verrouillent, et pourquoi :

   1. L'ÉQUILIBRE ENTRE MARCHES. La version d'avant ne plafonnait que les archers,
      puis comblait l'espace restant avec TOUT le stock de cavalerie, puis
      d'infanterie. La 1re marche vidait donc la cavalerie et les suivantes
      héritaient des restes : sur 2 marches de 18 650 avec 13 718 / 12 911 / 12 758,
      elle rendait 10 % / 56 % / 34 % puis 52 % / 13 % / 34 %, et à 4 marches les
      deux dernières sortaient à 2 087 puis 0. Rien à l'écran ne le signalait :
      les totaux étaient bons, c'est la composition qui était fausse.

   2. LES INVARIANTS QU'UNE RÉPARTITION NE DOIT JAMAIS CASSER. Aucune marche ne
      dépasse sa capacité, aucun type n'est distribué au-delà du stock, et le
      total envoyé ne baisse jamais par rapport à l'ancienne version — c'est le
      seul chiffre que le joueur voyait déjà et qu'une correction d'équilibre
      pourrait dégrader sans qu'il s'en aperçoive.

   3. LE CAS À UNE MARCHE. C'est le plus courant, et il ne devait pas bouger :
      les tests le comparent à l'ancienne boucle, recopiée ici telle qu'elle était.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, run } from './harness.mjs';

const ctx = createContext(['js/storage-keys.js', 'js/beartrap.js']);

const distribute = (caps, avail, minInf, minCav) =>
  JSON.parse(run(ctx, `JSON.stringify(btDistributeTroops(${JSON.stringify(caps)}, ${JSON.stringify(avail)}, ${minInf}, ${minCav}))`));

const TYPES = ['inf', 'cav', 'arc'];
const sent = (split, type) => split.reduce((s, m) => s + m[type], 0);
const total = (split) => TYPES.reduce((s, t) => s + sent(split, t), 0);

/* L'ANCIENNE boucle de calculateBearTrap, recopiée telle qu'elle était.
   Elle sert de témoin : le cas à une marche doit lui rester identique, et le
   total envoyé ne doit jamais devenir inférieur au sien. */
function legacy(caps, avail, minInfPercent, minCavPercent) {
  let aInf = avail.inf, aCav = avail.cav, aArc = avail.arc;
  const out = [];
  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i], left = caps.length - i;
    const fairInf = Math.floor(aInf / left), fairArc = Math.floor(aArc / left), fairCav = Math.floor(aCav / left);
    let mInf = Math.min(Math.floor(cap * (minInfPercent / 100)), fairInf, aInf);
    let mCav = Math.min(Math.floor(cap * (minCavPercent / 100)), fairCav, aCav);
    let space = cap - mInf - mCav;
    let mArc = Math.min(space, fairArc, aArc);
    space -= mArc;
    if (space > 0) { const add = Math.min(space, aCav - mCav); mCav += add; space -= add; }
    if (space > 0) { const add = Math.min(space, aInf - mInf); mInf += add; space -= add; }
    if (space > 0) { const add = Math.min(space, aArc - mArc); mArc += add; space -= add; }
    aInf -= mInf; aCav -= mCav; aArc -= mArc;
    out.push({ inf: mInf, cav: mCav, arc: mArc });
  }
  return out;
}

/* ---------- Les trois cas relevés à la main ---------- */

test('2 marches de même capacité reçoivent la même composition', () => {
  const caps = [18650, 18650];
  const split = distribute(caps, { inf: 13718, cav: 12911, arc: 12758 }, 10, 10);

  split.forEach((m, i) => assert.equal(m.inf + m.cav + m.arc, caps[i], `marche ${i + 1} pleine`));
  TYPES.forEach(t => assert.ok(Math.abs(split[0][t] - split[1][t]) <= 2,
    `${t} : ${split[0][t]} contre ${split[1][t]}, écart supérieur à l'arrondi`));
  assert.equal(split[0].arc, 6379);
  assert.equal(split[1].arc, 6379);

  // Le relevé d'origine, celui qui a fait ouvrir le sujet.
  const avant = legacy(caps, { inf: 13718, cav: 12911, arc: 12758 }, 10, 10);
  assert.deepEqual(avant[0], { inf: 1865, cav: 10406, arc: 6379 });
  assert.deepEqual(avant[1], { inf: 9766, cav: 2505, arc: 6379 });
  // Même total envoyé qu'avant : seule la répartition change.
  assert.equal(total(split), total(avant));
});

test('moins de troupes que de place : le stock est partagé en deux, pas empilé sur la 1re marche', () => {
  const split = distribute([18650, 18650], { inf: 10000, cav: 10000, arc: 10000 }, 10, 10);
  split.forEach(m => assert.deepEqual(m, { inf: 5000, cav: 5000, arc: 5000 }));
});

test('marches de capacités différentes : chacune reçoit au prorata de sa capacité', () => {
  const caps = [20000, 10000];
  const split = distribute(caps, { inf: 12000, cav: 12000, arc: 12000 }, 10, 10);
  split.forEach((m, i) => assert.equal(m.inf + m.cav + m.arc, caps[i], `marche ${i + 1} pleine`));
  assert.equal(split[0].arc, 8000);
  assert.equal(split[1].arc, 4000);
});

test('4 marches demandées, 4 marches servies', () => {
  const split = distribute([18650, 18650, 18650, 18650], { inf: 13718, cav: 12911, arc: 12758 }, 10, 10);
  split.forEach((m, i) => assert.ok(m.inf + m.cav + m.arc > 0, `marche ${i + 1} vide`));
  const totaux = split.map(m => m.inf + m.cav + m.arc);
  assert.ok(Math.max(...totaux) - Math.min(...totaux) <= 3, `marches déséquilibrées : ${totaux.join(' / ')}`);
  // L'ancienne version en laissait deux sur le carreau (2 087 puis 0).
  const avant = legacy([18650, 18650, 18650, 18650], { inf: 13718, cav: 12911, arc: 12758 }, 10, 10);
  assert.equal(avant[3].inf + avant[3].cav + avant[3].arc, 0);
});

/* ---------- Les cas limites ---------- */

test('une marche sans capacité ne reçoit rien, et ne prive pas les autres', () => {
  const split = distribute([18650, 0], { inf: 10000, cav: 10000, arc: 10000 }, 10, 10);
  assert.deepEqual(split[1], { inf: 0, cav: 0, arc: 0 });
  assert.equal(split[0].inf + split[0].cav + split[0].arc, 18650);
});

test('aucune capacité du tout : rien n\'est distribué, et rien ne casse', () => {
  const split = distribute([0, 0], { inf: 10000, cav: 10000, arc: 10000 }, 10, 10);
  split.forEach(m => assert.deepEqual(m, { inf: 0, cav: 0, arc: 0 }));
});

test('stock vide : des marches vides, pas de valeur négative', () => {
  const split = distribute([18650, 18650], { inf: 0, cav: 0, arc: 0 }, 10, 10);
  split.forEach(m => TYPES.forEach(t => assert.equal(m[t], 0)));
});

/* ---------- Les invariants, sur des tirages aléatoires ---------- */

test('les invariants tiennent sur 5 000 tirages', () => {
  // Générateur grainé : un test qui échoue signale un vrai écart, jamais un
  // tirage malchanceux qu'on ne saurait pas rejouer.
  let seed = 20260913;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };

  for (let k = 0; k < 5000; k++) {
    const marches = 1 + rnd(6);
    const base = 5000 + rnd(30000);
    // Un tirage sur deux avec des marches identiques : c'est là que le
    // déséquilibre se voyait, et des capacités au hasard sont presque toujours
    // distinctes, donc ne le testeraient jamais.
    const memeCap = rnd(2) === 0;
    const caps = Array.from({ length: marches }, () => memeCap ? base : Math.max(0, base - rnd(20000)));
    const avail = { inf: rnd(60000), cav: rnd(60000), arc: rnd(60000) };
    const minInf = rnd(41), minCav = rnd(41);
    const contexte = `marches=${JSON.stringify(caps)} stock=${JSON.stringify(avail)} min=${minInf}/${minCav}`;

    const split = distribute(caps, avail, minInf, minCav);
    const avant = legacy(caps, avail, minInf, minCav);

    assert.equal(split.length, caps.length, contexte);
    split.forEach((m, i) => {
      TYPES.forEach(t => assert.ok(m[t] >= 0, `valeur négative — ${contexte}`));
      assert.ok(m.inf + m.cav + m.arc <= caps[i], `marche ${i + 1} au-delà de sa capacité — ${contexte}`);
    });
    TYPES.forEach(t => assert.ok(sent(split, t) <= avail[t], `${t} distribué au-delà du stock — ${contexte}`));
    assert.ok(total(split) >= total(avant), `moins de troupes envoyées qu'avant — ${contexte}`);

    if (marches === 1) assert.deepEqual(split, avant, `le cas à une marche a changé — ${contexte}`);

    if (memeCap && base > 0) {
      TYPES.forEach(t => {
        const vals = split.map(m => m[t]);
        assert.ok(Math.max(...vals) - Math.min(...vals) <= 2,
          `${t} déséquilibré entre marches identiques (${vals.join(' / ')}) — ${contexte}`);
      });
    }
  }
});
