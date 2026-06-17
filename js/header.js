// ============================================================
//  HEADER CONTEXTUEL — généré depuis window.SITE (site-config.js)
//  Logo (portail) · Jeu · Catégorie · Outils filtrés · Langue · Thème
//  Dropdowns custom (modernes) · icônes SVG inline (offline)
// ============================================================

// --- Icônes SVG inline (Lucide, licence ISC/MIT) ---
const HEADER_ICONS = {
  "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  "coins": '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  "paw-print": '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  "axe": '<path d="m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9"/><path d="M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z"/>',
  "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "crown": '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>'
};

function hdrSvg(name, size = 18) {
  const inner = HEADER_ICONS[name] || '';
  return `<svg class="hdr-ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// --- État global du header ---
let HDR_CURRENT_PAGE = (window.location.pathname.split('/').pop() || 'index.html');
let HDR_CTX = { gameId: null, catId: null, toolId: null };
let HDR_SELECTED_CAT = null;

function hdrLang() { return window.GlobalLang ? window.GlobalLang.get() : 'FR'; }
function hdrT(obj) { return obj ? (obj[hdrLang()] || obj.EN || obj.FR || '') : ''; }

function hdrResolveContext(page) {
  const S = window.SITE;
  for (const game of S.games) {
    for (const cat of (game.categories || [])) {
      for (const toolId of (cat.tools || [])) {
        const tool = S.tools[toolId];
        if (tool && tool.href === page) {
          return { gameId: game.id, catId: cat.id, toolId: toolId };
        }
      }
    }
  }
  const firstGame = S.games.find(g => g.status === 'active') || S.games[0];
  const firstCat  = (firstGame.categories || []).find(c => c.status === 'active');
  return { gameId: firstGame.id, catId: firstCat ? firstCat.id : null, toolId: null };
}

function hdrGetGame(id) { return window.SITE.games.find(g => g.id === id); }
function hdrGetCat(gameId, catId) {
  const g = hdrGetGame(gameId);
  return g ? (g.categories || []).find(c => c.id === catId) : null;
}

// ---------- Dropdown custom (générique) ----------
function hdrCloseAllDropdowns(except) {
  document.querySelectorAll('.hdr-dd.open').forEach(d => { if (d !== except) d.classList.remove('open'); });
}

function hdrBuildDropdown(containerId, items, currentValue, onSelect) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const cur = items.find(i => i.value === currentValue) || items.find(i => !i.disabled) || items[0];
  box.classList.add('hdr-dd');
  box.innerHTML = `
    <button type="button" class="hdr-dd-trigger">
      <span class="hdr-dd-current">${cur ? cur.label : ''}</span>
      <span class="hdr-dd-chevron" aria-hidden="true">▾</span>
    </button>
    <div class="hdr-dd-panel" role="listbox">
      ${items.map(i => `
        <button type="button" class="hdr-dd-item ${i.value === currentValue ? 'active' : ''} ${i.disabled ? 'disabled' : ''}"
                data-value="${i.value}" ${i.disabled ? 'disabled' : ''}>${i.label}</button>`).join('')}
    </div>`;

  const trigger = box.querySelector('.hdr-dd-trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !box.classList.contains('open');
    hdrCloseAllDropdowns(box);
    box.classList.toggle('open', willOpen);
  });
  box.querySelectorAll('.hdr-dd-item').forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      box.classList.remove('open');
      onSelect(btn.getAttribute('data-value'));
    });
  });
}

// Fermeture au clic extérieur / Échap (une seule fois)
if (!window.__hdrDDInit) {
  window.__hdrDDInit = true;
  document.addEventListener('click', () => hdrCloseAllDropdowns(null));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hdrCloseAllDropdowns(null); });
}

// ---------- Rendus ----------
function hdrRenderGames() {
  const S = window.SITE;
  const items = S.games.map(g => ({
    value: g.id,
    label: hdrT(g.name) + (g.status !== 'active' ? ' — ' + hdrT(S.ui.soon) : ''),
    disabled: g.status !== 'active'
  }));
  hdrBuildDropdown('hdr-game', items, HDR_CTX.gameId, (val) => {
    const g = hdrGetGame(val);
    if (g && g.status === 'active' && g.hub) window.location.href = g.hub;
  });
}

function hdrRenderCategories() {
  const S = window.SITE;
  const game = hdrGetGame(HDR_CTX.gameId);
  const cats = (game && game.categories) || [];
  const items = cats.map(c => ({
    value: c.id,
    label: hdrT(c.name) + (c.status !== 'active' ? ' — ' + hdrT(S.ui.soon) : ''),
    disabled: c.status !== 'active'
  }));
  hdrBuildDropdown('hdr-cat', items, HDR_SELECTED_CAT, (val) => {
    HDR_SELECTED_CAT = val;
    hdrRenderCategories(); // rafraîchit le libellé + l'état actif
    hdrRenderTools();
  });
}

function hdrRenderTools() {
  const box = document.getElementById('hdr-tools');
  if (!box) return;
  const S = window.SITE;
  const cat = hdrGetCat(HDR_CTX.gameId, HDR_SELECTED_CAT);
  if (!cat || !(cat.tools || []).length) {
    box.innerHTML = `<span class="hdr-soon">${hdrT(S.ui.soon)}</span>`;
    return;
  }
  box.innerHTML = cat.tools.map(toolId => {
    const tool = S.tools[toolId];
    if (!tool) return '';
    const isActive = (tool.href === HDR_CURRENT_PAGE);
    const badge = tool.badge ? `<span class="hdr-badge">${hdrT(S.ui[tool.badge]) || tool.badge}</span>` : '';
    return `
      <a href="${tool.href}" class="hdr-tool ${isActive ? 'active' : ''}" title="${hdrT(tool.name)}">
        ${hdrSvg(tool.icon)}
        <span class="hdr-tool-label">${hdrT(tool.name)}</span>
        ${badge}
      </a>`;
  }).join('');
}

// ---------- Construction + injection ----------
(function buildHeader() {
  if (!window.SITE) { console.error('site-config.js manquant — header non généré.'); return; }

  HDR_CTX = hdrResolveContext(HDR_CURRENT_PAGE);
  HDR_SELECTED_CAT = HDR_CTX.catId;

  const portalHref = 'index.html'; // retour portail (deviendra "/" à la restructuration)

  const headerHTML = `
    <header class="app-header">
      <div class="hdr-zone hdr-left">
        <a href="${portalHref}" class="app-header-logo" title="Accueil">
          <span class="logo-icon">⚔️</span>
          <span class="logo-text">KVK Optimizer</span>
        </a>
        <div id="hdr-game" class="hdr-dd" title="Jeu"></div>
      </div>

      <nav class="hdr-zone hdr-center">
        <div id="hdr-cat" class="hdr-dd" title="Catégorie"></div>
        <div id="hdr-tools" class="hdr-tools"></div>
      </nav>

      <div class="hdr-zone hdr-right">
        <div class="header-lang-wrapper">
          <select id="global-lang-select" class="header-lang-select">
            <option value="FR">FR</option>
            <option value="EN">EN</option>
          </select>
        </div>
        <button class="app-header-theme" id="header-theme-toggle" onclick="toggleHeaderTheme()" title="Changer le thème">
          <span id="header-theme-icon">🌙</span>
        </button>
      </div>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.classList.add('has-app-header');

  hdrRenderGames();
  hdrRenderCategories();
  hdrRenderTools();

  initHeaderTheme();

  if (window.GlobalLang) {
    window.GlobalLang.applyToSelect('global-lang-select');
    document.documentElement.lang = hdrLang().toLowerCase();
  }
})();

// Re-rendu au changement de langue
window.addEventListener('langChanged', (e) => {
  const select = document.getElementById('global-lang-select');
  if (select && e.detail) select.value = e.detail.lang;
  if (e.detail) document.documentElement.lang = (e.detail.lang || 'en').toLowerCase();
  hdrRenderGames();
  hdrRenderCategories();
  hdrRenderTools();
});

// ============ THEME (gestion globale) ============
function initHeaderTheme() {
  const savedTheme = localStorage.getItem('hub_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateHeaderThemeIcon(savedTheme);
}

function toggleHeaderTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('hub_theme', target);
  updateHeaderThemeIcon(target);
}

function updateHeaderThemeIcon(theme) {
  const icon = document.getElementById('header-theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ============ MODALES GLOBALES ============
function showAppAlert(message, isSuccess = false, callback = null) {
  const color = isSuccess ? 'var(--success)' : 'var(--warning)';
  const icon  = isSuccess ? '✅' : '⚠️';
  const lang  = window.GlobalLang ? window.GlobalLang.get() : 'FR';
  const title = isSuccess ? (lang === 'EN' ? 'Success' : 'Succès')
                          : (lang === 'EN' ? 'Error'   : 'Erreur');
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay active';
  overlay.innerHTML = `
      <div class="custom-alert-box" style="border-top:4px solid ${color};">
          <div class="custom-alert-icon">${icon}</div>
          <h3 style="color:${color};margin:0 0 15px;font-size:16px;text-transform:uppercase;letter-spacing:1px;">${title}</h3>
          <div class="custom-alert-msg">${message}</div>
          <button class="btn-modern btn-modern-secondary" style="width:100%;border-color:${color};color:${color};">OK</button>
      </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('button').onclick = () => {
      overlay.classList.remove('active');
      setTimeout(() => { document.body.removeChild(overlay); if (callback) callback(); }, 300);
  };
}

function showAppConfirm(message, onConfirm, onCancel = null) {
  const lang = window.GlobalLang ? window.GlobalLang.get() : 'FR';
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay active';
  overlay.innerHTML = `
      <div class="custom-alert-box" style="border-top:4px solid var(--warning);">
          <div class="custom-alert-icon">⚠️</div>
          <div class="custom-alert-msg" style="margin-bottom:20px;">${message}</div>
          <div style="display:flex;gap:10px;">
              <button id="confirm-yes" class="btn-modern" style="flex:1;">${lang === 'EN' ? 'Confirm' : 'Confirmer'}</button>
              <button id="confirm-no"  class="btn-modern btn-modern-secondary" style="flex:1;">${lang === 'EN' ? 'Cancel' : 'Annuler'}</button>
          </div>
      </div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.classList.remove('active'); setTimeout(() => document.body.removeChild(overlay), 300); };
  overlay.querySelector('#confirm-yes').onclick = () => { close(); onConfirm(); };
  overlay.querySelector('#confirm-no').onclick  = () => { close(); if (onCancel) onCancel(); };
}
