// ========================================
//  HUB — Rendu par catégories (depuis SITE) + Langue
// ========================================

const i18nHub = {
    FR: {
        subtitle: "Votre boîte à outils stratégique",
        soonTitle: "Bientôt disponible",
        soonDesc: "De nouveaux outils arrivent prochainement. Restez connectés !",
        open: "Ouvrir →",
        comingSoon: "À venir...",
        MadeBy: "Fait par"
    },
    EN: {
        subtitle: "Your strategic toolbox",
        soonTitle: "Coming Soon",
        soonDesc: "New tools are coming soon. Stay tuned!",
        open: "Open →",
        comingSoon: "Coming soon...",
        MadeBy: "Made by"
    }
};

// ============ LANGUAGE ============
function applyHubTranslations(lang) {
    GlobalLang.applyI18n(i18nHub[lang]);
}

// ============ RENDU DU HUB (depuis le manifeste SITE) ============
function renderHub() {
    const root = document.getElementById('hub-root');
    if (!root || !window.SITE) return;
    const S = window.SITE;
    const lang = GlobalLang.get();
    const t = (o) => o ? (o[lang] || o.EN || o.FR || '') : '';

    // Jeu actif (Kingshot pour l'instant)
    const game = S.games.find(g => g.status === 'active') || S.games[0];
    let html = '';

    (game.categories || []).forEach(cat => {
        const soonCat = cat.status !== 'active';
        html += `<section class="hub-section">
            <h2 class="hub-section-title">${t(cat.name)}${soonCat ? ` <span class="hub-section-soon">${t(S.ui.soon)}</span>` : ''}</h2>
            <div class="hub-grid">`;

        if (soonCat || !(cat.tools || []).length) {
            html += `<div class="hub-card hub-card-soon">
                <div class="hub-card-icon">🚧</div>
                <h2>${t(S.ui.soon)}</h2>
                <p>${t(S.ui.soonDesc)}</p>
            </div>`;
        } else {
            cat.tools.forEach(toolId => {
                const tool = S.tools[toolId];
                if (!tool) return;
                const badge = tool.badge ? `<span class="hub-badge">${t(S.ui[tool.badge]) || tool.badge}</span>` : '';
                html += `<a href="${tool.href}" class="hub-card">
                    <div class="hub-card-icon">${iconSvg(tool.icon, 34)}</div>
                    <h2>${t(tool.name)}${badge}</h2>
                    <p>${t(tool.desc)}</p>
                    <span class="hub-card-cta">${t(S.ui.open)}</span>
                </a>`;
            });
        }
        html += `</div></section>`;
    });

    root.innerHTML = html;
}

function initLang() {
    // Boutons FR/EN du hub
    GlobalLang.applyToButtons('lang-btn', (newLang) => {
        applyHubTranslations(newLang);
        renderHub();
    });
    // Applique la langue actuelle au démarrage
    applyHubTranslations(GlobalLang.get());
}

// Si la langue change via le header → resync boutons + re-rendu
window.addEventListener('langChanged', (e) => {
    applyHubTranslations(e.detail.lang);
    renderHub();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === e.detail.lang);
    });
});

// ============ STARTUP ============
initLang();
renderHub();
