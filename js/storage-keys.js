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

// Un bandeau, cinq usages. Trois copies du même constructeur existaient
// (`ktWarnUnsaved` ici, `scWarnDataFailure` dans shop-core.js, et ce bloc) : même
// lecture de `hub_lang`, même `#b45309`, même croix, même queue `DOMContentLoaded`.
// Elles sont réunies ici, et `shop-core.js` s'y branche sous garde `window.`.
//
// Les rangées du HAUT s'empilent dans `#kt-alerts` : deux bandeaux en `position:fixed;
// top:0` se recouvraient, et le second rendait le premier illisible, croix comprise.
// `kt-unsaved` reste en bas, il accompagne une saisie en cours plutôt qu'une panne
// au chargement.
//
// Styles en ligne : le message ne doit dépendre d'aucune feuille externe, qui
// pourrait elle-même être la version en cache.
function ktIsFr() {
    try { return (localStorage.getItem('hub_lang') || 'EN').toUpperCase() === 'FR'; }
    catch (e) { return false; }   // stockage interdit
}

// Les textes sont portés par l'élément et rejoués sur `langChanged`, comme toute
// chaîne visible du site (cf. MAP.md §9) : sinon le bandeau restait dans la langue
// d'affichage pendant que le reste de la page basculait.
function ktRelangBanner(el) {
    const fr = ktIsFr();
    const txt = el.querySelector('[data-kt-txt]');
    if (txt) txt.textContent = fr ? el.dataset.ktFr : el.dataset.ktEn;
    const again = el.querySelector('[data-kt-retry]');
    if (again) again.textContent = fr ? "Réessayer" : "Retry";
    const x = el.querySelector('[data-kt-close]');
    if (x) x.setAttribute('aria-label', fr ? "Fermer l'avertissement" : 'Dismiss warning');
}

let ktRelangBound = false;
function ktBanner(id, textFr, textEn, opts) {
    const o = opts || {};
    const show = () => {
      try {
        if (!document.body || document.getElementById(id)) return;
        const el = document.createElement('div');
        el.id = id;
        el.setAttribute('role', 'alert');
        el.dataset.ktFr = textFr;
        el.dataset.ktEn = textEn;
        el.style.cssText = 'padding:12px 16px;background:#b45309;color:#fff;font-size:14px;'
            + 'line-height:1.45;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.3)';

        const txt = document.createElement('span');
        txt.setAttribute('data-kt-txt', '');
        el.appendChild(txt);

        if (o.retry) {
            const again = document.createElement('button');
            again.type = 'button';
            again.setAttribute('data-kt-retry', '');
            again.style.cssText = 'margin-left:12px;padding:4px 12px;border:1px solid #fff;border-radius:6px;'
                + 'background:transparent;color:#fff;cursor:pointer;font-size:13px';
            again.onclick = () => location.reload();
            el.appendChild(again);
        }
        // Croix de fermeture : en haut, le bandeau couvre `.app-header` (fixed, top:0).
        // Sans elle, toute la navigation du site reste hors de portée pendant la panne,
        // et « Réessayer » ne fait que la ramener.
        const x = document.createElement('button');
        x.type = 'button';
        x.setAttribute('data-kt-close', '');
        x.textContent = '\u00d7';
        x.style.cssText = 'margin-left:12px;background:none;border:none;color:#fff;'
            + 'font-size:20px;line-height:1;cursor:pointer';
        x.onclick = () => el.remove();
        el.appendChild(x);
        ktRelangBanner(el);

        if (o.bottom) {
            el.style.cssText += ';position:fixed;left:0;right:0;bottom:0;z-index:9999;'
                + 'box-shadow:0 -2px 12px rgba(0,0,0,.3)';
            document.body.appendChild(el);
        } else {
            let host = document.getElementById('kt-alerts');
            if (!host) {
                host = document.createElement('div');
                host.id = 'kt-alerts';
                host.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9999';
                document.body.appendChild(host);
            }
            host.appendChild(el);
        }

        if (!ktRelangBound) {
            ktRelangBound = true;
            window.addEventListener('langChanged', () => {
                try { document.querySelectorAll('[data-kt-fr]').forEach(ktRelangBanner); }
                catch (e) { /* un avertissement ne doit jamais casser son appelant */ }
            });
        }
      } catch (e) { /* un avertissement ne doit jamais casser son appelant */ }
    };
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
}

function ktTopBanner(id, textFr, textEn, withRetry) {
    ktBanner(id, textFr, textEn, { retry: !!withRetry });
}

// Une sauvegarde relue est illisible. `safeParse` en a déjà mis une copie de côté
// AVANT que quoi que ce soit ne puisse l'écraser : le texte dit donc ce qui s'est
// passé, et non « exportez avant de saisir », qui promettait au joueur une fenêtre
// qu'il n'a pas (la page réenregistre au chargement, sans attendre une saisie).
let ktReadBroken = false;
function ktWarnCorrupt() {
    if (ktReadBroken) return;
    ktReadBroken = true;
    ktTopBanner('kt-corrupt',
        "Une partie de vos données enregistrées est illisible : cette page est repartie de zéro. "
        + "La version abîmée a été mise de côté, elle reste récupérable tant que vous ne videz pas le stockage du navigateur.",
        "Some of your saved data could not be read: this page has started from scratch. "
        + "The damaged version has been set aside, and stays recoverable unless you clear your browser storage.",
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
// ============================================================
let ktStorageBroken = false;

function ktWarnUnsaved() {
    if (ktStorageBroken) return;          // une seule bannière, pas une par frappe
    ktStorageBroken = true;
    ktBanner('kt-unsaved',
        "Ces changements ne sont pas sauvegardés (stockage plein ou navigation privée). Le calcul reste juste à l'écran, exportez vos données avant de quitter la page.",
        "These changes are not being saved (storage full, or private browsing). The figures on screen stay correct, export your data before leaving the page.",
        { bottom: true });
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
window.ktTopBanner = ktTopBanner;

window.STORAGE_KEYS = STORAGE_KEYS;
