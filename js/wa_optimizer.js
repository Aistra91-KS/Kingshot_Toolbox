// ============================================================
//  wa_optimizer.js  —  TrueGold War Academy suggestion engine
//  Pure logic, NO DOM. Usable in the browser (window.WA_Optimizer)
//  and in Node (module.exports) for the test harness.
//
//  Hard constraint  : Truegold Dust budget (always).
//  Speedups / time  : hard constraint in Classic mode only;
//                      informational in KvK and Target modes.
//
//  Research queue   : the War Academy researches ONE thing at a time, so the
//                      plan completes researches sequentially (finishing the one
//                      in progress before starting another). This guarantees at
//                      most ONE research is ever left unfinished by resources —
//                      returned as `inProgress`. Prerequisites are always driven
//                      to max first, which unlocks every dependent level.
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
    let inProgressKey = null; // the single research left unfinished by a resource limit

    // Highest level a research can currently reach (WA gate + prereq levels), walking up.
    function reachable(entry) {
      let L = entry.level;
      while (L < entry.res.maxLevel) {
        const nx = levelObj(entry.res, L + 1);
        if (!nx || (nx.reqWA || 0) > waLevel) break;
        let ok = true;
        for (const dep of (nx.req || [])) {
          const de = state[key(entry.treeId, dep.r)];
          if (!de || de.level < dep.lvl) { ok = false; break; }
        }
        if (!ok) break;
        L++;
      }
      return L;
    }
    // Remaining effective dust & KvK points to drive a research to its reachable ceiling.
    function remaining(entry) {
      let dust = 0, pts = 0;
      const top = reachable(entry);
      for (let L = entry.level + 1; L <= top; L++) {
        const lv = levelObj(entry.res, L); if (!lv) break;
        const bd = lv.dust || 0, bt = lv.time || 0;
        dust += effDustOf(bd);
        pts += PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? effDustOf(bd) : bd)
             + PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? effTimeOf(bt) : bt);
      }
      return { dust, pts };
    }
    // Priority for choosing which research to START next (only when none is in progress).
    function startScore(entry) {
      const r = remaining(entry);
      if (mode === 'classic') {                            // most levels: cheapest next level first
        const nx = levelObj(entry.res, entry.level + 1);
        return nx ? -effDustOf(nx.dust || 0) : -Infinity;
      }
      return r.pts / Math.max(1, r.dust);                 // kvk & target -> best points per dust
    }
    const affordable = (nl) =>
      spentEffDust + effDustOf(nl.dust || 0) <= dustBudget &&
      (mode !== 'classic' || spentEffTime + effTimeOf(nl.time || 0) <= speedupBudget);

    const HARD_CAP = 100000;
    let iter = 0;
    let stack = []; // chain of {k, needLevel}; top = research we're currently completing.
                     // needLevel is set when pushed as a blocker (pop as soon as reached);
                     // null for the freely-chosen root (pop only when maxed/permanently gated).

    // If `entry`'s next level is gated by an unmet same-tree prereq, return
    // {key, needLevel} for that prereq (to research it first); otherwise null.
    function blockingPrereq(entry) {
      const nl = levelObj(entry.res, entry.level + 1);
      if (!nl) return null; // maxed
      for (const dep of (nl.req || [])) {
        const de = state[key(entry.treeId, dep.r)];
        if (de && de.level < dep.lvl) return { k: key(entry.treeId, dep.r), needLevel: dep.lvl };
      }
      return null;
    }

    while (iter++ < HARD_CAP) {
      // Researches whose NEXT level is unlockable right now (deps + WA ok, not at max).
      const cands = [];
      for (const k in state) {
        const nl = nextUnlockable(state[k], state, waLevel);
        if (nl) cands.push({ k, entry: state[k], nl });
      }
      if (!cands.length) break; // everything is maxed or gated — nothing more to do

      // KEY RULE: only ONE research chain is ever "in progress". If the current
      // research is blocked by an unmet same-tree prereq, push that prereq and
      // work on IT first (exactly like the in-game single research queue) — but
      // only until it reaches the level actually needed, then resume where we
      // left off. This guarantees at most ONE research is ever left unfinished.
      while (stack.length) {
        const top = stack[stack.length - 1];
        const topEntry = state[top.k];
        if (top.needLevel != null && topEntry.level >= top.needLevel) { stack.pop(); continue; } // unblocked its parent
        if (top.needLevel == null && topEntry.level >= topEntry.res.maxLevel) { stack.pop(); continue; } // root maxed
        const blocker = blockingPrereq(topEntry);
        if (blocker && blocker.k !== top.k && !stack.some(s => s.k === blocker.k)) { stack.push(blocker); continue; }
        break; // top is either unlockable now or genuinely resource-blocked
      }

      let chosen;
      if (stack.length) {
        const k2 = stack[stack.length - 1].k;
        chosen = cands.find(c => c.k === k2) || null;
        if (!chosen) { stack.pop(); continue; } // gated further (e.g. by WA) -> drop and reassess
      } else {
        // Nothing in progress: pick a new research to start (prefer already-partial ones).
        const started = cands.filter(c => c.entry.level > 0);
        const pool = started.length ? started : cands;
        pool.sort((a, b) => startScore(b.entry) - startScore(a.entry));
        chosen = pool[0];
        stack = [{ k: chosen.k, needLevel: null }];
      }

      if (!affordable(chosen.nl)) {
        if (chosen.entry.level > 0) { inProgressKey = chosen.k; break; } // resource-blocked -> stop (the ONE unfinished)
        const alt = cands.find(c => affordable(c.nl)); // haven't started it -> try a cheaper start
        if (!alt) break;
        chosen = alt; stack = [{ k: alt.k, needLevel: null }];
      }

      // Commit one level of the chosen research.
      const entry = chosen.entry, lvl = chosen.nl;
      const baseDust = lvl.dust || 0, baseTime = lvl.time || 0;
      const eff = effDustOf(baseDust), effTime = effTimeOf(baseTime);
      const scoreDust = SCORE_ON_EFFECTIVE ? eff : baseDust;
      const scoreTime = SCORE_ON_EFFECTIVE ? effTime : baseTime;
      const stepPts = PTS_PER_DUST * scoreDust + PTS_PER_MIN * scoreTime;

      entry.level = lvl.level;
      spentDust += baseDust; spentEffDust += eff;
      spentBaseTime += baseTime; spentEffTime += effTime;
      score += stepPts;

      steps.push({
        treeId: entry.treeId, researchId: entry.res.id, name: entry.res.name,
        toLevel: lvl.level, fromLevel: lvl.level - 1, maxLevel: entry.res.maxLevel,
        baseDust, effDust: eff, baseTime, effTime, points: stepPts, buff: lvl.buff || '',
      });
      // Stack popping (if this level satisfied a `needLevel`, or maxed the root)
      // is handled at the top of the next iteration's while-loop.

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
      inProgress: inProgressKey, // "treeId.researchId" of the single unfinished research, or null
      target: mode === 'target' ? {
        requested: targetScore,
        reached: targetScore > 0 ? (kvkFromDust + kvkFromTime) >= targetScore : null,
      } : null,
    };
  }

  return { suggest, SCORE_ON_EFFECTIVE, PTS_PER_DUST, PTS_PER_MIN };
}));
