/* Plan d'avancement des familiers — moteur de js/pets-plan.js.

   Ce que ces tests verrouillent, et pourquoi :

   1. LES CHIFFRES DE DÉPART. Le coût d'un avancement et le score qu'il rapporte
      se lisent dans deux fichiers différents (pets_db.json pour les quantités,
      pets_event.json pour le barème). Une erreur d'indice sur `petFood[]` ne se
      verrait nulle part à l'écran — elle donnerait juste un plan faux.

   2. L'OPTIMALITÉ. Le plan ne dépend PAS de l'ordre des étapes : le surplus d'un
      coffre ouvert reste en stock, donc un plan se résume à « combien
      d'avancements par familier ». Sur des cas assez petits, on peut donc
      énumérer TOUTES les combinaisons et exiger que le moteur trouve exactement
      le meilleur total. Un glouton simple s'y trompait de 10 %.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createContext, run, ROOT } from './harness.mjs';

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const PETS = read('data/pets_db.json').pets;
const SCALE = read('data/pets_event.json');
const MATS = ['growthManual', 'nutrientPotion', 'promotionMedallion'];

function engine() {
  return createContext(['js/storage-keys.js', 'js/pets-plan.js']);
}
const compute = (ctx, arg) => JSON.parse(run(ctx, `JSON.stringify(ptPlanCompute(${JSON.stringify(arg)}))`));

/* L'optimum exact, par énumération de tous les vecteurs (k1…kn). Utilisable
   seulement sur peu de familiers — c'est justement ce qui en fait un juge. */
function bestPossible(ctx, pets, stock) {
  const ladders = pets.map(p =>
    JSON.parse(run(ctx, `JSON.stringify(ptLadder(${JSON.stringify(p)}, undefined, ${JSON.stringify(SCALE.advancementScore)}, ${SCALE.pointsPerScore}))`)).rungs);
  const k = new Array(pets.length).fill(0);
  let best = 0;
  (function rec(i) {
    if (i === pets.length) {
      const tot = { petFood: 0, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 };
      let pts = 0;
      for (let j = 0; j < pets.length; j++) for (let t = 0; t < k[j]; t++) {
        pts += ladders[j][t].points;
        for (const m in tot) tot[m] += ladders[j][t].cost[m];
      }
      if (tot.petFood > stock.petFood) return;
      let chests = 0;
      for (const m of MATS) {
        const short = tot[m] - stock[m];
        if (short > 0) chests += Math.ceil(short / SCALE.chest.choices[m]);
      }
      if (chests > stock.chest) return;
      if (pts > best) best = pts;
      return;
    }
    for (let v = 0; v <= ladders[i].length; v++) { k[i] = v; rec(i + 1); }
    k[i] = 0;
  })(0);
  return best;
}

test('le coût d\'un avancement se lit bien dans les deux fichiers', () => {
  const ctx = engine();
  const wolf = PETS.find(p => p.id === 'gray-wolf');
  // petFood[i] = niveau (i+1) -> (i+2) : monter de 1 à 10, c'est les 9 premiers.
  const nine = wolf.petFood.slice(0, 9).reduce((a, b) => a + b, 0);
  assert.equal(Number(run(ctx, `ptFoodBetween(${JSON.stringify(wolf)}, 1, 10)`)), nine);
  assert.equal(Number(run(ctx, `ptFoodBetween(${JSON.stringify(wolf)}, 10, 10)`)), 0, 'déjà au cap : rien à payer');

  const l = JSON.parse(run(ctx, `JSON.stringify(ptLadder(${JSON.stringify(wolf)}, undefined, ${JSON.stringify(SCALE.advancementScore)}, ${SCALE.pointsPerScore}))`));
  assert.equal(l.rungs.length, wolf.advancements.length, 'un barreau par avancement');
  assert.equal(l.rungs[0].cost.growthManual, wolf.advancements[0].growthManual);
  assert.equal(l.rungs[0].points, SCALE.advancementScore['10'] * SCALE.pointsPerScore);
});

test('un familier déjà avancé ne repropose pas ce qui est fait', () => {
  const ctx = engine();
  const wolf = PETS.find(p => p.id === 'gray-wolf');
  const state = { 'gray-wolf': { lvl: 25, adv: { 10: true, 20: true } } };
  const l = JSON.parse(run(ctx, `JSON.stringify(ptLadder(${JSON.stringify(wolf)}, ${JSON.stringify(state['gray-wolf'])}, ${JSON.stringify(SCALE.advancementScore)}, ${SCALE.pointsPerScore}))`));
  assert.equal(l.rungs[0].cap, 30, 'le prochain avancement est le cap 30');
  assert.equal(l.rungs[0].fromLevel, 25, 'et il part du niveau 25, pas de 20');
  assert.equal(l.rungs.length, 3, 'il reste les caps 30, 40 et 50');
});

test('un niveau au-dessus d\'un cap vaut avancement fait, comme dans la promenade', () => {
  const ctx = engine();
  const wolf = PETS.find(p => p.id === 'gray-wolf');
  // Niveau 25 sans aucun avancement enregistré : impossible en jeu, donc les
  // caps 10 et 20 sont forcément faits. Même normalisation que js/pets.js.
  const cur = JSON.parse(run(ctx, `JSON.stringify(ptCursor(${JSON.stringify(wolf)}, {lvl:25, adv:{}}))`));
  assert.equal(cur.i, 2);
});

test('stock vide : aucun plan, mais pas de plantage', () => {
  const ctx = engine();
  const r = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock: {} });
  assert.equal(r.steps.length, 0);
  assert.equal(r.totalPoints, 0);
  assert.equal(r.remaining.length, PETS.length, 'les 14 familiers restent à faire');
});

test('stock illimité : tout est fait, et le total est celui du barème', () => {
  const ctx = engine();
  const big = 9e9;
  const r = compute(ctx, { pets: PETS, scale: SCALE, state: {},
    stock: { petFood: big, growthManual: big, nutrientPotion: big, promotionMedallion: big, chest: 0 } });
  const advTotal = PETS.reduce((n, p) => n + p.advancements.length, 0);
  const scoreTotal = PETS.reduce((n, p) =>
    n + p.advancements.map((_, i) => SCALE.advancementScore[String((i + 1) * 10)]).reduce((a, b) => a + b, 0), 0);
  assert.equal(r.steps.length, advTotal);
  assert.equal(r.totalScore, scoreTotal);
  assert.equal(r.totalPoints, scoreTotal * SCALE.pointsPerScore);
  assert.equal(r.done, true);
});

test('familiers déjà au maximum : plus rien à proposer', () => {
  const ctx = engine();
  const state = {};
  for (const p of PETS) {
    const adv = {};
    for (let c = 10; c <= p.maxLevel; c += 10) adv[c] = true;
    state[p.id] = { lvl: p.maxLevel, adv };
  }
  const r = compute(ctx, { pets: PETS, scale: SCALE, state,
    stock: { petFood: 9e9, growthManual: 9e9, nutrientPotion: 9e9, promotionMedallion: 9e9, chest: 9e9 } });
  assert.equal(r.steps.length, 0);
  assert.equal(r.done, true);
});

test('le plan ne dépense jamais plus que le stock', () => {
  const ctx = engine();
  const stock = { petFood: 260000, growthManual: 310, nutrientPotion: 44, promotionMedallion: 7, chest: 23 };
  const r = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock });
  for (const k of ['petFood', ...MATS]) assert.ok(r.spent[k] <= stock[k] + r.spent.chest * 99, k);
  assert.ok(r.spent.chest <= stock.chest, 'coffres dépensés');
  assert.ok(r.left.petFood >= 0 && r.left.chest >= 0, 'aucun reste négatif');
  for (const m of MATS) assert.ok(r.left[m] >= 0, 'reste ' + m);
  // La nourriture ne peut venir que du stock : aucun coffre n'en donne.
  assert.equal(r.spent.petFood + r.left.petFood, stock.petFood);
});

test('les coffres ouverts couvrent exactement ce qui manquait', () => {
  const ctx = engine();
  // Aucun matériau, que des coffres : tout doit sortir des coffres.
  const stock = { petFood: 400000, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0, chest: 40 };
  const r = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock });
  const split = r.chestSplit;
  assert.equal(split.growthManual + split.nutrientPotion + split.promotionMedallion, r.spent.chest);
  assert.ok(r.spent.chest <= stock.chest);
  for (const m of MATS) {
    const given = split[m] * SCALE.chest.choices[m];
    assert.equal(given - r.spent[m], r.left[m], 'le surplus d\'ouverture reste en stock (' + m + ')');
  }
});

test('le plan trouve le meilleur total possible, vérifié par énumération', () => {
  const ctx = engine();
  const cases = [
    [4, { petFood: 60000,   growthManual: 200, nutrientPotion: 30,  promotionMedallion: 5,  chest: 10 }],
    [4, { petFood: 150000,  growthManual: 400, nutrientPotion: 60,  promotionMedallion: 20, chest: 25 }],
    [5, { petFood: 30000,   growthManual: 120, nutrientPotion: 10,  promotionMedallion: 0,  chest: 6 }],
    [5, { petFood: 400000,  growthManual: 100, nutrientPotion: 200, promotionMedallion: 40, chest: 40 }],
    [6, { petFood: 250000,  growthManual: 500, nutrientPotion: 80,  promotionMedallion: 10, chest: 15 }],
    [6, { petFood: 1000000, growthManual: 50,  nutrientPotion: 20,  promotionMedallion: 5,  chest: 120 }],
    [4, { petFood: 9e9,     growthManual: 150, nutrientPotion: 25,  promotionMedallion: 3,  chest: 0 }],
    [6, { petFood: 80000,   growthManual: 0,   nutrientPotion: 0,   promotionMedallion: 0,  chest: 60 }],
    [5, { petFood: 120000,  growthManual: 60,  nutrientPotion: 200, promotionMedallion: 0,  chest: 3 }],
  ];
  for (const [n, stock] of cases) {
    const pets = PETS.slice(0, n);
    const got = compute(ctx, { pets, scale: SCALE, state: {}, stock }).totalPoints;
    assert.equal(got, bestPossible(ctx, pets, stock),
      `${n} familiers, stock ${JSON.stringify(stock)}`);
  }
});

test('le classement met en tête ce qui rapporte le plus par coffre', () => {
  const ctx = engine();
  const rows = JSON.parse(run(ctx, `JSON.stringify(ptRankAll(${JSON.stringify({ pets: PETS, scale: SCALE, state: {} })}))`));
  assert.equal(rows.length, PETS.reduce((n, p) => n + p.advancements.length, 0));
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].perChest >= rows[i].perChest, 'ordre décroissant');
});

test('« tout au maximum » et « le plan couvre tout » ne se confondent pas', () => {
  const ctx = engine();
  const big = { petFood: 9e9, growthManual: 9e9, nutrientPotion: 9e9, promotionMedallion: 9e9, chest: 0 };

  // Stock illimité mais familiers au niveau 1 : le plan fait tout, or rien n'était
  // maxé au départ. Confondre les deux affichait « tous tes familiers sont au
  // maximum » au-dessus d'un plan de 117 étapes.
  const fresh = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock: big });
  assert.equal(fresh.done, true, 'le plan ne laisse rien');
  assert.equal(fresh.allMaxed, false, 'mais rien n\'était au maximum au départ');
  assert.ok(fresh.steps.length > 0);

  const maxed = {};
  for (const p of PETS) {
    const adv = {};
    for (let c = 10; c <= p.maxLevel; c += 10) adv[c] = true;
    maxed[p.id] = { lvl: p.maxLevel, adv };
  }
  const nothing = compute(ctx, { pets: PETS, scale: SCALE, state: maxed, stock: big });
  assert.equal(nothing.allMaxed, true);
  assert.equal(nothing.steps.length, 0);
});

test('ce qui manque sépare la nourriture (un « et ») des matériaux (un « ou »)', () => {
  const ctx = engine();
  // Assez de nourriture pour un premier cap, mais aucun matériau et aucun coffre.
  const r = compute(ctx, { pets: PETS.slice(0, 1), scale: SCALE, state: {},
    stock: { petFood: 1000, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0, chest: 0 } });
  const m = r.remaining[0].missing;
  assert.ok(r.remaining[0].blocked);
  assert.ok(m.petFood > 0, 'la nourriture manque aussi');
  assert.ok(m.mats.growthManual > 0, 'les manuels manquent');
  // Le nombre de coffres n'est PAS un manque de plus : c'est l'autre façon de
  // couvrir exactement les mêmes matériaux.
  assert.equal(m.chestsNeeded, Math.ceil(m.mats.growthManual / SCALE.chest.choices.growthManual));
  assert.equal(m.chestsShort, m.chestsNeeded, 'aucun coffre en stock : le manque est le besoin entier');
  assert.equal(m.chestsHave, 0);
});

test('des coffres en stock réduisent le manque, et peuvent l\'effacer', () => {
  const ctx = engine();
  const wolf = PETS.slice(0, 1);
  const base = { petFood: 9e9, growthManual: 0, nutrientPotion: 0, promotionMedallion: 0 };
  // Le cap 10 du Loup Gris coûte 15 manuels = 3 coffres (7 par coffre).
  const need = Math.ceil(wolf[0].advancements[0].growthManual / SCALE.chest.choices.growthManual);

  const short = compute(ctx, { pets: wolf, scale: SCALE, state: {}, stock: { ...base, chest: need - 1 } });
  assert.equal(short.steps.length, 0, 'un coffre de moins : rien n\'est payable');
  assert.equal(short.remaining[0].missing.chestsShort, 1);
  assert.equal(short.remaining[0].missing.chestsHave, need - 1);

  const ok = compute(ctx, { pets: wolf, scale: SCALE, state: {}, stock: { ...base, chest: need } });
  assert.ok(ok.steps.length > 0, 'juste assez de coffres : l\'avancement passe');
  // Et sur l'étape SUIVANTE, ce qui manque ne compte pas deux fois les coffres.
  const next = ok.remaining[0].missing;
  assert.equal(next.matsShort, next.chestsShort > 0);
});

test('le filtre écarte les familiers décochés, et rien d\'autre', () => {
  const ctx = engine();
  const ids = PETS.map(p => p.id);
  const off = ['gray-wolf', 'lynx'];
  const keptIds = JSON.parse(run(ctx,
    `JSON.stringify(ptFilterPets(${JSON.stringify(PETS.map(p => ({ id: p.id })))}, ${JSON.stringify(off)}).map(p => p.id))`));
  assert.deepEqual(keptIds, ids.filter(i => !off.includes(i)));

  // Un identifiant inconnu dans la liste des exclus ne doit rien écarter.
  const withGhost = JSON.parse(run(ctx,
    `JSON.stringify(ptFilterPets(${JSON.stringify(PETS.map(p => ({ id: p.id })))}, ["pet-qui-n-existe-pas"]).map(p => p.id))`));
  assert.deepEqual(withGhost, ids);

  // On stocke les EXCLUS : un familier ajouté plus tard entre au plan tout seul.
  const future = PETS.map(p => ({ id: p.id })).concat([{ id: 'gen-8-dragon' }]);
  const withNew = JSON.parse(run(ctx, `JSON.stringify(ptFilterPets(${JSON.stringify(future)}, ${JSON.stringify(off)}).map(p => p.id))`));
  assert.ok(withNew.includes('gen-8-dragon'), 'un nouveau familier n\'est pas exclu par défaut');
});

test('un familier écarté ne paraît ni dans le plan ni dans le classement', () => {
  const ctx = engine();
  const stock = { petFood: 400000, growthManual: 600, nutrientPotion: 90, promotionMedallion: 15, chest: 40 };

  const all = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock });
  assert.ok(all.steps.some(s => s.petId === 'gray-wolf'), 'le Loup Gris est au plan quand tout est coché');

  const keptPets = PETS.filter(p => p.id !== 'gray-wolf');
  const sans = compute(ctx, { pets: keptPets, scale: SCALE, state: {}, stock });
  assert.ok(!sans.steps.some(s => s.petId === 'gray-wolf'), 'il en sort une fois décoché');
  assert.ok(!sans.remaining.some(r => r.petId === 'gray-wolf'), 'et il ne bloque plus rien');
  const rank = JSON.parse(run(ctx, `JSON.stringify(ptRankAll(${JSON.stringify({ pets: keptPets, scale: SCALE, state: {} })}))`));
  assert.ok(!rank.some(r => r.petId === 'gray-wolf'), 'ni dans le classement');
});

test('« commencé » ne se déduit que d\'une trace réelle du joueur', () => {
  const ctx = engine();
  const state = {
    'gray-wolf': { lvl: 1, adv: {} },          // la promenade l'écrit toute seule
    'lynx':      { lvl: 12, adv: { 10: true } },
    'bison':     { lvl: 1, adv: { 10: true } } // niveau 1 mais un avancement coché
  };
  const started = (id) => run(ctx, `ptIsStarted(${JSON.stringify(state)}, ${JSON.stringify(id)})`);
  assert.equal(started('gray-wolf'), false, 'niveau 1 sans avancement : pas commencé');
  assert.equal(started('lynx'), true);
  assert.equal(started('bison'), true);
  assert.equal(started('cheetah'), false, 'absent de la sauvegarde : pas commencé');
});

/* ---------------------------------------------------------------------------
   Constats de l'audit du 08/09/2026, verrouillés ici pour qu'ils ne reviennent pas.
   --------------------------------------------------------------------------- */

test('le contre-exemple de l\'audit est résolu, et prouvé optimal', () => {
  const ctx = engine();
  // Quatre familiers au niveau 1. Le moteur d'alors sortait 750 000 points,
  // alors que 775 000 étaient payables : les six gloutons et leur recherche
  // locale ne voyaient pas qu'il fallait retirer deux avancements au Lynx ET
  // un au Guépard pour en offrir deux au Bison.
  const stock = { petFood: 560825, growthManual: 828, nutrientPotion: 43, promotionMedallion: 58, chest: 5 };
  const r = compute(ctx, { pets: PETS.slice(0, 4), scale: SCALE, state: {}, stock });
  assert.equal(r.totalPoints, 775000);
  assert.equal(r.proven, true, 'et la recherche exacte a eu le temps de le prouver');
});

test('« prouvé optimal » n\'est jamais annoncé à tort', () => {
  const ctx = engine();
  // La borne de la recherche exacte doit MAJORER ce qui reste atteignable.
  // Trop serrée, elle couperait la meilleure solution tout en affirmant l'avoir
  // balayée — le pire des deux mondes. On la confronte à une énumération.
  let seed = 4242;
  const rnd = (n) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let i = 0; i < 40; i++) {
    const pets = PETS.slice(0, 4);
    const stock = { petFood: rnd(600000), growthManual: rnd(900), nutrientPotion: rnd(200),
                    promotionMedallion: rnd(60), chest: rnd(100) };
    const r = compute(ctx, { pets, scale: SCALE, state: {}, stock });
    const best = bestPossible(ctx, pets, stock);
    assert.ok(r.totalPoints <= best, 'jamais au-dessus de l\'optimum');
    if (r.proven) assert.equal(r.totalPoints, best, `prouvé mais battable : ${JSON.stringify(stock)}`);
  }
});

test('quand la recherche exacte manque de temps, le plan reste servi sans se prétendre optimal', () => {
  const ctx = engine();
  // Les 14 familiers : l'espace est trop grand pour être balayé en 1 ms.
  const stock = { petFood: 1200000, growthManual: 2200, nutrientPotion: 420, promotionMedallion: 140, chest: 180 };
  const rush = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock, exactBudgetMs: 1 });
  assert.equal(rush.proven, false, 'pas de preuve, donc pas d\'affirmation');
  assert.ok(rush.steps.length > 0, 'le plan heuristique est tout de même rendu');
  assert.ok(rush.spent.chest <= stock.chest && rush.left.petFood >= 0, 'et il reste payable');

  // Laisser plus de temps ne peut pas faire baisser le total : la recherche
  // exacte est AMORCÉE par l'heuristique, elle ne remplace rien de moins bon.
  const calm = compute(ctx, { pets: PETS, scale: SCALE, state: {}, stock, exactBudgetMs: 400 });
  assert.ok(calm.totalPoints >= rush.totalPoints, 'plus de temps ne rend jamais moins de points');
});

test('le prix en coffres suit la configuration, pas une constante', () => {
  const ctx = engine();
  // Si le jeu changeait le contenu du coffre, `chest.choices` bougerait et le
  // classement devrait suivre. Codé en dur, il annonçait 7 manuels par coffre
  // quoi qu'en dise le fichier, et affichait des prix faux sans le signaler.
  const alt = JSON.parse(JSON.stringify(SCALE));
  alt.chest.choices.growthManual = 1;
  const row = JSON.parse(run(ctx, `JSON.stringify(ptRankAll(${JSON.stringify({ pets: PETS.slice(0, 1), state: {}, scale: alt })}))`))
    .find(r => r.cap === 10);
  assert.equal(row.chestEq, row.cost.growthManual, 'un manuel par coffre : autant de coffres que de manuels');
});

test('un avancement enregistré à false n\'est pas un avancement fait', () => {
  const ctx = engine();
  const pet = PETS[0];
  // `{10:false}` dit « je n'ai PAS fait cet avancement ». Un simple test de
  // vérité le comptait comme fait, et la chaîne "false" aussi — elle est vraie
  // en JavaScript. Une sauvegarde importée ou retouchée peut en contenir.
  for (const v of [false, 'false', 0, null, '']) {
    const cur = JSON.parse(run(ctx, `JSON.stringify(ptCursor(${JSON.stringify(pet)}, {lvl:10, adv:{10:${JSON.stringify(v)}}}))`));
    assert.equal(cur.caps[cur.i], 10, `adv:{10:${JSON.stringify(v)}} laisse le cap 10 à faire`);
  }
  for (const v of [true, 1, '1', 'true']) {
    const cur = JSON.parse(run(ctx, `JSON.stringify(ptCursor(${JSON.stringify(pet)}, {lvl:10, adv:{10:${JSON.stringify(v)}}}))`));
    assert.equal(cur.caps[cur.i], 20, `adv:{10:${JSON.stringify(v)}} vaut avancement fait`);
  }
  assert.equal(run(ctx, `ptIsStarted({x:{lvl:1, adv:{10:false}}}, 'x')`), false, 'et ce n\'est pas non plus « commencé »');
});

test('un séparateur de milliers n\'est jamais lu comme un décimal', () => {
  // En anglais le champ se met lui-même en forme avec des virgules (« 560,825 »).
  // Les lire comme des décimales ramenait la saisie à 561, puis à 6 au fil des
  // frappes. Un point ou une virgule ne vaut décimal qu'avec un suffixe k / M.
  const ctx = createContext(['js/storage-keys.js', 'js/pets-plan.js']);
  const read = (v) => Number(run(ctx, `ptParseAmount(${JSON.stringify(v)})`));
  assert.equal(read('560,825'), 560825, 'virgule de milliers anglaise');
  assert.equal(read('560 825'), 560825, 'espace insécable française');
  assert.equal(read('1,200'), 1200);
  assert.equal(read('1.200'), 1200);
  assert.equal(read('1,2M'), 1200000, 'la forme abrégée du jeu');
  assert.equal(read('1.5k'), 1500);
  assert.equal(read('1,2m'), 1200000);
  assert.equal(read('-100'), 100, 'un stock ne peut pas être négatif');
  assert.equal(read(''), 0);
  // Et le piège du piège : le champ se formate SEUL en « 1,200 », puis le
  // joueur ajoute « k ». Sans effacer d'abord les séparateurs de milliers,
  // cela donnait 1 200 au lieu de 1 200 000 — mille fois trop peu, en silence.
  assert.equal(read('1,200k'), 1200000);
  assert.equal(read('1 200k'), 1200000);
  assert.equal(read('12,000k'), 12000000);
  assert.equal(read('1,25M'), 1250000, 'deux décimales restent un décimal');
});
