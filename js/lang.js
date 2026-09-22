// ========================================
//  GESTIONNAIRE DE LANGUE GLOBAL
//  Partagé entre toutes les pages du site
// ========================================

const GlobalLang = {
    // Clé unique de stockage pour TOUT le site
    STORAGE_KEY: 'hub_lang',
    DEFAULT_LANG: 'EN',

    // Langue retenue pour la visite en cours. Elle ne remplace pas le stockage,
    // elle prend le relais quand il est refusé : la bascule FR/EN fonctionne alors
    // à l'écran, seule la mémorisation d'une visite à l'autre est perdue.
    sessionLang: null,

    /**
     * Récupère la langue actuelle depuis le localStorage
     * @returns {string} 'FR' ou 'EN'
     *
     * L'ACCÈS lui-même peut lever, pas seulement l'écriture : cookies bloqués,
     * modes stricts, certaines navigations privées. `profiles.js` avait déjà son
     * filet, pas celui-ci — et comme presque tous les scripts de page appellent
     * `GlobalLang.get()` dans leurs premières lignes, un stockage interdit tuait
     * l'amorçage à cet endroit précis : la page Recherches s'affichait avec son
     * bandeau d'avertissement et zéro ligne de suggestion (constat F06 de la revue
     * du 2026-09-20). La lecture est donc gardée, et la valeur relue est contrôlée :
     * un `hub_lang` abîmé ne doit pas se propager en clé de dictionnaire.
     */
    get() {
        try {
            const v = localStorage.getItem(this.STORAGE_KEY);
            if (v === 'FR' || v === 'EN') { this.sessionLang = v; return v; }
        } catch (e) { /* stockage refusé : on retombe sur la langue de la visite */ }
        return this.sessionLang || this.DEFAULT_LANG;
    },

    /**
     * Sauvegarde la langue dans le localStorage
     * @param {string} lang - 'FR' ou 'EN'
     */
    set(lang) {
        if (lang !== 'FR' && lang !== 'EN') return;
        // Le choix de langue n'est qu'une préférence : s'il ne peut pas être écrit
        // (navigation privée, quota), la bascule doit tout de même avoir lieu à l'écran.
        this.sessionLang = lang;
        try { localStorage.setItem(this.STORAGE_KEY, lang); } catch (e) { /* préférence non retenue */ }
        // Émet un événement custom pour notifier d'autres scripts
        window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
    },

    /**
     * Applique la langue à un <select> et déclenche son onchange
     * @param {string} selectId - ID de l'élément select
     */
    applyToSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const savedLang = this.get();
        select.value = savedLang;
        
        // Écoute les changements pour les sauvegarder globalement
        select.addEventListener('change', () => {
            this.set(select.value);
        });
    },

    /**
     * Applique la langue aux boutons FR/EN du Hub
     * @param {string} btnClass - classe des boutons (ex: 'lang-btn')
     * @param {function} onChange - callback à appeler quand la langue change
     */
    applyToButtons(btnClass, onChange) {
        const savedLang = this.get();
        const buttons = document.querySelectorAll('.' + btnClass);
        
        buttons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', btnLang === savedLang);
            
            btn.addEventListener('click', () => {
                const newLang = btn.getAttribute('data-lang');
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.set(newLang);
                if (typeof onChange === 'function') onChange(newLang);
            });
        });
    }
};

// Applique un dictionnaire aux éléments [data-i18n] et [data-i18n-placeholder]
GlobalLang.applyI18n = function(dict) {
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });
};

// Expose globalement pour les autres scripts
window.GlobalLang = GlobalLang;
