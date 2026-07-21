const commits = process.env.COMMITS || '';
const webhook = process.env.DISCORD_WEBHOOK;
const srcLang = (process.env.SRC_LANG || 'fr').toLowerCase(); // langue de TES commits (fr ou en)
const dstLang = srcLang === 'en' ? 'fr' : 'en';

if (!webhook) { console.error('DISCORD_WEBHOOK manquant'); process.exit(1); }

// ---- Mapping fichier -> page (libellés bilingues) ----
const PAGE_LABELS = {
  truegold: { fr: 'TrueGold',            en: 'TrueGold' },
  waracademy: { fr: 'Académie de Guerre', en: 'War Academy' },
  buildings:  { fr: 'Bâtiments',          en: 'Buildings' },
  shop:     { fr: 'Boutique',            en: 'Shop' },
  beartrap: { fr: 'Piège à ours',        en: 'Bear Trap' },
  caserne:  { fr: 'Caserne',             en: 'Barracks' },
  research: { fr: 'Recherche',           en: 'Research' },
  masters:  { fr: 'Conseil des Experts', en: 'Experts Council' },
  vikings:  { fr: 'Vikings',             en: 'Vikings' },
  pets:     { fr: 'Familiers',           en: 'Pets' },
  home:     { fr: 'Accueil',             en: 'Home' },
  multi:    { fr: 'Plusieurs pages',     en: 'Multiple pages' },
  general:  { fr: 'Général',             en: 'General' }
};
const PAGE_ORDER = ['truegold', 'waracademy', 'shop', 'beartrap', 'caserne', 'research', 'masters', 'vikings', 'pets', 'buildings', 'home', 'multi', 'general'];

function fileToPage(path) {
  const p = String(path).toLowerCase();
  if (p.includes('waracademy') || p.includes('wa_optimizer') || p.includes('war_db')) return 'waracademy';
  if (p.includes('database/buildings') || p.includes('img/buildings')) return 'buildings';
  if (p.includes('truegold')) return 'truegold';
  if (p.includes('shop_calc') || p.includes('shopcalc')) return 'shop';
  if (p.includes('beartrap')) return 'beartrap';
  if (p.includes('caserne')) return 'caserne';
  if (p.includes('research')) return 'research';
  if (p.includes('masters') || p.includes('heroes_db')) return 'masters';
  if (p.includes('vikings')) return 'vikings';
  if (p.includes('pets')) return 'pets';
  if (p.includes('index.html') || p.includes('js/hub.js')) return 'home';
  return 'general';
}

// Parse : chaque commit = "@@@C@@@sujet@@@F@@@corps@@@N@@@\nfichier1\nfichier2...".
// Dédoublonnage sur (sujet + corps) identiques.
const seen = new Set();
let entries = [];
for (const rec of commits.split('@@@C@@@')) {
  const r = rec.trim();
  if (!r) continue;
  const fIdx = r.indexOf('@@@F@@@');
  const subject = (fIdx === -1 ? r : r.slice(0, fIdx)).trim();
  if (!subject) continue;
  const rest = fIdx === -1 ? '' : r.slice(fIdx + 7);
  const nIdx = rest.indexOf('@@@N@@@');
  const body = (nIdx === -1 ? rest : rest.slice(0, nIdx)).replace(/\s+/g, ' ').trim();

  // Marqueur manuel : "[skip news]" dans le titre ou le corps -> commit ignoré.
  if (/\[\s*(skip|no)[\s-]?news\s*\]/i.test(subject + ' ' + body)) continue;
  const filesBlock = nIdx === -1 ? '' : rest.slice(nIdx + 7);
  // Lignes "--name-status" : "M<TAB>chemin" ou "R100<TAB>ancien<TAB>nouveau".
  // Ignorés : les renommages purs (R, contenu inchangé) et MAP.md (doc interne).
  const rawFiles = filesBlock.split('\n').map(f => f.trim()).filter(Boolean);
  const files = rawFiles
    .map(l => l.split('\t').map(c => c.trim()))
    .filter(c => c.length > 1 && !/^R\d*$/.test(c[0]))
    .map(c => c[c.length - 1])
    .filter(Boolean)
    .filter(p => !/(^|\/)map\.md$/i.test(p));
  // Commit composé uniquement de renommages -> aucune news.
  if (rawFiles.length && !files.length) continue;

  const key = subject + '||' + body;
  if (seen.has(key)) continue;
  seen.add(key);

  // Pages spécifiques touchées. Aucune -> "general" ; plus de 2 -> commit massif -> "multi".
  const specific = [...new Set(files.map(fileToPage).filter(k => k !== 'general'))];
  let pages;
  if (specific.length === 0) pages = ['general'];
  else if (specific.length > 2) pages = ['multi'];
  else pages = specific;

  entries.push({ subject, body, pages });
}

if (!entries.length) { console.log('Aucun commit.'); process.exit(0); }

// git log liste du plus récent au plus ancien : on garde les 15 derniers commits,
// puis on inverse pour afficher du plus ancien au plus récent.
entries = entries.slice(0, 15).reverse();

// Traduction 100% gratuite via MyMemory (aucune clé). Repli : texte original.
async function translate(text, from, to) {
  if (!text) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const r = await fetch(url);
    if (!r.ok) return text;
    const d = await r.json();
    return (d.responseData && d.responseData.translatedText) || text;
  } catch { return text; }
}

// Règles de traduction dédiées (corrige les tournures littérales de MyMemory).
async function translateSmart(text, from, to) {
  if (from === 'en' && to === 'fr') {
    const m = text.match(/^update\s+(.+)$/i);   // "Update X" -> "Mise à jour de X"
    if (m) return 'Mise à jour de ' + (await translate(m[1], from, to));
  }
  return translate(text, from, to);
}

// Pré-traduit chaque entrée UNE fois (les entrées peuvent apparaître sous plusieurs pages).
async function preTranslate() {
  for (const e of entries.slice(0, 15)) {
    if (srcLang === 'fr') {
      e.fr = { subject: e.subject, body: e.body };
      e.en = { subject: await translateSmart(e.subject, 'fr', 'en'), body: e.body ? await translateSmart(e.body, 'fr', 'en') : '' };
    } else {
      e.en = { subject: e.subject, body: e.body };
      e.fr = { subject: await translateSmart(e.subject, 'en', 'fr'), body: e.body ? await translateSmart(e.body, 'en', 'fr') : '' };
    }
  }
}

// Construit une section par page : { key, fr, en } (les deux langues alignées).
function buildSections() {
  const groups = new Map(); // pageKey -> [entries]
  for (const e of entries.slice(0, 15)) {
    for (const k of e.pages) {
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    }
  }
  const orderedKeys = [...groups.keys()].sort((a, b) => PAGE_ORDER.indexOf(a) - PAGE_ORDER.indexOf(b));
  const render = (k, lang) => {
    const header = `📄 __${PAGE_LABELS[k][lang]}__`;
    const lines = groups.get(k).map(e => {
      const t = e[lang];
      let line = `**${t.subject}**`;
      if (t.body) line += `\n*(${t.body})*`;
      return line;
    });
    return header + '\n' + lines.join('\n\n');
  };
  return orderedKeys.map(k => ({ key: k, fr: render(k, 'fr'), en: render(k, 'en') }));
}

// Regroupe les pages en paquets : on ajoute des pages tant que le bloc FR ET le bloc EN
// tiennent sous `limit`. Dès qu'une page ne rentre plus, on ouvre un nouveau paquet.
// => on ne coupe jamais au milieu d'une page.
function packChunks(sections, limit = 1000) {
  const chunks = [];
  let cur = [];
  const len = (arr, lang) => arr.map(s => s[lang]).join('\n\n').length;
  for (const sec of sections) {
    const test = [...cur, sec];
    if (cur.length && (len(test, 'fr') > limit || len(test, 'en') > limit)) {
      chunks.push(cur);
      cur = [sec];
    } else {
      cur = test;
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

(async () => {
  await preTranslate();
  const sections = buildSections();
  if (!sections.length) { console.log('Rien à publier.'); return; }

  const chunks = packChunks(sections, 1000);
  const clip = s => (s || '—').slice(0, 1024); // limite réelle d'un champ Discord

  for (let i = 0; i < chunks.length; i++) {
    const fr = chunks[i].map(s => s.fr).join('\n\n');
    const en = chunks[i].map(s => s.en).join('\n\n');
    const part = chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : '';
    const payload = {
      embeds: [{
        title: `📰 Mise à jour du site — Site update${part}`,
        color: 0xE0A100,
        fields: [
          { name: '🇫🇷 Nouveautés', value: clip(fr) },
          { name: "🇬🇧 What's new", value: clip(en) }
        ],
        footer: { text: 'Kingshot Toolbox' },
        timestamp: new Date().toISOString()
      }]
    };
    const r = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) { console.error('Discord', r.status, await r.text()); process.exit(1); }
    if (i < chunks.length - 1) await new Promise(res => setTimeout(res, 800)); // anti rate-limit
  }
  console.log(`News envoyée (${chunks.length} message(s)).`);
})();
