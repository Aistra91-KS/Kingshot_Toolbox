// ============================================================
//  BASE DE DONNÉES — RECHERCHES DE L'ACADÉMIE (1 page par arbre)
//  Lit data/research_db.json, rend le tableau de l'arbre nommé
//  par window.RESEARCH_TREE ('Growth' | 'Economy' | 'Battle').
//
//  Un seul fichier pour les trois pages, contrairement aux pages
//  Académie de Guerre qui recopient leur script quatre fois : c'est
//  ce qui les a laissées diverger. Les pages ne portent ici que leur
//  en-tête, leur fil d'Ariane et leur <table> vide.
// ============================================================

(function () {
  const TREE = window.RESEARCH_TREE || 'Growth';
  const DATA_URL = 'data/research_db.json';

  // Libellés d'interface. Les noms de recherche et les effets, eux, viennent
  // de la donnée : ils sont posés en data-en/data-fr sur chaque cellule.
  const dict = {
    EN: {
      crumbResearch: 'Research', cResearch: 'Research', cLevel: 'Level', cAcademy: 'Academy',
      cReq: 'Prerequisites', cBread: 'Bread', cWood: 'Wood', cStone: 'Stone', cIron: 'Iron',
      cGold: 'Gold', cTime: 'Time', cPower: 'Power', cEffect: 'Effect',
      intro: 'Every research in this tree, level by level: resource cost, research time, power, the Academy level it needs and what it gives. Costs and time are the raw values, before any research speed bonus.',
      search: 'Search a research…', loading: 'Loading data…',
      err: 'Could not load the research data (data/research_db.json).',
      countAll: '{n} researches', countSome: '{n} of {t} researches', countNone: 'No match'
    },
    FR: {
      crumbResearch: 'Recherches', cResearch: 'Recherche', cLevel: 'Palier', cAcademy: 'Académie',
      cReq: 'Prérequis', cBread: 'Pain', cWood: 'Bois', cStone: 'Pierre', cIron: 'Fer',
      cGold: 'Or', cTime: 'Temps', cPower: 'Puissance', cEffect: 'Effet',
      intro: "Toutes les recherches de cet arbre, palier par palier : coût en ressources, temps de recherche, puissance, niveau d'Académie exigé et effet obtenu. Coûts et temps sont les valeurs brutes, avant tout bonus de vitesse de recherche.",
      search: 'Rechercher une recherche…', loading: 'Chargement des données…',
      err: 'Impossible de charger les données de recherche (data/research_db.json).',
      countAll: '{n} recherches', countSome: '{n} recherches sur {t}', countNone: 'Aucun résultat'
    }
  };

  // Traduction des effets. Le jeu ne les donne qu'en anglais ; cette table est
  // la seule source française, et elle doit couvrir TOUT `Buff Type` de la base
  // — un effet non traduit s'afficherait en anglais au milieu d'une page FR.
  const BUFF_FR = {
    'Construction Speed': 'Vitesse de construction',
    'Research Speed': 'Vitesse de recherche',
    'Training Speed': "Vitesse d'entraînement",
    'Healing Speed': 'Vitesse de soins',
    'Training Capacity': "Capacité d'entraînement",
    'Infirmary Capacity': "Capacité de l'infirmerie",
    'March Queue': 'File de marche',
    'Bread Output': 'Production de pain',
    'Wood Output': 'Production de bois',
    'Stone Output': 'Production de pierre',
    'Iron Output': 'Production de fer',
    'Bread Gathering Speed': 'Vitesse de collecte de pain',
    'Wood Gathering Speed': 'Vitesse de collecte du bois',
    'Stone Gathering Speed': 'Vitesse de collecte de la pierre',
    'Iron Mining Speed': "Vitesse d'extraction du fer",
    "Squads' Attack": 'Attaque des escouades',
    "Squads' Defense": 'Défense des escouades',
    "Squads' Health": 'Santé des escouades',
    "Squads' Lethality": 'Létalité des escouades',
    "Squads' Deployment Capacity": 'Capacité de déploiement des escouades',
    'Infantry Attack': "Attaque de l'infanterie",
    'Infantry Defense': "Défense de l'infanterie",
    'Infantry Health': "Santé de l'infanterie",
    'Infantry Lethality': "Létalité de l'infanterie",
    'Archer Attack': 'Attaque des archers',
    'Archer Defense': 'Défense des archers',
    'Archer Health': 'Santé des archers',
    'Archer Lethality': 'Létalité des archers',
    'Cavalry Attack': 'Attaque de la cavalerie',
    'Cavalry Defense': 'Défense de la cavalerie',
    'Cavalry Health': 'Santé de la cavalerie',
    'Cavalry Lethality': 'Létalité de la cavalerie'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lang() {
    return (window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'EN';
  }
  // Séparateur de milliers selon la langue, comme partout ailleurs sur le site
  // (cf. db-masters.js) : « 4,300,000 » en anglais, « 4 300 000 » en français.
  function num(n, L) {
    if (n == null || n === '') return '—';
    const v = Number(n);
    return isFinite(v) ? v.toLocaleString(L === 'FR' ? 'fr-FR' : 'en-US') : '—';
  }
  function timeStr(r, L) {
    const u = L === 'FR' ? { d: 'j', h: 'h', m: 'min', s: 's' } : { d: 'd', h: 'h', m: 'm', s: 's' };
    const o = [];
    if (r['Time (d)']) o.push(r['Time (d)'] + u.d);
    if (r['Time (h)']) o.push(r['Time (h)'] + u.h);
    if (r['Time (m)']) o.push(r['Time (m)'] + u.m);
    if (r['Time (s)']) o.push(r['Time (s)'] + u.s);
    return o.join(' ') || ('0' + u.s);
  }
  // « Vitesse de construction +0,4 % ». La virgule décimale et l'espace avant le
  // pourcent sont français ; les recopier en anglais ferait lire 0,4 comme 4.
  function effectStr(r, L) {
    const type = L === 'FR' ? (BUFF_FR[r['Buff Type']] || r['Buff Type']) : r['Buff Type'];
    if (r['Buff Value'] == null) return type || '—';
    const v = num(r['Buff Value'], L);
    return type + ' +' + v + (r['Buff Unit'] === '%' ? (L === 'FR' ? ' %' : '%') : '');
  }
  // Le niveau d'Académie a sa propre colonne : le répéter ici allongeait la
  // colonne Prérequis d'un « Academy Lv. 2 » présent sur les 720 lignes, pour
  // une information déjà lisible deux colonnes à gauche.
  // Nom anglais -> nom français, pour traduire les prérequis. Ils sont stockés
  // sous le nom ANGLAIS (c'est la clé du moteur), et les laisser tels quels
  // mettait « Tooling Up I Lv. 1 » au milieu d'une page française. La table est
  // remplie depuis la base ENTIÈRE, pas depuis le seul arbre affiché : une
  // recherche de Combat peut exiger une recherche de Croissance.
  const FR_NAME = {};

  function reqStr(r, L) {
    const lv = L === 'FR' ? 'niv.' : 'Lv.';
    const parts = (r.reqs || []).map(q => (L === 'FR' ? (FR_NAME[q.name] || q.name) : q.name) + ' ' + lv + ' ' + q.level);
    return parts.length ? parts.join(', ') : '—';
  }
  // Une cellule porte ses deux langues : `apply()` les échange au changement de
  // langue sans relire le JSON ni reconstruire le tableau.
  function td(cls, en, fr) {
    return '<td class="' + cls + '" data-en="' + esc(en) + '" data-fr="' + esc(fr) + '">' + esc(en) + '</td>';
  }
  function statusRow(txt) {
    return '<tr><td colspan="12" style="text-align:center;padding:22px;color:var(--text-muted)">' + esc(txt) + '</td></tr>';
  }

  function nameCell(r) {
    const img = r.Image
      ? '<img class="dbr-icon" src="' + esc(r.Image) + '" alt="" width="26" height="26" loading="lazy" decoding="async" onerror="this.remove()">'
      : '';
    return '<td class="dbr-name"><span class="dbr-name-in">' + img
      + '<span data-en="' + esc(r.Name) + '" data-fr="' + esc(r['Fr Name']) + '">' + esc(r.Name) + '</span></span></td>';
  }

  function render(rows) {
    let html = '';
    let group = null;
    rows.forEach(r => {
      if (r.Name !== group) {
        group = r.Name;
        const img = r.Image
          ? '<img class="dbr-icon" src="' + esc(r.Image) + '" alt="" width="26" height="26" loading="lazy" decoding="async" onerror="this.remove()">'
          : '';
        // Le texte cherché suit les DEUX langues : un joueur en français doit
        // pouvoir taper « outils » comme un anglophone « tool ».
        const hay = (r.Name + ' ' + r['Fr Name'] + ' ' + r['Buff Type'] + ' ' + (BUFF_FR[r['Buff Type']] || '')).toLowerCase();
        html += '<tr class="dbr-group" data-search="' + esc(hay) + '"><th colspan="12" scope="rowgroup">'
          + '<span class="dbr-name-in">' + img
          + '<span data-en="' + esc(r.Name) + '" data-fr="' + esc(r['Fr Name']) + '">' + esc(r.Name) + '</span></span></th></tr>';
      }
      html += '<tr class="dbr-row" data-group="' + esc(r.Name) + '">'
        + nameCell(r)
        + '<td class="num c-lbl">' + esc(r.Level) + '</td>'
        + td('num c-wa', r.Academy || '—', r.Academy || '—')
        + td('c-req', reqStr(r, 'EN'), reqStr(r, 'FR'))
        + td('num', num(r.Bread, 'EN'), num(r.Bread, 'FR'))
        + td('num', num(r.Wood, 'EN'), num(r.Wood, 'FR'))
        + td('num', num(r.Stone, 'EN'), num(r.Stone, 'FR'))
        + td('num', num(r.iron, 'EN'), num(r.iron, 'FR'))
        + td('num', num(r.Gold, 'EN'), num(r.Gold, 'FR'))
        + td('c-time', timeStr(r, 'EN'), timeStr(r, 'FR'))
        + td('num', num(r.Power, 'EN'), num(r.Power, 'FR'))
        + td('c-eff', effectStr(r, 'EN'), effectStr(r, 'FR'))
        + '</tr>';
    });
    return html;
  }

  const tbody = document.getElementById('dbr-rows');
  const search = document.getElementById('dbr-search');
  const count = document.getElementById('dbr-count');
  let totalTechs = 0;

  function apply() {
    const L = lang();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(dict[L] || dict.EN);
    document.querySelectorAll('[data-en][data-fr]').forEach(el => {
      el.textContent = el.getAttribute('data-' + L.toLowerCase()) || el.textContent;
    });
    const n = document.getElementById('tree-name'), c = document.getElementById('crumb-name');
    if (n && c) c.textContent = n.textContent;
    document.documentElement.lang = L.toLowerCase();
    if (search) search.placeholder = dict[L].search;
    updateCount();
  }

  function updateCount() {
    if (!count) return;
    // Rien tant que la base n'est pas la : `shown` vaut alors 0, et le compteur
    // annoncait « Aucun resultat » en aria-live juste a cote d'un tableau qui
    // dit « Chargement... ». Un lecteur d'ecran entendait l'echec avant l'essai.
    if (!totalTechs) { count.textContent = ''; return; }
    const L = lang();
    const shown = document.querySelectorAll('tr.dbr-group:not([hidden])').length;
    const t = dict[L];
    count.textContent = shown === 0 ? t.countNone
      : shown === totalTechs ? t.countAll.replace('{n}', shown)
      : t.countSome.replace('{n}', shown).replace('{t}', totalTechs);
  }

  // Filtre : on masque le groupe ET ses lignes. Une seule passe dans l'ordre du
  // tableau — chaque ligne suit le dernier groupe rencontré. Retrouver les lignes
  // par un sélecteur d'attribut obligerait à échapper des noms venus de la donnée,
  // et `CSS.escape` n'est pas là pour ça. `hidden` plutôt qu'une classe, pour que
  // le compte se lise directement dans le DOM sans état parallèle à tenir.
  function filter() {
    const q = (search && search.value || '').trim().toLowerCase();
    let hit = true;
    Array.prototype.forEach.call(tbody ? tbody.rows : [], tr => {
      if (tr.classList.contains('dbr-group')) {
        hit = !q || (tr.getAttribute('data-search') || '').includes(q);
      }
      tr.hidden = !hit;
    });
    updateCount();
  }

  window.addEventListener('langChanged', apply);
  if (search) search.addEventListener('input', filter);

  const L0 = lang();
  if (tbody) tbody.innerHTML = statusRow(dict[L0].loading);

  // `cache: 'no-cache'` = revalidation, pas désactivation : un visiteur de retour
  // doit recevoir la base corrigée le jour où elle change (cf. MAP §9).
  fetch(DATA_URL, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(db => {
      (db || []).forEach(r => { FR_NAME[r.Name] = r['Fr Name']; });
      const rows = (db || []).filter(r => r.Tree === TREE);
      if (!rows.length) { if (tbody) tbody.innerHTML = statusRow(dict[lang()].err); return; }
      totalTechs = new Set(rows.map(r => r.Name)).size;
      tbody.innerHTML = render(rows);
      apply();
    })
    .catch(e => {
      console.error('Base de recherches non chargée :', e);
      if (tbody) tbody.innerHTML = statusRow(dict[lang()].err);
      if (window.ktWarnDataFailure) window.ktWarnDataFailure();
    });

  apply();
})();
