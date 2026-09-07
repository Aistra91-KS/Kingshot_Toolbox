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
      tradeTitle: 'Dust Exchanges',
      tradeHint: 'Coins and TrueGold buy dust every week. Tick the exchanges you agree to make — the plan converts only what it really needs.',
      tradeCoins: 'Coins available', tradeTruegold: 'TrueGold to convert',
      tradeColUse: 'Use', tradeColWhat: 'Exchange', tradeColDone: 'Done this week', tradeColPlan: 'In this plan',
      tradeWhatCoins: '5 000 coins → 1 dust', tradeWhatTg5: '5 TrueGold → 13 dust', tradeWhatTg10: '10 TrueGold → 13 dust',
      tradeNoCap: 'no weekly cap', tradeOff: 'not used', tradeTotal: 'Dust this plan buys',
      tradeCoinsRow: 'coins', tradeTgRow: 'TrueGold',
      cCoins: 'Coins', cCoinsNeed: 'needed', cCoinsResearch: 'researches', cCoinsTrades: 'exchanges',
      outTradeTitle: 'Exchanges to make first', outTradeConvert: 'Convert', outTradeInto: 'into',
      outTradeVia: 'exchange(s) of', tradeCountShort: 'exchange(s)', outStocksTitle: 'Your stocks once exchanged',
      outStockDust: 'TrueGold Dust:', outStockCoins: 'Coins:', outStockTg: 'TrueGold:',
      outTradeOver: 'dust more than the plan spends, kept for next time', tradeGivesShort: 'dust',
      applyTradeCoins: 'Coins', applyTradeTg: 'TrueGold to convert',
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
      bilan: 'KvK Breakdown:', dustUsed: ' dust → ', accelUsed: ' of speedups → ',
      pts: ' KvK points', totalMax: 'Total:',
      modesFilters: 'Modes & Filters',
      applyBtn: 'Apply these changes',
      applyHint: 'Updates your research levels, your dust and your speedups as if you had just carried out this plan in game.',
      applyAsk: 'Apply this plan to your page?',
      applyResearch: 'Researches levelled',
      applyResources: 'Dust & speedups',
      applyDust: 'TrueGold Dust',
      applySpeedups: 'Speedups',
      applyNone: 'none left',
      applyWarn: '⚠️ Your current levels, dust and speedups will be replaced.',
      applyDone: '✅ Plan applied — levels and resources updated.',
      helpTitle: 'War Academy — Help',
      helpSummary: "Plans the optimal TrueGold research path for your goal: complete as many researches as possible, maximize KvK points, or reach a target score for the least dust.",
    },
    FR: {
      ctrlPanel: 'Panneau de Contrôle', config: 'Configuration',
      waLevel: 'Niveau Académie de Guerre', speedBonus: 'Bonus Vitesse (%)', costReduction: 'Réduction de Coût (%)',
      resources: 'Ressources', dustBudget: "Poussières d'Or Véritable",
      tradeTitle: 'Échanges de poussière',
      tradeHint: "Les pièces et le TrueGold achètent de la poussière chaque semaine. Coche les échanges que tu acceptes de faire — le plan ne convertit que ce dont il a vraiment besoin.",
      tradeCoins: 'Pièces disponibles', tradeTruegold: 'TrueGold à convertir',
      tradeColUse: 'Utiliser', tradeColWhat: 'Échange', tradeColDone: 'Faits cette semaine', tradeColPlan: 'Dans ce plan',
      tradeWhatCoins: '5 000 pièces → 1 poussière', tradeWhatTg5: '5 TrueGold → 13 poussières', tradeWhatTg10: '10 TrueGold → 13 poussières',
      tradeNoCap: 'sans plafond', tradeOff: 'non utilisé', tradeTotal: 'Poussières achetées par ce plan',
      tradeCoinsRow: 'pièces', tradeTgRow: 'TrueGold',
      cCoins: 'Pièces', cCoinsNeed: 'nécessaires', cCoinsResearch: 'recherches', cCoinsTrades: 'échanges',
      outTradeTitle: 'Échanges à faire d’abord', outTradeConvert: 'Convertir', outTradeInto: 'en',
      outTradeVia: 'échange(s) de', tradeCountShort: 'échange(s)', outStocksTitle: 'Tes stocks une fois les échanges faits',
      outStockDust: "Poussières d'Or Véritable :", outStockCoins: 'Pièces :', outStockTg: 'TrueGold :',
      outTradeOver: 'poussières de plus que ce que le plan dépense, gardées pour la prochaine fois', tradeGivesShort: 'poussières',
      applyTradeCoins: 'Pièces', applyTradeTg: 'TrueGold à convertir',
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
      bilan: 'Bilan KvK :', dustUsed: ' poussières → ', accelUsed: ' d\'accélérateurs → ',
      pts: ' points KvK', totalMax: 'Total :',
      modesFilters: 'Modes & Filtres',
      applyBtn: 'Appliquer les modifications',
      applyHint: "Met à jour tes niveaux de recherche, tes poussières et tes accélérateurs comme si tu venais de réaliser ce plan en jeu.",
      applyAsk: 'Appliquer ce plan à ta page ?',
      applyResearch: 'Recherches montées',
      applyResources: 'Poussières & accélérateurs',
      applyDust: "Poussières d'Or Véritable",
      applySpeedups: 'Accélérateurs',
      applyNone: 'plus rien',
      applyWarn: '⚠️ Tes niveaux, tes poussières et tes accélérateurs actuels seront remplacés.',
      applyDone: '✅ Plan appliqué — niveaux et ressources mis à jour.',
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
      "Sous l'arbre, le panneau « Échanges de poussière » sert à en acheter : une ligne par échange du jeu, que tu coches ou non. Saisis les pièces et le TrueGold que tu acceptes d'y mettre — le champ dit bien « TrueGold à convertir », pas « ton stock » : le même TrueGold sert à monter tes bâtiments sur la page TrueGold, et l'outil ne décide pas à ta place combien tu veux y laisser. Décoche les deux lignes TrueGold et le plan n'y touchera jamais.",
      "Renseigne les échanges déjà faits cette semaine : ils entament le plafond (200 pour les pièces, 20 pour l'échange à 5 TrueGold), pas ton stock. Attention, un plafond atteint change le conseil : l'échange à 5 TrueGold rend 13 poussières, celui à 10 TrueGold aussi — donc deux fois moins par TrueGold. Une fois tes 20 échanges à 5 TG consommés, le plan se rabat sur le second et ton or rapporte moitié moins.",
      "Les recherches coûtent aussi des PIÈCES, et beaucoup : près de 900 000 sur un plan d'un mois. Laisse « Pièces disponibles » à zéro et l'outil se contente de t'annoncer la quantité nécessaire, à vérifier en jeu. Renseigne-les et elles bornent le plan : il partage alors tes pièces entre ce que coûtent les recherches et ce que coûtent les échanges, et ne te propose jamais un plan que tu ne peux pas payer.",
      "Coche les arbres (Infanterie / Archers / Cavalerie) à inclure dans la suggestion.",
      "Choisis le mode : Max recherches, KvK (max points) ou Score cible.",
      "Lis la stratégie : les recherches à monter, les poussières, les pièces et le temps nécessaires, et les points KvK.",
      "Si le plan a besoin d'échanges, ils sont listés en tête du résultat, avant les recherches — c'est l'ordre à suivre en jeu, il faut la poussière en main avant de lancer la première recherche. Les trois nombres qui suivent (« Tes stocks une fois les échanges faits ») sont ceux à recopier dans tes saisies pour démarrer.",
      "Une fois le plan réalisé en jeu, clique sur « Appliquer les modifications » en bas du résultat : après confirmation, tes niveaux de recherche passent à ceux du plan, et tes poussières, accélérateurs, pièces et TrueGold sont réduits d'autant — compteurs d'échanges hebdomadaires compris. L'outil enchaîne alors sur la suggestion suivante.",
    ],
    EN: [
      'Set your War Academy level (1–10): it unlocks the tree tiers.',
      'On the tree, tap each research level to set your current progress.',
      'Enter your TrueGold Dust, your speedups and your speed bonus.',
      'Below the tree, the "Dust Exchanges" panel buys more of it: one row per exchange in the game, ticked or not. Enter the coins and the TrueGold you agree to spend — the field says "TrueGold to convert", not "your stock": the same TrueGold pays for your buildings on the TrueGold page, and the tool does not get to decide how deep into it you go. Untick both TrueGold rows and the plan will never touch it.',
      'Fill in the exchanges you have already made this week: they eat into the cap (200 for coins, 20 for the 5-TrueGold one), not into your stock. A maxed cap changes the advice: the 5-TrueGold exchange gives 13 dust and so does the 10-TrueGold one — half as much per TrueGold. Once your 20 five-TG exchanges are spent, the plan falls back on the second and your gold buys half the dust.',
      'Researches cost COINS too, and plenty: close to 900,000 across a month-long plan. Leave "Coins available" at zero and the tool simply tells you how many you will need, to check in game. Fill it in and it bounds the plan: your coins are then split between what the researches cost and what the exchanges cost, and you are never handed a plan you cannot pay for.',
      'Tick the trees (Infantry / Archer / Cavalry) to include in the suggestion.',
      'Pick a mode: Max researches, KvK (max points), or Target score.',
      'Read the strategy: which researches to level, the dust, coins and time needed, and the KvK points.',
      'If the plan needs exchanges, they are listed at the top of the result, before the researches — that is the order to follow in game, since you need the dust in hand before starting the first research. The three figures that follow ("your stocks once exchanged") are the ones to copy back into your inputs to get going.',
      'Once you\'ve carried the plan out in game, click “Apply these changes” at the bottom of the result: after confirming, your research levels jump to the plan\'s, and your dust, speedups, coins and TrueGold go down accordingly — weekly exchange counters included. The tool then moves on to the next suggestion.',
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
  // Les trois échanges de poussière, dans l'ordre des lignes du panneau. Les
  // identifiants sont ceux de DUST_TRADES (wa_optimizer.js) : c'est la même liste vue
  // des deux bouts, il ne faut pas qu'elles divergent.
  const TRADE_IDS = ['coins', 'tg5', 'tg10'];
  // Le barème vient de `DUST_TRADES` (wa_optimizer.js) et n'est PAS recopié ici : prix,
  // plafonds et libellés en découlent, donc un changement de règle en jeu se corrige à
  // un seul endroit. Le repli ne sert qu'au cas de cache mixte (script du moteur encore
  // en cache, sans l'export) — il ne doit jamais devenir la source de vérité.
  const TRADE_RULES = (() => {
    const src = (window.WA_Optimizer && window.WA_Optimizer.DUST_TRADES) || [];
    const par = {};
    TRADE_IDS.forEach(id => {
      const r = src.find(x => x.id === id);
      par[id] = { price: r ? r.price : null, dust: r ? r.dust : null, weeklyMax: r ? r.weeklyMax : null };
    });
    return par;
  })();
  const COIN_TRADE_PRICE = TRADE_RULES.coins.price || 5000;
  const COIN_TRADE_MAX   = TRADE_RULES.coins.weeklyMax || 200;
  const TG5_TRADE_MAX    = TRADE_RULES.tg5.weeklyMax || 20;
  const TRADE_USE_EL  = { coins: 'tradeUseCoins',  tg5: 'tradeUseTg5',  tg10: 'tradeUseTg10' };
  const TRADE_PLAN_EL = { coins: 'tradePlanCoins', tg5: 'tradePlanTg5', tg10: 'tradePlanTg10' };
  const TREE_COLORS = { infantry: '#54c66a', archer: '#ef5a4c', cavalry: '#4d9be6' };

  // ---------------- state ----------------
  let DB = null;
  let state = {
    waLevel: 4, speedBonus: 76.5, dustBudget: 0,
    // Échanges de poussière. Une ligne par échange, cochable : le joueur choisit
    // ceux qu'il accepte de faire. Celui à 10 TG est décoché d'office — il rend
    // 1,3 poussière par TrueGold contre 2,6 pour celui à 5 TG, on n'entame pas le
    // stock au tarif double sans que le joueur l'ait voulu.
    tradeCoins: 0, tradeUsedCoins: 0, tradeTruegold: 0, tradeUsedTg5: 0,
    tradeUse: { coins: true, tg5: true, tg10: false },
    mode: 'classic', targetScore: 2000000,
    accDays: 2, accHours: 0, accMinutes: 0,
    enabled: { infantry: true, archer: true, cavalry: true },
    activeTree: 'infantry',
    levels: {}, // "treeId.researchId" -> current level
  };
  // Dernier plan calculé, gardé pour « Appliquer les modifications » : le bouton
  // n'est affiché que dans la sortie de ce même calcul, les deux restent donc en phase.
  let lastPlan = null;
  // Échanges que le plan affiché suppose faits, ou null. Naît du même calcul que
  // `lastPlan`, donc les deux ne peuvent pas se désynchroniser.
  let lastTrades = null;
  // Ce que le plan affiché coûte en pièces : recherches, échanges, total, et le budget
  // déclaré (null si le joueur n'a rien saisi — la sortie affiche alors la quantité
  // nécessaire au lieu d'un reste).
  let lastCoins = { research: 0, trades: 0, total: 0, budget: null };
  // Poussière que le joueur DÉTIENDRA une fois les échanges du plan faits — donc
  // stock + ce que ces échanges rapportent, et non la capacité entière. La puce de
  // sortie doit parler de poussière ; la capacité encore disponible, elle, est déjà
  // affichée dans la sidebar et ne doit pas se faire passer pour un reste de stock.
  let lastDustHeld = 0;
  const SKEY = (window.STORAGE_KEYS && window.STORAGE_KEYS.waracademy) || 'wa_calc_data_v1';
  const lang = () => (window.GlobalLang ? window.GlobalLang.get() : 'FR');
  const t = (k) => (i18n[lang()] && i18n[lang()][k]) || i18n.EN[k] || k;
  const nm = (obj) => (obj ? (obj[lang()] || obj.EN || obj.FR || '') : '');
  const rkey = (tree, res) => tree + '.' + res;
  // Les 3 arbres partagent les mêmes noms de recherche : sans l'arbre, « Bataillon »
  // apparaîtrait trois fois à l'identique dans les listes.
  const treeLabel = (id) => t('tree' + id.charAt(0).toUpperCase() + id.slice(1));

  // ---------------- helpers ----------------
  const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.floor(Number(v) || 0)));
  const digits = (s) => String(s).replace(/[^\d]/g, '');
  const parseNum = (s) => { const d = digits(s); return d ? parseInt(d, 10) : 0; };
  const fmtNum = (n) => Number(n || 0).toLocaleString('fr-FR').replace(/\u202f/g, ' ');

  // ---- montants à séparateur de milliers (pièces, TrueGold) ----
  // Ils sont en `type="text"` : un `<input type="number">` refuse les espaces. Le garde
  // sur `el.type` n'est pas décoratif — sans cache-busting, ce script peut tourner avec
  // un HTML encore en cache où ces champs étaient numériques, et leur écrire
  // « 1 000 000 » les VIDERAIT (valeur invalide), remettant la saisie du joueur à zéro.
  const MONTANTS = ['tradeCoins', 'tradeTruegold'];
  function setMontant(id, v) {
    const el = document.getElementById(id);
    if (!el || el === document.activeElement) return;
    el.value = (el.type === 'number') ? v : fmtNum(v);
  }
  // Mise en forme pendant la frappe. Le curseur est replacé après le même nombre de
  // CHIFFRES qu'avant : sinon il saute en fin de champ dès qu'un espace s'insère, et on
  // ne peut plus corriger un chiffre au milieu.
  function formaterMontant(el) {
    if (!el || el.type === 'number') return;
    const brut = el.value;
    // Un champ vidé reste vide. Y réécrire « 0 » replaçait le curseur DEVANT ce zéro,
    // et tout ce que le joueur tapait ensuite s'insérait avant lui : effacer puis taper
    // « 1000000 » donnait 10 000 000, et tout le plan se calculait sur ce stock faux.
    // `parseNum('')` vaut déjà 0, la lecture n'a donc rien à y gagner.
    if (digits(brut).length === 0) { if (brut !== '') el.value = ''; return; }
    const curseur = el.selectionStart == null ? brut.length : el.selectionStart;
    const chiffresAvant = digits(brut.slice(0, curseur)).length;
    const txt = fmtNum(parseNum(brut));
    if (txt === brut) return;
    el.value = txt;
    let pos = 0, vus = 0;
    while (pos < txt.length && vus < chiffresAvant) { if (/\d/.test(txt[pos])) vus++; pos++; }
    try { el.setSelectionRange(pos, pos); } catch (e) { /* pas de sélection sur ce champ */ }
  }

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
    try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) { /* quota */ if (window.ktWarnUnsaved) window.ktWarnUnsaved(); }
  }
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { saved = null; }
    if (saved && typeof saved === 'object') {
      state = Object.assign(state, saved);
      state.enabled = Object.assign({ infantry: true, archer: true, cavalry: true }, saved.enabled || {});
      // Même précaution pour `tradeUse` : un objet imbriqué relu du localStorage n'est
      // pas digne de confiance. Sans ça, un `tradeUse` tronqué ou nul faisait planter
      // `syncInputs` au démarrage, et l'ajout d'un quatrième échange serait arrivé
      // décoché en silence chez tous les joueurs déjà installés.
      state.tradeUse = Object.assign({ coins: true, tg5: true, tg10: false },
                                     (saved.tradeUse && typeof saved.tradeUse === 'object') ? saved.tradeUse : {});
      state.levels = saved.levels || {};
    }
  }

  // Push state -> sidebar inputs
  function syncInputs() {
    const set = (id, v) => { const el = document.getElementById(id); if (el && el !== document.activeElement) el.value = v; };
    set('waLevel', state.waLevel);
    set('speedBonus', state.speedBonus);
    set('dustBudget', state.dustBudget);
    setMontant('tradeCoins', state.tradeCoins);
    set('tradeUsedCoins', state.tradeUsedCoins);
    setMontant('tradeTruegold', state.tradeTruegold);
    set('tradeUsedTg5', state.tradeUsedTg5);
    TRADE_IDS.forEach(id => {
      const c = document.getElementById(TRADE_USE_EL[id]);
      if (c) c.checked = !!state.tradeUse[id];
    });
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
    if (g('tradeCoins'))     state.tradeCoins     = parseNum(g('tradeCoins').value);
    if (g('tradeUsedCoins')) state.tradeUsedCoins = clampInt(g('tradeUsedCoins').value, 0, COIN_TRADE_MAX);
    if (g('tradeTruegold'))  state.tradeTruegold  = parseNum(g('tradeTruegold').value);
    if (g('tradeUsedTg5'))   state.tradeUsedTg5   = clampInt(g('tradeUsedTg5').value, 0, TG5_TRADE_MAX);
    TRADE_IDS.forEach(id => {
      const c = g(TRADE_USE_EL[id]);
      if (c) state.tradeUse[id] = c.checked;
    });
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
    const dustSvg = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 4c2.4 0 4.5 3.4 6 9H6c1.5-5.6 3.6-9 6-9z" fill="currentColor"/><path d="M3 13h18l-2 4.2c-.3.5-.8.8-1.4.8H6.4c-.6 0-1.1-.3-1.4-.8L3 13z" fill="currentColor" opacity=".5"/></svg>';
    const it = (icon, val, cls) => `<span class="wa-res__item${cls ? ' ' + cls : ''}">${window.iconSvg(icon, 13)}<b>${val}</b></span>`;
    const title = lang() === 'EN' ? 'Next level cost' : 'Coût du prochain niveau';
    // Time shown after the speed bonus reduction (same factor used in the plan breakdown).
    const speed = 1 + (Number(state.speedBonus) || 0) / 100;
    return `<div class="wa-res-title">${title}</div><div class="wa-res">` +
      `<span class="wa-res__item is-dust">${dustSvg}<b>${fmtNum(lv.dust)}</b></span>` +
      it('clock', shortTime(Math.round(lv.time / speed))) +
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
         <div class="wa-node__body">
           <div class="wa-node__main">
             ${nodeImgHtml(res, L.icon)}
             <div class="wa-node__name">${nm(res.name)}</div>
             ${stepperHtml(cur, res.maxLevel, 0, nm(res.name))}
           </div>
           <div class="wa-node__res">${nextResHtml(res, cur)}</div>
         </div>`;
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

  // Ce que le joueur accepte de convertir, ou null si les échanges sont éteints.
  // Le test sur `planTrades` n'est pas de la superstition : le site n'a aucun
  // cache-busting, un visiteur de retour peut donc avoir ce waracademy.js tout neuf
  // avec un wa_optimizer.js encore en cache. Sans le garde-fou, la page mourrait sur
  // un « planTrades is not a function » au lieu de simplement ignorer les échanges.
  function tradeStock(surcharge) {
    if (!window.WA_Optimizer || typeof window.WA_Optimizer.planTrades !== 'function') return null;
    if (!TRADE_IDS.some(id => state.tradeUse[id])) return null;   // tout décoché = pas d'échange
    return Object.assign({
      coins: state.tradeCoins, truegold: state.tradeTruegold,
      usedCoins: state.tradeUsedCoins, usedTg5: state.tradeUsedTg5,
      use: state.tradeUse,
    }, surcharge || {});
  }

  // Remplit la colonne « dans ce plan » de chaque ligne, et le total sous la table.
  // Les cellules sont mises à jour une par une plutôt que par un re-rendu du tableau :
  // les champs de saisie vivent dans ces mêmes lignes, les recréer volerait le focus
  // au joueur en train de taper.
  function renderTradeRows() {
    const tp = lastTrades;
    TRADE_IDS.forEach(id => {
      const cell = document.getElementById(TRADE_PLAN_EL[id]);
      if (!cell) return;
      // Étiquettes reprises par le CSS sous 600px, où les en-têtes de colonnes
      // disparaissent : posées ici pour qu'elles suivent la langue toutes seules.
      cell.dataset.label = t('tradeColPlan');
      // …sauf sur la ligne sans plafond, où « faits cette semaine : sans plafond »
      // se contredirait : cette cellule-là n'a pas de compteur à étiqueter.
      const done = cell.parentElement && cell.parentElement.querySelector('.wa-trades-done');
      if (done) {
        if (done.querySelector('input')) done.dataset.label = t('tradeColDone');
        else delete done.dataset.label;
      }
      const line = tp && tp.trades.find(l => l.id === id);
      if (!line) {
        cell.textContent = state.tradeUse[id] ? '—' : t('tradeOff');
        cell.classList.toggle('is-off', !state.tradeUse[id]);
        return;
      }
      cell.classList.remove('is-off');
      // Pas de « × » entre le nombre d'échanges et la poussière : `line.dust` est DÉJÀ
      // le total des `line.n` échanges (planTrades), donc « 20 × +260 » se lisait comme
      // 5 200 poussières pour 260 réelles. Le taux unitaire est de toute façon écrit
      // dans la colonne « Échange » de la même ligne.
      cell.innerHTML = `<b>${fmtNum(line.n)}</b> ${t('tradeCountShort')} · <b>+${fmtNum(line.dust)}</b> `
                     + `<small>(${fmtNum(line.spend)} ${t(line.pay === 'coins' ? 'tradeCoinsRow' : 'tradeTgRow')})</small>`;
    });
    const tot = document.getElementById('tradeTotalDust');
    if (tot) tot.textContent = tp ? '+' + fmtNum(tp.dust) : '0';
  }

  // Départage deux partages de la bourse. Chaque mode a son propre but (cf. MAP) : on
  // ne peut pas comparer trois modes au même score. À égalité, le moins cher gagne.
  function meilleurPlan(a, b) {
    if (!b) return true;
    const mode = state.mode;
    if (mode === 'classic') {
      if (a.res.totals.count !== b.res.totals.count) return a.res.totals.count > b.res.totals.count;
    } else if (mode === 'target') {
      const ra = !!(a.res.target && a.res.target.reached), rb = !!(b.res.target && b.res.target.reached);
      if (ra !== rb) return ra;
      if (!ra && a.res.totals.kvkPoints !== b.res.totals.kvkPoints) return a.res.totals.kvkPoints > b.res.totals.kvkPoints;
    } else {
      if (a.res.totals.kvkPoints !== b.res.totals.kvkPoints) return a.res.totals.kvkPoints > b.res.totals.kvkPoints;
    }
    // À qualité égale : le moins de TrueGold, PUIS le moins de pièces. L'ordre compte —
    // départager sur les seules pièces revenait à préférer le plan qui en dépense le
    // moins, donc celui qui brûle le PLUS de TrueGold, l'exact contraire de la priorité
    // de DUST_TRADES. Mesuré : 100 TrueGold convertis en laissant 1 000 000 de pièces
    // dormir, là où 30 suffisaient pour le même score.
    if (a.tgDepense !== b.tgDepense) return a.tgDepense < b.tgDepense;
    return a.piecesTotal < b.piecesTotal;
  }

  function recompute() {
    if (!DB || !window.WA_Optimizer) return;
    const speedupBudget = state.accDays * 1440 + state.accHours * 60 + state.accMinutes;

    // Les pièces paient DEUX choses dans la même bourse : le coût en pièces des
    // recherches (`levels[].coin`, jusqu'à 870 000 sur un plan d'un mois) et les
    // échanges qui achètent de la poussière (1 000 000 au plafond hebdomadaire).
    // Les ignorer laissait proposer un plan que le joueur ne pouvait pas payer.
    //
    // Pièces non saisies (0) = « je ne les compte pas » : aucune contrainte, et la
    // sortie affiche simplement la quantité qu'il faudra.
    //
    // Saisies, il faut PARTAGER la bourse, et le partage n'a rien d'évident : à
    // 1 000 000 de pièces et zéro poussière, tout convertir ne laisse rien pour payer
    // les recherches, ne rien convertir ne donne aucune poussière. On balaie donc le
    // nombre d'échanges de pièces et on garde le meilleur plan. Pourquoi un balayage
    // complet plutôt qu'une recherche dichotomique : la courbe des points n'est PAS
    // unimodale (plateaux, décrochage brutal au plafond), une descente s'y piégerait —
    // mesuré, une approximation par passes successives laissait 9,8 % sur la table.
    // Le coût est borné et connu : un `suggest` vaut 1,4 ms, le pire cas (201 points)
    // 91 ms, derrière le debounce de 160 ms de la page.
    const piecesDispo = state.tradeCoins;
    const piecesSaisies = piecesDispo > 0;

    // Le TrueGold ne dispute pas les pièces : sa capacité est offerte en entier.
    const stockTG = tradeStock({ coins: 0 });
    const dustTG = stockTG ? window.WA_Optimizer.planTrades(null, stockTG).dust : 0;

    const lancer = (nEchanges, rapide) => {
      const stock = tradeStock({ coins: nEchanges * COIN_TRADE_PRICE });
      const res = window.WA_Optimizer.suggest({
        db: DB, currentLevels: state.levels, waLevel: state.waLevel,
        dustBudget: state.dustBudget + dustTG + nEchanges,
        speedBonusPct: state.speedBonus,
        costReductionPct: 0, speedupBudget, rank: rapide,
        coinBudget: piecesSaisies ? piecesDispo - nEchanges * COIN_TRADE_PRICE : null,
        enabledTrees: enabledTrees(),
        mode: state.mode, targetScore: state.targetScore,
      });
      // On ne facture QUE le manque réel. En mode Score cible surtout, le plan
      // s'arrête dès la cible atteinte : inutile de vider le TrueGold du joueur pour
      // de la poussière que personne ne dépensera. Le stock de pièces étant plafonné à
      // `nEchanges`, la dépense ne peut pas dépasser ce qu'on a réservé.
      const manque = Math.max(0, res.totals.effDust - state.dustBudget);
      const trades = (stock && manque > 0) ? window.WA_Optimizer.planTrades(manque, stock) : null;
      const piecesEchanges = trades ? trades.coins : 0;
      return { n: nEchanges, res, trades, piecesEchanges,
               tgDepense: trades ? trades.truegold : 0,
               piecesTotal: (res.totals.coins || 0) + piecesEchanges };
    };

    // Combien d'échanges de pièces sont possibles : le stock, le plafond hebdomadaire
    // entamé par ceux déjà faits, et la case de la ligne. Rien d'autre ne borne le
    // balayage — une borne « au-delà de la poussière absorbable » a été essayée puis
    // RETIRÉE : elle tombait à zéro dès que le TrueGold suffisait à lui seul, ce qui
    // faisait brûler le TrueGold du joueur en laissant ses pièces dormir, et elle
    // écartait de bons candidats en mode Score cible (n ne fait pas qu'ajouter de la
    // poussière, il rogne aussi le budget de pièces, donc il change le plan).
    const nMax = (piecesSaisies && state.tradeUse.coins)
      ? Math.min(Math.floor(piecesDispo / COIN_TRADE_PRICE), Math.max(0, COIN_TRADE_MAX - state.tradeUsedCoins))
      : 0;

    // Deux temps, pour tenir le coût sans sacrifier la qualité du plan rendu.
    // 1. Tous les partages sont classés avec une évaluation ALLÉGÉE (`rank`) : un seul
    //    plan au lieu des 16 que le mode KVK joue d'habitude, soit 16 fois moins cher.
    // 2. Seuls les meilleurs candidats — et leurs voisins immédiats, plus les deux
    //    extrémités — sont réévalués POUR DE BON, et c'est ce résultat-là qui est rendu.
    // Ce n'est donc pas un balayage exact, et il ne faut pas l'écrire comme tel : sur
    // 60 scénarios tirés au sort, le plan rendu avait le même score dans 60 cas sur 60,
    // et une seule fois un partage TrueGold/pièces légèrement différent. En échange, le
    // pire cas passe de ~900 ms à une fraction de ça.
    const CANDIDATS = 8;
    const allege = state.mode === 'kvk' && nMax >= CANDIDATS * 3;
    let best = null;

    if (!allege) {
      for (let n = 0; n <= nMax; n++) {
        const essai = lancer(n, false);
        if (meilleurPlan(essai, best)) best = essai;
      }
    } else {
      const pre = [];
      for (let n = 0; n <= nMax; n++) pre.push(lancer(n, true));
      const tri = pre.slice().sort((a, b) => (meilleurPlan(a, b) ? -1 : (meilleurPlan(b, a) ? 1 : 0)));
      const retenus = new Set([0, nMax]);
      tri.slice(0, CANDIDATS).forEach(x => {
        retenus.add(x.n);
        if (x.n > 0) retenus.add(x.n - 1);
        if (x.n < nMax) retenus.add(x.n + 1);
      });
      retenus.forEach(n => {
        const essai = lancer(n, false);
        if (meilleurPlan(essai, best)) best = essai;
      });
    }

    const res = best.res;
    lastTrades = best.trades;
    lastCoins = { research: res.totals.coins || 0, trades: best.piecesEchanges,
                  total: best.piecesTotal, budget: piecesSaisies ? piecesDispo : null };
    lastDustHeld = state.dustBudget + (lastTrades ? lastTrades.dust : 0);

    lastPlan = res;
    renderTradeRows();
    renderOutput(res);
    // suggested set (research -> highest target level) for the ACTIVE tree highlight
    const suggested = {};
    res.steps.forEach(s => {
      const k = rkey(s.treeId, s.researchId);
      suggested[k] = Math.max(suggested[k] || 0, s.toLevel);
    });
    refreshStates(suggested);
  }

  // Les échanges que le plan suppose faits, dans le bloc de suggestion — même forme que
  // la « Stratégie du creuset » de la page TrueGold : une section titrée AVANT le plan,
  // affichée seulement s'il y a quelque chose à faire, suivie des stocks qui en
  // résultent. Le panneau du dessus sert à décider, celui-ci à exécuter.
  const TRADE_UNIT = { coins: TRADE_RULES.coins.price || 5000,
                       tg5:   TRADE_RULES.tg5.price   || 5,
                       tg10:  TRADE_RULES.tg10.price  || 10 };
  function tradesHtml() {
    const tp = lastTrades;
    if (!tp || !tp.trades.length) return '';

    const lignes = tp.trades.map(l => {
      const monnaie = t(l.pay === 'coins' ? 'tradeCoinsRow' : 'tradeTgRow');
      return `<div class="wa-out-bilan-row">🔁 ${t('outTradeConvert')} `
           + `<b>${fmtNum(l.spend)}</b> ${monnaie} ${t('outTradeInto')} <b>${fmtNum(l.dust)}</b> `
           + `${t('tradeGivesShort')} <small>(${fmtNum(l.n)} ${t('outTradeVia')} `
           + `${fmtNum(TRADE_UNIT[l.id])} ${monnaie})</small></div>`;
    }).join('');

    // Les stocks JUSTE APRÈS les échanges, avant que le plan ne soit lancé — c'est le
    // moment que le titre annonce, et c'est celui des « Nouveaux stocks » de TrueGold
    // (`nouveauStockTG` y vaut le stock moins le creuset, le stock final a sa propre
    // variable). Y mettre l'après-plan affichait « poussière : 0 » à un joueur qui vient
    // justement d'en acheter, et ce n'est pas le nombre qu'il doit recopier pour
    // démarrer. Ce qui reste à la toute fin est déjà dans les puces du haut.
    const stocks = [
      `<div class="wa-out-bilan-row">${t('outStockDust')} <b>${fmtNum(state.dustBudget + tp.dust)}</b></div>`,
      state.tradeCoins > 0
        ? `<div class="wa-out-bilan-row">${t('outStockCoins')} <b>${fmtNum(Math.max(0, state.tradeCoins - tp.coins))}</b></div>` : '',
      state.tradeTruegold > 0
        ? `<div class="wa-out-bilan-row">${t('outStockTg')} <b>${fmtNum(Math.max(0, state.tradeTruegold - tp.truegold))}</b></div>` : '',
    ].join('');

    // Un échange est indivisible : couvrir 1 poussière manquante en achète 13. Le
    // surplus n'est pas perdu, il reste en stock — encore faut-il le dire, sinon le
    // joueur croit avoir converti pour rien.
    const surplus = tp.over > 0
      ? `<div class="wa-out-bilan-row"><small>+${fmtNum(tp.over)} ${t('outTradeOver')}</small></div>` : '';

    return `<div class="wa-out-bilan">`
         + `<div class="wa-out-bilan-title">${t('outTradeTitle')}</div>${lignes}${surplus}`
         + `<div class="wa-out-bilan-title wa-out-bilan-title--next">${t('outStocksTitle')}</div>${stocks}`
         + `</div>`;
  }

  // Les pièces que le plan réclame. Sans budget saisi, on annonce la quantité
  // NÉCESSAIRE — c'est la seule chose utile à dire : le joueur ira la vérifier en jeu.
  // Avec un budget, on montre ce qui reste. Le détail recherches/échanges est donné
  // dès que les deux jouent, sinon il n'apprend rien.
  function coinChip() {
    const c = lastCoins;
    if (!c.total) return '';
    const detail = (c.research && c.trades)
      ? ` <small>(${fmtNum(c.research)} ${t('cCoinsResearch')} + ${fmtNum(c.trades)} ${t('cCoinsTrades')})</small>`
      : '';
    if (c.budget == null) {
      return `<span class="wa-chip">${t('cCoins')}: <b>${fmtNum(c.total)}</b> ${t('cCoinsNeed')}${detail}</span>`;
    }
    const reste = Math.max(0, c.budget - c.total);
    return `<span class="wa-chip">${t('cCoins')}: <b>${fmtNum(c.total)}</b> / ${fmtNum(c.budget)} `
         + `(${fmtNum(reste)} ${t('cReste')})${detail}</span>`;
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
        agg[k] = { treeId: s.treeId, researchId: s.researchId, name: s.name, from: s.fromLevel, to: s.toLevel, maxLevel: s.maxLevel,
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

    const colors = TREE_COLORS;

    // Keep the plan's order, but always put the single "in progress" research last.
    const sorted = order.filter(k => k !== res.inProgress);
    if (order.includes(res.inProgress)) sorted.push(res.inProgress);

    // Exactly ONE research can be left unfinished (single in-game research queue):
    // the optimizer reports it as res.inProgress; every other research is completed.
    const tot = res.totals;
    const availMin = state.accDays * 1440 + state.accHours * 60 + state.accMinutes;

    // Per-level resource breakdown (shown when a card is expanded).
    const bdDust = '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 4c2.4 0 4.5 3.4 6 9H6c1.5-5.6 3.6-9 6-9z" fill="currentColor"/><path d="M3 13h18l-2 4.2c-.3.5-.8.8-1.4.8H6.4c-.6 0-1.1-.3-1.4-.8L3 13z" fill="currentColor" opacity=".5"/></svg>';
    const bdSpeed = 1 + (Number(state.speedBonus) || 0) / 100;
    function breakdownHtml(a) {
      const rr = treeById(a.treeId).researches.find(r => r.id === a.researchId);
      if (!rr) return '';
      const ic = (name) => window.iconSvg(name, 11);
      let rows = '';
      for (let L = a.from + 1; L <= a.to; L++) {
        const lv = rr.levels[L - 1];
        if (!lv) continue;
        const items =
          `<span class="wa-bd__it is-dust">${bdDust}<b>${fmtNum(lv.dust)}</b></span>` +
          `<span class="wa-bd__it">${ic('clock')}<b>${shortTime(Math.round(lv.time / bdSpeed))}</b></span>` +
          (lv.coin ? `<span class="wa-bd__it">${ic('coins')}<b>${abbr(lv.coin)}</b></span>` : '') +
          (lv.bread ? `<span class="wa-bd__it">${ic('wheat')}<b>${abbr(lv.bread)}</b></span>` : '') +
          (lv.wood ? `<span class="wa-bd__it">${ic('tree-pine')}<b>${abbr(lv.wood)}</b></span>` : '') +
          (lv.stone ? `<span class="wa-bd__it">${ic('brick-wall')}<b>${abbr(lv.stone)}</b></span>` : '') +
          (lv.iron ? `<span class="wa-bd__it">${ic('pickaxe')}<b>${abbr(lv.iron)}</b></span>` : '');
        rows += `<div class="wa-bd__row"><span class="wa-bd__lv">Lv.${L - 1}→${L}</span><div class="wa-bd__items">${items}</div></div>`;
      }
      return `<div class="wa-step__bd">${rows}</div>`;
    }

    const rowsHtml = sorted.map((k) => {
      const a = agg[k];
      const isMax = a.to >= a.maxLevel;
      const isInProgress = (k === res.inProgress);
      const statusHtml = isInProgress
        ? `<span class="wa-step__status wa-step__status--progress">${t('inProgress')}</span>`
        : `<span class="wa-step__status wa-step__status--done">${t('completed')}</span>`;
      const treeTag = `<span class="wa-step__tree" style="color:${colors[a.treeId]}">${treeLabel(a.treeId)}</span>`;
      const buffHtml = a.buff
        ? `<div class="wa-step__buff">${a.buff}</div>`
        : '';

      return `<details class="wa-step" style="--step-color:${colors[a.treeId]}">
        <summary class="wa-step__summary">
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
          <div class="wa-step__hint">${lang() === 'EN' ? 'Per-level detail' : 'Détail par niveau'} <span class="wa-step__chev">▸</span></div>
        </summary>
        ${breakdownHtml(a)}
      </details>`;
    }).join('');

    const diff = availMin - tot.effTimeMin;
    const speedChip = diff >= 0
      ? `<span class="wa-chip wa-chip-ok">${t('cSpeedHave')}: ${fmtTime(availMin)} — <b>${fmtTime(diff)} ${t('cSpare')}</b></span>`
      : `<span class="wa-chip wa-chip-warn">${t('cSpeedHave')}: ${fmtTime(availMin)} — <b>${t('cMissing')} ${fmtTime(-diff)}</b></span>`;

    let chips =
      `<span class="wa-chip"><b>${order.length}</b> ${t('cResearch')} · <b>${tot.count}</b> ${t('cLevels')}</span>` +
      `<span class="wa-chip">${t('cDust')}: <b>${fmtNum(tot.effDust)}</b>${res.remaining.dust != null ? ` / ${fmtNum(lastDustHeld)} (${fmtNum(Math.max(0, lastDustHeld - tot.effDust))} ${t('cReste')})` : ''}</span>` +
      `<span class="wa-chip">${t('cTime')}: <b>${fmtTime(tot.effTimeMin)}</b></span>` +
      coinChip() +
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
        <div class="wa-out-bilan-row">🔶 <b>${fmtNum(tot.effDust)}</b>${t('dustUsed')}<b>${fmtNum(tot.kvkFromDust)}</b>${t('pts')}</div>
        <div class="wa-out-bilan-row">⏱️ <b>${fmtTime(tot.effTimeMin)}</b>${t('accelUsed')}<b>${fmtNum(tot.kvkFromTime)}</b>${t('pts')}</div>
      </div>
      <div class="wa-out-total">🚀 ${t('totalMax')} <span class="wa-out-total-num">${fmtNum(tot.kvkPoints)}</span>${t('pts')}</div>
      <div class="plan-apply">
        <button type="button" class="plan-apply-btn" onclick="WA.applyPlan()">${window.iconSvg('circle-check-big', 18)}${t('applyBtn')}</button>
        <div class="plan-apply-hint">${t('applyHint')}</div>
      </div>`;

    box.innerHTML =
      `<div class="wa-out-head">${heads[res.mode]}</div>` +
      targetLine +
      `<div class="wa-out-chips">${chips}</div>` +
      (summaryParts.length ? `<div class="wa-out-summary">${summaryParts.join(' · ')}</div>` : '') +
      tradesHtml() +
      `<div class="wa-out-plan-title">${t('planTitle')}</div>` +
      `<div class="wa-steps">${rowsHtml}</div>` +
      totalHtml;
  }


  // ---------------- appliquer le plan ----------------
  // Réécrit la page à partir du plan affiché : niveaux atteints, poussières restantes,
  // accélérateurs restants. La recherche laissée « en cours » monte elle aussi de niveau
  // (choix validé par Paul) — sa poussière est déjà entièrement payée.
  function applyPlan() {
    const res = lastPlan;
    if (!res || !res.steps.length) return;

    const finals = {};                      // clé recherche -> { to, name, treeId, n }
    res.steps.forEach(s => {
      const k = rkey(s.treeId, s.researchId);
      const e = finals[k];
      if (!e) finals[k] = { to: s.toLevel, name: s.name, treeId: s.treeId, n: 1 };
      else { e.n++; if (s.toLevel > e.to) e.to = s.toLevel; }
    });

    const availMin = state.accDays * 1440 + state.accHours * 60 + state.accMinutes;
    // Le joueur échange d'abord, dépense ensuite : le stock d'arrivée part donc du
    // stock actuel AUGMENTÉ de ce que les échanges rapportent. Sans échange, `gagne`
    // vaut 0 et la formule redonne exactement le calcul d'avant.
    const tp = lastTrades;
    const gagne = tp ? tp.dust : 0;
    const dustLeft = Math.max(0, state.dustBudget + gagne - res.totals.effDust);
    const timeLeft = Math.max(0, availMin - res.totals.effTimeMin);
    let recap = `<div class="apply-diff"><div class="apply-diff-h">${t('applyResearch')}</div>`;
    Object.keys(finals).forEach(k => {
      const f = finals[k];
      recap += `<div class="apply-diff-r">`
            +  `<span>${nm(f.name)} <em style="color:${TREE_COLORS[f.treeId]}">${treeLabel(f.treeId)}</em></span>`
            +  `<b>Lv.${f.to} <em>(+${f.n} ${t('lvls')})</em></b></div>`;
    });
    recap += `<div class="apply-diff-h">${t('applyResources')}</div>`;
    recap += `<div class="apply-diff-r"><span>${t('applyDust')}</span><b>${fmtNum(state.dustBudget)} → ${fmtNum(dustLeft)}</b></div>`;
    // Les pièces payent les recherches ET les échanges : on débite le total, pas la
    // seule part des échanges. Rien à débiter si le joueur n'a pas déclaré de pièces.
    const piecesUtilisees = lastCoins.total;
    if (state.tradeCoins > 0 && piecesUtilisees > 0) {
      recap += `<div class="apply-diff-r"><span>${t('applyTradeCoins')}</span>`
            +  `<b>${fmtNum(state.tradeCoins)} → ${fmtNum(Math.max(0, state.tradeCoins - piecesUtilisees))}</b></div>`;
    }
    if (tp && tp.truegold > 0) {
      recap += `<div class="apply-diff-r"><span>${t('applyTradeTg')}</span>`
            +  `<b>${fmtNum(state.tradeTruegold)} → ${fmtNum(Math.max(0, state.tradeTruegold - tp.truegold))}</b></div>`;
    }
    // « plus rien » ne vaut que pour le stock d'arrivée : « plus rien → plus rien »
    // n'aurait aucun sens pour un joueur qui n'a pas d'accélérateurs.
    if (availMin > 0) {
      const apres = timeLeft > 0 ? fmtTime(timeLeft) : t('applyNone');
      recap += `<div class="apply-diff-r"><span>${t('applySpeedups')}</span><b>${fmtTime(availMin)} → ${apres}</b></div>`;
    }
    recap += `</div><div class="apply-warn">${t('applyWarn')}</div>`;

    window.showAppConfirm(`<strong>${t('applyAsk')}</strong>${recap}`, () => {
      Object.keys(finals).forEach(k => {
        state.levels[k] = Math.max(Number(state.levels[k]) || 0, finals[k].to);
      });
      state.dustBudget = dustLeft;
      if (state.tradeCoins > 0) state.tradeCoins = Math.max(0, state.tradeCoins - piecesUtilisees);
      if (tp) {
        state.tradeTruegold = Math.max(0, state.tradeTruegold - tp.truegold);
        // Les plafonds sont hebdomadaires : les échanges faits s'ajoutent au compteur,
        // que le joueur remettra à zéro lui-même au reset de la semaine.
        const fait = (id) => (tp.trades.find(x => x.id === id) || { n: 0 }).n;
        state.tradeUsedCoins = clampInt(state.tradeUsedCoins + fait('coins'), 0, COIN_TRADE_MAX);
        state.tradeUsedTg5   = clampInt(state.tradeUsedTg5   + fait('tg5'),   0, TG5_TRADE_MAX);
      }
      state.accDays = Math.floor(timeLeft / 1440);
      state.accHours = Math.floor((timeLeft % 1440) / 60);
      state.accMinutes = timeLeft % 60;

      save();
      syncInputs();
      renderTree();
      recompute();
      window.showAppToast(t('applyDone'), true);
    });
  }

  // ---------------- inline handlers (window.WA) ----------------
  const debounce = (fn, d = 180) => { let x; return (...a) => { clearTimeout(x); x = setTimeout(() => fn(...a), d); }; };
  const doUpdate = debounce(() => { readInputs(); syncInputs(); save(); recompute(); }, 160);

  window.WA = {
    triggerUpdate: doUpdate,
    applyPlan,
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
    // Écouteur posé ici plutôt qu'en attribut du HTML : un `WA.xxx()` tout neuf appelé
    // depuis la page serait mort chez un visiteur au HTML neuf et au script en cache.
    MONTANTS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => formaterMontant(el));
    });
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
