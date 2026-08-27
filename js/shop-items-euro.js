// ============================================================
//  PRIX RÉEL DES OBJETS (shop/items-euro.html)
//  Seconde valorisation, en argent réel : ce que coûte un objet dans le pack payant où il
//  apparaît (prix du pack ÷ quantité obtenue). Table ADMIN en LECTURE SEULE — contrairement
//  au référentiel gemmes (shop/items.html), rien n'est éditable et rien ne part dans
//  localStorage. Indépendante de la valorisation en gemmes : aucun taux de change entre les
//  deux échelles n'est calculé nulle part.
//  Seuls les objets qu'un pack permet de chiffrer sont listés (43 sur 87) ; la note de bas
//  de tableau annonce cette couverture pour qu'une absence ne passe pas pour un oubli.
// ============================================================

function ieEl(id){ return document.getElementById(id); }

// Objets réellement chiffrés, dans l'ORDRE DU RÉFÉRENTIEL — même logique que la page gemmes,
// pour que les deux tableaux se parcourent de la même façon.
function ieAll(){ return SC_ITEMS.filter(it => !it.skin && SC_EURO[it.id]); }

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
        || scEurPacks(it.id).map(scPackName).join(' ').toLowerCase().includes(q);
  });

  tb.innerHTML=rows.map(it=>{
    const color=scCatColor(it.category), img=scImg(it);
    const src=scEurSrc(it.id), pimg=scEurPackImg(it.id);
    // `data-pack` porte l'ID DU PACK (pas son libellé) : c'est le point d'accroche prévu pour
    // l'aperçu d'image au survol, qui ira chercher img/packs/<id>.webp. Il n'est posé que
    // lorsqu'un seul pack atteint le maximum — un « multipack » n'a pas d'image à montrer.
    const packCell = src
      ? `<span class="ie-pack${pimg?'':' is-multi'}"${pimg?` data-pack="${scEscAttr(pimg)}"`:''}>${scEscAttr(src)}</span>`
      : `<span class="dash">${scT('noPack')}</span>`;
    return `<tr style="border-left:4px solid ${color};background:${color}14;">
      <td style="width:46px;"><div class="sc-item-img" style="background-image:url('img/Item/${img}.webp');background-color:${color}33;"></div></td>
      <td style="font-weight:600;">${scEscAttr(scName(it,lang))}</td>
      <td><span style="color:${color};font-weight:600;font-size:12px;">${scEscAttr(it.category)}</span></td>
      <td class="eur">${scFmtEur(scEurUnit(it.id))}</td>
      <td>${packCell}</td></tr>`;
  }).join('');

  const cnt=ieEl('ie-count');
  if(cnt) cnt.textContent=`${rows.length} / ${all.length} ${scT('count')}`;

  const note=ieEl('ie-note');
  if(note) note.textContent=scT('ieNote')
    .replace('{n}', all.length)
    .replace('{t}', SC_ITEMS.filter(i=>!i.skin).length)
    .replace('{z}', scT('zone'+scCur()))
    .replace('{d}', ieDate(SC_EURO_META.updatedAt));
}

(async function(){
  await scLoadItems();          // noms, catégories, images, et le décompte total du référentiel
  await scLoadEuro();           // le relevé lui-même
  scApplyTranslations();
  ieRenderCatFilter(); ieRender();

  const s=ieEl('ie-search');     if(s) s.addEventListener('input', ieRender);
  const c=ieEl('ie-cat-filter'); if(c) c.addEventListener('change', ieRender);

  if (window.HelpSystem) HelpSystem.init({
    id:'shop-items-euro', banner:true,
    title:{FR:'Prix réel des objets — Aide', EN:'Real-money item values — Help'},
    summary:{FR:"Ce tableau donne ce que chaque objet coûte en argent réel, d'après le pack payant où il apparaît.",
             EN:"This table gives what each item costs in real money, based on the paid pack it appears in."},
    steps:{
      FR:["Le prix affiché est celui d'UN exemplaire : prix du pack ÷ quantité obtenue.",
          "La colonne « Pack d'origine » dit d'où vient le chiffre — c'est ce qui permet de vérifier une valeur qui paraît fausse.",
          "Les pastilles € / $ changent de devise. Le choix vaut aussi pour les pages boutique.",
          "Cherche par nom d'objet ou par nom de pack, ou filtre par catégorie.",
          "Seuls les objets vendus dans un pack sont listés : les autres n'ont aucun prix connu.",
          "Ce tableau est en lecture seule et n'a aucun rapport avec les valeurs en gemmes — les deux se lisent séparément."],
      EN:["The price shown is for ONE unit: pack price ÷ quantity received.",
          "The “Source pack” column says where the figure comes from — that is what lets you check a value that looks wrong.",
          "The € / $ pills switch currency. The choice also applies to the shop pages.",
          "Search by item name or by pack name, or filter by category.",
          "Only items sold inside a pack are listed: the others have no known price.",
          "This table is read-only and unrelated to the gem values — the two are read separately."]
    },
    links:[{label:{FR:'Valeur des objets (gemmes)', EN:'Item values (gems)'}, href:'shop/items.html'},
           {label:{FR:'Retour aux boutiques', EN:'Back to shops'}, href:'shop_calc.html'}]
  });

  window.addEventListener('langChanged',()=>{ scApplyTranslations(); ieRenderCatFilter(); ieRender(); });
})();
