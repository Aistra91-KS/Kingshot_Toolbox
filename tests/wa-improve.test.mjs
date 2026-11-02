/* ==========================================================================
   Affinage du plan KvK de l'Académie de guerre — wa_optimizer.improver

   La phase 1 (glouton, `suggest`) rend un plan tout de suite ; la page lance ensuite
   `improver(...).run(j)` pour chaque départ `j` dans des Web Workers, au plus 7,5 s.
   Ce fichier verrouille ce que la page suppose : un plan jouable, jamais moins bon que
   son départ, le même pour la même entrée, et proche de l'optimum exact.
   ========================================================================== */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const { suggest, improver, advancedTree, ADV_TREE_ID, PTS_PER_DUST, PTS_PER_TTG, PTS_PER_MIN } =
  require(path.join(ROOT, 'js/wa_optimizer.js'));
const baseDb = require(path.join(ROOT, 'data/truegold_war_db.json'));
const adv = advancedTree(require(path.join(ROOT, 'data/truegold_war_advanced_db.json')));
const db = { ...baseDb, trees: baseDb.trees.concat([adv]) };
const TOUS = ['infantry', 'archer', 'cavalry', ADV_TREE_ID];

function grain(seed) {
  return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}
// `riche` : beaucoup d'accélérateurs pour peu de poussière, l'autre régime du mode KvK.
function compte(rnd, riche) {
  const lv = {};
  for (const t of db.trees) for (const r of t.researches) {
    const avance = t.id === ADV_TREE_ID;
    if (rnd() < (avance ? 0.15 : 0.6)) lv[t.id + '.' + r.id] = Math.floor(rnd() * (r.maxLevel + 1) * (avance ? 0.3 : 1));
  }
  return {
    db, currentLevels: lv, waLevel: 5 + Math.floor(rnd() * 4), speedBonusPct: 40 + Math.floor(rnd() * 80),
    enabledTrees: TOUS, mode: 'kvk', coinBudget: null,
    dustBudget: riche ? 500 + Math.floor(rnd() * 12000) : Math.floor(rnd() * 30000),
    ttgBudget: Math.floor(rnd() * rnd() * 300),
    speedupBudget: Math.floor((riche ? 30 + rnd() * 300 : 5 + rnd() * 90) * 1440),
  };
}
const niveau = (treeId, resId, L) =>
  db.trees.find(t => t.id === treeId).researches.find(r => r.id === resId).levels.find(l => l.level === L);

// Rejoue un plan comme la page le présente : un niveau à la fois, palier et prérequis
// réunis, budgets tenus, un seul niveau « en cours » et lancé en dernier.
function verifierJouable(o, res) {
  const lv = { ...o.currentLevels };
  const cur = (t, r) => Number(lv[t + '.' + r]) || 0;
  let dust = 0, ttg = 0, coin = 0, temps = 0;
  res.steps.forEach((s, i) => {
    assert.equal(s.fromLevel, cur(s.treeId, s.researchId), 'un niveau à la fois, dans l\'ordre');
    const l = niveau(s.treeId, s.researchId, s.toLevel);
    assert.ok((l.reqWA || 0) <= o.waLevel, `${s.researchId} Lv.${s.toLevel} demande TG${l.reqWA}`);
    for (const q of l.req || []) assert.ok(cur(s.treeId, q.r) >= q.lvl, `${s.researchId} Lv.${s.toLevel} avant ${q.r} Lv.${q.lvl}`);
    if (s.partial) assert.equal(i, res.steps.length - 1, 'le niveau « en cours » est le dernier lancé');
    lv[s.treeId + '.' + s.researchId] = s.toLevel;
    dust += s.effDust; ttg += l.ttg || 0; coin += l.coin || 0; temps += s.effTime;
  });
  assert.ok(dust <= o.dustBudget, `${dust} poussières pour ${o.dustBudget}`);
  assert.ok(ttg <= o.ttgBudget, `${ttg} TTG pour ${o.ttgBudget}`);
  if (o.coinBudget != null) assert.ok(coin <= o.coinBudget, `${coin} pièces pour ${o.coinBudget}`);
  assert.ok(temps <= o.speedupBudget + res.steps.length, `${temps} minutes pour ${o.speedupBudget}`);
  assert.equal(res.totals.ttg, ttg);
  assert.equal(res.totals.effDust, dust);
  assert.equal(res.totals.kvkPoints, res.totals.kvkFromDust + res.totals.kvkFromTtg + res.totals.kvkFromTime);
  assert.equal(res.totals.kvkFromDust, PTS_PER_DUST * res.totals.effDust);
  assert.equal(res.totals.kvkFromTtg, PTS_PER_TTG * res.totals.ttg);
}

// Optimum exact de ces 8 comptes (`compte(grain(2026), i % 2 === 1)`), calculé à part
// par programmation linéaire en nombres entiers (solveur HiGHS, écart toléré 0,01 %) sur
// le même modèle : poussière et TTG payés au lancement, un seul niveau « en cours ».
// `borne` est la borne du solveur : aucun plan jouable ne peut la dépasser.
const OPTIMUM = [
  { opt: 14958360, borne: 14959020 }, { opt: 5506140, borne: 5506640 },
  { opt: 6810970, borne: 6811360 },   { opt: 1126000, borne: 1126100 },
  { opt: 14821210, borne: 14822210 }, { opt: 13314040, borne: 13314040 },
  { opt: 16297010, borne: 16298010 }, { opt: 7117780, borne: 7118490 },
];

test('affinage : à moins de 0,5 % de l\'optimum exact en moyenne, avec 4 départs', () => {
  const rnd = grain(2026);
  let ecart1 = 0, ecart2 = 0;
  OPTIMUM.forEach((ref, i) => {
    const o = compte(rnd, i % 2 === 1);
    const p0 = suggest(o);
    const imp = improver(o, p0, { starts: 4 });
    let best = p0;
    for (let j = 0; j < imp.count; j++) {
      const run = imp.run(j);
      assert.ok(!run.anomalie, `compte ${i}, départ ${j} : anomalie ${run.anomalie}`);
      const r = run.plan;
      verifierJouable(o, r);
      assert.ok(r.totals.kvkPoints <= ref.borne, `compte ${i} : ${r.totals.kvkPoints} au-dessus de la borne ${ref.borne}`);
      if (r.totals.kvkPoints > best.totals.kvkPoints) best = r;
    }
    ecart1 += 1 - p0.totals.kvkPoints / ref.opt;
    ecart2 += 1 - best.totals.kvkPoints / ref.opt;
    assert.ok(1 - best.totals.kvkPoints / ref.opt < 0.02, `compte ${i} : ${best.totals.kvkPoints} pour un optimum de ${ref.opt}`);
  });
  ecart1 /= OPTIMUM.length; ecart2 /= OPTIMUM.length;
  // Sans ce contrôle, un affinage qui ne fait rien passerait : la phase 1 reste à ~3,5 %.
  assert.ok(ecart1 > 0.01, `la phase 1 est déjà à ${(100 * ecart1).toFixed(2)} % : le banc ne prouve plus rien`);
  assert.ok(ecart2 < 0.005, `écart moyen à l'optimum : ${(100 * ecart2).toFixed(2)} %`);
});

test('affinage : jamais moins bon que son départ, plan jouable, budgets de pièces tenus', () => {
  const rnd = grain(41);
  let gagne = 0;
  for (let i = 0; i < 10; i++) {
    const o = compte(rnd, i % 2 === 0);
    if (i % 3 === 0) o.coinBudget = Math.floor(rnd() * 2e6);
    if (i % 4 === 1) o.enabledTrees = ['infantry', 'archer', 'cavalry'];
    if (i % 4 === 3) o.enabledTrees = [ADV_TREE_ID];
    const p0 = suggest(o);
    const imp = improver(o, p0, { starts: 2, iters: 600 });
    const r = imp.run(0);
    assert.ok(!r.anomalie, `compte ${i} : anomalie ${r.anomalie}`);
    verifierJouable(o, r.plan);
    assert.ok(r.plan.totals.kvkPoints >= p0.totals.kvkPoints, `compte ${i} : ${r.plan.totals.kvkPoints} < ${p0.totals.kvkPoints}`);
    assert.equal(r.gained, r.plan.totals.kvkPoints > p0.totals.kvkPoints);
    // Les arbres décochés restent hors du plan.
    for (const s of r.plan.steps) assert.ok(o.enabledTrees.includes(s.treeId), `${s.treeId} n'est pas coché`);
    if (r.gained) gagne++;
  }
  assert.ok(gagne > 0, 'aucun départ n\'a rien gagné : le test ne vérifierait rien');
});

test('affinage : même entrée, même plan (graine fixée par départ)', () => {
  const o = compte(grain(7), false);
  const p0 = suggest(o);
  const a = improver(o, p0, { starts: 3, iters: 400 }).run(2).plan;
  const b = improver(o, p0, { starts: 3, iters: 400 }).run(2).plan;
  assert.deepEqual(b.steps, a.steps);
  assert.equal(b.totals.kvkPoints, a.totals.kvkPoints);
});

test('affinage : réservé au mode KvK, et le temps des niveaux suit le bonus de vitesse', () => {
  const o = compte(grain(9), false);
  assert.equal(improver({ ...o, mode: 'classic' }, suggest({ ...o, mode: 'classic' })).count, 0);
  assert.equal(improver({ ...o, mode: 'target', targetScore: 1e6 }, suggest({ ...o, mode: 'target', targetScore: 1e6 })).count, 0);
  const p0 = suggest(o);
  const r = improver(o, p0, { starts: 1, iters: 300 }).run(0).plan;
  for (const s of r.steps) {
    if (s.partial) continue;
    assert.equal(s.effTime, Math.round(niveau(s.treeId, s.researchId, s.toLevel).time / (1 + o.speedBonusPct / 100)));
  }
  assert.equal(r.totals.kvkFromTime, PTS_PER_MIN * r.steps.reduce((a, s) => a + s.effTime, 0));
});
