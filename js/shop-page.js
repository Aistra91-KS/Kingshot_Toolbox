// ============================================================
//  PAGE BOUTIQUE (shop/<slug>.html)
//  Lit window.SHOP_SLUG, retrouve la boutique dans les JSON chargés par shop-core.js
//  et remplit les conteneurs de la page. Même principe que db-pets.js / db-masters.js.
// ============================================================

let SP = null;                      // { shop, kind }
const SP_SORT = {};                 // tri du tableau complet (affichage seul, non persisté)

function spEl(id){ return document.getElementById(id); }
function spShop(){ return SP && SP.shop; }
function spIsEvent(){ return SP && SP.kind==='event'; }
function spIsChest(){ return SP && SP.kind==='chest'; }

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
  const sibs=scAllShops().filter(e=>e.kind===SP.kind);
  host.innerHTML=sibs.map(({shop})=>{
    const nm=scEscAttr(scShopName(shop,lang));
    const ended=scIsEnded(shop)?' style="opacity:.6"':'';
    return shop.slug===SP.shop.slug
      ? `<span class="db-switch-item active">${nm}</span>`
      : `<a class="db-switch-item" href="${scShopHref(shop)}"${ended}>${nm}</a>`;
  }).join('');
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

// ---------- grille de cartes ----------
function spRenderGrid(){
  const host=spEl('sp-grid'); if(!host) return;
  const lang=scLang(), shop=spShop();

  if(spIsChest()){
    const { rows } = scComputeChest(shop);
    host.className='shop-card-grid chest-grid';
    host.innerHTML=rows.map(r=>{
      const color=scCatColor(r.cat);
      return `<div class="shop-item-card chest-card${r.isTop?' is-top':''}" style="--cat:${color};">
        <div class="sic-visual" style="background:${color}14;">
          <div class="sic-img" style="background-image:url('img/Item/${r.img}.webp');"></div>
          <span class="sic-qty">×${r.qty}</span>
          ${r.isTop?`<span class="sic-top">${scT('bestPick')}</span>`:''}
        </div>
        <div class="sic-name">${scEscAttr(r.nameTxt)}</div>
        <div class="sic-stats"><span class="sic-gem">💎 ${r.gem.toLocaleString()}</span></div>
      </div>`;
    }).join('');
    return;
  }

  const { rows } = scComputeRows(shop);
  const editable = spIsEvent();     // les boutiques permanentes sont un référentiel, pas un tableur
  host.className='shop-card-grid'+(editable?' event-grid':'');
  host.innerHTML=rows.map(r=>{
    const color=scCatColor(r.cat);
    if(!editable){
      return `<div class="shop-item-card${r.isTop?' is-top':''}" style="--cat:${color};">
        <div class="sic-visual" style="background:${color}14;">
          <div class="sic-img" style="background-image:url('img/Item/${r.img}.webp');"></div>
          <span class="sic-qty">×${r.qty}</span>
          ${r.isTop?`<span class="sic-top">${scT('best')}</span>`:''}
        </div>
        <div class="sic-name">${scEscAttr(r.nameTxt)}</div>
        <div class="sic-cost"><strong>${r.cost.toLocaleString()}</strong> <span class="sic-res" title="${scEscAttr(scResName(shop,lang))}">${scEscAttr(scResShort(shop,lang))}</span></div>
        <div class="sic-stats">
          <span class="sic-gem">💎 ${r.gem.toLocaleString()}</span>
          <span class="sic-ratio">×${r.ratio.toFixed(2)}</span>
        </div>
      </div>`;
    }
    const resetTxt = r.daily ? `↻ ${scT('daily')}` : `🔒 ${scT('stock')}`;
    return `<div class="shop-item-card event-card${r.isTop?' is-top':''}" style="--cat:${color};">
      <div class="sic-visual" style="background:${color}14;">
        <div class="sic-img" style="background-image:url('img/Item/${r.img}.webp');"></div>
        <span class="sic-reset" title="${scEscAttr(r.daily?scT('daily'):scT('stock'))}">${r.daily?'↻':'🔒'}</span>
        ${r.isTop?`<span class="sic-top">${scT('best')}</span>`:''}
      </div>
      <div class="sic-name">${scEscAttr(r.nameTxt)}</div>
      <div class="sic-cost"><strong>${r.cost.toLocaleString()}</strong> <span class="sic-res" title="${scEscAttr(scResName(shop,lang))}">${scEscAttr(scResShort(shop,lang))}</span></div>
      <div class="sic-stats">
        <span class="sic-gem">💎 ${r.gem.toLocaleString()}</span>
        <span class="sic-ratio">×${r.ratio.toFixed(2)}${scTip('tipRatio')}</span>
      </div>
      <details class="sic-planning">
        <summary>${scT('hRestant')} · ${scT('hObt')}</summary>
        <div class="sic-plan-body">
          <label class="sic-f"><span>${scT('hRestant')}${scTip('tipRestant')}</span><input type="number" min="0" inputmode="numeric" value="${r.restant}" onchange="spEditRestant(${r.i},this.value)"></label>
          <div class="sic-plan-row"><span>${resetTxt}</span></div>
          <div class="sic-plan-row"><span>${scT('hMaxFin')}${scTip('tipMaxFin')}</span><b>${r.maxfin.toLocaleString()}</b></div>
          <div class="sic-plan-row"><span>${scT('hObt')}${scTip('tipObt')}</span><b style="color:${r.obtenable>0?'var(--success)':'var(--text-muted)'};">${r.obtenable.toLocaleString()}</b></div>
          <div class="sic-plan-row"><span>${scT('hCostObt')}${scTip('tipCostObt')}</span><b>${r.coutobt.toLocaleString()}</b></div>
        </div>
      </details>
    </div>`;
  }).join('');
}

// ---------- saisie de la monnaie possédée (événements) ----------
function spRenderCurrency(){
  const host=spEl('sp-currency'); if(!host) return;
  if(!spIsEvent()){ host.innerHTML=''; return; }
  const lang=scLang(), shop=spShop();
  host.innerHTML=`<label class="sx-fact" style="gap:8px;">
      ${scEscAttr(scResName(shop,lang))} :
      <input id="sp-res" type="number" min="0" inputmode="numeric" class="table-input" style="width:110px;"
             value="${Math.max(0,Number(shop.resources)||0)}" onchange="spEditResources(this.value)">
    </label>`;
}

// ---------- tableau complet ----------
function spTh(col,label,align){
  const st=SP_SORT.cur;
  const arrow=(st&&st.col===col)?(st.dir>0?' ▲':' ▼'):'';
  return `<th style="cursor:pointer;user-select:none;${align?`text-align:${align};`:''}" onclick="spSort('${col}')">${label}${arrow}</th>`;
}
function spRenderTable(){
  const host=spEl('sp-table'); if(!host) return;
  const lang=scLang(), shop=spShop();

  if(spIsChest()){
    const { rows } = scComputeChest(shop);
    host.innerHTML=`<table class="db-table"><thead><tr>
        <th></th><th>${scT('hItem')}</th><th style="text-align:center;">${scT('hQty')}</th><th style="text-align:right;">${scT('hGem')}</th>
      </tr></thead><tbody>${rows.map(r=>`<tr${r.isTop?' style="background:rgba(59,130,246,.10);"':''}>
        <td style="width:38px;"><div class="sc-item-img" style="width:28px;height:28px;background-image:url('img/Item/${r.img}.webp');"></div></td>
        <td>${scEscAttr(r.nameTxt)}</td>
        <td style="text-align:center;">${r.qty.toLocaleString()}</td>
        <td style="text-align:right;font-weight:600;">${r.gem.toLocaleString()}</td>
      </tr>`).join('')}</tbody></table>`;
    return;
  }

  const { rows } = scComputeRows(shop, { sort: SP_SORT.cur });
  const planning=spIsEvent();
  const planHeads = planning ? `
      ${spTh('restant',scT('hRestant'),'center')}
      ${spTh('maxfin',scT('hMaxFin'),'center')}
      ${spTh('obtenable',scT('hObt'),'center')}
      ${spTh('coutobt',scT('hCostObt'),'right')}` : '';
  const body=rows.map(r=>{
    const color=scCatColor(r.cat);
    const planCells = planning ? `
      <td style="text-align:center;">${r.restant.toLocaleString()} ${r.daily?'<span title="'+scEscAttr(scT('daily'))+'" style="color:var(--success);">↻</span>':''}</td>
      <td style="text-align:center;color:var(--text-muted);">${r.maxfin.toLocaleString()}</td>
      <td style="text-align:center;font-weight:bold;color:${r.obtenable>0?'var(--success)':'var(--text-muted)'};">${r.obtenable.toLocaleString()}</td>
      <td style="text-align:right;">${r.coutobt.toLocaleString()}</td>` : '';
    return `<tr style="border-left:4px solid ${r.isTop?'#3B82F6':color};background:${color}${r.isTop?'26':'14'};">
      <td style="width:38px;"><div class="sc-item-img" style="width:28px;height:28px;background-image:url('img/Item/${r.img}.webp');background-color:${color}33;"></div></td>
      <td>${scEscAttr(r.nameTxt)} ${r.isTop?`<span style="background:#3B82F6;color:#fff;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:8px;">${scT('best')}</span>`:''}</td>
      <td style="text-align:center;">${r.qty.toLocaleString()}</td>
      <td style="text-align:right;">${r.cost.toLocaleString()}</td>
      ${planCells}
      <td style="text-align:right;">${r.gem.toLocaleString()}</td>
      <td style="text-align:center;font-weight:bold;color:${r.isTop?'#3B82F6':'var(--text-light)'};white-space:nowrap;">×${r.ratio.toFixed(2)}</td>
    </tr>`;
  }).join('');
  host.innerHTML=`<table class="db-table"><thead><tr><th></th>
      ${spTh('name',scT('hItem'))}
      ${spTh('qty',scT('hQty'),'center')}
      ${spTh('cost',scT('hCost'),'right')}
      ${planHeads}
      ${spTh('gem',scT('hGem'),'right')}
      ${spTh('ratio',scT('hRatio'),'center')}
    </tr></thead><tbody>${body}</tbody></table>`;
}

// ---------- interactions ----------
window.spSort=function(col){
  const st=SP_SORT.cur;
  if(st&&st.col===col) st.dir=-st.dir; else SP_SORT.cur={col,dir:1};
  spRenderTable();
};
window.spEditResources=function(val){
  const s=spShop(); if(!s) return;
  const n=parseFloat(String(val).replace(',','.'));
  s.resources=Math.max(0,isNaN(n)?0:n);
  scSaveEvents(); spRenderGrid(); spRenderTable();
};
window.spEditRestant=function(index,val){
  const s=spShop(); if(!s||!s.items[index]) return;
  s.items[index].restant=Math.max(0,parseInt(val)||0);
  scSaveEvents(); spRenderGrid(); spRenderTable();
};

// ---------- rendu global ----------
function spRenderAll(){
  scApplyTranslations();
  spRenderHero(); spRenderSwitch(); spRenderCurrency();
  spRenderPodium(); spRenderGrid(); spRenderTable();
}

(async function(){
  await scLoadAll();
  SP = scFindBySlug(window.SHOP_SLUG||'');
  if(!SP){
    const host=spEl('sp-grid');
    if(host) host.innerHTML=`<p style="color:var(--text-muted);">Shop “${scEscAttr(window.SHOP_SLUG||'')}” introuvable.</p>`;
    return;
  }
  spRenderAll();
  scStartCountdowns();

  if (window.HelpSystem) HelpSystem.init({
    id:'shop-page',
    title:{FR:'Lire cette boutique', EN:'Reading this shop'},
    summary:{FR:"Chaque objet est comparé à sa valeur en gemmes : le ratio dit combien de valeur tu obtiens par unité de monnaie.",
             EN:"Each item is compared to its gem value: the ratio tells how much value you get per unit of currency."},
    steps:{
      FR:["Le ratio = valeur en gemmes ÷ coût. Plus il est élevé, meilleure est l'affaire ; le meilleur de la boutique est marqué « Top ».",
          "« Meilleures affaires » reprend le podium des trois ratios les plus élevés.",
          "Sur une boutique d'événement, renseigne ta monnaie en haut de page et le stock restant de chaque objet pour voir ce qui est réellement obtenable d'ici la fin.",
          "Les valeurs en gemmes se modifient sur la page « Valeur des objets » — le changement se répercute sur toutes les boutiques.",
          "Le tableau complet en bas de page reprend les mêmes données, triables colonne par colonne."],
      EN:["Ratio = gem value ÷ cost. The higher it is, the better the deal; the shop's best one is tagged “Top”.",
          "“Best deals” is the podium of the three highest ratios.",
          "On an event shop, enter your currency at the top and each item's remaining stock to see what is actually obtainable before it ends.",
          "Gem values are edited on the “Item values” page — the change applies to every shop.",
          "The full table at the bottom holds the same data, sortable column by column."]
    },
    links:[{label:{FR:'Toutes les boutiques', EN:'All shops'}, href:'shop_calc.html'},
           {label:{FR:'Valeur des objets', EN:'Item values'}, href:'shop/items.html'}]
  });

  window.addEventListener('langChanged', spRenderAll);
})();
