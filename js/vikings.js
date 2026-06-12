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
        planDesc: "Renseignez vos troupes et votre capacité à gauche. La répartition équitable Infanterie → Cavalerie → Archers se calcule automatiquement.",
        thMarch: "Marche", thInf: "Infanterie", thCav: "Cavalerie", thArc: "Archers", thTotal: "Total",
        sumCap: "Capacité / marche", sumDeployable: "Total déployable", sumDeployed: "Total déployé", sumFill: "Remplissage",
        rowTotal: "TOTAL",
        garrisonLabel: "Reste en ville",
        confirmReset: "Réinitialiser toutes les données de la page Vikings ?"
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
        planDesc: "Enter your troops and capacity on the left. The equitable Infantry → Cavalry → Archers distribution is computed automatically.",
        thMarch: "March", thInf: "Infantry", thCav: "Cavalry", thArc: "Archers", thTotal: "Total",
        sumCap: "Capacity / march", sumDeployable: "Total deployable", sumDeployed: "Total deployed", sumFill: "Fill rate",
        rowTotal: "TOTAL",
        garrisonLabel: "Left in city",
        confirmReset: "Reset all Vikings page data?"
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

// ---------- Persistance ----------
function saveData() {
    const data = {
        inf: getRawNumber('vk-inf'),
        cav: getRawNumber('vk-cav'),
        arc: getRawNumber('vk-arc'),
        cap: getRawNumber('vk-cap'),
        animal: getRawNumber('vk-animal'),
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

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Formatage + recalcul sur les champs numériques
    document.querySelectorAll('.formatted-number').forEach(input => {
        input.addEventListener('input', (e) => { formatInputNumber(e); triggerUpdate(); });
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
});

window.addEventListener('langChanged', () => { applyTranslations(); render(); });
