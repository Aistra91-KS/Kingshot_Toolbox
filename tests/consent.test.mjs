/* Consentement aux cookies de mesure (MAP §9 `09a`). Chaque page porte deux morceaux
   qui ne marchent qu'ensemble : l'extrait Google en ligne, qui pose le refus par
   défaut, et `js/consent.js`, qui charge gtag.js après accord. Sans le second, la page
   n'affiche jamais le bandeau et ne compte jamais de visite ; avec l'extrait d'origine
   de Google collé tel quel, elle mesure sans rien demander. Les deux passent sans bruit
   dans le navigateur, d'où ce test. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function pages(dossier = '.', acc = []) {
  for (const nom of readdirSync(join(ROOT, dossier))) {
    const rel = join(dossier, nom);
    if (/^(\.git|node_modules|tests|map)$/.test(rel) || rel === join('tools', 'reviews')) continue;
    if (statSync(join(ROOT, rel)).isDirectory()) pages(rel, acc);
    else if (nom.endsWith('.html')) acc.push(rel);
  }
  return acc;
}

// Les pages et les gabarits complets, c'est-à-dire tout ce qui a un <head>. Le jeton
// de la Search Console n'en a pas, les morceaux de tools/partials non plus.
const AVEC_HEAD = pages().map(f => [f, readFileSync(join(ROOT, f), 'utf8')]).filter(([, src]) => /<head>/.test(src));

const GA_ID = readFileSync(join(ROOT, 'js', 'consent.js'), 'utf8').match(/var GA_ID = '(G-[A-Z0-9]+)'/)[1];

test('chaque page pose le refus par défaut et charge consent.js', () => {
  assert.ok(AVEC_HEAD.length > 100, `${AVEC_HEAD.length} pages trouvées seulement`);
  const fautes = [];
  for (const [f, src] of AVEC_HEAD) {
    const head = src.slice(0, src.indexOf('</head>'));
    if (!head.includes(`if (navigator.webdriver) window['ga-disable-${GA_ID}'] = true;`)) fautes.push(`${f} : ligne navigator.webdriver absente ou autre identifiant que ${GA_ID}`);
    if (!head.includes("gtag('consent', 'default', {ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'});")) fautes.push(`${f} : refus par défaut absent`);
    if (!/<script src="\/?js\/consent\.js" defer><\/script>/.test(head)) fautes.push(`${f} : js/consent.js non chargé (en defer, dans le <head>)`);
  }
  assert.deepEqual(fautes, []);
});

test("aucune page ne charge gtag.js ni ne lance la mesure d'elle-même", () => {
  const fautes = [];
  for (const [f, src] of AVEC_HEAD) {
    if (src.includes('googletagmanager.com/gtag/js')) fautes.push(`${f} : gtag.js chargé sans accord`);
    if (/gtag\(\s*'config'/.test(src)) fautes.push(`${f} : gtag('config') dans la page`);
  }
  assert.deepEqual(fautes, []);
});

test('la 404 charge consent.js par un chemin absolu', () => {
  // Servie à n'importe quelle profondeur et sans <base> : un chemin relatif y serait introuvable.
  assert.match(readFileSync(join(ROOT, '404.html'), 'utf8'), /<script src="\/js\/consent\.js" defer><\/script>/);
});
