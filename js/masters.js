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

let mastersDB = [];
let userMasters = JSON.parse(localStorage.getItem('masters_user_data')) || {};
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
    const dict = i18nMasters[lang] || i18nMasters['FR'];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
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
        const safeImgName = master.name['EN'].replace(/'/g, "%27");
        const mName = master.name[lang] || master.name['EN'];
        const mTitle = master.title[lang] || master.title['EN'];

        const card = document.createElement('div');
        card.className = `master-card ${isLocked ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="master-portrait" style="background-image: url('img/Master/${safeImgName}.png');"></div>
            <div class="master-info">
                <h3 class="master-name">${mName}</h3>
                <div class="master-title">${mTitle}</div>
                <div class="master-rel-badge">${isLocked ? 'Non Débloqué' : `Relation ${dict.lvlPrefix}${userData.relLevel}`}</div>
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
    const safeImgName = master.name['EN'].replace(/'/g, "%27");

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
    
    // Récupération de la saisie utilisateur
    modalState.relLevel = parseInt(document.getElementById('modal-rel-input').value) || 0;
    
    // --- CALCUL COMPÉTENCE PASSIVE ---
    let passiveLvlIndex = -1;
    for (let i = 0; i < master.affinityMilestones.length; i++) {
        if (modalState.relLevel >= master.affinityMilestones[i].level) {
            passiveLvlIndex = i;
        } else { break; }
    }
    
    const passiveContainer = document.getElementById('modal-passive-display');
    const pName = master.passive.name[lang] || master.passive.name['EN'];
    const safePassiveImg = master.passive.name['EN']; // Image basée sur le nom EN
    
    if (passiveLvlIndex >= 0) {
        // Supporte le JSON si 'effect' est un objet {FR: "", EN: ""} ou un simple texte
        let rawEffect = master.passive.levels[passiveLvlIndex].effect;
        let pEffect = (typeof rawEffect === 'object') ? (rawEffect[lang] || rawEffect['EN']) : rawEffect;

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
    master.skills.forEach(skill => {
        const isUnlocked = modalState.relLevel >= skill.unlockRelLevel;
        const currentSkillLevel = modalState.skills[skill.id] || 0;
        const safeSkillImg = skill.name['EN']; // Image basée sur le nom EN exact
        const sName = skill.name[lang] || skill.name['EN'];

        // Création des carrés (pips)
        let pipsHTML = `<div class="master-skill-pips">`;
        for (let i = 1; i <= skill.levels.length; i++) {
            let isActive = i <= currentSkillLevel;
            if (isUnlocked) {
                // Si on clique sur le carré déjà actif (le dernier), ça le désélectionne (i - 1)
                let levelToSet = (currentSkillLevel === i) ? i - 1 : i;
                pipsHTML += `<div class="master-pip ${isActive ? 'active' : ''}" onclick="setMasterSkill('${skill.id}', ${levelToSet})" title="Niv. ${i}"></div>`;
            } else {
                pipsHTML += `<div class="master-pip locked"></div>`;
            }
        }
        pipsHTML += `</div>`;

        let effectDisplay = `<span style="color:var(--text-muted);">${dict.lockedSkill} ${skill.unlockRelLevel}</span>`;
        if (isUnlocked && currentSkillLevel > 0) {
            let rawEffect = skill.levels[currentSkillLevel - 1].effect;
            let finalEffect = (typeof rawEffect === 'object') ? (rawEffect[lang] || rawEffect['EN']) : rawEffect;
            effectDisplay = `<span style="color:var(--success); font-weight:bold;">${finalEffect}</span>`;
        }

        skillsHTML += `
            <div class="skill-row ${isUnlocked ? 'active' : 'locked'}" style="flex-direction: column; align-items: flex-start; padding: 12px;">
                <div class="skill-header" style="width: 100%;">
                    <div class="skill-icon" style="background-image: url('img/MasterSkill/${safeSkillImg}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name" style="color: ${isUnlocked ? 'var(--text-light)' : 'var(--text-muted)'};">${sName}</div>
                        <div class="skill-effect">${effectDisplay}</div>
                    </div>
                </div>
                ${pipsHTML}
            </div>
        `;
    });
    
    document.getElementById('modal-skills-list').innerHTML = skillsHTML;
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
    
    localStorage.setItem('masters_user_data', JSON.stringify(userMasters));
    renderMastersGrid();
    closeMasterModal();
}

window.addEventListener('langChanged', () => {
    applyTranslations();
    renderMastersGrid();
    if (currentMasterId) updateMasterUI();
});

document.addEventListener('DOMContentLoaded', initMasters);
