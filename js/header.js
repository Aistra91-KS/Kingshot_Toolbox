// ============================================================
//  HEADER CONTEXTUEL — généré depuis window.SITE (site-config.js)
//  Desktop : logo · catégorie · outils · langue · thème
//  Mobile  : logo + bouton ☰ → drawer (toute la nav depuis SITE)
//  Icônes SVG inline (offline)
// ============================================================

// --- Icônes SVG inline (Lucide, licence ISC/MIT) ---
const HEADER_ICONS = {
  "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  "coins": '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  "paw-print": '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  "axe": '<path d="m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9"/><path d="M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z"/>',
  "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "crown": '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  "shopping-cart": '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  "building-2": '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
};

function hdrSvg(name, size = 18) {
  const inner = HEADER_ICONS[name] || '';
  return `<svg class="hdr-ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// --- État global ---
let HDR_CURRENT_PAGE = window.HDR_ACTIVE_HREF || (window.location.pathname.split('/').pop() || 'index.html');
let HDR_CTX = { catId: null, toolId: null };
let HDR_SELECTED_CAT = null;

function hdrLang() { return window.GlobalLang ? window.GlobalLang.get() : 'FR'; }
function hdrT(obj) { return obj ? (obj[hdrLang()] || obj.EN || obj.FR || '') : ''; }

function hdrResolveContext(page) {
  const S = window.SITE;
  for (const cat of (S.categories || [])) {
    for (const toolId of (cat.tools || [])) {
      const tool = S.tools[toolId];
      if (tool && tool.href === page) {
        return { catId: cat.id, toolId: toolId };
      }
    }
  }
  const firstCat = (S.categories || []).find(c => c.status === 'active');
  return { catId: firstCat ? firstCat.id : null, toolId: null };
}

function hdrGetCat(catId) {
  return (window.SITE.categories || []).find(c => c.id === catId) || null;
}

// ---------- Dropdown custom (desktop) ----------
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { hdrCloseAllDropdowns(null); hdrCloseDrawer(); }
  });
}

// ---------- Rendus desktop ----------
function hdrRenderCategories() {
  const S = window.SITE;
  const cats = S.categories || [];
  const items = cats.map(c => ({
    value: c.id,
    label: hdrT(c.name) + (c.status !== 'active' ? ' — ' + hdrT(S.ui.soon) : ''),
    disabled: c.status !== 'active'
  }));
  hdrBuildDropdown('hdr-cat', items, HDR_SELECTED_CAT, (val) => {
    HDR_SELECTED_CAT = val;
    hdrRenderCategories();
    hdrRenderTools();
  });
}

function hdrRenderTools() {
  const box = document.getElementById('hdr-tools');
  if (!box) return;
  const S = window.SITE;
  const cat = hdrGetCat(HDR_SELECTED_CAT);
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

// ---------- Drawer mobile ----------
function hdrBuildDrawer() {
  const drawer = document.getElementById('hdr-drawer');
  if (!drawer || !window.SITE) return;
  const S = window.SITE;
  const lang = hdrLang();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  let nav = '';
  (S.categories || []).forEach(cat => {
    const soon = cat.status !== 'active';
    nav += `<div class="drawer-cat">${hdrT(cat.name)}${soon ? ` <span class="drawer-soon">${hdrT(S.ui.soon)}</span>` : ''}</div>`;
    if (!soon) {
      (cat.tools || []).forEach(toolId => {
        const tool = S.tools[toolId];
        if (!tool) return;
        const active = (tool.href === HDR_CURRENT_PAGE) ? 'active' : '';
        const badge = tool.badge ? `<span class="hdr-badge">${hdrT(S.ui[tool.badge]) || tool.badge}</span>` : '';
        nav += `<a href="${tool.href}" class="drawer-tool ${active}">${hdrSvg(tool.icon, 20)}<span>${hdrT(tool.name)}</span>${badge}</a>`;
      });
    }
  });

  drawer.innerHTML = `
    <div class="drawer-head">
      <span class="drawer-game">${S.name}</span>
      <button class="drawer-close" id="hdr-drawer-close" aria-label="Fermer">✕</button>
    </div>
    ${hdrDrawerProfileHTML()}
    <nav class="drawer-nav">${nav}</nav>
    <div class="drawer-foot">
      <div class="drawer-lang">
        <button class="drawer-lang-btn ${lang === 'FR' ? 'active' : ''}" data-lang="FR">FR</button>
        <button class="drawer-lang-btn ${lang === 'EN' ? 'active' : ''}" data-lang="EN">EN</button>
      </div>
      <button class="drawer-theme" id="hdr-drawer-theme" title="Thème">${isDark ? '☀️' : '🌙'}</button>
    </div>`;

  document.getElementById('hdr-drawer-close').onclick = hdrCloseDrawer;
  drawer.querySelectorAll('.drawer-lang-btn').forEach(b => {
    b.onclick = () => { window.GlobalLang.set(b.getAttribute('data-lang')); };
  });
  document.getElementById('hdr-drawer-theme').onclick = () => { toggleHeaderTheme(); hdrBuildDrawer(); };
  hdrWireDrawerProfile();
}

function hdrOpenDrawer() {
  const d = document.getElementById('hdr-drawer');
  const o = document.getElementById('hdr-drawer-overlay');
  if (d) d.classList.add('open');
  if (o) o.classList.add('open');
  document.body.classList.add('drawer-locked');
}
function hdrCloseDrawer() {
  const d = document.getElementById('hdr-drawer');
  const o = document.getElementById('hdr-drawer-overlay');
  if (d) d.classList.remove('open');
  if (o) o.classList.remove('open');
  document.body.classList.remove('drawer-locked');
}

// ---------- Profils : i18n + helpers (déclarés avant l'IIFE : const non hoistées) ----------
const PFP_I18N = {
  FR: {
    accounts: 'Comptes', active: 'Actif', switchTo: 'Basculer',
    newProfile: 'Nouveau profil', manage: 'Gérer les profils',
    language: 'Langue', theme: 'Thème',
    manageTitle: 'Gérer les profils',
    manageDesc: 'Chaque profil garde ses propres données (héros, calculs, niveaux…). La langue et le thème restent communs à tous les profils.',
    delete: 'Supprimer', switched: 'Profil actif : ',
    confirmDelete: 'Supprimer ce profil et toutes ses données ? Cette action est irréversible.',
    deleteActiveHint: 'Basculez sur un autre profil avant de supprimer celui-ci.',
    backupHint: 'Astuce : exportez un profil via « Sauvegarde Globale » pour le transférer sur un autre appareil.'
  },
  EN: {
    accounts: 'Accounts', active: 'Active', switchTo: 'Switch',
    newProfile: 'New profile', manage: 'Manage profiles',
    language: 'Language', theme: 'Theme',
    manageTitle: 'Manage profiles',
    manageDesc: 'Each profile keeps its own data (heroes, calculations, levels…). Language and theme stay shared across profiles.',
    delete: 'Delete', switched: 'Active profile: ',
    confirmDelete: 'Delete this profile and all its data? This cannot be undone.',
    deleteActiveHint: 'Switch to another profile before deleting this one.',
    backupHint: 'Tip: export a profile via “Global Backup” to move it to another device.'
  }
};
function pfpT(key) { return (PFP_I18N[hdrLang()] || PFP_I18N.EN)[key] || key; }
function hdrEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function hdrProfInitial(p) {
  const n = ((p && p.name) || '?').trim();
  return n ? n.charAt(0).toUpperCase() : '?';
}
let hdrReclaim = 0; // largeur (px) rendue aux outils quand on condense langue+thème

// ---------- Construction + injection ----------
(function buildHeader() {
  if (!window.SITE) { console.error('site-config.js manquant — header non généré.'); return; }
  const S = window.SITE;

  // Favicon (injecté une seule fois, vaut pour toutes les pages)
  if (!document.querySelector('link[rel="icon"]')) {
    const mk = (rel, type, href, sizes) => { const l = document.createElement('link'); l.rel = rel; if (type) l.type = type; if (sizes) l.sizes = sizes; l.href = href; document.head.appendChild(l); };
    mk('icon', 'image/svg+xml', 'img/logo/favicon.svg');
    mk('alternate icon', 'image/png', 'img/logo/favicon-32.png');
    mk('apple-touch-icon', null, 'img/logo/apple-touch-icon.png', '180x180');
  }

  HDR_CTX = hdrResolveContext(HDR_CURRENT_PAGE);
  HDR_SELECTED_CAT = HDR_CTX.catId;

  const homeHref = S.home || 'index.html';

  const headerHTML = `
    <header class="app-header">
      <div class="hdr-zone hdr-left">
        <a href="${homeHref}" class="app-header-logo" title="Accueil">
          <img class="logo-icon" src="img/logo/favicon.svg" alt="" width="24" height="24">
          <span class="logo-text">${S.name}</span>
        </a>
      </div>

      <nav class="hdr-zone hdr-center">
        <div id="hdr-cat" class="hdr-dd" title="Catégorie"></div>
        <div id="hdr-tools" class="hdr-tools"></div>
      </nav>

      <div class="hdr-zone hdr-right">
        <div class="pfp hdr-dd" id="hdr-profile"></div>
        <div class="header-lang-wrapper">
          <select id="global-lang-select" class="header-lang-select">
            <option value="FR">FR</option>
            <option value="EN">EN</option>
          </select>
        </div>
        <button class="app-header-theme" id="header-theme-toggle" onclick="toggleHeaderTheme()" title="Changer le thème">
          <span id="header-theme-icon">🌙</span>
        </button>
        <button class="hdr-burger" id="hdr-burger" aria-label="Menu" title="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.classList.add('has-app-header');

  // Drawer + overlay (mobile)
  document.body.insertAdjacentHTML('beforeend',
    '<div class="hdr-drawer-overlay" id="hdr-drawer-overlay"></div>' +
    '<aside class="hdr-drawer" id="hdr-drawer" aria-hidden="true"></aside>');

  hdrRenderCategories();
  hdrRenderTools();
  hdrBuildProfile();
  hdrBuildDrawer();

  const burger = document.getElementById('hdr-burger');
  if (burger) burger.addEventListener('click', hdrOpenDrawer);
  const overlay = document.getElementById('hdr-drawer-overlay');
  if (overlay) overlay.addEventListener('click', hdrCloseDrawer);

  initHeaderTheme();
  hdrInitAdaptive();
  hdrShowSwitchToast();

  if (window.GlobalLang) {
    window.GlobalLang.applyToSelect('global-lang-select');
    document.documentElement.lang = hdrLang().toLowerCase();
  }
})();

// Re-rendu au changement de langue
// (NB : un appel résiduel à hdrRenderGames() — fonction jamais définie, reliquat
// de l'ère multi-jeux — levait ici une ReferenceError qui court-circuitait les
// trois re-rendus ci-dessous : le header ne se retraduisait jamais.)
window.addEventListener('langChanged', (e) => {
  const select = document.getElementById('global-lang-select');
  if (select && e.detail) select.value = e.detail.lang;
  if (e.detail) document.documentElement.lang = (e.detail.lang || 'en').toLowerCase();
  hdrRenderCategories();
  hdrRenderTools();
  hdrBuildProfile();
  hdrBuildDrawer();
  hdrEvaluateAdaptive();
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
  if (icon) { icon.textContent = theme === 'dark' ? '☀️' : '🌙'; }
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

// ============================================================
//  PROFILS (comptes) — pastille desktop, panneau, drawer mobile,
//  modale de gestion, header adaptatif (Option B), toast de bascule.
//  Toutes ces fonctions sont des déclarations → hoistées, donc
//  disponibles dès l'IIFE buildHeader ci-dessus.
// ============================================================

// ---------- Pastille profil (desktop) ----------
function hdrBuildProfile() {
  const box = document.getElementById('hdr-profile');
  if (!box) return;
  if (!window.Profiles) { box.style.display = 'none'; return; }
  const active = Profiles.active();
  const wasOpen = box.classList.contains('open');
  box.innerHTML = `
    <button type="button" class="pfp-trigger" aria-haspopup="menu" aria-expanded="${wasOpen}" title="${hdrEsc(active.name)}">
      <span class="pfp-avatar" style="--ring:${active.color}">${hdrEsc(hdrProfInitial(active))}</span>
      <span class="pfp-chevron" aria-hidden="true">▾</span>
    </button>
    <div class="pfp-panel hdr-dd-panel" role="menu">${hdrProfilePanelHTML()}</div>`;

  const trigger = box.querySelector('.pfp-trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !box.classList.contains('open');
    hdrCloseAllDropdowns(box);
    box.classList.toggle('open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });
  hdrWireProfilePanel(box);
}

function hdrProfilePanelHTML() {
  const rows = Profiles.list().map((p) => {
    const act = p.id === Profiles.activeId();
    return `<button type="button" class="pfp-row ${act ? 'active' : ''}" data-id="${p.id}">
      <span class="pfp-avatar sm" style="--ring:${p.color}">${hdrEsc(hdrProfInitial(p))}</span>
      <span class="pfp-row-name">${hdrEsc(p.name)}</span>
      ${act ? `<span class="pfp-row-badge">${hdrEsc(pfpT('active'))}</span>` : ''}
    </button>`;
  }).join('');
  const lang = hdrLang();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return `
    <div class="pfp-head">${hdrEsc(pfpT('accounts'))}</div>
    <div class="pfp-list">${rows}</div>
    <div class="pfp-sep"></div>
    <button type="button" class="pfp-act" data-act="new"><span class="pfp-act-ic">＋</span>${hdrEsc(pfpT('newProfile'))}</button>
    <button type="button" class="pfp-act" data-act="manage"><span class="pfp-act-ic">⚙</span>${hdrEsc(pfpT('manage'))}</button>
    <div class="pfp-chrome">
      <div class="pfp-chrome-row">
        <span>${hdrEsc(pfpT('language'))}</span>
        <div class="pfp-chrome-lang">
          <button type="button" data-lang="FR" class="${lang === 'FR' ? 'active' : ''}">FR</button>
          <button type="button" data-lang="EN" class="${lang === 'EN' ? 'active' : ''}">EN</button>
        </div>
      </div>
      <div class="pfp-chrome-row">
        <span>${hdrEsc(pfpT('theme'))}</span>
        <button type="button" class="pfp-chrome-theme" data-act="theme">${isDark ? '☀️' : '🌙'}</button>
      </div>
    </div>`;
}

function hdrWireProfilePanel(box) {
  const panel = box.querySelector('.pfp-panel');
  if (panel) panel.addEventListener('click', (e) => e.stopPropagation());

  box.querySelectorAll('.pfp-row').forEach((r) => {
    r.addEventListener('click', () => {
      const id = r.getAttribute('data-id');
      if (id === Profiles.activeId()) { box.classList.remove('open'); return; }
      Profiles.switch(id);
    });
  });
  box.querySelectorAll('.pfp-act').forEach((a) => {
    a.addEventListener('click', () => {
      const act = a.getAttribute('data-act');
      if (act === 'new') { Profiles.switch(Profiles.create().id); }
      else if (act === 'manage') { box.classList.remove('open'); hdrOpenProfilesModal(); }
      else if (act === 'theme') {
        toggleHeaderTheme();
        hdrBuildProfile();
        const nb = document.getElementById('hdr-profile');
        if (nb) nb.classList.add('open');
      }
    });
  });
  box.querySelectorAll('.pfp-chrome-lang button').forEach((b) => {
    b.addEventListener('click', () => { if (window.GlobalLang) window.GlobalLang.set(b.getAttribute('data-lang')); });
  });
}

// ---------- Bloc profil du drawer (mobile) ----------
function hdrDrawerProfileHTML() {
  if (!window.Profiles) return '';
  const active = Profiles.active();
  const rows = Profiles.list().map((p) => {
    const act = p.id === Profiles.activeId();
    return `<button type="button" class="drawer-profile-row ${act ? 'active' : ''}" data-id="${p.id}">
      <span class="pfp-avatar sm" style="--ring:${p.color}">${hdrEsc(hdrProfInitial(p))}</span>
      <span class="pfp-row-name">${hdrEsc(p.name)}</span>
      ${act ? `<span class="pfp-row-badge">${hdrEsc(pfpT('active'))}</span>` : ''}
    </button>`;
  }).join('');
  return `
    <div class="drawer-profile" id="drawer-profile">
      <button type="button" class="drawer-profile-card" id="drawer-profile-toggle">
        <span class="pfp-avatar lg" style="--ring:${active.color}">${hdrEsc(hdrProfInitial(active))}</span>
        <span class="drawer-profile-meta">
          <span class="drawer-profile-label">${hdrEsc(pfpT('accounts'))}</span>
          <span class="drawer-profile-name">${hdrEsc(active.name)}</span>
        </span>
        <span class="drawer-profile-chevron">▾</span>
      </button>
      <div class="drawer-profile-body">
        ${rows}
        <button type="button" class="drawer-profile-manage" data-act="new"><span class="pfp-act-ic">＋</span>${hdrEsc(pfpT('newProfile'))}</button>
        <button type="button" class="drawer-profile-manage" data-act="manage"><span class="pfp-act-ic">⚙</span>${hdrEsc(pfpT('manage'))}</button>
      </div>
    </div>`;
}

function hdrWireDrawerProfile() {
  const wrap = document.getElementById('drawer-profile');
  if (!wrap || !window.Profiles) return;
  const toggle = document.getElementById('drawer-profile-toggle');
  if (toggle) toggle.onclick = () => wrap.classList.toggle('open');
  wrap.querySelectorAll('.drawer-profile-row').forEach((r) => {
    r.onclick = () => {
      const id = r.getAttribute('data-id');
      if (id === Profiles.activeId()) { wrap.classList.remove('open'); return; }
      Profiles.switch(id);
    };
  });
  wrap.querySelectorAll('.drawer-profile-manage').forEach((a) => {
    a.onclick = () => {
      const act = a.getAttribute('data-act');
      if (act === 'new') { Profiles.switch(Profiles.create().id); }
      else { hdrCloseDrawer(); hdrOpenProfilesModal(); }
    };
  });
}

// ---------- Modale de gestion des profils ----------
function hdrOpenProfilesModal() {
  if (!window.Profiles) return;
  let overlay = document.getElementById('pfp-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pfp-modal-overlay';
    overlay.className = 'backup-overlay';
    overlay.innerHTML = `
      <div class="backup-modal" role="dialog" aria-modal="true">
        <div class="backup-header">
          <h3 class="backup-title" id="pfp-modal-title"></h3>
          <button id="pfp-modal-close" aria-label="Fermer" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:24px;line-height:1;">&times;</button>
        </div>
        <div class="backup-body">
          <p class="pfp-modal-desc" id="pfp-modal-desc"></p>
          <div class="pfp-manage-list" id="pfp-manage-list"></div>
          <button class="btn-modern btn-modern-secondary pfp-manage-new" id="pfp-modal-new"></button>
          <div class="pfp-manage-hint" id="pfp-modal-hint"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hdrCloseProfilesModal(); });
    document.getElementById('pfp-modal-close').onclick = hdrCloseProfilesModal;
    document.getElementById('pfp-modal-new').onclick = () => {
      Profiles.create();
      hdrRenderProfilesModal();
      hdrBuildProfile();
      hdrBuildDrawer();
    };
  }
  hdrRenderProfilesModal();
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function hdrCloseProfilesModal() {
  const o = document.getElementById('pfp-modal-overlay');
  if (o) o.classList.remove('active');
}

function hdrRenderProfilesModal() {
  const setTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  setTxt('pfp-modal-title', pfpT('manageTitle'));
  setTxt('pfp-modal-desc', pfpT('manageDesc'));
  setTxt('pfp-modal-hint', pfpT('backupHint'));
  setTxt('pfp-modal-new', '＋ ' + pfpT('newProfile'));

  const list = document.getElementById('pfp-manage-list');
  if (!list) return;
  const profiles = Profiles.list();
  const only = profiles.length <= 1;
  list.innerHTML = profiles.map((p) => {
    const act = p.id === Profiles.activeId();
    return `<div class="pfp-manage-row ${act ? 'active' : ''}">
      <span class="pfp-avatar sm" style="--ring:${p.color}">${hdrEsc(hdrProfInitial(p))}</span>
      <input class="pfp-manage-input" type="text" maxlength="40" value="${hdrEsc(p.name)}" data-id="${p.id}">
      ${act ? `<span class="pfp-manage-badge">${hdrEsc(pfpT('active'))}</span>`
             : `<button class="pfp-manage-btn" data-act="switch" data-id="${p.id}">${hdrEsc(pfpT('switchTo'))}</button>`}
      <button class="pfp-manage-btn danger" data-act="delete" data-id="${p.id}" ${(only || act) ? 'disabled' : ''} title="${act ? hdrEsc(pfpT('deleteActiveHint')) : ''}">${hdrEsc(pfpT('delete'))}</button>
    </div>`;
  }).join('');

  list.querySelectorAll('.pfp-manage-input').forEach((inp) => {
    const commit = () => {
      const ok = Profiles.rename(inp.getAttribute('data-id'), inp.value);
      if (!ok) return;
      hdrBuildProfile();
      hdrBuildDrawer();
    };
    inp.addEventListener('change', commit);
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
  });
  list.querySelectorAll('[data-act="switch"]').forEach((b) => {
    b.onclick = () => Profiles.switch(b.getAttribute('data-id'));
  });
  list.querySelectorAll('[data-act="delete"]').forEach((b) => {
    b.onclick = () => {
      if (b.disabled) return;
      showAppConfirm(pfpT('confirmDelete'), () => {
        Profiles.remove(b.getAttribute('data-id'));
        hdrRenderProfilesModal();
        hdrBuildProfile();
        hdrBuildDrawer();
      });
    };
  });
}

// ---------- Header adaptatif (Option B) ----------
// Condense langue + thème dans le panneau profil quand la rangée d'outils
// est rognée (mesure du contenu réel, pas un seuil px fixe). Hystérésis
// pour éviter tout clignotement au point de bascule.
function hdrInitAdaptive() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  let raf = null;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; hdrEvaluateAdaptive(); });
  };
  if (window.ResizeObserver) { new ResizeObserver(schedule).observe(header); }
  window.addEventListener('resize', schedule);
  hdrEvaluateAdaptive();
}

function hdrEvaluateAdaptive() {
  const header = document.querySelector('.app-header');
  const center = document.querySelector('.hdr-center');
  const cat = document.getElementById('hdr-cat');
  const tools = document.getElementById('hdr-tools');
  if (!header || !center || !tools) return;
  // Sous 820px la nav vit dans le drawer : rien à condenser.
  if (window.matchMedia('(max-width: 820px)').matches) { header.classList.remove('hdr-condensed'); return; }

  // Place ALLOUÉE à la zone centrale (elle est flex:1 → son clientWidth
  // reflète l'espace réel, il rétrécit quand la zone droite grandit).
  const avail = center.clientWidth;
  // Place NÉCESSAIRE : catégorie + outils (largeur réelle via scrollWidth,
  // connue même quand la rangée est rognée) + le gap de la zone.
  const need = (cat ? cat.offsetWidth : 0) + tools.scrollWidth + 12;
  const condensed = header.classList.contains('hdr-condensed');
  const BUFFER = 24;

  if (!condensed) {
    // Mémorise la place que langue+thème rendraient une fois condensés.
    const langW = document.querySelector('.header-lang-wrapper');
    const themeBtn = document.querySelector('.app-header-theme');
    if (langW && themeBtn) hdrReclaim = Math.max(hdrReclaim, langW.offsetWidth + themeBtn.offsetWidth + 16);
    if (need > avail + 1) header.classList.add('hdr-condensed');
  } else {
    // Ne ré-étend que si, une fois langue+thème réaffichés (−hdrReclaim de
    // place au centre), tout tient encore avec une marge franche (hystérésis).
    if (need + hdrReclaim + BUFFER <= avail) header.classList.remove('hdr-condensed');
  }
}

// ---------- Toast de confirmation après bascule ----------
function hdrShowSwitchToast() {
  if (!window.Profiles || !Profiles.consumeSwitchToast) return;
  const p = Profiles.consumeSwitchToast();
  if (!p) return;
  const toast = document.createElement('div');
  toast.className = 'pfp-toast';
  toast.innerHTML = `<span class="pfp-avatar sm" style="--ring:${p.color}">${hdrEsc(hdrProfInitial(p))}</span><span>${hdrEsc(pfpT('switched') + p.name)}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 350); }, 2600);
}
