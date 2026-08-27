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
    // — panier —
    kpiCurrency:"Ma monnaie", kpiSpent:"Dépensé", kpiLeft:"Restant", kpiValue:"Valeur obtenue",
    kpiLine:"objet choisi", kpiLines:"objets choisis", kpiOver:"Dépassement",
    hAvail:"Dispo", hTake:"Je prends", hTakeCost:"Coût", hTakeValue:"Valeur",
    cartTotal:"Total du panier", clearCart:"Vider le panier",
    perDay:"/jour", unlimited:"Illimité", lots:"lots",
    tipTake:"Nombre de lots que tu prévois d'acheter. Le solde et la valeur se recalculent aussitôt.",
    tipAvail:"Quantité maximale achetable d'ici la fin de l'événement, réinitialisations quotidiennes comprises.",
    overWarn:"Ton panier dépasse ta monnaie disponible.",
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
    tipCostObt:"Monnaie d'événement nécessaire pour la quantité « Obtenable ».",

    // --- valorisation € (vue séparée) ---
    viewGem:"Gemmes", viewEur:"Euros", viewLabel:"Lecture",
    hEur:"Valeur {c}", hTakeEur:"Valeur {c} tot.", kpiValueEur:"Valeur obtenue",
    curLabel:"Devise", noEur:"Valeur {c} inconnue pour cet objet",
    zoneEUR:"tarif zone euro TTC", zoneUSD:"tarif boutique en dollars",
    itemsEur:"Prix réel des objets", itemsEurSub:"Ce que chaque objet coûte vraiment, d'après les packs payants.",
    colPack:"Pack d'origine", noPack:"non précisé", multipack:"Multipack", seePack:"voir le pack",
    tipPack:"Le pack qui donne le plus de cet objet — donc le meilleur prix unitaire, puisque tous les packs coûtent le même prix. Survole un nom de pack pour le voir en image. « Multipack » : plusieurs packs sont à égalité, il n'y a donc pas d'image.",
    ieNote:"{n} objets sur les {t} du référentiel apparaissent dans un pack payant ; les autres n'ont aucun prix connu et ne sont donc pas listés ici. Relevé : {z}, mis à jour le {d}.",
    covered:"sur {n} des {t} objets valorisés", coveredAll:"tous les objets sont valorisés",
    tipEur:"Prix réel de l'objet, déduit du pack payant où il apparaît (prix du pack ÷ quantité). Un « — » signale un objet qu'aucun pack ne permet de chiffrer.",
    tipRatioEur:"Valeur en euros ÷ coût. Plus c'est élevé, meilleure est l'affaire.",
    eurNote:"Relevé des packs payants, {z}. Les deux lectures sont indépendantes : aucun taux de change n'est calculé entre gemmes et argent réel."

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
    kpiCurrency:"My currency", kpiSpent:"Spent", kpiLeft:"Remaining", kpiValue:"Value obtained",
    kpiLine:"item picked", kpiLines:"items picked", kpiOver:"Over budget",
    hAvail:"Available", hTake:"I take", hTakeCost:"Cost", hTakeValue:"Value",
    cartTotal:"Cart total", clearCart:"Clear cart",
    perDay:"/day", unlimited:"Unlimited", lots:"lots",
    tipTake:"How many lots you plan to buy. The balance and value update instantly.",
    tipAvail:"Maximum buyable by the event's end, daily resets included.",
    overWarn:"Your cart costs more than the currency you have.",
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
    tipCostObt:"Event currency needed for the “Obtainable” quantity.",

    // --- euro valuation (separate view) ---
    viewGem:"Gems", viewEur:"Euros", viewLabel:"Reading",
    hEur:"{c} value", hTakeEur:"{c} value tot.", kpiValueEur:"Value obtained",
    curLabel:"Currency", noEur:"No {c} value known for this item",
    zoneEUR:"euro-zone price incl. tax", zoneUSD:"US dollar store price",
    itemsEur:"Real-money item values", itemsEurSub:"What each item really costs, from the paid packs.",
    colPack:"Source pack", noPack:"not specified", multipack:"Multipack", seePack:"see the pack",
    tipPack:"The pack that gives the most of this item - so the best unit price, since every pack costs the same. Hover a pack name to see it. “Multipack”: several packs are tied, so there is no picture.",
    ieNote:"{n} of the {t} items in the reference table appear in a paid pack; the others have no known price and are not listed here. Survey: {z}, updated {d}.",
    covered:"on {n} of {t} items priced", coveredAll:"all items are priced",
    tipEur:"The item's real price, taken from the paid pack it appears in (pack price ÷ quantity). A “—” marks an item no pack can put a price on.",
    tipRatioEur:"Euro value ÷ cost. The higher it is, the better the deal.",
    eurNote:"Survey of the paid packs, {z}. The two readings are independent: no exchange rate is computed between gems and real money."

  }
};
function scLang(){ return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k){ return (i18nShop[scLang()]||i18nShop.FR)[k]; }
// Libellé de la lecture € : {c} = symbole de la devise active, {z} = provenance du tarif.
// Sans cela, passer en dollars laissait « Valeur € » au-dessus de cellules en $.
function scTc(k){ return String(scT(k)||'').replace('{c}', scCurSym()).replace('{z}', scT('zone'+scCur())); }
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
let SC_EURO={}, SC_EURO_META={}, SC_EURO_PACKS={};   // relevé € : ADMIN, lecture seule (jamais d'édition joueur)

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

// ---------- valorisation € : vue et devise ----------
// La VUE vit dans l'URL (?v=eur) pour qu'un lien partagé ouvre la bonne lecture, et se
// retient d'une boutique à l'autre dans une clé « chrome » (même nature que hub_lang /
// hub_theme, donc hors registre STORAGE_KEYS : le relevé € lui-même est en lecture seule).
const SC_VIEW_KEY='shop_view', SC_CUR_KEY='shop_currency';
function scChromeGet(k,def){ try{ return localStorage.getItem(k)||def; }catch(e){ return def; } }
function scChromeSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

let SC_VIEW=null, SC_CUR=null;
function scView(){
  if(SC_VIEW) return SC_VIEW;
  let v=null;
  try{ v=new URLSearchParams(location.search).get('v'); }catch(e){}
  if(v==='eur' || v==='gem'){
    // Lien partagé : la lecture demandée devient la préférence, sinon elle serait perdue
    // dès la première navigation vers une autre boutique.
    SC_VIEW = v; scChromeSet(SC_VIEW_KEY, v); return SC_VIEW;
  }
  v=scChromeGet(SC_VIEW_KEY,'gem');
  SC_VIEW = (v==='eur') ? 'eur' : 'gem';
  return SC_VIEW;
}
function scSetView(v){
  SC_VIEW = (v==='eur') ? 'eur' : 'gem';
  scChromeSet(SC_VIEW_KEY, SC_VIEW);
  try{
    const u=new URL(location.href);
    if(SC_VIEW==='eur') u.searchParams.set('v','eur'); else u.searchParams.delete('v');
    history.replaceState(null,'',u);
  }catch(e){}
}
function scIsEur(){ return scView()==='eur'; }

function scCur(){
  if(SC_CUR) return SC_CUR;
  SC_CUR = (scChromeGet(SC_CUR_KEY,'EUR')==='USD') ? 'USD' : 'EUR';
  return SC_CUR;
}
function scSetCur(c){ SC_CUR = (c==='USD')?'USD':'EUR'; scChromeSet(SC_CUR_KEY, SC_CUR); }
function scCurSym(){ return scCur()==='USD' ? '$' : '\u20AC'; }

// Prix UNITAIRE dans la devise active = prix du pack / quantité obtenue.
// CALCULÉ, jamais stocké : le relevé ne garde que ce qui a été mesuré (le prix du pack et
// la quantité). Stocker aussi le résultat de la division en ferait une seconde vérité,
// qui divergerait de la première dès la moindre correction de prix — et l'arrondi de la
// valeur stockée était de toute façon moins précis que la division elle-même.
// Renvoie null et jamais 0 quand aucun pack ne chiffre l'objet : « inconnu » n'est pas
// « sans valeur » — un 0 placerait la ligne en pire affaire et renverserait le podium
// des boutiques mal couvertes.
function scEurUnit(id){
  const r=SC_EURO[id]; if(!r) return null;
  // Le prix du pack est le MÊME pour tous (relevé sur les packs à 6 € / 5 $) : il vit dans
  // _meta, pas répété 55 fois. La quantité, elle, est propre à chaque objet.
  const p = (scCur()==='USD') ? SC_EURO_META.packPriceUsd : SC_EURO_META.packPrice;
  const q = Number(r.qty);
  return (typeof p==='number' && isFinite(p) && q>0) ? (p/q) : null;
}

// Packs qui atteignent la quantité MAXIMALE pour cet objet. Tous les packs coûtant le même
// prix, « le plus d'exemplaires » = « le meilleur prix unitaire » : ce sont donc les packs
// à recommander. UN seul => son image illustre l'objet. PLUSIEURS => « multipack », sans image.
function scEurPacks(id){ const r=SC_EURO[id]; return (r && Array.isArray(r.packs)) ? r.packs : []; }
function scPackName(pid){
  const p=SC_EURO_PACKS[pid];
  return p ? (p[scLang()] || p.EN || p.FR || pid) : pid;
}
// Libellé de la colonne « Pack d'origine » : le nom du pack, ou « Multipack » à égalité.
function scEurSrc(id){
  const ps=scEurPacks(id);
  if(!ps.length) return '';
  return ps.length===1 ? scPackName(ps[0]) : scT('multipack');
}
// Id de l'image du pack — seulement quand un SEUL pack atteint le maximum.
// (L'aperçu d'image au survol est prévu mais pas encore implémenté : img/packs/<id>.webp.)
function scEurPackImg(id){ const ps=scEurPacks(id); return ps.length===1 ? ps[0] : null; }

// ---------- formats € : décimales adaptatives ----------
// Un nombre de décimales fixe écrase les petites valeurs : à 2 décimales, les trois lignes
// d'Accélérateur 1h du Stand d'Aventure afficheraient toutes le même chiffre. Le ratio
// descend jusqu'à 6 décimales (Arène, Magasin des Marées).
function scFmtFix(v,d){
  return Number(v).toLocaleString(scLang()==='FR'?'fr-FR':'en-US',
    {minimumFractionDigits:d, maximumFractionDigits:d});
}
function scFmtEur(v){
  if(v==null) return null;
  const a=Math.abs(v), d = a>=100?0 : a>=1?2 : a>=0.01?3 : (a===0?2:4);
  const n=scFmtFix(v,d);
  // Le symbole se place selon la LANGUE, pas selon la devise : « 35,94 € » et « 2,50 $ »
  // en francais, « EUR35.94 » et « $2.50 » en anglais. Melanger les deux conventions
  // (« $0,882 ») se lit comme une coquille.
  return scLang()==='FR' ? (n+'\u00A0'+scCurSym()) : (scCurSym()+n);
}
function scFmtRatio(v){
  if(v==null) return null;
  const a=Math.abs(v), d = a>=10?1 : a>=0.1?3 : a>=0.001?4 : 6;
  return scFmtFix(v,d);
}
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

// Relevé € : fichier ADMIN en lecture seule, comme les boutiques classiques.
// Aucun localStorage : la donnée est régénérable d'un bloc depuis le relevé interne.
async function scLoadEuro(){
  try{
    const d=await (await fetch('data/shopcalc_euro.json')).json();
    SC_EURO=(d&&d.items)||{}; SC_EURO_META=(d&&d._meta)||{}; SC_EURO_PACKS=(d&&d.packs)||{};
  }
  catch(e){ console.error('euro',e); SC_EURO={}; SC_EURO_META={}; SC_EURO_PACKS={}; }
}

async function scLoadChests(){
  try{ SC_CHESTS = await (await fetch('data/shopcalc_chests.json')).json(); }
  catch(e){ console.error('chests',e); SC_CHESTS=[]; }
}
async function scLoadAll(){ await scLoadItems(); await scLoadClassic(); await scLoadEvents(); await scLoadChests(); await scLoadEuro(); }

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
// La valeur retenue est celle du LOT (valeur unitaire × quantité), coffres compris — d'où
// l'absence de `kind` ici, contrairement au reste des helpers de boutique.
function scThumbItems(shop){
  const seen=new Set(), out=[];
  (shop.items||[]).map(si=>{
    const it=scItemById(si.itemId), skin=si.skinId?scItemById(si.skinId):null;
    return { key:(si.skinId||si.itemId), img:scImg(skin||it), cat:(it&&it.category)||'Other',
             gem: scGem(si.itemId)*(Number(si.qty)||1) };
  }).sort((a,b)=>b.gem-a.gem).forEach(o=>{ if(!seen.has(o.key)&&out.length<4){ seen.add(o.key); out.push(o); } });
  return out;
}
function scThumbHtml(shop){
  const tiles = scThumbItems(shop).map(o=>
    `<span class="sx-tile" style="--cat:${scCatColor(o.cat)};background-image:url('img/Item/${o.img}.webp');"></span>`
  ).join('');
  return `<span class="sx-thumb">
      <span class="sx-mosaic">${tiles}</span>
      <img class="sx-photo" src="${scEscAttr(scShopImgSrc(shop))}" alt="" loading="lazy" onerror="this.remove()">
    </span>`;
}

// ---------- calcul des lignes d'une boutique ----------
// r.i = index réel dans shop.items : les éditions et retraits doivent viser la donnée,
// jamais la ligne affichée (qui peut être triée).
//
// PANIER — `si.take` = nombre de lots que l'utilisateur prévoit d'acheter. Le calcul se fait
// en deux passes : d'abord ce que coûte la sélection, ensuite seulement ce qu'il reste
// prenable sur chaque ligne (qui dépend du solde restant, donc de toutes les autres lignes).
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
    // Valeur € du LOT (qty x prix unitaire), par parallélisme avec la colonne gemmes.
    // null quand aucun pack ne chiffre l'objet — surtout pas 0.
    const eu=scEurUnit(si.itemId);
    const eur = (eu!=null) ? eu*qty : null;
    const qtyMax=Math.max(0,Number(si.qtyMax)||0);
    const restant=(si.restant==null||si.restant==='')?qtyMax:Math.max(0,Number(si.restant)||0);
    const daily=!!si.dailyReset;
    const maxfin = daily ? restant*resets : restant;
    const obtenable = cost>0 ? Math.min(maxfin, Math.floor(resources/cost)) : 0;
    const take = Math.max(0, Math.min(maxfin, Math.floor(Number(si.take)||0)));
    return { i, si, itemId: si.itemId, it, skin, qty, cost, gem, ratio: cost>0?gem/cost:0, restant, daily, maxfin,
             obtenable, coutobt: obtenable*cost, cat:(it&&it.category)||'Other',
             take, takeCost: take*cost, takeGem: take*gem,
             eur, ratioEur: (eur!=null && cost>0) ? eur/cost : null,
             takeEur: (eur!=null) ? take*eur : null,
             nameTxt: scLabel(it,skin,lang), img: scImg(skin||it) };
  });

  // Bilan du panier, puis « encore prenable » ligne par ligne sur le solde restant.
  const spent = rows.reduce((s,r)=>s+r.takeCost, 0);
  const gems  = rows.reduce((s,r)=>s+r.takeGem, 0);
  const eurs  = rows.reduce((s,r)=>s+(r.takeEur||0), 0);
  const left  = resources - spent;
  rows.forEach(r=>{
    r.canTake = r.cost>0 ? Math.max(0, Math.min(r.maxfin-r.take, Math.floor(Math.max(0,left)/r.cost))) : 0;
  });
  const cart = { resources, spent, left, gems, eur: eurs, over: spent>resources,
                 lines: rows.filter(r=>r.take>0).length,
                 // Couverture € de la boutique : la tuile de bilan l'annonce, pour qu'un
                 // total partiel ne se lise pas comme un total complet.
                 eurCovered: rows.filter(r=>r.eur!=null).length, eurTotal: rows.length,
                 // Couverture des seules lignes PRISES : la tuile affiche le total du
                 // panier, sa réserve doit donc porter sur le panier, pas sur la boutique.
                 takeCovered: rows.filter(r=>r.take>0 && r.eur!=null).length,
                 takeTotal:   rows.filter(r=>r.take>0).length };
  // Top = meilleur ratio. Pas de Top si toutes les lignes sont à égalité (l'info n'apprendrait rien).
  const maxRatio=rows.length?Math.max(...rows.map(r=>r.ratio)):0;
  const topCount=rows.filter(r=>r.ratio===maxRatio&&r.ratio>0).length;
  const showTop = maxRatio>0 && topCount>0 && topCount<rows.length;
  rows.forEach(r=>{ r.isTop = showTop && r.ratio===maxRatio && r.ratio>0; });
  // Classement € : seules les lignes chiffrées concourent. Une valeur absente n'est ni
  // « Top » ni comparée a zero — sinon le podium des boutiques mal couvertes s'inverse.
  const eurRows=rows.filter(r=>r.ratioEur!=null && r.ratioEur>0);
  const maxRatioEur=eurRows.length?Math.max(...eurRows.map(r=>r.ratioEur)):0;
  const topEurCount=eurRows.filter(r=>r.ratioEur===maxRatioEur).length;
  // Comparaison à rows.length et non à eurRows.length : avec un seul objet valorisé,
  // eurRows.length vaut 1 et la ligne n'aurait jamais son « Top » — alors que le podium
  // la classe bien 1re. On ne retire le badge que si TOUTES les lignes sont à égalité.
  const showTopEur = maxRatioEur>0 && topEurCount>0 && topEurCount<rows.length;
  rows.forEach(r=>{ r.isTopEur = showTopEur && r.ratioEur===maxRatioEur; });

  let display=rows;
  if(o.sort&&o.sort.col){
    const st=o.sort;
    display=[...rows].sort((a,b)=>{
      if(st.col==='name'){ const x=a.nameTxt.toLowerCase(), y=b.nameTxt.toLowerCase(); return x<y?-st.dir:x>y?st.dir:0; }
      // « Inconnu » n'est pas une petite valeur : les lignes sans valeur € restent en
      // fin de tri quel que soit le sens.
      const av=a[st.col], bv=b[st.col];
      if(av==null && bv==null) return 0;
      if(av==null) return 1;
      if(bv==null) return -1;
      return ((av||0)-(bv||0))*st.dir;
    });
  }
  return { rows: display, all: rows, maxRatio, maxRatioEur, resets, cart };
}

function scClearCart(shop){ (shop.items||[]).forEach(si=>{ si.take = 0; }); }
// Coffre : pas de coût ni de monnaie, seulement la valeur du lot. Le meilleur choix est le lot le plus cher.
function scComputeChest(chest){
  const lang=scLang();
  const rows=(chest.items||[]).map((ci,i)=>{
    const it=scItemById(ci.itemId), skin=ci.skinId?scItemById(ci.skinId):null, qty=Number(ci.qty)||0;
    const eu=scEurUnit(ci.itemId);
    return { i, itemId: ci.itemId, it, skin, qty, gem:scGem(ci.itemId)*qty, eur:(eu!=null)?eu*qty:null,
             cat:(it&&it.category)||'Other',
             nameTxt: it?scLabel(it,skin,lang):ci.itemId, img: scImg(skin||it) };
  });
  // Le tri suit la lecture active. En euros, un lot non chiffre part en fin de liste :
  // il n'est pas « le moins bon », il est inconnu.
  const eurView=scIsEur();
  rows.sort((a,b)=> eurView
    ? ((b.eur==null?-1:b.eur)-(a.eur==null?-1:a.eur))
    : (b.gem-a.gem));
  const best = rows.length ? Math.max(...rows.map(r=>r.gem)) : 0;
  const eurVals = rows.filter(r=>r.eur!=null).map(r=>r.eur);
  const bestEur = eurVals.length ? Math.max(...eurVals) : 0;
  rows.forEach(r=>{ r.isTop = best>0 && r.gem===best; r.isTopEur = bestEur>0 && r.eur===bestEur; });
  return { rows, best, bestEur };
}
