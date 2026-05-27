// ============================================================
// APP.JS - TrueGold Calculator
// Logique fonctionnelle de l'application
// Dépend de : database.js (doit être chargé AVANT ce fichier)
// ============================================================

// État global modifiable des bâtiments (copie de la valeur par défaut)
let buildingsState = JSON.parse(JSON.stringify(defaultBuildingsState));

// ============================================================
// THÈME (Dark / Light)
// ============================================================
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
        btn.style.background = '#333';
        btn.style.color = '#fff';
    } else {
        btn.textContent = '🌙 Dark Mode';
        btn.style.background = '#fff';
        btn.style.color = '#333';
    }
}

// ============================================================
// TRADUCTION
// ============================================================
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

// ============================================================
// FORMATAGE DU TEMPS
// ============================================================
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

// ============================================================
// RENDU DU TABLEAU DES BÂTIMENTS
// ============================================================
function renderBuildings() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';

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
            <td class="bldg-name"><span class="bldg-icon">${buildingEmojis[nom] || "🏢"}</span> ${getLocName(nom)}</td>
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
        let sumTG = 0, sumTTG = 0, sumTime = 0;

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

// ============================================================
// CALCUL DU BONUS DE VITESSE TOTAL
// ============================================================
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

// ============================================================
// SAUVEGARDE / CHARGEMENT (localStorage)
// ============================================================
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
    if (!saved) return;
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
    } catch (e) {
        console.error("Error loading data", e);
    }
}

// ============================================================
// MISE À JOUR GLOBALE
// ============================================================
function triggerUpdate() {
    try {
        getTotalVitesse();
        applyTranslations();
        renderBuildings();
        runCalculator();
        saveData();
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
    } catch (e) {
        document.getElementById('output').innerHTML =
            `<span style="color:var(--warning);">❌ Execution Error: ${e.message}</span>`;
    }
}

// ============================================================
// MOTEUR DE SUGGESTION (à compléter avec votre logique complète)
// ============================================================
function SUGGERER_KINGSHOT(stockTG, stockTTG, transfoUtilisees, vitesseAmelio,
                           accelJours, accelHeures, accelMinutes, modeKVK, tx,
                           rangeTableur, rangeDatabase, rangeDataTTG, lang) {
    // ⚠️ COPIEZ ICI tout le contenu de votre fonction SUGGERER_KINGSHOT originale
    return `<div style="text-align:center; margin-top:20px; color:var(--text-muted);">
        Résultats désactivés temporairement pour corriger les bugs.
    </div>`;
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
    triggerUpdate();
});
