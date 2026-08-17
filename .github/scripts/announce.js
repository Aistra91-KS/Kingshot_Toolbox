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
const SITE = 'https://aistra91-ks.github.io/Kingshot_Toolbox/';

// ---- Verrou : une annonce va de pair avec une entrée dans l'historique ----
// La page « Nouveautés » (changelog.html) et l'annonce Discord couvrent le même
// périmètre : l'en-tête déclare donc la version annoncée, et la publication est
// refusée tant que cette version n'a pas son entrée dans data/changelog.json.
// Échappatoire assumée : « version: none » pour une annonce qui ne change rien
// sur le site (événement en jeu, message à la communauté…).
// En aperçu (dry_run) les mêmes contrôles ne font qu'avertir : on doit pouvoir
// relire son texte avant d'avoir rédigé l'entrée.
const CHANGELOG = process.env.CHANGELOG_FILE || 'data/changelog.json';
const declared = (meta.version || '').trim().replace(/^v/i, '');
let blocked = false;
function requireOrWarn(first, ...rest) {
  console.error(`${dryRun ? '⚠️  APERÇU —' : '❌'} ${first}`);
  for (const line of rest) console.error('   ' + line);
  if (!dryRun) blocked = true;
}

let release = null;
if (!declared) {
  requireOrWarn(
    'Clé « version » absente de l\'en-tête <!-- kshub-news -->.',
    'Indique la version présentée par cette annonce (ex. « version: 1.9 ») ; elle',
    `doit exister dans ${CHANGELOG}. Pour une annonce qui ne change rien sur le`,
    'site (événement en jeu, message à la communauté), écris « version: none ».');
} else if (!/^(none|aucune|skip)$/i.test(declared)) {
  let releases = null;
  try { releases = JSON.parse(fs.readFileSync(CHANGELOG, 'utf8')).releases || []; }
  catch (e) { requireOrWarn(`Historique illisible (${CHANGELOG}) : ${e.message}`); }
  if (releases) {
    release = releases.find(r => String(r.version) === declared) || null;
    if (!release) {
      requireOrWarn(
        `La version ${declared} n'a pas d'entrée dans ${CHANGELOG}.`,
        'Ajoute-la en tête de « releases » et porte SITE.version (js/site-config.js)',
        'au même numéro, puis relance la publication.',
        `Versions connues : ${releases.slice(0, 5).map(r => r.version).join(', ')}…`);
    }
  }
}
if (blocked) process.exit(1);

// Lien vers l'entrée correspondante : le lecteur va du message au détail daté.
const clAnchor = release
  ? `${SITE}changelog.html#v${String(release.version).replace(/\./g, '-')}`
  : '';
const moreFr = clAnchor ? `\n\n📜 Toutes les nouveautés : ${clAnchor}` : '';
const moreEn = clAnchor ? `\n\n📜 Full changelog: ${clAnchor}` : '';
const COLOR = parseInt((meta.color || 'F5B840').replace(/^#/, ''), 16) || 0xF5B840; // --accent (DA)
const titleFr = meta['title-fr'] || '📰 Mises à jour du site';
const titleEn = meta['title-en'] || "📰 What's new on the site";
const stamp = new Date().toISOString();

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
// Pas de `url` sur l'embed : Discord fusionne en un seul bloc tous les embeds d'un
// même message qui partagent la même `url`, et la description du second est perdue.
// Le lien vers le site passe donc par `author`, qui n'a pas cet effet.
// Le lien vers l'historique est ajouté APRÈS la coupe, pour qu'un texte long
// perde de la prose plutôt que son lien.
const embed = (title, desc, more = '') => ({
  title,
  color: COLOR,
  description: clip(desc || '—', 4000 - more.length) + more,
  author: { name: 'Kingshot Toolbox', url: SITE },
  timestamp: stamp
});

// Discord plafonne à 6000 caractères l'ensemble des embeds d'un même message :
// au-delà, on scinde en deux messages (FR puis EN) plutôt que de tronquer.
// Une mention par langue impose aussi la scission : le `content` qui la porte
// appartient au message, pas à l'embed — un message unique ne peut donc pinguer
// qu'un seul rôle pour les deux langues.
const frEmbed = embed(titleFr, fr, moreFr);
const enEmbed = embed(titleEn, en, moreEn);
const pingFr = meta['ping-fr'] || '';
const pingEn = meta['ping-en'] || '';
const perLangPing = !!(pingFr || pingEn);
const messages = (!perLangPing && (fr.length + moreFr.length + en.length + moreEn.length) <= 5200)
  ? [{ embeds: [frEmbed, enEmbed] }]
  : [{ embeds: [frEmbed] }, { embeds: [enEmbed] }];

// Rappel : une mention placée dans un embed s'affiche mais ne notifie jamais.
const MENTIONS = { parse: ['everyone', 'roles', 'users'] };
if (perLangPing) {
  if (pingFr) { messages[0].content = pingFr; messages[0].allowed_mentions = MENTIONS; }
  if (pingEn) { messages[1].content = pingEn; messages[1].allowed_mentions = MENTIONS; }
} else if (meta.ping) {
  messages[0].content = meta.ping;
  messages[0].allowed_mentions = MENTIONS;
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
