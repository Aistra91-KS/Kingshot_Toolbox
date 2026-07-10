// ============================================================
//  wa_optimizer.js  —  TrueGold War Academy suggestion engine
//  Pure logic, NO DOM. Usable in the browser (window.WA_Optimizer)
//  and in Node (module.exports) for the test harness.
//
//  Hard constraint  : Truegold Dust budget (always).
//  Speedups / time  : hard constraint in Classic mode only;
//                      informational in KvK and Target modes.
//
//  KvK scoring (spec): 1000 pts / dust  +  60 pts / speedup-minute.
//  Points are computed on the BASE (nominal) dust & time of each level.
//  Cost/speed bonuses reduce what the PLAYER spends (budget + readout),
//  not the nominal value that scores points. Flip SCORE_ON_EFFECTIVE
//  to score on the reduced values instead.
// ============================================================

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WA_Optimizer = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  'use strict';

  const SCORE_ON_EFFECTIVE = false; // false = score nominal cost; true = score post-bonus cost
  const PTS_PER_DUST = 1000;
  const PTS_PER_MIN  = 60;

  const key = (treeId, resId) => treeId + '.' + resId;

  // Build fast lookup: state[key] = { treeId, res, level }, and a levels index.
  function buildState(db, currentLevels, enabledTrees) {
    const state = {};
    const trees = db.trees.filter(t => !enabledTrees || enabledTrees.includes(t.id));
    for (const tree of trees) {
      for (const res of tree.researches) {
        const k = key(tree.id, res.id);
        const cur = Math.max(0, Math.min(res.maxLevel, Number(currentLevels[k]) || 0));
        state[k] = { treeId: tree.id, res, level: cur };
      }
    }
    return state;
  }

  // Level object for research at level L (1-indexed). Returns null if OOB.
  function levelObj(res, L) {
    return res.levels.find(l => l.level === L) || null;
  }

  // Is research's next level completable right now?
  // (WA gate met, all same-tree cross prereqs met, next level exists)
  function nextUnlockable(entry, state, waLevel) {
    const { treeId, res, level } = entry;
    const L = level + 1;
    if (L > res.maxLevel) return null;
    const lvl = levelObj(res, L);
    if (!lvl) return null;
    if ((lvl.reqWA || 0) > waLevel) return null;
    for (const dep of (lvl.req || [])) {
      const depEntry = state[key(treeId, dep.r)];
      // If the prerequisite research isn't tracked (tree disabled), block it.
      if (!depEntry || depEntry.level < dep.lvl) return null;
    }
    return lvl;
  }

  // Priority comparators per mode. Higher score = picked first.
  // We return a number; the loop selects the max.
  function priority(mode, effDust, baseDust, baseTime) {
    if (mode === 'classic') {
      // cheapest first (max count) -> invert dust; tie-break shorter time
      return -(effDust * 1e6) - baseTime;
    }
    // kvk & target: most score per dust -> favors time-dense levels
    // score/dust = PTS_PER_DUST + PTS_PER_MIN * baseTime / effDust
    const d = Math.max(1, effDust);
    return PTS_PER_DUST + (PTS_PER_MIN * baseTime) / d;
  }

  function suggest(opts) {
    const db            = opts.db;
    const currentLevels = opts.currentLevels || {};
    const waLevel       = Number(opts.waLevel) || 0;
    const dustBudget    = opts.dustBudget == null ? Infinity : Math.max(0, Number(opts.dustBudget) || 0);
    const speedPct      = Math.max(0, Number(opts.speedBonusPct) || 0);
    const costRedPct    = Math.min(95, Math.max(0, Number(opts.costReductionPct) || 0));
    const enabledTrees  = opts.enabledTrees || null;
    const mode          = opts.mode || 'classic';
    const targetScore   = Math.max(0, Number(opts.targetScore) || 0);
    const speedupBudget = opts.speedupBudget == null ? Infinity : Math.max(0, Number(opts.speedupBudget) || 0);

    const speedFactor = 1 + speedPct / 100;         // time_eff = base / factor
    const costFactor  = 1 - costRedPct / 100;        // dust_eff = ceil(base * factor)
    const effDustOf   = (base) => Math.max(0, Math.ceil(base * costFactor));
    const effTimeOf   = (base) => Math.round(base / speedFactor);

    const state = buildState(db, currentLevels, enabledTrees);

    const steps = [];
    let spentDust = 0, spentEffDust = 0, spentBaseTime = 0, spentEffTime = 0;
    let score = 0; // KvK points accumulated (nominal or effective per flag)

    // Safety cap: total levels across trees is small (<=264); avoid infinite loops.
    const HARD_CAP = 100000;
    let iter = 0;

    while (iter++ < HARD_CAP) {
      // Build current frontier
      let best = null, bestPri = -Infinity;
      for (const k in state) {
        const entry = state[k];
        const lvl = nextUnlockable(entry, state, waLevel);
        if (!lvl) continue;
        const baseDust = lvl.dust || 0;
        const eff = effDustOf(baseDust);
                // Budget checks: dust is always hard; time is hard in classic mode only
        if (spentEffDust + eff > dustBudget) continue;
        if (mode === 'classic') {
          const effTime = effTimeOf(lvl.time || 0);
          if (spentEffTime + effTime > speedupBudget) continue;
        }
        const pri = priority(mode, eff, baseDust, lvl.time || 0);
        if (pri > bestPri) { bestPri = pri; best = { entry, lvl, eff, baseDust }; }
      }

      if (!best) break; // frontier empty or nothing affordable

      // Commit the pick
      const { entry, lvl, eff, baseDust } = best;
      const baseTime = lvl.time || 0;
      const effTime  = effTimeOf(baseTime);
      const scoreDust = SCORE_ON_EFFECTIVE ? eff : baseDust;
      const scoreTime = SCORE_ON_EFFECTIVE ? effTime : baseTime;
      const stepPts   = PTS_PER_DUST * scoreDust + PTS_PER_MIN * scoreTime;

      entry.level = lvl.level;
      spentDust     += baseDust;
      spentEffDust  += eff;
      spentBaseTime += baseTime;
      spentEffTime  += effTime;
      score         += stepPts;

      steps.push({
        treeId: entry.treeId,
        researchId: entry.res.id,
        name: entry.res.name,
        toLevel: lvl.level,
        fromLevel: lvl.level - 1,
        maxLevel: entry.res.maxLevel,
        baseDust, effDust: eff,
        baseTime, effTime,
        points: stepPts,
        buff: lvl.buff || '',
      });

      // Target mode: stop as soon as the target score is reached
      if (mode === 'target' && targetScore > 0 && score >= targetScore) break;
    }

    const kvkFromDust = PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? spentEffDust : spentDust);
    const kvkFromTime = PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? spentEffTime : spentBaseTime);

    return {
      mode,
      steps,
      totals: {
        count: steps.length,
        baseDust: spentDust,
        effDust: spentEffDust,      // what the player actually spends
        baseTimeMin: spentBaseTime,
        effTimeMin: spentEffTime,   // what the player actually waits (after speed)
        kvkPoints: kvkFromDust + kvkFromTime,
        kvkFromDust, kvkFromTime,
      },
      remaining: {
        dust: dustBudget === Infinity ? null : Math.max(0, dustBudget - spentEffDust),
        time: speedupBudget === Infinity ? null : Math.max(0, speedupBudget - spentEffTime),
      },
      target: mode === 'target' ? {
        requested: targetScore,
        reached: targetScore > 0 ? (kvkFromDust + kvkFromTime) >= targetScore : null,
      } : null,
    };
  }

  return { suggest, SCORE_ON_EFFECTIVE, PTS_PER_DUST, PTS_PER_MIN };
}));
