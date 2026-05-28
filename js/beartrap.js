// ========================================
// BEAR TRAP OPTIMIZER - Logique de calcul
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadBearTrapData();

    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            saveBearTrapData(); 
            calculateBearTrap(); 
        });
    }

    const optimMode = document.getElementById('optim-mode');
    const thresholdInputs = document.getElementById('threshold-inputs');
    
    if (optimMode && thresholdInputs) {
        optimMode.addEventListener('change', (e) => {
            if (e.target.value === 'threshold') {
                thresholdInputs.style.display = 'block';
            } else {
                thresholdInputs.style.display = 'none';
            }
        });
    }

    const allInputs = document.querySelectorAll('.sidebar input, .sidebar select');
    allInputs.forEach(input => {
        input.addEventListener('change', saveBearTrapData);
    });

    const savedInf = parseInt(document.getElementById('troop-inf').value) || 0;
    const savedArc = parseInt(document.getElementById('troop-arc').value) || 0;
    const savedCav = parseInt(document.getElementById('troop-cav').value) || 0;
    
    if (savedInf > 0 || savedArc > 0 || savedCav > 0) {
        calculateBearTrap();
    }
});

// ========================================
// FONCTIONS DE SAUVEGARDE (LocalStorage)
// ========================================

function saveBearTrapData() {
    const fieldsToSave = [
        'troop-inf', 'troop-arc', 'troop-cav',
        'cap-base', 'cap-expert', 'cap-animal', 'marches-count',
        'player-role', 'alliance-limit', 'optim-mode',
        'min-inf-percent', 'min-cav-percent'
    ];

    const data = {};
    fieldsToSave.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            data[id] = element.value;
        }
    });

    localStorage.setItem('beartrap_saved_data', JSON.stringify(data));
}

function loadBearTrapData() {
    const savedDataString = localStorage.getItem('beartrap_saved_data');
    
    if (savedDataString) {
        const data = JSON.parse(savedDataString);
        
        for (const [id, value] of Object.entries(data)) {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        }

        const optimMode = document.getElementById('optim-mode');
        const thresholdInputs = document.getElementById('threshold-inputs');
        if (optimMode && thresholdInputs) {
            thresholdInputs.style.display = optimMode.value === 'threshold' ? 'block' : 'none';
        }
    }
}

// ========================================
// MOTEUR DE CALCUL
// ========================================

function calculateBearTrap() {
    // 1. Récupération des effectifs
    let availableInf = parseInt(document.getElementById('troop-inf').value) || 0;
    let availableArc = parseInt(document.getElementById('troop-arc').value) || 0;
    let availableCav = parseInt(document.getElementById('troop-cav').value) || 0;

    // 2. Récupération des capacités
    const capBase = parseInt(document.getElementById('cap-base').value) || 0;
    const capExpert = parseInt(document.getElementById('cap-expert').value) || 0;
    const capAnimal = parseInt(document.getElementById('cap-animal').value) || 0;
    let marchesCount = parseInt(document.getElementById('marches-count').value) || 1;
    const playerRole = document.getElementById('player-role').value;

    // --- NOUVEAUTÉ : Ajout de la marche ralliement si Organisateur ---
    if (playerRole === 'organizer') {
        marchesCount += 1;
    }

    // 3. Récupération des limites et options
    const allianceLimitInput = document.getElementById('alliance-limit').value;
    const allianceLimit = allianceLimitInput !== "" ? parseInt(allianceLimitInput) : Infinity;
    
    const mode = document.getElementById('optim-mode').value;
    const minInfPercent = parseInt(document.getElementById('min-inf-percent').value) || 0;
    const minCavPercent = parseInt(document.getElementById('min-cav-percent').value) || 0;

    // Calcul de la taille de marche maximale théorique
    let theoreticalCapacity = capBase + capExpert + capAnimal;
    let maxMarchCapacity = Math.min(theoreticalCapacity, allianceLimit);

    if (maxMarchCapacity <= 0) {
        alert("Votre capacité de marche doit être supérieure à 0.");
        return;
    }

    if (mode === 'formula') {
        alert("Le mode Formule mathématique sera bientôt disponible ! Passage en mode Seuils pour le moment.");
    }

    // 4. L'ALGORITHME DE RÉPARTITION ÉQUITABLE
    let marches = [];
    let remainingMarches = marchesCount;
    
    for (let i = 0; i < marchesCount; i++) {
        let totalAvailable = availableInf + availableArc + availableCav;
        
        // S'il ne reste absolument plus aucune troupe, on arrête la boucle
        if (totalAvailable === 0) break; 

        // --- NOUVEAUTÉ : Répartition équitable ---
        // On divise les troupes totales restantes par le nombre de marches restantes.
        // On limite ce chiffre à la capacité maximale d'une marche.
        let currentMarchCapacity = Math.min(maxMarchCapacity, Math.ceil(totalAvailable / remainingMarches));

        let allocatedInf = 0;
        let allocatedArc = 0;
        let allocatedCav = 0;
        let remainingSpace = currentMarchCapacity;

        // Calcul des minimums requis par rapport à la taille de CETTE marche
        let targetInf = Math.floor(currentMarchCapacity * (minInfPercent / 100));
        let targetCav = Math.floor(currentMarchCapacity * (minCavPercent / 100));

        // Remplissage des minimums
        allocatedInf = Math.min(targetInf, availableInf);
        allocatedCav = Math.min(targetCav, availableCav);
        
        remainingSpace -= (allocatedInf + allocatedCav);
        availableInf -= allocatedInf;
        availableCav -= allocatedCav;

        // Remplissage avec les Archers (priorité dégâts)
        allocatedArc = Math.min(remainingSpace, availableArc);
        remainingSpace -= allocatedArc;
        availableArc -= allocatedArc;

        // S'il reste de la place, on bouche les trous avec Cavalerie puis Infanterie
        if (remainingSpace > 0) {
            let extraCav = Math.min(remainingSpace, availableCav);
            allocatedCav += extraCav;
            remainingSpace -= extraCav;
            availableCav -= extraCav;
        }

        if (remainingSpace > 0) {
            let extraInf = Math.min(remainingSpace, availableInf);
            allocatedInf += extraInf;
            remainingSpace -= extraInf;
            availableInf -= extraInf;
        }

        let totalMarch = allocatedInf + allocatedArc + allocatedCav;
        marches.push({
            id: i + 1,
            inf: allocatedInf,
            arc: allocatedArc,
            cav: allocatedCav,
            total: totalMarch
        });

        // On décrémente le nombre de marches restantes pour le prochain calcul
        remainingMarches--;
    }

    // 5. AFFICHAGE DES RÉSULTATS
    displayResults(marches, maxMarchCapacity, marchesCount);
}

function displayResults(marches, maxCapacity, totalMarches) {
    const resultArea = document.getElementById('result-area');
    
    if (marches.length === 0) {
        resultArea.innerHTML = "<p style='color: var(--text-muted);'>Vous n'avez aucune troupe à déployer.</p>";
        resultArea.style.display = 'block';
        return;
    }

    let html = `
        <table class="styled-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid var(--accent);">Marche</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">Total Troupes</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🛡️ Infanterie</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🏹 Archers</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🐎 Cavalerie</th>
                </tr>
            </thead>
            <tbody>
    `;

    marches.forEach(march => {
        let pInf = Math.round((march.inf / march.total) * 100) || 0;
        let pArc = Math.round((march.arc / march.total) * 100) || 0;
        let pCav = Math.round((march.cav / march.total) * 100) || 0;

        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');

        let rowStyle = march.total < maxCapacity ? 'color: var(--text-muted);' : '';

        html += `
            <tr style="${rowStyle}">
                <td style="padding: 10px; border-bottom: 1px solid var(--control-bg);"><strong>Marche ${march.id}</strong></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);"><strong>${fTotal}</strong></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fInf} <span style="color: var(--text-muted); font-size: 0.85em;">(${pInf}%)</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--accent);">${fArc} <span style="font-size: 0.85em;">(${pArc}%)</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fCav} <span style="color: var(--text-muted); font-size: 0.85em;">(${pCav}%)</span></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div style="margin-top: 15px; font-size: 13px; color: var(--text-muted);">
            Nombre de marches générées : <strong>${totalMarches}</strong><br>
            Capacité maximale par marche configurée : <strong>${maxCapacity.toLocaleString('fr-FR')}</strong>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
}
