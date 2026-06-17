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
    open:  { EN: "Open →",        FR: "Ouvrir →" },
    soon:  { EN: "Coming soon",   FR: "Bientôt disponible" },
    beta:  { EN: "Beta",          FR: "Bêta" }
  }
};

window.SITE = SITE;
