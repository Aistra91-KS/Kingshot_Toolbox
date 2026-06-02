// Base de données temporaire intégrée (le temps de créer le vrai fichier JSON)
const heroesDB = [
    { id: "0001", name: "Forrest", generation: 1, rarity: "Rare", troopType: "Infantry" },
    { id: "0002", name: "Seth", generation: 1, rarity: "Rare", troopType: "Infantry" },
    { id: "0003", name: "Saul", generation: 1, rarity: "legendary", troopType: "Archer" },
    { id: "0004", name: "Chenko", generation: 1, rarity: "Epic", troopType: "Cavalry" }
];

document.addEventListener('DOMContentLoaded', () => {
    renderHeroes();

    // Ajouter des écouteurs pour les filtres
    document.getElementById('filter-gen').addEventListener('change', renderHeroes);
    document.getElementById('filter-type').addEventListener('change', renderHeroes);
});

function getTroopEmoji(type) {
    if (type.toLowerCase() === 'infantry') return '🛡️';
    if (type.toLowerCase() === 'cavalry') return '🐎';
    if (type.toLowerCase() === 'archer') return '🏹';
    return '⚔️';
}

function renderHeroes() {
    const grid = document.getElementById('heroes-grid');
    grid.innerHTML = ''; // On vide la grille

    const filterGen = parseInt(document.getElementById('filter-gen').value);
    const filterType = document.getElementById('filter-type').value;

    heroesDB.forEach(hero => {
        // Application des filtres
        if (hero.generation > filterGen) return;
        if (filterType !== 'all' && hero.troopType !== filterType) return;

        // Création de la carte HTML
        const card = document.createElement('div');
        // On ajoute la classe "legendary", "epic" ou "rare" selon le JSON
        card.className = `hero-card ${hero.rarity.toLowerCase()}`;
        
        card.innerHTML = `
            <div class="hero-type-badge">${getTroopEmoji(hero.troopType)}</div>
            <div class="hero-gen-badge">Gen ${hero.generation}</div>
            
            <div class="hero-name">${hero.name}</div>
            <div class="hero-level-stars">
                <span>Niv. 1</span>
                <span class="hero-stars">★☆☆</span> <!-- Étoiles factices pour l'instant -->
            </div>
        `;

        // Interaction (pour la suite)
        card.addEventListener('click', () => {
            alert(`Vous avez cliqué sur ${hero.name} ! Bientôt, une fenêtre s'ouvrira pour régler ses compétences.`);
        });

        grid.appendChild(card);
    });
}
