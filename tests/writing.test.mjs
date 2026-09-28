/* Règle d'écriture n°7 de CLAUDE.md, sur le texte que le joueur lit : guillemets et
   apostrophes droits, pas de tiret cadratin entre deux mots.

   Ce que le test parcourt : les chaînes des scripts (js/ et scripts en ligne des
   pages), les chaînes des fichiers de data/, et le texte et les attributs des pages
   HTML, gabarits de tools/ compris. Les commentaires ne sont pas lus : ils ne
   s'affichent nulle part.

   Ce qui reste permis : le « — » seul, qui dit « pas de valeur » dans un tableau ou
   une liste (« — Objet — »), la signature « — Aistra », et le symbole cité (un « — »).
   Les chevrons « » du français ne sont pas des guillemets courbes.

   Ce qui n'est pas lu dans data/ : les clés `_…`, `meta` et `…Note`, notes de relevé
   qui ne s'affichent pas, et les entrées 0.x du changelog, laissées telles qu'elles
   ont été publiées. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// `fileURLToPath` et non `.pathname` : sous Windows, `.pathname` rend « /C:/… », que
// `join` transforme en « C:\C:\… », et les trois tests échouaient sans rien lire.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COURBES = /[\u2018\u2019\u201C\u201D]|\\u201[89CDcd]/;
// Un cadratin entre deux mots : « mot — mot », « mot—mot ».
const CADRATIN = /[\p{L}\p{N}][)»"'.,;:!?%]?\s+—\s+[\p{L}\p{N}«("']|[\p{L}]—[\p{L}]/u;

function fautes(texte) {
  const f = [];
  if (COURBES.test(texte)) f.push('guillemet ou apostrophe courbe');
  if (CADRATIN.test(texte)) f.push('tiret cadratin entre deux mots');
  return f;
}

// Les chaînes d'un script, sans ses commentaires ni ses expressions régulières. Le site
// n'a pas de dépendance : ce petit lecteur suffit au JavaScript du dépôt. Le dernier test
// le confronte aux cas qui piègent un lecteur naïf ; il a été vérifié une fois contre un
// vrai analyseur (acorn), chaîne pour chaîne, sur tous les fichiers de js/.
export function chaines(code) {
  const out = [];
  let i = 0, dernier = '';        // dernier signe significatif, pour distinguer / de /regex/
  const pile = [];                // accolades ouvertes dans un gabarit `…${ … }…`
  const avantRegex = /[(,=:[!&|?{};+\-*%<>~^]$|^$|\b(return|typeof|case|in|of|delete|void|throw|new|else|do)$/;
  function lireChaine(q) {
    let s = '', debut = i; i++;
    while (i < code.length && code[i] !== q) {
      if (code[i] === '\\') { s += code[i] + code[i + 1]; i += 2; continue; }
      if (code[i] === '\n') break;
      s += code[i++];
    }
    i++; out.push({ s, pos: debut });
  }
  function lireGabarit() {           // i est sur ` ou juste après la } d'un ${ }
    let s = '', debut = i; i++;
    while (i < code.length) {
      if (code[i] === '\\') { s += code[i] + code[i + 1]; i += 2; continue; }
      if (code[i] === '`') { i++; out.push({ s, pos: debut }); dernier = ')'; return; }
      if (code[i] === '$' && code[i + 1] === '{') { out.push({ s, pos: debut }); i += 2; pile.push(0); dernier = '{'; return; }
      s += code[i++];
    }
  }
  while (i < code.length) {
    const c = code[i], d = code[i + 1];
    if (c === '/' && d === '/') { while (i < code.length && code[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i = code.indexOf('*/', i + 2); i = i < 0 ? code.length : i + 2; continue; }
    if (c === '"' || c === "'") { lireChaine(c); dernier = ')'; continue; }
    if (c === '`') { lireGabarit(); continue; }
    if (c === '/' && avantRegex.test(dernier)) {
      i++; let classe = false;
      while (i < code.length) {
        if (code[i] === '\\') { i += 2; continue; }
        if (code[i] === '[') classe = true; else if (code[i] === ']') classe = false;
        else if (code[i] === '/' && !classe) break;
        else if (code[i] === '\n') break;
        i++;
      }
      i++; while (/[a-z]/.test(code[i] || '')) i++;
      dernier = ')'; continue;
    }
    if (pile.length) {
      if (c === '{') pile[pile.length - 1]++;
      if (c === '}') {
        if (pile[pile.length - 1] === 0) { pile.pop(); lireGabarit(); continue; }
        pile[pile.length - 1]--;
      }
    }
    if (/\s/.test(c)) { i++; continue; }
    if (/[\w$]/.test(c)) {
      let mot = ''; while (i < code.length && /[\w$]/.test(code[i])) mot += code[i++];
      dernier = /^\d/.test(mot) ? ')' : mot; continue;
    }
    dernier = c; i++;
  }
  return out;
}

function ligne(code, pos) { return code.slice(0, pos).split('\n').length; }

function fichiers(dossier, ext, acc = []) {
  for (const nom of readdirSync(join(ROOT, dossier))) {
    const rel = join(dossier, nom);
    if (/^(\.git|node_modules|tests|map)$/.test(rel) || rel === join('tools', 'reviews')) continue;
    if (statSync(join(ROOT, rel)).isDirectory()) fichiers(rel, ext, acc);
    else if (nom.endsWith(ext)) acc.push(rel);
  }
  return acc;
}

function relevesScript(code, fichier, decalage = 0) {
  return chaines(code).flatMap(({ s, pos }) =>
    fautes(s).map(f => `${fichier}:${decalage + ligne(code, pos)} ${f} : ${s.trim().slice(0, 80)}`));
}

test('les chaînes des scripts suivent la règle n°7', () => {
  const releves = fichiers('js', '.js').flatMap(f => relevesScript(readFileSync(join(ROOT, f), 'utf8'), f));
  assert.deepEqual(releves, []);
});

test('le texte des pages et des gabarits suit la règle n°7', () => {
  const releves = [];
  for (const f of fichiers('.', '.html')) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    src.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, corps, pos) => {
      if (/ld\+json/.test(attrs)) {
        if (!corps.includes('{{')) parcourirJson(JSON.parse(corps), f + ' (JSON-LD)', releves);
      } else releves.push(...relevesScript(corps, f, ligne(src, pos) - 1));
      return '';
    });
    const texte = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/g,
      m => m.replace(/[^\n]/g, ' '))
      .replace(/&rsquo;|&#8217;/g, '\u2019').replace(/&lsquo;/g, '\u2018')
      .replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D').replace(/&mdash;|&#8212;/g, '—');
    texte.split('\n').forEach((l, n) => {
      const morceaux = [...l.matchAll(/="([^"]*)"/g)].map(m => m[1])
        .concat([...l.replace(/="[^"]*"/g, '').matchAll(/>([^<]+)</g)].map(m => m[1]))
        .concat(/[<>]/.test(l) ? [] : [l]);
      for (const t of morceaux) for (const faute of fautes(t)) releves.push(`${f}:${n + 1} ${faute} : ${t.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(releves, []);
});

function parcourirJson(v, chemin, releves) {
  if (typeof v === 'string') { for (const f of fautes(v)) releves.push(`${chemin} ${f} : ${v.slice(0, 80)}`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => parcourirJson(x, `${chemin}[${i}]`, releves)); return; }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) {
      if (k.startsWith('_') || k === 'meta' || k.endsWith('Note')) continue;
      parcourirJson(v[k], `${chemin}.${k}`, releves);
    }
  }
}

test('les données affichées suivent la règle n°7', () => {
  const releves = [];
  for (const f of fichiers('data', '.json')) {
    let donnees = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
    if (f.endsWith('changelog.json')) {
      donnees = { ...donnees, releases: donnees.releases.filter(r => !String(r.version).startsWith('0.')) };
    }
    parcourirJson(donnees, f, releves);
  }
  assert.deepEqual(releves, []);
});

test('le lecteur de chaînes ne se trompe pas de contexte', () => {
  // Les cas qui piègent un lecteur naïf : une apostrophe dans un commentaire, une
  // expression régulière qui contient un guillemet, un gabarit imbriqué.
  const code = [
    "// l\u2019apostrophe d\u2019un commentaire ne compte pas",
    "const a = 'droit', b = \"aussi\";",
    "const r = /['\"\u2019]/g, q = x / 2 / y;",
    "const t = `avant ${f({ k: 'dans' })} après ${`imbriqué ${z}`}`;",
    "/* \u201Cbloc\u201D */ const d = 'fin';",
  ].join('\n');
  assert.deepEqual(chaines(code).map(c => c.s),
    ['droit', 'aussi', 'avant ', 'dans', ' après ', 'imbriqué ', '', '', 'fin']);
  assert.deepEqual(fautes('Conseil des Experts — Aide'), ['tiret cadratin entre deux mots']);
  assert.deepEqual(fautes('— Objet —'), []);
  assert.deepEqual(fautes('un « — » signale un objet'), []);
  assert.deepEqual(fautes('<td class="dash">—</td>'), []);
  assert.deepEqual(fautes('aujourd\u2019hui'), ['guillemet ou apostrophe courbe']);
  assert.deepEqual(fautes('Cocher « {name} »'), []);
});
