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
  // le relevé en jeu d'Aistra contredisait.
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
  // Contrôle stable de MAP.md §7 : 30 588 (tableur d'Aistra) + 1 800 apportés par la
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

test("Clair de Lune — un pack n'est pas achetable au-delà de son `lastDay`", async () => {
  // L'événement dure 8 jours, les packs ne s'achètent que les 7 premiers. Le plan
  // ci-dessous en porte un au jour 8 : c'est ce qu'un fichier d'événement corrigé
  // APRÈS coup laisse derrière lui dans le localStorage du joueur. Il ne doit
  // compter ni en dépense, ni en récompenses.
  const ctx = await loadEventShop('moonlight-shop', { buys: { moon_50: { 8: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.spend, 0);
  assert.equal(c.buysTotal, 0);
});

test("Clair de Lune — le même pack au jour 7 compte, lui", async () => {
  // Le pendant du test précédent : il prouve que le zéro vient bien de la borne et
  // non d'un pack introuvable ou d'un plan mal formé.
  const ctx = await loadEventShop('moonlight-shop', { buys: { moon_50: { 7: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.buysTotal, 1);
  assert.ok(c.spend > 0, `dépense attendue, obtenu ${c.spend}`);
});

test("Clair de Lune — les Lanternes du Désireux ne sont jamais valorisées", async () => {
  // Elles ne sont pas la monnaie de la boutique : elles alimentent une activité
  // aléatoire dont sortent les Gâteaux de Lune. Aucun lien chiffrable, donc aucune
  // valeur en gemmes — seules les ressources et le VIP du pack en portent une.
  const ctx = await loadEventShop('moonlight-shop', { buys: { moon_100: { 1: 1 } } });
  const c = run(ctx, 'seCompute()');
  // 10 000 pains + 10 000 bois + 2 000 pierres + 500 fer + 20 000 EXP VIP
  assert.equal(c.valueGem, 240000);
});

test("Clair de Lune — trois achats par jour sur le pack à 100 $, un seul sur les autres", async () => {
  // Le plafond journalier vient du fichier : s'il glissait, la grille laisserait
  // budgéter un achat que le jeu refuse.
  const packs = await loadEventShop('moonlight-shop').then(ctx => run(ctx, 'SE_DATA.packs'));
  for (const p of packs) {
    assert.equal(p.lastDay, 7, `${p.id} devrait fermer au jour 7`);
    assert.equal(p.perDay, p.id === 'moon_100' ? 3 : 1, `plafond inattendu sur ${p.id}`);
  }
});

test("Clair de Lune — ressources et VIP des packs décochés à l'ouverture", async () => {
  // `_meta.excludedByDefault` n'est pas une suppression : les lignes restent listées
  // et se recochent d'un clic. Elles partent décochées parce que le retour de cet
  // événement se lit dans le panier de la boutique, pas dans la garniture des packs.
  // Le harnais pose un plan explicite, donc on vérifie ici la LISTE du fichier —
  // c'est elle qui alimente `seDefaultExcluded()` au premier chargement.
  const ctx = await loadEventShop('moonlight-shop', {
    buys: { moon_1: { 1: 1 }, moon_2: { 1: 1 } },
    excluded: { '100_exp_vip': 1, '10k_bread': 1, '10k_wood': 1, '10k_stone': 1, '10k_iron': 1 }
  });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.gemRewards, 0, 'aucune gemme ne doit être comptée sur les packs');
  assert.equal(c.itemsOn, 1, 'seule la Lanterne reste comptée');
  assert.equal(c.itemsAll, 6);
  assert.ok(c.spend > 0, 'la dépense, elle, est bien comptée');
});

test("Clair de Lune — la liste décochée par défaut couvre tout ce qui a une valeur", async () => {
  // Si un objet valorisé entrait dans les packs sans rejoindre la liste, il gonflerait
  // le retour en silence. Ce test attrape l'oubli.
  const ctx = await loadEventShop('moonlight-shop', { buys: { moon_100: { 1: 1 } } });
  const defaut = run(ctx, '(SE_DATA._meta.excludedByDefault || [])');
  const c = run(ctx, 'seCompute()');
  for (const r of c.rows) {
    assert.ok(defaut.includes(r.id),
      `« ${r.nameTxt} » (${r.id}) vaut ${r.gem} gemmes mais n'est pas dans excludedByDefault`);
  }
  assert.equal(c.extras.length, 1, 'la Lanterne est le seul objet hors référentiel');
});
