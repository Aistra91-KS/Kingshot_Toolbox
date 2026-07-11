// ============================================================
//  WAR ACADEMY — page controller
//  Loads truegold_war_db.json, renders the faithful per-troop
//  research tree (nodes + dynamically drawn connectors), wires
//  the sidebar controls to wa_optimizer.js, persists to localStorage.
//  Bilingual FR/EN via GlobalLang. Exposes window.WA for inline handlers.
// ============================================================

(function () {
  'use strict';

  // ---------------- i18n ----------------
  const i18n = {
    EN: {
      ctrlPanel: 'Control Panel', config: 'Configuration',
      waLevel: 'War Academy Level', speedBonus: 'Speed Bonus (%)', costReduction: 'Cost Reduction (%)',
      resources: 'Resources', dustBudget: 'TrueGold Dust',
      kvkTitle: 'Mode & Speedups', modeLabel: 'Mode',
      modeClassic: 'Max researches', modeKvk: 'KvK (max points)', modeTarget: 'Target score',
      targetScore: 'Target score', days: 'Days', hours: 'Hours', minutes: 'Minutes',
      filters: 'Suggestion Filters', treeInfantry: 'Infantry', treeArcher: 'Archer', treeCavalry: 'Cavalry',
      researchTree: 'Research Tree', treeHint: "Tap a node's level to set your current progress.",
      strategyOutput: 'Strategy Output',
      legMax: 'Maxed', legDone: 'In progress', legAvail: 'Available', legLocked: 'Locked', legSuggested: 'Suggested',
      core: 'War Academy',
      headClassic: '🛠️ MAX RESEARCHES', headKvk: '🏆 KvK — MAX POINTS', headTarget: '🎯 TARGET SCORE',
      cResearch: 'researches', cLevels: 'levels', cDust: 'Dust', cReste: 'left', cTime: 'Time',
      cSpeedHave: 'your speedups', cMissing: 'short', cSpare: 'spare', cPoints: 'KvK points',
      cFromDust: 'dust', cFromTime: 'time',
      reached: '✅ Target reached', notReached: '⚠️ Target not reached with this dust — max:',
      lvls: 'lvls', empty: 'No research available. Raise your War Academy level, set your current levels, or add dust.',
      completed: 'Completed', inProgress: 'In progress',
      planTitle: 'Upgrade Plan', planDust: 'Cost', planTime: 'Time', planPoints: 'Points',
      planBonus: 'New bonus', planTotal: 'Total',
      dbErr: '⚠️ Could not load the research database (data/truegold_war_db.json).',
      plan: 'Research Plan:',
      costLabel: 'Cost:', dustUnit: 'dust', buffLabel: 'Buff:',
      timeMgt: 'Time Management:', totalTime: 'Total time:', speedupsAvail: 'Speedups available:',
      bilan: 'KvK Breakdown:', dustUsed: ' dust = ', accelUsed: ' speedup min = ',
      pts: ' KvK points', totalMax: 'Total:',
      modesFilters: 'Modes & Filters',
      helpTitle: 'War Academy — Help',
      helpSummary: "Plans the optimal TrueGold research path for your goal: complete as many researches as possible, maximize KvK points, or reach a target score for the least dust.",
    },
    FR: {
      ctrlPanel: 'Panneau de Contrôle', config: 'Configuration',
      waLevel: 'Niveau Académie de Guerre', speedBonus: 'Bonus Vitesse (%)', costReduction: 'Réduction de Coût (%)',
      resources: 'Ressources', dustBudget: "Poussières d'Or Véritable",
      kvkTitle: 'Mode & Accélérateurs', modeLabel: 'Mode',
      modeClassic: 'Max recherches', modeKvk: 'KvK (max points)', modeTarget: 'Score cible',
      targetScore: 'Score cible', days: 'Jours', hours: 'Heures', minutes: 'Minutes',
      filters: 'Filtres de Suggestion', treeInfantry: 'Infanterie', treeArcher: 'Archers', treeCavalry: 'Cavalerie',
      researchTree: 'Arbre de Recherche', treeHint: "Touche le niveau d'un nœud pour indiquer ta progression.",
      strategyOutput: 'Résultat de la Stratégie',
      legMax: 'Max', legDone: 'En cours', legAvail: 'Disponible', legLocked: 'Bloqué', legSuggested: 'Suggéré',
      core: 'Académie de Guerre',
      headClassic: '🛠️ MAX RECHERCHES', headKvk: '🏆 KvK — MAX POINTS', headTarget: '🎯 SCORE CIBLE',
      cResearch: 'recherches', cLevels: 'niveaux', cDust: 'Poussières', cReste: 'reste', cTime: 'Temps',
      cSpeedHave: 'tes accélérateurs', cMissing: 'il manque', cSpare: 'de reste', cPoints: 'points KvK',
      cFromDust: 'poussières', cFromTime: 'temps',
      reached: '✅ Score cible atteint', notReached: '⚠️ Cible non atteinte avec ces poussières — max :',
      lvls: 'niv.', empty: "Aucune recherche disponible. Monte ton niveau d'Académie de Guerre, renseigne tes niveaux, ou ajoute des poussières.",
      completed: 'Terminé', inProgress: 'En cours',
      planTitle: 'Plan d\'amélioration', planDust: 'Coût', planTime: 'Temps', planPoints: 'Points',
      planBonus: 'Nouveau bonus', planTotal: 'Total',
      plan: 'Plan de Recherche :',
      costLabel: 'Coût :', dustUnit: 'pouss.', buffLabel: 'Bonus :',
      timeMgt: 'Gestion du Temps :', totalTime: 'Temps total :', speedupsAvail: 'Accélérateurs disponibles :',
      bilan: 'Bilan KvK :', dustUsed: ' pouss. = ', accelUsed: ' min d\'accél. = ',
      pts: ' points KvK', totalMax: 'Total :',
      modesFilters: 'Modes & Filtres',
      dbErr: '⚠️ Impossible de charger la base de recherche (data/truegold_war_db.json).',
      helpTitle: 'Académie de Guerre — Aide',
      helpSummary: "Calcule le chemin de recherche TrueGold optimal selon ton objectif : valider un maximum de recherches, maximiser les points KvK, ou atteindre un score cible au moindre coût en poussières.",
    },
  };
  const HELP_STEPS = {
    FR: [
      "Renseigne ton niveau d'Académie de Guerre (1–10) : il débloque les paliers de l'arbre.",
      "Sur l'arbre, touche le niveau de chaque recherche pour indiquer ta progression actuelle.",
      "Indique tes poussières d'Or Véritable, tes accélérateurs et ton bonus de vitesse.",
      "Coche les arbres (Infanterie / Archers / Cavalerie) à inclure dans la suggestion.",
      "Choisis le mode : Max recherches, KvK (max points) ou Score cible.",
      "Lis la stratégie : les recherches à monter, les poussières et le temps nécessaires, et les points KvK.",
    ],
    EN: [
      'Set your War Academy level (1–10): it unlocks the tree tiers.',
      'On the tree, tap each research level to set your current progress.',
      'Enter your TrueGold Dust, your speedups and your speed bonus.',
      'Tick the trees (Infantry / Archer / Cavalry) to include in the suggestion.',
      'Pick a mode: Max researches, KvK (max points), or Target score.',
      'Read the strategy: which researches to level, the dust and time needed, and the KvK points.',
    ],
  };

  // ---------------- layout (identical topology for the 3 trees) ----------------
  // slot index -> grid position + icon. Order matches the DB research order.
  // Top-to-bottom layout: root (War Academy) at row 1, progression descends.
  const LAYOUT = [
    { slot: 0, row: 2, col: 2, icon: 'users' },        // Battalion
    { slot: 1, row: 3, col: 1, icon: 'shield' },       // Weapon A (Shields/Bracers/Farriery)
    { slot: 2, row: 3, col: 3, icon: 'swords' },       // Weapon B (Blades/Bows/Charge)
    { slot: 3, row: 4, col: 2, icon: 'crown' },        // Legionaries
    { slot: 4, row: 4, col: 3, icon: 'pickaxe' },      // Maul type (needs Weapon B)
    { slot: 5, row: 4, col: 1, icon: 'brick-wall' },   // Plate type (needs Weapon A)
    { slot: 6, row: 5, col: 2, icon: 'star' },         // Unit unlock
    { slot: 7, row: 6, col: 1, icon: 'heart-pulse' },  // Healing
    { slot: 8, row: 6, col: 3, icon: 'handshake' },    // Aid
    { slot: 9, row: 6, col: 2, icon: 'trending-up' },  // Training
  ];
  // Connector edges (prereq -> dependent). 'core' is the War Academy node.
  const EDGES = [
    ['core', 0],
    [0, 1], [0, 2],
    [1, 5], [1, 3],
    [2, 4], [2, 3],
    [5, 6], [3, 6], [4, 6],
    [6, 7], [6, 8], [6, 9],
  ];
  const TREE_ORDER = ['infantry', 'archer', 'cavalry'];

  // ---------------- state ----------------
  let DB = null;
  let state = {
    waLevel: 4, speedBonus: 76.5, dustBudget: 0,
    mode: 'classic', targetScore: 2000000,
    accDays: 2, accHours: 0, accMinutes: 0,
    enabled: { infantry: true, archer: true, cavalry: true },
    activeTree: 'infantry',
    levels: {}, // "treeId.researchId" -> current level
  };
  const SKEY = (window.STORAGE_KEYS && window.STORAGE_KEYS.waracademy) || 'wa_calc_data_v1';
  const lang = () => (window.GlobalLang ? window.GlobalLang.get() : 'FR');
  const t = (k) => (i18n[lang()] && i18n[lang()][k]) || i18n.EN[k] || k;
  const nm = (obj) => (obj ? (obj[lang()] || obj.EN || obj.FR || '') : '');
  const rkey = (tree, res) => tree + '.' + res;

  // ---------------- helpers ----------------
  const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(Number(v) || 0)));
  const digits = (s) => String(s).replace(/[^\d]/g, '');
  const parseNum = (s) => { const d = digits(s); return d ? parseInt(d, 10) : 0; };
  const fmtNum = (n) => Number(n || 0).toLocaleString('fr-FR').replace(/\u202f/g, ' ');

  function fmtTime(min) {
    min = Math.round(min || 0);
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    const dl = lang() === 'EN' ? 'd' : 'j';
    const out = [];
    if (d) out.push(d + dl);
    if (h) out.push(h + 'h');
    if (m || !out.length) out.push(m + 'm');
    return out.join(' ');
  }

  const treeById = (id) => DB.trees.find(tr => tr.id === id);
  const resAt = (tree, slot) => tree.researches[slot];
  const curOf = (treeId, res) => clampInt(state.levels[rkey(treeId, res.id)] || 0, 0, res.maxLevel);

  // Visual state of a node: 'max' | 'done' | 'available' | 'locked'
  function nodeState(treeId, res) {
    const cur = curOf(treeId, res);
    if (cur >= res.maxLevel) return 'max';
    if (cur > 0) return 'done';
    // cur === 0 -> is level 1 doable?
    const lvl = res.levels.find(l => l.level === 1);
    if (!lvl) return 'locked';
    if ((lvl.reqWA || 0) > state.waLevel) return 'locked';
    for (const dep of (lvl.req || [])) {
      const depRes = treeById(treeId).researches.find(r => r.id === dep.r);
      if (!depRes || curOf(treeId, depRes) < dep.lvl) return 'locked';
    }
    return 'available';
  }

  // ---------------- persistence ----------------
  function save() {
    try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { saved = null; }
    if (saved && typeof saved === 'object') {
      state = Object.assign(state, saved);
      state.enabled = Object.assign({ infantry: true, archer: true, cavalry: true }, saved.enabled || {});
      state.levels = saved.levels || {};
    }
  }

  // Push state -> sidebar inputs
  function syncInputs() {
    const set = (id, v) => { const el = document.getElementById(id); if (el && el !== document.activeElement) el.value = v; };
    set('waLevel', state.waLevel);
    set('speedBonus', state.speedBonus);
    set('dustBudget', state.dustBudget);
    set('targetScore', state.targetScore);
    set('accDays', state.accDays);
    set('accHours', state.accHours);
    set('accMinutes', state.accMinutes);
    const ms = document.getElementById('modeSelect'); if (ms) ms.value = state.mode;
    ['infantry', 'archer', 'cavalry'].forEach(id => {
      const c = document.getElementById('filter-' + id); if (c) c.checked = !!state.enabled[id];
    });
    const tr = document.getElementById('targetRow');
    if (tr) tr.style.display = state.mode === 'target' ? '' : 'none';
  }

  // Pull sidebar inputs -> state
  function readInputs() {
    const g = (id) => document.getElementById(id);
    state.waLevel = clampInt(g('waLevel').value, 1, 10);
    state.speedBonus = Math.max(0, parseFloat(g('speedBonus').value) || 0);
    state.dustBudget = parseNum(g('dustBudget').value);
    state.targetScore = parseNum(g('targetScore').value);
    state.accDays = Math.max(0, Number(g('accDays').value) || 0);
    state.accHours = Math.max(0, Number(g('accHours').value) || 0);
    state.accMinutes = Math.max(0, Number(g('accMinutes').value) || 0);
    state.mode = g('modeSelect').value;
    ['infantry', 'archer', 'cavalry'].forEach(id => {
      const c = g('filter-' + id); if (c) state.enabled[id] = c.checked;
    });
  }

  // ---------------- rendering: tabs ----------------
// ---- node visuals: official image (with icon fallback) + next-level resource cost ----
  const abbr = (v) => {
    v = Number(v) || 0;
    if (v >= 1e6) { const x = v / 1e6; return (x >= 10 || x % 1 === 0 ? Math.round(x) : x.toFixed(1)) + 'M'; }
    if (v >= 1e3) { const x = v / 1e3; return (x >= 10 || x % 1 === 0 ? Math.round(x) : x.toFixed(1)) + 'K'; }
    return String(v);
  };
  function shortTime(min) {
    min = Math.round(min || 0);
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    const dl = lang() === 'EN' ? 'd' : 'j';
    if (d) return d + dl + (h ? ' ' + h + 'h' : '');
    if (h) return h + 'h' + (m ? ' ' + m + 'm' : '');
    return m + 'm';
  }
  function nodeImgHtml(res, iconName) {
    const src = 'img/WarAcademy/' + state.activeTree + '_' + res.id + '.webp';
    return `<div class="wa-node__icon">
        <img class="wa-node__img" src="${src}" alt="" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='';">
        <span class="wa-node__fb" style="display:none">${window.iconSvg(iconName, 22)}</span>
      </div>`;
  }
  function nextResHtml(res, cur) {
    if (cur >= res.maxLevel) return '';
    const lv = res.levels[cur]; // levels[cur] === level cur+1
    if (!lv) return '';
    const it = (icon, val, cls) => `<span class="wa-res__item${cls ? ' ' + cls : ''}">${window.iconSvg(icon, 12)}<b>${val}</b></span>`;
    return '<div class="wa-res">' +
      it('coins', fmtNum(lv.dust), 'is-dust') +
      it('clock', shortTime(lv.time)) +
      (lv.coin ? it('coins', abbr(lv.coin)) : '') +
      (lv.bread ? it('wheat', abbr(lv.bread)) : '') +
      (lv.wood ? it('tree-pine', abbr(lv.wood)) : '') +
      (lv.stone ? it('brick-wall', abbr(lv.stone)) : '') +
      (lv.iron ? it('pickaxe', abbr(lv.iron)) : '') +
      '</div>';
  }
  
  // Level control: [−] value [+] /max  (replaces the old text input)
  function stepperHtml(cur, max, min, label) {
    const dis = (c) => c ? ' disabled' : '';
    const maxTxt = cur >= max ? 'MAX' : '/' + max;
    return `<div class="wa-node__badge" role="group" aria-label="${label}">
        <button type="button" class="wa-node__step" data-d="-1" aria-label="−"${dis(cur <= min)}>−</button>
        <span class="wa-node__cur">${cur}</span>
        <button type="button" class="wa-node__step" data-d="1" aria-label="+"${dis(cur >= max)}>+</button>
        <span class="wa-node__max">${maxTxt}</span>
      </div>`;
  }

  function renderTabs() {
    const box = document.getElementById('wa-tabs');
    box.innerHTML = TREE_ORDER.map(id => {
      const tr = treeById(id);
      const active = id === state.activeTree ? ' active' : '';
      return `<div class="tab${active}" data-tree="${id}">
        <span class="wa-dot" data-tree="${id}"></span>${nm(tr.name)}</div>`;
    }).join('');
    box.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => {
        state.activeTree = el.getAttribute('data-tree');
        box.querySelectorAll('.tab').forEach(t2 =>
          t2.classList.toggle('active', t2.getAttribute('data-tree') === state.activeTree));
        save();
        renderTree();
        recompute();
      });
    });
  }

  // ---------------- rendering: tree ----------------
  function renderTree() {
    const wrap = document.getElementById('wa-tree');
    const svg = document.getElementById('wa-connectors');
    // clear nodes but keep the svg element
    wrap.querySelectorAll('.wa-node').forEach(n => n.remove());
    wrap.setAttribute('data-active-tree', state.activeTree);

    const tree = treeById(state.activeTree);

    // Core node (War Academy gate) — top center. Selectable up to 10 (content unlocks at 5).
    const core = document.createElement('div');
    core.className = 'wa-node wa-core';
    core.style.gridRow = 1; core.style.gridColumn = 2;
    core.dataset.node = 'core';
    core.innerHTML =
      `<div class="wa-node__diamond"><span>${window.iconSvg('coins', 18)}</span></div>
       <div class="wa-node__name">${t('core')}</div>
       ${stepperHtml(clampInt(state.waLevel, 1, 10), 10, 1, t('core'))}`;
    wrap.appendChild(core);

    // Research nodes
    LAYOUT.forEach(L => {
      const res = resAt(tree, L.slot);
      if (!res) return;
      const cur = curOf(state.activeTree, res);
      const el = document.createElement('div');
      el.className = 'wa-node';
      el.style.gridRow = L.row; el.style.gridColumn = L.col;
      el.dataset.node = res.id;
      el.innerHTML =
        `<span class="wa-node__lock">🔒</span>
         ${nodeImgHtml(res, L.icon)}
         <div class="wa-node__name">${nm(res.name)}</div>
         ${stepperHtml(cur, res.maxLevel, 0, nm(res.name))}
         <div class="wa-node__res">${nextResHtml(res, cur)}</div>`;
      wrap.appendChild(el);
    });

    // ensure svg sits behind nodes
    wrap.insertBefore(svg, wrap.firstChild);
    refreshStates();
  }

  // Delegated +/- handling (attached once; survives re-renders)
  function onStepClick(e) {
    const btn = e.target.closest('.wa-node__step');
    if (!btn || btn.disabled) return;
    const node = btn.closest('.wa-node');
    if (!node) return;
    const d = parseInt(btn.getAttribute('data-d'), 10);
    if (node.classList.contains('wa-core')) {
      state.waLevel = clampInt(state.waLevel + d, 1, 10);
      const sb = document.getElementById('waLevel'); if (sb) sb.value = state.waLevel;
    } else {
      const tree = treeById(state.activeTree);
      const res = tree.researches.find(r => r.id === node.getAttribute('data-node'));
      if (!res) return;
      const cur = curOf(state.activeTree, res);
      state.levels[rkey(state.activeTree, res.id)] = clampInt(cur + d, 0, res.maxLevel);
    }
    save();
    recompute(); // re-runs optimiser -> refreshStates(suggested) -> updates values, badges, connectors
  }

  // Recompute node classes + stepper values + connectors (no rebuild)
  function syncStepper(el, cur, max, min) {
    if (!el) return;
    const val = el.querySelector('.wa-node__cur');
    if (val) val.textContent = cur;
    const maxEl = el.querySelector('.wa-node__max');
    if (maxEl) maxEl.textContent = cur >= max ? 'MAX' : '/' + max;
    const btns = el.querySelectorAll('.wa-node__step');
    if (btns[0]) btns[0].disabled = cur <= min; // −
    if (btns[1]) btns[1].disabled = cur >= max; // +
  }

  function refreshStates(suggested) {
    const wrap = document.getElementById('wa-tree');
    const tree = treeById(state.activeTree);
    // core
    syncStepper(wrap.querySelector('.wa-core'), clampInt(state.waLevel, 1, 10), 10, 1);
    // researches
    LAYOUT.forEach(L => {
      const res = resAt(tree, L.slot);
      if (!res) return;
      const el = wrap.querySelector('.wa-node[data-node="' + res.id + '"]');
      if (!el) return;
      const cur = curOf(state.activeTree, res);
      const st = nodeState(state.activeTree, res);
      el.classList.remove('is-max', 'is-done', 'is-available', 'is-locked', 'is-suggested');
      el.classList.add('is-' + st);
      syncStepper(el, cur, res.maxLevel, 0);
      const rEl = el.querySelector('.wa-node__res');
      if (rEl) rEl.innerHTML = nextResHtml(res, cur);
      // suggested tag
      let tag = el.querySelector('.wa-node__tag');
      const sKey = rkey(state.activeTree, res.id);
      if (suggested && suggested[sKey]) {
        el.classList.add('is-suggested');
        if (!tag) { tag = document.createElement('span'); tag.className = 'wa-node__tag'; el.appendChild(tag); }
        tag.textContent = '→ ' + suggested[sKey];
      } else if (tag) { tag.remove(); }
    });
    drawConnectors();
  }

  function drawConnectors() {
    const wrap = document.getElementById('wa-tree');
    const svg = document.getElementById('wa-connectors');
    const tree = treeById(state.activeTree);
    const box = wrap.getBoundingClientRect();
    if (!box.width) return;
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);

    const centerOf = (nodeKey) => {
      const el = wrap.querySelector('.wa-node[data-node="' + nodeKey + '"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { el, x: r.left - box.left + r.width / 2, top: r.top - box.top, bot: r.top - box.top + r.height };
    };
    const nodeKeyOf = (slotOrCore) =>
      slotOrCore === 'core' ? 'core' : (resAt(tree, slotOrCore) ? resAt(tree, slotOrCore).id : null);
    const isLive = (nodeKey) => {
      if (nodeKey === 'core') return state.waLevel >= 1;
      const el = wrap.querySelector('.wa-node[data-node="' + nodeKey + '"]');
      return el && (el.classList.contains('is-done') || el.classList.contains('is-max'));
    };

    let paths = '';
    for (const [aSlot, bSlot] of EDGES) {
      const aKey = nodeKeyOf(aSlot), bKey = nodeKeyOf(bSlot);
      if (!aKey || !bKey) continue;
      const a = centerOf(aKey), b = centerOf(bKey);
      if (!a || !b) continue;
      // Direction-agnostic: connect bottom of the higher node to top of the lower node
      const upper = a.top <= b.top ? a : b;
      const lower = a.top <= b.top ? b : a;
      const x1 = upper.x, y1 = upper.bot;
      const x2 = lower.x, y2 = lower.top;
      const midY = y1 + (y2 - y1) * 0.5;
      const r = 8;
      const dir = x2 >= x1 ? 1 : -1;
      let d;
      if (Math.abs(x2 - x1) < 2) {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        d = `M ${x1} ${y1} L ${x1} ${midY - r} ` +
            `Q ${x1} ${midY} ${x1 + dir * r} ${midY} ` +
            `L ${x2 - dir * r} ${midY} ` +
            `Q ${x2} ${midY} ${x2} ${midY + r} ` +
            `L ${x2} ${y2}`;
      }
      const cls = isLive(bKey) ? 'live' : 'dim'; // bKey = dependent
      paths += `<path d="${d}" class="${cls}"/>`;
    }
    svg.innerHTML = paths;
  }

  // ---------------- optimiser + output ----------------
  function enabledTrees() {
    return TREE_ORDER.filter(id => state.enabled[id]);
  }

  function recompute() {
    if (!DB || !window.WA_Optimizer) return;
    const speedupBudget = state.accDays * 1440 + state.accHours * 60 + state.accMinutes;
    const res = window.WA_Optimizer.suggest({
      db: DB, currentLevels: state.levels, waLevel: state.waLevel,
      dustBudget: state.dustBudget, speedBonusPct: state.speedBonus,
      costReductionPct: 0, speedupBudget,
      enabledTrees: enabledTrees(),
      mode: state.mode, targetScore: state.targetScore,
    });
    renderOutput(res);
    // suggested set (research -> highest target level) for the ACTIVE tree highlight
    const suggested = {};
    res.steps.forEach(s => {
      const k = rkey(s.treeId, s.researchId);
      suggested[k] = Math.max(suggested[k] || 0, s.toLevel);
    });
    refreshStates(suggested);
  }

  function renderOutput(res) {
    const box = document.getElementById('wa-output');
    const heads = { classic: t('headClassic'), kvk: t('headKvk'), target: t('headTarget') };
    if (!res.steps.length) {
      box.innerHTML = `<div class="wa-out-head">${heads[res.mode]}</div>
        <div class="wa-empty">${t('empty')}</div>`;
      return;
    }

    // Aggregate per research, keep first-appearance order (priority hint)
    const agg = {}; const order = [];
    res.steps.forEach(s => {
      const k = rkey(s.treeId, s.researchId);
      if (!agg[k]) {
        agg[k] = { treeId: s.treeId, name: s.name, from: s.fromLevel, to: s.toLevel, maxLevel: s.maxLevel,
          dust: 0, baseDust: 0, time: 0, points: 0, n: 0, buff: '' };
        order.push(k);
      }
      const a = agg[k];
      a.from = Math.min(a.from, s.fromLevel);
      a.to = Math.max(a.to, s.toLevel);
      a.dust += s.effDust;
      a.baseDust += s.baseDust;
      a.time += s.effTime;
      a.points += s.points;
      a.n += 1;
      // Keep the buff from the highest level reached
      if (s.toLevel >= a.to) a.buff = s.buff || '';
    });

    const colors = { infantry: '#54c66a', archer: '#ef5a4c', cavalry: '#4d9be6' };
    const treeLabels = { infantry: t('treeInfantry'), archer: t('treeArcher'), cavalry: t('treeCavalry') };

    // Keep the plan's order, but always put the single "in progress" research last.
    const sorted = order.filter(k => k !== res.inProgress);
    if (order.includes(res.inProgress)) sorted.push(res.inProgress);

    // Exactly ONE research can be left unfinished (single in-game research queue):
    // the optimizer reports it as res.inProgress; every other research is completed.
    const tot = res.totals;
    const availMin = state.accDays * 1440 + state.accHours * 60 + state.accMinutes;

    const rowsHtml = sorted.map((k) => {
      const a = agg[k];
      const isMax = a.to >= a.maxLevel;
      const isInProgress = (k === res.inProgress);
      const statusHtml = isInProgress
        ? `<span class="wa-step__status wa-step__status--progress">${t('inProgress')}</span>`
        : `<span class="wa-step__status wa-step__status--done">${t('completed')}</span>`;
      const treeTag = `<span class="wa-step__tree" style="color:${colors[a.treeId]}">${treeLabels[a.treeId]}</span>`;
      const buffHtml = a.buff
        ? `<div class="wa-step__buff">${a.buff}</div>`
        : '';

      return `<div class="wa-step" style="--step-color:${colors[a.treeId]}">
        <div class="wa-step__header">
          <span class="wa-step__name">${nm(a.name)}</span>
          ${treeTag}
          ${statusHtml}
        </div>
        <div class="wa-step__levels">Lv.${a.from} → <b>Lv.${a.to}</b>${isMax ? '' : ' / ' + a.maxLevel} <small>(${a.n} ${t('lvls')})</small></div>
        ${buffHtml}
        <div class="wa-step__details">
          <span class="wa-step__detail"><span class="wa-step__detail-label">${t('planDust')}</span> <b>${fmtNum(a.dust)}</b></span>
          <span class="wa-step__detail"><span class="wa-step__detail-label">${t('planTime')}</span> <b>${fmtTime(a.time)}</b></span>
          <span class="wa-step__detail"><span class="wa-step__detail-label">${t('planPoints')}</span> <b>${fmtNum(a.points)}</b></span>
        </div>
      </div>`;
    }).join('');

    const diff = availMin - tot.effTimeMin;
    const speedChip = diff >= 0
      ? `<span class="wa-chip wa-chip-ok">${t('cSpeedHave')}: ${fmtTime(availMin)} — <b>${fmtTime(diff)} ${t('cSpare')}</b></span>`
      : `<span class="wa-chip wa-chip-warn">${t('cSpeedHave')}: ${fmtTime(availMin)} — <b>${t('cMissing')} ${fmtTime(-diff)}</b></span>`;

    let chips =
      `<span class="wa-chip"><b>${order.length}</b> ${t('cResearch')} · <b>${tot.count}</b> ${t('cLevels')}</span>` +
      `<span class="wa-chip">${t('cDust')}: <b>${fmtNum(tot.effDust)}</b>${res.remaining.dust != null ? ` / ${fmtNum(state.dustBudget)} (${fmtNum(res.remaining.dust)} ${t('cReste')})` : ''}</span>` +
      `<span class="wa-chip">${t('cTime')}: <b>${fmtTime(tot.effTimeMin)}</b></span>` +
      speedChip +
      `<span class="wa-chip">${t('cPoints')}: <b>${fmtNum(tot.kvkPoints)}</b> <small>(${fmtNum(tot.kvkFromDust)} ${t('cFromDust')} + ${fmtNum(tot.kvkFromTime)} ${t('cFromTime')})</small></span>`;

    let targetLine = '';
    if (res.mode === 'target' && res.target) {
      targetLine = res.target.reached
        ? `<div class="wa-chip wa-chip-ok" style="margin-bottom:14px;"><b>${t('reached')}</b> (${fmtNum(tot.kvkPoints)})</div>`
        : `<div class="wa-chip wa-chip-warn" style="margin-bottom:14px;"><b>${t('notReached')} ${fmtNum(tot.kvkPoints)}</b></div>`;
    }

    // Summary: completed count + in-progress indicator
    const inProgressCount = order.includes(res.inProgress) ? 1 : 0;
    const completedCount = order.length - inProgressCount;
    const summaryParts = [];
    if (completedCount) summaryParts.push(`<b style="color:var(--success)">${completedCount}</b> ${t('completed')}`);
    if (inProgressCount) summaryParts.push(`<b style="color:var(--warning)">${inProgressCount}</b> ${t('inProgress')}`);

    const totalHtml =
      `<div class="wa-out-bilan">
        <div class="wa-out-bilan-title">${t('bilan')}</div>
        <div class="wa-out-bilan-row">🔶 <b>${fmtNum(tot.kvkFromDust)}</b>${t('pts')} — ${t('cFromDust')}</div>
        <div class="wa-out-bilan-row">⏱️ <b>${fmtNum(tot.kvkFromTime)}</b>${t('pts')} — ${t('cFromTime')}</div>
      </div>
      <div class="wa-out-total">🚀 ${t('totalMax')} <span class="wa-out-total-num">${fmtNum(tot.kvkPoints)}</span>${t('pts')}</div>`;

    box.innerHTML =
      `<div class="wa-out-head">${heads[res.mode]}</div>` +
      targetLine +
      `<div class="wa-out-chips">${chips}</div>` +
      (summaryParts.length ? `<div class="wa-out-summary">${summaryParts.join(' · ')}</div>` : '') +
      `<div class="wa-out-plan-title">${t('planTitle')}</div>` +
      `<div class="wa-steps">${rowsHtml}</div>` +
      totalHtml;
  }

  // ---------------- inline handlers (window.WA) ----------------
  const debounce = (fn, d = 180) => { let x; return (...a) => { clearTimeout(x); x = setTimeout(() => fn(...a), d); }; };
  const doUpdate = debounce(() => { readInputs(); syncInputs(); save(); recompute(); }, 160);

  window.WA = {
    triggerUpdate: doUpdate,
    onModeChange() {
      const tr = document.getElementById('targetRow');
      if (tr) tr.style.display = document.getElementById('modeSelect').value === 'target' ? '' : 'none';
      doUpdate();
    },
  };

  // ---------------- i18n apply + startup ----------------
  function applyI18n() {
    if (window.GlobalLang) window.GlobalLang.applyI18n(i18n[lang()]);
    document.title = (lang() === 'EN' ? 'TrueGold War Academy' : 'Académie de Guerre TrueGold') + ' — Kingshot Toolbox';
  }

  function initHelp() {
    if (!window.HelpSystem) return;
    try {
      window.HelpSystem.init({
        id: 'waracademy', banner: true, anchor: '[data-i18n="researchTree"]',
        title: { FR: i18n.FR.helpTitle, EN: i18n.EN.helpTitle },
        summary: { FR: i18n.FR.helpSummary, EN: i18n.EN.helpSummary },
        steps: HELP_STEPS,
      });
    } catch (e) { /* help optional */ }
  }

  async function boot() {
    load();
    syncInputs();
    try {
      const r = await fetch('data/truegold_war_db.json');
      DB = await r.json();
    } catch (e) {
      document.getElementById('wa-output').innerHTML = `<div class="wa-empty">${t('dbErr')}</div>`;
      return;
    }
    applyI18n();
    renderTabs();
    renderTree();
    document.getElementById('wa-tree').addEventListener('click', onStepClick);
    recompute();
    initHelp();

    window.addEventListener('resize', debounce(drawConnectors, 120));
    window.addEventListener('langChanged', () => {
      applyI18n();
      renderTabs();
      renderTree();
      recompute();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
