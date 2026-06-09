// ==========================================
// SYSTEME DE SAUVEGARDE GLOBALE (JSON)
// ==========================================

// Liste des modules sauvegardables (On pourra en rajouter !)
const BACKUP_MODULES = [
    { id: 'module-caserne', label: 'Caserne (Héros & Paramètres)', keys: ['caserne_user_heroes', 'caserne_filters'] },
    { id: 'module-research', label: 'Recherches (Technologies)', keys: ['research_data'] },
    { id: 'module-beartrap', label: 'Piège à Ours (Formations)', keys: ['beartrap_data'] }
];

function initBackupSystem() {
    // 1. Injection du bouton dans la SIDEBAR (ou en bas de page si pas de sidebar)
    const sidebar = document.querySelector('.sidebar');
    const backupBtnHTML = `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button onclick="openBackupModal()" class="btn-modern btn-modern-secondary" style="width: 100%;">
                <svg class="svg-icon" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                </svg>
                Sauvegarde Globale
            </button>
        </div>
    `;

    if (sidebar) {
        sidebar.insertAdjacentHTML('beforeend', backupBtnHTML);
    } else {
        // Fallback si la page n'a pas de sidebar
        document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9000; width: 250px;">${backupBtnHTML}</div>`);
    }

    // 2. Construction dynamique de la modale HTML
    let modulesHTML = BACKUP_MODULES.map(mod => `
        <label class="backup-option">
            <span class="backup-option-text">${mod.label}</span>
            <input type="checkbox" class="backup-checkbox" value="${mod.id}" checked style="width: 18px; height: 18px; cursor: pointer;">
        </label>
    `).join('');

    const modalHTML = `
        <div id="global-backup-overlay" class="backup-overlay">
            <div class="backup-modal">
                <div class="backup-header">
                    <h3 class="backup-title">
                        <svg class="svg-icon" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 8px;"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-4v-2h4V8l4 4-4 4v-2z"/></svg>
                        Gestion des Données
                    </h3>
                    <button onclick="closeBackupModal()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:24px; line-height: 1;">&times;</button>
                </div>
                <div class="backup-body">
                    <p style="color: var(--text-muted); font-size: 13px; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
                        Cochez les données que vous souhaitez exporter dans un fichier de sauvegarde, ou celles que vous souhaitez écraser lors d'une importation.
                    </p>
                    
                    <div id="backup-modules-list">
                        ${modulesHTML}
                    </div>

                    <div class="backup-actions">
                        <button onclick="executeExport()" class="btn-modern btn-modern-primary">
                            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Exporter (.json)
                        </button>
                        
                        <button onclick="document.getElementById('backup-file-upload').click()" class="btn-modern btn-modern-secondary">
                            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                            Importer
                        </button>
                        <input type="file" id="backup-file-upload" accept=".json" style="display: none;" onchange="executeImport(event)">
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openBackupModal() {
    document.getElementById('global-backup-overlay').classList.add('active');
}

function closeBackupModal() {
    document.getElementById('global-backup-overlay').classList.remove('active');
}

// --- LOGIQUE D'EXPORT ---
function executeExport() {
    const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Veuillez sélectionner au moins un module à exporter.");
        return;
    }

    let backupData = {
        app: "Hub-Kingshot",
        timestamp: new Date().toISOString(),
        data: {}
    };

    checkboxes.forEach(cb => {
        const mod = BACKUP_MODULES.find(m => m.id === cb.value);
        if (mod) {
            mod.keys.forEach(key => {
                const storedValue = localStorage.getItem(key);
                if (storedValue) backupData.data[key] = JSON.parse(storedValue);
            });
        }
    });

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Kingshot_Backup_${dateStr}.json`;
    
    link.click();
    closeBackupModal();
}

// --- LOGIQUE D'IMPORT ---
function executeImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
    const selectedModuleIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedModuleIds.length === 0) {
        alert("Veuillez cocher les modules que vous souhaitez restaurer avant d'importer le fichier.");
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.app !== "Hub-Kingshot" || !importedData.data) {
                throw new Error("Fichier de sauvegarde invalide.");
            }

            let restoredCount = 0;

            BACKUP_MODULES.forEach(mod => {
                if (selectedModuleIds.includes(mod.id)) {
                    mod.keys.forEach(key => {
                        if (importedData.data[key] !== undefined) {
                            localStorage.setItem(key, JSON.stringify(importedData.data[key]));
                            restoredCount++;
                        }
                    });
                }
            });

            alert(`Importation réussie ! ${restoredCount} élément(s) restauré(s).\nLa page va se rafraîchir pour appliquer les données.`);
            location.reload(); 

        } catch (error) {
            alert("Erreur lors de l'importation : Le fichier est corrompu ou ne provient pas de l'application.");
            console.error(error);
        }
        event.target.value = ''; 
    };
    reader.readAsText(file);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initBackupSystem);
