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
  // budgéter un achat que le jeu refuse. Ne concerne que les packs QUOTIDIENS :
  // les deux packs à achat unique n'ont ni plafond par jour ni fermeture au J7.
  const packs = await loadEventShop('moonlight-shop').then(ctx => run(ctx, 'SE_DATA.packs'));
  for (const p of packs.filter(x => !x.once)) {
    assert.equal(p.lastDay, 7, `${p.id} devrait fermer au jour 7`);
    assert.equal(p.perDay, p.id === 'moon_100' ? 3 : 1, `plafond inattendu sur ${p.id}`);
  }
});

test("Clair de Lune — un pack sous condition ne compte pas tant que son prérequis manque", async () => {
  // « Grands Desseins » ne s'achète qu'après « Désirs du Cœur ». Un plan qui porte
  // le second sans le premier ne doit rien dépenser ni rien rapporter : sinon la
  // page chiffrerait un achat que le jeu refuse de vendre.
  const ctx = await loadEventShop('moonlight-shop', { buys: { grand_visions: { 1: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.spend, 0, 'un pack verrouillé ne se paie pas');
  assert.equal(c.buysTotal, 0, 'un pack verrouillé ne compte pas comme achat');
});

test("Clair de Lune — le prérequis acheté un autre jour ouvre quand même le pack", async () => {
  // La condition porte sur l'événement, pas sur la journée : prérequis au J5, pack
  // conditionné au J1, les deux comptent. Les borner au même jour reviendrait à
  // interdire un achat que le jeu autorise.
  const ctx = await loadEventShop('moonlight-shop', {
    buys: { heartfelt_desires: { 5: 1 }, grand_visions: { 1: 1 } },
  });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.buysTotal, 2);
  assert.equal(Math.round(c.spend * 100) / 100, 29.98, 'les deux prix € additionnés');
});

test("Clair de Lune — un pack à achat unique ne se paie qu'une fois", async () => {
  // Le plan peut porter plusieurs jours pour le même pack `once` (fichier modifié,
  // plan plus ancien) : seul le premier jour coché compte.
  const ctx = await loadEventShop('moonlight-shop', {
    buys: { heartfelt_desires: { 2: 1, 6: 1 } },
  });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.buysTotal, 1);
  assert.equal(c.spend, 5.99);
});

test("Clair de Lune — le contenu des packs est décoché à l'ouverture", async () => {
  // Décocher n'est pas supprimer : les lignes restent listées et se recochent d'un
  // clic. Elles partent décochées parce que le retour de cet événement se lit dans le
  // panier de la boutique, pas dans ce que les packs versent à côté.
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

test("Clair de Lune — le décochage par défaut couvre TOUS les packs, sans liste à tenir", async () => {
  // La règle remplace l'inventaire : quel que soit le pack coché, aucun objet valorisé
  // ne doit rester compté à l'ouverture. Une liste d'itemId laissait passer en silence
  // l'objet d'un pack relevé plus tard.
  const packs = await loadEventShop('moonlight-shop').then(ctx => run(ctx, 'SE_DATA.packs'));
  for (const p of packs) {
    const ctx = await loadEventShop('moonlight-shop', {
      buys: { heartfelt_desires: { 1: 1 }, [p.id]: { 1: 1 } },
    });
    const defaut = run(ctx, 'seDefaultExcluded()');
    const c = run(ctx, 'seCompute()');
    for (const r of c.rows) {
      assert.ok(defaut[r.id],
        `« ${r.nameTxt} » (${r.id}) du pack ${p.id} vaut ${r.gem} gemmes et reste coché`);
    }
  }
});

test("Clair de Lune — les Lanternes restent cochées, elles ne pèsent sur aucun total", async () => {
  // Un objet sans itemId n'est jamais chiffré : le griser masquerait au joueur ce
  // qu'il récolte sans rien changer au retour affiché.
  const ctx = await loadEventShop('moonlight-shop', { buys: { moon_100: { 1: 1 } } });
  const defaut = run(ctx, 'seDefaultExcluded()');
  const c = run(ctx, 'seCompute()');
  assert.equal(c.extras.length, 1, 'la Lanterne est le seul objet hors référentiel');
  assert.ok(!defaut['x:Wishful Lantern'], 'la Lanterne ne doit pas partir décochée');
});

test("Clair de Lune — « Déjà pris » compte dans la valeur sans toucher au solde", async () => {
  // Le cas qui a motivé la colonne : au 3e jour, ce qui a été acheté les deux premiers
  // n'entrait nulle part. Les gâteaux du déjà-pris sont sortis du solde EN JEU, donc le
  // solde saisi ne doit pas s'en faire retirer une seconde fois — mais leur valeur, elle,
  // compte bien dans ce que l'événement a rapporté.
  const ctx = await loadEventShop('moonlight-shop');
  run(ctx, `const s = spShop(); s.resources = 500;
            s.items[0].have = 200; s.items[0].take = 20;`);
  const c = run(ctx, 'scComputeRows(spShop()).cart');
  assert.equal(c.spent, 3960, '220 lots à 18 gâteaux');
  assert.equal(c.spentHave, 3600, 'dont 200 lots déjà payés en jeu');
  assert.equal(c.left, 140, 'seuls les 20 lots du panier sortent du solde de 500');
  assert.equal(c.gems, 440000, 'les 220 lots comptent dans la valeur');
});

test("Clair de Lune — le « Dispo » se réduit de ce qui est déjà pris", async () => {
  // Sans réinitialisation, le stock est celui de tout l'événement : 30 Mithril, 10
  // déjà pris, 20 encore disponibles. C'est le cas qui se lit le plus directement.
  const ctx = await loadEventShop('moonlight-shop');
  run(ctx, 'spShop().items[5].have = 10;');
  const r = run(ctx, 'scComputeRows(spShop()).all.find(x => x.i === 5)');
  assert.equal(r.itemId, 'mithril');
  assert.equal(r.maxfin, 20, '30 au total, 10 pris');
});

test("Clair de Lune — un stock qui se recharge ne perd que ce qui dépasse son total", async () => {
  // Prendre 30 coffres hier ne retire rien aux 30 d'aujourd'hui : tant que le stock de
  // l'événement n'est pas entamé, le plafond reste celui des jours restants. Une fois
  // les 240 pris, il n'y a plus rien à prendre, quels que soient les jours qui restent.
  const ctx = await loadEventShop('moonlight-shop');
  const dispo = n => { run(ctx, `spShop().items[0].have = ${n};`);
                       return run(ctx, 'scComputeRows(spShop()).all[0].maxfin'); };
  const plein = dispo(0);
  assert.ok(plein > 0 && plein <= 240, 'le plafond de départ suit les jours restants');
  assert.equal(dispo(30), plein, '30 pris un jour passé ne retirent rien aux jours restants');
  assert.equal(dispo(240), 0, 'le stock de tout l\'événement est épuisé');
});

test("Clair de Lune — le plafond du « Déjà pris » est le stock de tout l'événement", async () => {
  // 30 par jour sur 8 jours = 240, quel que soit le jour où la page est ouverte. Le
  // plafond de « Je prends », lui, suit les jours qui restent : c'est ce décalage qui
  // empêchait de saisir un achat du premier jour.
  const ctx = await loadEventShop('moonlight-shop');
  run(ctx, 'spShop().items[0].have = 9999;');
  const r = run(ctx, 'scComputeRows(spShop()).all[0]');
  assert.equal(r.haveMax, 240);
  assert.equal(r.have, 240, 'une saisie au-delà du stock total est ramenée au plafond');
});

test("Théâtre — sans `trackOwned`, rien ne change pour les autres boutiques", async () => {
  // La colonne est demandée boutique par boutique. Ailleurs, `have` reste à zéro même
  // si un ancien plan en portait un, et les totaux sont ceux d'avant.
  const ctx = await loadEventShop('theater-shop');
  run(ctx, 'spShop().items[0].have = 50;');
  const rows = run(ctx, 'scComputeRows(spShop())');
  assert.equal(rows.all[0].have, 0);
  assert.equal(rows.all[0].haveMax, 0);
  assert.equal(rows.cart.spentHave, 0);
});
