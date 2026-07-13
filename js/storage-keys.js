// Source unique des clés localStorage métier
const STORAGE_KEYS = {
    caserneHeroes:  'caserne_user_heroes',
    caserneFilters: 'caserne_filters',
    masters:        'masters_user_data',
    researchDb:     'research_calc_db_v9',
    researchInputs: 'research_calc_inputs_v9',
    beartrap:       'beartrap_data',
    truegold:       'tg_calc_data_v3',
    waracademy:     'wa_calc_data_v1',
    vikings:        'vikings_data',
    shopcalcItems: 'shopcalc_items',
    shopcalcClassic: 'shopcalc_classic',
    shopcalcEvents: 'shopcalc_events',
    shopcalcTab:    'shopcalc_tab',
    shopcalcCollapsed: 'shopcalc_collapsed',
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

window.STORAGE_KEYS = STORAGE_KEYS;
