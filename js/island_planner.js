// ============================================================
//  island_planner.js : moteur du Planificateur de l'île
//
//  Fonctions pures (aucun DOM) : chargées par island_calc.html et par les tests
//  Node (tests/harness.mjs). Données : data/island.json.
//
//  Moteur repris tel quel du site jumeau LordRush : même île, autres noms. Le code
//  garde donc ses mots d'origine, pour qu'une correction se reporte d'un site à
//  l'autre : tree = Fontaine Vitale, lumberCamp = Réservoirs, seeds = Essence d'Eau.
//
//  Règles du jeu :
//    · prospérité = somme des bâtiments posés (prospérité × niveau, ou × exemplaires
//      pour les Communs et Peu communs, qui n'ont qu'un niveau) ;
//    · un bâtiment à niveaux passe de N à N+1 en consommant N+1 exemplaires achetés
//      (le premier exemplaire le pose au niveau 1) ;
//    · un effet vaut max × niveau / niveau maximal, et les effets se cumulent ;
//    · la Fontaine produit de l'Essence d'Eau chaque heure et exige une prospérité
//      minimale et de l'essence pour monter.
//
//  Priorités du plan, fixées par Aistra : la Fontaine et les Réservoirs passent avant
//  toute autre suggestion. Ensuite seulement viennent les bâtiments, choisis pour
//  atteindre au moindre coût la prospérité qu'exige le prochain niveau de la Fontaine,
//  puis, une fois ses données épuisées, ceux qui rapportent le plus par unité d'essence.
// ============================================================

(function (root) {
  'use strict';

  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(num(v))));

  // Communs et Peu communs : un seul niveau, plusieurs exemplaires posables.
  const isStackable = (b) => b.maxLevel === 1;
  const ownedMax = (b) => (isStackable(b) ? b.maxCount : b.maxLevel);
  // Exemplaires consommés pour passer de `owned` à owned+1 : 1 pour un Commun ou un Peu
  // commun, owned+1 pour un bâtiment à niveaux ; une Merveille (`levelItem`, Couchant Doré)
  // se pose avec 1 exemplaire (son plan) puis monte avec perLevel × owned objets.
  function copiesFor(b, owned) {
    if (isStackable(b)) return 1;
    if (b.levelItem && owned > 0) return b.levelItem.perLevel * owned;
    // Barème propre à partir d'un niveau (`copiesAfter`, Court of Knowledge).
    const late = b.copiesAfter;
    if (late && owned >= late.level) return late.base + late.step * (owned - late.level);
    return owned + 1;
  }
  // Exemplaires en stock encore utiles : ceux que consomment les niveaux ou poses restants.
  function stockMax(b, owned) {
    let n = 0;
    for (let l = Math.max(0, owned); l < ownedMax(b); l++) n += copiesFor(b, l);
    return n;
  }
  // Bâtiments d'événement ou spéciaux : jamais achetables avec des graines.
  const isPurchasable = (b) => !b.source && num(b.seeds) > 0;
  // Stock (exemplaires reçus, pas encore posés) : tous sauf les bâtiments spéciaux
  // (Atelier de Rondins), qu'aucun exemplaire ne fait monter.
  const hasStock = (b) => b.source !== 'special';
  // Effets d'un bâtiment : `effects` (plusieurs, Couchant Doré) ou `effect`.
  const effectsOf = (b) => (Array.isArray(b.effects) ? b.effects : b.effect ? [b.effect] : []);

  // Valeur d'un effet (le premier par défaut) au niveau donné.
  function effectValue(b, level, effect) {
    const e = effect || effectsOf(b)[0];
    if (!e || !level) return 0;
    return e.max * level / b.maxLevel;
  }

  // Composants de décoration (`items.mythicComponent`) utilisables pour ce bâtiment : de la
  // bonne rareté, pas exclu (`component: false`), Arbre au niveau de déblocage. Le plan ne
  // s'en sert que pour un bâtiment qui ne s'achète pas en graines : un Mythique de boutique
  // coûte 10 000 graines l'exemplaire, contre 60 000 en composants.
  function componentsFor(data, b, tree) {
    const c = data.items && data.items.mythicComponent;
    if (!c || isPurchasable(b) || !hasStock(b) || b.component === false || b.rarity !== c.rarity) return null;
    return tree >= c.unlockTree ? c : null;
  }

  // Bâtiment d'événement ou payant au niveau 0 : il doit avoir été obtenu (récompense ou
  // achat en argent réel). Ni composants ni graines ne le posent, seul un exemplaire
  // détenu (stock) le fait passer au niveau 1.
  const mustPay = (b, owned) => (!!b.paid || b.source === 'event') && !num(owned);

  function treeLevel(data, level) {
    return data.tree.levels[clamp(level, 1, data.tree.maxLevel) - 1];
  }

  function seedsPerHour(data, level) {
    return num(treeLevel(data, level).seedsPerHour);
  }

  function campLevel(data, level) {
    return data.lumberCamp.levels[level - 1] || null;
  }

  // Un seul barème de niveaux pour tous les Camps : une fois posé, le Camp 2 a les mêmes coûts
  // et bonus d'amélioration que le Camp 1 (confirmé en jeu le 25 septembre 2026).
  function campUpgrade(data, level) {
    const lv = campLevel(data, level);
    return lv ? lv.upgrade : null;
  }

  // Ordre entre deux étapes de Camp : la pose d'un Camp d'abord, puis la moins chère
  // (à égalité, le premier Camp listé garde la priorité).
  const campBefore = (a, b) => ((a.from === 0) !== (b.from === 0) ? a.from === 0 : a.cost < b.cost);

  // État saisi -> état propre, borné aux valeurs possibles.
  function normalizeState(data, raw) {
    const r = raw || {};
    const tree = clamp(r.tree || 1, 1, data.tree.maxLevel);
    const camps = {};
    for (const c of data.lumberCamp.camps) {
      const min = c.number === 1 ? 1 : 0;
      camps[c.id] = clamp((r.camps || {})[c.id] ?? min, min, data.lumberCamp.maxLevel);
    }
    const owned = {};
    const unlocked = {};
    const stock = {};
    for (const b of data.buildings) {
      owned[b.id] = clamp((r.owned || {})[b.id] || 0, 0, ownedMax(b));
      unlocked[b.id] = !!(r.unlocked || {})[b.id];
      // Exemplaires achetés ou reçus mais pas encore posés ni consommés.
      stock[b.id] = hasStock(b) ? clamp((r.stock || {})[b.id] || 0, 0, stockMax(b, owned[b.id])) : 0;
    }
    // Objets de l'île partagés entre bâtiments (composants, plans de Merveille).
    const items = {};
    for (const k of Object.keys(data.items || {})) items[k] = Math.max(0, Math.round(num((r.items || {})[k])));
    return {
      tree,
      seeds: Math.max(0, Math.round(num(r.seeds))),
      prosperityInGame: Math.max(0, Math.round(num(r.prosperityInGame))),
      camps, owned, unlocked, stock, items
    };
  }

  function buildingsProsperity(data, owned) {
    let p = 0;
    for (const b of data.buildings) p += num(b.prosperity) * num(owned[b.id]);
    return p;
  }

  // Prospérité de référence : celle du jeu si le joueur l'a saisie (elle peut venir
  // de sources que l'outil ne suit pas), sinon celle calculée depuis les bâtiments.
  function prosperity(data, state) {
    return state.prosperityInGame > 0 ? state.prosperityInGame : buildingsProsperity(data, state.owned);
  }

  // Disponible à l'achat : débloqué par l'Arbre, ou, quand le niveau de déblocage
  // n'est pas encore connu, coché par le joueur ou déjà posé. Un bâtiment offert avant
  // son arrivée en boutique (`gift`, Tour du Défenseur) compte en prospérité et en
  // bonus, mais ne s'achète qu'une fois l'Arbre au niveau de déblocage ; si ce niveau
  // n'est pas relevé (Salle du Conseil offerte par l'Arbre, avant le relevé de son
  // déblocage au niv. 8), seule la case cochée compte.
  function isUnlocked(b, state) {
    if (!isPurchasable(b)) return false;
    if (b.unlockTree == null) return (!b.gift && num(state.owned[b.id]) > 0) || !!state.unlocked[b.id];
    return state.tree >= b.unlockTree;
  }

  // Ce que débloque l'Arbre en atteignant `level` : les raretés dont tous les bâtiments
  // achetables arrivent à ce niveau, sinon les bâtiments un par un, et les Camps.
  function treeUnlocks(data, level) {
    const byRarity = {};
    for (const b of data.buildings) if (isPurchasable(b)) (byRarity[b.rarity] = byRarity[b.rarity] || []).push(b);
    const rarities = [];
    const buildings = [];
    for (const [rarity, list] of Object.entries(byRarity)) {
      const here = list.filter((b) => b.unlockTree === level);
      if (!here.length) continue;
      if (here.length === list.length) rarities.push(rarity);
      else buildings.push(...here.map((b) => b.id));
    }
    const camps = data.lumberCamp.camps.filter((c) => c.unlockTree === level).map((c) => c.id);
    const items = Object.entries(data.items || {}).filter(([, it]) => it.unlockTree === level).map(([k]) => k);
    return { rarities, buildings, camps, items };
  }

  // Exemplaires offerts par l'Arbre entre deux niveaux : `freeCopies` des paliers franchis
  // (from → from+1, …, to−1 → to), cumulés par bâtiment. Vide si l'Arbre ne monte pas.
  // Le plan et applyStep les mettent en stock d'office ; l'interface, elle, les propose
  // seulement quand le joueur monte l'Arbre à la main (il les a peut-être déjà posés).
  function treeGifts(data, fromLevel, toLevel) {
    const out = {};
    const to = clamp(toLevel, 1, data.tree.maxLevel);
    for (let l = clamp(fromLevel, 1, data.tree.maxLevel); l < to; l++) {
      const up = treeLevel(data, l).upgrade;
      for (const [id, n] of Object.entries((up && up.freeCopies) || {})) out[id] = num(out[id]) + num(n);
    }
    return out;
  }

  // Coût en graines du prochain exemplaire ou niveau. `free` : exemplaires déjà
  // détenus (stock du joueur, récompenses de l'Arbre), consommés en premier.
  // Null au maximum, et pour un niveau de Merveille, qui ne s'achète pas en graines.
  function nextCost(b, owned, free) {
    if (owned >= ownedMax(b) || (b.levelItem && owned > 0)) return null;
    return Math.max(0, copiesFor(b, owned) - num(free)) * num(b.seeds);
  }

  // Tous les achats encore possibles, niveau par niveau, pour la couverture d'un
  // manque de prospérité. Le coût d'un niveau croît avec le niveau : une solution
  // optimale ne saute donc jamais un niveau (même gain, coût plus faible). Hors boutique,
  // seuls les niveaux entièrement couverts par des exemplaires détenus sont proposés,
  // ou, pour un Mythique d'événement à l'Arbre niv. 10, complétés par des composants.
  // `pool` : objets partagés (composants, plans de Merveille), l'état par défaut. Chaque
  // achat les compte comme s'il était seul : `use` (pris au stock) et `buy` (achetés en
  // graines) disent ce qu'il consomme. `shared` marque un achat qui puise dans ce stock
  // commun : deux achats de bâtiments différents ne peuvent pas être cumulés sans recalcul.
  function purchaseItems(data, state, free, pool) {
    const items = [];
    const pl = pool || state.items || {};
    for (const b of data.buildings) {
      if (!hasStock(b) || !num(b.prosperity)) continue;
      const inShop = isUnlocked(b, state);
      const comp = componentsFor(data, b, state.tree);
      let owned = num(state.owned[b.id]);
      let f = num(free[b.id]);
      let cp = comp ? num(pl.mythicComponent) : 0;
      let wp = b.levelItem ? num(pl[b.levelItem.item]) : 0;
      while (owned < ownedMax(b)) {
        const copies = copiesFor(b, owned);
        const used = Math.min(copies, f);
        const rest = copies - used;
        const it = { id: b.id, from: owned, to: owned + 1, cost: 0, freeUsed: used, gain: num(b.prosperity), hasEffect: effectsOf(b).length > 0 };
        if (rest > 0 && b.levelItem && owned > 0) {
          // Niveau de Merveille : plans propres d'abord, puis plans de Merveille du stock.
          if (wp < rest) break;
          wp -= rest;
          it.use = { [b.levelItem.item]: rest };
          it.shared = true;
        } else if (rest > 0 && inShop) {
          it.cost = rest * num(b.seeds);
        } else if (rest > 0 && comp && !mustPay(b, owned)) {
          const need = rest * comp.perCopy;
          const take = Math.min(cp, need);
          cp -= take;
          it.cost = (need - take) * num(comp.seeds);
          if (take) it.use = { mythicComponent: take };
          if (need > take) it.buy = { mythicComponent: need - take };
          it.shared = true;
        } else if (rest > 0) break;
        f -= used;
        items.push(it);
        owned++;
      }
    }
    return items;
  }

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  // Tri d'affichage : le meilleur rendement d'abord, un bâtiment à effet avant un
  // décor à rendement égal, et les niveaux d'un même bâtiment dans l'ordre.
  function byRatio(a, b) {
    return (a.cost / a.gain) - (b.cost / b.gain)
      || (b.hasEffect - a.hasEffect)
      || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
      || a.to - b.to;
  }

  // Ensemble d'achats le moins cher qui apporte au moins `deficit` de prospérité
  // (sac à dos 0/1 « au moins », en unités du PGCD des gains). null si impossible.
  function coverDeficit(items, deficit) {
    if (deficit <= 0) return [];
    if (!items.length) return null;
    const unit = items.reduce((g, it) => gcd(g, it.gain), 0);
    const target = Math.ceil(deficit / unit);
    const best = Array.from({ length: target + 1 }, () => null);
    best[0] = { cost: 0, gain: 0, picks: [] };
    items.forEach((it, idx) => {
      const g = it.gain / unit;
      for (let j = target; j >= 0; j--) {
        const cur = best[j];
        if (!cur) continue;
        const nj = Math.min(target, j + g);
        const cand = { cost: cur.cost + it.cost, gain: cur.gain + it.gain, picks: cur.picks.concat(idx) };
        const old = best[nj];
        if (!old || cand.cost < old.cost || (cand.cost === old.cost && cand.gain > old.gain)) best[nj] = cand;
      }
    });
    if (!best[target]) return null;
    return best[target].picks.map((i) => items[i]).sort(byRatio);
  }

  // Bonus cumulés : Arbre (niveaux 1 à N) + effets des bâtiments posés.
  function activeBonuses(data, state) {
    const out = {};
    const add = (key, v, src) => {
      if (!v) return;
      if (!out[key]) out[key] = { total: 0, sources: [] };
      out[key].total += v;
      out[key].sources.push({ src, value: v });
    };
    for (let l = 1; l <= state.tree; l++) {
      const s = treeLevel(data, l).stat;
      if (s) add(s.key, s.value, 'tree');
    }
    for (const b of data.buildings) {
      for (const e of effectsOf(b)) add(e.stat, effectValue(b, num(state.owned[b.id]), e), b.id);
    }
    return out;
  }

  // ============ PLAN ============
  // Simule les prochaines actions dans l'ordre à suivre en jeu. Les graines ne
  // bloquent jamais le plan : quand le stock ne suffit pas, l'étape indique
  // l'attente de production (l'Arbre produit plus vite après chaque niveau).
  function plan(data, rawState, opts) {
    const o = opts || {};
    const maxSteps = clamp(o.maxSteps || 15, 1, 200);
    const s = normalizeState(data, rawState);
    const sim = { tree: s.tree, camps: { ...s.camps }, owned: { ...s.owned }, unlocked: s.unlocked };
    const extraProsperity = s.prosperityInGame > 0 ? s.prosperityInGame - buildingsProsperity(data, s.owned) : 0;
    const prosp = () => buildingsProsperity(data, sim.owned) + extraProsperity;
    // Stock du joueur ; les exemplaires offerts par l'Arbre s'y ajoutent.
    const free = { ...s.stock };
    // Objets partagés (composants, plans de Merveille), consommés au fil des étapes.
    const pool = { ...s.items };
    let seeds = s.seeds;
    let hours = 0;
    const steps = [];
    let stop = null;

    const pay = (cost) => {
      let wait = 0;
      if (seeds >= cost) seeds -= cost;
      else {
        wait = (cost - seeds) / seedsPerHour(data, sim.tree);
        seeds = 0;
      }
      hours += wait;
      return wait;
    };
    const push = (step) => {
      const wait = pay(step.cost);
      steps.push({ ...step, wait, at: hours, seedsLeft: seeds, prosperity: prosp(), tree: sim.tree });
    };

    while (steps.length < maxSteps) {
      const up = treeLevel(data, sim.tree).upgrade;

      // 1. L'Arbre, dès que sa prospérité est atteinte.
      if (up && prosp() >= up.prosperity) {
        // Payé au rythme de production d'avant l'amélioration.
        push({ kind: 'tree', id: 'tree', from: sim.tree, to: sim.tree + 1, cost: up.seeds, gain: 0, reward: up.reward || null });
        sim.tree++;
        steps[steps.length - 1].tree = sim.tree;
        for (const [id, n] of Object.entries(treeGifts(data, sim.tree - 1, sim.tree))) free[id] = num(free[id]) + n;
        continue;
      }

      // 2. Les Camps de Bûcherons, dès que l'Arbre le permet. Poser un nouveau Camp
      //    (`buildSeeds`) passe avant toute amélioration, choix d'Aistra ; sinon le
      //    moins cher d'abord.
      let campStep = null;
      for (const c of data.lumberCamp.camps) {
        const lvl = sim.camps[c.id];
        if (sim.tree < c.unlockTree || lvl >= data.lumberCamp.maxLevel) continue;
        const cu = lvl === 0 ? { tree: c.unlockTree, seeds: num(c.buildSeeds) } : campUpgrade(data, lvl);
        if (!cu || sim.tree < cu.tree) continue;
        const cand = { kind: 'camp', id: c.id, from: lvl, to: lvl + 1, cost: cu.seeds, gain: 0 };
        if (!campStep || campBefore(cand, campStep)) campStep = cand;
      }
      if (campStep) {
        sim.camps[campStep.id] = campStep.to;
        push(campStep);
        continue;
      }

      const items = purchaseItems(data, sim, free, pool);
      const apply = (it, kind) => {
        sim.owned[it.id] = it.to;
        if (it.freeUsed) free[it.id] -= it.freeUsed;
        for (const [k, n] of Object.entries(it.use || {})) pool[k] -= n;
        push({ kind, id: it.id, from: it.from, to: it.to, cost: it.cost, gain: it.gain, freeUsed: it.freeUsed, use: it.use || null, buy: it.buy || null });
      };

      // 3. La prospérité qui manque au prochain niveau de l'Arbre, au moindre coût. Les
      //    achats qui puisent dans le stock commun d'objets n'y entrent pas : le sac à dos
      //    compterait le même stock pour chacun. Ils n'existent qu'à l'Arbre niv. 10
      //    (composants, Merveille), où l'étape 4 les choisit un à un.
      if (up) {
        const picks = coverDeficit(items.filter((it) => !it.shared), up.prosperity - prosp());
        if (!picks) {
          stop = { reason: 'prosperityUnreachable', need: up.prosperity, have: prosp(), level: sim.tree + 1 };
          break;
        }
        for (const it of picks) {
          if (steps.length >= maxSteps) break;
          apply(it, 'forTree');
        }
        continue;
      }

      // 4. Données de l'Arbre épuisées : meilleur rendement prospérité / graine.
      //    Seul le prochain niveau de chaque bâtiment est candidat : un niveau de Merveille
      //    payé en plans (0 graine) ne doit pas passer avant la pose qu'il suppose.
      const next = items.filter((it) => it.from === num(sim.owned[it.id]));
      if (!next.length) { stop = { reason: 'nothingLeft' }; break; }
      apply(next.sort(byRatio)[0], 'prosperity');
    }

    const finalUp = treeLevel(data, sim.tree).upgrade;
    return {
      steps,
      hours,
      seedsLeft: seeds,
      prosperityStart: prosperity(data, s),
      prosperityEnd: prosp(),
      treeEnd: sim.tree,
      stop: stop || (steps.length >= maxSteps ? { reason: 'maxSteps' } : null),
      treeDataEnds: !finalUp && sim.tree < data.tree.maxLevel ? sim.tree : null
    };
  }

  // ============ VALIDATION ============
  // Le joueur a fait en jeu l'étape `index` du plan : l'état avance comme le plan l'a
  // simulé. Les étapes antérieures du MÊME objet (Arbre, Camp ou bâtiment) sont validées
  // avec elle, puisqu'on ne monte pas au niveau 3 sans passer par le 2 ; les autres restent
  // à faire. Une étape déjà atteinte dans l'état n'est pas rejouée. Chaque étape paie ses
  // graines (jamais sous 0), consomme le stock qu'elle utilisait, et la prospérité saisie en
  // jeu, si le joueur en a saisi une, gagne ce que l'étape rapporte. Passer l'Arbre met ses
  // exemplaires offerts en stock.
  function applyStep(data, rawState, steps, index) {
    const s = normalizeState(data, rawState);
    const target = (steps || [])[index];
    if (!target) return { state: s, applied: [], seedsSpent: 0 };
    const key = (st) => (st.kind === 'tree' ? 'tree' : st.kind === 'camp' ? 'camp:' + st.id : 'b:' + st.id);
    const applied = [];
    let seedsSpent = 0;
    for (const st of steps.slice(0, index + 1)) {
      if (key(st) !== key(target)) continue;
      if (st.kind === 'tree') {
        if (s.tree >= st.to) continue;
        s.tree = st.to;
        for (const [id, n] of Object.entries(treeGifts(data, st.from, st.to))) s.stock[id] = num(s.stock[id]) + n;
      } else if (st.kind === 'camp') {
        if (s.camps[st.id] >= st.to) continue;
        s.camps[st.id] = st.to;
      } else {
        if (num(s.owned[st.id]) >= st.to) continue;
        s.owned[st.id] = st.to;
        s.stock[st.id] = Math.max(0, num(s.stock[st.id]) - num(st.freeUsed));
        for (const [k, n] of Object.entries(st.use || {})) s.items[k] = Math.max(0, num(s.items[k]) - n);
        if (s.prosperityInGame > 0) s.prosperityInGame += num(st.gain);
      }
      const paid = Math.min(s.seeds, num(st.cost));
      s.seeds -= paid;
      seedsSpent += paid;
      applied.push(st);
    }
    return { state: normalizeState(data, s), applied, seedsSpent };
  }

  // Ce qu'exige le prochain niveau de l'Arbre, pour le bandeau d'objectif.
  function treeGoal(data, rawState) {
    const s = normalizeState(data, rawState);
    const up = treeLevel(data, s.tree).upgrade;
    if (!up) return { level: s.tree, next: s.tree < data.tree.maxLevel ? s.tree + 1 : null, known: false };
    const have = prosperity(data, s);
    const deficit = Math.max(0, up.prosperity - have);
    const picks = coverDeficit(purchaseItems(data, s, s.stock).filter((it) => !it.shared), deficit);
    const coverCost = picks ? picks.reduce((t, it) => t + it.cost, 0) : null;
    const totalSeeds = coverCost == null ? null : coverCost + up.seeds;
    return {
      level: s.tree, next: s.tree + 1, known: true,
      prosperityNeed: up.prosperity, prosperityHave: have, deficit,
      seedsNeed: up.seeds, coverCost, totalSeeds,
      seedsMissing: totalSeeds == null ? null : Math.max(0, totalSeeds - s.seeds),
      hoursToGo: totalSeeds == null ? null : Math.max(0, totalSeeds - s.seeds) / seedsPerHour(data, s.tree),
      reward: up.reward || null
    };
  }

  const api = {
    isStackable, ownedMax, copiesFor, stockMax, isPurchasable, hasStock, effectsOf, componentsFor, mustPay, isUnlocked, treeUnlocks, treeGifts, effectValue, seedsPerHour, campLevel, campUpgrade,
    normalizeState, buildingsProsperity, prosperity, nextCost, purchaseItems, coverDeficit,
    activeBonuses, plan, applyStep, treeGoal
  };
  root.IslandPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis);
