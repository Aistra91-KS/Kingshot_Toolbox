let heroesDB = []; 
let userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
let currentEditingHero = null;

// Poids des raretés pour le tri
const rarityWeight = { "legendary": 3, "epic": 2, "rare": 1 };

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/heroes_db.json'); 
        if (!response.ok) throw new Error("Fichier JSON introuvable");
        
        heroesDB = await response.json(); 
        renderHeroes(); 
    } catch (error) {
        console.error("Erreur de chargement :", error);
    }

    // Écouteurs pour les filtres et le tri
    document.getElementById('sort-by').addEventListener('change', renderHeroes);
    document.querySelectorAll('.gen-checkbox').forEach(cb => {
        cb.addEventListener('change', renderHeroes);
    });
    document.getElementById('filter-type').addEventListener('change', renderHeroes);
    document.getElementById('filter-rarity').addEventListener('change', renderHeroes);
    
    // Fermeture de la modale
    document.getElementById('close-modal').addEventListener('click', closeModal);
    // (Bouton save désactivé temporairement, la sauvegarde se fera via le clic sur les étoiles)
});

function getTroopEmoji(type) {
    if (type.toLowerCase() === 'infantry') return '🛡️';
    if (type.toLowerCase() === 'cavalry') return '🐎';
    if (type.toLowerCase() === 'archer') return '🏹';
    return '⚔️';
}

function sortHeroes(heroes, sortType) {
    return heroes.sort((a, b) => {
        if (sortType === 'rarity-desc') {
            return rarityWeight[b.rarity.toLowerCase()] - rarityWeight[a.rarity.toLowerCase()];
        }
        if (sortType === 'rarity-asc') {
            return rarityWeight[a.rarity.toLowerCase()] - rarityWeight[b.rarity.toLowerCase()];
        }
        if (sortType === 'gen-desc') {
            return b.generation - a.generation;
        }
        if (sortType === 'gen-asc') {
            return a.generation - b.generation;
        }
        if (sortType === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });
}

// Génère le HTML pour les 5 étoiles et leurs 6 pips de fragments
// totalShards = 0 à 30 (5 étoiles * 6)
function generateStarsHTML(totalShards) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        const starThreshold = (i + 1) * 6; // Une étoile est "pleine" tous les 6 fragments
        const isStarActive = totalShards >= starThreshold;
        
        // Calcul des pips (0 à 6) pour cette étoile spécifique
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

    const sortBy = document.getElementById('sort-by').value;
    const checkedGens = Array.from(document.querySelectorAll('.gen-checkbox:checked')).map(cb => cb.value); // Récupère toutes les valeurs des cases cochées sous forme de tableau (ex: ["1", "2"])
    const filterType = document.getElementById('filter-type').value;
    const filterRarity = document.getElementById('filter-rarity').value;

    let filteredHeroes = heroesDB.filter(hero => {
        if (!checkedGens.includes(hero.generation.toString())) return false;
        if (filterType !== 'all' && hero.troopType.toLowerCase() !== filterType.toLowerCase()) return false;
        if (filterRarity !== 'all' && hero.rarity.toLowerCase() !== filterRarity.toLowerCase()) return false;
        return true;
    });

    const sortedHeroes = sortHeroes(filteredHeroes, sortBy);

    sortedHeroes.forEach(hero => {
        // userHeroes stocke { level: 1-80, shards: 0-30 }
        const heroData = userHeroes[hero.id] || { level: 1, shards: 0 };
        const isLocked = heroData.shards === 0 && heroData.level === 1; // Considéré "grisé" si 0 shard et lvl 1

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
    
    // On garde l'ancienne modale pour l'instant, mais on l'adaptera
    // pour modifier le niveau (1-80) et les fragments (0-30) dans notre prochaine étape.
    // L'alerte te montre que la connexion est faite :
    alert(`(Bientôt) Modale pour configurer ${hero.name}.\nNiveau actuel: ${heroData.level}\nFragments: ${heroData.shards}/30`);
}

function closeModal() {
    document.getElementById('hero-modal').style.display = 'none';
    currentEditingHero = null;
}
