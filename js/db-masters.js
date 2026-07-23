// ============================================================
//  DB MASTERS — rendu des pages Base de Données « Experts »
//  Chaque page pose window.MASTER_ID puis inclut ce script.
//  Données : data/masters_db.json (fetch relatif au <base>).
//  Tables SEO statiques côté serveur ? Non : contenu injecté ici,
//  mais titres/intro/switch restent en dur dans le HTML (SEO).
// ============================================================
(function () {
  const DATA_URL = 'data/masters_db.json';
  const MID = window.MASTER_ID;

  const dict = {
    FR: {
      crumb: "Experts", cReset: "",
      secAffinity: "Paliers d'affinité", secPassive: "Expertise passive", secSkills: "Compétences actives",
      cLevel: "Niveau", cAffinity: "Affinité", cEmblems: "Emblèmes", cBonus: "Bonus", cEffect: "Effet",
      cXp: "Coût EXP", cManu: "Manuscrits", cPower: "Puissance",
      unlockAt: "Débloquée au niveau de relation", passiveHint: "Bonus passif appliqué automatiquement selon le niveau d'expertise.",
      loading: "Chargement des données…",
      err: "Impossible de charger les données (data/masters_db.json). Le fichier existe-t-il ?"
    },
    EN: {
      crumb: "Masters", cReset: "",
      secAffinity: "Affinity milestones", secPassive: "Passive expertise", secSkills: "Active skills",
      cLevel: "Level", cAffinity: "Affinity", cEmblems: "Emblems", cBonus: "Bonus", cEffect: "Effect",
      cXp: "XP Cost", cManu: "Manuscripts", cPower: "Power",
      unlockAt: "Unlocked at relation level", passiveHint: "Passive bonus applied automatically based on expertise level.",
      loading: "Loading data…",
      err: "Could not load data (data/masters_db.json). Does the file exist?"
    }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(n, L) { if (n == null || n === '' || n === '—') return '—'; const v = +n; if (!isFinite(v)) return esc(n); return v.toLocaleString(L === 'FR' ? 'fr-FR' : 'en-US'); }
  function pct(b) { if (b == null) return '—'; return '+' + String(b) + '%'; }
  function skillImg(nameEN) { return 'img/MasterSkill/' + String(nameEN).replace(/ /g, '_') + '.webp'; }

  const L0 = () => (window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'FR';

  // ---- Affinity milestones ----
  function renderMilestones(m) {
    const rows = (m.affinityMilestones || []).map(function (x) {
      return '<tr>'
        + '<td class="c-lbl">' + esc(x.level) + '</td>'
        + '<td class="num" data-en="' + esc(fmt(x.affinity, 'EN')) + '" data-fr="' + esc(fmt(x.affinity, 'FR')) + '">' + esc(fmt(x.affinity, 'FR')) + '</td>'
        + '<td class="num">' + esc(x.emblems) + '</td>'
        + '<td class="num tg">' + esc(pct(x.bonus)) + '</td>'
        + '</tr>';
    }).join('');
    const bonusEN = (m.affinityBonus && m.affinityBonus.EN) || '';
    const bonusFR = (m.affinityBonus && m.affinityBonus.FR) || '';
    return ''
      + '<table class="db-table"><thead><tr>'
      + '<th data-i18n="cLevel">Niveau</th>'
      + '<th data-i18n="cAffinity">Affinité</th>'
      + '<th data-i18n="cEmblems">Emblèmes</th>'
      + '<th data-en="' + esc(bonusEN) + '" data-fr="' + esc(bonusFR) + '">' + esc(bonusFR) + '</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  // ---- Passive ----
  function renderPassive(m) {
    const p = m.passive || {};
    const nameEN = (p.name && p.name.EN) || '', nameFR = (p.name && p.name.FR) || '';
    const dEN = (p.TextToInclude && p.TextToInclude.EN) || '', dFR = (p.TextToInclude && p.TextToInclude.FR) || '';
    const rows = (p.levels || []).map(function (lv) {
      return '<tr><td class="c-lbl">' + esc(lv.level) + '</td><td>' + esc(lv.effect) + '</td></tr>';
    }).join('');
    return ''
      + '<div class="m-block">'
      + '<div class="m-block-head">'
      + '<img class="m-ico" src="' + esc(skillImg(nameEN)) + '" alt="' + esc(nameEN) + '" onerror="this.remove()">'
      + '<div><div class="m-block-name" data-en="' + esc(nameEN) + '" data-fr="' + esc(nameFR) + '">' + esc(nameFR) + '</div>'
      + '<div class="m-block-desc" data-en="' + esc(dEN) + '" data-fr="' + esc(dFR) + '">' + esc(dFR) + '</div></div>'
      + '</div>'
      + '<table class="db-table"><thead><tr><th data-i18n="cLevel">Niveau</th><th data-i18n="cEffect">Effet</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '</div>';
  }

  // ---- Active skills ----
  function renderSkills(m) {
    return (m.skills || []).map(function (s) {
      const nameEN = (s.name && s.name.EN) || s.id, nameFR = (s.name && s.name.FR) || s.id;
      const dEN = (s.TextToInclude && s.TextToInclude.EN) || '', dFR = (s.TextToInclude && s.TextToInclude.FR) || '';
      const u = s.unlockRelLevel;
      const unlockEN = u != null ? ('Unlocked at relation level ' + u) : '';
      const unlockFR = u != null ? ('Débloquée au niveau de relation ' + u) : '';
      const rows = (s.levels || []).map(function (lv) {
        return '<tr>'
          + '<td class="c-lbl">' + esc(lv.level) + '</td>'
          + '<td class="c-eff">' + esc(lv.effect) + '</td>'
          + '<td class="num" data-en="' + esc(fmt(lv.xpCost, 'EN')) + '" data-fr="' + esc(fmt(lv.xpCost, 'FR')) + '">' + esc(fmt(lv.xpCost, 'FR')) + '</td>'
          + '<td class="num" data-en="' + esc(fmt(lv.manuscripts, 'EN')) + '" data-fr="' + esc(fmt(lv.manuscripts, 'FR')) + '">' + esc(fmt(lv.manuscripts, 'FR')) + '</td>'
          + '<td class="num" data-en="' + esc(fmt(lv.power, 'EN')) + '" data-fr="' + esc(fmt(lv.power, 'FR')) + '">' + esc(fmt(lv.power, 'FR')) + '</td>'
          + '</tr>';
      }).join('');
      return ''
        + '<div class="m-block">'
        + '<div class="m-block-head">'
        + '<img class="m-ico" src="' + esc(skillImg(nameEN)) + '" alt="' + esc(nameEN) + '" onerror="this.remove()">'
        + '<div><div class="m-block-name" data-en="' + esc(nameEN) + '" data-fr="' + esc(nameFR) + '">' + esc(nameFR) + '</div>'
        + (u != null ? '<div class="m-block-tag" data-en="' + esc(unlockEN) + '" data-fr="' + esc(unlockFR) + '">' + esc(unlockFR) + '</div>' : '')
        + '<div class="m-block-desc" data-en="' + esc(dEN) + '" data-fr="' + esc(dFR) + '">' + esc(dFR) + '</div></div>'
        + '</div>'
        + '<table class="db-table"><thead><tr>'
        + '<th data-i18n="cLevel">Niveau</th>'
        + '<th data-i18n="cEffect">Effet</th>'
        + '<th data-i18n="cXp">Coût EXP</th>'
        + '<th data-i18n="cManu">Manuscrits</th>'
        + '<th data-i18n="cPower">Puissance</th>'
        + '</tr></thead><tbody>' + rows + '</tbody></table>'
        + '</div>';
    }).join('');
  }

  function statusBox(txt) { return '<p style="text-align:center;padding:22px;color:var(--text-muted)">' + esc(txt) + '</p>'; }

  const elMile = document.getElementById('m-milestones');
  const elPass = document.getElementById('m-passive');
  const elSkills = document.getElementById('m-skills');

  function apply() {
    const lang = L0();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(dict[lang] || dict.FR);
    document.querySelectorAll('[data-en][data-fr]').forEach(function (el) { el.textContent = el.getAttribute('data-' + lang.toLowerCase()) || el.textContent; });
    const n = document.getElementById('master-name'), c = document.getElementById('crumb-name');
    if (n && c) c.textContent = n.textContent;
    document.documentElement.lang = lang.toLowerCase();
  }
  window.addEventListener('langChanged', apply);

  if (elMile) elMile.innerHTML = statusBox(dict[L0()].loading);
  fetch(DATA_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (list) {
      const m = (list || []).find(function (x) { return x.id === MID; });
      if (!m) { if (elMile) elMile.innerHTML = statusBox(dict[L0()].err); return; }
      if (elMile) elMile.innerHTML = renderMilestones(m);
      if (elPass) elPass.innerHTML = renderPassive(m);
      if (elSkills) elSkills.innerHTML = renderSkills(m);
      apply();
    })
    .catch(function () { if (elMile) elMile.innerHTML = statusBox(dict[L0()].err); });

  apply();
})();
