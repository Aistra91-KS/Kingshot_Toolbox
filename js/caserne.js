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
    const currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nCaserne[currentLang];

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
        const heroData = userHeroes[hero.id] || { level: 1, shards: 0 };
        const isLocked = heroData.shards === 0 && heroData.level === 1; 

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

function openModal(hero, heroData) {
    const currentLang = window.GlobalLang ? window.GlobalLang.get() : 'EN';
    const dict = i18nCaserne[currentLang];

    currentEditingHero = hero.id;
    document.getElementById('modal-hero-name').textContent = hero.name;
    alert(`${dict.modalWIP} ${hero.name}.\nLevel: ${heroData.level}\nFragments: ${heroData.shards}/30`);
}

function closeModal() {
    document.getElementById('hero-modal').style.display = 'none';
    currentEditingHero = null;
}
