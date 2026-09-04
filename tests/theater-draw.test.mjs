/* Moteur du tirage du Théâtre Fantastique — js/shop-theater.js, section 1.

   Le moteur calcule ses coûts et ses probabilités EN FORME CLOSE (espérance par
   linéarité, loi par récurrence, atteinte par programmation dynamique). Un
   commentaire du fichier affirme qu'il a été validé contre une simulation
   Monte-Carlo ; cette validation n'existait nulle part dans le dépôt.

   La voici, rejouable : une simulation qui ne partage AUCUNE ligne avec le moteur
   — elle ne fait que tirer au sort selon les règles du JSON — et qu'on compare aux
   chiffres exacts. Deux méthodes indépendantes qui tombent d'accord, c'est ce qui
   fait la preuve ; refaire le même calcul deux fois n'en serait pas une.

   Le générateur est GRAINÉ : à graine fixe la simulation rend toujours la même
   chose, donc le test ne peut pas « flaker ». */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, run, readJson } from './harness.mjs';

const MECH = readJson('data/events/fantasy-theater.json');
const AREA = {
  id: 'theater',
  peak: MECH.theater.peak,
  cost: MECH.theater.costByFloor,
  pity: MECH.pity.chances,
  jump: { 1: MECH.jump['1'], 2: MECH.jump['2'], 3: MECH.jump['3'] }
};

/* Le contexte ne charge QUE le moteur : shop-theater.js s'appuie sur shop-core.js
   pour le rendu, dont la section 1 n'a besoin de rien. */
const ctx = createContext(['js/storage-keys.js', 'js/shop-core.js', 'js/shop-theater.js']);
run(ctx, `var AREA = ${JSON.stringify(AREA)};`);

/* mulberry32 — 32 bits, graine explicite, même suite à chaque exécution. */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Une montée d'étage, jouée bêtement selon les règles :
   on explore, on paie, on regarde si ça monte, et de combien. */
function simulateClimb(rand, from, target, budget = Infinity) {
  let floor = from, pity = 0, spent = 0;
  while (floor < target) {
    const c = AREA.cost[floor];
    if (!c || spent + c > budget) return { floor, spent, reached: false };
    spent += c;
    if (rand() < AREA.pity[pity]) {         // ça monte
      const r = rand();
      const step = r < AREA.jump[1] ? 1 : (r < AREA.jump[1] + AREA.jump[2] ? 2 : 3);
      floor = Math.min(floor + step, AREA.peak);
      pity = 0;
    } else {
      pity = Math.min(pity + 1, AREA.pity.length - 1);
    }
  }
  return { floor, spent, reached: true };
}

test('coût moyen pour monter au sommet — la forme close tient face à 200 000 tirages', () => {
  const exact = run(ctx, `ftClimbCostFrom(AREA, ${AREA.peak}, 1, 0)`);
  const rand = rng(20260903);
  const N = 200000;
  let total = 0;
  for (let i = 0; i < N; i++) total += simulateClimb(rand, 1, AREA.peak).spent;
  const sim = total / N;
  const ecart = Math.abs(sim - exact) / exact;
  assert.ok(ecart < 0.01,
    `coût exact ${exact.toFixed(1)} amulettes, simulé ${sim.toFixed(1)} — écart ${(ecart * 100).toFixed(2)} %`);
});

test('chances d’atteindre chaque étage avec un budget fini — idem', () => {
  const BUDGET = 300;
  const exact = run(ctx, `ftComputeReach(AREA, ${BUDGET}, 1, 0)`);
  const rand = rng(31415926);
  const N = 120000;
  const hits = new Array(AREA.peak + 1).fill(0);
  for (let i = 0; i < N; i++) {
    const r = simulateClimb(rand, 1, AREA.peak, BUDGET);
    for (let t = 1; t <= r.floor; t++) hits[t]++;
  }
  for (let T = 2; T <= AREA.peak; T++) {
    const sim = hits[T] / N;
    assert.ok(Math.abs(sim - exact[T]) < 0.01,
      `étage ${T} : exact ${(exact[T] * 100).toFixed(2)} %, simulé ${(sim * 100).toFixed(2)} %`);
  }
});

test('la garantie de la 5e tentative est bien celle du barème', () => {
  // ftAttemptsFrom(pity, 0) = espérance de tentatives pour monter, compteur neuf.
  // Recalculée ici à la main depuis le barème, sans passer par le moteur.
  const p = AREA.pity;
  let attendu = 0, survie = 1;
  for (let i = 0; i < p.length; i++) { attendu += (i + 1) * survie * p[i]; survie *= (1 - p[i]); }
  assert.equal(survie, 0, 'la dernière tentative du barème doit être garantie (probabilité 1)');
  assert.ok(Math.abs(run(ctx, 'ftAttemptsFrom(AREA.pity, 0)') - attendu) < 1e-9);
});
