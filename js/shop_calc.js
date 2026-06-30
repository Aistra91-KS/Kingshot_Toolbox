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
    noEvent:"Aucune boutique d'événement.", best:"Top",
    hRestant:"Restant", hMaxFin:"Max fin", hObt:"Obtenable", hCostObt:"Coût obt.", endsIn:"Fin dans", days:"j", ended:"Terminé", resDefault:"Ressources", daily:"Réinit. quotidienne (00h UTC)", stock:"Stock (sans réinit.)",
    tipRatio:"Valeur en gemmes ÷ coût. Plus c'est élevé, meilleure est l'affaire.",
    tipGem:"Valeur de référence de l'objet en gemmes (modifiable dans l'onglet « Data Item »).",
    tipRestant:"Quantité encore disponible à l'achat dans cette boutique.",
    tipMaxFin:"Quantité maximale atteignable d'ici la fin de l'événement avec ta monnaie.",
    tipObt:"Ce que tu peux réellement obtenir compte tenu de ta monnaie d'événement.",
    tipCostObt:"Monnaie d'événement nécessaire pour la quantité « Obtenable ».",
    planDetails:"⚙️ Planification / Détails", del:"Supprimer",
    confirmDel:"Supprimer cet objet de la boutique ?",
    resetEvent:"Réinitialiser",
    resetEventTip:"Revenir à la version d'origine de la boutique (annule tes modifications)",
    confirmResetEvent:"Réinitialiser cette boutique à sa version d'origine ? Tes modifications (quantités, coûts, suppressions) seront perdues."
  },
  EN: {
    scTitle:"Shop Calculation", scDesc:"Compare in-shop cost to gem value to spot the best deals.",
    tabData:"Data Item", tabClassic:"Classic Shop", tabEvent:"Event Shop", tabChest:"Chests",
    colName:"Name", colCat:"Category", colGem:"Value (gems)", resetItems:"Reset values",
    allCats:"All categories", confirmReset:"Reset all gem values to defaults?",
    soon:"Coming soon", soonDesc:"This tab is coming in a next step.", count:"items",
    hItem:"Item", hQty:"Qty", hCost:"Cost", hGem:"Gem value", hRatio:"Ratio", hAct:"",
    addItem:"+ Add", chooseItem:"— Item —", resetSort:"⟲ Entry order",
    noEvent:"No event shop.", best:"Top",
    hRestant:"Remaining", hMaxFin:"Max by end", hObt:"Obtainable", hCostObt:"Obt. cost", endsIn:"Ends in", days:"d", ended:"Ended", resDefault:"Resources", daily:"Daily reset (00:00 UTC)", stock:"Stock (no reset)",
    tipRatio:"Gem value ÷ cost. The higher it is, the better the deal.",
    tipGem:"Reference gem value of the item (editable in the “Data Item” tab).",
    tipRestant:"Quantity still available to buy in this shop.",
    tipMaxFin:"Max quantity reachable by the event's end with your currency.",
    tipObt:"What you can actually obtain given your event currency.",
    tipCostObt:"Event currency needed for the “Obtainable” quantity.",
    planDetails:"⚙️ Planning / Details", del:"Remove",
    confirmDel:"Remove this item from the shop?",
    resetEvent:"Reset",
    resetEventTip:"Restore the shop's original version (discards your changes)",
    confirmResetEvent:"Reset this shop to its original version? Your changes (quantities, costs, deletions) will be lost."
  }
};
function scLang(){ return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k){ return (i18nShop[scLang()]||i18nShop.FR)[k]; }
function scTip(k){ return window.HelpSystem ? HelpSystem.tip({FR:i18nShop.FR[k], EN:i18nShop.EN[k]}) : ''; }

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
function scResName(shop,lang){ const r=shop.resourceName; if(r&&typeof r==='object') return r[lang]||r.EN||r.FR||scT('resDefault'); return r||scT('resDefault'); }
// Nombre de resets 00h UTC d'ici la fin de l'événement (aujourd'hui inclus).
function scDaysLeft(endsAt){
  if(!endsAt) return 0;
  const ends=new Date(endsAt).getTime(); if(isNaN(ends)) return 0;
  const now=Date.now(); if(ends<=now) return 0;
  const e=new Date(ends-1), n=new Date(now);
  const lastDay=Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate());
  const today=Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate());
  return Math.max(1, Math.round((lastDay-today)/86400000)+1);
}

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
  // Le FICHIER est la liste de référence : on réapplique les éditions user par id,
  // et on ignore les boutiques absentes du fichier (anciennes boutiques de test = fantômes).
  const savedById={}; if(Array.isArray(saved)) saved.forEach(s=>{ if(s&&s.id) savedById[s.id]=s; });
  SC_EVENTS = (SC_EVENTS_DEF||[]).map(d=> savedById[d.id] ? savedById[d.id] : JSON.parse(JSON.stringify(d)) );
  // Rafraîchit les champs ADMIN depuis le fichier (jamais masqués par un vieux localStorage).
  SC_EVENTS.forEach(s=>{
    const def=SC_EVENTS_DEF.find(d=>d.id===s.id); if(!def) return;
    s.endsAt=def.endsAt; s.resourceName=def.resourceName;
    (s.items||[]).forEach((si,i)=>{ const di=(def.items||[])[i], ok=di&&di.itemId===si.itemId; si.dailyReset=!!(ok&&di.dailyReset); si.qtyMax = ok?di.qtyMax:undefined; });
  });
  // Nettoie les fantômes du localStorage (seulement si le fichier a bien chargé, pour ne rien effacer sur une erreur réseau).
  if(SC_EVENTS_DEF.length) scSaveEvents();
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
  const resources=Math.max(0,Number(shop.resources)||0);
  const jours=scDaysLeft(shop.endsAt);
  const rows=(shop.items||[]).map((si,i)=>{
    const it=scItemById(si.itemId);
    const qty=Math.max(1,Number(si.qty)||1), cost=Math.max(0,Number(si.cost)||0);
    const gem=scGem(si.itemId)*qty;
    const qtyMax=Math.max(0,Number(si.qtyMax)||0);
    const restant=(si.restant==null||si.restant==='')?qtyMax:Math.max(0,Number(si.restant)||0);
    const daily=!!si.dailyReset;
    const maxfin = daily ? restant*jours : restant;
    const obtenable = cost>0 ? Math.min(maxfin, Math.floor(resources/cost)) : 0;
    const coutobt = obtenable*cost;
    return { i, si, it, qty, cost, gem, ratio: cost>0?gem/cost:0, restant, daily, maxfin, obtenable, coutobt, nameTxt: it?scName(it,lang):'' };
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
  return { rows: display, maxRatio, jours };
}

function scItemDatalist(lang){
  return SC_ITEMS.slice().sort((a,b)=>scName(a,lang).localeCompare(scName(b,lang)))
    .map(it=>`<option value="${scEscAttr(scName(it,lang))}"></option>`).join('');
}
function scTh(scope,shop,col,label,align){
  const st=SC_SORT[shop.id];
  const arrow = (st&&st.col===col) ? (st.dir>0?' ▲':' ▼') : '';
  const a = align?`text-align:${align};`:'';
  return `<th style="cursor:pointer;user-select:none;${a}" onclick="scSort('${scope}','${shop.id}','${col}')">${label}${arrow}</th>`;
}
function scRenderShopCard(scope,shop){
  const lang=scLang();
  const editable = (scope==='event'); // Classique = lecture seule ; Événement = éditable + planification
  const planning = (scope==='event');
  const { rows, maxRatio, jours } = scComputeRows(shop);
  const nm=scShopName(shop,lang);
  const st=SC_SORT[shop.id];
  const resetBtn = st ? `<button class="btn-reset" style="margin-left:auto;padding:4px 10px;font-size:12px;" onclick="scResetSort('${scope}','${shop.id}')">${scT('resetSort')}</button>` : '';

  let head = `<strong style="font-size:16px;color:var(--accent);">${scEscAttr(nm)}</strong>`;
  if(planning){
    const endTxt = jours>0 ? `${scT('endsIn')} : ${jours} ${scT('days')}` : scT('ended');
    head += `<span style="font-size:12px;color:var(--text-muted);background:var(--control-bg);padding:3px 8px;border-radius:8px;">${endTxt}</span>`;
    head += `<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-light);">${scEscAttr(scResName(shop,lang))} : <input type="number" min="0" class="table-input" style="width:90px;" value="${Math.max(0,Number(shop.resources)||0)}" onchange="scEditResources('${scope}','${shop.id}',this.value)"></label>`;
    if ((SC_EVENTS_DEF||[]).some(d=>d.id===shop.id)) {
      head += `<button class="btn-reset" style="padding:4px 10px;font-size:12px;" onclick="scResetEvent('${shop.id}')" title="${scEscAttr(scT('resetEventTip'))}">↺ ${scT('resetEvent')}</button>`;
    }
  }
  head += resetBtn;

  // ---------- Shop Classique : grille de cartes (lecture seule) ----------
  if(scope==='classic'){
    const cards = rows.map(r=>{
      const cat=r.it?r.it.category:'Other', color=scCatColor(cat), img=scImg(r.it);
      const nameTxt=r.it?scName(r.it,lang):'??'; const top=r.isTop;
      return `<div class="shop-item-card${top?' is-top':''}" style="--cat:${color};">
        <div class="sic-visual" style="background:${color}14;">
          <div class="sic-img" style="background-image:url('img/Item/${img}.png');"></div>
          <span class="sic-qty">×${r.qty}</span>
          ${top?`<span class="sic-top">${scT('best')}</span>`:''}
        </div>
        <div class="sic-name">${scEscAttr(nameTxt)}</div>
        <div class="sic-cost"><strong>${r.cost.toLocaleString()}</strong> <span class="sic-res">${scEscAttr(scResName(shop,lang))}</span></div>
        <div class="sic-stats">
          <span class="sic-gem">💎 ${r.gem.toLocaleString()}</span>
          <span class="sic-ratio">×${r.ratio.toFixed(2)}</span>
        </div>
      </div>`;
    }).join('');
    return `<div class="panel sc-shop" style="padding:16px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">${head}</div>
      <div class="shop-card-grid">${cards||'<p style="color:var(--text-muted);">—</p>'}</div>
    </div>`;
  }

  const body = rows.map(r=>{
    const cat=r.it?r.it.category:'Other', color=scCatColor(cat), img=scImg(r.it);
    const nameTxt=r.it?scName(r.it,lang):'??';
    const top=r.isTop;
    const qtyCell = editable
      ? `<td style="text-align:center;"><input type="number" min="1" step="1" class="table-input" style="width:58px;text-align:center;" value="${r.qty}" onchange="scEditQty('${scope}','${shop.id}',${r.i},this.value)"></td>`
      : `<td style="text-align:center;">${r.qty}</td>`;
    const costCell = editable
      ? `<td style="text-align:right;"><input type="number" min="0" step="1" class="table-input" style="width:84px;text-align:right;" value="${r.cost}" onchange="scEditCost('${scope}','${shop.id}',${r.i},this.value)"></td>`
      : `<td style="text-align:right;">${r.cost.toLocaleString()}</td>`;
    let planCells='';
    if(planning){
      const marker = r.daily
        ? `<span title="${scT('daily')}" style="color:var(--success);">↻</span>`
        : `<span title="${scT('stock')}" style="color:var(--text-muted);">🔒</span>`;
      planCells = `
      <td style="text-align:center;"><input type="number" min="0" step="1" class="table-input" style="width:64px;text-align:center;" value="${r.restant}" onchange="scEditRestant('${scope}','${shop.id}',${r.i},this.value)"></td>
      <td style="text-align:center;">${marker}</td>
      <td style="text-align:center;color:var(--text-muted);">${r.maxfin.toLocaleString()}</td>
      <td style="text-align:center;font-weight:bold;color:${r.obtenable>0?'var(--success)':'var(--text-muted)'};">${r.obtenable.toLocaleString()}</td>
      <td style="text-align:right;">${r.coutobt.toLocaleString()}</td>`;
    }
    const ratioCell = planning
      ? `<td style="text-align:center;font-weight:bold;color:${top?'#3B82F6':'var(--text-light)'};white-space:nowrap;">×${r.ratio.toFixed(2)}</td>`
      : `<td style="min-width:130px;"><div style="display:flex;align-items:center;gap:6px;"><span style="font-weight:bold;color:${top?'#3B82F6':'var(--text-light)'};white-space:nowrap;">×${r.ratio.toFixed(2)}</span><div style="flex:1;height:6px;background:var(--control-bg);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${maxRatio>0?(r.ratio/maxRatio*100):0}%;background:${top?'#3B82F6':'var(--accent)'};"></div></div></div></td>`;
    const removeCell = editable
      ? `<td style="text-align:center;"><button class="btn-reset" style="padding:2px 8px;font-size:13px;" onclick="scRemoveShopItem('${scope}','${shop.id}',${r.i})">✕</button></td>`
      : '';
    return `<tr style="border-left:4px solid ${top?'#3B82F6':color};background:${color}${top?'26':'14'};${top?'box-shadow: inset 0 0 0 1px #3B82F64d;':''}">
      <td style="width:42px;"><div class="sc-item-img" style="width:30px;height:30px;background-image:url('img/Item/${img}.png');background-color:${color}33;"></div></td>
      <td>${scEscAttr(nameTxt)} ${top?`<span style="background:#3B82F6;color:#fff;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:8px;">${scT('best')}</span>`:''}</td>
      ${qtyCell}
      ${costCell}
      ${planCells}
      <td style="text-align:right;">${r.gem.toLocaleString()}</td>
      ${ratioCell}
      ${removeCell}</tr>`;
  }).join('');

  const addForm = editable ? `<div class="sc-add-form" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;">
      <input class="sc-add-item table-input" list="sc-dl-${shop.id}" placeholder="${scT('chooseItem')}" autocomplete="off" style="min-width:200px;">
      <datalist id="sc-dl-${shop.id}">${scItemDatalist(lang)}</datalist>
      <input class="sc-add-qty table-input" type="number" min="1" value="1" style="width:70px;" title="${scT('hQty')}">
      <input class="sc-add-cost table-input" type="number" min="0" placeholder="${scT('hCost')}" style="width:100px;">
      <input class="sc-add-restant table-input" type="number" min="0" value="0" placeholder="${scT('hRestant')}" title="${scT('hRestant')}" style="width:90px;">
      <label style="display:flex;align-items:center;gap:4px;font-size:13px;color:var(--text-light);white-space:nowrap;"><input class="sc-add-daily" type="checkbox"> ${scT('daily')}</label>
      <button class="btn-reset" style="background:var(--accent);color:#000;font-weight:bold;padding:6px 12px;" onclick="scAddShopItem('${scope}','${shop.id}',this)">${scT('addItem')}</button>
    </div>` : '';

  const planHeads = planning ? `
      ${scTh(scope,shop,'restant',scT('hRestant')+scTip('tipRestant'),'center')}
      <th></th>
      ${scTh(scope,shop,'maxfin',scT('hMaxFin')+scTip('tipMaxFin'),'center')}
      ${scTh(scope,shop,'obtenable',scT('hObt')+scTip('tipObt'),'center')}
      ${scTh(scope,shop,'coutobt',scT('hCostObt')+scTip('tipCostObt'),'right')}` : '';

  if(scope==='event'){
    const cards = rows.map(r=>{
      const cat=r.it?r.it.category:'Other', color=scCatColor(cat), img=scImg(r.it);
      const nameTxt=r.it?scName(r.it,lang):'??'; const top=r.isTop;
      const resetTxt = r.daily ? `↻ ${scT('daily')}` : `🔒 ${scT('stock')}`;
      return `<div class="shop-item-card event-card${top?' is-top':''}" style="--cat:${color};">
        <div class="sic-visual" style="background:${color}14;">
          <div class="sic-img" style="background-image:url('img/Item/${img}.png');"></div>
          <span class="sic-reset" title="${scEscAttr(r.daily?scT('daily'):scT('stock'))}">${r.daily?'↻':'🔒'}</span>
          ${top?`<span class="sic-top">${scT('best')}</span>`:''}
        </div>
        <div class="sic-name">${scEscAttr(nameTxt)}</div>
        <div class="sic-fields">
          <label class="sic-f"><span>${scT('hQty')}</span><input type="number" min="1" value="${r.qty}" onchange="scEditQty('${scope}','${shop.id}',${r.i},this.value)"></label>
          <label class="sic-f"><span>${scT('hCost')}</span><input type="number" min="0" value="${r.cost}" onchange="scEditCost('${scope}','${shop.id}',${r.i},this.value)"></label>
        </div>
        <div class="sic-stats">
          <span class="sic-gem">💎 ${r.gem.toLocaleString()}</span>
          <span class="sic-ratio" style="color:${top?'#3B82F6':'var(--text-light)'};">×${r.ratio.toFixed(2)}${scTip('tipRatio')}</span>
        </div>
        <details class="sic-planning">
          <summary>${scT('planDetails')}</summary>
          <div class="sic-plan-body">
            <label class="sic-f"><span>${scT('hRestant')}${scTip('tipRestant')}</span><input type="number" min="0" value="${r.restant}" onchange="scEditRestant('${scope}','${shop.id}',${r.i},this.value)"></label>
            <div class="sic-plan-row"><span>${resetTxt}</span></div>
            <div class="sic-plan-row"><span>${scT('hMaxFin')}${scTip('tipMaxFin')}</span><b>${r.maxfin.toLocaleString()}</b></div>
            <div class="sic-plan-row"><span>${scT('hObt')}${scTip('tipObt')}</span><b style="color:${r.obtenable>0?'var(--success)':'var(--text-muted)'};">${r.obtenable.toLocaleString()}</b></div>
            <div class="sic-plan-row"><span>${scT('hCostObt')}${scTip('tipCostObt')}</span><b>${r.coutobt.toLocaleString()}</b></div>
            <button class="sic-del" onclick="scRemoveShopItem('${scope}','${shop.id}',${r.i})">✕ ${scT('del')}</button>
          </div>
        </details>
      </div>`;
    }).join('');
    return `<div class="panel sc-shop" style="padding:16px;margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">${head}</div>
      <div class="shop-card-grid event-grid">${cards||'<p style="color:var(--text-muted);">—</p>'}</div>
      ${addForm}
    </div>`;
  }

  return `<div class="panel sc-shop" style="padding:16px;margin-bottom:18px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">${head}</div>
    <div class="table-container"><table>
      <thead><tr><th></th>
      ${scTh(scope,shop,'name',scT('hItem'))}
      ${scTh(scope,shop,'qty',scT('hQty'),'center')}
      ${scTh(scope,shop,'cost',scT('hCost'),'right')}
      ${planHeads}
      ${scTh(scope,shop,'gem',scT('hGem')+scTip('tipGem'),'right')}
      ${scTh(scope,shop,'ratio',scT('hRatio')+scTip('tipRatio'),planning?'center':'')}
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
  const f=btn.closest('.sc-add-form');
  const lang=scLang();
  // Résolution du texte saisi -> itemId (exact insensible casse, sinon unique sous-chaîne).
  const lc=(f.querySelector('.sc-add-item').value||'').trim().toLowerCase();
  let match=SC_ITEMS.find(it=>scName(it,lang).toLowerCase()===lc);
  if(!match && lc){ const subs=SC_ITEMS.filter(it=>scName(it,lang).toLowerCase().includes(lc)); if(subs.length===1) match=subs[0]; }
  if(!match) return;
  const qty=parseInt(f.querySelector('.sc-add-qty').value)||1; const cost=parseFloat(f.querySelector('.sc-add-cost').value)||0;
  const rEl=f.querySelector('.sc-add-restant'); const restant=rEl?Math.max(0,parseInt(rEl.value)||0):0;
  const dEl=f.querySelector('.sc-add-daily'); const dailyReset=dEl?!!dEl.checked:false;
  const shop=scGetShop(scope,id); if(!shop) return;
  shop.items.push({itemId:match.id,qty:Math.max(1,qty),cost:Math.max(0,cost),restant,dailyReset});
  scSaveScope(scope); scRenderScope(scope);
};
window.scRemoveShopItem=function(scope,id,index){ const shop=scGetShop(scope,id); if(!shop||!shop.items[index])return; showAppConfirm(scT('confirmDel'),()=>{ shop.items.splice(index,1); scSaveScope(scope); scRenderScope(scope); }); };
window.scEditQty=function(scope,id,index,val){ const s=scGetShop(scope,id); if(!s||!s.items[index])return; s.items[index].qty=Math.max(1,parseInt(val)||1); scSaveScope(scope); scRenderScope(scope); };
window.scEditCost=function(scope,id,index,val){ const s=scGetShop(scope,id); if(!s||!s.items[index])return; let n=parseFloat(String(val).replace(',','.')); s.items[index].cost=Math.max(0,isNaN(n)?0:n); scSaveScope(scope); scRenderScope(scope); };
window.scEditRestant=function(scope,id,index,val){ const s=scGetShop(scope,id); if(!s||!s.items[index])return; s.items[index].restant=Math.max(0,parseInt(val)||0); scSaveScope(scope); scRenderScope(scope); };
window.scEditResources=function(scope,id,val){ const s=scGetShop(scope,id); if(!s)return; let n=parseFloat(String(val).replace(',','.')); s.resources=Math.max(0,isNaN(n)?0:n); scSaveScope(scope); scRenderScope(scope); };
window.scResetEvent=function(id){ const def=(SC_EVENTS_DEF||[]).find(d=>d.id===id); if(!def)return; showAppConfirm(scT('confirmResetEvent'),()=>{ const idx=SC_EVENTS.findIndex(s=>s.id===id); const fresh=JSON.parse(JSON.stringify(def)); if(idx>=0) SC_EVENTS[idx]=fresh; else SC_EVENTS.push(fresh); scSaveEvents(); scRenderEvents(); }); };

function scRenderClassic(){
  const el=document.getElementById('panel-classic'); if(!el) return;
  el.innerHTML = SC_CLASSIC.map(s=>scRenderShopCard('classic',s)).join('') || `<p style="color:var(--text-muted);text-align:center;padding:30px;">—</p>`;
}
function scRenderEvents(){
  const el=document.getElementById('panel-event'); if(!el) return;
  // Tri d'affichage : fin la plus proche d'abord, événements terminés à la fin.
  const ordered = SC_EVENTS.slice().sort((a,b)=>{
    const da=scDaysLeft(a.endsAt), db=scDaysLeft(b.endsAt);
    const ea=da<=0, eb=db<=0;
    if(ea!==eb) return ea?1:-1;
    return da-db;
  });
  el.innerHTML = ordered.length
    ? ordered.map(s=>scRenderShopCard('event',s)).join('')
    : `<p style="color:var(--text-muted);text-align:center;padding:30px;">${scT('noEvent')}</p>`;
}

// ---------- onglets / i18n / démarrage ----------
window.scTab=function(name){
  document.querySelectorAll('.shop-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  document.querySelectorAll('.shop-panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+name));
};
function scApplyTranslations(){ if(window.GlobalLang) GlobalLang.applyI18n(i18nShop[scLang()]); }

// Event Shop : ouvrir/fermer le « Détails » d'une carte synchronise toute la ligne visible.
function scBindRowSync() {
  document.addEventListener('click', (e) => {
    const summary = e.target.closest('.event-card .sic-planning > summary');
    if (!summary) return;
    const det = summary.parentElement;             // le <details>
    const card = det.closest('.shop-item-card');
    const grid = card && card.parentElement;        // .shop-card-grid.event-grid
    if (!grid) return;
    requestAnimationFrame(() => {                    // après le toggle natif
      const top = card.offsetTop;
      const open = det.open;
      grid.querySelectorAll('.shop-item-card').forEach(c => {
        if (c === card) return;
        if (Math.abs(c.offsetTop - top) < 2) {       // même ligne = même haut
          const d = c.querySelector('.sic-planning');
          if (d && d.open !== open) d.open = open;    // pas de click -> pas de cascade
        }
      });
    });
  });
}

(async function(){
  await scLoadItems();
  await scLoadClassic();
  await scLoadEvents();
  scApplyTranslations();
  scRenderCatFilter(); scRenderItems();
  scRenderClassic(); scRenderEvents();
  const s=document.getElementById('item-search'); if(s) s.addEventListener('input',scRenderItems);
  const c=document.getElementById('item-cat-filter'); if(c) c.addEventListener('change',scRenderItems);
  if (window.HelpSystem) HelpSystem.init({
    id:'shop', banner:true,
    title:{FR:'Shop Calculation — Aide', EN:'Shop Calculation — Help'},
    summary:{FR:"Compare le coût en boutique de chaque objet à sa valeur en gemmes pour repérer les meilleures affaires : plus le ratio est élevé, plus l'achat est rentable.",
             EN:"Compares each shop item's cost to its gem value to spot the best deals: the higher the ratio, the better the buy."},
    steps:{
      FR:["Choisis un onglet : Shop Classique (boutiques permanentes) ou Shop d'Événement (offres limitées, avec stock et monnaie d'événement).",
          "Chaque objet affiche son coût, sa valeur en gemmes et le ratio (valeur ÷ coût). Le meilleur ratio de chaque boutique est marqué « Top ».",
          "La valeur en gemmes vient de l'onglet « Data Item » : modifie-la là-bas et toutes les boutiques se recalculent automatiquement.",
          "Sur le Shop d'Événement, renseigne ta monnaie et le stock restant pour voir ce qui est réellement obtenable d'ici la fin.",
          "Dans le Shop d'Événement, les cartes n'affichent que l'essentiel par défaut. Clique sur « Planification / Détails » sur une carte pour gérer son stock restant et voir ce que tu peux réellement obtenir.",
          "Survole les icônes « i » des colonnes pour le détail de chaque calcul."],
      EN:["Pick a tab: Classic Shop (permanent shops) or Event Shop (limited offers, with stock and event currency).",
          "Each item shows its cost, gem value and ratio (value ÷ cost). The best ratio in each shop is tagged “Top”.",
          "Gem values come from the “Data Item” tab: edit them there and every shop recalculates automatically.",
          "In the Event Shop, enter your currency and remaining stock to see what's actually obtainable by the end.",
          "In the Event Shop, cards show only the essentials by default. Click on “Planning / Details” on a card to manage its remaining stock and see what you can actually obtain.",
          "Hover the “i” icons in the column headers for the detail of each calculation."]
    },
    links:[{label:{FR:'Ouvrir l\'onglet « Data Item »', EN:'Open the “Data Item” tab'}, action:()=>{ if(typeof scTab==='function') scTab('data'); }}]
  });

  scBindRowSync();

  window.addEventListener('langChanged',()=>{ scApplyTranslations(); scRenderCatFilter(); scRenderItems(); scRenderClassic(); scRenderEvents(); });
})();
