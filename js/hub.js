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
        MadeBy: "Fait par",
        caserneTitle: "Ma Caserne",
        caserneDesc: "Gérez vos héros, définissez leurs générations et enregistrez les niveaux de leurs compétences.",
        beartrapDesc: "Optimisez vos ralliements pour le Bear Trap. Calculez la répartition parfaite de vos marches.",
        mastersTitle: "Experts",
        caserneTitle: "Héros",
        mastersDesc: "Consultez les experts, leurs compétences et leurs paliers d'affinité pour optimiser vos bonus."
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
        MadeBy: "Made by",
        caserneTitle: "My Barracks",
        caserneDesc: "Manage your heroes, set their generations, and record their skill levels.",
        mastersDesc: "Browse the experts, their skills and affinity milestones to optimize your bonuses.",
        caserneTitle: "Heroes",
        mastersTitle: "Masters",
        beartrapDesc: "Optimize your rallies for the Bear Trap. Calculate the perfect distribution of your steps."
    }
};

// ============ LANGUAGE ============
function applyHubTranslations(lang) {
    GlobalLang.applyI18n(i18nHub[lang]);
}

function initLang() {
    // Utilise le gestionnaire global
    GlobalLang.applyToButtons('lang-btn', (newLang) => {
        applyHubTranslations(newLang);
    });
    
    // Applique la langue actuelle au démarrage
    applyHubTranslations(GlobalLang.get());
}

// NOUVEAU : Si la langue change via le header, on synchronise les boutons du milieu de l'accueil
window.addEventListener('langChanged', (e) => {
    applyHubTranslations(e.detail.lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === e.detail.lang);
    });
});

// ============ STARTUP ============
initLang();
