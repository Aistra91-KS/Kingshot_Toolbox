/* ==========================================================================
   Prérequis automatiques de l'onglet avancé — wa_optimizer.raiseReqs / lowerDeps

   Régler le niveau d'une recherche avancée monte ce qu'elle exige ; en baisser une
   baisse ce qui en dépend, comme la Sélection rapide de la page Recherches. Les tests
   tournent sur la vraie base (92 recherches) et vérifient la règle du jeu écrite ici
   indépendamment : un niveau exige tous ceux d'en dessous, et chacun ses `req`.
   ========================================================================== */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT } from './harness.mjs';

const require = createRequire(import.meta.url);
const { advancedTree, raiseReqs, lowerDeps } = require(path.join(ROOT, 'js/wa_optimizer.js'));
const adv = advancedTree(require(path.join(ROOT, 'data/truegold_war_advanced_db.json')));
const parId = Object.fromEntries(adv.researches.map(r => [r.id, r]));
const zero = () => Object.fromEntries(adv.researches.map(r => [r.id, 0]));
const appliquer = (lv, ch) => ({ ...lv, ...ch });

// Les prérequis non tenus, recherche par recherche.
function manques(lv) {
  const out = [];
  for (const r of adv.researches) {
    for (const l of r.levels) {
      if (l.level > lv[r.id]) continue;
      for (const q of l.req || []) {
        if ((lv[q.r] || 0) < q.lvl) out.push(`${r.id} niv. ${l.level} exige ${q.r} niv. ${q.lvl}`);
      }
    }
  }
  return out;
}

function grain(seed) {
  return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}
// Un compte cohérent tiré au sort : chaque recherche montée avec ses prérequis.
function compte(rnd, n) {
  let lv = zero();
  for (let i = 0; i < n; i++) {
    const r = adv.researches[Math.floor(rnd() * adv.researches.length)];
    const to = 1 + Math.floor(rnd() * r.maxLevel);
    if (lv[r.id] >= to) continue;
    lv = appliquer(lv, raiseReqs(adv, lv, r.id, to));
    lv[r.id] = to;
  }
  return lv;
}

test('Provisions limitées au niveau 3 sur un compte vierge : ses prérequis passent au niveau 3', () => {
  const lv = zero();
  const ch = raiseReqs(adv, lv, 'limited_supply', 3);
  assert.equal(ch.truegold_infirmaries, 3);
  assert.equal(ch.quick_bandage, 3);
  assert.ok(!('limited_supply' in ch), 'la recherche réglée par le joueur ne fait pas partie des changements');
  assert.deepEqual(manques(appliquer(lv, { ...ch, limited_supply: 3 })), []);
});

test('monter ne baisse jamais rien, et laisse en place un prérequis déjà plus haut', () => {
  const lv = { ...zero(), truegold_infirmaries: 8 };
  const ch = raiseReqs(adv, lv, 'limited_supply', 3);
  assert.ok(!('truegold_infirmaries' in ch));
  for (const id of Object.keys(ch)) assert.ok(ch[id] > lv[id], `${id} n'a pas monté`);
});

test('monter n\'importe quelle recherche à n\'importe quel niveau laisse un compte cohérent', () => {
  const rnd = grain(7);
  for (let i = 0; i < 300; i++) {
    const lv = compte(rnd, Math.floor(rnd() * 15));
    const r = adv.researches[Math.floor(rnd() * adv.researches.length)];
    const to = 1 + Math.floor(rnd() * r.maxLevel);
    const apres = appliquer(lv, raiseReqs(adv, lv, r.id, to));
    apres[r.id] = Math.max(apres[r.id], to);
    assert.deepEqual(manques(apres), [], `${r.id} niv. ${to}`);
  }
});

test('baisser un prérequis baisse ce qui en dépend, au plus haut niveau encore tenu', () => {
  const lv = { ...zero(), limited_supply: 3, ...raiseReqs(adv, zero(), 'limited_supply', 3) };
  const ch = lowerDeps(adv, { ...lv, truegold_infirmaries: 1 }, 'truegold_infirmaries', 1);
  // Les niveaux 1 et 2 de Provisions limitées n'exigent que le niveau 1 d'Infirmeries.
  assert.equal(ch.limited_supply, 2);
  assert.deepEqual(manques(appliquer({ ...lv, truegold_infirmaries: 1 }, ch)), []);
});

test('baisser laisse un compte cohérent, et ne baisse que ce qui en dépend', () => {
  const rnd = grain(23);
  for (let i = 0; i < 300; i++) {
    const lv = compte(rnd, 5 + Math.floor(rnd() * 20));
    const montees = adv.researches.filter(r => lv[r.id] > 0);
    if (!montees.length) continue;
    const r = montees[Math.floor(rnd() * montees.length)];
    const to = Math.floor(rnd() * lv[r.id]);
    const ch = lowerDeps(adv, { ...lv, [r.id]: to }, r.id, to);
    const apres = appliquer({ ...lv, [r.id]: to }, ch);
    assert.deepEqual(manques(apres), [], `${r.id} ramené à ${to}`);
    for (const id of Object.keys(ch)) assert.ok(ch[id] < lv[id], `${id} n'a pas baissé`);
  }
});

test('une sauvegarde déjà incohérente ailleurs n\'est pas touchée', () => {
  // Provisions limitées saisie au niveau 5 sans ses prérequis, puis une baisse sur une
  // recherche hors de sa chaîne : Provisions limitées ne bouge pas.
  const chaine = new Set(Object.keys(raiseReqs(adv, zero(), 'limited_supply', 10)));
  const autre = adv.researches.find(r => r.id !== 'limited_supply' && !chaine.has(r.id) && r.maxLevel >= 2);
  const lv = { ...zero(), limited_supply: 5, [autre.id]: 2 };
  assert.ok(manques(lv).some(m => m.startsWith('limited_supply')), 'le compte de départ est bien incohérent');
  const ch = lowerDeps(adv, { ...lv, [autre.id]: 0 }, autre.id, 0);
  assert.ok(!('limited_supply' in ch), `baisser ${autre.id} a touché Provisions limitées`);
});
