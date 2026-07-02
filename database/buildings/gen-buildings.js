const fs = require('fs');
const db = JSON.parse(fs.readFileSync('/tmp/hkd/data/truegold_db.json','utf8'));
const COL = { NAME:0, LEVEL:1, LABEL:2, REQ:3, TG:4, TTG:5, BREAD:6, WOOD:7, STONE:8, IRON:9, TIMELBL:10, TIMEMIN:11 };

// noms FR des mots de bâtiments dans les prérequis (plus longs d'abord)
const REQ_FR = [
  ['War Academy','Académie de Guerre'],['Command Center','Base de commandement'],
  ['Town Center','Centre-ville'],['Academy','Académie'],['Embassy','Ambassade'],
  ['Stable','Écurie'],['Range','Stand de Tir'],['Infirmary','Infirmerie'],['Barracks','Caserne']
];
function reqFR(txt){
  let t = txt || '';
  for (const [en,fr] of REQ_FR) t = t.split(en).join(fr);
  return t.replace(/Lv\./g,'Niv.');
}
function timeFR(t){ return (t||'').replace(/(\d+)\s*d/g,'$1j'); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function cell(v){ return (v===0||v==='0'||v==null||v==='') ? '—' : esc(v); }
function nl(s){ return esc(s).replace(/\n/g,', '); }

function slug(en){ return en.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

function genBuilding(nameEN){
  const meta = db.bldgMap[nameEN];
  const rows = db.dbDataRaw.filter(r => r[COL.NAME]===nameEN);
  const trs = rows.map(r=>{
    const reqEn = nl(r[COL.REQ]), reqFr = nl(reqFR(r[COL.REQ]));
    return `        <tr>
          <td class="c-lbl">${esc(r[COL.LABEL])}</td>
          <td class="c-req" data-en="${reqEn}" data-fr="${reqFr}">${reqFr}</td>
          <td class="num tg">${cell(r[COL.TG])}</td>
          <td class="num ttg">${cell(r[COL.TTG])}</td>
          <td class="num">${cell(r[COL.BREAD])}</td>
          <td class="num">${cell(r[COL.WOOD])}</td>
          <td class="num">${cell(r[COL.STONE])}</td>
          <td class="num">${cell(r[COL.IRON])}</td>
          <td class="c-time" data-en="${esc(r[COL.TIMELBL])}" data-fr="${esc(timeFR(r[COL.TIMELBL]))}">${esc(timeFR(r[COL.TIMELBL]))}</td>
        </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <base href="/hub-kingshot/">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(meta.EN)} — Upgrade Costs (TrueGold, Resources, Time) | Kingshot Toolbox</title>
    <meta name="description" content="Complete ${esc(meta.EN)} upgrade table for Kingshot: TrueGold, Tainted TrueGold, resources and build time for every level.">
    <link rel="stylesheet" href="css/style.css">
    <style>
      .db-page { max-width: 1120px; margin: 0 auto; padding: 20px 16px 60px; }
      .db-breadcrumb { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
      .db-breadcrumb a { color: var(--accent); text-decoration: none; }
      .db-page h1 { color: var(--accent); margin: 0 0 6px; }
      .db-intro { color: var(--text-muted); font-size: 14px; margin: 0 0 18px; line-height: 1.5; }
      table.db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      table.db-table th, table.db-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap; }
      table.db-table thead th { position: sticky; top: 0; background: var(--control-bg); color: var(--text-muted); text-transform: uppercase; font-size: 11px; letter-spacing: .04em; z-index: 1; }
      table.db-table tbody tr:hover { background: rgba(255,255,255,0.03); }
      table.db-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
      table.db-table td.tg { color: var(--accent); font-weight: 600; }
      table.db-table td.ttg { color: #c58cff; font-weight: 600; }
      table.db-table td.c-lbl { font-weight: 700; color: var(--text-light); }
      table.db-table td.c-req { white-space: normal; color: var(--text-muted); font-size: 12px; min-width: 160px; }
    </style>
</head>
<body class="has-app-header">
    <div class="db-page">
        <div class="db-breadcrumb"><a href="index.html">Kingshot Toolbox</a> / <a href="database/buildings/index.html" data-i18n="crumbBuildings">Bâtiments</a> / <span id="crumb-name">${esc(meta.FR)}</span></div>
        <h1 id="bldg-name" data-en="${esc(meta.EN)}" data-fr="${esc(meta.FR)}">${esc(meta.FR)}</h1>
        <p class="db-intro" data-i18n="bldgIntro">Coûts d'amélioration complets par palier : TrueGold, TrueGold Corrompu, ressources et temps de construction.</p>
        <div class="table-container">
          <table class="db-table">
            <thead><tr>
              <th data-i18n="cLevel">Palier</th>
              <th data-i18n="cReq">Prérequis</th>
              <th data-i18n="cTG">TrueGold</th>
              <th data-i18n="cTTG">TG Corrompu</th>
              <th data-i18n="cBread">Pain</th>
              <th data-i18n="cWood">Bois</th>
              <th data-i18n="cStone">Pierre</th>
              <th data-i18n="cIron">Fer</th>
              <th data-i18n="cTime">Temps</th>
            </tr></thead>
            <tbody>
${trs}
            </tbody>
          </table>
        </div>
    </div>

    <script src="js/site-config.js"></script>
    <script src="js/lang.js"></script>
    <script src="js/header.js"></script>
    <script>
    (function(){
      const dict = {
        FR: { crumbBuildings:"Bâtiments", bldgIntro:"Coûts d'amélioration complets par palier : TrueGold, TrueGold Corrompu, ressources et temps de construction.", cLevel:"Palier", cReq:"Prérequis", cTG:"TrueGold", cTTG:"TG Corrompu", cBread:"Pain", cWood:"Bois", cStone:"Pierre", cIron:"Fer", cTime:"Temps" },
        EN: { crumbBuildings:"Buildings", bldgIntro:"Full per-level upgrade costs: TrueGold, Tainted TrueGold, resources and build time.", cLevel:"Level", cReq:"Requirements", cTG:"TrueGold", cTTG:"Tainted TG", cBread:"Bread", cWood:"Wood", cStone:"Stone", cIron:"Iron", cTime:"Time" }
      };
      function apply(){
        const lang = (window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'FR';
        if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(dict[lang]||dict.FR);
        document.querySelectorAll('[data-en][data-fr]').forEach(el=>{ el.textContent = el.getAttribute('data-'+lang.toLowerCase()) || el.textContent; });
        const n=document.getElementById('bldg-name'); const c=document.getElementById('crumb-name');
        if(n&&c) c.textContent=n.textContent;
        document.documentElement.lang = lang.toLowerCase();
      }
      window.addEventListener('langChanged', apply);
      apply();
    })();
    </script>
</body>
</html>`;
}

function genIndex(order){
  const cards = order.map(en=>{
    const m=db.bldgMap[en]; const n=db.dbDataRaw.filter(r=>r[0]===en).length;
    return `      <a class="db-card" href="database/buildings/${slug(en)}.html" data-en="${esc(m.EN)}" data-fr="${esc(m.FR)}">${esc(m.FR)}<span class="db-card-sub">${n} <span data-i18n="tiers">paliers</span></span></a>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <base href="/hub-kingshot/">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kingshot Buildings — Upgrade Costs Database (TrueGold, Resources, Time) | Kingshot Toolbox</title>
    <meta name="description" content="Kingshot buildings database: full upgrade costs per level (TrueGold, Tainted TrueGold, resources, build time and requirements) for every building.">
    <link rel="stylesheet" href="css/style.css">
    <style>
      .db-page { max-width: 1000px; margin: 0 auto; padding: 20px 16px 60px; }
      .db-breadcrumb { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
      .db-breadcrumb a { color: var(--accent); text-decoration: none; }
      .db-page h1 { color: var(--accent); margin: 0 0 6px; }
      .db-intro { color: var(--text-muted); font-size: 14px; margin: 0 0 22px; line-height: 1.5; }
      .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; }
      .db-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--control-bg); color: var(--text-light); text-decoration: none; font-weight: 600; transition: border-color .15s, transform .1s; }
      .db-card:hover { border-color: var(--accent); transform: translateY(-1px); }
      .db-card-sub { font-size: 12px; color: var(--text-muted); font-weight: 400; }
    </style>
</head>
<body class="has-app-header">
    <div class="db-page">
        <div class="db-breadcrumb"><a href="index.html">Kingshot Toolbox</a> / <span data-i18n="crumbBuildings">Bâtiments</span></div>
        <h1 data-i18n="idxTitle">Bâtiments — Coûts d'amélioration</h1>
        <p class="db-intro" data-i18n="idxIntro">Tous les coûts d'amélioration des bâtiments Kingshot, palier par palier : TrueGold, TrueGold Corrompu, ressources, temps et prérequis. Choisis un bâtiment.</p>
        <div class="db-grid">
${cards}
        </div>
    </div>
    <script src="js/site-config.js"></script>
    <script src="js/lang.js"></script>
    <script src="js/header.js"></script>
    <script>
    (function(){
      const dict = {
        FR: { crumbBuildings:"Bâtiments", idxTitle:"Bâtiments — Coûts d'amélioration", idxIntro:"Tous les coûts d'amélioration des bâtiments Kingshot, palier par palier : TrueGold, TrueGold Corrompu, ressources, temps et prérequis. Choisis un bâtiment.", tiers:"paliers" },
        EN: { crumbBuildings:"Buildings", idxTitle:"Buildings — Upgrade Costs", idxIntro:"All Kingshot building upgrade costs, level by level: TrueGold, Tainted TrueGold, resources, time and requirements. Pick a building.", tiers:"levels" }
      };
      function apply(){
        const lang=(window.GlobalLang&&GlobalLang.get&&GlobalLang.get())||'FR';
        if(window.GlobalLang&&GlobalLang.applyI18n) GlobalLang.applyI18n(dict[lang]||dict.FR);
        document.querySelectorAll('.db-card[data-en][data-fr]').forEach(el=>{
          const sub=el.querySelector('.db-card-sub');
          el.childNodes[0].nodeValue = el.getAttribute('data-'+lang.toLowerCase());
        });
        document.documentElement.lang=lang.toLowerCase();
      }
      window.addEventListener('langChanged', apply); apply();
    })();
    </script>
</body>
</html>`;
}

const order = ['Town Center','Embassy','Command Center','War Academy','Infirmary','Barracks','Stable','Range'];
const fsp=require('fs'); const dir='/tmp/gen/out'; fsp.mkdirSync(dir,{recursive:true});
order.forEach(en=>{ fsp.writeFileSync(dir+'/'+slug(en)+'.html', genBuilding(en)); });
fsp.writeFileSync(dir+'/index.html', genIndex(order));
console.log('✅ Généré:', order.map(slug).join('.html, ')+'.html + index.html');
order.forEach(en=>{ const n=db.dbDataRaw.filter(r=>r[0]===en).length; console.log('  '+slug(en)+'.html : '+n+' paliers'); });
