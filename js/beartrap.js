// ========================================
// BEAR TRAP OPTIMIZER - Logique & Langue
// ========================================

const i18nBearTrap = {
    FR: {
        titleParams: "Paramètres",
        lblLang: "Langue",
        grpTroops: "Mes Troupes (T10/T11...)",
        lblInf: "Infanterie 🛡️",
        lblArc: "Archers 🏹",
        lblCav: "Cavalerie 🐎",
        grpCap: "Ma Capacité",
        lblBase: "Capacité de base",
        lblExp: "Bonus Expert",
        lblAni: "Bonus Animal",
        lblMaxM: "Nb de marches max",
        grpOrg: "Organisation",
        lblRole: "Rôle",
        optPart: "Participant",
        optOrg: "Organisateur",
        lblGen: "Génération du serveur", // NOUVEAU
        lblLimit: "Plafond d'envoi",
        plcLimit: "Illimité", 
        grpOpt: "Mode d'optimisation",
        lblMode: "Mode",
        optMin: "Seuils Mini",
        optForm: "Formule (Bientôt)",
        lblMinInf: "Infanterie min (%)",
        lblMinCav: "Cavalerie min (%)",
        btnCalc: "Générer le reste des marches",
        planTitle: "Plan de déploiement",
        planDesc: "Préparez vos marches personnalisées puis générez automatiquement le reste de vos troupes.",
        errCap: "Votre capacité de marche doit être supérieure à 0.",
        noTroops: "Vous n'avez aucune troupe restante à déployer.",
        thMarch: "Marche",
        txtGen: "Marches générées automatiquement selon vos troupes restantes et vos héros.",
        btnAddCustom: "+ Nouvelle marche",
        modalTitle: "Marche Personnalisée",
        modalName: "Nom de la marche",
        plcName: "ex: Marche #1",
        optNum: "Nombres",
        optPerc: "Pourcentage (%)",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        errMaxMarches: "Vous avez atteint le nombre maximum de marches.",
        errExceedCap: "Cette marche dépasse votre capacité maximale !",
        errNoTroopsForCustom: "Vous n'avez pas assez de troupes globales pour créer cette marche."
    },
    EN: {
        titleParams: "Settings",
        lblLang: "Language",
        grpTroops: "My Troops (T10/T11...)",
        lblInf: "Infantry 🛡️",
        lblArc: "Lancers 🏹",
        lblCav: "Cavalry 🐎",
        grpCap: "My Capacity",
        lblBase: "Base Capacity",
        lblExp: "Expert Bonus",
        lblAni: "Animal Bonus",
        lblMaxM: "Max Marches",
        grpOrg: "Organization",
        lblRole: "Role",
        optPart: "Joiner",
        optOrg: "Rally Leader",
        lblGen: "Server Generation", // NOUVEAU
        lblLimit: "Sending Limit",
        plcLimit: "Unlimited",
        grpOpt: "Optimization Mode",
        lblMode: "Mode",
        optMin: "Minimum Thresholds",
        optForm: "Formula (Soon)",
        lblMinInf: "Min Infantry (%)",
        lblMinCav: "Min Cavalry (%)",
        btnCalc: "Generate remaining marches",
        planTitle: "Deployment Plan",
        planDesc: "Prepare your custom marches and let the tool generate the rest automatically.",
        errCap: "Your march capacity must be greater than 0.",
        noTroops: "You have no troops left to deploy.",
        thMarch: "March",
        txtGen: "Marches generated automatically based on your remaining troops and heroes.",
        btnAddCustom: "+ New March",
        modalTitle: "Custom March",
        modalName: "March Name",
        plcName: "e.g., March #1",
        optNum: "Numbers",
        optPerc: "Percentage (%)",
        btnCancel: "Cancel",
        btnSave: "Save",
        errMaxMarches: "You have reached the maximum number of marches.",
        errExceedCap: "This march exceeds your maximum capacity!",
        errNoTroopsForCustom: "You don't have enough global troops to create this march."
    }
};

let customMarchesList = [];
let editingMarchId = null;
let heroesDB = [];

// ========================================
// DONNÉES DES HÉROS (Tier Lists & Capacités)
// ========================================

const organizerTierList = {
    1: { inf: ["Amadeus", "Helga", "Howard"], cav: ["Jabel"], arc: ["Quinn"] },
    2: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    3: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    4: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    5: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    6: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin"] },
    7: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin"] }
};

const heroCapacityByLevel = {
    1: 65, 2: 140, 3: 220, 4: 305, 5: 400, 6: 500, 7: 605, 8: 720, 9: 840, 10: 970,
    11: 1100, 12: 1240, 13: 1390, 14: 1540, 15: 1700, 16: 1870, 17: 2040, 18: 2225, 19: 2410, 20: 2605,
    21: 2805, 22: 3010, 23: 3225, 24: 3445, 25: 3670, 26: 3905, 27: 4145, 28: 4390, 29: 4645, 30: 4905,
    31: 5175, 32: 5445, 33: 5715, 34: 6015, 35: 6310, 36: 6600, 37: 6895, 38: 7190, 39: 7480, 40: 7775,
    41: 8070, 42: 8365, 43: 8655, 44: 8950, 45: 9245, 46: 9540, 47: 9830, 48: 10125, 49: 10420, 50: 10685,
    51: 10925, 52: 11140, 53: 11340, 54: 11525, 55: 11700, 56: 11860, 57: 12010, 58: 12140, 59: 12260, 60: 12370,
    61: 12470, 62: 12560, 63: 12650, 64: 12730, 65: 12800, 66: 12870, 67: 12930, 68: 12980, 80: 13470
};

function getHeroCapacity(level) {
    if (level >= 80) return 13470;
    if (heroCapacityByLevel[level]) return heroCapacityByLevel[level];
    
    let closestLevel = 1;
    for (let key in heroCapacityByLevel) {
        if (key <= level && key > closestLevel) closestLevel = key;
    }
    return heroCapacityByLevel[closestLevel];
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    const lang = GlobalLang.get();
    GlobalLang.applyToSelect('site-lang');
    applyTranslations(lang);
    
    window.addEventListener('langChanged', (e) => {
        applyTranslations(e.detail.lang);
        calculateBearTrap(); 
    });

    // 1. Charge les Héros depuis la base de données
    try {
        const response = await fetch('data/heroes_db.json');
        if (response.ok) {
            heroesDB = await response.json();
            populateHeroDropdowns();
        }
    } catch (e) {
        console.error("Impossible de charger la DB des héros", e);
    }

    // 2. Initialisation des modules BearTrap
    loadBearTrapData();
    initEventListeners();
    initStudioModal();
    renderCustomMarches();
    updateStudioBadge();
    calculateBearTrap();
});

function applyTranslations(lang) {
    const dict = i18nBearTrap[lang] || i18nBearTrap.EN;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    
    const plcLimit = document.getElementById('march-limit');
    if (plcLimit) plcLimit.placeholder = dict.plcLimit;
    
    const plcName = document.getElementById('cm-name');
    if (plcName) plcName.placeholder = dict.plcName;
}

// ========================================
// GESTION DES DONNÉES (Sauvegarde)
// ========================================

function saveBearTrapData() {
    const data = {
        'total-inf': document.getElementById('total-inf').value,
        'total-arc': document.getElementById('total-arc').value,
        'total-cav': document.getElementById('total-cav').value,
        'cap-base': document.getElementById('cap-base').value,
        'cap-expert': document.getElementById('cap-expert').value,
        'cap-animal': document.getElementById('cap-animal').value,
        'max-marches': document.getElementById('max-marches').value,
        'march-limit': document.getElementById('march-limit').value,
        'player-role': document.getElementById('player-role').value,
        'optim-mode': document.getElementById('optim-mode').value,
        'server-generation': document.getElementById('server-generation').value,
        'min-inf-percent': document.getElementById('min-inf-percent').value,
        'min-cav-percent': document.getElementById('min-cav-percent').value,
        'custom-marches': customMarchesList
    };
    localStorage.setItem('beartrap_data', JSON.stringify(data));
}

function loadBearTrapData() {
    const saved = localStorage.getItem('beartrap_data');
    if (saved) {
        const data = JSON.parse(saved);
        ['total-inf', 'total-arc', 'total-cav', 'cap-base', 'cap-expert', 'cap-animal', 'max-marches', 'march-limit', 'player-role', 'optim-mode', 'server-generation', 'min-inf-percent', 'min-cav-percent'].forEach(id => {
            if (data[id] && document.getElementById(id)) document.getElementById(id).value = data[id];
        });
        if (data['custom-marches']) {
            customMarchesList = data['custom-marches'];
        }
    }
}

// ========================================
// ÉVÉNEMENTS GLOBAUX
// ========================================

function initEventListeners() {
    const inputs = document.querySelectorAll('.sidebar input, .sidebar select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            saveBearTrapData();
            calculateBearTrap();
        });
    });

    document.getElementById('btn-calculate').addEventListener('click', calculateBearTrap);

    // Formatage des nombres
    document.querySelectorAll('input.formatted-number').forEach(input => {
        input.addEventListener('input', function(e) {
            let val = this.value.replace(/[^0-9]/g, '');
            if (val !== '') {
                this.value = parseInt(val, 10).toLocaleString('fr-FR');
            }
        });
    });
}

function getRawNumber(id) {
    const el = document.getElementById(id);
    if (!el || !el.value) return 0;
    return parseInt(el.value.replace(/[^0-9]/g, ''), 10) || 0;
}

// ========================================
// MOTEUR DE SÉLECTION DES HÉROS
// ========================================

function populateHeroDropdowns() {
    const userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
    let optionsHTML = '<option value="">Aucun</option>';
    
    heroesDB.forEach(h => {
        if (userHeroes[h.id] && userHeroes[h.id].unlocked) {
            optionsHTML += `<option value="${h.id}">${h.name} (L.${userHeroes[h.id].level})</option>`;
        }
    });

    ['cm-hero-1', 'cm-hero-2', 'cm-hero-3'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) sel.innerHTML = optionsHTML;
    });
}

function selectHeroesForMarches(marchesCount, role, generation) {
    const userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
    const hasCaserneData = Object.keys(userHeroes).length > 0;
    let assignedMarches = [];

    // Si la caserne est vide, on renvoie des tableaux vides (aucune pénalité de malus appliquée aux marches auto)
    if (!hasCaserneData || heroesDB.length === 0) {
        for (let i = 0; i < marchesCount; i++) {
            assignedMarches.push({ heroes: [], missingHeroes: 0, penalty: 0 });
        }
        return assignedMarches;
    }

    // 1. Exclure les héros déjà utilisés manuellement
    let usedHeroIds = new Set();
    customMarchesList.forEach(m => {
        if (m.h1) usedHeroIds.add(m.h1);
        if (m.h2) usedHeroIds.add(m.h2);
        if (m.h3) usedHeroIds.add(m.h3);
    });

    // 2. Créer le pool de héros disponibles et calculer leur malus
    let pool = [];
    for (let id in userHeroes) {
        if (userHeroes[id].unlocked && !usedHeroIds.has(id)) {
            let dbHero = heroesDB.find(h => h.id === id);
            if (dbHero) {
                let lvl = userHeroes[id].level || 1;
                pool.push({
                    ...dbHero,
                    level: lvl,
                    penalty: 13470 - getHeroCapacity(lvl)
                });
            }
        }
    }

    let classes = {
        inf: pool.filter(h => h.troopType.toLowerCase() === 'infantry').sort((a, b) => b.level - a.level),
        cav: pool.filter(h => h.troopType.toLowerCase() === 'cavalry').sort((a, b) => b.level - a.level),
        arc: pool.filter(h => h.troopType.toLowerCase() === 'archer').sort((a, b) => b.level - a.level)
    };

    const getTierScore = (heroName, typeStr) => {
        let typeShort = typeStr.substring(0, 3).toLowerCase();
        let list = (organizerTierList[generation] || organizerTierList[6])[typeShort];
        let idx = list ? list.indexOf(heroName) : -1;
        return idx === -1 ? 999 : idx;
    };

    // 3. Constitution des équipes automatiques
    for (let i = 0; i < marchesCount; i++) {
        let team = [];

        if (role === 'organizer') {
            ['inf', 'cav', 'arc'].forEach(cls => {
                classes[cls].sort((a, b) => {
                    let scoreA = getTierScore(a.name, a.troopType);
                    let scoreB = getTierScore(b.name, b.troopType);
                    if (scoreA !== scoreB) return scoreA - scoreB;
                    return b.level - a.level;
                });
                if (classes[cls].length > 0) team.push(classes[cls].shift());
            });
            team.sort((a, b) => getTierScore(a.name, a.troopType) - getTierScore(b.name, b.troopType));

        } else { // Joiner
            let possibleCaptains = [];
            ['inf', 'cav', 'arc'].forEach(c => {
                let idx = classes[c].findIndex(h => h.goodJoinerBear);
                if (idx > -1) possibleCaptains.push({ cls: c, hero: classes[c][idx], index: idx });
            });

            let capClass = null;
            if (possibleCaptains.length > 0) {
                possibleCaptains.sort((a, b) => b.hero.level - a.hero.level);
                let bestCap = possibleCaptains[0];
                team.push(bestCap.hero);
                capClass = bestCap.cls;
                classes[bestCap.cls].splice(bestCap.index, 1);
            }

            ['inf', 'cav', 'arc'].forEach(c => {
                if (c !== capClass && classes[c].length > 0) {
                    team.push(classes[c].shift());
                } else if (c === capClass && !capClass && classes[c].length > 0) {
                    team.push(classes[c].shift());
                }
            });
        }

        let missingHeroes = 3 - team.length;
        let penalty = missingHeroes * 13470; 
        team.forEach(h => penalty += h.penalty);

        assignedMarches.push({ heroes: team, missingHeroes: missingHeroes, penalty: penalty });
    }
    return assignedMarches;
}


// ========================================
// STUDIO DE DÉPLOIEMENT (Marches perso)
// ========================================

function initStudioModal() {
    const modal = document.getElementById('custom-march-modal');
    const btnAdd = document.getElementById('btn-add-custom');
    const btnCancel = document.getElementById('btn-cancel-cm');
    const btnSave = document.getElementById('btn-save-cm');
    const cmInputs = document.querySelectorAll('#cm-inf, #cm-cav, #cm-arc');
    const cmRadios = document.querySelectorAll('input[name="cm-input-mode"]');

    // Écouteur pour la saisie
    cmInputs.forEach(input => {
        input.addEventListener('input', updateModalLiveStats);
    });

    // Écouteur pour le changement % / Nombres avec conversion
    cmRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const newMode = e.target.value;
            const maxCap = getCurrentMaxMarchCapacity();
            
            let valInf = getRawNumber('cm-inf');
            let valCav = getRawNumber('cm-cav');
            let valArc = getRawNumber('cm-arc');

            if (newMode === 'number') {
                document.getElementById('cm-inf').value = Math.floor(maxCap * (valInf / 100)).toLocaleString('fr-FR');
                document.getElementById('cm-cav').value = Math.floor(maxCap * (valCav / 100)).toLocaleString('fr-FR');
                document.getElementById('cm-arc').value = Math.floor(maxCap * (valArc / 100)).toLocaleString('fr-FR');
            } else {
                let pInf = maxCap > 0 ? Math.round((valInf / maxCap) * 100) : 0;
                let pCav = maxCap > 0 ? Math.round((valCav / maxCap) * 100) : 0;
                let pArc = maxCap > 0 ? Math.round((valArc / maxCap) * 100) : 0;
                
                document.getElementById('cm-inf').value = pInf;
                document.getElementById('cm-cav').value = pCav;
                document.getElementById('cm-arc').value = pArc;
            }
            updateModalLiveStats();
        });
    });

    btnAdd.addEventListener('click', () => {
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;
        if (customMarchesList.length >= getTotalMarchesAllowed()) {
            alert(dict.errMaxMarches);
            return;
        }
        
        editingMarchId = null;
        document.getElementById('cm-name').value = '';
        document.getElementById('cm-inf').value = '0';
        document.getElementById('cm-cav').value = '0';
        document.getElementById('cm-arc').value = '0';
        
        document.getElementById('cm-hero-1').value = "";
        document.getElementById('cm-hero-2').value = "";
        document.getElementById('cm-hero-3').value = "";

        document.querySelector('input[name="cm-input-mode"][value="percent"]').checked = true; 
        
        updateModalLiveStats();
        modal.classList.add('active');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
        editingMarchId = null;
    });

    btnSave.addEventListener('click', () => {
        const name = document.getElementById('cm-name').value || "Marche Spéciale";
        const mode = document.querySelector('input[name="cm-input-mode"]:checked').value;
        const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();
        const total = rawInf + rawCav + rawArc;
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

        if (total === 0) return; 

        if (isExceeding) {
            alert(dict.errExceedCap);
            return;
        }

        const { remInf, remCav, remArc } = getRemainingGlobalTroops();
        let currentEditingInf = 0, currentEditingCav = 0, currentEditingArc = 0;
        if (editingMarchId) {
            const march = customMarchesList.find(m => m.id === editingMarchId);
            if (march) {
                currentEditingInf = march.inf; currentEditingCav = march.cav; currentEditingArc = march.arc;
            }
        }

        if (rawInf > (remInf + currentEditingInf) || rawCav > (remCav + currentEditingCav) || rawArc > (remArc + currentEditingArc)) {
            alert(dict.errNoTroopsForCustom);
            return;
        }

        const h1 = document.getElementById('cm-hero-1').value;
        const h2 = document.getElementById('cm-hero-2').value;
        const h3 = document.getElementById('cm-hero-3').value;

        const newMarchData = {
            name: name,
            mode: mode,
            inf: rawInf,
            cav: rawCav,
            arc: rawArc,
            total: total,
            h1: h1, h2: h2, h3: h3
        };

        if (editingMarchId) {
            const index = customMarchesList.findIndex(m => m.id === editingMarchId);
            if (index > -1) {
                newMarchData.id = editingMarchId;
                customMarchesList[index] = newMarchData;
            }
        } else {
            newMarchData.id = Date.now();
            customMarchesList.push(newMarchData);
        }

        editingMarchId = null;
        saveBearTrapData();
        renderCustomMarches();
        updateStudioBadge();
        modal.classList.remove('active');
        calculateBearTrap(); 
    });
}

function getModalInputValues() {
    const mode = document.querySelector('input[name="cm-input-mode"]:checked').value;
    const maxCapacity = getCurrentMaxMarchCapacity();
    
    let rawInf = getRawNumber('cm-inf');
    let rawCav = getRawNumber('cm-cav');
    let rawArc = getRawNumber('cm-arc');

    if (mode === 'percent') {
        rawInf = Math.floor(maxCapacity * (rawInf / 100));
        rawCav = Math.floor(maxCapacity * (rawCav / 100));
        rawArc = Math.floor(maxCapacity * (rawArc / 100));
    }

    const total = rawInf + rawCav + rawArc;
    return { rawInf, rawCav, rawArc, isExceeding: total > maxCapacity };
}

function updateModalLiveStats() {
    const mode = document.querySelector('input[name="cm-input-mode"]:checked').value;
    const maxCapacity = getCurrentMaxMarchCapacity();
    const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();
    
    const total = rawInf + rawCav + rawArc;
    
    document.getElementById('cm-total-live').textContent = total.toLocaleString('fr-FR');
    document.getElementById('cm-cap-live').textContent = maxCapacity.toLocaleString('fr-FR');

    const errorEl = document.getElementById('cm-error');
    if (isExceeding) {
        document.getElementById('cm-total-live').style.color = '#e74c3c';
        errorEl.style.display = 'block';
    } else {
        document.getElementById('cm-total-live').style.color = 'var(--text-light)';
        errorEl.style.display = 'none';
    }

    if (mode === 'percent') {
        document.getElementById('cm-inf-conv').textContent = `(${rawInf.toLocaleString('fr-FR')})`;
        document.getElementById('cm-cav-conv').textContent = `(${rawCav.toLocaleString('fr-FR')})`;
        document.getElementById('cm-arc-conv').textContent = `(${rawArc.toLocaleString('fr-FR')})`;
    } else {
        let pInf = maxCapacity > 0 ? ((rawInf / maxCapacity) * 100).toFixed(1) : 0;
        let pCav = maxCapacity > 0 ? ((rawCav / maxCapacity) * 100).toFixed(1) : 0;
        let pArc = maxCapacity > 0 ? ((rawArc / maxCapacity) * 100).toFixed(1) : 0;
        
        document.getElementById('cm-inf-conv').textContent = `(${pInf}%)`;
        document.getElementById('cm-cav-conv').textContent = `(${pCav}%)`;
        document.getElementById('cm-arc-conv').textContent = `(${pArc}%)`;
    }
}

function renderCustomMarches() {
    const container = document.getElementById('custom-marches-list');
    container.innerHTML = '';

    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    if (theoreticalCapacity === 0) theoreticalCapacity = 1; 

    customMarchesList.forEach(march => {
        let pInf = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
        let pCav = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
        let pArc = Math.round((march.arc / theoreticalCapacity) * 100) || 0;

        const div = document.createElement('div');
        div.className = 'custom-march-card';
        div.innerHTML = `
            <div>
                <strong style="color: var(--accent); display: block; margin-bottom: 5px;">${march.name}</strong>
                <div class="custom-march-stats">
                    <div>Total: <span>${march.total.toLocaleString('fr-FR')}</span></div>
                    <div>🛡️ <span>${march.inf.toLocaleString('fr-FR')}</span> <span style="color: var(--text-muted); font-size: 0.85em; font-weight: normal;">(${pInf}%)</span></div>
                    <div>🐎 <span>${march.cav.toLocaleString('fr-FR')}</span> <span style="color: var(--text-muted); font-size: 0.85em; font-weight: normal;">(${pCav}%)</span></div>
                    <div>🏹 <span style="color: var(--accent);">${march.arc.toLocaleString('fr-FR')}</span> <span style="color: var(--accent); font-size: 0.85em; font-weight: normal; opacity: 0.8;">(${pArc}%)</span></div>
                </div>
            </div>
            <div class="march-actions">
                <button type="button" class="btn-edit" data-id="${march.id}">✏️</button>
                <button type="button" class="btn-delete" data-id="${march.id}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCustomMarch(parseInt(this.getAttribute('data-id'), 10));
        });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editCustomMarch(parseInt(this.getAttribute('data-id'), 10));
        });
    });
}

function deleteCustomMarch(id) {
    customMarchesList = customMarchesList.filter(m => m.id !== id);
    saveBearTrapData();
    renderCustomMarches();
    updateStudioBadge();
    calculateBearTrap();
}

function editCustomMarch(id) {
    const march = customMarchesList.find(m => m.id === id);
    if (!march) return;

    editingMarchId = id; 
    document.getElementById('cm-name').value = march.name;
    document.querySelector('input[name="cm-input-mode"][value="percent"]').checked = true;

    document.getElementById('cm-hero-1').value = march.h1 || "";
    document.getElementById('cm-hero-2').value = march.h2 || "";
    document.getElementById('cm-hero-3').value = march.h3 || "";

    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    if (theoreticalCapacity === 0) theoreticalCapacity = 1;

    document.getElementById('cm-inf').value = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
    document.getElementById('cm-cav').value = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
    document.getElementById('cm-arc').value = Math.round((march.arc / theoreticalCapacity) * 100) || 0;

    updateModalLiveStats();
    document.getElementById('custom-march-modal').classList.add('active');
}

function updateStudioBadge() {
    const badge = document.getElementById('studio-badge');
    badge.textContent = customMarchesList.length;
    badge.style.display = customMarchesList.length > 0 ? 'flex' : 'none';
}


// ========================================
// OUTILS DE CALCUL GLOBAUX
// ========================================

function getRemainingGlobalTroops() {
    const tInf = getRawNumber('total-inf');
    const tCav = getRawNumber('total-cav');
    const tArc = getRawNumber('total-arc');

    let usedInf = 0, usedCav = 0, usedArc = 0;
    customMarchesList.forEach(m => {
        usedInf += m.inf; usedCav += m.cav; usedArc += m.arc;
    });

    return {
        remInf: tInf - usedInf,
        remCav: tCav - usedCav,
        remArc: tArc - usedArc
    };
}

function getCurrentMaxMarchCapacity() {
    return getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
}

function getTotalMarchesAllowed() {
    return getRawNumber('max-marches') || 1;
}

// ========================================
// CALCULATEUR PRINCIPAL BEAR TRAP
// ========================================

function calculateBearTrap() {
    const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

    let { remInf, remCav, remArc } = getRemainingGlobalTroops();
    let availableInf = Math.max(0, remInf);
    let availableCav = Math.max(0, remCav);
    let availableArc = Math.max(0, remArc);

    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    let maxMarchCapacity = getCurrentMaxMarchCapacity();

    if (maxMarchCapacity <= 0) {
        alert(dict.errCap);
        return;
    }

    let marchesCount = getTotalMarchesAllowed() - customMarchesList.length;
    let marches = [];
    
    if (availableInf + availableArc + availableCav === 0 || marchesCount <= 0) {
        displayResults([], maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
        return;
    }

    const minInfPercent = getRawNumber('min-inf-percent');
    const minCavPercent = getRawNumber('min-cav-percent');
    const role = document.getElementById('player-role').value;
    const generation = document.getElementById('server-generation').value;

    // Attribution automatique des héros
    let heroAssignments = selectHeroesForMarches(marchesCount, role, generation);

    let startId = customMarchesList.length + 1;
    
    for (let i = 0; i < marchesCount; i++) {
        let assignment = heroAssignments[i];
        let currentMarchCap = Math.max(0, maxMarchCapacity - assignment.penalty);
        let marchesLeft = marchesCount - i;

        let fairInf = Math.floor(availableInf / marchesLeft);
        let fairArc = Math.floor(availableArc / marchesLeft);
        let fairCav = Math.floor(availableCav / marchesLeft);

        let targetInf = Math.floor(currentMarchCap * (minInfPercent / 100));
        let targetCav = Math.floor(currentMarchCap * (minCavPercent / 100));

        let mInf = Math.min(targetInf, fairInf, availableInf);
        let mCav = Math.min(targetCav, fairCav, availableCav);
        
        let remainingSpace = currentMarchCap - mInf - mCav;

        let mArc = Math.min(remainingSpace, fairArc, availableArc);
        remainingSpace -= mArc;

        if (remainingSpace > 0) {
            let addCav = Math.min(remainingSpace, availableCav - mCav);
            mCav += addCav;
            remainingSpace -= addCav;
        }

        if (remainingSpace > 0) {
            let addInf = Math.min(remainingSpace, availableInf - mInf);
            mInf += addInf;
            remainingSpace -= addInf;
        }

        if (remainingSpace > 0) {
            let addArc = Math.min(remainingSpace, availableArc - mArc);
            mArc += addArc;
            remainingSpace -= addArc;
        }

        let mTotal = mInf + mArc + mCav;

        availableInf -= mInf;
        availableCav -= mCav;
        availableArc -= mArc;

        marches.push({ 
            id: startId + i, 
            inf: mInf, 
            arc: mArc, 
            cav: mCav, 
            total: mTotal,
            capacity: currentMarchCap,
            heroes: assignment.heroes,
            missingHeroes: assignment.missingHeroes
        });
    }

    displayResults(marches, maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
}

function displayResults(marches, capExemple, marchesCount, theoreticalCapacity, dict) {
    const resultsDiv = document.getElementById('results');
    
    if (marchesCount <= 0 && customMarchesList.length > 0) {
        resultsDiv.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--accent); font-weight: bold;">
            Toutes vos marches sont personnalisées dans le Studio de Déploiement.
        </div>`;
        return;
    }

    if (marches.length === 0) {
        resultsDiv.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted);">
            ${dict.noTroops}
        </div>`;
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th style="text-align: left;">${dict.thMarch}</th>
                    <th style="text-align: right;">Capacité Nette</th>
                    <th style="text-align: right;">${dict.lblInf}</th>
                    <th style="text-align: right;">${dict.lblCav}</th>
                    <th style="text-align: right; color: var(--accent);">${dict.lblArc}</th>
                    <th style="text-align: right; background: rgba(245, 184, 64, 0.1);">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    marches.forEach(march => {
        let pInf = Math.round((march.inf / march.capacity) * 100) || 0;
        let pCav = Math.round((march.cav / march.capacity) * 100) || 0;
        let pArc = Math.round((march.arc / march.capacity) * 100) || 0;

        let fMaxCap = march.capacity.toLocaleString('fr-FR');
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');

        let rowStyle = march.total < march.capacity ? 'color: var(--text-muted);' : '';
        
        const badgeStyle = "display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";
        const badgeStyleArc = "display: inline-block; background: rgba(245, 184, 64, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";

        let heroInfo = "";
        if (march.heroes && march.heroes.length > 0) {
            heroInfo = "<div style='font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; gap: 5px; flex-wrap: wrap;'>";
            march.heroes.forEach((h, idx) => {
                let roleIcon = idx === 0 ? "👑 " : ""; 
                heroInfo += `<span style="background: rgba(255,255,255,0.05); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">${roleIcon}${h.name} <span style="opacity:0.6">(L.${h.level})</span></span>`;
            });
            if (march.missingHeroes > 0) {
                heroInfo += `<span style="color: #e74c5c; border: 1px solid rgba(231, 76, 92, 0.3); padding: 3px 6px; border-radius: 4px;">⚠️ -${march.missingHeroes} héros</span>`;
            }
            heroInfo += "</div>";
        }

        html += `
            <tr style="${rowStyle}">
                <td style="padding: 10px; border-bottom: 1px solid var(--control-bg);">
                    <strong>${dict.thMarch} ${march.id}</strong>
                    ${heroInfo}
                </td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--text-muted); vertical-align: top;">${fMaxCap}</td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); vertical-align: top;">${fInf} <span style="${badgeStyle}">${pInf}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); vertical-align: top;">${fCav} <span style="${badgeStyle}">${pCav}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--accent); vertical-align: top;">${fArc} <span style="${badgeStyleArc}">${pArc}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); background: rgba(245, 184, 64, 0.05); vertical-align: top;"><strong>${fTotal}</strong></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div style="margin-top: 15px; font-size: 13px; color: var(--text-muted);">
            ${dict.txtGen} <strong>${marchesCount}</strong>
        </div>
    `;

    resultsDiv.innerHTML = html;
}
