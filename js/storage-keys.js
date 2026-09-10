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

// ============================================================
//  LECTURE SÛRE
//  Une valeur illisible ne doit ni casser la page, ni disparaître sans bruit.
//  `safeParse` retombait sur son repli avec un simple `console.warn` : la page
//  s'affichait vide, le joueur croyait à un bug d'affichage, touchait un champ,
//  et la sauvegarde de la page réécrivait TOUT par-dessus l'original encore
//  réparable. Douze héros relevés, une valeur tronquée, une seule fiche
//  enregistrée : il en restait un. Désormais la valeur d'origine est mise de
//  côté et le joueur est prévenu avant d'avoir eu le temps d'écraser quoi que
//  ce soit.
//
//  La lecture et l'analyse sont SÉPARÉES : un stockage interdit (cookies
//  bloqués) faisait lever `getItem` lui-même, et le joueur lisait « données
//  corrompues » alors que rien ne l'était.
// ============================================================
const ktCorruptSeen = {};   // une seule copie de secours par clé et par session

function ktKeepCorrupt(key, raw) {
    if (ktCorruptSeen[key]) return;
    ktCorruptSeen[key] = true;
    try {
        // Rangée dans l'espace du profil actif, comme la clé d'origine : sans cela
        // deux comptes abîmés le même jour écraseraient la copie l'un de l'autre.
        const pid = (window.Profiles && window.Profiles.activeId) ? window.Profiles.activeId() : null;
        localStorage.setItem((pid ? 'kt::' + pid + '::' : '') + key + '__corrompu', raw);
    } catch (e) { /* plus de place : l'avertissement reste le vrai filet */ }
}

function safeParse(key, fallback) {
    let raw = null;
    try { raw = localStorage.getItem(key); }
    catch (e) { return fallback; }        // stockage interdit : rien à lire, rien d'abîmé
    if (raw === null || raw === '') return fallback;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Données illisibles pour', key, '— repli, copie sous', key + '__corrompu');
        ktKeepCorrupt(key, raw);
        ktWarnCorrupt();
        return fallback;
    }
}
window.safeParse = safeParse;

// ============================================================
//  AVERTISSEMENTS VISIBLES
//  Trois pannes, trois messages, un seul endroit. Le site savait déjà dire
//  « ce n'est pas enregistré » ; il ne savait dire ni « ce qui était enregistré
//  est illisible », ni « le fichier de données n'est pas arrivé ». Ma Caserne,
//  Maîtres et Vikings s'arrêtaient à un `console.error` que personne ne lit.
//
//  Exposés sur `window` À DESSEIN : le site n'a pas de cache-busting, une page
//  neuve peut donc tomber sur un fichier en cache. `window.ktWarnDataFailure && ...`
//  ne peut pas lever de ReferenceError, là où un nom global nu le pourrait.
// ============================================================

// Pile d'avertissements en haut de page : une rangée par nature de panne, jamais
// deux fois la même. Styles en ligne, comme le bandeau du bas : le message ne doit
// dépendre d'aucune feuille externe, qui pourrait elle-même être en cache.
function ktTopBanner(id, textFr, textEn, withRetry) {
    const show = () => {
      try {
        if (!document.body || document.getElementById(id)) return;
        let host = document.getElementById('kt-alerts');
        if (!host) {
            host = document.createElement('div');
            host.id = 'kt-alerts';
            host.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9999';
            document.body.appendChild(host);
        }
        let fr = false;
        try { fr = (localStorage.getItem('hub_lang') || 'EN').toUpperCase() === 'FR'; } catch (e) { /* stockage interdit */ }
        const el = document.createElement('div');
        el.id = id;
        el.setAttribute('role', 'alert');
        el.style.cssText = 'padding:12px 16px;background:#b45309;color:#fff;font-size:14px;'
            + 'line-height:1.45;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.3)';
        el.textContent = fr ? textFr : textEn;
        if (withRetry) {
            const again = document.createElement('button');
            again.type = 'button';
            again.textContent = fr ? "Réessayer" : "Retry";
            again.style.cssText = 'margin-left:12px;padding:4px 12px;border:1px solid #fff;border-radius:6px;'
                + 'background:transparent;color:#fff;cursor:pointer;font-size:13px';
            again.onclick = () => location.reload();
            el.appendChild(again);
        }
        // Croix de fermeture : le bandeau couvre `.app-header` (fixed, top:0). Sans
        // elle, toute la navigation du site reste hors de portée pendant la panne,
        // et « Réessayer » ne fait que la ramener.
        const x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('aria-label', fr ? "Fermer l'avertissement" : 'Dismiss warning');
        x.textContent = '×';
        x.style.cssText = 'margin-left:12px;background:none;border:none;color:#fff;'
            + 'font-size:20px;line-height:1;cursor:pointer';
        x.onclick = () => el.remove();
        el.appendChild(x);
        host.appendChild(el);
      } catch (e) { /* un avertissement ne doit jamais casser son appelant */ }
    };
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
}

// Une sauvegarde relue est illisible. Le plus urgent des trois : tant que le
// joueur n'a rien saisi, l'original est encore là.
let ktReadBroken = false;
function ktWarnCorrupt() {
    if (ktReadBroken) return;
    ktReadBroken = true;
    ktTopBanner('kt-corrupt',
        "Une partie de vos données enregistrées est illisible : cette page est repartie de zéro. "
        + "Exportez vos autres pages avant de modifier quoi que ce soit ici, une saisie remplacerait la sauvegarde abîmée.",
        "Some of your saved data could not be read: this page has started from scratch. "
        + "Export your other pages before changing anything here, as one edit would replace the damaged save.",
        false);
}

// Un fichier de `data/` n'est pas arrivé. Équivalent du bandeau des boutiques
// (`scWarnDataFailure`), pour les pages qui n'ont pas `shop-core.js`.
let ktDataBroken = false;
function ktWarnDataFailure() {
    if (ktDataBroken) return;
    ktDataBroken = true;
    ktTopBanner('kt-data-error',
        "Certaines données du site n'ont pas pu être chargées : cette page est incomplète.",
        "Some site data could not be loaded: this page is incomplete.",
        true);
}

// Le registre des profils était illisible et a dû être reconstruit.
let ktProfilesShown = false;
function ktWarnProfilesReset() {
    if (ktProfilesShown) return;
    ktProfilesShown = true;
    ktTopBanner('kt-profiles',
        "Le registre de vos profils était illisible. Vos données sont intactes, mais les noms et les couleurs sont à refaire.",
        "Your profile list could not be read. Your data is safe, but the names and colours need setting again.",
        false);
}

// Le rendu s'est interrompu en cours de route. C'est la panne la plus traître du
// site : les chiffres restent à l'écran, justes pour l'ancienne saisie, faux pour
// la nouvelle, et rien n'a l'air anormal.
let ktStaleShown = false;
function ktWarnStale() {
    if (ktStaleShown) return;
    ktStaleShown = true;
    ktTopBanner('kt-stale',
        "Les chiffres affichés n'ont pas pu être mis à jour : ils ne correspondent plus à votre saisie. Rechargez la page.",
        "The figures on screen could not be refreshed: they no longer match what you entered. Reload the page.",
        true);
}

// ============================================================
//  ÉCRITURE SÛRE + AVERTISSEMENT VISIBLE
//  Un stockage plein (quota) ou interdit (navigation privée, cookies bloqués)
//  ne doit ni casser la page, ni passer inaperçu. Deux échecs opposés existaient :
//  shop-core.js écrivait SANS filet et une exception vidait le tableau en plein
//  chargement ; pets.js et consorts avalaient l'erreur en silence et le joueur
//  croyait ses changements conservés. Ici le calcul continue en mémoire ET le
//  joueur est prévenu qu'il doit exporter avant de partir.
//
//  Bandeau du BAS, à la différence des deux précédents : il accompagne une saisie
//  en cours plutôt qu'une panne au chargement, et il ne doit pas pousser la page.
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
        x.setAttribute('aria-label', fr ? "Fermer l'avertissement" : 'Dismiss warning');
        x.textContent = '×';
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
window.ktWarnCorrupt = ktWarnCorrupt;
window.ktWarnDataFailure = ktWarnDataFailure;
window.ktWarnStale = ktWarnStale;
window.ktWarnProfilesReset = ktWarnProfilesReset;

window.STORAGE_KEYS = STORAGE_KEYS;
