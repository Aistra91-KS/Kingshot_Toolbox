// ============================================================
//  wa_optimizer.js  —  TrueGold War Academy suggestion engine
//  Pure logic, NO DOM. Usable in the browser (window.WA_Optimizer)
//  and in Node (module.exports) for the test harness.
//
//  What each mode is FOR (settled by Aistra; do not "fix" one into the other):
//    - Classic / max researches : get the most researches done. It naturally spreads
//                      across trees, because cheap levels sit everywhere.
//    - KvK / max points         : get the most KvK points, full stop. If the best plan
//                      only ever touches ONE of the ticked trees, that is the right
//                      answer, not a bug — concentrating is often what wins (the
//                      troop-tier chain pays off only once it is finished). Ticking a
//                      tree says "you may use it", never "you must".
//    - Target score             : reach a score for the least cost.
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
//  KvK scoring (spec): 1000 pts / dust  +  30 000 pts / Tempered Truegold (TTG)
//  +  30 pts / speedup-minute. The TTG rate is the one of the TrueGold building
//  page (truegold_script.js): only the Advanced tree costs TTG, so for the three
//  Basic trees nothing changes.
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
  const PTS_PER_TTG  = 30000;
  // Un TTG rapporte autant de points que 30 poussières. Les ordres de sélection
  // mesurent donc un coût « en poussières » où chaque TTG pèse 30 : sans TTG,
  // la formule redonne exactement l'ancienne.
  const TTG_DUST_EQ  = PTS_PER_TTG / PTS_PER_DUST;

  const key = (treeId, resId) => treeId + '.' + resId;

  // ============================================================
  //  ARBRE AVANCÉ
  //  `truegold_war_advanced_db.json` n'a pas la forme des trois arbres de base :
  //  une seule liste de 92 recherches, des prérequis `{techId, level}`, l'or dans
  //  `gold`. On le ramène ici à un arbre de plus (`id: 'advanced'`), pour que le
  //  moteur le traite comme les autres et qu'un seul plan partage la poussière,
  //  le TTG et les accélérateurs entre les quatre arbres.
  //  L'or de l'arbre avancé est la même monnaie que les pièces de l'arbre de base
  //  (confirmé par Aistra) : il va dans `coin`, et la même bourse paie les deux.
  // ============================================================
  const ADV_TREE_ID = 'advanced';
  function troopOf(tech) {
    const e = (tech.effect && tech.effect.EN) || '';
    if (/^Infantry/.test(e)) return 'infantry';
    if (/^Cavalry/.test(e)) return 'cavalry';
    if (/^Archer/.test(e)) return 'archer';
    return null;
  }
  function buffOf(tech, lvl) {
    if (lvl.effectTotal == null) return '';
    const v = String(lvl.effectTotal).replace(/\.0+$/, '');
    const unit = tech.effectUnit === 'percent' ? '%' : '';
    return '+' + v + unit + ' ' + ((tech.effect && tech.effect.EN) || '');
  }
  function advancedTree(adv) {
    if (!adv || !Array.isArray(adv.techs)) return null;
    return {
      id: ADV_TREE_ID,
      name: { EN: 'Advanced', FR: 'Avancées' },
      researches: adv.techs.map(tech => ({
        id: tech.id,
        name: tech.name,
        maxLevel: tech.maxLevel,
        category: tech.category,
        tier: tech.tier,
        troop: troopOf(tech),
        effect: tech.effect,
        effectUnit: tech.effectUnit,
        levels: (tech.levels || []).map(l => ({
          level: l.level,
          dust: l.dust || 0,
          ttg: l.ttg || 0,
          time: l.time || 0,
          coin: l.gold || 0,
          bread: l.bread || 0, wood: l.wood || 0, stone: l.stone || 0, iron: l.iron || 0,
          reqWA: l.reqWA || 0,
          req: (l.req || []).map(x => ({ r: x.techId, lvl: x.level })),
          buff: buffOf(tech, l),
        })),
      })),
    };
  }

  // ============================================================
  //  ÉCHANGES DE POUSSIÈRE
  //  La poussière ne se ramasse pas qu'en jeu : trois échanges hebdomadaires en
  //  produisent, et le plan doit pouvoir compter dessus.
  //
  //    5 000 pièces   ->  1 poussière   (200 échanges / semaine)
  //    5 TrueGold     -> 13 poussières  ( 20 échanges / semaine)
  //   10 TrueGold     -> 13 poussières  (sans limite)
  //
  //  L'ORDRE DE CETTE LISTE EST L'ORDRE DE PRIORITÉ, et il n'est pas arbitraire :
  //   1. les pièces d'abord — c'est la seule monnaie qui ne serve à rien d'autre sur
  //      le site, la dépenser ne prive aucun autre plan ;
  //   2. l'échange à 5 TG ensuite : 2,6 poussières par TrueGold contre 1,3 pour celui
  //      à 10 TG. Il rend exactement le DOUBLE, donc le remplir avant l'autre est
  //      toujours gagnant — jamais l'inverse, quelle que soit la quantité voulue ;
  //   3. l'échange à 10 TG en dernier, celui qui n'a pas de plafond.
  //  Cet ordre minimise aussi le TrueGold dépensé à poussière égale, ce qui compte :
  //  le même TrueGold finance l'arbre des bâtiments sur l'autre page du site.
  // ============================================================
  const DUST_TRADES = [
    { id: 'coins', pay: 'coins',    price: 5000, dust: 1,  weeklyMax: 200,  usedKey: 'usedCoins' },
    { id: 'tg5',   pay: 'truegold', price: 5,    dust: 13, weeklyMax: 20,   usedKey: 'usedTg5'   },
    { id: 'tg10',  pay: 'truegold', price: 10,   dust: 13, weeklyMax: null, usedKey: null        },
  ];

  const posInt = (v) => Math.max(0, Math.floor(Number(v) || 0));

  // Les échanges à faire pour obtenir `needDust` poussières, au moindre TrueGold.
  // `needDust` à null = « tout ce que les stocks déclarés peuvent produire », ce qui
  // donne la capacité maximale (c'est elle qui étend le budget avant l'optimisation).
  //
  // `stock` = { coins, truegold, usedCoins, usedTg5, use } — `used*` sont les échanges
  // DÉJÀ faits cette semaine, que le joueur saisit : ils entament le plafond, pas le
  // stock. `use` est l'ensemble des échanges qu'il accepte de faire, par identifiant
  // (`{coins:true, tg5:true, tg10:false}`) : une ligne décochée est simplement sautée,
  // ce qui lui permet par exemple de ne jamais entamer son TrueGold. Absent = tout est
  // autorisé, pour que les appels sans cet argument gardent leur sens.
  //
  // Un échange est indivisible : couvrir 1 poussière manquante coûte un échange entier
  // qui en rend 13. Le surplus n'est pas perdu (il reste en stock), il est rendu dans
  // `over` pour que la page puisse le dire.
  function planTrades(needDust, stock) {
    stock = stock || {};
    const need = (needDust == null) ? Infinity : Math.max(0, Math.ceil(Number(needDust) || 0));
    const pools = { coins: posInt(stock.coins), truegold: posInt(stock.truegold) };
    const out = { dust: 0, coins: 0, truegold: 0, trades: [], over: 0 };

    for (const tr of DUST_TRADES) {
      if (out.dust >= need) break;
      if (stock.use && !stock.use[tr.id]) continue;
      const byStock = Math.floor(pools[tr.pay] / tr.price);
      const byWeek  = tr.weeklyMax == null ? Infinity
                    : Math.max(0, tr.weeklyMax - posInt(stock[tr.usedKey]));
      const byNeed  = (need === Infinity) ? Infinity : Math.ceil((need - out.dust) / tr.dust);
      const n = Math.min(byStock, byWeek, byNeed);
      if (n <= 0) continue;
      pools[tr.pay] -= n * tr.price;
      out[tr.pay]   += n * tr.price;
      out.dust      += n * tr.dust;
      out.trades.push({ id: tr.id, pay: tr.pay, n, spend: n * tr.price, dust: n * tr.dust });
    }
    // Passe de retrait. La boucle ci-dessus sert le besoin dans l'ordre de priorité,
    // mais un échange est INDIVISIBLE : le dernier ajouté dépasse presque toujours la
    // cible, ce qui peut rendre inutiles ceux qui le précèdent. Sans ce retrait,
    // couvrir 13 poussières avec 5 000 pièces en poche dépenserait les pièces ET les
    // 5 TrueGold, alors que les 5 TrueGold suffisaient — 5 000 pièces jetées.
    // On retire donc du moins souhaitable au plus souhaitable, c'est-à-dire à rebours
    // de la liste : le TrueGold à 10 d'abord, puis celui à 5, les pièces en dernier.
    // Le résultat couvre toujours le besoin, et jamais plus cher.
    if (need !== Infinity) {
      for (let i = out.trades.length - 1; i >= 0; i--) {
        const line = out.trades[i];
        const tr = DUST_TRADES.find(x => x.id === line.id);
        const drop = Math.min(line.n, Math.floor((out.dust - need) / tr.dust));
        if (drop <= 0) continue;
        line.n -= drop; line.spend -= drop * tr.price; line.dust -= drop * tr.dust;
        out.dust -= drop * tr.dust;
        out[tr.pay] -= drop * tr.price;
      }
      out.trades = out.trades.filter(l => l.n > 0);
      out.over = Math.max(0, out.dust - need);
    }
    return out;
  }


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
    // Les pièces sont la TROISIÈME ressource contrainte : chaque niveau en coûte
    // (`levels[].coin`), et elles servent aussi à acheter de la poussière par échange.
    // Laissé à null, le budget est infini et le plan se comporte comme avant.
    const coinBudget    = opts.coinBudget == null ? Infinity : Math.max(0, Number(opts.coinBudget) || 0);
    // Le TTG (Or Véritable trempé) n'est demandé que par l'arbre avancé. Laissé à
    // null, il est illimité et les trois arbres de base ne voient aucune différence.
    const ttgBudget     = opts.ttgBudget == null ? Infinity : Math.max(0, Number(opts.ttgBudget) || 0);

    const speedFactor = 1 + speedPct / 100;         // time_eff = base / factor
    const costFactor  = 1 - costRedPct / 100;        // dust_eff = ceil(base * factor)
    const effDustOf   = (base) => Math.max(0, Math.ceil(base * costFactor));
    const effTimeOf   = (base) => Math.round(base / speedFactor);
    // Coût d'un niveau en poussières, chaque TTG en pesant 30 (son poids en points).
    // Un ordre qui pesait le TTG selon la rareté des stocks du joueur a été essayé :
    // jamais meilleur sur 200 scénarios tirés au sort, il a été retiré.
    const costOf = (eff, ttg) => eff + TTG_DUST_EQ * ttg;

    const state = buildState(db, currentLevels, enabledTrees);

    const steps = [];
    let spentDust = 0, spentEffDust = 0, spentBaseTime = 0, spentEffTime = 0, spentCoins = 0, spentTtg = 0;
    let score = 0; // KvK points accumulated (nominal or effective per flag)
    let inProgressKey = null; // the single research left unfinished by a resource limit

    // Plus petit plafond de TTG au-dessus de `ttgBudget` qui changerait une décision de
    // ce plan : un niveau refusé pour son seul TTG. Sous ce seuil, tout plafond donne
    // exactement ce plan (cf. `suggest`, parcours des plafonds).
    let ttgNext = Infinity;
    const affordable = (nl) => {
      if (spentEffDust + effDustOf(nl.dust || 0) > dustBudget || spentCoins + (nl.coin || 0) > coinBudget) return false;
      const t = spentTtg + (nl.ttg || 0);
      if (t > ttgBudget) { if (t < ttgNext) ttgNext = t; return false; }
      return true;
    };

    const HARD_CAP = 100000;
    let iter = 0;

    // Points of a level's resources (dust + TTG), without the time part.
    const resPts = (nl) => PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? effDustOf(nl.dust || 0) : (nl.dust || 0))
                         + PTS_PER_TTG * (nl.ttg || 0);

    // Per-level value for choosing the next level (free switching, no lock).
    function levelScore(entry, nl) {
      const bd = nl.dust || 0, bt = nl.time || 0, tg = nl.ttg || 0;
      const eff = effDustOf(bd);
      if (orderStrategy === 'classic') return -costOf(eff, tg);   // cheapest next level -> most levels
      if (orderStrategy === 'dustdense') return (bd + TTG_DUST_EQ * tg) / Math.max(1, bt); // max resources per time unit (time-bound regime)
      const pts = resPts(nl) + PTS_PER_MIN * (SCORE_ON_EFFECTIVE ? effTimeOf(bt) : bt);
      return pts / Math.max(1, costOf(eff, tg)); // 'kvk' & 'chain' -> best points per unit of cost
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
    // `acc` sums the cost on the way and gives up as soon as it passes what is left of
    // a budget: the caller would reject that bundle anyway, and on the Advanced tree
    // (chains ~90 researches deep, re-walked for every locked research at every step)
    // walking it to the end cost up to 365 ms per plan.
    function collectNeeds(k, upTo, needs, acc) {
      if (acc.n++ > 20000) return false;                      // cycle / runaway guard
      const e = state[k];
      if (!e || upTo > e.res.maxLevel) return false;
      const prev = needs.get(k) || 0;
      if (prev >= upTo) return true;
      needs.set(k, upTo);
      // Levels up to `prev` were already walked (and costed) by an earlier call.
      for (let L = Math.max(e.level, prev) + 1; L <= upTo; L++) {
        const o = levelObj(e, L);
        if (!o || (o.reqWA || 0) > waLevel) return false;
        acc.dust += effDustOf(o.dust || 0); acc.time += effTimeOf(o.time || 0);
        acc.ttg += (o.ttg || 0); acc.coin += (o.coin || 0);
        if (spentEffDust + acc.dust > dustBudget || spentEffTime + acc.time > speedupBudget
            || spentCoins + acc.coin > coinBudget) return false;
        if (spentTtg + acc.ttg > ttgBudget) {
          if (spentTtg + acc.ttg < ttgNext) ttgNext = spentTtg + acc.ttg;
          return false;
        }
        for (const dep of (o.req || [])) {
          if (!collectNeeds(key(e.treeId, dep.r), dep.lvl, needs, acc)) return false;
        }
      }
      return true;
    }

    // Bundle leading to `entry`'s next (locked) level: total effective dust and time,
    // density, and the playable step to take first. null when the bundle is unreachable
    // or does not fit in what is left of the budgets.
    function bundleFor(entry) {
      const needs = new Map();
      const acc = { n: 0, dust: 0, time: 0, ttg: 0, coin: 0 };
      if (!collectNeeds(key(entry.treeId, entry.res.id), entry.level + 1, needs, acc)) return null;
      let dust = 0, ttg = 0, time = 0, coin = 0, pts = 0, first = null, firstScore = -Infinity;
      for (const pair of needs) {
        const e = state[pair[0]], upTo = pair[1];
        for (let L = e.level + 1; L <= upTo; L++) {
          const o = levelObj(e, L);
          const ed = effDustOf(o.dust || 0), et = effTimeOf(o.time || 0);
          dust += ed; ttg += (o.ttg || 0); time += et; coin += (o.coin || 0);
          pts += resPts(o) + PTS_PER_MIN * (SCORE_ON_EFFECTIVE ? et : (o.time || 0));
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
      if (!first || costOf(dust, ttg) <= 0) return null;
      return { dust: dust, ttg: ttg, time: time, coin: coin, dens: pts / costOf(dust, ttg), first: first };
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
        } else if (orderStrategy === 'chain' && state[k].treeId !== ADV_TREE_ID) {
          // Pas de paquet sur l'arbre avancé. Mesuré sur 120 scénarios tirés au sort
          // (TG5 à TG8, niveaux de départ variés) : score identique dans 120 cas sur 120,
          // pour un calcul 2,5 fois plus long (jusqu'à 480 ms par plan, et la page en
          // lance jusqu'à 26 quand elle partage les pièces). Ses chaînes ne cachent pas
          // de nœud rentable derrière des niveaux médiocres comme le palier de troupe.
          const e = state[k];
          if (e.level >= e.res.maxLevel) continue;            // maxed out, nothing to unlock
          const b = bundleFor(e);
          if (!b) continue;
          // Commit ONLY if the whole chain fits in what is left — of BOTH budgets. Paying
          // for the poor levels and stopping before the payoff, whether out of dust or out
          // of speedups, is worse than not starting at all.
          if (spentEffDust + b.dust > dustBudget) continue;
          if (spentEffTime + b.time > speedupBudget) continue;
          if (spentCoins + b.coin > coinBudget) continue;
          if (spentTtg + b.ttg > ttgBudget) { if (spentTtg + b.ttg < ttgNext) ttgNext = spentTtg + b.ttg; continue; }
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
      const baseTtg = lvl.ttg || 0;
      const stepResPts = PTS_PER_DUST * scoreDust + PTS_PER_TTG * baseTtg;
      const stepPts = stepResPts + PTS_PER_MIN * scoreTime;

      // TARGET mode: if the chosen (densest) level would overshoot, pick instead the
      // available level that lands CLOSEST to the target (least point overshoot, then
      // least dust), pay its dust in full, and apply speedups (time) only up to the
      // target. The level is left unfinished ("in progress").
      if (mode === 'target' && targetScore > 0 && score + stepPts > targetScore) {
        const ptsOf = (nl) => {
          const sd = SCORE_ON_EFFECTIVE ? effDustOf(nl.dust || 0) : (nl.dust || 0);
          const st = SCORE_ON_EFFECTIVE ? effTimeOf(nl.time || 0) : (nl.time || 0);
          return { d: PTS_PER_DUST * sd + PTS_PER_TTG * (nl.ttg || 0), t: PTS_PER_MIN * st };
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
        const tg2 = l2.ttg || 0;
        const dustPts = PTS_PER_DUST * sd2 + PTS_PER_TTG * tg2;   // dust + TTG: paid in full
        let frac = 0; // fraction of this level's time we actually apply
        if (score + dustPts < targetScore && st2 > 0) {
          frac = Math.min(1, ((targetScore - score - dustPts) / PTS_PER_MIN) / st2);
        }
        if (et > 0) frac = Math.min(frac, Math.max(0, speedupBudget - spentEffTime) / et); // can't exceed speedups
        const partBase = bt * frac, partEff = et * frac; // exact for accounting
        spentDust += bd; spentEffDust += ed; spentCoins += (l2.coin || 0); spentTtg += tg2;
        spentBaseTime += partBase; spentEffTime += partEff;
        score += dustPts + PTS_PER_MIN * st2 * frac;
        steps.push({
          treeId: e2.treeId, researchId: e2.res.id, name: e2.res.name,
          toLevel: l2.level, fromLevel: l2.level - 1, maxLevel: e2.res.maxLevel,
          baseDust: bd, effDust: ed, ttg: tg2,
          baseTime: Math.round(partBase), effTime: Math.round(partEff),
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
        spentDust += baseDust; spentEffDust += eff; spentCoins += (lvl.coin || 0); spentTtg += baseTtg;
        spentBaseTime += partBase; spentEffTime += partEff;
        score += stepResPts + PTS_PER_MIN * scoreTime * frac;
        steps.push({
          treeId: entry.treeId, researchId: entry.res.id, name: entry.res.name,
          toLevel: lvl.level, fromLevel: lvl.level - 1, maxLevel: entry.res.maxLevel,
          baseDust, effDust: eff, ttg: baseTtg,
          baseTime: Math.round(partBase), effTime: Math.round(partEff),
          points: Math.round(stepResPts + PTS_PER_MIN * scoreTime * frac),
          buff: lvl.buff || '', partial: true,
        });
        inProgressKey = best.k;
        break;
      }

      entry.level = lvl.level;
      spentDust += baseDust; spentEffDust += eff; spentCoins += (lvl.coin || 0); spentTtg += baseTtg;
      spentBaseTime += baseTime; spentEffTime += effTime;
      score += stepPts;

      steps.push({
        treeId: entry.treeId, researchId: entry.res.id, name: entry.res.name,
        toLevel: lvl.level, fromLevel: lvl.level - 1, maxLevel: entry.res.maxLevel,
        baseDust, effDust: eff, ttg: baseTtg, baseTime, effTime, points: stepPts, buff: lvl.buff || '',
      });

      if (mode === 'target' && targetScore > 0 && score >= targetScore) break;
    }

    const kvkFromDust = Math.round(PTS_PER_DUST * (SCORE_ON_EFFECTIVE ? spentEffDust : spentDust));
    const kvkFromTime = Math.round(PTS_PER_MIN  * (SCORE_ON_EFFECTIVE ? spentEffTime : spentBaseTime));
    const kvkFromTtg  = PTS_PER_TTG * spentTtg;

    return {
      mode,
      steps,
      totals: {
        count: steps.length,
        baseDust: spentDust,
        effDust: spentEffDust,      // what the player actually spends
        coins: spentCoins,
        ttg: spentTtg,
        baseTimeMin: Math.round(spentBaseTime),
        effTimeMin: Math.round(spentEffTime),   // what the player actually waits (after speed)
        kvkPoints: kvkFromDust + kvkFromTtg + kvkFromTime,
        kvkFromDust, kvkFromTtg, kvkFromTime,
      },
      remaining: {
        dust: dustBudget === Infinity ? null : Math.max(0, dustBudget - spentEffDust),
        time: speedupBudget === Infinity ? null : Math.max(0, Math.round(speedupBudget - spentEffTime)),
        ttg: ttgBudget === Infinity ? null : Math.max(0, ttgBudget - spentTtg),
      },
      inProgress: inProgressKey, // "treeId.researchId" of the single unfinished research, or null
      ttgNext,                   // plus petit plafond de TTG qui changerait ce plan (Infinity : aucun)
      target: mode === 'target' ? {
        requested: targetScore,
        reached: targetScore > 0 ? (kvkFromDust + kvkFromTtg + kvkFromTime) >= targetScore - 0.5 : null,
      } : null,
    };
  }

  const KVK_ORDERS = ['kvk', 'classic', 'dustdense', 'chain'];

  // ---- Plus de TTG ne doit jamais rapporter moins ----
  // Relevé par la revue Codex des PR #90 et #91 : le glouton peut dépenser du TTG sur un
  // niveau qui prend des accélérateurs (ou de la poussière) qui rapportaient plus
  // ailleurs. TG8, 3 487 poussières, 31 122 minutes : 5 278 660 points avec 48 TTG,
  // 4 969 660 avec 54. Des rejeux ciblés (deux meilleures combinaisons, derniers achats)
  // laissaient encore 5,9 % d'écart sur des comptes tirés au sort.
  //
  // Le parcours exact : pour une combinaison donnée (arbres × ordre), le plan ne change
  // qu'aux plafonds où un niveau refusé pour son TTG devient payable. `runPlan` rend le
  // plus petit de ces seuils (`ttgNext`) ; on rejoue donc chaque combinaison de 0 au
  // stock du joueur en sautant de seuil en seuil, sans rien manquer. Le meilleur de tous
  // ces plans est le meilleur plan que le glouton trouve pour UN plafond quelconque sous
  // le stock : il ne peut pas baisser quand le stock monte.
  //
  // Coût mesuré : 13 à 90 ms pour un stock de 10 à 50 TTG, ~0,5 s à 200, ~3,6 s au pire
  // relevé (TG8, 60 000 poussières, 800 TTG). La page ne le paie qu'une fois, sur le plan
  // qu'elle affiche ; ses évaluations intermédiaires passent `exact: false`.
  function ttgSweep(runs, budget, best) {
    for (const r of runs) {
      if (!r.p.totals.ttg) continue;       // sans achat en TTG, tout plafond donne ce plan
      let c = 0;
      for (;;) {
        const p = runPlan(Object.assign({}, r.o, { ttgBudget: c }), r.order);
        // À points égaux, celui qui garde du TTG.
        if (p.totals.kvkPoints > best.totals.kvkPoints
            || (p.totals.kvkPoints === best.totals.kvkPoints && p.totals.ttg < best.totals.ttg)) best = p;
        if (!(p.ttgNext <= budget)) break;  // au-delà, jusqu'au stock : le plan déjà connu
        c = p.ttgNext;
      }
    }
    return best;
  }

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
  // `opts.exact === false` : sans le parcours des plafonds de TTG (ci-dessus), pour les
  // évaluations intermédiaires d'une page qui rejoue ensuite, exactement, le plan retenu.
  // `opts.rank` : évaluation ALLÉGÉE, réservée au classement d'un grand nombre de
  // candidats (le partage des pièces entre recherches et échanges, cf. waracademy.js).
  // Elle ne rejoue ni les 4 ordres ni les arbres séparés — 16 plans deviennent 1 — donc
  // elle sous-estime le score et ne doit JAMAIS être rendue au joueur : elle sert à
  // repérer les candidats prometteurs, qui sont ensuite réévalués pour de bon.
  function suggest(opts) {
    const mode = (opts && opts.mode) || 'classic';
    if (mode === 'kvk') {
      if (opts.rank) return runPlan(opts, 'kvk');
      const all = (opts.db.trees || []).map(t => t.id)
        .filter(id => !opts.enabledTrees || opts.enabledTrees.includes(id));
      const treeSets = [opts.enabledTrees || null];
      if (all.length > 1) for (const id of all) treeSets.push([id]);
      // Les arbres de base sans l'arbre avancé : c'est le plan de l'onglet de base. Sans
      // lui, la suggestion globale faisait moins bien que cet onglet dans 22 tirages sur
      // 200 (jusqu'à 3,4 %). Avec lui, elle ne peut plus perdre contre aucun des deux.
      const sansAvance = all.filter(id => id !== ADV_TREE_ID);
      if (sansAvance.length > 1 && sansAvance.length < all.length) treeSets.push(sansAvance);
      let best = null;
      const runs = [];
      for (const set of treeSets) {
        const o = (set === treeSets[0]) ? opts : Object.assign({}, opts, { enabledTrees: set });
        for (const order of KVK_ORDERS) {
          const p = runPlan(o, order);
          runs.push({ o, order, p });
          if (!best || p.totals.kvkPoints > best.totals.kvkPoints) best = p;
        }
      }
      const budget = opts.ttgBudget == null ? Infinity : Math.max(0, Number(opts.ttgBudget) || 0);
      if (opts.exact !== false) best = ttgSweep(runs, budget, best);
      // Un plan rejoué sous un plafond compte son reste sur ce plafond : on le rend sur
      // le vrai stock du joueur.
      best.remaining.ttg = budget === Infinity ? null : Math.max(0, budget - best.totals.ttg);
      return best;
    }
    return runPlan(opts, mode === 'target' ? 'kvk' : 'classic');
  }

  return { suggest, planTrades, advancedTree, ADV_TREE_ID, DUST_TRADES, SCORE_ON_EFFECTIVE,
           PTS_PER_DUST, PTS_PER_MIN, PTS_PER_TTG };
}));
