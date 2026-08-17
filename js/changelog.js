// ============================================================
//  PAGE NOUVEAUTÉS — rendu de data/changelog.json
//  Une entrée = une version (numéro + date + titre + changements).
//  Le JSON liste les versions de la PLUS RÉCENTE à la plus ancienne.
//
//  Ancres : chaque version reçoit l'id « v1-9 » (le point devient un -),
//  pour pouvoir pointer une version précise depuis une annonce.
// ============================================================

const CL_I18N = {
  FR: {
    new: 'Nouveau', improved: 'Amélioration', fixed: 'Correctif',
    latest: 'Dernière version',
    count: (n, d) => `${n} versions publiées depuis le ${d}`,
    open: 'Ouvrir la page',
    loadErr: 'Impossible de charger l\'historique des mises à jour (data/changelog.json). Recharge la page ; si le problème persiste, le fichier est peut-être introuvable.'
  },
  EN: {
    new: 'New', improved: 'Improved', fixed: 'Fixed',
    latest: 'Latest version',
    count: (n, d) => `${n} versions released since ${d}`,
    open: 'Open the page',
    loadErr: 'Could not load the update history (data/changelog.json). Reload the page; if it keeps failing, the file may be missing.'
  }
};

function clLang() { return window.GlobalLang ? window.GlobalLang.get() : 'FR'; }
function clT(key) { return (CL_I18N[clLang()] || CL_I18N.EN)[key]; }
function clTxt(obj) { return obj ? (obj[clLang()] || obj.EN || obj.FR || '') : ''; }
function clEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// « 2026-08-17 » → « 17 août 2026 ». Construit en heure LOCALE (y, m-1, d) :
// passer la chaîne à new Date() la lirait en UTC et afficherait la veille
// pour tout visiteur à l'ouest de Greenwich.
function clDate(iso) {
  const p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || p.some(isNaN)) return iso || '';
  const d = new Date(p[0], p[1] - 1, p[2]);
  const locale = clLang() === 'FR' ? 'fr-FR' : 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Libellé du lien : `linkLabel` du JSON s'il est fourni, sinon le nom de
// l'outil quand la cible est au manifeste, sinon un libellé générique.
function clLinkLabel(change) {
  if (change.linkLabel) return clTxt(change.linkLabel);
  const S = window.SITE || {};
  const all = Object.values(S.tools || {}).concat(Object.values(S.pages || {}));
  const hit = all.find(t => t && t.href === change.href);
  return hit ? clTxt(hit.name) : clT('open');
}

let CL_DATA = null;
let CL_FAILED = false;

function clRender() {
  const root = document.getElementById('cl-root');
  if (!root) return;
  // Le message d'échec doit suivre la langue comme le reste de la page.
  if (CL_FAILED) { root.innerHTML = `<li class="cl-error">${clEsc(clT('loadErr'))}</li>`; return; }
  if (!CL_DATA) return;
  const releases = CL_DATA.releases || [];

  const meta = document.getElementById('cl-count');
  if (meta && releases.length) {
    const first = releases[releases.length - 1];
    meta.textContent = clT('count')(releases.length, clDate(first.date));
  }

  root.innerHTML = releases.map((rel, i) => {
    const changes = (rel.changes || []).map(c => {
      const type = ['new', 'improved', 'fixed'].includes(c.type) ? c.type : 'improved';
      const link = c.href
        ? ` <a class="cl-link" href="${clEsc(c.href)}">${clEsc(clLinkLabel(c))} →</a>`
        : '';
      return `<li class="cl-change">
          <span class="cl-tag is-${type}">${clEsc(clT(type))}</span>
          <span class="cl-text">${clEsc(clTxt(c.text))}${link}</span>
        </li>`;
    }).join('');

    return `<li class="cl-item" id="v${clEsc(String(rel.version).replace(/\./g, '-'))}">
        <div class="cl-head">
          <span class="cl-ver">v${clEsc(rel.version)}</span>
          <time class="cl-date" datetime="${clEsc(rel.date)}">${clEsc(clDate(rel.date))}</time>
          ${i === 0 ? `<span class="cl-latest">${clEsc(clT('latest'))}</span>` : ''}
        </div>
        <h2 class="cl-title">${clEsc(clTxt(rel.title))}</h2>
        <ul class="cl-changes">${changes}</ul>
      </li>`;
  }).join('');
}

(function initChangelog() {
  fetch('data/changelog.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(json => { CL_DATA = json; clRender(); })
    .catch(err => {
      console.error('changelog.json :', err);
      CL_FAILED = true;
      clRender();
    });

  window.addEventListener('langChanged', clRender);
})();
