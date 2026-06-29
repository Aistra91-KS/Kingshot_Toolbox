// ============================================================
//  HELP SYSTEM — module d'aide générique, réutilisable sur toutes les pages
//  - Bouton discret "Comment ça marche ?" près du titre -> modale élégante
//  - Bandeau d'intro optionnel, mémorisé via localStorage (par page)
//  - Helper de tooltip CSS pur : HelpSystem.tip({FR,EN})
//  Bilingue via GlobalLang. Aucune dépendance externe.
//
//  Utilisation depuis une page :
//    HelpSystem.init({
//      id: 'shop',                       // clé localStorage (bandeau)
//      anchor: '#mon-h1',                // optionnel (défaut: 1er <h1>)
//      title:   {FR:'…', EN:'…'},        // titre modale (optionnel)
//      summary: {FR:'…', EN:'…'},        // résumé global
//      steps:   {FR:['…','…'], EN:[…]},  // mode d'emploi
//      links:   [{label:{FR,EN}, href:'…'}        // lien externe
//                {label:{FR,EN}, action:fn}],     // ou action JS (onglet…)
//      banner: true                      // bandeau d'intro mémorisé (optionnel)
//    });
//    HelpSystem.tip({FR:'…', EN:'…'})   // -> <span> ℹ️ tooltip à insérer dans un label
// ============================================================
(function () {
  const L = () => (window.GlobalLang ? GlobalLang.get() : 'FR');
  const pick = (o) => (o && (o[L()] != null ? o[L()] : (o.FR != null ? o.FR : o.EN))) || '';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // i18n du "chrome" générique (boutons, titres de section)
  const UI = {
    FR: { how: 'Comment ça marche ?', close: 'Fermer', guide: "Mode d'emploi", links: 'Voir aussi', dismiss: 'Ne plus afficher' },
    EN: { how: 'How does it work?', close: 'Close', guide: 'How to use', links: 'See also', dismiss: "Don't show again" }
  };
  const t = (k) => (UI[L()] || UI.FR)[k];

  let CFG = null;

  function anchorEl() {
    return (CFG && CFG.anchor && document.querySelector(CFG.anchor))
        || document.querySelector('.main-content h1, .shop-wrap h1, .hub-header h1, h1');
  }

  // ---------- Tooltip inline (CSS pur, hover + focus clavier) ----------
  function tip(textObj) {
    return `<span class="help-i" tabindex="0" role="note" aria-label="${esc(pick(textObj))}" data-tip="${esc(pick(textObj))}">i</span>`;
  }

  // ---------- Modale ----------
  function closeModal() {
    const ov = document.getElementById('help-overlay');
    if (ov) { ov.classList.remove('open'); setTimeout(() => ov.remove(), 150); }
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) { if (e.key === 'Escape') closeModal(); }

  function openModal() {
    if (!CFG) return;
    let ov = document.getElementById('help-overlay');
    if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'help-overlay';
    ov.className = 'help-overlay';
    ov.innerHTML = `<div class="help-modal" role="dialog" aria-modal="true" aria-label="${esc(pick(CFG.title) || t('how'))}">
        <button class="help-x" type="button" aria-label="${esc(t('close'))}">&times;</button>
        <h2 class="help-modal-title">${esc(pick(CFG.title) || t('how'))}</h2>
        <div class="help-modal-body"></div>
      </div>`;
    document.body.appendChild(ov);

    const steps = (CFG.steps && (CFG.steps[L()] || CFG.steps.FR)) || [];
    const links = CFG.links || [];
    let html = '';
    if (CFG.summary) html += `<p class="help-summary">${esc(pick(CFG.summary))}</p>`;
    if (steps.length) {
      html += `<h3 class="help-h3">${esc(t('guide'))}</h3><ol class="help-steps">` +
        steps.map(s => `<li>${esc(s)}</li>`).join('') + `</ol>`;
    }
    if (links.length) {
      html += `<h3 class="help-h3">${esc(t('links'))}</h3><ul class="help-links">` +
        links.map((l, i) => `<li><a href="${esc(l.href || '#')}"${l.action ? ` data-act="${i}"` : ''}>${esc(pick(l.label))}</a></li>`).join('') + `</ul>`;
    }
    ov.querySelector('.help-modal-body').innerHTML = html;

    // Actions JS (ex: basculer vers un onglet) + fermeture/Échap/clic-hors
    ov.querySelectorAll('a[data-act]').forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); closeModal(); const fn = links[+a.dataset.act].action; if (typeof fn === 'function') fn(); });
    });
    ov.querySelector('.help-x').addEventListener('click', closeModal);
    ov.addEventListener('click', (e) => { if (e.target === ov) closeModal(); });
    document.addEventListener('keydown', onEsc);
    requestAnimationFrame(() => ov.classList.add('open'));
  }

  // ---------- Bouton près du titre ----------
  function mountButton() {
    document.querySelectorAll('button.help-btn[data-help]').forEach(b => b.remove());
    const a = anchorEl();
    if (!a) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'help-btn';
    btn.setAttribute('data-help', '1');
    btn.innerHTML = `<span class="help-q">?</span><span class="help-btn-txt">${esc(t('how'))}</span>`;
    btn.addEventListener('click', openModal);
    a.insertAdjacentElement('afterend', btn);
  }

  // ---------- Bandeau d'intro (optionnel, mémorisé) ----------
  function mountBanner() {
    document.querySelectorAll('.help-banner[data-help]').forEach(b => b.remove());
    if (!CFG.banner) return;
    const key = 'help_seen_' + (CFG.id || 'page');
    if (localStorage.getItem(key) === '1') return;
    const a = anchorEl();
    if (!a) return;
    const bn = document.createElement('div');
    bn.className = 'help-banner';
    bn.setAttribute('data-help', '1');
    bn.innerHTML = `<span class="help-banner-txt">${esc(pick(CFG.summary) || '')}</span>
      <button class="help-banner-more" type="button">${esc(t('how'))}</button>
      <button class="help-banner-x" type="button" aria-label="${esc(t('dismiss'))}">&times;</button>`;
    bn.querySelector('.help-banner-more').addEventListener('click', openModal);
    bn.querySelector('.help-banner-x').addEventListener('click', () => { localStorage.setItem(key, '1'); bn.remove(); });
    (document.querySelector('button.help-btn[data-help]') || a).insertAdjacentElement('afterend', bn);
  }

  function render() { if (CFG) { mountButton(); mountBanner(); } }

  window.HelpSystem = {
    init(cfg) { CFG = cfg || {}; render(); },
    open: openModal,
    tip: tip
  };

  // Re-rendu au changement de langue (bouton/bandeau + modale ouverte)
  window.addEventListener('langChanged', () => {
    render();
    const ov = document.getElementById('help-overlay');
    if (ov && ov.classList.contains('open')) openModal();
  });
})();
