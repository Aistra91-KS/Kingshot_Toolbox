/* ============================================================
   js/pets-plan.js — Plan d'avancement (2e onglet de pets.html)

   Répond à une question de KVK : « avec ce que j'ai en stock, quels
   avancements de familiers je fais, dans quel ordre, et combien de
   points d'événement ça me rapporte ? »

   Barème : data/pets_event.json. Seuls les AVANCEMENTS rapportent ;
   les niveaux entre deux caps ne sont qu'un péage en nourriture. Le
   coffre est un CHOIX (7 manuels OU 2 potions OU 1 médaillon) :
   l'optimiseur décide de la répartition, c'est là qu'est l'arbitrage.

   État de départ = les niveaux et avancements déjà saisis dans la
   promenade (clé `pets`) ; le stock a sa propre clé (`petsPlan`).

   FICHIER NEUF, ET C'EST VOULU (MAP §9, cache des <script>) : la page
   n'appelle aucun nom global né dans un fichier déjà en cache chez le
   visiteur. Tout ce que l'onglet ajoute — barre d'onglets, panneau,
   feuille de style — naît ici ou dans css/pets-plan.css, deux fichiers
   qu'aucun navigateur ne peut avoir en version périmée.
   ============================================================ */
(function () {
  "use strict";

  const MATS = ["growthManual", "nutrientPotion", "promotionMedallion"];
  const ALL  = ["petFood"].concat(MATS);
  const DEFAULT_CHOICES = { growthManual: 7, nutrientPotion: 2, promotionMedallion: 1 };

  const num = (v) => { const n = Math.floor(Number(v)); return isFinite(n) && n > 0 ? n : 0; };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ============================================================
     MOTEUR — pur, sans DOM. Exposé pour tests/pets-plan.test.mjs.

     LA PROPRIÉTÉ QUI STRUCTURE TOUT : l'ordre des avancements ne change
     PAS ce qu'on peut se payer. Le surplus d'un coffre ouvert reste en
     stock, donc le nombre de coffres dépensés pour un matériau vaut
     ceil((coût total − stock) / par coffre) quel que soit l'ordre. Un
     plan se résume donc à UN VECTEUR : combien d'avancements pour chaque
     familier. L'ordre affiché ne sert plus qu'au joueur (encaisser les
     points les plus rentables d'abord, au cas où l'événement se termine).

     D'où la méthode : plusieurs remplissages gloutons avec des façons
     différentes de « priser » les ressources, chacun raffiné par
     recherche locale, et on garde le meilleur. Un glouton seul se
     trompait de 10 % contre l'optimum sur des cas réduits vérifiés par
     force brute (cf. tests).
     ============================================================ */

  // Nourriture pour monter du niveau `from` au niveau `to`.
  // petFood[i] = coût du niveau (i+1) vers (i+2), d'où l'index m−2.
  function ptFoodBetween(pet, from, to) {
    let n = 0;
    for (let m = from + 1; m <= to; m++) n += pet.petFood[m - 2] || 0;
    return n;
  }

  // Les caps d'un familier : 10, 20, … maxLevel.
  function ptCapsOf(pet) {
    const c = [];
    for (let g = 10; g <= pet.maxLevel; g += 10) c.push(g);
    return c;
  }

  /* Un avancement n'est « fait » que si la sauvegarde le dit VRAIMENT. La
     promenade n'y écrit que `true`, mais une sauvegarde importée ou retouchée à
     la main peut porter autre chose : `false` (l'avancement explicitement PAS
     fait) comptait comme fait par un simple test de vérité, et la chaîne
     "false" aussi — elle est vraie en JavaScript. Tout ce qui n'est pas
     clairement un oui est un non. */
  function ptAdvDone(v) {
    return v === true || v === 1 || v === "1" || v === "true";
  }

  /* Où en est un familier : son niveau, et le 1er cap non avancé.
     Même normalisation que la promenade (js/pets.js) : un cap SOUS le
     niveau est forcément fait, un cap AU-DESSUS ne peut pas l'être, un
     cap PILE au niveau est ce que dit la sauvegarde. */
  function ptCursor(pet, saved) {
    const e = saved || {};
    const lvl = clamp(Math.floor(Number(e.lvl) || 1), 1, pet.maxLevel);
    const adv = e.adv || {};
    const caps = ptCapsOf(pet);
    let i = 0;
    while (i < caps.length && (lvl > caps[i] || (lvl === caps[i] && ptAdvDone(adv[caps[i]])))) i++;
    return { pet: pet, lvl: lvl, caps: caps, i: i };
  }

  /* L'échelle d'un familier : ses avancements restants, dans l'ordre, chacun
     avec son coût depuis le niveau où le précédent laisse le familier. */
  function ptLadder(pet, saved, score, perPoint, choices) {
    const per = choices || DEFAULT_CHOICES;
    const cur = ptCursor(pet, saved);
    const rungs = [];
    let lvl = cur.lvl;
    for (let i = cur.i; i < cur.caps.length; i++) {
      const cap = cur.caps[i], a = pet.advancements[i] || {};
      const sc = Number(score[String(cap)]) || 0;
      const cost = {
        petFood: ptFoodBetween(pet, lvl, cap),
        growthManual: a.growthManual || 0,
        nutrientPotion: a.nutrientPotion || 0,
        promotionMedallion: a.promotionMedallion || 0
      };
      let chestEq = 0;
      /* Le taux vient du JSON, jamais de la constante de repli : si le jeu
         change le contenu du coffre, `chest.choices` bouge et le classement
         doit suivre. Codé en dur, il continuait d'annoncer 7 manuels par
         coffre en affichant des prix faux, sans que rien ne le signale. */
      for (const m of MATS) chestEq += cost[m] / (per[m] || 1);
      rungs.push({
        petId: pet.id, cap: cap, tier: i + 1, tiers: cur.caps.length,
        fromLevel: lvl, score: sc, points: sc * perPoint, cost: cost, chestEq: chestEq
      });
      lvl = cap;
    }
    return { petId: pet.id, pet: pet, startLevel: cur.lvl, doneTiers: cur.i, rungs: rungs };
  }

  // Combien de coffres il faut ouvrir pour combler ce qui manque.
  // Un coffre ne donne qu'UN type : les trois manques se comptent séparément.
  function ptChestsNeeded(tot, stock, choices) {
    let n = 0;
    for (const m of MATS) {
      const short = tot[m] - stock[m];
      if (short > 0) n += Math.ceil(short / (choices[m] || 1));
    }
    return n;
  }
  function ptFits(tot, stock, choices) {
    return tot.petFood <= stock.petFood && ptChestsNeeded(tot, stock, choices) <= stock.chest;
  }
  function ptApply(tot, rung, sign) {
    for (const k of ALL) tot[k] += sign * rung.cost[k];
    tot.points += sign * rung.points;
    tot.score  += sign * rung.score;
  }
  const ptEmptyTot = () => ({ petFood: 0, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0, points: 0, score: 0 });

  /* Les façons de priser une étape. Aucune n'est bonne partout : « le plus de
     points par coffre » ignore la nourriture, « par nourriture » ignore les
     médaillons. On les essaie toutes et on garde le meilleur résultat. */
  const PRICERS = [
    // Fraction du stock RESTANT que l'étape consomme — s'adapte à la rareté réelle.
    function (r, tot, stock, choices) {
      let d = 0;
      const foodLeft = Math.max(1, stock.petFood - tot.petFood);
      if (r.cost.petFood > 0) d += r.cost.petFood / foodLeft;
      const chestLeft = Math.max(0, stock.chest - ptChestsNeeded(tot, stock, choices));
      for (const m of MATS) {
        if (r.cost[m] <= 0) continue;
        const left = Math.max(1, stock[m] - tot[m]) + chestLeft * (choices[m] || 1);
        d += r.cost[m] / left;
      }
      return d <= 0 ? Infinity : r.points / d;
    },
    (r) => (r.chestEq > 0 ? r.points / r.chestEq : Infinity),                    // points par coffre-équivalent
    (r) => (r.cost.petFood > 0 ? r.points / r.cost.petFood : Infinity),          // points par nourriture
    (r) => (r.chestEq + r.cost.petFood / 1000 > 0                                // les deux, à parts comparables
              ? r.points / (r.chestEq + r.cost.petFood / 1000) : Infinity),
    (r) => -(r.chestEq + r.cost.petFood / 1000),                                 // le moins cher d'abord
    (r) => r.points                                                              // le plus gros d'abord
  ];

  /* Remplissage glouton : on ajoute l'étape la mieux prisée encore payable,
     et on recommence. `skip` interdit un familier — la recherche locale s'en
     sert pour forcer l'exploration après avoir retiré une de ses étapes. */
  // `skip` : un index, ou plusieurs. Interdire un seul des deux familiers d'un
  // mouvement à deux ne sert à rien — le premier remplissage remet le barreau
  // de l'autre, le second remet celui du premier, et le voisinage annoncé
  // n'est jamais réellement exploré.
  function ptFill(ladders, k, tot, stock, choices, price, skip) {
    const banned = skip == null ? null : (Array.isArray(skip) ? skip : [skip]);
    for (let guard = 0; guard < 200; guard++) {
      let bi = -1, bv = -Infinity;
      for (let i = 0; i < ladders.length; i++) {
        if (banned && banned.indexOf(i) >= 0) continue;
        const r = ladders[i].rungs[k[i]];
        if (!r) continue;
        ptApply(tot, r, +1);
        const ok = ptFits(tot, stock, choices);
        ptApply(tot, r, -1);
        if (!ok) continue;
        const v = price(r, tot, stock, choices);
        if (v > bv) { bv = v; bi = i; }
      }
      if (bi < 0) return;
      ptApply(tot, ladders[bi].rungs[k[bi]], +1);
      k[bi]++;
    }
  }

  /* Recherche locale : retirer des étapes peut libérer de quoi en payer plus
     ailleurs. On essaie de retirer 1, 2, … barreaux à UN familier, puis un
     barreau à DEUX familiers à la fois — le contre-exemple connu (750 000 au
     lieu de 775 000) demandait exactement ce second mouvement, qu'un simple
     « retirer un barreau » ne trouvait jamais. Le remplissage a interdiction
     de remettre ce qu'on vient d'ôter, sinon il refait le plan défait. */
  function ptImprove(ladders, k, tot, stock, choices, price) {
    const restore = (kk, tt) => { for (let j = 0; j < k.length; j++) k[j] = kk[j]; Object.assign(tot, tt); };
    const refill = (skip) => {
      ptFill(ladders, k, tot, stock, choices, price, skip);
      ptFill(ladders, k, tot, stock, choices, price);      // puis tout le monde redevient éligible
    };
    for (let round = 0; round < 30; round++) {
      let gained = false;
      for (let i = 0; i < ladders.length && !gained; i++) {
        for (let drop = 1; drop <= k[i]; drop++) {
          const keepK = k.slice(), keepT = Object.assign({}, tot);
          for (let z = 0; z < drop; z++) { ptApply(tot, ladders[i].rungs[k[i] - 1], -1); k[i]--; }
          refill(i);
          if (tot.points > keepT.points) { gained = true; break; }
          restore(keepK, keepT);
        }
      }
      for (let i = 0; i < ladders.length && !gained; i++) {
        if (!k[i]) continue;
        for (let j = i + 1; j < ladders.length; j++) {
          if (!k[j]) continue;
          const keepK = k.slice(), keepT = Object.assign({}, tot);
          ptApply(tot, ladders[i].rungs[k[i] - 1], -1); k[i]--;
          ptApply(tot, ladders[j].rungs[k[j] - 1], -1); k[j]--;
          ptFill(ladders, k, tot, stock, choices, price, [i, j]);
          ptFill(ladders, k, tot, stock, choices, price);
          if (tot.points > keepT.points) { gained = true; break; }
          restore(keepK, keepT);
        }
      }
      if (!gained) return;
    }
  }

  /* ------------------------------------------------------------
     RECHERCHE EXACTE, BORNÉE EN TEMPS.

     Les six gloutons et la recherche locale ne garantissent rien : un audit a
     produit un stock où ils sortaient 750 000 points alors que 775 000 étaient
     payables. On les fait donc suivre d'une séparation-évaluation, AMORCÉE PAR
     LEUR RÉSULTAT — elle ne peut donc jamais rendre pire, seulement mieux, et
     elle dit si elle a eu le temps de PROUVER qu'il n'y a pas de meilleur plan.

     La borne relâche deux choses à la fois : les avancements d'un familier
     n'ont plus à former un préfixe, et on autorise des fractions de barreau.
     Elle majore donc bien ce qui reste atteignable, et l'élagage ne peut pas
     rater l'optimum.
       · côté NOURRITURE : capacité = ce qui reste en stock, coût = celui du barreau ;
       · côté COFFRES : tout se compte en équivalents coffre. La capacité de
         départ vaut `chest + Σ stock/par coffre`, dont on retranche ce que la
         solution partielle a consommé au même taux. Surtout PAS le compte réel
         de coffres ouverts (qui arrondit chaque manque au coffre supérieur) :
         il donnerait une borne plus serrée que la réalité, donc capable de
         couper la meilleure solution — et « prouvé optimal » deviendrait faux.
     ------------------------------------------------------------ */
  function ptExact(ladders, seedPoints, stock, choices, budgetMs) {
    const per = (m) => choices[m] || 1;
    const capacity = stock.chest + MATS.reduce((n, m) => n + stock[m] / per(m), 0);
    const spentEq = (c) => MATS.reduce((n, m) => n + c[m] / per(m), 0);

    // Choix possibles d'un familier : « faire ses k premiers avancements ».
    const cum = ladders.map(l => {
      const rows = [], acc = { petFood: 0, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 };
      let pts = 0;
      for (const r of l.rungs) {
        for (const m of ALL) acc[m] += r.cost[m];
        pts += r.points;
        rows.push({ points: pts, cost: Object.assign({}, acc) });
      }
      return rows;
    });
    // Les familiers qui pèsent le plus d'abord : la borne mord plus tôt.
    const total = (i) => (cum[i].length ? cum[i][cum[i].length - 1].points : 0);
    const order = cum.map((_, i) => i).sort((a, b) => total(b) - total(a));

    // Barreaux encore en jeu à partir de chaque rang, triés par rendement.
    const sufFood = [], sufChest = [];
    for (let idx = order.length; idx >= 0; idx--) {
      const f = [], g = [];
      for (let z = idx; z < order.length; z++) for (const r of ladders[order[z]].rungs) {
        f.push({ p: r.points, c: r.cost.petFood });
        g.push({ p: r.points, c: spentEq(r.cost) });
      }
      const byYield = (a, b) => (b.p / (b.c || 1e-9)) - (a.p / (a.c || 1e-9));
      f.sort(byYield); g.sort(byYield);
      sufFood[idx] = f; sufChest[idx] = g;
    }
    const frac = (items, room) => {
      let left = room, acc = 0;
      for (const it of items) {
        if (it.c <= 0) { acc += it.p; continue; }
        if (left <= 0) break;
        const take = Math.min(1, left / it.c);
        acc += it.p * take; left -= it.c * take;
      }
      return acc;
    };

    let best = seedPoints, bestK = null, nodes = 0, out = false;
    const t0 = Date.now();
    const kbuf = ladders.map(() => 0);
    (function dfs(idx, cost, pts) {
      if (out) return;
      if ((++nodes & 1023) === 0 && Date.now() - t0 > budgetMs) { out = true; return; }
      if (idx === order.length) { if (pts > best) { best = pts; bestK = kbuf.slice(); } return; }
      if (pts + Math.min(frac(sufFood[idx], stock.petFood - cost.petFood),
                         frac(sufChest[idx], capacity - spentEq(cost))) <= best) return;
      const pet = order[idx], rows = cum[pet];
      for (let t = rows.length; t >= 1; t--) {
        const next = {};
        for (const m of ALL) next[m] = cost[m] + rows[t - 1].cost[m];
        // Un préfixe déjà impayable le reste : les coûts ne font que croître.
        if (next.petFood > stock.petFood) continue;
        if (ptChestsNeeded(next, stock, choices) > stock.chest) continue;
        kbuf[pet] = t;
        dfs(idx + 1, next, pts + rows[t - 1].points);
        if (out) return;
      }
      kbuf[pet] = 0;
      dfs(idx + 1, cost, pts);
    })(0, { petFood: 0, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 }, 0);

    return { k: bestK, points: best, proven: !out, nodes: nodes };
  }

  /* ------------------------------------------------------------
     Le plan complet, prêt à afficher.
     ------------------------------------------------------------ */
  function ptPlanCompute(input) {
    const pets     = (input && input.pets) || [];
    const scale    = (input && input.scale) || {};
    const state    = (input && input.state) || {};
    const rawStock = (input && input.stock) || {};
    const score    = scale.advancementScore || {};
    const perPoint = Number(scale.pointsPerScore) || 1;
    const choices  = (scale.chest && scale.chest.choices) || DEFAULT_CHOICES;

    const stock = { chest: num(rawStock.chest) };
    for (const k of ALL) stock[k] = num(rawStock[k]);

    const ladders = pets.map(p => ptLadder(p, state[p.id], score, perPoint, choices));

    // Un plan par façon de priser, chacun raffiné ; on garde le plus payant.
    let bestK = ladders.map(() => 0), bestTot = ptEmptyTot(), bestPricer = 0;
    PRICERS.forEach((price, idx) => {
      const k = ladders.map(() => 0), tot = ptEmptyTot();
      ptFill(ladders, k, tot, stock, choices, price);
      ptImprove(ladders, k, tot, stock, choices, price);
      if (tot.points > bestTot.points) { bestK = k.slice(); bestTot = Object.assign({}, tot); bestPricer = idx; }
    });

    /* Puis la recherche exacte, amorcée par ce résultat. Elle ne peut que
       l'améliorer ou le confirmer ; `proven` dit si elle a eu le temps de
       balayer tout l'espace, et donc si la page peut affirmer qu'aucun
       meilleur plan n'existe. */
    const budget = Number(input && input.exactBudgetMs);
    const exact = ptExact(ladders, bestTot.points, stock, choices,
      isFinite(budget) && budget >= 0 ? budget : 140);
    if (exact.k) {
      bestK = exact.k;
      bestTot = ptEmptyTot();
      for (let i = 0; i < ladders.length; i++)
        for (let j = 0; j < bestK[i]; j++) ptApply(bestTot, ladders[i].rungs[j], 1);
    }

    /* L'ordre d'affichage : à contenu fixé, refaire le choix des étapes retenues
       en les prenant de la plus rentable à la moins rentable. Le joueur encaisse
       ainsi le plus de points au plus tôt, si l'événement le rattrape. */
    const order = [], cursor = ladders.map(() => 0), tot = ptEmptyTot();
    const spent = { chest: 0 };
    for (const k of ALL) spent[k] = 0;
    const chestSplit = { growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 };
    const pool = { chest: stock.chest };
    for (const k of ALL) pool[k] = stock[k];

    const totalSteps = bestK.reduce((n, v) => n + v, 0);
    for (let s = 0; s < totalSteps; s++) {
      let bi = -1, bv = -Infinity;
      for (let i = 0; i < ladders.length; i++) {
        if (cursor[i] >= bestK[i]) continue;
        const v = PRICERS[0](ladders[i].rungs[cursor[i]], tot, stock, choices);
        if (v > bv) { bv = v; bi = i; }
      }
      if (bi < 0) break;
      const r = ladders[bi].rungs[cursor[bi]];
      ptApply(tot, r, +1);
      cursor[bi]++;

      // Paiement réel, coffre par coffre : le surplus d'ouverture reste en stock.
      const opened = { growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 };
      for (const m of MATS) {
        const short = r.cost[m] - pool[m];
        if (short > 0) {
          const n = Math.ceil(short / (choices[m] || 1));
          pool.chest -= n; pool[m] += n * (choices[m] || 1);
          opened[m] = n; chestSplit[m] += n; spent.chest += n;
        }
        pool[m] -= r.cost[m]; spent[m] += r.cost[m];
      }
      pool.petFood -= r.cost.petFood; spent.petFood += r.cost.petFood;

      order.push(Object.assign({}, r, { chestsOpened: opened, cumPoints: tot.points }));
    }

    /* Ce qui reste sur la table : le prochain avancement de chaque familier non
       terminé, et ce qui manque pour l'offrir. Nourrit « ce qui te bloque ». */
    const remaining = [];
    for (let i = 0; i < ladders.length; i++) {
      const r = ladders[i].rungs[bestK[i]];
      if (!r) continue;
      /* Ce qui manque, en séparant DEUX natures de manque qu'il ne faut surtout
         pas mettre sur la même ligne :
           · la NOURRITURE est un « et » sec — aucun coffre n'en donne, il faut
             l'avoir en plus du reste ;
           · les trois MATÉRIAUX sont un « ou » — ce qui manque s'achète en nature
             OU se tire des coffres, au choix ou en mélange.
         Les afficher côte à côte laissait croire qu'il fallait les trois à la
         fois : « 100 potions, 60 médaillons, 105 coffres » se lisait comme une
         addition alors que les coffres SONT les potions et les médaillons. */
      const mats = {};
      let chestsNeeded = 0;
      for (const m of MATS) {
        const short = r.cost[m] - pool[m];
        if (short > 0) { mats[m] = short; chestsNeeded += Math.ceil(short / (choices[m] || 1)); }
      }
      const chestsShort = Math.max(0, chestsNeeded - pool.chest);
      r.missing = {
        petFood: Math.max(0, r.cost.petFood - pool.petFood),
        mats: mats,
        // Un manque que les coffres en stock couvrent n'est PAS un manque.
        matsShort: chestsShort > 0,
        chestsNeeded: chestsNeeded, chestsShort: chestsShort, chestsHave: pool.chest
      };
      r.blocked = r.missing.petFood > 0 || r.missing.matsShort;
      remaining.push(r);
    }
    remaining.sort((a, b) => b.points - a.points);

    const left = { chest: pool.chest };
    for (const k of ALL) left[k] = pool[k];

    return {
      steps: order,
      totalPoints: bestTot.points, totalScore: bestTot.score,
      spent: spent, left: left, chestSplit: chestSplit,
      remaining: remaining,
      // Deux fins de partie à ne pas confondre : `allMaxed` = les 14 familiers sont
      // au bout AVANT le plan (il n'y a plus rien à avancer dans le jeu) ; `done` =
      // le plan couvre tout ce qui restait (il reste des choses, mais toutes payées).
      allMaxed: ladders.every(l => !l.rungs.length),
      done: remaining.length === 0,
      // `proven` = la recherche exacte a balayé tout l'espace : aucun autre plan
      // ne fait mieux avec ce stock. Faux = le meilleur plan TROUVÉ, sans preuve.
      proven: exact.proven, exactNodes: exact.nodes,
      pricer: bestPricer, ladders: ladders
    };
  }

  /* Tous les avancements encore possibles, du plus rentable au moins rentable
     et sans regarder le stock — la vue « pourquoi cet ordre ? » du dépliable.
     Le prix est ramené en équivalents coffre (7 manuels = 2 potions =
     1 médaillon = 1 coffre), la seule monnaie que le jeu donne entre les
     trois matériaux. */
  function ptRankAll(input) {
    const pets     = (input && input.pets) || [];
    const scale    = (input && input.scale) || {};
    const state    = (input && input.state) || {};
    const score    = scale.advancementScore || {};
    const perPoint = Number(scale.pointsPerScore) || 1;
    const choices  = (scale.chest && scale.chest.choices) || DEFAULT_CHOICES;
    const rows = [];
    for (const p of pets) {
      for (const r of ptLadder(p, state[p.id], score, perPoint, choices).rungs) {
        rows.push(Object.assign({}, r, {
          perChest: r.chestEq > 0 ? r.points / r.chestEq : Infinity,
          perFood: r.cost.petFood > 0 ? r.points / r.cost.petFood : Infinity
        }));
      }
    }
    rows.sort((a, b) => b.perChest - a.perChest);
    return rows;
  }

  /* Les familiers retenus dans le plan. `off` est la liste des EXCLUS, jamais
     celle des inclus : c'est ce qui fait qu'un familier ajouté plus tard à
     `pets_db.json` (une 8e génération, par exemple) entre au plan tout seul,
     au lieu de rester invisible chez tous ceux qui avaient déjà réglé leur
     filtre. Un identifiant devenu inconnu dans `off` est simplement ignoré. */
  function ptFilterPets(pets, off) {
    if (!off || !off.length) return (pets || []).slice();
    const skip = Object.create(null);
    for (const id of off) skip[id] = true;
    return (pets || []).filter(p => !skip[p.id]);
  }

  /* « Commencé » = le joueur y a touché : un niveau au-dessus de 1, ou un
     avancement coché. Un familier resté au niveau 1 sans rien est très
     probablement un familier qu'il n'a pas encore débloqué — le jeu ne nous
     dit pas lesquels il possède, c'est le seul indice dont on dispose. */
  function ptIsStarted(state, id) {
    const e = state && state[id];
    if (!e || typeof e !== "object") return false;
    if (Number(e.lvl) > 1) return true;
    // Compter les CLÉS ferait passer `{10:false}` — « je n'ai pas fait cet
    // avancement » — pour une trace de progression.
    for (const cap in (e.adv || {})) if (ptAdvDone(e.adv[cap])) return true;
    return false;
  }

  window.ptFilterPets = ptFilterPets;
  window.ptIsStarted = ptIsStarted;
  window.ptPlanCompute = ptPlanCompute;
  window.ptRankAll = ptRankAll;
  window.ptLadder = ptLadder;
  window.ptFoodBetween = ptFoodBetween;
  window.ptCursor = ptCursor;

  /* ============================================================
     INTERFACE — l'onglet, le formulaire de stock, le plan à l'écran.
     Tout est construit ici : la page ne porte que le <link> et le
     <script>. Sur une page sans promenade (et dans le harnais de
     test, où getElementById rend null), `boot` sort sans rien faire.
     ============================================================ */

  const LS_STOCK = (window.STORAGE_KEYS && STORAGE_KEYS.petsPlan) || "pets_plan_stock";
  const LS_PETS  = (window.STORAGE_KEYS && STORAGE_KEYS.pets)     || "pets_levels";
  const LS_OFF   = (window.STORAGE_KEYS && STORAGE_KEYS.petsPlanOff) || "pets_plan_off";

  const T = {
    FR: {
      tabWalk:"Promenade", tabPlan:"Plan d'avancement",
      title:"Plan d'avancement",
      sub:"Dis ce que tu as en stock : l'outil cherche quels familiers avancer, et dans quel ordre, pour marquer le plus de points possible à l'événement. Il part des niveaux et des avancements que tu as saisis dans la promenade — seuls les <b>avancements</b> rapportent, la nourriture ne sert qu'à atteindre le cap suivant.",
      proven:"Aucun autre plan ne fait mieux avec ce stock.",
      unproven:"Meilleur plan trouvé. Sur autant de familiers, l'outil n'a pas le temps de vérifier qu'il n'existe rien de mieux — décoche ceux que tu ne feras pas, il y arrivera.",
      chestInto:"ouverts en : ",
      applyBtn:"Appliquer les modifications",
      applyHint:"Met à jour tes niveaux de familiers et ton stock comme si tu venais de réaliser ce plan en jeu.",
      applyAsk:"Appliquer ce plan à ta page ?",
      applyPets:"Familiers avancés", applyStock:"Stock", applyGain:"Points gagnés",
      applyAdv:"avancements", applyAdv1:"avancement", applyNone:"plus rien",
      applyWarn:"⚠️ Tes niveaux et ton stock actuels seront remplacés. À ne faire qu'une fois le plan réalisé en jeu.",
      applyDone:"✅ Plan appliqué — niveaux et stock mis à jour.",
      stock:"Ton stock", reset:"Tout remettre à zéro",
      petsFilter:"Familiers retenus", petsCount:"{n} / {t}",
      allOn:"Tout cocher", allOff:"Tout décocher", onlyStarted:"Seulement les commencés",
      onlyStartedTip:"Décoche les familiers restés au niveau 1 sans aucun avancement — ceux que tu n'as sans doute pas encore débloqués",
      onlyStartedNone:"Rien à trier : aucun familier n'a encore de niveau saisi dans l'onglet Promenade",
      nonePicked:"Aucun familier retenu. Coche-en au moins un dans « Familiers retenus » pour obtenir un plan.",
      excluded:"{n} familier(s) mis de côté : ni le plan ni le classement ne les proposent.",
      lvlShort:"niv.", notStarted:"pas commencé",
      loadErr:"Impossible de charger les données du plan (data/pets_db.json, data/pets_event.json). Recharge la page.",
      petFood:"Nourriture pour Animaux", growthManual:"Manuel de Croissance",
      nutrientPotion:"Potion Nutritive", promotionMedallion:"Médaillon de Promotion",
      chest:"Coffre d'Avancement Animal",
      points:"points d'événement", steps:"avancements",
      scoreSub:"soit <b>{score}</b> de score d'avancement, à {per} points l'unité.",
      chests:"Comment ouvrir tes coffres", chestsNone:"Aucun coffre à ouvrir : tes matériaux suffisent.",
      inManuals:"en manuels", inPotions:"en potions", inMedallions:"en médaillons",
      leftT:"Ce qu'il te restera", nothingLeft:"épuisé",
      plan:"Le plan", advTo:"avancement niv.", tier:"palier",
      fromTo:"niv. {a} → {b}", noLevelUp:"déjà au niveau",
      emptyStock:"Renseigne ton stock ci-contre pour voir le plan.",
      emptyStockM:"Renseigne ton stock ci-dessus pour voir le plan.",
      noState:"Le plan part du niveau 1 pour tous les familiers : saisis d'abord tes vrais niveaux dans l'onglet <b>Promenade</b>, sinon il te fera refaire ce que tu as déjà.",
      nothing:"Avec ce stock, aucun avancement n'est possible pour l'instant.",
      allDone:"Tous tes familiers sont au maximum. Il n'y a plus rien à avancer.",
      keptMaxed:"Les familiers que tu as retenus sont déjà tous au maximum.",
      planCovers:"Ton stock suffit pour tout ce qu'il te restait à avancer : ce plan ne laisse rien de côté.",
      blocked:"Ce qui t'arrête", blockedIntro:"Le prochain avancement le plus payant, et ce qu'il te manque :",
      missing:"Il te manque", orWord:"ou", opens:"coffres",
      foodOnly:"aucun coffre n'en donne",
      chestMore:"de plus — tu en as {have} sur les {need} qu'il faudrait",
      allTitle:"Tous les avancements possibles, du plus rentable au moins rentable",
      rankNote:"Ce classement n'est pas l'ordre à suivre : il compare les avancements un par un, sans tenir compte de ton stock. L'ordre à suivre, c'est le plan ci-dessus.",
      allCount:"{n} avancements",
      colPet:"Familier", colAdv:"Avancement", colPts:"Points", colFood:"Nourriture",
      colMan:"Manuels", colPot:"Potions", colMed:"Médailles", colEff:"Points / coffre",
      legend:"Le prix est ramené en <b>équivalents coffre</b> : un coffre vaut {rates} — la seule monnaie commune entre les trois matériaux. Les lignes en vert sont celles que ton stock permet de faire.",
      orWordPlain:"ou",
    },
    EN: {
      tabWalk:"Trail", tabPlan:"Advancement plan",
      title:"Advancement plan",
      sub:"Tell it what you have in stock: the tool looks for which pets to advance, and in what order, to score the most event points. It starts from the levels and advancements you entered on the trail — only <b>advancements</b> score, pet food is just the toll to reach the next cap.",
      proven:"No other plan does better with this stock.",
      unproven:"Best plan found. Over this many pets the tool cannot check in time that nothing better exists — untick the ones you will not do and it will.",
      chestInto:"opened as: ",
      applyBtn:"Apply these changes",
      applyHint:"Updates your pet levels and your stock as if you had just carried this plan out in game.",
      applyAsk:"Apply this plan to your page?",
      applyPets:"Pets advanced", applyStock:"Stock", applyGain:"Points earned",
      applyAdv:"advancements", applyAdv1:"advancement", applyNone:"none left",
      applyWarn:"⚠️ Your current levels and stock will be replaced. Only do this once you have carried the plan out in game.",
      applyDone:"✅ Plan applied — levels and stock updated.",
      stock:"Your stock", reset:"Reset everything",
      petsFilter:"Pets in the plan", petsCount:"{n} / {t}",
      allOn:"Tick all", allOff:"Untick all", onlyStarted:"Only the started ones",
      onlyStartedTip:"Unticks pets still at level 1 with no advancement — the ones you probably have not unlocked yet",
      onlyStartedNone:"Nothing to sort: no pet has a level entered on the Trail tab yet",
      nonePicked:"No pet selected. Tick at least one under \u00ab Pets in the plan \u00bb to get a plan.",
      excluded:"{n} pet(s) set aside: neither the plan nor the ranking will suggest them.",
      lvlShort:"lvl", notStarted:"not started",
      loadErr:"Could not load the plan data (data/pets_db.json, data/pets_event.json). Reload the page.",
      petFood:"Pet Food", growthManual:"Growth Manual",
      nutrientPotion:"Nutrient Potion", promotionMedallion:"Promotion Medallion",
      chest:"Pet Advancement Chest",
      points:"event points", steps:"advancements",
      scoreSub:"that is <b>{score}</b> of advancement score, at {per} points each.",
      chests:"How to open your chests", chestsNone:"No chest to open: your materials are enough.",
      inManuals:"as manuals", inPotions:"as potions", inMedallions:"as medallions",
      leftT:"What you will have left", nothingLeft:"none left",
      plan:"The plan", advTo:"advance to lvl", tier:"tier",
      fromTo:"lvl {a} → {b}", noLevelUp:"already at level",
      emptyStock:"Fill in your stock on the left to see the plan.",
      emptyStockM:"Fill in your stock above to see the plan.",
      noState:"The plan starts every pet at level 1: enter your real levels on the <b>Trail</b> tab first, or it will tell you to redo what you already own.",
      nothing:"With this stock, no advancement is possible yet.",
      allDone:"All your pets are maxed. There is nothing left to advance.",
      keptMaxed:"The pets you kept are already all maxed.",
      planCovers:"Your stock covers everything you had left to advance: this plan leaves nothing out.",
      blocked:"What stops you", blockedIntro:"The most rewarding advancement left, and what you are short of:",
      missing:"You are short of", orWord:"or", opens:"chests",
      foodOnly:"no chest gives any",
      chestMore:"more — you have {have} of the {need} needed",
      allTitle:"Every advancement left, most rewarding first",
      rankNote:"This ranking is not the order to follow: it compares advancements one by one, ignoring your stock. The order to follow is the plan above.",
      allCount:"{n} advancements",
      colPet:"Pet", colAdv:"Advancement", colPts:"Points", colFood:"Pet Food",
      colMan:"Manuals", colPot:"Potions", colMed:"Medallions", colEff:"Points / chest",
      legend:"Prices are converted into <b>chest equivalents</b>: one chest is {rates} — the only common currency the game gives between the three materials. Green rows are the ones your stock can pay for.",
      orWordPlain:"or",
    }
  };

  const FIELDS = ["petFood", "growthManual", "nutrientPotion", "promotionMedallion", "chest"];

  let PETS = [], SCALE = null, PETMAP = {}, stock = {}, off = [], tab = "walk";
  let pane, elStock, elScore, elChests, elResult, elAll, elPets, elPetsSum, tabWalk, tabPlan;

  const L = () => (window.GlobalLang ? GlobalLang.get() : "EN");
  const tx = () => T[L()] || T.EN;
  const fmt = (n) => Number(n || 0).toLocaleString(L() === "FR" ? "fr-FR" : "en-US");
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

  function matImg(key) {
    const m = (SCALE && SCALE.materials && SCALE.materials[key]) || (key === "chest" && SCALE && SCALE.chest);
    return m && m.img ? m.img : "";
  }
  const chestChoices = () => (SCALE && SCALE.chest && SCALE.chest.choices) || DEFAULT_CHOICES;

  function matName(key) {
    const s = tx();
    return s[key] || key;
  }

  function loadStock() {
    const raw = window.safeParse ? safeParse(LS_STOCK, {}) : {};
    const out = {};
    for (const f of FIELDS) out[f] = num(raw && raw[f]);
    return out;
  }
  function saveStock() {
    const ok = window.ktSafeSet
      ? ktSafeSet(LS_STOCK, JSON.stringify(stock))
      : (function () { try { localStorage.setItem(LS_STOCK, JSON.stringify(stock)); return true; } catch (e) { return false; } })();
    if (!ok && window.ktWarnUnsaved) ktWarnUnsaved();
  }
  function loadOff() {
    const raw = window.safeParse ? safeParse(LS_OFF, []) : [];
    return Array.isArray(raw) ? raw.filter(v => typeof v === "string") : [];
  }
  function saveOff() {
    const ok = window.ktSafeSet
      ? ktSafeSet(LS_OFF, JSON.stringify(off))
      : (function () { try { localStorage.setItem(LS_OFF, JSON.stringify(off)); return true; } catch (e) { return false; } })();
    if (!ok && window.ktWarnUnsaved) ktWarnUnsaved();
  }
  const kept = () => ptFilterPets(PETS, off);

  function petState() {
    return window.safeParse ? safeParse(LS_PETS, {}) : {};
  }
  /* La promenade écrit une entrée par défaut dès l'affichage du 1er familier
     (`{"gray-wolf":{"lvl":1,"adv":{}}}`) : compter les clés ferait croire que le
     joueur a renseigné ses niveaux alors qu'il n'a rien touché. On cherche donc
     une trace RÉELLE — un niveau au-dessus de 1, ou un avancement coché. */
  function hasRealState(state) {
    // Même règle que `ptIsStarted`, à dessein : deux définitions de « le joueur
    // a saisi quelque chose » finiraient par diverger, et l'avertissement
    // disparaîtrait pendant que le filtre, lui, dirait « pas commencé ».
    for (const id in state) if (ptIsStarted(state, id)) return true;
    return false;
  }

  /* ---------- Construction de la coquille (onglets + volet) ---------- */
  function buildShell(petMain) {
    const stage = document.createElement("div");
    stage.className = "pp-stage";
    petMain.parentNode.insertBefore(stage, petMain);

    const tabs = document.createElement("nav");
    tabs.className = "pp-tabs";
    tabs.setAttribute("role", "tablist");
    const caret = '<svg class="pp-tab-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    tabs.innerHTML =
      '<button type="button" class="pp-tab" role="tab" id="pp-tab-walk" aria-controls="petMain" aria-selected="true">' +
        '<svg class="pp-tab-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M7 8l5-5 5 5"/></svg><span></span></button>' +
      '<button type="button" class="pp-tab" role="tab" id="pp-tab-plan" aria-controls="pp-pane" aria-selected="false" tabindex="-1">' +
        '<svg class="pp-tab-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3 7-7M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9"/></svg><span></span></button>';
    stage.appendChild(tabs);

    stage.appendChild(petMain);                       // la promenade descend dans la scène
    petMain.setAttribute("role", "tabpanel");
    petMain.setAttribute("aria-labelledby", "pp-tab-walk");

    pane = document.createElement("section");
    pane.className = "pp-pane";
    pane.id = "pp-pane";
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", "pp-tab-plan");
    pane.hidden = true;
    pane.innerHTML =
      '<div class="pp-head"><h1 class="pp-title"></h1><span class="pp-event"></span></div>' +
      '<p class="pp-sub"></p>' +
      '<div class="pp-cols">' +
        '<div class="pp-side">' +
          '<div class="pp-card"><div class="pp-card-t pp-t-stock"></div><div class="pp-stock"></div>' +
            '<button type="button" class="pp-reset"></button></div>' +

          '<div class="pp-score"></div>' +
          '<div class="pp-card pp-chests"></div>' +
        '</div>' +
        '<div class="pp-main">' +
          /* Le filtre vit dans la COLONNE DU PLAN, pas dans celle du stock : 14 lignes
             feraient déborder la colonne de gauche, qui est en `position:sticky` — son
             bas deviendrait inatteignable dès qu'elle dépasse la hauteur de l'écran.
             Ici les pastilles s'enroulent sur la largeur disponible, et le repli garde
             la vue nette tant qu'on ne s'en sert pas. */
          '<details class="pp-pets"><summary>' +
            '<svg class="pp-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' +
            '<span class="pp-pets-t"></span><span class="pp-pets-n"></span></summary>' +
            '<div class="pp-petbtns"></div><div class="pp-petlist"></div></details>' +
          '<div class="pp-result"></div></div>' +
      '</div>' +
      '<details class="pp-all"></details>';
    stage.appendChild(pane);

    tabWalk  = tabs.querySelector("#pp-tab-walk");
    tabPlan  = tabs.querySelector("#pp-tab-plan");
    /* Les libellés ne dépendent d'aucun fichier : on les pose tout de suite.
       Posés dans `render()`, ils restaient vides tant que les deux `fetch`
       n'avaient pas répondu — et définitivement vides si l'un échouait. */
    nameTabs();
    elStock  = pane.querySelector(".pp-stock");
    elScore  = pane.querySelector(".pp-score");
    elChests = pane.querySelector(".pp-chests");
    elResult = pane.querySelector(".pp-result");
    elAll    = pane.querySelector(".pp-all");
    elPets   = pane.querySelector(".pp-pets");
    elPetsSum = pane.querySelector(".pp-pets-n");

    tabWalk.addEventListener("click", () => setTab("walk"));
    tabPlan.addEventListener("click", () => setTab("plan"));
    tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setTab(tab === "walk" ? "plan" : "walk", true);
    });
    return stage;
  }

  function nameTabs() {
    const s = tx();
    tabWalk.querySelector("span").textContent = s.tabWalk;
    tabPlan.querySelector("span").textContent = s.tabPlan;
  }

  function setTab(which, focus) {
    tab = which;
    const onPlan = which === "plan";
    tabWalk.setAttribute("aria-selected", String(!onPlan));
    tabPlan.setAttribute("aria-selected", String(onPlan));
    tabWalk.tabIndex = onPlan ? -1 : 0;
    tabPlan.tabIndex = onPlan ? 0 : -1;
    const petMain = document.getElementById("petMain");
    if (petMain) petMain.hidden = onPlan;
    pane.hidden = !onPlan;
    if (onPlan) render();                       // les niveaux ont pu changer dans la promenade
    if (focus) (onPlan ? tabPlan : tabWalk).focus();
    else if (!onPlan && petMain && petMain.focus) petMain.focus();
  }

  /* ---------- Formulaire de stock ---------- */
  /* Champs en `type="text"` et non `number` : un stock de nourriture se compte en
     centaines de milliers, illisible sans séparateur de milliers — et un
     `input[type=number]` refuse une valeur qui contient des espaces. Même
     convention que les montants de l'Académie de Guerre et des Vikings. */
  const digitsOf = (v) => String(v == null ? "" : v).replace(/\D/g, "");

  /* Ce que le joueur a VOULU écrire. Le jeu abrège les gros stocks (« 1,2M ») :
     ne garder que les chiffres en faisait 12 — cent mille fois trop peu, et
     sans le moindre signe à l'écran.

     LE SUFFIXE EST OBLIGATOIRE pour qu'un point ou une virgule compte comme
     séparateur DÉCIMAL, et ce n'est pas un détail : en anglais le champ se met
     lui-même en forme avec des virgules de milliers (« 560,825 »). Sans cette
     règle, lire cette virgule comme un décimal ramenait la saisie à 561 — puis
     à 6 au fil des frappes, la mise en forme se réappliquant à chaque touche.
     Hors suffixe, on ne garde donc que les chiffres, comme avant. */
  const AMOUNT = /^(\d+(?:[.,]\d{1,2})?)\s*([km])$/i;
  const GROUPING = /[.,](?=\d{3}(?:\D|$))/g;
  const SUFFIX = { k: 1e3, m: 1e6 };
  function parseAmount(text) {
    /* On efface d'abord les séparateurs de MILLIERS — ceux qui précèdent
       exactement trois chiffres. Sans cette passe, le champ formaté « 1,200 »
       auquel on ajoute un « k » se lisait 1,200 × 1000 = 1 200 au lieu de
       1 200 000 : mille fois trop peu, sans rien à l'écran pour le dire.
       Ce qui reste, un séparateur suivi d'un ou deux chiffres, est bien un
       décimal — c'est la forme abrégée du jeu (« 1,2M », « 1,25M »). */
    const t = String(text == null ? "" : text).replace(/\s/g, "").replace(GROUPING, "");
    const m = AMOUNT.exec(t);
    if (m) return num(Math.round(parseFloat(m[1].replace(",", ".")) * SUFFIX[m[2].toLowerCase()]));
    return num(digitsOf(t));
  }
  /* Saisie encore en cours : on ne remet pas le champ en forme, sinon on
     effacerait la virgule sous les doigts. Un séparateur suivi de TROIS
     chiffres est une virgule de milliers, pas une saisie en cours — sans quoi
     la mise en forme anglaise se bloquerait elle-même dès le 4e chiffre. */
  const isDraftAmount = (text) => /[km]$/i.test(String(text)) || /[.,]\d{0,2}$/.test(String(text));
  window.ptParseAmount = parseAmount;   // exposée comme les autres `pt*` : le harnais la teste
  const groupNum = (n) => Number(n || 0).toLocaleString(L() === "FR" ? "fr-FR" : "en-US").replace(/\u202f/g, "\u00a0");

  // Remet le curseur après le même nombre de CHIFFRES qu'avant, sinon il saute en
  // fin de champ dès qu'un espace s'insère et on ne peut plus corriger au milieu.
  function reformat(inp) {
    const before = digitsOf(inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart)).length;
    const d = digitsOf(inp.value);
    inp.value = d === "" ? "" : groupNum(parseInt(d, 10));
    let pos = 0, seen = 0;
    while (pos < inp.value.length && seen < before) { if (/\d/.test(inp.value[pos])) seen++; pos++; }
    try { inp.setSelectionRange(pos, pos); } catch (e) { /* champ non focalisé */ }
  }

  function renderStock() {
    const s = tx();
    elStock.innerHTML = FIELDS.map(f =>
      '<div class="pp-field">' +
        (matImg(f) ? '<img src="' + esc(matImg(f)) + '" alt="" loading="lazy">' : '') +
        '<label for="pp-in-' + f + '">' + esc(matName(f)) + '</label>' +
        '<input type="text" id="pp-in-' + f + '" inputmode="numeric" autocomplete="off" value="' +
          (stock[f] ? esc(groupNum(stock[f])) : "") + '">' +
      '</div>').join("");
    elStock.querySelectorAll("input").forEach(inp => {
      const key = inp.id.replace("pp-in-", "");
      const commit = () => {
        stock[key] = parseAmount(inp.value);
        saveStock(); scheduleResult();
      };
      inp.addEventListener("input", () => {
        // « 1,2M » en cours de frappe : on laisse le texte tel quel, on le met
        // en forme seulement une fois la saisie terminée.
        if (!isDraftAmount(inp.value)) reformat(inp);
        commit();
      });
      const settle = () => {
        stock[key] = parseAmount(inp.value);
        inp.value = stock[key] ? groupNum(stock[key]) : "";
        saveStock(); scheduleResult();
      };
      inp.addEventListener("change", settle);
      inp.addEventListener("blur", settle);
    });
    pane.querySelector(".pp-t-stock").textContent = s.stock;
    const btn = pane.querySelector(".pp-reset");
    btn.textContent = s.reset;
    btn.onclick = () => {
      for (const f of FIELDS) stock[f] = 0;
      saveStock(); renderStock(); renderResult();
    };
  }

  /* ---------- Filtre des familiers ---------- */
  function renderPets() {
    const s = tx(), lang = L(), state = petState();
    elPets.querySelector(".pp-pets-t").textContent = s.petsFilter;
    countPets();

    const skip = Object.create(null);
    for (const id of off) skip[id] = true;
    elPets.querySelector(".pp-petlist").innerHTML = PETS.map(p => {
      const started = ptIsStarted(state, p.id);
      const lvl = started ? (s.lvlShort + " " + ((state[p.id] && state[p.id].lvl) || 1)) : s.notStarted;
      const cls = "pp-pet" + (skip[p.id] ? " is-off" : "") + (started ? "" : " pp-pet-new");
      return '<label class="' + cls + '">' +
        '<input type="checkbox" data-id="' + esc(p.id) + '"' + (skip[p.id] ? "" : " checked") + '>' +
        '<span class="pp-gen" style="--rc:var(--gen-' + p.generation + ')"></span>' +
        '<span class="pp-pet-nm">' + esc(p.name[lang]) + '</span>' +
        '<span class="pp-pet-lv">' + esc(lvl) + '</span></label>';
    }).join("");
    elPets.querySelectorAll(".pp-petlist input").forEach(inp => {
      inp.addEventListener("change", () => {
        const id = inp.dataset.id;
        off = off.filter(v => v !== id);
        if (!inp.checked) off.push(id);
        saveOff();
        /* On retouche la pastille sur place au lieu de reconstruire la liste :
           un `innerHTML` remplacerait la case qui vient d'être cochée, et le focus
           clavier retomberait sur le body — il faudrait retabuler depuis le haut
           de la page à chaque familier décoché. */
        inp.closest(".pp-pet").classList.toggle("is-off", !inp.checked);
        countPets();
        // Le compteur répond tout de suite ; le plan, lui, coûte jusqu'à ~150 ms
        // de recherche exacte — on le temporise comme la saisie du stock, sinon
        // cocher trois familiers d'affilée bloque la page à chaque clic.
        scheduleResult();
      });
    });

    /* « Seulement les commencés » sur un profil vierge décocherait les 14 d'un
       coup et laisserait le joueur devant un plan vide sans comprendre pourquoi.
       Tant qu'aucun familier n'a été touché dans la promenade, le bouton reste
       désactivé et dit ce qu'il attend. */
    const anyStarted = PETS.some(p => ptIsStarted(state, p.id));
    elPets.querySelector(".pp-petbtns").innerHTML =
      '<button type="button" class="pp-mini" data-act="on">' + esc(s.allOn) + '</button>' +
      '<button type="button" class="pp-mini" data-act="off">' + esc(s.allOff) + '</button>' +
      '<button type="button" class="pp-mini" data-act="started"' + (anyStarted ? "" : " disabled") +
        ' title="' + esc(anyStarted ? s.onlyStartedTip : s.onlyStartedNone) + '">' + esc(s.onlyStarted) + '</button>';
    elPets.querySelectorAll(".pp-petbtns button").forEach(b => {
      b.addEventListener("click", () => {
        const act = b.dataset.act;
        if (act === "on") off = [];
        else if (act === "off") off = PETS.map(p => p.id);
        else off = PETS.filter(p => !ptIsStarted(petState(), p.id)).map(p => p.id);
        saveOff(); refreshPets();
        /* `refreshPets` reconstruit la rangée de boutons, celui qu'on vient
           d'actionner compris : sans ça le focus retombe sur le body et il faut
           retabuler depuis le haut de la page pour enchaîner deux actions. */
        const again = elPets.querySelector('.pp-petbtns button[data-act="' + act + '"]');
        if (again && !again.disabled) again.focus();
      });
    });
  }
  function countPets() {
    elPetsSum.textContent = tx().petsCount.replace("{n}", kept().length).replace("{t}", PETS.length);
  }
  // Le filtre change le plan : les deux se redessinent ensemble, jamais l'un sans l'autre.
  function refreshPets() { renderPets(); scheduleResult(); }

  /* La recherche exacte coûte jusqu'à ~150 ms sur les 14 familiers : la lancer
     à chaque touche rendrait la frappe pâteuse. On la temporise, le champ
     restant lui parfaitement réactif — c'est le plan qui se rafraîchit une fois
     la frappe retombée. */
  let resultTimer = null;
  function scheduleResult() {
    clearTimeout(resultTimer);
    resultTimer = setTimeout(() => { resultTimer = null; renderResult(); }, 220);
  }

  /* ---------- Rendu du résultat ---------- */
  function chip(key, n) {
    if (!n) return "";
    const img = matImg(key);
    return '<span class="pp-chip">' + (img ? '<img src="' + esc(img) + '" alt="">' : '') +
           '<b>' + fmt(n) + '</b> ' + esc(matName(key)) + '</span>';
  }
  function chipShort(key, n) {
    if (!n) return "";
    const img = matImg(key);
    return '<span class="pp-chip" title="' + esc(matName(key)) + '">' +
           (img ? '<img src="' + esc(img) + '" alt="' + esc(matName(key)) + '">' : '') + '<b>' + fmt(n) + '</b></span>';
  }

  function renderResult() {
    const s = tx();
    const state = petState();
    const pets = kept();
    const plan = ptPlanCompute({ pets: pets, scale: SCALE, state: state, stock: stock });
    const anyStock = FIELDS.some(f => stock[f] > 0);
    const notes = [];

    if (!pets.length) notes.push('<div class="pp-note">' + esc(s.nonePicked) + '</div>');
    // `allMaxed` ne parle que des familiers RETENUS : le dire de tous serait faux
    // dès qu'une case est décochée.
    else if (plan.allMaxed) notes.push('<div class="pp-note pp-ok">' +
      esc(pets.length === PETS.length ? s.allDone : s.keptMaxed) + '</div>');
    else {
      if (!hasRealState(state)) notes.push('<div class="pp-note">' + s.noState + '</div>');
      if (!anyStock) notes.push('<div class="pp-note">' + esc(window.matchMedia("(max-width:880px)").matches ? s.emptyStockM : s.emptyStock) + '</div>');
      else if (plan.done) notes.push('<div class="pp-note pp-ok">' + esc(s.planCovers) + '</div>');
      else if (!plan.steps.length) notes.push('<div class="pp-note">' + esc(s.nothing) + '</div>');
    }
    if (pets.length && pets.length < PETS.length)
      notes.push('<div class="pp-note pp-thin">' + esc(s.excluded.replace("{n}", PETS.length - pets.length)) + '</div>');

    /* Bandeau de score */
    elScore.innerHTML =
      '<b class="pp-score-n">' + fmt(plan.totalPoints) + '</b>' +
      '<span class="pp-score-l">' + esc(s.points) + '</span>' +
      '<div class="pp-score-sub">' +
        '<b>' + fmt(plan.steps.length) + '</b> ' + esc(s.steps) + ' · ' +
        s.scoreSub.replace("{score}", fmt(plan.totalScore)).replace("{per}", fmt(SCALE.pointsPerScore)) +
      '</div>' +
      /* Dire ce que vaut ce chiffre. Le moteur cherche le maximum mais ne peut
         pas toujours PROUVER qu'il l'a atteint : sur beaucoup de familiers, il
         s'arrête au bout de son temps imparti. Annoncer « le plus de points
         possible » sans cette réserve, c'est promettre plus qu'on ne tient. */
      (plan.steps.length
        ? '<div class="pp-proof' + (plan.proven ? ' is-proven' : '') + '">' +
            (plan.proven
              ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
              : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 3h.01M12 3l9 16H3z"/></svg>') +
            esc(plan.proven ? s.proven : s.unproven) + '</div>'
        : '');

    /* Coffres + reste */
    const split = plan.chestSplit;
    const openedTotal = split.growthManual + split.nutrientPotion + split.promotionMedallion;
    let chestHTML = '<div class="pp-card-t">' + esc(s.chests) + '</div>';
    if (!openedTotal) chestHTML += '<div class="pp-kv"><span>' + esc(s.chestsNone) + '</span></div>';
    else {
      const rows = [
        [s.inManuals, split.growthManual], [s.inPotions, split.nutrientPotion], [s.inMedallions, split.promotionMedallion]
      ].filter(r => r[1] > 0);
      chestHTML += rows.map(r => '<div class="pp-kv"><span>' + esc(r[0]) + '</span><b>' + fmt(r[1]) + '</b></div>').join("");
    }
    chestHTML += '<div class="pp-card-t" style="margin-top:14px">' + esc(s.leftT) + '</div>' +
      FIELDS.map(f => '<div class="pp-kv' + (plan.left[f] ? '' : ' pp-out') + '"><span>' + esc(matName(f)) + '</span><b>' +
        (plan.left[f] ? fmt(plan.left[f]) : esc(s.nothingLeft)) + '</b></div>').join("");
    elChests.innerHTML = chestHTML;

    /* Les étapes */
    let stepsHTML = "";
    if (plan.steps.length) {
      stepsHTML = '<div class="pp-card-t">' + esc(s.plan) + '</div><div class="pp-steps">' +
        plan.steps.map((st, i) => {
          const p = PETMAP[st.petId] || {};
          const opened = st.chestsOpened || {};
          const nOpen = (opened.growthManual || 0) + (opened.nutrientPotion || 0) + (opened.promotionMedallion || 0);
          return '<div class="pp-step">' +
            '<span class="pp-rank">' + (i + 1) + '</span>' +
            '<img class="pp-thumb" src="img/pets/' + esc(st.petId) + '.webp" alt="" loading="lazy">' +
            '<div class="pp-step-txt">' +
              '<div class="pp-step-nm"><span class="pp-gen" style="--rc:var(--gen-' + (p.generation || 1) + ')"></span>' +
                esc(p.name ? p.name[L()] : st.petId) + ' — ' + esc(s.advTo) + ' ' + st.cap + '</div>' +
              '<div class="pp-step-meta">' +
                '<span class="pp-lvl">' + (st.fromLevel < st.cap
                    ? esc(s.fromTo.replace("{a}", st.fromLevel).replace("{b}", st.cap))
                    : esc(s.noLevelUp) + ' ' + st.cap) + '</span>' +
                chipShort("petFood", st.cost.petFood) + chipShort("growthManual", st.cost.growthManual) +
                chipShort("nutrientPotion", st.cost.nutrientPotion) + chipShort("promotionMedallion", st.cost.promotionMedallion) +
                (nOpen ? '<span class="pp-chip pp-chest" title="' + esc(s.chestInto +
                    MATS.filter(k => opened[k]).map(k => fmt(opened[k]) + " " + matName(k)).join(", ")) +
                    '"><img src="' + esc(matImg("chest")) + '" alt="' + esc(matName("chest")) + '"><b>' + fmt(nOpen) + '</b></span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="pp-pts"><b>+' + fmt(st.points) + '</b><span>' + fmt(st.cumPoints) + '</span></div>' +
          '</div>';
        }).join("") + '</div>' +
        /* Même geste que sur TrueGold et l'Académie de Guerre : une fois le plan
           réalisé en jeu, un bouton reporte le résultat sur la page. Classes
           `.plan-apply*` partagées avec ces deux outils — elles vivent dans
           `css/style.css` depuis longtemps, donc sans risque de cache. */
        '<div class="plan-apply">' +
          '<button type="button" class="plan-apply-btn pp-apply">' +
            (window.iconSvg ? iconSvg("circle-check-big", 18) : "") + esc(s.applyBtn) + '</button>' +
          '<p class="plan-apply-hint">' + esc(s.applyHint) + '</p>' +
        '</div>';
    }

    /* Ce qui bloque */
    let blockHTML = "";
    const blocked = plan.remaining.filter(r => r.blocked);
    if (blocked.length && anyStock) {
      const r = blocked[0], p = PETMAP[r.petId] || {}, m = r.missing;
      const rows = [];
      // La nourriture d'abord, sur sa propre ligne : elle s'additionne au reste.
      if (m.petFood) rows.push('<div class="pp-miss-row">' + chip("petFood", m.petFood) +
        '<span class="pp-miss-why">' + esc(s.foodOnly) + '</span></div>');
      // Puis les matériaux et leur équivalent en coffres, séparés par un « ou » net.
      if (m.matsShort) {
        const inKind = MATS.filter(k => m.mats[k]).map(k => chip(k, m.mats[k])).join("");
        const note = m.chestsHave > 0
          ? '<span class="pp-miss-why">' + esc(s.chestMore.replace("{have}", fmt(m.chestsHave)).replace("{need}", fmt(m.chestsNeeded))) + '</span>'
          : "";
        // Le « ou » et son coffre forment UN groupe : sans ça le « ou » restait
        // seul en fin de ligne et l'alternative passait à la suivante, orpheline.
        rows.push('<div class="pp-miss-row"><span class="pp-miss-grp">' + inKind + '</span>' +
          '<span class="pp-miss-alt"><span class="pp-miss-or">' + esc(s.orWord) + '</span>' +
          chip("chest", m.chestsShort) + note + '</span></div>');
      }
      blockHTML = '<div class="pp-note" style="margin-top:14px"><b>' + esc(s.blocked) + '</b> — ' + esc(s.blockedIntro) +
        '<div class="pp-miss-nm">' + esc(p.name ? p.name[L()] : r.petId) + ' — ' + esc(s.advTo) + ' ' + r.cap +
        ' (+' + fmt(r.points) + ' ' + esc(s.points) + ')</div>' +
        '<div class="pp-miss"><span class="pp-miss-lead">' + esc(s.missing) + '</span>' + rows.join("") + '</div></div>';
    }

    elResult.innerHTML = notes.join("") + stepsHTML + blockHTML;
    const applyBtn = elResult.querySelector(".pp-apply");
    if (applyBtn) applyBtn.addEventListener("click", () => applyPlan(plan));

    /* Le tableau dépliable */
    const rank = ptRankAll({ pets: pets, scale: SCALE, state: state });
    const inPlan = {};
    for (const st of plan.steps) inPlan[st.petId + ":" + st.cap] = true;
    const wasOpen = elAll.open;
    elAll.innerHTML =
      '<summary><svg class="pp-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' +
        esc(s.allTitle) + '<span class="pp-count">' + esc(s.allCount.replace("{n}", fmt(rank.length))) + '</span></summary>' +
      '<div class="pp-tblwrap"><table class="pp-tbl"><thead><tr>' +
        '<th>' + esc(s.colPet) + '</th><th>' + esc(s.colAdv) + '</th>' +
        '<th class="pp-n">' + esc(s.colPts) + '</th><th class="pp-n">' + esc(s.colFood) + '</th>' +
        '<th class="pp-n">' + esc(s.colMan) + '</th><th class="pp-n">' + esc(s.colPot) + '</th>' +
        '<th class="pp-n">' + esc(s.colMed) + '</th><th class="pp-n">' + esc(s.colEff) + '</th>' +
      '</tr></thead><tbody>' +
      rank.map(r => {
        const p = PETMAP[r.petId] || {};
        return '<tr' + (inPlan[r.petId + ":" + r.cap] ? ' class="pp-in"' : '') + '>' +
          '<td class="pp-name">' + esc(p.name ? p.name[L()] : r.petId) + '</td>' +
          '<td>' + esc(s.advTo) + ' ' + r.cap + ' <span class="pp-lvl">(' + esc(s.tier) + ' ' + r.tier + '/' + r.tiers + ')</span></td>' +
          '<td class="pp-n">' + fmt(r.points) + '</td>' +
          '<td class="pp-n">' + fmt(r.cost.petFood) + '</td>' +
          '<td class="pp-n">' + fmt(r.cost.growthManual) + '</td>' +
          '<td class="pp-n">' + (r.cost.nutrientPotion ? fmt(r.cost.nutrientPotion) : "—") + '</td>' +
          '<td class="pp-n">' + (r.cost.promotionMedallion ? fmt(r.cost.promotionMedallion) : "—") + '</td>' +
          '<td class="pp-n">' + (isFinite(r.perChest) ? fmt(Math.round(r.perChest)) : "—") + '</td>' +
        '</tr>';
      }).join("") +
      /* Les taux se lisent dans le JSON : la colonne « points par coffre » les
         suit déjà, la phrase qui l'explique doit en dire autant. Écrits en dur,
         les deux se contrediraient au premier changement de contenu du coffre. */
      '</tbody></table></div><p class="pp-legend"><b>' + esc(s.rankNote) + '</b> ' +
        s.legend.replace("{rates}", esc(MATS.map(m => fmt(chestChoices()[m] || 1) + " " + matName(m)).join(" " + s.orWordPlain + " "))) +
      '</p>';
    elAll.open = wasOpen;
  }

  /* Reporter le plan sur la page : les familiers montent aux caps du plan, leurs
     avancements sont cochés, et le stock devient ce qu'il reste. `plan.left` le
     donne déjà tout cuit — surplus d'ouverture des coffres compris, sans quoi le
     joueur perdrait les matériaux qu'un coffre a versés en trop. */
  function applyPlan(plan) {
    if (!plan || !plan.steps.length) return;
    const s = tx();

    // Ce que chaque familier devient : son plus haut cap atteint, et le nombre
    // d'avancements que le plan lui fait faire.
    const byPet = {};
    for (const st of plan.steps) {
      const e = byPet[st.petId] || (byPet[st.petId] = { from: st.fromLevel, to: st.cap, n: 0, caps: [] });
      e.n++; e.caps.push(st.cap);
      if (st.cap > e.to) e.to = st.cap;
      if (st.fromLevel < e.from) e.from = st.fromLevel;
    }

    let recap = '<div class="apply-diff"><div class="apply-diff-h">' + esc(s.applyPets) + '</div>';
    for (const id in byPet) {
      const e = byPet[id], p = PETMAP[id] || {};
      recap += '<div class="apply-diff-r"><span>' + esc(p.name ? p.name[L()] : id) + '</span>' +
        '<b>' + esc(s.lvlShort) + ' ' + e.from + ' → ' + e.to +
        ' <em>(+' + e.n + ' ' + esc(e.n > 1 ? s.applyAdv : s.applyAdv1) + ')</em></b></div>';
    }
    recap += '<div class="apply-diff-h">' + esc(s.applyStock) + '</div>';
    for (const f of FIELDS) {
      // Une ligne « 0 → 0 » n'apprend rien ; un matériau qui MONTE (surplus de
      // coffre) en apprend beaucoup, donc on le montre aussi.
      if (!stock[f] && !plan.left[f]) continue;
      const after = plan.left[f] ? fmt(plan.left[f]) : esc(s.applyNone);
      recap += '<div class="apply-diff-r"><span>' + esc(matName(f)) + '</span>' +
        '<b>' + fmt(stock[f]) + ' → ' + after + '</b></div>';
    }
    recap += '<div class="apply-diff-r"><span>' + esc(s.applyGain) + '</span><b>+' + fmt(plan.totalPoints) + '</b></div>';
    recap += '</div><div class="apply-warn">' + esc(s.applyWarn) + '</div>';

    const commit = () => {
      // On relit les niveaux au moment de valider, pas à l'affichage : entre les
      // deux, un autre onglet du navigateur a pu les changer, et repartir de la
      // copie affichée écraserait sa modification.
      const now = petState();
      const next = {};
      for (const id in now) next[id] = { lvl: now[id].lvl, adv: Object.assign({}, (now[id] || {}).adv) };
      for (const st of plan.steps) {
        const e = next[st.petId] || (next[st.petId] = { lvl: 1, adv: {} });
        e.adv[st.cap] = true;
        if (st.cap > (Number(e.lvl) || 1)) e.lvl = st.cap;   // l'avancement laisse le familier AU cap
      }
      const ok = window.ktSafeSet
        ? ktSafeSet(LS_PETS, JSON.stringify(next))
        : (function () { try { localStorage.setItem(LS_PETS, JSON.stringify(next)); return true; } catch (e) { return false; } })();
      if (!ok && window.ktWarnUnsaved) ktWarnUnsaved();

      for (const f of FIELDS) stock[f] = plan.left[f];
      saveStock();
      // La promenade garde ses niveaux en mémoire : sans ce rappel elle
      // afficherait les anciens, et les réécrirait à la première modification.
      if (window.petsSyncFromStorage) petsSyncFromStorage();
      renderStock(); renderPets(); renderResult();
      if (window.showAppToast) showAppToast(s.applyDone);
    };

    if (window.showAppConfirm) showAppConfirm('<strong>' + esc(s.applyAsk) + '</strong>' + recap, commit);
    else commit();
  }

  function render() {
    const s = tx();
    nameTabs();
    pane.querySelector(".pp-title").textContent = s.title;
    if (!SCALE) return;      // clic sur l'onglet avant la fin des deux fetch
    pane.querySelector(".pp-event").textContent =
      (SCALE.event && SCALE.event.name && SCALE.event.name[L()]) || "";
    pane.querySelector(".pp-sub").innerHTML = s.sub;
    renderStock();
    renderPets();
    renderResult();
  }

  function renderLoadError() {
    nameTabs();
    pane.querySelector(".pp-title").textContent = tx().title;
    if (elResult) elResult.innerHTML = '<div class="pp-note">' + esc(tx().loadErr) + '</div>';
  }

  function boot() {
    const petMain = document.getElementById("petMain");
    if (!petMain || !petMain.parentNode) return;      // page sans promenade, ou harnais de test
    stock = loadStock();
    off = loadOff();
    buildShell(petMain);

    Promise.all([
      fetch("data/pets_db.json",    { cache: "no-cache" }).then(r => r.json()),
      fetch("data/pets_event.json", { cache: "no-cache" }).then(r => r.json())
    ]).then(([db, scale]) => {
      PETS = db.pets || [];
      SCALE = scale;
      PETMAP = {};
      for (const p of PETS) PETMAP[p.id] = p;
      render();
      window.addEventListener("langChanged", () => { if (SCALE) render(); });
    }).catch(err => {
      console.error("pets-plan:", err);
      renderLoadError();
      window.addEventListener("langChanged", renderLoadError);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
