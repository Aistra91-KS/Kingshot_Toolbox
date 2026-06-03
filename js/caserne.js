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
        lvlPrefix: "Niv.", // Niveau en français
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
        lvlPrefix: "Lv.", // Level en anglais
        modalWIP: "(Coming soon) Modal to configure"
    }
};

// Variables globales
let heroesDB = []; 
let userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
let currentEditingHero = null;

const rarityWeight = { "legendary": 3, "epic": 2, "rare": 1 };

const DEFAULT_FILTERS = {
    sortBy: 'rarity-desc',
    filterType: 'all',
    filterRarity: 'all',
    checkedGens: ['1'] 
};

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Charger les filtres sauvegardés AVANT de charger les héros
    loadFilters();

    // 2. Initialisation de la langue
    if (window.GlobalLang) {
        applyCaserneTranslations(window.GlobalLang.get());
    }

    // 3. Chargement du fichier JSON
    try {
        const response = await fetch('data/heroes_db.json'); 
        if (!response.ok) throw new Error("Fichier JSON introuvable");
        
        heroesDB = await response.json(); 
        renderHeroes(); 
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }

    // 4. Écouteurs pour les listes déroulantes
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-rarity').addEventListener('change', handleFilterChange);
    
    // 5. Écouteurs pour les cases à cocher de génération
    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.addEventListener('change', handleFilterChange);
    });

    document.getElementById('close-modal').addEventListener('click', closeModal);
});

// Écouteur global pour changer la langue en direct via le header
window.addEventListener('langChanged', (e) => {
    applyCaserneTranslations(e.detail.lang);
});

// Applique les textes du dictionnaire à la page HTML
function applyCaserneTranslations(lang) {
    const dict = i18nCaserne[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // On relance le rendu des cartes pour mettre à jour les "Niv." / "Lv."
    if (heroesDB.length > 0) renderHeroes();
}

// ==========================================
// GESTION DES FILTRES (Sauvegarde en mémoire)
// ==========================================

function loadFilters() {
    const saved = JSON.parse(localStorage.getItem('caserne_filters')) || DEFAULT_FILTERS;
    
    if(document.getElementById('sort-by')) document.getElementById('sort-by').value = saved.sortBy;
    if(document.getElementById('filter-type')) document.getElementById('filter-type').value = saved.filterType;
    if(document.getElementById('filter-rarity')) document.getElementById('filter-rarity').value = saved.filterRarity;

    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.checked = saved.checkedGens.includes(cb.value);
    });
}

function saveFilters() {
    const sortBy = document.getElementById('sort-by').value;
    const filterType = document.getElementById('filter-type').value;
    const filterRarity = document.getElementById('filter-rarity').value;
    const checkedGens = Array.from(document.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);

    const filters = { sortBy, filterType, filterRarity, checkedGens };
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

    // On récupère la langue actuelle pour savoir s'il faut afficher "Lv." ou "Niv."
    // (Avec une petite sécurité si la langue n'est pas encore chargée)
    const currentLang = window.GlobalLang ? window.GlobalLang.get() : 'FR';
    const dict = i18nCaserne[currentLang] || i18nCaserne['FR'];

    const sortBy = document.getElementById('sort-by').value;
    const filterType = document.getElementById('filter-type').value;
    const filterRarity = document.getElementById('filter-rarity').value;
    const checkedGens = Array.from(document.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value);

    let filteredHeroes = heroesDB.filter(hero => {
        if (!checkedGens.includes(hero.generation.toString())) return false;
        if (filterType !== 'all' && hero.troopType.toLowerCase() !== filterType.toLowerCase()) return false;
        if (filterRarity !== 'all' && hero.rarity.toLowerCase() !== filterRarity.toLowerCase()) return false;
        return true;
    });

    const sortedHeroes = sortHeroes(filteredHeroes, sortBy);

    sortedHeroes.forEach(hero => {
        // NOUVELLE LOGIQUE : On lit explicitement l'état "unlocked"
        // Si le héros n'est pas dans la mémoire, il est par défaut non débloqué (false)
        const heroData = userHeroes[hero.id] || { unlocked: false, level: 1, shards: 0, skills: [0, 0, 0] };
        
        // La carte est "locked" (grisée) seulement si heroData.unlocked est false
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

let currentEditingHeroObj = null; // L'objet complet du héros en cours
let modalState = {
    unlocked: false,
    level: 1,
    shards: 0,
    skills: [0, 0, 0] // Niveaux des 3 compétences
};

function openModal(hero, heroData) {
    currentEditingHeroObj = hero;
    
    // Charger les données en mémoire ou initier à zéro
    modalState.unlocked = heroData.level > 1 || heroData.shards > 0 || (heroData.skills && heroData.skills.some(s => s > 0));
    // Si héros verrouillé de base, on coche la case si l'utilisateur l'avait débloqué sans lui donner d'xp
    if (heroData.unlocked !== undefined) modalState.unlocked = heroData.unlocked; 
    
    modalState.level = heroData.level || 1;
    modalState.shards = heroData.shards || 0;
    modalState.skills = heroData.skills || [0, 0, 0];

    // Mettre à jour le HTML de base
    document.getElementById('modal-hero-name').textContent = hero.name;
    document.getElementById('modal-unlocked').checked = modalState.unlocked;
    document.getElementById('modal-level').value = modalState.level;
    document.getElementById('modal-shards').value = modalState.shards;
    
    // Attacher les écouteurs de la modale
    document.getElementById('modal-unlocked').onchange = (e) => {
        modalState.unlocked = e.target.checked;
        if (!modalState.unlocked) {
            // Réinitialiser si on verrouille le héros
            modalState.level = 1; modalState.shards = 0; modalState.skills = [0, 0, 0];
            document.getElementById('modal-level').value = 1;
            document.getElementById('modal-shards').value = 0;
        }
        updateModalUI();
    };
    
    document.getElementById('modal-level').oninput = (e) => { 
        let val = parseInt(e.target.value) || 1;
        if (val > 80) val = 80; // Bloque au maximum à 80
        if (val < 1) val = 1;   // Bloque au minimum à 1
        modalState.level = val;
        e.target.value = val;   // Force l'affichage du bon chiffre dans la case
    };
    document.getElementById('modal-shards').oninput = (e) => { 
        modalState.shards = parseInt(e.target.value) || 0; 
        updateModalUI(); 
    };

    document.getElementById('save-modal').onclick = saveHeroSettings;

    // Lancer l'affichage
    document.getElementById('hero-modal').style.display = 'flex';
    updateModalUI();
}

function updateModalUI() {
    const isUnlocked = modalState.unlocked;
    const body = document.getElementById('modal-body');
    
    // Griser le corps si non débloqué
    body.style.opacity = isUnlocked ? '1' : '0.3';
    body.style.pointerEvents = isUnlocked ? 'auto' : 'none';

    // Mettre à jour l'affichage des étoiles et fragments
    document.getElementById('modal-shards-count').textContent = modalState.shards;
    const fullStars = Math.floor(modalState.shards / 6);
    let starsDisplay = '';
    for (let i = 0; i < 5; i++) {
        starsDisplay += (i < fullStars) ? '★' : '☆';
    }
    document.getElementById('modal-stars-display').textContent = starsDisplay;

    // Mettre à jour les compétences
    renderModalSkills(fullStars);
}

function renderModalSkills(fullStars) {
    const skillsContainer = document.getElementById('modal-skills-list');
    skillsContainer.innerHTML = '';

    // Déterminer le Cap Maximum des compétences selon tes règles
    let maxSkillLevel = 2; // 0 étoile
    if (fullStars >= 1) maxSkillLevel = 3; // 1 ou 2 étoiles
    if (fullStars >= 3) maxSkillLevel = 4; // 3 étoiles
    if (fullStars >= 4) maxSkillLevel = 5; // 4 ou 5 étoiles

    const heroSkills = currentEditingHeroObj.skills || [];

    heroSkills.forEach((skill, index) => {
        // La 3ème compétence est bloquée si moins de 1 étoile
        const isSkill3 = index === 2;
        const isLocked = isSkill3 && fullStars < 1;

        // Auto-correction si le niveau actuel dépasse le max autorisé (suite à une baisse de fragments)
        if (isLocked) modalState.skills[index] = 0;
        else if (modalState.skills[index] > maxSkillLevel) modalState.skills[index] = maxSkillLevel;

        const currentLvl = modalState.skills[index];

        // Remplacement dynamique du X% dans le texte de l'effet
        let effectText = skill.effect;
        if (currentLvl > 0 && skill.levels && skill.levels[currentLvl - 1]) {
            const value = skill.levels[currentLvl - 1];
            effectText = effectText.replace('X%', `<span style="color:#f5b840; font-weight:bold;">${value}</span>`);
        }

        // Génération des petits carrés [1] [2] [3] [4] [5]
        let pipsHTML = '';
        for (let i = 1; i <= 5; i++) {
            let stateClass = '';
            if (isLocked || i > maxSkillLevel) stateClass = 'locked';
            else if (i <= currentLvl) stateClass = 'active';

            // Clic : Si on clique sur le niveau déjà actif, on met à 0, sinon on met au niveau cliqué
            const onClickCode = stateClass === 'locked' ? '' : `onclick="setModalSkillLevel(${index}, ${i === currentLvl ? 0 : i})"`;
            
            pipsHTML += `<div class="skill-pip ${stateClass}" ${onClickCode}>${i}</div>`;
        }

        // Création de la ligne HTML (Intègre ton idée de l'image de compétence)
        skillsContainer.innerHTML += `
            <div class="skill-row ${isLocked ? 'locked' : ''}">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/skills/${skill.name}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name">${skill.name}</div>
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

// Fonction appelée quand on clique sur un [1][2]...
window.setModalSkillLevel = function(skillIndex, newLevel) {
    modalState.skills[skillIndex] = newLevel;
    updateModalUI();
};

function closeModal() {
    document.getElementById('hero-modal').style.display = 'none';
    currentEditingHeroObj = null;
}

function saveHeroSettings() {
    if (!currentEditingHeroObj) return;
    
    // Si le héros est "non débloqué", on le supprime de la mémoire pour nettoyer
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
    
    // Sauvegarde en mémoire et rafraîchissement
    localStorage.setItem('caserne_user_heroes', JSON.stringify(userHeroes));
    closeModal();
    renderHeroes(); 
}
