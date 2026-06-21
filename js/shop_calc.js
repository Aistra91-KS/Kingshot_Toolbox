// ============================================================
//  SHOP CALCULATION  —  Data Item · Shop Classique · Événement · Coffres
//  Vanilla · localStorage · bilingue
// ============================================================

const i18nShop = {
  FR: {
    scTitle:"Shop Calculation", scDesc:"Comparez le coût des objets en boutique à leur valeur en gemmes pour repérer les meilleures affaires.",
    tabData:"Data Item", tabClassic:"Shop Classique", tabEvent:"Shop d'Événement", tabChest:"Coffres",
    colName:"Nom", colCat:"Catégorie", colGem:"Valeur (gemmes)", resetItems:"Réinitialiser les valeurs",
    allCats:"Toutes les catégories", confirmReset:"Réinitialiser toutes les valeurs en gemmes par défaut ?",
    soon:"Bientôt disponible", soonDesc:"Cet onglet arrive dans une prochaine étape.", count:"objets",
    hItem:"Objet", hQty:"Qté", hCost:"Coût", hGem:"Valeur gemmes", hRatio:"Ratio", hAct:"",
    addItem:"+ Ajouter", chooseItem:"— Objet —", total:"Valeur totale",
    newShop:"+ Nouvelle boutique", importJson:"Importer JSON", exportJson:"Exporter JSON",
    dup:"Dupliquer", del:"Suppr.", copy:"copie", noEvent:"Aucune boutique d'événement. Crée-en une !",
    confirmDelShop:"Supprimer cette boutique ?", best:"Top"
  },
  EN: {
    scTitle:"Shop Calculation", scDesc:"Compare in-shop cost to gem value to spot the best deals.",
    tabData:"Data Item", tabClassic:"Classic Shop", tabEvent:"Event Shop", tabChest:"Chests",
    colName:"Name", colCat:"Category", colGem:"Value (gems)", resetItems:"Reset values",
    allCats:"All categories", confirmReset:"Reset all gem values to defaults?",
    soon:"Coming soon", soonDesc:"This tab is coming in a next step.", count:"items",
    hItem:"Item", hQty:"Qty", hCost:"Cost", hGem:"Gem value", hRatio:"Ratio", hAct:"",
    addItem:"+ Add", chooseItem:"— Item —", total:"Total value",
    newShop:"+ New shop", importJson:"Import JSON", exportJson:"Export JSON",
    dup:"Duplicate", del:"Delete", copy:"copy", noEvent:"No event shop yet. Create one!",
    confirmDelShop:"Delete this shop?", best:"Top"
  }
};
function scLang(){ return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k){ return (i18nShop[scLang()]||i18nShop.FR)[k]; }

const SC_CAT_COLORS = {
  Speedup:'#3B82F6', Pet:'#4ADE80', Other:'#6B7280', Equipment:'#64748B',
  Event:'#A855F7', Governor:'#DC2626', Hero:'#FBBF24', Island:'#14B8A6',
  Resources:'#22C55E', VIP:'#EAB308', Cosmetic:'#EC4899'
};
function scCatColor(c){ return SC_CAT_COLORS[c]||'#6B7280'; }

let SC_ITEMS=[], SC_DEFAULTS=[];
let SC_CLASSIC=[], SC_CLASSIC_DEF=[];
let SC_EVENTS=[];

function scEscAttr(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function scName(it,lang){ if(it&&it.name&&typeof it.name==='object') return it.name[lang]||it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
function scNameEN(it){ if(it&&it.name&&typeof it.name==='object') return it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
function scItemById(id){ return SC_ITEMS.find(i=>i.id===id); }
function scGem(id){ const it=scItemById(id); return it?Number(it.gemValue)||0:0; }
function scShopName(shop,lang){ return (shop.name&&typeof shop.name==='object')?(shop.name[lang]||shop.name.EN):shop.name; }

// ---------- chargement ----------
async function scLoadItems(){
  try{ SC_DEFAULTS = await (await fetch('data/shopcalc_items.json')).json(); }catch(e){ console.error('items',e); SC_DEFAULTS=[]; }
  const saved = safeParse(STORAGE_KEYS.shopcalcItems,null);
  SC_ITEMS = (saved&&Array.isArray(saved)&&saved.length)? saved : SC_DEFAULTS.map(x=>({...x}));
  SC_ITEMS.forEach(it=>{ if(typeof it.name==='string') it.name={EN:it.name,FR:it.name}; });
}
function scSaveItems(){ localStorage.setItem(STORAGE_KEYS.shopcalcItems, JSON.stringify(SC_ITEMS)); }

async function scLoadClassic(){
  try{ SC_CLASSIC_DEF = await (await fetch('data/shopcalc_classic.json')).json(); }catch(e){ console.error('classic',e); SC_CLASSIC_DEF=[]; }
  const saved = safeParse(STORAGE_KEYS.shopcalcClassic,null);
  if(saved&&Array.isArray(saved)){
    SC_CLASSIC = saved;
    const ids=new Set(saved.map(s=>s.id));
    SC_CLASSIC_DEF.forEach(d=>{ if(!ids.has(d.id)) SC_CLASSIC.push(JSON.parse(JSON.stringify(d))); }); // nouvelles boutiques admin
  } else { SC_CLASSIC = JSON.parse(JSON.stringify(SC_CLASSIC_DEF)); }
}
function scSaveClassic(){ localStorage.setItem(STORAGE_KEYS.shopcalcClassic, JSON.stringify(SC_CLASSIC)); }

function scLoadEvents(){ const s=safeParse(STORAGE_KEYS.shopcalcEvents,null); SC_EVENTS=(s&&Array.isArray(s))?s:[]; }
function scSaveEvents(){ localStorage.setItem(STORAGE_KEYS.shopcalcEvents, JSON.stringify(SC_EVENTS)); }

// ---------- DATA ITEM ----------
function scRenderCatFilter(){
  const sel=document.getElementById('item-cat-filter'); if(!sel) return;
  const cats=[...new Set(SC_ITEMS.map(i=>i.category).filter(Boolean))].sort();
  const cur=sel.value;
  sel.innerHTML=`<option value="">${scT('allCats')}</option>`+cats.map(c=>`<option value="${scEscAttr(c)}">${scEscAttr(c)}</option>`).join('');
  if(cats.includes(cur)) sel.value=cur;
}
function scRenderItems(){
  const tb=document.getElementById('item-tbody'); if(!tb) return;
  const lang=scLang();
  const q=(document.getElementById('item-search')?.value||'').trim().toLowerCase();
  const cat=document.getElementById('item-cat-filter')?.value||'';
  const rows=SC_ITEMS.map((it,idx)=>({it,idx})).filter(({it})=>{
    if(cat&&it.category!==cat) return false;
    if(!q) return true;
    return scNameEN(it).toLowerCase().includes(q)||((it.name&&it.name.FR)||'').toLowerCase().includes(q);
  });
  tb.innerHTML=rows.map(({it,idx})=>{
    const color=scCatColor(it.category), img=encodeURIComponent(scNameEN(it));
    return `<tr style="border-left:4px solid ${color};background:${color}14;">
      <td style="width:46px;"><div class="sc-item-img" style="background-image:url('img/Item/${img}.png');background-color:${color}33;"></div></td>
      <td style="font-weight:600;">${scEscAttr(scName(it,lang))}</td>
      <td><span style="color:${color};font-weight:600;font-size:12px;">${scEscAttr(it.category)}</span></td>
      <td><input type="number" min="0" step="1" class="table-input" style="width:120px;text-align:right;" value="${it.gemValue}" onchange="scUpdateGem(${idx},this.value)"></td></tr>`;
  }).join('');
  const cnt=document.getElementById('item-count'); if(cnt) cnt.textContent=`${rows.length} / ${SC_ITEMS.length} ${scT('count')}`;
}
window.scUpdateGem=function(idx,val){ if(!SC_ITEMS[idx])return; let n=parseFloat(String(val).replace(',','.')); SC_ITEMS[idx].gemValue=isNaN(n)?0:n; scSaveItems(); scRenderClassic(); scRenderEvents(); };
window.scResetItems=function(){ showAppConfirm(scT('confirmReset'),()=>{ SC_ITEMS=SC_DEFAULTS.map(x=>({...x})); SC_ITEMS.forEach(it=>{if(typeof it.name==='string')it.name={EN:it.name,FR:it.name};}); scSaveItems(); scRenderCatFilter(); scRenderItems(); scRenderClassic(); scRenderEvents(); }); };

// ---------- MOTEUR BOUTIQUE (partagé Classique/Événement) ----------
function scComputeRows(shop){
  const rows=(shop.items||[]).map((si,i)=>{
    const it=scItemById(si.itemId);
    const qty=Math.max(1,Number(si.qty)||1), cost=Math.max(0,Number(si.cost)||0);
    const gem=scGem(si.itemId)*qty;
    return { i, si, it, qty, cost, gem, ratio: cost>0?gem/cost:0 };
  });
  const sorted=[...rows].sort((a,b)=>b.ratio-a.ratio);
  sorted.forEach((r,idx)=>r.rank=idx+1);
  const maxRatio=sorted.length?sorted[0].ratio:0;
  return { sorted, maxRatio, totalGem: rows.reduce((a,r)=>a+r.gem,0) };
}
function scItemOptions(lang){
  return `<option value="">${scT('chooseItem')}</option>`+
    SC_ITEMS.slice().sort((a,b)=>scName(a,lang).localeCompare(scName(b,lang)))
    .map(it=>`<option value="${it.id}">${scEscAttr(scName(it,lang))}</option>`).join('');
}
function scRenderShopCard(scope,shop){
  const lang=scLang();
  const { sorted, maxRatio, totalGem } = scComputeRows(shop);
  const nm=scShopName(shop,lang);
  const head = (scope==='event')
    ? `<input class="table-input" style="font-weight:bold;font-size:15px;max-width:260px;" value="${scEscAttr(nm)}" onchange="scRenameEvent('${shop.id}',this.value)">
       <span style="margin-left:auto;display:flex;gap:6px;align-items:center;">
         <span style="color:var(--text-muted);font-size:12px;">${scT('total')}: <strong style="color:var(--accent);">${totalGem.toLocaleString()}</strong></span>
         <button class="btn-reset" style="padding:4px 9px;font-size:12px;" onclick="scDuplicateEvent('${shop.id}')">${scT('dup')}</button>
         <button class="btn-reset" style="padding:4px 9px;font-size:12px;border-color:var(--warning);color:var(--warning);" onclick="scDeleteEvent('${shop.id}')">${scT('del')}</button>
       </span>`
    : `<strong style="font-size:16px;color:var(--accent);">${scEscAttr(nm)}</strong>
       <span style="margin-left:auto;color:var(--text-muted);font-size:12px;">${scT('total')}: <strong style="color:var(--accent);">${totalGem.toLocaleString()}</strong></span>`;

  const body = sorted.map(r=>{
    const cat=r.it?r.it.category:'Other', color=scCatColor(cat), img=encodeURIComponent(scNameEN(r.it));
    const nameTxt=r.it?scName(r.it,lang):'??';
    const top=r.rank===1&&r.ratio>0;
    return `<tr style="border-left:4px solid ${color};background:${color}${top?'26':'14'};">
      <td style="width:42px;"><div class="sc-item-img" style="width:30px;height:30px;background-image:url('img/Item/${img}.png');background-color:${color}33;"></div></td>
      <td>${scEscAttr(nameTxt)} ${top?`<span style="background:var(--success);color:#000;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:8px;">${scT('best')}</span>`:''}</td>
      <td style="text-align:center;">${r.qty}</td>
      <td style="text-align:right;">${r.cost.toLocaleString()}</td>
      <td style="text-align:right;">${r.gem.toLocaleString()}</td>
      <td style="min-width:130px;"><div style="display:flex;align-items:center;gap:6px;">
        <span style="font-weight:bold;color:${top?'var(--success)':'var(--text-light)'};white-space:nowrap;">×${r.ratio.toFixed(2)}</span>
        <div style="flex:1;height:6px;background:var(--control-bg);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${maxRatio>0?(r.ratio/maxRatio*100):0}%;background:${top?'var(--success)':'var(--accent)'};"></div></div>
      </div></td>
      <td style="text-align:center;"><button class="btn-reset" style="padding:2px 8px;font-size:13px;" onclick="scRemoveShopItem('${scope}','${shop.id}',${r.i})">✕</button></td></tr>`;
  }).join('');

  return `<div class="panel sc-shop" style="padding:16px;margin-bottom:18px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">${head}</div>
    <div class="table-container"><table>
      <thead><tr><th></th><th data-i18n="hItem">${scT('hItem')}</th><th style="text-align:center;">${scT('hQty')}</th>
      <th style="text-align:right;">${scT('hCost')}</th><th style="text-align:right;">${scT('hGem')}</th><th>${scT('hRatio')}</th><th></th></tr></thead>
      <tbody>${body||''}</tbody></table></div>
    <div class="sc-add-form" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;">
      <select class="sc-add-item table-select" style="min-width:200px;">${scItemOptions(lang)}</select>
      <input class="sc-add-qty table-input" type="number" min="1" value="1" style="width:70px;" title="${scT('hQty')}">
      <input class="sc-add-cost table-input" type="number" min="0" placeholder="${scT('hCost')}" style="width:100px;">
      <button class="btn-reset" style="background:var(--accent);color:#000;font-weight:bold;padding:6px 12px;" onclick="scAddShopItem('${scope}','${shop.id}',this)">${scT('addItem')}</button>
    </div></div>`;
}
function scGetShop(scope,id){ return (scope==='event'?SC_EVENTS:SC_CLASSIC).find(s=>s.id===id); }
function scSaveScope(scope){ scope==='event'?scSaveEvents():scSaveClassic(); }
function scRenderScope(scope){ scope==='event'?scRenderEvents():scRenderClassic(); }

window.scAddShopItem=function(scope,id,btn){
  const f=btn.closest('.sc-add-form'); const itemId=f.querySelector('.sc-add-item').value;
  const qty=parseInt(f.querySelector('.sc-add-qty').value)||1; const cost=parseFloat(f.querySelector('.sc-add-cost').value)||0;
  if(!itemId) return;
  const shop=scGetShop(scope,id); if(!shop) return;
  shop.items.push({itemId,qty:Math.max(1,qty),cost:Math.max(0,cost)});
  scSaveScope(scope); scRenderScope(scope);
};
window.scRemoveShopItem=function(scope,id,index){ const shop=scGetShop(scope,id); if(!shop)return; shop.items.splice(index,1); scSaveScope(scope); scRenderScope(scope); };

function scRenderClassic(){
  const el=document.getElementById('panel-classic'); if(!el) return;
  el.innerHTML = SC_CLASSIC.map(s=>scRenderShopCard('classic',s)).join('') || `<p style="color:var(--text-muted);text-align:center;padding:30px;">—</p>`;
}

// ---------- ÉVÉNEMENTS (CRUD + import/export) ----------
window.scNewEvent=function(){ SC_EVENTS.push({ id:'evt_'+Date.now(), name:{EN:'New shop',FR:'Nouvelle boutique'}, items:[] }); scSaveEvents(); scRenderEvents(); };
window.scRenameEvent=function(id,val){ const s=scGetShop('event',id); if(!s)return; s.name={EN:val,FR:val}; scSaveEvents(); };
window.scDuplicateEvent=function(id){ const s=scGetShop('event',id); if(!s)return; const c=JSON.parse(JSON.stringify(s)); c.id='evt_'+Date.now(); const n=scShopName(s,scLang()); c.name={EN:n+' ('+scT('copy')+')',FR:n+' ('+scT('copy')+')'}; SC_EVENTS.push(c); scSaveEvents(); scRenderEvents(); };
window.scDeleteEvent=function(id){ showAppConfirm(scT('confirmDelShop'),()=>{ SC_EVENTS=SC_EVENTS.filter(s=>s.id!==id); scSaveEvents(); scRenderEvents(); }); };
window.scExportEvents=function(){
  const blob=new Blob([JSON.stringify(SC_EVENTS,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='shop-events.json'; a.click(); URL.revokeObjectURL(a.href);
};
window.scImportEvents=function(){ const i=document.getElementById('sc-import-file'); if(i) i.click(); };
window.scImportFile=function(input){
  const file=input.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=()=>{ try{ const data=JSON.parse(r.result); if(Array.isArray(data)){ data.forEach(s=>{ s.id='evt_'+Date.now()+'_'+Math.random().toString(36).slice(2,6); SC_EVENTS.push(s); }); scSaveEvents(); scRenderEvents(); showAppAlert('OK',true); } else showAppAlert('JSON invalide'); }catch(e){ showAppAlert('JSON invalide'); } input.value=''; };
  r.readAsText(file);
};
function scRenderEvents(){
  const el=document.getElementById('panel-event'); if(!el) return;
  const bar=`<div class="shop-toolbar">
    <button class="btn-reset" style="background:var(--accent);color:#000;font-weight:bold;" onclick="scNewEvent()">${scT('newShop')}</button>
    <button class="btn-reset" onclick="scImportEvents()">${scT('importJson')}</button>
    <button class="btn-reset" onclick="scExportEvents()">${scT('exportJson')}</button>
    <input type="file" id="sc-import-file" accept="application/json" style="display:none;" onchange="scImportFile(this)">
  </div>`;
  const cards = SC_EVENTS.length ? SC_EVENTS.map(s=>scRenderShopCard('event',s)).join('') : `<p style="color:var(--text-muted);text-align:center;padding:30px;">${scT('noEvent')}</p>`;
  el.innerHTML = bar + cards;
}

// ---------- onglets / i18n / démarrage ----------
window.scTab=function(name){
  document.querySelectorAll('.shop-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  document.querySelectorAll('.shop-panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+name));
};
function scApplyTranslations(){ if(window.GlobalLang) GlobalLang.applyI18n(i18nShop[scLang()]); }

(async function(){
  await scLoadItems();
  await scLoadClassic();
  scLoadEvents();
  scApplyTranslations();
  scRenderCatFilter(); scRenderItems();
  scRenderClassic(); scRenderEvents();
  const s=document.getElementById('item-search'); if(s) s.addEventListener('input',scRenderItems);
  const c=document.getElementById('item-cat-filter'); if(c) c.addEventListener('change',scRenderItems);
  window.addEventListener('langChanged',()=>{ scApplyTranslations(); scRenderCatFilter(); scRenderItems(); scRenderClassic(); scRenderEvents(); });
})();
