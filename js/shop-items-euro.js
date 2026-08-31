// ============================================================
//  PRIX RÉEL DES OBJETS (shop/items-euro.html)
//  Seconde valorisation, en argent réel : ce que coûte un objet dans le pack payant où il
//  apparaît (prix du pack ÷ quantité obtenue). Table ADMIN en LECTURE SEULE — contrairement
//  au référentiel gemmes (shop/items.html), rien n'est éditable et rien ne part dans
//  localStorage. Indépendante de la valorisation en gemmes : aucun taux de change entre les
//  deux échelles n'est calculé nulle part.
//  Seuls les objets qu'on sait chiffrer sont listés ; la note de bas de tableau annonce cette
//  couverture pour qu'une absence ne passe pas pour un oubli. Deux origines s'y côtoient : le
//  prix RELEVÉ dans un pack, et — pour les objets qu'aucun pack ne vend — la valeur CALCULÉE
//  depuis un objet relevé (bloc `derived` du JSON). Les secondes se signalent partout : pastille
//  « Calculé » dans la colonne « Pack d'origine », et encadré permanent sous le tableau qui
//  déroule le raisonnement. Une valeur calculée qu'on ne peut pas vérifier ne vaut rien.
// ============================================================

function ieEl(id){ return document.getElementById(id); }

// Petite icône « image » accolée au nom : sans elle, rien n'indique qu'un aperçu existe.
const IE_ICON_IMG = '<svg class="ic-img" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

// ---------- aperçu du pack ----------
// Survol MAINTENU (et non instantané) : le curseur traverse la colonne en permanence,
// une bulle qui s'ouvre au moindre passage serait insupportable. Le clavier et le
// toucher ouvrent immédiatement, eux — s'en remettre au seul survol exclurait le mobile.
const IE_PV_DELAY = 320;
let iePvBox=null, iePvTimer=null, iePvPack=null, iePvOpen=null, iePvPin=null;

function iePvNode(){
  if(iePvBox) return iePvBox;
  iePvBox=document.createElement('div');
  iePvBox.className='ie-preview';
  iePvBox.setAttribute('role','tooltip');
  iePvBox.hidden=true;
  document.body.appendChild(iePvBox);
  return iePvBox;
}

// Placement : sous le déclencheur, basculé au-dessus s'il déborde, et toujours ramené
// dans la fenêtre. En `fixed`, l'aperçu échappe au conteneur qui défile horizontalement.
function iePvPlace(btn){
  const el=iePvNode(), r=btn.getBoundingClientRect(), M=10;
  const w=el.offsetWidth, h=el.offsetHeight;
  let left=Math.min(r.left, window.innerWidth-w-M);
  let top =r.bottom+8;
  if(top+h > window.innerHeight-M) top=r.top-h-8;
  el.style.left=Math.max(M,left)+'px';
  el.style.top =Math.max(M,top)+'px';
}

function iePvShow(btn){
  const pid=btn.getAttribute('data-pack'); if(!pid) return;
  const el=iePvNode();
  if(iePvPack!==pid){
    iePvPack=pid;
    const nom=scPackName(pid);
    el.classList.remove('is-broken');
    el.innerHTML=`<img alt="${scEscAttr(nom)}" src="img/packs/${encodeURIComponent(pid)}.webp">`
                +`<span class="ie-preview-cap">${scEscAttr(nom)}</span>`;
    // L'image arrive apres coup : sa hauteur change, donc on replace une fois chargee.
    const img=el.querySelector('img');
    img.addEventListener('load', ()=>{ if(iePvOpen===btn) iePvPlace(btn); }, {once:true});
    img.addEventListener('error', ()=>{ el.classList.add('is-broken'); if(iePvOpen===btn) iePvPlace(btn); }, {once:true});
  }
  el.hidden=false; iePvOpen=btn;
  iePvPlace(btn);
  requestAnimationFrame(()=>el.classList.add('on'));
}
function iePvHide(){
  clearTimeout(iePvTimer); iePvOpen=null;
  if(iePvBox){ iePvBox.classList.remove('on'); iePvBox.hidden=true; }
}
function iePvClose(){ iePvPin=null; iePvHide(); }

// Survol MAINTENU, et non instantane : le curseur traverse la colonne en permanence,
// une bulle qui s'ouvrirait au moindre passage serait insupportable.
function iePvArm(btn){
  if(iePvPin) return;                       // epingle au clic : le survol ne decide plus
  clearTimeout(iePvTimer);
  iePvTimer=setTimeout(()=>{ if(!iePvPin) iePvShow(btn); }, IE_PV_DELAY);
}

// Branche UNE fois sur le <tbody>, qui survit aux re-rendus (seul son innerHTML change).
//
// Deux modes volontairement distincts, parce qu'ils se marchaient dessus :
//  - SURVOL / focus clavier : ouverture passive, qui se referme d'elle-meme ;
//  - CLIC (donc le toucher, qui n'a pas de survol) : EPINGLE l'apercu.
// Le clic ne peut pas se contenter d'inverser l'etat visible : la souris focalise aussi
// le bouton, et ce focus ouvrait deja l'apercu avant que le clic ne soit traite — la
// bascule lisait alors un etat qu'un autre gestionnaire venait de changer. D'ou
// `iePvPin`, qui porte l'INTENTION de l'utilisateur plutot que l'etat de l'affichage.
function iePvBind(tb){
  const hit=e=>e.target.closest && e.target.closest('button.ie-pack');
  tb.addEventListener('mouseover', e=>{ const b=hit(e); if(b) iePvArm(b); });
  tb.addEventListener('mouseout',  e=>{ if(hit(e) && !iePvPin) iePvHide(); });
  // `:focus-visible` : le focus pris a la souris ne compte pas, seul celui du clavier ouvre.
  tb.addEventListener('focusin',   e=>{ const b=hit(e); if(b && b.matches(':focus-visible')) iePvShow(b); });
  tb.addEventListener('focusout',  e=>{ if(hit(e) && !iePvPin) iePvHide(); });
  tb.addEventListener('click', e=>{
    const b=hit(e); if(!b) return;
    e.preventDefault();
    if(iePvPin===b) iePvClose(); else { iePvPin=b; iePvShow(b); }
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') iePvClose(); });
  // Un clic ailleurs referme un apercu epingle — le reflexe attendu sur mobile.
  document.addEventListener('click', e=>{ if(iePvPin && !hit(e)) iePvClose(); });
  // L'apercu est en `fixed` : il ne suit pas la page, donc on le referme au defilement.
  window.addEventListener('scroll', iePvClose, true);
  window.addEventListener('resize', iePvClose);
}

// Objets reellement chiffres, dans l'ORDRE DU REFERENTIEL — meme logique que la page
// gemmes, pour que les deux tableaux se parcourent de la meme facon.
function ieAll(){ return SC_ITEMS.filter(it => !it.skin && scEurUnit(it.id)!=null); }

function ieRenderCatFilter(){
  const sel=ieEl('ie-cat-filter'); if(!sel) return;
  const cats=[...new Set(ieAll().map(i=>i.category).filter(Boolean))].sort();
  const cur=sel.value;
  sel.innerHTML=`<option value="">${scT('allCats')}</option>`
    +cats.map(c=>`<option value="${scEscAttr(c)}">${scEscAttr(c)}</option>`).join('');
  if(cats.includes(cur)) sel.value=cur;
}

// Pastilles € / $ : mêmes pastilles ET même préférence (clé chrome `shop_currency`) que les
// pages boutique — changer de devise ici la change partout, il n'y a qu'un seul réglage.
function ieRenderCur(){
  const host=ieEl('ie-cur'); if(!host) return;
  const usd = scCur()==='USD';
  host.setAttribute('aria-label', scT('curLabel'));
  host.innerHTML=`
    <button type="button" class="db-switch-item${usd?'':' active'}" onclick="ieSetCur('EUR')">&euro;</button>
    <button type="button" class="db-switch-item${usd?' active':''}" onclick="ieSetCur('USD')">$</button>`;
}
window.ieSetCur=function(c){ if(scCur()===c) return; scSetCur(c); ieRender(); };

// Date du relevé : le JSON la garde en ISO (non ambigu), on l'affiche au format local.
function ieDate(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||''));
  if(!m) return iso || '—';
  return scLang()==='FR' ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

// Pastilles de règle, dans l'ordre où les règles s'appliquent. « Calculé » et « Barème »
// s'excluent (une valeur déduite ne repasse pas par le barème) ; « ×0,25 » peut s'ajouter aux
// deux, puisque la pondération s'applique en dernier, sur le résultat. Chacune porte son
// raisonnement en info-bulle, et l'encadré sous le tableau le redonne en toutes lettres —
// l'info-bulle n'existe pas au toucher.
function ieTag(cls, label, why){
  return `<span class="ie-tag ${cls}" title="${scEscAttr(why)}">${scEscAttr(label)}</span>`;
}
function ieTags(id){
  let h='';
  if(scEurIsDerived(id))     h+=ieTag('is-derived', scT('derived'), scEurHow(id));
  else if(scEurIsScaled(id)) h+=ieTag('is-scaled',  scT('scaled'),  scEurScaleHow());
  if(scEurIsWeighted(id))    h+=ieTag('is-weighted', scEurWeightLabel(id), scEurWeightHow(id));
  return h;
}

function ieRender(){
  ieRenderCur();
  const tb=ieEl('ie-tbody'); if(!tb) return;
  const lang=scLang();
  const q=(ieEl('ie-search')?.value||'').trim().toLowerCase();
  const cat=ieEl('ie-cat-filter')?.value||'';

  // En-têtes dépendant de la devise active : « Valeur € » doit devenir « Valeur $ ».
  const thV=ieEl('ie-th-value'); if(thV) thV.innerHTML=scTc('hEur');
  const thP=ieEl('ie-th-pack');  if(thP) thP.innerHTML=scT('colPack')+scTip('tipPack');

  const all=ieAll();
  const rows=all.filter(it=>{
    if(cat && it.category!==cat) return false;
    if(!q) return true;
    // La recherche porte aussi sur le nom du pack : « qu'est-ce que contient la Weekly Card ? »
    return scNameEN(it).toLowerCase().includes(q)
        || ((it.name&&it.name.FR)||'').toLowerCase().includes(q)
        || scEurSrc(it.id).toLowerCase().includes(q)
        || scEurPacks(it.id).map(scPackName).join(' ').toLowerCase().includes(q);
  });

  tb.innerHTML=rows.map(it=>{
    const color=scCatColor(it.category), img=scImg(it);
    const src=scEurSrc(it.id), pimg=scEurPackImg(it.id);
    // La colonne garde son sens d'origine — LE pack qui en donne le plus, donc où en trouver —
    // même quand une règle décide du prix : « où en trouver le plus » et « ce que ça coûte »
    // sont deux questions distinctes. Ce sont les pastilles qui disent laquelle des deux le
    // chiffre suit ; sans elles, un lecteur qui divise le prix du pack par la quantité ne
    // retomberait pas sur la valeur affichée et croirait à une coquille.
    // `data-pack` porte l'ID DU PACK (pas son libellé) : c'est le point d'accroche de l'aperçu
    // d'image au survol, qui ira chercher img/packs/<id>.webp. Il n'est posé que lorsqu'un seul
    // pack atteint le maximum — un « multipack » n'a pas d'image à montrer et reste inerte.
    const packEl = src
      ? (pimg
          ? `<button type="button" class="ie-pack" data-pack="${scEscAttr(pimg)}" aria-label="${scEscAttr(src)} — ${scEscAttr(scT('seePack'))}">${scEscAttr(src)}${IE_ICON_IMG}</button>`
          : `<span class="ie-pack is-multi">${scEscAttr(src)}</span>`)
      : '';
    // Sans pack ET sans pastille, l'objet n'aurait rien à dire : le « — » évite la case vide.
    const tags=ieTags(it.id);
    const packCell = `<div class="ie-src">${packEl || (tags ? '' : `<span class="dash">${scT('noPack')}</span>`)}${tags}</div>`;
    return `<tr style="border-left:4px solid ${color};background:${color}14;">
      <td style="width:46px;"><div class="sc-item-img" style="background-image:url('img/Item/${img}.webp');background-color:${color}33;"></div></td>
      <td style="font-weight:600;">${scEscAttr(scName(it,lang))}</td>
      <td><span style="color:${color};font-weight:600;font-size:12px;">${scEscAttr(it.category)}</span></td>
      <td class="eur">${scFmtEur(scEurUnit(it.id))}</td>
      <td>${packCell}</td></tr>`;
  }).join('');

  const cnt=ieEl('ie-count');
  if(cnt) cnt.textContent=`${rows.length} / ${all.length} ${scT('count')}`;

  ieRenderRules();

  const note=ieEl('ie-note');
  if(note) note.textContent=scT('ieNote')
    .replace('{n}', all.length)
    .replace('{t}', SC_ITEMS.filter(i=>!i.skin).length)
    .replace('{z}', scT('zone'+scCur()))
    .replace('{d}', ieDate(SC_EURO_META.updatedAt));
}

// Encadré permanent sous le tableau : chaque règle qui décide d'un prix, en toutes lettres.
// Permanent et non replié, parce qu'un chiffre que le pack affiché ne justifie pas doit pouvoir
// se vérifier sans interaction — y compris au toucher, où l'info-bulle de la pastille n'existe
// pas. Trois sections, dans l'ordre où les règles s'appliquent ; chacune disparaît si elle ne
// touche aucun objet, et l'encadré entier avec elles.
function ieRenderRules(){
  const box=ieEl('ie-derived'); if(!box) return;
  const parts=[ieScaleSection(), ieDerivedSection(), ieWeightSection()].filter(Boolean);
  box.hidden = !parts.length;
  box.innerHTML = parts.join('');
}

// Un bloc = un titre, l'explication venue du JSON, et la liste des objets touchés.
function ieRuleBlock(title, intro, lis){
  if(!lis.length) return '';
  return `<h2 class="ie-derived-h">${scEscAttr(title)}</h2>`
       + `<p class="ie-derived-intro">${scEscAttr(intro)}</p>`
       + `<ul class="ie-derived-list">${lis.join('')}</ul>`;
}
// Le calcul chiffré passe à la ligne : collé au texte il se lisait comme sa fin de phrase.
function ieRuleLi(id, why, sum){
  return `<li><strong>${scEscAttr(scName(scItemById(id), scLang()))}</strong>${why ? ' — '+scEscAttr(why) : ''}`
       + `<span class="ie-derived-sum">${scEscAttr(sum)}</span></li>`;
}

// Barème : la base repart des DEUX chiffres relevés — prix du pack et minutes de ce pack — et
// non du prix de la minute affiché, qui est arrondi. C'est la seule façon de retomber sur les
// valeurs du tableau en refaisant le calcul à la main.
function ieScaleSection(){
  const ids=scEurScaledIds(); if(!ids.length) return '';
  const b=SC_EURO_SPEEDUPS.basis||{}, lang=scLang();
  const detail=(b.detail||[]).map(d=>`${scFmtNum(d.qty)} × ${scName(scItemById(d.itemId), lang)}`).join(', ');
  const basis=scT('scaleBasis')
    .replace('{p}', scFmtEur(scEurPackPrice()))
    .replace('{m}', scFmtNum(b.minutes))
    .replace('{u}', scFmtEur(scEurMinute()))
    .replace('{pack}', (b.packs||[]).map(scPackName).join(' / '))
    .replace('{detail}', detail);
  return ieRuleBlock(scT('scaleTitle'), scEurScaleHow()+' '+basis,
    ids.map(id => {
      const n=scEurMinutes(id);   // « 1 minutes » se lit comme une coquille
      return ieRuleLi(id, '', scT(n===1?'scaleSum1':'scaleSum').replace('{n}', scFmtNum(n))
                              +' → '+scFmtEur(scEurUnit(id)));
    }));
}

// Valeurs déduites. Le calcul repart lui aussi des chiffres relevés et non du prix unitaire
// affiché : « 0,167 € × 100 » donnerait 16,70 €, l'opérande étant arrondi. Quand la base n'est
// pas un simple relevé, ce raccourci n'existe pas — on la nomme alors plutôt que de la chiffrer.
function ieDerivedSection(){
  return ieRuleBlock(scT('derivedTitle'), scT('derivedIntro'), scEurDerivedIds().map(id=>{
    const d=SC_EURO_DERIVED[id];
    // Plusieurs bases : la ligne dit d'abord CE QU'ON ADDITIONNE (les objets), puis la MÊME
    // somme en chiffres relevés. Renvoyer le lecteur au tableau pour les prix unitaires ne
    // marche pas : ils y sont arrondis à 4 décimales, et un facteur comme 400 amplifie
    // l'arrondi au point de changer le total (400 × 0,0002 donne 0,080 là où 400 × (5 $ ÷
    // 26 000) donne 0,0769). Seules les divisions permettent de refaire le calcul et de
    // retomber sur le chiffre affiché.
    if(Array.isArray(d.from)) {
      const noms=[], bruts=[];
      for(const p of d.from){
        const nom=scName(scItemById(p.id), scLang()), f=scFmtFactor(p.factor), r=SC_EURO[p.id];
        noms.push(scT('derivedTerm').replace('{f}', f).replace('{n}', nom));
        // Un terme n'a de forme « prix du pack ÷ quantité » que si SA valeur sort du relevé nu.
        if(r && !scEurIsDerived(p.id) && !scEurIsScaled(p.id) && !scEurIsWeighted(p.id)){
          bruts.push(scT('derivedTermRaw').replace('{f}', f)
                                          .replace('{p}', scFmtEur(scEurPackPrice()))
                                          .replace('{q}', scFmtNum(r.qty)));
        }
      }
      // Un seul terme sans forme relevée et la ligne chiffrée serait bancale : on la retire.
      const complet = bruts.length===noms.length;
      return ieRuleLi(id, scEurHow(id), scT(complet ? 'derivedSumMulti' : 'derivedSumMultiAlt')
        .replace('{t}', noms.join(' + ')).replace('{r}', bruts.join(' + '))
        .replace('{b}', scFmtEur(scEurUnit(id))));
    }
    const base=SC_EURO[d.fromId];
    const plain = base && !scEurIsDerived(d.fromId) && !scEurIsScaled(d.fromId) && !scEurIsWeighted(d.fromId);
    const key = plain ? 'derivedSum' : (Number(d.factor)===1 ? 'derivedSumSame' : 'derivedSumAlt');
    const sum = scT(key)
      .replace('{p}', scFmtEur(scEurPackPrice()))
      .replace('{q}', base ? scFmtNum(base.qty) : '')
      .replace('{n}', scName(scItemById(d.fromId), scLang()))
      .replace('{f}', scFmtFactor(d.factor))
      .replace('{b}', scFmtEur(scEurUnit(id)));
    return ieRuleLi(id, scEurHow(id), sum);
  }));
}

// Pondération : un bloc par groupe du JSON, pour qu'une seconde règle un jour ne se cache pas
// derrière l'explication de la première.
function ieWeightSection(){
  return SC_EURO_WEIGHTS.map(w=>{
    const ids=scEurOrder((w.ids||[]).filter(id=>scEurIsWeighted(id)));
    return ieRuleBlock(scT('weightTitle'), scEurRuleTxt(w.how), ids.map(id=>{
      const r=SC_EURO[id];
      const sum = r
        ? scT('weightSum').replace('{p}', scFmtEur(scEurPackPrice())).replace('{q}', scFmtNum(r.qty))
                          .replace('{f}', scFmtNum(w.factor)).replace('{b}', scFmtEur(scEurUnit(id)))
        : scFmtEur(scEurUnit(id));
      return ieRuleLi(id, '', sum);
    }));
  }).filter(Boolean).join('');
}

(async function(){
  await scLoadItems();          // noms, catégories, images, et le décompte total du référentiel
  await scLoadEuro();           // le relevé lui-même
  scApplyTranslations();
  ieRenderCatFilter(); ieRender();

  const tb=ieEl('ie-tbody');     if(tb) iePvBind(tb);
  const s=ieEl('ie-search');     if(s) s.addEventListener('input', ieRender);
  const c=ieEl('ie-cat-filter'); if(c) c.addEventListener('change', ieRender);

  if (window.HelpSystem) HelpSystem.init({
    id:'shop-items-euro', banner:true,
    title:{FR:'Prix réel des objets — Aide', EN:'Real-money item values — Help'},
    summary:{FR:"Ce tableau donne ce que chaque objet coûte en argent réel, d'après le pack payant où il apparaît.",
             EN:"This table gives what each item costs in real money, based on the paid pack it appears in."},
    steps:{
      FR:["Le prix affiché est celui d'UN exemplaire : prix du pack ÷ quantité obtenue.",
          "La colonne « Pack d'origine » dit où trouver le plus de cet objet — c'est ce qui permet de vérifier une valeur qui paraît fausse.",
          "Une pastille à côté du pack veut dire que le prix ne sort pas de ce pack mais d'une règle : « Barème » pour les accélérateurs (tous alignés sur le prix de la minute), « Calculé » pour une valeur déduite d'un autre objet, « ×0,25 » pour les ressources brutes, volontairement comptées au quart.",
          "Chaque règle est détaillée en toutes lettres sous le tableau, avec son calcul.",
          "Les pastilles € / $ changent de devise. Le choix vaut aussi pour les pages boutique.",
          "Cherche par nom d'objet ou par nom de pack, ou filtre par catégorie.",
          "Seuls les objets qu'on sait chiffrer sont listés : les autres n'ont aucun prix connu.",
          "Ce tableau est en lecture seule et n'a aucun rapport avec les valeurs en gemmes — les deux se lisent séparément."],
      EN:["The price shown is for ONE unit: pack price ÷ quantity received.",
          "The “Source pack” column says where to find the most of an item — that is what lets you check a value that looks wrong.",
          "A pill next to the pack means the price does not come from that pack but from a rule: “Scale” for speedups (all lined up on the price of one minute), “Calculated” for a value worked out from another item, “×0.25” for raw resources, deliberately counted at a quarter.",
          "Every rule is spelled out under the table, with its maths.",
          "The € / $ pills switch currency. The choice also applies to the shop pages.",
          "Search by item name or by pack name, or filter by category.",
          "Only items we can price are listed: the others have no known price.",
          "This table is read-only and unrelated to the gem values — the two are read separately."]
    },
    links:[{label:{FR:'Valeur des objets (gemmes)', EN:'Item values (gems)'}, href:'shop/items.html'},
           {label:{FR:'Retour aux boutiques', EN:'Back to shops'}, href:'shop_calc.html'}]
  });

  window.addEventListener('langChanged',()=>{ scApplyTranslations(); ieRenderCatFilter(); ieRender(); });
})();
