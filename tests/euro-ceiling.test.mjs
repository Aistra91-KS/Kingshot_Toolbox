/* Règles plafond — drapeau `ceiling` du bloc `derived` de data/shopcalc_euro.json,
   résolu par `scEurUnit()` de js/shop-core.js.

   Ce que ces tests verrouillent : un objet dont la monnaie d'achat est la gemme vaut
   ce que ses gemmes valent, et pas le prix du pack où le relevé l'a croisé. La Clé en
   Or sortait d'un coffre personnalisé à 6 € dont elle n'est qu'une ligne, et ressortait
   donc à 6 € au lieu de 1,29 — 4,7 fois trop. Mais la règle n'est qu'un plafond : si un
   pack vend l'objet moins cher que ses gemmes, c'est ce pack qui fait le prix. */

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
const gemValue = (ctx, id) => run(ctx, `(SC_ITEMS.find(i => i.id === ${JSON.stringify(id)}) || {}).gemValue`);

test('un objet sous plafond vaut exactement ses gemmes', async () => {
  // Le contrôle qui compte : le prix affiché doit être celui de la monnaie d'achat,
  // au centime près, sans quoi le plafond ne sert à rien.
  const ctx = await euro();
  const gem = unit(ctx, 'gem');
  for (const id of ['gold_key', '10_exp_vip', '100_exp_vip']) {
    const attendu = gemValue(ctx, id) * gem;
    assert.ok(Math.abs(unit(ctx, id) - attendu) < 1e-12,
      `${id} : ${unit(ctx, id)} au lieu de ${attendu}`);
  }
});

test('les lots d\'EXP VIP déduits suivent le palier plafonné', async () => {
  // 1 000 et 10 000 points n'ont aucun relevé : ils se déduisent du lot de 100. Le
  // plafond posé sur celui-ci doit donc descendre jusqu'à eux, sans règle de plus.
  const ctx = await euro();
  const cent = unit(ctx, '100_exp_vip');
  assert.ok(Math.abs(unit(ctx, '1000_exp_vip') - cent * 10) < 1e-12);
  assert.ok(Math.abs(unit(ctx, '10000_exp_vip') - cent * 100) < 1e-12);
});

test('un pack moins cher que le plafond reprend la main', async () => {
  // Le « si et seulement si » de la règle. On fait descendre le relevé de la Clé en Or
  // sous sa valeur en gemmes : c'est alors lui qui doit décider, pastille et pack
  // d'origine compris — une valeur « Calculée » qui ne vient pas de la règle enverrait
  // l'audit du chiffre au mauvais endroit.
  const ctx = await euro();
  const parLaGemme = unit(ctx, 'gold_key');
  run(ctx, "SC_EURO.gold_key = { qty: 1000, packs: ['daily-deals'] };");
  const apres = unit(ctx, 'gold_key');
  assert.ok(apres < parLaGemme, 'le relevé moins cher doit gagner');
  assert.equal(run(ctx, "scEurIsDerived('gold_key')"), false, 'plus de pastille « Calculé »');
  assert.ok(run(ctx, "scEurSrc('gold_key')"), 'le pack du relevé est nommé');
});

test('un pack plus cher que le plafond ne change rien', async () => {
  // Le pendant du test précédent : un relevé au-dessus de la valeur en gemmes est
  // ignoré, et c'est la règle qui reste aux commandes.
  const ctx = await euro();
  const parLaGemme = unit(ctx, 'gold_key');
  run(ctx, "SC_EURO.gold_key = { qty: 1, packs: ['daily-deals'] };");
  assert.equal(unit(ctx, 'gold_key'), parLaGemme);
  assert.equal(run(ctx, "scEurIsDerived('gold_key')"), true);
});

test('une règle sans plafond décide toujours, même contre un relevé moins cher', async () => {
  // Les règles existantes ne changent pas de comportement : `ceiling` est un drapeau,
  // pas un nouveau défaut. La caisse mythique reste à 100 caisses chanceuses quoi qu'un
  // relevé en dise.
  const ctx = await euro();
  const avant = unit(ctx, 'custom_mythic_hero_gear_chest');
  run(ctx, "SC_EURO.custom_mythic_hero_gear_chest = { qty: 1000, packs: ['daily-deals'] };");
  assert.equal(unit(ctx, 'custom_mythic_hero_gear_chest'), avant);
  assert.equal(run(ctx, "scEurIsDerived('custom_mythic_hero_gear_chest')"), true);
});
