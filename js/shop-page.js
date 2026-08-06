// ============================================================
//  PAGE BOUTIQUE (shop/<slug>.html)
//  Lit window.SHOP_SLUG, retrouve la boutique dans les JSON chargés par shop-core.js
//  et remplit les conteneurs de la page. Même principe que db-pets.js / db-masters.js.
//
//  Le contenu de la boutique est UN tableau, une ligne par objet : c'est la forme qui
//  fait tenir le plus d'information dans le moins de place. Les valeurs modifiables
//  (quantité, coût, stock restant) ne deviennent des champs de saisie que dans le
//  « mode édition », derrière le bouton crayon — le reste du temps la page se lit.
// ============================================================

let SP = null;                      // { shop, kind }
let SP_EDIT = false;                // mode édition (volontairement non persisté)
const SP_SORT = {};                 // tri d'affichage (jamais l'ordre des données)

const SP_ICON_PENCIL = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const SP_ICON_CHECK  = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

function spEl(id){ return document.getElementById(id); }
function spShop(){ return SP && SP.shop; }
function spIsEvent(){ return SP && SP.kind==='event'; }
function spIsChest(){ return SP && SP.kind==='chest'; }
function spEditable(){ return spIsEvent(); }   // seules les boutiques d'événement s'ajustent

// ---------- en-tête ----------
// Le <h1> et l'intro restent tels quels dans le HTML (lisibles sans JS et jamais reconstruits,
// pour que le bouton d'aide accroché juste après survive à un changement de langue).
function spRenderHero(){
  const lang=scLang(), shop=spShop(); if(!shop) return;
  const nItems=(shop.items||[]).length;

  const thumb=spEl('sp-thumb');
  if(thumb && !thumb.firstElementChild) thumb.innerHTML=scThumbHtml(shop, SP.kind);

  let facts=`<span class="sx-fact"><b>${nItems}</b> ${scT(spIsChest()?'nChoices':'nItems')}</span>`;
  if(!spIsChest()){
    facts=`<span class="sx-fact">${scT('currency')} : <b>${scEscAttr(scResName(shop,lang))}</b></span>`+facts;
  }
  if(spIsEvent() && shop.endsAt){
    if(scIsEnded(shop)){
      facts+=`<span class="sx-fact ended"><b>${scT('ended')}</b></span>`;
    } else {
      facts+=`<span class="sx-fact ${scIsUrgent(shop)?'urgent':'live'}">${scT('endsIn')} : <b data-ends-at="${scEscAttr(shop.endsAt)}">${scTimeLeftTxt(shop.endsAt)}</b></span>`;
    }
  } else if(!spIsChest()){
    facts+=`<span class="sx-fact">${scT('permanent')}</span>`;
  }
  const host=spEl('sp-facts'); if(host) host.innerHTML=facts;

  // Bandeau d'archive : l'événement est fini, mais la page reste consultable et comparable.
  const arch=spEl('sp-archive');
  if(arch) arch.innerHTML = (spIsEvent() && scIsEnded(shop))
    ? `<div class="sx-archive"><span>🗓️</span><span>${scT('archiveNote')}</span></div>` : '';
}

// ---------- navigation entre boutiques de la même famille ----------
function spRenderSwitch(){
  const host=spEl('sp-switch'); if(!host||!SP) return;
  const lang=scLang();
  host.innerHTML=scAllShops().filter(e=>e.kind===SP.kind).map(({shop})=>{
    const nm=scEscAttr(scShopName(shop,lang));
    const ended=scIsEnded(shop)?' style="opacity:.6"':'';
    return shop.slug===SP.shop.slug
      ? `<span class="db-switch-item active">${nm}</span>`
      : `<a class="db-switch-item" href="${scShopHref(shop)}"${ended}>${nm}</a>`;
  }).join('');
}

// ---------- barre d'action : monnaie + crayon ----------
function spRenderActions(){
  const host=spEl('sp-actions'); if(!host) return;
  const lang=scLang(), shop=spShop();
  let html='';
  if(spIsEvent()){
    html+=`<label class="sx-fact sx-cur-field">${scEscAttr(scResName(shop,lang))} :
      <input type="number" min="0" inputmode="numeric" value="${Math.max(0,Number(shop.resources)||0)}" onchange="spEditResources(this.value)"></label>`;
  }
  if(spEditable()){
    html+=`<button type="button" class="sx-btn sx-edit-toggle${SP_EDIT?' on':''}" onclick="spToggleEdit()">
        ${SP_EDIT?SP_ICON_CHECK:SP_ICON_PENCIL}<span>${SP_EDIT?scT('editDone'):scT('edit')}</span></button>`;
    if(SP_EDIT && (SC_EVENTS_DEF||[]).some(d=>d.id===shop.id)){
      html+=`<button type="button" class="sx-btn" onclick="spResetShop()" title="${scEscAttr(scT('resetShopTip'))}">↺ ${scT('resetShop')}</button>`;
    }
  }
  if(SP_EDIT) html+=`<span class="sx-edit-hint">${scT('editHint')}</span>`;
  host.innerHTML=html;
}

// ---------- podium des meilleures affaires ----------
function spRenderPodium(){
  const host=spEl('sp-podium'); if(!host) return;
  const rows = spIsChest() ? scComputeChest(spShop()).rows : scComputeRows(spShop()).all.slice().sort((a,b)=>b.ratio-a.ratio);
  const top = rows.filter(r=> spIsChest() ? r.gem>0 : r.ratio>0).slice(0,3);
  if(!top.length){ host.innerHTML=''; return; }
  host.innerHTML=top.map((r,i)=>`
    <div class="sx-pod" style="--cat:${scCatColor(r.cat)};">
      <span class="sx-pod-rank">${i+1}</span>
      <span class="sx-pod-img" style="background-image:url('img/Item/${r.img}.webp');"></span>
      <span class="sx-pod-txt">
        <span class="sx-pod-name">${scEscAttr(r.nameTxt)}</span>
        <span class="sx-pod-val">${ spIsChest()
          ? `💎 <b>${r.gem.toLocaleString()}</b>`
          : `<b>×${r.ratio.toFixed(2)}</b> · 💎 ${r.gem.toLocaleString()}` }</span>
      </span>
    </div>`).join('');
}

// ---------- tableau ----------
function spTh(col,label,align,extra){
  const st=SP_SORT.cur;
  const arrow=(st&&st.col===col)?(st.dir>0?' ▲':' ▼'):'';
  return `<th class="${align||''}${extra?' '+extra:''}" onclick="spSort('${col}')">${label}${arrow}</th>`;
}
function spNum(n){ return Number(n||0).toLocaleString(); }

function spRenderTable(){
  const host=spEl('sp-table'); if(!host) return;
  const shop=spShop();

  // ---- coffre : pas de coût, on compare les lots entre eux ----
  if(spIsChest()){
    const { rows, best } = scComputeChest(shop);
    host.innerHTML=`<div class="table-container"><table class="db-table sx-table"><thead><tr>
        <th class="c-img"></th><th>${scT('hItem')}</th>
        <th class="ctr">${scT('hQty')}</th><th class="rgt">${scT('hGem')}</th><th>${scT('hShare')}</th>
      </tr></thead><tbody>${rows.map(r=>`
        <tr class="${r.isTop?'is-top':''}" style="--cat:${scCatColor(r.cat)};">
          <td class="c-img"><span class="sx-ico" style="background-image:url('img/Item/${r.img}.webp');"></span></td>
          <td class="c-name">${scEscAttr(r.nameTxt)}${r.isTop?`<span class="sx-tag">${scT('bestPick')}</span>`:''}</td>
          <td class="ctr">${spNum(r.qty)}</td>
          <td class="rgt gem">${spNum(r.gem)}</td>
          <td class="c-bar"><span class="sx-bar"><span style="width:${best>0?(r.gem/best*100):0}%"></span></span></td>
        </tr>`).join('')}</tbody></table></div>`;
    return;
  }

  const { rows, maxRatio } = scComputeRows(shop, { sort: SP_SORT.cur });
  const planning=spIsEvent();
  const edit=SP_EDIT;

  const heads = `<tr>
      <th class="c-img"></th>
      ${spTh('name',scT('hItem'),'','srt')}
      ${spTh('qty',scT('hQty'),'ctr','srt')}
      ${spTh('cost',scT('hCost'),'rgt','srt')}
      ${spTh('gem',scT('hGem')+scTip('tipGem'),'rgt','srt')}
      ${spTh('ratio',scT('hRatio')+scTip('tipRatio'),'','srt')}
      ${planning?`
      ${spTh('restant',scT('hRestant')+scTip('tipRestant'),'ctr','srt sep')}
      ${spTh('maxfin',scT('hMaxFin')+scTip('tipMaxFin'),'ctr','srt')}
      ${spTh('obtenable',scT('hObt')+scTip('tipObt'),'ctr','srt')}
      ${spTh('coutobt',scT('hCostObt')+scTip('tipCostObt'),'rgt','srt')}`:''}
      ${edit?'<th class="c-act"></th>':''}
    </tr>`;

  const body = rows.map(r=>{
    const qtyCell = edit
      ? `<td class="ctr"><input type="number" min="1" step="1" inputmode="numeric" value="${r.qty}" onchange="spEditQty(${r.i},this.value)"></td>`
      : `<td class="ctr">${spNum(r.qty)}</td>`;
    const costCell = edit
      ? `<td class="rgt"><input type="number" min="0" step="1" inputmode="numeric" value="${r.cost}" onchange="spEditCost(${r.i},this.value)"></td>`
      : `<td class="rgt">${spNum(r.cost)}</td>`;
    const planCells = planning ? `
      ${ edit
        ? `<td class="ctr sep"><input type="number" min="0" step="1" inputmode="numeric" value="${r.restant}" onchange="spEditRestant(${r.i},this.value)"></td>`
        : `<td class="ctr sep">${spNum(r.restant)}${r.daily?` <span class="sx-rst" title="${scEscAttr(scT('daily'))}">↻</span>`:''}</td>` }
      <td class="ctr muted">${spNum(r.maxfin)}</td>
      <td class="ctr ${r.obtenable>0?'ok':'muted'}"><b>${spNum(r.obtenable)}</b></td>
      <td class="rgt">${spNum(r.coutobt)}</td>` : '';
    return `<tr class="${r.isTop?'is-top':''}" style="--cat:${scCatColor(r.cat)};">
      <td class="c-img"><span class="sx-ico" style="background-image:url('img/Item/${r.img}.webp');"></span></td>
      <td class="c-name">${scEscAttr(r.nameTxt)}${r.isTop?`<span class="sx-tag">${scT('best')}</span>`:''}${!planning&&r.daily?` <span class="sx-rst">↻</span>`:''}</td>
      ${qtyCell}
      ${costCell}
      <td class="rgt gem">${spNum(r.gem)}</td>
      <td class="c-ratio"><b>×${r.ratio.toFixed(2)}</b><span class="sx-bar"><span style="width:${maxRatio>0?(r.ratio/maxRatio*100):0}%"></span></span></td>
      ${planCells}
      ${edit?`<td class="c-act"><button type="button" class="sx-del" title="${scEscAttr(scT('del'))}" onclick="spRemoveItem(${r.i})">✕</button></td>`:''}
    </tr>`;
  }).join('');

  host.innerHTML=`<div class="table-container${edit?' is-editing':''}"><table class="db-table sx-table"><thead>${heads}</thead><tbody>${body}</tbody></table></div>`
    + (edit?spAddFormHtml():'');
}

// Formulaire d'ajout — visible en mode édition seulement.
function spAddFormHtml(){
  const lang=scLang();
  const opts=SC_ITEMS.filter(it=>!it.skin)
    .sort((a,b)=>scName(a,lang).localeCompare(scName(b,lang)))
    .map(it=>`<option value="${scEscAttr(scName(it,lang))}"></option>`).join('');
  return `<div class="sx-add">
      <input class="sx-add-item" list="sx-items-dl" placeholder="${scEscAttr(scT('chooseItem'))}" autocomplete="off">
      <datalist id="sx-items-dl">${opts}</datalist>
      <input class="sx-add-qty" type="number" min="1" value="1" inputmode="numeric" title="${scEscAttr(scT('hQty'))}" placeholder="${scEscAttr(scT('hQty'))}">
      <input class="sx-add-cost" type="number" min="0" inputmode="numeric" title="${scEscAttr(scT('hCost'))}" placeholder="${scEscAttr(scT('hCost'))}">
      <input class="sx-add-restant" type="number" min="0" value="0" inputmode="numeric" title="${scEscAttr(scT('hRestant'))}" placeholder="${scEscAttr(scT('hRestant'))}">
      <label class="sx-add-daily-lbl"><input class="sx-add-daily" type="checkbox"> ${scT('daily')}</label>
      <button type="button" class="sx-btn primary" onclick="spAddItem(this)">+ ${scT('addItem')}</button>
    </div>`;
}

// ---------- interactions ----------
window.spSort=function(col){
  const st=SP_SORT.cur;
  if(st&&st.col===col) st.dir=-st.dir; else SP_SORT.cur={col,dir:1};
  spRenderTable();
};
window.spToggleEdit=function(){ SP_EDIT=!SP_EDIT; spRenderActions(); spRenderTable(); };

function spSave(){ scSaveEvents(); }
function spAfterEdit(){ spSave(); spRenderTable(); spRenderPodium(); spRenderHero(); }

window.spEditResources=function(val){
  const s=spShop(); if(!s) return;
  const n=parseFloat(String(val).replace(',','.'));
  s.resources=Math.max(0,isNaN(n)?0:n);
  spAfterEdit();
};
window.spEditQty=function(i,val){
  const s=spShop(); if(!s||!s.items[i]) return;
  s.items[i].qty=Math.max(1,parseInt(val)||1); spAfterEdit();
};
window.spEditCost=function(i,val){
  const s=spShop(); if(!s||!s.items[i]) return;
  const n=parseFloat(String(val).replace(',','.'));
  s.items[i].cost=Math.max(0,isNaN(n)?0:n); spAfterEdit();
};
window.spEditRestant=function(i,val){
  const s=spShop(); if(!s||!s.items[i]) return;
  s.items[i].restant=Math.max(0,parseInt(val)||0); spAfterEdit();
};
window.spRemoveItem=function(i){
  const s=spShop(); if(!s||!s.items[i]) return;
  showAppConfirm(scT('confirmDel'),()=>{ s.items.splice(i,1); spAfterEdit(); });
};
window.spAddItem=function(btn){
  const f=btn.closest('.sx-add'); const lang=scLang();
  // Résolution du texte saisi -> itemId (exact insensible à la casse, sinon sous-chaîne unique).
  const lc=(f.querySelector('.sx-add-item').value||'').trim().toLowerCase();
  if(!lc) return;
  let match=SC_ITEMS.find(it=>!it.skin && scName(it,lang).toLowerCase()===lc);
  if(!match){ const subs=SC_ITEMS.filter(it=>!it.skin && scName(it,lang).toLowerCase().includes(lc)); if(subs.length===1) match=subs[0]; }
  if(!match){ f.querySelector('.sx-add-item').classList.add('bad'); return; }
  const s=spShop(); if(!s) return;
  s.items.push({
    itemId: match.id,
    qty: Math.max(1, parseInt(f.querySelector('.sx-add-qty').value)||1),
    cost: Math.max(0, parseFloat(String(f.querySelector('.sx-add-cost').value).replace(',','.'))||0),
    restant: Math.max(0, parseInt(f.querySelector('.sx-add-restant').value)||0),
    dailyReset: !!f.querySelector('.sx-add-daily').checked
  });
  spAfterEdit();
};
window.spResetShop=function(){
  const def=(SC_EVENTS_DEF||[]).find(d=>d.id===spShop().id); if(!def) return;
  showAppConfirm(scT('confirmResetShop'),()=>{
    const i=SC_EVENTS.findIndex(s=>s.id===def.id);
    const fresh=JSON.parse(JSON.stringify(def));
    if(i>=0) SC_EVENTS[i]=fresh; else SC_EVENTS.push(fresh);
    SP.shop=fresh;
    spSave(); spRenderAll();
  });
};

// ---------- rendu global ----------
function spRenderAll(){
  scApplyTranslations();
  spRenderHero(); spRenderSwitch(); spRenderActions();
  spRenderPodium(); spRenderTable();
}

(async function(){
  await scLoadAll();
  SP = scFindBySlug(window.SHOP_SLUG||'');
  if(!SP){
    const host=spEl('sp-table');
    if(host) host.innerHTML=`<p style="color:var(--text-muted);">Shop “${scEscAttr(window.SHOP_SLUG||'')}” introuvable.</p>`;
    return;
  }
  spRenderAll();
  scStartCountdowns();

  if (window.HelpSystem) HelpSystem.init({
    id:'shop-page',
    anchor:'#sp-facts',   // sous la ligne d'infos, pas entre le titre et elle
    title:{FR:'Lire cette boutique', EN:'Reading this shop'},
    summary:{FR:"Chaque objet est comparé à sa valeur en gemmes : le ratio dit combien de valeur tu obtiens par unité de monnaie.",
             EN:"Each item is compared to its gem value: the ratio tells how much value you get per unit of currency."},
    steps:{
      FR:["Le ratio = valeur en gemmes ÷ coût. Plus il est élevé, meilleure est l'affaire ; le meilleur de la boutique est marqué « Top ».",
          "Clique sur un en-tête de colonne pour trier le tableau.",
          "Sur une boutique d'événement, renseigne ta monnaie en haut de page : la colonne « Obtenable » indique ce que tu peux réellement sortir d'ici la fin.",
          "Le bouton « Modifier » (crayon) ouvre le mode édition : quantités, coûts et stock restant deviennent modifiables, et tu peux ajouter ou retirer des objets si ta boutique en jeu diffère.",
          "Les valeurs en gemmes se modifient sur la page « Valeur des objets » — le changement se répercute sur toutes les boutiques."],
      EN:["Ratio = gem value ÷ cost. The higher it is, the better the deal; the shop's best one is tagged “Top”.",
          "Click a column header to sort the table.",
          "On an event shop, enter your currency at the top: the “Obtainable” column shows what you can really get before it ends.",
          "The “Edit” (pencil) button opens edit mode: quantities, costs and remaining stock become editable, and you can add or remove items if your in-game shop differs.",
          "Gem values are edited on the “Item values” page — the change applies to every shop."]
    },
    links:[{label:{FR:'Toutes les boutiques', EN:'All shops'}, href:'shop_calc.html'},
           {label:{FR:'Valeur des objets', EN:'Item values'}, href:'shop/items.html'}]
  });

  window.addEventListener('langChanged', spRenderAll);
})();
