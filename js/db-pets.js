// ============================================================
//  DB PETS — rendu des pages Base de Données « Familiers »
//  Chaque page pose window.PET_ID puis inclut ce script.
//  Données : data/pets_db.json (fetch relatif au <base>).
//  Convention paliers/avancements : cf. MAP.md §6 (pets_db.json).
// ============================================================
(function () {
  const DATA_URL = 'data/pets_db.json';
  const PID = window.PET_ID;

  const dict = {
    FR: {
      crumb: "Familiers",
      secSkill: "Compétence par palier", secAdv: "Coûts d'avancement", secFood: "Nourriture (Pet Food)",
      cTier: "Palier", cLevel: "Niveau", cGrowth: "Manuel de croissance", cPotion: "Potion de nutriments",
      cMedal: "Médaillon de promotion", cFood: "Nourriture", cReach: "Débloque",
      lvl: "Niv.", advHint: "Chaque avancement au palier N débloque le palier de compétence correspondant.",
      loading: "Chargement des données…",
      err: "Impossible de charger les données (data/pets_db.json). Le fichier existe-t-il ?"
    },
    EN: {
      crumb: "Pets",
      secSkill: "Skill per tier", secAdv: "Advancement costs", secFood: "Pet Food",
      cTier: "Tier", cLevel: "Level", cGrowth: "Growth Manual", cPotion: "Nutrient Potion",
      cMedal: "Promotion Medallion", cFood: "Pet Food", cReach: "Unlocks",
      lvl: "Lv.", advHint: "Each advancement at tier N unlocks the matching skill tier.",
      loading: "Loading data…",
      err: "Could not load data (data/pets_db.json). Does the file exist?"
    }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // Met en valeur le placeholder « X » / « X% » (la valeur qui change au palier).
  // X isolé uniquement : « XP », « max »… ne sont pas touchés.
  function highlightX(raw) { return esc(raw).replace(/(^|[^A-Za-z0-9À-ÿ])X(%?)(?![A-Za-z0-9À-ÿ])/g, '$1<span class="hl-x">X$2</span>'); }
  function fmt(n, L) { if (n == null || n === '' || n === '—') return '—'; const v = +n; if (!isFinite(v)) return esc(n); return v.toLocaleString(L === 'FR' ? 'fr-FR' : 'en-US'); }
  const L0 = () => (window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'FR';

  // ---- Skill per tier ----
  function renderSkill(p) {
    const sk = p.skill || {};
    const nameEN = (sk.name && sk.name.EN) || '', nameFR = (sk.name && sk.name.FR) || '';
    const dEN = (sk.desc && sk.desc.EN) || '', dFR = (sk.desc && sk.desc.FR) || '';
    const effects = sk.effects || [];
    const tiers = Math.max(1, Math.round((p.maxLevel || 0) / 10));

    let head = '<th data-i18n="cTier">Palier</th>';
    effects.forEach(function (e) {
      const eEN = (e.label && e.label.EN) || '', eFR = (e.label && e.label.FR) || '';
      head += '<th data-en="' + esc(eEN) + '" data-fr="' + esc(eFR) + '">' + esc(eFR) + '</th>';
    });

    let body = '';
    for (let i = 0; i < tiers; i++) {
      const lvl = (i + 1) * 10;
      let row = '<tr><td class="c-lbl"><span data-en="Lv." data-fr="Niv." class="lvl-w">Niv.</span> ' + lvl + '</td>';
      effects.forEach(function (e) {
        const val = (e.values && e.values[i] != null) ? e.values[i] : '—';
        row += '<td class="c-eff">' + esc(val) + '</td>';
      });
      row += '</tr>';
      body += row;
    }

    const icon = 'img/pets/skills/' + esc(p.id) + '.webp';
    return ''
      + '<div class="m-block">'
      + '<div class="m-block-head">'
      + '<img class="m-ico" src="' + icon + '" alt="' + esc(nameEN) + '" onerror="this.remove()">'
      + '<div><div class="m-block-name" data-en="' + esc(nameEN) + '" data-fr="' + esc(nameFR) + '">' + esc(nameFR) + '</div>'
      + '<div class="m-block-desc" data-en="' + esc(dEN) + '" data-fr="' + esc(dFR) + '">' + esc(dFR) + '</div></div>'
      + '</div>'
      + '<div class="tbl-scroll"><table class="db-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>'
      + '</div>';
  }

  // ---- Advancement costs ----
  function renderAdvancements(p) {
    const rows = (p.advancements || []).map(function (a, i) {
      const lvl = (i + 1) * 10;
      return '<tr>'
        + '<td class="c-lbl"><span data-en="Lv." data-fr="Niv.">Niv.</span> ' + lvl + '</td>'
        + '<td class="num" data-en="' + esc(fmt(a.growthManual, 'EN')) + '" data-fr="' + esc(fmt(a.growthManual, 'FR')) + '">' + esc(fmt(a.growthManual, 'FR')) + '</td>'
        + '<td class="num" data-en="' + esc(fmt(a.nutrientPotion, 'EN')) + '" data-fr="' + esc(fmt(a.nutrientPotion, 'FR')) + '">' + esc(fmt(a.nutrientPotion, 'FR')) + '</td>'
        + '<td class="num" data-en="' + esc(fmt(a.promotionMedallion, 'EN')) + '" data-fr="' + esc(fmt(a.promotionMedallion, 'FR')) + '">' + esc(fmt(a.promotionMedallion, 'FR')) + '</td>'
        + '</tr>';
    }).join('');
    return '<table class="db-table"><thead><tr>'
      + '<th data-i18n="cReach">Débloque</th>'
      + '<th data-i18n="cGrowth">Manuel de croissance</th>'
      + '<th data-i18n="cPotion">Potion de nutriments</th>'
      + '<th data-i18n="cMedal">Médaillon de promotion</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  // ---- Pet food per level ----
  function renderFood(p) {
    const food = p.petFood || [];
    const rows = food.map(function (c, i) {
      const from = i + 1, to = i + 2;
      return '<tr>'
        + '<td class="c-lbl"><span data-en="Lv." data-fr="Niv.">Niv.</span> ' + from + ' → ' + to + '</td>'
        + '<td class="num" data-en="' + esc(fmt(c, 'EN')) + '" data-fr="' + esc(fmt(c, 'FR')) + '">' + esc(fmt(c, 'FR')) + '</td>'
        + '</tr>';
    }).join('');
    return '<table class="db-table"><thead><tr>'
      + '<th data-i18n="cLevel">Niveau</th>'
      + '<th data-i18n="cFood">Nourriture</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function statusBox(txt) { return '<p style="text-align:center;padding:22px;color:var(--text-muted)">' + esc(txt) + '</p>'; }

  const elSkill = document.getElementById('p-skill');
  const elAdv = document.getElementById('p-adv');
  const elFood = document.getElementById('p-food');

  function apply() {
    const lang = L0();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(dict[lang] || dict.FR);
    document.querySelectorAll('[data-en][data-fr]').forEach(function (el) {
      const val = el.getAttribute('data-' + lang.toLowerCase());
      if (val == null) return;
      if (el.classList.contains('m-block-desc')) el.innerHTML = highlightX(val);
      else el.textContent = val;
    });
    const n = document.getElementById('pet-name'), c = document.getElementById('crumb-name');
    if (n && c) c.textContent = n.textContent;
    document.documentElement.lang = lang.toLowerCase();
  }
  window.addEventListener('langChanged', apply);

  if (elSkill) elSkill.innerHTML = statusBox(dict[L0()].loading);
  fetch(DATA_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (db) {
      const p = ((db && db.pets) || []).find(function (x) { return x.id === PID; });
      if (!p) { if (elSkill) elSkill.innerHTML = statusBox(dict[L0()].err); return; }
      if (elSkill) elSkill.innerHTML = renderSkill(p);
      if (elAdv) elAdv.innerHTML = renderAdvancements(p);
      if (elFood) elFood.innerHTML = renderFood(p);
      apply();
    })
    .catch(function () { if (elSkill) elSkill.innerHTML = statusBox(dict[L0()].err); });

  apply();
})();
