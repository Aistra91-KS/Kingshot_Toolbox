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

// Clair de Lune, du 20 au 28 septembre 2026. Ces tests lisent le stock du jour et les
// jours restants : ils se jouent au 3e jour, horloge figée, pour garder leur sens une
// fois l'événement fini (deux d'entre eux ont viré au rouge le 28 septembre).
const LUNE_J3 = '2026-09-22T12:00:00Z';
const lune = (plan) => loadEventShop('moonlight-shop', plan, { now: LUNE_J3 });

test("Clair de Lune — un pack n'est pas achetable au-delà de son `lastDay`", async () => {
  // L'événement dure 8 jours, les packs ne s'achètent que les 7 premiers. Le plan
  // ci-dessous en porte un au jour 8 : c'est ce qu'un fichier d'événement corrigé
  // APRÈS coup laisse derrière lui dans le localStorage du joueur. Il ne doit
  // compter ni en dépense, ni en récompenses.
  const ctx = await lune({ buys: { moon_50: { 8: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.spend, 0);
  assert.equal(c.buysTotal, 0);
});

test("Clair de Lune — le même pack au jour 7 compte, lui", async () => {
  // Le pendant du test précédent : il prouve que le zéro vient bien de la borne et
  // non d'un pack introuvable ou d'un plan mal formé.
  const ctx = await lune({ buys: { moon_50: { 7: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.buysTotal, 1);
  assert.ok(c.spend > 0, `dépense attendue, obtenu ${c.spend}`);
});

test("Clair de Lune — les Lanternes du Désireux ne sont jamais valorisées", async () => {
  // Elles ne sont pas la monnaie de la boutique : elles alimentent une activité
  // aléatoire dont sortent les Gâteaux de Lune. Aucun lien chiffrable, donc aucune
  // valeur en gemmes — seules les ressources et le VIP du pack en portent une.
  const ctx = await lune({ buys: { moon_100: { 1: 1 } } });
  const c = run(ctx, 'seCompute()');
  // 10 000 pains + 10 000 bois + 2 000 pierres + 500 fer + 20 000 EXP VIP
  assert.equal(c.valueGem, 240000);
});

test("Clair de Lune — trois achats par jour sur le pack à 100 $, un seul sur les autres", async () => {
  // Le plafond journalier vient du fichier : s'il glissait, la grille laisserait
  // budgéter un achat que le jeu refuse. Ne concerne que les packs QUOTIDIENS :
  // les deux packs à achat unique n'ont ni plafond par jour ni fermeture au J7.
  const packs = await lune().then(ctx => run(ctx, 'SE_DATA.packs'));
  for (const p of packs.filter(x => !x.once)) {
    assert.equal(p.lastDay, 7, `${p.id} devrait fermer au jour 7`);
    assert.equal(p.perDay, p.id === 'moon_100' ? 3 : 1, `plafond inattendu sur ${p.id}`);
  }
});

test("Clair de Lune — un pack sous condition ne compte pas tant que son prérequis manque", async () => {
  // « Grands Desseins » ne s'achète qu'après « Désirs du Cœur ». Un plan qui porte
  // le second sans le premier ne doit rien dépenser ni rien rapporter : sinon la
  // page chiffrerait un achat que le jeu refuse de vendre.
  const ctx = await lune({ buys: { grand_visions: { 1: 1 } } });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.spend, 0, 'un pack verrouillé ne se paie pas');
  assert.equal(c.buysTotal, 0, 'un pack verrouillé ne compte pas comme achat');
});

test("Clair de Lune — le prérequis acheté un autre jour ouvre quand même le pack", async () => {
  // La condition porte sur l'événement, pas sur la journée : prérequis au J5, pack
  // conditionné au J1, les deux comptent. Les borner au même jour reviendrait à
  // interdire un achat que le jeu autorise.
  const ctx = await lune({
    buys: { heartfelt_desires: { 5: 1 }, grand_visions: { 1: 1 } },
  });
  const c = run(ctx, 'seCompute()');
  assert.equal(c.buysTotal, 2);
  assert.equal(Math.round(c.spend * 100) / 100, 29.98, 'les deux prix € additionnés');
});

test("Clair de Lune — un pack à achat unique ne se paie qu'une fois", async () => {
  // Le plan peut porter plusieurs jours pour le même pack `once` (fichier modifié,
  // plan plus ancien) : seul le premier jour coché compte.
  const ctx = await lune({
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
  const ctx = await lune({
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
  const packs = await lune().then(ctx => run(ctx, 'SE_DATA.packs'));
  for (const p of packs) {
    const ctx = await lune({
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
  const ctx = await lune({ buys: { moon_100: { 1: 1 } } });
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
  const ctx = await lune();
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
  const ctx = await lune();
  run(ctx, 'spShop().items[5].have = 10;');
  const r = run(ctx, 'scComputeRows(spShop()).all.find(x => x.i === 5)');
  assert.equal(r.itemId, 'mithril');
  assert.equal(r.maxfin, 20, '30 au total, 10 pris');
});

test("Clair de Lune — un stock qui se recharge ne perd que ce qui dépasse son total", async () => {
  // Prendre 30 coffres hier ne retire rien aux 30 d'aujourd'hui : tant que le stock de
  // l'événement n'est pas entamé, le plafond reste celui des jours restants. Une fois
  // les 240 pris, il n'y a plus rien à prendre, quels que soient les jours qui restent.
  const ctx = await lune();
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
  const ctx = await lune();
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

// Stand Alchimique (Alchemy Junction), du 29 septembre au 2 octobre 2026, boutique
// ouverte jusqu'au 3. Horloge figée au 2e jour, pour la même raison qu'au Clair de Lune.
const ALCHIMIE_J2 = '2026-09-30T12:00:00Z';
const alchimie = (plan) => loadEventShop('brewmaster-stall', plan, { now: ALCHIMIE_J2 });

test("Stand Alchimique — les commandes paient les Bons selon le barème", async () => {
  // 2 000, 2 000, 3 000 ×3, 4 000 ×2, 5 000 : 26 000 pour les huit premières, puis
  // 5 000 par commande. Les Bons ne viennent de nulle part ailleurs : sans commande,
  // la monnaie prévue est nulle.
  const bons = async n => run(await alchimie({ orders: n }), 'seCompute()').coins;
  assert.equal(await bons(0), 0);
  assert.equal(await bons(1), 2000);
  assert.equal(await bons(5), 13000);
  assert.equal(await bons(8), 26000);
  assert.equal(await bons(12), 46000);
  assert.equal(await bons(30), 136000, 'les 30 commandes du barème relevé');
});

test("Stand Alchimique — une saisie énorme se calcule sans boucler dessus", async () => {
  // Le total s'additionne sur le barème, pas commande par commande : un zéro de trop
  // tapé dans le champ ne doit pas figer la page.
  const c = run(await alchimie({ orders: 1e9 }), 'seCompute()');
  assert.equal(c.coins, 26000 + (1e9 - 8) * 5000);
});

test("Stand Alchimique — la tuile de monnaie existe même sans commande saisie", async () => {
  // Les commandes sont la seule source de Bons : sans ce test, la tuile et le bouton
  // « Utiliser comme budget » disparaîtraient tant que le joueur n'a rien saisi.
  const ctx = await alchimie();
  assert.equal(run(ctx, 'seHasCoins()'), true);
});

test("Stand Alchimique — les paliers de consommation se cumulent", async () => {
  // 1 000 Breuvages utilisés débloquent les 11 paliers : 470 Or Véritable (20 + 40 + 55
  // + 70 + 85 + 100 + 100) et 21 000 Insignes Mystère (3 000 + 4 500 + 6 000 + 7 500).
  const c = run(await alchimie({ explore: 1000 }), 'seCompute()');
  assert.equal(c.expTiers, 11);
  assert.equal(c.rows.find(r => r.id === 'truegold').qty, 470);
  assert.equal(c.rows.find(r => r.id === 'mystery_badge').qty, 21000);
  const juste = run(await alchimie({ explore: 99 }), 'seCompute()');
  assert.equal(juste.expTiers, 1, 'à 99, seul le palier de 20 est atteint');
});

test("Stand Alchimique — les Breuvages Magiques sont comptés, jamais valorisés", async () => {
  // F2P sur 3 jours : 20 breuvages de missions par jour. Un achat au J1 ajoute les 10
  // du pack et 1 de la mission d'achat. Aucun des deux n'entre dans la valeur.
  const f2p = run(await alchimie(), 'seCompute()');
  assert.equal(f2p.extras.length, 1);
  assert.equal(f2p.extras[0].label.EN, 'Magic Brew');
  assert.equal(f2p.extras[0].qty, 60);
  assert.equal(f2p.valueGem, 0);
  const achat = run(await alchimie({ buys: { brew_1: { 1: 1 } } }), 'seCompute()');
  assert.equal(achat.extras[0].qty, 71);
});

test("Stand Alchimique — l'Élixir Parfait exige l'Élixir Supérieur", async () => {
  const seul = run(await alchimie({ buys: { perfect_elixir: { 1: 1 } } }), 'seCompute()');
  assert.equal(seul.spend, 0, 'un pack verrouillé ne se paie pas');
  const deux = run(await alchimie({ buys: { superior_elixir: { 2: 1 }, perfect_elixir: { 1: 1 } } }), 'seCompute()');
  assert.equal(deux.buysTotal, 2);
  assert.equal(Math.round(deux.spend * 100) / 100, 17.98);
});

test("Stand Alchimique — tout ce que versent les packs part décoché, sauf l'Or Véritable", async () => {
  // Choix d'Aistra : le retour se lit dans ce qui ne s'achète pas (paliers, panier de
  // la boutique) plus l'Or Véritable. La règle couvre chaque itemId de chaque pack, y
  // compris un pack relevé plus tard, sans liste à tenir.
  const ctx = await alchimie();
  const defaut = run(ctx, 'seDefaultExcluded()');
  let vus = 0;
  for (const p of run(ctx, 'SE_DATA.packs')) {
    for (const it of [p.reward, p.immediate].flatMap(b => (b && b.items) || [])) {
      if (!it.itemId) continue;
      vus++;
      assert.equal(!!defaut[it.itemId], it.itemId !== 'truegold', `${it.itemId} du pack ${p.id}`);
    }
  }
  assert.ok(vus > 20, 'les packs versent bien des objets du référentiel');
  assert.ok(!defaut.mystery_badge, 'les Insignes des paliers ne viennent d\'aucun pack, ils restent cochés');
});

test("Stand Alchimique — à l'ouverture, seuls l'Or Véritable et les paliers comptent", async () => {
  // Les deux Élixirs achetés, 1 000 Breuvages utilisés, plan neuf : la valeur en
  // gemmes est celle de 692 Or Véritable (222 des Élixirs, 470 des paliers) et des
  // 21 000 Insignes, rien d'autre.
  const ctx = await alchimie({ explore: 1000, buys: { superior_elixir: { 1: 1 }, perfect_elixir: { 1: 1 } } });
  run(ctx, 'SE_PLAN.excluded = seDefaultExcluded();');
  const c = run(ctx, 'seCompute()');
  const on = c.rows.filter(r => !r.off).map(r => r.id).sort().join(',');
  assert.equal(on, 'mystery_badge,truegold');
  assert.equal(c.rows.find(r => r.id === 'truegold').qty, 692);
  assert.equal(c.gemRewards, 692 * run(ctx, "scGem('truegold')") + 21000 * run(ctx, "scGem('mystery_badge')"));
});
