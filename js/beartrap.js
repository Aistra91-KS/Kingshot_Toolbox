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
        optNum: "Nombres",
        optPerc: "Pourcentage (%)",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        errMaxMarches: "Vous avez atteint votre nombre maximum de marches.",
        errNoTroopsForCustom: "Pas assez de troupes disponibles pour cette configuration !",
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
        optNum: "Numbers",
        optPerc: "Percentage (%)",
        btnCancel: "Cancel",
        btnSave: "Save",
        errMaxMarches: "You have reached your maximum number of marches.",
        errNoTroopsForCustom: "Not enough troops available for this configuration!",
        errExceedCap: "Capacity exceeded (Max 100% or march limit)!"
    }
};

let customMarchesList = [];

document.addEventListener('DOMContentLoaded', () => {
    if (window.GlobalLang) {
        GlobalLang.applyToSelect('lang-select');
    }

    applyTranslations(GlobalLang.get());
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

    // Écouteur pour le changement % / Nombres
    cmRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Remise à zéro pour éviter les erreurs de conversion
            document.getElementById('cm-inf').value = '0';
            document.getElementById('cm-cav').value = '0';
            document.getElementById('cm-arc').value = '0';
            updateModalLiveStats();
        });
    });

    btnAdd.addEventListener('click', () => {
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;
        if (customMarchesList.length >= getTotalMarchesAllowed()) {
            alert(dict.errMaxMarches);
            return;
        }
        document.getElementById('cm-name').value = '';
        document.getElementById('cm-inf').value = '0';
        document.getElementById('cm-cav').value = '0';
        document.getElementById('cm-arc').value = '0';
        document.querySelector('input[name="cm-input-mode"][value="number"]').checked = true;
        
        updateModalLiveStats();
        modal.classList.add('active');
    });

    btnCancel.addEventListener('click', () => modal.classList.remove('active'));

    btnSave.addEventListener('click', () => {
        const name = document.getElementById('cm-name').value || "Marche Spéciale";
        const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();
        const total = rawInf + rawCav + rawArc;
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

        if (total === 0) return; 

        if (isExceeding) {
            alert(dict.errExceedCap);
            return;
        }

        const { remInf, remCav, remArc } = getRemainingGlobalTroops();
        if (rawInf > remInf || rawCav > remCav || rawArc > remArc) {
            alert(dict.errNoTroopsForCustom);
            return;
        }

        customMarchesList.push({ id: Date.now(), name, inf: rawInf, cav: rawCav, arc: rawArc, total });
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
    const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();

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

    customMarchesList.forEach(march => {
        const div = document.createElement('div');
        div.className = 'custom-march-card';
        div.innerHTML = `
            <div>
                <strong style="color: var(--accent); display: block; margin-bottom: 5px;">${march.name}</strong>
                <div class="custom-march-stats">
                    <div>Total: <span>${march.total.toLocaleString('fr-FR')}</span></div>
                    <div>🛡️ <span>${march.inf.toLocaleString('fr-FR')}</span></div>
                    <div>🐎 <span>${march.cav.toLocaleString('fr-FR')}</span></div>
                    <div>🏹 <span>${march.arc.toLocaleString('fr-FR')}</span></div>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteCustomMarch(${march.id})">🗑️</button>
        `;
        container.appendChild(div);
    });
}

window.deleteCustomMarch = function(id) {
    customMarchesList = customMarchesList.filter(m => m.id !== id);
    saveBearTrapData();
    renderCustomMarches();
    updateStudioBadge();
    calculateBearTrap();
};

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
    data['custom-marches'] = customMarchesList;

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
        
        const optimMode = document.getElementById('optim-mode');
        const thresholdInputs = document.getElementById('threshold-inputs');
        if (optimMode && thresholdInputs) {
            thresholdInputs.style.display = optimMode.value === 'threshold' ? 'block' : 'none';
        }
    }
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

    let maxMarchCapacity = getCurrentMaxMarchCapacity();
    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');

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

    let fairInf = Math.floor(availableInf / marchesCount);
    let fairArc = Math.floor(availableArc / marchesCount);
    let fairCav = Math.floor(availableCav / marchesCount);

    let targetInf = Math.floor(maxMarchCapacity * (minInfPercent / 100));
    let targetCav = Math.floor(maxMarchCapacity * (minCavPercent / 100));

    let mInf = Math.min(targetInf, fairInf);
    let mCav = Math.min(targetCav, fairCav);
    
    let remainingSpace = maxMarchCapacity - mInf - mCav;

    let mArc = Math.min(remainingSpace, fairArc);
    remainingSpace -= mArc;

    if (remainingSpace > 0) {
        let extraCavAvailable = fairCav - mCav;
        let addCav = Math.min(remainingSpace, extraCavAvailable);
        mCav += addCav;
        remainingSpace -= addCav;
    }

    if (remainingSpace > 0) {
        let extraInfAvailable = fairInf - mInf;
        let addInf = Math.min(remainingSpace, extraInfAvailable);
        mInf += addInf;
        remainingSpace -= addInf;
    }

    let mTotal = mInf + mArc + mCav;

    let startId = customMarchesList.length + 1;
    for (let i = 0; i < marchesCount; i++) {
        marches.push({ id: startId + i, inf: mInf, arc: mArc, cav: mCav, total: mTotal });
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

        let fMaxCap = maxCapacity.toLocaleString('fr-FR');
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');

        let rowStyle = march.total < maxCapacity ? 'color: var(--text-muted);' : '';
        
        const badgeStyle = "display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";
        const badgeStyleArc = "display: inline-block; background: rgba(245, 184, 64, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";

        html += `
            <tr style="${rowStyle}">
                <td style="padding: 10px; border-bottom: 1px solid var(--control-bg);"><strong>${dict.thMarch} ${march.id}</strong></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--text-muted);">${fMaxCap}</td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fInf} <span style="${badgeStyle}">${pInf}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fCav} <span style="${badgeStyle}">${pCav}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--accent);">${fArc} <span style="${badgeStyleArc}">${pArc}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); background: rgba(245, 184, 64, 0.05);"><strong>${fTotal}</strong></td>
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
