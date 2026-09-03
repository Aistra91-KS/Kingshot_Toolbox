// ============================================================
//  SHOP EVENT — valorisation d'un événement (achats/jour → % récupéré)
//  Chargé APRÈS shop-page.js sur les pages boutique qui ont un fichier
//  data/events/<slug>.json. Sans ce fichier (404), le module reste inerte :
//  la page boutique se comporte exactement comme avant.
//
//  Principe : l'utilisateur coche ce qu'il a acheté chaque jour de
//  l'événement (ou rien = F2P). Le module additionne TOUT ce que
//  l'événement rapporte — missions quotidiennes, pack gratuit, piste
//  gratuite, paliers de points, contenu des packs — plus la valeur du
//  panier composé dans le tableau boutique, et compare cette valeur en
//  argent réel à la dépense réelle : la « valorisation » en %.
//  Le % vit entièrement dans l'échelle € / $ (dépense et valeur dans la
//  même devise) : aucun taux gemme↔euro n'est calculé, conformément à la
//  règle des deux lectures indépendantes.
// ============================================================

const i18nShopEvent = {
  FR: {
    evTitle: "Valorisation de l'événement",
    evIntro: "Coche ce que tu as acheté chaque jour — ou rien si tu es F2P. L'outil additionne tout ce que l'événement rapporte (missions, pack gratuit, piste gratuite, paliers, packs) plus ton panier de la boutique ci-dessus, et compare cette valeur à ta dépense réelle.",
    evSpent: "Dépensé", evValue: "Valeur récupérée", evRatio: "Valorisation", evCoins: "Monnaie prévue",
    evBuy: "achat", evBuys: "achats", evNoBuy: "aucun achat",
    evPlayed: "Jours joués", evPlayedSub: "jours joués",
    evF2p: "F2P", evF2pSub: "Tout est gagné, rien n'est dépensé",
    evFromMilestones: "dont {n} des paliers ({r} atteints)",
    evUseBudget: "Utiliser comme budget",
    evBudgetTip: "Reporte cette monnaie dans « Ma monnaie » du tableau ci-dessus, pour voir ce que tu peux réellement acheter.",
    evBudgetDone: "Budget boutique mis à jour : {n}.",
    evBudgetOk: "reporté dans « Ma monnaie »",
    evMyBuys: "Mes achats de l'événement",
    evPack: "Pack", evPrice: "Prix", evDay: "J",
    evPerDay: "max {n}/jour", evOnce: "achat unique", evMaxTotal: "{n} pour l'événement",
    evPurchaseChk: "Mission « {m} » validée ?",
    evExploreTiers: "{n} palier(s) sur {t}",
    evExploreTip: "Le nombre d'Amulettes que tu as DÉPENSÉES depuis le début de l'événement — c'est lui qui débloque les paliers, pas le nombre d'amulettes en poche. Les paliers se cumulent : tout ce qui est en dessous de ton total est déjà acquis.",
    evOutside: "Jours d'achat ailleurs",
    evOutsideTip: "Cette mission est QUOTIDIENNE : elle demande un achat chaque jour. Indique ici le nombre de jours où tu as acheté un pack AILLEURS dans le jeu (un autre événement) — ils s'ajoutent aux jours cochés dans la grille.",
    evPurchaseChkTip: "Coche si tu as validé cette mission, y compris avec un achat fait AILLEURS dans le jeu : n'importe quel achat la valide, et plusieurs événements tournent en même temps. Inutile si tu as déjà coché un achat dans la grille.",
    evDailyTot: "Dépense du jour",
    evBtnF2p: "Je suis F2P (tout décocher)",
    evF2pConfirm: "Effacer tous les achats cochés ?",
    evDetail: "Détail des gains",
    evColItem: "Objet", evColQty: "Qté", evColGem: "Valeur gemmes", evColEur: "Valeur {c}",
    evColSrc: "Provenance",
    evTipSrc: "D'où vient la quantité. Les deux plus gros apports sont affichés ; survole la case pour voir le détail complet.",
    evSrcMissions: "Missions", evSrcDouble: "Doublement", evSrcFree: "Pack gratuit",
    evSrcSeason: "Saisonnières", evSeasonNote: "Les missions saisonnières ne se réclament qu'une fois pour tout l'événement ; celles qui exigent un nombre de jours ou un achat n'entrent au calcul qu'une fois la condition remplie.",
    evSrcWaypost: "Visiteur de Passage", evSrcTravel: "Piste voyage", evSrcMilestones: "Paliers",
    evSrcExplore: "Paliers d'exploration",
    evSrcMore: "+{n}",
    evTotalRow: "Total des gains",
    evTotalCount: "{n} objets comptés sur {t}",
    evTipChk: "Chaque objet compte dans le total et dans la valorisation. Décoche ceux qui ne t'intéressent pas : ils sortent aussitôt du calcul.",
    evChkLbl: "Compter « {x} » dans la valorisation",
    evCurrencies: "Monnaies de l'événement",
    evCoinsRow: "Pièces d'Aventure", evStallRow: "Points de Vente", evTravelRow: "Points de Voyage",
    evCoinsRowSub: "se dépensent dans la boutique ci-dessus",
    evStallRowSub: "{r} palier(s) atteint(s) → +{n} pièces",
    evTravelRowSub: "{r} palier(s) franchi(s) — un tous les {e} points à partir de {f}",
    evEurExcl: "Valeur € écartée du calcul : le pack d'origine ne chiffre pas cet objet de façon représentative.",
    evPurchaseNote: "La mission « faire un achat » compte {n} jour(s) : ceux cochés dans la grille, plus tes achats faits ailleurs.",
    evCartIn: "Panier boutique compté : {v} ({n} objets choisis)",
    evCartEmpty: "Panier boutique vide — choisis des objets dans le tableau ci-dessus pour valoriser ta monnaie.",
    evSrcNote: "Relevé {tier}. La monnaie de l'événement n'a pas de valeur propre : elle vaut ce que tu en tires dans la boutique.",
    evQ0: "Mauvaise affaire", evQ1: "Correct", evQ2: "Bon", evQ3: "Très bon", evQ4: "Excellent",
    evTipRatio: "Valeur récupérée ÷ dépense, en argent réel. 100 % = tu récupères exactement ta mise."
  },
  EN: {
    evTitle: "Event value check",
    evIntro: "Tick what you bought each day — or nothing if you are F2P. The tool adds up everything the event gives (missions, free pack, free track, milestones, packs) plus your cart in the shop above, and compares that value to what you actually spent.",
    evSpent: "Spent", evValue: "Value recovered", evRatio: "Value ratio", evCoins: "Currency expected",
    evBuy: "purchase", evBuys: "purchases", evNoBuy: "no purchase",
    evPlayed: "Days played", evPlayedSub: "days played",
    evF2p: "F2P", evF2pSub: "Everything is gained, nothing is spent",
    evFromMilestones: "incl. {n} from milestones ({r} reached)",
    evUseBudget: "Use as budget",
    evBudgetTip: "Copies this currency into “My currency” of the table above, to see what you can actually buy.",
    evBudgetDone: "Shop budget updated: {n}.",
    evBudgetOk: "copied into “My currency”",
    evMyBuys: "My event purchases",
    evPack: "Pack", evPrice: "Price", evDay: "D",
    evPerDay: "max {n}/day", evOnce: "single purchase", evMaxTotal: "{n} for the whole event",
    evPurchaseChk: "\u201C{m}\u201D mission done?",
    evExploreTiers: "{n} of {t} milestones",
    evExploreTip: "How many Amulets you have SPENT since the event started - that is what unlocks the milestones, not how many you are holding. Milestones stack: everything below your total is already yours.",
    evOutside: "Days bought elsewhere",
    evOutsideTip: "This mission is DAILY: it needs a purchase every day. Enter how many days you bought a pack SOMEWHERE ELSE in the game (another event) - they add to the days ticked in the grid.",
    evPurchaseChkTip: "Tick this if you cleared that mission, including with a purchase made SOMEWHERE ELSE in the game: any purchase clears it, and several events run at once. Not needed if you already ticked a purchase in the grid.",
    evDailyTot: "Day's spend",
    evBtnF2p: "I'm F2P (untick all)",
    evF2pConfirm: "Clear every ticked purchase?",
    evDetail: "Reward breakdown",
    evColItem: "Item", evColQty: "Qty", evColGem: "Gem value", evColEur: "{c} value",
    evColSrc: "Where from",
    evTipSrc: "Where the quantity comes from. The two biggest sources are shown; hover the cell for the full breakdown.",
    evSrcMissions: "Missions", evSrcDouble: "Doubled", evSrcFree: "Free pack",
    evSrcSeason: "Seasonal", evSeasonNote: "Seasonal missions are claimed once for the whole event; those needing a number of days or a purchase only count once the condition is met.",
    evSrcWaypost: "Waypost", evSrcTravel: "Travel track", evSrcMilestones: "Milestones",
    evSrcExplore: "Exploration track",
    evSrcMore: "+{n}",
    evTotalRow: "Rewards total",
    evTotalCount: "{n} of {t} items counted",
    evTipChk: "Every item counts toward the total and the value ratio. Untick the ones you don't care about: they leave the math right away.",
    evChkLbl: "Count \u201C{x}\u201D toward the value",
    evCurrencies: "Event currencies",
    evCoinsRow: "Adventure Coins", evStallRow: "Stall Points", evTravelRow: "Travel Points",
    evCoinsRowSub: "spent in the shop above",
    evStallRowSub: "{r} milestone(s) reached → +{n} coins",
    evTravelRowSub: "{r} tier(s) passed - one every {e} points from {f} on",
    evEurExcl: "€ value left out: the source pack does not price this item in a representative way.",
    evPurchaseNote: "The “make a purchase” mission counts {n} day(s): those ticked in the grid, plus the purchases you made elsewhere.",
    evCartIn: "Shop cart counted: {v} ({n} items picked)",
    evCartEmpty: "Shop cart is empty — pick items in the table above to turn your currency into value.",
    evSrcNote: "Survey {tier}. The event currency has no value of its own: it is worth what you take from the shop.",
    evQ0: "Bad deal", evQ1: "Fair", evQ2: "Good", evQ3: "Very good", evQ4: "Excellent",
    evTipRatio: "Value recovered ÷ spend, in real money. 100% = you get exactly your money back."
  }
};
function seT(k){ return (i18nShopEvent[scLang()]||i18nShopEvent.FR)[k]; }
function seTf(k, repl){
  let s = String(seT(k)||'');
  Object.keys(repl||{}).forEach(x=>{ s = s.replace('{'+x+'}', repl[x]); });
  return s;
}
// Jumeau de scTip() sur CE dictionnaire : scTip ne lit que i18nShop, une clé d'ici
// y ressortirait en bulle vide (le « i » s'affiche, mais sans texte au survol).
function seTip(k){ return window.HelpSystem ? HelpSystem.tip({FR:i18nShopEvent.FR[k], EN:i18nShopEvent.EN[k]}) : ''; }

let SE_DATA = null;                  // data/events/<slug>.json
let SE_PLANS = {};                   // tous les plans persistés, par id d'événement
let SE_PLAN = null;                  // plan de CET événement { played, buys:{packId:{day:count}}, open }
const SE_UI = { detail:false };      // états d'affichage de session (non persistés)

function seEventKey(){ return SE_DATA && SE_DATA._meta && SE_DATA._meta.event; }
function seDays(){ return Math.max(1, Number(SE_DATA._meta.days)||1); }
function seSave(){
  SE_PLANS[seEventKey()] = SE_PLAN;
  localStorage.setItem(STORAGE_KEYS.shopcalcEventPlans, JSON.stringify(SE_PLANS));
}
function seName(o){ const n=o&&o.name; if(!n) return ''; return n[scLang()]||n.EN||n.FR||''; }
// Libellé COURT d'un pack, pour la colonne « Provenance » (le nom complet y déborderait).
function seShort(p){ const n=p&&p.short; return n ? (n[scLang()]||n.EN||n.FR) : seName(p); }
// Nom d'une monnaie secondaire : donné par l'événement (_meta.stallName / travelName),
// sinon repli sur le dictionnaire. La monnaie PRINCIPALE, elle, n'est jamais redite ici :
// c'est celle de la boutique (`resourceName`), une seule source de vérité.
// La (seule) mission conditionnée par un achat, quotidienne ou saisonnière : c'est son
// nom qui étiquette la case à cocher, pour que le joueur reconnaisse SA mission.
function sePurchaseMission(){
  return ((SE_DATA.missions||[]).concat(SE_DATA.seasonalMissions||[]))
    .find(m=>m.requiresPurchase) || null;
}
// QUOTIDIENNE ou SAISONNIÈRE : la différence n'est pas cosmétique. Une mission
// quotidienne réclame un achat CHAQUE jour — une seule case à cocher la validerait sur
// tous les jours joués, ce qui surestime. Elle reçoit donc un compteur de jours, là où
// la saisonnière (réclamée une fois) se contente d'une case.
function seHasDailyPurchase(){ return (SE_DATA.missions||[]).some(m=>m.requiresPurchase); }
function seCurName(metaKey, fallbackKey){
  const n = SE_DATA._meta && SE_DATA._meta[metaKey];
  return n ? (n[scLang()]||n.EN||n.FR) : seT(fallbackKey);
}

// ---------- calcul ----------
// Accumule un « paquet de récompenses » { coins, stall, travel, items[] } dans tot.
// Les items portent un itemId du référentiel (valorisables) ou un simple label
// (listés, jamais valorisés — règle du « — » : inconnu n'est pas zéro).
// `only` (optionnel) restreint ce qui est ajouté : c'est ce qui sert aux pass qui
// DOUBLENT les missions quotidiennes. Un tel pass ne rejoue pas toute la mission, mais
// seulement les récompenses que sa fiche en jeu affiche comme doublées.
function seAdd(tot, bundle, mult, only, src){
  if(!bundle || !mult) return;
  const keep = k => !only || only[k] === true;
  // Chaque apport est tracé par sa source (`src`) : c'est ce qui permet à la colonne
  // « Provenance » d'expliquer une quantité sans que le lecteur ait à refaire le calcul.
  // Un même libellé revenant plusieurs fois (un pack racheté chaque jour) se cumule.
  const note = (bag, qty) => {
    if(!src || !qty) return;
    const e = bag[src] || { qty:0, times:0 };
    e.qty += qty; e.times += mult; bag[src] = e;
  };
  const addCur = k => {
    if(!keep(k)) return;
    const v = (Number(bundle[k]) || 0) * mult;
    if(!v) return;
    tot[k] += v; note(tot.cur[k], v);
  };
  addCur('coins'); addCur('stall'); addCur('travel');
  (bundle.items||[]).forEach(it=>{
    if(only && (only.itemIds||[]).indexOf(it.itemId) < 0) return;
    const q = (Number(it.qty)||0) * mult;
    if(it.itemId){
      const cur = tot.items[it.itemId] || { qty:0, eurExclude:false, src:{} };
      cur.qty += q;
      if(it.eurExclude) cur.eurExclude = true;
      note(cur.src, q);
      tot.items[it.itemId] = cur;
    } else if(it.label){
      const key = it.label.EN || 'extra';
      const cur = tot.extras[key] || { label: it.label, qty:0, src:{} };
      cur.qty += q;
      note(cur.src, q);
      tot.extras[key] = cur;
    }
  });
}
// Sources d'une quantité, de la plus grosse à la plus petite.
function seSrcList(bag){
  return Object.keys(bag||{})
    .map(k=>({ label:k, qty:bag[k].qty, times:bag[k].times }))
    .sort((a,b)=> b.qty - a.qty);
}

function seBuysCount(packId, day){
  const b = SE_PLAN.buys[packId];
  return b ? (Number(b[day])||0) : 0;
}
function seBuysAt(day){
  return (SE_DATA.packs||[]).reduce((s,p)=> s + seBuysCount(p.id, day), 0);
}

/* `upTo` (optionnel) borne le calcul aux `upTo` PREMIERS JOURS de l'événement :
   ce que le plan a versé À CETTE DATE, packs des jours suivants exclus. Omis, le
   comportement est celui d'avant — tout l'événement. Sert aux modules greffés qui
   doivent distinguer « ce que j'ai déjà » de « ce que le plan versera encore » ;
   le refaire de leur côté les obligerait à recopier les règles ci-dessous
   (jours joués, missions à achat, exclusions du détail) et à dériver dès qu'elles
   bougent. */
function seCompute(upTo){
  const days = seDays();
  const cap = (upTo === undefined || upTo === null) ? days : Math.max(0, Math.min(days, Math.floor(upTo)));
  const played = Math.max(0, Math.min(cap, Number(SE_PLAN.played)||0));
  const tot = { coins:0, stall:0, travel:0, items:{}, extras:{},
                cur:{ coins:{}, stall:{}, travel:{} } };

  // Jours où une mission « faire un achat » se valide. Deux apports :
  //  · les jours cochés dans la grille de CET événement ;
  //  · `outsideBuys`, les jours où le joueur a acheté AILLEURS — en jeu, ces missions se
  //    valident avec n'importe quel achat, et plusieurs événements tournent en même
  //    temps. Sans ce complément, l'outil sous-estimait le gain de qui joue deux
  //    événements de front (constaté sur un relevé réel : 230 essences contre 195).
  // Bornée par les jours joués : une mission quotidienne se réclame en jeu.
  let gridBuyDays = 0;
  for(let d=1; d<=cap; d++) if(seBuysAt(d) > 0) gridBuyDays++;
  // `purchaseOk` = le joueur déclare la mission validée, typiquement par un achat fait
  // AILLEURS. Une mission saisonnière ne se réclamant qu'une fois, il lui suffit que ce
  // compte soit > 0 ; une mission quotidienne, elle, la coche vaut alors pour tous les
  // jours joués (c'est ce que le joueur affirme, l'info-bulle le dit).
  const dailyBuy = seHasDailyPurchase();
  const purchaseOk = !!SE_PLAN.purchaseOk;
  const outsideBuys = Math.max(0, Math.min(cap, Number(SE_PLAN.outsideBuys)||0));
  // Mission quotidienne -> des JOURS s'ajoutent ; mission saisonnière -> un seul achat
  // suffit, la case vaut 1. Dans les deux cas le total reste borné par les jours joués.
  const outside = dailyBuy ? outsideBuys : (purchaseOk ? 1 : 0);
  const purchaseDays = Math.min(gridBuyDays + outside, played);

  // Les packs sont dépouillés EN PREMIER : l'un d'eux peut être un pass qui double les
  // missions quotidiennes, et il faut le savoir avant de compter ces missions.
  // Un pack « once » donne son lot immédiat (acquis à l'achat, même sans revenir) puis,
  // s'il en a, ses récompenses quotidiennes ; les autres donnent leur lot à chaque achat.
  let spend = 0, buysTotal = 0, dblRule = null, dblSpan = 0;
  (SE_DATA.packs||[]).forEach(p=>{
    const price = (scCur()==='USD') ? Number(p.priceUsd)||0 : Number(p.priceEur)||0;
    if(p.once){
      let buyDay = 0;
      for(let d=1; d<=cap; d++) if(seBuysCount(p.id, d) > 0){ buyDay = d; break; }
      if(buyDay){
        spend += price; buysTotal += 1;
        const lbl = seShort(p);
        seAdd(tot, p.immediate, 1, null, lbl);
        seAdd(tot, p.daily, Math.min(cap - buyDay + 1, played), null, lbl);
        // Pass « Double! Daily Mission rewards » : il n'ajoute aucun lot quotidien
        // propre, il rejoue une seconde fois une PARTIE des récompenses de mission,
        // du jour de l'achat jusqu'à la fin de l'événement.
        if(p.doublesDailyMissions){ dblRule = p.doublesDailyMissions; dblSpan = cap - buyDay + 1; }
      }
    } else {
      for(let d=1; d<=cap; d++){
        const n = seBuysCount(p.id, d);
        if(n){ spend += price*n; buysTotal += n; seAdd(tot, p.reward, n, null, seShort(p)); }
      }
    }
  });

  // Missions quotidiennes (× jours joués), puis leur doublement éventuel. Le pack
  // gratuit et la piste Waypost ne sont PAS des missions : un pass ne les double pas
  // — vérifié contre un relevé in-game, c'est ce qui fait tomber le compte juste.
  (SE_DATA.missions||[]).forEach(m=>{
    const n = m.requiresPurchase ? purchaseDays : played;
    seAdd(tot, m, n, null, seT('evSrcMissions'));
    // Faute de savoir QUELS jours ont été joués, on borne le bonus par la fenêtre du
    // pass : au pire il double moins de jours qu'en réalité, jamais plus.
    if(dblRule) seAdd(tot, m, Math.min(n, dblSpan), dblRule, seT('evSrcDouble'));
  });
  // Missions saisonnières : une seule fois pour tout l'événement, sous condition
  // (`minDays` jours joués, et/ou au moins un achat). Elles ne sont PAS doublées par un
  // pass — ce sont des paliers de saison, pas des missions du jour.
  (SE_DATA.seasonalMissions||[]).forEach(m=>{
    const okDays = !m.minDays || played >= m.minDays;
    const okBuy  = !m.requiresPurchase || purchaseDays > 0;
    if(okDays && okBuy) seAdd(tot, m, 1, null, seT('evSrcSeason'));
  });
  seAdd(tot, SE_DATA.freeDailyPack, played, null, seT('evSrcFree'));
  if(played > 0) seAdd(tot, SE_DATA.waypost, 1, null, seT('evSrcWaypost'));

  // Paliers de points : chaque palier atteint verse son bonus de pièces.
  let msCoins = 0, msReached = 0;
  (SE_DATA.stallMilestones||[]).forEach(m=>{
    if(tot.stall >= m.points){ msCoins += Number(m.coins)||0; msReached++; }
  });
  const coins = tot.coins + msCoins;
  if(msCoins) tot.cur.coins[seT('evSrcMilestones')] = { qty: msCoins, times: msReached };

  // Piste des Points de Voyage : une récompense tous les `every` points à partir de
  // `from`, RÉPÉTÉE sans plafond (4500, 5000, 5500 …). Elle doit être versée avant la
  // valorisation, puisqu'elle ajoute des objets (gemmes + accélérateurs) au butin.
  const tv = SE_DATA.travelMilestones;
  let tvTiers = 0;
  if(tv && tot.travel >= tv.from && tv.every > 0){
    tvTiers = Math.floor((tot.travel - tv.from) / tv.every) + 1;
    seAdd(tot, tv.reward, tvTiers, null, seT('evSrcTravel'));
  }

  // Paliers d'exploration : une piste de récompenses en OBJETS, débloquée par les
  // Amulettes DÉPENSÉES — un nombre que le joueur saisit, et non un total calculé à
  // partir de ses achats. C'est voulu : l'amulette ne se dépense pas en boutique, elle
  // alimente un tirage aléatoire, et rien dans le plan ne permet de deviner combien le
  // joueur en a réellement grillé. Les paliers se CUMULENT : tout palier sous le total
  // saisi est acquis, il n'y en a pas qu'un seul d'actif.
  const explore = Math.max(0, Number(SE_PLAN.explore)||0);
  let expTiers = 0;
  (SE_DATA.explorationMilestones||[]).forEach(m=>{
    if(explore >= (Number(m.points)||0)){ seAdd(tot, m.reward, 1, null, seT('evSrcExplore')); expTiers++; }
  });

  // Valorisation des objets (référentiel gemmes + relevé €). Un objet marqué
  // eurExclude garde sa valeur gemmes mais sort du total € (relevé non représentatif).
  // `excluded` = les objets que le joueur a DÉCOCHÉS dans le détail : ils restent
  // listés (grisés) mais sortent des totaux — donc de la valorisation. Clé = itemId,
  // ou 'x:<label EN>' pour un objet hors référentiel.
  const excluded = SE_PLAN.excluded || {};
  const rows = Object.keys(tot.items).map(id=>{
    const e = tot.items[id];
    const it = scItemById(id);
    const eu = scEurUnit(id);
    const priced = (eu!=null) && !e.eurExclude;
    return {
      id, key: id, off: !!excluded[id], qty: e.qty, it,
      nameTxt: it ? scName(it, scLang()) : id,
      img: it ? scImg(it) : '',
      gem: scGem(id) * e.qty,
      eur: priced ? eu*e.qty : null,
      eurExclude: e.eurExclude,
      src: seSrcList(e.src)
    };
  }).sort((a,b)=> b.gem - a.gem);
  const extras = Object.keys(tot.extras).map(k=>{
    const x = tot.extras[k];
    return { key:'x:'+k, off: !!excluded['x:'+k], label:x.label, qty:x.qty, src:seSrcList(x.src) };
  });

  const onRows = rows.filter(r=>!r.off);
  const gemItems = onRows.reduce((s,r)=>s+r.gem, 0);
  const eurItems = onRows.reduce((s,r)=>s+(r.eur||0), 0);
  const covered  = onRows.filter(r=>r.eur!=null).length;
  const totalRows = onRows.length + extras.filter(x=>!x.off).length;
  const itemsOn  = totalRows, itemsAll = rows.length + extras.length;

  // Panier composé dans le tableau boutique : c'est LUI qui donne une valeur aux
  // pièces d'aventure. cart.eur / cart.gems ne dépendent que des lignes prises.
  const shop = spShop();
  const cart = shop ? scComputeRows(shop).cart : null;

  const valueEur = eurItems + (cart ? cart.eur  : 0);
  const valueGem = gemItems + (cart ? cart.gems : 0);
  const pct = spend > 0 ? (valueEur / spend * 100) : null;

  return { days, played, purchaseDays, purchaseOk, outsideBuys, dailyBuy, spend, buysTotal, tvTiers, curSrc: tot.cur,
           explore, expTiers, expTotal: (SE_DATA.explorationMilestones||[]).length,
           gemRewards: gemItems, eurRewards: eurItems, itemsOn, itemsAll,
           coins, msCoins, msReached, stall: tot.stall, travel: tot.travel,
           rows, extras, covered, totalRows, cart, valueEur, valueGem, pct };
}

// Crans de couleur du % — seuils choisis par Paul. Le libellé accompagne toujours
// la couleur (jamais la couleur seule).
function seTier(pct){
  if(pct < 100) return { cls:'sxe-t-bad',   label: seT('evQ0') };
  if(pct < 120) return { cls:'sxe-t-warn',  label: seT('evQ1') };
  if(pct < 140) return { cls:'sxe-t-mid',   label: seT('evQ2') };
  if(pct < 180) return { cls:'sxe-t-good',  label: seT('evQ3') };
  return              { cls:'sxe-t-great', label: seT('evQ4') };
}

function seNum(n){
  const v = Number(n)||0;
  return (Math.round(v*10)/10).toLocaleString(scLang()==='FR'?'fr-FR':'en-US');
}

// Montant d'argent RÉEL — toujours 2 décimales, comme un prix affiché en boutique.
// scFmtEur() ne convient pas ici : ses décimales adaptatives sont faites pour des valeurs
// UNITAIRES d'objet (jusqu'à 4 décimales sur les plus petites), et à l'autre bout elles
// arrondissent au-dessus de 100 — un pack à 119,99 € s'affichait « 120 € », un pack à
// 0,99 $ « 0,990 $ ». Le placement du symbole suit la LANGUE, comme partout ailleurs.
function seFmtMoney(v){
  const n = Number(v)||0;
  const s = n.toLocaleString(scLang()==='FR'?'fr-FR':'en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  return scLang()==='FR' ? (s+' '+scCurSym()) : (scCurSym()+s);
}

// ---------- rendu ----------
// Tous les événements ne versent pas la monnaie de leur boutique. Au Théâtre
// Fantastique, les packs donnent des Amulettes, qui alimentent un TIRAGE ALÉATOIRE dont
// sortent les Jetons Fantaisie : l'outil ne peut pas prédire combien. Afficher « 0 jeton
// attendu » laisserait croire que l'événement n'en rapporte aucun. La tuile ne s'affiche
// donc que si une source du fichier verse réellement des pièces.
function seHasCoins(){
  const bags = [SE_DATA.freeDailyPack, SE_DATA.waypost]
    .concat(SE_DATA.missions||[], SE_DATA.seasonalMissions||[], SE_DATA.stallMilestones||[]);
  (SE_DATA.packs||[]).forEach(p=>{ bags.push(p.reward, p.immediate, p.daily); });
  // Les pistes versent leurs pièces via `reward` : les oublier masquerait la tuile — et
  // avec elle le bouton « Utiliser comme budget », son seul point d'entrée — sur un
  // événement dont les pièces ne viendraient QUE d'une piste.
  if(SE_DATA.travelMilestones) bags.push(SE_DATA.travelMilestones.reward);
  (SE_DATA.explorationMilestones||[]).forEach(m=> bags.push(m.reward));
  return bags.some(b => b && (Number(b.coins)||0) > 0);
}

function seKpisHtml(c){
  const buysTxt = c.buysTotal>0
    ? `${c.buysTotal} ${seT(c.buysTotal>1?'evBuys':'evBuy')}`
    : seT('evNoBuy');
  const f2p = c.spend<=0;
  // Le palier se calcule sur le pourcentage AFFICHÉ, pas sur la valeur exacte : sinon
  // 99,67 % s'affiche « 100 % » en rouge, étiqueté « Mauvaise affaire » — le chiffre et
  // sa couleur se contrediraient sur chaque seuil (100 / 120 / 140 / 180).
  const shownPct = f2p ? null : Math.round(c.pct);
  const tier = f2p ? null : seTier(shownPct);
  const ratioTile = f2p
    ? `<div class="sx-kpi sx-kpi-hero sxe-t-f2p">
         <span class="sx-kpi-lbl">${seT('evRatio')}${seTip('evTipRatio')}</span>
         <span class="sx-kpi-val">${seT('evF2p')}</span>
         <span class="sx-kpi-sub">${seT('evF2pSub')}</span>
       </div>`
    : `<div class="sx-kpi sx-kpi-hero ${tier.cls}">
         <span class="sx-kpi-lbl">${seT('evRatio')}${seTip('evTipRatio')}</span>
         <span class="sx-kpi-val">${shownPct}<small>%</small></span>
         <span class="sx-kpi-sub">${tier.label}</span>
       </div>`;
  const shop = spShop();
  const budgetSet = shop && Number(shop.resources)===c.coins;
  return `<div class="sx-kpis sxe-kpis">
      <div class="sx-kpi">
        <span class="sx-kpi-lbl">${seT('evSpent')}</span>
        <span class="sx-kpi-val">${seFmtMoney(c.spend)}</span>
        <span class="sx-kpi-sub">${buysTxt} · ${c.played}/${c.days} ${seT('evPlayedSub')}</span>
      </div>
      <div class="sx-kpi">
        <span class="sx-kpi-lbl">${seT('evValue')}</span>
        <span class="sx-kpi-val">${seFmtMoney(c.valueEur)}</span>
        <span class="sx-kpi-sub">💎 ${seNum(c.valueGem)} · ${spCoverTxt(c.covered + (c.cart?c.cart.takeCovered:0), c.totalRows + (c.cart?c.cart.takeTotal:0))}</span>
      </div>
      ${ratioTile}
      ${!seHasCoins() ? '' : `<div class="sx-kpi">
        <span class="sx-kpi-lbl">${seT('evCoins')}</span>
        <span class="sx-kpi-val">${seNum(c.coins)}</span>
        <span class="sx-kpi-sub">${SE_DATA.stallMilestones
          ? seTf('evFromMilestones',{n:seNum(c.msCoins), r:c.msReached})
          : scEscAttr(scResName(spShop(), scLang()))}</span>
        <button type="button" class="sx-btn sxe-budget${budgetSet?' ok':''}" ${budgetSet?'disabled':''}
          title="${scEscAttr(seT('evBudgetTip'))}" onclick="seApplyBudget()">${budgetSet?'✓ '+seT('evBudgetOk'):seT('evUseBudget')}</button>
      </div>`}
    </div>`;
}

function seGridHtml(c){
  const days = c.days;
  let head = `<tr><th class="c-pack">${seT('evPack')}</th><th class="rgt">${seT('evPrice')}</th>`;
  for(let d=1; d<=days; d++) head += `<th class="ctr c-day">${seT('evDay')}${d}</th>`;
  head += `<th class="rgt c-tot">${seT('evSpent')}</th></tr>`;

  const body = (SE_DATA.packs||[]).map(p=>{
    const price = (scCur()==='USD') ? Number(p.priceUsd)||0 : Number(p.priceEur)||0;
    const max = p.once ? 1 : Math.max(1, Number(p.perDay)||1);
    const stock = Number(p.maxTotal) || 0;   // stock d'événement : saisie libre par jour
    const limit = p.once ? seT('evOnce')
                : stock ? seTf('evMaxTotal',{n:stock})
                : (max>1 ? seTf('evPerDay',{n:max}) : '');
    const note = p.note ? ` <span class="sxe-info" title="${scEscAttr(seName({name:p.note}))}">ⓘ</span>` : '';
    let cells = '', rowCount = 0;
    for(let d=1; d<=days; d++){
      const n = seBuysCount(p.id, d);
      rowCount += n;
      const label = `${seName(p)}, ${seT('evDay')}${d} : ${n}`;
      // Un pack à stock d'événement n'a pas de plafond journalier : le compteur cyclique
      // ne convient pas (on peut en prendre 2 un jour et 5 un autre), d'où un champ.
      cells += stock
        ? `<td class="ctr c-day"><input class="sxe-num${n>0?' on':''}" type="text" inputmode="numeric"
             value="${n||''}" placeholder="0" data-se="${p.id}:${d}" aria-label="${scEscAttr(label)}"
             onchange="seSetBuy('${p.id}',${d},this.value)"></td>`
        : `<td class="ctr c-day"><button type="button" class="sxe-cell${n>0?' on':''}"
             data-se="${p.id}:${d}" aria-pressed="${n>0}" aria-label="${scEscAttr(label)}"
             onclick="seToggle('${p.id}',${d})">${n===0?'':(max>1?'×'+n:'✓')}</button></td>`;
    }
    const rowSpend = p.once ? (rowCount>0 ? price : 0) : rowCount*price;
    return `<tr>
      <td class="c-pack"><b>${scEscAttr(seName(p))}</b>${note}${limit?`<span class="sx-sub">${limit}</span>`:''}</td>
      <td class="rgt sxe-price">${seFmtMoney(price)}</td>
      ${cells}
      <td class="rgt c-tot ${rowSpend>0?'':'dash'}">${rowSpend>0?seFmtMoney(rowSpend):'—'}</td>
    </tr>`;
  }).join('');

  let foot = `<tr><td class="c-pack sxe-foot">${seT('evDailyTot')}</td><td></td>`;
  let grand = 0;
  for(let d=1; d<=days; d++){
    let dSpend = 0;
    (SE_DATA.packs||[]).forEach(p=>{
      const price = (scCur()==='USD') ? Number(p.priceUsd)||0 : Number(p.priceEur)||0;
      const n = seBuysCount(p.id, d);
      dSpend += p.once ? (n>0?price:0) : n*price;
    });
    grand += dSpend;
    foot += `<td class="ctr c-day sxe-foot ${dSpend>0?'':'dash'}">${dSpend>0?seFmtMoney(dSpend):'—'}</td>`;
  }
  foot += `<td class="rgt c-tot sxe-foot"><b>${grand>0?seFmtMoney(grand):'—'}</b></td></tr>`;

  return `<div class="sxe-gridbox"><table class="sxe-grid">
      <thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot>
    </table></div>`;
}

function seDetailHtml(c){
  // Case à cocher d'une ligne : décocher sort l'objet du total et de la valorisation.
  // data-k plutôt qu'un argument inline : un label d'extra peut porter n'importe quoi
  // (apostrophes comprises), scEscAttr suffit alors à le rendre sûr.
  const chk = (r, name) => `<td class="c-chk"><input type="checkbox" class="sxe-chk"
      data-se="chk:${scEscAttr(r.key)}" data-k="${scEscAttr(r.key)}" ${r.off?'':'checked'}
      aria-label="${scEscAttr(seTf('evChkLbl',{x:name}))}" onchange="seToggleItem(this.dataset.k)"></td>`;

  // Ligne de TOTAL, en tête (demande de Paul) : la somme de ce que le tableau liste,
  // cases décochées exclues. C'est le total des RÉCOMPENSES de l'événement — le panier
  // boutique, compté à part dans les tuiles, n'y figure pas (cf. note sous le tableau).
  const totalRow = `<tr class="sxe-total-row">
      <td class="c-chk"></td>
      <td class="c-name">${seT('evTotalRow')}<span class="sx-sub">${seTf('evTotalCount',{n:c.itemsOn, t:c.itemsAll})}</span></td>
      <td></td><td></td>
      <td class="rgt gem">${seNum(c.gemRewards)}</td>
      <td class="rgt eur">${seFmtMoney(c.eurRewards)}</td>
    </tr>`;

  // Les Points de Voyage ne s'achètent pas dans cette boutique, mais ils ne sont pas
  // muets pour autant : passé un seuil, chaque tranche redonne gemmes et accélérateurs.
  // La ligne n'est donc affichée QUE si l'événement a une piste de voyage.
  // Pas de case sur les monnaies : elles ne portent aucune valeur à retirer.
  // Monnaie principale : celle de la BOUTIQUE (`resourceName`), jamais redite dans
  // l'événement. Les monnaies secondaires ne sont affichées que si l'événement les
  // utilise — la Caravane du Dragon n'a ni points de vente ni piste de voyage, ses
  // lignes ne doivent pas apparaître à zéro.
  // Même règle que la tuile : sans source de pièces dans le fichier, la ligne afficherait
  // « Jeton Fantaisie · 0 » — le zéro trompeur que seHasCoins() sert justement à écarter.
  const cur = (seHasCoins() ? [
    { n: scResName(spShop(), scLang()), q: c.coins, src: seSrcList(c.curSrc.coins), sub: seT('evCoinsRowSub') }
  ] : []).concat((SE_DATA.stallMilestones || c.stall > 0) ? [
    { n: seCurName('stallName','evStallRow'), q: c.stall, src: seSrcList(c.curSrc.stall),
      sub: SE_DATA.stallMilestones ? seTf('evStallRowSub',{r:c.msReached, n:seNum(c.msCoins)}) : '' }
  ] : []).concat(SE_DATA.travelMilestones ? [
    { n: seCurName('travelName','evTravelRow'), q: c.travel, src: seSrcList(c.curSrc.travel),
      sub: seTf('evTravelRowSub',
        {r:c.tvTiers, f:seNum(SE_DATA.travelMilestones.from), e:seNum(SE_DATA.travelMilestones.every)}) }
  ] : []).map(r=>`<tr class="sxe-cur-row">
      <td class="c-chk"></td>
      <td class="c-name">${r.n}<span class="sx-sub">${r.sub}</span></td>
      <td class="ctr">${seNum(r.q)}</td>
      ${seSrcCell(r.src)}
      <td class="rgt dash">—</td><td class="rgt dash">—</td>
    </tr>`).join('');

  const items = c.rows.map(r=>{
    const eurCell = r.eur!=null
      ? `<td class="rgt eur">${scFmtEur(r.eur)}</td>`
      : `<td class="rgt dash" title="${scEscAttr(r.eurExclude ? seT('evEurExcl') : scTc('noEur'))}">${r.eurExclude?'✕':'—'}</td>`;
    return `<tr class="${r.off?'sxe-off':''}">
      ${chk(r, r.nameTxt)}
      <td class="c-name"><span class="sxe-name"><span class="sx-ico" style="background-image:url('img/Item/${r.img}.webp');"></span><span>${scEscAttr(r.nameTxt)}</span></span></td>
      <td class="ctr">${seNum(r.qty)}</td>
      ${seSrcCell(r.src)}
      <td class="rgt gem">${seNum(r.gem)}</td>
      ${eurCell}
    </tr>`;
  }).join('');

  const extras = c.extras.map(x=>`<tr class="sxe-cur-row${x.off?' sxe-off':''}">
      ${chk(x, seName({name:x.label}))}
      <td class="c-name">${scEscAttr(seName({name:x.label}))}</td>
      <td class="ctr">${seNum(x.qty)}</td>
      ${seSrcCell(x.src)}
      <td class="rgt dash">—</td><td class="rgt dash">—</td>
    </tr>`).join('');

  return `<details class="sxe-detail"${SE_UI.detail?' open':''} ontoggle="SE_UI.detail=this.open">
      <summary>${seT('evDetail')}</summary>
      <div class="table-container"><table class="db-table sx-table sxe-rewards">
        <thead><tr><th class="c-chk">${seTip('evTipChk')}</th>
          <th>${seT('evColItem')}</th><th class="ctr">${seT('evColQty')}</th>
          <th class="c-src">${seT('evColSrc')}${seTip('evTipSrc')}</th>
          <th class="rgt">${seT('evColGem')}</th><th class="rgt">${seTf('evColEur',{c:scCurSym()})}</th></tr></thead>
        <tbody>${totalRow}${cur}${items}${extras}</tbody>
      </table></div>
    </details>`;
}

// Colonne « Provenance » : les DEUX plus gros apports en pastilles, le reste compté
// dans un « +n ». La case porte le détail complet en info-bulle — une ligne de tableau
// ne doit pas devenir un paragraphe, mais l'information ne doit pas être perdue pour
// autant. Un objet dont toute la quantité vient d'une seule source n'affiche qu'une
// pastille : le cas courant reste le plus court.
function seSrcCell(list){
  if(!list || !list.length) return '<td class="sxe-src dash">—</td>';
  const full = list.map(x=> `${x.label} : ${seNum(x.qty)}`).join('\n');
  const chips = list.slice(0,2).map(x=>
    `<span class="sxe-chip"><b>${seNum(x.qty)}</b> ${scEscAttr(x.label)}</span>`).join('');
  const more = list.length>2
    ? `<span class="sxe-chip is-more">${seTf('evSrcMore',{n:list.length-2})}</span>` : '';
  return `<td class="sxe-src" title="${scEscAttr(full)}">${chips}${more}</td>`;
}

function seRender(){
  const host = document.getElementById('sp-event');
  if(!host || !SE_DATA) return;

  // Le re-rendu remplace tout le bloc : on remet ensuite le focus sur le bouton équivalent,
  // sinon chaque coche de la grille éjecte le clavier / le lecteur d'écran.
  const ae = document.activeElement;
  const focusKey = (ae && host.contains(ae) && ae.getAttribute) ? ae.getAttribute('data-se') : null;

  const c = seCompute();
  const days = seDays();
  const cartNote = (c.cart && c.cart.lines>0)
    ? seTf('evCartIn', { v: seFmtMoney(c.cart.eur), n: c.cart.lines })
    : seT('evCartEmpty');

  host.innerHTML = `<div class="db-section sxe-section">
      <h2>${seT('evTitle')}</h2>
      <p class="sx-section-sub">${seT('evIntro')}</p>
      ${seKpisHtml(c)}
      <details class="sxe-panel"${SE_PLAN.open?' open':''} ontoggle="SE_PLAN.open=this.open;seSave()">
        <summary>${seT('evMyBuys')}</summary>
        <div class="sxe-toolbar">
          <span class="sx-fact">${seT('evPlayed')} :
            <span class="sx-take on"><button type="button" data-se="pl:-" onclick="sePlayedStep(-1)" ${c.played<=0?'disabled':''} aria-label="−">−</button><input type="text" inputmode="numeric" value="${c.played}" data-se="pl:i" onchange="seSetPlayed(this.value)" aria-label="${scEscAttr(seT('evPlayed'))}"><button type="button" data-se="pl:+" onclick="sePlayedStep(1)" ${c.played>=days?'disabled':''} aria-label="+">+</button></span>
            / ${days}</span>
          ${(()=>{ if(!c.expTotal) return '';
            // Saisie libre (pas de compteur +/- : on parle de milliers d'amulettes).
            // Le compte des paliers atteints est affiché à côté, sinon le joueur ne
            // sait pas ce que son chiffre a débloqué.
            const nm = SE_DATA._meta.exploreName;
            const lbl = nm ? (nm[scLang()]||nm.EN||nm.FR) : seT('evSrcExplore');
            return `<span class="sx-fact">${scEscAttr(lbl)}${seTip('evExploreTip')} :
              <span class="sx-take sxe-explore${c.explore>0?' on':''}"><input type="text" inputmode="numeric"
                value="${c.explore||''}" placeholder="0" data-se="ex:i"
                onchange="seSetExplore(this.value)" aria-label="${scEscAttr(lbl)}"></span>
              <span class="sx-sub">${seTf('evExploreTiers',{n:c.expTiers, t:c.expTotal})}</span></span>`; })()}
          ${(()=>{ const pm = sePurchaseMission(); if(!pm) return '';
            // Quotidienne : un compteur de jours. Saisonnière : une case.
            if(c.dailyBuy) return `<span class="sx-fact">${seT('evOutside')}${seTip('evOutsideTip')} :
              <span class="sx-take${c.outsideBuys>0?' on':''}"><button type="button" data-se="ob:-" onclick="seOutsideStep(-1)" ${c.outsideBuys<=0?'disabled':''} aria-label="−">−</button><input type="text" inputmode="numeric" value="${c.outsideBuys}" data-se="ob:i" onchange="seSetOutside(this.value)" aria-label="${scEscAttr(seT('evOutside'))}"><button type="button" data-se="ob:+" onclick="seOutsideStep(1)" ${c.outsideBuys>=days?'disabled':''} aria-label="+">+</button></span>
              / ${days}</span>`;
            return `<label class="sx-fact sxe-chk-fact"><input type="checkbox" class="sxe-chk"
              data-se="pok" ${c.purchaseOk?'checked':''} onchange="seSetPurchaseOk(this.checked)">
              ${seTf('evPurchaseChk',{m: scEscAttr(seName(pm))})}${seTip('evPurchaseChkTip')}</label>`; })()}
          <button type="button" class="sx-btn" onclick="seF2P()">${seT('evBtnF2p')}</button>
        </div>
        ${seGridHtml(c)}
        ${((SE_DATA.missions||[]).concat(SE_DATA.seasonalMissions||[])).some(m=>m.requiresPurchase)
          ? `<p class="sxe-note">${seTf('evPurchaseNote',{n:c.purchaseDays})}</p>` : ''}
        ${(SE_DATA.seasonalMissions||[]).length ? `<p class="sxe-note">${seT('evSeasonNote')}</p>` : ''}
        ${seDetailHtml(c)}
      </details>
      <p class="sxe-note">${(()=>{ const n=SE_DATA._meta.currencyNote;
          return n ? scEscAttr(n[scLang()]||n.EN||n.FR)+'<br>' : ''; })()}${cartNote}<br>${seTf('evSrcNote',{tier: scEscAttr(SE_DATA._meta.tier||'')})}</p>
    </div>`;

  // Point d'extension : une boutique peut prolonger la section par une analyse qui
  // lui est propre — le Théâtre y branche son optimiseur d'amulettes (js/shop-theater.js).
  // Appelé AVANT la remise du focus, pour que les contrôles ajoutés en profitent aussi.
  if(typeof window.seExtras === 'function'){
    try{ window.seExtras(host, c); }catch(e){ console.error('seExtras', e); }
  }

  if(focusKey){
    const el = host.querySelector(`[data-se="${focusKey}"]`);
    if(el && !el.disabled) el.focus({ preventScroll:true });
  }
}

// ---------- interactions ----------
// Une cellule de la grille est un compteur cyclique : 0 → 1 (→ 2 → 3 si le pack le
// permet) → 0. Un pack « once » n'a qu'une coche sur toute la ligne : cocher un autre
// jour y déplace l'achat.
window.seToggle = function(packId, day){
  const p = (SE_DATA.packs||[]).find(x=>x.id===packId); if(!p) return;
  const max = p.once ? 1 : Math.max(1, Number(p.perDay)||1);
  const cur = seBuysCount(packId, day);
  const next = (cur + 1) > max ? 0 : cur + 1;
  if(p.once){
    SE_PLAN.buys[packId] = {};
    if(next > 0) SE_PLAN.buys[packId][day] = next;
  } else {
    const b = SE_PLAN.buys[packId] = SE_PLAN.buys[packId] || {};
    if(next > 0) b[day] = next; else delete b[day];
  }
  seSave(); seAfter();
};
window.sePlayedStep = function(d){
  SE_PLAN.played = Math.max(0, Math.min(seDays(), (Number(SE_PLAN.played)||0) + d));
  seSave(); seAfter();
};
// NB : `seF2P()` ne remet PAS ce compteur à zéro, et c'est voulu. Les Amulettes
// s'obtiennent surtout gratuitement (événement « Theater Notes ») : un joueur sans
// aucun achat en dépense quand même, et ses paliers lui sont bien acquis. Le bouton
// « Je suis F2P » vide la grille des ACHATS, pas ce que le joueur a gagné sans payer.
window.seSetExplore = function(v){
  const n = parseInt(String(v).replace(/\D/g,''), 10);
  SE_PLAN.explore = Math.max(0, isNaN(n)?0:n);
  seSave(); seAfter();
};
window.seSetPlayed = function(v){
  const n = parseInt(String(v).replace(/\D/g,''), 10);
  SE_PLAN.played = Math.max(0, Math.min(seDays(), isNaN(n)?0:n));
  seSave(); seAfter();
};
// Coche/décoche un objet du détail : l'exclusion est persistée avec le plan de
// l'événement, et le re-rendu différé recalcule totaux et tuiles d'un même geste.
window.seToggleItem = function(key){
  const ex = SE_PLAN.excluded = SE_PLAN.excluded || {};
  if(ex[key]) delete ex[key]; else ex[key] = 1;
  seSave(); seAfter();
};
window.seSetPurchaseOk = function(on){ SE_PLAN.purchaseOk = !!on; seSave(); seAfter(); };
window.seOutsideStep = function(d){
  SE_PLAN.outsideBuys = Math.max(0, Math.min(seDays(), (Number(SE_PLAN.outsideBuys)||0) + d));
  seSave(); seAfter();
};
window.seSetOutside = function(v){
  const n = parseInt(String(v).replace(/\D/g,''), 10);
  SE_PLAN.outsideBuys = Math.max(0, Math.min(seDays(), isNaN(n)?0:n));
  seSave(); seAfter();
};
// Achat d'un pack à STOCK d'événement : saisie libre par jour, plafonnée au stock
// restant (2 le J1 et 5 le J4 sont un cas parfaitement normal).
window.seSetBuy = function(packId, day, val){
  const p = (SE_DATA.packs||[]).find(x=>x.id===packId); if(!p) return;
  let n = parseInt(String(val).replace(/\D/g,''), 10);
  if(isNaN(n) || n < 0) n = 0;
  const b = SE_PLAN.buys[packId] = SE_PLAN.buys[packId] || {};
  const others = Object.keys(b).reduce((s,k)=> s + (Number(k)===day ? 0 : (Number(b[k])||0)), 0);
  const cap = Math.max(0, (Number(p.maxTotal) || Infinity) - others);
  n = Math.min(n, cap);
  if(n > 0) b[day] = n; else delete b[day];
  seSave(); seAfter();
};
window.seF2P = function(){
  const any = Object.keys(SE_PLAN.buys).some(pid=> Object.keys(SE_PLAN.buys[pid]||{}).length );
  if(!any){ seRender(); return; }
  showAppConfirm(seT('evF2pConfirm'), ()=>{ SE_PLAN.buys = {}; seSave(); seAfter(); });
};
// Reporte les pièces prévues dans « Ma monnaie » du tableau : action explicite, jamais
// automatique — la saisie manuelle du joueur ne doit pas être écrasée en silence.
window.seApplyBudget = function(){
  const shop = spShop(); if(!shop) return;
  const c = seCompute();
  shop.resources = c.coins;
  scSaveEvents();
  if(typeof spRenderAll === 'function') spRenderAll();   // rafraîchit aussi cette section (hook)
  if(window.showAppToast) showAppToast(seTf('evBudgetDone',{n:seNum(c.coins)}));
};

// Coalesce les re-rendus (même motif que spAfterEdit : laisser le blur du contrôle
// se terminer avant de remplacer le DOM qui le porte).
let SE_PENDING = null;
function seAfter(){
  // shop-page.js appelle ShopEvent.refresh() dès son premier rendu, qui a lieu AVANT que
  // ce module ait chargé son fichier d'événement : sans ce garde-fou, le calcul part sur
  // un plan encore nul.
  if(!SE_DATA || !SE_PLAN || SE_PENDING) return;
  SE_PENDING = setTimeout(()=>{ SE_PENDING = null; seRender(); }, 0);
}

// Point d'entrée du rafraîchissement demandé par shop-page.js (panier, monnaie,
// devise ou lecture changées) — voir le hook dans spRenderAll / spAfterEdit.
window.ShopEvent = {
  refresh: seAfter,
  // Lecture seule pour les modules greffés par `seExtras` : le fichier de
  // l'événement et le plan d'achat, sans refaire de requête ni redoubler la
  // persistance. Des accesseurs, pas les variables : `SE_PLAN` est réaffecté
  // à chaque changement de boutique, une référence figée se périmerait.
  data: () => SE_DATA,
  plan: () => SE_PLAN,
  // Le calcul complet, éventuellement borné aux `upTo` premiers jours : c'est ce
  // qui évite à un module greffé de recopier les règles de seCompute pour savoir
  // ce que le plan a DÉJÀ versé.
  compute: (upTo) => (SE_DATA && SE_PLAN) ? seCompute(upTo) : null
};

// ---------- init ----------
(async function(){
  const slug = window.SHOP_SLUG;
  const host = document.getElementById('sp-event');
  if(!slug || !host) return;

  // Pas de fichier d'événement pour cette boutique -> le module reste inerte.
  let data = null;
  try{
    const r = await fetch('data/events/'+slug+'.json');
    if(r.ok) data = await r.json();
  }catch(e){}
  if(!data || !data._meta) return;
  SE_DATA = data;

  // shop-page.js charge les données boutique de son côté : on attend que la boutique
  // soit résolue (référentiel et relevé € compris) avant le premier rendu.
  for(let i=0; i<200 && !(typeof spShop==='function' && spShop()); i++){
    await new Promise(res=>setTimeout(res, 50));
  }
  if(!(typeof spShop==='function' && spShop())) return;

  SE_PLANS = safeParse(STORAGE_KEYS.shopcalcEventPlans, {}) || {};
  const saved = SE_PLANS[seEventKey()];
  SE_PLAN = (saved && typeof saved==='object')
    ? { played: (saved.played==null ? seDays() : saved.played), buys: saved.buys||{},
        open: saved.open!==false, excluded: saved.excluded||{},
        // Deux réglages distincts, selon la nature de la mission d'achat (cf. seHasDailyPurchase).
        purchaseOk: (saved.purchaseOk!=null) ? !!saved.purchaseOk : ((Number(saved.outsideBuys)||0) > 0),
        outsideBuys: Number(saved.outsideBuys)||0,
        explore: Number(saved.explore)||0 }
    : { played: seDays(), buys: {}, open: true, excluded: {}, purchaseOk: false, outsideBuys: 0, explore: 0 };

  seRender();
  window.addEventListener('langChanged', seRender);
})();
