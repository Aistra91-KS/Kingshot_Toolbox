// ============================================================
// DATABASE.JS - TrueGold Calculator
// Contient toutes les données statiques du jeu
// ============================================================

// --- Mapping des noms de bâtiments EN <-> FR ---
const bldgMap = {
    "Town Center":    { EN: "Town Center",    FR: "Centre-ville" },
    "Embassy":        { EN: "Embassy",        FR: "Ambassade" },
    "Infirmary":      { EN: "Infirmary",      FR: "Infirmerie" },
    "Command Center": { EN: "Command Center", FR: "Base de commandement" },
    "War Academy":    { EN: "War Academy",    FR: "Académie de Guerre" },
    "Barracks":       { EN: "Barracks",       FR: "Quartiers" },
    "Stable":         { EN: "Stable",         FR: "Ecurie" },
    "Range":          { EN: "Range",          FR: "Stand de Tir" }
};

// --- Traductions (i18n) ---
const i18n = {
    'EN': {
        'ctrlPanel': 'Control Panel',
        'config': 'Configuration',
        'lang': 'Language',
        'baseBonus': 'Bonus Speed (%)',
        'groundWorks': 'Ground Works (+10%)',
        'kvkBonus': 'KVK Bonus (+5%)',
        'greyWolf': 'Grey Wolf Bonus (%)',
        'doubleTime': 'Double Time (+20%)',
        'totalBonus': 'Total Bonus',
        'resources': 'Resources',
        'transfoUsed': 'Transfos used (max 100)',
        'kvkTitle': 'KVK & Speedups',
        'kvkMode': 'KVK Mode',
        'days': 'Days',
        'hours': 'Hours',
        'minutes': 'Minutes',
        'myBuildings': 'My Buildings',
        'strategyOutput': 'Strategy Output',
        'bldgName': 'Building Name',
        'curLvl': 'Current Level',
        'targetLvl': 'Target Level',
        'totalTgTarget': 'Total TG (Goal)',
        'totalTtgTarget': 'Total TTG (Goal)',
        'speedupsTarget': 'Speedups needed',
        'total': 'Total :',
        'err': "❌ No improvements possible (Insufficient resources/prerequisites or full queues).",
        'optKVK': "🏆 KVK OPTIMIZATION MODE (MAX POINTS)",
        'optQty': "✨ 🛠️ QUANTITY OPTIMIZATION MODE (MAX BUILDINGS)",
        'crucible': "Crucible Strategy:",
        'transform': "Transform ",
        'tgExpecting': " TG expecting to get ",
        'ttgOr': " TTG, meaning ",
        'transfos': " transformations.",
        'newStocks': "💰 New Stocks:",
        'tgRemaining': "Remaining TG:",
        'ttgRemaining': "Remaining TTG:",
        'plan': "🏗️ Improvement Plan:",
        'step': " ➡️ step ",
        'inProgress': "(Left in construction)",
        'completed': "(Completed)",
        'costCum': "Cumulated cost:",
        'timeMgt': "⚡ Time Management:",
        'timeCons': "Speedups time consumed:",
        'bilan': "📊 KVK Breakdown:",
        'tgUsed': " TG used =",
        'ttgUsed': " TTG used =",
        'pts': " KVK points",
        'accelUsed': " speedups used =",
        'totalMax': "🚀 Maximum total to obtain : "
    },
    'FR': {
        'ctrlPanel': 'Panneau de Contrôle',
        'config': 'Configuration',
        'lang': 'Langue',
        'baseBonus': 'Bonus Vitesse (%)',
        'groundWorks': '1er Ministre (+10%)',
        'kvkBonus': 'Bonus KVK (+5%)',
        'greyWolf': 'Bonus Loup Gris (%)',
        'doubleTime': 'Bouchées Doubles (+20%)',
        'totalBonus': 'Bonus Total',
        'resources': 'Ressources',
        'transfoUsed': 'Transfos utilisées (max 100)',
        'kvkTitle': 'KVK & Accélérateurs',
        'kvkMode': 'Mode KVK',
        'days': 'Jours',
        'hours': 'Heures',
        'minutes': 'Minutes',
        'myBuildings': 'Mes Bâtiments',
        'strategyOutput': 'Résultat de la Stratégie',
        'bldgName': 'Nom Batiment',
        'curLvl': 'Level actuel',
        'targetLvl': 'Objectif de level',
        'totalTgTarget': 'Total TG (Obj.)',
        'totalTtgTarget': 'Total TTG (Obj.)',
        'speedupsTarget': 'Accélérateurs nécessaires',
        'total': 'Total :',
        'err': "❌ Aucune amélioration possible (Ressources/prérequis manquants ou files pleines ou limites atteintes).",
        'optKVK': "🏆 MODE OPTIMISATION KVK (MAX POINTS)",
        'optQty': "✨ 🛠️ MODE OPTIMISATION QUANTITÉ (MAX BÂTIMENTS)",
        'crucible': "Stratégie du Creuset :",
        'transform': "Transforme ",
        'tgExpecting': " TG en espérant obtenir ",
        'ttgOr': " TTG, soit ",
        'transfos': " transformations.",
        'newStocks': "💰 Nouveaux Stocks :",
        'tgRemaining': "TG Restants :",
        'ttgRemaining': "TTG Restants :",
        'plan': "🏗️ Plan d'Amélioration :",
        'step': " ➡️ étape ",
        'inProgress': "(Laissé en construction)",
        'completed': "(Terminé)",
        'costCum': "Coût cumulé :",
        'timeMgt': "⚡ Gestion du Temps :",
        'timeCons': "Temps d'accélérateurs consommé :",
        'bilan': "📊 Bilan KVK :",
        'tgUsed': " TG utilisés = ",
        'ttgUsed': " TTG utilisés = ",
        'pts': " points KVK",
        'accelUsed': " d'accélérateurs utilisés = ",
        'totalMax': "🚀 Total maximal à obtenir : "
    }
};

// --- Données du Creuset (transformations TG -> TTG) ---
// Format : [étape, coût TG, gain TTG moyen]
const rangeDataTTG = [
    [1, 20, 1.45], [2, 20, 1.45], [3, 20, 1.45], [4, 20, 1.45], [5, 20, 1.45],
    [6, 20, 1.45], [7, 20, 1.45], [8, 20, 1.45], [9, 20, 1.45], [10, 20, 1.45],
    [11, 20, 1.45], [12, 20, 1.45], [13, 20, 1.45], [14, 20, 1.45], [15, 20, 1.45],
    [16, 20, 1.45], [17, 20, 1.45], [18, 20, 1.45], [19, 20, 1.45], [20, 20, 1.45],
    [21, 50, 2.15], [22, 50, 2.15], [23, 50, 2.15], [24, 50, 2.15], [25, 50, 2.15],
    [26, 50, 2.15], [27, 50, 2.15], [28, 50, 2.15], [29, 50, 2.15], [30, 50, 2.15],
    [31, 50, 2.15], [32, 50, 2.15], [33, 50, 2.15], [34, 50, 2.15], [35, 50, 2.15],
    [36, 50, 2.15], [37, 50, 2.15], [38, 50, 2.15], [39, 50, 2.15], [40, 50, 2.15],
    [41, 100, 3.18], [42, 100, 3.18], [43, 100, 3.18], [44, 100, 3.18], [45, 100, 3.18],
    [46, 100, 3.18], [47, 100, 3.18], [48, 100, 3.18], [49, 100, 3.18], [50, 100, 3.18],
    [51, 100, 3.18], [52, 100, 3.18], [53, 100, 3.18], [54, 100, 3.18], [55, 100, 3.18],
    [56, 100, 3.18], [57, 100, 3.18], [58, 100, 3.18], [59, 100, 3.18], [60, 100, 3.18],
    [61, 130, 3.435], [62, 130, 3.435], [63, 130, 3.435], [64, 130, 3.435], [65, 130, 3.435],
    [66, 130, 3.435], [67, 130, 3.435], [68, 130, 3.435], [69, 130, 3.435], [70, 130, 3.435],
    [71, 130, 3.435], [72, 130, 3.435], [73, 130, 3.435], [74, 130, 3.435], [75, 130, 3.435],
    [76, 130, 3.435], [77, 130, 3.435], [78, 130, 3.435], [79, 130, 3.435], [80, 130, 3.435],
    [81, 160, 3.71], [82, 160, 3.71], [83, 160, 3.71], [84, 160, 3.71], [85, 160, 3.71],
    [86, 160, 3.71], [87, 160, 3.71], [88, 160, 3.71], [89, 160, 3.71], [90, 160, 3.71],
    [91, 160, 3.71], [92, 160, 3.71], [93, 160, 3.71], [94, 160, 3.71], [95, 160, 3.71],
    [96, 160, 3.71], [97, 160, 3.71], [98, 160, 3.71], [99, 160, 3.71], [100, 160, 3.71]
];

// --- Base de données des bâtiments ---
// Format : [Nom, Niveau, Label, Prérequis, TG, TTG, RSS1, RSS2, RSS3, RSS4, TempsTexte, TempsMinutes]
const dbDataRaw = [
    // === TOWN CENTER ===
    ["Town Center", 1, "TC30-1", "Embassy Lv. 30,\nAcademy Lv. 30", 132, 0, "67M", "67M", "13M", "3.3M", "7d", 10080],
    ["Town Center", 2, "TC30-2", "Embassy Lv. 30,\nAcadmy Lv. 30", 132, 0, "67M", "67M", "13M", "3.3M", "7d", 10080],
    ["Town Center", 3, "TC30-3", "Embassy Lv. 30,\nAcademy Lv. 30", 132, 0, "67M", "67M", "13M", "3.3M", "7d", 10080],
    ["Town Center", 4, "TC30-4", "Embassy Lv. 30,\nAcademy Lv. 30", 132, 0, "67M", "67M", "13M", "3.3M", "7d", 10080],
    ["Town Center", 5, "TG1-0", "Embassy Lv. 30,\nAcademy Lv. 30", 132, 0, "67M", "67M", "13M", "3.3M", "7d", 10080],
    ["Town Center", 6, "TG1-1", "Embassy TG Lv. 1,\nStable TG Lv. 1", 158, 0, "72M", "72M", "14M", "3.6M", "9d", 12960],
    ["Town Center", 7, "TG1-2", "Embassy TG Lv. 1,\nStable TG Lv. 1", 158, 0, "72M", "72M", "14M", "3.6M", "9d", 12960],
    ["Town Center", 8, "TG1-3", "Embassy TG Lv. 1,\nStable TG Lv. 1", 158, 0, "72M", "72M", "14M", "3.6M", "9d", 12960],
    ["Town Center", 9, "TG1-4", "Embassy TG Lv. 1,\nStable TG Lv. 1", 158, 0, "72M", "72M", "14M", "3.6M", "9d", 12960],
    ["Town Center", 10, "TG2-0", "Embassy TG Lv. 1,\nStable TG Lv. 1", 158, 0, "72M", "72M", "14M", "3.6M", "9d", 12960],
    // ... [LE RESTE DES DONNÉES TOWN CENTER, EMBASSY, BARRACKS, STABLE, RANGE, COMMAND CENTER, WAR ACADEMY, INFIRMARY]
    // ⚠️ COPIEZ ICI L'INTÉGRALITÉ de votre tableau dbDataRaw original (il est très long)
    ["Town Center", 40, "TG8-0", "Embassy TG Lv. 7\nStable TG Lv. 7", 120, 40, "130M", "130M", "26M", "6.6M", "20d", 28800]
    // ... etc.
];

// --- Liste des niveaux par bâtiment ---
const levelsByBuilding = {
    "Town Center": [
        {num: 1, label: "TC30-1"}, {num: 2, label: "TC30-2"}, {num: 3, label: "TC30-3"},
        {num: 4, label: "TC30-4"}, {num: 5, label: "TG1-0"}, {num: 6, label: "TG1-1"},
        // ... copiez le reste
        {num: 40, label: "TG8-0"}
    ],
    // ... idem pour Embassy, Barracks, Stable, Range, Command Center, War Academy, Infirmary
};

// --- État par défaut des bâtiments du joueur ---
const defaultBuildingsState = [
    {name: "Town Center",    current: 30, target: 35},
    {name: "Embassy",        current: 30, target: 35},
    {name: "Barracks",       current: 30, target: 30},
    {name: "Stable",         current: 30, target: 30},
    {name: "Range",          current: 30, target: 30},
    {name: "Command Center", current: 27, target: 30},
    {name: "Infirmary",      current: 25, target: 30},
    {name: "War Academy",    current: 25, target: 25}
];

// --- Emojis des bâtiments ---
const buildingEmojis = {
    "Town Center": "🏛️",
    "Embassy": "🤝",
    "Infirmary": "🏥",
    "Command Center": "🎖️",
    "War Academy": "⚔️",
    "Barracks": "🛡️",
    "Stable": "🐎",
    "Range": "🏹"
};
