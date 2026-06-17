// ============================================================
//  SITE CONFIG — Source unique de la navigation
//  Portail (jeux) -> Hub (catégories) -> Outils + Header contextuel
//  KVK Game Optimizer · vanilla · statique · bilingue FR/EN
//
//  >>> Ajouter un jeu / une catégorie / un outil = éditer CE fichier uniquement. <<<
//
//  - icon  : nom d'icône Lucide (https://lucide.dev) — ex. "coins", "axe"
//  - status: "active" | "soon"
//  - href  : chemin ACTUEL (plat). Deviendra "kingshot/..." à la restructuration.
//  - badge : optionnel ("beta", ...)
// ============================================================

const SITE = {

  // ---------------------------------------------------------
  //  JEUX (niveau Portail)
  // ---------------------------------------------------------
  games: [
    {
      id: "kingshot",
      name: { EN: "Kingshot", FR: "Kingshot" },
      status: "active",
      icon: "swords",          // logo provisoire : deux épées croisées
      hub: "index.html",       // page hub du jeu (Phase 1 : séparer portail / hub)
      categories: [
        {
          id: "kvk-guide",
          name: { EN: "KVK Guide", FR: "Guide KVK" },
          icon: "book-open",
          status: "active",
          tools: ["research", "truegold"]
        },
        {
          id: "event-optimizer",
          name: { EN: "Event Optimizer", FR: "Optimiseur d'Événements" },
          icon: "swords",
          status: "active",
          tools: ["beartrap", "vikings", "heroes", "masters"]
        },
        {
          id: "pack-shop",
          name: { EN: "Pack / Shop Calculation", FR: "Calcul Packs / Boutique" },
          icon: "shopping-cart",
          status: "soon",
          tools: []
        },
        {
          id: "database",
          name: { EN: "Database", FR: "Base de Données" },
          icon: "database",
          status: "soon",
          tools: []
        }
      ]
    },

    // Jeux futurs (coquille multi-jeux) — remplis plus tard
    { id: "dws", name: { EN: "DWS", FR: "DWS" }, status: "soon", icon: "gamepad-2", categories: [] },
    { id: "wos", name: { EN: "WOS", FR: "WOS" }, status: "soon", icon: "gamepad-2", categories: [] }
  ],

  // ---------------------------------------------------------
  //  OUTILS (registre) — référencés par id dans les catégories
  //  name = libellé court (header) · desc = texte carte (hub)
  // ---------------------------------------------------------
  tools: {
    research: {
      name: { EN: "Research", FR: "Recherches" },
      desc: {
        EN: "Optimize the order of your scientific researches. Track your progress on Growth, Economy and Battle trees.",
        FR: "Optimisez l'ordre de vos recherches scientifiques. Suivez votre progression sur les arbres Croissance, Économie et Combat."
      },
      icon: "flask-conical",
      href: "research_calc.html"
    },
    truegold: {
      name: { EN: "TrueGold", FR: "TrueGold" },
      desc: {
        EN: "Plan the upgrade of your TrueGold buildings. Calculate your needed resources and speedups.",
        FR: "Planifiez l'amélioration de vos bâtiments TrueGold. Calculez vos ressources et accélérateurs nécessaires."
      },
      icon: "coins",
      href: "truegold_calc.html"
    },
    beartrap: {
      name: { EN: "Bear Trap", FR: "Piège à Ours" },
      desc: {
        EN: "Optimize your rallies for the Bear Trap. Calculate the perfect distribution of your steps.",
        FR: "Optimisez vos ralliements pour le Bear Trap. Calculez la répartition parfaite de vos marches."
      },
      icon: "paw-print",
      href: "beartrap_calc.html"
    },
    vikings: {
      name: { EN: "Vikings", FR: "Vikings" },
      desc: {
        EN: "Distribute your troops across your marches for the Vikings event and maximize your defense.",
        FR: "Répartissez vos troupes sur vos marches pour l'événement Vikings et maximisez votre défense."
      },
      icon: "axe",
      href: "vikings.html"
    },
    heroes: {
      name: { EN: "Heroes", FR: "Héros" },
      desc: {
        EN: "Manage your heroes, set their generations, and record their skill levels.",
        FR: "Gérez vos héros, définissez leurs générations et enregistrez les niveaux de leurs compétences."
      },
      icon: "users",
      href: "caserne.html",
      badge: "beta"
    },
    masters: {
      name: { EN: "Masters", FR: "Experts" },
      desc: {
        EN: "Browse the experts, their skills and affinity milestones to optimize your bonuses.",
        FR: "Consultez les experts, leurs compétences et leurs paliers d'affinité pour optimiser vos bonus."
      },
      icon: "crown",
      href: "masters.html",
      badge: "beta"
    }
  },

  // ---------------------------------------------------------
  //  Libellés génériques (boutons / états)
  // ---------------------------------------------------------
  ui: {
    open:     { EN: "Open →",      FR: "Ouvrir →" },
    soon:     { EN: "Coming soon", FR: "Bientôt disponible" },
    soonDesc: { EN: "New tools are coming soon. Stay tuned!", FR: "De nouveaux outils arrivent prochainement. Restez connectés !" },
    beta:     { EN: "Beta",        FR: "Bêta" }
  }
};

// ---------- Icônes partagées (Lucide, inline, offline) ----------
const SITE_ICONS = {
  "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  "coins": '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  "paw-print": '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  "axe": '<path d="m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9"/><path d="M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z"/>',
  "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "crown": '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  "wheat": '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
  "tree-pine": '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7Z"/><path d="M12 22v-3"/>',
  "brick-wall": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M8 3v6"/><path d="M16 3v6"/><path d="M8 15v6"/><path d="M16 15v6"/>',
  "pickaxe": '<path d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912"/><path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393"/><path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="M19.686 8.314a12.501 12.501 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319"/>',
  "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  "landmark": '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  "swords": '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>'
};

function iconSvg(name, size = 18) {
  const inner = SITE_ICONS[name] || '';
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

window.SITE = SITE;
window.SITE_ICONS = SITE_ICONS;
window.iconSvg = iconSvg;
