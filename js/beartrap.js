// ========================================
// BEAR TRAP OPTIMIZER - Logique & Langue
// ========================================

const i18nBearTrap = {
    FR: {
        titleParams: "Paramètres",
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
        grpOpt: "Mode d'optimisation",
        lblMode: "Mode",
        optMin: "Seuils Mini",
        optForm: "Formule (Bientôt)",
        lblMinInf: "Infanterie min (%)",
        lblMinCav: "Cavalerie min (%)",
        btnCalc: "Calculer les marches",
        planTitle: "Plan de déploiement",
        planDesc: "Remplissez vos paramètres à gauche et cliquez sur Calculer pour générer vos formations de marches optimales.",
        errCap: "Votre capacité de marche doit être supérieure à 0.",
        noTroops: "Vous n'avez aucune troupe à déployer.",
        thMarch: "Marche",
        thCap: "Capacité Config",
        thTotal: "Total",
        txtGen: "Nombre de marches générées :",
        txtRef: "Capacité théorique de référence (pour vos %) :"
    },
    EN: {
        titleParams: "Settings",
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
        grpOpt: "Optimization Mode",
        lblMode: "Mode",
        optMin: "Min Thresholds",
        optForm: "Formula (Soon)",
        lblMinInf: "Min Infantry (%)",
        lblMinCav: "Min Cavalry (%)",
        btnCalc: "Calculate Marches",
        planTitle: "Deployment Plan",
        planDesc: "Fill in your settings on the left and click Calculate to generate your optimal march formations.",
        errCap: "Your march capacity must be greater than 0.",
        noTroops: "You have no troops to deploy.",
        thMarch: "March",
        thCap: "Config Capacity",
        thTotal: "Total",
        txtGen: "Number of marches generated:",
        txtRef: "Theoretical reference capacity (for your %):"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation Langue
    applyTranslations(GlobalLang.get());
    window.addEventListener('langChanged', (e) => {
        applyTranslations(e.detail.lang);
        calculateBearTrap(); // Recalculer pour traduire le tableau
    });

    // Formatage automatique des nombres (Séparateur de milliers)
    const numberInputs = document.querySelectorAll('.formatted-number');
    numberInputs.forEach(input => {
        input.addEventListener('input', formatInputNumber);
        input.addEventListener('change', saveBearTrapData); // Sauvegarde auto
    });

    // Écouteurs divers
    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) btnCalculate.addEventListener('click', () => { saveBearTrapData(); calculateBearTrap(); });

    const optimMode = document.getElementById('optim-mode');
    const thresholdInputs = document.getElementById('threshold-inputs');
    if (optimMode && thresholdInputs) {
        optimMode.addEventListener('change', (e) => {
            thresholdInputs.style.display = e.target.value === 'threshold' ? 'block' : 'none';
        });
    }

    document.getElementById('player-role').addEventListener('change', saveBearTrapData);
    document.getElementById('optim-mode').addEventListener('change', saveBearTrapData);

    // Démarrage
    loadBearTrapData();
    if (getRawNumber('troop-inf') > 0 || getRawNumber('troop-arc') > 0 || getRawNumber('troop-cav') > 0) {
        calculateBearTrap();
    }
});

// ========================================
// TRADUCTION & FORMATAGE
// ========================================

function applyTranslations(lang) {
    const dict = i18nBearTrap[lang] || i18nBearTrap.EN;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
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
}

function formatInputNumber(e) {
    // Enlève tout ce qui n'est pas un chiffre
    let val = e.target.value.replace(/\D/g, ''); 
    if (val === '') {
        e.target.value = '';
        return;
    }
    // Formate avec les espaces (fr-FR gère très bien ça)
    e.target.value = parseInt(val, 10).toLocaleString('fr-FR');
}

// Transforme "120 000" en vrai chiffre 120000 pour les calculs
function getRawNumber(id) {
    const el = document.getElementById(id);
    if (!el || !el.value) return 0;
    // On enlève les espaces normaux et les espaces insécables
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
        
        const optimMode = document.getElementById('optim-mode');
        const thresholdInputs = document.getElementById('threshold-inputs');
        if (optimMode && thresholdInputs) {
            thresholdInputs.style.display = optimMode.value === 'threshold' ? 'block' : 'none';
        }
    }
}

// ========================================
// MOTEUR DE CALCUL
// ========================================

function calculateBearTrap() {
    // Utilisation de notre nouvelle fonction getRawNumber !
    let availableInf = getRawNumber('troop-inf');
    let availableArc = getRawNumber('troop-arc');
    let availableCav = getRawNumber('troop-cav');

    const capBase = getRawNumber('cap-base');
    const capExpert = getRawNumber('cap-expert');
    const capAnimal = getRawNumber('cap-animal');
    let marchesCount = getRawNumber('marches-count');
    if (marchesCount === 0) marchesCount = 1;
    
    const playerRole = document.getElementById('player-role').value;
    if (playerRole === 'organizer') marchesCount += 1;

    const limitStr = document.getElementById('alliance-limit').value;
    const allianceLimit = limitStr ? getRawNumber('alliance-limit') : Infinity;
    
    const minInfPercent = getRawNumber('min-inf-percent');
    const minCavPercent = getRawNumber('min-cav-percent');

    let theoreticalCapacity = capBase + capExpert + capAnimal;
    let maxMarchCapacity = Math.min(theoreticalCapacity, allianceLimit);

    const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;

    if (maxMarchCapacity <= 0) {
        alert(dict.errCap);
        return;
    }

    let marches = [];
    
    if (availableInf + availableArc + availableCav === 0) {
        displayResults([], maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
        return;
    }

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

    for (let i = 0; i < marchesCount; i++) {
        marches.push({ id: i + 1, inf: mInf, arc: mArc, cav: mCav, total: mTotal });
    }

    displayResults(marches, maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
}

function displayResults(marches, maxCapacity, totalMarches, theoreticalCapacity, dict) {
    const resultArea = document.getElementById('result-area');
    
    if (marches.length === 0 || marches[0].total === 0) {
        resultArea.innerHTML = `<p style='color: var(--text-muted);'>${dict.noTroops}</p>`;
        resultArea.style.display = 'block';
        return;
    }

    let html = `
        <table class="styled-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid var(--accent);">${dict.thMarch}</th>
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
            ${dict.txtGen} <strong>${totalMarches}</strong><br>
            ${dict.txtRef} <strong>${theoreticalCapacity.toLocaleString('fr-FR')}</strong>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
}
