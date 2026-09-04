/* ==========================================================================
   Magasin du Théâtre — optimiseur d'amulettes (prolonge la section événement)

   Le Théâtre est la seule boutique dont la monnaie ne s'achète pas : les packs
   et les missions versent des AMULETTES, qui alimentent un tirage, et ce sont
   les étages atteints dans ce tirage qui paient les JETONS de la boutique.
   Ce module comble ce chaînon : combien de jetons attendre d'un plan d'achat.

   Il ne redit rien de ce que `shop-event.js` sait déjà. La grille packs × jours,
   les missions, les amulettes dépensées et les paliers d'activité restent chez
   lui ; on lit son calcul (`c`) et on n'ajoute que ce qu'il ignore : le tirage.
   D'où seulement trois saisies propres — étage courant, compteur de garantie,
   et le barème de jetons par étage.

   Branché par le point d'extension `window.seExtras` (cf. shop-event.js).
   Données : data/events/fantasy-theater.json (mécaniques du tirage).
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Moteur — fonctions pures, aucune dépendance au DOM ni à la boutique.
   Vérifié contre une simulation Monte-Carlo : les probabilités concordent à
   moins de 0,15 point sur 300 000 tirages, les coûts moyens à 0,4 amulette.
   -------------------------------------------------------------------------- */

function ftExpectedAttempts(pity) {
    let surv = 1, e = 0;
    for (let i = 0; i < pity.length; i++) {
        e += (i + 1) * surv * pity[i];
        surv *= (1 - pity[i]);
    }
    return e;
}

/* Espérance d'amulettes pour atteindre l'étage `target` depuis chaque étage,
   et loi de l'étage d'arrivée (on peut dépasser la cible avec un +2 / +3).
   Exact : espérance par linéarité, loi par récurrence descendante. */
/* Mémoïsé : chaque ligne des tableaux « jusqu'où » et « où encaisser » redemande
   la même table, soit une quinzaine de reconstructions par rendu — donc à chaque
   frappe dans le barème de jetons. La clé suffit : les coûts et les probabilités
   d'une zone ne changent pas en cours de session. */
let FT_CLIMB_CACHE = {};
function ftClimbStats(area, target) {
    const key = (area.id || area.peak) + '|' + target;
    if (!FT_CLIMB_CACHE[key]) FT_CLIMB_CACHE[key] = ftComputeClimb(area, target);
    return FT_CLIMB_CACHE[key];
}
function ftComputeClimb(area, target) {
    const peak = area.peak, C = area.cost, J = area.jump;
    const EA = ftExpectedAttempts(area.pity);
    const cost = new Array(peak + 1).fill(0);
    const land = new Array(peak + 1);

    for (let f = peak; f >= 1; f--) {
        if (f >= target) {
            cost[f] = 0;
            land[f] = { [f]: 1 };
            continue;
        }
        let e = EA * C[f];
        const d = {};
        for (const j in J) {
            const g = Math.min(f + (+j), peak);
            e += J[j] * cost[g];
            for (const ff in land[g]) d[ff] = (d[ff] || 0) + J[j] * land[g][ff];
        }
        cost[f] = e;
        land[f] = d;
    }
    return { cost, land };
}

/* Espérance de tentatives pour monter quand le compteur de garantie est déjà
   à k échecs. A(k) = 1 + (1-p[k]) * A(k+1), la 5e tentative étant garantie. */
function ftAttemptsFrom(pity, k) {
    let a = 0;
    for (let i = pity.length - 1; i >= k; i--) a = 1 + (1 - pity[i]) * a;
    return a;
}

/* Coût moyen pour atteindre `target` depuis (f0, k0). Seul l'étage de départ
   hérite d'un compteur entamé : dès la première montée il repart de zéro, donc
   les étages suivants se lisent dans la table à compteur neuf. */
function ftClimbCostFrom(area, target, f0, k0) {
    if (f0 >= target) return 0;
    const base = ftClimbStats(area, target).cost;
    let e = ftAttemptsFrom(area.pity, k0) * area.cost[f0];
    for (const j in area.jump) e += area.jump[j] * base[Math.min(f0 + (+j), area.peak)];
    return e;
}

/* Probabilité d'atteindre au moins l'étage T avec un budget fini, en poussant
   sans jamais encaisser. Programmation dynamique exacte sur
   (amulettes restantes, étage, compteur de garantie) — pas de simulation,
   donc pas de bruit d'échantillonnage.
   Le budget est plafonné : au-delà, la table deviendrait inutilement lourde
   alors que la probabilité est déjà à 1. */
const FT_MAX_BUDGET = 20000;

/* Verdict et tableau demandent le même calcul à chaque frappe : on garde le
   dernier résultat, sinon chaque touche relance deux fois la table entière. */
let FT_REACH_CACHE = null;
function ftReachProbabilities(area, budget, f0, k0) {
    const sig = area.peak + '|' + budget + '|' + f0 + '|' + k0;
    if (FT_REACH_CACHE && FT_REACH_CACHE.sig === sig) return FT_REACH_CACHE.out;
    const out = ftComputeReach(area, budget, f0, k0);
    FT_REACH_CACHE = { sig, out };
    return out;
}
function ftComputeReach(area, budget, f0, k0) {
    const peak = area.peak, P = area.pity, C = area.cost, J = area.jump;
    const nk = P.length;
    const B = Math.max(0, Math.min(Math.floor(budget), FT_MAX_BUDGET));
    const stride = (peak + 1) * nk;
    const jumps = Object.keys(J).map(j => [+j, J[j]]);
    const out = new Array(peak + 1).fill(0);
    // UN seul tampon pour les sept cibles, remis a zero entre chaque. En allouer un
    // par cible faisait 7 x (20001 x 40 x 8 o) = ~45 Mo de Float64Array jetables a
    // chaque appel au budget plafond — 57 ms sur un ordinateur de bureau, bien plus
    // sur un telephone. Equivalent au precedent : chaque case est soit reecrite
    // ci-dessous, soit laissee a zero, ce que `fill(0)` garantit.
    const R = new Float64Array((B + 1) * stride);

    for (let T = 1; T <= peak; T++) {
        if (f0 >= T) { out[T] = 1; continue; }
        R.fill(0);
        for (let b = 0; b <= B; b++) {
            const base = b * stride;
            for (let f = 1; f <= peak; f++) {
                if (f >= T) {                       // cible atteinte : succès certain
                    for (let k = 0; k < nk; k++) R[base + f * nk + k] = 1;
                    continue;
                }
                const c = C[f];
                if (!c || b < c) continue;          // plus les moyens : reste à 0
                const prev = (b - c) * stride;
                let up = 0;
                for (let i = 0; i < jumps.length; i++) {
                    up += jumps[i][1] * R[prev + Math.min(f + jumps[i][0], peak) * nk];
                }
                for (let k = 0; k < nk; k++) {
                    const p = P[k];
                    const stay = (k + 1 < nk) ? R[prev + f * nk + (k + 1)] : 0;
                    R[base + f * nk + k] = p * up + (1 - p) * stay;
                }
            }
        }
        out[T] = R[B * stride + f0 * nk + k0];
    }
    return out;
}

/* Jetons espérés d'un budget FINI, et le geste à faire maintenant.

   Le « jetons par amulette » des consignes est un régime asymptotique : il
   suppose qu'on enchaîne les manches sans fin. Avec 120 amulettes on n'atteint
   pas une seule fois le sommet, et multiplier le budget par ce ratio promettait
   1 549 jetons là où la réalité tourne autour de 7. On résout donc le vrai
   problème — maximiser l'espérance de jetons avec un budget qui s'épuise :

     V(b,f,k) = max( encaisser : jetons[f] + V(b,1,0)     si f >= claimFrom
                   , explorer  : p·Σ q_j·V(b-c, f+j, 0) + (1-p)·V(b-c, f, k+1) )

   Encaisser ne coûte rien mais renvoie à l'étage 1, où l'on ne peut qu'explorer :
   V(b,1,·) ne dépend donc que de budgets plus petits. On le calcule en premier,
   et la récurrence se ferme sans boucle. */
function ftFiniteValue(area, tokens, budget, f0, k0) {
    const peak = area.peak, P = area.pity, C = area.cost, J = area.jump, nk = P.length;
    // Encaisser à l'étage 1 serait gratuit ET y renverrait : la récurrence
    // boucherait sur elle-même (V(b,1,0) lu pendant qu'on l'écrit) et la table
    // entière deviendrait fausse en silence. `claimAllowedFromFloor` est une
    // déduction dans le fichier de données, pas une certitude : on refuse ici
    // toute valeur < 2 plutôt que de dépendre de sa justesse.
    const claimFrom = Math.max(2, area.claimFrom || 2);
    const B = Math.max(0, Math.min(Math.floor(budget) || 0, FT_MAX_BUDGET));
    const stride = (peak + 1) * nk;
    const V = new Float64Array((B + 1) * stride);
    const claimAt = new Uint8Array((B + 1) * stride);
    const jumps = Object.keys(J).map(j => [+j, J[j]]);

    for (let b = 0; b <= B; b++) {
        const base = b * stride;
        for (let f = 1; f <= peak; f++) {          // l'étage 1 en premier : cf. ci-dessus
            const c = C[f];
            let up = 0;
            if (c && b >= c) {
                const prev = (b - c) * stride;
                for (let i = 0; i < jumps.length; i++) {
                    up += jumps[i][1] * V[prev + Math.min(f + jumps[i][0], peak) * nk];
                }
            }
            for (let k = 0; k < nk; k++) {
                const idx = base + f * nk + k;
                let explore = -Infinity;
                if (c && b >= c) {
                    const prev = (b - c) * stride;
                    const stay = (k + 1 < nk) ? V[prev + f * nk + (k + 1)] : 0;
                    explore = P[k] * up + (1 - P[k]) * stay;
                }
                // Encaisser reste possible sans un sou : c'est ce qui garantit
                // qu'une montée en cours vaut toujours ce que paie son étage.
                const claim = (f >= claimFrom) ? (tokens[f] || 0) + V[base + nk] : -Infinity;
                if (claim >= explore && claim > -Infinity) { V[idx] = claim; claimAt[idx] = 1; }
                else V[idx] = explore > 0 ? explore : 0;
            }
        }
    }
    const at = B * stride + Math.min(f0, peak) * nk + Math.min(k0, nk - 1);
    return { tokens: V[at], claim: !!claimAt[at] };
}

/* Rendement d'une consigne simple « j'encaisse dès que j'atteins l'étage T ». */
function ftThresholdStats(area, tokens, T) {
    const { cost, land } = ftClimbStats(area, T);
    let gain = 0;
    for (const f in land[1]) gain += land[1][f] * (tokens[f] || 0);
    return { cost: cost[1], gain, ratio: cost[1] > 0 ? gain / cost[1] : 0, landing: land[1] };
}

/* --------------------------------------------------------------------------
   2. État, données, traductions
   -------------------------------------------------------------------------- */

const ST = {
    mech: null,      // data/events/fantasy-theater.json
    area: null,      // le Théâtre, prêt pour le moteur
    fortress: null,
    state: null,     // saisies propres à ce module
    last: null       // dernier calcul de shop-event.js, pour re-rendre seul
};

const ST_DEFAULTS = { floor: 1, pity: 0, tokens: {}, toksOpen: false };

const i18nTheater = {
    EN: {
        title: 'What your amulets are worth',
        intro: 'The packs and missions above pay Amulets, not Tokens: Amulets feed the Theater draw, and the floors you reach in it pay the shop currency. This is that missing link - what a plan of amulets turns into.',
        pocket: 'Amulets in hand',
        pocketSub: 'today, day {n}',
        budget: 'Amulets left to spend',
        budgetSub: 'in hand plus what the plan still pays before the end',
        fullRun: 'A climb to floor 7 costs',
        runs: 'Climbs your amulets cover',
        chance: 'Chance of reaching floor 7',
        expect: 'Tokens you can expect',
        expectSub: 'playing this budget as well as it can be played',
        onAverage: 'on average',
        amulets: 'amulets',
        lblFloor: 'Current floor',
        lblPity: 'Failed pushes in a row',
        didWhat: 'I just:',
        actFail: 'failed',
        actUp: 'went up',
        actClaim: 'cashed in',
        actFailTip: 'An exploration that did not move you up: counter +1, and the amulets are added to what you have spent.',
        actUpTip: 'An exploration that moved you up {n} floor(s): counter reset, and one exploration added to what you have spent - a jump of two or three floors still costs a single push.',
        actClaimTip: 'You took the floor reward: back to floor 1, counter reset. Costs no amulets.',
        actCost: 'costs {n} here',
        lblTokens: 'Tokens paid by each floor',
        tokHint: 'Shipped with a reading from one server. The game publishes them nowhere and they may differ on yours - change any of them and everything below follows.',
        tokReset: 'Restore default values',
        floor: 'Floor',
        fortress: 'Fortress',
        reachTitle: 'How far your amulets take you',
        reachSub: 'Exact odds of getting at least this high on one climb, pushing without ever cashing in, from the floor you are on.',
        thReach: 'Reach at least', thOdds: 'Odds', thCostFrom: 'Average cost from your floor',
        cashTitle: 'Where to cash in',
        cashSub: 'Cashing in ends the round and sends you back to floor 1, so the question is always whether the next floor is worth what it costs to reach.',
        thRule: 'Rule', thCost: 'Average amulets', thGain: 'Average tokens', thRatio: 'Tokens per amulet',
        ruleAt: 'Cash in from floor', bestRule: 'Best',
        climbTitle: 'What a climb costs',
        thFloor: 'Floor', thOne: 'One exploration', thAsc: 'Average per ascent', thPeak: 'Average to reach floor 7',
        fortTitle: 'Fanstars and the Fortress',
        fortPeaks: 'Peak visits per Fortress entry',
        fortClear: 'Amulets to clear the Fortress',
        fortRate: 'Fortress payout',
        fortCycle: 'Full cycle, Theater and Fortress',
        perAmulet: 'tokens per amulet',
        noPlan: 'Tick what you buy in the grid above and this works out what those amulets are worth.',
        noTokens: 'Every floor is set to 0 tokens, so there is nothing to weigh up: fill in "Tokens paid by each floor" - or restore the default values - and the advice comes back.'
    },
    FR: {
        title: 'Ce que valent tes amulettes',
        intro: 'Les packs et les missions ci-dessus versent des Amulettes, pas des Jetons : les Amulettes alimentent le tirage du Théâtre, et ce sont les étages atteints qui paient la monnaie de la boutique. Voici ce chaînon manquant — ce que devient un plan d’amulettes.',
        pocket: 'Amulettes en poche',
        pocketSub: 'aujourd’hui, jour {n}',
        budget: 'À dépenser d’ici la fin',
        budgetSub: 'en poche, plus ce que le plan versera encore',
        fullRun: 'Une montée jusqu’à l’étage 7 coûte',
        runs: 'Montées que couvrent tes amulettes',
        chance: 'Chance d’atteindre l’étage 7',
        expect: 'Jetons que tu peux espérer',
        expectSub: 'en jouant ce budget au mieux',
        onAverage: 'en moyenne',
        amulets: 'amulettes',
        lblFloor: 'Étage actuel',
        lblPity: 'Échecs d’affilée',
        didWhat: 'Je viens de :',
        actFail: 'échouer',
        actUp: 'monter',
        actClaim: 'encaisser',
        actFailTip: 'Une exploration qui n’a pas fait monter : compteur +1, et les amulettes s’ajoutent à tes dépensées.',
        actUpTip: 'Une exploration qui a fait monter de {n} étage(s) : compteur remis à zéro, et une exploration ajoutée à tes dépensées — un saut de deux ou trois étages ne coûte qu’une poussée.',
        actClaimTip: 'Tu as pris la récompense de l’étage : retour à l’étage 1, compteur remis à zéro. Ne coûte aucune amulette.',
        actCost: 'coûte {n} ici',
        lblTokens: 'Jetons donnés par chaque étage',
        tokHint: 'Livrés avec le relevé d’un serveur. Le jeu ne les publie nulle part et ils peuvent différer chez toi — change-les et tout ce qui suit s’ajuste.',
        tokReset: 'Rétablir les valeurs par défaut',
        floor: 'Étage',
        fortress: 'Forteresse',
        reachTitle: 'Jusqu’où tes amulettes t’emmènent',
        reachSub: 'Probabilité exacte de monter au moins jusque-là sur une montée, en poussant sans jamais encaisser, depuis l’étage où tu es.',
        thReach: 'Atteindre au moins', thOdds: 'Chances', thCostFrom: 'Coût moyen depuis ton étage',
        cashTitle: 'Où encaisser',
        cashSub: 'Encaisser met fin à la manche et renvoie à l’étage 1 : la question est toujours de savoir si l’étage suivant vaut ce qu’il coûte à atteindre.',
        thRule: 'Consigne', thCost: 'Amulettes en moyenne', thGain: 'Jetons en moyenne', thRatio: 'Jetons par amulette',
        ruleAt: 'Encaisser dès l’étage', bestRule: 'Meilleure',
        climbTitle: 'Ce que coûte une montée',
        thFloor: 'Étage', thOne: 'Une exploration', thAsc: 'Moyenne par montée', thPeak: 'Moyenne pour l’étage 7',
        fortTitle: 'Fanstars et Forteresse',
        fortPeaks: 'Passages au sommet par entrée',
        fortClear: 'Amulettes pour vider la Forteresse',
        fortRate: 'Rendement de la Forteresse',
        fortCycle: 'Cycle complet, Théâtre et Forteresse',
        perAmulet: 'jetons par amulette',
        noPlan: 'Coche tes achats dans la grille ci-dessus et le calcul te dira ce que ces amulettes valent.',
        noTokens: 'Tous les étages sont à 0 jeton : il n’y a plus rien à arbitrer. Renseigne « Jetons donnés par chaque étage » — ou rétablis les valeurs par défaut — et le conseil revient.'
    }
};

function stT(k) { return (i18nTheater[scLang()] || i18nTheater.FR)[k]; }
function stTf(k, n) { return String(stT(k)).replace('{n}', n); }
function stFmt(n, d) {
    return Number(n).toLocaleString(scLang() === 'FR' ? 'fr-FR' : 'en-US',
        { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
}
function stPct(p) {
    if (p >= 0.9995) return '100%';
    if (p > 0 && p < 0.001) return scLang() === 'FR' ? '<0,1%' : '<0.1%';
    return stFmt(p * 100, p >= 0.1 ? 0 : 1) + '%';
}

function stTokenFloors() { return ST.fortress ? ST.fortress.peak : 8; }

/* Barème livré : les 7 étages du Théâtre, plus le sommet de la Forteresse. Les
   étages 1 à 7 de la Forteresse sont ceux du Théâtre — seul son sommet lui est
   propre, d'où une seule colonne de saisie pour les deux zones. */
function stDefaultTokens() {
    const t = (ST.mech.theater.tokensByFloor) || {};
    const f = (ST.mech.fortress.tokensByFloor) || {};
    const out = {};
    for (let i = 1; i <= stTokenFloors(); i++) {
        const v = (f[i] !== undefined && f[i] !== null) ? f[i] : t[i];
        out[i] = (v === null || v === undefined) ? '' : v;
    }
    return out;
}
function stTokensUpTo(upTo) {
    const t = {};
    let any = false;
    for (let i = 1; i <= upTo; i++) {
        const v = parseFloat(String(ST.state.tokens[i]).replace(',', '.'));
        t[i] = isFinite(v) ? v : 0;
        if (isFinite(v) && v > 0) any = true;
    }
    return any ? t : null;
}
function stTokens() { return stTokensUpTo(ST.area.peak); }
function stFortTokens() { return stTokensUpTo(ST.fortress.peak); }

/* Aucun cache-busting sur le site : un visiteur peut avoir un `storage-keys.js`
   antérieur à cette clé. Sans repli, on écrirait sous la chaîne « undefined »,
   et le réglage serait perdu au prochain rafraîchissement du cache. */
function stKey() { return (window.STORAGE_KEYS && STORAGE_KEYS.theaterOptimizer) || 'theater_optimizer_data'; }

/* On ne persiste que l'ÉCART au barème livré. Enregistrer le tableau entier
   figerait les valeurs par défaut du jour chez le joueur : une correction des
   données ne l'atteindrait plus jamais, alors que le fichier fait foi pour tout
   ce qu'il n'a pas touché. */
function stSave() {
    const def = stDefaultTokens();
    const delta = {};
    for (const i in ST.state.tokens) {
        if (String(ST.state.tokens[i]) !== String(def[i])) delta[i] = ST.state.tokens[i];
    }
    const out = Object.assign({}, ST.state, { tokens: delta });
    try { localStorage.setItem(stKey(), JSON.stringify(out)); } catch (e) {}
}

/* Amulettes du plan : shop-event.js les a déjà totalisées. Elles arrivent en
   « extra » — un objet listé mais jamais valorisé, faute d'être au référentiel —
   et le joueur peut l'avoir décoché dans le détail des gains, ce qu'on respecte. */
function stPlanAmulets(c) {
    const row = stAmuletRow(c);
    return (row && !row.off) ? (Number(row.qty) || 0) : 0;
}

/* La ligne des amulettes dans le détail des gains, décochée ou non. Le joueur
   peut la décocher pour la retirer de la valorisation : les revenus tombent alors
   à zéro pendant que les dépenses restent, et le solde devient négatif sans que
   les données y soient pour rien. Il faut donc distinguer « absente » de
   « décochée » plutôt que d'accuser le fichier de l'événement. */
function stAmuletRow(c) {
    const label = (ST.mech.theater.amuletLabel && ST.mech.theater.amuletLabel.EN) || 'Fantasy Amulet';
    return (c.extras || []).find(x => x.key === 'x:' + label) || null;
}

/* --------------------------------------------------------------------------
   3. Rendu de la section
   -------------------------------------------------------------------------- */

function stKpiHtml(list) {
    return `<div class="sx-kpis sxe-kpis">` + list.map(k => `
        <div class="sx-kpi${k.tone ? ' ' + k.tone : ''}">
            <span class="sx-kpi-lbl">${k.label}</span>
            <span class="sx-kpi-val">${k.value}</span>
            ${k.sub ? `<span class="sx-kpi-sub">${k.sub}</span>` : ''}
        </div>`).join('') + `</div>`;
}

function stControlsHtml() {
    const a = ST.area, s = ST.state;
    let toks = '';
    for (let i = 1; i <= stTokenFloors(); i++) {
        const fort = i > a.peak;
        toks += `<label class="stx-tok${fort ? ' stx-tok-fort' : ''}">
            <span>${fort ? stT('fortress') + ' · ' : ''}${stT('floor')} ${i}</span>
            <input type="text" inputmode="numeric" value="${scEscAttr(s.tokens[i])}"
                data-se="th:tok${i}" data-st-tok="${i}" aria-label="${stT('floor')} ${i}"></label>`;
    }
    const step = (key, val, min, max, label) => `<span class="sx-fact">${label} :
        <span class="sx-take on"><button type="button" data-se="th:${key}-" data-st-step="${key}:-1"
            ${val <= min ? 'disabled' : ''} aria-label="−">−</button><input type="text" inputmode="numeric"
            value="${val}" data-se="th:${key}" data-st-set="${key}" aria-label="${scEscAttr(label)}"><button
            type="button" data-se="th:${key}+" data-st-step="${key}:1" ${val >= max ? 'disabled' : ''}
            aria-label="+">+</button></span> / ${max}</span>`;

    // Boutons d'action plutôt que steppers auto-facturés : une montée peut valoir
    // +1, +2 ou +3 étages pour UNE seule exploration payée. Facturer chaque clic
    // du stepper d'étage compterait deux ou trois explorations là où le jeu n'en
    // a fait payer qu'une. Les steppers restent donc une correction libre, et ces
    // trois boutons disent ce qui s'est passé en jeu.
    const peak = s.floor >= a.peak, maxed = s.pity >= a.pity.length - 1;
    const cost = a.cost[s.floor] || 0;
    return `<div class="sxe-toolbar">
            ${step('floor', s.floor, 1, a.peak, stT('lblFloor'))}
            ${step('pity', s.pity, 0, a.pity.length - 1, stT('lblPity'))}
            <span class="sx-fact">${stT('didWhat')}
                <span class="sx-take on stx-acts"><button type="button" data-st-act="fail" data-se="th:af"
                    ${peak || maxed ? 'disabled' : ''} title="${scEscAttr(stT('actFailTip'))}">${stT('actFail')}</button>${
                    [1, 2, 3].map(n => `<button type="button" data-st-act="up${n}" data-se="th:au${n}"
                    ${peak ? 'disabled' : ''} title="${scEscAttr(stTf('actUpTip', n))}">${n === 1 ? stT('actUp') + ' ' : ''}+${n}</button>`).join('')
                }<button type="button" data-st-act="claim" data-se="th:ac"
                    ${s.floor < a.claimFrom ? 'disabled' : ''} title="${scEscAttr(stT('actClaimTip'))}">${stT('actClaim')}</button></span>
                ${peak ? '' : `<span class="sx-sub">${stTf('actCost', cost)}</span>`}
            </span>
            <span id="stx-explore-slot"></span>
        </div>
        <details class="sxe-panel stx-toks"${ST.state.toksOpen ? ' open' : ''} data-st-toks>
            <summary>${stT('lblTokens')}</summary>
            <div class="stx-tok-grid">${toks}</div>
            <p class="sxe-note">${stT('tokHint')}
                <button type="button" class="sx-btn" data-st-reset="1">${stT('tokReset')}</button></p>
        </details>`;
}

function stTableHtml(head, rows) {
    return `<div class="sxe-gridbox"><table class="sxe-grid">
        <thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* Budget à partir duquel viser le sommet devient payant DANS L'ÉTAT OÙ L'ON EST.
   Le seuil n'a rien d'universel : à l'étage 2 compteur neuf il vaut ~520, mais
   dès deux échecs au compteur il tombe à 8, parce que la montée suivante est
   presque acquise. Afficher le seuil d'un autre état à côté du conseil donnait
   une page qui semblait se contredire — « pousse » sous un seuil non atteint. */
function stFlipBudget(area, tokens, floor, pity) {
    const claims = b => ftFiniteValue(area, tokens, b, floor, pity).claim;
    if (!claims(1)) return null;            // pousser est toujours bon ici
    let lo = 1, hi = 4000;
    if (claims(hi)) return null;            // encaisser est toujours bon ici
    while (hi - lo > 5) { const mid = (lo + hi) >> 1; if (claims(mid)) lo = mid; else hi = mid; }
    return hi;
}

/* Le rapprochement, écrit en toutes lettres.

   Trois quantités, et une seule est comparable au jeu : ce qu'on a EN POCHE
   aujourd'hui. Le budget, lui, additionne les packs des jours à venir et les
   missions pas encore faites — le jeu ne peut pas les afficher, puisqu'on ne
   les a pas encore. Les confondre faisait dire à la page qu'un écart avec le
   jeu prouvait une erreur de données, alors qu'il était parfaitement normal. */
function stReconcileHtml(total, spent, derived, future, pocket, dayNow, muted) {
    const fr = scLang() === 'FR';
    if (muted) {
        return `<p class="stx-recon stx-recon-bad">${fr
            ? `<strong>Les amulettes sont décochées.</strong> Dans le détail des gains ci-dessus, la ligne « Amulette Fantaisie » est retirée de la valorisation : cette section n’a donc plus aucun revenu à compter, alors que tes ${stFmt(spent)} dépensées, elles, restent. Recoche-la pour que le calcul reprenne.`
            : `<strong>Amulets are unticked.</strong> In the reward breakdown above, the "Fantasy Amulet" row is excluded from the valuation, so this section has no income left to count while your ${stFmt(spent)} spent still stand. Tick it back on to restore the calculation.`}</p>`;
    }
    const pocketTxt = `<strong>${stFmt(pocket)}</strong>`;
    if (pocket < 0) {
        return `<p class="stx-recon stx-recon-bad">${fr
            ? `<strong>Le compte ne tombe pas juste.</strong> En poche aujourd’hui : ${stFmt(total)} versées − ${stFmt(spent)} dépensées − ${stFmt(future)} encore à venir = ${pocketTxt}. Un solde négatif n’existe pas en jeu : le fichier de l’événement ignore une source d’amulettes, et l’écart avec ton solde réel est exactement ce qui manque.`
            : `<strong>These numbers do not add up.</strong> In hand today: ${stFmt(total)} paid − ${stFmt(spent)} spent − ${stFmt(future)} still to come = ${pocketTxt}. A negative balance cannot happen in game: the event file is missing a source of amulets, and the gap against your real balance is exactly what is missing.`}</p>`;
    }
    return `<p class="stx-recon">${fr
        ? `<strong>Aujourd’hui</strong> (jour ${dayNow}) tu devrais avoir ${pocketTxt} amulettes en poche — <em>c’est ce chiffre-là, et lui seul, qui doit correspondre au jeu.</em> Le budget de ${stFmt(derived)} y ajoute les ${stFmt(future)} que ton plan versera d’ici la fin : packs des jours à venir et missions pas encore faites, que tu n’as évidemment pas encore.`
        : `<strong>Today</strong> (day ${dayNow}) you should be holding ${pocketTxt} amulets - <em>that figure, and only that one, is what should match the game.</em> The ${stFmt(derived)} budget adds the ${stFmt(future)} your plan will still pay before the end: packs on days to come and missions not yet done, which you obviously do not have yet.`}</p>`;
}

/* Temps restant avant la fermeture de l'ÉVÉNEMENT — pas de la boutique, qui lui
   survit 24 h. La date vit dans le fichier de l'événement (cf. MAP §6). */
function stDeadline() {
    const end = ST.eventEnd ? Date.parse(ST.eventEnd) : NaN;
    if (!isFinite(end)) return null;
    const t = end - Date.now();
    if (t <= 0) return null;
    const fr = scLang() === 'FR';
    const d = Math.floor(t / 86400000), h = Math.floor(t % 86400000 / 3600000), m = Math.floor(t % 3600000 / 60000);
    const parts = [];
    if (d) parts.push(d + ' ' + (fr ? 'j' : 'd'));
    if (h) parts.push(h + ' h');
    if (!d && m) parts.push(m + ' min');
    return parts.join(' ') || (fr ? 'moins d’une minute' : 'less than a minute');
}

/* Accès à shop-event.js par son API publique. `data`, `plan` et `compute` sont
   des noms nés dans le même lot que ce fichier, ce que la règle de cache du
   projet déconseille (cf. CLAUDE.md) — mais `seExtras`, le point d'extension qui
   appelle tout ce module, l'est tout autant : un visiteur au shop-event.js
   périmé ne voit simplement pas la section, exactement comme sans ces
   accesseurs. Les gardes ci-dessous évitent l'exception ; elles ne rattrapent
   pas un socle périmé, et n'ont pas à le faire. */
function stEventData() { return (window.ShopEvent && ShopEvent.data && ShopEvent.data()) || null; }
function stEventPlan() { return (window.ShopEvent && ShopEvent.plan && ShopEvent.plan()) || null; }

/* Jour d'événement en cours (1..days). Le plan couvre TOUT l'événement, jour 6
   compris : sans cette borne, on compterait comme acquis des packs qui ne sont
   même pas encore achetables. */
function stEventDayNow(c) {
    const meta = stEventData() && stEventData()._meta;
    if (!meta || !meta.startsAt) return c.days;
    const d = Math.floor((Date.now() - Date.parse(meta.startsAt + 'T00:00:00Z')) / 86400000) + 1;
    return Math.max(1, Math.min(c.days, d));
}

/* Ce que le plan a DÉJÀ versé, à la date d'aujourd'hui.

   Calculé par shop-event.js lui-même, borné au jour d'événement en cours. Le
   refaire ici obligeait à recopier ses règles — jours joués, mission « faire un
   achat » (grille ET achats faits ailleurs), lignes décochées dans le détail des
   gains — et deux d'entre elles manquaient déjà : décocher les amulettes faisait
   accuser le fichier de données, et les achats hors événement gonflaient le solde
   « en poche » de 60 amulettes. Une seule source de vérité, donc. */
function stAcquired(c) {
    const upTo = stEventDayNow(c);
    const past = (window.ShopEvent && ShopEvent.compute) ? ShopEvent.compute(upTo) : null;
    return past ? stPlanAmulets(past) : null;
}

function stRender(host, c) {
    const box = host.querySelector('#stx-root');
    if (!box) return;
    const a = ST.area, f = ST.fortress, s = ST.state, fr = scLang() === 'FR';
    const total = stPlanAmulets(c);
    const spent = Number(c.explore) || 0;
    // `derived` PEUT être négatif, et c'est une information, pas un accident : cela
    // prouve que le plan ignore une source d'amulettes. L'écraser par un zéro
    // masquait la seule preuve du défaut — c'est ce qui a laissé passer le cadeau
    // d'ouverture pendant deux jours, la page affichant 0 là où il en restait 8.
    const derived = total - spent;
    const budget = Math.max(0, derived);
    // Trois quantités à ne pas confondre : ce qu'on a EN POCHE aujourd'hui (le
    // seul chiffre comparable au jeu), ce que le plan versera ENCORE, et la
    // somme des deux — le budget stratégique jusqu'à la fin de l'événement.
    const row = stAmuletRow(c);
    const muted = !!(row && row.off);        // ligne présente mais retirée de la valorisation
    const acquired = stAcquired(c);
    // Repli si la boutique est trop ancienne pour savoir borner : tout est
    // considéré comme acquis, ce qui redonne l'ancien comportement plutôt qu'un
    // chiffre faux.
    const future = acquired === null ? 0 : Math.max(0, total - acquired);
    const pocket = derived - future;
    const tok = stTokens(), ftok = stFortTokens();
    const full = ftClimbStats(a, a.peak).cost[1];
    const reach = ftReachProbabilities(a, budget, s.floor, s.pity);
    // Ce que le budget rapporte VRAIMENT, et le geste qui va avec. Le ratio des
    // consignes ne vaut qu'à budget infini : s'y fier sous ~600 amulettes fait
    // pousser vers un sommet hors d'atteinte, et rentrer les mains vides.
    const fin = tok ? ftFiniteValue(a, tok, budget, s.floor, s.pity) : null;
    // « Ne pas encaisser » ne veut pas dire « pousser » : quand le budget ne
    // couvre plus une exploration, aucune des deux actions n'est possible, et le
    // verdict conseillait pourtant une exploration impayable — l'état normal de
    // fin d'événement pour qui a tout dépensé.
    const canPush = s.floor < a.peak && budget >= (a.cost[s.floor] || 0);

    // --- bandeau ---
    const kpis = [
        { label: stT('pocket'), value: stFmt(pocket), sub: stTf('pocketSub', stEventDayNow(c)) },
        { label: stT('budget'), value: stFmt(budget), sub: stT('budgetSub') },
        { label: stT('fullRun'), value: stFmt(full), sub: stT('amulets') + ' · ' + stT('onAverage') },
        { label: stT('runs'), value: stFmt(budget / full, 1) },
        { label: stT('chance'), value: stPct(reach[a.peak]), tone: 'sxe-t-mid' }
    ];
    if (fin) kpis.push({ label: stT('expect'), value: stFmt(fin.tokens),
        sub: stT('expectSub'), tone: 'sxe-t-good' });

    // --- que faire maintenant ---
    let verdict = '';
    if (!total) {
        verdict = `<p>${stT('noPlan')}</p>`;
    } else if (!tok) {
        // Barème entièrement remis à zéro par le joueur : plus aucun étage ne paie,
        // donc `fin` est nul et tout conseil chiffré est faux. Le dire, plutôt que de
        // laisser un cadre vide et deux tableaux disparus sans explication.
        verdict = `<p>${stT('noTokens')}</p>`;
    } else if (s.floor >= a.peak) {
        verdict = `<p>${fr ? 'Tu es au <strong>sommet</strong> : encaisse, c’est le seul choix ici, et tu repars à l’étage 1 avec tes Fanstars.'
            : 'You are at the <strong>peak</strong>: cash in, the only move here, and you restart at floor 1 with your Fanstars.'}</p>`;
    } else if (!canPush) {
        // NE PAS y remettre `!fin.claim` : à un étage encaissable, ne pas pouvoir
        // explorer rend TOUJOURS l'encaissement optimal, donc `fin.claim` y est
        // toujours vrai — la condition ne laissait passer que l'étage 1, et le seul
        // conseil de fin d'événement (« encaisse avant la fermeture ») ne s'affichait
        // jamais. C'est pourtant le piège que ce module existe pour signaler.
        verdict = `<p>${fr
            ? `<strong class="stx-claim">Plus rien à jouer.</strong> Il te reste ${stFmt(budget)} amulette(s), et une exploration depuis l’étage ${s.floor} en coûte ${a.cost[s.floor] || '—'}. ${s.floor >= a.claimFrom ? 'Encaisse ton étage avant la fermeture : une montée laissée en plan ne rapporte rien.' : 'Attends les amulettes des missions du jour.'}`
            : `<strong class="stx-claim">Nothing left to play.</strong> You have ${stFmt(budget)} amulet(s) and an exploration from floor ${s.floor} costs ${a.cost[s.floor] || '—'}. ${s.floor >= a.claimFrom ? 'Cash your floor in before it closes: a climb left hanging pays nothing.' : 'Wait for the amulets from today\'s missions.'}`}</p>`;
    } else {
        const bits = [fin.claim
            ? (fr ? `<strong class="stx-claim">Encaisse.</strong> À l’étage ${s.floor}, avec ${stFmt(budget)} amulettes devant toi, prendre les ${stFmt(tok[s.floor])} jetons et repartir rapporte plus que pousser plus haut.`
                  : `<strong class="stx-claim">Cash in.</strong> On floor ${s.floor}, with ${stFmt(budget)} amulets ahead of you, taking the ${stFmt(tok[s.floor])} tokens and starting over beats climbing further.`)
            : (fr ? `<strong class="stx-push">Pousse.</strong> À l’étage ${s.floor} avec ${s.pity} échec(s) au compteur, la prochaine exploration (${a.cost[s.floor] || '—'} amulettes) vaut mieux qu’encaisser.`
                  : `<strong class="stx-push">Push.</strong> On floor ${s.floor} with ${s.pity} failed push(es) banked, the next exploration (${a.cost[s.floor] || '—'} amulets) beats cashing in.`)];

        // Le seuil où le conseil bascule : c'est LA chose à comprendre sur cet
        // événement, et elle ne se lit dans aucun tableau.
        const flip = stFlipBudget(a, tok, s.floor, s.pity);
        if (flip) {
            // La comparaison au compteur neuf n'est ajoutée QUE si elle dit quelque
            // chose. `stFlipBudget` rend `null` dans DEUX cas opposés — pousser vaut
            // toujours mieux, ou encaisser vaut toujours mieux — et un `|| 0` en
            // faisait « pousser paie dès 0 amulette », soit l'inverse du conseil dans
            // le second cas. À compteur neuf, elle répéterait en plus le chiffre
            // qu'on vient de donner en affirmant qu'il diffère.
            const fresh = s.pity > 0 ? stFlipBudget(a, tok, s.floor, 0) : null;
            bits.push((fr
                ? `Le seuil dépend d’où tu es : à l’étage ${s.floor} avec ${s.pity} échec(s), la bascule est à <strong>${stFmt(flip)} amulettes</strong> — en dessous il vaudrait mieux encaisser et recommencer, au-dessus pousser. Tu en as ${stFmt(budget)}.`
                : `The threshold depends on where you are: on floor ${s.floor} with ${s.pity} failed push(es), it flips at <strong>${stFmt(flip)} amulets</strong> - below that you would do better cashing in and starting over, above it pushing. You have ${stFmt(budget)}.`)
              + (fresh ? (fr
                ? ` Le compteur de garantie fait beaucoup : à ce même étage sur un compteur neuf, il faudrait ${stFmt(fresh)} amulettes pour que pousser vaille le coup.`
                : ` The guarantee counter matters a lot: on the same floor with a fresh counter, pushing would only pay from ${stFmt(fresh)} amulets.`) : ''));
        }

        // La boutique reste ouverte 24 h de plus que l'événement : c'est le piège
        // à dire, puisque le seul vrai risque est de finir sur une montée non encaissée.
        const dl = stDeadline();
        if (dl) bits.push(fr
            ? `L’événement ferme dans <strong>${dl}</strong> — la boutique, elle, reste ouverte 24 h de plus, mais seulement pour dépenser les Jetons. Une montée laissée en plan à la fermeture ne rapporte rien.`
            : `The event closes in <strong>${dl}</strong> - the shop stays open 24 h longer, but only to spend Tokens. A climb left hanging when it closes pays nothing.`);

        if (s.pity > 0 && s.floor < a.peak) bits.push(fr
            ? `Tes ${s.pity} échec(s) ne sont pas perdus : la prochaine exploration monte à ${stPct(a.pity[s.pity])}, contre ${stPct(a.pity[0])} sur un compteur neuf — et la 5ᵉ est garantie.`
            : `Your ${s.pity} failed push(es) are not wasted: the next exploration ascends at ${stPct(a.pity[s.pity])} against ${stPct(a.pity[0])} on a fresh counter - and the 5th is guaranteed.`);
        verdict = bits.map(b => `<p>${b}</p>`).join('');
    }

    // --- jusqu'où ---
    // Au sommet il n'y a plus d'étage à atteindre : la boucle ne produit aucune
    // ligne, et le bloc entier se tait plutôt que d'afficher un titre, un
    // sous-titre et un tableau vide. Être au sommet est un état normal — le
    // verdict a d'ailleurs son propre message pour lui.
    let reachRows = '';
    for (let T = Math.max(2, s.floor + 1); T <= a.peak; T++) {
        reachRows += `<tr><td class="c-pack">${stT('floor')} ${T}</td>
            <td class="stx-odds"><span class="stx-meter"><span style="width:${Math.round(reach[T] * 100)}%"></span></span><span class="stx-odds-v">${stPct(reach[T])}</span></td>
            <td class="rgt">${stFmt(ftClimbCostFrom(a, T, s.floor, s.pity))}</td></tr>`;
    }

    // --- où encaisser ---
    let cash = '';
    if (tok) {
        const rows = [];
        let bt = null;
        for (let T = 2; T <= a.peak; T++) {
            const st = ftThresholdStats(a, tok, T);
            rows.push({ T, st });
            if (!bt || st.ratio > bt.st.ratio) bt = { T, st };
        }
        cash = `<h3>${stT('cashTitle')}</h3><p class="sx-section-sub">${stT('cashSub')}</p>` + stTableHtml(
            `<th class="c-pack">${stT('thRule')}</th><th class="rgt">${stT('thCost')}</th><th class="rgt">${stT('thGain')}</th><th class="rgt">${stT('thRatio')}</th>`,
            rows.map(r => `<tr class="${r.T === bt.T ? 'stx-best' : ''}">
                <td class="c-pack">${stT('ruleAt')} ${r.T}${r.T === bt.T ? ` <span class="stx-tag">${stT('bestRule')}</span>` : ''}</td>
                <td class="rgt">${stFmt(r.st.cost)}</td><td class="rgt">${stFmt(r.st.gain)}</td>
                <td class="rgt stx-ratio">${stFmt(r.st.ratio, 2)}</td></tr>`).join(''));
    }

    // --- coût d'une montée ---
    const EA = ftExpectedAttempts(a.pity), peakCost = ftClimbStats(a, a.peak).cost;
    let climb = '';
    for (let i = 1; i <= a.peak; i++) {
        climb += `<tr><td class="c-pack">${stT('floor')} ${i}</td>
            <td class="rgt">${a.cost[i] ? stFmt(a.cost[i]) : '—'}</td>
            <td class="rgt">${a.cost[i] ? stFmt(EA * a.cost[i]) : '—'}</td>
            <td class="rgt">${i < a.peak ? stFmt(peakCost[i]) : '—'}</td></tr>`;
    }

    // --- Fanstars et Forteresse ---
    const drops = ST.mech.fanstars.drops;
    let eFan = 0;
    for (const k in drops) eFan += (+k) * drops[k];
    const peaks = ST.mech.fanstars.needed / eFan;
    const fortClimb = ftClimbStats(f, f.peak).cost[1];
    const fortKpis = [
        { label: stT('fortPeaks'), value: stFmt(peaks, 2) },
        { label: stT('fortClear'), value: stFmt(fortClimb), sub: stT('amulets') }
    ];
    if (ftok && tok) {
        const rate = ftok[f.peak] / fortClimb;
        fortKpis.push({ label: stT('fortRate'), value: stFmt(rate, 1), sub: stT('perAmulet'), tone: 'sxe-t-good' });
        const cyCost = peaks * full + fortClimb, cyGain = peaks * tok[a.peak] + ftok[f.peak];
        fortKpis.push({ label: stT('fortCycle'), value: stFmt(cyGain / cyCost, 1), sub: stT('perAmulet') });
    }

    // Le champ « amulettes dépensées » de shop-event.js est DÉPLACÉ ici, pas
    // recopié : il garde son câblage d'origine. On le détache avant d'écraser le
    // bloc, sinon notre propre re-rendu le détruirait — il vit dans notre DOM.
    const explore = box.querySelector('.sxe-explore');
    const exploreFact = explore ? explore.closest('.sx-fact') : null;
    if (exploreFact) exploreFact.remove();

    box.innerHTML = `
        <h2>${stT('title')}</h2>
        <p class="sx-section-sub">${stT('intro')}</p>
        ${stKpiHtml(kpis)}
        ${stReconcileHtml(total, spent, derived, future, pocket, stEventDayNow(c), muted)}
        ${stControlsHtml()}
        <div class="stx-verdict">${verdict}</div>
        ${reachRows ? `<h3>${stT('reachTitle')}</h3><p class="sx-section-sub">${stT('reachSub')}</p>
        ${stTableHtml(`<th class="c-pack">${stT('thReach')}</th><th>${stT('thOdds')}</th><th class="rgt">${stT('thCostFrom')}</th>`, reachRows)}` : ''}
        ${cash}
        <h3>${stT('climbTitle')}</h3>
        ${stTableHtml(`<th class="c-pack">${stT('thFloor')}</th><th class="rgt">${stT('thOne')}</th><th class="rgt">${stT('thAsc')}</th><th class="rgt">${stT('thPeak')}</th>`, climb)}
        <h3>${stT('fortTitle')}</h3>
        ${stKpiHtml(fortKpis)}`;

    // Réinsertion : soit celui qu'on venait de détacher, soit celui que
    // shop-event.js vient de reconstruire dans sa propre barre d'outils.
    const slot = box.querySelector('#stx-explore-slot');
    if (slot) {
        const fresh = exploreFact
            || (host.querySelector('.sxe-explore') && host.querySelector('.sxe-explore').closest('.sx-fact'));
        if (fresh) slot.appendChild(fresh);
    }
}

/* --------------------------------------------------------------------------
   4. Interactions et démarrage
   -------------------------------------------------------------------------- */

/* Un seul écouteur, posé sur #sp-event qui survit aux re-rendus (seul son
   contenu est remplacé). Les contrôles portent un `data-se`, si bien que la
   remise du focus de shop-event.js les rattrape aussi. */
function stBind(host) {
    const clamp = (k, v) => k === 'floor'
        ? Math.max(1, Math.min(ST.area.peak, v))
        : Math.max(0, Math.min(ST.area.pity.length - 1, v));

    host.addEventListener('click', e => {
        const step = e.target.closest('[data-st-step]');
        if (step) {
            const [k, d] = step.dataset.stStep.split(':');
            ST.state[k] = clamp(k, (Number(ST.state[k]) || 0) + Number(d));
            stSave(); stRedraw();
            return;
        }
        const act = e.target.closest('[data-st-act]');
        if (act && !act.disabled) { stAct(act.dataset.stAct); return; }
        if (e.target.closest('[data-st-reset]')) {
            ST.state.tokens = stDefaultTokens();
            stSave(); stRedraw();
        }
    });
    // `toggle` ne remonte pas : on l'écoute en phase de capture.
    host.addEventListener('toggle', e => {
        const d = e.target.closest && e.target.closest('[data-st-toks]');
        if (!d) return;
        ST.state.toksOpen = d.open;
        stSave();
    }, true);

    host.addEventListener('change', e => {
        const set = e.target.closest('[data-st-set]');
        if (set) {
            const k = set.dataset.stSet;
            ST.state[k] = clamp(k, Math.round(parseFloat(String(set.value).replace(',', '.')) || 0));
            stSave(); stRedraw();
            return;
        }
        const tok = e.target.closest('[data-st-tok]');
        if (tok) {
            const v = String(tok.value).trim();
            // Un séparateur de milliers ne doit pas décimer la valeur. `parseFloat`
            // lisait « 1 600 » comme 1 et « 1,600 » comme 1,6 — arrondi à 2 : le
            // joueur qui recopiait son écran de jeu empoisonnait en silence le
            // verdict, le seuil de bascule et tout le tableau « où encaisser ».
            // Le barème ne porte que des ENTIERS : on ne garde donc que les
            // chiffres, comme `seSetExplore` le fait déjà dans shop-event.js.
            const chiffres = v.replace(/\D/g, '');
            ST.state.tokens[tok.dataset.stTok] = v === '' ? '' : (chiffres === '' ? 0 : parseInt(chiffres, 10));
            stSave(); stRedraw();
        }
    });
}

/* Nos propres saisies ne changent rien au calcul de shop-event.js : on redessine
   notre bloc seul, à partir de son dernier résultat. Repasser par
   ShopEvent.refresh() rejouerait toute la valorisation pour rien. */
/* Différé d'un tour de boucle, comme `seAfter()` : rendre pendant un `change`
   détruit le champ en cours de blur, et la tabulation retombe sur <body> au lieu
   du champ suivant. */
let ST_PENDING = null;
/* Ce qui vient de se passer en jeu. Chaque exploration coûte le prix de l'étage
   d'où elle part, qu'elle réussisse ou non — c'est ce report que le joueur
   oubliait de faire à la main, et sans lequel « amulettes dépensées » dérive.
   Encaisser ne coûte rien : cela renvoie à l'étage 1, compteur remis à zéro. */
function stAct(kind) {
    const a = ST.area, s = ST.state;
    const cost = a.cost[s.floor] || 0;
    const spent = Number((stEventPlan() || {}).explore) || 0;

    if (kind === 'fail') {
        if (s.floor >= a.peak || s.pity >= a.pity.length - 1) return;
        s.pity++;
        stSave();
        window.seSetExplore(spent + cost);      // relance le rendu complet
        return;
    }
    if (kind.indexOf('up') === 0) {
        if (s.floor >= a.peak) return;
        // Le nombre d'étages est CHOISI : une montée peut valoir +1, +2 ou +3
        // pour une seule exploration payée. C'est le joueur qui sait laquelle il
        // a eue, et une seule exploration est facturée quel que soit le saut.
        const jump = Math.max(1, Math.min(3, parseInt(kind.slice(2), 10) || 1));
        s.floor = Math.min(a.peak, s.floor + jump);
        s.pity = 0;
        stSave();
        window.seSetExplore(spent + cost);
        return;
    }
    if (kind === 'claim') {
        if (s.floor < a.claimFrom) return;
        s.floor = 1;
        s.pity = 0;
        stSave();
        stRedraw();                              // aucun coût : pas de re-calcul boutique
    }
}

function stRedraw() {
    if (ST_PENDING) return;
    ST_PENDING = setTimeout(() => { ST_PENDING = null; stRedrawNow(); }, 0);
}
function stRedrawNow() {
    const host = document.getElementById('sp-event');
    if (!host || !ST.last) return;
    // Le rendu remplace tout le bloc : sans cela, chaque frappe éjecterait le
    // clavier et le lecteur d'écran. Même mécanique que shop-event.js, sur les
    // mêmes attributs `data-se`.
    const ae = document.activeElement;
    const key = (ae && host.contains(ae) && ae.getAttribute) ? ae.getAttribute('data-se') : null;
    stRender(host, ST.last);
    if (key) {
        const el = host.querySelector(`[data-se="${key}"]`);
        if (el && !el.disabled) el.focus({ preventScroll: true });
    }
}

/* --------------------------------------------------------------------------
   5. Mode d'emploi

   Cette boutique porte une section que les autres n'ont pas ; c'est donc à ce
   module d'en écrire l'aide, pas à `shop-page.js`. Il expose `spHelpExtras`, qui
   reçoit la configuration du mode d'emploi et y ajoute son propre chapitre — plutôt
   que d'allonger de sept points une liste qui parlait d'autre chose.

   Posé au premier niveau, PAS dans l'IIFE ci-dessous : `shop-page.js` construit
   son aide après un `await` réseau, quand tous les scripts sont analysés depuis
   longtemps — mais un `await` de notre côté nous ferait passer après lui. Un
   visiteur au `shop-page.js` périmé (le site n'a pas de cache-busting) n'appelle
   simplement pas le hook : il voit l'aide d'avant, jamais une erreur.
   -------------------------------------------------------------------------- */

window.spHelpExtras = function (cfg) {
    if (window.SHOP_SLUG !== 'theater-shop') return;
    const steps = {
        FR: [
            "Sous le détail des gains, cette boutique a une section de plus : « Ce que valent tes amulettes ». Les packs du Théâtre versent des Amulettes Fantaisie, jamais des Jetons — les Amulettes servent à explorer le Théâtre, et ce sont les étages atteints qui paient les Jetons. Cette section est ce chaînon manquant.",
            "Commence par relever dans le jeu ton « Étage actuel » et tes « Échecs d'affilée » : tout le reste en découle. Les échecs ne sont pas perdus, c'est la garantie du Théâtre — 10 % de chance de monter sur un compteur neuf, puis 30, 60, 80, et 100 % à la cinquième exploration.",
            "Ensuite, après chaque exploration en jeu, clique sur ce que tu viens de faire : « échouer », « monter » +1, +2 ou +3, ou « encaisser ». L'étage, le compteur et les « Amulettes Fantaisie dépensées » se mettent à jour ensemble. Un saut de deux ou trois étages ne coûte qu'une seule exploration — d'où les trois boutons.",
            "Deux chiffres à ne pas confondre. « Amulettes en poche » est le seul qui doive correspondre au jeu aujourd'hui ; « À dépenser d'ici la fin » y ajoute les packs des jours à venir et les missions pas encore faites, et c'est sur celui-là qu'on raisonne. Si le solde en poche ne colle pas au jeu, corrige la grille d'achats au-dessus.",
            "« Pousse » ou « Encaisse » répond à une seule question : tenter l'étage suivant, ou prendre la récompense et repartir de l'étage 1 ? La réponse dépend d'où tu es et de ce qu'il te reste — un gros budget rend la poussée payante, un petit budget non. La page donne le seuil exact où le conseil bascule.",
            "Les trois tableaux disent la même chose sous trois angles : jusqu'où tes amulettes t'emmènent, à quel étage encaisser rapporte le plus par amulette, et ce que coûte chaque montée. Le dernier bloc chiffre la Forteresse, qui s'ouvre avec les Fanstars ramassés en chemin.",
            "Le barème « Jetons donnés par chaque étage » est un relevé de serveur — le jeu ne le publie nulle part. S'il diffère chez toi, corrige-le : tout ce qui précède se recalcule, et tes valeurs sont conservées et emportées par la Sauvegarde Globale."
        ],
        EN: [
            "Below the reward breakdown, this shop has one extra section: “What your amulets are worth”. Theater packs pay Fantasy Amulets, never Tokens — Amulets are what you spend exploring the Theater, and the floors you reach are what pay the Tokens. This section is that missing link.",
            "Start by reading your “Current floor” and “Failed pushes in a row” off the game: everything else follows from those two. Failed pushes are not wasted, they are the Theater's guarantee — a 10% chance of going up on a fresh counter, then 30, 60, 80, and 100% on the fifth exploration.",
            "From then on, after each exploration in game, click what you just did: “failed”, “went up” +1, +2 or +3, or “cashed in”. The floor, the counter and the “Fantasy Amulets spent” field all move together. A jump of two or three floors still costs a single exploration — hence the three buttons.",
            "Two figures not to confuse. “Amulets in hand” is the only one that should match the game today; “Amulets left to spend” adds the packs of the days ahead and the missions not yet done, and that is the one to plan on. If the in-hand figure does not match the game, fix the purchase grid above.",
            "“Push” or “Cash in” answers one question: try the next floor, or take the reward and start again from floor 1? The answer depends on where you are and what you have left — a large budget makes pushing pay, a small one does not. The page gives the exact budget where the advice flips.",
            "The three tables say the same thing from three angles: how far your amulets take you, which floor pays the most tokens per amulet to cash in on, and what each climb costs. The last block prices the Fortress, which opens with the Fanstars picked up along the way.",
            "The “Tokens paid by each floor” table is one server's reading — the game publishes it nowhere. If yours differs, correct it: everything above recalculates, and your values are kept and carried by the Global Backup."
        ]
    };
    cfg.sections = (cfg.sections || []).concat([{
        title: { FR: 'Ce que valent tes amulettes', EN: 'What your amulets are worth' },
        steps: steps
    }]);
};

(async function () {
    if (window.SHOP_SLUG !== 'theater-shop') return;   // module propre à cette boutique
    const host = document.getElementById('sp-event');
    if (!host) return;

    try {
        const r = await scFetchData('data/events/fantasy-theater.json');
        if (!r.ok) return;
        ST.mech = await r.json();
    } catch (e) { console.error('fantasy-theater', e); return; }
    if (!ST.mech || !ST.mech.theater) return;

    const jump = { 1: ST.mech.jump['1'], 2: ST.mech.jump['2'], 3: ST.mech.jump['3'] };
    ST.area = { id: 'theater', peak: ST.mech.theater.peak, cost: ST.mech.theater.costByFloor,
        pity: ST.mech.pity.chances, jump, claimFrom: ST.mech.rules.claimAllowedFromFloor };
    ST.fortress = { id: 'fortress', peak: ST.mech.fortress.peak, cost: ST.mech.fortress.costByFloor,
        pity: ST.mech.pity.chances, jump, claimFrom: ST.mech.rules.claimAllowedFromFloor };

    const saved = safeParse(stKey(), {}) || {};
    ST.state = Object.assign({}, ST_DEFAULTS, saved);
    // Borner AVANT tout calcul : ces deux valeurs indexent directement les tables
    // du moteur. Un état hors bornes — reliquat de l'ancienne page, ou sauvegarde
    // importée depuis un autre appareil, ce que la Sauvegarde Globale rend
    // possible — lisait hors du Float64Array et affichait des « NaN% ».
    ST.state.floor = Math.max(1, Math.min(ST.area.peak, Math.round(Number(ST.state.floor)) || 1));
    ST.state.pity = Math.max(0, Math.min(ST.area.pity.length - 1, Math.round(Number(ST.state.pity)) || 0));
    ST.state.tokens = Object.assign({}, stDefaultTokens(), saved.tokens || {});
    // Reprise d'un état de l'ancienne page autonome : elle portait aussi le plan
    // d'achat, que la grille de shop-event.js tient désormais. On ne garde que
    // ce qui reste à nous, sinon deux plans coexisteraient sans se voir.
    ['stock', 'spent', 'days', 'daysSetOn', 'buys', 'outside', 'missionsOff', 'packId', 'free']
        .forEach(k => delete ST.state[k]);
    if (Object.keys(saved).some(k => ['stock', 'buys', 'days'].indexOf(k) >= 0)) stSave();

    stBind(host);

    // Point d'extension de shop-event.js : il nous passe son calcul à chaque rendu.
    window.seExtras = function (h, c) {
        ST.last = c;
        // shop-event.js a déjà chargé le fichier de l'événement : on y lit la
        // fermeture plutôt que de refaire une requête pour une seule date.
        const meta = stEventData() && stEventData()._meta;
        if (!ST.eventEnd && meta) ST.eventEnd = meta.endsAt;
        let box = h.querySelector('#stx-root');
        if (!box) {
            // Placé à la fin de la section événement, APRÈS le panneau « Mes achats »
            // et sa note de source : la suite logique de « voilà ce que j'achète »
            // -> « voilà ce que ça vaut ».
            //
            // À la fin de la SECTION, pas du panneau. Le panneau est un `<details>`
            // dont l'état plié est enregistré : logée dedans, la section disparaissait
            // d'un clic sur « Mes achats », et pour de bon — alors que l'intro de la
            // page et le mode d'emploi la promettent tous les deux.
            const sec = h.querySelector('.sxe-section') || h.firstElementChild || h;
            box = document.createElement('div');
            box.id = 'stx-root';
            box.className = 'stx-root';
            sec.appendChild(box);
        }
        stRender(h, c);
    };

    if (window.ShopEvent && typeof ShopEvent.refresh === 'function') ShopEvent.refresh();
})();
