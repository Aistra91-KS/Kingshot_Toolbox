// ==========================================
// DICTIONNAIRE DE TRADUCTION
// ==========================================
const i18nCaserne = {
    FR: {
        pageTitle: "Ma Caserne",
        pageDesc: "Cliquez sur un héros pour configurer ses compétences, son niveau et ses étoiles.",
        filterSort: "Tri & Filtres",
        sortBy: "Trier par",
        sortRarityDesc: "Rareté (Décroissant)",
        sortRarityAsc: "Rareté (Croissant)",
        sortGenDesc: "Génération (Plus récente)",
        sortGenAsc: "Génération (Plus ancienne)",
        sortName: "Nom (A-Z)",
        filterGen: "Générations (Multi-choix)",
        filterType: "Type",
        typeAll: "Tous les types",
        typeInf: "Infanterie 🛡️",
        typeCav: "Cavalerie 🐎",
        typeArc: "Archers 🏹",
        filterRarity: "Rareté",
        rarityAll: "Toutes",
        rarityLeg: "Légendaire 🟡",
        rarityEpi: "Épique 🟣",
        rarityRar: "Rare 🔵",
        filterUnlocked: "Uniquement les débloqués",
        lvlPrefix: "Niv.", 
        modalWIP: "(Bientôt) Modale pour configurer"
    },
    EN: {
        pageTitle: "My Barracks",
        pageDesc: "Click on a hero to configure their skills, level, and stars.",
        filterSort: "Sort & Filters",
        sortBy: "Sort by",
        sortRarityDesc: "Rarity (Descending)",
        sortRarityAsc: "Rarity (Ascending)",
        sortGenDesc: "Generation (Newest first)",
        sortGenAsc: "Generation (Oldest first)",
        sortName: "Name (A-Z)",
        filterGen: "Generations (Multi-choice)",
        filterType: "Type",
        typeAll: "All types",
        typeInf: "Infantry 🛡️",
        typeCav: "Cavalry 🐎",
        typeArc: "Archers 🏹",
        filterRarity: "Rarity",
        rarityAll: "All",
        rarityLeg: "Legendary 🟡",
        rarityEpi: "Epic 🟣",
        rarityRar: "Rare 🔵",
        filterUnlocked: "Unlocked only",
        lvlPrefix: "Lv.", 
        modalWIP: "(Coming soon) Modal to configure"
    }
};

// Variables globales
let heroesDB = []; 
let userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
let currentEditingHeroObj = null;

const rarityWeight = { "legendary": 3, "epic": 2, "rare": 1 };

const DEFAULT_FILTERS = {
    sortBy: 'rarity-desc',
    filterType: 'all',
    filterRarity: 'all',
    checkedGens: ['1'],
    filterUnlocked: false
};

// ==========================================
// SYSTÈME DE TRADUCTION 
// ==========================================

function initCaserneLanguage() {
    // On utilise directement ton objet GlobalLang défini dans lang.js
    let savedLang = window.GlobalLang ? window.GlobalLang.get() : (localStorage.getItem('hub_lang') || 'EN');
    applyCaserneTranslations(savedLang.toUpperCase());
}

window.addEventListener('langChanged', (e) => {
    if (e.detail && e.detail.lang) {
        applyCaserneTranslations(e.detail.lang.toUpperCase());
    } else {
        initCaserneLanguage();
    }
});

// Écoute les changements depuis un autre onglet (utilise la clé 'hub_lang')
window.addEventListener('storage', (e) => {
    if (e.key === 'hub_lang') {
        applyCaserneTranslations(e.newValue.toUpperCase());
    }
});

function applyCaserneTranslations(lang) {
    const dict = i18nCaserne[lang] || i18nCaserne['FR'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    if (heroesDB.length > 0) renderHeroes();
}

// ==========================================
// INITIALISATION DE LA PAGE
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Charger les filtres en mémoire
    loadFilters();

    // 2. Lancer la traduction immédiate
    initCaserneLanguage();

    // 3. Charger le JSON
    try {
        const response = await fetch('data/heroes_db.json'); 
        if (!response.ok) throw new Error("Fichier JSON introuvable");
        
        heroesDB = await response.json(); 
        renderHeroes(); 
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }

    // 4. Écouteurs pour tous les filtres
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-rarity').addEventListener('change', handleFilterChange);
    
    // Écouteur MANQUANT pour la case "Uniquement débloqués"
    const unlockedCheckbox = document.getElementById('filter-unlocked-only');
    if (unlockedCheckbox) {
        unlockedCheckbox.addEventListener('change', handleFilterChange);
    }
    
    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.addEventListener('change', handleFilterChange);
    });

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('save-modal').addEventListener('click', saveHeroSettings);
});

// ==========================================
// GESTION DES FILTRES
// ==========================================

function loadFilters() {
    const saved = JSON.parse(localStorage.getItem('caserne_filters')) || DEFAULT_FILTERS;
    
    if(document.getElementById('sort-by')) document.getElementById('sort-by').value = saved.sortBy;
    if(document.getElementById('filter-type')) document.getElementById('filter-type').value = saved.filterType;
    if(document.getElementById('filter-rarity')) document.getElementById('filter-rarity').value = saved.filterRarity;
    
    if(document.getElementById('filter-unlocked-only')) {
        document.getElementById('filter-unlocked-only').checked = saved.filterUnlocked || false;
    }

    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.checked = saved.checkedGens.includes(cb.value);
    });
}

function saveFilters() {
    const sortBy = document.getElementById('sort-by').value;
    const filterType = document.getElementById('filter-type').value;
    const filterRarity = document.getElementById('filter-rarity').value;
    const checkedGens = Array.from(document.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);
    
    const unlockedCheckbox = document.getElementById('filter-unlocked-only');
    const filterUnlocked = unlockedCheckbox ? unlockedCheckbox.checked : false;

    const filters = { sortBy, filterType, filterRarity, checkedGens, filterUnlocked };
    localStorage.setItem('caserne_filters', JSON.stringify(filters));
}

function handleFilterChange() {
    saveFilters(); 
    renderHeroes(); 
}

// ==========================================
// LOGIQUE DE TRI ET D'AFFICHAGE
// ==========================================

function getTroopEmoji(type) {
    if (type.toLowerCase() === 'infantry') return '🛡️';
    if (type.toLowerCase() === 'cavalry') return '🐎';
    if (type.toLowerCase() === 'archer') return '🏹';
    return '⚔️';
}

function sortHeroes(heroes, sortType) {
    return heroes.sort((a, b) => {
        const genDiff = b.generation - a.generation; 
        const nameDiff = a.name.localeCompare(b.name); 

        if (sortType === 'rarity-desc') {
            const rarityDiff = rarityWeight[b.rarity.toLowerCase()] - rarityWeight[a.rarity.toLowerCase()];
            if (rarityDiff !== 0) return rarityDiff;
            if (genDiff !== 0) return genDiff;      
            return nameDiff;                        
        }
        if (sortType === 'rarity-asc') {
            const rarityDiff = rarityWeight[a.rarity.toLowerCase()] - rarityWeight[b.rarity.toLowerCase()];
            if (rarityDiff !== 0) return rarityDiff;
            if (genDiff !== 0) return genDiff;
            return nameDiff;
        }
        if (sortType === 'gen-desc') {
            if (genDiff !== 0) return genDiff;
            const rarityDiff = rarityWeight[b.rarity.toLowerCase()] - rarityWeight[a.rarity.toLowerCase()];
            if (rarityDiff !== 0) return rarityDiff;
            return nameDiff;
        }
        if (sortType === 'gen-asc') {
            const genAscDiff = a.generation - b.generation;
            if (genAscDiff !== 0) return genAscDiff;
            const rarityDiff = rarityWeight[b.rarity.toLowerCase()] - rarityWeight[a.rarity.toLowerCase()];
            if (rarityDiff !== 0) return rarityDiff;
            return nameDiff;
        }
        if (sortType === 'name') {
            return nameDiff;
        }
        return 0;
    });
}

function generateStarsHTML(totalShards) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        const starThreshold = (i + 1) * 6; 
        const isStarActive = totalShards >= starThreshold;
        
        let pipsActive = 0;
        if (totalShards >= starThreshold) {
            pipsActive = 6;
        } else if (totalShards > i * 6) {
            pipsActive = totalShards - (i * 6);
        }

        let pipsHTML = '';
        for (let p = 0; p < 6; p++) {
            pipsHTML += `<div class="shard-pip ${p < pipsActive ? 'active' : ''}"></div>`;
        }

        html += `
            <div class="hero-star-group">
                <div class="star-icon ${isStarActive ? 'active' : ''}">★</div>
                <div class="shard-bar">${pipsHTML}</div>
            </div>
        `;
    }
    return html;
}

function renderHeroes() {
    const grid = document.getElementById('heroes-grid');
    grid.innerHTML = ''; 

    // Détermination de la langue pour Niv / Lv
    let currentLang = window.GlobalLang ? window.GlobalLang.get() : (localStorage.getItem('hub_lang') || 'EN');
    currentLang = currentLang.toUpperCase();
    const dict = i18nCaserne[currentLang] || i18nCaserne['FR'];

    const sortBy = document.getElementById('sort-by').value;
    const filterType = document.getElementById('filter-type').value;
    const filterRarity = document.getElementById('filter-rarity').value;
    const checkedGens = Array.from(document.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);
    
    const unlockedCheckbox = document.getElementById('filter-unlocked-only');
    const isUnlockedOnlyChecked = unlockedCheckbox ? unlockedCheckbox.checked : false;

    let filteredHeroes = heroesDB.filter(hero => {
        const hData = userHeroes[hero.id] || { unlocked: false };
        
        // 1. Vérification "Uniquement débloqués"
        if (isUnlockedOnlyChecked && !hData.unlocked) return false;

        // 2. Autres filtres
        if (!checkedGens.includes(hero.generation.toString())) return false;
        if (filterType !== 'all' && hero.troopType.toLowerCase() !== filterType.toLowerCase()) return false;
        if (filterRarity !== 'all' && hero.rarity.toLowerCase() !== filterRarity.toLowerCase()) return false;
        return true;
    });

    const sortedHeroes = sortHeroes(filteredHeroes, sortBy);

    sortedHeroes.forEach(hero => {
        const heroData = userHeroes[hero.id] || { unlocked: false, level: 1, shards: 0, skills: [0, 0, 0] };
        const isLocked = !heroData.unlocked; 

        const card = document.createElement('div');
        card.className = `hero-card ${hero.rarity.toLowerCase()} ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="hero-image" style="background-image: url('img/heroes/${hero.name}.png');"></div>
            <div class="hero-gradient"></div>
            
            <div class="hero-type-badge">${getTroopEmoji(hero.troopType)}</div>
            <div class="hero-gen-badge">Gen ${hero.generation}</div>
            
            <div class="hero-name-row">
                <div class="hero-name">${hero.name}</div>
                <div class="hero-level">${dict.lvlPrefix}${heroData.level}</div>
            </div>
            
            <div class="hero-shards-container">
                ${generateStarsHTML(heroData.shards)}
            </div>
        `;

        card.addEventListener('click', () => openModal(hero, heroData));
        grid.appendChild(card);
    });
}

// ==========================================
// GESTION DE LA MODALE & LOGIQUE DE JEU
// ==========================================

let modalState = {
    unlocked: false,
    level: 1,
    shards: 0,
    skills: [0, 0, 0] 
};

function openModal(hero, heroData) {
    currentEditingHeroObj = hero;
    
    modalState.unlocked = heroData.level > 1 || heroData.shards > 0 || (heroData.skills && heroData.skills.some(s => s > 0));
    if (heroData.unlocked !== undefined) modalState.unlocked = heroData.unlocked; 
    
    modalState.level = heroData.level || 1;
    modalState.shards = heroData.shards || 0;
    modalState.skills = heroData.skills || [0, 0, 0];

    document.getElementById('modal-hero-name').textContent = hero.name;
    document.getElementById('modal-unlocked').checked = modalState.unlocked;
    document.getElementById('modal-level').value = modalState.level;
    document.getElementById('modal-shards').value = modalState.shards;
    
    document.getElementById('modal-unlocked').onchange = (e) => {
        modalState.unlocked = e.target.checked;
        if (!modalState.unlocked) {
            modalState.level = 1; modalState.shards = 0; modalState.skills = [0, 0, 0];
            document.getElementById('modal-level').value = 1;
            document.getElementById('modal-shards').value = 0;
        }
        updateModalUI();
    };
    
    document.getElementById('modal-level').oninput = (e) => { 
        let val = parseInt(e.target.value) || 1;
        if (val > 80) val = 80; 
        if (val < 1) val = 1;   
        modalState.level = val;
        e.target.value = val;   
    };
    
    document.getElementById('modal-shards').oninput = (e) => { 
        modalState.shards = parseInt(e.target.value) || 0; 
        updateModalUI(); 
    };

    // Ouvre le tiroir et pousse la grille
    document.getElementById('hero-modal').classList.add('show');
    document.body.classList.add('modal-active');
    updateModalUI();
}

function updateModalUI() {
    const isUnlocked = modalState.unlocked;
    const body = document.getElementById('modal-body');
    
    body.style.opacity = isUnlocked ? '1' : '0.3';
    body.style.pointerEvents = isUnlocked ? 'auto' : 'none';

    document.getElementById('modal-shards-count').textContent = modalState.shards;
    const fullStars = Math.floor(modalState.shards / 6);
    let starsDisplay = '';
    for (let i = 0; i < 5; i++) {
        starsDisplay += (i < fullStars) ? '★' : '☆';
    }
    document.getElementById('modal-stars-display').textContent = starsDisplay;

    renderModalSkills(fullStars);
}

function renderModalSkills(fullStars) {
    const skillsContainer = document.getElementById('modal-skills-list');
    skillsContainer.innerHTML = '';

    // 1. On récupère la langue actuelle
    let currentLang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : 'EN';

    let maxSkillLevel = 2; 
    if (fullStars >= 1) maxSkillLevel = 3; 
    if (fullStars >= 3) maxSkillLevel = 4; 
    if (fullStars >= 4) maxSkillLevel = 5; 

    const heroSkills = currentEditingHeroObj.skills || [];

    heroSkills.forEach((skill, index) => {
        const isSkill3 = index === 2;
        const isLocked = isSkill3 && fullStars < 1;

        if (isLocked) modalState.skills[index] = 0;
        else if (modalState.skills[index] > maxSkillLevel) modalState.skills[index] = maxSkillLevel;

        const currentLvl = modalState.skills[index];

        // 2. GESTION DE LA TRADUCTION (Avec sécurité si la DB n'est pas encore traduite)
        // Si 'skill.name' est un objet (le nouveau format bilingue), on prend la bonne langue. Sinon on garde l'ancien format texte.
        const localizedName = typeof skill.name === 'object' ? (skill.name[currentLang] || skill.name['EN']) : skill.name;
        let effectText = typeof skill.effect === 'object' ? (skill.effect[currentLang] || skill.effect['EN']) : skill.effect;
        
        // 3. NOM DE L'IMAGE : On force TOUJOURS l'anglais pour le fichier PNG
        const imageName = typeof skill.name === 'object' ? skill.name['EN'] : skill.name;
        // On remplace les apostrophes par leur code URL (%27) pour ne pas casser le CSS
        const safeImageName = imageName.replace(/'/g, "%27");

        // Remplacement dynamique des "X%" ou "(X%, Y%)"
        if (currentLvl > 0 && skill.levels && skill.levels[currentLvl - 1]) {
            let valueStr = skill.levels[currentLvl - 1];

            if (valueStr.startsWith('(') && valueStr.endsWith(')')) {
                valueStr = valueStr.substring(1, valueStr.length - 1);
                let values = valueStr.split(',');
                values.forEach(val => {
                    effectText = effectText.replace(/X%|X/, `<span style="color:#f5b840; font-weight:bold;">${val.trim()}</span>`);
                });
            } else {
                effectText = effectText.replace(/X%|X/g, `<span style="color:#f5b840; font-weight:bold;">${valueStr}</span>`);
            }
        }

        // Génération des pips [1][2][3][4][5]
        let pipsHTML = '';
        for (let i = 1; i <= 5; i++) {
            let stateClass = '';
            if (isLocked || i > maxSkillLevel) stateClass = 'locked';
            else if (i <= currentLvl) stateClass = 'active';

            const onClickCode = stateClass === 'locked' ? '' : `onclick="setModalSkillLevel(${index}, ${i === currentLvl ? 0 : i})"`;
            
            pipsHTML += `<div class="skill-pip ${stateClass}" ${onClickCode}>${i}</div>`;
        }

        // Création de la ligne HTML
        skillsContainer.innerHTML += `
            <div class="skill-row ${isLocked ? 'locked' : ''}">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/skills/${safeImageName}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name">${localizedName}</div>
                        <div class="skill-effect">${effectText}</div>
                    </div>
                </div>
                <div class="skill-pips-container">
                    ${pipsHTML}
                </div>
            </div>
        `;
    });
}

window.setModalSkillLevel = function(skillIndex, newLevel) {
    modalState.skills[skillIndex] = newLevel;
    updateModalUI();
};

function closeModal() {
    // Ferme le tiroir et remet la grille à sa place
    document.getElementById('hero-modal').classList.remove('show');
    document.body.classList.remove('modal-active');
    currentEditingHeroObj = null;
}

function saveHeroSettings() {
    if (!currentEditingHeroObj) return;
    
    if (!modalState.unlocked) {
        delete userHeroes[currentEditingHeroObj.id];
    } else {
        userHeroes[currentEditingHeroObj.id] = {
            unlocked: true,
            level: modalState.level,
            shards: modalState.shards,
            skills: modalState.skills
        };
    }
    
    localStorage.setItem('caserne_user_heroes', JSON.stringify(userHeroes));
    closeModal();
    renderHeroes(); 
}
