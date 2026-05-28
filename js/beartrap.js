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
    let availableInf = parseInt(document.getElementById('troop-inf').value) || 0;
    let availableArc = parseInt(document.getElementById('troop-arc').value) || 0;
    let availableCav = parseInt(document.getElementById('troop-cav').value) || 0;

    const capBase = parseInt(document.getElementById('cap-base').value) || 0;
    const capExpert = parseInt(document.getElementById('cap-expert').value) || 0;
    const capAnimal = parseInt(document.getElementById('cap-animal').value) || 0;
    let marchesCount = parseInt(document.getElementById('marches-count').value) || 1;
    const playerRole = document.getElementById('player-role').value;

    if (playerRole === 'organizer') {
        marchesCount += 1;
    }

    const allianceLimitInput = document.getElementById('alliance-limit').value;
    const allianceLimit = allianceLimitInput !== "" ? parseInt(allianceLimitInput) : Infinity;
    
    const mode = document.getElementById('optim-mode').value;
    const minInfPercent = parseInt(document.getElementById('min-inf-percent').value) || 0;
    const minCavPercent = parseInt(document.getElementById('min-cav-percent').value) || 0;

    // Capacité Théorique (pour les pourcentages en jeu)
    let theoreticalCapacity = capBase + capExpert + capAnimal;
    
    // Capacité Max Réelle (plafonnée par l'alliance pour le calcul des troupes)
    let maxMarchCapacity = Math.min(theoreticalCapacity, allianceLimit);

    if (maxMarchCapacity <= 0) {
        alert("Votre capacité de marche doit être supérieure à 0.");
        return;
    }

    let marches = [];
    
    if (availableInf + availableArc + availableCav === 0) {
        displayResults([], maxMarchCapacity, marchesCount, theoreticalCapacity);
        return;
    }

    // --- CRÉATION DU MODÈLE DE MARCHE PARFAIT ---
    let fairInf = Math.floor(availableInf / marchesCount);
    let fairArc = Math.floor(availableArc / marchesCount);
    let fairCav = Math.floor(availableCav / marchesCount);

    let targetInf = Math.floor(maxMarchCapacity * (minInfPercent / 100));
    let targetCav = Math.floor(maxMarchCapacity * (minCavPercent / 100));

    let mInf = Math.min(targetInf, fairInf);
    let mCav = Math.min(targetCav, fairCav);
    
    let remainingSpace = maxMarchCapacity - mInf - mCav;

    let mArc = Math.min(remainingSpace, fairArc);
    remainingSpace -= mArc;

    if (remainingSpace > 0) {
        let extraCavAvailable = fairCav - mCav;
        let addCav = Math.min(remainingSpace, extraCavAvailable);
        mCav += addCav;
        remainingSpace -= addCav;
    }

    if (remainingSpace > 0) {
        let extraInfAvailable = fairInf - mInf;
        let addInf = Math.min(remainingSpace, extraInfAvailable);
        mInf += addInf;
        remainingSpace -= addInf;
    }

    let mTotal = mInf + mArc + mCav;

    // --- DUPLICATION DU MODÈLE ---
    for (let i = 0; i < marchesCount; i++) {
        marches.push({
            id: i + 1,
            inf: mInf,
            arc: mArc,
            cav: mCav,
            total: mTotal
        });
    }

    // On passe la theoreticalCapacity à la fonction d'affichage pour les bons pourcentages
    displayResults(marches, maxMarchCapacity, marchesCount, theoreticalCapacity);
}

function displayResults(marches, maxCapacity, totalMarches, theoreticalCapacity) {
    const resultArea = document.getElementById('result-area');
    
    if (marches.length === 0 || marches[0].total === 0) {
        resultArea.innerHTML = "<p style='color: var(--text-muted);'>Vous n'avez aucune troupe à déployer.</p>";
        resultArea.style.display = 'block';
        return;
    }

    let html = `
        <table class="styled-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid var(--accent);">Marche</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent); color: var(--text-muted);">Capacité Config</th>
                    <!-- ORDRE MODIFIÉ : Infanterie, Cavalerie, Archers -->
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🛡️ Infanterie</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🐎 Cavalerie</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent);">🏹 Archers</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid var(--accent); background: rgba(245, 184, 64, 0.05);">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    marches.forEach(march => {
        // NOUVEAU : Les pourcentages sont calculés sur la theoreticalCapacity (capacité totale du joueur)
        let pInf = Math.round((march.inf / theoreticalCapacity) * 100) || 0;
        let pCav = Math.round((march.cav / theoreticalCapacity) * 100) || 0;
        let pArc = Math.round((march.arc / theoreticalCapacity) * 100) || 0;

        let fMaxCap = maxCapacity.toLocaleString('fr-FR');
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');

        let rowStyle = march.total < maxCapacity ? 'color: var(--text-muted);' : '';
        
        const badgeStyle = "display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";
        const badgeStyleArc = "display: inline-block; background: rgba(245, 184, 64, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-left: 5px;";

        html += `
            <tr style="${rowStyle}">
                <td style="padding: 10px; border-bottom: 1px solid var(--control-bg);"><strong>Marche ${march.id}</strong></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--text-muted);">${fMaxCap}</td>
                
                <!-- ORDRE MODIFIÉ : Infanterie, Cavalerie, Archers -->
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fInf} <span style="${badgeStyle}">${pInf}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg);">${fCav} <span style="${badgeStyle}">${pCav}%</span></td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); color: var(--accent);">${fArc} <span style="${badgeStyleArc}">${pArc}%</span></td>
                
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid var(--control-bg); background: rgba(245, 184, 64, 0.05);"><strong>${fTotal}</strong></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div style="margin-top: 15px; font-size: 13px; color: var(--text-muted);">
            Nombre de marches générées : <strong>${totalMarches}</strong><br>
            Capacité théorique de référence (pour vos %) : <strong>${theoreticalCapacity.toLocaleString('fr-FR')}</strong>
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
}
