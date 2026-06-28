// ========================================
//  TRUEGOLD CALCULATOR - LOGIC
// ========================================

// Variables globales (remplies depuis le JSON)
let rangeDataTTG = [];
let dbDataRaw = [];
let levelsByBuilding = {};
let bldgMap = {};
let buildingsState = [];

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
        'totalBonus': 'Total Bonus',
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
        'plan': "🏗️ Improvement Plan:",
        'step': " ➡️ step ",
        'inProgress': "(Left in construction)",
        'completed': "(Completed)",
        'costCum': "Cumulated cost:",
        'timeMgt': "⚡ Time Management:",
        'timeCons': "Speedups time consumed: ",
        'bilan': "📊 KVK Breakdown:",
        'tgUsed': " TG used =",
        'ttgUsed': " TTG used =",
        'pts': " KVK points",
        'accelUsed': " speedups used =",
        'totalMax': "🚀 Maximum total to obtain : ",
        'tgAnd': " TG and ",
        'ttgClose': " TTG.",
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
        'totalBonus': 'Bonus Total',
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
        'plan': "🏗️ Plan d'Amélioration :",
        'step': " ➡️ étape ",
        'inProgress': "(Laissé en construction)",
        'completed': "(Terminé)",
        'costCum': "Coût cumulé :",
        'timeMgt': "⚡ Gestion du Temps :",
        'timeCons': "Temps d'accélérateurs consommé : ",
        'bilan': "📊 Bilan KVK :",
        'tgUsed': " TG utilisés = ",
        'ttgUsed': " TTG utilisés = ",
        'pts': " points KVK",
        'accelUsed': " d'accélérateurs utilisés = ",
        'totalMax': "🚀 Total maximal à obtenir : ",
        'tgAnd': " TG et ",
        'ttgClose': " TTG.",
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
        rangeDataTTG     = data.rangeDataTTG;
        dbDataRaw        = data.dbDataRaw;
        levelsByBuilding = buildLevelsByBuilding(data.levelsReference, data.buildingsConfig); // Générer levelsByBuilding dynamiquement à partir de la référence
        bldgMap          = data.bldgMap;
        
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

// ============ RENDER BUILDINGS ============
function renderBuildings() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    
    const emojis = {
        "Town Center": iconSvg('landmark',16), "Embassy": iconSvg('handshake',16), "Infirmary": iconSvg('heart-pulse',16),
        "Command Center": iconSvg('star',16), "War Academy": iconSvg('swords',16),
        "Barracks": iconSvg('shield',16), "Stable": '<svg class="ic" width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.42 11.256a.97.97 0 0 1 .92-.662h7.321c.417 0 .787.267.92.662l.747 2.244H1.672z"/><path d="M3.572 10.594c.158-.83 1.306-1.783 2.117-2.418c1.945-1.522 1.765-2.824 1.447-3.177L5.193 6.11a1.23 1.23 0 0 1-1.437-.154v0a1.23 1.23 0 0 1-.237-1.543L4.983 1.93L4.42.658c.93-.33 3.501-.155 4.518.635c1.27.989 2.894 2.489 1.553 9.3"/><path d="M7.773 3.971a1.9 1.9 0 0 1-.631 1.03"/></svg>', "Range": iconSvg('target',16)
    };

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
            <td class="bldg-name"><span class="bldg-icon">${emojis[nom] || iconSvg('building-2',16)}</span> ${getLocName(nom)}</td>
            <td><select class="table-select" onchange="updateBuildingLvl(${index}, this.value, 'current')">${curOptions}</select></td>
            <td><select class="table-select" onchange="updateBuildingLvl(${index}, this.value, 'target')">${tgtOptions}</select></td>
            <td id="tg-cost-${index}">0</td>
            <td id="ttg-cost-${index}">0</td>
            <td id="time-cost-${index}" style="font-size:13px;">0</td>
        `;
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
    let speedBonus = parseFloat(document.getElementById('totalVitesseDisplay').textContent) / 100 || 0;
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
                realTimeMinutes += Math.max(0, Math.ceil(lvlTime / (1 + speedBonus)) - panRedMin);
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

function formatMinutesShort(minutes, isEN) {
    let j = Math.floor(minutes / 1440);
    let h = Math.floor((minutes % 1440) / 60);
    let m = minutes % 60;
    let res = [];
    let dayChar = isEN ? "d" : "j";
    if (j > 0) res.push(j + dayChar);
    if (h > 0) res.push(h + "h");
    if (m > 0 || res.length === 0) res.push(m + "m");
    return res.join(" ");
}

// ============ BONUS CALCULATION ============
function getTotalVitesse() {
    let base = parseFloat(document.getElementById('baseVitesse').value) || 0;
    let elTransfo = document.getElementById('transfoUtilisees');
    if (elTransfo.value > 100) elTransfo.value = 100;
    if (elTransfo.value < 0) elTransfo.value = 0;

    let total = base;
    if (document.getElementById('bonusGround').checked) total += 10;
    if (document.getElementById('bonusKvk').checked) total += 5;
    if (document.getElementById('bonusDouble').checked) total += 20;
    if (document.getElementById('bonusWolfCheck').checked) {
        total += parseFloat(document.getElementById('bonusWolfVal').value) || 0;
    }
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
            if (data.langue !== undefined) document.getElementById('langue').value = data.langue;
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

    let formattedTableur = buildingsState.map(b => [b.name, "", "", "", b.current, b.target]);

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
function SUGGERER_KINGSHOT(stockTG, stockTTG, transfoUtilisees, vitesseAmelio, accelJours, accelHeures, accelMinutes, mode, scoreCible, tx, rangeTableur, rangeDatabase, rangeDataTTG, lang) {
    const modeKVK = (mode === 'kvk');
    const modeTarget = (mode === 'target');
    scoreCible = Math.max(0, Number(scoreCible) || 0);
    const panReductionMin = getPanReductionMinutes();

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
                tempsBase: isNaN(tempsBaseMinutes) ? 0 : tempsBaseMinutes
            };
        }
    }

    // État initial des bâtiments
    const batimentsInitiaux = [];
    for (let i = 0; i < rangeTableur.length; i++) {
        const nom = rangeTableur[i][0];
        const niveauActuel = Number(rangeTableur[i][4]);

        if (nom && !isNaN(niveauActuel) && db[nom]) {
            batimentsInitiaux.push({ nom: nom, lvl: niveauActuel, enCours: false });
        }
    }

    // ============ SIMULATION : TROUVER LE MEILLEUR SCÉNARIO ============
    let meilleurScenario = null;

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

        // --- Simulation des améliorations de bâtiments ---
        const etatBatiments = JSON.parse(JSON.stringify(batimentsInitiaux));
        const ameliorationsFaites = [];
        let tgDepenseAmelio = 0;
        let ttgDepenseAmelio = 0;
        let accelMinutesUtilisees = 0;
        let stockAccelSimule = stockAccelMinutesTotal;
        let filesAttenteDisponibles = 2;

        while (true) {
            if (filesAttenteDisponibles === 0) {
                if (!modeTarget) break;
                // Mode cible : files pleines. Cible déjà atteinte ? -> stop.
                const ptsCourantsQ = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000) + (accelMinutesUtilisees * 30);
                if (ptsCourantsQ >= scoreCible) break;
                // Pas encore atteint : finir le bâtiment le moins coûteux en accél pour libérer un slot.
                const finissables = ameliorationsFaites.filter(a => a.estEnCours && a.tempsReel <= stockAccelSimule);
                if (finissables.length === 0) break;
                finissables.sort((a, b) => a.tempsReel - b.tempsReel);
                const aFinir = finissables[0];
                stockAccelSimule -= aFinir.tempsReel;
                accelMinutesUtilisees += aFinir.tempsReel;
                aFinir.minutesAccelerables = aFinir.tempsReel;
                aFinir.estEnCours = false;
                etatBatiments[aFinir.index].enCours = false;
                filesAttenteDisponibles++;
                continue;
            }

            const ameliorationsDisponibles = [];

            // Récupération des niveaux effectifs du Town Center et de l'Embassy
            const tcState = etatBatiments.find(b => b.nom.replace(/\s/g, '').toLowerCase() === "towncenter");
            const embState = etatBatiments.find(b => b.nom.replace(/\s/g, '').toLowerCase() === "embassy");

            const tcEffectiveLvl = tcState ? (tcState.enCours ? tcState.lvl - 1 : tcState.lvl) : null;
            const embEffectiveLvl = embState ? (embState.enCours ? embState.lvl - 1 : embState.lvl) : null;

            const tcLabel = (tcEffectiveLvl && tcState && db[tcState.nom] && db[tcState.nom][tcEffectiveLvl]) ? db[tcState.nom][tcEffectiveLvl].label : "";
            const embLabel = (embEffectiveLvl && embState && db[embState.nom] && db[embState.nom][embEffectiveLvl]) ? db[embState.nom][embEffectiveLvl].label : "";

            const tcTG = parseTG(tcLabel);
            const embTG = parseTG(embLabel);

            // --- Recherche des améliorations possibles ---
            for (let b = 0; b < etatBatiments.length; b++) {
                const bState = etatBatiments[b];
                if (bState.enCours) continue;

                const nomClean = bState.nom.replace(/\s/g, '').toLowerCase();
                const niveauCible = bState.lvl + 1;

                if (db[bState.nom] && db[bState.nom][niveauCible]) {
                    const couts = db[bState.nom][niveauCible];
                    const targetTG = parseTG(couts.label);
                    let estValide = true;

                    // Vérification des prérequis TG
                    if (targetTG.isTG) {
                        if (nomClean !== "towncenter") {
                            if (targetTG.major > tcTG.major || (targetTG.major === tcTG.major && targetTG.minor > 0)) {
                                estValide = false;
                            }
                        }
                        if (nomClean === "commandcenter") {
                            if (targetTG.major > embTG.major || (targetTG.major === embTG.major && targetTG.minor > embTG.minor)) {
                                estValide = false;
                            }
                        }
                        if (nomClean === "towncenter" && targetTG.minor === 0) {
                            if (embTG.major < targetTG.major - 1) {
                                estValide = false;
                            }
                        }
                    }

                    if (estValide && tgActuel >= couts.tg && ttgActuel >= couts.ttg) {
                        const tempsReelMinutes = Math.max(0, Math.ceil(couts.tempsBase / (1 + Number(vitesseAmelio))) - panReductionMin);
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
                            poidsKVK: gainKVKRessources + gainKVKAccel,
                            poidsCout: couts.tg + (couts.ttg * 15)
                        });
                    }
                }
            }

            if (ameliorationsDisponibles.length === 0) break;

            // --- Choix de l'amélioration selon le mode ---
            let meilleurChoix;
            if (modeTarget) {
                // Mode Score cible : tri par valeur RESSOURCE pure (poidsKVK = TG*2000 + TTG*30000, sans accél).
                // Franchisseur = un bâtiment dont les ressources seules franchissent le manque restant.
                const ptsCourants = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000) + (accelMinutesUtilisees * 30);
                const ecart = scoreCible - ptsCourants;
                const franchisseurs = ameliorationsDisponibles.filter(a => a.poidsKVK >= ecart);
                if (franchisseurs.length > 0) {
                    // Plus petit franchisseur → dépassement minimal en ressources.
                    franchisseurs.sort((a, b) => a.poidsKVK - b.poidsKVK);
                    meilleurChoix = franchisseurs[0];
                } else {
                    // Encore loin : plus gros apport en ressources d'abord (pas de tri finissable).
                    ameliorationsDisponibles.sort((a, b) => b.poidsKVK - a.poidsKVK);
                    meilleurChoix = ameliorationsDisponibles[0];
                }
            } else if (modeKVK) {
                ameliorationsDisponibles.sort((a, b) => {
                    const aFini = (a.minutesAccelerables >= a.tempsReel) ? 1 : 0;
                    const bFini = (b.minutesAccelerables >= b.tempsReel) ? 1 : 0;
                    if (aFini !== bFini) return bFini - aFini;
                    return b.poidsKVK - a.poidsKVK;
                });
                meilleurChoix = ameliorationsDisponibles[0];
            } else {
                ameliorationsDisponibles.sort((a, b) => {
                    const aFini = (a.minutesAccelerables >= a.tempsReel) ? 1 : 0;
                    const bFini = (b.minutesAccelerables >= b.tempsReel) ? 1 : 0;
                    if (aFini !== bFini) return bFini - aFini;
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

            // Mode Score cible : on s'arrête dès que le score est franchi (dépassement minimal)
            if (modeTarget) {
                const ptsCourants = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000) + (accelMinutesUtilisees * 30);
                if (ptsCourants >= scoreCible) break;
            }
        }

        // --- Mode cible : combler un éventuel petit manque avec un minimum d'accélérateurs ---
        if (modeTarget && ameliorationsFaites.length > 0) {
            const ptsApresGreedy = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000) + (accelMinutesUtilisees * 30);
            if (ptsApresGreedy < scoreCible && stockAccelSimule > 0) {
                const minutesManquantes = Math.ceil((scoreCible - ptsApresGreedy) / 30);
                const enCours = ameliorationsFaites.filter(a => a.estEnCours && a.minutesAccelerables < a.tempsReel);
                if (enCours.length > 0) {
                    const build = enCours[0];
                    const maxAjout = Math.min(minutesManquantes, stockAccelSimule, build.tempsReel - build.minutesAccelerables);
                    if (maxAjout > 0) {
                        build.minutesAccelerables += maxAjout;
                        accelMinutesUtilisees += maxAjout;
                        stockAccelSimule -= maxAjout;
                        if (build.minutesAccelerables >= build.tempsReel) {
                            build.estEnCours = false;
                            etatBatiments[build.index].enCours = false;
                        }
                    }
                }
            }
        }

        // --- Calcul des points KVK pour ce scénario ---
        const ptsRessources = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000);
        const ptsAccel = accelMinutesUtilisees * 30;
        const pointsKVKTotal = ptsRessources + ptsAccel;
        const cibleAtteinte = modeTarget && (pointsKVKTotal >= scoreCible);
        const coutRessourcesTGeq = (stockTG - tgActuel) + (stockTTG - ttgActuel) * 15;

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

    // ============ GROUPEMENT DES AMÉLIORATIONS PAR BÂTIMENT ============
    const batimentsGroupes = {};
    for (let i = 0; i < meilleurScenario.ameliorations.length; i++) {
        const amelio = meilleurScenario.ameliorations[i];
        if (!batimentsGroupes[amelio.nom]) {
            batimentsGroupes[amelio.nom] = { labelFinal: "", totalTG: 0, totalTTG: 0, totalTempsReel: 0, estEnCours: false };
        }
        batimentsGroupes[amelio.nom].labelFinal = amelio.labelCible;
        batimentsGroupes[amelio.nom].totalTG += amelio.tg;
        batimentsGroupes[amelio.nom].totalTTG += amelio.ttg;
        batimentsGroupes[amelio.nom].totalTempsReel += amelio.tempsReel;
        batimentsGroupes[amelio.nom].estEnCours = amelio.estEnCours;
    }

    // Tri : terminés en premier, en cours en dernier
    const listeAffichage = [];
    for (const [nomBatiment, data] of Object.entries(batimentsGroupes)) {
        listeAffichage.push({ nom: nomBatiment, data: data });
    }
    listeAffichage.sort((a, b) => {
        if (a.data.estEnCours === b.data.estEnCours) return 0;
        return a.data.estEnCours ? 1 : -1;
    });

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

    // Plan d'amélioration
    html += `<div style="margin-bottom:15px;">`;
    html += `<div style="font-size:15px; font-weight:bold; margin-bottom:6px;">${tx.plan}</div>`;
    for (let i = 0; i < listeAffichage.length; i++) {
        const nom = listeAffichage[i].nom;
        const data = listeAffichage[i].data;
        const statutColor = data.estEnCours ? c_rubis : c_turquoise;
        const statut = data.estEnCours ? tx.inProgress : tx.completed;
        const nomLoc = (typeof getLocName === 'function') ? getLocName(nom) : nom;
        html += `<div style="padding-left:24px; margin-bottom:4px;">`;
        html += `• <strong>${nomLoc}</strong>${tx.step}<strong style="color:${c_or};">${data.labelFinal}</strong> `;
        html += `<span style="color:${statutColor}; font-weight:bold;">${statut}</span> `;
        html += `<span style="color:var(--text-muted); font-size:13px;">${tx.costCum}<strong>${fmt(data.totalTG)}</strong>${tx.tgAnd}<strong>${fmt(data.totalTTG)}</strong>${tx.ttgClose}</span>`;
        html += `</div>`;
    }
    html += `</div>`;

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

// ============ STARTUP ============
(async function startup() {
    await loadDatabase();
    loadData();
    await loadPanBonus();
    triggerUpdate();
    window.addEventListener('langChanged', triggerUpdate);
})();
