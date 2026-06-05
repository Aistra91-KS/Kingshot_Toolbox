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
        thCap: "Capacité Config",
        thTotal: "Total",
        txtGen: "Nombre de marches auto générées :",
        txtRef: "Capacité théorique de référence (pour vos %) :",
        studioTitle: "Marches Personnalisées",
        btnAddCustom: "+ Créer une marche",
        modalTitle: "Nouvelle Marche",
        modalName: "Nom",
        modalCap: "Capacité :",
        optNum: "Nombres",
        optPerc: "Pourcentage (%)",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        errMaxMarches: "Vous avez atteint votre nombre maximum de marches.",
        errNoTroopsForCustom: "Pas assez de troupes disponibles pour cette configuration !",
        lblGen: "Génération du serveur",
        errExceedCap: "Capacité dépassée (Max 100% ou limite de marche) !"
    },
    EN: {
        titleParams: "Settings",
        lblLang: "Language",
        grpTroops: "My Troops (T10/T11...)",
        lblInf: "Infantry 🛡️",
        lblArc: "Archers 🏹",
        lblCav: "Cavalry 🐎",
        grpCap: "My Capacity",
        lblBase: "Base Capacity",
        lblExp: "Expert Bonus",
        lblAni: "Animal Bonus",
        lblMaxM: "Max Marches",
        grpOrg: "Organization",
        lblRole: "Role",
        optPart: "Participant",
        optOrg: "Organizer",
        lblLimit: "Send Cap",
        plcLimit: "Unlimited", 
        grpOpt: "Optimization Mode",
        lblMode: "Mode",
        optMin: "Min Thresholds",
        optForm: "Formula (Soon)",
        lblMinInf: "Min Infantry (%)",
        lblMinCav: "Min Cavalry (%)",
        btnCalc: "Generate remaining marches",
        planTitle: "Deployment Plan",
        planDesc: "Prepare your custom marches then automatically generate the rest of your troops.",
        errCap: "Your march capacity must be greater than 0.",
        noTroops: "You have no remaining troops to deploy.",
        thMarch: "March",
        thCap: "Config Capacity",
        thTotal: "Total",
        txtGen: "Number of auto marches generated:",
        txtRef: "Theoretical reference capacity (for your %):",
        studioTitle: "Custom Marches",
        btnAddCustom: "+ Create a march",
        modalTitle: "New March",
        modalName: "Name",
        modalCap: "Capacity:",
        optNum: "Numbers",
        optPerc: "Percentage (%)",
        btnCancel: "Cancel",
        btnSave: "Save",
        errMaxMarches: "You have reached your maximum number of marches.",
        errNoTroopsForCustom: "Not enough troops available for this configuration!",
        lblGen: "Server Generation",
        errExceedCap: "Capacity exceeded (Max 100% or march limit)!"
    }
};

let customMarchesList = [];
let editingMarchId = null; // Permet de savoir si on modifie ou si on crée
let heroesDB = [];

// ========================================
// DONNÉES DES HÉROS (Tier Lists & Capacités)
// ========================================

// Classement des meilleurs héros Lead par Génération
const organizerTierList = {
    1: { inf: ["Amadeus", "Helga", "Howard"], cav: ["Jabel"], arc: ["Quinn"] },
    2: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    3: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    4: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    5: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    6: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin"] },
    7: { inf: ["Amadeus", "Helga", "Zoe"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin"] }
};

// Capacité de marche apportée par un héros selon son niveau
const heroCapacityByLevel = {
    1: 65, 2: 140, 3: 220, 4: 305, 5: 400, 6: 500, 7: 605, 8: 720, 9: 840, 10: 970,
    11: 1100, 12: 1240, 13: 1390, 14: 1540, 15: 1700, 16: 1870, 17: 2040, 18: 2225, 19: 2410, 20: 2605,
    21: 2805, 22: 3010, 23: 3225, 24: 3445, 25: 3670, 26: 3905, 27: 4145, 28: 4390, 29: 4645, 30: 4905,
    31: 5175, 32: 5445, 33: 5715, 34: 6015, 35: 6310, 36: 6600, 37: 6895, 38: 7190, 39: 7480, 40: 7775,
    41: 8070, 42: 8365, 43: 8655, 44: 8950, 45: 9245, 46: 9540, 47: 9830, 48: 10125, 49: 10420, 50: 10685,
    51: 10925, 52: 11140, 53: 11340, 54: 11525, 55: 11700, 56: 11860, 57: 12010, 58: 12140, 59: 12260, 60: 12370,
    61: 12470, 62: 12560, 63: 12650, 64: 12730, 65: 12800, 66: 12870, 67: 12930, 68: 12980, 80: 13470
};

// Fonction utilitaire pour obtenir la capacité exacte (avec sécurité si un niveau manque)
function getHeroCapacity(level) {
    if (level >= 80) return 13470;
    if (heroCapacityByLevel[level]) return heroCapacityByLevel[level];
    
    // Si le niveau (ex: 75) n'est pas dans le dico, on prend le plus proche en dessous (ex: 68)
    let closestLevel = 1;
    for (let key in heroCapacityByLevel) {
        if (key <= level && key > closestLevel) closestLevel = key;
    }
    return heroCapacityByLevel[closestLevel];
}

document.addEventListener('DOMContentLoaded', async () => {
    // ... (garde ton code existant) ...
    applyTranslations(GlobalLang.get());
    
    // NOUVEAU : On charge la DB des héros pour pouvoir croiser les infos
    try {
        const response = await fetch('data/heroes_db.json');
        if (response.ok) heroesDB = await response.json();
    } catch (e) {
        console.error("Impossible de charger la DB des héros", e);
    }
    window.addEventListener('langChanged', (e) => {
        applyTranslations(e.detail.lang);
        renderCustomMarches();
        calculateBearTrap(); 
    });

    const numberInputs = document.querySelectorAll('.formatted-number');
    numberInputs.forEach(input => {
        input.addEventListener('input', formatInputNumber);
        if (!input.id.startsWith('cm-')) {
            input.addEventListener('change', () => {
                saveBearTrapData();
                updateStudioBadge();
            });
        }
    });

    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) btnCalculate.addEventListener('click', () => { saveBearTrapData(); calculateBearTrap(); });

    document.getElementById('player-role').addEventListener('change', () => { saveBearTrapData(); updateStudioBadge(); });
    document.getElementById('optim-mode').addEventListener('change', saveBearTrapData);

    initStudioModal();
    loadBearTrapData();
    updateStudioBadge();
    
    if (getRawNumber('troop-inf') > 0 || getRawNumber('troop-arc') > 0 || getRawNumber('troop-cav') > 0) {
        calculateBearTrap();
    }
});

// ========================================
// CALCUL DE LA CAPACITÉ ACTUELLE
// ========================================
function getCurrentMaxMarchCapacity() {
    const capBase = getRawNumber('cap-base');
    const capExpert = getRawNumber('cap-expert');
    const capAnimal = getRawNumber('cap-animal');
    const limitStr = document.getElementById('alliance-limit').value;
    const allianceLimit = limitStr ? getRawNumber('alliance-limit') : Infinity;
    return Math.min(capBase + capExpert + capAnimal, allianceLimit);
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

    // Écouteurs pour le rafraichissement EN DIRECT
    cmInputs.forEach(input => {
        input.addEventListener('input', updateModalLiveStats);
    });

    // Écouteur pour le changement % / Nombres avec CONVERSION INTELLIGENTE
    cmRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const newMode = e.target.value;
            const maxCap = getCurrentMaxMarchCapacity();
            
            let valInf = getRawNumber('cm-inf');
            let valCav = getRawNumber('cm-cav');
            let valArc = getRawNumber('cm-arc');

            if (newMode === 'number') {
                // On passe de % vers Nombres
                document.getElementById('cm-inf').value = Math.floor(maxCap * (valInf / 100)).toLocaleString('fr-FR');
                document.getElementById('cm-cav').value = Math.floor(maxCap * (valCav / 100)).toLocaleString('fr-FR');
                document.getElementById('cm-arc').value = Math.floor(maxCap * (valArc / 100)).toLocaleString('fr-FR');
            } else {
                // On passe de Nombres vers %
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
        
        editingMarchId = null; // On remet à zéro car c'est une NOUVELLE marche
        
        document.getElementById('cm-name').value = '';
        document.getElementById('cm-inf').value = '0';
        document.getElementById('cm-cav').value = '0';
        document.getElementById('cm-arc').value = '0';
        // Mode pourcentage par défaut
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
        const mode = document.querySelector('input[name="cm-input-mode"]:checked').value; // On capture le mode !
        const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();
        const total = rawInf + rawCav + rawArc;
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

        if (total === 0) return; 

        if (isExceeding) {
            alert(dict.errExceedCap);
            return;
        }

        const { remInf, remCav, remArc } = getRemainingGlobalTroops();
        
        // Si on est en édition, on "rend" temporairement les troupes de la marche actuelle pour vérifier si on dépasse
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

        if (editingMarchId) {
            // MISE À JOUR de la marche existante
            const index = customMarchesList.findIndex(m => m.id === editingMarchId);
            if (index > -1) {
                customMarchesList[index] = { ...customMarchesList[index], name, mode, inf: rawInf, cav: rawCav, arc: rawArc, total };
            }
        } else {
            // CRÉATION d'une nouvelle marche
            customMarchesList.push({ id: Date.now(), name, mode, inf: rawInf, cav: rawCav, arc: rawArc, total });
        }

        editingMarchId = null; // Fin de l'édition
        saveBearTrapData();
        renderCustomMarches();
        updateStudioBadge();
        modal.classList.remove('active');
        calculateBearTrap(); 
    });
}
// Récupère et convertit les entrées de la modale en nombres réels
function getModalInputValues() {
    const mode = document.querySelector('input[name="cm-input-mode"]:checked').value;
    const maxCap = getCurrentMaxMarchCapacity();

    let valInf = getRawNumber('cm-inf');
    let valCav = getRawNumber('cm-cav');
    let valArc = getRawNumber('cm-arc');

    let rawInf = 0, rawCav = 0, rawArc = 0;
    let isExceeding = false;

    if (mode === 'percent') {
        if (valInf + valCav + valArc > 100) isExceeding = true;
        rawInf = Math.floor(maxCap * (valInf / 100));
        rawCav = Math.floor(maxCap * (valCav / 100));
        rawArc = Math.floor(maxCap * (valArc / 100));
    } else {
        if (valInf + valCav + valArc > maxCap) isExceeding = true;
        rawInf = valInf;
        rawCav = valCav;
        rawArc = valArc;
    }

    return { rawInf, rawCav, rawArc, isExceeding, maxCap };
}

// Mise à jour de l'affichage en direct
function updateModalLiveStats() {
    const { remInf, remCav, remArc } = getRemainingGlobalTroops();
    const { rawInf, rawCav, rawArc, isExceeding, maxCap } = getModalInputValues();

    // 1. Mise à jour de la Capacité Max affichée
    document.getElementById('modal-max-cap').textContent = maxCap.toLocaleString('fr-FR');

    // 2. Mise à jour des troupes restantes
    const curRemInf = remInf - rawInf;
    const curRemCav = remCav - rawCav;
    const curRemArc = remArc - rawArc;

    const label = document.getElementById('modal-remaining-troops');
    const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

    let html = `Disponibles : 🛡️ ${curRemInf.toLocaleString('fr-FR')} | 🐎 ${curRemCav.toLocaleString('fr-FR')} | 🏹 ${curRemArc.toLocaleString('fr-FR')}`;

    if (curRemInf < 0 || curRemCav < 0 || curRemArc < 0) {
        html += `<br><span style="color: #e74c5c;">⚠️ ${dict.errNoTroopsForCustom}</span>`;
    }
    if (isExceeding) {
        html += `<br><span style="color: #e74c5c;">⚠️ ${dict.errExceedCap}</span>`;
    }

    label.innerHTML = html;

    // 3. Mise à jour des conversions dynamiques (Gris clair)
    const mode = document.querySelector('input[name="cm-input-mode"]:checked').value;
    
    const updateConv = (id, val, raw) => {
        const span = document.getElementById(id + '-conv');
        const inputVal = document.getElementById(id).value;
        
        // Si le champ est vide, on n'affiche rien
        if (inputVal === '') {
            span.textContent = '';
            return;
        }
        
        if (mode === 'number') {
            let pct = maxCap > 0 ? Math.round((val / maxCap) * 100) : 0;
            span.textContent = `${pct}%`;
        } else {
            span.textContent = `${raw.toLocaleString('fr-FR')}`;
        }
    };

    updateConv('cm-inf', getRawNumber('cm-inf'), rawInf);
    updateConv('cm-cav', getRawNumber('cm-cav'), rawCav);
    updateConv('cm-arc', getRawNumber('cm-arc'), rawArc);
}

function getRemainingGlobalTroops() {
    let remInf = getRawNumber('troop-inf');
    let remCav = getRawNumber('troop-cav');
    let remArc = getRawNumber('troop-arc');

    customMarchesList.forEach(m => {
        remInf -= m.inf;
        remCav -= m.cav;
        remArc -= m.arc;
    });

    return { remInf, remCav, remArc };
}

function getTotalMarchesAllowed() {
    let marchesCount = getRawNumber('marches-count');
    if (marchesCount === 0) marchesCount = 1;
    if (document.getElementById('player-role').value === 'organizer') marchesCount += 1;
    return marchesCount;
}

function updateStudioBadge() {
    const badge = document.getElementById('remaining-marches-badge');
    badge.textContent = `${customMarchesList.length} / ${getTotalMarchesAllowed()} utilisées`;
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

    // ÉCOUTEURS D'ÉVÉNEMENTS
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

// La fonction de suppression redevient une fonction classique
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

    editingMarchId = id; // On indique au système qu'on est en mode Édition

    // 1. Remplir le nom
    document.getElementById('cm-name').value = march.name;

    // 2. Vérifier si la marche avait été sauvée en % ou en Nombres (fallback sur number)
    const mode = march.mode || 'number';
    document.querySelector(`input[name="cm-input-mode"][value="${mode}"]`).checked = true;

    // 3. Remplir les valeurs intelligemment selon le mode
    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    if (theoreticalCapacity === 0) theoreticalCapacity = 1;

    if (mode === 'percent') {
        // Re-calcule le pourcentage approximatif
        document.getElementById('cm-inf').value = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
        document.getElementById('cm-cav').value = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
        document.getElementById('cm-arc').value = Math.round((march.arc / theoreticalCapacity) * 100) || 0;
    } else {
        // Injecte les nombres bruts formatés
        document.getElementById('cm-inf').value = (march.inf || 0).toLocaleString('fr-FR');
        document.getElementById('cm-cav').value = (march.cav || 0).toLocaleString('fr-FR');
        document.getElementById('cm-arc').value = (march.arc || 0).toLocaleString('fr-FR');
    }

    // Affiche la modale et met à jour les stats
    updateModalLiveStats();
    document.getElementById('custom-march-modal').classList.add('active');
}

// ========================================
// TRADUCTION & FORMATAGE
// ========================================

function applyTranslations(lang) {
    const dict = i18nBearTrap[lang] || i18nBearTrap.EN;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });

    const roleSelect = document.getElementById('player-role');
    if (roleSelect) {
        roleSelect.options[0].text = dict.optPart;
        roleSelect.options[1].text = dict.optOrg;
    }

    const modeSelect = document.getElementById('optim-mode');
    if (modeSelect) {
        modeSelect.options[0].text = dict.optMin;
        modeSelect.options[1].text = dict.optForm;
    }
    
    updateModalLiveStats();
}

function formatInputNumber(e) {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val === '') {
        e.target.value = '';
        return;
    }
    e.target.value = parseInt(val, 10).toLocaleString('fr-FR');
}

function getRawNumber(id) {
    const el = document.getElementById(id);
    if (!el || !el.value) return 0;
    const cleanStr = el.value.toString().replace(/\s/g, '').replace(/ /g, '');
    return parseInt(cleanStr, 10) || 0;
}

// ========================================
// SAUVEGARDE
// ========================================

function saveBearTrapData() {
    const fields = [
        'troop-inf', 'troop-arc', 'troop-cav', 'cap-base', 'cap-expert', 'cap-animal', 
        'marches-count', 'alliance-limit', 'min-inf-percent', 'min-cav-percent'
    ];
    const data = {};
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });
    data['player-role'] = document.getElementById('player-role').value;
    data['optim-mode'] = document.getElementById('optim-mode').value;
    data['server-generation'] = document.getElementById('server-generation').value; 

    localStorage.setItem('beartrap_data', JSON.stringify(data));
}

function loadBearTrapData() {
    const saved = localStorage.getItem('beartrap_data');
    if (saved) {
        const data = JSON.parse(saved);
        for (const [id, val] of Object.entries(data)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        if (data['custom-marches']) {
            customMarchesList = data['custom-marches'];
            renderCustomMarches();
        }
        if (data['server-generation']) {
            const genEl = document.getElementById('server-generation');
            if (genEl) genEl.value = data['server-generation'];
        }
        
        const optimMode = document.getElementById('optim-mode');
        const thresholdInputs = document.getElementById('threshold-inputs');
        if (optimMode && thresholdInputs) {
            thresholdInputs.style.display = optimMode.value === 'threshold' ? 'block' : 'none';
        }
    }
}


// ========================================
// MOTEUR DE SÉLECTION DES HÉROS
// ========================================

function selectHeroesForMarches(marchesCount, role, generation) {
    const userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
    const hasCaserneData = Object.keys(userHeroes).length > 0;
    
    let assignedMarches = [];

    // Si aucune donnée dans la caserne, on renvoie des marches vides sans pénalité
    if (!hasCaserneData || heroesDB.length === 0) {
        for (let i = 0; i < marchesCount; i++) {
            assignedMarches.push({ heroes: [], penalty: 0 });
        }
        return assignedMarches;
    }

    // 1. Préparer la liste des héros disponibles et débloqués
    let availableHeroes = [];
    for (let id in userHeroes) {
        if (userHeroes[id].unlocked) {
            let dbHero = heroesDB.find(h => h.id === id);
            if (dbHero) {
                let lvl = userHeroes[id].level || 1;
                availableHeroes.push({
                    ...dbHero,
                    level: lvl,
                    penalty: 13470 - getHeroCapacity(lvl) // Calcul du malus
                });
            }
        }
    }

    // 2. Séparer par classes
    let infHeroes = availableHeroes.filter(h => h.troopType.toLowerCase() === 'infantry');
    let cavHeroes = availableHeroes.filter(h => h.troopType.toLowerCase() === 'cavalry');
    let arcHeroes = availableHeroes.filter(h => h.troopType.toLowerCase() === 'archer');

    // Fonction pour obtenir le score de la Tier List (plus petit = meilleur)
    const getTierScore = (heroName, typeStr) => {
        let typeShort = typeStr.substring(0, 3).toLowerCase(); // inf, cav, arc
        let tierList = organizerTierList[generation] || organizerTierList[6];
        let list = tierList[typeShort];
        if (!list) return 999;
        let idx = list.indexOf(heroName);
        return idx === -1 ? 999 : idx;
    };

    // 3. Trier les héros selon le rôle
    if (role === 'organizer') {
        const orgSort = (a, b) => {
            let scoreA = getTierScore(a.name, a.troopType);
            let scoreB = getTierScore(b.name, b.troopType);
            if (scoreA !== scoreB) return scoreA - scoreB;
            return b.level - a.level; // En cas d'égalité, le plus haut niveau gagne
        };
        infHeroes.sort(orgSort);
        cavHeroes.sort(orgSort);
        arcHeroes.sort(orgSort);
    } else {
        const partSort = (a, b) => {
            if (a.goodJoinerBear && !b.goodJoinerBear) return -1;
            if (!a.goodJoinerBear && b.goodJoinerBear) return 1;
            return b.level - a.level; // Priorité au niveau pour limiter le malus
        };
        infHeroes.sort(partSort);
        cavHeroes.sort(partSort);
        arcHeroes.sort(partSort);
    }

    // 4. Construire les équipes pour chaque marche
    for (let i = 0; i < marchesCount; i++) {
        let team = [];
        let inf = infHeroes.shift();
        let cav = cavHeroes.shift();
        let arc = arcHeroes.shift();
        
        if (inf) team.push(inf);
        if (cav) team.push(cav);
        if (arc) team.push(arc);
        
        // Définir le Capitaine (Position 1)
        if (role === 'organizer') {
            team.sort((a, b) => getTierScore(a.name, a.troopType) - getTierScore(b.name, b.troopType));
        } else {
            team.sort((a, b) => {
                if (a.goodJoinerBear && !b.goodJoinerBear) return -1;
                if (!a.goodJoinerBear && b.goodJoinerBear) return 1;
                return b.level - a.level;
            });
        }

        // Calcul de la pénalité totale de la marche
        let penalty = 0;
        let missingHeroes = 3 - team.length;
        penalty += missingHeroes * 13470; // Un héros manquant = Perte totale de sa part de capacité
        team.forEach(h => penalty += h.penalty);

        assignedMarches.push({
            heroes: team,
            missingHeroes: missingHeroes,
            penalty: penalty
        });
    }
    
    return assignedMarches;
}
// ========================================
// MOTEUR DE CALCUL (Marches automatiques)
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

    // MAGIE ICI : On récupère les escouades de héros et leurs malus !
    let heroAssignments = selectHeroesForMarches(marchesCount, role, generation);

    let startId = customMarchesList.length + 1;
    
    // On itère marche par marche
    for (let i = 0; i < marchesCount; i++) {
        let assignment = heroAssignments[i];
        
        // Capacité réele de CETTE marche (Capacité Max - Malus des héros)
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

function displayResults(marches, maxCapacity, autoMarchesGenerated, theoreticalCapacity, dict) {
    const resultArea = document.getElementById('result-area');
    
    if (marches.length === 0 || marches[0].total === 0) {
        resultArea.innerHTML = `<p style='color: var(--text-muted); padding: 15px; border-radius: 6px; border: 1px dashed var(--border);'>${dict.noTroops}</p>`;
        resultArea.style.display = 'block';
        return;
    }

    let html = `
        <table class="styled-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid var(--accent);">${dict.thMarch} (Auto)</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent); color: var(--text-muted);">${dict.thCap}</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">${dict.lblInf}</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">${dict.lblCav}</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">${dict.lblArc}</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent); background: rgba(245, 184, 64, 0.05);">${dict.thTotal}</th>
                </tr>
            </thead>
            <tbody>
    `;

    marches.forEach(march => {
        let pInf = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
        let pCav = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
        let pArc = Math.round((march.arc / theoreticalCapacity) * 100) || 0;

        let fMaxCap = march.capacity.toLocaleString('fr-FR'); // <-- Utilise la capacité propre à la marche !
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');

        let rowStyle = march.total < march.capacity ? 'color: var(--text-muted);' : '';
        
        const badgeStyle = "display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";
        const badgeStyleArc = "display: inline-block; background: rgba(245, 184, 64, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";

        // Création des étiquettes des héros
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
            ${dict.txtGen} <strong>${autoMarchesGenerated}</strong><br>
            ${dict.txtRef} <strong>${theoreticalCapacity.toLocaleString('fr-FR')}</strong>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
}
