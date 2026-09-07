/* ==========================================================================
   Échanges de poussière (Académie de Guerre) — wa_optimizer.planTrades

   Trois échanges hebdomadaires alimentent le budget de poussière :
     5 000 pièces ->  1 poussière  (200 / semaine)
     5 TrueGold   -> 13 poussières ( 20 / semaine)
    10 TrueGold   -> 13 poussières (sans limite)

   Ce qui est vérifié ici : l'ordre de priorité (le TrueGold le moins dépensé
   possible), les deux plafonds, l'indivisibilité d'un échange, et le fait que
   `needDist = null` rende bien la capacité maximale.
   ========================================================================== */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const { planTrades } = require(path.join(ROOT, 'js/wa_optimizer.js'));

const n = (plan, id) => (plan.trades.find(t => t.id === id) || { n: 0 }).n;

test('sans rien à échanger, le plan est vide', () => {
  const p = planTrades(null, { coins: 0, truegold: 0 });
  assert.equal(p.dust, 0);
  assert.deepEqual(p.trades, []);
});

test('les pièces passent en premier : elles ne servent à rien d’autre sur le site', () => {
  // 50 000 pièces = 10 poussières, et il faut exactement 10 : aucun TrueGold touché.
  const p = planTrades(10, { coins: 50000, truegold: 1000 });
  assert.equal(p.dust, 10);
  assert.equal(p.truegold, 0);
  assert.equal(p.coins, 50000);
});

test('l’échange à 5 TG se remplit avant celui à 10 TG — il rend le double par TrueGold', () => {
  // 100 TG : 20 échanges à 5 TG (le plafond) = 260 poussières, et plus rien à donner.
  const p = planTrades(null, { coins: 0, truegold: 100 });
  assert.equal(n(p, 'tg5'), 20);
  assert.equal(n(p, 'tg10'), 0);
  assert.equal(p.dust, 260);
  assert.equal(p.truegold, 100);
});

test('le plafond de 20 franchi, le reste part à 10 TG', () => {
  // 150 TG : 20 x 5 TG (100 TG, 260 poussières) puis 5 x 10 TG (50 TG, 65 poussières).
  const p = planTrades(null, { coins: 0, truegold: 150 });
  assert.equal(n(p, 'tg5'), 20);
  assert.equal(n(p, 'tg10'), 5);
  assert.equal(p.dust, 325);
  assert.equal(p.truegold, 150);
});

test('les échanges déjà faits cette semaine entament le plafond, pas le stock', () => {
  // 18 des 20 échanges à 5 TG sont consommés : il n’en reste que 2.
  const p = planTrades(null, { coins: 0, truegold: 100, usedTg5: 18 });
  assert.equal(n(p, 'tg5'), 2);            // 10 TG -> 26 poussières
  assert.equal(n(p, 'tg10'), 9);           // les 90 TG restants -> 117
  assert.equal(p.dust, 26 + 117);
});

test('le plafond des pièces est bien 200 échanges par semaine', () => {
  const p = planTrades(null, { coins: 10_000_000, truegold: 0 });
  assert.equal(p.dust, 200);
  assert.equal(p.coins, 200 * 5000);
  const q = planTrades(null, { coins: 10_000_000, truegold: 0, usedCoins: 200 });
  assert.equal(q.dust, 0);
});

test('un échange est indivisible : 1 poussière manquante en coûte un entier, le surplus est rendu', () => {
  const p = planTrades(1, { coins: 0, truegold: 100 });
  assert.equal(n(p, 'tg5'), 1);
  assert.equal(p.dust, 13);
  assert.equal(p.over, 12);   // reste en stock pour la prochaine fois
  assert.equal(p.truegold, 5);
});

test('on ne dépense jamais plus que le stock déclaré', () => {
  const p = planTrades(9999, { coins: 7000, truegold: 4 });
  assert.equal(p.coins, 5000);   // 7 000 pièces ne paient qu’un seul échange
  assert.equal(p.truegold, 0);   // 4 TG ne suffisent pas au premier palier
  assert.equal(p.dust, 1);
});

test('demander une capacité couvre le besoin sans le dépasser inutilement', () => {
  // 260 poussières demandées = pile les 20 échanges à 5 TG, rien à 10 TG.
  const p = planTrades(260, { coins: 0, truegold: 1000 });
  assert.equal(n(p, 'tg5'), 20);
  assert.equal(n(p, 'tg10'), 0);
  assert.equal(p.over, 0);
});

test('les trois échanges se combinent quand un seul ne suffit pas', () => {
  const p = planTrades(500, { coins: 1_000_000, truegold: 1000 });
  // Les lots de TrueGold portent 312 poussières (20 x 13 + 4 x 13) ; les pièces, qui
  // se règlent à l'unité, comblent exactement le reste — 188 et pas 200.
  assert.equal(n(p, 'tg5'), 20);
  assert.equal(n(p, 'tg10'), 4);
  assert.equal(n(p, 'coins'), 188);
  assert.equal(p.dust, 500);
  assert.equal(p.over, 0);
});

test('aucune pièce dépensée si le lot de TrueGold couvrait déjà le besoin à lui seul', () => {
  // Le piège de l'indivisibilité : servir les pièces en premier donnait 1 poussière,
  // puis l'échange à 5 TG en rendait 13 — les 5 000 pièces ne servaient à rien.
  const p = planTrades(13, { coins: 5000, truegold: 100 });
  assert.equal(p.coins, 0);
  assert.equal(n(p, 'tg5'), 1);
  assert.equal(p.dust, 13);
  // Et le même besoin sans pièces du tout coûte exactement pareil en TrueGold.
  assert.equal(p.truegold, planTrades(13, { coins: 0, truegold: 100 }).truegold);
});

test('le retrait ne descend jamais sous le besoin', () => {
  for (let besoin = 1; besoin <= 400; besoin++) {
    const p = planTrades(besoin, { coins: 1_000_000, truegold: 1000 });
    assert.ok(p.dust >= besoin, `besoin ${besoin} non couvert (${p.dust})`);
    // et rien de superflu : retirer un échange de plus passerait sous la cible
    for (const l of p.trades) {
      const unite = l.dust / l.n;
      assert.ok(p.dust - unite < besoin, `échange ${l.id} de trop pour ${besoin}`);
    }
  }
});

test('une ligne décochée est sautée — le TrueGold peut rester intact', () => {
  const stock = { coins: 1_000_000, truegold: 1000 };
  const tout = planTrades(null, stock);
  const sansTg = planTrades(null, { ...stock, use: { coins: true, tg5: false, tg10: false } });
  assert.equal(sansTg.truegold, 0);
  assert.equal(sansTg.dust, 200);          // les seules pièces, à leur plafond
  assert.ok(tout.dust > sansTg.dust);

  // et décocher le seul échange sans plafond borne bien la capacité
  const sans10 = planTrades(null, { ...stock, use: { coins: true, tg5: true, tg10: false } });
  assert.equal(sans10.dust, 200 + 260);
});

test('sans `use`, tout reste autorisé — les appels d’avant gardent leur sens', () => {
  const stock = { coins: 0, truegold: 150 };
  assert.deepEqual(planTrades(null, stock), planTrades(null, { ...stock, use: { coins: true, tg5: true, tg10: true } }));
});
