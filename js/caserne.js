// Mémoire locale du joueur
let userHeroes = JSON.parse(localStorage.getItem('caserne_user_heroes')) || {};
let currentEditingHero = null;

document.addEventListener('DOMContentLoaded', () => {
    renderHeroes();

    // Écouteurs pour les filtres
    document.getElementById('filter-gen').addEventListener('change', renderHeroes);
    document.getElementById('filter-type').addEventListener('change', renderHeroes);
    
    // Écouteurs pour la fenêtre modale
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('save-modal').addEventListener('click', saveHeroSettings);
});

function getTroopEmoji(type) {
    if (type.toLowerCase() === 'infantry') return '🛡️';
    if (type.toLowerCase() === 'cavalry') return '🐎';
    if (type.toLowerCase() === 'archer') return '🏹';
    return '⚔️';
}

function renderHeroes() {
    const grid = document.getElementById('heroes-grid');
    grid.innerHTML = ''; 

    const filterGen = parseInt(document.getElementById('filter-gen').value);
    const filterType = document.getElementById('filter-type').value;

    window.heroesDB.forEach(hero => {
        // Application des filtres
        if (hero.generation > filterGen) return;
        if (filterType !== 'all' && hero.troopType.toLowerCase() !== filterType.toLowerCase()) return;

        // Récupération des données du joueur
        const heroData = userHeroes[hero.id] || { skill1: 0 };
        const skillLvl = heroData.skill1;
        
        // Calcul des étoiles
        let starsText = skillLvl === 0 ? '---' : '★'.repeat(skillLvl) + '☆'.repeat(5 - skillLvl);
        let lockedClass = skillLvl === 0 ? 'locked' : '';

        // Création de la carte
        const card = document.createElement('div');
        card.className = `hero-card ${hero.rarity.toLowerCase()} ${lockedClass}`;
        
        // C'est ici que l'image est injectée (Ex: img/heroes/0001.png)
        card.innerHTML = `
            <div class="hero-image" style="background-image: url('img/heroes/${hero.id}.png');"></div>
            <div class="hero-gradient"></div>
            
            <div class="hero-type-badge">${getTroopEmoji(hero.troopType)}</div>
            <div class="hero-gen-badge">Gen ${hero.generation}</div>
            
            <div class="hero-name">${hero.name}</div>
            <div class="hero-level-stars">
                <span>Comp. 1</span>
                <span class="hero-stars" style="color: ${skillLvl > 0 ? '#f5b840' : 'var(--text-muted)'}; letter-spacing: 2px;">
                    ${starsText}
                </span>
            </div>
        `;

        card.addEventListener('click', () => openModal(hero, skillLvl));
        grid.appendChild(card);
    });
}

function openModal(hero, currentSkillLvl) {
    currentEditingHero = hero.id;
    document.getElementById('modal-hero-name').textContent = hero.name;
    
    const skillName = hero.skills && hero.skills.length > 0 ? hero.skills[0].name : 'Aucune compétence';
    document.getElementById('modal-hero-skill').textContent = `🎯 ${skillName}`;
    
    document.getElementById('modal-skill-level').value = currentSkillLvl;
    document.getElementById('hero-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('hero-modal').style.display = 'none';
    currentEditingHero = null;
}

function saveHeroSettings() {
    if (!currentEditingHero) return;
    
    const level = parseInt(document.getElementById('modal-skill-level').value, 10);
    
    if (level === 0) {
        delete userHeroes[currentEditingHero];
    } else {
        if (!userHeroes[currentEditingHero]) userHeroes[currentEditingHero] = {};
        userHeroes[currentEditingHero].skill1 = level;
    }
    
    // Sauvegarde en mémoire et rafraîchissement
    localStorage.setItem('caserne_user_heroes', JSON.stringify(userHeroes));
    closeModal();
    renderHeroes(); 
}
