// ============================================================
//  AVANT L'OR VÉRITABLE — niveaux 1 → 30 des bâtiments
//
//  La page TrueGold planifie l'ère Or Véritable, où la ressource rare est le
//  TG. Avant elle, le joueur bute sur tout autre chose : le pain, le bois, la
//  pierre et le fer, par centaines de millions. C'est donc un autre calcul, et
//  cet onglet le tient à part plutôt que d'ajouter des colonnes à un tableau
//  qui parle déjà d'autre chose.
//
//  Fichier AUTONOME, volontairement : il n'appelle AUCUNE fonction de
//  truegold_script.js et n'en expose aucune. Les <script> du site n'ont pas de
//  cache-busting, un visiteur peut donc charger l'un neuf et l'autre en cache ;
//  un appel croisé serait un ReferenceError en plein rendu (cf. MAP §9). Les
//  deux onglets ne partagent que des ID du DOM et l'event `langChanged`.
// ============================================================

(function () {
  'use strict';

  const DATA_URL = 'data/buildings_db.json';
  const RES = ['bread', 'wood', 'stone', 'iron'];

  // Les bâtiments de cet onglet, dans l'ordre d'affichage — décidé par Aistra,
  // c'est celui du jeu et non un tri alphabétique ou par catégorie. La base en
  // contient cinq de plus (Maison, Cuisine, Clinique, Barricade, Tour de défense)
  // qui ne sont pas planifiés ici : les garder dans le fichier ne coûte rien et
  // ils serviront à une base de données de bâtiments plus complète.
  //
  // Conséquence à connaître : `blockerOf()` cherche un prérequis PARMI cette
  // liste. Les deux niveaux qui exigent « Defense Tower Lv. 1 » (Moulin 1 et
  // Scierie 1) voient donc leur prérequis ignoré, comme les Maisons numérotées.
  // C'est le comportement voulu — sans la Tour de défense au tableau, le joueur
  // n'aurait aucun moyen de lever un blocage sur son premier moulin.
  const PRE_ORDER = [
    'town-center', 'embassy', 'barracks', 'stable', 'range',
    'command-center', 'infirmary', 'academy', 'guard-station', 'storehouse',
    'mill', 'sawmill', 'quarry', 'iron-mine'
  ];

  let DB = null;              // { categories, buildings: [...] }
  let BY_ID = {};
  let state = { rows: {}, stock: {} };   // rows: id -> {cur, tgt, on}

  const i18n = {
    EN: {
      tabPre: 'Before TrueGold', tabTg: 'TrueGold', tabsLabel: 'Building planner views',
      stratTitle: 'Strategy Output',
      sModeQty: 'Max buildings', sModeKvk: 'KVK (max points)', sModeTarget: 'Target score',
      stratIntro: 'What your stock lets you start right now, and what it scores. During the Construction phase the points come from the speedup minutes you burn on building sites: {p} points a minute, the same rate as the TrueGold tab. Resources earn nothing by themselves, they decide how far you can go.',
      stratNone: 'Nothing to start: your stock does not cover the next upgrade of any building you are aiming at.',
      stratNoTarget: 'Every building is already at its target. Raise a target to get a plan.',
      stratPts: 'KVK points', stratAccelUse: 'Speedups burnt', stratAccelLeft: 'Speedups left',
      stratSteps: 'upgrades', stratSpend: 'Resources spent', stratLeft: 'Left in store',
      stratMode: 'Mode', stratOrder: 'Do them in this order',
      stratHit: 'Target reached', stratMiss: 'Out of reach with this stock',
      stratApply: 'Apply these changes',
      stratApplyHint: 'Sets your levels to the ones in this plan, and takes the resources and speedups it uses out of your stock. Do it once you have carried the plan out in game.',
      stratAsk: 'Apply this plan to your page?',
      stratWarn: 'Your current levels, resource stock and speedups will be replaced.',
      stratDone: 'Plan applied: levels, resources and speedups updated.',
      stratNoAccel: 'No speedups in store: the plan can still be built, it just scores nothing. Fill in your speedups above.',
      preIntro: 'Levels 1 to 30, the stretch before TrueGold unlocks. Here the wall is resources, not TrueGold: set where each building stands and where you want it, and the plan tells you what you are short of.',
      preStock: 'Resources in store',
      stockHint: 'Short forms work: 500k, 1.5M, 2B. The field rewrites itself in full when you leave it.', preBuildings: 'My buildings', prePlan: 'What it takes',
      bldg: 'Building', cur: 'Current', tgt: 'Target',
      bread: 'Bread', wood: 'Wood', stone: 'Stone', iron: 'Iron',
      time: 'Build time', power: 'Power', preTotal: 'Total',
      need: 'Needed', have: 'In store', missing: 'Short by', covered: 'Covered',
      order: 'Build order', nothing: 'Nothing to build: every target matches the current level.',
      blocked: 'Out of reach with these targets',
      blockedHint: 'These levels need a Town Center (or another building) higher than what you are aiming for. Raise the target that gates them and they come back into the plan.',
      speedNeed: 'Total build time', gainPower: 'Power gained',
      preHelpNote: 'Costs are the raw values. Your speed bonus, Double Time and the PAN hours apply to the time, exactly as on the TrueGold tab: PAN is taken off each upgrade, never once off the total.',
      resetPre: 'Reset this tab', allOff: 'Tick at least one building.',
      col30: 'To 30', to30: 'Everything to level 30',
      bulkTitle: 'Bulk level change', bulkWhich: 'Buildings', bulkWhat: 'Set',
      bulkAll: 'All of them', bulkOn: 'Ticked ones only',
      bulkCur: 'Current level', bulkTgt: 'Target level', bulkBoth: 'Both',
      bulkLevel: 'to level', bulkApply: 'Apply',
      bulkNone: 'No building ticked.', bulkDone: 'changed', bulkNothing: 'Already set that way.'
    },
    FR: {
      tabPre: "Avant l'Or Véritable", tabTg: 'Or Véritable', tabsLabel: 'Vues du planificateur',
      stratTitle: 'Stratégie',
      sModeQty: 'Max bâtiments', sModeKvk: 'KVK (max points)', sModeTarget: 'Score cible',
      stratIntro: "Ce que ton stock permet de lancer tout de suite, et ce que ça rapporte. Pendant la phase Construction, les points viennent des minutes d'accélérateur brûlées sur les chantiers : {p} points la minute, le même barème que l'onglet Or Véritable. Les ressources, elles, ne rapportent rien par elles-mêmes — elles décident jusqu'où tu peux aller.",
      stratNone: "Rien à lancer : ton stock ne couvre le prochain niveau d'aucun bâtiment que tu vises.",
      stratNoTarget: "Chaque bâtiment est déjà à sa cible. Relève une cible pour obtenir un plan.",
      stratPts: 'Points KVK', stratAccelUse: 'Accélérateurs brûlés', stratAccelLeft: 'Accélérateurs restants',
      stratSteps: 'améliorations', stratSpend: 'Ressources dépensées', stratLeft: 'Reste en stock',
      stratMode: 'Mode', stratOrder: 'À faire dans cet ordre',
      stratHit: 'Score cible atteint', stratMiss: 'Hors de portée avec ce stock',
      stratApply: 'Appliquer les modifications',
      stratApplyHint: "Passe tes niveaux à ceux de ce plan et retire de ton stock les ressources et les accélérateurs qu'il consomme. À faire une fois le plan réalisé en jeu.",
      stratAsk: 'Appliquer ce plan à ta page ?',
      stratWarn: 'Tes niveaux, ton stock de ressources et tes accélérateurs actuels seront remplacés.',
      stratDone: 'Plan appliqué : niveaux, ressources et accélérateurs mis à jour.',
      stratNoAccel: "Aucun accélérateur en stock : le plan reste constructible, il ne rapporte simplement rien. Renseigne tes accélérateurs ci-dessus.",
      preIntro: "Les niveaux 1 à 30, la tranche qui précède l'Or Véritable. Le mur n'y est pas le TG mais les ressources : indique où en est chaque bâtiment et où tu veux l'emmener, le plan dit ce qu'il te manque.",
      preStock: 'Ressources en stock',
      stockHint: "Les raccourcis marchent : 500k, 1,5M, 2B. Le champ se réécrit en entier quand tu en sors.", preBuildings: 'Mes bâtiments', prePlan: 'Ce que ça coûte',
      bldg: 'Bâtiment', cur: 'Actuel', tgt: 'Cible',
      bread: 'Pain', wood: 'Bois', stone: 'Pierre', iron: 'Fer',
      time: 'Temps de construction', power: 'Puissance', preTotal: 'Total',
      need: 'Nécessaire', have: 'En stock', missing: 'Il manque', covered: 'Couvert',
      order: 'Ordre de construction', nothing: 'Rien à construire : chaque cible est déjà au niveau actuel.',
      blocked: 'Hors de portée avec ces cibles',
      blockedHint: "Ces niveaux exigent un Centre-ville (ou un autre bâtiment) plus haut que ce que tu vises. Relève la cible qui les bloque et ils reviennent dans le plan.",
      speedNeed: 'Temps de construction total', gainPower: 'Puissance gagnée',
      preHelpNote: "Les coûts sont les valeurs brutes. Ton bonus de vitesse, les Bouchées Doubles et les heures de PAN s'appliquent au temps, exactement comme sur l'onglet Or Véritable : PAN se retire de chaque amélioration, jamais une seule fois du total.",
      resetPre: 'Réinitialiser cet onglet', allOff: 'Coche au moins un bâtiment.',
      col30: 'Vers 30', to30: 'Tout monter au niveau 30',
      bulkTitle: 'Modification groupée des niveaux', bulkWhich: 'Bâtiments', bulkWhat: 'Régler',
      bulkAll: 'Tous', bulkOn: 'Les cochés seulement',
      bulkCur: 'Le niveau actuel', bulkTgt: 'Le niveau cible', bulkBoth: 'Les deux',
      bulkLevel: 'au niveau', bulkApply: 'Appliquer',
      bulkNone: 'Aucun bâtiment coché.', bulkDone: 'modifiés', bulkNothing: 'Déjà réglé ainsi.'
    }
  };

  const L = () => ((window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'EN');
  const t = k => (i18n[L()] || i18n.EN)[k] || k;
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nf = n => Number(n || 0).toLocaleString(L() === 'FR' ? 'fr-FR' : 'en-US');
  const bname = b => (b.name && (b.name[L()] || b.name.EN)) || b.id;

  // Nombre compact pour les totaux : « 1,29 Md » se lit, « 1 294 100 000 » se compte.
  function big(n) {
    n = Number(n || 0);
    const fr = L() === 'FR';
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace('.', fr ? ',' : '.') + (fr ? ' Md' : 'B');
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', fr ? ',' : '.') + (fr ? ' M' : 'M');
    if (n >= 1e3) return Math.round(n / 1e3) + (fr ? ' k' : 'K');
    return nf(n);
  }

  function fmtTime(sec) {
    sec = Math.round(sec || 0);
    const fr = L() === 'FR';
    const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
    const o = [];
    if (d) o.push(d + (fr ? 'j' : 'd'));
    if (h) o.push(h + 'h');
    if (m && !d) o.push(m + (fr ? 'min' : 'm'));
    return o.join(' ') || (fr ? 'moins d’une minute' : 'under a minute');
  }

  // ---------- bonus de vitesse : relus sur l'onglet Or Véritable ----------
  // Les champs sont partagés (même panneau latéral), on les LIT sans passer par
  // les fonctions de l'autre fichier : deux lignes recopiées valent mieux qu'un
  // appel croisé qui casse au premier cache décalé.
  function speedFactor() {
    const v = el => parseFloat((document.getElementById(el) || {}).value) || 0;
    const on = el => !!(document.getElementById(el) || {}).checked;
    let pct = v('baseVitesse');
    if (on('bonusWolfCheck')) pct += v('bonusWolfVal');
    const cut = on('bonusDouble') ? 0.8 : 1;       // Bouchées Doubles : −20 % multiplicatif
    return cut / (1 + pct / 100);
  }

  // Maître Architecte (PAN) : un nombre d'HEURES retiré à chaque amélioration, une
  // fois les bonus de vitesse appliqués — jamais un pourcentage, et jamais une seule
  // fois sur le total. Le champ était affiché ici mais ignoré du calcul : le joueur
  // saisissait 8 h et son plan ne bougeait pas d'une minute (constat F05 de la revue
  // du 2026-09-20). Même lecture directe du DOM que `speedFactor`, pour la même
  // raison : quand PAN est déduit des Experts, `applyPanUI()` a déjà écrit les heures
  // dans le champ, il n'y a donc rien à aller chercher dans l'autre fichier.
  function panSeconds() {
    const h = parseFloat((document.getElementById('panReduction') || {}).value) || 0;
    return Math.min(Math.max(h, 0), 8) * 3600;
  }

  // ---------- saisie d'un stock de ressources ----------
  // Le joueur lit « 1,5 Md » à l'écran et manipule des centaines de millions : lui
  // faire taper neuf zéros est une invitation à la faute de frappe. Le champ accepte
  // donc les mêmes raccourcis que le jeu — 500k, 1.5M, 2B — en plus des chiffres
  // bruts. `md` est accepté aussi : c'est ce que `big()` affiche en français.
  //
  // Le séparateur décimal peut être le point ou la virgule, et les espaces (y compris
  // l'insécable que `toLocaleString('fr-FR')` produit) sont ignorés : sans ça, une
  // valeur RELUE du champ — qui vient d'être réécrite « 500 000 » au flou — ne se
  // serait plus analysée elle-même.
  //
  // Rend `null` quand la saisie n'est pas comprise. L'appelant garde alors la
  // dernière valeur valable : effacer le stock sur une faute de frappe en cours de
  // saisie serait pire que de ne rien faire, et le champ se réécrit au flou, donc le
  // joueur VOIT ce qui a été retenu.
  const SUFFIXES_STOCK = { k: 1e3, m: 1e6, b: 1e9, md: 1e9 };
  function parseStock(txt) {
    const v = String(txt == null ? '' : txt).toLowerCase().replace(/[\s\u00a0\u202f]/g, '');
    if (!v) return 0;
    const m = v.match(/^([0-9]+(?:[.,][0-9]+)?)(md|k|m|b)?$/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(',', '.'));
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.round(n * (m[2] ? SUFFIXES_STOCK[m[2]] : 1)));
  }

  // ---------- persistance ----------
  function save() {
    try { localStorage.setItem(STORAGE_KEYS.truegoldPre, JSON.stringify(state)); }
    catch (e) { if (window.ktWarnUnsaved) window.ktWarnUnsaved(); }
  }
  function load() {
    const d = safeParse(STORAGE_KEYS.truegoldPre, null);
    if (d && typeof d === 'object') {
      state.rows = (d.rows && typeof d.rows === 'object') ? d.rows : {};
      state.stock = (d.stock && typeof d.stock === 'object') ? d.stock : {};
    }
    // Un état relu peut venir d'une version précédente ou d'une sauvegarde
    // importée : on le borne AVANT qu'il n'indexe les tableaux de niveaux.
    for (const b of DB.buildings) {
      const r = state.rows[b.id] || {};
      const cur = Math.min(Math.max(parseInt(r.cur, 10) || 1, 1), b.maxStd);
      const tgt = Math.min(Math.max(parseInt(r.tgt, 10) || cur, cur), b.maxStd);
      state.rows[b.id] = { cur, tgt, on: r.on !== false };
    }
    for (const k of RES) state.stock[k] = Math.max(0, Number(state.stock[k]) || 0);
  }

  // ---------- calcul ----------
  // Un niveau est jouable quand son prérequis de Centre-ville et ses prérequis
  // de bâtiment sont couverts par l'état SIMULÉ. On déroule donc le plan dans
  // l'ordre où le jeu l'autorise, pas dans l'ordre du tableau : sans ça le plan
  // demanderait un Camp d'Infanterie 25 avant le Centre-ville qui le débloque.
  // Rend null si le niveau est jouable, sinon le prérequis qui manque. Dire
  // « Centre-ville bloqué » sans dire par quoi laisse le joueur chercher parmi
  // dix-neuf bâtiments lequel relever.
  function blockerOf(b, lv, sim) {
    const L1 = b.levels[lv - 1];
    if (!L1) return { name: '?', level: 0 };
    // BY_ID['town-center'] est censé exister — PRE_ORDER l'ouvre — mais un id absent
    // de la base le rendrait indéfini, et `bname(undefined)` emporterait tout l'onglet
    // au premier rendu. Le nom retombe alors sur l'id, ce qui reste lisible.
    if (L1.tc != null && (sim['town-center'] || 0) < L1.tc) {
      const tc = BY_ID['town-center'];
      return { name: tc ? bname(tc) : 'Town Center', level: L1.tc };
    }
    for (const r of L1.req || []) {
      const m = String(r).match(/^(.*) Lv\. (\d+)$/);
      if (!m) continue;
      const dep = DB.buildings.find(x => x.name.EN === m[1]);
      if (!dep) continue;                       // prérequis hors de notre base (Maison 1, etc.)
      if ((sim[dep.id] || 0) < +m[2]) return { name: bname(dep), level: +m[2] };
    }
    return null;
  }
  const levelReady = (b, lv, sim) => blockerOf(b, lv, sim) === null;

  function compute() {
    // Lus une fois pour tout le plan : les deux valent pour chaque étape.
    const sf = speedFactor();
    const panSec = panSeconds();
    const sim = {};
    const want = {};
    for (const b of DB.buildings) {
      const r = state.rows[b.id];
      sim[b.id] = r.cur;
      want[b.id] = r.on ? r.tgt : r.cur;
    }
    const steps = [];
    const tot = { bread: 0, wood: 0, stone: 0, iron: 0, time: 0, power: 0 };
    const perB = {};

    let moved = true;
    while (moved) {
      moved = false;
      // Le moins cher d'abord parmi ce qui est jouable : c'est l'ordre qui
      // débloque le plus vite la suite, et celui que joue n'importe qui.
      let best = null;
      for (const b of DB.buildings) {
        const next = sim[b.id] + 1;
        if (next > want[b.id]) continue;
        if (!levelReady(b, next, sim)) continue;
        const lv = b.levels[next - 1];
        const cost = lv.bread + lv.wood + lv.stone + lv.iron;
        if (!best || cost < best.cost) best = { b, next, lv, cost };
      }
      if (!best) break;
      const { b, next, lv } = best;
      sim[b.id] = next;
      moved = true;
      // Temps RÉELLEMENT passé sur cette amélioration : temps de base divisé par les
      // bonus de vitesse, puis moins les heures de PAN, borné à zéro. Le total du
      // plan est la somme de ces temps-là — multiplier une somme brute par le facteur
      // de vitesse ne permettait pas de retirer PAN étape par étape.
      const sec = Math.max(0, lv.time * sf - panSec);
      // `power` porte la puissance TOTALE du bâtiment à ce niveau, pas le gain du
      // passage. Les additionner comptait donc chaque palier autant de fois qu'il
      // reste de niveaux à monter : 29 → 30 sur le Centre-ville annonçait +1,5 M au
      // lieu de +183 900, soit 8 fois trop (constat F04 de la revue du 2026-09-20).
      // Le gain d'un niveau, c'est l'écart avec le niveau d'en dessous.
      const prev = b.levels[next - 2];
      const gainPower = lv.power - (prev ? prev.power : 0);
      steps.push({ id: b.id, name: bname(b), level: next, lv, sec });
      const p = perB[b.id] || (perB[b.id] = { bread: 0, wood: 0, stone: 0, iron: 0, time: 0, power: 0, from: state.rows[b.id].cur, to: next });
      p.to = next;
      for (const k of RES) { p[k] += lv[k]; tot[k] += lv[k]; }
      p.time += sec; tot.time += sec;
      p.power += gainPower; tot.power += gainPower;
    }

    // Ce que les cibles demandent mais que les prérequis refusent.
    const blocked = [];
    for (const b of DB.buildings) {
      if (sim[b.id] >= want[b.id]) continue;
      blocked.push({ name: bname(b), from: sim[b.id], to: want[b.id], by: blockerOf(b, sim[b.id] + 1, sim) });
    }
    return { steps, tot, perB, blocked, sim };
  }

  // ============================================================
  //  PHASE CONSTRUCTION — l'optimiseur de cet onglet
  //
  //  Avant l'Or Véritable, les points KVK ne viennent QUE des minutes
  //  d'accélérateur brûlées sur les chantiers : 30 points la minute, le même
  //  barème que l'onglet d'à côté (une minute vaut une minute, cf. MAP §12).
  //  Les ressources ne rapportent rien par elles-mêmes — elles BORNENT ce
  //  qu'on peut lancer. D'où un problème différent de celui de l'Or Véritable,
  //  où c'est la ressource dépensée qui marque.
  //
  //  Moteur glouton à plusieurs ordres de passage, comme l'onglet Or Véritable :
  //  aucun ordre unique n'est bon dans les trois modes, on les déroule tous et
  //  on garde le meilleur au sens du mode. Écrit ICI et non repris de
  //  truegold_script.js : ce fichier reste autonome (cf. l'en-tête et MAP §9).
  // ============================================================
  const PTS_PAR_MINUTE = 30;

  // Stock d'accélérateurs, en minutes. Champs partagés, lus au DOM — même raison
  // que `speedFactor()` et `panSeconds()` : pas d'appel croisé.
  function accelMinutes() {
    const v = id => Math.max(0, parseInt((document.getElementById(id) || {}).value, 10) || 0);
    return v('accelJours') * 1440 + v('accelHeures') * 60 + v('accelMinutes');
  }
  function modeActuel() {
    const el = document.getElementById('modeSelect');
    const m = el ? el.value : 'kvk';
    return (m === 'qty' || m === 'target') ? m : 'kvk';
  }
  function scoreCible() {
    const el = document.getElementById('scoreCible');
    const n = parseInt(String((el || {}).value || '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }

  // Déroule un plan selon un ordre donné, borné par le stock de ressources.
  // `arret` dit quand s'arrêter en plus de « plus rien d'abordable ».
  function derouler(choisir, arret) {
    const sim = {}, want = {};
    for (const b of DB.buildings) {
      const r = state.rows[b.id];
      sim[b.id] = r.cur;
      want[b.id] = r.on ? r.tgt : r.cur;
    }
    const reste = {}; for (const k of RES) reste[k] = Math.max(0, Number(state.stock[k]) || 0);
    const sf = speedFactor(), panSec = panSeconds();
    let minutesLibres = accelMinutes();

    const steps = [], perB = {};
    const tot = { bread: 0, wood: 0, stone: 0, iron: 0, minutes: 0, sec: 0, power: 0 };
    for (;;) {
      const jouables = [];
      for (const b of DB.buildings) {
        const next = sim[b.id] + 1;
        if (next > want[b.id]) continue;
        if (!levelReady(b, next, sim)) continue;
        const lv = b.levels[next - 1];
        if (RES.some(k => lv[k] > reste[k])) continue;      // le stock ne couvre pas
        const sec = Math.max(0, lv.time * sf - panSec);
        const prev = b.levels[next - 2];
        jouables.push({
          b: b, next: next, lv: lv, sec: sec,
          cout: RES.reduce((a, k) => a + lv[k], 0),
          minutes: Math.min(sec / 60, minutesLibres),
          gain: lv.power - (prev ? prev.power : 0)
        });
      }
      if (!jouables.length) break;
      const pris = choisir(jouables);
      if (!pris) break;
      if (arret && arret(tot, pris, minutesLibres)) break;

      sim[pris.b.id] = pris.next;
      for (const k of RES) { reste[k] -= pris.lv[k]; tot[k] += pris.lv[k]; }
      minutesLibres -= pris.minutes;
      tot.minutes += pris.minutes;
      tot.sec += pris.sec;
      tot.power += pris.gain;
      const p = perB[pris.b.id] || (perB[pris.b.id] = { from: state.rows[pris.b.id].cur, to: pris.next, nb: 0 });
      p.to = pris.next; p.nb++;
      steps.push({ id: pris.b.id, name: bname(pris.b), level: pris.next, lv: pris.lv, sec: pris.sec, minutes: pris.minutes });
    }
    return { steps, tot, perB, reste, minutesLibres, pts: Math.round(tot.minutes) * PTS_PAR_MINUTE };
  }

  // Les trois ordres de passage. Aucun n'est bon partout : le moins cher monte le
  // plus de bâtiments, le plus long brûle les accélérateurs le plus vite, et le
  // rapport minutes/ressource fait les points au meilleur prix.
  const ORDRES = [
    l => l.reduce((a, c) => c.cout < a.cout ? c : a),
    l => l.reduce((a, c) => c.sec > a.sec ? c : a),
    l => l.reduce((a, c) => (c.minutes / Math.max(1, c.cout)) > (a.minutes / Math.max(1, a.cout)) ? c : a)
  ];

  function planifier() {
    const mode = modeActuel();
    const cible = scoreCible();
    // En mode points, une amélioration qui ne brûle plus rien ne rapporte plus rien :
    // on arrête là plutôt que de dépenser des ressources pour zéro point.
    // En mode points, on s'arrête quand le STOCK d'accélérateurs est épuisé, pas au
    // premier niveau qui n'en brûle pas : un niveau que le PAN rend instantané ne
    // rapporte rien, mais il ne dit rien des niveaux plus longs qui suivent.
    const arret = (mode === 'kvk') ? ((tot, pris, libres) => libres <= 0)
                : (mode === 'target') ? ((tot) => Math.round(tot.minutes) * PTS_PAR_MINUTE >= cible)
                : null;
    let best = null;
    for (const ordre of ORDRES) {
      const p = derouler(ordre, arret);
      if (!best) { best = p; continue; }
      if (mode === 'qty') {
        if (p.steps.length > best.steps.length) best = p;
      } else if (mode === 'target') {
        const ap = p.pts >= cible, ab = best.pts >= cible;
        const coutP = RES.reduce((a, k) => a + p.tot[k], 0), coutB = RES.reduce((a, k) => a + best.tot[k], 0);
        if (ap && !ab) best = p;
        else if (ap === ab && (ap ? coutP < coutB : p.pts > best.pts)) best = p;
      } else {
        // Points d'abord ; à égalité, le plan qui garde le plus d'accélérateurs,
        // puis le moins cher en ressources — même départage que l'Or Véritable.
        const coutP = RES.reduce((a, k) => a + p.tot[k], 0), coutB = RES.reduce((a, k) => a + best.tot[k], 0);
        if (p.pts > best.pts) best = p;
        else if (p.pts === best.pts && p.tot.minutes < best.tot.minutes) best = p;
        else if (p.pts === best.pts && p.tot.minutes === best.tot.minutes && coutP < coutB) best = p;
      }
    }
    best.mode = mode;
    best.cible = cible;
    return best;
  }

  // ---------- rendu ----------
  function renderTable() {
    const tb = document.getElementById('pre-rows');
    if (!tb) return;
    const r = compute();
    let html = '';
    // Pas d'intertitre de catégorie : l'ordre de PRE_ORDER traverse les catégories
    // (Centre-ville, Ambassade, puis les trois camps, puis à nouveau du « cœur »),
    // des en-têtes y couperaient la liste à contretemps.
    for (const b of DB.buildings) {
      const st = state.rows[b.id];
      const p = r.perB[b.id];
      const opts = (sel, min, max) => {
        let o = '';
        for (let i = min; i <= max; i++) o += `<option value="${i}"${i === sel ? ' selected' : ''}>${i}</option>`;
        return o;
      };
      html += `<tr${st.on ? '' : ' class="pre-off"'}>
        <td class="pre-name"><label class="pre-check"><input type="checkbox" data-pre-on="${esc(b.id)}"${st.on ? ' checked' : ''} aria-label="${esc(bname(b))}"><span>${esc(bname(b))}</span></label></td>
        <td><select class="table-select" data-pre-cur="${esc(b.id)}" aria-label="${esc(bname(b))} — ${esc(t('cur'))}">${opts(st.cur, 1, b.maxStd)}</select></td>
        <td><select class="table-select" data-pre-tgt="${esc(b.id)}" aria-label="${esc(bname(b))} — ${esc(t('tgt'))}">${opts(st.tgt, st.cur, b.maxStd)}</select></td>
        <td class="num">${p ? big(p.bread) : '—'}</td>
        <td class="num">${p ? big(p.wood) : '—'}</td>
        <td class="num">${p ? big(p.stone) : '—'}</td>
        <td class="num">${p ? big(p.iron) : '—'}</td>
        <td class="num">${p ? fmtTime(p.time) : '—'}</td>
        <td class="num">${p ? '+' + big(p.power) : '—'}</td>
      </tr>`;
    }
    tb.innerHTML = html;

    const f = document.getElementById('pre-foot');
    if (f) {
      f.innerHTML = `<tr>
        <td colspan="3" style="text-align:right">${esc(t('preTotal'))}</td>
        <td class="num">${big(r.tot.bread)}</td>
        <td class="num">${big(r.tot.wood)}</td>
        <td class="num">${big(r.tot.stone)}</td>
        <td class="num">${big(r.tot.iron)}</td>
        <td class="num">${fmtTime(r.tot.time)}</td>
        <td class="num">+${big(r.tot.power)}</td>
      </tr>`;
    }
    renderPlan(r);
    renderStrategy();
  }

  // ---------- la stratégie de la phase Construction ----------
  // Dernier plan rendu, sous une forme directement applicable à la page. Même
  // contrat que TG_LAST_PLAN côté Or Véritable : jeté à chaque nouvelle saisie,
  // et sa révision est contrôlée à l'ouverture ET à la validation, pour qu'un
  // plan périmé ne puisse jamais être appliqué (constat F03 de la revue).
  let PRE_PLAN = null;
  let PRE_REV = 0;

  function renderStrategy() {
    const box = document.getElementById('pre-strategy');
    if (!box) return;
    PRE_REV++;
    PRE_PLAN = null;

    const p = planifier();
    const minutesStock = accelMinutes();
    // Libellés pris dans le dictionnaire de CE fichier : `modeQty` et consorts
    // vivent dans truegold_script.js, et `t()` rendrait la clé telle quelle.
    const nomMode = { qty: t('sModeQty'), kvk: t('sModeKvk'), target: t('sModeTarget') }[p.mode];

    const cible = DB.buildings.some(b => state.rows[b.id].on && state.rows[b.id].tgt > state.rows[b.id].cur);
    if (!cible) { box.innerHTML = `<p class="pre-empty">${esc(t('stratNoTarget'))}</p>`; return; }
    if (!p.steps.length) {
      // Sans accélérateurs, le mode points n'a rien à optimiser : le dire vaut mieux
      // que « ton stock ne couvre rien », qui serait faux.
      const vide = (p.mode === 'kvk' && minutesStock <= 0) ? t('stratNoAccel') : t('stratNone');
      box.innerHTML = `<p class="pre-empty">${esc(vide)}</p>`;
      return;
    }

    PRE_PLAN = { revision: PRE_REV, perB: p.perB, tot: p.tot, reste: p.reste,
                 minutes: Math.round(p.tot.minutes), pts: p.pts };

    const minutes = Math.round(p.tot.minutes);
    let head = `<p class="pre-note">${esc(t('stratIntro').replace('{p}', PTS_PAR_MINUTE))}</p>`;
    if (minutesStock <= 0) head += `<p class="pre-empty">${esc(t('stratNoAccel'))}</p>`;
    head += `<div class="pre-facts">
      <span class="sx-fact">${esc(t('stratMode'))} : <b>${esc(nomMode)}</b></span>
      <span class="sx-fact">${esc(t('stratPts'))} : <b>${big(p.pts)}</b></span>
      <span class="sx-fact">${esc(t('stratAccelUse'))} : <b>${fmtTime(minutes * 60)}</b></span>
      <span class="sx-fact">${esc(t('stratAccelLeft'))} : <b>${fmtTime(Math.max(0, minutesStock - minutes) * 60)}</b></span>
      <span class="sx-fact">${esc(t('speedNeed'))} : <b>${fmtTime(p.tot.sec)}</b></span>
      <span class="sx-fact">${p.steps.length} ${esc(t('stratSteps'))}</span>
      <span class="sx-fact">${esc(t('gainPower'))} : <b>+${big(p.tot.power)}</b></span>
    </div>`;
    if (p.mode === 'target') {
      const ok = p.pts >= p.cible;
      head += `<p class="pre-note"><b>${esc(ok ? t('stratHit') : t('stratMiss'))}</b> : ${big(p.pts)} / ${big(p.cible)}</p>`;
    }

    // Ce que le plan prend, et ce qu'il reste après.
    let cout = '<div class="pre-gaps">';
    for (const k of RES) {
      cout += `<div class="pre-gap is-ok">
        <div class="pre-gap-res">${esc(t(k))}</div>
        <div class="pre-gap-need">${esc(t('stratSpend'))} <b>${big(p.tot[k])}</b></div>
        <div class="pre-gap-line">${esc(t('stratLeft'))} ${big(p.reste[k])}</div>
      </div>`;
    }
    cout += '</div>';

    const rows = p.steps.map((st, i) => `<tr><td class="num">${i + 1}</td><td>${esc(st.name)}</td><td class="num">${st.level}</td>`
      + RES.map(k => `<td class="num">${st.lv[k] ? big(st.lv[k]) : '—'}</td>`).join('')
      + `<td class="num">${fmtTime(st.sec)}</td><td class="num">${st.minutes > 0 ? big(Math.round(st.minutes) * PTS_PAR_MINUTE) : '—'}</td></tr>`).join('');
    const ordre = `<details class="pre-order" open><summary>${esc(t('stratOrder'))} (${p.steps.length})</summary>
      <div class="table-container"><table class="db-table"><thead><tr>
        <th class="num">#</th><th>${esc(t('bldg'))}</th><th class="num">${esc(t('tgt'))}</th>
        <th class="num">${esc(t('bread'))}</th><th class="num">${esc(t('wood'))}</th>
        <th class="num">${esc(t('stone'))}</th><th class="num">${esc(t('iron'))}</th>
        <th class="num">${esc(t('time'))}</th><th class="num">${esc(t('stratPts'))}</th>
      </tr></thead><tbody>${rows}</tbody></table></div></details>`;

    const appliquer = `<div class="plan-apply">
      <button type="button" class="plan-apply-btn" id="pre-apply">${esc(t('stratApply'))}</button>
      <div class="plan-apply-hint">${esc(t('stratApplyHint'))}</div>
    </div>`;

    box.innerHTML = head + cout + ordre + appliquer;
    const btn = document.getElementById('pre-apply');
    if (btn) btn.addEventListener('click', appliquerPlan);
  }

  // Applique le plan : niveaux atteints, ressources et accélérateurs retranchés.
  function appliquerPlan() {
    const plan = PRE_PLAN;
    if (!plan || plan.revision !== PRE_REV) return;
    let recap = '<div class="apply-diff"><div class="apply-diff-h">' + esc(t('preBuildings')) + '</div>';
    for (const b of DB.buildings) {
      const e = plan.perB[b.id];
      if (!e) continue;
      recap += `<div class="apply-diff-r"><span>${esc(bname(b))}</span><b>${e.from} → ${e.to}</b></div>`;
    }
    recap += `<div class="apply-diff-h">${esc(t('preStock'))}</div>`;
    for (const k of RES) {
      recap += `<div class="apply-diff-r"><span>${esc(t(k))}</span><b>${big(state.stock[k] || 0)} → ${big(plan.reste[k])}</b></div>`;
    }
    const stockMin = accelMinutes();
    recap += `<div class="apply-diff-r"><span>${esc(t('stratAccelUse'))}</span><b>${fmtTime(stockMin * 60)} → ${fmtTime(Math.max(0, stockMin - plan.minutes) * 60)}</b></div>`;
    recap += `</div><div class="apply-warn">${esc(t('stratWarn'))}</div>`;

    const go = () => {
      if (plan.revision !== PRE_REV) return;          // la saisie a bougé pendant la confirmation
      for (const id in plan.perB) {
        const r = state.rows[id];
        if (!r) continue;
        r.cur = Math.max(r.cur, plan.perB[id].to);
        if (r.tgt < r.cur) r.tgt = r.cur;
      }
      for (const k of RES) state.stock[k] = plan.reste[k];
      // Accélérateurs : champs de l'autre onglet. On écrit la valeur PUIS on émet
      // un `input`, ce qui déclenche le `oninput` déjà en place dans le HTML et
      // fait enregistrer l'autre côté. Un événement, jamais un appel croisé.
      const reste = Math.max(0, stockMin - plan.minutes);
      const pose = (id, v) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      pose('accelJours', Math.floor(reste / 1440));
      pose('accelHeures', Math.floor((reste % 1440) / 60));
      pose('accelMinutes', reste % 60);
      save();
      refresh();
      if (window.showAppToast) showAppToast(t('stratDone'), true);
    };
    if (window.showAppConfirm) showAppConfirm(`<strong>${esc(t('stratAsk'))}</strong>${recap}`, go);
    else go();
  }

  function renderPlan(r) {
    const box = document.getElementById('pre-output');
    if (!box) return;
    if (!r.steps.length && !r.blocked.length) { box.innerHTML = `<p class="pre-empty">${esc(t('nothing'))}</p>`; return; }

    // Le manque, ressource par ressource. C'est la seule ligne que le joueur
    // compare directement à son entrepôt, donc elle passe avant le reste.
    let gaps = '<div class="pre-gaps">';
    for (const k of RES) {
      const need = r.tot[k], have = state.stock[k] || 0, miss = Math.max(0, need - have);
      gaps += `<div class="pre-gap${miss ? ' is-short' : ' is-ok'}">
        <div class="pre-gap-res">${esc(t(k))}</div>
        <div class="pre-gap-need">${esc(t('need'))} <b>${big(need)}</b></div>
        <div class="pre-gap-line">${esc(t('have'))} ${big(have)}</div>
        <div class="pre-gap-miss">${miss ? esc(t('missing')) + ' <b>' + big(miss) + '</b>' : esc(t('covered'))}</div>
      </div>`;
    }
    gaps += '</div>';

    const sec = r.tot.time;
    let head = `<div class="pre-facts">
      <span class="sx-fact">${esc(t('speedNeed'))} : <b>${fmtTime(sec)}</b></span>
      <span class="sx-fact">${esc(t('gainPower'))} : <b>+${big(r.tot.power)}</b></span>
      <span class="sx-fact">${r.steps.length} ${L() === 'FR' ? 'améliorations' : 'upgrades'}</span>
    </div>`;

    let blocked = '';
    if (r.blocked.length) {
      blocked = `<div class="pre-blocked"><h4>${esc(t('blocked'))}</h4><ul>`
        + r.blocked.map(b => `<li>${esc(b.name)} : ${b.from} → ${b.to}`
            + (b.by ? ` <span class="pre-by">${L() === 'FR' ? 'exige' : 'needs'} ${esc(b.by.name)} ${L() === 'FR' ? 'niv.' : 'Lv.'} ${b.by.level}</span>` : '')
            + '</li>').join('')
        + `</ul><p>${esc(t('blockedHint'))}</p></div>`;
    }

    // L'ordre complet peut faire 300 lignes : replié par défaut, comme les
    // étapes de l'onglet Or Véritable.
    let order = '';
    if (r.steps.length) {
      const rows = r.steps.map((s, i) => `<tr><td class="num">${i + 1}</td><td>${esc(s.name)}</td><td class="num">${s.level}</td>`
        + RES.map(k => `<td class="num">${s.lv[k] ? big(s.lv[k]) : '—'}</td>`).join('')
        + `<td class="num">${fmtTime(s.sec)}</td></tr>`).join('');
      order = `<details class="pre-order"><summary>${esc(t('order'))} (${r.steps.length})</summary>
        <div class="table-container"><table class="db-table"><thead><tr>
          <th class="num">#</th><th>${esc(t('bldg'))}</th><th class="num">${esc(t('tgt'))}</th>
          <th class="num">${esc(t('bread'))}</th><th class="num">${esc(t('wood'))}</th>
          <th class="num">${esc(t('stone'))}</th><th class="num">${esc(t('iron'))}</th>
          <th class="num">${esc(t('time'))}</th>
        </tr></thead><tbody>${rows}</tbody></table></div></details>`;
    }

    box.innerHTML = head + gaps + blocked + order
      + `<p class="pre-note">${esc(t('preHelpNote'))}</p>`;
  }

  // ---------- modification groupée ----------
  // Régler quatorze listes une par une pour dire « je suis niveau 25 partout »
  // est le geste le plus fréquent de l'onglet. La barre le fait en un clic, sur
  // tous les bâtiments ou sur les seuls cochés, côté niveau actuel, cible ou les
  // deux. Elle se redessine à la langue seulement : la reconstruire à chaque
  // recalcul remettrait les listes du joueur à leur valeur par défaut.
  let bulk = { which: 'all', what: 'cur', level: 1 };

  function renderBulk() {
    const host = document.getElementById('pre-bulk');
    if (!host || !DB) return;                 // HTML d'une version précédente : rien à poser
    const maxLv = DB.buildings.reduce((m, b) => Math.max(m, b.maxStd), 1);
    let lvOpts = '';
    for (let i = 1; i <= maxLv; i++) lvOpts += `<option value="${i}"${i === bulk.level ? ' selected' : ''}>${i}</option>`;
    const opt = (v, cur, label) => `<option value="${v}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    host.innerHTML = `
      <div class="pre-bulk-lbl">${esc(t('bulkTitle'))}</div>
      <div class="pre-bulk-row">
        <label class="pre-bulk-field"><span>${esc(t('bulkWhich'))}</span>
          <select class="table-select" id="pre-bulk-which">
            ${opt('all', bulk.which, t('bulkAll'))}${opt('on', bulk.which, t('bulkOn'))}
          </select></label>
        <label class="pre-bulk-field"><span>${esc(t('bulkWhat'))}</span>
          <select class="table-select" id="pre-bulk-what">
            ${opt('cur', bulk.what, t('bulkCur'))}${opt('tgt', bulk.what, t('bulkTgt'))}${opt('both', bulk.what, t('bulkBoth'))}
          </select></label>
        <label class="pre-bulk-field"><span>${esc(t('bulkLevel'))}</span>
          <select class="table-select" id="pre-bulk-level">${lvOpts}</select></label>
        <button type="button" class="btn-modern btn-modern-secondary" id="pre-bulk-go">${esc(t('bulkApply'))}</button>
        <span class="pre-bulk-say" id="pre-bulk-say" role="status" aria-live="polite"></span>
      </div>`;
  }

  function bulkApply() {
    const say = document.getElementById('pre-bulk-say');
    const targets = DB.buildings.filter(b => bulk.which === 'all' || state.rows[b.id].on);
    if (!targets.length) { if (say) say.textContent = t('bulkNone'); return; }
    let changed = 0;
    for (const b of targets) {
      const st = state.rows[b.id];
      const was = st.cur + '/' + st.tgt;
      // Un bâtiment plafonné plus bas (le Poste de garde s'arrête à 10) prend son
      // propre maximum plutôt que rien : « tout au 25 » doit rester un seul geste.
      const v = Math.min(bulk.level, b.maxStd);
      if (bulk.what === 'cur' || bulk.what === 'both') st.cur = v;
      if (bulk.what === 'tgt' || bulk.what === 'both') st.tgt = v;
      if (st.tgt < st.cur) st.tgt = st.cur;    // une cible sous l'actuel n'a pas de sens
      if (st.cur + '/' + st.tgt !== was) changed++;
    }
    save();
    refresh();
    // Le nombre annoncé est celui des lignes qui ont VRAIMENT bougé : baisser la
    // cible seule sous le niveau actuel ne change rien, l'annoncer ferait croire
    // le contraire à qui ne relit pas le tableau.
    if (say) say.textContent = changed ? changed + ' ' + t('bulkDone') : t('bulkNothing');
  }

  function renderStock() {
    for (const k of RES) {
      const el = document.getElementById('pre-stock-' + k);
      if (el && document.activeElement !== el) el.value = state.stock[k] ? nf(state.stock[k]) : '';
    }
  }

  // `showTab` peut rouvrir l'onglet memorise AVANT que la base soit la (fetch
  // en echec, ou simplement plus lent) : sans cette garde, renderTable() itere
  // sur DB.buildings et sort un TypeError de start().
  function refresh() { if (!DB) return; renderTable(); renderStock(); }

  // renderTable() remplace tout le <tbody>, donc l'element qui vient d'emettre
  // l'event n'existe plus apres coup. Sur un navigateur qui declenche `change`
  // a chaque fleche (Firefox), le focus retombait sur <body> et il fallait
  // retraverser la page a chaque niveau : les listes devenaient inutilisables
  // au clavier. On retrouve le remplacant par son attribut de donnee.
  function refreshKeepingFocus(attr, id) {
    refresh();
    if (!attr || !id) return;
    const next = document.querySelector('[' + attr + '="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
    if (next) next.focus();
  }

  // ---------- interactions ----------
  function wire() {
    const host = document.getElementById('tab-pre');
    if (!host) return;

    host.addEventListener('change', e => {
      const el = e.target;
      const cur = el.getAttribute('data-pre-cur');
      const tgt = el.getAttribute('data-pre-tgt');
      const on = el.getAttribute('data-pre-on');
      if (cur) {
        const b = BY_ID[cur], v = parseInt(el.value, 10) || 1;
        state.rows[cur].cur = v;
        if (state.rows[cur].tgt < v) state.rows[cur].tgt = v;
        void b;
      } else if (tgt) {
        state.rows[tgt].tgt = parseInt(el.value, 10) || state.rows[tgt].cur;
      } else if (on) {
        state.rows[on].on = el.checked;
      } else return;
      save();
      refreshKeepingFocus(cur ? 'data-pre-cur' : tgt ? 'data-pre-tgt' : 'data-pre-on', cur || tgt || on);
    });

    for (const k of RES) {
      const el = document.getElementById('pre-stock-' + k);
      if (!el) continue;
      el.addEventListener('input', () => {
        const n = parseStock(el.value);
        if (n === null) return;              // saisie incomprise : on garde la valeur d'avant
        state.stock[k] = n;
        save(); renderTable();
      });
      el.addEventListener('blur', () => renderStock());
    }

    const bWhich = document.getElementById('pre-bulk');
    if (bWhich) bWhich.addEventListener('change', e => {
      const id = e.target.id;
      if (id === 'pre-bulk-which') bulk.which = e.target.value;
      else if (id === 'pre-bulk-what') bulk.what = e.target.value;
      else if (id === 'pre-bulk-level') bulk.level = parseInt(e.target.value, 10) || 1;
    });
    if (bWhich) bWhich.addEventListener('click', e => {
      if (e.target && e.target.id === 'pre-bulk-go') bulkApply();
    });

    const all30 = document.getElementById('pre-all-30');
    if (all30) all30.addEventListener('click', () => {
      for (const b of DB.buildings) state.rows[b.id].tgt = b.maxStd;
      save(); refresh();
    });
    const reset = document.getElementById('pre-reset');
    if (reset) reset.addEventListener('click', () => {
      const msg = L() === 'FR' ? 'Remettre à zéro les niveaux et le stock de cet onglet ?'
                               : 'Reset this tab’s levels and resource stock?';
      const go = () => {
        try { localStorage.removeItem(STORAGE_KEYS.truegoldPre); } catch (e) { /* stockage refusé : rien à retirer */ }
        state = { rows: {}, stock: {} };
        load(); refresh();
      };
      if (window.showAppConfirm) showAppConfirm(msg, go); else go();
    });

    // Les bonus de vitesse vivent sur l'onglet d'à côté : quand ils bougent,
    // les temps d'ici bougent aussi. `panReduction` est dans le même panneau et
    // entre maintenant dans le calcul : il lui faut le même écouteur, sans quoi la
    // commande resterait sans effet visible jusqu'à la prochaine autre modification.
    // Le mode, le score cible et le stock d'accélérateurs sont eux aussi partagés,
    // et ils ne changent QUE la stratégie : pas la peine de refaire le tableau.
    ['baseVitesse', 'bonusWolfCheck', 'bonusWolfVal', 'bonusDouble', 'panReduction'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => { if (isPreActive()) renderTable(); });
      if (el && el.type === 'number') el.addEventListener('input', () => { if (isPreActive()) renderTable(); });
    });
    ['modeSelect', 'scoreCible', 'accelJours', 'accelHeures', 'accelMinutes'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const maj = () => { if (isPreActive() && DB) renderStrategy(); };
      el.addEventListener('change', maj);
      el.addEventListener('input', maj);
    });
  }

  function isPreActive() {
    const el = document.getElementById('tab-pre');
    return !!el && el.classList.contains('active');
  }

  // ---------- onglets ----------
  // Le panneau latéral n'a pas les mêmes commandes des deux côtés : le stock de
  // ressources ne sert qu'ici, le TG / TTG et le mode KVK ne servent que là-bas.
  function showTab(which) {
    // Les onglets sont des <button role="tab"> : l'état visuel ne suffit pas, il faut
    // aussi le dire (`aria-selected`) et ne laisser qu'UN arrêt de tabulation dans la
    // barre, les flèches faisant le reste — c'est le modèle ARIA du tablist.
    document.querySelectorAll('#tg-tabs .tab').forEach(b => {
      const on = b.getAttribute('data-target') === which;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    document.getElementById('tab-pre').classList.toggle('active', which === 'tab-pre');
    document.getElementById('tab-tg').classList.toggle('active', which === 'tab-tg');
    const pre = which === 'tab-pre';
    const g1 = document.getElementById('pre-options-group');
    const g2 = document.getElementById('tg-options-group');
    if (g1) g1.style.display = pre ? '' : 'none';
    if (g2) g2.style.display = pre ? 'none' : '';
    const tier = document.getElementById('serverTierRow');
    const tierHint = document.getElementById('serverTierHint');
    if (tier) tier.style.display = pre ? 'none' : '';
    if (tierHint) tierHint.style.display = pre ? 'none' : '';
    try { localStorage.setItem('tg_tab', which); } catch (e) { /* onglet non mémorisé, sans conséquence */ }
    if (pre) refresh();
  }

  function initTabs() {
    // Les deux onglets étaient des <div> : ni atteignables avec Tab, ni activables
    // sans souris (constat F10 de la revue du 2026-09-20, relevé sur la page
    // Recherches — mêmes onglets, même défaut ici). Ce sont des <button> dans un
    // `tablist`, avec flèches, Début et Fin ; Entrée et Espace sont natifs.
    const tabs = Array.from(document.querySelectorAll('#tg-tabs .tab'));
    tabs.forEach((b, i) => {
      // `b`, pas `e.target` : une icône ajoutée dans le bouton deviendrait la cible.
      b.addEventListener('click', () => showTab(b.getAttribute('data-target')));
      b.addEventListener('keydown', e => {
        const last = tabs.length - 1;
        let go = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go = tabs[i === last ? 0 : i + 1];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go = tabs[i === 0 ? last : i - 1];
        else if (e.key === 'Home') go = tabs[0];
        else if (e.key === 'End') go = tabs[last];
        if (!go) return;
        e.preventDefault();
        showTab(go.getAttribute('data-target'));
        go.focus();
      });
    });
    let want = 'tab-tg';
    try { const s = localStorage.getItem('tg_tab'); if (s === 'tab-pre' || s === 'tab-tg') want = s; } catch (e) { /* défaut */ }
    showTab(want);
  }

  // ---------- démarrage ----------
  function applyLang() {
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(i18n[L()] || i18n.EN);
    // `applyI18n` n'écrit que du texte : le nom de la barre d'onglets est un
    // `aria-label`, il se pose à la main, comme les libellés des champs générés.
    const bar = document.getElementById('tg-tabs');
    if (bar) bar.setAttribute('aria-label', t('tabsLabel'));
    if (DB) { renderBulk(); refresh(); }
  }

  async function start() {
    try {
      const r = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      DB = await r.json();
    } catch (e) {
      // Un échec ici ne doit pas emporter l'onglet Or Véritable, qui a sa
      // propre base : on le dit dans le panneau et on s'arrête là.
      console.error('Base des bâtiments non chargée :', e);
      const box = document.getElementById('pre-output');
      if (box) box.innerHTML = `<p class="pre-empty">${esc(L() === 'FR'
        ? 'Impossible de charger data/buildings_db.json.' : 'Could not load data/buildings_db.json.')}</p>`;
      if (window.ktWarnDataFailure) window.ktWarnDataFailure();
      initTabs();
      return;
    }
    // On ne garde que les quatorze bâtiments planifiés ici, dans l'ordre de
    // PRE_ORDER. Un id absent de la base est simplement sauté : le tableau reste
    // cohérent si le fichier change avant le code.
    DB.buildings = PRE_ORDER.map(id => DB.buildings.find(b => b.id === id)).filter(Boolean);
    BY_ID = Object.fromEntries(DB.buildings.map(b => [b.id, b]));
    load();
    wire();
    initTabs();
    applyLang();
  }

  window.addEventListener('langChanged', applyLang);
  // PAN déduit du Conseil des Experts : l'autre onglet vient de remplir le champ
  // sans qu'aucune saisie n'ait eu lieu. Cf. `applyPanUI()` dans truegold_script.js.
  window.addEventListener('panChanged', () => { if (DB && isPreActive()) renderTable(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
