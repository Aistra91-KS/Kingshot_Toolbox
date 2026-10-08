/* Copie d'une boutique d'événement gardée par le joueur (localStorage) contre le fichier.

   shop-core.js enregistre une copie de chaque boutique d'événement dès la première
   visite. Le joueur peut la corriger (quantité, coût, lignes), y mettre un panier et
   saisir sa monnaie. Quand le CONTENU de la boutique change dans le fichier, sa copie
   doit repartir du fichier, monnaie gardée (choix d'Aistra, 08/10/2026) : sans cela,
   le Tempered TrueGold ajouté au Magasin du Blizzard restait invisible à quiconque
   avait déjà ouvert une boutique. Tant que le fichier ne change pas, ses corrections
   restent. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, run, readJson } from './harness.mjs';

const SLUG = 'blizzard-shop';
const FICHIER = readJson('data/shopcalc_events.json');
const DEF = FICHIER.find(s => s.slug === SLUG);
const copie = o => JSON.parse(JSON.stringify(o));
const stockage = ctx => run(ctx, 'localStorage.getItem(STORAGE_KEYS.shopcalcEvents)');

/* Charge les boutiques avec, en stockage, la copie `saved` de la boutique testée. */
async function charger(saved) {
  const ctx = createContext();
  run(ctx, `localStorage.setItem(STORAGE_KEYS.shopcalcEvents, ${JSON.stringify(JSON.stringify([saved]))});`);
  await run(ctx, 'scLoadAll()');
  // Passé en texte : un objet né dans le contexte `vm` n'a pas les prototypes de celui
  // du test, et `deepEqual` les compare.
  return {
    shop: JSON.parse(run(ctx, `JSON.stringify(SC_EVENTS.find(s => s.slug === ${JSON.stringify(SLUG)}))`)),
    stocke: JSON.parse(stockage(ctx)).find(s => s.slug === SLUG)
  };
}

test('une ligne ajoutée au fichier apparaît chez le joueur qui avait déjà ouvert la boutique', async () => {
  // Copie d'avant l'empreinte, faite quand la boutique avait une ligne de moins.
  const ancienne = copie(DEF);
  ancienne.items = ancienne.items.slice(0, -1);
  ancienne.items[0].take = 3;
  ancienne.resources = 1234;
  const { shop, stocke } = await charger(ancienne);
  assert.deepEqual(shop.items.map(i => i.itemId), DEF.items.map(i => i.itemId));
  assert.equal(shop.items[0].take, undefined, 'le panier portait sur l\'ancien contenu');
  assert.equal(shop.resources, 1234, 'la monnaie saisie est gardée');
  assert.equal(stocke.items.length, DEF.items.length, 'la copie à jour est réenregistrée');
  assert.ok(stocke.src, 'et porte l\'empreinte du fichier');
});

test('une copie d\'avant l\'empreinte qui dit la même chose que le fichier garde le panier du joueur', async () => {
  const ancienne = copie(DEF);
  ancienne.items[1].take = 2;
  ancienne.resources = 77;
  const { shop, stocke } = await charger(ancienne);
  assert.equal(shop.items[1].take, 2);
  assert.equal(shop.resources, 77);
  assert.ok(stocke.src, 'l\'empreinte est posée pour les visites suivantes');
});

test('une copie d\'avant l\'empreinte avec un prix périmé repart du fichier, même lignes ou pas', async () => {
  // On ne sait pas si l'écart vient du joueur ou du fichier : le fichier l'emporte, sans
  // quoi le prix périmé serait marqué à jour et ne serait plus jamais corrigé.
  const ancienne = copie(DEF);
  ancienne.items[0].cost = DEF.items[0].cost + 1;
  ancienne.items[1].take = 2;
  ancienne.resources = 77;
  const { shop } = await charger(ancienne);
  assert.equal(shop.items[0].cost, DEF.items[0].cost);
  assert.equal(shop.items[1].take, undefined);
  assert.equal(shop.resources, 77);
});

test('tant que le fichier ne change pas, les corrections et les lignes ajoutées par le joueur restent', async () => {
  const { stocke: aJour } = await charger(copie(DEF));
  aJour.items[0].cost = DEF.items[0].cost + 1;
  aJour.items.push({ itemId: DEF.items[0].itemId, qty: 9, cost: 9, qtyMax: 9 });
  const { shop } = await charger(aJour);
  assert.equal(shop.items.length, DEF.items.length + 1);
  assert.equal(shop.items[0].cost, DEF.items[0].cost + 1);
  assert.equal(shop.items.at(-1).qty, 9);
});

test('une copie faite sur une autre version du fichier repart du fichier, monnaie gardée', async () => {
  const autre = copie(DEF);
  autre.items[0].cost = DEF.items[0].cost * 2;
  autre.src = 'autre-version';
  autre.resources = 50;
  const { shop } = await charger(autre);
  assert.equal(shop.items[0].cost, DEF.items[0].cost);
  assert.equal(shop.resources, 50);
});

test('l\'empreinte ne bouge ni avec l\'ordre des clés ni avec un champ que le site ne lit pas', async () => {
  const ctx = createContext();
  const melange = copie(DEF);
  melange.items = melange.items.map(i => ({ note: 'x', ...Object.fromEntries(Object.entries(i).reverse()) }));
  const src = d => run(ctx, `scEventSrc(${JSON.stringify(d)})`);
  assert.equal(src(melange), src(DEF));
  const prix = copie(DEF); prix.items[0].cost += 1;
  assert.notEqual(src(prix), src(DEF), 'un prix changé, lui, la change');
});
