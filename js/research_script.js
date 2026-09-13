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
        'baseBonus': 'Base Research Bonus (%)', 'chiefMinister': 'Chief Minister (+10%)',
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
        'quickSelect': 'Quick Select', 'autoReqs': 'Auto-check prerequisites',
        'autoReqsHint': 'Checking a research also checks everything it requires. Unchecking also clears what depends on it.',
        'toastReqs': '{n} prerequisite(s) auto-checked',
        'toastDeps': '{n} dependent research(es) unchecked',
        'msgNoResearch': 'No research available or insufficient time',
        'msgMore': '+ {n} other possible research(es)', 'statGlobal': 'All Researches',
        'statGrowth': 'Growth Tree', 'statEco': 'Economy Tree', 'statBattle': 'Battle Tree',
        'timeTitle': 'Time: ', 'stepTxt': 'step', 'forTxt': 'for',
        'nextSuggTxt': 'Suggestion for next research:', 'completedTxt': 'Completed !',
        'blockedTxt': 'Locked (Missing prerequisites)', 'dataManagement': 'Data Management',
        'resetBtn': 'Reset to Defaults', 'btnTree': 'Visual Tree', 'btnTable': 'List View',
        'colSuggAction': 'Action', 'btnDone': 'Done',
        'btnDoneTitle': 'Tick this research off. What it required gets ticked too.',
        'btnDoneAria': 'Done: {name}, step {n}',
        'toastDone': '{name} ticked off', 'toastDoneReqs': '{name} ticked off, plus {n} prerequisite(s)',
        'speedBadge': 'Speed',
        'speedBadgeTitle': 'Raises research speed: everything you start after it takes less time, so it comes first.',
        'suggHint': 'Researches that raise research speed are flagged and come first: everything you start after them is shorter. KVK mode goes back to shortest first, to finish as many as it can.',
        'kvkLongSep': 'Last one, once the short ones are done: the longest research you can reach. KVK speed bonuses take far more off it than off a short one.',
        'kvkLongOnly': 'Your speedups do not finish a single research. Launch the longest one you can reach: KVK speed bonuses take far more off it than off a short one.',
        'kvkLongLeft': ' You still have {t} of speedups to put into it.',
        'confirmDone': 'Ticking \u201C{name}\u201D also ticks the {n} research(es) it required: {list}. Go ahead?'
    },
    'FR': {
        'controlPanel': 'Panneau de Contrôle', 'settings': 'Paramètres', 'language': 'Langue',
        'baseBonus': 'Bonus de base (%)', 'chiefMinister': 'Ministre en Chef (+10%)',
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
        'quickSelect': 'Sélection rapide', 'autoReqs': 'Prérequis automatiques',
        'autoReqsHint': 'Cocher une recherche coche aussi tout ce qu\'elle exige. Décocher retire aussi ce qui en dépend.',
        'toastReqs': '{n} prérequis coché(s) automatiquement',
        'toastDeps': '{n} recherche(s) dépendante(s) décochée(s)',
        'msgNoResearch': 'Aucune recherche disponible ou temps insuffisant',
        'msgMore': '+ {n} autre(s) recherche(s) possible(s)',
        'statGlobal': 'Toutes les recherches', 'statGrowth': 'Arbre Expansion',
        'statEco': 'Arbre Économie', 'statBattle': 'Arbre Combat',
        'timeTitle': 'Temps : ', 'stepTxt': 'étape', 'forTxt': 'pour',
        'nextSuggTxt': 'Suggestion de prochaine recherche :', 'completedTxt': 'Terminé !',
        'blockedTxt': 'Bloqué (Prérequis manquants)', 'dataManagement': 'Gestion des Données',
        'resetBtn': 'Réinitialiser', 'btnTree': 'Arbre Visuel', 'btnTable': 'Vue Liste',
        'colSuggAction': 'Action', 'btnDone': 'Fait',
        'btnDoneTitle': 'Cocher cette recherche. Ce qu\'elle exigeait est coché avec.',
        'btnDoneAria': 'Fait : {name}, étape {n}',
        'toastDone': '{name} cochée', 'toastDoneReqs': '{name} cochée, plus {n} prérequis',
        'speedBadge': 'Vitesse',
        'speedBadgeTitle': 'Augmente la vitesse de recherche : tout ce que tu lances ensuite prend moins de temps, elle passe donc en tête.',
        'suggHint': 'Les recherches qui augmentent la vitesse de recherche portent un repère et passent en tête : tout ce qui vient après est plus court. Le mode KVK revient au plus court d\'abord, pour en finir un maximum.',
        'kvkLongSep': 'En dernier, une fois les courtes finies : la plus longue recherche à ta portée. Les bonus de vitesse du KVK lui retirent bien plus de temps qu\'à une courte.',
        'kvkLongOnly': 'Ton stock d\'accélérateurs ne finit aucune recherche. Lance la plus longue à ta portée : les bonus de vitesse du KVK lui retirent bien plus de temps qu\'à une courte.',
        'kvkLongLeft': ' Il te reste {t} d\'accélérateurs à y mettre.',
        'confirmDone': 'Cocher « {name} » coche aussi les {n} recherche(s) qu\'elle exigeait : {list}. On continue ?'
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
    hideCompleted: document.getElementById('hide-completed'),
    autoReqs: document.getElementById('auto-reqs')
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
        // L'alerte était en français seulement, sur un site bilingue, et elle recopiait
        // le message d'exception à l'écran. Le bandeau dit la même chose dans les deux
        // langues, avec un bouton Réessayer ; le détail technique reste en console.
        if (!initialDb || initialDb.length === 0) {
            if (window.ktWarnDataFailure) window.ktWarnDataFailure();
        }
    }
}

function initData() {
    const savedDb = safeParse(STORAGE_KEYS.researchDb, null);
    if (Array.isArray(savedDb)) {
        try {
            db = savedDb;
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

    const parsedInputs = safeParse(STORAGE_KEYS.researchInputs, null);
    if (parsedInputs && typeof parsedInputs === 'object') {
        // Le bonus de base se saisissait en fraction (0,753) ; il se saisit maintenant
        // en pourcentage (75,3), comme sur TrueGold et l'Académie de Guerre. Les réglages
        // enregistrés avant ce changement sont convertis une fois, au chargement — sans
        // quoi un 0,753 déjà en place serait relu comme 0,753 % et fausserait tous les temps.
        if (!parsedInputs.bonusAsPercent && parsedInputs.baseBonus !== undefined) {
            parsedInputs.baseBonus = (parseFloat(parsedInputs.baseBonus) || 0) * 100;
        }
        // Un champ par tour, chacun sous sa propre garde. Le `catch(e) {}` global
        // d'avant abandonnait la restauration là où elle levait : les premiers
        // champs portaient les valeurs du joueur, les suivants celles du HTML,
        // et rien ne permettait de les distinguer à l'écran.
        Object.keys(parsedInputs).forEach(key => {
            const el = inputs[key];
            if (!el) return;
            try {
                if (el.type === 'checkbox') el.checked = parsedInputs[key];
                else el.value = parsedInputs[key];
            } catch (e) { console.warn('réglage non restauré :', key, e); }
        });
    }
}

function saveData() {
    try { localStorage.setItem(STORAGE_KEYS.researchDb, JSON.stringify(db)); } catch (e) { if (window.ktWarnUnsaved) window.ktWarnUnsaved(); }
    const inputsState = { bonusAsPercent: true };
    Object.keys(inputs).forEach(key => {
        inputsState[key] = inputs[key].type === 'checkbox' ? inputs[key].checked : inputs[key].value;
    });
    try { localStorage.setItem(STORAGE_KEYS.researchInputs, JSON.stringify(inputsState)); } catch (e) { if (window.ktWarnUnsaved) window.ktWarnUnsaved(); }
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
    let bonus = (parseFloat(inputs.baseBonus.value) || 0) / 100;
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

// ============ SÉLECTION RAPIDE (prérequis automatiques) ============
// Mêmes règles que isAvailable : un niveau exige les niveaux inférieurs du
// même nom + ses `reqs` (récursivement). item.Researched est déjà posé par
// le handler ; les deux fonctions retournent le nombre de cases modifiées EN PLUS.

// Les recherches que la chaîne de prérequis de l'item cocherait en plus de lui.
// Séparé de la pose des cases : l'onglet « Ordre de recherche » a besoin de la
// liste AVANT de cocher, pour la montrer au joueur.
function pendingReqsOf(item) {
    const need = {};   // par nom de recherche : niveau max requis
    const queue = [];
    const require = (name, level) => {
        if ((need[name] || 0) < level) { need[name] = level; queue.push(name); }
    };
    require(item.Name, item.Level);
    while (queue.length) {
        const name = queue.pop();
        const upTo = need[name];
        db.forEach(e => {
            if (e.Name !== name || e.Level > upTo || !e.reqs) return;
            e.reqs.forEach(r => require(r.name, r.level));
        });
    }
    return db.filter(e => e !== item && !e.Researched && e.Level <= (need[e.Name] || 0));
}

// Coche toute la chaîne de prérequis de l'item.
function cascadeCheckReqs(item) {
    const pending = pendingReqsOf(item);
    pending.forEach(e => { e.Researched = true; });
    return pending.length;
}

// Décoche tout ce qui dépend de l'item (niveaux supérieurs du même nom +
// recherches dont un prérequis n'est plus couvert), par passes jusqu'à stabilité.
function cascadeUncheckDeps(item) {
    const removed = {};   // par nom : plus petit niveau devenu indisponible
    removed[item.Name] = item.Level;
    let count = 0;
    let changed = true;
    while (changed) {
        changed = false;
        db.forEach(e => {
            if (!e.Researched) return;
            let broken = removed[e.Name] !== undefined && e.Level >= removed[e.Name];
            if (!broken && e.reqs) {
                broken = e.reqs.some(r => removed[r.name] !== undefined && r.level >= removed[r.name]);
            }
            if (!broken) return;
            e.Researched = false;
            count++;
            if (removed[e.Name] === undefined || e.Level < removed[e.Name]) removed[e.Name] = e.Level;
            changed = true;
        });
    }
    return count;
}

// ============ VITESSE DE RECHERCHE ============
// « Amélioration des Outils » est la seule branche qui augmente la vitesse de
// recherche : tout ce qui est lancé après elle est plus court, donc elle passe
// devant. On la reconnaît au nom anglais, le seul stable (la base écrit son
// niveau V « Amélioration de l'outil V » et les autres « des outils »).
const SPEED_RESEARCH_PREFIXES = ['Tool Enhancement'];

function isSpeedResearch(item) {
    return SPEED_RESEARCH_PREFIXES.some(prefix => item.Name.startsWith(prefix));
}

// Icônes posées ici plutôt que dans le registre de site-config.js : sans
// cache-busting, un visiteur peut avoir ce fichier neuf et site-config.js
// encore en cache, et l'icône sortirait vide (cf. MAP §9).
const RS_ICONS = {
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>'
};

function rsIcon(name, size) {
    return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${RS_ICONS[name] || ''}</svg>`;
}

// Repère posé sur les recherches de vitesse. En version compacte (en-tête de
// carte dans l'arbre visuel) l'éclair reste seul : la place y est comptée. Il
// lui faut alors `role="img"` pour porter son nom — sur un <span> nu, aria-label
// n'est pas restitué, et le repère ne serait qu'une image muette au lecteur
// d'écran. En version longue le libellé visible suffit, il n'y a rien à ajouter.
function speedBadgeHtml(lang, compact) {
    const label = i18n[lang]['speedBadge'];
    const title = i18n[lang]['speedBadgeTitle'];
    if (compact) {
        return `<span class="sugg-speed is-compact" role="img" title="${title}" aria-label="${label}">${rsIcon('zap', 12)}</span>`;
    }
    return `<span class="sugg-speed" title="${title}">${rsIcon('zap', 12)}<span>${label}</span></span>`;
}

// Ordre des suggestions. `speedFirst` fait remonter la vitesse de recherche en
// tête ; il est coupé en mode KVK, où l'objectif est de finir un maximum de
// recherches avec le stock d'accélérateurs, pas d'investir pour plus tard.
// Le reste du tri ne sert qu'à le rendre stable d'un rendu à l'autre.
function compareCandidates(a, b, speedFirst) {
    if (speedFirst) {
        const rank = (item) => (isSpeedResearch(item) ? 0 : 1);
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
    }
    if (Math.abs(a.discountedSeconds - b.discountedSeconds) > 0.1) return a.discountedSeconds - b.discountedSeconds;
    if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
    return a.Level - b.Level;
}

function getNextSuggestion(treeKey, lang) {
    let currentMaxLevels = getCurrentMaxLevels(db);
    let unresearched = db.filter(d => !d.Researched && (treeKey === 'Global' || d.Tree === treeKey));
    let unlockedNow = unresearched.filter(item => isAvailable(item, currentMaxLevels));
    if (unlockedNow.length === 0) return null;
    unlockedNow.sort((a, b) => compareCandidates(a, b, !inputs.modeKvk.checked));
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
            let speedMark = isSpeedResearch(items[0]) ? speedBadgeHtml(lang, true) : '';
            let header = document.createElement('div');
            header.className = 'research-box-header';
            header.innerHTML = `<span>${speedMark}${displayName}</span> <span>(${doneCount}/${totalCount})</span>`;
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
                <td>${name}${isSpeedResearch(item) ? speedBadgeHtml(lang, false) : ''}</td>
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
            const item = db[idx];
            item.Researched = e.target.checked;
            let autoCount = 0;
            if (inputs.autoReqs.checked) {
                autoCount = e.target.checked ? cascadeCheckReqs(item) : cascadeUncheckDeps(item);
            }
            saveData();
            updateUI();
            if (autoCount > 0) {
                const key = e.target.checked ? 'toastReqs' : 'toastDeps';
                showAppToast(i18n[GlobalLang.get()][key].replace('{n}', autoCount));
            }
        });
    });
    const dash = document.getElementById('dashboard-container');
    dash.innerHTML = buildCardHtml(i18n[lang]['statGlobal'], s.Global, 'Global', lang) +
                     buildCardHtml(i18n[lang]['statGrowth'], s.Growth, 'Growth', lang) +
                     buildCardHtml(i18n[lang]['statEco'], s.Economy, 'Economy', lang) +
                     buildCardHtml(i18n[lang]['statBattle'], s.Battle, 'Battle', lang);
}

// ============ ORDRE DE RECHERCHE ============
// Construit le plan affiché dans l'onglet. Fonction pure : elle ne lit que ce
// qu'on lui passe, ne touche ni au DOM ni aux réglages, et rend tout ce que le
// rendu a besoin de savoir. C'est là que vivent les deux règles de l'onglet.
function rsPlanOptimal(opts) {
    const kvk = !!opts.kvk;
    const maxRows = opts.maxRows || 8;
    const budget = opts.budgetSeconds || 0;
    const source = opts.db || db;
    const allowedTrees = opts.allowedTrees || [];
    const simMaxLevels = { ...getCurrentMaxLevels(source) };
    let pool = source.filter(item => !item.Researched && allowedTrees.includes(item.Tree));
    const rows = [];
    let extraCount = 0;
    let plannedTime = 0;

    while (pool.length > 0) {
        // Hors KVK la liste n'est qu'une suite d'idées : elle s'arrête au nombre
        // de lignes affichées. En KVK c'est un plan financé, on le déroule en
        // entier pour savoir combien de recherches le stock paie vraiment.
        if (!kvk && rows.length >= maxRows) break;
        const unlocked = pool.filter(item => isAvailable(item, simMaxLevels));
        if (unlocked.length === 0) break;
        unlocked.sort((a, b) => compareCandidates(a, b, !kvk));
        const picked = unlocked[0];
        if (kvk && plannedTime + picked.discountedSeconds > budget) break;
        plannedTime += picked.discountedSeconds;
        if (rows.length < maxRows) rows.push(picked);
        else extraCount++;
        if (picked.Level > (simMaxLevels[picked.Name] || 0)) simMaxLevels[picked.Name] = picked.Level;
        pool = pool.filter(d => d !== picked);
    }

    // Une dernière recherche est lancée AU-DELÀ du stock, et c'est la plus longue
    // à portée. Pendant un KVK des bonus de vitesse s'ajoutent : ils retirent
    // d'autant plus de temps que la recherche est longue, donc c'est celle-là
    // qu'on laisse tourner pendant que les accélérateurs finissent les courtes.
    let longItem = null;
    if (kvk) {
        const reachable = pool.filter(item => isAvailable(item, simMaxLevels));
        reachable.sort((a, b) => {
            if (Math.abs(a.discountedSeconds - b.discountedSeconds) > 0.1) return b.discountedSeconds - a.discountedSeconds;
            if (a.Name !== b.Name) return a.Name.localeCompare(b.Name);
            return a.Level - b.Level;
        });
        longItem = reachable[0] || null;
    }

    return { rows, extraCount, longItem, plannedTime, leftover: Math.max(0, budget - plannedTime) };
}

function treeLabel(tree, lang) {
    if (lang !== 'FR') return tree;
    if (tree === 'Growth') return 'Expansion';
    if (tree === 'Economy') return 'Économie';
    if (tree === 'Battle') return 'Combat';
    return tree;
}

function suggRowCells(item, rank, lang) {
    const name = lang === 'FR' ? item['Fr Name'] : item['Name'];
    const badge = isSpeedResearch(item) ? speedBadgeHtml(lang, false) : '';
    const tree = treeLabel(item.Tree, lang);
    const btnLabel = i18n[lang]['btnDone'];
    // L'arbre est repris sous le nom : sous 600px sa colonne est repliée, sans
    // quoi le bouton d'action sortait de l'écran et il fallait faire défiler le
    // tableau de côté pour l'atteindre.
    return `<td>${rank}</td>
            <td style="font-weight:bold;color:var(--accent)">${name}${badge}<span class="sugg-tree-sm">${tree}</span></td>
            <td>${item.Level}</td>
            <td>${formatTime(item.discountedSeconds)}</td>
            <td>${tree}</td>
            <td><button type="button" class="sugg-done-btn" data-done-index="${db.indexOf(item)}" title="${i18n[lang]['btnDoneTitle']}" aria-label="${i18n[lang]['btnDoneAria'].replace('{name}', name).replace('{n}', item.Level)}">${rsIcon('check', 14)}<span>${btnLabel}</span></button></td>`;
}

function itemName(item, lang) {
    return lang === 'FR' ? item['Fr Name'] : item['Name'];
}

function applySuggestionDone(item, extra) {
    item.Researched = true;
    cascadeCheckReqs(item);
    saveData();
    const lang = GlobalLang.get();
    updateUI();
    // Le tableau vient d'être reconstruit : sans ça le focus clavier retombe sur
    // <body> et il faut retraverser la page pour valider la suggestion suivante.
    const next = document.querySelector('#optimal-table .sugg-done-btn');
    if (next) next.focus();
    const key = extra > 0 ? 'toastDoneReqs' : 'toastDone';
    showAppToast(i18n[lang][key].replace('{name}', itemName(item, lang)).replace('{n}', extra));
}

// Valider une suggestion depuis la liste. Une recherche cochée sans ses prérequis
// laisserait une base incohérente, donc la chaîne est cochée avec elle. C'est
// sans effet sur la 1re ligne, toujours disponible ; en sauter, en revanche,
// coche d'un coup ce qu'on n'a pas lu, et rien ne le défait en un clic : dans ce
// cas seulement, on dit ce qui va être coché avant de le faire.
function markSuggestionDone(index) {
    const item = db[index];
    // Un index hors base ne peut venir que d'un bug de rendu, et sans ce message
    // il ne se verrait qu'à un bouton qui ne fait rien, sans rien en console.
    if (!item) { console.warn('recherche introuvable dans la base :', index); return; }
    if (item.Researched) return;   // déjà cochée entre-temps : rien à faire
    const pending = pendingReqsOf(item);
    if (pending.length === 0) { applySuggestionDone(item, 0); return; }
    const lang = GlobalLang.get();
    const shown = pending.slice(0, 5).map(e => `${itemName(e, lang)} ${i18n[lang]['stepTxt']} ${e.Level}`);
    if (pending.length > shown.length) shown.push('...');
    showAppConfirm(
        i18n[lang]['confirmDone']
            .replace('{name}', itemName(item, lang))
            .replace('{n}', pending.length)
            .replace('{list}', shown.join(', ')),
        () => applySuggestionDone(item, pending.length)
    );
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

    const plan = rsPlanOptimal({
        kvk: isKvkMode,
        allowedTrees: allowedTrees,
        budgetSeconds: totalAccSeconds,
        maxRows: 8
    });

    if (plan.rows.length === 0 && !plan.longItem) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--warning)">${i18n[lang]['msgNoResearch']}</td></tr>`;
        return;
    }

    plan.rows.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = suggRowCells(item, idx + 1, lang);
        tbody.appendChild(tr);
    });

    if (plan.extraCount > 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center;color:var(--text-muted);font-style:italic">${i18n[lang]['msgMore'].replace('{n}', plan.extraCount)}</td>`;
        tbody.appendChild(tr);
    }

    if (plan.longItem) {
        // Le reste est arrondi : formatTime rend une chaîne vide sous la seconde,
        // et un plan qui tombe juste écrivait « il te reste  d'accélérateurs ».
        const leftover = Math.round(plan.leftover);
        let note = plan.rows.length === 0 ? i18n[lang]['kvkLongOnly'] : i18n[lang]['kvkLongSep'];
        if (leftover >= 1) note += i18n[lang]['kvkLongLeft'].replace('{t}', formatTime(leftover));
        const sep = document.createElement('tr');
        sep.className = 'sugg-sep';
        sep.innerHTML = `<td colspan="6">${note}</td>`;
        tbody.appendChild(sep);
        const tr = document.createElement('tr');
        tr.className = 'sugg-long';
        tr.innerHTML = suggRowCells(plan.longItem, plan.rows.length + plan.extraCount + 1, lang);
        tbody.appendChild(tr);
    }

    tbody.querySelectorAll('button[data-done-index]').forEach(btn => {
        btn.addEventListener('click', () => markSuggestionDone(parseInt(btn.getAttribute('data-done-index'), 10)));
    });
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
        let selectionGroup = document.getElementById('selection-options-group');
        let optimalGroup = document.getElementById('optimal-options-group');
        if (targetId === 'tab-optimal') {
            displayGroup.style.display = 'none';
            selectionGroup.style.display = 'none';
            optimalGroup.style.display = 'block';
        } else {
            displayGroup.style.display = 'flex';
            selectionGroup.style.display = 'flex';
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

function rsInitHelp() {
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id: 'research', banner: true, anchor: '[data-i18n="controlPanel"]',
        title: { FR: 'Recherche : Aide', EN: 'Research: Help' },
        summary: {
            FR: "Détermine l'ordre de recherche le plus rentable parmi tes trois arbres (Croissance, Économie, Combat), en tenant compte de ton bonus de vitesse de recherche et de tes accélérateurs.",
            EN: "Works out the most efficient research order across your three trees (Growth, Economy, Battle), based on your research speed bonus and your available speedups."
        },
        steps: {
            FR: [
                "Renseigne ton bonus de vitesse de recherche : bonus de base + Premier Ministre (+10%), KVK (+5%), Royaume (+10%). Le « Bonus total » s'affiche automatiquement.",
                "Choisis l'arbre cible (Croissance, Économie ou Combat) pour filtrer les suggestions, ou consulte l'onglet de chaque arbre.",
                "Première mise en place : sur un onglet d'arbre, active « Sélection rapide » (panneau latéral) puis coche directement le plus haut niveau atteint de chaque recherche, et tous ses prérequis se cochent d'un coup. Décocher retire de même ce qui en dépend.",
                "L'onglet « Ordre de recherche optimal » propose les prochaines recherches à faire, classées de la plus rentable à la moins rentable (temps réduit par ton bonus). Le bouton « Fait » de chaque ligne la coche sans passer par l'arbre, avec tout ce qu'elle exigeait.",
                "Les niveaux d'« Amélioration des Outils » portent un éclair et passent en tête : ils augmentent la vitesse de recherche, donc tout ce que tu lances ensuite est plus court. L'outil les propose dès qu'ils sont débloqués, il ne force pas la suite de prérequis qui y mène.",
                "Active le « Mode KVK » et renseigne tes accélérateurs (jours / heures / minutes) pour ne voir que ce que tu peux réellement terminer avec ton stock : l'outil indique aussi combien de recherches supplémentaires seraient possibles au-delà. La priorité à la vitesse y est levée, l'objectif étant d'en finir un maximum.",
                "En mode KVK, la dernière ligne dépasse volontairement ton stock : c'est la plus longue recherche à ta portée, à lancer une fois les courtes finies. Les bonus de vitesse du KVK lui retirent bien plus de temps qu'à une courte.",
                "Active « Masquer terminées » pour ne garder que ce qu'il te reste à faire."
            ],
            EN: [
                "Set your research speed bonus: base bonus + Chief Minister (+10%), KVK (+5%), Kingdom (+10%). The “Total Bonus” updates automatically.",
                "Pick a target tree (Growth, Economy or Battle) to filter the suggestions, or browse each tree's tab.",
                "First-time setup: on a tree tab, turn on “Quick Select” (side panel) then tick the highest level you've reached in each research, and all its prerequisites get ticked at once. Unticking likewise clears what depends on it.",
                "The “Optimal Search Order” tab lists the next researches to do, ranked from most to least efficient (time reduced by your bonus). The “Done” button on each row ticks it off without going through the tree, along with everything it required.",
                "“Tool Enhancement” levels carry a lightning bolt and come first: they raise research speed, so everything you start after them is shorter. The tool offers them as soon as they unlock, it does not force the chain of prerequisites leading to them.",
                "Turn on “KVK Mode” and enter your speedups (days / hours / minutes) to see only what you can actually finish within your stock: it also tells you how many more researches would be possible beyond that. Speed priority is lifted there, the goal being to finish as many as you can.",
                "In KVK mode the last row goes past your stock on purpose: it is the longest research you can reach, to launch once the short ones are done. KVK speed bonuses take far more off it than off a short one.",
                "Turn on “Hide completed” to keep only what's left to do."
            ]
        }
    });
}

// ============ STARTUP ============
(async function startup() {
    await loadInitialDb();   // 1. Charger le JSON
    initData();              // 2. Initialiser depuis le JSON ou localStorage
    updateUI();              // 3. Afficher
    rsInitHelp();            // 4. Aide / onboarding
})();
