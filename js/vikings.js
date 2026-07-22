// ========================================
//  VIKINGS — Répartition des marches
//  Logique : distribution équitable Inf -> Cav -> Arch,
//  chaque marche remplie jusqu'à la capacité.
// ========================================

// ---------- i18n ----------
const i18nVikings = {
    FR: {
        titleParams: "Paramètres",
        grpTroops: "Mes Troupes",
        lblInf: "Infanterie 🛡️", lblCav: "Cavalerie 🐎", lblArc: "Archers 🏹",
        grpCap: "Capacité",
        lblMarchCap: "Capacité de marche", lblAnimal: "Bonus animal", lblPet: "Pet activé 🐾",
        grpMarches: "Marches", lblMarchesNb: "Nombre de marches",
        btnReset: "Réinitialiser",
        planTitle: "Répartition Vikings",
        planDesc: "Renseignez vos troupes et votre capacité à gauche. La répartition se fait par priorité Infanterie → Cavalerie → Archers, dans la limite de votre capacité de marche.",
        thMarch: "Marche", thInf: "Infanterie", thCav: "Cavalerie", thArc: "Archers", thTotal: "Total",
        sumCap: "Capacité / marche", sumDeployable: "Total déployable", sumDeployed: "Total déployé", sumFill: "Remplissage",
        rowTotal: "TOTAL",
        garrisonLabel: "Reste en ville",
        btnImportBT: "⤵ Importer depuis Bear Trap",
        importOk: "Données importées depuis Bear Trap.",
        noBearTrap: "Aucune donnée Bear Trap trouvée. Renseignez d'abord la page Bear Trap.",
        confirmReset: "Réinitialiser toutes les données de la page Vikings ?",
        importTitle: "Importer depuis Bear Trap",
        impTroops: "Troupes (Inf / Cav / Arc)",
        impCapacity: "Capacité + bonus animal",
        impMarches: "Nombre de marches",
        btnDoImport: "Importer",
        btnCancel: "Annuler",
        linkAuto: "Auto",
        linkManual: "Manuel",
        linkNoSource: "Auto (non configuré)",
        linkSync: "Resynchroniser sur la compétence",
        srcBison: "Puissant Bison"
    },
    EN: {
        titleParams: "Parameters",
        grpTroops: "My Troops",
        lblInf: "Infantry 🛡️", lblCav: "Cavalry 🐎", lblArc: "Archers 🏹",
        grpCap: "Capacity",
        lblMarchCap: "March capacity", lblAnimal: "Pet bonus", lblPet: "Pet active 🐾",
        grpMarches: "Marches", lblMarchesNb: "Number of marches",
        btnReset: "Reset",
        planTitle: "Vikings Distribution",
        planDesc: "Enter your troops and capacity on the left. Distribution follows the Infantry → Cavalry → Archers priority, up to your march capacity.",
        thMarch: "March", thInf: "Infantry", thCav: "Cavalry", thArc: "Archers", thTotal: "Total",
        sumCap: "Capacity / march", sumDeployable: "Total deployable", sumDeployed: "Total deployed", sumFill: "Fill rate",
        rowTotal: "TOTAL",
        garrisonLabel: "Left in city",
        btnImportBT: "⤵ Import from Bear Trap",
        importOk: "Data imported from Bear Trap.",
        noBearTrap: "No Bear Trap data found. Fill in the Bear Trap page first.",
        confirmReset: "Reset all Vikings page data?",
        importTitle: "Import from Bear Trap",
        impTroops: "Troops (Inf / Cav / Arc)",
        impCapacity: "Capacity + pet bonus",
        impMarches: "Number of marches",
        btnDoImport: "Import",
        btnCancel: "Cancel",
        linkAuto: "Auto",
        linkManual: "Manual",
        linkNoSource: "Auto (not set)",
        linkSync: "Re-sync from the skill",
        srcBison: "Mighty Bison"
    }
};

function tr(key) {
    const lang = window.GlobalLang ? GlobalLang.get() : 'FR';
    return (i18nVikings[lang] || i18nVikings.FR)[key] || key;
}

function applyTranslations() {
    const lang = window.GlobalLang ? GlobalLang.get() : 'FR';
    GlobalLang.applyI18n(i18nVikings[lang] || i18nVikings.FR);
}

// ---------- Helpers nombres (identiques au reste du projet) ----------
function getRawNumber(id) {
    const el = document.getElementById(id);
    if (!el || !el.value) return 0;
    const cleanStr = el.value.toString().replace(/\s/g, '');
    return parseInt(cleanStr, 10) || 0;
}

function formatInputNumber(e) {
    let val = e.target.value.replace(/\D/g, '');
    e.target.value = (val === '') ? '' : parseInt(val, 10).toLocaleString('fr-FR');
}

const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

// ---------- Liaison compétence du familier (Puissant Bison) ----------
// Le « Bonus animal » reflète la compétence du Puissant Bison (data/pets_db.json,
// palier atteint sur la page Familiers → localStorage `pets`). Rempli automatiquement
// mais toujours modifiable : édition -> mode manuel ; bouton ↺ -> resync.
let animalAutoVal = null;
let animalAutoMode = true;

function parseBonusValue(v) {
    if (v == null) return 0;
    return parseInt(String(v).replace(/[^\d]/g, ''), 10) || 0;
}

async function loadAnimalBonus() {
    try {
        const res = await fetch('data/pets_db.json');
        const db = await res.json();
        const bison = (db.pets || []).find(p => p.id === 'mighty-bison');
        const petData = safeParse(STORAGE_KEYS.pets, {});
        const entry = petData['mighty-bison'];
        let tier = 0;
        if (bison && entry && entry.adv) {
            for (let cap = 10; cap <= bison.maxLevel; cap += 10) if (entry.adv[cap]) tier++;
        }
        const values = (bison && bison.skill.effects[0]) ? bison.skill.effects[0].values : [];
        animalAutoVal = (tier >= 1 && values[tier - 1] !== undefined)
            ? parseBonusValue(values[tier - 1]) : null;
    } catch (e) {
        console.error('Animal (Bison) bonus load failed', e);
        animalAutoVal = null;
    }
}

function applyAnimalLink() {
    const input = document.getElementById('vk-animal');
    const badge = document.getElementById('vk-animal-badge');
    const sync  = document.getElementById('vk-animal-sync');
    if (!input || !badge) return;

    if (animalAutoMode && animalAutoVal !== null) {
        input.value = animalAutoVal.toLocaleString('fr-FR');
        badge.innerHTML = '🟢 ' + tr('linkAuto') + ' · ' + tr('srcBison');
        badge.style.color = 'var(--success)';
        if (sync) sync.style.display = 'none';
    } else if (animalAutoMode && animalAutoVal === null) {
        badge.innerHTML = '🔗 ' + tr('linkNoSource') + ' · ' + tr('srcBison');
        badge.style.color = 'var(--text-muted)';
        if (sync) sync.style.display = 'none';
    } else {
        badge.innerHTML = '✏️ ' + tr('linkManual');
        badge.style.color = 'var(--text-muted)';
        if (sync) { sync.title = tr('linkSync'); sync.style.display = (animalAutoVal !== null) ? 'inline-flex' : 'none'; }
    }
}

// ---------- Persistance ----------
function saveData() {
    const data = {
        inf: getRawNumber('vk-inf'),
        cav: getRawNumber('vk-cav'),
        arc: getRawNumber('vk-arc'),
        cap: getRawNumber('vk-cap'),
        animal: getRawNumber('vk-animal'),
        animalAuto: animalAutoMode,
        pet: document.getElementById('vk-pet').checked,
        marches: getRawNumber('vk-marches')
    };
    try { localStorage.setItem(STORAGE_KEYS.vikings, JSON.stringify(data)); } catch (e) {}
}

function loadData() {
    const data = safeParse(STORAGE_KEYS.vikings, null);
    if (!data) return;
    const setNum = (id, v) => { document.getElementById(id).value = (v || 0).toLocaleString('fr-FR'); };
    setNum('vk-inf', data.inf); setNum('vk-cav', data.cav); setNum('vk-arc', data.arc);
    setNum('vk-cap', data.cap); setNum('vk-animal', data.animal);
    setNum('vk-marches', data.marches);
    document.getElementById('vk-pet').checked = !!data.pet;
    animalAutoMode = data.animalAuto !== false;   // défaut : auto
}

// ---------- Moteur de calcul ----------
function computeDistribution() {
    const troops = { inf: getRawNumber('vk-inf'), cav: getRawNumber('vk-cav'), arc: getRawNumber('vk-arc') };
    const capBase = getRawNumber('vk-cap');
    const animal = getRawNumber('vk-animal');
    const petActive = document.getElementById('vk-pet').checked;
    const M = getRawNumber('vk-marches');

    const Q = capBase + (petActive ? animal : 0);

    if (M <= 0 || Q <= 0) {
        return { valid: false, Q, M };
    }

    const priority = ['inf', 'cav', 'arc'];
    const perMarch = { inf: 0, cav: 0, arc: 0 };
    const deployed = { inf: 0, cav: 0, arc: 0 };
    const garrison = { inf: 0, cav: 0, arc: 0 };
    let remCap = Q;

    priority.forEach(t => {
        const share = Math.floor(troops[t] / M);
        const place = Math.min(share, remCap);
        perMarch[t] = place;
        deployed[t] = place * M;
        garrison[t] = troops[t] - deployed[t];
        remCap -= place;
    });

    const marchTotal = perMarch.inf + perMarch.cav + perMarch.arc;
    const deployedTotal = deployed.inf + deployed.cav + deployed.arc;

    return { valid: true, Q, M, perMarch, deployed, garrison, marchTotal, deployedTotal };
}

// ---------- Rendu ----------
function cell(value, total) {
    return `<td class="vk-num">${fmt(value)} <span class="vk-pct">(${pct(value, total)}%)</span></td>`;
}

function render() {
    const r = computeDistribution();
    const summaryEl = document.getElementById('vk-summary');
    const tbody = document.getElementById('vk-tbody');
    const garrisonEl = document.getElementById('vk-garrison');

    if (!r.valid) {
        summaryEl.innerHTML = `<div class="vk-summary-item"><span class="vk-value">—</span></div>`;
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Renseignez une capacité et un nombre de marches valides.</td></tr>`;
        garrisonEl.innerHTML = '';
        return;
    }

    // Synthèse
    const deployable = r.Q * r.M;
    const fill = pct(r.deployedTotal, deployable);
    summaryEl.innerHTML = `
        <div class="vk-summary-item"><span class="vk-label">${tr('sumCap')}</span><span class="vk-value accent">${fmt(r.Q)}</span></div>
        <div class="vk-summary-item"><span class="vk-label">${tr('sumDeployable')}</span><span class="vk-value">${fmt(deployable)}</span></div>
        <div class="vk-summary-item"><span class="vk-label">${tr('sumDeployed')}</span><span class="vk-value">${fmt(r.deployedTotal)}</span></div>
        <div class="vk-summary-item"><span class="vk-label">${tr('sumFill')}</span><span class="vk-value">${fill}%</span></div>
    `;

    // Lignes de marches (toutes identiques en mode équitable)
    let rows = '';
    for (let i = 1; i <= r.M; i++) {
        rows += `<tr>
            <td>${tr('thMarch')} ${i}</td>
            ${cell(r.perMarch.inf, r.marchTotal)}
            ${cell(r.perMarch.cav, r.marchTotal)}
            ${cell(r.perMarch.arc, r.marchTotal)}
            <td class="vk-num">${fmt(r.marchTotal)}</td>
        </tr>`;
    }
    // Ligne TOTAL
    rows += `<tr class="vk-total-row">
        <td>${tr('rowTotal')}</td>
        ${cell(r.deployed.inf, r.deployedTotal)}
        ${cell(r.deployed.cav, r.deployedTotal)}
        ${cell(r.deployed.arc, r.deployedTotal)}
        <td class="vk-num">${fmt(r.deployedTotal)}</td>
    </tr>`;
    tbody.innerHTML = rows;

    // Garnison
    garrisonEl.innerHTML = `${tr('garrisonLabel')} : 
        Infanterie <strong>${fmt(r.garrison.inf)}</strong> · 
        Cavalerie <strong>${fmt(r.garrison.cav)}</strong> · 
        Archers <strong>${fmt(r.garrison.arc)}</strong>`;
}

function triggerUpdate() {
    render();
    saveData();
}

function importFromBearTrap() {
    const bt = safeParse(STORAGE_KEYS.beartrap, null);
    if (!bt) { showAppAlert(tr('noBearTrap')); return; }

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay active';
    overlay.innerHTML = `
        <div class="custom-alert-box">
            <h3 style="color:var(--accent); margin:0 0 15px; font-size:16px;">${tr('importTitle')}</h3>
            <div style="text-align:left; display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" class="imp-opt" value="troops" checked style="width:16px;height:16px;"> ${tr('impTroops')}
                </label>
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" class="imp-opt" value="capacity" checked style="width:16px;height:16px;"> ${tr('impCapacity')}
                </label>
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" class="imp-opt" value="marches" checked style="width:16px;height:16px;"> ${tr('impMarches')}
                </label>
            </div>
            <div style="display:flex; gap:10px;">
                <button id="imp-go" class="btn-modern btn-modern-primary" style="flex:1;">${tr('btnDoImport')}</button>
                <button id="imp-cancel" class="btn-modern btn-modern-secondary" style="flex:1;">${tr('btnCancel')}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const close = () => { overlay.classList.remove('active'); setTimeout(() => document.body.removeChild(overlay), 300); };
    overlay.querySelector('#imp-cancel').onclick = close;
    overlay.querySelector('#imp-go').onclick = () => {
        const sel = Array.from(overlay.querySelectorAll('.imp-opt:checked')).map(c => c.value);
        applyImport(bt, sel);
        close();
    };
}

function applyImport(bt, sel) {
    const num = (v) => parseInt(String(v || '').replace(/\s/g, ''), 10) || 0;
    const setNum = (id, v) => { document.getElementById(id).value = (v || 0).toLocaleString('fr-FR'); };

    if (sel.includes('troops')) {
        setNum('vk-inf', num(bt['troop-inf']));
        setNum('vk-cav', num(bt['troop-cav']));
        setNum('vk-arc', num(bt['troop-arc']));
    }
    if (sel.includes('capacity')) {
        setNum('vk-cap', num(bt['cap-base']));
        setNum('vk-animal', num(bt['cap-animal']));
        document.getElementById('vk-pet').checked = num(bt['cap-animal']) > 0;
        animalAutoMode = false;   // valeur importée -> saisie manuelle
        applyAnimalLink();
    }
    if (sel.includes('marches')) {
        setNum('vk-marches', num(bt['marches-count']));
    }
    triggerUpdate();
    if (sel.length) showAppAlert(tr('importOk'), true);
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', async () => {
    loadData();

    document.getElementById('vk-import-bt').addEventListener('click', importFromBearTrap);

    // Formatage + recalcul sur les champs numériques
    document.querySelectorAll('.formatted-number').forEach(input => {
        input.addEventListener('input', (e) => { formatInputNumber(e); triggerUpdate(); });
    });

    // Liaison du bonus animal sur la compétence du Puissant Bison
    await loadAnimalBonus();
    applyAnimalLink();
    const vkAnimal = document.getElementById('vk-animal');
    if (vkAnimal) vkAnimal.addEventListener('input', () => { animalAutoMode = false; applyAnimalLink(); });
    const vkAnimalSync = document.getElementById('vk-animal-sync');
    if (vkAnimalSync) vkAnimalSync.addEventListener('click', () => {
        animalAutoMode = true;
        applyAnimalLink();
        // resync = intention d'utiliser le familier -> on active le Pet si un bonus existe
        if (animalAutoVal) document.getElementById('vk-pet').checked = true;
        triggerUpdate();
    });

    // Toggle pet
    document.getElementById('vk-pet').addEventListener('change', triggerUpdate);

    // Reset
    document.getElementById('vk-reset').addEventListener('click', () => {
        showAppConfirm(tr('confirmReset'), () => {
            localStorage.removeItem(STORAGE_KEYS.vikings);
            location.reload();
        });
    });

    applyTranslations();
    render();
    vkInitHelp();
});

function vkInitHelp() {
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id: 'vikings', banner: true, anchor: '[data-i18n="planTitle"]',
        title: { FR: 'Vikings — Aide', EN: 'Vikings — Help' },
        summary: {
            FR: "Répartit tes troupes sur tes marches pour l'événement Vikings selon ta capacité de marche, et te montre la composition de chaque marche ainsi que ce qui reste en garnison.",
            EN: "Splits your troops across your marches for the Vikings event based on your march capacity, and shows each march's composition and what stays in the garrison."
        },
        steps: {
            FR: [
                "Renseigne tes troupes (Infanterie, Cavalerie, Archers) à gauche.",
                "Indique ta capacité de marche, le bonus animal et active le Pet s'il est utilisé, puis le nombre de marches.",
                "La répartition se calcule automatiquement : chaque marche est remplie selon l'ordre Infanterie → Cavalerie → Archers, dans la limite de ta capacité.",
                "Tu peux importer directement tes troupes et ta capacité depuis le Piège à Ours via le bouton « Importer depuis Bear Trap »."
            ],
            EN: [
                "Enter your troops (Infantry, Cavalry, Archers) on the left.",
                "Set your march capacity, the animal bonus and enable Pet if used, then the number of marches.",
                "The distribution is computed automatically: each march is filled in Infantry → Cavalry → Archers order, up to your capacity.",
                "You can import your troops and capacity straight from the Bear Trap via the “Import from Bear Trap” button."
            ]
        },
        links: [
            { label: { FR: '🐻 Piège à Ours', EN: '🐻 Bear Trap' }, href: 'beartrap_calc.html' },
            { label: { FR: '🛡️ Ma Caserne', EN: '🛡️ My Barracks' }, href: 'caserne.html' }
        ]
    });
}

window.addEventListener('langChanged', () => {
    applyTranslations();
    applyAnimalLink();
    render();
    vkInitHelp();
});
