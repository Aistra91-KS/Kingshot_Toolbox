// ==========================================
// SYSTEME DE SAUVEGARDE GLOBALE (JSON)
// ==========================================

const i18nBackup = {
    FR: {
        btnSidebar: "Sauvegarde Globale",
        modalTitle: "Gestion des Données",
        modalDesc: "Cochez les modules pour exporter une sauvegarde complète, ou pour cibler exactement ce que vous souhaitez écraser lors d'une importation.",
        modCaserne: "Caserne (Héros & Filtres)",
        modResearch: "Recherches (Technologies)",
        modBeartrap: "Piège à Ours (Formations personnalisées & Paramètres)",
        modTrueGold: "TrueGold (Niveaux, Stocks & Paramètres)",
        btnExport: "Exporter (.json)",
        btnImport: "Importer",
        errSelectExport: "Veuillez sélectionner au moins un module à exporter.",
        errSelectImport: "Veuillez cocher les modules que vous souhaitez restaurer avant d'importer le fichier.",
        errInvalidFile: "Fichier de sauvegarde invalide.",
        successImport: "Importation réussie ! {count} élément(s) restauré(s).\nLa page va se rafraîchir pour appliquer les données.",
        errCorrupt: "Erreur lors de l'importation : Le fichier est corrompu ou ne provient pas de l'application."
    },
    EN: {
        btnSidebar: "Global Backup",
        modalTitle: "Data Management",
        modalDesc: "Check the modules to export a complete backup, or to target exactly what you want to overwrite during an import.",
        modCaserne: "Barracks (Heroes & Filters)",
        modResearch: "Research (Technologies)",
        modBeartrap: "Bear Trap (Custom Formations & Settings)",
        modTrueGold: "TrueGold (Levels, Stocks & Settings)",
        btnExport: "Export (.json)",
        btnImport: "Import",
        errSelectExport: "Please select at least one module to export.",
        errSelectImport: "Please check the modules you want to restore before importing the file.",
        errInvalidFile: "Invalid backup file.",
        successImport: "Import successful! {count} item(s) restored.\nThe page will refresh to apply the data.",
        errCorrupt: "Import error: The file is corrupted or does not come from the application."
    }
};

// Liste des modules sauvegardables (Clés exactes du localStorage ciblées)
const BACKUP_MODULES = [
    { id: 'module-caserne', labelKey: 'modCaserne', keys: ['caserne_user_heroes', 'caserne_filters'] },
    { id: 'module-research', labelKey: 'modResearch', keys: ['research_data'] },
    { id: 'module-beartrap', labelKey: 'modBeartrap', keys: ['beartrap_custom_marches', 'beartrap_settings'] },
    { id: 'module-truegold', labelKey: 'modTrueGold', keys: ['tg_calc_data_v3'] } // Clé exacte trouvée dans truegold_script.js
];

function initBackupSystem() {
    // Sécurité pour ne pas injecter deux fois
    if (document.getElementById('global-backup-overlay')) return;

    // 1. Injection du bouton dans la SIDEBAR
    const sidebar = document.querySelector('.sidebar');
    const backupBtnHTML = `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border);">
            <button onclick="openBackupModal()" class="btn-modern btn-modern-secondary" style="width: 100%;">
                <svg class="svg-icon" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                </svg>
                <span id="backup-btn-text">Sauvegarde Globale</span>
            </button>
        </div>
    `;

    if (sidebar) {
        sidebar.insertAdjacentHTML('beforeend', backupBtnHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', `<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9000; width: 250px;">${backupBtnHTML}</div>`);
    }

    // 2. Construction dynamique de la modale HTML
    let modulesHTML = BACKUP_MODULES.map(mod => `
        <label class="backup-option">
            <span class="backup-option-text" id="backup-label-${mod.id}"></span>
            <input type="checkbox" class="backup-checkbox" value="${mod.id}" checked style="width: 18px; height: 18px; cursor: pointer;">
        </label>
    `).join('');

    const modalHTML = `
        <div id="global-backup-overlay" class="backup-overlay">
            <div class="backup-modal">
                <div class="backup-header">
                    <h3 class="backup-title">
                        <svg class="svg-icon" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 8px;"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-4v-2h4V8l4 4-4 4v-2z"/></svg>
                        <span id="backup-modal-title">Gestion des Données</span>
                    </h3>
                    <button onclick="closeBackupModal()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:24px; line-height: 1;">&times;</button>
                </div>
                <div class="backup-body">
                    <p id="backup-modal-desc" style="color: var(--text-light); font-size: 15px; font-weight: 500; margin-top: 0; margin-bottom: 25px; line-height: 1.6;">
                    </p>
                    
                    <div id="backup-modules-list">
                        ${modulesHTML}
                    </div>

                    <div class="backup-actions">
                        <button onclick="executeExport()" class="btn-modern btn-modern-primary">
                            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            <span id="backup-btn-export">Exporter (.json)</span>
                        </button>
                        
                        <button onclick="document.getElementById('backup-file-upload').click()" class="btn-modern btn-modern-secondary">
                            <svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                            <span id="backup-btn-import">Importer</span>
                        </button>
                        <input type="file" id="backup-file-upload" accept=".json" style="display: none;" onchange="executeImport(event)">
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Application immédiate de la langue
    updateBackupLanguage();
}

// --- GESTION DE LA TRADUCTION ---
function updateBackupLanguage() {
    let lang = window.GlobalLang ? window.GlobalLang.get() : (localStorage.getItem('hub_lang') || 'EN');
    lang = lang.toUpperCase();
    const dict = i18nBackup[lang] || i18nBackup['FR'];

    const setContent = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setContent('backup-btn-text', dict.btnSidebar);
    setContent('backup-modal-title', dict.modalTitle);
    setContent('backup-modal-desc', dict.modalDesc);
    setContent('backup-btn-export', dict.btnExport);
    setContent('backup-btn-import', dict.btnImport);

    BACKUP_MODULES.forEach(mod => {
        setContent(`backup-label-${mod.id}`, dict[mod.labelKey]);
    });
}

// Écouteurs globaux pour la traduction
window.addEventListener('langChanged', updateBackupLanguage);
window.addEventListener('storage', (e) => {
    if (e.key === 'hub_lang') updateBackupLanguage();
});

// --- INTERACTIONS UI ---
function openBackupModal() {
    updateBackupLanguage(); // On force la mise à jour à l'ouverture par sécurité
    document.getElementById('global-backup-overlay').classList.add('active');
}

function closeBackupModal() {
    document.getElementById('global-backup-overlay').classList.remove('active');
}

function getCurrentDict() {
    let lang = window.GlobalLang ? window.GlobalLang.get() : (localStorage.getItem('hub_lang') || 'EN');
    return i18nBackup[lang.toUpperCase()] || i18nBackup['FR'];
}

// --- LOGIQUE D'EXPORT ---
function executeExport() {
    const dict = getCurrentDict();
    const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert(dict.errSelectExport);
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
    const dict = getCurrentDict();
    const file = event.target.files[0];
    if (!file) return;

    const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
    const selectedModuleIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedModuleIds.length === 0) {
        alert(dict.errSelectImport);
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.app !== "Hub-Kingshot" || !importedData.data) {
                throw new Error("Invalid format");
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

            alert(dict.successImport.replace('{count}', restoredCount));
            location.reload(); 

        } catch (error) {
            alert(dict.errCorrupt);
            console.error(error);
        }
        event.target.value = ''; 
    };
    reader.readAsText(file);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initBackupSystem);
