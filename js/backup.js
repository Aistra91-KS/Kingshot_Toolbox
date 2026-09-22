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

// Langue d'affichage. Le repli ne sert que si `lang.js` manque (chargement
// échoué, fichier encore en cache) : il lit alors la préférence directement, sous
// garde — un stockage interdit fait lever `getItem` lui-même, et la page mourait là.
function bkLang() {
    if (window.GlobalLang) return window.GlobalLang.get();
    try { return localStorage.getItem('hub_lang') || 'EN'; } catch (e) { return 'EN'; }
}

// Liste des modules sauvegardables (Clés exactes du localStorage ciblées)
const BACKUP_MODULES = [
    { id: 'module-caserne',  labelKey: 'modCaserne',  keys: [STORAGE_KEYS.caserneHeroes, STORAGE_KEYS.caserneFilters] },
    { id: 'module-masters',  labelKey: 'modMasters',  keys: [STORAGE_KEYS.masters] },
    { id: 'module-research', labelKey: 'modResearch', keys: [STORAGE_KEYS.researchDb, STORAGE_KEYS.researchInputs] },
    { id: 'module-beartrap', labelKey: 'modBeartrap', keys: [STORAGE_KEYS.beartrap, STORAGE_KEYS.beartrapJoiners] },
    // Les DEUX onglets de la page TrueGold, sous un seul module : le joueur
    // sauvegarde « TrueGold », pas « TrueGold sauf l'onglet de gauche ». Ajouter
    // l'onglet sans l'inscrire ici le laissait tomber en silence à l'export.
    { id: 'module-truegold', labelKey: 'modTrueGold', keys: [STORAGE_KEYS.truegold, STORAGE_KEYS.truegoldPre] },
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


// ============================================================
//  FORME ATTENDUE DE CHAQUE CLÉ
//  L'import ne contrôlait que l'enveloppe et le premier niveau : « un objet ou
//  un tableau » suffisait à passer. Un `custom-marches` livré en objet au lieu
//  de tableau était donc écrit en stockage, et le Piège à Ours mourait au
//  rechargement suivant sur `customMarchesList.forEach is not a function` — le
//  retour arrière ne se déclenchait pas, l'écriture ayant réussi (constat F02 de
//  la revue du 2026-09-20).
//
//  Chaque validateur décrit ce que le module SAIT relire, pas davantage : les
//  champs inconnus passent, pour qu'une sauvegarde faite par une version
//  précédente (ou par une version suivante) reste importable. Ce qui est refusé,
//  c'est la forme qui casse un consommateur : un tableau attendu, un
//  dictionnaire attendu, un nombre attendu.
// ============================================================
const bkObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const bkArr = Array.isArray;
// Une valeur absente est valide : tous ces champs sont facultatifs dans une
// sauvegarde. C'est leur PRÉSENCE sous une forme inattendue qui est refusée.
const bkOptArr = (v) => v === undefined || bkArr(v);
const bkOptObj = (v) => v === undefined || bkObj(v);
const bkOptNum = (v) => v === undefined || (typeof v === 'number' && Number.isFinite(v));
const bkObjOf = (v, ok) => bkObj(v) && Object.keys(v).every(k => ok(v[k]));
const bkArrOf = (v, ok) => bkArr(v) && v.every(ok);

// Une fiche de héros : c'est elle que la Caserne interpole dans sa grille. Un
// niveau livré en chaîne y entrait tel quel, balisage compris.
function bkHeroEntry(h) {
    return bkObj(h) && bkOptNum(h.level) && bkOptNum(h.shards) && bkOptNum(h.widgetLevel)
        && (h.skills === undefined || bkArrOf(h.skills, bkOptNum));
}

const BACKUP_SHAPES = {
    [STORAGE_KEYS.caserneHeroes]:  (v) => bkObjOf(v, bkHeroEntry),
    [STORAGE_KEYS.caserneFilters]: bkObj,
    [STORAGE_KEYS.masters]:        (v) => bkObjOf(v, bkObj),
    // Depuis l'allègement de la sauvegarde, la clé ne porte plus que les lignes
    // cochées — mais c'est toujours un TABLEAU, et un export d'avant en est un aussi.
    [STORAGE_KEYS.researchDb]:     (v) => bkArrOf(v, bkObj),
    [STORAGE_KEYS.researchInputs]: bkObj,
    [STORAGE_KEYS.beartrap]:       (v) => bkObj(v) && bkOptArr(v['custom-marches']),
    [STORAGE_KEYS.beartrapJoiners]: bkObj,
    [STORAGE_KEYS.truegold]:       (v) => bkObj(v) && bkOptArr(v.buildings),
    [STORAGE_KEYS.truegoldPre]:    (v) => bkObj(v) && bkOptObj(v.rows) && bkOptObj(v.stock),
    [STORAGE_KEYS.waracademy]:     (v) => bkObj(v) && bkOptObj(v.enabled) && bkOptObj(v.tradeUse) && bkOptObj(v.levels),
    [STORAGE_KEYS.vikings]:        bkObj,
    [STORAGE_KEYS.shopcalcItems]:  (v) => bkArrOf(v, bkObj),
    [STORAGE_KEYS.shopcalcEvents]: (v) => bkArrOf(v, bkObj),
    [STORAGE_KEYS.shopcalcEventPlans]: bkObj,
    // Ancien format toléré : `{ petId: 12 }` au lieu de `{ petId: {lvl, adv} }`.
    // `pets.js` le migre au chargement, refuser l'import le priverait de sa matière.
    [STORAGE_KEYS.pets]:           (v) => bkObjOf(v, (x) => bkObj(x) || (typeof x === 'number' && Number.isFinite(x))),
    [STORAGE_KEYS.petsPlan]:       bkObj,
    [STORAGE_KEYS.petsPlanOff]:    bkArr,
    [STORAGE_KEYS.theaterOptimizer]: (v) => bkObj(v) && bkOptObj(v.tokens)
};

// Une clé sans validateur déclaré retombe sur l'ancienne règle, plutôt que de
// refuser un module que ce fichier ne connaîtrait pas encore.
function backupShapeOk(key, value) {
    const check = BACKUP_SHAPES[key];
    return check ? !!check(value) : (bkObj(value) || bkArr(value));
}

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
    let lang = bkLang().toUpperCase();
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
// Fermeture rendue par `ktModal` (header.js), tant que la fenêtre est ouverte.
let bkCloseModal = null;

function openBackupModal() {
    updateBackupLanguage(); // On force la mise à jour à l'ouverture par sécurité
    const overlay = document.getElementById('global-backup-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    // Sous garde `window.` : sans cache-busting, cette page peut tourner avec un
    // `header.js` antérieur à la primitive. On retombe alors sur l'ancien
    // comportement (fenêtre ouverte, focus inchangé) plutôt que sur une erreur.
    if (window.ktModal) {
        bkCloseModal = ktModal(overlay, {
            box: overlay.querySelector('.backup-modal'),
            labelledBy: 'backup-modal-title',
            onClose: () => { overlay.classList.remove('active'); bkCloseModal = null; }
        });
    }
}

function closeBackupModal() {
    if (bkCloseModal) { bkCloseModal(false); return; }
    const overlay = document.getElementById('global-backup-overlay');
    if (overlay) overlay.classList.remove('active');
}

function getCurrentDict() {
    return i18nBackup[bkLang().toUpperCase()] || i18nBackup['FR'];
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
            const label = dict[mod.labelKey];
            const exclure = () => { if (skipped.indexOf(label) === -1) skipped.push(label); };
            // La LECTURE peut lever, pas seulement l'analyse (stockage interdit). Le
            // module rejoint alors la liste des exclus : sortir un fichier amputé sans
            // le dire, c'est promettre une sauvegarde complète qui n'en est pas une.
            let storedValue = null;
            try { storedValue = localStorage.getItem(key); }
            catch (e) { exclure(); return; }
            if (!storedValue) return;          // rien d'enregistré : ce n'est pas une panne
            try {
                backupData.data[key] = JSON.parse(storedValue);
            } catch (e) {
                exclure();
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
        //        Chaque clé a sa forme (cf. BACKUP_SHAPES) : « un objet ou un tableau »
        //        ne suffisait pas, le module d'en face attend un tableau ICI et un
        //        dictionnaire LÀ. Un seul module refusé annule tout l'import, avant
        //        que quoi que ce soit ne soit écrit.
        const pending = [];   // { key, raw } prêts à écrire
        const invalid = [];   // libellés des modules refusés
        BACKUP_MODULES.forEach(mod => {
            if (!selectedModuleIds.includes(mod.id)) return;
            const own = [];
            let bad = false;
            mod.keys.forEach(key => {
                const value = importedData.data[key];
                if (value === undefined) return;   // absent du fichier : rien à restaurer, ce n'est pas une faute
                if (!backupShapeOk(key, value)) { bad = true; return; }
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
        // Photo de l'état d'avant, pour le retour arrière. Lecture gardée : sur un
        // stockage interdit, l'écriture qui suit échouera de toute façon, et ce sont
        // ses `catch` qui doivent parler — pas une exception jetée d'ici.
        const undo = pending.map(item => {
            let before = null;
            try { before = localStorage.getItem(item.key); } catch (e) { before = null; }
            return { key: item.key, before: before };
        });
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
            <h3 class="custom-alert-title" style="color: ${color}; margin-top: 0; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">${title}</h3>
            <div class="custom-alert-msg">${message}</div>
            <button class="btn-modern btn-modern-secondary" style="width: 100%; border-color: ${color}; color: ${color};">OK</button>
        </div>
    `;
    
    document.body.appendChild(overlay);

    const fermeture = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (callback) callback(); // Déclenche le rechargement de la page si besoin
        }, 300);
    };
    // Même contrat que les autres fenêtres : le focus entre, Échap ferme, le focus
    // revient. Une alerte n'a qu'une issue, Échap et « OK » mènent donc au même endroit.
    const fermer = window.ktModal
        ? ktModal(overlay, { box: overlay.querySelector('.custom-alert-box'), label: title, onClose: fermeture })
        : fermeture;
    overlay.querySelector('button').onclick = () => fermer(false);
}
