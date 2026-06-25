const commits = (process.env.COMMITS || '').trim();
const webhook = process.env.DISCORD_WEBHOOK;
const srcLang = (process.env.SRC_LANG || 'fr').toLowerCase(); // langue de TES commits (fr ou en)
const dstLang = srcLang === 'en' ? 'fr' : 'en';

if (!commits) { console.log('Aucun commit.'); process.exit(0); }
if (!webhook) { console.error('DISCORD_WEBHOOK manquant'); process.exit(1); }

// Traduction 100% gratuite via MyMemory (aucune clé, ~5000 mots/jour en anonyme).
async function translateLine(text, from, to) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const r = await fetch(url);
    if (!r.ok) return text;
    const d = await r.json();
    return (d.responseData && d.responseData.translatedText) || text;
  } catch { return text; }
}
async function translateBlock(block, from, to) {
  const lines = block.split('\n').slice(0, 15); // garde-fou
  const out = [];
  for (const line of lines) {
    const m = line.match(/^-\s*(.*)$/);
    if (!m || !m[1].trim()) { out.push(line); continue; }
    out.push('- ' + await translateLine(m[1].trim(), from, to));
  }
  return out.join('\n');
}

(async () => {
  const translated = await translateBlock(commits, srcLang, dstLang);
  const fr = srcLang === 'en' ? translated : commits;
  const en = srcLang === 'en' ? commits : translated;
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
