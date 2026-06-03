// Variables globales
let heroesDB = []; 
let userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
let currentEditingHero = null;

// Poids des raretés pour le tri
const rarityWeight = { "legendary": 3, "epic": 2, "rare": 1 };

// NOUVEAU : Réglages par défaut pour un nouvel utilisateur (Seule la Gen 1 est cochée)
const DEFAULT_FILTERS = {
    sortBy: 'rarity-desc',
    filterType: 'all',
    filterRarity: 'all',
    checkedGens: ['1'] 
};

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Charger les filtres sauvegardés AVANT de charger les héros
    loadFilters();

    // 2. Chargement du fichier JSON
    try {
        const response = await fetch('data/heroes_db.json'); 
        if (!response.ok) throw new Error("Fichier JSON introuvable");
        
        heroesDB = await response.json(); 
        renderHeroes(); 
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }

    // 3. Écouteurs pour les listes déroulantes
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-rarity').addEventListener('change', handleFilterChange);
    
    // 4. Écouteurs pour les cases à cocher de génération
    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.addEventListener('change', handleFilterChange);
    });

    // Fermeture de la modale
    document.getElementById('close-modal').addEventListener('click', closeModal);
});

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
    saveFilters(); // On sauvegarde...
    renderHeroes(); // ...puis on rafraîchit l'affichage
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
        // Sous-tris par défaut (Gen la plus récente d'abord, puis Nom A-Z)
        const genDiff = b.generation - a.generation; 
        const nameDiff = a.name.localeCompare(b.name); 

        if (sortType === 'rarity-desc') {
            const rarityDiff = rarityWeight[b.rarity.toLowerCase()] - rarityWeight[a.rarity.toLowerCase()];
            if (rarityDiff !== 0) return rarityDiff; // 1. On trie par rareté
            if (genDiff !== 0) return genDiff;       // 2. Si même rareté, on trie par génération
            return nameDiff;                         // 3. Si même génération, on trie par nom
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

    // On utilise désormais les valeurs récupérées directement des filtres
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
            <div class="hero-gen-badge">G${hero.generation}</div>
            
            <div class="hero-name-row">
                <div class="hero-name">${hero.name}</div>
                <div class="hero-level">Lv.${heroData.level}</div>
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
    currentEditingHero = hero.id;
    document.getElementById('modal-hero-name').textContent = hero.name;
    alert(`(Bientôt) Modale pour configurer ${hero.name}.\nNiveau actuel: ${heroData.level}\nFragments: ${heroData.shards}/30`);
}

function closeModal() {
    document.getElementById('hero-modal').style.display = 'none';
    currentEditingHero = null;
}
