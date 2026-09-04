/* Valorisation d'un événement — `seCompute()` de js/shop-event.js.
   Les deux scénarios ci-dessous sont les CONTRÔLES RÉELS que MAP.md §7 décrit en
   prose depuis août : jusqu'ici ils étaient vérifiés à la main, une fois. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEventShop, run } from './harness.mjs';

test("Caravane du Dragon — 4 jours joués, achat fait ailleurs → 230 essences", async () => {
  // La mission d'achat de la Caravane est SAISONNIÈRE (réclamée une fois pour tout
  // l'événement) : le bon réglage est donc la case `purchaseOk`, pas le compteur
  // `outsideBuys` réservé aux missions quotidiennes (MAP §7, « Piège de
  // requiresPurchase »). Sans ce complément l'outil rendait 195 — le chiffre que
  // le relevé en jeu de Paul contredisait.
  const ctx = await loadEventShop('dragons-caravan', { played: 4, purchaseOk: true });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.coins, 230);
});

test("Caravane du Dragon — sans l'achat déclaré, la mission ne se paie pas", async () => {
  // Le pendant du test précédent : il prouve que les 35 essences viennent bien de
  // la mission d'achat, et pas d'une autre ligne qui la masquerait.
  const ctx = await loadEventShop('dragons-caravan', { played: 4 });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.coins, 195);
});

test("Stand d'Aventure — F2P sur 5 jours → 32 388 gemmes", async () => {
  // Contrôle stable de MAP.md §7 : 30 588 (tableur de Paul) + 1 800 apportés par la
  // piste des Points de Voyage, que le tableur ignorait. NE PAS « corriger » vers
  // 30 588 : l'écart EST la piste de voyage.
  // La contrepartie en euros n'est volontairement pas testée — elle suit le prix de
  // la gemme et bouge à chaque relevé de packs.
  const ctx = await loadEventShop('adventure-stall', { played: 5 });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.valueGem, 32388);
});

test("Stand d'Aventure — chaque source verse autant de Points de Vente que de Pièces", async () => {
  // Invariant de relevé (MAP.md §7) : un écart signale une ligne manquante dans le
  // fichier d'événement. Les paliers d'activité sont hors invariant — ils paient en
  // pièces sans rien verser en Points de Vente, par construction.
  const ctx = await loadEventShop('adventure-stall', { played: 5 });
  const c = run(ctx, 'seCompute()');
  for (const [src, coins] of Object.entries(c.curSrc.coins)) {
    if (src === 'Paliers' || src === 'Milestones') continue;
    assert.equal(coins.qty, (c.curSrc.stall[src] || {}).qty,
      `la source « ${src} » verse ${coins.qty} pièces mais ${(c.curSrc.stall[src] || {}).qty} Points de Vente`);
  }
});
