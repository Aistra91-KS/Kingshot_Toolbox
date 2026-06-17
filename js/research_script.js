// ========================================
//  RESEARCH CALCULATOR - LOGIC
// ========================================

let initialDb = [];  // sera rempli depuis le JSON
let db = [];
let totalBonus = 0;
let totalAccSeconds = 0;

const i18n = {
    'EN': {
        'controlPanel': 'Control Panel', 'settings': 'Settings', 'language': 'Language',
        'baseBonus': 'Base Research Bonus', 'chiefMinister': 'Chief Minister (+10%)',
        'kvkBonus': 'KVK Bonus (+5%)', 'kingdomBonus': 'Kingdom Bonus (+10%)',
        'totalBonus': 'Total Bonus', 'displayOptions': 'Display Options',
        'hideCompleted': 'Hide completed', 'accelerators': 'Accelerators',
        'days': 'Days (d)', 'hours': 'Hours (h)', 'minutes': 'Minutes (m)',
        'totalAvailable': 'Total Available', 'targetTree': 'Target Tree',
        'treeGrowthLabel': 'Growth', 'treeEconomyLabel': 'Economy',
        'treeBattleLabel': 'Battle', 'modeKvkBlock': 'KVK Mode',
        'modeKvkLabel': 'Active (Limit by Accelerators)', 'tabOptimal': 'Optimal Search Order',
        'tabGrowth': 'Growth Tree', 'tabEconomy': 'Economy Tree', 'tabBattle': 'Battle Tree',
        'suggTitle': 'Suggestion for the next researches', 'recapTitle': 'Global Recap',
        'colSuggName': 'Research Name', 'colSuggStep': 'Step', 'colSuggTime': 'Time',
        'colSuggTree': 'Tree', 'colDone': 'Done', 'colName': 'Name',
        'colBaseTime': 'Base Time', 'colDiscountTime': 'Discounted Time', 'colCost': 'Cost',
        'msgNoResearch': 'No research available or insufficient time',
        'msgMore': '+ {n} other possible research(es)', 'statGlobal': 'All Researches',
        'statGrowth': 'Growth Tree', 'statEco': 'Economy Tree', 'statBattle': 'Battle Tree',
        'timeTitle': 'Time: ', 'stepTxt': 'step', 'forTxt': 'for',
        'nextSuggTxt': 'Suggestion for next research:', 'completedTxt': 'Completed !',
        'blockedTxt': 'Locked (Missing prerequisites)', 'dataManagement': 'Data Management',
        'resetBtn': 'Reset to Defaults', 'btnTree': 'Visual Tree', 'btnTable': 'List View'
    },
    'FR': {
        'controlPanel': 'Panneau de Contrôle', 'settings': 'Paramètres', 'language': 'Langue',
        'baseBonus': 'Bonus de base', 'chiefMinister': 'Ministre en Chef (+10%)',
        'kvkBonus': 'Bonus KVK (+5%)', 'kingdomBonus': 'Bonus Royaume (+10%)',
        'totalBonus': 'Bonus Total', 'displayOptions': 'Options d\'affichage',
        'hideCompleted': 'Masquer les terminés', 'accelerators': 'Accélérateurs',
        'days': 'Jours (j)', 'hours': 'Heures (h)', 'minutes': 'Minutes (m)',
        'totalAvailable': 'Total Disponible', 'targetTree': 'Arbres cibles',
        'treeGrowthLabel': 'Expansion', 'treeEconomyLabel': 'Économie',
        'treeBattleLabel': 'Combat', 'modeKvkBlock': 'Mode KVK',
        'modeKvkLabel': 'Actif (Limité par accélérateurs)', 'tabOptimal': 'Ordre de Recherche',
        'tabGrowth': 'Arbre Expansion', 'tabEconomy': 'Arbre Économie', 'tabBattle': 'Arbre Combat',
        'suggTitle': 'Suggestions pour les prochaines recherches', 'recapTitle': 'Récapitulatif Global',
        'colSuggName': 'Nom de la recherche', 'colSuggStep': 'Étape', 'colSuggTime': 'Temps',
        'colSuggTree': 'Arbre', 'colDone': 'Fait', 'colName': 'Nom',
        'colBaseTime': 'Temps de base', 'colDiscountTime': 'Temps réduit', 'colCost': 'Coût',
        'msgNoResearch': 'Aucune recherche disponible ou temps insuffisant',
        'msgMore': '+ {n} autre(s) recherche(s) possible(s)',
        'statGlobal': 'Toutes les recherches', 'statGrowth': 'Arbre Expansion',
        'statEco': 'Arbre Économie', 'statBattle': 'Arbre Combat',
        'timeTitle': 'Temps : ', 'stepTxt': 'étape', 'forTxt': 'pour',
        'nextSuggTxt': 'Suggestion de prochaine recherche :', 'completedTxt': 'Terminé !',
        'blockedTxt': 'Bloqué (Prérequis manquants)', 'dataManagement': 'Gestion des Données',
        'resetBtn': 'Réinitialiser', 'btnTree': 'Arbre Visuel', 'btnTable': 'Vue Liste'
    }
};

const inputs = {
    baseBonus: document.getElementById('base-bonus'),
    chiefMinister: document.getElementById('chief-minister'),
    kvkBonus: document.getElementById('kvk-bonus'),
    kingdomBonus: document.getElementById('kingdom-bonus'),
    modeKvk: document.getElementById('mode-kvk'),
    days: document.getElementById('acc-days'),
    hours: document.getElementById('acc-hours'),
    minutes: document.getElementById('acc-minutes'),
    treeGrowth: document.getElementById('tree-growth'),
    treeEconomy: document.getElementById('tree-economy'),
    treeBattle: document.getElementById('tree-battle'),
    hideCompleted: document.getElementById('hide-completed')
};

// ============ DATA LOADING (depuis JSON) ============
async function loadInitialDb() {
    try {
        const response = await fetch('data/research_db.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        const text = await response.text();
        try {
            initialDb = JSON.parse(text);
        } catch (parseError) {
            throw new Error(`JSON invalide : ${parseError.message}`);
        }
        console.log(`✅ Base de données chargée : ${initialDb.length} recherches`);
    } catch (e) {
        console.error('❌ Erreur de chargement du JSON :', e);
        // Affiche l'alerte UNIQUEMENT si la BDD est vraiment vide
        if (!initialDb || initialDb.length === 0) {
            showAppAlert(`Impossible de charger la base de données.<br><small>${e.message}</small>`);
        }
    }
}

function initData() {
    const savedDb = localStorage.getItem(STORAGE_KEYS.researchDb);
    if (savedDb) {
        try {
            db = JSON.parse(savedDb);
            const refMap = {};
            initialDb.forEach(d => { refMap[d.Tree + '_' + d.Name + '_' + d.Level] = {r: d.reqs, e: d.Etage}; });
            db.forEach(d => {
                const key = d.Tree + '_' + d.Name + '_' + d.Level;
                if(refMap[key]) {
                    d.reqs = refMap[key].r;
                    d.Etage = refMap[key].e;
                }
            });
        } catch(e) {
            db = JSON.parse(JSON.stringify(initialDb));
        }
    } else {
        db = JSON.parse(JSON.stringify(initialDb));
    }

    const savedInputs = localStorage.getItem(STORAGE_KEYS.researchInputs);
    if (savedInputs) {
        try {
            const parsedInputs = JSON.parse(savedInputs);
            Object.keys(parsedInputs).forEach(key => {
                if (inputs[key]) {
                    if (inputs[key].type === 'checkbox') {
                        inputs[key].checked = parsedInputs[key];
                    } else {
                        inputs[key].value = parsedInputs[key];
                    }
                }
            });
        } catch(e) {}
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.researchDb, JSON.stringify(db));
    const inputsState = {};
    Object.keys(inputs).forEach(key => {
        inputsState[key] = inputs[key].type === 'checkbox' ? inputs[key].checked : inputs[key].value;
    });
    localStorage.setItem(STORAGE_KEYS.researchInputs, JSON.stringify(inputsState));
}

// ============ UTILS ============
function applyTranslations() {
    const lang = GlobalLang.get();
    GlobalLang.applyI18n(i18n[lang]);
}

function formatTime(seconds) {
    if (seconds === 0) return "0s";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let res = [];
    const lang = GlobalLang.get();
    const dayStr = lang === 'FR' ? 'j' : 'd';
    if (d > 0) res.push(d + dayStr);
    if (h > 0) res.push(h + "h");
    if (m > 0) res.push(m + "m");
    if (s > 0) res.push(s + "s");
    return res.join(" ");
}

function formatNumber(num) { return num.toLocaleString(); }

function calculateState() {
    let bonus = parseFloat(inputs.baseBonus.value) || 0;
    if (inputs.chiefMinister.checked) bonus += 0.10;
    if (inputs.kvkBonus.checked) bonus += 0.05;
    if (inputs.kingdomBonus.checked) bonus += 0.10;
    totalBonus = bonus;
    document.getElementById('total-bonus-display').textContent = (totalBonus * 100).toFixed(1) + "%";
    
    const d = parseInt(inputs.days.value) || 0;
    const h = parseInt(inputs.hours.value) || 0;
    const m = parseInt(inputs.minutes.value) || 0;
    totalAccSeconds = (d * 86400) + (h * 3600) + (m * 60);
    document.getElementById('total-acc-display').textContent = formatTime(totalAccSeconds);
    
    db.forEach(item => {
        let baseSeconds = (item['Time (d)'] * 86400) + (item['Time (h)'] * 3600) + (item['Time (m)'] * 60) + item['Time (s)'];
        item.baseSeconds = baseSeconds;
        item.discountedSeconds = baseSeconds / (1 + totalBonus);
    });
}

function getCurrentMaxLevels(database) {
    let maxLevels = {};
    for (let item of database) {
        if (!maxLevels[item.Name]) maxLevels[item.Name] = 0;
        if (item.Researched && item.Level > maxLevels[item.Name]) maxLevels[item.Name] = item.Level;
    }
    return maxLevels;
}

function isAvailable(item, maxLevels) {
    if (item.Level > 1 && (maxLevels[item.Name] || 0) < item.Level - 1) return false;
    if (item.reqs && item.reqs.length > 0) {
        for (let req of item.reqs) {
            if ((maxLevels[req.name] || 0) < req.level) return false;
        }
    }
    return true;
}

function getNextSuggestion(treeKey, lang) {
    let currentMaxLevels = getCurrentMaxLevels(db);
    let unresearched = db.filter(d => !d.Researched && (treeKey === 'Global' || d.Tree === treeKey));
    let unlockedNow = unresearched.filter(item => isAvailable(item, currentMaxLevels));
    if (unlockedNow.length === 0) return null;
    unlockedNow.sort((a, b) => {
        if (Math.abs(a.discountedSeconds - b.discountedSeconds) > 0.1) return a.discountedSeconds - b.discountedSeconds;
        if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
        return a.Level - b.Level;
    });
    return unlockedNow[0];
}

// Libellés ressources (tooltips au survol)
const RES_LABEL = {
  FR: { wheat:'Pain', 'tree-pine':'Bois', 'brick-wall':'Pierre', pickaxe:'Fer', coins:'Or', clock:'Temps' },
  EN: { wheat:'Bread', 'tree-pine':'Wood', 'brick-wall':'Stone', pickaxe:'Iron', coins:'Gold', clock:'Time' }
};
function resIc(name, size, lang) {
  const label = (RES_LABEL[lang] || RES_LABEL.EN)[name] || '';
  return `<span class="resource-icon" title="${label}" style="cursor:help;">${iconSvg(name, size)}</span>`;
}

function buildCardHtml(title, s, treeKey, lang) {
    let perc = (s.total === 0) ? 0 : Math.round((s.done / s.total) * 100);
    let suggHtml = "";
    let nextItem = getNextSuggestion(treeKey, lang);
    let unresearchedCount = s.total - s.done;
    if (unresearchedCount === 0) {
        suggHtml = `<div class="next-sugg" style="color:var(--success)">${i18n[lang]['completedTxt']}</div>`;
    } else if (nextItem) {
        let name = lang === 'FR' ? nextItem['Fr Name'] : nextItem['Name'];
        suggHtml = `<div class="next-sugg"><span class="sugg-title">${i18n[lang]['nextSuggTxt']}</span><span class="sugg-val">${name} ${i18n[lang]['stepTxt']} ${nextItem.Level} ${i18n[lang]['forTxt']} ${formatTime(nextItem.discountedSeconds)}</span></div>`;
    } else {
        suggHtml = `<div class="next-sugg" style="color:var(--warning)">${i18n[lang]['blockedTxt']}</div>`;
    }
    let cssClass = treeKey.toLowerCase();
    if(cssClass === 'economy') cssClass = 'eco';
    return `
        <div class="stat-card ${cssClass}">
            <h4>${title}</h4>
            <div class="progress-wrapper">
                <div class="progress-text"><span>${s.done} / ${s.total}</span><span>${perc}%</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width: ${perc}%"></div></div>
            </div>
            <div class="stat-grid" style="margin-bottom:10px;">
                <div class="stat-item">${resIc('wheat',16,lang)}<span>${formatNumber(s.b)}</span></div>
                <div class="stat-item">${resIc('tree-pine',16,lang)}<span>${formatNumber(s.w)}</span></div>
                <div class="stat-item">${resIc('brick-wall',16,lang)}<span>${formatNumber(s.s)}</span></div>
                <div class="stat-item">${resIc('pickaxe',16,lang)}<span>${formatNumber(s.i)}</span></div>
                <div class="stat-item">${resIc('coins',16,lang)}<span>${formatNumber(s.g)}</span></div>
                <div class="stat-item" style="color:var(--accent)">${resIc('clock',16,lang)}<b>${formatTime(s.t)}</b></div>
            </div>
            ${suggHtml}
        </div>`;
}

function buildVisualTree(treeName, containerId) {
    const lang = GlobalLang.get();
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    let currentMaxLevels = getCurrentMaxLevels(db);
    let treeDb = db.filter(d => d.Tree === treeName);
    if (treeDb.length === 0) return;
    let treeCssClass = treeName.toLowerCase();
    if (treeCssClass === 'economy') treeCssClass = 'eco';
    let etagesObj = {};
    treeDb.forEach(item => {
        if(!etagesObj[item.Etage]) etagesObj[item.Etage] = {};
        if(!etagesObj[item.Etage][item.Name]) etagesObj[item.Etage][item.Name] = [];
        etagesObj[item.Etage][item.Name].push(item);
    });
    let sortedEtages = Object.keys(etagesObj).map(Number).sort((a,b)=>a-b);
    sortedEtages.forEach(etageNum => {
        let rowDiv = document.createElement('div');
        rowDiv.className = `etage-row ${treeCssClass}`;
        let namesObj = etagesObj[etageNum];
        for (let name in namesObj) {
            let items = namesObj[name];
            items.sort((a,b) => a.Level - b.Level);
            let doneCount = items.filter(i => i.Researched).length;
            let totalCount = items.length;
            if (inputs.hideCompleted.checked && doneCount === totalCount) continue;
            let box = document.createElement('div');
            box.className = `research-box ${treeCssClass}`;
            let displayName = lang === 'FR' ? items[0]['Fr Name'] : items[0]['Name'];
            let header = document.createElement('div');
            header.className = 'research-box-header';
            header.innerHTML = `<span>${displayName}</span> <span>(${doneCount}/${totalCount})</span>`;
            box.appendChild(header);
            let stepsContainer = document.createElement('div');
            stepsContainer.className = 'research-box-steps';
            items.forEach(item => {
                let avail = isAvailable(item, currentMaxLevels);
                let isLocked = (!item.Researched && !avail);
                let stepRow = document.createElement('label');
                stepRow.className = `step-row ${isLocked ? 'locked' : ''}`;
                let lockIcon = isLocked ? `<span title="${i18n[lang]['blockedTxt']}" style="cursor:help;">${iconSvg('lock',13)}</span>` : '';
                stepRow.innerHTML = `
                    <div class="step-left">
                        <input type="checkbox" data-index="${db.indexOf(item)}" ${item.Researched ? 'checked' : ''}>
                        <span>Lv. ${item.Level} ${lockIcon}</span>
                    </div>
                    <div class="step-right">${formatTime(item.discountedSeconds)}</div>`;
                stepsContainer.appendChild(stepRow);
            });
            box.appendChild(stepsContainer);
            rowDiv.appendChild(box);
        }
        if (rowDiv.children.length > 0) container.appendChild(rowDiv);
    });
}

function renderTrees() {
    const growthTbody = document.querySelector('#growth-table tbody');
    const economyTbody = document.querySelector('#economy-table tbody');
    const battleTbody = document.querySelector('#battle-table tbody');
    growthTbody.innerHTML = '';
    economyTbody.innerHTML = '';
    battleTbody.innerHTML = '';
    const lang = GlobalLang.get();
    let currentMaxLevels = getCurrentMaxLevels(db);
    let s = {
        Global: { b:0, w:0, s:0, i:0, g:0, t:0, total:0, done:0 },
        Growth: { b:0, w:0, s:0, i:0, g:0, t:0, total:0, done:0 },
        Economy: { b:0, w:0, s:0, i:0, g:0, t:0, total:0, done:0 },
        Battle: { b:0, w:0, s:0, i:0, g:0, t:0, total:0, done:0 }
    };
    db.forEach((item, index) => {
        let name = lang === 'FR' ? item['Fr Name'] : item['Name'];
        let avail = isAvailable(item, currentMaxLevels);
        let lockIcon = (!item.Researched && !avail) ? `<span title="${i18n[lang]['blockedTxt']}" style="font-size:14px;margin-left:6px;cursor:help;">${iconSvg('lock',14)}</span>` : '';
        let opacityStyle = (!item.Researched && !avail) ? 'opacity: 0.45;' : '';
        if (!inputs.hideCompleted.checked || !item.Researched) {
            let tr = document.createElement('tr');
            tr.style.cssText = opacityStyle;
            let costStr = `${resIc('wheat',13,lang)} ${formatNumber(item.Bread)} | ${resIc('tree-pine',13,lang)} ${formatNumber(item.Wood)} | ${resIc('brick-wall',13,lang)} ${formatNumber(item.Stone)} | ${resIc('pickaxe',13,lang)} ${formatNumber(item.iron)} | ${resIc('coins',13,lang)} ${formatNumber(item.Gold)}`;
            tr.innerHTML = `
                <td><input type="checkbox" data-index="${index}" ${item.Researched ? 'checked' : ''}> ${lockIcon}</td>
                <td>${name}</td>
                <td>${item.Level}</td>
                <td>${formatTime(item.baseSeconds)}</td>
                <td style="color:var(--success)">${formatTime(item.discountedSeconds)}</td>
                <td style="font-size:0.9em; color:var(--text-muted)">${costStr}</td>`;
            if (item.Tree === 'Growth') growthTbody.appendChild(tr);
            else if (item.Tree === 'Economy') economyTbody.appendChild(tr);
            else if (item.Tree === 'Battle') battleTbody.appendChild(tr);
        }
        s.Global.total++;
        if (s[item.Tree]) s[item.Tree].total++;
        if (item.Researched) {
            s.Global.done++;
            if (s[item.Tree]) s[item.Tree].done++;
        } else {
            s.Global.b += item.Bread; s.Global.w += item.Wood; s.Global.s += item.Stone; s.Global.i += item.iron; s.Global.g += item.Gold; s.Global.t += item.discountedSeconds;
            if(s[item.Tree]) {
                s[item.Tree].b += item.Bread; s[item.Tree].w += item.Wood; s[item.Tree].s += item.Stone; s[item.Tree].i += item.iron; s[item.Tree].g += item.Gold; s[item.Tree].t += item.discountedSeconds;
            }
        }
    });
    buildVisualTree('Growth', 'growth-visual');
    buildVisualTree('Economy', 'economy-visual');
    buildVisualTree('Battle', 'battle-visual');
    document.querySelectorAll('input[data-index]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            let idx = parseInt(e.target.getAttribute('data-index'));
            db[idx].Researched = e.target.checked;
            saveData();
            updateUI();
        });
    });
    const dash = document.getElementById('dashboard-container');
    dash.innerHTML = buildCardHtml(i18n[lang]['statGlobal'], s.Global, 'Global', lang) +
                     buildCardHtml(i18n[lang]['statGrowth'], s.Growth, 'Growth', lang) +
                     buildCardHtml(i18n[lang]['statEco'], s.Economy, 'Economy', lang) +
                     buildCardHtml(i18n[lang]['statBattle'], s.Battle, 'Battle', lang);
}

function renderOptimal() {
    const tbody = document.querySelector('#optimal-table tbody');
    tbody.innerHTML = '';
    const lang = GlobalLang.get();
    const isKvkMode = inputs.modeKvk.checked;
    const allowedTrees = [];
    if (inputs.treeGrowth.checked) allowedTrees.push('Growth');
    if (inputs.treeEconomy.checked) allowedTrees.push('Economy');
    if (inputs.treeBattle.checked) allowedTrees.push('Battle');
    let currentMaxLevels = getCurrentMaxLevels(db);
    let availablePool = db.filter(item => !item.Researched && allowedTrees.includes(item.Tree));
    let simMaxLevels = {...currentMaxLevels};
    let cumTime = 0;
    let displayItems = [];
    let extraCount = 0;
    let somethingUnlocked = true;
    while (availablePool.length > 0 && somethingUnlocked) {
        somethingUnlocked = false;
        let unlockedNow = availablePool.filter(item => isAvailable(item, simMaxLevels));
        if (unlockedNow.length === 0) break;
        unlockedNow.sort((a, b) => {
            if (Math.abs(a.discountedSeconds - b.discountedSeconds) > 0.1) return a.discountedSeconds - b.discountedSeconds;
            if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
            return a.Level - b.Level;
        });
        let picked = unlockedNow[0];
        cumTime += picked.discountedSeconds;
        let canAfford = isKvkMode ? (cumTime <= totalAccSeconds) : true;
        if (canAfford) {
            if (displayItems.length < 8) displayItems.push(picked);
            else if (isKvkMode) extraCount++;
            else if (!isKvkMode && displayItems.length >= 8) break;
            if (picked.Level > (simMaxLevels[picked.Name] || 0)) simMaxLevels[picked.Name] = picked.Level;
            availablePool = availablePool.filter(d => d !== picked);
            somethingUnlocked = true;
        } else break;
    }
    if (displayItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--warning)">${i18n[lang]['msgNoResearch']}</td></tr>`;
        return;
    }
    displayItems.forEach((item, idx) => {
        let name = lang === 'FR' ? item['Fr Name'] : item['Name'];
        let treeName = item.Tree;
        if(lang === 'FR') {
            if(treeName === 'Growth') treeName = 'Expansion';
            if(treeName === 'Economy') treeName = 'Économie';
            if(treeName === 'Battle') treeName = 'Combat';
        }
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx + 1}</td><td style="font-weight:bold;color:var(--accent)">${name}</td><td>${item.Level}</td><td>${formatTime(item.discountedSeconds)}</td><td>${treeName}</td>`;
        tbody.appendChild(tr);
    });
    if (extraCount > 0 && isKvkMode) {
        let msg = i18n[lang]['msgMore'].replace('{n}', extraCount);
        let tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align:center;color:var(--text-muted);font-style:italic">${msg}</td>`;
        tbody.appendChild(tr);
    }
}

function updateUI() {
    applyTranslations();
    calculateState();
    renderTrees();
    renderOptimal();
}

// ============ EVENT LISTENERS ============
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        let targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        let displayGroup = document.getElementById('display-options-group');
        let optimalGroup = document.getElementById('optimal-options-group');
        if (targetId === 'tab-optimal') {
            displayGroup.style.display = 'none';
            optimalGroup.style.display = 'block';
        } else {
            displayGroup.style.display = 'flex';
            optimalGroup.style.display = 'none';
        }
    });
});

document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let targetTree = e.target.getAttribute('data-target');
        let isTreeBtn = e.target.classList.contains('tree-btn');
        document.querySelectorAll(`[data-target="${targetTree}"].toggle-btn`).forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        let visualDiv = document.getElementById(`${targetTree}-visual`);
        let tableDiv = document.getElementById(`${targetTree}-table`);
        if (isTreeBtn) { visualDiv.classList.add('active'); tableDiv.classList.remove('active'); }
        else { visualDiv.classList.remove('active'); tableDiv.classList.add('active'); }
    });
});

Object.values(inputs).forEach(input => {
    input.addEventListener('change', () => { saveData(); updateUI(); });
    if (input.type === 'number') {
        input.addEventListener('input', () => { saveData(); updateUI(); });
    }
});

document.getElementById('reset-button').addEventListener('click', () => {
    const lang = GlobalLang.get();
    const confirmMsg = lang === 'FR' ? "Êtes-vous sûr de vouloir réinitialiser toutes vos cases cochées et paramètres ?" : "Are you sure you want to reset all checkboxes and settings to defaults?";
    showAppConfirm(confirmMsg, () => {
        localStorage.removeItem(STORAGE_KEYS.researchDb);
        localStorage.removeItem(STORAGE_KEYS.researchInputs);
        location.reload();
    });
});

window.addEventListener('langChanged', updateUI);

// ============ STARTUP ============
(async function startup() {
    await loadInitialDb();   // 1. Charger le JSON
    initData();              // 2. Initialiser depuis le JSON ou localStorage
    updateUI();              // 3. Afficher
})();
