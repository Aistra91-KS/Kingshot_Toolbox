// ============================================================
//  VALEUR DES OBJETS (shop/items.html)
//  Référentiel des valeurs en gemmes : c'est la table que toutes les pages boutique
//  interrogent. Les éditions vivent dans localStorage (profil actif) ; le fichier JSON
//  reste la liste de référence, seule la valeur éditée est réappliquée par id.
// ============================================================

function scRenderCatFilter(){
  const sel=document.getElementById('item-cat-filter'); if(!sel) return;
  const cats=[...new Set(SC_ITEMS.filter(i=>!i.skin).map(i=>i.category).filter(Boolean))].sort();
  const cur=sel.value;
  sel.innerHTML=`<option value="">${scT('allCats')}</option>`+cats.map(c=>`<option value="${scEscAttr(c)}">${scEscAttr(c)}</option>`).join('');
  if(cats.includes(cur)) sel.value=cur;
}

function scRenderItems(){
  const tb=document.getElementById('item-tbody'); if(!tb) return;
  const lang=scLang();
  const q=(document.getElementById('item-search')?.value||'').trim().toLowerCase();
  const cat=document.getElementById('item-cat-filter')?.value||'';
  const rows=SC_ITEMS.map((it,idx)=>({it,idx})).filter(({it})=>{
    if(it.skin) return false;                    // variante visuelle : aucune valeur propre à éditer
    if(cat&&it.category!==cat) return false;
    if(!q) return true;
    return scNameEN(it).toLowerCase().includes(q)||((it.name&&it.name.FR)||'').toLowerCase().includes(q);
  });
  tb.innerHTML=rows.map(({it,idx})=>{
    const color=scCatColor(it.category), img=scImg(it);
    return `<tr style="border-left:4px solid ${color};background:${color}14;">
      <td style="width:46px;"><div class="sc-item-img" style="background-image:url('img/Item/${img}.webp');background-color:${color}33;"></div></td>
      <td style="font-weight:600;">${scEscAttr(scName(it,lang))}</td>
      <td><span style="color:${color};font-weight:600;font-size:12px;">${scEscAttr(it.category)}</span></td>
      <td><input type="number" min="0" step="1" inputmode="numeric" class="table-input" style="width:120px;text-align:right;" value="${it.gemValue}" onchange="scUpdateGem(${idx},this.value)"></td></tr>`;
  }).join('');
  const cnt=document.getElementById('item-count');
  if(cnt) cnt.textContent=`${rows.length} / ${SC_ITEMS.filter(i=>!i.skin).length} ${scT('count')}`;
}

window.scUpdateGem=function(idx,val){
  if(!SC_ITEMS[idx]) return;
  const n=parseFloat(String(val).replace(',','.'));
  SC_ITEMS[idx].gemValue=isNaN(n)?0:n;
  scSaveItems();
};
window.scResetItems=function(){
  showAppConfirm(scT('confirmReset'),()=>{
    SC_ITEMS=SC_DEFAULTS.map(x=>({...x}));
    SC_ITEMS.forEach(it=>{ if(typeof it.name==='string') it.name={EN:it.name,FR:it.name}; });
    scSaveItems(); scRenderCatFilter(); scRenderItems();
  });
};

(async function(){
  await scLoadItems();
  scApplyTranslations();
  scRenderCatFilter(); scRenderItems();

  const s=document.getElementById('item-search'); if(s) s.addEventListener('input',scRenderItems);
  const c=document.getElementById('item-cat-filter'); if(c) c.addEventListener('change',scRenderItems);

  if (window.HelpSystem) HelpSystem.init({
    id:'shop-items', banner:true,
    title:{FR:'Valeur des objets — Aide', EN:'Item values — Help'},
    summary:{FR:"Ce tableau donne la valeur en gemmes de chaque objet. C'est lui qui sert de référence à toutes les pages boutique du site.",
             EN:"This table holds each item's value in gems. Every shop page on the site uses it as its reference."},
    steps:{
      FR:["Cherche un objet par son nom, ou filtre par catégorie.",
          "Modifie une valeur : elle est enregistrée aussitôt, sur ton appareil et pour le profil actif.",
          "Toutes les boutiques utilisent cette valeur pour calculer le ratio « valeur ÷ coût ».",
          "Le bouton « Réinitialiser les valeurs » restaure les valeurs d'origine du site."],
      EN:["Search an item by name, or filter by category.",
          "Edit a value: it is saved immediately, on your device and for the active profile.",
          "Every shop uses that value to compute the “value ÷ cost” ratio.",
          "The “Reset values” button restores the site's original values."]
    },
    links:[{label:{FR:'Retour aux boutiques', EN:'Back to shops'}, href:'shop_calc'}]
  });

  window.addEventListener('langChanged',()=>{ scApplyTranslations(); scRenderCatFilter(); scRenderItems(); });
})();
