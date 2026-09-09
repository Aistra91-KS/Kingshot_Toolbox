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
        modVikings: "Vikings (Répartition des troupes)",
        modWaracademy: "Académie de Guerre (Niveaux & Paramètres)",
        modShopcalc: "Calcul Boutique (valeurs, boutiques modifiées, achats d'événement)",
        modPets: "Familiers (Niveaux)",
        modTheater: "Théâtre Fantastique (barème de jetons et progression)",
        modTrueGold: "TrueGold (Niveaux, Stocks & Paramètres)",
        btnExport: "Exporter (.json)",
        btnImport: "Importer",
        errSelectExport: "Veuillez sélectionner au moins un module à exporter.",
        errSelectImport: "Veuillez cocher les modules que vous souhaitez restaurer avant d'importer le fichier.",
        errInvalidFile: "Fichier de sauvegarde invalide.",
        successImport: "Importation réussie ! {count} élément(s) restauré(s).\nLa page va se rafraîchir pour appliquer les données.",
        modMasters: "Conseil des Experts (Masters)",
        errCorrupt: "Erreur lors de l'importation : Le fichier est corrompu ou ne provient pas de l'application.",
        errInvalidModules: "Importation annulée : format invalide pour {list}. Aucune donnée n'a été remplacée.",
        errNothingImport: "Ce fichier ne contient aucune donnée pour les modules cochés.",
        errWriteFailed: "L'enregistrement a échoué (stockage plein ou navigation privée). Vos données précédentes ont été rétablies.",
        errNothingExport: "Aucune donnée à exporter pour les modules cochés.",
        warnPartialExport: "Sauvegarde exportée, mais ces modules étaient illisibles et en ont été exclus : {list}."
    },
    EN: {
        btnSidebar: "Global Backup",
        modalTitle: "Data Management",
        modalDesc: "Check the modules to export a complete backup, or to target exactly what you want to overwrite during an import.",
        modCaserne: "Barracks (Heroes & Filters)",
        modResearch: "Research (Technologies)",
        modBeartrap: "Bear Trap (Custom Formations & Settings)",
        modVikings: "Vikings (Troop Distribution)",
        modWaracademy: "War Academy (Levels & Settings)",
        modShopcalc: "Shop Value (values, edited shops, event purchases)",
        modPets: "Pets (Levels)",
        modTheater: "Fantasy Theater (token table and progress)",
        modTrueGold: "TrueGold (Levels, Stocks & Settings)",
        btnExport: "Export (.json)",
        btnImport: "Import",
        errSelectExport: "Please select at least one module to export.",
        errSelectImport: "Please check the modules you want to restore before importing the file.",
        errInvalidFile: "Invalid backup file.",
        successImport: "Import successful! {count} item(s) restored.\nThe page will refresh to apply the data.",
        modMasters: "Hall of Masters (Experts)",
        errCorrupt: "Import error: The file is corrupted or does not come from the application.",
        errInvalidModules: "Import cancelled: invalid format for {list}. No data was replaced.",
        errNothingImport: "This file holds no data for the checked modules.",
        errWriteFailed: "Saving failed (storage full, or private browsing). Your previous data has been restored.",
        errNothingExport: "No data to export for the checked modules.",
        warnPartialExport: "Backup exported, but these modules were unreadable and were left out: {list}."
    }
};

// Liste des modules sauvegardables (Clés exactes du localStorage ciblées)
const BACKUP_MODULES = [
    { id: 'module-caserne',  labelKey: 'modCaserne',  keys: [STORAGE_KEYS.caserneHeroes, STORAGE_KEYS.caserneFilters] },
    { id: 'module-masters',  labelKey: 'modMasters',  keys: [STORAGE_KEYS.masters] },
    { id: 'module-research', labelKey: 'modResearch', keys: [STORAGE_KEYS.researchDb, STORAGE_KEYS.researchInputs] },
    { id: 'module-beartrap', labelKey: 'modBeartrap', keys: [STORAGE_KEYS.beartrap, STORAGE_KEYS.beartrapJoiners] },
    { id: 'module-truegold', labelKey: 'modTrueGold', keys: [STORAGE_KEYS.truegold] },
    { id: 'module-vikings',  labelKey: 'modVikings',  keys: [STORAGE_KEYS.vikings] },
    { id: 'module-waracademy', labelKey: 'modWaracademy', keys: [STORAGE_KEYS.waracademy] },
    { id: 'module-shopcalc', labelKey: 'modShopcalc', keys: [STORAGE_KEYS.shopcalcItems, STORAGE_KEYS.shopcalcEvents, STORAGE_KEYS.shopcalcEventPlans] },
    { id: 'module-pets',     labelKey: 'modPets',     keys: [STORAGE_KEYS.pets, STORAGE_KEYS.petsPlan, STORAGE_KEYS.petsPlanOff] },
    // Le barème de jetons corrigé à la main est la seule donnée du Magasin du
    // Théâtre que rien d'autre ne porte. Il se déclare ICI, comme les autres :
    // shop-theater.js n'étant chargé que sur sa page, s'y inscrire n'inscrivait
    // le module que là — une sauvegarde faite depuis n'importe quelle autre page
    // l'oubliait, et un import depuis ailleurs le sautait.
    { id: 'module-theater',  labelKey: 'modTheater',  keys: [STORAGE_KEYS.theaterOptimizer] }
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
        document.body.insertAdjacentHTML('beforeend', `<div class="backup-fab">${backupBtnHTML}</div>`);
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
        showBackupAlert(dict.errSelectExport, false);
        return;
    }

    let backupData = {
        app: "Kingshot_Toolbox",
        timestamp: new Date().toISOString(),
        data: {}
    };

    // Chaque module est lu POUR LUI-MÊME. Auparavant un seul `JSON.parse` sur une
    // valeur endommagée jetait une SyntaxError qui emportait tout l'export : aucun
    // fichier ne sortait, et le joueur perdait son moyen de sauvegarde à l'instant
    // précis où une donnée cassait — le seul moment où il en avait vraiment besoin.
    const skipped = [];
    checkboxes.forEach(cb => {
        const mod = BACKUP_MODULES.find(m => m.id === cb.value);
        if (!mod) return;
        mod.keys.forEach(key => {
            const storedValue = localStorage.getItem(key);
            if (!storedValue) return;
            try {
                backupData.data[key] = JSON.parse(storedValue);
            } catch (e) {
                const label = dict[mod.labelKey];
                if (skipped.indexOf(label) === -1) skipped.push(label);
            }
        });
    });

    // Tout était illisible : il n'y a pas de fichier à produire, et le dire vaut
    // mieux que télécharger une sauvegarde vide qui écraserait tout à la restauration.
    if (!Object.keys(backupData.data).length) {
        showBackupAlert(dict.errNothingExport, false);
        return;
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Kingshot_Backup_${dateStr}.json`;
    
    link.click();
    closeBackupModal();

    // Un export amputé ne part pas en silence : le joueur doit savoir ce qui manque
    // dans le fichier qu'il vient d'enregistrer, sinon il le croira complet.
    if (skipped.length) {
        showBackupAlert(dict.warnPartialExport.replace('{list}', skipped.join(', ')), false);
    }
}

// --- LOGIQUE D'IMPORT ---
function executeImport(event) {
    const dict = getCurrentDict();
    const file = event.target.files[0];
    if (!file) return;

    const checkboxes = document.querySelectorAll('.backup-checkbox:checked');
    const selectedModuleIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedModuleIds.length === 0) {
        showBackupAlert(dict.errSelectImport, false);
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        // Trois étapes SÉPARÉES, et l'ordre fait tout : on validait l'enveloppe puis on
        // écrivait dans la foulée, si bien qu'un fichier au bon nom d'application suffisait
        // à remplacer des héros par la chaîne "invalid-shape" — et à afficher « Import
        // successful! ». Rien n'est plus écrit avant que TOUT ait été contrôlé.
        let importedData;
        try {
            importedData = JSON.parse(e.target.result);
        } catch (error) {
            showBackupAlert(dict.errCorrupt, false);
            event.target.value = '';
            return;
        }

        // --- 1. L'enveloppe. On accepte l'ancien nom ("Hub-Kingshot") pour ne pas
        //        casser les sauvegardes déjà entre les mains des joueurs.
        const envelopeOk = importedData && typeof importedData === 'object' && !Array.isArray(importedData)
            && ["Kingshot_Toolbox", "Hub-Kingshot"].includes(importedData.app)
            && importedData.data && typeof importedData.data === 'object' && !Array.isArray(importedData.data);
        if (!envelopeOk) {
            showBackupAlert(dict.errCorrupt, false);
            event.target.value = '';
            return;
        }

        // --- 2. Le CONTENU de chaque module coché, avant la moindre écriture.
        //        Les quinze clés sauvegardées stockent toutes un objet ou un tableau ;
        //        une chaîne, un nombre ou `null` à leur place ne vient pas du site, et
        //        l'écrire remplaçait des données exploitables par un type incompatible.
        const pending = [];   // { key, raw } prêts à écrire
        const invalid = [];   // libellés des modules refusés
        BACKUP_MODULES.forEach(mod => {
            if (!selectedModuleIds.includes(mod.id)) return;
            const own = [];
            let bad = false;
            mod.keys.forEach(key => {
                const value = importedData.data[key];
                if (value === undefined) return;   // absent du fichier : rien à restaurer, ce n'est pas une faute
                if (value === null || typeof value !== 'object') { bad = true; return; }
                own.push({ key: key, raw: JSON.stringify(value) });
            });
            if (bad) invalid.push(dict[mod.labelKey]);
            else Array.prototype.push.apply(pending, own);
        });

        // Un seul module fautif annule TOUT l'import : à moitié restauré, le joueur ne
        // saurait plus quelles données sont les siennes et lesquelles viennent du fichier.
        if (invalid.length) {
            showBackupAlert(dict.errInvalidModules.replace('{list}', invalid.join(', ')), false);
            event.target.value = '';
            return;
        }
        if (!pending.length) {
            showBackupAlert(dict.errNothingImport, false);
            event.target.value = '';
            return;
        }

        // --- 3. L'écriture, avec retour arrière. Les écritures sont successives : sans
        //        cela, un quota atteint à mi-import laissait les premiers modules
        //        remplacés et les suivants intacts, sans aucun moyen de revenir en arrière.
        const undo = pending.map(item => ({ key: item.key, before: localStorage.getItem(item.key) }));
        try {
            pending.forEach(item => localStorage.setItem(item.key, item.raw));
        } catch (error) {
            // Rétablissement en DEUX PASSES, et l'ordre est ce qui le rend sûr.
            // 1) On libère tout ce que l'import a écrit — `removeItem` ne bute jamais
            //    sur le quota. 2) On réécrit alors les valeurs d'origine, qui disposent
            //    de toute la place reprise : leur total tenait avant l'import, il tient
            //    donc encore. Effacer et réécrire clé par clé était plus fragile — un
            //    échec au milieu laissait la clé vide, donc la donnée perdue.
            undo.forEach(u => {
                try { localStorage.removeItem(u.key); } catch (e2) { /* au mieux */ }
            });
            undo.forEach(u => {
                try { if (u.before !== null) localStorage.setItem(u.key, u.before); }
                catch (e2) { /* au mieux */ }
            });
            showBackupAlert(dict.errWriteFailed, false);
            event.target.value = '';
            return;
        }

        // Le succès n'est annoncé qu'ici : après contrôle ET après écriture réussie.
        showBackupAlert(dict.successImport.replace('{count}', pending.length), true, () => {
            // Cette fonction se déclenche uniquement QUAND on clique sur OK
            location.reload();
        });
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initBackupSystem);

// --- NOTIFICATION CUSTOMISÉE CENTRÉE ---
function showBackupAlert(message, isSuccess = false, callback = null) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay active';
    
    // Adaptation des couleurs (succès = turquoise, erreur = orange)
    const color = isSuccess ? 'var(--success)' : 'var(--warning)';
    const icon = isSuccess ? '✅' : '⚠️';
    const title = isSuccess ? (window.GlobalLang && window.GlobalLang.get() === 'EN' ? 'Success' : 'Succès') 
                            : (window.GlobalLang && window.GlobalLang.get() === 'EN' ? 'Error' : 'Erreur');
    
    overlay.innerHTML = `
        <div class="custom-alert-box" style="border-top: 4px solid ${color};">
            <div class="custom-alert-icon">${icon}</div>
            <h3 style="color: ${color}; margin-top: 0; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">${title}</h3>
            <div class="custom-alert-msg">${message}</div>
            <button class="btn-modern btn-modern-secondary" style="width: 100%; border-color: ${color}; color: ${color};">OK</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const btn = overlay.querySelector('button');
    btn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (callback) callback(); // Déclenche le rechargement de la page si besoin
        }, 300);
    };
}
