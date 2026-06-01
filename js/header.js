// ========================================
//  HEADER PARTAGÉ - Navigation entre pages
// ========================================

(function() {
    // Détecter la page active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // NOUVEAU : On prépare le menu de langue (uniquement si on n'est pas sur l'accueil)
    const langHTML = (currentPage !== 'index.html' && currentPage !== '') ? `
        <select id="global-lang-select" style="background: var(--input-bg); color: var(--text-light); border: 1px solid var(--border); padding: 5px 10px; border-radius: 4px; margin-right: 15px; outline: none; cursor: pointer;">
            <option value="FR">FR</option>
            <option value="EN">EN</option>
        </select>
    ` : '';

    // Construire le HTML du header
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
            </nav>
            
            <div style="display: flex; align-items: center;">
                ${langHTML} <!-- Injection du menu de langue ici -->
                <button class="app-header-theme" id="header-theme-toggle" onclick="toggleHeaderTheme()" title="Changer le thème">
                    <span id="header-theme-icon">🌙</span>
                </button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.classList.add('has-app-header');
    
    initHeaderTheme();

    // NOUVEAU : Initialiser la langue globale si le menu est présent
    if (currentPage !== 'index.html' && currentPage !== '' && window.GlobalLang) {
        window.GlobalLang.applyToSelect('global-lang-select');
    }
})();

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
    // Sauvegarder aussi pour les anciennes clés (compatibilité)
    localStorage.setItem('tg_calc_theme', target);
    localStorage.setItem('research_calc_theme', target);
    updateHeaderThemeIcon(target);
}

function updateHeaderThemeIcon(theme) {
    const icon = document.getElementById('header-theme-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}
