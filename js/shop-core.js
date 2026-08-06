// ============================================================
//  SHOP CORE — socle partagé des pages Boutique
//  Chargé par : shop_calc.html (sommaire), shop/*.html (pages boutique),
//  shop/items.html (référentiel de valeurs).
//  Contient : dictionnaire i18n, chargement des 4 JSON, helpers d'affichage,
//  compte à rebours et calcul des lignes d'une boutique.
// ============================================================

const i18nShop = {
  FR: {
    // — sommaire —
    scTitle:"Valeur Boutique", scDesc:"Comparez le coût des objets en boutique à leur valeur en gemmes pour repérer les meilleures affaires.",
    secEvent:"Boutiques d'Événement", secClassic:"Boutiques Permanentes", secChest:"Coffres",
    secEventSub:"Offres limitées dans le temps : monnaie dédiée, stock plafonné et date de fin.",
    secClassicSub:"Boutiques toujours disponibles, alimentées par les monnaies de leurs modes de jeu.",
    secChestSub:"Coffres au choix unique : un seul objet à prendre, autant choisir le plus rentable.",
    itemsRef:"Valeur des objets", itemsRefSub:"Le référentiel en gemmes qui alimente tous les calculs.",
    nItems:"objets", nChoices:"choix", openShop:"Voir la boutique",
    // — statut / temps —
    endsIn:"Fin dans", ended:"Événement terminé", endedShort:"Terminé", permanent:"Permanente",
    days:"j", hours:"h", minutes:"min", lastDay:"Dernier jour",
    archiveNote:"Cet événement est terminé. Les données ci-dessous sont celles de sa dernière édition — utiles pour comparer avec une autre boutique ou anticiper son retour.",
    // — page boutique —
    crumbShops:"Boutiques", currency:"Monnaie", myCurrency:"Ma monnaie",
    bestDeals:"Meilleures affaires", allItems:"Tous les objets", rawTable:"Tableau complet",
    chestContent:"Contenu du coffre",
    chestPickHint:"Un seul objet à choisir — le plus rentable est mis en avant.",
    // — colonnes / champs —
    colName:"Nom", colCat:"Catégorie", colGem:"Valeur (gemmes)",
    hItem:"Objet", hQty:"Qté", hCost:"Coût", hGem:"Valeur gemmes", hRatio:"Ratio",
    hRestant:"Restant", hMaxFin:"Max fin", hObt:"Obtenable", hCostObt:"Coût obt.", hShare:"Part",
    best:"Top", bestPick:"Meilleur choix",
    daily:"Réinit. quotidienne (00h UTC)", stock:"Stock (sans réinit.)",
    // — mode édition —
    edit:"Modifier", editDone:"Terminer", editOn:"Mode édition",
    editHint:"Ajuste les quantités, les coûts et le stock restant pour coller à ta boutique en jeu. Tes modifications restent sur ton appareil.",
    addItem:"Ajouter", chooseItem:"— Objet —", del:"Supprimer",
    confirmDel:"Supprimer cet objet de la boutique ?",
    resetShop:"Réinitialiser", resetShopTip:"Revenir à la version d'origine de la boutique (annule tes modifications)",
    confirmResetShop:"Réinitialiser cette boutique à sa version d'origine ? Tes modifications (quantités, coûts, suppressions) seront perdues.",
    // — data item —
    resetItems:"Réinitialiser les valeurs", allCats:"Toutes les catégories",
    confirmReset:"Réinitialiser toutes les valeurs en gemmes par défaut ?", count:"objets",
    search:"Rechercher…",
    // — infobulles —
    tipRatio:"Valeur en gemmes ÷ coût. Plus c'est élevé, meilleure est l'affaire.",
    tipGem:"Valeur de référence de l'objet en gemmes (modifiable sur la page « Valeur des objets »).",
    tipRestant:"Quantité encore disponible à l'achat dans cette boutique.",
    tipMaxFin:"Quantité maximale atteignable d'ici la fin de l'événement.",
    tipObt:"Ce que tu peux réellement obtenir compte tenu de ta monnaie d'événement.",
    tipCostObt:"Monnaie d'événement nécessaire pour la quantité « Obtenable »."
  },
  EN: {
    scTitle:"Shop Value", scDesc:"Compare in-shop cost to gem value to spot the best deals.",
    secEvent:"Event Shops", secClassic:"Permanent Shops", secChest:"Chests",
    secEventSub:"Time-limited offers: dedicated currency, capped stock and an end date.",
    secClassicSub:"Always-available shops, fed by their game mode's own currency.",
    secChestSub:"Single-pick chests: only one item to take, so make it the most valuable one.",
    itemsRef:"Item values", itemsRefSub:"The gem reference table behind every calculation.",
    nItems:"items", nChoices:"choices", openShop:"Open shop",
    endsIn:"Ends in", ended:"Event ended", endedShort:"Ended", permanent:"Permanent",
    days:"d", hours:"h", minutes:"min", lastDay:"Last day",
    archiveNote:"This event has ended. The data below is from its latest run — handy to compare with another shop or to prepare for its return.",
    crumbShops:"Shops", currency:"Currency", myCurrency:"My currency",
    bestDeals:"Best deals", allItems:"All items", rawTable:"Full table",
    chestContent:"Chest contents",
    chestPickHint:"A single item to pick — the best value is highlighted.",
    colName:"Name", colCat:"Category", colGem:"Value (gems)",
    hItem:"Item", hQty:"Qty", hCost:"Cost", hGem:"Gem value", hRatio:"Ratio",
    hRestant:"Remaining", hMaxFin:"Max by end", hObt:"Obtainable", hCostObt:"Obt. cost", hShare:"Share",
    best:"Top", bestPick:"Best pick",
    daily:"Daily reset (00:00 UTC)", stock:"Stock (no reset)",
    edit:"Edit", editDone:"Done", editOn:"Editing",
    editHint:"Adjust quantities, costs and remaining stock to match your in-game shop. Your changes stay on your device.",
    addItem:"Add", chooseItem:"— Item —", del:"Remove",
    confirmDel:"Remove this item from the shop?",
    resetShop:"Reset", resetShopTip:"Restore the shop's original version (discards your changes)",
    confirmResetShop:"Reset this shop to its original version? Your changes (quantities, costs, deletions) will be lost.",
    resetItems:"Reset values", allCats:"All categories",
    confirmReset:"Reset all gem values to defaults?", count:"items",
    search:"Search…",
    tipRatio:"Gem value ÷ cost. The higher it is, the better the deal.",
    tipGem:"Reference gem value of the item (editable on the “Item values” page).",
    tipRestant:"Quantity still available to buy in this shop.",
    tipMaxFin:"Max quantity reachable by the event's end.",
    tipObt:"What you can actually obtain given your event currency.",
    tipCostObt:"Event currency needed for the “Obtainable” quantity."
  }
};
function scLang(){ return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k){ return (i18nShop[scLang()]||i18nShop.FR)[k]; }
function scTip(k){ return window.HelpSystem ? HelpSystem.tip({FR:i18nShop.FR[k], EN:i18nShop.EN[k]}) : ''; }
// Les pages boutique mêlent les deux mécanismes du site : dictionnaire + [data-i18n] pour les
// libellés d'interface, et [data-en]/[data-fr] en dur pour les noms de boutiques et de monnaies
// (écrits dans le HTML pour rester lisibles par un moteur de recherche sans exécuter le JS).
function scApplyTranslations(){
  const lang=scLang();
  if(window.GlobalLang) GlobalLang.applyI18n(i18nShop[lang]);
  const attr='data-'+lang.toLowerCase();
  document.querySelectorAll('[data-en][data-fr]').forEach(el=>{
    const v=el.getAttribute(attr); if(v!=null) el.textContent=v;
  });
  document.documentElement.lang=lang.toLowerCase();
}

const SC_CAT_COLORS = {
  Speedup:'#3B82F6', Pet:'#4ADE80', Other:'#6B7280', Equipment:'#64748B',
  Event:'#A855F7', Governor:'#DC2626', Hero:'#FBBF24', Island:'#14B8A6',
  Resources:'#22C55E', VIP:'#EAB308', Cosmetic:'#EC4899'
};
function scCatColor(c){ return SC_CAT_COLORS[c]||'#6B7280'; }

let SC_ITEMS=[], SC_DEFAULTS=[];
let SC_CLASSIC=[];
let SC_EVENTS=[], SC_EVENTS_DEF=[];
let SC_CHESTS=[];

// ---------- helpers d'affichage ----------
function scEscAttr(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function scName(it,lang){ if(it&&it.name&&typeof it.name==='object') return it.name[lang]||it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
function scNameEN(it){ if(it&&it.name&&typeof it.name==='object') return it.name.EN||it.name.FR||''; return (it&&it.name)||''; }
// URL d'image sûre : encode l'apostrophe en %27 pour ne pas casser le url('...') du CSS.
// `img` (optionnel) court-circuite le nom EN quand le fichier porte un autre libellé.
function scImg(it){ return encodeURIComponent((it&&it.img)||scNameEN(it)).replace(/'/g,'%27'); }
function scItemById(id){ return SC_ITEMS.find(i=>i.id===id); }
// Libellé affiché : « Objet (Skin) » quand une variante visuelle est référencée via skinId.
function scLabel(it,skin,lang){ const b=it?scName(it,lang):'??'; return skin?`${b} (${scName(skin,lang)})`:b; }
function scGem(id){ const it=scItemById(id); return it?Number(it.gemValue)||0:0; }
function scShopName(shop,lang){ return (shop.name&&typeof shop.name==='object')?(shop.name[lang]||shop.name.EN):shop.name; }
function scResName(shop,lang){ const r=shop.resourceName; if(r&&typeof r==='object') return r[lang]||r.EN||r.FR||scT('currency'); return r||scT('currency'); }
function scResShort(shop,lang){ const r=shop.resourceShort; if(r&&typeof r==='object') return r[lang]||r.EN||r.FR||scResName(shop,lang); return r||scResName(shop,lang); }

// ---------- temps ----------
// ATTENTION : deux notions distinctes, à ne jamais confondre.
//  · scResetsLeft() = nombre de réinitialisations 00h UTC restantes (aujourd'hui inclus).
//    C'est ce qui multiplie le stock des objets à reset quotidien -> ne sert QU'aux calculs.
//  · scTimeLeft()   = temps réel restant (jours + heures) -> ne sert QU'à l'affichage.
function scResetsLeft(endsAt){
  if(!endsAt) return 0;
  const ends=new Date(endsAt).getTime(); if(isNaN(ends)) return 0;
  const now=Date.now(); if(ends<=now) return 0;
  const e=new Date(ends-1), n=new Date(now);
  const lastDay=Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate());
  const today=Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate());
  return Math.max(1, Math.round((lastDay-today)/86400000)+1);
}
function scTimeLeft(endsAt){
  if(!endsAt) return { permanent:true, ended:false, ms:0, days:0, hours:0, minutes:0 };
  const ends=new Date(endsAt).getTime();
  if(isNaN(ends)) return { permanent:true, ended:false, ms:0, days:0, hours:0, minutes:0 };
  const ms=ends-Date.now();
  if(ms<=0) return { permanent:false, ended:true, ms:0, days:0, hours:0, minutes:0 };
  const mins=Math.floor(ms/60000);
  return { permanent:false, ended:false, ms, days:Math.floor(mins/1440), hours:Math.floor(mins%1440/60), minutes:mins%60 };
}
// « 6j 14h » · « 14h 20min » · « Terminé ». Sous 24h, l'échéance devient urgente (couleur côté CSS).
function scTimeLeftTxt(endsAt){
  const t=scTimeLeft(endsAt);
  if(t.permanent) return scT('permanent');
  if(t.ended) return scT('endedShort');
  if(t.days>0) return `${t.days}${scT('days')} ${t.hours}${scT('hours')}`;
  if(t.hours>0) return `${t.hours}${scT('hours')} ${t.minutes}${scT('minutes')}`;
  return `${t.minutes}${scT('minutes')}`;
}
function scIsEnded(shop){ return !!(shop && shop.endsAt) && scTimeLeft(shop.endsAt).ended; }
function scIsUrgent(shop){ const t=scTimeLeft(shop&&shop.endsAt); return !t.permanent && !t.ended && t.days<1; }
// Rafraîchit tous les compteurs de la page (minute par minute : inutile d'aller plus vite).
function scStartCountdowns(){
  const tick=()=>{
    document.querySelectorAll('[data-ends-at]').forEach(el=>{
      const at=el.getAttribute('data-ends-at');
      el.textContent = (el.hasAttribute('data-ends-prefix') && !scTimeLeft(at).ended ? scT('endsIn')+' ' : '') + scTimeLeftTxt(at);
    });
  };
  tick(); setInterval(tick, 60000);
  window.addEventListener('langChanged', tick);
}

// ---------- chargement ----------
async function scLoadItems(){
  try{ SC_DEFAULTS = await (await fetch('data/shopcalc_items.json')).json(); }catch(e){ console.error('items',e); SC_DEFAULTS=[]; }
  const saved = safeParse(STORAGE_KEYS.shopcalcItems,null);
  // Le FICHIER est la liste de référence (même logique que les boutiques d'événement) : un objet
  // ajouté au JSON apparaît toujours ; seule la valeur en gemmes éditée est réappliquée par id.
  const savedById={}; if(Array.isArray(saved)) saved.forEach(x=>{ if(x&&x.id) savedById[x.id]=x; });
  SC_ITEMS = SC_DEFAULTS.length
    ? SC_DEFAULTS.map(d=>{ const x=savedById[d.id]; return (x&&x.gemValue!=null)?{...d,gemValue:x.gemValue}:{...d}; })
    : (Array.isArray(saved)?saved.map(x=>({...x})):[]);   // secours : fichier injoignable
  SC_ITEMS.forEach(it=>{ if(typeof it.name==='string') it.name={EN:it.name,FR:it.name}; });
}
function scSaveItems(){ localStorage.setItem(STORAGE_KEYS.shopcalcItems, JSON.stringify(SC_ITEMS)); }

async function scLoadClassic(){
  // Classique = boutiques admin en LECTURE SEULE : toujours chargées depuis le fichier,
  // sans localStorage (seules les valeurs en gemmes du référentiel l'impactent).
  try{ SC_CLASSIC = await (await fetch('data/shopcalc_classic.json')).json(); }catch(e){ console.error('classic',e); SC_CLASSIC=[]; }
}

// Boutiques d'événement : admin-sourcées (data/shopcalc_events.json).
// L'utilisateur ne crée pas de boutique ; il édite seulement le contenu (qté, coût, ajout, retrait).
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
    s.endsAt=def.endsAt; s.resourceName=def.resourceName; s.slug=def.slug; s.name=def.name; s.img=def.img;
    (s.items||[]).forEach((si,i)=>{
      const di=(def.items||[])[i];
      // La ligne correspond à celle du fichier -> les champs admin font foi.
      // Sinon (objet ajouté par l'utilisateur, ou décalage après une suppression), on garde
      // ses valeurs : les écraser effaçait le « réinit. quotidienne » coché à l'ajout.
      if(di && di.itemId===si.itemId){ si.dailyReset=!!di.dailyReset; si.qtyMax=di.qtyMax; si.skinId=di.skinId; }
    });
  });
  // Nettoie les fantômes du localStorage (seulement si le fichier a bien chargé, pour ne rien effacer sur une erreur réseau).
  if(SC_EVENTS_DEF.length) scSaveEvents();
}
function scSaveEvents(){ localStorage.setItem(STORAGE_KEYS.shopcalcEvents, JSON.stringify(SC_EVENTS)); }

async function scLoadChests(){
  try{ SC_CHESTS = await (await fetch('data/shopcalc_chests.json')).json(); }
  catch(e){ console.error('chests',e); SC_CHESTS=[]; }
}
async function scLoadAll(){ await scLoadItems(); await scLoadClassic(); await scLoadEvents(); await scLoadChests(); }

// ---------- résolution boutique <-> page ----------
// `kind` distingue les trois familles ; il n'est PAS stocké dans les JSON (il découle du fichier d'origine).
function scAllShops(){
  return [].concat(
    SC_EVENTS.map(s=>({shop:s, kind:'event'})),
    SC_CLASSIC.map(s=>({shop:s, kind:'classic'})),
    SC_CHESTS.map(s=>({shop:s, kind:'chest'}))
  );
}
function scFindBySlug(slug){ return scAllShops().find(e=>e.shop.slug===slug) || null; }
function scShopHref(shop){ return 'shop/'+(shop.slug||'')+'.html'; }
// Image de la carte : `img/shops/<slug>.webp`. Absente, la mosaïque de secours prend le relais
// (voir scThumbHtml) — aucune image à produire pour que la page soit présentable.
function scShopImgSrc(shop){ return 'img/shops/'+(shop.img||shop.slug||'')+'.webp'; }

// Mosaïque de secours : les 4 objets de plus forte valeur en gemmes de la boutique.
function scThumbItems(shop, kind){
  const seen=new Set(), out=[];
  (shop.items||[]).map(si=>{
    const it=scItemById(si.itemId), skin=si.skinId?scItemById(si.skinId):null;
    return { key:(si.skinId||si.itemId), img:scImg(skin||it), cat:(it&&it.category)||'Other',
             gem: scGem(si.itemId)*(kind==='chest'?(Number(si.qty)||1):(Number(si.qty)||1)) };
  }).sort((a,b)=>b.gem-a.gem).forEach(o=>{ if(!seen.has(o.key)&&out.length<4){ seen.add(o.key); out.push(o); } });
  return out;
}
function scThumbHtml(shop, kind){
  const tiles = scThumbItems(shop, kind).map(o=>
    `<span class="sx-tile" style="--cat:${scCatColor(o.cat)};background-image:url('img/Item/${o.img}.webp');"></span>`
  ).join('');
  return `<span class="sx-thumb">
      <span class="sx-mosaic">${tiles}</span>
      <img class="sx-photo" src="${scEscAttr(scShopImgSrc(shop))}" alt="" loading="lazy" onerror="this.remove()">
    </span>`;
}

// ---------- calcul des lignes d'une boutique ----------
// Ordre d'affichage = ordre de saisie par défaut. r.i = index réel dans shop.items
// (les éditions et retraits doivent viser la donnée, jamais la ligne affichée).
function scComputeRows(shop, opts){
  const lang=scLang();
  const o=opts||{};
  const resources=Math.max(0,Number(shop.resources)||0);
  const resets=scResetsLeft(shop.endsAt);
  const rows=(shop.items||[]).map((si,i)=>{
    const it=scItemById(si.itemId);
    const skin=si.skinId?scItemById(si.skinId):null;   // variante visuelle : nom + image, jamais la valeur
    const qty=Math.max(1,Number(si.qty)||1), cost=Math.max(0,Number(si.cost)||0);
    const gem=scGem(si.itemId)*qty;
    const qtyMax=Math.max(0,Number(si.qtyMax)||0);
    const restant=(si.restant==null||si.restant==='')?qtyMax:Math.max(0,Number(si.restant)||0);
    const daily=!!si.dailyReset;
    const maxfin = daily ? restant*resets : restant;
    const obtenable = cost>0 ? Math.min(maxfin, Math.floor(resources/cost)) : 0;
    return { i, si, it, skin, qty, cost, gem, ratio: cost>0?gem/cost:0, restant, daily, maxfin,
             obtenable, coutobt: obtenable*cost, cat:(it&&it.category)||'Other',
             nameTxt: scLabel(it,skin,lang), img: scImg(skin||it) };
  });
  // Top = meilleur ratio. Pas de Top si toutes les lignes sont à égalité (l'info n'apprendrait rien).
  const maxRatio=rows.length?Math.max(...rows.map(r=>r.ratio)):0;
  const topCount=rows.filter(r=>r.ratio===maxRatio&&r.ratio>0).length;
  const showTop = maxRatio>0 && topCount>0 && topCount<rows.length;
  rows.forEach(r=>{ r.isTop = showTop && r.ratio===maxRatio && r.ratio>0; });

  let display=rows;
  if(o.sort&&o.sort.col){
    const st=o.sort;
    display=[...rows].sort((a,b)=>{
      if(st.col==='name'){ const x=a.nameTxt.toLowerCase(), y=b.nameTxt.toLowerCase(); return x<y?-st.dir:x>y?st.dir:0; }
      return ((a[st.col]||0)-(b[st.col]||0))*st.dir;
    });
  }
  return { rows: display, all: rows, maxRatio, resets };
}
// Coffre : pas de coût ni de monnaie, seulement la valeur du lot. Le meilleur choix est le lot le plus cher.
function scComputeChest(chest){
  const lang=scLang();
  const rows=(chest.items||[]).map((ci,i)=>{
    const it=scItemById(ci.itemId), skin=ci.skinId?scItemById(ci.skinId):null, qty=Number(ci.qty)||0;
    return { i, it, skin, qty, gem:scGem(ci.itemId)*qty, cat:(it&&it.category)||'Other',
             nameTxt: it?scLabel(it,skin,lang):ci.itemId, img: scImg(skin||it) };
  }).sort((a,b)=>b.gem-a.gem);
  const best = rows.length ? rows[0].gem : 0;
  rows.forEach(r=>{ r.isTop = best>0 && r.gem===best; });
  return { rows, best };
}
