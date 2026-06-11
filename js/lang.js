// ========================================
//  GESTIONNAIRE DE LANGUE GLOBAL
//  Partagé entre toutes les pages du site
// ========================================

const GlobalLang = {
    // Clé unique de stockage pour TOUT le site
    STORAGE_KEY: 'hub_lang',
    DEFAULT_LANG: 'EN',

    /**
     * Récupère la langue actuelle depuis le localStorage
     * @returns {string} 'FR' ou 'EN'
     */
    get() {
        return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    },

    /**
     * Sauvegarde la langue dans le localStorage
     * @param {string} lang - 'FR' ou 'EN'
     */
    set(lang) {
        if (lang !== 'FR' && lang !== 'EN') return;
        localStorage.setItem(this.STORAGE_KEY, lang);
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
