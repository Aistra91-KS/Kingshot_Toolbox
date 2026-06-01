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
        const saved = localStorage.getItem('tg_calc_data_v2');
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
        
        alert(errorMessage);
        return false;
    }
}

// ============ TRANSLATIONS ============
function applyTranslations() {
    const lang = GlobalLang.get();
    const dict = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
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
    const lang = GlobalLang.get();
    
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
    localStorage.setItem('tg_calc_data_v2', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('tg_calc_data_v2');
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
    
    const lang = GlobalLang.get();
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
        const nomBatiment = rangeDatabase[i][0];
        const niveau = Number(rangeDatabase[i][1]);
        const labelNiveau = rangeDatabase[i][2];
        const coutTG = Number(rangeDatabase[i][4]);
        const coutTTG = Number(rangeDatabase[i][5]);
        const tempsBaseMinutes = Number(rangeDatabase[i][11]);

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
                if (Number(rangeDataTTG[j][0]) === stepVise) {
                    coutTransfo = Number(rangeDataTTG[j][1]);
                    gainTransfo = Number(rangeDataTTG[j][2]);
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
            if (filesAttenteDisponibles === 0) break;

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
                        const tempsReelMinutes = Math.ceil(couts.tempsBase / (1 + Number(vitesseAmelio)));
                        const gainKVKRessources = (couts.tg * 2000) + (couts.ttg * 30000);
                        const minutesAAccelerer = Math.min(tempsReelMinutes, stockAccelSimule);
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

            // --- Tri selon le mode (KVK ou Quantité) ---
            if (modeKVK) {
                ameliorationsDisponibles.sort((a, b) => {
                    const aFini = (a.minutesAccelerables >= a.tempsReel) ? 1 : 0;
                    const bFini = (b.minutesAccelerables >= b.tempsReel) ? 1 : 0;
                    if (aFini !== bFini) return bFini - aFini;
                    return b.poidsKVK - a.poidsKVK;
                });
            } else {
                ameliorationsDisponibles.sort((a, b) => {
                    const aFini = (a.minutesAccelerables >= a.tempsReel) ? 1 : 0;
                    const bFini = (b.minutesAccelerables >= b.tempsReel) ? 1 : 0;
                    if (aFini !== bFini) return bFini - aFini;
                    return a.poidsCout - b.poidsCout;
                });
            }

            const meilleurChoix = ameliorationsDisponibles[0];

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
        }

        // --- Calcul des points KVK pour ce scénario ---
        const ptsRessources = (tgDepenseAmelio * 2000) + (ttgDepenseAmelio * 30000);
        const ptsAccel = accelMinutesUtilisees * 30;
        const pointsKVKTotal = ptsRessources + ptsAccel;

        // --- Comparaison avec le meilleur scénario actuel ---
        let enregistrerScenario = false;
        if (!meilleurScenario) {
            enregistrerScenario = true;
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
                pointsKVK: pointsKVKTotal
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
    const titreMode = modeKVK ? tx.optKVK : tx.optQty;
    const c_or = '#f5b840';
    const c_turquoise = '#4ecdc4';
    const c_rubis = '#e74c5c';

    let html = `<div style="line-height:1.7;">`;

    // Titre
    html += `<div style="text-align:center; margin-bottom:20px; padding:12px; background:rgba(245,184,64,0.08); border-radius:6px; border:1px solid ${c_or};">`;
    html += `<strong style="font-size:16px; color:${c_or};">${titreMode}</strong>`;
    html += `</div>`;

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
    await loadDatabase();    // 1. Charger le JSON
    loadData();              // 2. Charger les préférences utilisateur
    initTheme();             // 3. Init thème
    triggerUpdate();         // 4. Afficher
    window.addEventListener('langChanged', triggerUpdate);
})();
