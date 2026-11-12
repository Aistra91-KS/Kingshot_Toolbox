/* Piège à Ours : choix des héros de la marche qui mène le rally.

   Ce que ces tests verrouillent :

   1. ALCAR OU ZOE. Zoe est la meilleure infanterie pour un joueur qui n'a ni Amadeus
      ni Helga, sauf quand Petra mène la cavalerie : là, c'est Alcar. La règle dépend
      donc du héros de cavalerie retenu, pas de la génération.

   2. LE RANG C. Un joueur sans héros de tête doit quand même être départagé par le
      classement, pas par le seul niveau de ses héros.

   3. LA COHÉRENCE DU CLASSEMENT. Chaque nom doit exister dans heroes_db.json avec le
      bon type de troupe, et ne pas dépasser la génération où il est listé : une faute
      de frappe donnerait un héros noté 999 sans rien signaler.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, run, readJson } from './harness.mjs';

const heroes = readJson('data/heroes_db.json');
const idOf = name => heroes.find(h => h.name === name).id;

/* La marche du meneur pour un joueur qui possède `names`, tous au même niveau et aux
   mêmes compétences : seul le classement départage. */
function leaders(generation, names) {
  const ctx = createContext(['js/storage-keys.js', 'js/beartrap.js']);
  const owned = {};
  for (const n of names) owned[idOf(n)] = { unlocked: true, level: 50, skills: [3, 3, 3] };
  run(ctx, `localStorage.setItem(STORAGE_KEYS.caserneHeroes, ${JSON.stringify(JSON.stringify(owned))});
            heroesDB = ${JSON.stringify(heroes)};`);
  const team = JSON.parse(run(ctx,
    `JSON.stringify(selectHeroesForMarches(1, 'organizer', ${generation})[0].heroes.map(h => h.name))`));
  return team.slice().sort();
}

const F2P = ['Zoe', 'Alcar', 'Petra', 'Ava', 'Jabel', 'Marlin', 'Rosa', 'Yang', 'Howard'];

test('sans Amadeus ni Helga : Zoe en gen 3, Alcar avec Petra de la gen 4 à la gen 6, Zoe avec Ava en gen 7', () => {
  assert.deepEqual(leaders(3, F2P), ['Marlin', 'Petra', 'Zoe']);
  assert.deepEqual(leaders(4, F2P), ['Alcar', 'Petra', 'Rosa']);
  assert.deepEqual(leaders(5, F2P), ['Alcar', 'Petra', 'Rosa']);
  assert.deepEqual(leaders(6, F2P), ['Alcar', 'Petra', 'Yang']);
  assert.deepEqual(leaders(7, F2P), ['Ava', 'Yang', 'Zoe']);
});

test('la règle suit le héros de cavalerie, pas la génération', () => {
  // Gen 7 sans Ava : Petra mène, donc Alcar.
  assert.deepEqual(leaders(7, ['Zoe', 'Alcar', 'Petra', 'Yang']), ['Alcar', 'Petra', 'Yang']);
  // Gen 5 sans Petra : Thrud mène, donc Zoe.
  assert.deepEqual(leaders(5, ['Zoe', 'Alcar', 'Thrud', 'Rosa']), ['Rosa', 'Thrud', 'Zoe']);
  // Sans aucune cavalerie : Zoe.
  assert.deepEqual(leaders(5, ['Zoe', 'Alcar', 'Rosa']), ['Rosa', 'Zoe']);
});

test('Amadeus et Helga restent devant, avec ou sans Petra', () => {
  assert.deepEqual(leaders(5, ['Helga', 'Zoe', 'Alcar', 'Petra', 'Rosa']), ['Helga', 'Petra', 'Rosa']);
  assert.deepEqual(leaders(5, ['Amadeus', 'Helga', 'Alcar', 'Petra', 'Rosa']), ['Amadeus', 'Petra', 'Rosa']);
});

test('le rang C départage un joueur sans héros de tête', () => {
  // Gen 8, ni Ava ni Petra ni Liz : Margot (C) passe devant Jabel et Hilde (D).
  assert.deepEqual(leaders(8, ['Triton', 'Howard', 'Margot', 'Jabel', 'Hilde', 'Rosa', 'Saul']),
    ['Margot', 'Rosa', 'Triton']);
});

test('chaque héros du classement existe, avec le bon type et une génération atteinte', () => {
  const ctx = createContext(['js/storage-keys.js', 'js/beartrap.js']);
  const lists = JSON.parse(run(ctx, 'JSON.stringify(organizerTierList)'));
  const type = { inf: 'infantry', cav: 'cavalry', arc: 'archer' };
  for (const [gen, byType] of Object.entries(lists)) {
    for (const [short, names] of Object.entries(byType)) {
      assert.equal(new Set(names).size, names.length, `doublon en gen ${gen} ${short}`);
      for (const n of names) {
        const h = heroes.find(x => x.name === n);
        assert.ok(h, `héros inconnu en gen ${gen} : ${n}`);
        assert.equal(h.troopType.toLowerCase(), type[short], `${n} mal rangé en gen ${gen}`);
        assert.ok(h.generation <= Number(gen), `${n} listé en gen ${gen} avant sa sortie`);
      }
    }
  }
});
