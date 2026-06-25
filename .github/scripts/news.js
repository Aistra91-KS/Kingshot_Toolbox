const commits = process.env.COMMITS || '';
const webhook = process.env.DISCORD_WEBHOOK;
const srcLang = (process.env.SRC_LANG || 'fr').toLowerCase(); // langue de TES commits (fr ou en)
const dstLang = srcLang === 'en' ? 'fr' : 'en';

if (!webhook) { console.error('DISCORD_WEBHOOK manquant'); process.exit(1); }

// Parse : chaque commit = "sujet@@@F@@@corps@@@E@@@" (délimiteurs posés par git log).
// Dédoublonnage sur (sujet + corps) identiques.
const seen = new Set();
const entries = [];
for (const rec of commits.split('@@@E@@@')) {
  const r = rec.trim();
  if (!r) continue;
  const idx = r.indexOf('@@@F@@@');
  const subject = (idx === -1 ? r : r.slice(0, idx)).trim();
  const body = (idx === -1 ? '' : r.slice(idx + 7)).replace(/\s+/g, ' ').trim(); // corps sur 1 ligne
  if (!subject) continue;
  const key = subject + '||' + body;
  if (seen.has(key)) continue;
  seen.add(key);
  entries.push({ subject, body });
}

if (!entries.length) { console.log('Aucun commit.'); process.exit(0); }

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

// Construit un bloc. translateIt = true => version traduite (sujet ET corps).
async function buildBlock(translateIt) {
  const blocks = [];
  for (const e of entries.slice(0, 15)) { // garde-fou
    const subj = translateIt ? await translateSmart(e.subject, srcLang, dstLang) : e.subject;
    let entry = `**${subj}**`;            // sujet en gras
    if (e.body) {
      const body = translateIt ? await translateSmart(e.body, srcLang, dstLang) : e.body;
      entry += `\n*(${body})*`;           // corps en italique, sur sa propre ligne
    }
    blocks.push(entry);
  }
  return blocks.join('\n\n');             // ligne vide entre chaque entrée
}

(async () => {
  const original = await buildBlock(false);
  const translated = await buildBlock(true);
  const fr = srcLang === 'en' ? translated : original;
  const en = srcLang === 'en' ? original : translated;

  const clip = s => (s || '—').slice(0, 1000);
  const payload = {
    embeds: [{
      title: '📰 Mise à jour du site — Site update',
      color: 0xE0A100,
      fields: [
        { name: '🇫🇷 Nouveautés', value: clip(fr) },
        { name: "🇬🇧 What's new", value: clip(en) }
      ],
      footer: { text: 'KVK Game Optimizer' },
      timestamp: new Date().toISOString()
    }]
  };
  const r = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!r.ok) { console.error('Discord', r.status, await r.text()); process.exit(1); }
  console.log('News envoyée.');
})();
