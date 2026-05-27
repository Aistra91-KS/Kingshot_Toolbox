// ========================================
//  HUB - Navigation & Theme
// ========================================

const i18nHub = {
    FR: {
        subtitle: "Votre boîte à outils stratégique",
        researchTitle: "Research Calculator",
        researchDesc: "Optimisez l'ordre de vos recherches scientifiques. Suivez votre progression sur les arbres Croissance, Économie et Combat.",
        truegoldTitle: "TrueGold Calculator",
        truegoldDesc: "Planifiez l'amélioration de vos bâtiments TrueGold. Calculez vos ressources et accélérateurs nécessaires.",
        soonTitle: "Bientôt disponible",
        soonDesc: "De nouveaux outils arrivent prochainement. Restez connectés !",
        open: "Ouvrir →",
        comingSoon: "À venir...",
        madeWith: "Fait avec"
    },
    EN: {
        subtitle: "Your strategic toolbox",
        researchTitle: "Research Calculator",
        researchDesc: "Optimize the order of your scientific researches. Track your progress on Growth, Economy and Battle trees.",
        truegoldTitle: "TrueGold Calculator",
        truegoldDesc: "Plan the upgrade of your TrueGold buildings. Calculate your needed resources and speedups.",
        soonTitle: "Coming Soon",
        soonDesc: "New tools are coming soon. Stay tuned!",
        open: "Open →",
        comingSoon: "Coming soon...",
        madeWith: "Made with"
    }
};

// ============ THEME ============
function initTheme() {
    const savedTheme = localStorage.getItem('hub_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('hub_theme', target);
    updateThemeButton(target);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        btn.textContent = '☀️ Light Mode';
    } else {
        btn.textContent = '🌙 Dark Mode';
    }
}

// ============ LANGUAGE ============
function applyHubTranslations(lang) {
    const dict = i18nHub[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem('hub_lang', lang);
}

function initLang() {
    const savedLang = localStorage.getItem('hub_lang') || 'FR';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === savedLang);
        btn.addEventListener('click', (e) => {
            const newLang = e.target.getAttribute('data-lang');
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyHubTranslations(newLang);
        });
    });
    applyHubTranslations(savedLang);
}

// ============ STARTUP ============
initTheme();
initLang();
