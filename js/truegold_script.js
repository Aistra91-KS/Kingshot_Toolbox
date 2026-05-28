// ========================================
//  TRUEGOLD CALCULATOR - LOGIC
// ========================================

// Variables globales (remplies depuis le JSON)
let rangeDataTTG = [];
let dbDataRaw = [];
let levelsByBuilding = {};
let bldgMap = {};
let buildingsState = [];

// ============ I18N ============
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
        'totalMax': "🚀 Maximum total to obtain : ",
        'tgAnd': " TG and ",
        'ttgClose': " TTG.",
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
        'totalMax': "🚀 Total maximal à obtenir : ",
        'tgAnd': " TG et ",
        'ttgClose': " TTG.",
        'ptsEnd': "points"
    }
};

// ============ THEME ============
function initTheme() {
    const savedTheme = localStorage.getItem('tg_calc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('tg_calc_theme', target);
    updateThemeButton(target);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
        btn.textContent = '☀️ Light Mode';
    } else {
        btn.textContent = '🌙 Dark Mode';
    }
}

// ============ DATA LOADING ============
async function loadDatabase() {
    try {
        const response = await fetch('data/truegold_db.json');
        if (!response.ok) throw new Error('Failed to load JSON');
        const data = await response.json();
        
        rangeDataTTG = data.rangeDataTTG;
        dbDataRaw = data.dbDataRaw;
        levelsByBuilding = data.levelsByBuilding;
        bldgMap = data.bldgMap;
        
        // Si pas de buildings sauvegardés, on prend les defaults du JSON
        const saved = localStorage.getItem('tg_calc_data_v1');
        if (!saved) {
            buildingsState = JSON.parse(JSON.stringify(data.defaultBuildings));
        }
    } catch (e) {
        console.error('Erreur de chargement du JSON :', e);
        alert('Impossible de charger la base de données. Vérifiez que data/truegold_db.json existe et qu\'il est accessible via un serveur web (pas en local file://).');
    }
}

// ============ TRANSLATIONS ============
function applyTranslations() {
    const lang = document.getElementById('langue').value;
    const dict = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
}

function getLocName(enName) {
    const lang = document.getElementById('langue').value;
    return bldgMap[enName] ? bldgMap[enName][lang] : enName;
}

// ============ RENDER BUILDINGS ============
function renderBuildings() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    
    const emojis = {
        "Town Center": "🏛️", "Embassy": "🤝", "Infirmary": "🏥",
        "Command Center": "🎖️", "War Academy": "⚔️",
        "Barracks": "🛡️", "Stable": "🐎", "Range": "🏹"
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
            <td class="bldg-name"><span class="bldg-icon">${emojis[nom] || "🏢"}</span> ${getLocName(nom)}</td>
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

function updateAllRowCosts() {
    let speedBonus = parseFloat(document.getElementById('totalVitesseDisplay').textContent) / 100 || 0;
    const lang = document.getElementById('langue').value;
    
    let grandTotalTG = 0;
    let grandTotalTTG = 0;
    let grandTotalTimeMinutes = 0;

    buildingsState.forEach((b, index) => {
        let sumTG = 0;
        let sumTTG = 0;
        let sumTime = 0;
        
        dbDataRaw.forEach(row => {
            if (row[0] === b.name && row[1] > b.current && row[1] <= b.target) {
                sumTG += (parseInt(row[4]) || 0);
                sumTTG += (parseInt(row[5]) || 0);
                sumTime += (parseInt(row[11]) || 0);
            }
        });
        
        let realTimeMinutes = Math.ceil(sumTime / (1 + speedBonus));
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
        langue: document.getElementById('langue').value,
        baseVitesse: document.getElementById('baseVitesse').value,
        bonusGround: document.getElementById('bonusGround').checked,
        bonusKvk: document.getElementById('bonusKvk').checked,
        bonusWolfCheck: document.getElementById('bonusWolfCheck').checked,
        bonusWolfVal: document.getElementById('bonusWolfVal').value,
        bonusDouble: document.getElementById('bonusDouble').checked,
        stockTG: document.getElementById('stockTG').value,
        stockTTG: document.getElementById('stockTTG').value,
        transfoUtilisees: document.getElementById('transfoUtilisees').value,
        modeKVK: document.getElementById('modeKVK').checked,
        accelJours: document.getElementById('accelJours').value,
        accelHeures: document.getElementById('accelHeures').value,
        accelMinutes: document.getElementById('accelMinutes').value,
        buildings: buildingsState
    };
    localStorage.setItem('tg_calc_data_v1', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('tg_calc_data_v1');
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
            if (data.modeKVK !== undefined) document.getElementById('modeKVK').checked = data.modeKVK;
            if (data.accelJours !== undefined) document.getElementById('accelJours').value = data.accelJours;
            if (data.accelHeures !== undefined) document.getElementById('accelHeures').value = data.accelHeures;
            if (data.accelMinutes !== undefined) document.getElementById('accelMinutes').value = data.accelMinutes;
            if (data.buildings !== undefined) buildingsState = data.buildings;
        } catch(e) {
            console.error("Error loading data", e);
        }
    }
}

// ============ MAIN UPDATE ============
function triggerUpdate() {
    try {
        getTotalVitesse();
        applyTranslations();
        renderBuildings();
        runCalculator();
        saveData();
    } catch(e) {
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
    let modeKVK = document.getElementById('modeKVK').checked;
    
    const lang = document.getElementById('langue').value;
    let tx = i18n[lang];

    let formattedTableur = buildingsState.map(b => [b.name, "", "", "", b.current, b.target]);

    try {
        let resultText = SUGGERER_KINGSHOT(
            stockTG, stockTTG, transfoUtilisees, vitesseAmelio,
            accelJours, accelHeures, accelMinutes, modeKVK, tx,
            formattedTableur, dbDataRaw, rangeDataTTG, lang
        );
        document.getElementById('output').innerHTML = resultText;
    } catch(e) {
        document.getElementById('output').innerHTML = `<span style="color:var(--warning);">❌ Execution Error: ${e.message}</span>`;
    }
}

// ============ STRATEGIC OPTIMIZER ============
function SUGGERER_KINGSHOT(stockTG, stockTTG, transfoUtilisees, vitesseAmelio, accelJours, accelHeures, accelMinutes, modeKVK, tx, rangeTableur, rangeDatabase, rangeDataTTG, lang) {
    // ⚠️ Fonction temporairement désactivée (à déboguer)
    return `<div style="text-align:center; margin-top:20px; color:var(--text-muted);">Résultats désactivés temporairement pour corriger les bugs.</div>`;

    /* 
    ============================================================
    LOGIQUE COMPLÈTE DE L'OPTIMISEUR — À RÉACTIVER UNE FOIS DÉBUGGUÉE
    ============================================================
    
    Voici les étapes principales que cette fonction réalise :
    
    1. Parse les labels TG (ex: "TG5-3" → {major:5, minor:3})
    2. Calcule le stock total d'accélérateurs en minutes
    3. Construit une map de la base de données (db[batiment][niveau] = {tg, ttg, label, tempsBase})
    4. Pour chaque nombre de transformations possibles (0 à 100):
       - Simule les transformations TG→TTG
       - Cherche les améliorations possibles selon les prérequis TG
       - Trie selon le mode (KVK = max points, sinon = min coût)
       - Limite à 2 files d'attente
    5. Compare tous les scénarios et garde le meilleur
    6. Génère un rapport HTML détaillé
    
    Pour réactiver la logique, supprimez la ligne "return" ci-dessus
    et décommentez tout le bloc qui suivait dans votre code original.
    */
}

// ============ STARTUP ============
(async function startup() {
    await loadDatabase();    // 1. Charger le JSON
    loadData();              // 2. Charger les préférences utilisateur
    initTheme();             // 3. Init thème
    triggerUpdate();         // 4. Afficher
})();
