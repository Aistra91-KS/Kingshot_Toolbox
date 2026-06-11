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
        lvlPrefix: "Niv. "
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
        lvlPrefix: "Lv. "
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

let mastersDB = [];
let userMasters = JSON.parse(localStorage.getItem(STORAGE_KEYS.masters')) || {};
let currentMasterId = null;
let modalState = { relLevel: 0, skills: {} };

async function initMasters() {
    try {
        const response = await fetch('data/masters_db.json');
        mastersDB = await response.json();
        renderMastersGrid();
        applyTranslations();
    } catch (e) {
        console.error("Erreur de chargement de masters_db.json", e);
    }
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

    mastersDB.forEach(master => {
        const userData = userMasters[master.id] || { relLevel: 0, skills: {} };
        const isLocked = userData.relLevel === 0;
        
        // Nom sécurisé pour le chemin d'image
        const safeImgName = encodeURIComponent(master.name['EN']);
        const mName = master.name[lang] || master.name['EN'];
        const mTitle = master.title[lang] || master.title['EN'];

        const relLevel = userData.relLevel || 0;
        const statusObj = getRelationshipStatusObj(relLevel);
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
    
    document.getElementById('modal-rel-input').value = modalState.relLevel;

    updateMasterUI();
    
    document.getElementById('master-modal').classList.add('show');
    document.body.classList.add('modal-active'); // Pour pousser la grille comme dans la caserne
}

function updateMasterUI() {
    const master = mastersDB.find(m => m.id === currentMasterId);
    if (!master) return;

    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    const dict = i18nMasters[lang] || i18nMasters['FR'];
    
    // Récupération et sécurisation de la saisie utilisateur
    modalState.relLevel = parseInt(document.getElementById('modal-rel-input').value) || 0;
    if (modalState.relLevel < 0) modalState.relLevel = 0;
    if (modalState.relLevel > 100) modalState.relLevel = 100;
    document.getElementById('modal-rel-input').value = modalState.relLevel;

    // --- MISE À JOUR DU STATUT ---
    const statusObj = getRelationshipStatusObj(modalState.relLevel);
    const statusText = statusObj[lang] || statusObj['EN'];
    document.getElementById('modal-master-status').textContent = statusText;

    // --- CALCUL COMPÉTENCE PASSIVE ---
    let passiveLvlIndex = -1;
    let nextPassiveReq = null;
    for (let i = 0; i < master.affinityMilestones.length; i++) {
        if (modalState.relLevel >= master.affinityMilestones[i].level) {
            passiveLvlIndex = i;
        } else if (nextPassiveReq === null) {
            nextPassiveReq = master.affinityMilestones[i].level;
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
                        <div class="skill-effect" style="color: var(--text-light);">${pEffect}</div>
                    </div>
                </div>
            </div>`;
    } else {
        passiveContainer.innerHTML = `<span style="color:var(--text-muted);">Bloqué (Nécessite Niveau 1)</span>`;
    }

    // --- CALCUL COMPÉTENCES ACTIVES ---
    let skillsHTML = '';
    let nextActiveReq = null;

    master.skills.forEach(skill => {
        // CORRECTION DE LA LOGIQUE : Déblocage au niveau 11, 21, 31, 41... (sauf pour le niveau 1 absolu)
        let requiredLevel = skill.unlockRelLevel;
        if (requiredLevel > 1 && requiredLevel % 10 === 0) {
            requiredLevel += 1; 
        }

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
            effectDisplay = `<span style="color:var(--success); font-weight:bold;">${finalEffect}</span>`;
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
