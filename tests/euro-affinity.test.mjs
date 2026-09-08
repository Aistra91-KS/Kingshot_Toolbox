/* Barème d'affinité — bloc `affinity` de data/shopcalc_euro.json, résolu par
   `scEurUnit()` de js/shop-core.js.

   Ce que ces tests verrouillent : un point d'affinité coûte le même prix quel que
   soit le jeton qui le porte. Relevé jeton par jeton, ce n'était pas le cas — la
   Coupe en argent (100 points) ressortait à 0,750 € contre 0,250 € les Épices
   d'élite (1 000 points), soit trente fois le prix du point. C'est le même argument
   que le barème des accélérateurs, où une heure doit valoir soixante minutes. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, run } from './harness.mjs';

async function euro() {
  const ctx = createContext(['js/storage-keys.js', 'js/shop-core.js']);
  await run(ctx, 'scLoadItems()');
  await run(ctx, 'scLoadEuro()');
  run(ctx, "scSetCur('EUR')");
  return ctx;
}
const unit = (ctx, id) => run(ctx, `scEurUnit(${JSON.stringify(id)})`);

test('un point d\'affinité vaut le même prix sur les trois jetons', async () => {
  const ctx = await euro();
  const pts = JSON.parse(run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.points)'));
  const perPoint = Object.entries(pts).map(([id, n]) => unit(ctx, id) / n);
  for (const p of perPoint) assert.ok(Math.abs(p - perPoint[0]) < 1e-12, 'prix du point identique');
  // Le pack de base est celui qui verse le plus de points par euro, jetons additionnés — pas
  // celui où un jeton se relève au meilleur prix unitaire. Les deux ne se rejoignent pas : le
  // Pack Trésor Expert 1 donne 16 Épices ET 16 Coupes, soit 17 600 points pour 5 $, mais reste
  // derrière les 24 000 de la Rencontre Frontalière.
  assert.equal(run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.basis.packs)'), '["frontier-encounter-adventurer"]');
  assert.equal(run(ctx, 'scEurPoint()'), 6 / 24000);
  assert.equal(unit(ctx, 'elite_spices'), 0.25);
});

test('les valeurs suivent les points : 10 / 100 / 1 000', async () => {
  const ctx = await euro();
  assert.equal(unit(ctx, 'copper_horn'), 0.0025);
  assert.equal(unit(ctx, 'silver_goblet'), 0.025);
  assert.equal(unit(ctx, 'elite_spices'), 0.25);
});

test('le Cor en cuivre est chiffré alors qu\'aucun pack ne le vend', async () => {
  const ctx = await euro();
  // Comme l'accélérateur 8h sous le barème des accélérateurs : absent du relevé,
  // mais déductible. Sans le barème il vaudrait « — ».
  assert.equal(run(ctx, 'SC_EURO.copper_horn'), undefined);
  assert.ok(unit(ctx, 'copper_horn') > 0);
  assert.equal(run(ctx, "scEurIsAffinity('copper_horn')"), true);
});

test('les trois jetons affichent le pack de la BASE, pas le leur', async () => {
  const ctx = await euro();
  // Même règle que les cinq accélérateurs (MAP §9) : la colonne « Pack d'origine »
  // nomme le pack d'où vient le PRIX. La Coupe est bien relevée dans un pack à elle,
  // mais ce n'est pas lui qui la chiffre.
  const basisPacks = run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.basis.packs)');
  for (const id of ['copper_horn', 'silver_goblet', 'elite_spices'])
    assert.equal(run(ctx, `JSON.stringify(scEurPacks(${JSON.stringify(id)}))`), basisPacks);
  assert.notEqual(run(ctx, 'JSON.stringify(SC_EURO.silver_goblet.packs)'), basisPacks);
});

test('le barème se lit en dollars comme en euros', async () => {
  const ctx = await euro();
  run(ctx, "scSetCur('USD')");
  const pts = JSON.parse(run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.points)'));
  const perPoint = Object.entries(pts).map(([id, n]) => unit(ctx, id) / n);
  for (const p of perPoint) assert.ok(Math.abs(p - perPoint[0]) < 1e-12);
  assert.ok(Math.abs(unit(ctx, 'silver_goblet') - 5 / 24000 * 100) < 1e-12);
});

test('le total de points du pack de base est celui de son détail', async () => {
  const ctx = await euro();
  // `basis.points` ne se retrouve PAS dans `items` (un pack n'y figure que sous l'objet dont il
  // est le meilleur prix unitaire) : il se relit dans l'Excel, donc il peut diverger de son
  // propre `detail` à une régénération. C'est le seul garde-fou qui l'attrape.
  const detail = JSON.parse(run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.basis.detail)'));
  const pts = JSON.parse(run(ctx, 'JSON.stringify(SC_EURO_AFFINITY.points)'));
  const sum = detail.reduce((t, d) => t + d.qty * pts[d.itemId], 0);
  assert.equal(sum, Number(run(ctx, 'SC_EURO_AFFINITY.basis.points')));
});

test('le barème ne déborde pas sur les autres règles', async () => {
  const ctx = await euro();
  // Garde-fou : la couche `affinity` s'insère entre le barème des accélérateurs et le
  // relevé nu. Elle ne doit toucher QUE les objets qu'elle nomme.
  const touched = JSON.parse(run(ctx,
    'JSON.stringify(SC_ITEMS.filter(i=>scEurIsAffinity(i.id)).map(i=>i.id).sort())'));
  assert.deepEqual(touched, ['copper_horn', 'elite_spices', 'silver_goblet']);
  assert.equal(unit(ctx, '1h_general_speedup'), unit(ctx, '1m_general_speedup') * 60);
  assert.equal(unit(ctx, 'general_master_emblem'), 0.3);   // relevé nu, voisin de catégorie
});
