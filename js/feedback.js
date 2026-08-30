// ============================================================
//  RETOURS JOUEURS (js/feedback.js)
//
//  Chargé À LA DEMANDE par header.js, au premier clic sur le bouton « Un retour ? ».
//  Il n'est donc référencé dans AUCUNE page : ne pas ajouter de <script> pour lui.
//
//  Le message part vers un point d'entrée Apps Script (SITE.feedback), adossé à
//  une feuille Google privée. Deux détails de transport, sans lesquels rien ne
//  marche depuis un site statique :
//   · on envoie en `text/plain` — un `application/json` déclencherait un préflight
//     OPTIONS qu'Apps Script ne sait pas traiter, et la requête échouerait ;
//   · Apps Script répond TOUJOURS en HTTP 200 : c'est le champ `ok` du corps qui
//     dit si l'envoi a réussi, jamais le code HTTP.
//
//  L'anti-spam vit ici ET dans le script : ici il évite les envois accidentels et
//  les robots naïfs, là-bas il plafonne ce qui peut réellement entrer. Le premier
//  est contournable, le second non — ne jamais compter sur celui-ci seul.
// ============================================================

(function () {
  'use strict';

  // ---------- i18n ----------
  const I18N = {
    FR: {
      title: 'Un retour ?',
      intro: 'Une valeur fausse, un outil qui bloque, une idée : dis-le ici. Je lis tout.',
      kinds: { bug: 'Un bug', value: 'Valeur erronée', idea: 'Une idée', other: 'Autre' },
      label: 'Ton message',
      ph: 'Décris ce que tu as vu, et sur quelle page si tu t’en souviens…',
      who: 'Ton pseudo en jeu ou ton serveur',
      whoOpt: 'facultatif',
      whoPh: 'Ex. Aistra91 · 286',
      sends: 'Sont joints automatiquement : la page où tu es, ta langue et la version du site. Rien d’autre — n’écris pas d’information personnelle dans ton message.',
      send: 'Envoyer',
      sending: 'Envoi…',
      cancel: 'Annuler',
      close: 'Fermer',
      okTitle: 'Message envoyé',
      okBody: 'Merci, c’est bien arrivé. Je ne peux pas te répondre directement d’ici, mais tout est lu.',
      errTitle: 'L’envoi a échoué',
      errNet: 'La connexion n’a pas abouti. Ton message est toujours là : réessaie dans un instant.',
      errMany: 'Trop d’envois d’un coup. Réessaie dans une heure.',
      errWait: 'Tu viens d’envoyer un message. Attends une minute avant le suivant.',
      errDay: 'Tu as déjà envoyé plusieurs messages aujourd’hui. Reviens demain.',
      errRefused: 'Le message a été refusé par le serveur. Réessaie plus tard.',
      retry: 'Réessayer',
      chars: '{n} / {max}'
    },
    EN: {
      title: 'Feedback',
      intro: 'A wrong value, a tool that breaks, an idea: tell me here. I read everything.',
      kinds: { bug: 'A bug', value: 'Wrong value', idea: 'An idea', other: 'Other' },
      label: 'Your message',
      ph: 'Describe what you saw, and which page if you remember…',
      who: 'Your in-game name or server',
      whoOpt: 'optional',
      whoPh: 'e.g. Aistra91 · 286',
      sends: 'Sent along automatically: the page you are on, your language and the site version. Nothing else — please keep personal details out of your message.',
      send: 'Send',
      sending: 'Sending…',
      cancel: 'Cancel',
      close: 'Close',
      okTitle: 'Message sent',
      okBody: 'Thanks, it came through. I cannot reply from here, but everything gets read.',
      errTitle: 'Sending failed',
      errNet: 'The connection did not go through. Your message is still here: try again in a moment.',
      errMany: 'Too many messages at once. Try again in an hour.',
      errWait: 'You have just sent a message. Wait a minute before the next one.',
      errDay: 'You have already sent several messages today. Come back tomorrow.',
      errRefused: 'The server refused the message. Please try again later.',
      retry: 'Try again',
      chars: '{n} / {max}'
    }
  };

  const KINDS = ['bug', 'value', 'idea', 'other'];
  const MIN_LEN = 10, MAX_LEN = 2000;
  const COOLDOWN_MS = 60 * 1000;   // entre deux envois réussis
  const MAX_PER_DAY = 5;
  const TIMEOUT_MS = 15000;        // sans quoi une requête suspendue laisse le bouton tournant

  // Clés « chrome », volontairement HORS de STORAGE_KEYS : profiles.js isole toute
  // valeur de ce registre par profil et backup.js en fait une donnée exportable.
  // Un garde-fou anti-spam n'est ni l'un ni l'autre — il doit rester attaché au
  // navigateur, pas au profil, sinon changer de profil le remettrait à zéro.
  const K_LAST = 'fb_last', K_DAY = 'fb_day', K_CID = 'fb_cid';

  const lang = () => (window.GlobalLang ? GlobalLang.get() : 'FR');
  const T = () => I18N[lang()] || I18N.FR;
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const get = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  // Identifiant anonyme du navigateur : il ne dit RIEN de la personne, il permet
  // seulement de voir dans la feuille que trois lignes viennent du même envoyeur.
  function clientId() {
    let id = get(K_CID, '');
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
         : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
      set(K_CID, id);
    }
    return id;
  }

  const today = () => new Date().toISOString().slice(0, 10);
  function dayCount() {
    const raw = get(K_DAY, '');
    const [d, n] = raw.split('|');
    return (d === today()) ? (Number(n) || 0) : 0;
  }
  function noteSend() {
    set(K_LAST, String(Date.now()));
    set(K_DAY, today() + '|' + (dayCount() + 1));
  }
  /** Ce qui bloque un envoi côté navigateur, ou null si la voie est libre. */
  function localBlock() {
    if (Date.now() - Number(get(K_LAST, '0') || 0) < COOLDOWN_MS) return 'errWait';
    if (dayCount() >= MAX_PER_DAY) return 'errDay';
    return null;
  }

  // ---------- état ----------
  let overlay = null, kind = 'bug', busy = false, lastFocus = null;
  const draft = { message: '', who: '' };

  const el = (id) => document.getElementById(id);

  function bodyHTML() {
    const t = T();
    return `
      <p class="fb-intro">${esc(t.intro)}</p>

      <div class="fb-kinds" role="group" aria-label="${esc(t.label)}">
        ${KINDS.map((k) => `<button type="button" class="fb-kind${k === kind ? ' active' : ''}" data-kind="${k}">${esc(t.kinds[k])}</button>`).join('')}
      </div>

      <label class="fb-label" for="fb-msg">${esc(t.label)}</label>
      <textarea id="fb-msg" class="fb-textarea" maxlength="${MAX_LEN}" rows="6"
                placeholder="${esc(t.ph)}">${esc(draft.message)}</textarea>
      <div class="fb-count" id="fb-count"></div>

      <label class="fb-label" for="fb-who">${esc(t.who)} <span class="fb-opt">${esc(t.whoOpt)}</span></label>
      <input id="fb-who" class="fb-input" type="text" maxlength="40"
             placeholder="${esc(t.whoPh)}" value="${esc(draft.who)}">

      <!-- Champ piège : invisible et hors tabulation, un humain ne le remplit jamais.
           Un robot qui remplit tout se signale donc lui-même. -->
      <div class="fb-hp" aria-hidden="true">
        <label for="fb-hp">Website</label>
        <input id="fb-hp" type="text" tabindex="-1" autocomplete="off">
      </div>

      <p class="fb-sends">${esc(t.sends)}</p>
      <div class="fb-err" id="fb-err" hidden></div>

      <div class="fb-actions">
        <button type="button" class="btn-modern btn-modern-secondary" id="fb-cancel">${esc(t.cancel)}</button>
        <button type="button" class="btn-modern btn-modern-primary" id="fb-send">${esc(t.send)}</button>
      </div>`;
  }

  function successHTML() {
    const t = T();
    return `
      <div class="fb-done">
        <div class="fb-done-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
               stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h4 class="fb-done-title">${esc(t.okTitle)}</h4>
        <p class="fb-done-body">${esc(t.okBody)}</p>
        <button type="button" class="btn-modern btn-modern-primary" id="fb-close2">${esc(t.close)}</button>
      </div>`;
  }

  function render() {
    const t = T();
    const title = el('fb-title'); if (title) title.textContent = t.title;
    const body = el('fb-body'); if (!body) return;
    body.innerHTML = bodyHTML();
    wireBody();
    updateCount();
  }

  function updateCount() {
    const ta = el('fb-msg'), c = el('fb-count'), send = el('fb-send');
    if (!ta || !c || !send) return;
    const n = ta.value.trim().length;
    c.textContent = T().chars.replace('{n}', n).replace('{max}', MAX_LEN);
    c.classList.toggle('low', n > 0 && n < MIN_LEN);
    send.disabled = busy || n < MIN_LEN;
  }

  function showErr(msgKey) {
    const box = el('fb-err');
    if (!box) return;
    box.textContent = T()[msgKey] || T().errRefused;
    box.hidden = false;
  }

  function wireBody() {
    const ta = el('fb-msg');
    if (ta) {
      ta.addEventListener('input', () => { draft.message = ta.value; updateCount(); });
      // Ctrl/⌘ + Entrée envoie : le réflexe attendu dans un champ de message.
      ta.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send(); }
      });
    }
    const who = el('fb-who');
    if (who) who.addEventListener('input', () => { draft.who = who.value; });

    document.querySelectorAll('.fb-kind').forEach((b) => {
      b.addEventListener('click', () => {
        kind = b.getAttribute('data-kind');
        document.querySelectorAll('.fb-kind').forEach((x) => x.classList.toggle('active', x === b));
      });
    });

    const cancel = el('fb-cancel'); if (cancel) cancel.addEventListener('click', close);
    const sendBtn = el('fb-send');  if (sendBtn) sendBtn.addEventListener('click', send);
  }

  async function send() {
    if (busy) return;
    const ta = el('fb-msg');
    const msg = ta ? ta.value.trim() : '';
    if (msg.length < MIN_LEN) return;

    const blocked = localBlock();
    if (blocked) { showErr(blocked); return; }

    const sendBtn = el('fb-send'), errBox = el('fb-err');
    busy = true;
    if (errBox) errBox.hidden = true;
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = T().sending; }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(SITE.feedback.url, {
        method: 'POST',
        // `text/plain` est délibéré : c'est l'un des rares types que le navigateur
        // envoie SANS préflight. En `application/json`, Apps Script ne répondrait
        // pas au OPTIONS et l'envoi échouerait avant même de partir.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          key: SITE.feedback.key,
          kind: kind,
          message: msg,
          page: location.pathname + location.search,
          lang: lang(),
          version: (window.SITE && SITE.version) || '',
          server: (el('fb-who') ? el('fb-who').value.trim() : '').slice(0, 40),
          ua: navigator.userAgent,
          cid: clientId(),
          hp: el('fb-hp') ? el('fb-hp').value : ''
        }),
        signal: ctrl.signal
      });
      const data = await res.json();

      if (data && data.ok) {
        noteSend();
        draft.message = ''; draft.who = '';
        const body = el('fb-body');
        if (body) {
          body.innerHTML = successHTML();
          const c = el('fb-close2');
          if (c) { c.addEventListener('click', close); c.focus(); }
        }
        return;
      }
      showErr(data && data.status === 'too_many' ? 'errMany' : 'errRefused');

    } catch (e) {
      // Réseau coupé, délai dépassé, réponse illisible : même issue côté joueur.
      showErr('errNet');
    } finally {
      clearTimeout(timer);
      busy = false;
      const b = el('fb-send');
      if (b) { b.textContent = T().send; }
      updateCount();
    }
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.removeEventListener('keydown', onKey);
    // Le focus doit revenir d'où il venait, sinon il repart en haut de page.
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function open() {
    if (!window.SITE || !SITE.feedback || !SITE.feedback.url) return;
    lastFocus = document.activeElement;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'fb-overlay';
      overlay.className = 'backup-overlay';
      overlay.innerHTML = `
        <div class="backup-modal fb-modal" role="dialog" aria-modal="true" aria-labelledby="fb-title">
          <div class="backup-header">
            <h3 class="backup-title" id="fb-title"></h3>
            <button type="button" class="fb-x" id="fb-x" aria-label="${esc(T().close)}">&times;</button>
          </div>
          <div class="backup-body" id="fb-body"></div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      el('fb-x').addEventListener('click', close);
      // Retraduction à chaud, comme partout ailleurs sur le site. Le brouillon est
      // conservé : changer de langue ne doit pas effacer ce qu'on vient d'écrire.
      window.addEventListener('langChanged', () => {
        if (overlay && overlay.classList.contains('active')) render();
      });
    }

    render();
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      const ta = el('fb-msg'); if (ta) ta.focus();
    });
  }

  window.Feedback = { open: open };
})();
