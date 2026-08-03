// ========================================
//  TRUEGOLD CALCULATOR - LOGIC
// ========================================

// Variables globales (remplies depuis le JSON)
let rangeDataTTG = [];
let dbDataRaw = [];
let levelsByBuilding = {};
let bldgMap = {};
let buildingsState = [];
let defaultBuildingsRef = [];   // sert d'ordre d'affichage canonique (cf. normalizeBuildingOrder)

// Icônes Lucide par bâtiment — partagées entre le tableau et le plan d'amélioration
const BLDG_ICONS = {
    "Town Center":    () => iconSvg('landmark', 16),
    "Embassy":        () => iconSvg('handshake', 16),
    "Infirmary":      () => iconSvg('heart-pulse', 16),
    "Command Center": () => iconSvg('star', 16),
    "War Academy":    () => iconSvg('swords', 16),
    "Barracks":       () => iconSvg('shield', 16),
    "Range":          () => iconSvg('target', 16),
    "Stable":         () => '<svg class="ic" width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.42 11.256a.97.97 0 0 1 .92-.662h7.321c.417 0 .787.267.92.662l.747 2.244H1.672z"/><path d="M3.572 10.594c.158-.83 1.306-1.783 2.117-2.418c1.945-1.522 1.765-2.824 1.447-3.177L5.193 6.11a1.23 1.23 0 0 1-1.437-.154v0a1.23 1.23 0 0 1-.237-1.543L4.983 1.93L4.42.658c.93-.33 3.501-.155 4.518.635c1.27.989 2.894 2.489 1.553 9.3"/><path d="M7.773 3.971a1.9 1.9 0 0 1-.631 1.03"/></svg>'
};

function bldgIcon(nom) {
    return BLDG_ICONS[nom] ? BLDG_ICONS[nom]() : iconSvg('building-2', 16);
}

// Index des colonnes — dbDataRaw (bâtiments) et rangeDataTTG (transformations)
const COL     = { NAME: 0, LEVEL: 1, LABEL: 2, TG: 4, TTG: 5, TIME: 11 };
const TTG_COL = { STEP: 0, COST: 1, GAIN: 2 };

// ============ I18N ============
const i18n = {
    'EN': {
        'ctrlPanel': 'Control Panel',
        'config': 'Configuration',
        'lang': 'Language',
        'currentStocks': "💰 Current Stocks:",
        'baseBonus': 'Bonus Speed (%)',
        'groundWorks': 'Ground Works (+10%)',
        'kvkBonus': 'KVK Bonus (+5%)',
        'greyWolf': 'Grey Wolf Bonus (%)',
        'doubleTime': 'Double Time (+20%)',
        'totalBonus': 'Speed bonus',
        'grpSpeed': 'Speed bonuses (÷ base time)',
        'grpReduc': 'Remaining-time reduction (cumulative)',
        'resources': 'Resources',
        'transfoUsed': 'Used transformation (max 100)',
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
        'inclSuggest': 'Include in suggestions',
        'total': 'Total :',
        'err': "❌ No improvements possible (Insufficient resources/prerequisites or full queues).",
        'optKVK': "🏆 KVK OPTIMIZATION MODE (MAX POINTS)",
        'optQty': "✨ 🛠️ QUANTITY OPTIMIZATION MODE (MAX BUILDINGS)",
        'optTarget': "🎯 TARGET SCORE MODE (CHEAPEST)",
        'modeLabel': 'Mode',
        'modeQty': 'Max buildings',
        'modeKvkOpt': 'KVK (max points)',
        'modeTarget': 'Target score',
        'scoreCible': 'Target score',
        'targetReached': "✅ Target reached: ",
        'targetOf': " (target ",
        'notEnough': "⚠️ Not enough resources for the target. Max achievable: ",
        'crucible': "Crucible Strategy:",
        'transform': "Transform ",
        'tgExpecting': " TG expecting to get ",
        'ttgOr': " TTG, meaning ",
        'transfos': " transformations.",
        'newStocks': "💰 New Stocks:",
        'tgRemaining': "Remaining TG: ",
        'ttgRemaining': "Remaining TTG: ",
        'plan': "🏗️ Improvement Plan (in order):",
        'planHint': "Follow the steps top to bottom: this is the order the prerequisites unlock in. Click a step to see the cost of each level.",
        'levelsShort': "lvl",
        'unlocks': "unlocks",
        'colStep': "#",
        'colTier': "Tier",
        'colDuration': "Build time",
        'colSpeedup': "Speedups",
        'colPoints': "KVK points",
        'remaining': "left",
        'inProgress': "Left in construction",
        'completed': "Completed",
        'timeMgt': "⚡ Time Management:",
        'timeCons': "Speedups time consumed: ",
        'bilan': "📊 KVK Breakdown:",
        'tgUsed': " TG used =",
        'ttgUsed': " TTG used =",
        'pts': " KVK points",
        'accelUsed': " speedups used =",
        'totalMax': "🚀 Maximum total to obtain : ",
        'panTitle': "Construction Bonus (PAN)",
        'panSource': "Source",
        'panReduc': "Reduction (hours)",
        'panAuto': "Automatic (PAN)",
        'panManual': "Manual",
        'ptsEnd': "points"
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
        'totalBonus': 'Bonus vitesse',
        'grpSpeed': 'Bonus de vitesse (÷ temps de base)',
        'grpReduc': 'Réduction du temps restant (cumulée)',
        'resources': 'Ressources',
        'transfoUsed': 'Transformation utilisées (max 100)',
        'kvkTitle': 'KVK & Accélérateurs',
        'kvkMode': 'Mode KVK',
        'currentStocks': "💰 Stocks Actuels :",
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
        'inclSuggest': 'Inclure dans les suggestions',
        'total': 'Total :',
        'err': "❌ Aucune amélioration possible (Ressources/prérequis manquants ou files pleines ou limites atteintes).",
        'optKVK': "🏆 MODE OPTIMISATION KVK (MAX POINTS)",
        'optQty': "✨ 🛠️ MODE OPTIMISATION QUANTITÉ (MAX BÂTIMENTS)",
        'optTarget': "🎯 MODE SCORE CIBLE (LE PLUS ÉCONOME)",
        'modeLabel': 'Mode',
        'modeQty': 'Max bâtiments',
        'modeKvkOpt': 'KVK (max points)',
        'modeTarget': 'Score cible',
        'scoreCible': 'Score cible',
        'targetReached': "✅ Score cible atteint : ",
        'targetOf': " (cible ",
        'notEnough': "⚠️ Pas assez de ressources pour la cible. Maximum atteignable : ",
        'crucible': "Stratégie du Creuset :",
        'transform': "Transforme ",
        'tgExpecting': " TG en espérant obtenir ",
        'ttgOr': " TTG, soit ",
        'transfos': " transformations.",
        'newStocks': "💰 Nouveaux Stocks :",
        'tgRemaining': "TG Restants : ",
        'ttgRemaining': "TTG Restants : ",
        'plan': "🏗️ Plan d'Amélioration (dans l'ordre) :",
        'planHint': "Suis les étapes de haut en bas : c'est l'ordre dans lequel les prérequis se débloquent. Clique sur une étape pour voir le coût de chaque niveau.",
        'levelsShort': "niv.",
        'unlocks': "débloque",
        'colStep': "N°",
        'colTier': "Palier",
        'colDuration': "Construction",
        'colSpeedup': "Accélérateurs",
        'colPoints': "Points KVK",
        'remaining': "restant",
        'inProgress': "Laissé en construction",
        'completed': "Terminé",
        'timeMgt': "⚡ Gestion du Temps :",
        'timeCons': "Temps d'accélérateurs consommé : ",
        'bilan': "📊 Bilan KVK :",
        'tgUsed': " TG utilisés = ",
        'ttgUsed': " TTG utilisés = ",
        'pts': " points KVK",
        'accelUsed': " d'accélérateurs utilisés = ",
        'totalMax': "🚀 Total maximal à obtenir : ",
        'panTitle': "Bonus de construction (PAN)",
        'panSource': "Source",
        'panReduc': "Réduction (heures)",
        'panAuto': "Automatique (PAN)",
        'panManual': "Manuel",
        'ptsEnd': "points"
    }
};

/**
 * Génère la map levelsByBuilding à partir d'une référence commune
 * et d'une config min/max par bâtiment.
 * 
 * @param {Array}  reference - Liste complète des niveaux [{num, label}, ...]
 * @param {Object} config    - Config par bâtiment { "Building Name": {min, max} }
 * @returns {Object}         - Map { "Building Name": [{num, label}, ...] }
 */
function buildLevelsByBuilding(reference, config) {
    const result = {};
    
    for (const buildingName in config) {
        const { min, max } = config[buildingName];
        result[buildingName] = reference.filter(level => 
            level.num >= min && level.num <= max
        );
    }
    
    return result;
}
// ============ DATA LOADING ============
// ============ DATA LOADING ============
async function loadDatabase() {
    const jsonPath = 'data/truegold_db.json';
    
    try {
        console.log(`📂 Tentative de chargement : ${jsonPath}`);
        
        const response = await fetch(jsonPath);
        
        // Vérifier le statut HTTP
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} (${response.statusText}) — Le fichier n'a pas été trouvé à l'URL : ${response.url}`);
        }
        
        // Récupérer le texte brut avant de parser
        const text = await response.text();
        
        if (!text || text.trim().length === 0) {
            throw new Error('Le fichier JSON est vide.');
        }
        
        // Tenter de parser le JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            throw new Error(`JSON invalide : ${parseError.message}`);
        }
        
        // Vérifier que les clés attendues existent
        const requiredKeys = ['rangeDataTTG', 'dbDataRaw', 'levelsReference', 'buildingsConfig', 'bldgMap', 'defaultBuildings'];
        const missingKeys = requiredKeys.filter(key => !data[key]);
        
        if (missingKeys.length > 0) {
            throw new Error(`Clés manquantes dans le JSON : ${missingKeys.join(', ')}`);
        }
        
        // Tout est OK, on assigne les données
        rangeDataTTG        = data.rangeDataTTG;
        dbDataRaw           = data.dbDataRaw;
        levelsByBuilding    = buildLevelsByBuilding(data.levelsReference, data.buildingsConfig); // Générer levelsByBuilding dynamiquement à partir de la référence
        bldgMap             = data.bldgMap;
        defaultBuildingsRef = data.defaultBuildings;
        
        // Si pas de buildings sauvegardés, on prend les defaults du JSON
        const saved = localStorage.getItem(STORAGE_KEYS.truegold);
        if (!saved) {
            buildingsState = JSON.parse(JSON.stringify(data.defaultBuildings));
        }
        
        console.log(`✅ Base de données chargée : ${dbDataRaw.length} entrées de bâtiments`);
        return true;
        
    } catch (e) {
        console.error('❌ Erreur de chargement du JSON :', e);
        
        // Message d'erreur détaillé pour l'utilisateur
        const errorMessage = 
            `❌ Impossible de charger la base de données TrueGold.\n\n` +
            `📋 Détails techniques :\n${e.message}\n\n` +
            `🔍 Vérifications à faire :\n` +
            `1. Le fichier "data/truegold_db.json" existe-t-il ?\n` +
            `2. Êtes-vous sur GitHub Pages (pas en local file://) ?\n` +
            `3. Le JSON est-il valide (testez sur jsonlint.com) ?\n\n` +
            `💡 Ouvrez la console (F12) pour plus de détails.`;
        
        showAppAlert(errorMessage);
        return false;
    }
}

// ============ TRANSLATIONS ============
function applyTranslations() {
    const lang = GlobalLang.get();
    GlobalLang.applyI18n(i18n[lang]);
}

function getLocName(enName) {
    const lang = GlobalLang.get();
    return bldgMap[enName] ? bldgMap[enName][lang] : enName;
}

// Remet buildingsState dans l'ordre d'affichage canonique du JSON (defaultBuildings).
// Nécessaire car l'ordre est figé dans les sauvegardes locales : sans ça, un changement
// d'ordre côté données ne serait visible que par les nouveaux joueurs.
function normalizeBuildingOrder() {
    if (!Array.isArray(defaultBuildingsRef) || defaultBuildingsRef.length === 0) return;
    const rank = {};
    defaultBuildingsRef.forEach((b, i) => { rank[b.name] = i; });
    buildingsState.sort((a, b) => (rank[a.name] ?? 99) - (rank[b.name] ?? 99));
}

// ============ RENDER BUILDINGS ============
function renderBuildings() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    const tx = i18n[GlobalLang.get()];

    buildingsState.forEach((b, index) => {
        let nom = b.name;
        let curLvl = b.current;
        let tgtLvl = b.target;
        
        let curOptions = '';
        let tgtOptions = '';
        
        if (levelsByBuilding[nom]) {
            levelsByBuilding[nom].forEach(lvlObj => {
                let selCur = (lvlObj.num === curLvl) ? 'selected' : '';
                curOptions += `<option value="${lvlObj.num}" ${selCur}>${lvlObj.label}</option>`;
                
                if (lvlObj.num >= curLvl) {
                    let selTgt = (lvlObj.num === tgtLvl) ? 'selected' : '';
                    tgtOptions += `<option value="${lvlObj.num}" ${selTgt}>${lvlObj.label}</option>`;
                }
            });
        }

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="bldg-name"><input type="checkbox" class="bldg-toggle" title="${tx.inclSuggest}" style="vertical-align:middle; margin-right:6px;" ${b.enabled !== false ? 'checked' : ''} onchange="toggleBuildingEnabled(${index}, this.checked)"><span class="bldg-icon">${bldgIcon(nom)}</span> ${getLocName(nom)}</td>
            <td><select class="table-select" onchange="updateBuildingLvl(${index}, this.value, 'current')">${curOptions}</select></td>
            <td><select class="table-select" onchange="updateBuildingLvl(${index}, this.value, 'target')">${tgtOptions}</select></td>
            <td id="tg-cost-${index}">0</td>
            <td id="ttg-cost-${index}">0</td>
            <td id="time-cost-${index}" style="font-size:13px;">0</td>
        `;
        if (b.enabled === false) tr.style.opacity = '0.5';
        container.appendChild(tr);
    });
    
    updateAllRowCosts();
}

function updateBuildingLvl(index, val, type) {
    let num = parseInt(val);
    if (type === 'current') {
        buildingsState[index].current = num;
        if (buildingsState[index].target < num) {
            buildingsState[index].target = num;
        }
        renderBuildings();
    } else {
        buildingsState[index].target = num;
        updateAllRowCosts();
    }
    saveData();
    runCalculator();
}

function toggleBuildingEnabled(index, checked) {
    buildingsState[index].enabled = checked;
    renderBuildings();
    saveData();
    runCalculator();
}

// ============ BONUS CONSTRUCTION PAN ============
let panAutoHours = null; // null = manuel ; nombre = auto (PAN renseigné)

async function loadPanBonus() {
    try {
        const res = await fetch('data/masters_db.json');
        const db = await res.json();
        const map = {};
        const pan = db.find(m => m.id === 'pan');
        const skill = pan && pan.skills.find(s => s.id === 'master_architect');
        if (skill) skill.levels.forEach(l => { map[l.level] = Number(l.effect) || 0; });
        const userMasters = safeParse(STORAGE_KEYS.masters, {});
        const lvl = (userMasters.pan && userMasters.pan.skills) ? (userMasters.pan.skills.master_architect || 0) : 0;
        panAutoHours = (lvl >= 1 && map[lvl] !== undefined) ? map[lvl] : null;
    } catch (e) {
        console.error('PAN bonus load failed', e);
        panAutoHours = null;
    }
    applyPanUI();
}

function applyPanUI() {
    const input = document.getElementById('panReduction');
    const badge = document.getElementById('pan-source-badge');
    if (!input || !badge) return;
    const tx = i18n[GlobalLang.get()];
    if (panAutoHours !== null) {
        input.value = panAutoHours;
        input.disabled = true;
        input.style.opacity = '0.6';
        badge.textContent = '🟢 ' + tx.panAuto;
        badge.style.color = 'var(--success)';
    } else {
        input.disabled = false;
        input.style.opacity = '1';
        badge.textContent = '✏️ ' + tx.panManual;
        badge.style.color = 'var(--text-muted)';
    }
}

function getPanReductionMinutes() {
    let hours;
    if (panAutoHours !== null) {
        hours = panAutoHours;
    } else {
        hours = parseInt(document.getElementById('panReduction').value) || 0;
        hours = Math.max(0, Math.min(8, hours));
    }
    return hours * 60;
}

function updateAllRowCosts() {
    let speedBonus = computeTotalVitesse() / 100;
    let reducRestant = computeReductionTempsRestant() / 100;
    const lang = GlobalLang.get();
    
    let grandTotalTG = 0;
    let grandTotalTTG = 0;
    let grandTotalTimeMinutes = 0;

    buildingsState.forEach((b, index) => {
        let sumTG = 0;
        let sumTTG = 0;
        let sumTime = 0;
        
       let realTimeMinutes = 0;
        const panRedMin = getPanReductionMinutes();
        dbDataRaw.forEach(row => {
            if (row[COL.NAME] === b.name && row[COL.LEVEL] > b.current && row[COL.LEVEL] <= b.target) {
                sumTG += (parseInt(row[COL.TG]) || 0);
                sumTTG += (parseInt(row[COL.TTG]) || 0);
                const lvlTime = parseInt(row[COL.TIME]) || 0;
                let t = lvlTime / (1 + speedBonus);       // vitesse (groupe A)
                t = t * Math.max(0, 1 - reducRestant);    // Loup + Bouchées sur temps restant (groupe B)
                realTimeMinutes += Math.max(0, Math.ceil(t) - panRedMin);
            }
        });
        let timeFormatted = (realTimeMinutes > 0) ? formatMinutesCustom(realTimeMinutes, lang) : '-';
        
        document.getElementById(`tg-cost-${index}`).textContent = sumTG > 0 ? sumTG.toLocaleString() : '-';
        document.getElementById(`ttg-cost-${index}`).textContent = sumTTG > 0 ? sumTTG.toLocaleString() : '-';
        document.getElementById(`time-cost-${index}`).textContent = timeFormatted;
        
        grandTotalTG += sumTG;
        grandTotalTTG += sumTTG;
        grandTotalTimeMinutes += realTimeMinutes;
    });
    
    document.getElementById('grand-total-tg').textContent = grandTotalTG > 0 ? grandTotalTG.toLocaleString() : '-';
    document.getElementById('grand-total-ttg').textContent = grandTotalTTG > 0 ? grandTotalTTG.toLocaleString() : '-';
    document.getElementById('grand-total-time').textContent = grandTotalTimeMinutes > 0 ? formatMinutesCustom(grandTotalTimeMinutes, lang) : '-';
}

// ============ TIME FORMATTING ============
function formatMinutesCustom(minutes, lang) {
    let j = Math.floor(minutes / 1440);
    let h = Math.floor((minutes % 1440) / 60);
    let m = minutes % 60;
    let res = [];
    
    if (lang === 'FR') {
        if (j > 0) res.push(j + " jours");
        if (h > 0) res.push(h + " heures");
        if (m > 0 || res.length === 0) res.push(m + " minutes");
    } else {
        if (j > 0) res.push(j + " days");
        if (h > 0) res.push(h + " hours");
        if (m > 0 || res.length === 0) res.push(m + " minutes");
    }
    return res.join(", ");
}

// ============ BONUS CALCULATION ============
function computeTotalVitesse() {
    let base = parseFloat(document.getElementById('baseVitesse').value) || 0;
    let elTransfo = document.getElementById('transfoUtilisees');
    if (elTransfo.value > 100) elTransfo.value = 100;
    if (elTransfo.value < 0) elTransfo.value = 0;

    let total = base;
    if (document.getElementById('bonusGround').checked) total += 10;
    if (document.getElementById('bonusKvk').checked) total += 5;
    return total; // groupe A (bonus de vitesse) en %
}
// Loup Gris + Bouchées Doubles : réduisent le TEMPS RESTANT (cumul), pas la vitesse de base
function computeReductionTempsRestant() {
    let total = 0;
    if (document.getElementById('bonusDouble').checked) total += 20;
    if (document.getElementById('bonusWolfCheck').checked) {
        total += parseFloat(document.getElementById('bonusWolfVal').value) || 0;
    }
    return total; // groupe B en %
}
function getTotalVitesse() {
    const total = computeTotalVitesse();
    document.getElementById('totalVitesseDisplay').textContent = total.toFixed(1) + '%';
    return total / 100;
}

// ============ SAVE / LOAD ============
function saveData() {
    const data = {
        baseVitesse: document.getElementById('baseVitesse').value,
        bonusGround: document.getElementById('bonusGround').checked,
        bonusKvk: document.getElementById('bonusKvk').checked,
        bonusWolfCheck: document.getElementById('bonusWolfCheck').checked,
        bonusWolfVal: document.getElementById('bonusWolfVal').value,
        bonusDouble: document.getElementById('bonusDouble').checked,
        stockTG: document.getElementById('stockTG').value,
        stockTTG: document.getElementById('stockTTG').value,
        transfoUtilisees: document.getElementById('transfoUtilisees').value,
        mode: (document.getElementById('modeSelect') || {}).value || 'qty',
        scoreCible: (document.getElementById('scoreCible') || {}).value || '1000000',
        accelJours: document.getElementById('accelJours').value,
        accelHeures: document.getElementById('accelHeures').value,
        accelMinutes: document.getElementById('accelMinutes').value,
        panReduction: document.getElementById('panReduction').value,
        buildings: buildingsState
    };
    localStorage.setItem(STORAGE_KEYS.truegold, JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEYS.truegold);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.baseVitesse !== undefined) document.getElementById('baseVitesse').value = data.baseVitesse;
            if (data.bonusGround !== undefined) document.getElementById('bonusGround').checked = data.bonusGround;
            if (data.bonusKvk !== undefined) document.getElementById('bonusKvk').checked = data.bonusKvk;
            if (data.bonusWolfCheck !== undefined) document.getElementById('bonusWolfCheck').checked = data.bonusWolfCheck;
            if (data.bonusWolfVal !== undefined) document.getElementById('bonusWolfVal').value = data.bonusWolfVal;
            if (data.bonusDouble !== undefined) document.getElementById('bonusDouble').checked = data.bonusDouble;
            if (data.stockTG !== undefined) document.getElementById('stockTG').value = data.stockTG;
            if (data.stockTTG !== undefined) document.getElementById('stockTTG').value = data.stockTTG;
            if (data.transfoUtilisees !== undefined) document.getElementById('transfoUtilisees').value = data.transfoUtilisees;
            if (data.mode !== undefined && document.getElementById('modeSelect')) document.getElementById('modeSelect').value = data.mode;
            if (data.scoreCible !== undefined && document.getElementById('scoreCible')) document.getElementById('scoreCible').value = data.scoreCible;
            if (typeof syncScoreRow === 'function') syncScoreRow();
            const _sc = document.getElementById('scoreCible');
            if (_sc) { const _b = String(_sc.value || '').replace(/\D/g, ''); _sc.value = _b ? Number(_b).toLocaleString('fr-FR') : ''; }
            if (data.accelJours !== undefined) document.getElementById('accelJours').value = data.accelJours;
            if (data.accelHeures !== undefined) document.getElementById('accelHeures').value = data.accelHeures;
            if (data.accelMinutes !== undefined) document.getElementById('accelMinutes').value = data.accelMinutes;
            if (data.panReduction !== undefined) document.getElementById('panReduction').value = data.panReduction;
            if (data.buildings !== undefined) buildingsState = data.buildings;
        } catch(e) {
            console.error("Error loading data", e);
        }
    }
    
    // 🌐 PRIORITÉ à la langue globale (override les préférences locales)
    if (window.GlobalLang) {
        const langueSelect = document.getElementById('langue');
        if (langueSelect) {
            langueSelect.value = GlobalLang.get();
            // Écoute les changements pour les sauvegarder globalement
            langueSelect.addEventListener('change', () => {
                GlobalLang.set(langueSelect.value);
            });
        }
    }
}

// ============ MAIN UPDATE ============

// Utilitaire : ne lance fn qu'après 'delay' ms sans nouvel appel
function debounce(fn, delay = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Version différée de l'optimiseur lourd (relancée seulement à la fin de la frappe)
const scheduleCalculation = debounce(runCalculator, 200);

function formatScoreInput(el) {
    const brut = String(el.value || '').replace(/\D/g, '');
    el.value = brut ? Number(brut).toLocaleString('fr-FR') : '';
    triggerUpdate();
}
function syncScoreRow() {
    const sel = document.getElementById('modeSelect');
    const row = document.getElementById('scoreCibleRow');
    if (sel && row) row.style.display = (sel.value === 'target') ? '' : 'none';
}
function onModeChange() { syncScoreRow(); triggerUpdate(); }

function triggerUpdate() {
    try {
        getTotalVitesse();      // léger : met à jour le bonus total affiché (immédiat)
        applyTranslations();    // léger (immédiat)
        applyPanUI();
        renderBuildings();      // met à jour les coûts par ligne (feedback immédiat)
        saveData();             // léger : persistance garantie (immédiat)
        scheduleCalculation();  // LOURD : optimiseur différé de 200 ms
    } catch (e) {
        console.error(e);
    }
}

function runCalculator() {
    let stockTG = Number(document.getElementById('stockTG').value);
    let stockTTG = Number(document.getElementById('stockTTG').value);
    let transfoUtilisees = Number(document.getElementById('transfoUtilisees').value);
    let vitesseAmelio = getTotalVitesse();
    let accelJours = Number(document.getElementById('accelJours').value);
    let accelHeures = Number(document.getElementById('accelHeures').value);
    let accelMinutes = Number(document.getElementById('accelMinutes').value);
    let modeEl = document.getElementById('modeSelect');
    let mode = modeEl ? modeEl.value : 'qty';
    let scoreCible = Number(String((document.getElementById('scoreCible') || {}).value || '').replace(/\D/g, '')) || 0;
    
    const lang = GlobalLang.get();
    let tx = i18n[lang];

    let formattedTableur = buildingsState.map(b => [b.name, "", "", "", b.current, b.target, b.enabled !== false]);

    try {
        let resultText = SUGGERER_KINGSHOT(
            stockTG, stockTTG, transfoUtilisees, vitesseAmelio,
            accelJours, accelHeures, accelMinutes, mode, scoreCible, tx,
            formattedTableur, dbDataRaw, rangeDataTTG, lang
        );
        document.getElementById('output').innerHTML = resultText;
    } catch(e) {
        document.getElementById('output').innerHTML = `<span style="color:var(--warning);">❌ Execution Error: ${e.message}</span>`;
    }
}

// ============ STRATEGIC OPTIMIZER ============

// Le plan est re-généré à chaque saisie (innerHTML) : on mémorise les séries dépliées
// pour ne pas les refermer sous les doigts du joueur. Clé stable = bâtiment + palier
// de départ/arrivée, donc insensible aux changements qui ne touchent pas cette série.
const TG_OPEN_SERIES = new Set();
function tgRememberOpen(el) {
    const cle = el.getAttribute('data-key');
    if (!cle) return;
    if (el.open) TG_OPEN_SERIES.add(cle); else TG_OPEN_SERIES.delete(cle);
}

function SUGGERER_KINGSHOT(stockTG, stockTTG, transfoUtilisees, vitesseAmelio, accelJours, accelHeures, accelMinutes, mode, scoreCible, tx, rangeTableur, rangeDatabase, rangeDataTTG, lang) {
    const modeKVK = (mode === 'kvk');
    const modeTarget = (mode === 'target');
    scoreCible = Math.max(0, Number(scoreCible) || 0);
    const panReductionMin = getPanReductionMinutes();
    const reducRestant = computeReductionTempsRestant() / 100;
    const isEN = (lang === 'EN');

    // ============ BOUCLIER DE SÉCURITÉ ============
    if (!rangeTableur || !Array.isArray(rangeTableur) || rangeTableur.length === 0) {
        return isEN ? "❌ Error: Building data missing." : "❌ Erreur : Données des bâtiments manquantes.";
    }
    if (!rangeDatabase || !Array.isArray(rangeDatabase) || rangeDatabase.length === 0) {
        return isEN ? "❌ Error: Database missing." : "❌ Erreur : Base de données manquante.";
    }
    if (!rangeDataTTG || !Array.isArray(rangeDataTTG) || rangeDataTTG.length === 0) {
        return isEN ? "❌ Error: TTG data missing." : "❌ Erreur : Données TTG manquantes.";
    }

    // ============ FONCTIONS UTILITAIRES ============
    function parseTG(label) {
        if (!label) return { major: 0, minor: 0, isTG: false };
        const match = label.match(/TG(\d+)-(\d+)/);
        if (match) {
            return { major: parseInt(match[1]), minor: parseInt(match[2]), isTG: true };
        }
        return { major: 0, minor: 0, isTG: false };
    }

    function fmt(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function formatMinutes(minutes) {
        const j = Math.floor(minutes / 1440);
        const h = Math.floor((minutes % 1440) / 60);
        const m = minutes % 60;
        const res = [];
        const dayChar = isEN ? "d" : "j";
        if (j > 0) res.push(j + dayChar);
        if (h > 0) res.push(h + "h");
        if (m > 0 || res.length === 0) res.push(m + "m");
        return res.join(" ");
    }

    // ============ PRÉPARATION DES DONNÉES ============
    const stockAccelMinutesTotal = (Number(accelJours) * 1440) + (Number(accelHeures) * 60) + Number(accelMinutes);

    // Construction de la base de données indexée
    const db = {};
    for (let i = 0; i < rangeDatabase.length; i++) {
        const nomBatiment = rangeDatabase[i][COL.NAME];
        const niveau = Number(rangeDatabase[i][COL.LEVEL]);
        const labelNiveau = rangeDatabase[i][COL.LABEL];
        const coutTG = Number(rangeDatabase[i][COL.TG]);
        const coutTTG = Number(rangeDatabase[i][COL.TTG]);
        const tempsBaseMinutes = Number(rangeDatabase[i][COL.TIME]);

        if (nomBatiment && !isNaN(niveau)) {
            if (!db[nomBatiment]) db[nomBatiment] = {};
            db[nomBatiment][niveau] = {
                tg: coutTG,
                ttg: coutTTG,
                label: labelNiveau,
                tempsBase: isNaN(tempsBaseMinutes) ? 0 : tempsBaseMinutes,
                prereq: rangeDatabase[i][3] || ''
            };
        }
    }

    // Mapping des noms raccourcis dans les prérequis vers les noms DB
    const prereqNameMap = { 'academy': 'War Academy' };

    // Extrait les prérequis TG du texte DB (col 3) → [{nom, major}].
    function parsePrereqTG(prereqText) {
        if (!prereqText) return [];
        const reqs = [];
        const lines = prereqText.split(/[,\n]+/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            const m = line.match(/^(.+?)\s+TG\s*(?:Lv\.\s*)?([\d]+)/i);
            if (!m) continue; // prérequis non-TG (ex: "Embassy Lv. 30") → toujours rempli dans le tier TG
            let reqName = m[1].trim();
            const mapped = prereqNameMap[reqName.toLowerCase()];
            if (mapped) reqName = mapped;
            reqs.push({ nom: reqName, major: parseInt(m[2]) });
        }
        return reqs;
    }

    // Vérifie les prérequis TG d'une amélioration.
    // Retourne false si un prérequis n'est pas rempli.
    function checkPrereqsTG(prereqText, etatBats) {
        const reqs = parsePrereqTG(prereqText);
        for (const req of reqs) {
            const bState = etatBats.find(b => b.nom === req.nom);
            if (!bState) continue; // bâtiment non suivi
            const effLvl = bState.enCours ? bState.lvl - 1 : bState.lvl;
            const bDB = db[bState.nom] && db[bState.nom][effLvl];
            if (!bDB) return false;
            const bTG = parseTG(bDB.label);
            if (!bTG.isTG || bTG.major < req.major) return false;
        }
        return true;
    }

    // État initial des bâtiments
    const batimentsInitiaux = [];
    for (let i = 0; i < rangeTableur.length; i++) {
        const nom = rangeTableur[i][0];
        const niveauActuel = Number(rangeTableur[i][4]);

        if (nom && !isNaN(niveauActuel) && db[nom]) {
            batimentsInitiaux.push({ nom: nom, lvl: niveauActuel, enCours: false, exclu: (rangeTableur[i][6] === false) });
        }
    }

    // ============ SIMULATION : TROUVER LE MEILLEUR SCÉNARIO ============
    let meilleurScenario = null;

    // Glouton d'améliorations pour un état de départ donné (tgDebut/ttgDebut post-transfo),
    // selon une stratégie de tri : 'kvk' = ressource max, 'cout' = moins cher, 'ratio' = rendement.
    // La logique du mode Score cible (files / relance) reste pilotée par modeTarget.
    function executerPlan(tgDebut, ttgDebut, strategie) {
        let tgActuel = tgDebut;
        let ttgActuel = ttgDebut;
        const etatBatiments = JSON.parse(JSON.stringify(batimentsInitiaux));
        const ameliorationsFaites = [];
        let tgDepenseAmelio = 0;
        let ttgDepenseAmelio = 0;
        let accelMinutesUtilisees = 0;
        let stockAccelSimule = stockAccelMinutesTotal;
        let filesAttenteDisponibles = 2;

        const pointsCourants = () => (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000) + (accelMinutesUtilisees * 30);

        // Mode cible uniquement : achève avec des accélérateurs la construction en cours
        // la plus courte. Ça libère une file ET fait vraiment monter le bâtiment d'un
        // palier — donc ça débloque les bâtiments qui attendaient ce palier.
        // Retourne false s'il n'y a rien à finir ou pas assez d'accélérateurs.
        function finirUneConstruction() {
            const restant = a => a.tempsReel - a.minutesAccelerables;
            const finissables = ameliorationsFaites.filter(a => a.estEnCours && restant(a) <= stockAccelSimule);
            if (finissables.length === 0) return false;
            finissables.sort((a, b) => restant(a) - restant(b));
            const aFinir = finissables[0];
            const aAjouter = restant(aFinir);
            stockAccelSimule -= aAjouter;
            accelMinutesUtilisees += aAjouter;
            aFinir.minutesAccelerables = aFinir.tempsReel;
            aFinir.estEnCours = false;
            etatBatiments[aFinir.index].enCours = false;
            filesAttenteDisponibles++;
            return true;
        }

        while (true) {
            if (filesAttenteDisponibles === 0) {
                if (!modeTarget) break;
                if (pointsCourants() >= scoreCible) break;
                if (!finirUneConstruction()) break;
                continue;
            }

            const ameliorationsDisponibles = [];
            for (let b = 0; b < etatBatiments.length; b++) {
                const bState = etatBatiments[b];
                if (bState.enCours) continue;
                if (bState.exclu) continue;
                const niveauCible = bState.lvl + 1;
                if (db[bState.nom] && db[bState.nom][niveauCible]) {
                    const couts = db[bState.nom][niveauCible];
                    let estValide = checkPrereqsTG(couts.prereq, etatBatiments);
                    if (estValide && tgActuel >= couts.tg && ttgActuel >= couts.ttg) {
                        let tReel = couts.tempsBase / (1 + Number(vitesseAmelio));   // vitesse (A)
                        tReel = tReel * Math.max(0, 1 - reducRestant);                // Loup + Bouchées (B)
                        const tempsReelMinutes = Math.max(0, Math.ceil(tReel) - panReductionMin);
                        const gainKVKRessources = (couts.tg * 2000) + (couts.ttg * 30000);
                        const minutesAAccelerer = modeTarget ? 0 : Math.min(tempsReelMinutes, stockAccelSimule);
                        const gainKVKAccel = minutesAAccelerer * 30;
                        ameliorationsDisponibles.push({
                            index: b,
                            nom: bState.nom,
                            niveauCible: niveauCible,
                            labelCible: couts.label,
                            tg: couts.tg,
                            ttg: couts.ttg,
                            tempsReel: tempsReelMinutes,
                            minutesAccelerables: minutesAAccelerer,
                            prereq: couts.prereq,
                            poidsKVK: gainKVKRessources + gainKVKAccel,
                            poidsCout: couts.tg + (couts.ttg * 15)
                        });
                    }
                }
            }

            if (ameliorationsDisponibles.length === 0) {
                // En mode cible, les améliorations ne sont jamais accélérées à la sélection :
                // la première reste « en construction » et son bâtiment est gelé. Comme tout
                // l'arbre dépend du palier TG du Centre-ville, plus rien n'était disponible et
                // le plan s'arrêtait après une seule étape. On termine donc la construction la
                // plus courte pour rouvrir l'arbre, tant que la cible n'est pas atteinte.
                if (modeTarget && pointsCourants() < scoreCible && finirUneConstruction()) continue;
                break;
            }

            let meilleurChoix;
            if (modeTarget) {
                const ptsCourants = pointsCourants();
                const ecart = scoreCible - ptsCourants;
                const franchisseurs = ameliorationsDisponibles.filter(a => a.poidsKVK >= ecart);
                if (franchisseurs.length > 0) {
                    franchisseurs.sort((a, b) => a.poidsKVK - b.poidsKVK);
                    meilleurChoix = franchisseurs[0];
                } else {
                    ameliorationsDisponibles.sort((a, b) => b.poidsKVK - a.poidsKVK);
                    meilleurChoix = ameliorationsDisponibles[0];
                }
            } else {
                ameliorationsDisponibles.sort((a, b) => {
                    const aFini = (a.minutesAccelerables >= a.tempsReel) ? 1 : 0;
                    const bFini = (b.minutesAccelerables >= b.tempsReel) ? 1 : 0;
                    if (aFini !== bFini) return bFini - aFini;
                    if (strategie === 'kvk') return b.poidsKVK - a.poidsKVK;
                    if (strategie === 'ratio') return (b.poidsKVK / b.poidsCout) - (a.poidsKVK / a.poidsCout);
                    return a.poidsCout - b.poidsCout;
                });
                meilleurChoix = ameliorationsDisponibles[0];
            }

            tgActuel -= meilleurChoix.tg;
            ttgActuel -= meilleurChoix.ttg;
            tgDepenseAmelio += meilleurChoix.tg;
            ttgDepenseAmelio += meilleurChoix.ttg;
            stockAccelSimule -= meilleurChoix.minutesAccelerables;
            accelMinutesUtilisees += meilleurChoix.minutesAccelerables;
            const estFini = (meilleurChoix.minutesAccelerables >= meilleurChoix.tempsReel);
            meilleurChoix.estEnCours = !estFini;
            if (!estFini) {
                etatBatiments[meilleurChoix.index].enCours = true;
                filesAttenteDisponibles--;
            }
            etatBatiments[meilleurChoix.index].lvl = meilleurChoix.niveauCible;
            ameliorationsFaites.push(meilleurChoix);

            if (modeTarget) {
                const ptsCourants = pointsCourants();
                if (ptsCourants >= scoreCible) {
                    break;
                } else {
                    let potentielAccelMinutes = 0;
                    for (const a of ameliorationsFaites) {
                        if (a.estEnCours) potentielAccelMinutes += (a.tempsReel - a.minutesAccelerables);
                    }
                    potentielAccelMinutes = Math.min(potentielAccelMinutes, stockAccelSimule);
                    if ((ptsCourants + potentielAccelMinutes * 30) >= scoreCible) break;
                }
            }
        }

        // Mode cible : combler un éventuel manque avec un minimum d'accélérateurs.
        // On passe sur TOUTES les constructions en cours : chacune est plafonnée par son
        // propre temps restant, donc une seule ne suffit pas toujours à couvrir l'écart
        // (le plan tombait alors à quelques centaines de points de la cible).
        if (modeTarget) {
            for (const build of ameliorationsFaites) {
                const manque = scoreCible - pointsCourants();
                if (manque <= 0 || stockAccelSimule <= 0) break;
                if (!build.estEnCours) continue;
                const restant = build.tempsReel - build.minutesAccelerables;
                if (restant <= 0) continue;
                const ajout = Math.min(Math.ceil(manque / 30), stockAccelSimule, restant);
                if (ajout <= 0) continue;
                build.minutesAccelerables += ajout;
                accelMinutesUtilisees += ajout;
                stockAccelSimule -= ajout;
                if (build.minutesAccelerables >= build.tempsReel) {
                    build.estEnCours = false;
                    etatBatiments[build.index].enCours = false;
                }
            }
        }

        return {
            ameliorationsFaites: ameliorationsFaites,
            tgDepenseAmelio: tgDepenseAmelio,
            ttgDepenseAmelio: ttgDepenseAmelio,
            accelMinutesUtilisees: accelMinutesUtilisees
        };
    }

    for (let transfosTest = 0; transfosTest <= 100; transfosTest++) {
        let tgActuel = stockTG;
        let ttgActuel = stockTTG;
        let stepActuel = transfoUtilisees;

        let totalTGDepenseTransfo = 0;
        let totalTTGGagneTransfo = 0;
        let possible = true;

        // --- Simulation des transformations TG → TTG ---
        for (let c = 0; c < transfosTest; c++) {
            const stepVise = stepActuel + 1;
            let coutTransfo = 0;
            let gainTransfo = 0;
            let etapeTrouvee = false;

            for (let j = 0; j < rangeDataTTG.length; j++) {
                if (Number(rangeDataTTG[j][TTG_COL.STEP]) === stepVise) {
                    coutTransfo = Number(rangeDataTTG[j][TTG_COL.COST]);
                    gainTransfo = Number(rangeDataTTG[j][TTG_COL.GAIN]);
                    etapeTrouvee = true;
                    break;
                }
            }

            if (!etapeTrouvee || tgActuel < coutTransfo) {
                possible = false;
                break;
            }

            tgActuel -= coutTransfo;
            totalTGDepenseTransfo += coutTransfo;
            ttgActuel += gainTransfo;
            totalTTGGagneTransfo += gainTransfo;
            stepActuel++;
        }

        if (!possible) continue;

        tgActuel = Math.floor(tgActuel);
        ttgActuel = Math.floor(ttgActuel);

        // --- Simulation des améliorations (glouton) ---
        // En mode KVK, on évalue plusieurs stratégies de tri et on garde le plan qui rapporte le
        // plus de points : un tri par ressource pure peut sous-utiliser le stock d'accélérateurs.
        const strategies = modeKVK ? ['kvk', 'cout', 'ratio'] : ['cout'];
        let plan = null;
        let planPts = -Infinity;
        for (let s = 0; s < strategies.length; s++) {
            const p = executerPlan(tgActuel, ttgActuel, strategies[s]);
            const pts = (p.tgDepenseAmelio * 2000) + (p.ttgDepenseAmelio * 30000) + (p.accelMinutesUtilisees * 30);
            if (!plan || pts > planPts) { plan = p; planPts = pts; }
        }
        const ameliorationsFaites = plan.ameliorationsFaites;
        const tgDepenseAmelio = plan.tgDepenseAmelio;
        const ttgDepenseAmelio = plan.ttgDepenseAmelio;
        const accelMinutesUtilisees = plan.accelMinutesUtilisees;

        // --- Calcul des points KVK pour ce scénario ---
        const ptsRessources = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000);
        const ptsAccel = accelMinutesUtilisees * 30;
        const pointsKVKTotal = ptsRessources + ptsAccel;
        const cibleAtteinte = modeTarget && (pointsKVKTotal >= scoreCible);
        const coutRessourcesTGeq = tgDepenseAmelio + (ttgDepenseAmelio * 15);

        // --- Comparaison avec le meilleur scénario actuel ---
        let enregistrerScenario = false;
        if (!meilleurScenario) {
            enregistrerScenario = true;
        } else if (modeTarget) {
            const bestAtteint = meilleurScenario.cibleAtteinte;
            if (cibleAtteinte && !bestAtteint) {
                enregistrerScenario = true;                                              // atteindre la cible prime tout
            } else if (cibleAtteinte && bestAtteint) {
                // Parmi ceux qui atteignent : d'abord le moins d'accél, puis le moins de ressources.
                if (accelMinutesUtilisees < meilleurScenario.accelUtilisees) {
                    enregistrerScenario = true;
                } else if (accelMinutesUtilisees === meilleurScenario.accelUtilisees && coutRessourcesTGeq < meilleurScenario.coutRessourcesTGeq) {
                    enregistrerScenario = true;
                }
            } else if (!cibleAtteinte && !bestAtteint) {
                if (pointsKVKTotal > meilleurScenario.pointsKVK) enregistrerScenario = true;               // sinon : le max atteignable
            }
        } else if (modeKVK) {
            if (pointsKVKTotal > meilleurScenario.pointsKVK) enregistrerScenario = true;
        } else {
            if (ameliorationsFaites.length > meilleurScenario.ameliorations.length) {
                enregistrerScenario = true;
            } else if (ameliorationsFaites.length === meilleurScenario.ameliorations.length && pointsKVKTotal > meilleurScenario.pointsKVK) {
                enregistrerScenario = true;
            }
        }

        if (enregistrerScenario) {
            meilleurScenario = {
                nbTransfos: transfosTest,
                tgInvestiTransfo: totalTGDepenseTransfo,
                ttgObtenu: Math.floor(totalTTGGagneTransfo),
                nouveauStockTG: Math.floor(stockTG - totalTGDepenseTransfo),
                nouveauStockTTG: Math.floor(stockTTG + totalTTGGagneTransfo),
                ameliorations: ameliorationsFaites,
                tgUtilisesAmelio: tgDepenseAmelio,
                ttgUtiliseesAmelio: ttgDepenseAmelio,
                accelUtilisees: accelMinutesUtilisees,
                pointsTG: tgDepenseAmelio * 2000,
                pointsTTG: ttgDepenseAmelio * 30000,
                pointsAccel: ptsAccel,
                pointsKVK: pointsKVKTotal,
                cibleAtteinte: cibleAtteinte,
                coutRessourcesTGeq: coutRessourcesTGeq
            };
        }
    }

    // ============ AUCUN SCÉNARIO POSSIBLE ============
    if (!meilleurScenario || meilleurScenario.ameliorations.length === 0) {
        return `<div style="text-align:center; padding:20px; color:var(--warning);">${tx.err}</div>`;
    }

     // ============ TRIM : minimiser les transformations sans changer le plan ============
    // Une transformation pouvait être suggérée comme simple artefact du glouton (appauvrir le TG
    // force un autre chemin). On garde la séquence gagnante à l'identique — donc les mêmes points —
    // et on ne conserve que le minimum de transformations qui finance encore ce plan.
    if (meilleurScenario.nbTransfos > 0) {
        const tgNeeded = meilleurScenario.tgUtilisesAmelio;
        const ttgNeeded = meilleurScenario.ttgUtiliseesAmelio;
        const simTransfos = (t) => {
            let tg = stockTG, ttg = stockTTG, step = transfoUtilisees, cost = 0, gain = 0, ok = true;
            for (let c = 0; c < t; c++) {
                const stepVise = step + 1;
                let cTr = 0, gTr = 0, found = false;
                for (let j = 0; j < rangeDataTTG.length; j++) {
                    if (Number(rangeDataTTG[j][TTG_COL.STEP]) === stepVise) {
                        cTr = Number(rangeDataTTG[j][TTG_COL.COST]); gTr = Number(rangeDataTTG[j][TTG_COL.GAIN]); found = true; break;
                    }
                }
                if (!found || tg < cTr) { ok = false; break; }
                tg -= cTr; ttg += gTr; cost += cTr; gain += gTr; step++;
            }
            return { tgAfter: tg, ttgAfter: ttg, cost, gain, ok };
        };
        for (let t = 0; t <= meilleurScenario.nbTransfos; t++) {
            const sim = simTransfos(t);
            if (sim.ok && sim.tgAfter >= tgNeeded && sim.ttgAfter >= ttgNeeded) {
                if (t < meilleurScenario.nbTransfos) {
                    meilleurScenario.nbTransfos = t;
                    meilleurScenario.tgInvestiTransfo = sim.cost;
                    meilleurScenario.ttgObtenu = Math.floor(sim.gain);
                    meilleurScenario.nouveauStockTG = Math.floor(stockTG - sim.cost);
                    meilleurScenario.nouveauStockTTG = Math.floor(stockTTG + sim.gain);
                }
                break;
            }
        }
    }

    // ============ SÉRIES CHRONOLOGIQUES ============
    // Le plan se lit de haut en bas dans l'ordre réel d'exécution : on regroupe seulement
    // les niveaux consécutifs d'un même bâtiment. Un bâtiment peut donc revenir plusieurs
    // fois — c'est l'escalier imposé par les prérequis croisés (Centre-ville ⇄ Ambassade
    // et bâtiments de troupes). Regrouper par bâtiment, comme avant, donnait une liste
    // impossible à appliquer telle quelle en jeu.
    const series = [];
    for (let i = 0; i < meilleurScenario.ameliorations.length; i++) {
        const amelio = meilleurScenario.ameliorations[i];
        amelio.ordre = i + 1;
        amelio.points = (amelio.tg * 2000) + (amelio.ttg * 30000) + (amelio.minutesAccelerables * 30);
        const derniere = series[series.length - 1];
        if (derniere && derniere.nom === amelio.nom) {
            derniere.etapes.push(amelio);
        } else {
            const niveauPrecedent = db[amelio.nom] && db[amelio.nom][amelio.niveauCible - 1];
            series.push({
                nom: amelio.nom,
                labelDepart: niveauPrecedent ? niveauPrecedent.label : '',
                etapes: [amelio]
            });
        }
    }

    for (const s of series) {
        s.labelFin    = s.etapes[s.etapes.length - 1].labelCible;
        s.totalTG     = s.etapes.reduce((n, e) => n + e.tg, 0);
        s.totalTTG    = s.etapes.reduce((n, e) => n + e.ttg, 0);
        s.totalTemps  = s.etapes.reduce((n, e) => n + e.tempsReel, 0);
        s.totalPoints = s.etapes.reduce((n, e) => n + e.points, 0);
        s.estEnCours  = s.etapes.some(e => e.estEnCours);
        s.majorDepart = parseTG(s.labelDepart).major;
        s.majorFin    = parseTG(s.labelFin).major;
    }

    // Quelle série débloque quelle autre : la première série suivante dont le 1er niveau
    // exige ce bâtiment à un palier TG que seule cette série vient d'atteindre.
    for (let i = 0; i < series.length; i++) {
        const s = series[i];
        if (s.majorFin <= s.majorDepart) continue;
        for (let j = i + 1; j < series.length; j++) {
            const suivante = series[j];
            const req = parsePrereqTG(suivante.etapes[0].prereq)
                .find(r => r.nom === s.nom && r.major > s.majorDepart && r.major <= s.majorFin);
            if (req) {
                s.debloque = { ordre: j + 1, nom: suivante.nom, label: suivante.etapes[0].labelCible };
                break;
            }
        }
    }

    // ============ GÉNÉRATION DU HTML FINAL ============
    const titreMode = modeKVK ? tx.optKVK : (modeTarget ? tx.optTarget : tx.optQty);
    const c_or = '#f5b840';
    const c_turquoise = '#4ecdc4';
    const c_rubis = '#e74c5c';

    let html = `<div style="line-height:1.7;">`;

    // Titre
    html += `<div style="text-align:center; margin-bottom:20px; padding:12px; background:rgba(245,184,64,0.08); border-radius:6px; border:1px solid ${c_or};">`;
    html += `<strong style="font-size:16px; color:${c_or};">${titreMode}</strong>`;
    html += `</div>`;

    // Bannière mode Score cible
    if (modeTarget) {
        if (meilleurScenario.cibleAtteinte) {
            html += `<div style="text-align:center; margin-bottom:15px; padding:10px; background:rgba(78,205,196,0.12); border-radius:6px; border:1px solid ${c_turquoise}; color:${c_turquoise}; font-weight:bold;">${tx.targetReached}${fmt(meilleurScenario.pointsKVK)}${tx.targetOf}${fmt(scoreCible)})</div>`;
        } else {
            html += `<div style="text-align:center; margin-bottom:15px; padding:10px; background:rgba(231,76,92,0.12); border-radius:6px; border:1px solid ${c_rubis}; color:${c_rubis}; font-weight:bold;">${tx.notEnough}${fmt(meilleurScenario.pointsKVK)} ${tx.ptsEnd}</div>`;
        }
    }

    // Stratégie du creuset (Affiché uniquement s'il y a des transformations)
    if (meilleurScenario.nbTransfos > 0) {
        html += `<div style="margin-bottom:15px;">`;
        html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">🔮 ${tx.crucible}</div>`;
        html += `<div style="padding-left:24px;">`;
        html += `${tx.transform}<strong style="color:${c_or};">${fmt(meilleurScenario.tgInvestiTransfo)}</strong>`;
        html += `${tx.tgExpecting}<strong style="color:${c_or};">${fmt(meilleurScenario.ttgObtenu)}</strong>`;
        html += `${tx.ttgOr}<strong style="color:${c_turquoise};">${meilleurScenario.nbTransfos}</strong>`;
        html += `${tx.transfos}`;
        html += `</div></div>`;
    }

    // Stocks (Titre dynamique : Nouveaux si transfo, Actuels sinon)
    const stockTitle = (meilleurScenario.nbTransfos > 0) ? tx.newStocks : tx.currentStocks;
    html += `<div style="margin-bottom:15px;">`;
    html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">${stockTitle}</div>`;
    html += `<div style="padding-left:24px;">${tx.tgRemaining}<strong style="color:${c_or};">${fmt(meilleurScenario.nouveauStockTG)}</strong></div>`;
    html += `<div style="padding-left:24px;">${tx.ttgRemaining}<strong style="color:${c_or};">${fmt(meilleurScenario.nouveauStockTTG)}</strong></div>`;
    html += `</div>`;

    // Plan d'amélioration — séries chronologiques repliables
    html += `<div style="margin-bottom:15px;">`;
    html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">${tx.plan}</div>`;
    html += `<div class="tg-plan-hint">${tx.planHint}</div>`;
    html += `<div class="tg-plan">`;

    for (let i = 0; i < series.length; i++) {
        const s = series[i];
        const nomLoc = (typeof getLocName === 'function') ? getLocName(s.nom) : s.nom;
        const icone = (typeof bldgIcon === 'function') ? bldgIcon(s.nom) : '';
        const statut = s.estEnCours ? tx.inProgress : tx.completed;
        const cle = `${s.nom}|${s.labelDepart}>${s.labelFin}`;
        const ouvert = TG_OPEN_SERIES.has(cle) ? ' open' : '';

        html += `<details class="tg-serie${s.estEnCours ? ' is-wip' : ''}"${ouvert} data-key="${cle}" ontoggle="tgRememberOpen(this)">`;
        html += `<summary class="tg-serie-head">`;
        html += `<span class="tg-serie-num">${i + 1}</span>`;
        html += `<span class="tg-serie-main">`;
        html += `<span class="tg-serie-title">`;
        html += `<span class="tg-serie-icon">${icone}</span>`;
        html += `<strong class="tg-serie-name">${nomLoc}</strong>`;
        if (s.labelDepart) html += `<span class="tg-serie-from">${s.labelDepart}</span><span class="tg-serie-arrow">→</span>`;
        html += `<span class="tg-serie-to">${s.labelFin}</span>`;
        html += `<span class="tg-serie-count">${s.etapes.length} ${tx.levelsShort}</span>`;
        html += `<span class="tg-serie-status">${statut}</span>`;
        html += `</span>`;
        html += `<span class="tg-serie-sub">`;
        html += `<span><strong>${fmt(s.totalTG)}</strong> TG</span><span><strong>${fmt(s.totalTTG)}</strong> TTG</span>`;
        html += `<span>⏱️ <strong>${formatMinutes(s.totalTemps)}</strong></span>`;
        html += `<span>🏆 <strong>+${fmt(s.totalPoints)}</strong></span>`;
        html += `</span>`;
        if (s.debloque) {
            const nomDeb = (typeof getLocName === 'function') ? getLocName(s.debloque.nom) : s.debloque.nom;
            html += `<span class="tg-serie-unlock">🔓 ${tx.unlocks} <strong>#${s.debloque.ordre} ${nomDeb} ${s.debloque.label}</strong></span>`;
        }
        html += `</span>`;
        html += `<span class="tg-serie-chev" aria-hidden="true">▸</span>`;
        html += `</summary>`;

        html += `<div class="tg-serie-body"><div class="tg-steps-scroll"><table class="tg-steps">`;
        html += `<thead><tr><th>${tx.colStep}</th><th>${tx.colTier}</th><th class="num">TG</th><th class="num">TTG</th><th class="num">${tx.colDuration}</th><th class="num">${tx.colSpeedup}</th><th class="num">${tx.colPoints}</th></tr></thead><tbody>`;
        for (const e of s.etapes) {
            const reste = e.tempsReel - e.minutesAccelerables;
            let cellAccel;
            if (e.minutesAccelerables <= 0) {
                cellAccel = `<span class="tg-none">—</span>`;
            } else {
                cellAccel = formatMinutes(e.minutesAccelerables);
            }
            if (reste > 0) cellAccel += `<span class="tg-left">${formatMinutes(reste)} ${tx.remaining}</span>`;
            html += `<tr${e.estEnCours ? ' class="is-wip"' : ''}>`;
            html += `<td class="tg-ord">${e.ordre}</td>`;
            html += `<td class="tg-tier">${e.labelCible}</td>`;
            html += `<td class="num">${fmt(e.tg)}</td>`;
            html += `<td class="num">${e.ttg > 0 ? fmt(e.ttg) : '<span class="tg-none">—</span>'}</td>`;
            html += `<td class="num">${formatMinutes(e.tempsReel)}</td>`;
            html += `<td class="num">${cellAccel}</td>`;
            html += `<td class="num tg-pts">+${fmt(e.points)}</td>`;
            html += `</tr>`;
        }
        html += `</tbody></table></div></div>`;
        html += `</details>`;
    }

    html += `</div></div>`;

    // Gestion du temps
    html += `<div style="margin-bottom:15px;">`;
    html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">${tx.timeMgt}</div>`;
    html += `<div style="padding-left:24px;">${tx.timeCons}<strong style="color:${c_rubis};">${formatMinutes(meilleurScenario.accelUtilisees)}</strong>.</div>`;
    html += `</div>`;

    // Bilan KVK
    html += `<div style="margin-bottom:15px;">`;
    html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">${tx.bilan}</div>`;
    html += `<div style="padding-left:24px;">🔶 <strong style="color:${c_or};">${fmt(meilleurScenario.tgUtilisesAmelio)}</strong>${tx.tgUsed}<strong style="color:${c_or};"> + ${fmt(meilleurScenario.pointsTG)}</strong>${tx.pts}</div>`;
    html += `<div style="padding-left:24px;">🔷 <strong style="color:${c_or};">${fmt(meilleurScenario.ttgUtiliseesAmelio)}</strong>${tx.ttgUsed}<strong style="color:${c_or};"> + ${fmt(meilleurScenario.pointsTTG)}</strong>${tx.pts}</div>`;
    html += `<div style="padding-left:24px;">⏱️ <strong style="color:${c_rubis};">${formatMinutes(meilleurScenario.accelUtilisees)}</strong>${tx.accelUsed}<strong style="color:${c_or};"> + ${fmt(meilleurScenario.pointsAccel)}</strong>${tx.pts}</div>`;
    html += `</div>`;

    // Total maximal
    html += `<div style="margin-top:20px; padding:15px; background:linear-gradient(135deg, rgba(245,184,64,0.15), rgba(78,205,196,0.1)); border-radius:8px; border:1px solid ${c_or}; text-align:center;">`;
    html += `<strong style="font-size:16px;">${tx.totalMax}</strong>`;
    html += `<span style="color:${c_or}; font-weight:bold; font-size:22px;"> ${fmt(meilleurScenario.pointsKVK)}</span>`;
    html += `<strong style="font-size:16px;"> ${tx.ptsEnd}</strong>`;
    html += `</div>`;

    html += `</div>`;

    return html;
}

function tgInitHelp() {
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id: 'truegold', banner: true, anchor: '[data-i18n="myBuildings"]',
        title: { FR: 'TrueGold — Aide', EN: 'TrueGold — Help' },
        summary: {
            FR: "Calcule la stratégie d'amélioration de tes bâtiments TrueGold la plus rentable selon ton objectif : maximiser tes points KVK, monter un maximum de bâtiments, ou atteindre un score précis au meilleur coût.",
            EN: "Computes the most efficient TrueGold building-upgrade strategy for your goal: maximize KVK points, upgrade as many buildings as possible, or reach a target score at the lowest cost."
        },
        steps: {
            FR: [
                "Renseigne tes stocks de TrueGold (TG) et Or Véritable Trempé (TTG), et le nombre de transformations déjà utilisées (max 100).",
                "Deux types de bonus : les bonus de vitesse (Bonus Vitesse, 1er Ministre, KVK) divisent le temps de base ; le Loup Gris et les Bouchées Doubles réduisent ensuite le temps restant (cumulés). Indique aussi tes accélérateurs (jours / heures / minutes).",
                "Pour chaque bâtiment, mets son niveau actuel et le niveau cible que tu veux atteindre.",
                "Décoche la case devant un bâtiment pour l'exclure des suggestions (quel que soit le mode) : il reste figé à son niveau actuel et sert toujours de prérequis aux autres.",
                "Choisis le mode : « Max points KVK » (rentabilité maximale en points), « Max bâtiments » (en monter le plus possible), ou « Score cible » (atteindre un score précis au coût le plus bas).",
                "En mode « Score cible », saisis le score visé : l'outil trouve la combinaison la moins chère (bâtiments + transformations + accélérateurs) pour l'atteindre.",
                "Lis le « Plan d'Amélioration » de haut en bas : les étapes sont numérotées dans l'ordre où il faut les faire en jeu. Un bâtiment revient plusieurs fois, c'est normal : le Centre-ville et l'Ambassade/les bâtiments de troupes se débloquent mutuellement, palier après palier (la mention 🔓 indique quelle étape est débloquée).",
                "Clique sur une étape pour déplier le détail niveau par niveau : coût en TG et TTG, temps de construction, accélérateurs consommés et points KVK gagnés."
            ],
            EN: [
                "Enter your TrueGold (TG) and Tempered TrueGold (TTG) stocks, and how many transformations you've already used (max 100).",
                "Two kinds of bonus: speed bonuses (Speed, Ground Works, KVK) divide the base time; Grey Wolf and Double Time then cut the remaining time (cumulative). Also set your speedups (days / hours / minutes).",
                "For each building, set its current level and the target level you want to reach.",
                "Uncheck the box next to a building to exclude it from the suggestions (in any mode): it stays frozen at its current level and still counts as a prerequisite for the others.",
                "Pick a mode: “Max KVK points” (best points value), “Max buildings” (upgrade as many as possible), or “Target score” (reach a specific score at the lowest cost).",
                "In “Target score” mode, type the score you aim for: the tool finds the cheapest combination (buildings + transformations + speedups) to reach it.",
                "Read the “Improvement Plan” top to bottom: steps are numbered in the order you should do them in game. A building coming back several times is normal — the Town Center and the Embassy/troop buildings unlock each other, tier after tier (the 🔓 note tells you which step gets unlocked).",
                "Click a step to unfold the level-by-level detail: TG and TTG cost, build time, speedups used and KVK points earned."
            ]
        }
    });
}

// ============ STARTUP ============
(async function startup() {
    await loadDatabase();
    loadData();
    normalizeBuildingOrder();
    await loadPanBonus();
    triggerUpdate();
    tgInitHelp();
    window.addEventListener('langChanged', triggerUpdate);
})();
