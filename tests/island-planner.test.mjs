import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createContext, readJson, ROOT } from './harness.mjs';

const data = readJson('data/island.json');
const IP = createContext(['js/island_planner.js']).IslandPlanner;

test('données : identifiants uniques, statistiques et images connues', () => {
  const ids = data.buildings.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of data.buildings) {
    assert.ok(data.rarities[b.rarity], `${b.id} : rareté ${b.rarity}`);
    for (const e of IP.effectsOf(b)) assert.ok(data.stats[e.stat], `${b.id} : statistique ${e.stat}`);
    if (b.levelItem) assert.ok(data.items[b.levelItem.item], `${b.id} : objet ${b.levelItem.item}`);
    if (b.blueprint && b.blueprint.image) assert.ok(fs.existsSync(path.join(ROOT, 'img/island', b.blueprint.image + '.webp')), `${b.id} : image du plan manquante`);
    if (b.image) assert.ok(fs.existsSync(path.join(ROOT, 'img/island', b.image + '.webp')), `${b.id} : image manquante`);
    // Vitrine HD (`cutout`) : n'a de sens qu'avec un visuel détouré.
    if (b.cutout !== undefined) assert.ok(b.cutout === true && (b.image || (b.images && b.images.length)), `${b.id} : cutout sans visuel`);
    if (b.images) {
      b.images.forEach((v, i) => {
        assert.ok(fs.existsSync(path.join(ROOT, 'img/island', v.image + '.webp')), `${b.id} : ${v.image} manquante`);
        assert.ok(v.from >= 1 && v.from <= b.maxLevel, `${b.id} : palier ${v.from}`);
        if (i) assert.ok(v.from > b.images[i - 1].from, `${b.id} : paliers dans l'ordre`);
      });
    }
  }
  for (const [k, it] of Object.entries(data.items)) {
    if (it.image) assert.ok(fs.existsSync(path.join(ROOT, 'img/island', it.image + '.webp')), `objet ${k} : image manquante`);
  }
  for (const l of data.tree.levels) assert.ok(data.stats[l.stat.key], `Arbre ${l.level}`);
  assert.equal(data.tree.levels.length, data.tree.maxLevel);
  assert.equal(data.lumberCamp.levels.length, data.lumberCamp.maxLevel);
});

test('prospérité : par niveau ou par exemplaire, effet proportionnel au niveau', () => {
  const s = IP.normalizeState(data, { owned: { table: 4, forge: 3, 'banner-of-hope': 9 } });
  assert.equal(s.owned['banner-of-hope'], 5, 'borné au nombre posable');
  assert.equal(IP.buildingsProsperity(data, s.owned), 4 * 50 + 3 * 200 + 5 * 100);
  const fountain = data.buildings.find((b) => b.id === 'joy-fountain');
  assert.equal(IP.effectValue(fountain, 2), 1.6, 'exemple du classeur : 4 % / 5 × 2');
});

test('coût : le niveau N+1 consomme N+1 exemplaires', () => {
  const forge = data.buildings.find((b) => b.id === 'forge');
  assert.equal(IP.nextCost(forge, 0, 0), 3000);
  assert.equal(IP.nextCost(forge, 3, 0), 4 * 3000, 'exemple du classeur : forge 3 → 4 = 4 forges');
  assert.equal(IP.nextCost(forge, 5, 0), null);
  assert.equal(IP.nextCost(forge, 0, 1), 0, 'exemplaire offert');
});

test('couverture : le moins cher, sans dépasser inutilement', () => {
  const s = IP.normalizeState(data, { tree: 4 });
  const items = IP.purchaseItems(data, s, {});
  // 50 manquants : un Commun (1 000) plutôt qu'un Rare (3 000).
  assert.deepEqual(Array.from(IP.coverDeficit(items, 50), (i) => i.cost), [1000]);
  // 200 manquants : un Rare niveau 1 (3 000) bat quatre Communs (4 000).
  const picks = IP.coverDeficit(items, 200);
  assert.equal(picks.reduce((t, i) => t + i.cost, 0), 3000);
  assert.equal(IP.coverDeficit(items, 0).length, 0);
  assert.equal(IP.coverDeficit([], 50), null);
});

test('plan : Arbre puis Camps avant toute autre suggestion', () => {
  const r = IP.plan(data, { tree: 1, seeds: 5000, owned: { table: 4 } }, { maxSteps: 6 });
  assert.equal(r.steps[0].kind, 'tree', 'prospérité 200 ≥ 150 : l\'Arbre d\'abord');
  assert.deepEqual(Array.from(r.steps.slice(1, 4), (s) => s.kind), ['camp', 'camp', 'camp']);
  assert.equal(r.steps[4].kind, 'forTree');
});

test('plan : bâtiments pour la prospérité de l\'Arbre, puis l\'Arbre', () => {
  const r = IP.plan(data, { tree: 4, seeds: 0, camps: { 'lumber-camp-1': 6 }, owned: { table: 4, swing: 4, 'camping-chair': 4, campfire: 2, 'camping-tent': 2, scarecrow: 2, sandcastle: 2, 'notice-board': 2, stove: 2, 'pile-of-goods': 2 } }, { maxSteps: 30 });
  const treeAt = r.steps.findIndex((s) => s.kind === 'tree');
  assert.ok(treeAt > 0);
  assert.ok(r.steps.slice(0, treeAt).every((s) => s.kind === 'forTree'));
  assert.ok(r.steps[treeAt].prosperity >= 2400);
  // Après le niveau 5, la pose du Camp 2 passe avant la suite du Camp 1, même plus chère
  // (3 000 contre 2 100 pour le Camp 1 6 → 7) ; ensuite le moins cher d'abord.
  assert.deepEqual(Array.from(r.steps.slice(treeAt + 1, treeAt + 4), (s) => [s.id, s.to, s.cost]),
    [['lumber-camp-2', 1, 3000], ['lumber-camp-2', 2, 100], ['lumber-camp-2', 3, 400]]);
  // Barème du Camp 1 confirmé en jeu pour le Camp 2 (25 septembre 2026) : plus d'hypothèse signalée.
  assert.ok(r.steps.every((s) => !('assumed' in s)));
  assert.equal(data.lumberCamp.camps.find((c) => c.id === 'lumber-camp-2').sameLevelsAs, 'lumber-camp-1');
});

test('plan : l\'Arbre 5 → 6 exige 4 000 de prospérité et 20 000 graines', () => {
  const g = IP.treeGoal(data, { tree: 5 });
  assert.equal(g.known, true);
  assert.equal(g.prosperityNeed, 4000);
  assert.equal(g.seedsNeed, 20000);
  const r = IP.plan(data, { tree: 5, seeds: 1e9, prosperityInGame: 4000, camps: { 'lumber-camp-1': 7, 'lumber-camp-2': 7 } }, { maxSteps: 1 });
  assert.deepEqual([r.steps[0].kind, r.steps[0].to, r.steps[0].cost], ['tree', 6, 20000]);
});

test('plan : l\'Arbre 6 → 7 exige 7 000 de prospérité et 30 000 graines', () => {
  const g = IP.treeGoal(data, { tree: 6 });
  assert.equal(g.known, true);
  assert.equal(g.prosperityNeed, 7000);
  assert.equal(g.seedsNeed, 30000);
});

test("plan : l'Arbre 7 → 8 exige 10 000 de prospérité et 50 000 graines, et offre une Salle du Conseil", () => {
  const g = IP.treeGoal(data, { tree: 7 });
  assert.equal(g.known, true);
  assert.equal(g.prosperityNeed, 10000);
  assert.equal(g.seedsNeed, 50000);
  const state = { tree: 7, seeds: 1e9, prosperityInGame: 10000, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 } };
  const r = IP.plan(data, state, { maxSteps: 30 });
  assert.deepEqual([r.steps[0].kind, r.steps[0].to, r.steps[0].cost, r.steps[0].reward], ['tree', 8, 50000, null]);
  assert.deepEqual({ ...IP.treeGifts(data, 7, 8) }, { 'council-hall': 1 });
  // L'exemplaire offert pose le niveau 1 gratuitement ; les niveaux suivants s'achètent.
  const hall = r.steps.filter((s) => s.id === 'council-hall');
  assert.deepEqual([hall[0].to, hall[0].cost, hall[0].freeUsed], [1, 0, 1]);
  assert.ok(hall.slice(1).every((s) => s.cost > 0));
  // Validation : la Salle du Conseil offerte part en stock.
  assert.equal(IP.applyStep(data, state, r.steps, 0).state.stock['council-hall'], 1);
});

test("bâtiment offert au déblocage non relevé : posé ≠ achetable, seule la case compte", () => {
  // Règle du moteur, vérifiée sur une copie où la Salle du Conseil n'a pas de niveau de
  // déblocage (sa situation avant le relevé du 7 octobre 2026).
  const copy = structuredClone(data);
  const b = copy.buildings.find((x) => x.id === 'council-hall');
  b.unlockTree = null;
  assert.ok(!IP.isUnlocked(b, IP.normalizeState(copy, { tree: 8, owned: { 'council-hall': 1 } })), 'posée ≠ achetable');
  assert.ok(IP.isUnlocked(b, IP.normalizeState(copy, { tree: 8, owned: { 'council-hall': 1 }, unlocked: { 'council-hall': true } })));
  const state = { tree: 7, seeds: 1e9, prosperityInGame: 10000, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 } };
  const hall = IP.plan(copy, state, { maxSteps: 30 }).steps.filter((s) => s.id === 'council-hall');
  assert.deepEqual(Array.from(hall, (s) => [s.to, s.cost, s.freeUsed]), [[1, 0, 1]]);
});

test("plan : l'Arbre 8 → 9 exige 15 000 de prospérité et 70 000 graines, et offre 10 Caisses d'Équipement de Héros Chanceux", () => {
  const g = IP.treeGoal(data, { tree: 8 });
  assert.equal(g.known, true);
  assert.equal(g.prosperityNeed, 15000);
  assert.equal(g.seedsNeed, 70000);
  const state = { tree: 8, seeds: 1e9, prosperityInGame: 15000, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 } };
  const r = IP.plan(data, state, { maxSteps: 5 });
  assert.deepEqual([r.steps[0].kind, r.steps[0].to, r.steps[0].cost, r.steps[0].reward.FR],
    ['tree', 9, 70000, "10 Caisses d'Équipement de Héros Chanceux"]);
  // Récompense hors île : aucun bâtiment offert.
  assert.deepEqual({ ...IP.treeGifts(data, 8, 9) }, {});
});

test('Arbre niv. 8 : débloque la Maison Élégante, la Salle du Conseil et le Marché Flottant', () => {
  const u = IP.treeUnlocks(data, 8);
  assert.deepEqual(Array.from(u.rarities), [], 'les autres Mythiques arrivent au niv. 9');
  assert.deepEqual(Array.from(u.buildings).sort(), ['council-hall', 'elegant-house', 'floating-market']);
  for (const id of ['council-hall', 'elegant-house', 'floating-market']) {
    const b = data.buildings.find((x) => x.id === id);
    assert.ok(!IP.isUnlocked(b, IP.normalizeState(data, { tree: 7 })), id + " verrouillé à l'Arbre niv. 7");
    assert.ok(IP.isUnlocked(b, IP.normalizeState(data, { tree: 8 })), id + " en boutique à l'Arbre niv. 8");
  }
});

test("plan : l'Arbre 9 → 10 (niveau maximal) exige 20 000 de prospérité et 100 000 graines, et offre 20 Caisses d'Équipement de Héros Chanceux", () => {
  const g = IP.treeGoal(data, { tree: 9 });
  assert.equal(g.known, true);
  assert.equal(g.prosperityNeed, 20000);
  assert.equal(g.seedsNeed, 100000);
  const state = { tree: 9, seeds: 1e9, prosperityInGame: 20000, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 } };
  const r = IP.plan(data, state, { maxSteps: 5 });
  assert.deepEqual([r.steps[0].kind, r.steps[0].to, r.steps[0].cost, r.steps[0].reward.FR],
    ['tree', 10, 100000, "20 Caisses d'Équipement de Héros Chanceux"]);
  assert.deepEqual({ ...IP.treeGifts(data, 9, 10) }, {});
  // Toutes les exigences de l'Arbre sont relevées : plus de bascule « données manquantes ».
  assert.equal(r.treeDataEnds, null);
  assert.deepEqual({ ...IP.treeGoal(data, { tree: 10 }) }, { level: 10, next: null, known: false }, 'niveau maximal');
});

test("Arbre niv. 9 : débloque le Château du Bouclier, le Point d'Observation et le Théâtre Municipal", () => {
  const u = IP.treeUnlocks(data, 9);
  assert.deepEqual(Array.from(u.buildings).sort(), ['lookout-point', 'municipal-theater', 'shield-castle']);
  for (const id of ['lookout-point', 'municipal-theater', 'shield-castle']) {
    const b = data.buildings.find((x) => x.id === id);
    assert.ok(!IP.isUnlocked(b, IP.normalizeState(data, { tree: 8 })), id + " verrouillé à l'Arbre niv. 8");
    assert.ok(IP.isUnlocked(b, IP.normalizeState(data, { tree: 9 })), id + " en boutique à l'Arbre niv. 9");
  }
  // Plus aucun bâtiment achetable au déblocage non relevé.
  assert.deepEqual(Array.from(data.buildings.filter((b) => IP.isPurchasable(b) && b.unlockTree == null), (b) => b.id), []);
});

test('plan : attente de production au rythme d\'avant l\'amélioration', () => {
  const r = IP.plan(data, { tree: 1, seeds: 0, owned: { table: 4 } }, { maxSteps: 1 });
  assert.equal(r.steps[0].kind, 'tree');
  assert.equal(r.steps[0].wait, 500 / 120);
});

test('plan : l\'Arbre offre une Fontaine de Joie au passage du niveau 4', () => {
  const r = IP.plan(data, { tree: 3, seeds: 1e9, prosperityInGame: 1200, camps: { 'lumber-camp-1': 4 } }, { maxSteps: 20 });
  const fountain = r.steps.find((s) => s.id === 'joy-fountain' && s.to === 1);
  assert.ok(fountain, 'fontaine posée');
  assert.equal(fountain.cost, 0);
  assert.equal(fountain.freeUsed, 1);
});

test('plan : bâtiment au déblocage inconnu seulement s\'il est coché', () => {
  // Règle vérifiée sur une copie où le Théâtre Municipal n'a pas de niveau de déblocage
  // (sa situation avant le relevé du 15 octobre 2026).
  const copy = structuredClone(data);
  copy.buildings.find((x) => x.id === 'municipal-theater').unlockTree = null;
  const base = { tree: 5, seeds: 0, camps: { 'lumber-camp-1': 7, 'lumber-camp-2': 7 } };
  const off = IP.plan(copy, base, { maxSteps: 40 });
  assert.ok(!off.steps.some((s) => s.id === 'municipal-theater'), 'jamais acheté sans la case');
  const on = IP.plan(copy, { ...base, unlocked: { 'municipal-theater': true } }, { maxSteps: 40 });
  assert.ok(on.steps.some((s) => s.id === 'municipal-theater'));
  assert.ok(!on.steps.some((s) => s.id === 'colosseum'), 'bâtiment d\'événement jamais acheté');
});

test('bonus : Arbre et bâtiments se cumulent', () => {
  const b = IP.activeBonuses(data, IP.normalizeState(data, { tree: 5, owned: { brewery: 5 } }));
  assert.equal(b.healSpeed.total, 30 * 3 + 10);
  assert.equal(b.deployCap.total, 1000);
  assert.equal(b.squadDef.total, 5);
});

test('plan : l\'Arbre offre une Maison de Ville au passage du niveau 2', () => {
  const r = IP.plan(data, { tree: 1, seeds: 1e9, owned: { table: 4 } }, { maxSteps: 40 });
  const house = r.steps.find((s) => s.id === 'townhouse');
  assert.ok(house, 'maison posée');
  assert.equal(house.cost, 0);
  assert.equal(house.freeUsed, 1);
});

test('camps : collecte de graines relevée jusqu\'au niveau 10', () => {
  for (const l of data.lumberCamp.levels) {
    assert.equal(l.load, l.gatherSpeed * 60 * l.level, `niveau ${l.level} : stock = vitesse × 60 × niveau`);
  }
});

test('Arbre niv. 5 : débloque le Camp de Bûcherons 2, les Épiques attendent le niv. 6', () => {
  const u = IP.treeUnlocks(data, 5);
  assert.deepEqual(Array.from(u.rarities), []);
  assert.deepEqual(Array.from(u.camps), ['lumber-camp-2']);
  assert.ok(u.buildings.includes('brewery'), 'Rares débloqués au niveau 5, listés un par un');
  assert.ok(!u.buildings.includes('log-workshop') && !u.buildings.includes('colosseum'), 'spéciaux et événements exclus');
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 2).rarities), []);
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 2).buildings).sort(), ['banner-of-hope', 'lush-shrub', 'magnificent-hedge', 'townhouse']);
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 3).buildings).sort(), ['hut', 'island-vintage', 'slide', 'traveling-merchant']);
  // Arbre niv. 6 : quatre Épiques, les trois autres à l'Arbre niv. 7 (relevé d'Aistra du 28 septembre 2026, confirmé le 3 octobre).
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 6).buildings).sort(), ['fisherman-house', 'palm-tavern', 'sailor-hut', 'spicy-grill']);
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 7).buildings).sort(), ['central-garden', 'defender-tower', 'farmer-mill']);
  const tavern = data.buildings.find((b) => b.id === 'palm-tavern');
  assert.ok(!IP.isUnlocked(tavern, IP.normalizeState(data, { tree: 5 })));
  assert.ok(IP.isUnlocked(tavern, IP.normalizeState(data, { tree: 6 })));
  const mill = data.buildings.find((b) => b.id === 'farmer-mill');
  assert.ok(!IP.isUnlocked(mill, IP.normalizeState(data, { tree: 6 })));
  assert.ok(IP.isUnlocked(mill, IP.normalizeState(data, { tree: 7 })));
  // Arbre niv. 5 : aucune suggestion d'Épique (retour d'Aistra du 26 septembre 2026).
  const r = IP.plan(data, { tree: 5, seeds: 14588, prosperityInGame: 2450, camps: { 'lumber-camp-1': 8, 'lumber-camp-2': 8 } }, { maxSteps: 5 });
  const firstTree = r.steps.findIndex((st) => st.kind === 'tree');
  assert.ok(r.steps.slice(0, firstTree).every((st) => st.rarity !== 'epic' && data.buildings.find((b) => b.id === st.id)?.rarity !== 'epic'));
});

test("Tour du Défenseur offerte avant la boutique : comptée, pas achetée avant l'Arbre niv. 7", () => {
  const tower = data.buildings.find((b) => b.id === 'defender-tower');
  assert.match(tower.gift.EN, /Oasis Prelude/, 'offerte au 7e jour de l\'événement');
  const s6 = IP.normalizeState(data, { tree: 6, owned: { 'defender-tower': 1 } });
  assert.equal(s6.owned['defender-tower'], 1, 'saisie conservée');
  assert.equal(IP.buildingsProsperity(data, s6.owned), 500);
  assert.equal(IP.activeBonuses(data, s6).archerAtk.total, 0.5);
  assert.ok(!IP.isUnlocked(tower, s6), 'pas en boutique à l\'Arbre niv. 6');
  assert.ok(!IP.purchaseItems(data, s6, {}).some((it) => it.id === 'defender-tower'));
  assert.ok(IP.isUnlocked(tower, IP.normalizeState(data, { tree: 7, owned: { 'defender-tower': 1 } })));
});

test('stock : exemplaires détenus consommés avant tout achat', () => {
  const fountain = data.buildings.find((b) => b.id === 'joy-fountain');
  assert.equal(IP.stockMax(fountain, 1), 2 + 3 + 4 + 5, 'stock utile borné aux niveaux restants');
  assert.equal(IP.stockMax(data.buildings.find((b) => b.id === 'table'), 3), 1);
  const s = IP.normalizeState(data, { tree: 4, owned: { 'joy-fountain': 1 }, stock: { 'joy-fountain': 1, colosseum: 3, 'log-workshop': 1 } });
  assert.equal(s.stock.colosseum, 3, "bâtiment d'événement : exemplaires reçus en stock (demande d'Aistra, 24 octobre 2026)");
  assert.equal(s.stock['log-workshop'], 0, 'bâtiment spécial : pas de stock');
  // Exemple d'Aistra : Fontaine niv. 1 + 1 en stock, le niveau 2 n'en demande qu'une à acheter.
  assert.equal(IP.nextCost(fountain, 1, s.stock['joy-fountain']), 3000);
  const items = IP.purchaseItems(data, s, s.stock).filter((it) => it.id === 'joy-fountain');
  assert.deepEqual(Array.from(items.slice(0, 2), (it) => [it.to, it.freeUsed, it.cost]), [[2, 1, 3000], [3, 0, 9000]]);
  // Objectif de l'Arbre 1 → 2 (150) : trois Tables en stock le couvrent sans graine.
  assert.equal(IP.treeGoal(data, { tree: 1 }).coverCost, 3000);
  assert.equal(IP.treeGoal(data, { tree: 1, stock: { table: 3 } }).coverCost, 0);
});

test("plan : l'Arbre offre une Taverne des Palmiers au passage du niveau 6", () => {
  const r = IP.plan(data, { tree: 5, seeds: 1e9, prosperityInGame: 4000, camps: { 'lumber-camp-1': 8, 'lumber-camp-2': 8 } }, { maxSteps: 30 });
  assert.equal(r.steps[0].kind, 'tree');
  assert.deepEqual({ ...IP.treeGifts(data, 5, 6) }, { 'palm-tavern': 1 });
  const tavern = r.steps.find((st) => st.id === 'palm-tavern' && st.to === 1);
  assert.ok(tavern, 'taverne posée');
  assert.equal(tavern.cost, 0);
  assert.equal(tavern.freeUsed, 1);
  const stock = IP.purchaseItems(data, IP.normalizeState(data, { tree: 6 }), { 'palm-tavern': 1 }).find((it) => it.id === 'palm-tavern');
  assert.deepEqual([stock.to, stock.cost, stock.freeUsed], [1, 0, 1]);
});

test('validation : l\'Arbre avance, paie ses graines et met sa récompense en stock', () => {
  const state = { tree: 1, seeds: 800, prosperityInGame: 0, camps: { 'lumber-camp-1': 3 }, owned: { table: 3 } };
  const r0 = IP.plan(data, state, { maxSteps: 5 });
  assert.equal(r0.steps[0].kind, 'tree');
  const r = IP.applyStep(data, state, r0.steps, 0);
  assert.equal(r.applied.length, 1);
  assert.equal(r.state.tree, 2);
  assert.equal(r.state.seeds, 300, '800 − 500 graines');
  assert.equal(r.seedsSpent, 500);
  assert.equal(r.state.stock.townhouse, 1, 'Maison de Ville offerte, en stock');
  // Les autres objets ne bougent pas.
  assert.equal(r.state.camps['lumber-camp-1'], 3);
  assert.equal(r.state.owned.table, 3);
});

test('validation : les graines ne descendent jamais sous 0', () => {
  const state = { tree: 5, seeds: 1000, camps: { 'lumber-camp-1': 7, 'lumber-camp-2': 0 } };
  const steps = IP.plan(data, state, { maxSteps: 3 }).steps;
  assert.deepEqual([steps[0].kind, steps[0].id, steps[0].cost], ['camp', 'lumber-camp-2', 3000]);
  const r = IP.applyStep(data, state, steps, 0);
  assert.equal(r.state.camps['lumber-camp-2'], 1);
  assert.equal(r.state.seeds, 0);
  assert.equal(r.seedsSpent, 1000);
});

test('validation : une étape emmène les niveaux précédents du même objet, pas les autres', () => {
  const state = { tree: 5, seeds: 1e6, camps: { 'lumber-camp-1': 7, 'lumber-camp-2': 0 } };
  const steps = IP.plan(data, state, { maxSteps: 5 }).steps;
  // Pose du Camp 2, puis ses niveaux 2 et 3.
  const at = steps.findIndex((s) => s.id === 'lumber-camp-2' && s.to === 3);
  assert.ok(at >= 2);
  const r = IP.applyStep(data, state, steps, at);
  assert.equal(r.state.camps['lumber-camp-2'], 3);
  assert.equal(r.applied.length, 3);
  assert.equal(r.seedsSpent, 3000 + 100 + 400);
  assert.equal(r.state.camps['lumber-camp-1'], 7, 'le Camp 1 ne bouge pas');
  // Une étape déjà atteinte n'est pas rejouée.
  const again = IP.applyStep(data, r.state, steps, at);
  assert.equal(again.applied.length, 0);
  assert.equal(again.state.seeds, r.state.seeds);
});

test('validation : un bâtiment consomme son stock et relève la prospérité saisie en jeu', () => {
  const state = { tree: 4, seeds: 1e6, prosperityInGame: 1500, camps: { 'lumber-camp-1': 6 }, owned: { table: 4, swing: 4 }, stock: { 'joy-fountain': 1 } };
  const steps = IP.plan(data, state, { maxSteps: 30 }).steps;
  const at = steps.findIndex((s) => s.kind !== 'tree' && s.kind !== 'camp');
  assert.ok(at >= 0);
  const st = steps[at];
  const r = IP.applyStep(data, state, steps, at);
  assert.equal(r.state.owned[st.id], st.to);
  assert.equal(r.state.prosperityInGame, 1500 + r.applied.reduce((t, s) => t + s.gain, 0));
  const used = r.applied.reduce((t, s) => t + (s.freeUsed || 0), 0);
  assert.equal(r.state.stock[st.id] || 0, Math.max(0, ((state.stock || {})[st.id] || 0) - used));
});

test('Camp de Bûcherons : passages 8 → 9 et 9 → 10 relevés (Arbre niv. 6, 4 000 puis 5 000 graines)', () => {
  assert.deepEqual({ ...IP.campUpgrade(data, 8) }, { tree: 6, seeds: 4000 });
  assert.deepEqual({ ...IP.campUpgrade(data, 9) }, { tree: 6, seeds: 5000 });
  assert.equal(IP.campLevel(data, 9).workers, 2);
  assert.equal(IP.campLevel(data, 10).workers, 2);
  assert.equal(IP.campUpgrade(data, 10), null, 'niveau maximal');
  // Arbre 5 : le Camp 8 attend l'Arbre 6 ; une fois l'Arbre monté, il passe avant les bâtiments.
  const r = IP.plan(data, { tree: 5, seeds: 1e9, prosperityInGame: 4000, camps: { 'lumber-camp-1': 8, 'lumber-camp-2': 8 } }, { maxSteps: 3 });
  assert.deepEqual(Array.from(r.steps, (s) => [s.kind, s.id, s.to, s.cost]),
    [['tree', 'tree', 6, 20000], ['camp', 'lumber-camp-1', 9, 4000], ['camp', 'lumber-camp-2', 9, 4000]]);
});

test("cadeaux de l'Arbre : exemplaires offerts par les paliers franchis", () => {
  assert.deepEqual({ ...IP.treeGifts(data, 1, 4) }, { townhouse: 1, 'joy-fountain': 1 });
  assert.deepEqual({ ...IP.treeGifts(data, 1, 10) }, { townhouse: 1, 'joy-fountain': 1, 'palm-tavern': 1, 'council-hall': 1 });
  assert.deepEqual({ ...IP.treeGifts(data, 7, 8) }, { 'council-hall': 1 });
  assert.deepEqual({ ...IP.treeGifts(data, 4, 4) }, {}, 'niveau inchangé');
  assert.deepEqual({ ...IP.treeGifts(data, 5, 3) }, {}, 'descente');
  assert.deepEqual({ ...IP.treeGifts(data, 2, 3) }, {}, 'palier sans bâtiment offert (pièces de puzzle)');
  assert.deepEqual({ ...IP.treeGifts(data, 5, 6) }, { 'palm-tavern': 1 });
});

test("cadeaux de l'Arbre : applyStep met en stock exactement treeGifts", () => {
  for (let l = 1; l < data.tree.maxLevel && data.tree.levels[l - 1].upgrade; l++) {
    const state = { tree: l, seeds: 1e9, prosperityInGame: 1e6, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 } };
    const steps = IP.plan(data, state, { maxSteps: 1 }).steps;
    assert.deepEqual([steps[0].kind, steps[0].to], ['tree', l + 1], `Arbre ${l} → ${l + 1}`);
    const r = IP.applyStep(data, state, steps, 0);
    const added = Object.fromEntries(Object.entries(r.state.stock).filter(([, n]) => n > 0));
    assert.deepEqual(added, { ...IP.treeGifts(data, l, l + 1) }, `Arbre ${l} → ${l + 1}`);
  }
});

const bldg = (id) => data.buildings.find((b) => b.id === id);
// Arbre niv. 10, Camps au maximum, tous les bâtiments de boutique au maximum (sauf le
// Couchant Doré) : seuls restent les bâtiments d'événement et la Merveille.
function tree10(extra) {
  const e = extra || {};
  const owned = {};
  for (const b of data.buildings) if (IP.isPurchasable(b) && b.id !== 'golden-sunset') owned[b.id] = IP.ownedMax(b);
  return { tree: 10, seeds: 0, camps: { 'lumber-camp-1': 10, 'lumber-camp-2': 10 }, ...e, owned: { ...owned, ...(e.owned || {}) } };
}

test("Autel Rituel : Mythique de l'événement Eternity's Reach, +1 000 de prospérité et +1 % de Défense par niveau", () => {
  const b = bldg('ritual-altar');
  assert.deepEqual([b.rarity, b.source, b.prosperity, b.maxLevel, b.effect.stat], ['mythic', 'event', 1000, 10, 'squadDef']);
  assert.equal(IP.effectValue(b, 6), 6, 'capture niv. 6 : +6 %');
});

test("bâtiments d'événement Kingshot : +1 000 de prospérité et +1 % par niveau, lus sur les captures niv. 1, 6 et 10", () => {
  const lus = {
    'sea-angler': 'squadDef', 'curiosity-cottage': 'squadDef', 'dogtective-agency': 'squadDef', 'dream-sailing': 'squadAtk',
    'goddess-of-glory': 'squadDef', 'mini-crucible': 'squadAtk', 'pro-ball-trainer': 'squadDef', 'dinosaur-fort': 'squadAtk',
    'lakeside-dream': 'squadAtk', eggchanted: 'squadDef', starstation: 'squadAtk', 'ritual-altar': 'squadDef',
    'jade-jubilation': 'squadDef', 'journey-of-the-heart': 'squadAtk', 'new-year-greeting': 'squadDef', 'winter-rollercoaster': 'squadAtk',
    'autumn-canvas': 'squadDef', 'wicked-hut': 'squadAtk', 'lantern-garden': 'squadDef', 'cheesy-perfection': 'squadAtk',
    'grizzly-statue': 'squadAtk', 'dragon-sculpture': 'squadAtk'
  };
  for (const [id, stat] of Object.entries(lus)) {
    const b = bldg(id);
    assert.deepEqual([b.rarity, b.source, b.prosperity, b.maxLevel, b.effect.stat], ['mythic', 'event', 1000, 10, stat], id);
    assert.deepEqual([IP.effectValue(b, 1), IP.effectValue(b, 6), IP.effectValue(b, 10)], [1, 6, 10], id);
    assert.equal(IP.buildingsProsperity(data, { [id]: 6 }), 6000, id);
    assert.deepEqual(b.images.map((v) => v.from), [1, 6, 10], id);
    assert.equal(b.cutout, true, id);
  }
  assert.equal(data.buildings.some((b) => b.id === 'wizard-tower'), false, 'propre à LordRush');
});

test("bâtiment d'événement : jamais débloqué par achat, le niveau 1 demande un exemplaire obtenu", () => {
  const altar = bldg('ritual-altar');
  assert.equal(IP.mustPay(altar, 0), true);
  assert.equal(IP.mustPay(altar, 1), false);
  for (const b of data.buildings.filter((x) => x.source === 'event')) assert.equal(IP.mustPay(b, 0), true, b.id);
  assert.equal(IP.mustPay(bldg('golden-sunset'), 0), false, 'Merveille : pas un bâtiment d\'événement');
  const none = IP.normalizeState(data, tree10({ items: { mythicComponent: 500 } }));
  assert.equal(IP.purchaseItems(data, none, none.stock).filter((x) => x.id === 'ritual-altar').length, 0, 'niv. 0 : pas de pose en composants');
  const stocked = IP.normalizeState(data, tree10({ items: { mythicComponent: 500 }, stock: { 'ritual-altar': 1 } }));
  const first = IP.purchaseItems(data, stocked, stocked.stock).find((x) => x.id === 'ritual-altar');
  assert.deepEqual([first.from, first.freeUsed, first.cost], [0, 1, 0], 'un exemplaire obtenu le pose');
});

test("bâtiments d'événement à plusieurs bonus : chaque effet lu sur les captures niv. 1, 6 et 10", () => {
  const lus = {
    'passing-of-the-sword': [1000, ['squadAtk', 'squadDef'], [1, 6, 10]],
    'sleeping-drakethrone': [5000, ['squadAtk', 'squadDef', 'squadLethality', 'squadHealth'], [2, 12, 20]]
  };
  for (const [id, [prosperity, stats, values]] of Object.entries(lus)) {
    const b = bldg(id);
    assert.deepEqual(Array.from(IP.effectsOf(b), (e) => e.stat), stats, id);
    for (const e of IP.effectsOf(b)) assert.deepEqual([1, 6, 10].map((l) => IP.effectValue(b, l, e)), values, `${id} ${e.stat}`);
    assert.equal(IP.buildingsProsperity(data, { [id]: 10 }), prosperity * 10, id);
    assert.equal(IP.mustPay(b, 0), true, id);
  }
});

test("Court of Knowledge : niveau + 1 jusqu'au niv. 10, puis 15 et 5 de plus par niveau, 55 lus en jeu au niv. 18", () => {
  const b = bldg('court-of-wisdom');
  assert.deepEqual([0, 1, 9, 10, 11, 18, 19].map((l) => IP.copiesFor(b, l)), [1, 2, 10, 15, 20, 55, 60]);
  assert.equal(IP.stockMax(b, 18), 115, '55 + 60 restent utiles au niv. 18');
  assert.equal(IP.copiesFor(bldg('ritual-altar'), 9), 10, 'les autres bâtiments gardent niveau + 1');
  const short = IP.normalizeState(data, tree10({ owned: { 'court-of-wisdom': 18 }, stock: { 'court-of-wisdom': 47 } }));
  assert.equal(short.stock['court-of-wisdom'], 47, 'le stock de 47 se saisit');
  assert.equal(IP.purchaseItems(data, short, short.stock).filter((x) => x.id === 'court-of-wisdom').length, 0, '47 ne suffisent pas');
  const ok = IP.normalizeState(data, tree10({ owned: { 'court-of-wisdom': 18 }, stock: { 'court-of-wisdom': 55 } }));
  const it = IP.purchaseItems(data, ok, ok.stock).find((x) => x.id === 'court-of-wisdom');
  assert.deepEqual([it.from, it.to, it.freeUsed, it.cost], [18, 19, 55, 0]);
});

test("noms français : tous les bâtiments en ont un", () => {
  const manquants = data.buildings.filter((b) => b.name.FR === b.name.EN && b.name.EN !== 'Wagon').map((b) => b.id);
  assert.deepEqual(manquants, []);
});

test("Treasure Icicle : violet à 5 niveaux, +0,5 % d'Attaque par niveau, à obtenir", () => {
  const b = bldg('treasure-icicle');
  assert.deepEqual([b.rarity, b.source, b.maxLevel, b.effect.stat], ['epic', 'event', 5, 'squadAtk']);
  assert.deepEqual([IP.effectValue(b, 1), IP.effectValue(b, 5)], [0.5, 2.5]);
  assert.equal(IP.mustPay(b, 0), true);
  assert.equal(IP.componentsFor(data, b, 10), null, 'les composants sont Mythiques');
});

test("Dinosaur Fossils : violet à 5 niveaux, +3 % de Vitesse d'Entraînement par niveau, à obtenir", () => {
  const b = bldg('dinosaur-fossils');
  assert.deepEqual([b.rarity, b.source, b.maxLevel, b.effect.stat], ['epic', 'event', 5, 'trainSpeed']);
  assert.deepEqual([IP.effectValue(b, 1), IP.effectValue(b, 5)], [3, 15]);
  assert.equal(IP.mustPay(b, 0), true);
});

test("entrées LordRush renommées d'après les captures Kingshot : nom, paliers et effet", () => {
  const lus = {
    'merchant-wagon': ['Merchant Caravan', 'squadDef', [[1, 1], [6, 6], [10, 10]]],
    'horn-of-glory': ['Horn of Victory', 'squadAtk', [[1, 1], [6, 6], [10, 10]]],
    'court-of-wisdom': ['Court of Knowledge', 'squadAtk', [[1, 1], [6, 6], [10, 10], [15, 15], [20, 20]]],
    'radiant-sword': ['Lion of Glory', 'squadAtk', [[1, 1.5], [6, 9], [10, 15]]]
  };
  for (const [id, [name, stat, levels]] of Object.entries(lus)) {
    const b = bldg(id);
    assert.deepEqual([b.name.EN, b.effect.stat, b.cutout], [name, stat, true], id);
    for (const [lvl, val] of levels) assert.equal(IP.effectValue(b, lvl), val, `${id} niv. ${lvl}`);
    assert.deepEqual(b.images.map((v) => v.from), levels.map(([l]) => l), id);
    assert.equal(IP.componentsFor(data, b, 10), null, `${id} : composants non indiqués`);
  }
  assert.equal(IP.buildingsProsperity(data, { 'court-of-wisdom': 20 }), 20000);
});

test("composants : seulement là où ils sont indiqués, jamais pour poser un bâtiment payant", () => {
  const lot2 = ['jade-jubilation', 'journey-of-the-heart', 'new-year-greeting', 'winter-rollercoaster', 'autumn-canvas', 'wicked-hut', 'lantern-garden', 'cheesy-perfection', 'grizzly-statue'];
  const avec = ['curiosity-cottage', 'dream-sailing', 'mini-crucible', 'pro-ball-trainer', 'dinosaur-fort', 'lakeside-dream', 'eggchanted', 'starstation', 'ritual-altar', ...lot2];
  for (const id of avec) assert.ok(IP.componentsFor(data, bldg(id), 10), id);
  for (const id of ['sea-angler', 'dogtective-agency', 'goddess-of-glory', 'dragon-sculpture', 'passing-of-the-sword', 'sleeping-drakethrone']) assert.equal(IP.componentsFor(data, bldg(id), 10), null, id);
  const payants = ['curiosity-cottage', 'dream-sailing', 'mini-crucible', 'pro-ball-trainer', 'dinosaur-fort', 'lakeside-dream', 'eggchanted', 'starstation', ...lot2];
  assert.deepEqual(data.buildings.filter((b) => b.paid).map((b) => b.id).sort(), [...payants].sort());
});

test("bâtiment payant : le niveau 1 s'achète en argent réel, les composants ne servent qu'à partir du niveau 1", () => {
  const b = bldg('curiosity-cottage');
  assert.equal(IP.mustPay(b, 0), true);
  assert.equal(IP.mustPay(b, 1), false);
  assert.equal(IP.isPurchasable(b), false, 'pas en essence');
  assert.equal(IP.componentsFor(data, b, 9), null, 'avant la Fontaine niv. 10');
  const none = IP.normalizeState(data, tree10({ items: { mythicComponent: 50 } }));
  assert.equal(IP.purchaseItems(data, none, none.stock).filter((x) => x.id === b.id).length, 0, 'niv. 0 : pas de pose en composants');
  const stocked = IP.normalizeState(data, tree10({ items: { mythicComponent: 50 }, stock: { [b.id]: 1 } }));
  const first = IP.purchaseItems(data, stocked, stocked.stock).find((x) => x.id === b.id);
  assert.deepEqual([first.from, first.freeUsed, first.cost], [0, 1, 0], 'un exemplaire en stock le pose');
  const placed = IP.normalizeState(data, tree10({ items: { mythicComponent: 20 }, owned: { [b.id]: 1 } }));
  const next = IP.purchaseItems(data, placed, placed.stock).find((x) => x.id === b.id);
  assert.deepEqual([next.from, next.use.mythicComponent], [1, 20], 'niv. 1 → 2 : 2 exemplaires = 20 composants');
});

test('Couchant Doré : deux effets, +2 000 de prospérité par niveau, 20 × N plans de Merveille par niveau', () => {
  const b = bldg('golden-sunset');
  assert.deepEqual([b.prosperity, b.unlockTree, b.seeds], [2000, 10, 50000]);
  assert.deepEqual(IP.effectsOf(b).map((e) => [e.stat, IP.effectValue(b, 7, e)]), [['squadLethality', 7], ['squadHealth', 7]]);
  assert.equal(IP.copiesFor(b, 0), 1, 'posé avec son plan');
  assert.equal(IP.copiesFor(b, 5), 100, "exemple d'Aistra : niv. 5 → 6, 100 plans");
  assert.equal(IP.stockMax(b, 9), 180);
  assert.equal(IP.nextCost(b, 0, 0), 50000);
  assert.equal(IP.nextCost(b, 1, 0), null, 'pas de niveau en graines');
  const bonus = IP.activeBonuses(data, IP.normalizeState(data, { tree: 10, owned: { 'golden-sunset': 3 } }));
  assert.equal(bonus.squadHealth.total, 5 + 3, 'Arbre niv. 9 (+5 %) et Couchant Doré niv. 3');
  assert.equal(bonus.squadLethality.total, 5 + 3, 'Arbre niv. 10 (+5 %) et Couchant Doré niv. 3');
  assert.ok(IP.treeUnlocks(data, 10).buildings.includes('golden-sunset'));
  assert.deepEqual(Array.from(IP.treeUnlocks(data, 10).items), ['mythicComponent']);
});

test('Couchant Doré : posé avec son plan, puis monté en plans de Merveille', () => {
  const r = IP.plan(data, tree10({ seeds: 50000, items: { wonderBlueprint: 50 } }), { maxSteps: 3 });
  assert.deepEqual(Array.from(r.steps.slice(0, 2), (s) => [s.id, s.to, s.cost, (s.use || {}).wonderBlueprint || 0]),
    [['golden-sunset', 1, 50000, 0], ['golden-sunset', 2, 0, 20]]);
  assert.notEqual(r.steps[2] && r.steps[2].id, 'golden-sunset', 'niv. 2 → 3 : 40 plans, il en reste 30');
  const st = tree10({ items: { wonderBlueprint: 50 }, owned: { 'golden-sunset': 1 } });
  const p = IP.plan(data, st, { maxSteps: 1 });
  assert.deepEqual([p.steps[0].id, p.steps[0].to, p.steps[0].cost], ['golden-sunset', 2, 0]);
  assert.equal(IP.applyStep(data, st, p.steps, 0).state.items.wonderBlueprint, 30, 'validation : plans consommés');
  // Un plan du Couchant Doré en stock compte comme un plan de Merveille.
  const own = IP.purchaseItems(data, IP.normalizeState(data, st), { 'golden-sunset': 5 }, { wonderBlueprint: 15 }).find((it) => it.id === 'golden-sunset');
  assert.deepEqual([own.to, own.freeUsed, own.use.wonderBlueprint], [2, 5, 15]);
});

test("composants Mythiques : 10 pour un exemplaire d'un Mythique d'événement, stock d'abord, à l'Arbre niv. 10", () => {
  const altar = bldg('ritual-altar');
  assert.equal(IP.componentsFor(data, altar, 9), null, "avant l'Arbre niv. 10");
  assert.ok(IP.componentsFor(data, altar, 10));
  assert.equal(IP.componentsFor(data, bldg('golden-sunset'), 10), null, 'Merveille exclue');
  assert.equal(IP.componentsFor(data, bldg('council-hall'), 10), null, 'Mythique de boutique : achat direct moins cher');
  assert.equal(IP.componentsFor(data, bldg('colosseum'), 10), null, 'Épique');
  const s = IP.normalizeState(data, tree10({ items: { mythicComponent: 12 }, owned: { 'ritual-altar': 1 } }));
  const it = IP.purchaseItems(data, s, s.stock).filter((x) => x.id === 'ritual-altar');
  // Niv. 1 → 2 : 2 exemplaires = 20 composants, 12 en stock, 8 achetés (48 000 graines).
  assert.deepEqual([it[0].to, it[0].use.mythicComponent, it[0].buy.mythicComponent, it[0].cost, it[0].shared], [2, 12, 8, 48000, true]);
  assert.equal(it[1].cost, 30 * 6000, 'niv. 2 → 3 : stock épuisé');
  // Exemplaires d'événement en stock : consommés avant tout composant.
  const s2 = IP.normalizeState(data, tree10({ items: { mythicComponent: 10 }, stock: { 'ritual-altar': 1 } }));
  const first = IP.purchaseItems(data, s2, s2.stock).find((x) => x.id === 'ritual-altar');
  assert.deepEqual([first.freeUsed, first.cost, first.use], [1, 0, undefined]);
  // Plan et validation : les composants du stock sont consommés.
  const st = tree10({ items: { mythicComponent: 20 }, owned: { 'ritual-altar': 1 } });
  const p = IP.plan(data, st, { maxSteps: 1 });
  assert.equal(p.steps[0].cost, 0, 'niv. 1 → 2 : deux exemplaires entiers en composants du stock');
  assert.equal(IP.applyStep(data, st, p.steps, 0).state.items.mythicComponent, 0);
});

test("bâtiment d'événement en stock : niveau proposé sans achat, même avant l'Arbre niv. 10", () => {
  const s = IP.normalizeState(data, { tree: 3, owned: { 'ritual-altar': 2 }, stock: { 'ritual-altar': 3 } });
  const it = IP.purchaseItems(data, s, s.stock).filter((x) => x.id === 'ritual-altar');
  assert.deepEqual(Array.from(it, (x) => [x.to, x.cost, x.freeUsed]), [[3, 0, 3]], 'niv. 3 couvert, niv. 4 non');
  // Composants : seulement à l'Arbre niv. 10.
  const s9 = IP.normalizeState(data, { tree: 9, items: { mythicComponent: 99 } });
  assert.equal(IP.purchaseItems(data, s9, s9.stock).filter((x) => x.shared).length, 0);
});

// ============ RELEVÉS KINGSHOT (captures du 8 novembre 2026) ============

test('Fontaine Vitale niv. 1 à 6 : exigences, production et bonus des captures', () => {
  const lus = [
    [1, 150, 500, 120, 'healSpeed', 30],
    [2, 600, 1000, 150, 'deployCap', 1000],
    [3, 1200, 5000, 180, 'healSpeed', 30],
    [4, 2400, 10000, 210, 'squadDef', 5],
    [5, 4000, 20000, 240, 'healSpeed', 30],
    [6, 7000, 30000, 270, 'squadAtk', 5]
  ];
  for (const [n, prosp, essence, prod, stat, val] of lus) {
    const l = data.tree.levels[n - 1];
    assert.deepEqual([l.upgrade.prosperity, l.upgrade.seeds, l.seedsPerHour, l.stat.key, l.stat.value], [prosp, essence, prod, stat, val], `niv. ${n}`);
  }
  assert.deepEqual([data.tree.levels[6].seedsPerHour, data.tree.levels[6].stat.key], [300, 'healSpeed'], 'niv. 7 lu sur la capture du niv. 6');
});

test('Réservoir niv. 2 à 9 : coûts, vitesse, cargaison et Fontaine requise des captures', () => {
  const lus = [
    [2, 2, 400, 7, 840, 1], [3, 2, 600, 8, 1440, 1], [4, 4, 1000, 9, 2160, 2], [5, 4, 1600, 10, 3000, 2],
    [6, 5, 2100, 11, 3960, 2], [7, 5, 3000, 12, 5040, 2], [8, 6, 4000, 13, 6240, 2], [9, 6, 5000, 14, 7560, 2]
  ];
  for (const [n, fontaine, essence, vitesse, charge, travailleurs] of lus) {
    const l = IP.campLevel(data, n);
    assert.deepEqual([l.upgrade.tree, l.upgrade.seeds, l.gatherSpeed, l.load, l.workers], [fontaine, essence, vitesse, charge, travailleurs], `niv. ${n}`);
  }
  assert.deepEqual([IP.campLevel(data, 10).gatherSpeed, IP.campLevel(data, 10).load], [15, 9000], 'niv. 10 lu sur la capture du niv. 9');
});

test('récompenses : un bâtiment offert se lit dans freeCopies, le reste dans reward', () => {
  for (const l of data.tree.levels) {
    if (!l.upgrade) continue;
    assert.ok(Boolean(l.upgrade.freeCopies) !== Boolean(l.upgrade.reward), `niv. ${l.level} : l'un ou l'autre`);
    for (const id of Object.keys(l.upgrade.freeCopies || {})) assert.ok(data.buildings.some((b) => b.id === id), id);
  }
  assert.equal(data.tree.levels[3].upgrade.reward.FR, '3 accélérateurs 8 h');
});

test('Oasis Prelude : les bâtiments des jours 1, 3 et 7 se saisissent avant leur déblocage', () => {
  for (const id of ['island-vintage', 'joy-fountain', 'defender-tower']) {
    assert.match(data.buildings.find((b) => b.id === id).gift.EN, /Oasis Prelude/, id);
    const s = IP.normalizeState(data, { tree: 1, owned: { [id]: 1 } });
    assert.equal(s.owned[id], 1, id);
    assert.ok(!IP.isUnlocked(data.buildings.find((b) => b.id === id), s), id + ' pas achetable pour autant');
  }
});

// L'interface se charge sous Node : sans DOM, son démarrage s'arrête tout seul.
const UI = createContext(['js/storage-keys.js', 'js/island_planner.js', 'js/island_script.js']);
const lossesOf = (raw) => [...UI.isStateLosses(raw, IP.normalizeState(data, raw))];

test('montant saisi : formats admis, et null plutôt qu\'un chiffre inventé', () => {
  const ok = { '': 0, 12000: 12000, '12 000': 12000, '12 000': 12000, '1,200': 1200, '1.200.000': 1200000, '250k': 250000, '1,5M': 1500000, '1.5m': 1500000, '1,200k': 1200000 };
  for (const [input, n] of Object.entries(ok)) assert.equal(UI.isParseAmount(input), n, input);
  for (const bad of ['1.5', '1,5', '12.5', '-500', '1e6', 'abc', '5x']) assert.equal(UI.isParseAmount(bad), null, bad);
});

test('sauvegarde relue : ce qui est perdu ou corrigé est repéré', () => {
  const b = data.buildings.find((x) => x.maxLevel > 1 && !x.source);
  assert.deepEqual(lossesOf({ owned: { 'id-disparu': 5 } }), ['owned.id-disparu']);
  assert.deepEqual(lossesOf({ owned: { [b.id]: b.maxLevel + 9 } }), [`owned.${b.id}`]);
  assert.deepEqual(lossesOf({ unlocked: { 'id-disparu': true } }), ['unlocked.id-disparu']);
  assert.deepEqual(lossesOf({ tree: 'abc' }), ['tree']);
  assert.deepEqual(lossesOf({ owned: [1] }), ['owned']);
  assert.deepEqual(lossesOf({ v: 2 }), ['v']);
  assert.deepEqual(lossesOf({ v: 1, owned: { 'id-disparu': 0 } }), [], 'un zéro ne perd rien');
  assert.deepEqual(lossesOf({}), [], 'champs absents : rien à signaler');
});

test('sauvegarde relue : un plan suivi étape par étape ne déclenche jamais le bandeau', () => {
  let state = IP.normalizeState(data, { seeds: 5e8, items: { mythicComponent: 500, wonderBlueprint: 500 } });
  let validated = 0;
  for (let i = 0; i < 300; i++) {
    const r = IP.plan(data, state, { maxSteps: 5 });
    if (!r.steps.length) break;
    state = IP.applyStep(data, state, r.steps, 0).state;
    validated++;
    assert.deepEqual(lossesOf(JSON.parse(JSON.stringify({ v: 1, ...state }))), [], `après ${validated} étape(s)`);
  }
  assert.ok(validated > 20, `seulement ${validated} étapes validées`);
});
