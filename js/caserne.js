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
        modalUnlocked: "Débloqué",
        modalLvl: "Niveau du Héros",
        modalShards: "Fragments d'étoiles :",
        modalSkills: "COMPÉTENCES",
        modalCancel: "Annuler",
        modalSave: "Enregistrer",
        modalWidgetLvl: "Niveau :",
        modalWidgetTitle: "Équipement Exclusif",
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
        modalWIP: "(Coming soon) Modal to configure",
        modalUnlocked: "Unlocked",
        modalLvl: "Hero Level",
        modalShards: "Star Shards :",
        modalSkills: "SKILLS",
        modalCancel: "Cancel",
        modalWidgetLvl: "Level:",
        modalWidgetTitle: "Exclusive Gear",
        modalSave: "Save"
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
// CALCUL DU WIDGET
// ==========================================
function getWidgetEffectValue(levelsArray, widgetLevel, isConquest) {
    if (widgetLevel == 0) return "0%"; // Niveau 0 = aucun bonus
    
    let index;
    if (isConquest) {
        // Conquête : niveaux impairs (1, 3, 5, 7, 9) -> indices 0, 1, 2, 3, 4
        index = Math.ceil(widgetLevel / 2) - 1;
    } else {
        // Expédition : niveaux pairs (2, 4, 6, 8, 10) -> indices 0, 1, 2, 3, 4
        if (widgetLevel < 2) return "0%"; 
        index = Math.floor(widgetLevel / 2) - 1;
    }
    
    if (index >= levelsArray.length) index = levelsArray.length - 1;
    if (index < 0) index = 0;
    return levelsArray[index];
}


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
    
    // NOUVEAU : Met à jour les textes de la fenêtre latérale si elle est ouverte !
    if (currentEditingHeroObj && document.getElementById('hero-modal').classList.contains('show')) {
        updateModalUI();
    }
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
            <div class="hero-image" style="background-image: url('img/heroes/${encodeURIComponent(hero.name)}.png');"></div>
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
    skills: [0, 0, 0],
    widgetLevel: 0 // NOUVEAU
};

function openModal(hero, heroData) {
    currentEditingHeroObj = hero;
    
    modalState.unlocked = heroData.level > 1 || heroData.shards > 0 || (heroData.skills && heroData.skills.some(s => s > 0));
    if (heroData.unlocked !== undefined) modalState.unlocked = heroData.unlocked; 
    
    modalState.level = heroData.level || 1;
    modalState.shards = heroData.shards || 0;
    modalState.skills = heroData.skills || [0, 0, 0];
    modalState.widgetLevel = heroData.widgetLevel || 0;

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
    renderModalWidget(); // NOUVEAU : On appelle bien l'affichage du widget ici !
}

function renderModalSkills(fullStars) {
    const skillsContainer = document.getElementById('modal-skills-list');
    skillsContainer.innerHTML = '';

    // 1. On récupère la langue actuelle directement de la mémoire (EN par défaut)
    let currentLang = (localStorage.getItem('hub_lang') || 'EN').toUpperCase();

    // ==========================================
    // LOGIQUE DE PROGRESSION DES COMPÉTENCES
    // ==========================================
    let maxSkillLevel = 1; // 0 étoile (0-5 fragments) -> Niv. 1 max
    if (fullStars >= 1) maxSkillLevel = 2; // 1 étoile (6-11 fragments) -> Niv. 2 max
    if (fullStars >= 2) maxSkillLevel = 3; // 2 étoiles (12-17 fragments) -> Niv. 3 max
    if (fullStars >= 3) maxSkillLevel = 4; // 3 étoiles (18-23 fragments) -> Niv. 4 max
    if (fullStars >= 4) maxSkillLevel = 5; // 4 ou 5 étoiles (24+ fragments) -> Niv. 5 max

    const heroSkills = currentEditingHeroObj.skills || [];

    heroSkills.forEach((skill, index) => {
        const isSkill3 = index === 2;
        
        // La 3ème compétence se débloque uniquement à 2 étoiles pleines (12 fragments)
        const isLocked = isSkill3 && fullStars < 2;

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
        const safeImageName = encodeURIComponent(imageName);

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

function renderModalWidget() {
    const widgetContainer = document.getElementById('hero-widget-container');
    const dbHero = currentEditingHeroObj;

    if (dbHero.widget) {
        widgetContainer.style.display = 'block';

        let currentLang = window.GlobalLang ? window.GlobalLang.get().toUpperCase() : (localStorage.getItem('hub_lang') || 'EN').toUpperCase();
        let dict = i18nCaserne[currentLang] || i18nCaserne['FR'];

        // Noms traduits pour l'affichage textuel
        let widgetName = dbHero.widget.name[currentLang] || dbHero.widget.name['EN'];
        let nameConquest = dbHero.widget.effectConquest.name[currentLang] || dbHero.widget.effectConquest.name['EN'];
        let nameExpe = dbHero.widget.effectExpe.name[currentLang] || dbHero.widget.effectExpe.name['EN'];

        // Noms EN sécurisés pour les chemins d'images (remplacement des apostrophes)
        const safeWidgetImg = encodeURIComponent(dbHero.widget.name['EN']);
        const safeConquestImg = encodeURIComponent(dbHero.widget.effectConquest.name['EN']);
        const safeExpeImg = encodeURIComponent(dbHero.widget.effectExpe.name['EN']);

        let savedWidgetLevel = modalState.widgetLevel;
        
        // CORRECTION 1 : Ajout des styles explicites sur les <option> pour le mode sombre
        let optionsHTML = Array.from({length: 11}, (_, i) => `<option value="${i}" style="background: var(--bg-color); color: var(--text-light);" ${i == savedWidgetLevel ? 'selected' : ''}>${i}</option>`).join('');

        // Structure HTML globale du bloc
        // Structure HTML globale du bloc
        let widgetHTML = `
            <h4 style="margin: 0 0 15px 0; color: var(--text-muted); text-transform: uppercase; font-size: 13px;">${dict.modalWidgetTitle || 'Équipement Exclusif'}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="skill-icon" style="background-image: url('img/widgetname/${safeWidgetImg}.png'); border: 1px solid #f5b840; width: 34px; height: 34px; border-radius: 6px;"></div>
                    <h4 style="margin: 0; font-size: 14px; color: #f5b840; text-transform: uppercase;">${widgetName}</h4>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 11px; color: var(--text-muted);">${dict.modalWidgetLvl || 'Level:'}</span>
                    <select id="widget-level-select" style="padding: 2px 5px; font-size: 12px; border-radius: 4px; background: var(--control-bg); color: var(--text-light); border: 1px solid var(--border);" onchange="setModalWidgetLevel(this.value)">
                        ${optionsHTML}
                    </select>
                </div>
            </div>
            <div id="widget-effects-display" style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Les effets seront injectés ici -->
            </div>
        `;
        widgetContainer.innerHTML = widgetHTML;

        // Récupération des bonnes valeurs selon le niveau
        let valConquest = getWidgetEffectValue(dbHero.widget.effectConquest.levels, savedWidgetLevel, true);
        let valExpe = getWidgetEffectValue(dbHero.widget.effectExpe.levels, savedWidgetLevel, false);

        // CORRECTION 2 : Détection des valeurs à 0%
        let isConquestLocked = valConquest === "0%";
        let isExpeLocked = valExpe === "0%";

        // Récupération des textes bruts
        let rawDescConquest = dbHero.widget.effectConquest.description[currentLang] || dbHero.widget.effectConquest.description['EN'];
        let rawDescExpe = dbHero.widget.effectExpe.description[currentLang] || dbHero.widget.effectExpe.description['EN'];

        let colorConquest = isConquestLocked ? 'var(--text-muted)' : '#e74c5c';
        let colorExpe = isExpeLocked ? 'var(--text-muted)' : '#3498db';

        // NOUVEAU : Fonction qui gère les valeurs multiples "(val1, val2)"
        const formatWidgetDesc = (desc, valString, color) => {
            if (valString.startsWith('(') && valString.endsWith(')')) {
                // S'il y a plusieurs valeurs, on les sépare et on remplace les X un par un
                let values = valString.substring(1, valString.length - 1).split(',');
                let result = desc;
                values.forEach(v => {
                    result = result.replace(/X%|X/, `<span style="color:${color}; font-weight:bold;">${v.trim()}</span>`);
                });
                return result;
            } else {
                // Sinon, remplacement classique
                return desc.replace(/X%|X/g, `<span style="color:${color}; font-weight:bold;">${valString}</span>`);
            }
        };

        let descConquest = formatWidgetDesc(rawDescConquest, valConquest, colorConquest);
        let descExpe = formatWidgetDesc(rawDescExpe, valExpe, colorExpe);

        // Injection des effets avec les classes conditionnelles .locked ou .active
        document.getElementById('widget-effects-display').innerHTML = `
            <div class="skill-row ${isConquestLocked ? 'locked' : 'active'}">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/widgetskill/${safeConquestImg}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name" style="color: ${isConquestLocked ? 'var(--text-muted)' : '#e74c5c'};"> ${nameConquest}</div>
                        <div class="skill-effect">${descConquest}</div>
                    </div>
                </div>
            </div>
            <div class="skill-row ${isExpeLocked ? 'locked' : 'active'}">
                <div class="skill-header">
                    <div class="skill-icon" style="background-image: url('img/widgetskill/${safeExpeImg}.png');"></div>
                    <div class="skill-info">
                        <div class="skill-name" style="color: ${isExpeLocked ? 'var(--text-muted)' : '#3498db'};"> ${nameExpe}</div>
                        <div class="skill-effect">${descExpe}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        widgetContainer.style.display = 'none';
        widgetContainer.innerHTML = '';
    }
}

// Ajout de l'événement lié au menu déroulant
window.setModalWidgetLevel = function(val) {
    modalState.widgetLevel = parseInt(val, 10);
    updateModalUI();
};


function closeModal() {
    // 1. On ferme le tiroir visuellement (il glisse vers la droite)
    document.getElementById('hero-modal').classList.remove('show');
    
    // 2. On attend la fin de l'animation (400ms) pour étendre la grille
    setTimeout(() => {
        document.body.classList.remove('modal-active');
        currentEditingHeroObj = null;
    }, 400); // 400ms correspond à la durée de ton CSS (0.4s)
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
         skills: modalState.skills,
         widgetLevel: modalState.widgetLevel
     };
    }
    
    localStorage.setItem('caserne_user_heroes', JSON.stringify(userHeroes));
    closeModal();
    renderHeroes(); 
}

