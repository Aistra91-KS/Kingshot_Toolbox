// ============================================================
//  CONSENTEMENT AUX COOKIES DE MESURE (Google Analytics)
//
//  Mode « basique » de Consent Mode, décision d'Aistra : tant que le
//  visiteur n'a pas accepté, gtag.js n'est même pas chargé et rien ne
//  part vers Google. L'extrait en ligne de chaque page ne fait que
//  définir `gtag` et poser le refus par défaut ; ce fichier lit le
//  choix, charge gtag.js s'il est accordé, et sinon affiche le bandeau.
//
//  Règles CNIL suivies : « Refuser » au même niveau et du même style
//  qu'« Accepter », choix gardé 6 mois puis redemandé, cookies de
//  mesure limités à 13 mois sans prolongation à chaque visite, retrait
//  aussi simple que l'accord (lien « Cookies » du pied de page, bouton
//  de la page À propos : tout élément `data-consent-open`).
//
//  Autonome à dessein : ses styles sont injectés ici (la 404 et un
//  `style.css` en cache doivent quand même afficher un bandeau propre),
//  et il n'expose aucun nom global (cache décalé, MAP §9 `09a`).
//  Chargé en `defer` avant `</head>` : il passe après les scripts du
//  body, et tous les événements GA partent d'un geste du joueur.
// ============================================================

(function () {
  'use strict';

  var GA_ID = 'G-M1QG4XSD3K';
  var KEY = 'ks_consent';                 // clé « chrome » : jamais exportée ni rangée par profil (MAP §8)
  var MAX_AGE = 182 * 24 * 3600 * 1000;   // 6 mois : au-delà, le choix se redemande
  var COOKIE_EXPIRES = 395 * 24 * 3600;   // 13 mois, en secondes

  var ALL = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];

  var TXT = {
    EN: {
      title: 'Cookies',
      text: 'With your consent, Google Analytics sets cookies to count visits and see which pages and tools get used, along with general audience data from Google (age range, interests). What you type into the tools is never sent. Your choice is kept for 6 months.',
      more: 'Details',
      refuse: 'Refuse',
      accept: 'Accept',
      nowOn: 'Current choice: accepted.',
      nowOff: 'Current choice: refused.',
      link: 'Cookies'
    },
    FR: {
      title: 'Cookies',
      text: "Avec ton accord, Google Analytics dépose des cookies pour compter les visites et voir quelles pages et quels outils servent, avec des données d'audience générales fournies par Google (tranche d'âge, centres d'intérêt). Ce que tu saisis dans les outils n'est jamais envoyé. Ton choix est gardé 6 mois.",
      more: 'En savoir plus',
      refuse: 'Refuser',
      accept: 'Accepter',
      nowOn: 'Choix actuel : accepté.',
      nowOff: 'Choix actuel : refusé.',
      link: 'Cookies'
    }
  };

  // `gtag` vient de l'extrait en ligne. Le repli ne sert qu'à ne jamais lever.
  window.dataLayer = window.dataLayer || [];
  var gtag = typeof window.gtag === 'function' ? window.gtag : function () { window.dataLayer.push(arguments); };

  // La 404 est servie à n'importe quelle profondeur et n'a pas de <base> : elle
  // charge ce fichier par un chemin absolu, et le lien « En savoir plus » suit.
  var me = document.currentScript;
  var ROOT = me && (me.getAttribute('src') || '').charAt(0) === '/' ? '/' : '';

  function lang() {
    try { if (window.GlobalLang) return window.GlobalLang.get() === 'FR' ? 'FR' : 'EN'; } catch (e) { /* repli ci-dessous */ }
    return /^fr/i.test(document.documentElement.lang || '') ? 'FR' : 'EN';
  }
  function t(k) { return TXT[lang()][k]; }

  // ---------- Choix enregistré ----------
  // Rend true (accepté), false (refusé), null (pas de choix valable) ou
  // undefined (stockage interdit). Un stockage interdit veut dire, en pratique,
  // cookies bloqués : GA ne pourrait rien déposer, le bandeau serait redemandé à
  // chaque page sans pouvoir retenir la réponse. On ne mesure pas et on se tait.
  function readChoice() {
    var raw;
    try { raw = localStorage.getItem(KEY); } catch (e) { return undefined; }
    if (!raw) return null;
    try {
      var c = JSON.parse(raw);
      if (c && typeof c.ok === 'boolean' && typeof c.t === 'number' && Date.now() - c.t < MAX_AGE) return c.ok;
    } catch (e) { /* valeur abîmée : on redemande, comme sans choix */ }
    return null;
  }
  function saveChoice(ok) {
    try { localStorage.setItem(KEY, JSON.stringify({ ok: ok, t: Date.now() })); } catch (e) { /* choix appliqué à cette page seulement */ }
  }

  // ---------- Google Analytics ----------
  var loaded = false;
  function consent(state) {
    var o = {};
    ALL.forEach(function (k) { o[k] = state; });
    gtag('consent', 'update', o);
  }
  function startGa() {
    if (!navigator.webdriver) window['ga-disable-' + GA_ID] = false;
    consent('granted');
    if (loaded) return;
    loaded = true;
    gtag('config', GA_ID, { cookie_expires: COOKIE_EXPIRES, cookie_update: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  // Retrait après un accord : couper la mesure sur la page et effacer les
  // cookies _ga déjà posés, sur l'hôte comme sur le domaine parent où GA les range.
  function stopGa() {
    window['ga-disable-' + GA_ID] = true;
    consent('denied');
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push('; domain=.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  // ---------- Bandeau ----------
  var CSS =
    '#ks-consent{position:fixed;z-index:9100;left:20px;bottom:20px;box-sizing:border-box;max-width:440px;' +
    'width:calc(100% - 40px);padding:16px 18px;border-radius:12px;border:1px solid var(--border,#2a2a2a);' +
    'border-top:3px solid var(--accent,#f5b840);background:var(--bg-panel,#161616);color:var(--text-light,#f0e8d5);' +
    'box-shadow:0 8px 28px var(--shadow,rgba(0,0,0,.6));font:14px/1.5 "Segoe UI",Tahoma,Geneva,Verdana,sans-serif;' +
    'animation:ksc-in .2s ease-out}' +
    '#ks-consent .ksc-title{margin:0 0 4px;font-weight:700;font-size:15px;color:var(--accent-text,var(--accent,#f5b840))}' +
    '#ks-consent .ksc-text{margin:0;color:var(--text-light,#f0e8d5)}' +
    '#ks-consent .ksc-text a{color:var(--accent-text,var(--accent,#f5b840));text-decoration:underline}' +
    '#ks-consent .ksc-now{margin:6px 0 0;color:var(--text-muted,#938c81);font-size:13px}' +
    '#ks-consent .ksc-actions{display:flex;gap:10px;margin-top:12px}' +
    '#ks-consent .ksc-btn{flex:1;min-height:44px;padding:8px 14px;border-radius:6px;cursor:pointer;font:inherit;font-weight:600;' +
    'border:1px solid var(--accent,#f5b840);background:var(--control-bg,#1f1f1f);color:var(--text-light,#f0e8d5);transition:background .15s}' +
    '#ks-consent .ksc-btn:hover{background:var(--input-bg,#252525)}' +
    '#ks-consent a:focus-visible,#ks-consent .ksc-btn:focus-visible,.sf-cookies:focus-visible{outline:2px solid var(--accent-text,var(--accent,#f5b840));outline-offset:2px}' +
    '@keyframes ksc-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#ks-consent{animation:none}}' +
    '@media (max-width:600px){#ks-consent{left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));width:calc(100% - 24px);max-width:none}}' +
    // Lien « Cookies » du pied de page (footer.js) : un bouton qui a l'air d'un lien.
    '.sf-cookies{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}';

  var box = null, opener = null;

  function injectCss() {
    if (document.getElementById('ks-consent-css')) return;
    var st = document.createElement('style');
    st.id = 'ks-consent-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fill() {
    var c = readChoice();
    var now = c === true ? t('nowOn') : c === false ? t('nowOff') : '';
    box.innerHTML =
      '<p class="ksc-title" id="ksc-title">' + esc(t('title')) + '</p>' +
      '<p class="ksc-text">' + esc(t('text')) + ' <a href="' + ROOT + 'about#privacy">' + esc(t('more')) + '</a></p>' +
      (now ? '<p class="ksc-now">' + esc(now) + '</p>' : '') +
      '<div class="ksc-actions">' +
        '<button type="button" class="ksc-btn" data-ksc="0">' + esc(t('refuse')) + '</button>' +
        '<button type="button" class="ksc-btn" data-ksc="1">' + esc(t('accept')) + '</button>' +
      '</div>';
  }

  function show(focus) {
    injectCss();
    if (!box) {
      box = document.createElement('section');
      box.id = 'ks-consent';
      box.setAttribute('role', 'region');
      box.setAttribute('aria-labelledby', 'ksc-title');
      // En tête du body : au clavier, le bandeau vient avant la page, pas après
      // le pied de page. Il est `fixed`, il ne dérange pas la rangée de footer.js.
      document.body.insertBefore(box, document.body.firstChild);
    }
    fill();
    if (focus) box.querySelector('.ksc-btn').focus();
  }

  function hide() {
    if (box) { box.remove(); box = null; }
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  function choose(ok) {
    var before = readChoice();
    saveChoice(ok);
    if (ok) startGa();
    else if (before === true || loaded) stopGa();
    hide();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ksc]');
    if (b && box && box.contains(b)) { choose(b.getAttribute('data-ksc') === '1'); return; }
    var o = e.target.closest && e.target.closest('[data-consent-open]');
    if (o) { e.preventDefault(); opener = o; show(true); }
  });
  document.addEventListener('keydown', function (e) {
    // Échap ferme un bandeau rouvert à la demande, jamais le premier : sans
    // réponse, il reviendrait à la page suivante.
    if (e.key === 'Escape' && box && opener && readChoice() !== null) hide();
  });
  window.addEventListener('langChanged', function () { if (box) fill(); });

  // ---------- Démarrage ----------
  injectCss();   // aussi pour le lien du pied de page, bandeau fermé ou non
  var choice = readChoice();
  if (choice === true) startGa();
  else if (choice === null) show(false);
})();
