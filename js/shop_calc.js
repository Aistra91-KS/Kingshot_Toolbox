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
    addItem:"+ Ajouter", chooseItem:"— Objet —", resetSort:"⟲ Ordre de saisie",
    noEvent:"Aucune boutique d'événement.", best:"Top"
  },
  EN: {
    scTitle:"Shop Calculation", scDesc:"Compare in-shop cost to gem value to spot the best deals.",
    tabData:"Data Item", tabClassic:"Classic Shop", tabEvent:"Event Shop", tabChest:"Chests",
    colName:"Name", colCat:"Category", colGem:"Value (gems)", resetItems:"Reset values",
    allCats:"All categories", confirmReset:"Reset all gem values to defaults?",
    soon:"Coming soon", soonDesc:"This tab is coming in a next step.", count:"items",
    hItem:"Item", hQty:"Qty", hCost:"Cost", hGem:"Gem value", hRatio:"Ratio", hAct:"",
    addItem:"+ Add", chooseItem:"— Item —", resetSort:"⟲ Entry order",
    noEvent:"No event shop.", best:"Top"
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
let SC_EVENTS=[], SC_EVENTS_DEF=[];

// État de tri d'affichage, par boutique (en mémoire, non persisté).
// SC_SORT[shopId] = { col:'name'|'qty'|'cost'|'gem'|'ratio', dir:1|-1 } ; absent = ordre de saisie
const SC_SORT = {};

function scEscAttr(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function scName(it,lang){ if(it&&it.name&&typeof it.name==='object') return it.name[lang]||it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
function scNameEN(it){ if(it&&it.name&&typeof it.name==='object') return it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
// URL d'image sûre : encode l'apostrophe en %27 pour ne pas casser le url('...') du CSS.
function scImg(it){ return encodeURIComponent(scNameEN(it)).replace(/'/g,'%27'); }
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
  // Classique = boutiques admin en LECTURE SEULE : toujours chargées depuis le fichier,
  // sans localStorage (seules les valeurs en gemmes de Data Item l'impactent).
  try{ SC_CLASSIC = await (await fetch('data/shopcalc_classic.json')).json(); }catch(e){ console.error('classic',e); SC_CLASSIC=[]; }
}
function scSaveClassic(){ localStorage.setItem(STORAGE_KEYS.shopcalcClassic, JSON.stringify(SC_CLASSIC)); }

// Boutiques d'événement : admin-sourcées (data/shopcalc_events.json), même fusion que Classique.
// L'utilisateur ne crée plus de boutique ; il édite seulement le contenu (qté, coût, ajout, retrait).
async function scLoadEvents(){
  try{ SC_EVENTS_DEF = await (await fetch('data/shopcalc_events.json')).json(); }catch(e){ console.error('events',e); SC_EVENTS_DEF=[]; }
  const saved = safeParse(STORAGE_KEYS.shopcalcEvents,null);
  if(saved&&Array.isArray(saved)){
    SC_EVENTS = saved;
    const ids=new Set(saved.map(s=>s.id));
    SC_EVENTS_DEF.forEach(d=>{ if(!ids.has(d.id)) SC_EVENTS.push(JSON.parse(JSON.stringify(d))); }); // nouvelles boutiques admin
  } else { SC_EVENTS = JSON.parse(JSON.stringify(SC_EVENTS_DEF)); }
}
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
    const color=scCatColor(it.category), img=scImg(it);
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
// Ordre d'affichage = ordre de saisie par défaut. Le tri (SC_SORT) ne réordonne que l'affichage,
// jamais le tableau de données (shop.items). r.i = index réel dans shop.items (édition/retrait fiables).
function scComputeRows(shop){
  const lang=scLang();
  const rows=(shop.items||[]).map((si,i)=>{
    const it=scItemById(si.itemId);
    const qty=Math.max(1,Number(si.qty)||1), cost=Math.max(0,Number(si.cost)||0);
    const gem=scGem(si.itemId)*qty;
    return { i, si, it, qty, cost, gem, ratio: cost>0?gem/cost:0, nameTxt: it?scName(it,lang):'' };
  });
  // Top = meilleur ratio (basé sur le ratio, indépendant du tri d'affichage).
  const maxRatio=rows.length?Math.max(...rows.map(r=>r.ratio)):0;
  const topCount=rows.filter(r=>r.ratio===maxRatio&&r.ratio>0).length;
  const showTop = maxRatio>0 && topCount>0 && topCount<rows.length; // pas de Top si tout est identique
  rows.forEach(r=>{ r.isTop = showTop && r.ratio===maxRatio && r.ratio>0; });
  // Affichage : ordre de saisie, sauf si un tri est actif pour cette boutique.
  let display=rows;
  const st=SC_SORT[shop.id];
  if(st&&st.col){
    display=[...rows].sort((a,b)=>{
      if(st.col==='name'){ const x=a.nameTxt.toLowerCase(), y=b.nameTxt.toLowerCase(); return x<y?-st.dir:x>y?st.dir:0; }
      const av=a[st.col]||0, bv=b[st.col]||0; return (av-bv)*st.dir;
    });
  }
  return { rows: display, maxRatio };
}
function scItemOptions(lang){
  return `<option value="">${scT('chooseItem')}</option>`+
    SC_ITEMS.slice().sort((a,b)=>scName(a,lang).localeCompare(scName(b,lang)))
    .map(it=>`<option value="${it.id}">${scEscAttr(scName(it,lang))}</option>`).join('');
}
function scTh(scope,shop,col,label,align){
  const st=SC_SORT[shop.id];
  const arrow = (st&&st.col===col) ? (st.dir>0?' ▲':' ▼') : '';
  const a = align?`text-align:${align};`:'';
  return `<th style="cursor:pointer;user-select:none;${a}" onclick="scSort('${scope}','${shop.id}','${col}')">${label}${arrow}</th>`;
}
function scRenderShopCard(scope,shop){
  const lang=scLang();
  const editable = (scope==='event'); // Classique = lecture seule (admin) ; Événement = éditable
  const { rows, maxRatio } = scComputeRows(shop);
  const nm=scShopName(shop,lang);
  const st=SC_SORT[shop.id];
  const resetBtn = st ? `<button class="btn-reset" style="margin-left:auto;padding:4px 10px;font-size:12px;" onclick="scResetSort('${scope}','${shop.id}')">${scT('resetSort')}</button>` : '';
  const head = `<strong style="font-size:16px;color:var(--accent);">${scEscAttr(nm)}</strong>${resetBtn}`;

  const body = rows.map(r=>{
    const cat=r.it?r.it.category:'Other', color=scCatColor(cat), img=scImg(r.it);
    const nameTxt=r.it?scName(r.it,lang):'??';
    const top=r.isTop;
    const qtyCell = editable
      ? `<td style="text-align:center;"><input type="number" min="1" step="1" class="table-input" style="width:62px;text-align:center;" value="${r.qty}" onchange="scEditQty('${scope}','${shop.id}',${r.i},this.value)"></td>`
      : `<td style="text-align:center;">${r.qty}</td>`;
    const costCell = editable
      ? `<td style="text-align:right;"><input type="number" min="0" step="1" class="table-input" style="width:96px;text-align:right;" value="${r.cost}" onchange="scEditCost('${scope}','${shop.id}',${r.i},this.value)"></td>`
      : `<td style="text-align:right;">${r.cost.toLocaleString()}</td>`;
    const removeCell = editable
      ? `<td style="text-align:center;"><button class="btn-reset" style="padding:2px 8px;font-size:13px;" onclick="scRemoveShopItem('${scope}','${shop.id}',${r.i})">✕</button></td>`
      : '';
    return `<tr style="border-left:4px solid ${top?'#3B82F6':color};background:${color}${top?'26':'14'};${top?'box-shadow: inset 0 0 0 1px #3B82F64d;':''}">
      <td style="width:42px;"><div class="sc-item-img" style="width:30px;height:30px;background-image:url('img/Item/${img}.png');background-color:${color}33;"></div></td>
      <td>${scEscAttr(nameTxt)} ${top?`<span style="background:#3B82F6;color:#fff;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:8px;">${scT('best')}</span>`:''}</td>
      ${qtyCell}
      ${costCell}
      <td style="text-align:right;">${r.gem.toLocaleString()}</td>
      <td style="min-width:130px;"><div style="display:flex;align-items:center;gap:6px;">
        <span style="font-weight:bold;color:${top?'#3B82F6':'var(--text-light)'};white-space:nowrap;">×${r.ratio.toFixed(2)}</span>
        <div style="flex:1;height:6px;background:var(--control-bg);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${maxRatio>0?(r.ratio/maxRatio*100):0}%;background:${top?'#3B82F6':'var(--accent)'};"></div></div>
      </div></td>
      ${removeCell}</tr>`;
  }).join('');

  const addForm = editable ? `<div class="sc-add-form" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;">
      <select class="sc-add-item table-select" style="min-width:200px;">${scItemOptions(lang)}</select>
      <input class="sc-add-qty table-input" type="number" min="1" value="1" style="width:70px;" title="${scT('hQty')}">
      <input class="sc-add-cost table-input" type="number" min="0" placeholder="${scT('hCost')}" style="width:100px;">
      <button class="btn-reset" style="background:var(--accent);color:#000;font-weight:bold;padding:6px 12px;" onclick="scAddShopItem('${scope}','${shop.id}',this)">${scT('addItem')}</button>
    </div>` : '';

  return `<div class="panel sc-shop" style="padding:16px;margin-bottom:18px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">${head}</div>
    <div class="table-container"><table>
      <thead><tr><th></th>
      ${scTh(scope,shop,'name',scT('hItem'))}
      ${scTh(scope,shop,'qty',scT('hQty'),'center')}
      ${scTh(scope,shop,'cost',scT('hCost'),'right')}
      ${scTh(scope,shop,'gem',scT('hGem'),'right')}
      ${scTh(scope,shop,'ratio',scT('hRatio'))}
      ${editable?'<th></th>':''}</tr></thead>
      <tbody>${body||''}</tbody></table></div>
    ${addForm}</div>`;
}
function scGetShop(scope,id){ return (scope==='event'?SC_EVENTS:SC_CLASSIC).find(s=>s.id===id); }
function scSaveScope(scope){ scope==='event'?scSaveEvents():scSaveClassic(); }
function scRenderScope(scope){ scope==='event'?scRenderEvents():scRenderClassic(); }

// ---------- tri d'affichage ----------
window.scSort=function(scope,id,col){
  const st=SC_SORT[id];
  if(st&&st.col===col){ st.dir=-st.dir; }     // re-clic même colonne → inverse
  else { SC_SORT[id]={col,dir:1}; }            // nouvelle colonne → croissant
  scRenderScope(scope);
};
window.scResetSort=function(scope,id){ delete SC_SORT[id]; scRenderScope(scope); };

// ---------- édition / ajout / retrait de lignes ----------
window.scAddShopItem=function(scope,id,btn){
  const f=btn.closest('.sc-add-form'); const itemId=f.querySelector('.sc-add-item').value;
  const qty=parseInt(f.querySelector('.sc-add-qty').value)||1; const cost=parseFloat(f.querySelector('.sc-add-cost').value)||0;
  if(!itemId) return;
  const shop=scGetShop(scope,id); if(!shop) return;
  shop.items.push({itemId,qty:Math.max(1,qty),cost:Math.max(0,cost)});
  scSaveScope(scope); scRenderScope(scope);
};
window.scRemoveShopItem=function(scope,id,index){ const shop=scGetShop(scope,id); if(!shop)return; shop.items.splice(index,1); scSaveScope(scope); scRenderScope(scope); };
window.scEditQty=function(scope,id,index,val){ const s=scGetShop(scope,id); if(!s||!s.items[index])return; s.items[index].qty=Math.max(1,parseInt(val)||1); scSaveScope(scope); scRenderScope(scope); };
window.scEditCost=function(scope,id,index,val){ const s=scGetShop(scope,id); if(!s||!s.items[index])return; let n=parseFloat(String(val).replace(',','.')); s.items[index].cost=Math.max(0,isNaN(n)?0:n); scSaveScope(scope); scRenderScope(scope); };

function scRenderClassic(){
  const el=document.getElementById('panel-classic'); if(!el) return;
  el.innerHTML = SC_CLASSIC.map(s=>scRenderShopCard('classic',s)).join('') || `<p style="color:var(--text-muted);text-align:center;padding:30px;">—</p>`;
}
function scRenderEvents(){
  const el=document.getElementById('panel-event'); if(!el) return;
  el.innerHTML = SC_EVENTS.length
    ? SC_EVENTS.map(s=>scRenderShopCard('event',s)).join('')
    : `<p style="color:var(--text-muted);text-align:center;padding:30px;">${scT('noEvent')}</p>`;
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
  await scLoadEvents();
  scApplyTranslations();
  scRenderCatFilter(); scRenderItems();
  scRenderClassic(); scRenderEvents();
  const s=document.getElementById('item-search'); if(s) s.addEventListener('input',scRenderItems);
  const c=document.getElementById('item-cat-filter'); if(c) c.addEventListener('change',scRenderItems);
  window.addEventListener('langChanged',()=>{ scApplyTranslations(); scRenderCatFilter(); scRenderItems(); scRenderClassic(); scRenderEvents(); });
})();
