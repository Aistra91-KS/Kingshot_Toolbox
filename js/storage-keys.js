// Source unique des clés localStorage métier
const STORAGE_KEYS = {
    caserneHeroes:  'caserne_user_heroes',
    caserneFilters: 'caserne_filters',
    masters:        'masters_user_data',
    researchDb:     'research_calc_db_v9',
    researchInputs: 'research_calc_inputs_v9',
    beartrap:       'beartrap_data',
    beartrapJoiners: 'beartrap_joiners',
    truegold:       'tg_calc_data_v3',
    waracademy:     'wa_calc_data_v1',
    vikings:        'vikings_data',
    shopcalcItems: 'shopcalc_items',
    shopcalcClassic: 'shopcalc_classic',
    shopcalcEvents: 'shopcalc_events',
    shopcalcTab:    'shopcalc_tab',
    shopcalcCollapsed: 'shopcalc_collapsed',
    shopcalcEventPlans: 'shopcalc_event_plans',
    pets:              'pets_levels',
    petsPlan:          'pets_plan_stock',
    petsPlanOff:       'pets_plan_off',
    theaterOptimizer:  'theater_optimizer_data',
};

function safeParse(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn('Données corrompues pour', key, '— réinitialisation.');
        return fallback;
    }
}
window.safeParse = safeParse;

// ============================================================
//  ÉCRITURE SÛRE + AVERTISSEMENT VISIBLE
//  Un stockage plein (quota) ou interdit (navigation privée, cookies bloqués)
//  ne doit ni casser la page, ni passer inaperçu. Deux échecs opposés existaient :
//  shop-core.js écrivait SANS filet et une exception vidait le tableau en plein
//  chargement ; pets.js et consorts avalaient l'erreur en silence et le joueur
//  croyait ses changements conservés. Ici le calcul continue en mémoire ET le
//  joueur est prévenu qu'il doit exporter avant de partir.
//
//  Exposé sur `window` À DESSEIN : le site n'a pas de cache-busting, une page
//  neuve peut donc tomber sur un fichier en cache. `window.ktSafeSet && ...`
//  ne peut pas lever de ReferenceError, là où un nom global nu le pourrait.
// ============================================================
let ktStorageBroken = false;

function ktWarnUnsaved() {
    if (ktStorageBroken) return;          // une seule bannière, pas une par frappe
    ktStorageBroken = true;
    const show = () => {
      // TOUT est sous try/catch, et ce n'est pas de la prudence décorative :
      // quand le stockage est *interdit* (cookies bloqués) et non simplement plein,
      // la lecture de `hub_lang` ci-dessous lève à son tour. Cette exception-là
      // s'échappait de `ktSafeSet`, remontait jusqu'à `scLoadAll()` et laissait la
      // page de boutique entièrement blanche — exactement la panne qu'on répare ici.
      try {
        if (!document.body || document.getElementById('kt-unsaved')) return;
        let fr = false;
        try { fr = (localStorage.getItem('hub_lang') || 'EN').toUpperCase() === 'FR'; } catch (e) { /* stockage interdit */ }
        const el = document.createElement('div');
        el.id = 'kt-unsaved';
        el.setAttribute('role', 'alert');
        // Styles en ligne : la bannière ne doit dépendre d'aucune feuille externe,
        // qui pourrait elle-même être la version en cache.
        el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;'
            + 'padding:12px 16px;background:#b45309;color:#fff;font-size:14px;'
            + 'line-height:1.45;text-align:center;box-shadow:0 -2px 12px rgba(0,0,0,.3)';
        el.textContent = fr
            ? "Ces changements ne sont pas sauvegardés (stockage plein ou navigation privée). Le calcul reste juste à l'écran, exportez vos données avant de quitter la page."
            : "These changes are not being saved (storage full, or private browsing). The figures on screen stay correct, export your data before leaving the page.";
        const x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('aria-label', fr ? 'Fermer l\u2019avertissement' : 'Dismiss warning');
        x.textContent = '\u00d7';
        x.style.cssText = 'margin-left:14px;background:none;border:none;color:#fff;'
            + 'font-size:20px;line-height:1;cursor:pointer';
        x.onclick = () => el.remove();
        el.appendChild(x);
        document.body.appendChild(el);
      } catch (e) { /* un avertissement ne doit jamais casser son appelant */ }
    };
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
}

// Renvoie true si la valeur est bien partie en stockage, false sinon.
function ktSafeSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (e) {
        try { ktWarnUnsaved(); } catch (e2) { /* jamais de seconde exception ici */ }
        return false;
    }
}

window.ktSafeSet = ktSafeSet;
window.ktWarnUnsaved = ktWarnUnsaved;

window.STORAGE_KEYS = STORAGE_KEYS;
