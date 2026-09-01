// ============================================================
//  SOMMAIRE DES BOUTIQUES (shop_calc.html)
//  Les cartes et leurs liens sont ÉCRITS EN DUR dans le HTML (maillage interne + lisibilité
//  sans JS, comme les sommaires database/*). Ce script ne fait qu'hydrater ce qui dépend
//  des données ou de l'heure : vignette, nombre d'objets, statut et compte à rebours.
// ============================================================

function scHydrateCard(card){
  const slug=card.getAttribute('data-shop-slug');
  const found=scFindBySlug(slug);
  if(!found){ card.setAttribute('data-missing','1'); return; }
  const { shop, kind } = found;

  // Vignette : photo `img/shops/<slug>.webp` si elle existe, mosaïque des 4 meilleurs objets sinon.
  // Posée une seule fois — un changement de langue ne doit pas relancer le chargement des images.
  const slot=card.querySelector('.sx-thumb-slot');
  if(slot) slot.outerHTML = scThumbHtml(shop);

  // Nombre d'objets (un coffre propose des « choix », pas des achats).
  const cnt=card.querySelector('[data-count-slot]');
  if(cnt) cnt.textContent = `${(shop.items||[]).length} ${scT(kind==='chest'?'nChoices':'nItems')}`;

  // Statut : seules les boutiques d'événement portent une échéance.
  const thumb=card.querySelector('.sx-thumb');
  const oldBadge=card.querySelector('.sx-badge');
  if(oldBadge) oldBadge.remove();
  if(thumb && kind==='event' && shop.endsAt){
    const ended=scIsEnded(shop), urgent=scIsUrgent(shop);
    card.classList.toggle('is-ended', ended);
    const b=document.createElement('span');
    b.className='sx-badge '+(ended?'ended':urgent?'urgent':'live');
    b.setAttribute('data-ends-at', shop.endsAt);
    if(!ended) b.setAttribute('data-ends-prefix','1');
    b.textContent=(ended?'':scT('endsIn')+' ')+scTimeLeftTxt(shop.endsAt);
    thumb.appendChild(b);
  }
}

// Événements : fin la plus proche d'abord, terminés relégués en fin de grille (mais conservés
// et cliquables : comparer deux éditions passées est un usage légitime).
function scOrderEvents(){
  const grid=document.getElementById('grid-event'); if(!grid) return;
  const cards=[...grid.querySelectorAll('.sx-card')];
  cards.map(c=>{
    const f=scFindBySlug(c.getAttribute('data-shop-slug'));
    const at=f?f.shop.endsAt:null;
    const t=scTimeLeft(at);
    return { c, ended:t.ended||!at, ms:t.ms };
  }).sort((a,b)=> (a.ended!==b.ended) ? (a.ended?1:-1) : (a.ms-b.ms))
    .forEach(o=>grid.appendChild(o.c));
}

function scRenderIndex(){
  document.querySelectorAll('.sx-card[data-shop-slug]').forEach(scHydrateCard);
  scOrderEvents();
  const live=SC_EVENTS.filter(s=>!scIsEnded(s)).length;
  const set=(sel,txt)=>{ const el=document.querySelector(sel); if(el) el.textContent=txt; };
  set('[data-count-event]',   `${live} / ${SC_EVENTS.length}`);
  set('[data-count-classic]', String(SC_CLASSIC.length));
  set('[data-count-chest]',   String(SC_CHESTS.length));
}

// Changement de langue : rien à reconstruire, scRenderIndex est réexécutable tel quel
// (les vignettes déjà posées sont conservées, les compteurs et badges sont réécrits).
function scRefreshIndex(){ scApplyTranslations(); scRenderIndex(); }

(async function(){
  await scLoadAll();
  scApplyTranslations();
  scRenderIndex();
  scStartCountdowns();

  if (window.HelpSystem) HelpSystem.init({
    id:'shop', banner:true,
    title:{FR:'Boutiques — Aide', EN:'Shops — Help'},
    summary:{FR:"Chaque boutique du jeu a sa page : le coût de chaque objet y est comparé à sa valeur en gemmes, pour repérer d'un coup d'œil ce qui vaut le détour.",
             EN:"Every in-game shop has its own page: each item's cost is compared to its gem value, so the deals worth taking stand out at a glance."},
    steps:{
      FR:["Choisis une boutique : Événement (limitée dans le temps), Permanente, ou un Coffre au choix unique.",
          "Sur chaque page, le ratio (valeur en gemmes ÷ coût) classe les objets — le meilleur est marqué « Top ».",
          "Les boutiques d'événement affichent le temps restant en jours et heures ; une fois terminées, leur page reste consultable pour comparer avec une autre édition.",
          "Les valeurs en gemmes viennent de la page « Valeur des objets » : modifie-les là-bas et toutes les boutiques se recalculent."],
      EN:["Pick a shop: Event (time-limited), Permanent, or a single-pick Chest.",
          "On each page the ratio (gem value ÷ cost) ranks the items — the best one is tagged “Top”.",
          "Event shops show the time left in days and hours; once ended, their page stays available so you can compare with another run.",
          "Gem values come from the “Item values” page: edit them there and every shop recalculates."]
    },
    links:[{label:{FR:'Ouvrir « Valeur des objets »', EN:'Open “Item values”'}, href:'shop/items'}]
  });

  window.addEventListener('langChanged', scRefreshIndex);
})();
