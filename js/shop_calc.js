// ============================================================
//  SHOP CALCULATION
//  Phase 1 : Data Item (lecture seule sauf valeur gemmes)
//  Onglets : Shop Classique · Shop Événement · Coffres · Data Item
//  Vanilla · localStorage · bilingue
// ============================================================

const i18nShop = {
  FR: {
    scTitle: "Shop Calculation",
    scDesc: "Comparez le coût des objets en boutique à leur valeur en gemmes pour repérer les meilleures affaires.",
    tabData: "Data Item", tabClassic: "Shop Classique", tabEvent: "Shop d'Événement", tabChest: "Coffres",
    colImg: "", colName: "Nom", colCat: "Catégorie", colGem: "Valeur (gemmes)",
    resetItems: "Réinitialiser les valeurs",
    allCats: "Toutes les catégories",
    confirmReset: "Réinitialiser toutes les valeurs en gemmes par défaut ? Tes modifications seront perdues.",
    soon: "Bientôt disponible", soonDesc: "Cet onglet arrive dans une prochaine étape.",
    count: "objets"
  },
  EN: {
    scTitle: "Shop Calculation",
    scDesc: "Compare in-shop cost to gem value to spot the best deals.",
    tabData: "Data Item", tabClassic: "Classic Shop", tabEvent: "Event Shop", tabChest: "Chests",
    colImg: "", colName: "Name", colCat: "Category", colGem: "Value (gems)",
    resetItems: "Reset values",
    allCats: "All categories",
    confirmReset: "Reset all gem values to defaults? Your changes will be lost.",
    soon: "Coming soon", soonDesc: "This tab is coming in a next step.",
    count: "items"
  }
};
function scLang() { return window.GlobalLang ? GlobalLang.get() : 'FR'; }
function scT(k) { return (i18nShop[scLang()] || i18nShop.FR)[k]; }

// Couleur par catégorie (code couleur de ligne)
const SC_CAT_COLORS = {
  Speedup: '#5b9bd5', Pet: '#70ad47', Other: '#9aa0a6', Equipment: '#ed7d31',
  Event: '#a05bd5', Governor: '#4ecdc4', Hero: '#f5b840', Island: '#48c7e0',
  Resources: '#c0894a', VIP: '#e060b0', Cosmetic: '#e08bb0'
};
function scCatColor(cat) { return SC_CAT_COLORS[cat] || '#9aa0a6'; }

let SC_ITEMS = [];
let SC_DEFAULTS = [];

function scEscAttr(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function scName(it, lang) {
  if (it.name && typeof it.name === 'object') return it.name[lang] || it.name.EN || it.name.FR || '';
  return it.name || '';
}
function scNameEN(it) {
  if (it.name && typeof it.name === 'object') return it.name.EN || it.name.FR || '';
  return it.name || '';
}

async function scLoadItems() {
  try {
    const res = await fetch('data/shopcalc_items.json');
    SC_DEFAULTS = await res.json();
  } catch (e) { console.error('shopcalc_items.json introuvable', e); SC_DEFAULTS = []; }
  const saved = (typeof safeParse === 'function') ? safeParse(STORAGE_KEYS.shopcalcItems, null)
                                                  : JSON.parse(localStorage.getItem(STORAGE_KEYS.shopcalcItems) || 'null');
  SC_ITEMS = (saved && Array.isArray(saved) && saved.length) ? saved : SC_DEFAULTS.map(x => ({ ...x }));
  // Migration : ancien nom en chaîne -> objet bilingue
  SC_ITEMS.forEach(it => { if (typeof it.name === 'string') it.name = { EN: it.name, FR: it.name }; });
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
  const lang = scLang();
  const q = (document.getElementById('item-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('item-cat-filter')?.value || '';
  const rows = SC_ITEMS.map((it, idx) => ({ it, idx }))
    .filter(({ it }) => {
      if (cat && it.category !== cat) return false;
      if (!q) return true;
      const en = scNameEN(it).toLowerCase();
      const fr = (it.name && it.name.FR ? it.name.FR : '').toLowerCase();
      return en.includes(q) || fr.includes(q);
    });

  tbody.innerHTML = rows.map(({ it, idx }) => {
    const color = scCatColor(it.category);
    const img = encodeURIComponent(scNameEN(it));
    return `
    <tr style="border-left: 4px solid ${color}; background: ${color}14;">
      <td style="width: 46px;"><div class="sc-item-img" style="background-image: url('img/Item/${img}.png'); background-color: ${color}33;"></div></td>
      <td style="font-weight: 600;">${scEscAttr(scName(it, lang))}</td>
      <td><span style="color: ${color}; font-weight: 600; font-size: 12px;">${scEscAttr(it.category)}</span></td>
      <td><input type="number" min="0" step="1" class="table-input" style="width: 120px; text-align: right;" value="${it.gemValue}" onchange="scUpdateGem(${idx}, this.value)"></td>
    </tr>`;
  }).join('');

  const cnt = document.getElementById('item-count');
  if (cnt) cnt.textContent = `${rows.length} / ${SC_ITEMS.length} ${scT('count')}`;
}

window.scUpdateGem = function (idx, val) {
  if (!SC_ITEMS[idx]) return;
  let n = parseFloat(String(val).replace(',', '.'));
  SC_ITEMS[idx].gemValue = isNaN(n) ? 0 : n;
  scSaveItems();
};
window.scResetItems = function () {
  showAppConfirm(scT('confirmReset'), () => {
    SC_ITEMS = SC_DEFAULTS.map(x => ({ ...x }));
    SC_ITEMS.forEach(it => { if (typeof it.name === 'string') it.name = { EN: it.name, FR: it.name }; });
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

(async function () {
  await scLoadItems();
  scApplyTranslations();
  scRenderCatFilter();
  scRenderItems();
  const s = document.getElementById('item-search'); if (s) s.addEventListener('input', scRenderItems);
  const c = document.getElementById('item-cat-filter'); if (c) c.addEventListener('change', scRenderItems);
  window.addEventListener('langChanged', () => { scApplyTranslations(); scRenderCatFilter(); scRenderItems(); });
})();
