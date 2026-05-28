// ========================================\n// BEAR TRAP OPTIMIZER - Logique de calcul\n// ========================================\n
document.addEventListener('DOMContentLoaded', () => {
    // Écouteur sur le bouton de calcul
    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) {
        btnCalculate.addEventListener('click', calculateBearTrap);
    }

    // Gérer l'affichage des options selon le mode choisi (Seuils vs Formule)
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
});

function calculateBearTrap() {
    // 1. Récupération des effectifs
    let availableInf = parseInt(document.getElementById('troop-inf').value) || 0;
    let availableArc = parseInt(document.getElementById('troop-arc').value) || 0;
    let availableCav = parseInt(document.getElementById('troop-cav').value) || 0;

    // 2. Récupération des capacités
    const capBase = parseInt(document.getElementById('cap-base').value) || 0;
    const capExpert = parseInt(document.getElementById('cap-expert').value) || 0;
    const capAnimal = parseInt(document.getElementById('cap-animal').value) || 0;
    const marchesCount = parseInt(document.getElementById('marches-count').value) || 1;

    // 3. Récupération des limites et options
    const allianceLimitInput = document.getElementById('alliance-limit').value;
    const allianceLimit = allianceLimitInput !== "" ? parseInt(allianceLimitInput) : Infinity;
    
    const mode = document.getElementById('optim-mode').value;
    const minInfPercent = parseInt(document.getElementById('min-inf-percent').value) || 0;
    const minCavPercent = parseInt(document.getElementById('min-cav-percent').value) || 0;

    // Calcul de la taille de marche réelle
    let theoreticalCapacity = capBase + capExpert + capAnimal;
    let marchCapacity = Math.min(theoreticalCapacity, allianceLimit);

    if (marchCapacity <= 0) {
        alert("Votre capacité de marche doit être supérieure à 0.");
        return;
    }

    // Si l'utilisateur a choisi la formule (En attente de vos futures explications)
    if (mode === 'formula') {
        alert("Le mode Formule mathématique sera bientôt disponible ! Passage en mode Seuils pour le moment.");
        // On continue en mode threshold par défaut
    }

    // 4. L'ALGORITHME DE RÉPARTITION
    let marches = [];
    
    for (let i = 0; i < marchesCount; i++) {
        // S'il ne reste plus aucune troupe, on arrête
        if (availableInf + availableArc + availableCav === 0) break;

        let allocatedInf = 0;
        let allocatedArc = 0;
        let allocatedCav = 0;
        let remainingSpace = marchCapacity;

        // Étape A : Assurer les minimums vitaux (Infanterie et Cavalerie)
        let targetInf = Math.floor(marchCapacity * (minInfPercent / 100));
        let targetCav = Math.floor(marchCapacity * (minCavPercent / 100));

        // On alloue le minimum requis (ou tout ce qu'il nous reste si on en a moins que le minimum)
        allocatedInf = Math.min(targetInf, availableInf);
        allocatedCav = Math.min(targetCav, availableCav);
        
        remainingSpace -= (allocatedInf + allocatedCav);
        availableInf -= allocatedInf;
        availableCav -= allocatedCav;

        // Étape B : Remplir l'espace restant avec la force de frappe principale (Archers)
        allocatedArc = Math.min(remainingSpace, availableArc);
        remainingSpace -= allocatedArc;
        availableArc -= allocatedArc;

        // Étape C : S'il reste de la place (plus d'archers), on comble d'abord avec la cavalerie puis l'infanterie
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

        // Sauvegarde de la marche
        let totalMarch = allocatedInf + allocatedArc + allocatedCav;
        marches.push({
            id: i + 1,
            inf: allocatedInf,
            arc: allocatedArc,
            cav: allocatedCav,
            total: totalMarch
        });
    }

    // 5. AFFICHAGE DES RÉSULTATS (Génération du HTML)
    displayResults(marches, marchCapacity);
}

function displayResults(marches, maxCapacity) {
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
        // Calcul des pourcentages arrondis à l'unité
        let pInf = Math.round((march.inf / march.total) * 100) || 0;
        let pArc = Math.round((march.arc / march.total) * 100) || 0;
        let pCav = Math.round((march.cav / march.total) * 100) || 0;

        // Mise en forme des nombres avec séparateurs de milliers (ex: 120 000)
        let fTotal = march.total.toLocaleString('fr-FR');
        let fInf = march.inf.toLocaleString('fr-FR');
        let fArc = march.arc.toLocaleString('fr-FR');
        let fCav = march.cav.toLocaleString('fr-FR');

        // Style si la marche n'est pas pleine
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
            Capacité maximale par marche configurée : <strong>${maxCapacity.toLocaleString('fr-FR')}</strong>.
        </div>
    `;

    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
}
