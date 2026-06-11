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
                    <span class="nav-label">Caserne</span>
                </a>
                <a href="masters.html" class="nav-link" id="nav-masters">
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
