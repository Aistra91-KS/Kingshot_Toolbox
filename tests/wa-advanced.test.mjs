/* ==========================================================================
   Arbre avancé de l'Académie de guerre — wa_optimizer.advancedTree + suggest

   Les 92 recherches avancées (TG5 à TG8) entrent dans le même plan que les trois
   arbres de base : une seule réserve de poussière, de TTG, de pièces et
   d'accélérateurs. Le TTG rapporte 30 000 points KvK, comme sur la page TrueGold.
   ========================================================================== */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const { suggest, advancedTree, ADV_TREE_ID, PTS_PER_DUST, PTS_PER_TTG, PTS_PER_MIN } =
  require(path.join(ROOT, 'js/wa_optimizer.js'));
const baseDb = require(path.join(ROOT, 'data/truegold_war_db.json'));
const rawAdv = require(path.join(ROOT, 'data/truegold_war_advanced_db.json'));

const adv = advancedTree(rawAdv);
const db = { ...baseDb, trees: baseDb.trees.concat([adv]) };
const TOUS = ['infantry', 'archer', 'cavalry', ADV_TREE_ID];

// Générateur grainé : un échec est un vrai écart, pas un tirage malchanceux.
function grain(seed) {
  return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}
function scenario(rnd) {
  const lv = {};
  for (const t of db.trees) for (const r of t.researches) {
    const avance = t.id === ADV_TREE_ID;
    if (rnd() < (avance ? 0.15 : 0.6)) lv[t.id + '.' + r.id] = Math.floor(rnd() * (r.maxLevel + 1) * (avance ? 0.3 : 1));
  }
  return {
    db, currentLevels: lv, waLevel: 5 + Math.floor(rnd() * 4), speedBonusPct: 40 + rnd() * 80,
    enabledTrees: TOUS, mode: ['kvk', 'classic', 'target'][Math.floor(rnd() * 3)],
    dustBudget: Math.floor(rnd() * 30000), ttgBudget: Math.floor(rnd() * rnd() * 600),
    speedupBudget: Math.floor((5 + rnd() * 90) * 1440), targetScore: Math.floor(rnd() * 3e7),
    coinBudget: rnd() < 0.5 ? null : Math.floor(rnd() * 3e6),
  };
}
const niveau = (treeId, resId, L) =>
  db.trees.find(t => t.id === treeId).researches.find(r => r.id === resId).levels.find(l => l.level === L);

test('la conversion garde les 92 recherches, les 1 010 niveaux et leurs coûts exacts', () => {
  assert.equal(adv.id, ADV_TREE_ID);
  assert.equal(adv.researches.length, 92);
  assert.equal(adv.researches.reduce((a, r) => a + r.levels.length, 0), 1010);
  const ids = new Set(adv.researches.map(r => r.id));
  rawAdv.techs.forEach(tech => {
    const r = adv.researches.find(x => x.id === tech.id);
    tech.levels.forEach((l, i) => {
      const o = r.levels[i];
      assert.equal(o.dust, l.dust); assert.equal(o.ttg, l.ttg); assert.equal(o.time, l.time);
      assert.equal(o.coin, l.gold, 'l\'or de l\'arbre avancé est la monnaie des pièces');
      assert.equal(o.reqWA, l.reqWA);
      o.req.forEach(q => assert.ok(ids.has(q.r), `prérequis inconnu ${q.r}`));
    });
  });
});

test('sans arbre avancé coché, le plan est exactement celui des trois arbres de base', () => {
  const rnd = grain(3);
  for (let i = 0; i < 40; i++) {
    const o = scenario(rnd);
    const seul = suggest({ ...o, db: baseDb, enabledTrees: ['infantry', 'archer', 'cavalry'], ttgBudget: null });
    const avec = suggest({ ...o, enabledTrees: ['infantry', 'archer', 'cavalry'] });
    assert.equal(avec.totals.kvkPoints, seul.totals.kvkPoints);
    assert.deepEqual(avec.steps.map(s => s.researchId + s.toLevel), seul.steps.map(s => s.researchId + s.toLevel));
    assert.equal(avec.totals.ttg, 0);
  }
});

test('plan jouable : palier de l\'Académie et prérequis réunis à chaque niveau, budgets tenus', () => {
  const rnd = grain(17);
  let ttgVu = 0;
  for (let i = 0; i < 80; i++) {
    const o = scenario(rnd);
    const res = suggest(o);
    const lv = { ...o.currentLevels };
    const cur = (t, r) => Number(lv[t + '.' + r]) || 0;
    let ttg = 0, coin = 0;
    for (const s of res.steps) {
      assert.equal(s.fromLevel, cur(s.treeId, s.researchId), 'un niveau à la fois, dans l\'ordre');
      const l = niveau(s.treeId, s.researchId, s.toLevel);
      assert.ok((l.reqWA || 0) <= o.waLevel, `${s.researchId} Lv.${s.toLevel} demande TG${l.reqWA}`);
      for (const q of l.req || []) {
        assert.ok(cur(s.treeId, q.r) >= q.lvl, `${s.researchId} Lv.${s.toLevel} avant ${q.r} Lv.${q.lvl}`);
      }
      lv[s.treeId + '.' + s.researchId] = s.toLevel;
      ttg += l.ttg || 0; coin += l.coin || 0;
    }
    assert.equal(res.totals.ttg, ttg, 'le TTG annoncé est celui des niveaux du plan');
    assert.ok(ttg <= o.ttgBudget, `${ttg} TTG pour un stock de ${o.ttgBudget}`);
    assert.ok(res.totals.effDust <= o.dustBudget);
    if (o.coinBudget != null) assert.ok(coin <= o.coinBudget);
    ttgVu += ttg;
  }
  assert.ok(ttgVu > 0, 'aucun plan tiré n\'a dépensé de TTG : le test ne vérifierait rien');
});

test('les points KvK comptent 30 000 par TTG, en plus de la poussière et du temps', () => {
  const o = { db, currentLevels: {}, waLevel: 8, speedBonusPct: 76.5, enabledTrees: [ADV_TREE_ID],
              mode: 'kvk', dustBudget: 60000, ttgBudget: 2000, speedupBudget: 200 * 1440 };
  const r = suggest(o);
  assert.ok(r.totals.ttg > 0, 'ce budget doit atteindre les paliers à TTG');
  assert.equal(r.totals.kvkFromTtg, PTS_PER_TTG * r.totals.ttg);
  assert.equal(PTS_PER_TTG, 30000);
  assert.equal(r.totals.kvkPoints, r.totals.kvkFromDust + r.totals.kvkFromTtg + r.totals.kvkFromTime);
  assert.equal(r.totals.kvkFromDust, PTS_PER_DUST * r.totals.effDust);
  assert.equal(r.totals.kvkFromTime, PTS_PER_MIN * r.totals.effTimeMin);
});

test('sans TTG, aucun niveau qui en coûte ; avec plus de TTG, jamais moins de points', () => {
  const o = { db, currentLevels: {}, waLevel: 8, speedBonusPct: 76.5, enabledTrees: TOUS,
              mode: 'kvk', dustBudget: 60000, speedupBudget: 200 * 1440 };
  const zero = suggest({ ...o, ttgBudget: 0 });
  assert.equal(zero.totals.ttg, 0);
  assert.ok(zero.steps.every(s => !s.ttg));
  let prec = -1;
  for (const ttg of [0, 50, 200, 800]) {
    const p = suggest({ ...o, ttgBudget: ttg }).totals.kvkPoints;
    assert.ok(p >= prec, `${p} points avec ${ttg} TTG, contre ${prec} avec moins`);
    prec = p;
  }
});

test('KvK : le cas relevé par Codex, plus de TTG ne rapporte jamais moins (0 à 20 TTG)', () => {
  // Revue Codex de la PR #90 : 7 479 400 points avec 4 TTG, 7 460 400 avec 6 à 11 TTG.
  const o = { db, currentLevels: {}, waLevel: 8, speedBonusPct: 98, enabledTrees: TOUS,
              mode: 'kvk', dustBudget: 8504, speedupBudget: 42 * 1440, coinBudget: null };
  let prec = -1;
  for (let ttg = 0; ttg <= 20; ttg++) {
    const r = suggest({ ...o, ttgBudget: ttg });
    assert.ok(r.totals.kvkPoints >= prec, `${r.totals.kvkPoints} points avec ${ttg} TTG, contre ${prec} avec moins`);
    assert.ok(r.totals.ttg <= ttg, `${r.totals.ttg} TTG dépensés pour ${ttg} disponibles`);
    assert.equal(r.remaining.ttg, ttg - r.totals.ttg, 'le reste se compte sur le stock du joueur');
    prec = r.totals.kvkPoints;
  }
});

// Les comptes tirés au sort des deux tests suivants : niveaux de départ, palier, vitesse,
// poussière, accélérateurs et pièces.
function compte(rnd) {
  const lv = {};
  for (const t of db.trees) for (const r of t.researches) {
    const avance = t.id === ADV_TREE_ID;
    if (rnd() < (avance ? 0.15 : 0.6)) lv[t.id + '.' + r.id] = Math.floor(rnd() * (r.maxLevel + 1) * (avance ? 0.3 : 1));
  }
  const o = { db, currentLevels: lv, waLevel: 5 + Math.floor(rnd() * 4), speedBonusPct: 40 + rnd() * 80,
              enabledTrees: TOUS, mode: 'kvk', dustBudget: Math.floor(rnd() * 30000),
              speedupBudget: Math.floor((5 + rnd() * 90) * 1440),
              coinBudget: rnd() < 0.5 ? null : Math.floor(rnd() * 3e6) };
  rnd();
  return o;
}

test('KvK : le pire cas relevé, TG8 limité par les accélérateurs, de 40 à 60 TTG', () => {
  // Revue Codex de la PR #91 : les premiers rejeux ciblés laissaient 5 278 660 points à
  // 48 TTG et 4 969 660 à 54 sur ce compte (TG8, 3 487 poussières, 31 122 minutes).
  const rnd = grain(5);
  let o;
  for (let i = 0; i < 3; i++) o = compte(rnd);
  let prec = -1;
  for (let ttg = 40; ttg <= 60; ttg++) {
    const p = suggest({ ...o, ttgBudget: ttg }).totals.kvkPoints;
    assert.ok(p >= prec, `${p} points avec ${ttg} TTG, contre ${prec} avec moins`);
    prec = p;
  }
});

test('KvK : sur des comptes tirés au sort, un TTG de plus ne rapporte jamais moins', () => {
  // Garanti par construction (parcours des plafonds de TTG, wa_optimizer.js) : le plan
  // rendu est le meilleur que le glouton trouve pour un plafond quelconque sous le stock.
  // Graine 11 : les rejeux ciblés de la v1.15.1 y laissaient 4 budgets fautifs sur 200.
  const rnd = grain(11);
  for (let i = 0; i < 8; i++) {
    const o = compte(rnd);
    let meilleur = 0, a = 0;
    for (let ttg = 0; ttg <= 24; ttg++) {
      const p = suggest({ ...o, ttgBudget: ttg }).totals.kvkPoints;
      assert.ok(p >= meilleur, `compte ${i} : ${p} points avec ${ttg} TTG, contre ${meilleur} avec ${a}`);
      if (p > meilleur) { meilleur = p; a = ttg; }
    }
  }
});

test('KvK : `exact: false` saute le parcours des plafonds, sans jamais faire mieux', () => {
  // Les évaluations intermédiaires de la page s'en passent ; le plan affiché, lui, y passe.
  const o = { db, currentLevels: {}, waLevel: 8, speedBonusPct: 98, enabledTrees: TOUS,
              mode: 'kvk', dustBudget: 8504, speedupBudget: 42 * 1440, coinBudget: null, ttgBudget: 10 };
  const rapide = suggest({ ...o, exact: false }).totals.kvkPoints;
  const exact = suggest(o).totals.kvkPoints;
  assert.equal(rapide, 7476400, 'le glouton seul, tel que relevé par Codex');
  assert.equal(exact, 7479400, 'le parcours retrouve le plan à 4 TTG');
});

test('le palier de l\'Académie ferme l\'arbre avancé : rien avant TG5', () => {
  const o = { db, currentLevels: {}, waLevel: 4, speedBonusPct: 76.5, enabledTrees: TOUS,
              mode: 'kvk', dustBudget: 30000, ttgBudget: 500, speedupBudget: 60 * 1440 };
  assert.ok(suggest(o).steps.every(s => s.treeId !== ADV_TREE_ID));
  const tg6 = suggest({ ...o, waLevel: 6, enabledTrees: [ADV_TREE_ID] });
  assert.ok(tg6.steps.length > 0);
  assert.ok(tg6.steps.every(s => niveau(s.treeId, s.researchId, s.toLevel).reqWA <= 6));
});

test('KvK : la suggestion globale ne fait jamais moins bien que l\'onglet de base ni que l\'onglet avancé', () => {
  const rnd = grain(99);
  for (let i = 0; i < 60; i++) {
    const o = { ...scenario(rnd), mode: 'kvk', coinBudget: null };
    const globale = suggest({ ...o, enabledTrees: TOUS }).totals.kvkPoints;
    const base = suggest({ ...o, enabledTrees: ['infantry', 'archer', 'cavalry'] }).totals.kvkPoints;
    const avance = suggest({ ...o, enabledTrees: [ADV_TREE_ID] }).totals.kvkPoints;
    assert.ok(globale >= base, `globale ${globale} < base ${base}`);
    assert.ok(globale >= avance, `globale ${globale} < avancée ${avance}`);
  }
});
