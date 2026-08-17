// ============================================================
//  PIED DE PAGE GLOBAL — injecté sur toutes les pages
//  Trois destinations : Discord · À propos · Nouveautés
//  + mention de version et rappel « fansite non officiel ».
//
//  Dépendances : site-config.js (SITE.version / SITE.discord /
//  SITE.pages) et lang.js (bascule FR⇄EN à chaud).
//
//  Le lien Discord n'apparaît QUE si SITE.discord est renseigné :
//  tant que le serveur n'existe pas, rien d'inachevé n'est affiché.
// ============================================================

const FOOTER_ICONS = {
  // Lucide (licence ISC) — même facture que les icônes du header.
  "info":    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  "history": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'
};

// Logo Discord (marque déposée) : tracé plein, il ne suit pas la
// grille « stroke » de Lucide et a donc son propre gabarit.
const FOOTER_DISCORD_ICON =
  '<svg class="ftr-ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.011c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.128c-.598.349-1.22.65-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029ZM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z"/></svg>';

function ftrSvg(name, size = 18) {
  return `<svg class="ftr-ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FOOTER_ICONS[name] || ''}</svg>`;
}

const FTR_I18N = {
  FR: {
    nav: 'Liens du site',
    discord: 'Discord',
    discordSub: 'Rejoindre la communauté',
    aboutSub: 'Qui est derrière l\'outil',
    changelogSub: 'Ce qui a changé récemment',
    version: 'version',
    madeBy: 'Créé par Aistra91 · serveur 286',
    disclaimer: 'Site de fan non officiel, sans lien avec Century Games. Tous les noms et images du jeu appartiennent à leurs propriétaires respectifs.'
  },
  EN: {
    nav: 'Site links',
    discord: 'Discord',
    discordSub: 'Join the community',
    aboutSub: 'Who is behind the toolbox',
    changelogSub: 'What changed recently',
    version: 'version',
    madeBy: 'Made by Aistra91 · server 286',
    disclaimer: 'Unofficial fan site, not affiliated with Century Games. All game names and images belong to their respective owners.'
  }
};

function ftrLang() { return window.GlobalLang ? window.GlobalLang.get() : 'FR'; }
function ftrT(key) { return (FTR_I18N[ftrLang()] || FTR_I18N.EN)[key] || key; }
function ftrName(obj) { return obj ? (obj[ftrLang()] || obj.EN || obj.FR || '') : ''; }
function ftrEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Page courante : même résolution que le header (HDR_ACTIVE_HREF prime,
// sinon le nom de fichier), pour marquer le lien de la page ouverte.
function ftrCurrentPage() {
  return window.HDR_ACTIVE_HREF || (window.location.pathname.split('/').pop() || 'index.html');
}

function ftrLinkHtml(href, icon, label, sub, external) {
  const here = (href === ftrCurrentPage());
  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const cur = here ? ' aria-current="page"' : '';
  return `
    <a class="sf-link${here ? ' is-here' : ''}" href="${ftrEsc(href)}"${attrs}${cur}>
      ${icon}
      <span class="sf-link-text">
        <span class="sf-link-label">${ftrEsc(label)}${external ? '<span class="sf-ext" aria-hidden="true">↗</span>' : ''}</span>
        <span class="sf-link-sub">${ftrEsc(sub)}</span>
      </span>
    </a>`;
}

function ftrRender() {
  const box = document.getElementById('site-footer');
  if (!box || !window.SITE) return;
  const S = window.SITE;
  const P = S.pages || {};
  const year = new Date().getFullYear();

  let links = '';
  if (S.discord) {
    links += ftrLinkHtml(S.discord, FOOTER_DISCORD_ICON, ftrT('discord'), ftrT('discordSub'), true);
  }
  if (P.about) {
    links += ftrLinkHtml(P.about.href, ftrSvg('info'), ftrName(P.about.name), ftrT('aboutSub'), false);
  }
  if (P.changelog) {
    links += ftrLinkHtml(P.changelog.href, ftrSvg('history'), ftrName(P.changelog.name), ftrT('changelogSub'), false);
  }

  const ver = S.version
    ? `<a class="sf-version" href="${ftrEsc((P.changelog && P.changelog.href) || S.home)}" title="${ftrEsc(ftrT('version'))} ${ftrEsc(S.version)}">v${ftrEsc(S.version)}</a>`
    : '';

  box.innerHTML = `
    <div class="sf-inner">
      <nav class="sf-links" aria-label="${ftrEsc(ftrT('nav'))}">${links}</nav>
      <div class="sf-legal">
        <span class="sf-legal-line">© ${year} ${ftrEsc(S.name)} ${ver} · ${ftrEsc(ftrT('madeBy'))}</span>
        <span class="sf-legal-note">${ftrEsc(ftrT('disclaimer'))}</span>
      </div>
    </div>`;
}

// ---------- Construction + injection ----------
(function buildFooter() {
  // pets.html : promenade plein écran au défilement piloté — un pied de
  // page y serait hors d'atteinte et étranger à sa palette « nature ».
  if (document.body.classList.contains('pets-page')) return;
  if (document.getElementById('site-footer')) return;

  const mount = () => {
    if (document.getElementById('site-footer')) return;
    const el = document.createElement('footer');
    el.id = 'site-footer';
    el.className = 'site-footer';
    // Placé après le bouton flottant « Sauvegarde Globale » (backup.js
    // s'enregistre avant nous) : sur mobile il redevient statique et doit
    // rester au-dessus du pied de page.
    document.body.appendChild(el);
    ftrRender();
    // Le bouton reste fixé en bas à droite sur desktop : on lui réserve
    // sa place plutôt que de le laisser recouvrir le pied de page.
    if (document.querySelector('.backup-fab')) el.classList.add('sf-has-fab');
    // Pages à sidebar : celle-ci est `position:sticky` et descend jusqu'en
    // bas de page. Le pied de page se range donc sous la seule colonne de
    // contenu — sinon il recouvrirait la sidebar et rendrait ses commandes
    // du bas (dont « Sauvegarde Globale ») impossibles à cliquer.
    if (document.querySelector('body > .sidebar')) el.classList.add('sf-with-sidebar');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  window.addEventListener('langChanged', ftrRender);
})();
