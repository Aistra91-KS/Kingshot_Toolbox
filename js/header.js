const navI18n = {
    FR: { navHeroes: 'Héros',  navMasters: 'Experts' },
    EN: { navHeroes: 'Heroes', navMasters: 'Masters' }
};


// ========================================
//  HEADER PARTAGÉ - Navigation entre pages
// ========================================

(function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // On affiche désormais le select sur TOUTES les pages sans exception
    const langHTML = `
        <div class="header-lang-wrapper">
            <select id="global-lang-select" class="header-lang-select">
                <option value="FR">FR</option>
                <option value="EN">EN</option>
            </select>
        </div>
    `;

    const headerHTML = `
        <header class="app-header">
            <a href="index.html" class="app-header-logo">
                <span class="logo-icon">⚔️</span>
                <span class="logo-text">Hub-Kingshot</span>
            </a>
            
            <nav class="app-header-nav">
                <a href="index.html" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
                    <span class="nav-icon">🏠</span>
                    <span class="nav-label">Accueil</span>
                </a>
                <a href="research_calc.html" class="nav-link ${currentPage === 'research_calc.html' ? 'active' : ''}">
                    <span class="nav-icon">🔬</span>
                    <span class="nav-label">Research</span>
                </a>
                <a href="truegold_calc.html" class="nav-link ${currentPage === 'truegold_calc.html' ? 'active' : ''}">
                    <span class="nav-icon">🏆</span>
                    <span class="nav-label">TrueGold</span>
                </a>
                <a href="beartrap_calc.html" class="nav-link ${currentPage === 'beartrap_calc.html' ? 'active' : ''}">
                    <span class="nav-icon">🐻</span>
                    <span class="nav-label">Bear Trap</span>
                </a>
                <a href="caserne.html" class="nav-link ${currentPage === 'caserne.html' ? 'active' : ''}">
                    <span class="nav-icon">⛺</span>
                    <span class="nav-label" data-i18n="navHeroes">Héros</span>
                </a>
                <a href="masters.html" class="nav-link ${currentPage === 'masters.html' ? 'active' : ''}">
                    <span class="nav-icon">⚜️</span>
                    <span class="nav-label" data-i18n="navMasters">Experts</span>
                </a>
            </nav>
            
            <div style="display: flex; align-items: center;">
                ${langHTML}
                <button class="app-header-theme" id="header-theme-toggle" onclick="toggleHeaderTheme()" title="Changer le thème">
                    <span id="header-theme-icon">🌙</span>
                </button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.classList.add('has-app-header');
    
    initHeaderTheme();

    if (window.GlobalLang) {
        window.GlobalLang.applyToSelect('global-lang-select');
        document.documentElement.lang = window.GlobalLang.get().toLowerCase();
    }
})();

// NOUVEAU : Si la langue change via un bouton de l'accueil, on synchronise le select du header
window.addEventListener('langChanged', (e) => {
    const select = document.getElementById('global-lang-select');
    if (select) select.value = e.detail.lang;
    document.documentElement.lang = (e.detail.lang || 'en').toLowerCase();
    window.GlobalLang.applyI18n(navI18n[window.GlobalLang.get()]);
    if (window.GlobalLang) window.GlobalLang.applyI18n(navI18n[e.detail.lang]);
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
