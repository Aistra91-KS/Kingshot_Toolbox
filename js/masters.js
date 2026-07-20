// ==========================================
// CONSEIL DES EXPERTS (MASTERS) - LOGIQUE
// ==========================================

const i18nMasters = {
    FR: {
        pageTitle: "Conseil des Experts",
        pageDesc: "Gérez le niveau de relation et les compétences de vos experts.",
        relLevel: "Niveau (1-100)",
        lblBreakthroughs: "Paliers de percée",
        breakthroughHint: "Coche les paliers dont tu as dépensé les emblèmes.",
        emblemsLabel: "emblèmes",
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
        relLevel: "Level (1-100)",
        lblBreakthroughs: "Breakthroughs",
        breakthroughHint: "Tick the breakthroughs whose emblems you've spent.",
        emblemsLabel: "emblems",
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

// Aligne les paliers sur le niveau : > niveau impossible, < niveau obligatoire
function normalizeBreakthroughs(master, level) {
  if (!master.affinity) return;
  master.affinity.gates.forEach(g => {
    if (level > g.level) modalState.breakthroughs[g.level] = true;       // dépassé -> obligatoire
    else if (level < g.level) delete modalState.breakthroughs[g.level];  // non atteint -> impossible
    // level === g.level : palier courant, choix de l'utilisateur
  });
}

// Bonus effectif selon (niveau saisi, paliers débloqués)
function computeAffinity(master, level, breakthroughs) {
  const aff = master.affinity;
  level = Math.max(0, Math.min(100, parseInt(level) || 0));
  if (!aff || level < 1) return { bonus: 0, tierIndex: 0, tierLevel: 0, blocked: false, blockedGate: null, level: 0 };
  let tierIndex = 0, blocked = false, blockedGate = null;
  for (const g of aff.gates) {
    if (g.level > level) break;
    if (breakthroughs && breakthroughs[g.level]) { tierIndex++; }
    else { blocked = true; blockedGate = g; break; }
  }
  const bonus = blocked ? blockedGate.lockedBonus : aff.levelBonus[level - 1];
  const tierLevel = aff.stages[tierIndex] ? aff.stages[tierIndex].min : (tierIndex === 0 ? 1 : 100);
  return { bonus, tierIndex, tierLevel, blocked, blockedGate, level };
}

// Cases à cocher des paliers de percée
function renderBreakthroughs(master, lang) {
  const box = document.getElementById('modal-breakthroughs');
  if (!box || !master.affinity) return;
  const dict = i18nMasters[lang] || i18nMasters.FR;
  const level = modalState.displayLevel || 0;
  box.innerHTML = master.affinity.gates.map(g => {
    const mandatory = level > g.level;    // déjà dépassé -> forcé
    const reachable = level >= g.level;    // atteignable
    const on = !!modalState.breakthroughs[g.level];
    const locked = mandatory || !reachable; // non modifiable
    return `<label class="bt-pill ${on ? 'on' : ''} ${reachable ? '' : 'unreached'} ${mandatory ? 'forced' : ''}">
      <input type="checkbox" ${on ? 'checked' : ''} ${locked ? 'disabled' : ''} onchange="toggleBreakthrough(${g.level})">
      <span class="bt-lvl">${dict.lvlPrefix}${g.level}</span>
      <span class="bt-emb">${g.emblems} ${dict.emblemsLabel}</span>
    </label>`;
  }).join('');
}
window.toggleBreakthrough = function(g) {
  const level = modalState.displayLevel || 0;
  if (level !== g) return;   // seul le palier au niveau exact est modifiable
  if (modalState.breakthroughs[g]) delete modalState.breakthroughs[g];
  else modalState.breakthroughs[g] = true;
  updateMasterUI();
};

let mastersDB = [];
let userMasters = safeParse(STORAGE_KEYS.masters, {});
// Migration : ancien format {relLevel} -> {displayLevel, breakthroughs}
(function migrateMasters() {
  let changed = false;
  for (const id in userMasters) {
    const u = userMasters[id];
    if (u && u.breakthroughs === undefined) {
      const rel = u.relLevel || 0;
      u.breakthroughs = {};
      [10,20,30,40,50,60,70,80,90,100].forEach(g => { if (rel >= g) u.breakthroughs[g] = true; });
      if (u.displayLevel === undefined) u.displayLevel = rel;
      changed = true;
    }
  }
  if (changed) localStorage.setItem(STORAGE_KEYS.masters, JSON.stringify(userMasters));
})();
let currentMasterId = null;
let modalState = { displayLevel: 0, breakthroughs: {}, relLevel: 0, skills: {} };

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
    const relOf = (m) => (userMasters[m.id] && userMasters[m.id].displayLevel) || 0;

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
        const userData = userMasters[master.id] || { displayLevel: 0, breakthroughs: {}, skills: {} };
        const displayLevel = userData.displayLevel || 0;
        const stageLevel = computeAffinity(master, displayLevel, userData.breakthroughs || {}).tierLevel;
        const isLocked = displayLevel < 1;
        
        // Nom sécurisé pour le chemin d'image
        const safeImgName = encodeURIComponent(master.name['EN']);
        const mName = master.name[lang] || master.name['EN'];
        const mTitle = master.title[lang] || master.title['EN'];

        const statusObj = getStageObj(stageLevel);
        const statusText = statusObj[lang] || statusObj['EN'];

        const card = document.createElement('div');
        card.className = `master-card ${isLocked ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="master-portrait" style="background-image: url('img/Master/${safeImgName}.webp');"></div>
            <div class="master-info">
                <h3 class="master-name">${mName}</h3>
                <div class="master-title">${mTitle}</div>
                <div class="master-rel-badge">${dict.lvlPrefix}${displayLevel} • ${statusText}</div>
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
        displayLevel: (userData.displayLevel !== undefined ? userData.displayLevel : (userData.relLevel || 0)),
        breakthroughs: { ...(userData.breakthroughs || {}) },
        relLevel: 0,
        skills: { ...userData.skills }
    };

    let lang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
    const safeImgName = encodeURIComponent(master.name['EN']);

    document.getElementById('modal-header-bg').style.backgroundImage = `url('img/Master/${safeImgName}.webp')`;
    document.getElementById('modal-master-name').textContent = master.name[lang] || master.name['EN'];
    const nameInline = document.getElementById('modal-master-name-inline');
    if (nameInline) nameInline.textContent = master.name[lang] || master.name['EN'];
    document.getElementById('modal-master-title').textContent = master.title[lang] || master.title['EN'];
    
    const lvlInput = document.getElementById('modal-rel-level');
    if (lvlInput) lvlInput.value = modalState.displayLevel;
    renderBreakthroughs(master, lang);

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
    
    // Niveau saisi (1-100) + paliers débloqués → pilote tout
    const _lvlInput = document.getElementById('modal-rel-level');
    if (_lvlInput) {
        let v = parseInt(_lvlInput.value);
        if (isNaN(v)) v = 0;
        if (v > 100) { v = 100; _lvlInput.value = 100; }   // cap dur à 100
        if (v < 0)   { v = 0;   _lvlInput.value = 0; }
        modalState.displayLevel = v;
    }
    normalizeBreakthroughs(master, modalState.displayLevel);   // aligne paliers/niveau
    const eff = computeAffinity(master, modalState.displayLevel, modalState.breakthroughs);
    modalState.relLevel = eff.tierLevel;   // pilote expertise passive + skills (logique existante)
    renderBreakthroughs(master, lang);      // reflète l'état "atteint" selon le niveau

    // Type d'affinité (relation) affiché au-dessus du niveau, selon niveau + paliers
    const typeEl = document.getElementById('modal-affinity-type');
    if (typeEl) { const st = getStageObj(eff.tierLevel); typeEl.textContent = st[lang] || st.EN; }
    
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
        if (eff.level >= 1 && master.TextToInclude) {
            affEl.innerHTML = injectValue(master.TextToInclude, lang, eff.bonus);
            affEl.style.display = 'block';
        } else {
            affEl.style.display = 'none';
        }
    }
    const warnEl = document.getElementById('modal-blocked-warning');
    if (warnEl) {
        if (eff.blocked) {
            const g = eff.blockedGate;
            warnEl.innerHTML = (lang === 'FR')
                ? `🔒 Progression bloquée au <strong>niveau ${g.level}</strong> : dépense <strong>${g.emblems}</strong> emblèmes pour débloquer le palier et accéder au bonus supérieur.`
                : `🔒 Progress blocked at <strong>level ${g.level}</strong>: spend <strong>${g.emblems}</strong> emblems to unlock the breakthrough and reach the higher bonus.`;
            warnEl.style.display = 'block';
        } else {
            warnEl.style.display = 'none';
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
                    <div class="skill-icon" style="background-image: url('img/MasterSkill/${safePassiveImg}.webp');"></div>
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
                    <div class="skill-icon" style="background-image: url('img/MasterSkill/${safeSkillImg}.webp');"></div>
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
    if ((modalState.displayLevel || 0) < 1) {
        delete userMasters[currentMasterId];
    } else {
        userMasters[currentMasterId] = {
            displayLevel: modalState.displayLevel || 0,
            breakthroughs: modalState.breakthroughs || {},
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

function msInitHelp() {
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id: 'masters', banner: true, anchor: '[data-i18n="pageTitle"]',
        title: { FR: 'Conseil des Experts — Aide', EN: 'Hall of Masters — Help' },
        summary: {
            FR: "Gère tes experts et calcule leur bonus d'affinité exact. Saisis le niveau et coche les paliers de percée (les emblèmes dépensés) : l'outil affiche le bonus réel, ta relation et ton expertise passive.",
            EN: "Manage your experts and get their exact affinity bonus. Enter the level and tick the breakthroughs you've paid (emblems spent): the tool shows the real bonus, your relationship tier and passive expertise."
        },
        steps: {
            FR: [
                "Ouvre un expert et saisis son niveau (1-100).",
                "Coche les paliers de percée dont tu as dépensé les emblèmes. Les paliers déjà dépassés par ton niveau se cochent automatiquement ; celui à ton niveau exact reste à ton choix.",
                "Le bonus d'affinité exact s'affiche. Si un palier requis n'est pas débloqué, un avertissement indique combien d'emblèmes dépenser (le bonus reste plafonné en attendant).",
                "Règle ensuite tes compétences ; utilise la recherche, le tri et « Masquer les experts non débloqués » pour naviguer."
            ],
            EN: [
                "Open an expert and enter its level (1-100).",
                "Tick the breakthroughs whose emblems you've spent. Gates already passed by your level are auto-ticked; the one at your exact level is your choice.",
                "The exact affinity bonus is shown. If a required breakthrough is missing, a warning tells you how many emblems to spend (the bonus stays capped until then).",
                "Then set your skills; use search, sorting and “Hide locked experts” to browse."
            ]
        }
    });
}

document.addEventListener('DOMContentLoaded', () => { initMasters(); msInitHelp(); });
