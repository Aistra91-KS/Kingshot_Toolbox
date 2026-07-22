// ========================================
// BEAR TRAP OPTIMIZER - Logique & Langue
// ========================================

const i18nBearTrap = {
    FR: {
        titleParams: "Paramètres",
        tipBase: "Capacité de marche de base, AVANT bonus (troupes envoyées par marche).",
        tipExp: "Bonus de capacité d'escouade apporté par la compétence « Avantage primitif » de Valora. Rempli automatiquement depuis la page Experts, mais tu peux toujours modifier la valeur.",
        tipAni: "Bonus de capacité d'escouade apporté par la compétence du Puissant Bison. Rempli automatiquement depuis la page Familiers, mais tu peux toujours modifier la valeur.",
        tipGen: "Génération de ton serveur : influence les paliers de troupes pris en compte.",
        tipLimit: "Nombre max de troupes envoyables par marche (limite imposée par l'alliance).",
        tipMinInf: "Part minimale d'infanterie imposée dans chaque marche générée (mode Seuils Mini).",
        tipMinCav: "Part minimale de cavalerie imposée dans chaque marche générée (mode Seuils Mini).",
        tipHeroes: "Chaque marche est menée par des héros. Le niveau du capitaine fixe la capacité de la marche. Les niveaux viennent de la page « Ma Caserne ».",
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
        lblGen: "Génération du serveur", 
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
        txtGen: "Marches générées automatiquement selon vos troupes restantes et vos héros.",
        txtRef: "Capacité théorique de référence (pour vos %) :",
        studioTitle: "Marches Personnalisées",
        btnAddCustom: "+ Nouvelle marche",
        modalTitle: "Marche Personnalisée",
        modalName: "Nom de la marche",
        plcName: "ex: Marche #1",
        optNum: "Nombres",
        optPerc: "Pourcentage (%)",
        modalIsHost: "Je suis l'hôte du rally (Organisateur)",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        errMaxMarches: "Vous avez atteint le nombre maximum de marches.",
        errExceedCap: "Cette marche dépasse votre capacité maximale !",
        errNoTroopsForCustom: "Vous n'avez pas assez de troupes globales pour créer cette marche.",
        noCaptain: "Aucun capitaine disponible",
        txtUsed: "utilisées",
        lblHost: "(Hôte)",
        modalHeroes: "Héros de la marche",
        btnSuggest: "🪄 Suggérer",
        optNone: "Aucun",
        txtAvailable: "Disponibles :",
        errDuplicateHero: "Un héros ne peut être sélectionné qu'une seule fois dans la même marche.",
        linkAuto: "Auto",
        linkManual: "Manuel",
        linkNoSource: "Auto (non configuré)",
        linkSync: "Resynchroniser sur la compétence",
        srcValora: "Valora — Avantage primitif",
        srcBison: "Puissant Bison",
        joinerAuthBtn: "🛡️ Héros autorisés",
        joinerAuthTitle: "Héros joiners autorisés",
        joinerAuthDesc: "Coche les héros que ton alliance autorise en renfort. La liste s'adapte à la génération de serveur choisie. Les héros classés C et D sont décochés par défaut.",
        joinerReset: "Recommandés par défaut",
        joinerNotRec: "Non recommandé",
        joinerLocked: "non débloqué",
        joinerEmpty: "Aucun héros joiner pour cette génération.",
        btnClose: "Fermer"
    },
    EN: {
        titleParams: "Settings",
        tipBase: "Base march capacity, BEFORE bonuses (troops sent per march).",
        tipExp: "Squad capacity bonus from Valora's “Savage Advantage” skill. Auto-filled from the Masters page, but you can always edit the value.",
        tipAni: "Squad capacity bonus from the Mighty Bison's skill. Auto-filled from the Pets page, but you can always edit the value.",
        tipGen: "Your server generation: affects which troop tiers are considered.",
        tipLimit: "Max troops sendable per march (cap set by your alliance).",
        tipMinInf: "Minimum infantry share enforced in each generated march (Min Thresholds mode).",
        tipMinCav: "Minimum cavalry share enforced in each generated march (Min Thresholds mode).",
        tipHeroes: "Each march is led by heroes. The captain's level sets the march capacity. Levels come from the “My Barracks” page.",
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
        lblGen: "Server Generation", 
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
        thCap: "Config Capacity",
        thTotal: "Total",
        txtGen: "Marches generated automatically based on your remaining troops and heroes.",
        txtRef: "Theoretical reference capacity (for your %):",
        studioTitle: "Custom Marches",
        btnAddCustom: "+ New March",
        modalTitle: "Custom March",
        modalName: "March Name",
        plcName: "e.g., March #1",
        optNum: "Numbers",
        optPerc: "Percentage (%)",
        modalIsHost: "I am hosting the rally (Organizer)",
        btnCancel: "Cancel",
        btnSave: "Save",
        errMaxMarches: "You have reached the maximum number of marches.",
        errExceedCap: "This march exceeds your maximum capacity!",
        errNoTroopsForCustom: "You don't have enough global troops to create this march.",
        noCaptain: "No captain available",
        txtUsed: "used",
        lblHost: "(Host)",
        modalHeroes: "March Heroes",
        btnSuggest: "🪄 Suggest",
        optNone: "None",
        txtAvailable: "Available:",
        errDuplicateHero: "A hero can only be selected once in the same march.",
        linkAuto: "Auto",
        linkManual: "Manual",
        linkNoSource: "Auto (not set)",
        linkSync: "Re-sync from the skill",
        srcValora: "Valora — Savage Advantage",
        srcBison: "Mighty Bison",
        joinerAuthBtn: "🛡️ Allowed heroes",
        joinerAuthTitle: "Allowed joiner heroes",
        joinerAuthDesc: "Tick the heroes your alliance allows as rally joiners. The list follows the server generation you selected. Heroes ranked C and D are unchecked by default.",
        joinerReset: "Reset to recommended",
        joinerNotRec: "Not recommended",
        joinerLocked: "locked",
        joinerEmpty: "No joiner hero for this generation.",
        btnClose: "Close"
    }
};

let customMarchesList = [];
let editingMarchId = null;
let heroesDB = [];

// ========================================
// TIER-LIST DES HÉROS JOINERS (rang par génération) + AUTORISATIONS ALLIANCE
// ----------------------------------------
// Référence : data/beartrap_joiners_db.json (tier-list communautaire : par
// génération de serveur puis rang S>A>B>C>D, IDs = heroes_db.json).
// - Le rang affine la recommandation (départage final, APRÈS niveau + compétences).
// - Le menu « Héros autorisés » laisse l'utilisateur choisir quels joiners son
//   alliance permet ; C et D sont décochés par défaut. Persisté par génération.
// ========================================
let joinersTierDB = null;              // { byGeneration: { "6": {S:[ids], ...} } }
let joinerAuth = {};                   // { [gen]: { [heroId]: true|false } } (choix explicites)
const RANK_ORDER = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function currentGen() {
    const el = document.getElementById('server-generation');
    return el ? (parseInt(el.value, 10) || 6) : 6;
}
// rang 'S'..'D' d'un héros pour une génération, ou null si absent de la tier-list
function tierRankOf(heroId, gen) {
    const g = joinersTierDB && joinersTierDB.byGeneration && joinersTierDB.byGeneration[String(gen)];
    if (!g) return null;
    for (const rk of ['S', 'A', 'B', 'C', 'D']) if (g[rk] && g[rk].indexOf(heroId) !== -1) return rk;
    return null;
}
function tierScoreOf(heroId, gen) { const r = tierRankOf(heroId, gen); return r ? RANK_ORDER[r] : 99; }
// recommandé par défaut = S / A / B (C et D décochés)
function isRecommended(rank) { return rank === 'S' || rank === 'A' || rank === 'B'; }
// état d'autorisation résolu (choix explicite sinon défaut selon le rang)
function isHeroAuthorized(heroId, gen) {
    const rank = tierRankOf(heroId, gen);
    if (!rank) return false;                       // hors tier-list de cette gen = pas un joiner
    const g = joinerAuth[String(gen)] || {};
    if (Object.prototype.hasOwnProperty.call(g, heroId)) return !!g[heroId];
    return isRecommended(rank);
}
function setHeroAuthorized(heroId, gen, allowed) {
    const key = String(gen);
    if (!joinerAuth[key]) joinerAuth[key] = {};
    joinerAuth[key][heroId] = allowed;
    saveJoinerAuth();
}
function resetJoinerAuth(gen) { delete joinerAuth[String(gen)]; saveJoinerAuth(); }
function saveJoinerAuth() {
    try { localStorage.setItem(STORAGE_KEYS.beartrapJoiners, JSON.stringify(joinerAuth)); } catch (e) {}
}

// ---- Menu d'autorisation (modale) ----
function renderJoinerAuthModal() {
    const listEl = document.getElementById('joiner-auth-list');
    if (!listEl) return;
    const dict = i18nBearTrap[window.GlobalLang ? GlobalLang.get() : 'EN'] || i18nBearTrap.EN;
    const gen = currentGen();
    const g = joinersTierDB && joinersTierDB.byGeneration && joinersTierDB.byGeneration[String(gen)];
    const userHeroes = safeParse(STORAGE_KEYS.caserneHeroes, {});

    if (!g) { listEl.innerHTML = `<div class="ja-empty">${dict.joinerEmpty}</div>`; return; }

    let html = '';
    for (const rank of ['S', 'A', 'B', 'C', 'D']) {
        const ids = g[rank];
        if (!ids || !ids.length) continue;
        html += `<div class="ja-group"><div class="ja-group-head"><span class="ja-rank ${rank}">${rank}</span></div>`;
        ids.forEach(id => {
            const dbHero = heroesDB.find(h => h.id === id);
            const name = dbHero ? dbHero.name : id;
            const emoji = dbHero ? (classEmojis[dbHero.troopType.toLowerCase()] || '') : '';
            const unlocked = !!(userHeroes[id] && userHeroes[id].unlocked);
            const checked = isHeroAuthorized(id, gen);
            const notRec = !isRecommended(rank);
            html +=
                `<label class="ja-row${unlocked ? '' : ' ja-locked'}">` +
                `<input type="checkbox" data-hero="${id}" ${checked ? 'checked' : ''}>` +
                `<span class="ja-name">${emoji} ${escapeHTML(name)}</span>` +
                (unlocked ? '' : `<span class="ja-lockmark">🔒 ${dict.joinerLocked}</span>`) +
                (notRec ? `<span class="ja-badge-nr">${dict.joinerNotRec}</span>` : '') +
                `</label>`;
        });
        html += `</div>`;
    }
    listEl.innerHTML = html;

    listEl.querySelectorAll('input[data-hero]').forEach(cb => {
        cb.addEventListener('change', () => {
            setHeroAuthorized(cb.getAttribute('data-hero'), gen, cb.checked);
            calculateBearTrap();
        });
    });
}
function openJoinerAuthModal() {
    renderJoinerAuthModal();
    const m = document.getElementById('joiner-auth-modal');
    if (m) m.classList.add('active');
}
function closeJoinerAuthModal() {
    const m = document.getElementById('joiner-auth-modal');
    if (m) m.classList.remove('active');
}

// ========================================
// LIAISON COMPÉTENCES (Expert + Animal)
// ----------------------------------------
// Bonus Expert  = compétence « Avantage primitif » de Valora (data/masters_db.json,
//                 niveau saisi sur la page Experts → localStorage `masters`).
// Bonus Animal  = compétence du Puissant Bison (data/pets_db.json,
//                 palier atteint sur la page Familiers → localStorage `pets`).
// La valeur est remplie automatiquement mais RESTE modifiable : dès que l'utilisateur
// édite le champ il passe en « manuel » ; le bouton ↺ resynchronise sur la compétence.
// ========================================
let expertAutoVal = null;   // valeur auto (Valora)  ou null si non configurée
let animalAutoVal = null;   // valeur auto (Bison)   ou null si non configurée
let expertAutoMode = true;  // true = suit la compétence ; false = valeur manuelle
let animalAutoMode = true;

// "+3,000" / "1 500" / "1500" -> 3000
function parseBonusValue(v) {
    if (v == null) return 0;
    return parseInt(String(v).replace(/[^\d]/g, ''), 10) || 0;
}

async function loadExpertBonus() {
    try {
        const res = await fetch('data/masters_db.json');
        const db = await res.json();
        const valora = db.find(m => m.id === 'valora');
        const skill = valora && valora.skills.find(s => s.id === 'savage_advantage');
        const userMasters = safeParse(STORAGE_KEYS.masters, {});
        const lvl = (userMasters.valora && userMasters.valora.skills)
            ? (userMasters.valora.skills.savage_advantage || 0) : 0;
        const lvlObj = skill && lvl >= 1 ? skill.levels.find(l => l.level === lvl) : null;
        expertAutoVal = lvlObj ? parseBonusValue(lvlObj.effect) : null;
    } catch (e) {
        console.error('Expert (Valora) bonus load failed', e);
        expertAutoVal = null;
    }
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

// Applique l'état d'un champ lié (valeur + badge + bouton de resync)
function applyBonusLink(field) {
    const cfg = field === 'expert'
        ? { inputId:'cap-expert', badgeId:'expert-source-badge', syncId:'expert-sync-btn', auto:expertAutoMode, val:expertAutoVal, srcKey:'srcValora' }
        : { inputId:'cap-animal', badgeId:'animal-source-badge', syncId:'animal-sync-btn', auto:animalAutoMode, val:animalAutoVal, srcKey:'srcBison' };
    const input = document.getElementById(cfg.inputId);
    const badge = document.getElementById(cfg.badgeId);
    const sync  = document.getElementById(cfg.syncId);
    if (!input || !badge) return;
    const dict = i18nBearTrap[window.GlobalLang ? GlobalLang.get() : 'EN'] || i18nBearTrap.EN;

    if (cfg.auto && cfg.val !== null) {
        input.value = cfg.val.toLocaleString('fr-FR');
        badge.innerHTML = '🟢 ' + dict.linkAuto + ' · ' + dict[cfg.srcKey];
        badge.style.color = 'var(--success)';
        if (sync) sync.style.display = 'none';
    } else if (cfg.auto && cfg.val === null) {
        badge.innerHTML = '🔗 ' + dict.linkNoSource + ' · ' + dict[cfg.srcKey];
        badge.style.color = 'var(--text-muted)';
        if (sync) sync.style.display = 'none';
    } else {
        badge.innerHTML = '✏️ ' + dict.linkManual;
        badge.style.color = 'var(--text-muted)';
        if (sync) { sync.title = dict.linkSync; sync.style.display = (cfg.val !== null) ? 'inline-flex' : 'none'; }
    }
}

// Bascule en manuel dès que l'utilisateur édite le champ
function onBonusManualEdit(field) {
    if (field === 'expert') expertAutoMode = false; else animalAutoMode = false;
    applyBonusLink(field);
    saveBearTrapData();
}

// Resynchronise le champ sur la valeur de la compétence
function resyncBonus(field) {
    if (field === 'expert') expertAutoMode = true; else animalAutoMode = true;
    applyBonusLink(field);
    saveBearTrapData();
    calculateBearTrap();
}

// ========================================
// DONNÉES DES HÉROS (Tier Lists & Capacités)
// ========================================

const organizerTierList = {
    1: { inf: ["Amadeus", "Helga", "Howard"], cav: ["Jabel"], arc: ["Quinn"] },
    2: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    3: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Marlin", "Quinn"] },
    4: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    5: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Rosa", "Marlin", "Quinn"] },
    6: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin", "Quinn"] },
    7: { inf: ["Amadeus", "Helga", "Zoe", "Howard"], cav: ["Ava", "Petra", "Hilde", "Jabel"], arc: ["Yang", "Rosa", "Marlin", "Quinn"] }
};

const heroCapacityByLevel = {
    1: 65, 2: 140, 3: 220, 4: 305, 5: 400, 6: 500, 7: 605, 8: 720, 9: 840, 10: 970,
    11: 1100, 12: 1240, 13: 1390, 14: 1540, 15: 1700, 16: 1870, 17: 2040, 18: 2225, 19: 2410, 20: 2605,
    21: 2805, 22: 3010, 23: 3225, 24: 3445, 25: 3670, 26: 3905, 27: 4145, 28: 4390, 29: 4645, 30: 4905,
    31: 5175, 32: 5445, 33: 5715, 34: 6015, 35: 6310, 36: 6600, 37: 6895, 38: 7190, 39: 7480, 40: 7775,
    41: 8070, 42: 8365, 43: 8655, 44: 8950, 45: 9245, 46: 9540, 47: 9830, 48: 10125, 49: 10420, 50: 10685,
    51: 10925, 52: 11140, 53: 11340, 54: 11525, 55: 11700, 56: 11860, 57: 12010, 58: 12140, 59: 12260, 60: 12370,
    61: 12470, 62: 12560, 63: 12650, 64: 12730, 65: 12800, 66: 12870, 67: 12930, 68: 12980, 69: 13030, 70 : 13070, 
    71: 13110,72: 13150,73: 13190,74: 13230,75: 13270,76: 13310,77: 13350,78: 13390,79: 13430,80: 13470
};

const classEmojis = {
    'infantry': '🛡️',
    'cavalry': '🐎',
    'archer': '🏹'
};

function getHeroCapacity(level) {
    if (level >= 80) return 13470;
    if (heroCapacityByLevel[level]) return heroCapacityByLevel[level];
    let closestLevel = 1;
    for (let key in heroCapacityByLevel) {
        const k = Number(key);
        if (k <= level && k > closestLevel) closestLevel = k;
    }
    return heroCapacityByLevel[closestLevel];
}

function getRawNumber(id) {
    const el = document.getElementById(id);
    if (!el || !el.value) return 0;
    const cleanStr = el.value.toString().replace(/\s/g, '').replace(/ /g, '');
    return parseInt(cleanStr, 10) || 0;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c =>
        ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function formatInputNumber(e) {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val === '') {
        e.target.value = '';
        return;
    }
    e.target.value = parseInt(val, 10).toLocaleString('fr-FR');
}

// ========================================
// INITIALISATION
// ========================================

function btTip(k){ return window.HelpSystem ? HelpSystem.tip({FR:i18nBearTrap.FR[k], EN:i18nBearTrap.EN[k]}) : ''; }
function btMountTips(){
    if (!window.HelpSystem) return;
    const map = { lblBase:'tipBase', lblExp:'tipExp', lblAni:'tipAni', lblGen:'tipGen', lblLimit:'tipLimit', lblMinInf:'tipMinInf', lblMinCav:'tipMinCav', modalHeroes:'tipHeroes' };
    for (const i18nKey in map) {
        const el = document.querySelector('[data-i18n="' + i18nKey + '"]');
        if (el && !el.querySelector('.help-i')) el.insertAdjacentHTML('beforeend', ' ' + btTip(map[i18nKey]));
    }
}
function btInitHelp(){
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id:'beartrap', banner:true, anchor:'[data-i18n="planTitle"]',
        title:{FR:'Bear Trap — Aide', EN:'Bear Trap — Help'},
        summary:{FR:"Répartit automatiquement tes troupes sur plusieurs marches pour le Piège à Ours, en respectant ta capacité, tes héros et tes seuils mini.",
                 EN:"Automatically splits your troops across several marches for the Bear Trap, respecting your capacity, heroes and minimum thresholds."},
        steps:{
            FR:["Renseigne tes troupes (Infanterie 🛡️, Archers 🏹, Cavalerie 🐎) et ta capacité de marche (capacité de base + bonus Expert + bonus Animal), ainsi que le nombre de marches max.",
                "Indique ton rôle (Participant ou Organisateur) et la génération de ton serveur.",
                "Héros : chaque marche est menée par des héros. Le niveau du héros CAPITAINE détermine la capacité (taille) de la marche ; son type 🛡️/🐎/🏹 oriente la composition. Certains héros sont de meilleurs capitaines/renforts pour le Piège à Ours.",
                "⚠️ Les niveaux de tes héros proviennent de la page « Ma Caserne ». Configure-les là-bas d'abord — sinon ils sont considérés au niveau 1 et les capacités calculées seront fausses.",
                "Crée une marche via « + Nouvelle marche », choisis ses héros, ou clique « 🪄 Suggérer » pour piocher automatiquement tes meilleurs héros (depuis Ma Caserne) adaptés au Piège à Ours.",
                "🛡️ « Héros autorisés » : ouvre le menu des joiners permis par ton alliance (liste selon la génération de serveur). Les héros classés C et D y sont décochés par défaut (« Non recommandé »). La suggestion ne pioche que les héros cochés, puis départage à niveau/compétences égales par le rang de la tier-list.",
                "Choisis le mode d'optimisation (seuils mini Infanterie/Cavalerie) puis « Générer le reste des marches » : tes troupes restantes sont réparties automatiquement.",
                "Lis le plan de déploiement : composition, capacité et total de chaque marche. Survole les « i » pour le détail des champs."],
            EN:["Enter your troops (Infantry 🛡️, Archers 🏹, Cavalry 🐎) and your march capacity (base + Expert bonus + Animal bonus), plus the max number of marches.",
                "Set your role (Participant or Organizer) and your server generation.",
                "Heroes: each march is led by heroes. The CAPTAIN hero's level sets the march capacity (size); its type 🛡️/🐎/🏹 drives the composition. Some heroes make better captains/joiners for the Bear Trap.",
                "⚠️ Your heroes' levels come from the “My Barracks” page. Set them there first — otherwise they count as level 1 and the computed capacities will be wrong.",
                "Create a march via “+ New march”, pick its heroes, or click “🪄 Suggest” to auto-pick your best heroes (from My Barracks) suited to the Bear Trap.",
                "🛡️ “Allowed heroes”: opens the menu of joiners your alliance permits (listed by server generation). Heroes ranked C and D are unchecked by default (“Not recommended”). Suggestions only draw from the checked heroes, then break level/skill ties by the tier-list rank.",
                "Pick the optimization mode (min Infantry/Cavalry thresholds) then “Generate the rest”: your remaining troops are split automatically.",
                "Read the deployment plan: composition, capacity and total of each march. Hover the “i” icons for field details."]
        },
        links:[{label:{FR:'⚙️ Configurer mes héros — Ma Caserne', EN:'⚙️ Set up my heroes — My Barracks'}, href:'caserne.html'}]
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    
    loadBearTrapData(); 
    
    try {
        const response = await fetch('data/heroes_db.json');
        if (response.ok) {
            heroesDB = await response.json();
            populateHeroDropdowns();
        }
    } catch (e) { console.error("Erreur DB", e); }

    // Liaison des bonus Expert (Valora) & Animal (Puissant Bison)
    await Promise.all([loadExpertBonus(), loadAnimalBonus()]);
    applyBonusLink('expert');
    applyBonusLink('animal');

    // Tier-list des joiners + autorisations d'alliance
    joinerAuth = safeParse(STORAGE_KEYS.beartrapJoiners, {}) || {};
    try {
        const rj = await fetch('data/beartrap_joiners_db.json');
        if (rj.ok) joinersTierDB = await rj.json();
    } catch (e) { console.error('Tier-list joiners load failed', e); }

    if (window.GlobalLang) {
        applyTranslations(window.GlobalLang.get());
        btInitHelp();
        btMountTips();
        window.addEventListener('langChanged', (e) => {
            applyTranslations(e.detail.lang);
            btMountTips();
            applyBonusLink('expert');
            applyBonusLink('animal');
            renderJoinerAuthModal();
            renderCustomMarches();
            calculateBearTrap();
        });
    }

    initStudioModal();
    renderCustomMarches();
    updateStudioBadge();
    
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

    // Liaison Expert/Animal : édition manuelle -> mode manuel ; bouton ↺ -> resync
    const expertInput = document.getElementById('cap-expert');
    if (expertInput) expertInput.addEventListener('input', () => onBonusManualEdit('expert'));
    const animalInput = document.getElementById('cap-animal');
    if (animalInput) animalInput.addEventListener('input', () => onBonusManualEdit('animal'));
    const expertSync = document.getElementById('expert-sync-btn');
    if (expertSync) expertSync.addEventListener('click', () => resyncBonus('expert'));
    const animalSync = document.getElementById('animal-sync-btn');
    if (animalSync) animalSync.addEventListener('click', () => resyncBonus('animal'));

    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) btnCalculate.addEventListener('click', () => { saveBearTrapData(); calculateBearTrap(); });

    // Menu d'autorisation des héros joiners
    const btnJoinerAuth = document.getElementById('btn-joiner-auth');
    if (btnJoinerAuth) btnJoinerAuth.addEventListener('click', openJoinerAuthModal);
    const btnJoinerClose = document.getElementById('btn-joiner-close');
    if (btnJoinerClose) btnJoinerClose.addEventListener('click', closeJoinerAuthModal);
    const btnJoinerReset = document.getElementById('btn-joiner-reset');
    if (btnJoinerReset) btnJoinerReset.addEventListener('click', () => { resetJoinerAuth(currentGen()); renderJoinerAuthModal(); calculateBearTrap(); });
    const joinerModal = document.getElementById('joiner-auth-modal');
    if (joinerModal) joinerModal.addEventListener('click', (e) => { if (e.target === joinerModal) closeJoinerAuthModal(); });

    document.getElementById('player-role').addEventListener('change', () => { saveBearTrapData(); updateStudioBadge(); });
    document.getElementById('server-generation').addEventListener('change', () => {
        saveBearTrapData();
        populateHeroDropdowns(); // On met à jour les listes déroulantes immédiatement !
        renderJoinerAuthModal(); // la liste des joiners autorisés dépend de la génération
        calculateBearTrap();
    });
    document.getElementById('optim-mode').addEventListener('change', saveBearTrapData);

    if (getRawNumber('troop-inf') > 0 || getRawNumber('troop-arc') > 0 || getRawNumber('troop-cav') > 0) {
        calculateBearTrap();
    }
});

function applyTranslations(lang) {
    const dict = i18nBearTrap[lang] || i18nBearTrap.EN;
    GlobalLang.applyI18n(dict);

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

function getCurrentMaxMarchCapacity() {
    const capBase = getRawNumber('cap-base');
    const capExpert = getRawNumber('cap-expert');
    const capAnimal = getRawNumber('cap-animal');
    const limitStr = document.getElementById('alliance-limit').value;
    const allianceLimit = limitStr ? getRawNumber('alliance-limit') : Infinity;
    return Math.min(capBase + capExpert + capAnimal, allianceLimit);
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
    data['custom-marches'] = customMarchesList;
    data['cap-expert-auto'] = expertAutoMode;
    data['cap-animal-auto'] = animalAutoMode;

    localStorage.setItem(STORAGE_KEYS.beartrap, JSON.stringify(data));
}

function loadBearTrapData() {
    const saved = localStorage.getItem(STORAGE_KEYS.beartrap);
    if (saved) {
        const data = JSON.parse(saved);
        for (const [id, val] of Object.entries(data)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        if (data['custom-marches']) {
            customMarchesList = data['custom-marches'];
        }
        // Modes de liaison (défaut : auto) — booléens hors champ de saisie
        expertAutoMode = data['cap-expert-auto'] !== false;
        animalAutoMode = data['cap-animal-auto'] !== false;
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
// STUDIO DE DÉPLOIEMENT (Marches perso)
// ========================================

function populateHeroDropdowns() {
    const userHeroes = safeParse(STORAGE_KEYS.caserneHeroes, {});
    
    const genEl = document.getElementById('server-generation');
    const maxGen = genEl ? parseInt(genEl.value, 10) : 6;
    
    // NOUVEAU : On récupère la traduction pour "Aucun"
    let currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nBearTrap[currentLang] || i18nBearTrap.EN;
    let textNone = dict.optNone || "Aucun";
    
    let optionsHTML = `<option value="" data-class="">${textNone}</option>`;
    
    let availableHeroes = heroesDB.filter(h => userHeroes[h.id] && userHeroes[h.id].unlocked && h.generation <= maxGen);
    availableHeroes.sort((a, b) => a.name.localeCompare(b.name));

    availableHeroes.forEach(h => {
        const hClass = h.troopType.toLowerCase();
        const emoji = classEmojis[hClass] || '';
        optionsHTML += `<option value="${h.id}" data-class="${hClass}">${emoji} ${h.name}</option>`;
    });

    ['cm-hero-1', 'cm-hero-2', 'cm-hero-3'].forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
            sel.innerHTML = optionsHTML;
            sel.addEventListener('change', updateHeroDropdownsState);
        }
    });
    
    updateHeroDropdownsState(); // On rafraîchit l'état visuel
}

function updateHeroDropdownsState() {
    const selects = [
        document.getElementById('cm-hero-1'),
        document.getElementById('cm-hero-2'),
        document.getElementById('cm-hero-3')
    ];
    
    const selections = selects.map(sel => {
        if (!sel.value) return null;
        const opt = sel.querySelector(`option[value="${sel.value}"]`);
        return {
            id: sel.value,
            heroClass: opt ? opt.getAttribute('data-class') : null
        };
    });

    selects.forEach((sel, currentIndex) => {
        const otherSelections = selections.filter((_, idx) => idx !== currentIndex && _ !== null);
        const forbiddenClasses = otherSelections.map(s => s.heroClass);
        const forbiddenIds = otherSelections.map(s => s.id);

        Array.from(sel.options).forEach(opt => {
            if (opt.value === "") {
                opt.disabled = false;
                opt.hidden = false;
                return;
            }

            const optClass = opt.getAttribute('data-class');
            const optId = opt.value;

            if (forbiddenIds.includes(optId) || forbiddenClasses.includes(optClass)) {
                opt.disabled = true;
                opt.hidden = true; 
            } else {
                opt.disabled = false;
                opt.hidden = false;
            }
        });
    });
}

// NOUVEAU : Fonction du bouton "Suggérer"
function suggestHeroesForModal() {
    const userHeroes = safeParse(STORAGE_KEYS.caserneHeroes, {});
    const role = document.getElementById('player-role').value;
    const generation = document.getElementById('server-generation').value;
    const maxGen = parseInt(generation, 10) || 6; // NOUVEAU
    const isHost = document.getElementById('cm-is-host').checked;

    let usedHeroIds = new Set();
    customMarchesList.forEach(m => {
        if (m.id !== editingMarchId) {
            if (m.h1) usedHeroIds.add(m.h1);
            if (m.h2) usedHeroIds.add(m.h2);
            if (m.h3) usedHeroIds.add(m.h3);
        }
    });

    let pool = [];
    for (let id in userHeroes) {
        if (userHeroes[id].unlocked && !usedHeroIds.has(id)) {
            let dbHero = heroesDB.find(h => h.id === id);
            // NOUVEAU : On vérifie la génération du héros
            if (dbHero && dbHero.generation <= maxGen) {
                pool.push({
                    ...dbHero,
                    level: userHeroes[id].level || 1,
                    skills: userHeroes[id].skills || [0, 0, 0]
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

    let team = [];

    // CORRECTION : La suggestion obéit UNIQUEMENT à la case à cocher de la modale
    if (isHost) {
        ['inf', 'cav', 'arc'].forEach(cls => {
            classes[cls].sort((a, b) => {
                // 1. PRIORITÉ ABSOLUE : Somme des compétences
                let sumSkillsA = (a.skills[0] || 0) + (a.skills[1] || 0) + (a.skills[2] || 0);
                let sumSkillsB = (b.skills[0] || 0) + (b.skills[1] || 0) + (b.skills[2] || 0);
                if (sumSkillsB !== sumSkillsA) return sumSkillsB - sumSkillsA;
                
                // 2. Ensuite la Tier List
                let scoreA = getTierScore(a.name, a.troopType);
                let scoreB = getTierScore(b.name, b.troopType);
                if (scoreA !== scoreB) return scoreA - scoreB;
                
                // 3. Enfin le niveau
                return b.level - a.level;
            });
            if (classes[cls].length > 0) team.push(classes[cls].shift());
        });
        
        // Tri final pour le capitaine
        team.sort((a, b) => {
            let sumSkillsA = (a.skills[0] || 0) + (a.skills[1] || 0) + (a.skills[2] || 0);
            let sumSkillsB = (b.skills[0] || 0) + (b.skills[1] || 0) + (b.skills[2] || 0);
            if (sumSkillsB !== sumSkillsA) return sumSkillsB - sumSkillsA;
            return getTierScore(a.name, a.troopType) - getTierScore(b.name, b.troopType);
        });
    } else {
        // --- Chemin JOINER : filtré par le menu d'autorisation, affiné par le rang tier-list ---
        const gen = maxGen;
        const isPremium = h => tierScoreOf(h.id, gen) <= RANK_ORDER.A;   // S / A = capitaines à préserver
        // On ne garde QUE les héros autorisés par l'alliance
        ['inf', 'cav', 'arc'].forEach(c => { classes[c] = classes[c].filter(h => isHeroAuthorized(h.id, gen)); });

        let possibleCaptains = [];
        ['inf', 'cav', 'arc'].forEach(c => classes[c].forEach(h => possibleCaptains.push({ cls: c, hero: h })));

        if (possibleCaptains.length > 0) {
            possibleCaptains.sort((a, b) => {
                // 1. Base : 1ère compétence
                let skillA = a.hero.skills[0] || 0, skillB = b.hero.skills[0] || 0;
                if (skillB !== skillA) return skillB - skillA;
                // 2. Base : niveau d'XP
                if (b.hero.level !== a.hero.level) return b.hero.level - a.hero.level;
                // 3. Affinage final : rang tier-list (S avant D)
                return tierScoreOf(a.hero.id, gen) - tierScoreOf(b.hero.id, gen);
            });
            let selectedCaptain = possibleCaptains[0];
            team.push(selectedCaptain.hero);
            classes[selectedCaptain.cls] = classes[selectedCaptain.cls].filter(h => h.id !== selectedCaptain.hero.id);

            // Héros secondaires : on privilégie les rangs faibles comme "remplisseurs"
            // et on réserve les capitaines premium (S/A) pour les autres marches.
            ['inf', 'cav', 'arc'].forEach(c => {
                if (selectedCaptain.cls !== c && classes[c].length > 0) {
                    let regulars = classes[c].filter(h => !isPremium(h)).sort((a, b) => b.level - a.level);
                    let premiums = classes[c].filter(h => isPremium(h)).sort((a, b) => b.level - a.level);

                    let filler = null;
                    if (regulars.length > 0) {
                        filler = regulars[0];
                    } else if (premiums.length > 0) {
                        let autoMarchesLeft = Math.max(0, getTotalMarchesAllowed() - customMarchesList.length - 1);
                        let totalRemainingPremiums = ['inf', 'cav', 'arc'].reduce((sum, cls) => sum + classes[cls].filter(isPremium).length, 0);
                        if (totalRemainingPremiums > autoMarchesLeft) filler = premiums[0];
                    }
                    if (filler) {
                        team.push(filler);
                        classes[c] = classes[c].filter(h => h.id !== filler.id);
                    }
                }
            });
        }
        // Si aucun héros autorisé n'est trouvé, 'team' reste un tableau vide [].
    }

    if (team.length === 0) {
        showAppAlert("Aucun héros disponible pour cette suggestion.");
        return;
    }

    // Réinitialise les dropdowns pour éviter les conflits
    const dropdowns = ['cm-hero-1', 'cm-hero-2', 'cm-hero-3'];
    dropdowns.forEach(id => document.getElementById(id).value = "");
    updateHeroDropdownsState();

    // Applique les valeurs suggérées
    team.forEach((hero, idx) => {
        if (idx < 3) document.getElementById(dropdowns[idx]).value = hero.id;
    });

    updateHeroDropdownsState();
}

function updateHostCheckboxState() {
    const hostCheck = document.getElementById('cm-is-host');
    if (!hostCheck) return;

    const roleEl = document.getElementById('player-role');
    const role = roleEl ? roleEl.value : 'participant';
    
    // On vérifie si une marche "Hôte" existe DÉJÀ (en excluant la marche qu'on est en train de modifier)
    const hostExists = customMarchesList.some(m => m.isHost && m.id !== editingMarchId);
    
    // On désactive si le joueur n'est pas Orga OU si un Hôte existe déjà ailleurs
    const shouldDisable = (role !== 'organizer') || hostExists;

    hostCheck.disabled = shouldDisable;
    
    // On grise le texte et on change le curseur
    const labelEl = hostCheck.closest('label');
    if (labelEl) {
        labelEl.style.opacity = shouldDisable ? '0.4' : '1';
        labelEl.style.cursor = shouldDisable ? 'not-allowed' : 'pointer';
    }

    // Si on n'a pas le droit d'être Hôte, on décoche la case par sécurité
    if (shouldDisable) {
        hostCheck.checked = false;
    }
}

function initStudioModal() {
    const modal = document.getElementById('custom-march-modal');
    const btnAdd = document.getElementById('btn-add-custom');
    const btnCancel = document.getElementById('btn-cancel-cm');
    const btnSave = document.getElementById('btn-save-cm');
    const btnSuggest = document.getElementById('btn-suggest-heroes'); // NOUVEAU
    
    if (btnSuggest) btnSuggest.addEventListener('click', suggestHeroesForModal);

    const cmInputs = document.querySelectorAll('#cm-inf, #cm-cav, #cm-arc');
    const cmRadios = document.querySelectorAll('input[name="cm-input-mode"]');

    cmInputs.forEach(input => {
        input.addEventListener('input', updateModalLiveStats);
    });

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
            showAppAlert(dict.errMaxMarches);
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
        
        const hostCheck = document.getElementById('cm-is-host');
        if(hostCheck) hostCheck.checked = false;
        
        document.querySelector('input[name="cm-input-mode"][value="percent"]').checked = true; 
        
        updateHeroDropdownsState();
        updateHostCheckboxState(); // NOUVEAU : On gère l'état de la case
        updateModalLiveStats();
        modal.classList.add('active');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
        editingMarchId = null;
    });

    btnSave.addEventListener('click', () => {
        const dict = i18nBearTrap[GlobalLang.get()] || i18nBearTrap.EN;
        
        const h1 = document.getElementById('cm-hero-1').value;
        const h2 = document.getElementById('cm-hero-2').value;
        const h3 = document.getElementById('cm-hero-3').value;
        const selectedHeroes = [h1, h2, h3].filter(v => v !== "");
        
        if (selectedHeroes.length !== new Set(selectedHeroes).size) {
            showAppAlert(dict.errDuplicateHero || "Erreur : Un héros est sélectionné en double.");
            return;
        }
        
        const selectedClasses = selectedHeroes.map(id => {
            const hero = heroesDB.find(h => h.id === id);
            return hero ? hero.troopType.toLowerCase() : null;
        }).filter(Boolean);

        if (selectedClasses.length !== new Set(selectedClasses).size) {
            showAppAlert("Erreur : Vous ne pouvez pas sélectionner plusieurs héros de la même classe.");
            return;
        }

        const name = document.getElementById('cm-name').value || "Marche Spéciale";
        const modeElement = document.querySelector('input[name="cm-input-mode"]:checked');
        const mode = modeElement ? modeElement.value : 'percent'; 
        
        const hostCheck = document.getElementById('cm-is-host');
        const isHost = hostCheck ? hostCheck.checked : false;
        
        const { rawInf, rawCav, rawArc, isExceeding } = getModalInputValues();
        const total = rawInf + rawCav + rawArc;

        if (total === 0) return; 
        if (isExceeding) { showAppAlert(dict.errExceedCap); return; }

        const { remInf, remCav, remArc } = getRemainingGlobalTroops();
        let currentEditingInf = 0, currentEditingCav = 0, currentEditingArc = 0;
        
        if (editingMarchId) {
            const march = customMarchesList.find(m => m.id === editingMarchId);
            if (march) {
                currentEditingInf = march.inf; currentEditingCav = march.cav; currentEditingArc = march.arc;
            }
        }

        if (rawInf > (remInf + currentEditingInf) || rawCav > (remCav + currentEditingCav) || rawArc > (remArc + currentEditingArc)) {
            showAppAlert(dict.errNoTroopsForCustom);
            return;
        }

        if (isHost) {
            customMarchesList.forEach(m => {
                if (m.id !== editingMarchId) m.isHost = false;
            });
        }

        const newMarchData = {
            id: editingMarchId || Date.now(),
            name: name,
            mode: mode,
            inf: rawInf, cav: rawCav, arc: rawArc, total: total,
            h1: h1, h2: h2, h3: h3,
            isHost: isHost
        };

        if (editingMarchId) {
            const index = customMarchesList.findIndex(m => m.id === editingMarchId);
            if (index > -1) customMarchesList[index] = newMarchData;
        } else {
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
    const modeElement = document.querySelector('input[name="cm-input-mode"]:checked');
    const mode = modeElement ? modeElement.value : 'percent';
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

function updateModalLiveStats() {
    const { remInf, remCav, remArc } = getRemainingGlobalTroops();
    const { rawInf, rawCav, rawArc, isExceeding, maxCap } = getModalInputValues();

    document.getElementById('modal-max-cap').textContent = maxCap.toLocaleString('fr-FR');

    const curRemInf = remInf - rawInf;
    const curRemCav = remCav - rawCav;
    const curRemArc = remArc - rawArc;

    const label = document.getElementById('modal-remaining-troops');
    let currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nBearTrap[currentLang] || i18nBearTrap.EN;

    // NOUVEAU : On utilise le dictionnaire pour "Disponibles :"
    let textAvailable = dict.txtAvailable || "Disponibles :";
    let html = `${textAvailable} 🛡️ ${curRemInf.toLocaleString('fr-FR')} | 🐎 ${curRemCav.toLocaleString('fr-FR')} | 🏹 ${curRemArc.toLocaleString('fr-FR')}`;

    if (curRemInf < 0 || curRemCav < 0 || curRemArc < 0) {
        html += `<br><span style="color: #e74c5c;">⚠️ ${dict.errNoTroopsForCustom}</span>`;
    }
    if (isExceeding) {
        html += `<br><span style="color: #e74c5c;">⚠️ ${dict.errExceedCap}</span>`;
    }

    label.innerHTML = html;

    const modeElement = document.querySelector('input[name="cm-input-mode"]:checked');
    const mode = modeElement ? modeElement.value : 'percent';
    
    const updateConv = (id, val, raw) => {
        const span = document.getElementById(id + '-conv');
        const inputVal = document.getElementById(id).value;
        if (inputVal === '') { span.textContent = ''; return; }
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
        remInf -= m.inf; remCav -= m.cav; remArc -= m.arc;
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
    if (!badge) return;
    
    let currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nBearTrap[currentLang] || i18nBearTrap.EN;
    let wordUsed = dict.txtUsed || "utilisées";
    
    badge.textContent = `${customMarchesList.length} / ${getTotalMarchesAllowed()} ${wordUsed}`;
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

        let hostBadge = march.isHost ? `<span style="background: rgba(245, 184, 64, 0.2); color: #f5b840; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 10px; vertical-align: middle;">👑 HOST</span>` : '';

        let heroInfo = "";
        const hList = [march.h1, march.h2, march.h3].filter(Boolean);
        if (hList.length > 0) {
            heroInfo = "<div style='font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; gap: 5px; flex-wrap: wrap;'>";
            hList.forEach((hid, idx) => {
                let dbHero = heroesDB.find(x => x.id === hid);
                if (dbHero) {
                    let roleIcon = (idx === 0) ? "👑 " : "";
                    let emoji = classEmojis[dbHero.troopType.toLowerCase()] || '';
                    heroInfo += `<span style="background: var(--control-bg); border: 1px solid var(--border); color: var(--text-light); padding: 3px 6px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${roleIcon}${emoji} ${dbHero.name}</span>`;
                }
            });
            heroInfo += "</div>";
        }

        const div = document.createElement('div');
        div.className = 'custom-march-card';
        div.innerHTML = `
            <div>
                <strong style="color: var(--accent); display: inline-block; margin-bottom: 5px;">${escapeHTML(march.name)} ${hostBadge}</strong>
                <div class="custom-march-stats">
                    <div>Total: <span>${march.total.toLocaleString('fr-FR')}</span></div>
                    <div>🛡️ <span>${march.inf.toLocaleString('fr-FR')}</span> <span style="color: var(--text-muted); font-size: 0.85em; font-weight: normal;">(${pInf}%)</span></div>
                    <div>🐎 <span>${march.cav.toLocaleString('fr-FR')}</span> <span style="color: var(--text-muted); font-size: 0.85em; font-weight: normal;">(${pCav}%)</span></div>
                    <div>🏹 <span style="color: var(--accent);">${march.arc.toLocaleString('fr-FR')}</span> <span style="color: var(--accent); font-size: 0.85em; font-weight: normal; opacity: 0.8;">(${pArc}%)</span></div>
                </div>
                ${heroInfo}
            </div>
            <div class="march-actions">
                <button type="button" class="btn-edit" data-id="${march.id}">✏️</button>
                <button type="button" class="btn-delete" data-id="${march.id}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() { deleteCustomMarch(parseInt(this.getAttribute('data-id'), 10)); });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() { editCustomMarch(parseInt(this.getAttribute('data-id'), 10)); });
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
    const mode = march.mode || 'number';
    const modeEl = document.querySelector(`input[name="cm-input-mode"][value="${mode}"]`);
    if(modeEl) modeEl.checked = true;

    document.getElementById('cm-hero-1').value = march.h1 || "";
    document.getElementById('cm-hero-2').value = march.h2 || "";
    document.getElementById('cm-hero-3').value = march.h3 || "";
    
    const hostCheck = document.getElementById('cm-is-host');
    if(hostCheck) hostCheck.checked = march.isHost || false;

    updateHeroDropdownsState();
    updateHostCheckboxState(); // NOUVEAU : On gère l'état de la case

    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    if (theoreticalCapacity === 0) theoreticalCapacity = 1;

    if (mode === 'percent') {
        document.getElementById('cm-inf').value = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
        document.getElementById('cm-cav').value = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
        document.getElementById('cm-arc').value = Math.round((march.arc / theoreticalCapacity) * 100) || 0;
    } else {
        document.getElementById('cm-inf').value = (march.inf || 0).toLocaleString('fr-FR');
        document.getElementById('cm-cav').value = (march.cav || 0).toLocaleString('fr-FR');
        document.getElementById('cm-arc').value = (march.arc || 0).toLocaleString('fr-FR');
    }

    updateModalLiveStats();
    document.getElementById('custom-march-modal').classList.add('active');
}

// ========================================
// MOTEUR DE SÉLECTION DES HÉROS
// ========================================

function selectHeroesForMarches(marchesCount, role, generation) {
    const userHeroes = safeParse(STORAGE_KEYS.caserneHeroes, {});
    const hasCaserneData = Object.keys(userHeroes).length > 0;
    let assignedMarches = [];

    if (!hasCaserneData || heroesDB.length === 0) {
        for (let i = 0; i < marchesCount; i++) {
            assignedMarches.push({ heroes: [], missingHeroes: 0, penalty: 0, isHostMarch: false });
        }
        return assignedMarches;
    }

    let usedHeroIds = new Set();
    customMarchesList.forEach(m => {
        if (m.h1) usedHeroIds.add(m.h1);
        if (m.h2) usedHeroIds.add(m.h2);
        if (m.h3) usedHeroIds.add(m.h3);
    });

    let pool = [];
    let maxGen = parseInt(generation, 10) || 6; // NOUVEAU

    for (let id in userHeroes) {
        if (userHeroes[id].unlocked && !usedHeroIds.has(id)) {
            let dbHero = heroesDB.find(h => h.id === id);
            // NOUVEAU : On vérifie la génération du héros
            if (dbHero && dbHero.generation <= maxGen) {
                let lvl = userHeroes[id].level || 1;
                let skills = userHeroes[id].skills || [0, 0, 0]; 
                pool.push({
                    ...dbHero,
                    level: lvl,
                    skills: skills,
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
        let tierList = organizerTierList[generation] || organizerTierList[6];
        let list = tierList[typeShort];
        if (!list) return 999;
        let idx = list.indexOf(heroName);
        return idx === -1 ? 999 : idx;
    };

    let hostMarchAlreadyExists = customMarchesList.some(m => m.isHost);
    let needsOrganizerMarch = (role === 'organizer') && !hostMarchAlreadyExists;

    for (let i = 0; i < marchesCount; i++) {
        let team = [];
        let isThisOrganizerMarch = needsOrganizerMarch && (i === 0);

        if (isThisOrganizerMarch) {
            ['inf', 'cav', 'arc'].forEach(cls => {
                classes[cls].sort((a, b) => {
                    // 1. PRIORITÉ ABSOLUE : Somme des 3 compétences (plus grand = meilleur)
                    let sumSkillsA = (a.skills[0] || 0) + (a.skills[1] || 0) + (a.skills[2] || 0);
                    let sumSkillsB = (b.skills[0] || 0) + (b.skills[1] || 0) + (b.skills[2] || 0);
                    if (sumSkillsB !== sumSkillsA) return sumSkillsB - sumSkillsA;
                    
                    // 2. Si égalité parfaite des compétences : On applique la Tier List Organisateur
                    let scoreA = getTierScore(a.name, a.troopType);
                    let scoreB = getTierScore(b.name, b.troopType);
                    if (scoreA !== scoreB) return scoreA - scoreB;
                    
                    // 3. Dernier recours : le niveau d'XP le plus élevé
                    return b.level - a.level; 
                });
                if (classes[cls].length > 0) {
                    let hero = classes[cls].shift();
                    hero.isCaptain = false;
                    team.push(hero);
                }
            });
            
            // Le choix du Capitaine final de l'équipe (Slot 1) suit la même logique forte
            if (team.length > 0) {
                team.sort((a, b) => {
                    let sumSkillsA = (a.skills[0] || 0) + (a.skills[1] || 0) + (a.skills[2] || 0);
                    let sumSkillsB = (b.skills[0] || 0) + (b.skills[1] || 0) + (b.skills[2] || 0);
                    if (sumSkillsB !== sumSkillsA) return sumSkillsB - sumSkillsA;
                    return getTierScore(a.name, a.troopType) - getTierScore(b.name, b.troopType);
                });
                team[0].isCaptain = true;
            }
        } else {
            // --- Chemin JOINER : filtré par le menu d'autorisation, affiné par le rang tier-list ---
            const gen = generation;
            const isPremium = h => tierScoreOf(h.id, gen) <= RANK_ORDER.A;   // S / A = capitaines à préserver
            const authClasses = {
                inf: classes.inf.filter(h => isHeroAuthorized(h.id, gen)),
                cav: classes.cav.filter(h => isHeroAuthorized(h.id, gen)),
                arc: classes.arc.filter(h => isHeroAuthorized(h.id, gen))
            };

            let possibleCaptains = [];
            ['inf', 'cav', 'arc'].forEach(c => authClasses[c].forEach(h => possibleCaptains.push({ cls: c, hero: h })));

            if (possibleCaptains.length > 0) {
                possibleCaptains.sort((a, b) => {
                    // 1. Base : 1ère compétence
                    let skillA = a.hero.skills[0] || 0, skillB = b.hero.skills[0] || 0;
                    if (skillB !== skillA) return skillB - skillA;
                    // 2. Base : niveau d'XP
                    if (b.hero.level !== a.hero.level) return b.hero.level - a.hero.level;
                    // 3. Affinage final : rang tier-list (S avant D)
                    return tierScoreOf(a.hero.id, gen) - tierScoreOf(b.hero.id, gen);
                });
                let selectedCaptain = possibleCaptains[0];
                selectedCaptain.hero.isCaptain = true;
                team.push(selectedCaptain.hero);
                classes[selectedCaptain.cls] = classes[selectedCaptain.cls].filter(h => h.id !== selectedCaptain.hero.id);
                authClasses[selectedCaptain.cls] = authClasses[selectedCaptain.cls].filter(h => h.id !== selectedCaptain.hero.id);

                // Héros secondaires : remplisseurs de rang faible d'abord ; on réserve les
                // capitaines premium (S/A) pour les marches restantes.
                ['inf', 'cav', 'arc'].forEach(c => {
                    if (selectedCaptain.cls !== c && authClasses[c].length > 0) {
                        let regulars = authClasses[c].filter(h => !isPremium(h)).sort((a, b) => b.level - a.level);
                        let premiums = authClasses[c].filter(h => isPremium(h)).sort((a, b) => b.level - a.level);

                        let filler = null;
                        if (regulars.length > 0) {
                            filler = regulars[0];
                        } else if (premiums.length > 0) {
                            let marchesLeftToProcess = marchesCount - i - 1;
                            let totalRemainingPremiums = ['inf', 'cav', 'arc'].reduce((sum, cls) => sum + authClasses[cls].filter(isPremium).length, 0);
                            if (totalRemainingPremiums > marchesLeftToProcess) filler = premiums[0];
                        }

                        if (filler) {
                            filler.isCaptain = false;
                            team.push(filler);
                            classes[c] = classes[c].filter(h => h.id !== filler.id);
                            authClasses[c] = authClasses[c].filter(h => h.id !== filler.id);
                        }
                    }
                });
                
                team.sort((a, b) => (b.isCaptain ? 1 : 0) - (a.isCaptain ? 1 : 0));
            }
            // Sinon (pas de capitaine), l'équipe reste vide [].
        }

        let penalty = 0;
        let missingHeroes = 3 - team.length;
        penalty += missingHeroes * 13470; 
        team.forEach(h => penalty += h.penalty);

        assignedMarches.push({
            heroes: team,
            missingHeroes: missingHeroes,
            penalty: penalty,
            isHostMarch: isThisOrganizerMarch
        });
    }
    
    return assignedMarches;
}

// ========================================
// MOTEUR DE CALCUL (Marches automatiques)
// ========================================

function calculateBearTrap() {
    let currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nBearTrap[currentLang] || i18nBearTrap.EN;

    let { remInf, remCav, remArc } = getRemainingGlobalTroops();
    let availableInf = Math.max(0, remInf);
    let availableCav = Math.max(0, remCav);
    let availableArc = Math.max(0, remArc);

    let theoreticalCapacity = getRawNumber('cap-base') + getRawNumber('cap-expert') + getRawNumber('cap-animal');
    let maxMarchCapacity = getCurrentMaxMarchCapacity();

    if (maxMarchCapacity <= 0) return;

    let marchesCount = getTotalMarchesAllowed() - customMarchesList.length;
    let marches = [];
    
    if (availableInf + availableArc + availableCav === 0 || marchesCount <= 0) {
        displayResults([], maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
        return;
    }

    const minInfPercent = getRawNumber('min-inf-percent');
    const minCavPercent = getRawNumber('min-cav-percent');
    const roleEl = document.getElementById('player-role');
    const role = roleEl ? roleEl.value : 'participant';
    const genEl = document.getElementById('server-generation');
    const generation = genEl ? genEl.value : '6';

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
            missingHeroes: assignment.missingHeroes,
            isHostMarch: assignment.isHostMarch
        });
    }

    displayResults(marches, maxMarchCapacity, marchesCount, theoreticalCapacity, dict);
}

function displayResults(marches, maxCapacity, autoMarchesGenerated, theoreticalCapacity, dict) {
    const resultArea = document.getElementById('result-area');
    if (!resultArea) return;
    
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

        let fMaxCap = march.capacity.toLocaleString('fr-FR'); 
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');

        let rowStyle = march.total < march.capacity ? 'color: var(--text-muted);' : '';
        
        const badgeStyle = "display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";
        const badgeStyleArc = "display: inline-block; background: rgba(245, 184, 64, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";

        let heroInfo = "";
        if ((march.heroes && march.heroes.length > 0) || march.missingHeroes > 0) {
            heroInfo = "<div style='font-size: 11px; color: var(--text-muted); margin-top: 6px; display: flex; gap: 5px; flex-wrap: wrap;'>";
            
            if (march.heroes && march.heroes.length > 0) {
                march.heroes.forEach(h => {
                    let roleIcon = h.isCaptain ? "👑 " : ""; 
                    let emoji = classEmojis[h.troopType.toLowerCase()] || '';
                    heroInfo += `<span style="background: var(--control-bg); border: 1px solid var(--border); color: var(--text-light); padding: 3px 6px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${roleIcon}${emoji} ${h.name} <span style="opacity:0.6">(L.${h.level})</span></span>`;
                });
            }
            
            if (march.missingHeroes > 0) {
                let errorBg = "background: rgba(231, 76, 92, 0.05);";
                if (march.missingHeroes === 3) {
                    let msg = dict.noCaptain || "Aucun capitaine disponible";
                    heroInfo += `<span style="color: #e74c5c; border: 1px solid rgba(231, 76, 92, 0.3); ${errorBg} padding: 3px 6px; border-radius: 4px;">⚠️ ${msg}</span>`;
                } else {
                    heroInfo += `<span style="color: #e74c5c; border: 1px solid rgba(231, 76, 92, 0.3); ${errorBg} padding: 3px 6px; border-radius: 4px;">⚠️ -${march.missingHeroes} héros</span>`;
                }
            }
            heroInfo += "</div>";
        }
        
        let hostWord = dict.lblHost || "(Hôte)";
        let hostIndicator = march.isHostMarch ? ` <span style='color:#f5b840; font-size: 0.8em; margin-left: 4px;'>${hostWord}</span>` : "";

        html += `
            <tr style="${rowStyle}">
                <td style="padding: 10px; border-bottom: 1px solid var(--control-bg);">
                    <strong>${dict.thMarch} ${march.id}${hostIndicator}</strong>
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
