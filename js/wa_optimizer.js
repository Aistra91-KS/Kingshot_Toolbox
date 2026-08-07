// ============================================================
//  wa_optimizer.js  —  TrueGold War Academy suggestion engine
//  Pure logic, NO DOM. Usable in the browser (window.WA_Optimizer)
//  and in Node (module.exports) for the test harness.
//
//  Hard constraints : BOTH the Truegold Dust budget and the speedup budget, in all
//                      three modes. (An older header said time only bound Classic mode —
//                      that has not been true for several versions: the speedup check in
//                      the main loop is not mode-gated, and waracademy.js always passes
//                      the budget in.)
//
//  Research queue   : the War Academy researches ONE thing at a time, so the
//                      plan completes researches sequentially (finishing the one
//                      in progress before starting another). This guarantees at
//                      most ONE research is ever left unfinished by resources —
//                      returned as `inProgress`.
//
//  Choosing what to research next is a greedy walk: no backtracking, one level of
//  lookahead at most. Several orderings are tried in KvK mode and the best-scoring
//  plan wins — see KVK_ORDERS and the 'chain' ordering, which is what lets the plan
//  invest in a prerequisite run instead of only ever buying the best next level.
//
//  KvK scoring (spec): 1000 pts / dust  +  30 pts / speedup-minute.
//  Points are computed on the EFFECTIVE dust & time actually spent by the
//  player: the speed bonus shortens the research, so fewer speedup-minutes
//  are consumed, which earns fewer time-based points (30 pts per speedup-
//  minute ACTUALLY used). Flip SCORE_ON_EFFECTIVE to false to score on the
//  nominal (base) values instead, independent of the player's bonuses.
// ============================================================

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WA_Optimizer = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  'use strict';

  const SCORE_ON_EFFECTIVE = true; // true = score on what the player actually spends (post-bonus); false = nominal cost
  const PTS_PER_DUST = 1000;
  const PTS_PER_MIN  = 30;

  const key = (treeId, resId) => treeId + '.' + resId;

  // Build fast lookup: state[key] = { treeId, res, level, byLevel }.
  // `byLevel` indexes a research's levels by level number, built once per plan: the
  // selection loop asks for them thousands of times and a linear scan there showed up
  // as the engine's hot spot.
  function buildState(db, currentLevels, enabledTrees) {
    const state = {};
    const trees = db.trees.filter(t => !enabledTrees || enabledTrees.includes(t.id));
    for (const tree of trees) {
      for (const res of tree.researches) {
        const k = key(tree.id, res.id);
        const cur = Math.max(0, Math.min(res.maxLevel, Number(currentLevels[k]) || 0));
        const byLevel = {};
        for (const l of res.levels) byLevel[l.level] = l;
        state[k] = { treeId: tree.id, res, level: cur, byLevel };
      }
    }
    return state;
  }

  // Level object for a research entry at level L (1-indexed). Returns null if OOB.
  function levelObj(entry, L) {
    return entry.byLevel[L] || null;
  }

  // Is research's next level completable right now?
  // (WA gate met, all same-tree cross prereqs met, next level exists)
  function nextUnlockable(entry, state, waLevel) {
    const { treeId, res, level } = entry;
    const L = level + 1;
    if (L > res.maxLevel) return null;
    const lvl = levelObj(entry, L);
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

  function runPlan(opts, orderStrategy) {
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
    let inProgressKey = null; // the single research left unfinished by a resource limit

    const affordable = (nl) => spentEffDust + effDustOf(nl.dust || 0) <= dustBudget;

    const HARD_CAP = 100000;
    let iter = 0;

    // Per-level value for choosing the next level (free switching, no lock).
    function levelScore(entry, nl) {
      const bd = nl.dust || 0, bt = nl.time || 0;
      const eff = effDustOf(bd);
      if (orderStrategy === 'classic') return -eff;               // cheapest next level -> most levels
      if (orderStrategy === 'dustdense') return bd / Math.max(1, bt); // max dust per time unit (time-bound regime)
      const pts = PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? eff : bd)
                + PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? effTimeOf(bt) : bt);
      return pts / Math.max(1, eff);       // 'kvk' & 'chain' -> best points per dust
    }

    // ---- 'chain' ordering: price a prerequisite chain as ONE purchase ------------------
    // Every other ordering rates a level on its own and simply IGNORES locked levels, so it
    // can never invest in a run of poor levels that opens a far better one. In this database
    // the troop-tier node is the best buy in the game (2765 pts/dust) but sits behind ~8600
    // dust of the *worst* levels (1631). Faced with three near-identical trees, the greedy
    // started all three chains and finished none.
    //
    // Here, a level locked by a PREREQUISITE (not by the War Academy gate, which cannot be
    // bought) is priced as a bundle: every missing level plus itself. The bundle's density
    // is carried by its first playable step. Because the part already paid for drops out of
    // the maths, a chain that has been started only gets more attractive each round — so the
    // plan finishes it instead of spreading thin.

    // Levels missing to bring `k` up to level `upTo`, prerequisites included.
    // Returns false if a War Academy gate blocks the way: that is not for sale.
    function collectNeeds(k, upTo, needs, guard) {
      if (guard.n++ > 500) return false;                      // cycle / runaway guard
      const e = state[k];
      if (!e || upTo > e.res.maxLevel) return false;
      if ((needs.get(k) || 0) >= upTo) return true;
      needs.set(k, upTo);
      for (let L = e.level + 1; L <= upTo; L++) {
        const o = levelObj(e, L);
        if (!o || (o.reqWA || 0) > waLevel) return false;
        for (const dep of (o.req || [])) {
          if (!collectNeeds(key(e.treeId, dep.r), dep.lvl, needs, guard)) return false;
        }
      }
      return true;
    }

    // Bundle leading to `entry`'s next (locked) level: total effective dust and time,
    // density, and the playable step to take first. null when the bundle is unreachable.
    function bundleFor(entry) {
      const needs = new Map();
      if (!collectNeeds(key(entry.treeId, entry.res.id), entry.level + 1, needs, { n: 0 })) return null;
      let dust = 0, time = 0, pts = 0, first = null, firstScore = -Infinity;
      for (const pair of needs) {
        const e = state[pair[0]], upTo = pair[1];
        for (let L = e.level + 1; L <= upTo; L++) {
          const o = levelObj(e, L);
          const ed = effDustOf(o.dust || 0), et = effTimeOf(o.time || 0);
          dust += ed; time += et;
          pts += PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? ed : (o.dust || 0))
               + PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? et : (o.time || 0));
        }
        // Entry point: a bundle member that is already playable. `upTo` matters — a
        // prerequisite that is ALREADY satisfied is still recorded (with zero cost), and
        // its next level lies outside the bundle. Taking that one would spend dust the
        // bundle never priced, so the affordability guard below would not cover it.
        // Among the genuine members we take the densest, so the plan reads best-first.
        const open = nextUnlockable(e, state, waLevel);
        if (open && open.level <= upTo) {
          const sc = levelScore(e, open);
          if (sc > firstScore) { firstScore = sc; first = { k: pair[0], entry: e, nl: open }; }
        }
      }
      if (!first || dust <= 0) return null;
      return { dust: dust, time: time, dens: pts / dust, first: first };
    }

    while (iter++ < HARD_CAP) {
      // All researches whose next level is unlockable AND affordable right now.
      let best = null, bestScore = -Infinity;
      for (const k in state) {
        const nl = nextUnlockable(state[k], state, waLevel);
        if (nl) {
          if (!affordable(nl)) continue;
          const sc = levelScore(state[k], nl);
          if (sc > bestScore) { bestScore = sc; best = { k, entry: state[k], nl }; }
        } else if (orderStrategy === 'chain') {
          const e = state[k];
          if (e.level >= e.res.maxLevel) continue;            // maxed out, nothing to unlock
          const b = bundleFor(e);
          if (!b) continue;
          // Commit ONLY if the whole chain fits in what is left — of BOTH budgets. Paying
          // for the poor levels and stopping before the payoff, whether out of dust or out
          // of speedups, is worse than not starting at all.
          if (spentEffDust + b.dust > dustBudget) continue;
          if (spentEffTime + b.time > speedupBudget) continue;
          if (!affordable(b.first.nl)) continue;
          if (b.dens > bestScore) { bestScore = b.dens; best = b.first; }
        }
      }
      if (!best) break; // nothing affordable/available left

      const entry = best.entry, lvl = best.nl;
      const baseDust = lvl.dust || 0, baseTime = lvl.time || 0;
      const eff = effDustOf(baseDust), effTime = effTimeOf(baseTime);
      const scoreDust = SCORE_ON_EFFECTIVE ? eff : baseDust;
      const scoreTime = SCORE_ON_EFFECTIVE ? effTime : baseTime;
      const stepPts = PTS_PER_DUST * scoreDust + PTS_PER_MIN * scoreTime;

      // TARGET mode: if the chosen (densest) level would overshoot, pick instead the
      // available level that lands CLOSEST to the target (least point overshoot, then
      // least dust), pay its dust in full, and apply speedups (time) only up to the
      // target. The level is left unfinished ("in progress").
      if (mode === 'target' && targetScore > 0 && score + stepPts > targetScore) {
        const ptsOf = (nl) => {
          const sd = SCORE_ON_EFFECTIVE ? effDustOf(nl.dust || 0) : (nl.dust || 0);
          const st = SCORE_ON_EFFECTIVE ? effTimeOf(nl.time || 0) : (nl.time || 0);
          return { d: PTS_PER_DUST * sd, t: PTS_PER_MIN * st };
        };
        let cross = best, bestOver = Infinity, bestDust = Infinity;
        for (const kk in state) {
          const nl = nextUnlockable(state[kk], state, waLevel);
          if (!nl || !affordable(nl)) continue;
          const p = ptsOf(nl);
          if (score + p.d + p.t < targetScore) continue;        // can't reach the target -> skip
          const over = Math.max(score + p.d, targetScore) - targetScore; // overshoot if dust alone passes it
          const du = nl.dust || 0;
          if (over < bestOver - 1e-9 || (Math.abs(over - bestOver) < 1e-9 && du < bestDust)) {
            bestOver = over; bestDust = du; cross = { k: kk, entry: state[kk], nl };
          }
        }
        const e2 = cross.entry, l2 = cross.nl;
        const bd = l2.dust || 0, bt = l2.time || 0;
        const ed = effDustOf(bd), et = effTimeOf(bt);
        const sd2 = SCORE_ON_EFFECTIVE ? ed : bd;
        const st2 = SCORE_ON_EFFECTIVE ? et : bt;
        const dustPts = PTS_PER_DUST * sd2;
        let frac = 0; // fraction of this level's time we actually apply
        if (score + dustPts < targetScore && st2 > 0) {
          frac = Math.min(1, ((targetScore - score - dustPts) / PTS_PER_MIN) / st2);
        }
        if (et > 0) frac = Math.min(frac, Math.max(0, speedupBudget - spentEffTime) / et); // can't exceed speedups
        const partBase = bt * frac, partEff = et * frac; // exact for accounting
        spentDust += bd; spentEffDust += ed;
        spentBaseTime += partBase; spentEffTime += partEff;
        score += dustPts + PTS_PER_MIN * st2 * frac;
        steps.push({
          treeId: e2.treeId, researchId: e2.res.id, name: e2.res.name,
          toLevel: l2.level, fromLevel: l2.level - 1, maxLevel: e2.res.maxLevel,
          baseDust: bd, effDust: ed, baseTime: Math.round(partBase), effTime: Math.round(partEff),
          points: Math.round(dustPts + PTS_PER_MIN * st2 * frac), buff: l2.buff || '',
          partial: true,
        });
        inProgressKey = cross.k; // this half-done level is the single "in progress" one
        break;
      }

      // SPEEDUP limit: if this level's full time exceeds the remaining speedups, apply
      // only what's left (partial) — this level becomes the single "in progress" one, then
      // stop. If instead DUST runs out, the loop simply ends above with every level
      // finished (no "in progress"): the limiting resource was dust.
      if (spentEffTime + effTime > speedupBudget) {
        const remEff = Math.max(0, speedupBudget - spentEffTime);
        const frac = effTime > 0 ? remEff / effTime : 0;
        const partBase = baseTime * frac, partEff = effTime * frac;
        spentDust += baseDust; spentEffDust += eff;
        spentBaseTime += partBase; spentEffTime += partEff;
        score += PTS_PER_DUST * scoreDust + PTS_PER_MIN * scoreTime * frac;
        steps.push({
          treeId: entry.treeId, researchId: entry.res.id, name: entry.res.name,
          toLevel: lvl.level, fromLevel: lvl.level - 1, maxLevel: entry.res.maxLevel,
          baseDust, effDust: eff, baseTime: Math.round(partBase), effTime: Math.round(partEff),
          points: Math.round(PTS_PER_DUST * scoreDust + PTS_PER_MIN * scoreTime * frac),
          buff: lvl.buff || '', partial: true,
        });
        inProgressKey = best.k;
        break;
      }

      entry.level = lvl.level;
      spentDust += baseDust; spentEffDust += eff;
      spentBaseTime += baseTime; spentEffTime += effTime;
      score += stepPts;

      steps.push({
        treeId: entry.treeId, researchId: entry.res.id, name: entry.res.name,
        toLevel: lvl.level, fromLevel: lvl.level - 1, maxLevel: entry.res.maxLevel,
        baseDust, effDust: eff, baseTime, effTime, points: stepPts, buff: lvl.buff || '',
      });

      if (mode === 'target' && targetScore > 0 && score >= targetScore) break;
    }

    const kvkFromDust = Math.round(PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? spentEffDust : spentDust));
    const kvkFromTime = Math.round(PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? spentEffTime : spentBaseTime));

    return {
      mode,
      steps,
      totals: {
        count: steps.length,
        baseDust: spentDust,
        effDust: spentEffDust,      // what the player actually spends
        baseTimeMin: Math.round(spentBaseTime),
        effTimeMin: Math.round(spentEffTime),   // what the player actually waits (after speed)
        kvkPoints: kvkFromDust + kvkFromTime,
        kvkFromDust, kvkFromTime,
      },
      remaining: {
        dust: dustBudget === Infinity ? null : Math.max(0, dustBudget - spentEffDust),
        time: speedupBudget === Infinity ? null : Math.max(0, Math.round(speedupBudget - spentEffTime)),
      },
      inProgress: inProgressKey, // "treeId.researchId" of the single unfinished research, or null
      target: mode === 'target' ? {
        requested: targetScore,
        reached: targetScore > 0 ? (kvkFromDust + kvkFromTime) >= targetScore - 0.5 : null,
      } : null,
    };
  }

  const KVK_ORDERS = ['kvk', 'classic', 'dustdense', 'chain'];

  // Public entry point. Classic uses the 'classic' order; target keeps the
  // 'kvk' order (its original behaviour). KVK evaluates several orderings and
  // returns the plan with the highest KVK score — this guarantees KVK >= Classic
  // (a pure points/dust greedy can otherwise underspend a bounded resource).
  //
  // KVK also replays every ordering on EACH SINGLE TREE. Not for the sake of trying
  // more combinations, but because the best plan genuinely concentrates: once the
  // troop-tier chain is in play, the optimum pours the dust into one tree and leaves
  // the others near zero (at 15 000 dust it puts 13 540 into a single tree). No greedy
  // spreading across three trees ever proposes that; the same greedy confined to one
  // tree does. Cost is bounded and known — 4 orderings x (1 + number of trees) runs.
  function suggest(opts) {
    const mode = (opts && opts.mode) || 'classic';
    if (mode === 'kvk') {
      const all = (opts.db.trees || []).map(t => t.id)
        .filter(id => !opts.enabledTrees || opts.enabledTrees.includes(id));
      const treeSets = [opts.enabledTrees || null];
      if (all.length > 1) for (const id of all) treeSets.push([id]);
      let best = null;
      for (const set of treeSets) {
        const o = (set === treeSets[0]) ? opts : Object.assign({}, opts, { enabledTrees: set });
        for (const order of KVK_ORDERS) {
          const p = runPlan(o, order);
          if (!best || p.totals.kvkPoints > best.totals.kvkPoints) best = p;
        }
      }
      return best;
    }
    return runPlan(opts, mode === 'target' ? 'kvk' : 'classic');
  }

  return { suggest, SCORE_ON_EFFECTIVE, PTS_PER_DUST, PTS_PER_MIN };
}));
