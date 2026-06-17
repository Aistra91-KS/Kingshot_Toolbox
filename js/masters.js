// ==========================================
// CONSEIL DES EXPERTS (MASTERS) - LOGIQUE
// ==========================================

const i18nMasters = {
    FR: {
        pageTitle: "Conseil des Experts",
        pageDesc: "Gérez le niveau de relation et les compétences de vos experts.",
        relLevel: "Niveau de Relation (0-100)",
        lblPassive: "Expertise Passive",
        lblActive: "Compétences Actives",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        lockedSkill: "Débloqué au Niv. Rel.",
        lvlPrefix: "Niv. ",
        filterSort: "Tri & Filtres",
        searchMaster: "Rechercher",
        searchMasterPh: "Nom de l'expert…",
        sortBy: "Trier par",
        sortName: "Nom (A-Z)",
        sortRelDesc: "Relation (Décroissant)",
        sortRelAsc: "Relation (Croissant)",
        hideLocked: "Masquer les experts non débloqués"
    },
    EN: {
        pageTitle: "Hall of Masters",
        pageDesc: "Manage the relationship level and skills of your experts.",
        relLevel: "Relationship Level (0-100)",
        lblPassive: "Passive Expertise",
        lblActive: "Active Skills",
        btnCancel: "Cancel",
        btnSave: "Save",
        lockedSkill: "Unlocks at Rel. Lv.",
        lvlPrefix: "Lv. ",
        filterSort: "Sort & Filters",
        searchMaster: "Search",
        searchMasterPh: "Expert name…",
        sortBy: "Sort by",
        sortName: "Name (A-Z)",
        sortRelDesc: "Relationship (Descending)",
        sortRelAsc: "Relationship (Ascending)",
        hideLocked: "Hide locked experts"
    }
};

// --- GESTION DU STATUT DE RELATION ---
function getRelationshipStatusObj(level) {
    if (level <= 10) return { FR: "Étranger", EN: "Stranger" };
    if (level <= 20) return { FR: "Relation 1", EN: "Relationship 1" };
    if (level <= 30) return { FR: "Relation 2", EN: "Relationship 2" };
    if (level <= 40) return { FR: "Relation 3", EN: "Relationship 3" };
    if (level <= 50) return { FR: "Connaissance 1", EN: "Acquaintance 1" };
    if (level <= 60) return { FR: "Connaissance 2", EN: "Acquaintance 2" };
    if (level <= 70) return { FR: "Connaissance 3", EN: "Acquaintance 3" };
    if (level <= 80) return { FR: "Proche 1", EN: "Close 1" };
    if (level <= 90) return { FR: "Proche 2", EN: "Close 2" };
    if (level <= 99) return { FR: "Proche 3", EN: "Close 3" };
    return { FR: "Alter Ego", EN: "Alter Ego" };
}

// --- PALIERS DE RELATION (sélection manuelle) ---
const REL_STAGES = [
  { level: 0,   FR: "Non débloqué",   EN: "Locked" },
  { level: 1,   FR: "Étranger",       EN: "Stranger" },
  { level: 10,  FR: "Relation 1",     EN: "Relationship 1" },
  { level: 20,  FR: "Relation 2",     EN: "Relationship 2" },
  { level: 30,  FR: "Relation 3",     EN: "Relationship 3" },
  { level: 40,  FR: "Connaissance 1", EN: "Acquaintance 1" },
  { level: 50,  FR: "Connaissance 2", EN: "Acquaintance 2" },
  { level: 60,  FR: "Connaissance 3", EN: "Acquaintance 3" },
  { level: 70,  FR: "Proche 1",       EN: "Close 1" },
  { level: 80,  FR: "Proche 2",       EN: "Close 2" },
  { level: 90,  FR: "Proche 3",       EN: "Close 3" },
  { level: 100, FR: "Alter Ego",      EN: "Alter Ego" }
];
function snapToStage(level) {
  let snapped = 0;
  REL_STAGES.forEach(s => { if (level >= s.level) snapped = s.level; });
  return snapped;
}
function getStageObj(level) {
  return REL_STAGES.find(s => s.level === level) || REL_STAGES[0];
}
function populateRelSelect(lang, current) {
  const sel = document.getElementById('modal-rel-select');
  if (!sel) return;
  sel.innerHTML = REL_STAGES.map(s =>
    `<option value="${s.level}" ${s.level === current ? 'selected' : ''}>${s[lang] || s.EN}</option>`
  ).join('');
}

let mastersDB = [];
let userMasters = safeParse(STORAGE_KEYS.masters, {});
let currentMasterId = null;
let modalState = { relLevel: 0, skills: {} };

async function initMasters() {
    try {
        const response = await fetch('data/masters_db.json');
        mastersDB = await response.json();
        renderMastersGrid();
        applyTranslations();
        bindMasterControls();
    } catch (e) {
        console.error("Erreur de chargement de masters_db.json", e);
    }
}

function bindMasterControls() {
    const s = document.getElementById('master-search');
    const so = document.getElementById('master-sort');
    const h = document.getElementById('master-hide-locked');
    if (s) s.addEventListener('input', renderMastersGrid);
    if (so) so.addEventListener('change', renderMastersGrid);
    if (h) h.addEventListener('change', renderMastersGrid);
}

function applyTranslations() {
    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    GlobalLang.applyI18n(i18nMasters[lang] || i18nMasters['FR']);
}

function renderMastersGrid() {
    const grid = document.getElementById('masters-grid');
    grid.innerHTML = '';
    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    const dict = i18nMasters[lang] || i18nMasters['FR'];

    // --- Lecture des contrôles sidebar ---
    const searchEl = document.getElementById('master-search');
    const sortEl = document.getElementById('master-sort');
    const hideLockedEl = document.getElementById('master-hide-locked');
    const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const sortMode = sortEl ? sortEl.value : 'name';
    const hideLocked = hideLockedEl ? hideLockedEl.checked : false;
    const relOf = (m) => (userMasters[m.id] && userMasters[m.id].relLevel) || 0;

    let list = mastersDB.filter(master => {
        if (hideLocked && relOf(master) === 0) return false;
        if (q) {
            const nameEn = (master.name['EN'] || '').toLowerCase();
            const nameFr = (master.name['FR'] || '').toLowerCase();
            if (!nameEn.includes(q) && !nameFr.includes(q)) return false;
        }
        return true;
    });

    list.sort((a, b) => {
        if (sortMode === 'rel-desc') return relOf(b) - relOf(a);
        if (sortMode === 'rel-asc') return relOf(a) - relOf(b);
        return (a.name[lang] || a.name['EN']).localeCompare(b.name[lang] || b.name['EN']);
    });

    list.forEach(master => {
        const userData = userMasters[master.id] || { relLevel: 0, skills: {} };
        const isLocked = userData.relLevel === 0;
        
        // Nom sécurisé pour le chemin d'image
        const safeImgName = encodeURIComponent(master.name['EN']);
        const mName = master.name[lang] || master.name['EN'];
        const mTitle = master.title[lang] || master.title['EN'];

        const relLevel = userData.relLevel || 0;
        const statusObj = getStageObj(snapToStage(relLevel));
        const statusText = statusObj[lang] || statusObj['EN'];

        const card = document.createElement('div');
        card.className = `master-card ${relLevel === 0 ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="master-portrait" style="background-image: url('img/Master/${safeImgName}.png');"></div>
            <div class="master-info">
                <h3 class="master-name">${mName}</h3>
                <div class="master-title">${mTitle}</div>
                <div class="master-rel-badge">${dict.lvlPrefix}${relLevel} • ${statusText}</div>
            </div>
        `;
        
        card.onclick = () => openMasterModal(master, userData);
        grid.appendChild(card);
    });
}

function openMasterModal(master, userData) {
    currentMasterId = master.id;
    // Copie profonde de l'état
    modalState = {
        relLevel: userData.relLevel || 0,
        skills: { ...userData.skills }
    };

    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    const safeImgName = encodeURIComponent(master.name['EN']);

    document.getElementById('modal-header-bg').style.backgroundImage = `url('img/Master/${safeImgName}.png')`;
    document.getElementById('modal-master-name').textContent = master.name[lang] || master.name['EN'];
    document.getElementById('modal-master-title').textContent = master.title[lang] || master.title['EN'];
    
    modalState.relLevel = snapToStage(modalState.relLevel);
    populateRelSelect(lang, modalState.relLevel);

    updateMasterUI();
    
    document.getElementById('master-modal').classList.add('show');
    document.body.classList.add('modal-active'); // Pour pousser la grille comme dans la caserne
}

// Remplace X placeholder (pas dans mot type EXP/XP) par valeur colorée
function injectValue(textObj, lang, value) {
    if (!textObj) return null;
    const txt = textObj[lang] || textObj['EN'] || '';
    // Tuple "(a;b)" → remplacements séquentiels ; valeur simple → réutilisée
    const str = String(value).trim();
    const m = str.match(/^\((.*)\)$/);
    const parts = m ? m[1].split(';').map(s => s.trim()) : [str];
    let i = 0;
    return txt.replace(/(?<![A-Za-z])X(?![A-Za-z])/g, () => {
        const v = parts[Math.min(i, parts.length - 1)];
        i++;
        return `<span style="color: var(--accent); font-weight: bold;">${v}</span>`;
    });
}

function updateMasterUI() {
    const master = mastersDB.find(m => m.id === currentMasterId);
    if (!master) return;

    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    const dict = i18nMasters[lang] || i18nMasters['FR'];
    
    // Statut choisi via le sélecteur
    modalState.relLevel = parseInt(document.getElementById('modal-rel-select').value) || 0;

    // --- CALCUL COMPÉTENCE PASSIVE ---
    let passiveLvlIndex = -1;
    let nextPassiveReq = null;
    for (let i = 0; i < master.affinityMilestones.length; i++) {
        const reqLvl = master.affinityMilestones[i].level;
        if (modalState.relLevel >= reqLvl) {
            passiveLvlIndex = i;
        } else if (nextPassiveReq === null) {
            nextPassiveReq = reqLvl;
        }
    }

    // --- TEXTE AFFINITÉ (sous le statut) ---
    const affEl = document.getElementById('modal-affinity-text');
    if (affEl) {
        let affinityIndex = -1;
        for (let i = 0; i < master.affinityMilestones.length; i++) {
            if (modalState.relLevel >= master.affinityMilestones[i].level) affinityIndex = i;
        }
        if (affinityIndex >= 0 && master.TextToInclude) {
            const bonus = master.affinityMilestones[affinityIndex].bonus;
            affEl.innerHTML = injectValue(master.TextToInclude, lang, bonus);
            affEl.style.display = 'block';
        } else {
            affEl.style.display = 'none';
        }
    }
    
    const passiveContainer = document.getElementById('modal-passive-display');
    const pName = master.passive.name[lang] || master.passive.name['EN'];
    const safePassiveImg = encodeURIComponent(master.passive.name['EN']); 
    
    if (passiveLvlIndex >= 0) {
        let rawEffect = master.passive.levels[passiveLvlIndex].effect;
        let pEffect = (typeof rawEffect === 'object' && rawEffect !== null) ? (rawEffect[lang] || rawEffect['EN']) : rawEffect;

        passiveContainer.innerHTML = `
            <div class="skill-row active" style="margin: 0; padding: 0; border: none; background: transparent;">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/MasterSkill/${safePassiveImg}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name" style="color: var(--accent); font-weight: bold;">${pName} (${dict.lvlPrefix}${passiveLvlIndex + 1})</div>
                        <div class="skill-effect" style="color: var(--text-muted);">${master.passive.TextToInclude ? injectValue(master.passive.TextToInclude, lang, pEffect) : pEffect}</div>
                    </div>
                </div>
            </div>`;
    } else {
        passiveContainer.innerHTML = `<span style="color:var(--text-muted);">Bloqué (Nécessite Niveau 1)</span>`;
    }

    const statusEl = document.getElementById('modal-master-status');
    if (statusEl) {
        statusEl.textContent = (passiveLvlIndex >= 0)
            ? `Expertise ${dict.lvlPrefix}${passiveLvlIndex + 1}`
            : getStageObj(modalState.relLevel)[lang];
    }

    // --- CALCUL COMPÉTENCES ACTIVES ---
    let skillsHTML = '';
    let nextActiveReq = null;

    master.skills.forEach(skill => {
        
        const requiredLevel = skill.unlockRelLevel;

        const isUnlocked = modalState.relLevel >= requiredLevel;
        const currentSkillLevel = modalState.skills[skill.id] || 0;
        const safeSkillImg = encodeURIComponent(skill.name['EN']); 
        const sName = skill.name[lang] || skill.name['EN'];

        // Identifier le prochain objectif de compétence
        if (!isUnlocked && (nextActiveReq === null || requiredLevel < nextActiveReq)) {
            nextActiveReq = requiredLevel;
        }

        let pipsHTML = `<div class="skill-pips-container" style="flex-wrap: wrap; justify-content: flex-start; margin-top: 5px;">`;
        if (isUnlocked) {
            for (let i = 1; i <= skill.levels.length; i++) {
                let isActive = i <= currentSkillLevel;
                let levelToSet = (currentSkillLevel === i) ? i - 1 : i;
                pipsHTML += `<div class="skill-pip ${isActive ? 'active' : ''}" onclick="setMasterSkill('${skill.id}', ${levelToSet})">${i}</div>`;
            }
        }
        pipsHTML += `</div>`;

        let effectDisplay = `<span style="color:var(--text-muted);">${dict.lockedSkill} ${requiredLevel}</span>`;
        if (isUnlocked && currentSkillLevel > 0) {
            let rawEffect = skill.levels[currentSkillLevel - 1].effect;
            let finalEffect = (typeof rawEffect === 'object' && rawEffect !== null) ? (rawEffect[lang] || rawEffect['EN']) : rawEffect;
            if (skill.TextToInclude) {
                effectDisplay = `<span style="color: var(--text-muted);">${injectValue(skill.TextToInclude, lang, finalEffect)}</span>`;
            } else {
                effectDisplay = `<span style="color:var(--success); font-weight:bold;">${finalEffect}</span>`;
            }
        }

        skillsHTML += `
            <div class="skill-row ${isUnlocked ? 'active' : 'locked'}">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/MasterSkill/${safeSkillImg}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name" style="color: ${isUnlocked ? 'var(--text-light)' : 'var(--text-muted)'};">${sName}</div>
                        <div class="skill-effect">${effectDisplay}</div>
                    </div>
                </div>
                ${isUnlocked ? pipsHTML : ''}
            </div>
        `;
    });
    
    document.getElementById('modal-skills-list').innerHTML = skillsHTML;

    // --- MISE À JOUR DU PROCHAIN OBJECTIF ---
    const objContainer = document.getElementById('modal-next-objective');
    if (objContainer) {
        if (modalState.relLevel >= 100) {
            objContainer.style.display = 'none';
        } else {
            let nextLvl = 100;
            if (nextPassiveReq && nextPassiveReq < nextLvl) nextLvl = nextPassiveReq;
            if (nextActiveReq && nextActiveReq < nextLvl) nextLvl = nextActiveReq;

            let textObj = (lang === 'FR') ? `Prochain palier majeur au <strong>Niveau ${nextLvl}</strong>` : `Next major milestone at <strong>Level ${nextLvl}</strong>`;
            
            objContainer.innerHTML = `🎯 ${textObj}`;
            objContainer.style.display = 'block';
        }
    }
}

window.setMasterSkill = function(skillId, val) {
    modalState.skills[skillId] = parseInt(val, 10);
    updateMasterUI(); // Met à jour l'affichage de l'effet
};

function closeMasterModal() {
    document.getElementById('master-modal').classList.remove('show');
    // Même timer que la caserne pour fluidité
    setTimeout(() => {
        document.body.classList.remove('modal-active');
        currentMasterId = null;
    }, 400);
}

function saveMasterSettings() {
    if (!currentMasterId) return;
    
    // Si relation est à 0, on considère qu'il est verrouillé/effacé pour la sauvegarde
    if (modalState.relLevel <= 0) {
        delete userMasters[currentMasterId];
    } else {
        userMasters[currentMasterId] = {
            relLevel: modalState.relLevel,
            skills: modalState.skills
        };
    }
    
    localStorage.setItem(STORAGE_KEYS.masters, JSON.stringify(userMasters));
    renderMastersGrid();
    closeMasterModal();
}

window.addEventListener('langChanged', () => {
    applyTranslations();
    renderMastersGrid();
    if (currentMasterId) updateMasterUI();
});

document.addEventListener('DOMContentLoaded', initMasters);
