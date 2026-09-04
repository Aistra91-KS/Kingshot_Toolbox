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
  jump: { 1: MECH.jump['1'], 2: MECH.jump['2'], 3: MECH.jump['3'] },
  claimFrom: MECH.rules.claimAllowedFromFloor,
  failMult: MECH.rules.failTokenMultiplier
};
/* La même zone SANS le lot d'échec : c'est le calcul d'avant, qui doit rester
   accessible tel quel — un joueur dont le JSON est encore en cache le reçoit. */
const AREA_SANS_LOT = Object.assign({}, AREA, { id: 'theater-sans-lot', failMult: 0 });
const TOK = MECH.theater.tokensByFloor;

/* Le contexte ne charge QUE le moteur : shop-theater.js s'appuie sur shop-core.js
   pour le rendu, dont la section 1 n'a besoin de rien. */
const ctx = createContext(['js/storage-keys.js', 'js/shop-core.js', 'js/shop-theater.js']);
run(ctx, `var AREA = ${JSON.stringify(AREA)};`);
run(ctx, `var AREA_SANS_LOT = ${JSON.stringify(AREA_SANS_LOT)};`);
run(ctx, `var TOK = ${JSON.stringify(TOK)};`);

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

/* --------------------------------------------------------------------------
   Le lot de consolation des explorations ratées (rules.failTokenMultiplier).
   Il ne se ramasse QUE sur un échec, et il vaut un multiple du coût de l'étage
   d'où part l'exploration. Même méthode que ci-dessus : une simulation qui ne
   connaît que le JSON, opposée aux formes closes du moteur.
   -------------------------------------------------------------------------- */

test('le lot d’échec est bien compté dans « où encaisser »', () => {
  const rand = rng(19700101);
  const N = 120000;
  for (const T of [2, 4, 7]) {
    const exact = run(ctx, `ftThresholdStats(AREA, TOK, ${T})`);
    let gain = 0;
    for (let i = 0; i < N; i++) {
      // Une manche jouée à la règle « j'encaisse dès l'étage T », en ramassant
      // les jetons de chaque exploration ratée.
      let floor = 1, pity = 0;
      while (floor < T) {
        const c = AREA.cost[floor];
        if (rand() < AREA.pity[pity]) {
          const r = rand();
          const step = r < AREA.jump[1] ? 1 : (r < AREA.jump[1] + AREA.jump[2] ? 2 : 3);
          floor = Math.min(floor + step, AREA.peak);
          pity = 0;
        } else {
          gain += AREA.failMult * c;                 // raté : le lot tombe
          pity = Math.min(pity + 1, AREA.pity.length - 1);
        }
      }
      gain += TOK[floor];                            // et la récompense de l'étage atteint
    }
    const sim = gain / N;
    const ecart = Math.abs(sim - exact.gain) / exact.gain;
    assert.ok(ecart < 0.01,
      `consigne « encaisser dès l’étage ${T} » : exact ${exact.gain.toFixed(0)} jetons, simulé ${sim.toFixed(0)} — écart ${(ecart * 100).toFixed(2)} %`);
  }
});

test('sans multiplicateur, le moteur retrouve exactement son calcul d’avant', () => {
  // Le gain d'une consigne se réduit alors à la seule récompense de l'étage
  // d'arrivée, recalculée ici à la main depuis la loi d'atterrissage.
  for (const T of [2, 4, 7]) {
    const st = run(ctx, `ftThresholdStats(AREA_SANS_LOT, TOK, ${T})`);
    const land = run(ctx, `ftClimbStats(AREA_SANS_LOT, ${T}).land[1]`);
    let attendu = 0;
    for (const f in land) attendu += land[f] * (TOK[f] || 0);
    assert.ok(Math.abs(st.gain - attendu) < 1e-9,
      `étage ${T} : ${st.gain} au lieu de ${attendu}`);
    // …et le lot ne doit jamais toucher les COÛTS, qui ne dépendent que des dés.
    assert.ok(Math.abs(st.cost - run(ctx, `ftThresholdStats(AREA, TOK, ${T}).cost`)) < 1e-9,
      'le lot d’échec a déplacé un coût de montée');
  }
});

test('l’espérance d’un budget fini compte le lot — cas calculable à la main', () => {
  /* Cinq amulettes à l'étage 1 : une seule exploration possible, et plus rien
     après. Soit elle monte (probabilité 10 %) et on encaisse l'étage atteint,
     soit elle rate (90 %) et elle paie 10 x 5 = 50 jetons.
       V = 0,1 x (0,8x140 + 0,1967x300 + 0,0033x850) + 0,9 x 50 */
  const J = AREA.jump, P = AREA.pity[0], lot = AREA.failMult * AREA.cost[1];
  const attendu = P * (J[1] * TOK[2] + J[2] * TOK[3] + J[3] * TOK[4]) + (1 - P) * lot;
  const moteur = run(ctx, 'ftFiniteValue(AREA, TOK, 5, 1, 0).tokens');
  assert.ok(Math.abs(moteur - attendu) < 1e-9,
    `moteur ${moteur.toFixed(4)} jetons, calcul à la main ${attendu.toFixed(4)}`);

  // Et sans le lot, la même situation ne vaut que la branche qui monte.
  const sansLot = run(ctx, 'ftFiniteValue(AREA_SANS_LOT, TOK, 5, 1, 0).tokens');
  assert.ok(Math.abs(sansLot - P * (J[1] * TOK[2] + J[2] * TOK[3] + J[3] * TOK[4])) < 1e-9);
});

test('le lot ne peut ni manquer ni dépasser ce que le budget permet', () => {
  // Encadrement : le lot ajoute au plus 10 jetons par amulette (si TOUT ratait),
  // et jamais moins que rien. Une erreur de branche sort de cet encadrement.
  for (const b of [50, 219, 391]) {
    const avec = run(ctx, `ftFiniteValue(AREA, TOK, ${b}, 1, 0).tokens`);
    const sans = run(ctx, `ftFiniteValue(AREA_SANS_LOT, TOK, ${b}, 1, 0).tokens`);
    assert.ok(avec > sans, `budget ${b} : le lot ne rapporte rien`);
    assert.ok(avec - sans <= AREA.failMult * b + 1e-9,
      `budget ${b} : le lot rapporte ${(avec - sans).toFixed(0)} jetons, plus que les ${AREA.failMult * b} d’un budget entièrement raté`);
  }
});
