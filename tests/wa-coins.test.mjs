/* ==========================================================================
   Coût en pièces des recherches — wa_optimizer.suggest({ coinBudget })

   Chaque niveau porte un `levels[].coin`, et les pièces servent AUSSI à acheter
   de la poussière par échange. Ce fichier couvre la contrainte elle-même ; le
   partage de la bourse entre recherches et échanges, lui, vit dans la page
   (`recompute`), et ce qui s'en teste hors navigateur est rejoué ici à
   l'identique — c'est exactement là que deux bugs s'étaient glissés.
   ========================================================================== */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const { suggest, planTrades } = require(path.join(ROOT, 'js/wa_optimizer.js'));
const db = require(path.join(ROOT, 'data/truegold_war_db.json'));

const base = {
  db, currentLevels: {}, waLevel: 5, speedBonusPct: 76.5,
  enabledTrees: ['infantry', 'archer', 'cavalry'], mode: 'kvk',
  dustBudget: 5000, speedupBudget: 30 * 1440,
};
// Le coût en pièces resommé depuis la base, pour ne pas croire le total sur parole.
const coinsDepuisLaBase = (res) => res.steps.reduce((acc, s) => {
  const r = db.trees.find(t => t.id === s.treeId).researches.find(x => x.id === s.researchId);
  const lv = r.levels.find(l => l.level === s.toLevel);
  return acc + ((lv && lv.coin) || 0);
}, 0);

test('sans budget de pièces, le plan est celui d’avant l’ajout de la contrainte', () => {
  const libre = suggest({ ...base, coinBudget: null });
  const large = suggest({ ...base, coinBudget: 99_000_000 });
  assert.equal(libre.totals.kvkPoints, large.totals.kvkPoints);
  assert.equal(libre.totals.count, large.totals.count);
});

test('le total en pièces annoncé est bien celui des niveaux du plan', () => {
  const r = suggest({ ...base, coinBudget: null });
  assert.ok(r.totals.coins > 0, 'un plan de cette taille coûte forcément des pièces');
  assert.equal(r.totals.coins, coinsDepuisLaBase(r));
});

test('le budget de pièces borne réellement le plan, et n’est jamais dépassé', () => {
  const plein = suggest({ ...base, coinBudget: null }).totals.coins;
  for (const budget of [plein, Math.floor(plein / 2), 100_000, 20_000, 0]) {
    const r = suggest({ ...base, coinBudget: budget });
    assert.ok(r.totals.coins <= budget, `${r.totals.coins} > ${budget}`);
    assert.equal(r.totals.coins, coinsDepuisLaBase(r));
  }
  assert.equal(suggest({ ...base, coinBudget: 0 }).totals.count, 0);
});

test('moins de pièces ne donne jamais un plan plus gros', () => {
  let precedent = Infinity;
  for (const budget of [2_000_000, 800_000, 400_000, 200_000, 50_000]) {
    const n = suggest({ ...base, coinBudget: budget }).totals.count;
    assert.ok(n <= precedent, `${n} niveaux avec ${budget} pièces, contre ${precedent} avec plus`);
    precedent = n;
  }
});

test('les pièces d’un niveau laissé « en cours » sont payées en entier', () => {
  // Accélérateurs trop courts : la dernière recherche reste inachevée, mais en jeu ses
  // ressources sont déjà débitées au lancement — comme la poussière l’est déjà ici.
  const r = suggest({ ...base, speedupBudget: 600, coinBudget: null });
  assert.ok(r.inProgress, 'ce scénario doit bien laisser une recherche en cours');
  assert.equal(r.totals.coins, coinsDepuisLaBase(r));
});

/* ---- le partage de la bourse, rejoué comme la page le fait ---- */
const P = 5000;
function partage(st) {
  const use = st.use || { coins: true, tg5: true, tg10: false };
  const dustTG = planTrades(null, { coins: 0, truegold: st.tg, usedTg5: st.usedTg5 || 0, use }).dust;
  const lancer = (n) => {
    const stock = { coins: n * P, truegold: st.tg, usedCoins: 0, usedTg5: st.usedTg5 || 0, use };
    const res = suggest({ ...base, waLevel: st.wa, mode: st.mode || 'kvk',
      dustBudget: st.dust + dustTG + n, speedupBudget: st.acc * 1440,
      coinBudget: st.coins > 0 ? st.coins - n * P : null });
    const manque = Math.max(0, res.totals.effDust - st.dust);
    const trades = manque > 0 ? planTrades(manque, stock) : null;
    return { n, res, tg: trades ? trades.truegold : 0,
             pieces: (res.totals.coins || 0) + (trades ? trades.coins : 0) };
  };
  // même départage que `meilleurPlan` : score, puis le moins de TrueGold, puis de pièces
  const mieux = (a, b) => !b
    || a.res.totals.kvkPoints > b.res.totals.kvkPoints
    || (a.res.totals.kvkPoints === b.res.totals.kvkPoints && a.tg < b.tg)
    || (a.res.totals.kvkPoints === b.res.totals.kvkPoints && a.tg === b.tg && a.pieces < b.pieces);
  const nMax = Math.min(Math.floor(st.coins / P), 200);
  let best = null;
  for (let n = 0; n <= nMax; n++) { const e = lancer(n); if (mieux(e, best)) best = e; }
  return best;
}

test('des pièces qui dorment ne doivent jamais coûter du TrueGold', () => {
  // Le bug : à score égal, le départage préférait le plan qui dépense le moins de
  // PIÈCES — donc celui qui brûle le plus de TrueGold. 100 TG convertis alors que
  // 1 000 000 de pièces attendaient, là où 30 TG suffisaient pour le même score.
  const b = partage({ wa: 10, dust: 0, coins: 1_000_000, tg: 100, acc: 2 });
  assert.ok(b.tg < 100, `TrueGold dépensé : ${b.tg}, alors que les pièces pouvaient payer`);
  const sansPieces = partage({ wa: 10, dust: 0, coins: 0, tg: 100, acc: 2 });
  assert.equal(sansPieces.res.totals.kvkPoints, b.res.totals.kvkPoints,
    'le score doit être le même : seul le partage change');
});

test('le partage retenu est toujours payable', () => {
  for (const st of [{ wa: 10, dust: 0, coins: 1_000_000, tg: 100, acc: 2 },
                    { wa: 7, dust: 500, coins: 300_000, tg: 0, acc: 30 },
                    { wa: 5, dust: 0, coins: 50_000, tg: 300, acc: 10 }]) {
    const b = partage(st);
    assert.ok(b.pieces <= st.coins, `${b.pieces} pièces dépensées pour ${st.coins} déclarées`);
    assert.ok(b.tg <= st.tg, `${b.tg} TrueGold dépensés pour ${st.tg} déclarés`);
  }
});
