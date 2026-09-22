// ============================================================
//  SOMMAIRES DE BOUTIQUES — shop_calc.html (permanentes + coffres)
//                           event-roi.html (boutiques d'événement)
//  Un seul script pour les deux : ils affichent les mêmes cartes, hydratées de la même
//  façon, et seule l'aide diffère. Les cartes et leurs liens sont ÉCRITS EN DUR dans le
//  HTML (maillage interne + lisibilité sans JS, comme les sommaires database/*). Ce script
//  ne fait qu'hydrater ce qui dépend des données ou de l'heure : vignette, nombre d'objets,
//  statut et compte à rebours. Chaque section absente d'une page est simplement ignorée.
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
    // Le badge porte sa propre couleur : scStartCountdowns la réécrit à chaque minute,
    // et grise la carte avec, pour qu'un sommaire laissé ouvert ne fige pas un « en cours ».
    b.setAttribute('data-ends-state','1');
    // Posé dans tous les cas : c'est le tick qui décide de montrer « Fin dans » ou non,
    // sinon un badge hydraté « terminé » n'aurait plus de préfixe à retrouver.
    b.setAttribute('data-ends-prefix','1');
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

  // La page pose window.SX_INDEX avant ce script. Absent (page ancienne, ou script
  // encore en cache servi à une page neuve), on retombe sur l'aide des boutiques :
  // elle reste juste, seulement moins précise. Cf. MAP.md §9, le piège du cache décalé.
  const SX_HELP = {
    shops: {
      id:'shop', banner:true,
      title:{FR:'Boutiques — Aide', EN:'Shops — Help'},
      summary:{FR:"Les boutiques toujours ouvertes et les coffres au choix unique. Le coût de chaque objet y est comparé à sa valeur en gemmes, pour repérer d'un coup d'oeil ce qui vaut le détour.",
               EN:"The always-open shops and the single-pick chests. Each item's cost is compared to its gem value, so the deals worth taking stand out at a glance."},
      steps:{
        FR:["Choisis une boutique permanente, ou un coffre dont tu n'emportes qu'un seul objet.",
            "Sur chaque page, le ratio (valeur en gemmes ÷ coût) classe les objets — le meilleur est marqué « Top ».",
            "Les boutiques d'événement, limitées dans le temps, ont leur propre page : « Rentabilité des Événements ».",
            "Les valeurs en gemmes viennent de la page « Valeur des objets » : modifie-les là-bas et toutes les boutiques se recalculent."],
        EN:["Pick a permanent shop, or a chest you only take one item from.",
            "On each page the ratio (gem value / cost) ranks the items — the best one is tagged “Top”.",
            "Event shops, the time-limited ones, have their own page: “Event ROI”.",
            "Gem values come from the “Item values” page: edit them there and every shop recalculates."]
      },
      links:[{label:{FR:'Ouvrir « Rentabilité des Événements »', EN:'Open “Event ROI”'}, href:'event-roi'},
             {label:{FR:'Ouvrir « Valeur des objets »', EN:'Open “Item values”'}, href:'item-values'}]
    },
    events: {
      id:'shop-events', banner:true,
      title:{FR:'Boutiques d\'événement — Aide', EN:'Event shops — Help'},
      summary:{FR:"Chaque événement a sa boutique, sa monnaie et sa date de fin. Trois d'entre eux sont détaillés jour par jour et disent ce que l'événement rapporte face à ce qu'il coûte.",
               EN:"Every event has its shop, its currency and its end date. Three of them are broken down day by day and say what the event pays back against what it costs."},
      steps:{
        FR:["Le compteur de chaque carte donne le temps restant ; les événements terminés passent en fin de grille mais restent consultables.",
            "Sur une page de boutique, le ratio (valeur en gemmes ÷ coût) classe les objets, et le panier suit ce qu'il te reste de monnaie.",
            "La pastille « Rentabilité » signale les trois événements avec le détail complet : coche les packs achetés sous le tableau, le pourcentage se calcule.",
            "Ce pourcentage est en argent réel de bout en bout : aucune gemme n'y est convertie en euros."],
        EN:["Each card's counter gives the time left; ended events drop to the end of the grid but stay readable.",
            "On a shop page the ratio (gem value / cost) ranks the items, and the cart tracks the currency you have left.",
            "The “ROI” tag marks the three events with a full breakdown: tick the packs you bought under the table and the percentage works itself out.",
            "That percentage is real money end to end: no gem is ever converted into euros."]
      },
      links:[{label:{FR:'Ouvrir « Valeur Boutique »', EN:'Open “Shop Value”'}, href:'shop_calc'},
             {label:{FR:'Ouvrir « Valeur des objets »', EN:'Open “Item values”'}, href:'item-values'}]
    }
  };
  if (window.HelpSystem) HelpSystem.init(SX_HELP[window.SX_INDEX] || SX_HELP.shops);

  window.addEventListener('langChanged', scRefreshIndex);
  // Un événement vient de se terminer sur un sommaire laissé ouvert : le compteur
  // « n en cours » et l'ordre des cartes sont périmés, pas seulement le badge.
  window.addEventListener('endsStateChanged', scRefreshIndex);
})();
