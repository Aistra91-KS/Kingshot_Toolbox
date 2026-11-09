// ========================================
//  PLANIFICATEUR DE L'ÎLE : INTERFACE
//  Moteur : js/island_planner.js · Données : data/island.json
//  Le joueur renseigne ses niveaux ; la page propose les 5 prochaines actions.
//  Priorité fixée par Aistra : la Fontaine Vitale et les Réservoirs d'abord.
//  Le code garde les mots du moteur : tree = Fontaine, camp = Réservoir, seeds = Essence d'Eau.
// ========================================

const IS_MAX_SUGGESTIONS = 5;

const IS_I18N = {
    EN: {
        ctrlPanel: 'My Island', introHint: 'Enter your levels here, then your buildings on the right: the suggestions update on their own.',
        treeTitle: 'Fountain of Life', treeLevel: 'Fountain level', seedsStock: 'Water Essence in stock', production: 'Production',
        capHint: 'The Fountain only holds {n} Water Essence (12 hours): collect at least twice a day.',
        giftText: 'Going up to Fountain lvl {n} earns {list}. Add to your stock, unless already placed or counted.',
        giftAdd: 'Add to stock', giftSkip: 'Ignore', giftAdded: 'Added to stock: {list}',
        campsTitle: 'Reservoirs', camp1: 'Reservoir 1', camp2: 'Reservoir 2', notBuilt: 'Not built', locked: 'Locked (Fountain lvl {n})',
        prospTitle: 'Prosperity', prospComputed: 'From your buildings', prospInGame: 'In-game prosperity (optional)',
        prospHint: 'Leave 0 to use the prosperity worked out from your buildings.',
        prospGap: 'Gap with the game: {n}. A building may be missing below.',
        nextTitle: 'What to do next?', bldgTitle: 'My island buildings',
        bldgLead: 'Set the level (or number of copies) of each building you own. Only the buildings your Fountain of Life has unlocked are shown.',
        bonusTitle: 'Active island bonuses', refTitle: 'Fountain and Reservoir levels', refTree: 'Fountain of Life', refCamp: 'Reservoir',
        refLead: 'Costs, bonuses and production, level by level.',
        perHour: '/ h', lvl: 'Lvl', copies: 'copies', none: '—',
        goalLine: 'Goal: Fountain of Life lvl {a} → {b}', goalProsp: 'prosperity {have} / {need}', goalSeeds: '{n} Water Essence',
        goalMax: 'Fountain of Life at max level.', goalUnknown: 'Fountain of Life lvl {n}: requirements not recorded yet.',
        actTree: 'Upgrade the Fountain of Life to level {n}', actCampPlace: 'Build Reservoir {c}', actCamp: 'Upgrade Reservoir {c} to level {n}',
        actPlace: 'Place a {name}', actCopy: 'Place a {name} ({n}/{max})', actLevel: 'Upgrade {name} to level {n}',
        whyTree: 'Your prosperity reaches the {need} required: the Fountain comes before everything else.',
        whyCamp: 'Reservoirs come before the other buildings, and your Fountain (lvl {t}) allows it.', whyCampBuild: 'Building a new Reservoir comes first: your Fountain (lvl {t}) unlocks it.',
        campGain: 'Gathering speed {a} → {b}, load {c} → {d}.',
        campInfo: 'Reservoir {c}: speed {s} · load {l}',
        whyForTree: '{d} prosperity still missing for Fountain lvl {n}: this is the cheapest way to get it ({r} Water Essence per point).',
        whyBest: 'Best yield available: {r} Water Essence per prosperity point.',
        useStock: 'Uses {n} {c} from your stock.', buyOne: 'Buy 1 copy.',
        buyCopies: 'Buy {n} copies.', copyOne: 'copy', copyMany: 'copies', reward: 'Reward: {r}.', unlocks: 'Unlocks: {l}.', unlockRarity: '{r} buildings',
        validate: 'Done in game: update my island', validated: '{a} done', validatedSeeds: ' · −{n} Water Essence', validatedMore: ' · {n} earlier step(s) of the same building too',
        seeds: 'Water Essence', prospGain: '+{n} prosperity', ready: 'Doable now', readyIn: 'In about {t}', missing: '{n} Water Essence missing',
        stopUnreachable: 'Fountain lvl {n} needs {need} prosperity and the buildings you can buy cannot provide it. Tick the buildings already unlocked in game below.',
        stopNothing: 'Nothing left to suggest with the data recorded so far.',
        stopData: 'From Fountain lvl {n}, requirements are not recorded yet: suggestions then follow the best prosperity yield.',
        rarity: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', mythic: 'Mythic' },
        groupUnknown: 'Unlock level not recorded', groupUnknownHint: 'Tick "Unlocked for me" if you can buy it in game, so it enters the suggestions.',
        groupEvent: 'Event buildings', groupLocked: 'Not unlocked yet ({n})', unlockAt: 'Fountain lvl {n}', unlockedTick: 'Unlocked for me',
        prospLine: 'Prosperity {n}', maxLine: 'max {v}', nextLine: 'Next: {n} Water Essence', nextCopies: 'Next: {n} Water Essence ({c} copies)', maxed: 'Maxed',
        looksChange: 'Its look changes at levels {list}.', shopAt: 'In the shop from Fountain lvl {n}.',
        paidLine: 'Paid building: at least ${n} to get lvl 1.', paidAny: 'Paid building: lvl 1 is bought with real money.',
        minus: 'Remove one level from {name}', stockLabel: 'In stock', stockMinus: 'One less {name} in stock', stockPlus: 'One more {name} in stock', plus: 'Add one level to {name}',
        emptyBonus: 'No active bonus yet.', fromTree: 'Fountain of Life', fromBldg: 'buildings',
        refLevel: 'Level', refBonus: 'Bonus unlocked', refProd: 'Water Essence / h', refNeedProsp: 'Prosperity to go up',
        refNeedSeeds: 'Water Essence to go up', refReward: 'Upgrade reward', refWorkers: 'Workers', refSpeed: 'Gathering speed',
        refLoad: 'Load', refNeedTree: 'Fountain required', treeLvl: 'Fountain lvl {n}',
        refNotes: 'Reservoir 2 unlocks at Fountain of Life level 5 and costs 3,000 Water Essence to build. Once built, it has the same upgrade costs and bonuses as Reservoir 1.',
        itemsTitle: 'Island items', itemComp: 'Mythic components', itemWonder: 'Wonder Blueprints',
        itemsHint: 'From Fountain lvl {t}, {k} components ({s} Water Essence each) make one copy of a Mythic building, event ones included. Wonder Blueprints come from events and upgrade the {b} ({p} × its current level).',
        useItem: 'Uses {n} × {item} from your stock.', buyItem: 'Buys {n} × {item} ({s} Water Essence).', buyBlueprint: 'Buy the {item}.',
        nextItem: 'Next: {n} × {item}', nextBlueprint: 'Blueprint: {n} Water Essence', nextComp: 'Next: {c} copies = {k} components', nextCompOne: 'Next: {k} components',
        stockBlueprint: 'Blueprints',
        hours: 'h', days: 'd', minutes: 'min', now: 'now',
        dataError: 'The island data could not be loaded.',
        amountInvalid: 'Amount not recognised: "{v}". Write for example 12000, 250k or 1.5M. Previous value restored.',
        nextStep: 'Next step: {a}', currentLevel: 'current', bldgCount: 'buildings'
    },
    FR: {
        ctrlPanel: 'Mon Île', introHint: 'Renseigne tes niveaux ici, puis tes bâtiments à droite : les suggestions se mettent à jour toutes seules.',
        treeTitle: 'Fontaine Vitale', treeLevel: 'Niveau de la Fontaine', seedsStock: "Essence d'Eau en stock", production: 'Production',
        capHint: "La Fontaine ne garde que {n} d'Essence d'Eau (12 heures) : récolte au moins deux fois par jour.",
        giftText: "Monter la Fontaine au niv. {n} rapporte {list}. À ajouter à ton stock, sauf si c'est déjà posé ou compté.",
        giftAdd: 'Ajouter au stock', giftSkip: 'Ignorer', giftAdded: 'Ajouté au stock : {list}',
        campsTitle: 'Réservoirs', camp1: 'Réservoir 1', camp2: 'Réservoir 2', notBuilt: 'Non construit', locked: 'Verrouillé (Fontaine niv. {n})',
        prospTitle: 'Prospérité', prospComputed: 'Selon tes bâtiments', prospInGame: 'Prospérité en jeu (optionnel)',
        prospHint: 'Laisse 0 pour utiliser la prospérité calculée depuis tes bâtiments.',
        prospGap: 'Écart avec le jeu : {n}. Un bâtiment manque peut-être plus bas.',
        nextTitle: 'Que faire ensuite ?', bldgTitle: "Mes bâtiments d'île",
        bldgLead: "Indique le niveau (ou le nombre d'exemplaires) de chaque bâtiment que tu possèdes. Seuls les bâtiments débloqués par ta Fontaine Vitale sont affichés.",
        bonusTitle: "Bonus actifs de l'île", refTitle: 'Niveaux de la Fontaine et des Réservoirs', refTree: 'Fontaine Vitale', refCamp: 'Réservoir',
        refLead: 'Coûts, bonus et production, niveau par niveau.',
        perHour: '/ h', lvl: 'Niv.', copies: 'ex.', none: '—',
        goalLine: 'Objectif : Fontaine Vitale niv. {a} → {b}', goalProsp: 'prospérité {have} / {need}', goalSeeds: "{n} d'Essence d'Eau",
        goalMax: 'Fontaine Vitale au niveau maximal.', goalUnknown: 'Fontaine Vitale niv. {n} : exigences pas encore relevées.',
        actTree: 'Monter la Fontaine Vitale au niveau {n}', actCampPlace: 'Construire le Réservoir {c}', actCamp: 'Monter le Réservoir {c} au niveau {n}',
        actPlace: 'Poser : {name}', actCopy: 'Poser : {name} ({n}/{max})', actLevel: 'Monter {name} au niveau {n}',
        whyTree: 'Ta prospérité atteint les {need} demandés : la Fontaine passe avant tout le reste.',
        whyCamp: 'Les Réservoirs passent avant les autres bâtiments, et ta Fontaine (niv. {t}) le permet.', whyCampBuild: 'Construire un nouveau Réservoir passe en premier : ta Fontaine (niv. {t}) le débloque.',
        campGain: 'Vitesse de collecte {a} → {b}, cargaison {c} → {d}.',
        campInfo: 'Réservoir {c} : vitesse {s} · cargaison {l}',
        whyForTree: "Il manque encore {d} de prospérité pour la Fontaine niv. {n} : c'est le moyen le moins cher de l'obtenir ({r} d'Essence d'Eau par point).",
        whyBest: "Meilleur rendement disponible : {r} d'Essence d'Eau par point de prospérité.",
        useStock: 'Utilise {n} {c} de ton stock.', buyOne: 'Achète 1 exemplaire.',
        buyCopies: 'Achète {n} exemplaires.', copyOne: 'exemplaire', copyMany: 'exemplaires', reward: 'Récompense : {r}.', unlocks: 'Débloque : {l}.', unlockRarity: 'bâtiments {r}s',
        validate: 'Fait en jeu : mettre mon île à jour', validated: '{a} : validé', validatedSeeds: " · −{n} d'Essence d'Eau", validatedMore: ' · {n} étape(s) précédente(s) du même bâtiment aussi',
        seeds: "d'Essence d'Eau", prospGain: '+{n} prospérité', ready: 'Faisable maintenant', readyIn: 'Dans environ {t}', missing: "il manque {n} d'Essence d'Eau",
        stopUnreachable: "La Fontaine niv. {n} exige {need} de prospérité et les bâtiments que tu peux acheter ne suffisent pas. Coche plus bas les bâtiments déjà débloqués en jeu.",
        stopNothing: 'Plus rien à suggérer avec les données relevées pour le moment.',
        stopData: "À partir de la Fontaine niv. {n}, les exigences ne sont pas encore relevées : les suggestions suivent alors le meilleur rendement en prospérité.",
        rarity: { common: 'Commun', uncommon: 'Peu commun', rare: 'Rare', epic: 'Épique', mythic: 'Mythique' },
        groupUnknown: 'Déblocage non relevé', groupUnknownHint: "Coche « Débloqué chez moi » si tu peux l'acheter en jeu, pour qu'il entre dans les suggestions.",
        groupEvent: "Bâtiments d'événement", groupLocked: 'Pas encore débloqués ({n})', unlockAt: 'Fontaine niv. {n}', unlockedTick: 'Débloqué chez moi',
        prospLine: 'Prospérité {n}', maxLine: 'max {v}', nextLine: "Suivant : {n} d'Essence d'Eau", nextCopies: "Suivant : {n} d'Essence d'Eau ({c} ex.)", maxed: 'Maximum',
        looksChange: 'Son apparence change aux niveaux {list}.', shopAt: 'En boutique à partir de la Fontaine niv. {n}.',
        paidLine: 'Bâtiment payant : au moins {n} $ pour le niv. 1.', paidAny: "Bâtiment payant : le niv. 1 s'achète en argent réel.",
        minus: 'Retirer un niveau à {name}', stockLabel: 'En stock', stockMinus: 'Un exemplaire de {name} en moins dans le stock', stockPlus: 'Un exemplaire de {name} en plus dans le stock', plus: 'Ajouter un niveau à {name}',
        emptyBonus: 'Aucun bonus actif pour le moment.', fromTree: 'Fontaine Vitale', fromBldg: 'bâtiments',
        refLevel: 'Niveau', refBonus: 'Bonus débloqué', refProd: "Essence d'Eau / h", refNeedProsp: 'Prospérité pour monter',
        refNeedSeeds: "Essence d'Eau pour monter", refReward: "Récompense d'amélioration", refWorkers: 'Travailleurs', refSpeed: 'Vitesse de Collecte',
        refLoad: 'Cargaison', refNeedTree: 'Fontaine requise', treeLvl: 'Fontaine niv. {n}',
        refNotes: "Le Réservoir 2 se débloque au niveau 5 de la Fontaine Vitale et se construit pour 3 000 d'Essence d'Eau. Une fois posé, il a les mêmes coûts et bonus d'amélioration que le Réservoir 1.",
        itemsTitle: "Objets de l'île", itemComp: 'Composants Mythiques', itemWonder: 'Plans de Merveille',
        itemsHint: "À partir de la Fontaine niv. {t}, {k} composants ({s} d'Essence d'Eau l'unité) donnent un exemplaire d'un bâtiment Mythique, ceux d'événement compris. Les Plans de Merveille viennent d'événements et font monter le bâtiment {b} ({p} × son niveau actuel).",
        useItem: 'Utilise {n} × {item} de ton stock.', buyItem: "Achète {n} × {item} ({s} d'Essence d'Eau).", buyBlueprint: 'Achète le {item}.',
        nextItem: 'Suivant : {n} × {item}', nextBlueprint: "Plan : {n} d'Essence d'Eau", nextComp: 'Suivant : {c} ex. = {k} composants', nextCompOne: 'Suivant : {k} composants',
        stockBlueprint: 'Plans',
        hours: 'h', days: 'j', minutes: 'min', now: 'maintenant',
        dataError: "Les données de l'île n'ont pas pu être chargées.",
        amountInvalid: 'Montant non reconnu : "{v}". Écris par exemple 12000, 250k ou 1,5M. Valeur précédente remise.',
        nextStep: 'Prochaine étape : {a}', currentLevel: 'actuel', bldgCount: 'bâtiments'
    }
};

const IS_RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'mythic'];
// Objets de l'île (`items` de data/island.json) -> champ de saisie de la colonne « Mon Île ».
const IS_ITEM_INPUTS = { mythicComponent: 'itemMythicComponent', wonderBlueprint: 'itemWonderBlueprint' };

// storage-keys.js peut venir d'un cache d'avant cet outil (MAP §9 09a) : repli sur le nom en dur.
const IS_KEY = (window.STORAGE_KEYS && STORAGE_KEYS.islandPlanner) || 'island_planner_v1';
const IS_FOLDS_KEY = (window.STORAGE_KEYS && STORAGE_KEYS.islandFolds) || 'island_folds';

let isData = null;
let isState = null;
let isFocusKey = null;
// Plan affiché : le bouton ✓ d'une suggestion valide l'étape correspondante.
let isLastSteps = [];
// Fontaine monté à la main depuis le menu : { from, to } des paliers dont les bâtiments
// offerts sont proposés au stock, ou null.
let isGiftOffer = null;

const isLang = () => (window.GlobalLang ? GlobalLang.get() : 'EN');
const isTx = () => IS_I18N[isLang()] || IS_I18N.EN;
const isEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isL = (o) => (o ? o[isLang()] || o.EN : '');
const isFill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
const isBldg = (id) => isData.buildings.find((b) => b.id === id);

// Visuel d'un bâtiment à un niveau donné : certains changent d'apparence en
// montant (`images`, par palier `from`) ; au niveau 0, le premier visuel.
function isImageFor(b, level) {
    if (Array.isArray(b.images) && b.images.length) {
        let pick = b.images[0];
        for (const v of b.images) if (level >= v.from) pick = v;
        return pick.image;
    }
    return b.image || null;
}

// ============ FORMATS ============
function isGroup(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function isNum(v) {
    const n = Math.round(Number(v) * 100) / 100;
    return Number.isInteger(n) ? isGroup(n) : n.toLocaleString(isLang() === 'FR' ? 'fr-FR' : 'en-US');
}

function isStatValue(key, v) {
    const st = isData.stats[key] || {};
    return '+' + isNum(v) + (st.unit ? ' ' + st.unit : '');
}

function isDuration(hours) {
    const tx = isTx();
    const min = Math.ceil((Number(hours) || 0) * 60);
    if (min <= 0) return tx.now;
    const d = Math.floor(min / 1440), h = Math.floor(min % 1440 / 60), m = min % 60;
    if (d) return `${d} ${tx.days} ${h} ${tx.hours}`;
    if (h) return `${h} ${tx.hours}${m ? ' ' + m + ' ' + tx.minutes : ''}`;
    return `${m} ${tx.minutes}`;
}

// « 1,5M », « 250k », « 12 000 » -> nombre entier. null si ce n'est pas un montant
// (« 1.5 », « -500 », « 1e6 ») : retirer les signes en ferait un autre chiffre, plausible et faux.
function isParseAmount(value) {
    // Séparateurs de milliers d'abord (« 1,200k » = 1 200 000), comme ptParseAmount de pets-plan.js.
    const s = String(value == null ? '' : value).toLowerCase().replace(/\s/g, '').replace(/[.,](?=\d{3}(?:\D|$))/g, '');
    if (!s) return 0;
    const m = s.match(/^(\d+(?:[.,]\d{1,2})?)([kmb])$/);
    if (m) return Math.round(parseFloat(m[1].replace(',', '.')) * { k: 1e3, m: 1e6, b: 1e9 }[m[2]]);
    return /^\d+$/.test(s) ? Number(s) : null;
}

// Montant en vigueur d'un champ, d'après l'état.
function isSavedAmount(id) {
    if (id === 'seedsStock') return isState.seeds;
    if (id === 'prospInGame') return isState.prosperityInGame;
    return isState.items[Object.keys(IS_ITEM_INPUTS).find((k) => IS_ITEM_INPUTS[k] === id)] || 0;
}

// Saisie illisible : le dernier montant valable reste en vigueur et le champ se signale,
// plutôt que de recalculer le plan sur un chiffre inventé.
function isReadAmount(id) {
    const el = document.getElementById(id);
    const n = isParseAmount(el.value);
    if (n === null) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    return n === null ? isSavedAmount(id) : n;
}

function isFormatAmount(el) {
    if (!isState) return;
    const n = isParseAmount(el.value);
    if (n === null && typeof showAppToast === 'function') showAppToast(isFill(isTx().amountInvalid, { v: el.value.slice(0, 24) }), false);
    const kept = n === null ? isSavedAmount(el.id) : n;
    el.value = kept ? kept.toLocaleString('fr-FR') : '0';
    isTrigger();
}

// ============ DONNÉES ============
async function isLoadData() {
    try {
        const res = await fetch('data/island.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('island.json : HTTP ' + res.status);
        isData = await res.json();
        isState = IslandPlanner.normalizeState(isData, {});
        return true;
    } catch (e) {
        console.error("Chargement de l'île", e);
        if (window.ktWarnDataFailure) window.ktWarnDataFailure();
        const out = document.getElementById('isSuggest');
        if (out) out.innerHTML = `<div class="is-empty is-warn">${isEsc(isTx().dataError)}</div>`;
        // Sans données, ces champs ne feraient rien : on ne les laisse pas croire le contraire.
        document.querySelectorAll('.sidebar select, .sidebar input').forEach((el) => { el.disabled = true; });
        return false;
    }
}

// ============ ÉTAT ============
function isReadSidebar() {
    const treeBefore = isState.tree;
    isState.tree = Number(document.getElementById('treeLevel').value) || 1;
    isState.seeds = isReadAmount('seedsStock');
    isState.prosperityInGame = isReadAmount('prospInGame');
    isState.camps['lumber-camp-1'] = Number(document.getElementById('camp1Level').value) || 1;
    isState.camps['lumber-camp-2'] = Number(document.getElementById('camp2Level').value) || 0;
    for (const [k, id] of Object.entries(IS_ITEM_INPUTS)) isState.items[k] = isReadAmount(id);
    isState = IslandPlanner.normalizeState(isData, isState);
    isNoteTreeChange(treeBefore, isState.tree);
}

// Fontaine montée à la main : les bâtiments qu'elle offre
// ne vont PAS d'office en stock, car un joueur qui saisit son niveau
// actuel les a sans doute déjà posés. On les propose ; l'encart tombe quand le joueur les
// ajoute, les ignore ou redescend la Fontaine. Plusieurs montées d'affilée se cumulent.
function isNoteTreeChange(before, after) {
    if (after > before) isGiftOffer = { from: isGiftOffer ? isGiftOffer.from : before, to: after };
    else if (after < before) isGiftOffer = null;
}

// Cadeaux encore à proposer, bornés à la place qui reste en stock (IslandPlanner.stockMax).
function isGiftList() {
    if (!isGiftOffer) return [];
    return Object.entries(IslandPlanner.treeGifts(isData, isGiftOffer.from, isGiftOffer.to)).map(([id, n]) => {
        const b = isBldg(id);
        if (!b) return null;
        const room = IslandPlanner.stockMax(b, isState.owned[id] || 0) - (isState.stock[id] || 0);
        return { b, n: Math.min(n, room) };
    }).filter((g) => g && g.n > 0);
}

// Récompense d'un passage de la Fontaine : les bâtiments offerts (`freeCopies`) portent le nom
// du catalogue, les autres récompenses leur libellé (`reward`). '' si le palier n'en donne pas.
function isRewardLabel(up) {
    if (!up) return '';
    const gifts = Object.entries(up.freeCopies || {}).map(([id, n]) => `${n} ${isL((isBldg(id) || {}).name)}`);
    return gifts.length ? gifts.join(', ') : isL(up.reward);
}

const isGiftNames = (list) => list.map((g) => `${g.n} ${isL(g.b.name)}`).join(', ');

function isAddTreeGifts() {
    const list = isGiftList();
    for (const g of list) isState.stock[g.b.id] = (isState.stock[g.b.id] || 0) + g.n;
    isGiftOffer = null;
    isCloseTreeGift();
    if (list.length && typeof showAppToast === 'function') showAppToast(isFill(isTx().giftAdded, { list: isGiftNames(list) }));
}

function isDismissTreeGifts() {
    isGiftOffer = null;
    isCloseTreeGift();
}

// L'encart disparaît sous le bouton pressé : le focus revient au menu de la Fontaine.
function isCloseTreeGift() {
    isTrigger();
    const tree = document.getElementById('treeLevel');
    if (tree) tree.focus();
}

function isSave() {
    const data = {
        v: 1,
        tree: isState.tree,
        seeds: isState.seeds,
        prosperityInGame: isState.prosperityInGame,
        camps: isState.camps,
        owned: Object.fromEntries(Object.entries(isState.owned).filter(([, n]) => n > 0)),
        stock: Object.fromEntries(Object.entries(isState.stock).filter(([, n]) => n > 0)),
        items: Object.fromEntries(Object.entries(isState.items).filter(([, n]) => n > 0)),
        unlocked: Object.fromEntries(Object.entries(isState.unlocked).filter(([, u]) => u))
    };
    // Stockage plein ou interdit : ktSafeSet prévient le joueur (storage-keys.js).
    const json = JSON.stringify(data);
    if (window.ktSafeSet) window.ktSafeSet(IS_KEY, json);
    else localStorage.setItem(IS_KEY, json);   // lèverait : isStep('save') prévient alors le joueur
}

// Ce que la relecture d'une sauvegarde a perdu ou corrigé : bâtiment disparu des données,
// valeur illisible ou hors bornes. Seuls les champs présents comptent, isSave omet les zéros.
function isStateLosses(raw, state) {
    const losses = [];
    if (raw.v !== undefined && raw.v !== 1) losses.push('v');
    for (const k of ['tree', 'seeds', 'prosperityInGame']) {
        if (raw[k] !== undefined && Number(raw[k]) !== state[k]) losses.push(k);
    }
    for (const k of ['camps', 'owned', 'stock', 'items', 'unlocked']) {
        const saved = raw[k];
        if (saved === undefined) continue;
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) { losses.push(k); continue; }
        for (const [id, v] of Object.entries(saved)) {
            const same = k === 'unlocked' ? !!v === !!state[k][id] : Number(v) === (state[k][id] || 0);
            if (!same) losses.push(`${k}.${id}`);
        }
    }
    return losses;
}

// La page réécrit la sauvegarde au premier rendu : l'original part de côté AVANT
// (`…__corrompu`, espace du profil), comme safeParse pour un JSON illisible.
function isKeepSaved() {
    let raw = null;
    try { raw = localStorage.getItem(IS_KEY); } catch (e) { /* stockage interdit : rien à garder */ }
    if (raw && window.ktKeepCorrupt) window.ktKeepCorrupt(IS_KEY, raw);
}

function isLoad() {
    const data = safeParse(IS_KEY, null);   // JSON illisible : safeParse a déjà gardé l'original et prévenu
    if (data === null) return;
    try {
        if (typeof data !== 'object' || Array.isArray(data)) throw new TypeError('objet attendu, reçu ' + (Array.isArray(data) ? 'un tableau' : typeof data));
        isState = IslandPlanner.normalizeState(isData, data);
        const losses = isStateLosses(data, isState);
        if (losses.length) {
            // Une partie seulement : le bandeau standard dirait à tort que la page repart de zéro.
            console.warn("Sauvegarde de l'île reprise en partie, écarts :", losses.join(', '));
            isKeepSaved();
            if (window.ktTopBanner) window.ktTopBanner('kt-island-partial',
                "Une partie de votre île enregistrée n'a pas pu être reprise (bâtiment renommé ou valeur hors limites), le reste est conservé. "
                + "La version d'origine a été mise de côté, elle reste récupérable tant que vous ne videz pas le stockage du navigateur.",
                'Part of your saved island could not be restored (renamed building or out-of-range value), the rest is kept. '
                + 'The original version has been set aside, and stays recoverable unless you clear your browser storage.',
                false);
        }
    } catch (e) {
        // Sauvegarde lisible mais inutilisable : la page repart de zéro.
        console.error("Restauration de l'île", e);
        isKeepSaved();
        if (window.ktWarnCorrupt) window.ktWarnCorrupt();
    }
}

// Options et valeurs des champs : au démarrage et au changement de langue seulement.
// Réécrire un champ pendant la frappe renverrait le curseur en fin de saisie.
function isInitSidebar() {
    const tx = isTx();
    const opts = (from, to, label) => Array.from({ length: to - from + 1 }, (_, i) => {
        const n = from + i;
        return `<option value="${n}">${label ? label(n) : n}</option>`;
    }).join('');
    const tree = document.getElementById('treeLevel');
    tree.innerHTML = opts(1, isData.tree.maxLevel);
    tree.value = String(isState.tree);
    const c1 = document.getElementById('camp1Level');
    c1.innerHTML = opts(1, isData.lumberCamp.maxLevel);
    c1.value = String(isState.camps['lumber-camp-1']);
    const c2 = document.getElementById('camp2Level');
    c2.innerHTML = opts(0, isData.lumberCamp.maxLevel, (n) => (n === 0 ? tx.notBuilt : n));
    c2.value = String(isState.camps['lumber-camp-2']);
    document.getElementById('seedsStock').value = isState.seeds.toLocaleString('fr-FR');
    document.getElementById('prospInGame').value = isState.prosperityInGame.toLocaleString('fr-FR');
    for (const [k, id] of Object.entries(IS_ITEM_INPUTS)) document.getElementById(id).value = (isState.items[k] || 0).toLocaleString('fr-FR');
}

// Le Réservoir 2 reste grisé tant que la Fontaine ne l'a pas débloqué.
function isSyncCamp2() {
    const c2 = document.getElementById('camp2Level');
    const camp2 = isData.lumberCamp.camps.find((c) => c.id === 'lumber-camp-2');
    const locked = isState.tree < camp2.unlockTree && isState.camps['lumber-camp-2'] === 0;
    c2.disabled = locked;
    // Texte visible et non `title` : un champ désactivé ne prend pas le focus, son `title` n'existe qu'à la souris.
    const why = document.getElementById('isCamp2Why');
    why.textContent = locked ? isFill(isTx().locked, { n: camp2.unlockTree }) : '';
    why.hidden = !locked;
    if (locked) c2.setAttribute('aria-describedby', 'isCamp2Why');
    else c2.removeAttribute('aria-describedby');
}

// Valeur d'un compteur pour les lecteurs d'écran : les cartes sont reconstruites à chaque
// rendu, une région live posée dedans serait recréée avec son contenu et jamais annoncée.
function isAnnounce(text) {
    const el = document.getElementById('isAnnounce');
    if (el) el.textContent = text;
}

// Boutons − / + des cartes. Le rendu reconstruit la grille : on rend le focus au
// bouton pressé pour que la navigation au clavier ne reparte pas du haut de page.
function isBump(id, delta) {
    const b = isBldg(id);
    const next = Math.max(0, Math.min(IslandPlanner.ownedMax(b), (isState.owned[id] || 0) + delta));
    isState.owned[id] = next;
    // Le stock utile diminue quand le niveau monte : on le borne à nouveau.
    isState.stock[id] = Math.min(isState.stock[id] || 0, IslandPlanner.stockMax(b, next));
    isFocusKey = `${id}:${delta > 0 ? 'plus' : 'minus'}`;
    isTrigger();
    const tx = isTx();
    isAnnounce(`${isL(b.name)} : ${IslandPlanner.isStackable(b) ? `${next} / ${b.maxCount}` : `${tx.lvl} ${next}`}`);
}

// Exemplaires achetés ou reçus mais pas encore posés : consommés avant tout achat.
function isBumpStock(id, delta) {
    const b = isBldg(id);
    const max = IslandPlanner.stockMax(b, isState.owned[id] || 0);
    isState.stock[id] = Math.max(0, Math.min(max, (isState.stock[id] || 0) + delta));
    isFocusKey = `${id}:${delta > 0 ? 'splus' : 'sminus'}`;
    isTrigger();
    isAnnounce(`${isL(b.name)} : ${isTx().stockLabel} ${isState.stock[id]}`);
}

function isSetUnlocked(id, checked) {
    isState.unlocked[id] = !!checked;
    isFocusKey = `${id}:unlock`;
    isTrigger();
}

// ============ RENDU ============
// Résultats annoncés (aria-live) : un élément n'est réécrit que si son contenu change.
// Réécrit à l'identique à chaque rendu, il serait relu à chaque frappe dans un autre champ.
function isPut(el, html) {
    if (!el || el.isShown === html) return;
    el.isShown = html;
    el.innerHTML = html;
}

function isRenderSidebarInfo() {
    const tx = isTx();
    const rate = IslandPlanner.seedsPerHour(isData, isState.tree);
    // Libellés rendus ici et non par data-i18n : applyI18n les réécrit à chaque rendu, ce qui
    // ferait relire leur région live.
    isPut(document.getElementById('isRateLabel'), isEsc(tx.production));
    isPut(document.getElementById('isRate'), `${isGroup(rate)} ${tx.perHour}`);
    document.getElementById('isCapHint').textContent = isFill(tx.capHint, { n: isGroup(rate * isData.tree.storageHours) });
    isPut(document.getElementById('isCampInfo'), isData.lumberCamp.camps.map((c) => {
        const lv = IslandPlanner.campLevel(isData, isState.camps[c.id]);
        return lv && lv.gatherSpeed != null ? `<div>${isFill(tx.campInfo, { c: c.number, s: lv.gatherSpeed, l: isGroup(lv.load) })}</div>` : '';
    }).join(''));
    const computed = IslandPlanner.buildingsProsperity(isData, isState.owned);
    isPut(document.getElementById('isProspComputedLabel'), isEsc(tx.prospComputed));
    isPut(document.getElementById('isProspComputed'), isGroup(computed));
    const hint = document.getElementById('isProspHint');
    const gap = isState.prosperityInGame > 0 ? isState.prosperityInGame - computed : 0;
    isPut(hint, isEsc(gap ? isFill(tx.prospGap, { n: (gap > 0 ? '+' : '') + isGroup(gap) }) : tx.prospHint));
    hint.classList.toggle('is-warn', !!gap);
    const comp = isData.items.mythicComponent;
    const sunset = isData.buildings.find((b) => b.levelItem);
    document.getElementById('isItemsHint').textContent = isFill(tx.itemsHint, {
        t: comp.unlockTree, k: comp.perCopy, s: isGroup(comp.seeds), p: sunset ? sunset.levelItem.perLevel : '', b: sunset ? isL(sunset.name) : ''
    });
}

// Encart « bâtiments offerts par la Fontaine » sous le menu de niveau (voir isNoteTreeChange).
// Le conteneur est une région live toujours présente : l'encart est annoncé à son arrivée.
function isRenderTreeGift() {
    const tx = isTx();
    const list = isGiftList();
    const box = document.getElementById('isTreeGift');
    if (!list.length) { isPut(box, ''); return; }
    isPut(box, `<div class="is-gift">
        <p>${isEsc(isFill(tx.giftText, { n: isGiftOffer.to, list: isGiftNames(list) }))}</p>
        <div class="is-gift-actions">
            <button type="button" class="is-gift-add" onclick="isAddTreeGifts()">${isEsc(tx.giftAdd)}</button>
            <button type="button" onclick="isDismissTreeGifts()">${isEsc(tx.giftSkip)}</button>
        </div>
    </div>`);
}

function isRenderGoalLine() {
    const tx = isTx();
    const g = IslandPlanner.treeGoal(isData, isState);
    const el = document.getElementById('isGoalLine');
    if (!g.next) { isPut(el, `<span class="is-ok">${isEsc(tx.goalMax)}</span>`); return; }
    if (!g.known) { isPut(el, isEsc(isFill(tx.goalUnknown, { n: g.next }))); return; }
    const pct = Math.min(100, Math.round(g.prosperityHave / g.prosperityNeed * 100));
    isPut(el, `
        <div class="is-goal-text"><b>${isFill(tx.goalLine, { a: g.level, b: g.next })}</b>
            <span>${isFill(tx.goalProsp, { have: isGroup(g.prosperityHave), need: isGroup(g.prosperityNeed) })} · ${isFill(tx.goalSeeds, { n: isGroup(g.seedsNeed) })}</span></div>
        <div class="is-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${g.prosperityNeed}" aria-valuenow="${Math.min(g.prosperityHave, g.prosperityNeed)}" aria-valuetext="${isGroup(g.prosperityHave)} / ${isGroup(g.prosperityNeed)}" aria-label="${isEsc(isFill(tx.goalLine, { a: g.level, b: g.next }))}"><span style="width:${pct}%"></span></div>`);
}

function isStepAction(s) {
    const tx = isTx();
    if (s.kind === 'tree') return isFill(tx.actTree, { n: s.to });
    if (s.kind === 'camp') {
        const c = isData.lumberCamp.camps.find((x) => x.id === s.id).number;
        return s.from === 0 ? isFill(tx.actCampPlace, { c }) : isFill(tx.actCamp, { c, n: s.to });
    }
    const b = isBldg(s.id);
    const name = isL(b.name);
    if (IslandPlanner.isStackable(b)) return isFill(tx.actCopy, { name, n: s.to, max: b.maxCount });
    return s.from === 0 ? isFill(tx.actPlace, { name }) : isFill(tx.actLevel, { name, n: s.to });
}

// Ce que débloque la Fontaine en atteignant `level` (raretés entières, Réservoirs, bâtiments), ou ''.
function isUnlocksText(level) {
    const tx = isTx();
    const u = IslandPlanner.treeUnlocks(isData, level);
    const names = [
        ...u.rarities.map((r) => isFill(tx.unlockRarity, { r: isL(isData.rarities[r]) })),
        ...u.camps.map((id) => tx['camp' + isData.lumberCamp.camps.find((c) => c.id === id).number]),
        ...u.buildings.map((id) => isL(isBldg(id).name)),
        ...u.items.map((k) => isL(isData.items[k].name))
    ];
    return names.length ? isFill(tx.unlocks, { l: names.join(', ') }) : '';
}

// Pourquoi cette action : la phrase reprend la règle qui l'a choisie.
function isStepReason(s) {
    const tx = isTx();
    const bits = [];
    const up = (lvl) => (isData.tree.levels[lvl - 1] || {}).upgrade;
    if (s.kind === 'tree') {
        bits.push(isFill(tx.whyTree, { need: isGroup(up(s.from).prosperity) }));
        const rw = isRewardLabel(up(s.from));
        if (rw) bits.push(isFill(tx.reward, { r: rw }));
        const unlocks = isUnlocksText(s.to);
        if (unlocks) bits.push(unlocks);
    } else if (s.kind === 'camp') {
        bits.push(isFill(s.from === 0 ? tx.whyCampBuild : tx.whyCamp, { t: s.tree }));
        const a = IslandPlanner.campLevel(isData, s.from), b = IslandPlanner.campLevel(isData, s.to);
        if (a && b && a.gatherSpeed != null && b.gatherSpeed != null) {
            bits.push(isFill(tx.campGain, { a: a.gatherSpeed, b: b.gatherSpeed, c: isGroup(a.load), d: isGroup(b.load) }));
        }
    } else {
        const ratio = isNum(s.cost / s.gain);
        if (s.kind === 'forTree') {
            const need = up(s.tree).prosperity;
            bits.push(isFill(tx.whyForTree, { d: isGroup(need - (s.prosperity - s.gain)), n: s.tree + 1, r: ratio }));
        } else {
            bits.push(isFill(tx.whyBest, { r: ratio }));
        }
        // Exemplaires consommés : d'abord le stock (achats non posés, récompenses de la Fontaine),
        // puis les objets de l'île (plans de Merveille, composants), enfin la boutique.
        const b = isBldg(s.id);
        const copies = IslandPlanner.copiesFor(b, s.from);
        const used = s.freeUsed || 0;
        const itemName = (k) => isL(isData.items[k].name);
        if (used && b.blueprint) bits.push(isFill(tx.useItem, { n: used, item: isL(b.blueprint.name) }));
        else if (used) bits.push(isFill(tx.useStock, { n: used, c: used === 1 ? tx.copyOne : tx.copyMany }));
        for (const [k, n] of Object.entries(s.use || {})) bits.push(isFill(tx.useItem, { n: isGroup(n), item: itemName(k) }));
        for (const [k, n] of Object.entries(s.buy || {})) bits.push(isFill(tx.buyItem, { n: isGroup(n), item: itemName(k), s: isGroup(n * isData.items[k].seeds) }));
        const buy = s.use || s.buy ? 0 : copies - used;
        if (buy > 0 && b.blueprint) bits.push(isFill(tx.buyBlueprint, { item: isL(b.blueprint.name) }));
        else if (buy > 0 && (used || copies > 1)) bits.push(buy === 1 ? tx.buyOne : isFill(tx.buyCopies, { n: buy }));
    }
    return bits.join(' ');
}

// Vignette d'une étape : image du bâtiment ou du Réservoir quand elle existe.
function isStepThumb(s) {
    const img = s.kind === 'camp' ? isData.lumberCamp.image : s.kind === 'tree' ? null : isImageFor(isBldg(s.id), s.to);
    const cut = s.kind !== 'camp' && s.kind !== 'tree' && isBldg(s.id)?.cutout;
    return img ? `<img class="is-sug-img${cut ? ' is-cut' : ''}" src="img/island/${img}.webp" width="64" height="47" alt="" loading="lazy" onerror="this.remove()">` : '';
}

function isRenderSuggestions() {
    const tx = isTx();
    const r = IslandPlanner.plan(isData, isState, { maxSteps: IS_MAX_SUGGESTIONS });
    isLastSteps = r.steps;
    let html = '';
    if (r.steps.length) {
        html += '<ol class="is-suggest">';
        let seedsBefore = isState.seeds;
        r.steps.forEach((s, i) => {
            // Essence disponible avant l'étape : stock restant de l'étape précédente.
            const missing = Math.max(0, s.cost - seedsBefore);
            seedsBefore = s.seedsLeft;
            const status = s.wait > 0 || s.at > 0
                ? `<span class="is-when">${isFill(tx.readyIn, { t: isDuration(s.at) })}${missing ? ` · ${isFill(tx.missing, { n: isGroup(missing) })}` : ''}</span>`
                : `<span class="is-when is-ok">${tx.ready}</span>`;
            const b = s.kind === 'tree' || s.kind === 'camp' ? null : isBldg(s.id);
            html += `<li class="is-sug is-sug-${s.kind}${b ? ` is-sug-rar is-r-${b.rarity}` : ''}${i === 0 ? ' is-sug-first' : ''}">
                <span class="is-sug-n" aria-hidden="true">${i + 1}</span>
                <div class="is-sug-body">
                    <div class="is-sug-action">${isEsc(isStepAction(s))}</div>
                    <div class="is-sug-why">${isEsc(isStepReason(s))}</div>
                    <div class="is-sug-meta"><span>${isGroup(s.cost)} ${tx.seeds}</span>${s.gain ? `<span class="is-ok">${isFill(tx.prospGain, { n: isGroup(s.gain) })}</span>` : ''}${status}</div>
                </div>
                ${isStepThumb(s)}
                <button type="button" class="is-sug-validate" data-focus="sug:${i}" onclick="isValidateStep(${i}, event)" title="${isEsc(tx.validate)}" aria-label="${isEsc(isStepAction(s) + ' : ' + tx.validate)}">✓</button>
            </li>`;
        });
        html += '</ol>';
    }
    let stopText = '';
    if (r.stop && r.stop.reason === 'prosperityUnreachable') {
        stopText = isFill(tx.stopUnreachable, { n: r.stop.level, need: isGroup(r.stop.need) });
        html += `<div class="is-empty is-warn">${stopText}</div>`;
    } else if (r.stop && r.stop.reason === 'nothingLeft') {
        stopText = tx.stopNothing;
        html += `<div class="is-empty">${stopText}</div>`;
    }
    if (r.treeDataEnds) html += `<p class="is-note">${isFill(tx.stopData, { n: r.treeDataEnds + 1 })}</p>`;
    const box = document.getElementById('isSuggest');
    isPut(box, html);
    // Annonce limitée à la 1re étape : une région live sur toute la liste la ferait relire à chaque clic.
    isPut(document.getElementById('isFirstStep'), isEsc(r.steps.length ? isFill(tx.nextStep, { a: isStepAction(r.steps[0]) }) : stopText));
    // Après une validation au clavier, le focus revient sur le ✓ de la nouvelle 1re suggestion.
    if (isFocusKey && isFocusKey.startsWith('sug:')) {
        const target = box.querySelector(`[data-focus="${isFocusKey}"]`) || box.querySelector('.is-sug-validate');
        if (target) target.focus();
        isFocusKey = null;
    }
}

// Bouton ✓ d'une suggestion : l'action est faite en jeu. Niveaux, essence, stock et
// prospérité saisie avancent comme le plan l'a simulé (IslandPlanner.applyStep).
// Même filet que isTrigger : une étape qui lève ne laisse ni un clic muet, ni un état changé
// sans sauvegarde (isRender, qui enregistre, est atteint dès que l'état a avancé).
function isValidateStep(index, ev) {
    // Double clic : le second tomberait sur le ✓ de l'étape suivante, placé au même endroit.
    if (ev && ev.detail > 1) return;
    const step = isLastSteps[index];
    if (!step) return;
    let r = null;
    let ok = isStep('validate', () => { r = IslandPlanner.applyStep(isData, isState, isLastSteps, index); });
    if (ok) {
        if (!r.applied.length) return;
        isState = r.state;
        // Clavier seulement (`detail` 0) : à la souris, le focus ferait paraître le ✓ suivant déjà coché.
        if (ev && ev.detail === 0) isFocusKey = 'sug:0';
        ok = isStep('sidebar', isInitSidebar) && ok;
        ok = isRender() && ok;
        ok = isStep('toast', () => {
            const tx = isTx();
            let msg = isFill(tx.validated, { a: isStepAction(step) });
            if (r.seedsSpent) msg += isFill(tx.validatedSeeds, { n: isGroup(r.seedsSpent) });
            if (r.applied.length > 1) msg += isFill(tx.validatedMore, { n: r.applied.length - 1 });
            if (typeof showAppToast === 'function') showAppToast(msg);
        }) && ok;
    }
    if (!ok && window.ktWarnStale) window.ktWarnStale();
}

function isCard(b, opts) {
    const tx = isTx();
    const o = opts || {};
    const owned = isState.owned[b.id] || 0;
    const stack = IslandPlanner.isStackable(b);
    const max = IslandPlanner.ownedMax(b);
    const name = isL(b.name);
    const pic = isImageFor(b, owned);
    // Visuel HD détouré (`cutout`) : vitrine sur halo de rareté en tête de carte.
    const hero = pic && b.cutout
        ? `<div class="is-hero"><img src="img/island/${pic}.webp" alt="" loading="lazy" onerror="this.parentElement.remove()"></div>`
        : '';
    const img = hero ? '' : pic
        ? `<img class="is-thumb" src="img/island/${pic}.webp" width="56" height="41" alt="" loading="lazy" onerror="this.remove()">`
        : `<span class="is-thumb is-thumb-empty" aria-hidden="true">${isEsc(name.charAt(0))}</span>`;
    const value = stack ? `${owned} / ${max} <small>${tx.copies}</small>` : `${tx.lvl} ${owned} <small>/ ${max}</small>`;
    const lines = [];
    if (b.prosperity) lines.push(`<span>${isFill(tx.prospLine, { n: `<b>${isGroup(b.prosperity * owned)}</b>` })}</span>`);
    for (const e of IslandPlanner.effectsOf(b)) {
        const cur = IslandPlanner.effectValue(b, owned, e);
        lines.push(`<span>${isEsc(isL(isData.stats[e.stat]))} <b class="${cur ? 'is-ok' : ''}">${isStatValue(e.stat, cur)}</b> <small>(${isFill(tx.maxLine, { v: isStatValue(e.stat, e.max) })})</small></span>`);
    }
    const stock = isState.stock[b.id] || 0;
    // Bâtiment offert avant d'arriver en boutique (cadeau d'Oasis Prelude) : saisissable, pas encore achetable.
    const inShop = b.unlockTree == null || isState.tree >= b.unlockTree;
    const copies = IslandPlanner.copiesFor(b, owned);
    const comp = IslandPlanner.componentsFor(isData, b, isState.tree);
    if (owned >= max && (IslandPlanner.isPurchasable(b) || comp)) {
        lines.push(`<span class="is-ok">${tx.maxed}</span>`);
    } else if (IslandPlanner.isPurchasable(b) && !inShop) {
        lines.push(`<span>${isFill(tx.shopAt, { n: b.unlockTree })}</span>`);
    } else if (b.levelItem && owned > 0) {
        // Niveau de Merveille : payé en plans, pas en essence.
        lines.push(`<span>${isFill(tx.nextItem, { n: isGroup(Math.max(0, copies - stock)), item: isEsc(isL(isData.items[b.levelItem.item].name)) })}</span>`);
    } else if (b.blueprint) {
        lines.push(`<span>${isFill(tx.nextBlueprint, { n: isGroup(IslandPlanner.nextCost(b, owned, stock)) })}</span>`);
    } else if (IslandPlanner.isPurchasable(b)) {
        const cost = IslandPlanner.nextCost(b, owned, stock);
        lines.push(`<span>${isFill(copies > 1 ? tx.nextCopies : tx.nextLine, { n: isGroup(cost), c: copies })}</span>`);
    } else if (comp && !IslandPlanner.mustPay(b, owned)) {
        // Mythique d'événement à la Fontaine niv. 10 : exemplaires du stock, sinon composants.
        lines.push(`<span>${isFill(copies > 1 ? tx.nextComp : tx.nextCompOne, { c: copies, k: isGroup(Math.max(0, copies - stock) * comp.perCopy) })}</span>`);
    }
    if (b.gift) lines.push(`<span class="is-note">${isEsc(isL(b.gift))}</span>`);
    // Bâtiment payant : montant minimal en dollars pour le niveau 1.
    if (b.paid) lines.push(`<span class="is-note">${typeof b.paid === 'number' ? isFill(tx.paidLine, { n: isGroup(b.paid) }) : tx.paidAny}</span>`);
    if (b.note) lines.push(`<span class="is-note">${isEsc(isL(b.note))}</span>`);
    if (Array.isArray(b.images) && b.images.length > 1) {
        const levels = b.images.slice(1).map((v) => v.from);
        const last = levels.pop();
        const list = levels.length ? `${levels.join(', ')}${isLang() === 'FR' ? ' et ' : ' and '}${last}` : `${last}`;
        lines.push(`<span class="is-note">${isFill(tx.looksChange, { list })}</span>`);
    }
    // Stock : bâtiments de boutique une fois en boutique, bâtiments d'événement toujours
    // (exemplaires reçus, pas encore posés) ; pour une Merveille, ses propres plans.
    const stockMax = IslandPlanner.hasStock(b) && (inShop || !IslandPlanner.isPurchasable(b)) ? IslandPlanner.stockMax(b, owned) : 0;
    const stockLabel = b.blueprint ? tx.stockBlueprint : tx.stockLabel;
    const stockRow = stockMax > 0 || stock > 0
        ? `<div class="is-stepper is-stepper-stock" role="group" aria-label="${isEsc(name)} : ${stockLabel}">
            <span class="is-stock-label">${stockLabel}</span>
            <button type="button" data-focus="${b.id}:sminus" onclick="isBumpStock('${b.id}', -1)" ${stock <= 0 ? 'disabled' : ''} aria-label="${isEsc(isFill(tx.stockMinus, { name }))}">−</button>
            <output>${stock}</output>
            <button type="button" data-focus="${b.id}:splus" onclick="isBumpStock('${b.id}', 1)" ${stock >= stockMax ? 'disabled' : ''} aria-label="${isEsc(isFill(tx.stockPlus, { name }))}">+</button>
        </div>`
        : '';
    const unlock = o.unknown
        ? `<label class="is-check"><input type="checkbox" data-focus="${b.id}:unlock" ${isState.unlocked[b.id] ? 'checked' : ''} onchange="isSetUnlocked('${b.id}', this.checked)"> ${tx.unlockedTick}</label>`
        : '';
    return `<div class="is-card is-r-${b.rarity}${owned ? ' is-owned' : ''}${hero ? ' is-card-hero' : ''}">
        ${hero}<div class="is-card-head">${img}<div><div class="is-card-name">${isEsc(name)}</div><div class="is-card-rar">${tx.rarity[b.rarity]}</div></div></div>
        <div class="is-stepper" role="group" aria-label="${isEsc(name)}">
            <button type="button" data-focus="${b.id}:minus" onclick="isBump('${b.id}', -1)" ${owned <= 0 ? 'disabled' : ''} aria-label="${isEsc(isFill(tx.minus, { name }))}">−</button>
            <output>${value}</output>
            <button type="button" data-focus="${b.id}:plus" onclick="isBump('${b.id}', 1)" ${owned >= max ? 'disabled' : ''} aria-label="${isEsc(isFill(tx.plus, { name }))}">+</button>
        </div>
        ${stockRow}
        <div class="is-card-lines">${lines.join('')}</div>
        ${unlock}
    </div>`;
}

// Tiroirs de « Mes bâtiments d'île » repliés par le joueur (clés : rareté, 'unknown', 'event').
// Simple confort d'affichage : rangé à part de la sauvegarde de l'île, perdu sans conséquence.
const isFolded = new Set((() => {
    const v = safeParse(IS_FOLDS_KEY, []);
    return Array.isArray(v) ? v.filter((k) => typeof k === 'string') : [];
})());

function isFoldGroup(key, open) {
    if (open === !isFolded.has(key)) return;   // toggle émis au rendu : rien de neuf
    if (open) isFolded.delete(key); else isFolded.add(key);
    try { localStorage.setItem(IS_FOLDS_KEY, JSON.stringify([...isFolded])); } catch (e) { /* non retenu, sans conséquence */ }
}

function isRenderBuildings() {
    const tx = isTx();
    const owned = (b) => (isState.owned[b.id] || 0) > 0;
    const shown = [], unknown = [], events = [], locked = [];
    for (const b of isData.buildings) {
        if (b.source) events.push(b);
        else if (b.unlockTree == null) unknown.push(b);
        else if (isState.tree >= b.unlockTree || owned(b) || b.gift) shown.push(b);
        else locked.push(b);
    }
    const grid = (list, opts) => `<div class="is-grid">${list.map((b) => isCard(b, opts)).join('')}</div>`;
    // Tiroir repliable par rareté ou catégorie ; l'état replié survit aux re-rendus et aux visites.
    const group = (key, rar, title, list, body) => `<details class="is-group is-r-${rar}"${isFolded.has(key) ? '' : ' open'} ontoggle="isFoldGroup('${key}', this.open)">
        <summary><h3 class="is-group-title">${title}</h3><span class="is-group-count">${list.length}<span class="kt-sr"> ${tx.bldgCount}</span></span></summary>${body}</details>`;
    let html = '';
    for (const rar of IS_RARITY_ORDER) {
        const list = shown.filter((b) => b.rarity === rar);
        if (list.length) html += group(rar, rar, tx.rarity[rar], list, grid(list));
    }
    if (unknown.length) {
        html += group('unknown', 'none', tx.groupUnknown, unknown, `<p class="is-note">${tx.groupUnknownHint}</p>${grid(unknown, { unknown: true })}`);
    }
    if (events.length) html += group('event', 'none', tx.groupEvent, events, grid(events));
    if (locked.length) {
        html += `<details class="is-locked"><summary>${isFill(tx.groupLocked, { n: locked.length })}</summary><ul>${locked.map((b) =>
            `<li class="is-r-${b.rarity}"><span>${isEsc(isL(b.name))}</span><small>${isFill(tx.unlockAt, { n: b.unlockTree })}</small></li>`).join('')}</ul></details>`;
    }
    const box = document.getElementById('isBuildings');
    const lockedOpen = box.querySelector('details.is-locked')?.open;
    box.innerHTML = html;
    if (lockedOpen) box.querySelector('details.is-locked').open = true;
    if (isFocusKey) {
        const target = box.querySelector(`[data-focus="${isFocusKey}"]`);
        // Bouton devenu inactif (0 ou maximum atteint) : le focus passe à son voisin.
        const fallback = target && target.disabled ? target.parentElement.querySelector('button:not([disabled])') : null;
        (fallback || target)?.focus();
        isFocusKey = null;
    }
}

function isRenderBonuses() {
    const tx = isTx();
    const bonuses = IslandPlanner.activeBonuses(isData, isState);
    const keys = Object.keys(isData.stats).filter((k) => bonuses[k]);
    const el = document.getElementById('isBonuses');
    if (!keys.length) { el.innerHTML = `<div class="is-empty">${tx.emptyBonus}</div>`; return; }
    el.innerHTML = '<ul class="is-bonus-list">' + keys.map((k) => {
        const b = bonuses[k];
        const tree = b.sources.filter((s) => s.src === 'tree').reduce((t, s) => t + s.value, 0);
        const bldg = b.total - tree;
        const parts = [];
        if (tree) parts.push(`${tx.fromTree} ${isStatValue(k, tree)}`);
        if (bldg) parts.push(`${tx.fromBldg} ${isStatValue(k, bldg)}`);
        return `<li><span>${isEsc(isL(isData.stats[k]))}</span><b>${isStatValue(k, b.total)}</b><small>${parts.join(' · ')}</small></li>`;
    }).join('') + '</ul>';
}

function isRenderReference() {
    const tx = isTx();
    const dash = '<span class="is-muted">—</span>';
    const v = (x) => (x == null ? dash : isGroup(x));
    // Ligne du niveau actuel : marquée pour les lecteurs d'écran, le fond teinté ne se lit qu'à l'œil.
    const rowAttr = (on) => (on ? ' class="is-current" aria-current="true"' : '');
    const levelCell = (n, on) => `<td class="num">${n}${on ? `<span class="kt-sr"> (${tx.currentLevel})</span>` : ''}</td>`;
    document.getElementById('isRefTreeHead').innerHTML = `<tr><th scope="col" class="num">${tx.refLevel}</th><th scope="col">${tx.refBonus}</th><th scope="col" class="num">${tx.refProd}</th><th scope="col" class="num">${tx.refNeedProsp}</th><th scope="col" class="num">${tx.refNeedSeeds}</th><th scope="col">${tx.refReward}</th></tr>`;
    document.getElementById('isRefTree').innerHTML = isData.tree.levels.map((l) => {
        const up = l.upgrade;
        const last = l.level === isData.tree.maxLevel;
        const on = l.level === isState.tree;
        return `<tr${rowAttr(on)}>
            ${levelCell(l.level, on)}
            <td>${isEsc(isL(isData.stats[l.stat.key]))} <b>${isStatValue(l.stat.key, l.stat.value)}</b>${l.level > 1 && isUnlocksText(l.level) ? `<br><small class="is-muted">${isEsc(isUnlocksText(l.level))}</small>` : ''}</td>
            <td class="num">${isGroup(l.seedsPerHour)}</td>
            <td class="num">${last ? tx.none : v(up && up.prosperity)}</td>
            <td class="num">${last ? tx.none : v(up && up.seeds)}</td>
            <td>${isRewardLabel(up) ? isEsc(isRewardLabel(up)) : (last ? tx.none : dash)}</td>
        </tr>`;
    }).join('');
    document.getElementById('isRefCampHead').innerHTML = `<tr><th scope="col" class="num">${tx.refLevel}</th><th scope="col" class="num">${tx.refWorkers}</th><th scope="col" class="num">${tx.refSpeed}</th><th scope="col" class="num">${tx.refLoad}</th><th scope="col" class="num">${tx.refNeedTree}</th><th scope="col" class="num">${tx.refNeedSeeds}</th></tr>`;
    const c1 = isState.camps['lumber-camp-1'];
    document.getElementById('isRefCamp').innerHTML = isData.lumberCamp.levels.map((l) => {
        const last = l.level === isData.lumberCamp.maxLevel;
        const on = l.level === c1;
        return `<tr${rowAttr(on)}>
            ${levelCell(l.level, on)}<td class="num">${v(l.workers)}</td><td class="num">${v(l.gatherSpeed)}</td><td class="num">${v(l.load)}</td>
            <td class="num">${last ? tx.none : (l.upgrade ? isFill(tx.treeLvl, { n: l.upgrade.tree }) : dash)}</td>
            <td class="num">${last ? tx.none : v(l.upgrade && l.upgrade.seeds)}</td>
        </tr>`;
    }).join('');
}

// ============ MISE À JOUR ============
function isStep(name, fn) {
    try { fn(); return true; }
    catch (e) { console.error('isTrigger/' + name, e); return false; }
}

function isTrigger() {
    if (!isData) return;
    let ok = isStep('read', isReadSidebar);
    ok = isRender() && ok;
    if (!ok && window.ktWarnStale) window.ktWarnStale();
}

function isRender() {
    let ok = true;
    ok = isStep('translations', () => GlobalLang.applyI18n(isTx())) && ok;
    ok = isStep('camp2', isSyncCamp2) && ok;
    ok = isStep('gift', isRenderTreeGift) && ok;
    ok = isStep('info', isRenderSidebarInfo) && ok;
    ok = isStep('goal', isRenderGoalLine) && ok;
    ok = isStep('suggest', isRenderSuggestions) && ok;
    ok = isStep('buildings', isRenderBuildings) && ok;
    ok = isStep('bonuses', isRenderBonuses) && ok;
    ok = isStep('reference', isRenderReference) && ok;
    ok = isStep('save', isSave) && ok;
    return ok;
}

// ============ AIDE ============
function isInitHelp() {
    if (!window.HelpSystem) return;
    HelpSystem.init({
        id: 'island', banner: true, anchor: '[data-i18n="nextTitle"]',
        title: { FR: "Planificateur de l'île : Aide", EN: 'Island Planner: Help' },
        summary: {
            FR: "Renseigne les niveaux de ton île : l'outil te dit quoi faire ensuite pour faire monter ta prospérité et ta Fontaine Vitale avec le moins d'Essence d'Eau possible.",
            EN: 'Enter your island levels: the tool tells you what to do next to raise your prosperity and your Fountain of Life with as little Water Essence as possible.'
        },
        steps: {
            FR: [
                "À gauche, indique le niveau de ta Fontaine Vitale, ton Essence d'Eau et le niveau de tes Réservoirs.",
                "Dans « Mes bâtiments d'île », règle avec − et + le niveau de chaque bâtiment posé (ou le nombre d'exemplaires pour les Communs et Peu communs). Seuls ceux que ta Fontaine a débloqués sont affichés.",
                "« Que faire ensuite ? » propose tes 5 prochaines actions, dans l'ordre : la Fontaine dès que sa prospérité est atteinte, puis les Réservoirs, puis les bâtiments qui donnent la prospérité manquante pour le moins d'essence.",
                "Chaque suggestion dit pourquoi elle est proposée, ce qu'elle coûte et quand tu auras l'essence, d'après la production de ta Fontaine.",
                "Une fois l'action faite en jeu, clique sur ✓ : le niveau, l'essence, le stock et, si tu l'as saisie, la prospérité se mettent à jour, et la suggestion suivante apparaît. Tu peux aussi corriger les niveaux à la main.",
                "Un bâtiment Rare, Épique ou Mythique monte du niveau N à N+1 en consommant N+1 exemplaires achetés : son coût grandit à chaque niveau.",
                "« En stock » : les exemplaires que tu possèdes sans les avoir posés (achetés d'avance ou offerts par la Fontaine). L'outil les utilise avant d'en racheter : un bâtiment au niveau 1 avec 1 exemplaire en stock n'en demande plus qu'un à acheter pour le niveau 2. Quand tu montes ta Fontaine à la main, l'outil propose d'y ajouter les bâtiments qu'elle offre : ignore la proposition s'ils sont déjà posés.",
                "Les bâtiments d'événement ont aussi un stock : les exemplaires reçus en événement et pas encore posés. Dès la Fontaine niv. 10, 10 Composants de décoration Mythique (6 000 d'Essence d'Eau l'unité) donnent un exemplaire d'un Mythique d'événement : saisis ton stock de composants à gauche, l'outil s'en sert avant d'en acheter.",
                "La Merveille de la Fontaine niv. 10 se pose avec son Plan (50 000 d'Essence d'Eau), puis monte du niveau N à N+1 avec 20 × N Plans de Merveille Généraux, obtenus en événement : saisis-en le stock à gauche.",
            ],
            EN: [
                'On the left, enter your Fountain of Life level, your Water Essence and your Reservoir levels.',
                'In "My island buildings", use − and + to set the level of each building you have placed (or the number of copies for Common and Uncommon ones). Only those your Fountain has unlocked are shown.',
                '"What to do next?" lists your next 5 actions, in order: the Fountain as soon as its prosperity is reached, then the Reservoirs, then the buildings that bring the missing prosperity for the least Water Essence.',
                'Each suggestion says why it is picked, what it costs and when you will have the Water Essence, from your Fountain output.',
                'Once the action is done in game, click ✓: the level, Water Essence, stock and, if you entered it, prosperity are updated, and the next suggestion shows up. You can still fix levels by hand.',
                'A Rare, Epic or Mythic building goes from level N to N+1 by using up N+1 bought copies: its cost grows at every level.',
                '"In stock": the copies you own without having placed them (bought ahead or given by the Fountain). The tool uses them before buying more: a building at level 1 with 1 copy in stock needs only one more bought for level 2. When you raise your Fountain by hand, the tool offers to add the buildings it gives: ignore the offer if they are already placed.',
                'Event buildings also have a stock: the copies earned in events and not placed yet. From Fountain lvl 10, 10 Mythic decoration components (6,000 Water Essence each) make one copy of an event Mythic: enter your component stock on the left, the tool uses it before buying more.',
                'The Wonder of Fountain lvl 10 is placed with its Blueprint (50,000 Water Essence), then goes from level N to N+1 with 20 × N General Wonder Blueprints, earned in events: enter their stock on the left.',
            ]
        }
    });
}

// ============ DÉMARRAGE ============
(async function startup() {
    if (!document.getElementById('isBuildings')) return;
    if (!(await isLoadData())) return;
    const paint = () => {
        let ok = isStep('sidebar', isInitSidebar);
        ok = isRender() && ok;
        if (!ok && window.ktWarnStale) window.ktWarnStale();
    };
    isStep('load', isLoad);
    paint();
    isStep('help', isInitHelp);
    window.addEventListener('langChanged', paint);
})();
