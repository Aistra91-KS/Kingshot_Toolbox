// Publie sur Discord l'annonce rédigée dans .github/news/announce.md.
// Aucune traduction automatique : les deux langues sont écrites à la main dans le fichier.

const fs = require('fs');

const FILE = process.env.ANNOUNCE_FILE || '.github/news/announce.md';
const webhook = process.env.DISCORD_WEBHOOK;
const dryRun = /^(1|true|yes)$/i.test(process.env.DRY_RUN || '');

if (!webhook && !dryRun) { console.error('DISCORD_WEBHOOK manquant.'); process.exit(1); }

let raw;
try { raw = fs.readFileSync(FILE, 'utf8'); }
catch { console.error(`Fichier introuvable : ${FILE}`); process.exit(1); }

// ---- En-tête <!-- kshub-news ... --> : une paire "clé: valeur" par ligne ----
const meta = {};
const head = raw.match(/<!--\s*kshub-news\b([\s\S]*?)-->/i);
if (head) {
  for (const line of head[1].split(/\r?\n/)) {
    const m = line.match(/^\s*([a-z-]+)\s*:\s*(.*)$/i);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
  }
}

// ---- Corps : sections "## FR" et "## EN". Les commentaires HTML ne sont jamais publiés,
//      donc un gabarit non rempli produit deux sections vides -> aucun envoi.
const body = raw.replace(/<!--[\s\S]*?-->/g, '');
const blocks = {};
let cur = null;
for (const line of body.split(/\r?\n/)) {
  const h = line.match(/^##\s+(FR|EN)\s*$/i);
  if (h) { cur = h[1].toUpperCase(); blocks[cur] = []; continue; }
  if (cur) blocks[cur].push(line);
}
const fr = (blocks.FR || []).join('\n').trim();
const en = (blocks.EN || []).join('\n').trim();

if (!fr && !en) { console.log('Annonce vide (gabarit non rempli) : rien à publier.'); process.exit(0); }
if (!fr || !en) console.warn('⚠️  Une seule langue est renseignée.');

// ---- Mise en forme Discord ----
const SITE = 'https://aistra91-ks.github.io/hub-kingshot/';
const COLOR = parseInt((meta.color || 'F5B840').replace(/^#/, ''), 16) || 0xF5B840; // --accent (DA)
const titleFr = meta['title-fr'] || '📰 Mises à jour du site';
const titleEn = meta['title-en'] || "📰 What's new on the site";
const stamp = new Date().toISOString();

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
const embed = (title, desc) => ({
  title,
  url: SITE,
  color: COLOR,
  description: clip(desc || '—', 4000),
  footer: { text: 'Kingshot Toolbox' },
  timestamp: stamp
});

// Discord plafonne à 6000 caractères l'ensemble des embeds d'un même message :
// au-delà, on scinde en deux messages (FR puis EN) plutôt que de tronquer.
const frEmbed = embed(titleFr, fr);
const enEmbed = embed(titleEn, en);
const messages = (fr.length + en.length) <= 5200
  ? [{ embeds: [frEmbed, enEmbed] }]
  : [{ embeds: [frEmbed] }, { embeds: [enEmbed] }];

if (meta.ping) {
  messages[0].content = meta.ping;
  messages[0].allowed_mentions = { parse: ['everyone', 'roles', 'users'] };
}

(async () => {
  if (dryRun) {
    console.log(`APERÇU — ${messages.length} message(s), FR ${fr.length} car. / EN ${en.length} car.`);
    console.log(JSON.stringify(messages, null, 2));
    return;
  }
  for (let i = 0; i < messages.length; i++) {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(messages[i])
    });
    if (!r.ok) { console.error('Discord', r.status, await r.text()); process.exit(1); }
    if (i < messages.length - 1) await new Promise(res => setTimeout(res, 800)); // anti rate-limit
  }
  console.log(`Annonce publiée (${messages.length} message(s), FR ${fr.length} car. / EN ${en.length} car.).`);
})();