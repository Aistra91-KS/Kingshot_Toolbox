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
  if(thumb && !thumb.firstElementChild) thumb.innerHTML=scThumbHtml(shop);

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

// ---------- barre d'action : monnaie + crayon + panier ----------
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
    // Le panier et l'édition ne cohabitent pas : l'un consomme la boutique, l'autre la corrige.
    if(!SP_EDIT){
      const { cart } = scComputeRows(shop);
      if(cart.lines>0) html+=`<button type="button" class="sx-btn" onclick="spClearCart()">✕ ${scT('clearCart')}</button>`;
    }
  }
  if(SP_EDIT) html+=`<span class="sx-edit-hint">${scT('editHint')}</span>`;
  host.innerHTML=html;
}

// ---------- tuiles de bilan du panier ----------
function spRenderCart(){
  const host=spEl('sp-cart'); if(!host) return;
  if(!spIsEvent() || SP_EDIT){ host.innerHTML=''; return; }
  const lang=scLang(), shop=spShop();
  const { cart } = scComputeRows(shop);
  const res=scResName(shop,lang);
  host.innerHTML=`
    <div class="sx-kpis${cart.over?' is-over':''}">
      <div class="sx-kpi">
        <span class="sx-kpi-lbl">${scT('kpiCurrency')}</span>
        <span class="sx-kpi-val">${spNum(cart.resources)}</span>
        <span class="sx-kpi-sub">${scEscAttr(res)}</span>
      </div>
      <div class="sx-kpi">
        <span class="sx-kpi-lbl">${scT('kpiSpent')}</span>
        <span class="sx-kpi-val">${spNum(cart.spent)}</span>
        <span class="sx-kpi-sub">${cart.lines} ${scT(cart.lines>1?'kpiLines':'kpiLine')}</span>
      </div>
      <div class="sx-kpi ${cart.over?'bad':'good'} sx-kpi-hero">
        <span class="sx-kpi-lbl">${cart.over?scT('kpiOver'):scT('kpiLeft')}</span>
        <span class="sx-kpi-val">${spNum(Math.abs(cart.left))}</span>
        <span class="sx-kpi-sub">${cart.over?scT('overWarn'):scEscAttr(res)}</span>
      </div>
      <div class="sx-kpi gemtile">
        <span class="sx-kpi-lbl">${scT('kpiValue')}</span>
        <span class="sx-kpi-val">💎 ${spNum(cart.gems)}</span>
        <span class="sx-kpi-sub">${cart.spent>0?`${(cart.gems/cart.spent).toFixed(2)} 💎 / ${scEscAttr(scResShort(shop,lang))}`:'—'}</span>
      </div>
    </div>`;
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

// Le rendu remplace tout le contenu de #sp-table, donc le conteneur qui défile est recréé :
// sans ces deux relevés, chaque clic sur « + » d'une ligne du bas ramenait le tableau en haut
// et faisait perdre le bouton sous le curseur.
function spSnapshotTable(host){
  const box=host.querySelector('.table-container');
  const ae=document.activeElement;
  const inTable = ae && ae.getAttribute && host.contains(ae) && ae.getAttribute('data-role');
  return {
    top: box?box.scrollTop:0,
    left: box?box.scrollLeft:0,
    focus: inTable ? { i:ae.getAttribute('data-i'), role:ae.getAttribute('data-role') } : null
  };
}
function spRestoreTable(host, snap){
  const box=host.querySelector('.table-container');
  if(box){ box.scrollTop=snap.top; box.scrollLeft=snap.left; }
  if(snap.focus){
    const el=host.querySelector(`[data-i="${snap.focus.i}"][data-role="${snap.focus.role}"]`);
    // Un bouton peut être devenu inactif (plus de solde, ou quantité retombée à 0) :
    // on se rabat alors sur le champ de la même ligne pour ne pas éjecter le clavier.
    const target = (el && !el.disabled) ? el : host.querySelector(`[data-i="${snap.focus.i}"][data-role="take"]`);
    if(target) target.focus({ preventScroll:true });
  }
}

function spRenderTable(){
  const host=spEl('sp-table'); if(!host) return;
  const snap=spSnapshotTable(host);
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
    spRestoreTable(host, snap);
    return;
  }

  const { rows, maxRatio, cart, resets } = scComputeRows(shop, { sort: SP_SORT.cur });
  const edit = SP_EDIT;
  const shopping = spIsEvent() && !edit;   // colonnes du panier
  const stock    = spIsEvent();            // colonnes de stock (dispo / restant)

  const heads = `<tr>
      <th class="c-img"></th>
      ${spTh('name',scT('hItem'),'','srt')}
      ${spTh('qty',scT('hQty'),'ctr','srt')}
      ${spTh('cost',scT('hCost'),'rgt','srt')}
      ${spTh('gem',scT('hGem')+scTip('tipGem'),'rgt','srt')}
      ${spTh('ratio',scT('hRatio')+scTip('tipRatio'),'','srt')}
      ${stock ? (edit
        ? spTh('restant',scT('hRestant')+scTip('tipRestant'),'ctr','srt sep')
        : spTh('maxfin',scT('hAvail')+scTip('tipAvail'),'ctr','srt sep')) : ''}
      ${shopping?`
      <th class="ctr c-take">${scT('hTake')}${scTip('tipTake')}</th>
      ${spTh('takeCost',scT('hTakeCost'),'rgt','srt')}
      ${spTh('takeGem',scT('hTakeValue'),'rgt','srt')}`:''}
      ${edit?'<th class="c-act"></th>':''}
    </tr>`;

  const body = rows.map(r=>{
    const qtyCell = edit
      ? `<td class="ctr"><input type="number" min="1" step="1" inputmode="numeric" value="${r.qty}" onchange="spEditQty(${r.i},this.value)"></td>`
      : `<td class="ctr">${spNum(r.qty)}</td>`;
    const costCell = edit
      ? `<td class="rgt"><input type="number" min="0" step="1" inputmode="numeric" value="${r.cost}" onchange="spEditCost(${r.i},this.value)"></td>`
      : `<td class="rgt">${spNum(r.cost)}</td>`;

    // Stock : en lecture on montre le plafond atteignable et d'où il sort ; en édition
    // c'est le stock restant qui redevient saisissable.
    let stockCell='';
    if(stock){
      stockCell = edit
        ? `<td class="ctr sep"><input type="number" min="0" step="1" inputmode="numeric" value="${r.restant}" onchange="spEditRestant(${r.i},this.value)"></td>`
        : `<td class="ctr sep">${spNum(r.maxfin)}${r.daily?`<span class="sx-sub">${spNum(r.restant)}${scT('perDay')} × ${resets}${scT('days')}</span>`:''}</td>`;
    }

    // Panier : stepper + ce que la ligne coûte et rapporte. Une ligne non prise affiche « — ».
    let cartCells='';
    if(shopping){
      const atMax = r.take>0 && r.canTake===0;
      cartCells = `
      <td class="ctr c-take">
        <span class="sx-take${r.take>0?' on':''}">
          <button type="button" data-i="${r.i}" data-role="minus" ${r.take<=0?'disabled':''} onclick="spTakeStep(${r.i},-1)" aria-label="−">−</button>
          <input type="number" min="0" step="1" inputmode="numeric" data-i="${r.i}" data-role="take" value="${r.take}" onchange="spSetTake(${r.i},this.value)">
          <button type="button" data-i="${r.i}" data-role="plus" ${r.canTake<=0?'disabled':''} onclick="spTakeStep(${r.i},1)" aria-label="+">+</button>
        </span>
        <button type="button" class="sx-maxbtn" data-i="${r.i}" data-role="max" ${(r.canTake<=0&&!atMax)?'disabled':''} onclick="spTakeMax(${r.i})">MAX</button>
      </td>
      <td class="rgt ${r.take>0?'':'dash'}">${r.take>0?spNum(r.takeCost):'—'}</td>
      <td class="rgt gem ${r.take>0?'':'dash'}">${r.take>0?spNum(r.takeGem):'—'}</td>`;
    }

    return `<tr class="${r.isTop?'is-top':''}${r.take>0?' in-cart':''}" style="--cat:${scCatColor(r.cat)};">
      <td class="c-img"><span class="sx-ico" style="background-image:url('img/Item/${r.img}.webp');"></span></td>
      <td class="c-name">${scEscAttr(r.nameTxt)}${r.isTop?`<span class="sx-tag">${scT('best')}</span>`:''}</td>
      ${qtyCell}
      ${costCell}
      <td class="rgt gem">${spNum(r.gem)}</td>
      <td class="c-ratio">${r.ratio>0?`<b>×${r.ratio.toFixed(2)}</b><span class="sx-bar"><span style="width:${maxRatio>0?(r.ratio/maxRatio*100):0}%"></span></span>`:'<span class="dash">—</span>'}</td>
      ${stockCell}
      ${cartCells}
      ${edit?`<td class="c-act"><button type="button" class="sx-del" title="${scEscAttr(scT('del'))}" onclick="spRemoveItem(${r.i})">✕</button></td>`:''}
    </tr>`;
  }).join('');

  // Récapitulatif du panier : une barre HORS du tableau, collée en bas de l'écran.
  // `position:sticky` sur un <tfoot> n'est pas fiable (Chromium ne le colle qu'une fois le
  // défilement entamé) ; une div ordinaire tient toujours, et reste lisible même quand le
  // tableau déborde horizontalement.
  const bar = (shopping && cart.lines>0) ? `<div class="sx-cartbar${cart.over?' is-over':''}">
      <span class="sx-cartbar-lbl">${scT('cartTotal')}</span>
      <span class="sx-cartbar-item"><b>${spNum(rows.reduce((s,r)=>s+r.take,0))}</b> ${scT('lots')}</span>
      <span class="sx-cartbar-item"><b>${spNum(cart.spent)}</b> ${scEscAttr(scResShort(shop,scLang()))}</span>
      <span class="sx-cartbar-item gem"><b>💎 ${spNum(cart.gems)}</b></span>
      <span class="sx-cartbar-left ${cart.over?'bad':''}">${cart.over?scT('kpiOver'):scT('kpiLeft')} <b>${spNum(Math.abs(cart.left))}</b></span>
    </div>` : '';

  host.innerHTML=`<div class="table-container${edit?' is-editing':''}"><table class="db-table sx-table"><thead>${heads}</thead><tbody>${body}</tbody></table></div>`
    + bar + (edit?spAddFormHtml():'');
  spRestoreTable(host, snap);
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
window.spToggleEdit=function(){ SP_EDIT=!SP_EDIT; spRenderAll(); };

function spSave(){ scSaveEvents(); }

// Le re-rendu remplace le tableau entier. Déclenché depuis le `change` d'un champ, il détruit
// ce champ alors que le navigateur traite encore son `blur` — ce qui lève une DOMException.
// On rend la main au navigateur avant de reconstruire, ce qui coalesce au passage les appels
// rapprochés (un clic sur MAX en enchaîne plusieurs).
let SP_PENDING = null;
function spAfterEdit(){
  spSave();
  if(SP_PENDING) return;
  SP_PENDING = setTimeout(()=>{
    SP_PENDING = null;
    spRenderTable(); spRenderPodium(); spRenderHero(); spRenderCart(); spRenderActions();
  }, 0);
}

// ---------- panier ----------
// Chaque geste est plafonné à la source : ce qu'on peut encore prendre (canTake) tient déjà
// compte du stock ET du solde restant, donc l'utilisateur ne peut pas se mettre en dépassement
// par les boutons — seule une saisie au clavier le permet, et elle est alors signalée.
function spTakeSet(i, n){
  const s=spShop(); if(!s||!s.items[i]) return;
  s.items[i].take = Math.max(0, Math.floor(n)||0);
  spAfterEdit();
}
window.spSetTake=function(i,val){ spTakeSet(i, parseInt(String(val).replace(/\s/g,''))||0); };
window.spTakeStep=function(i,d){
  const r=scComputeRows(spShop()).all.find(x=>x.i===i); if(!r) return;
  spTakeSet(i, d>0 ? r.take + Math.min(1, r.canTake) : r.take - 1);
};
window.spTakeMax=function(i){
  const r=scComputeRows(spShop()).all.find(x=>x.i===i); if(!r) return;
  spTakeSet(i, r.take + r.canTake);
};
window.spClearCart=function(){ scClearCart(spShop()); spAfterEdit(); };

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
  spRenderHero(); spRenderSwitch(); spRenderActions(); spRenderCart();
  spRenderPodium(); spRenderTable();
}

(async function(){
  await scLoadAll();
  SP = scFindBySlug(window.SHOP_SLUG||'');
  // Tri par défaut : meilleures affaires en tête. C'est la question que le joueur se pose
  // en arrivant ; l'ordre du jeu reste accessible en cliquant sur une colonne.
  SP_SORT.cur = { col:'ratio', dir:-1 };
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
