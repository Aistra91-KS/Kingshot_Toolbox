// ============================================================
//  SHOP CALCULATION
//  Phase 1 : Data Item (base éditable, source de vérité)
//  Onglets : Data Item · Shop Classique · Shop Événement · Coffres
//  Vanilla · localStorage · bilingue
// ============================================================

const i18nShop = {
  FR: {
    scTitle: "Shop Calculation",
    scDesc: "Comparez le coût des objets en boutique à leur valeur en gemmes pour repérer les meilleures affaires.",
    tabData: "Data Item", tabClassic: "Shop Classique", tabEvent: "Shop d'Événement", tabChest: "Coffres",
    colName: "Nom", colCat: "Catégorie", colGem: "Valeur (gemmes)", colAct: "",
    addItem: "+ Ajouter un objet", resetItems: "Réinitialiser",
    allCats: "Toutes les catégories",
    confirmReset: "Réinitialiser tous les objets aux valeurs par défaut ? Tes modifications seront perdues.",
    del: "Suppr.", soon: "Bientôt disponible", soonDesc: "Cet onglet arrive dans une prochaine étape.",
    count: "objets"
  },
  EN: {
    scTitle: "Shop Calculation",
    scDesc: "Compare in-shop cost to gem value to spot the best deals.",
    tabData: "Data Item", tabClassic: "Classic Shop", tabEvent: "Event Shop", tabChest: "Chests",
    colName: "Name", colCat: "Category", colGem: "Value (gems)", colAct: "",
    addItem: "+ Add item", resetItems: "Reset",
    allCats: "All categories",
    confirmReset: "Reset all items to default values? Your changes will be lost.",
    del: "Del.", soon: "Coming soon", soonDesc: "This tab is coming in a next step.",
    count: "items"
  }
};
function scLang() { return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k) { return (i18nShop[scLang()] || i18nShop.FR)[k]; }

let SC_ITEMS = [];
let SC_DEFAULTS = [];

function scEscAttr(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

async function scLoadItems() {
  try {
    const res = await fetch('data/shopcalc_items.json');
    SC_DEFAULTS = await res.json();
  } catch (e) { console.error('shopcalc_items.json introuvable', e); SC_DEFAULTS = []; }
  const saved = (typeof safeParse === 'function') ? safeParse(STORAGE_KEYS.shopcalcItems, null)
                                                  : JSON.parse(localStorage.getItem(STORAGE_KEYS.shopcalcItems) || 'null');
  SC_ITEMS = (saved && Array.isArray(saved) && saved.length) ? saved : SC_DEFAULTS.map(x => ({ ...x }));
}
function scSaveItems() { localStorage.setItem(STORAGE_KEYS.shopcalcItems, JSON.stringify(SC_ITEMS)); }

function scRenderCatFilter() {
  const sel = document.getElementById('item-cat-filter');
  if (!sel) return;
  const cats = [...new Set(SC_ITEMS.map(i => i.category).filter(Boolean))].sort();
  const cur = sel.value;
  sel.innerHTML = `<option value="">${scT('allCats')}</option>` + cats.map(c => `<option value="${scEscAttr(c)}">${scEscAttr(c)}</option>`).join('');
  if (cats.includes(cur)) sel.value = cur;
}

function scRenderItems() {
  const tbody = document.getElementById('item-tbody');
  if (!tbody) return;
  const q = (document.getElementById('item-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('item-cat-filter')?.value || '';
  const rows = SC_ITEMS.map((it, idx) => ({ it, idx }))
    .filter(({ it }) => (!cat || it.category === cat) && (!q || (it.name || '').toLowerCase().includes(q)));

  tbody.innerHTML = rows.map(({ it, idx }) => `
    <tr>
      <td><input class="table-input" style="width:100%;" value="${scEscAttr(it.name)}" oninput="scUpdateItem(${idx},'name',this.value)"></td>
      <td><input class="table-input" style="width:100%;" value="${scEscAttr(it.category)}" onchange="scUpdateItem(${idx},'category',this.value)"></td>
      <td><input type="number" min="0" step="1" class="table-input" style="width:120px;text-align:right;" value="${it.gemValue}" onchange="scUpdateItem(${idx},'gemValue',this.value)"></td>
      <td style="text-align:center;"><button class="btn-reset" style="padding:4px 9px;font-size:12px;" onclick="scDeleteItem(${idx})">${scT('del')}</button></td>
    </tr>`).join('');

  const cnt = document.getElementById('item-count');
  if (cnt) cnt.textContent = `${rows.length} / ${SC_ITEMS.length} ${scT('count')}`;
}

window.scUpdateItem = function (idx, field, val) {
  if (!SC_ITEMS[idx]) return;
  if (field === 'gemValue') {
    let n = parseFloat(String(val).replace(',', '.'));
    SC_ITEMS[idx].gemValue = isNaN(n) ? 0 : n;
  } else {
    SC_ITEMS[idx][field] = val;
    if (field === 'category') scRenderCatFilter();
  }
  scSaveItems();
};
window.scDeleteItem = function (idx) {
  SC_ITEMS.splice(idx, 1);
  scSaveItems(); scRenderCatFilter(); scRenderItems();
};
window.scAddItem = function () {
  SC_ITEMS.unshift({ id: 'custom_' + Date.now(), name: '', category: 'Other', gemValue: 0 });
  scSaveItems(); scRenderCatFilter(); scRenderItems();
};
window.scResetItems = function () {
  showAppConfirm(scT('confirmReset'), () => {
    SC_ITEMS = SC_DEFAULTS.map(x => ({ ...x }));
    scSaveItems(); scRenderCatFilter(); scRenderItems();
  });
};

// Onglets
window.scTab = function (name) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.shop-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
};

function scApplyTranslations() {
  if (window.GlobalLang) GlobalLang.applyI18n(i18nShop[scLang()]);
}

// Démarrage
(async function () {
  await scLoadItems();
  scApplyTranslations();
  scRenderCatFilter();
  scRenderItems();
  const s = document.getElementById('item-search'); if (s) s.addEventListener('input', scRenderItems);
  const c = document.getElementById('item-cat-filter'); if (c) c.addEventListener('change', scRenderItems);
  window.addEventListener('langChanged', () => { scApplyTranslations(); scRenderCatFilter(); scRenderItems(); });
})();
