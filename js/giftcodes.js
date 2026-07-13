// ============================================================
//  GIFT CODES — codes cadeaux Kingshot
//  Lit data/gift_codes.json · sauvegarde l'ID Joueur (localStorage)
//  Copie le code dans le presse-papier + ouvre le site officiel
// ============================================================

const GC_DATA_URL = 'data/gift_codes.json';
const GC_FALLBACK_REDEEM = 'https://ks-giftcode.centurygame.com/';

const i18nGift = {
  FR: {
    pageTitle: 'Codes Cadeaux',
    pageDesc: "Retrouve tous les codes cadeaux actifs de Kingshot. Enregistre ton ID Joueur, copie un code et utilise-le sur le site officiel en un clic.",
    idTitle: 'Ton ID Joueur',
    idHint: "Enregistré dans ce navigateur — tu n'auras plus à le retaper.",
    idPh: 'Ex : 49503410',
    idSave: 'Enregistrer',
    idSavedLabel: 'ID Joueur enregistré',
    idEdit: 'Modifier',
    idDelete: 'Supprimer',
    idRequired: "Saisis d'abord ton ID Joueur.",
    idSavedMsg: 'ID Joueur enregistré.',
    idDeletedMsg: 'ID Joueur supprimé.',
    idDeleteConfirm: "Supprimer l'ID Joueur enregistré ?",
    codesTitle: 'Codes actifs',
    reload: 'Actualiser',
    rewards: 'Récompenses',
    useCode: 'Utiliser ce code',
    copied: 'Copié !',
    expiresOn: 'Expire le',
    noExpiry: 'Sans expiration',
    daysLeftOne: 'jour restant',
    daysLeft: 'jours restants',
    lastDay: 'Dernier jour',
    expired: 'Expiré',
    noCodes: 'Aucun code actif pour le moment. Reviens plus tard !',
    loadError: 'Impossible de charger les codes (data/gift_codes.json introuvable ?).',
    howTitle: 'Comment ça marche',
    how1: 'Enregistre ton ID Joueur (une seule fois).',
    how2: "Clique sur « Utiliser ce code » : le code est copié et le site officiel s'ouvre dans un nouvel onglet.",
    how3: 'Colle le code sur le site, valide, et récupère tes récompenses.',
    manualCopy: 'Copie manuelle du code :'
  },
  EN: {
    pageTitle: 'Gift Codes',
    pageDesc: 'Find every active Kingshot gift code. Save your Player ID, copy a code and redeem it on the official site in one click.',
    idTitle: 'Your Player ID',
    idHint: 'Saved in this browser — no need to type it again.',
    idPh: 'e.g. 49503410',
    idSave: 'Save',
    idSavedLabel: 'Player ID saved',
    idEdit: 'Edit',
    idDelete: 'Delete',
    idRequired: 'Enter your Player ID first.',
    idSavedMsg: 'Player ID saved.',
    idDeletedMsg: 'Player ID deleted.',
    idDeleteConfirm: 'Delete the saved Player ID?',
    codesTitle: 'Active codes',
    reload: 'Refresh',
    rewards: 'Rewards',
    useCode: 'Use this code',
    copied: 'Copied!',
    expiresOn: 'Expires on',
    noExpiry: 'No expiry',
    daysLeftOne: 'day left',
    daysLeft: 'days left',
    lastDay: 'Last day',
    expired: 'Expired',
    noCodes: 'No active codes right now. Check back soon!',
    loadError: 'Could not load codes (data/gift_codes.json missing?).',
    howTitle: 'How it works',
    how1: 'Save your Player ID (once).',
    how2: 'Click "Use this code": the code is copied and the official site opens in a new tab.',
    how3: 'Paste the code on the site, confirm, and claim your rewards.',
    manualCopy: 'Manual code copy:'
  }
};

let gcCodes = [];
let gcRedeemUrl = GC_FALLBACK_REDEEM;

function gcLang() {
  return window.GlobalLang ? window.GlobalLang.get().toUpperCase()
                           : ((localStorage.getItem('hub_lang') || 'EN').toUpperCase());
}
function gcDict() { return i18nGift[gcLang()] || i18nGift.FR; }
function gcT(obj) { const l = gcLang(); return obj ? (obj[l] || obj.EN || obj.FR || '') : ''; }

function applyTranslations() {
  if (window.GlobalLang) GlobalLang.applyI18n(gcDict());
}

/* ---------------- ID Joueur (localStorage) ---------------- */
function gcGetId() { return window.safeParse ? safeParse(STORAGE_KEYS.giftPlayerId, '') : ''; }
function gcSetId(id) { localStorage.setItem(STORAGE_KEYS.giftPlayerId, JSON.stringify(id)); }
function gcClearId() { localStorage.removeItem(STORAGE_KEYS.giftPlayerId); }

function renderIdPanel() {
  const d = gcDict();
  const saved = gcGetId();
  const box = document.getElementById('gc-id-body');
  if (!box) return;

  if (saved) {
    box.innerHTML =
      '<div class="gc-id-saved">' +
        '<div class="gc-id-value">' +
          '<span class="gc-id-label">' + d.idSavedLabel + '</span>' +
          '<strong class="gc-id-num">' + saved + '</strong>' +
        '</div>' +
        '<div class="gc-id-actions">' +
          '<button type="button" class="btn-modern btn-modern-secondary gc-btn" id="gc-id-edit">' + d.idEdit + '</button>' +
          '<button type="button" class="btn-modern btn-modern-secondary gc-btn gc-btn-danger" id="gc-id-del">' + d.idDelete + '</button>' +
        '</div>' +
      '</div>';
    document.getElementById('gc-id-edit').onclick = function () { renderIdForm(saved); };
    document.getElementById('gc-id-del').onclick = function () {
      showAppConfirm(d.idDeleteConfirm, function () {
        gcClearId();
        renderIdPanel();
        showAppAlert(d.idDeletedMsg, true);
      });
    };
  } else {
    renderIdForm('');
  }
}

function renderIdForm(prefill) {
  const d = gcDict();
  const box = document.getElementById('gc-id-body');
  box.innerHTML =
    '<div class="gc-id-form">' +
      '<input type="text" id="gc-id-input" class="gc-input" inputmode="numeric" autocomplete="off" placeholder="' + d.idPh + '" value="' + (prefill || '') + '">' +
      '<button type="button" class="btn-modern btn-modern-primary gc-btn" id="gc-id-save">' + d.idSave + '</button>' +
    '</div>';
  const input = document.getElementById('gc-id-input');
  const save = function () {
    const val = input.value.replace(/\s+/g, '').trim();
    if (!val) { showAppAlert(d.idRequired); input.focus(); return; }
    gcSetId(val);
    renderIdPanel();
    showAppAlert(d.idSavedMsg, true);
  };
  document.getElementById('gc-id-save').onclick = save;
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
  input.focus();
}

/* ---------------- Codes ---------------- */
function gcDaysLeft(expiresAt) {
  if (!expiresAt) return null;
  const end = new Date(expiresAt + 'T23:59:59');
  if (isNaN(end.getTime())) return null;
  return Math.ceil((end - new Date()) / 86400000);
}

function gcFmtDate(iso) {
  const dt = new Date(iso + 'T00:00:00');
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString(gcLang() === 'FR' ? 'fr-FR' : 'en-US',
    { day: '2-digit', month: 'short', year: 'numeric' });
}

function gcExpiryTag(code) {
  const d = gcDict();
  if (!code.expiresAt) return '<span class="gc-tag gc-tag-perm">&#8734; ' + d.noExpiry + '</span>';
  const days = gcDaysLeft(code.expiresAt);
  if (days === null) return '';
  if (days < 0) return '<span class="gc-tag gc-tag-expired">' + d.expired + '</span>';
  if (days === 0) return '<span class="gc-tag gc-tag-warn">' + d.lastDay + '</span>';
  const label = days === 1 ? d.daysLeftOne : d.daysLeft;
  const cls = days <= 3 ? 'gc-tag-warn' : 'gc-tag-ok';
  return '<span class="gc-tag ' + cls + '">' + days + ' ' + label + '</span>';
}

function gcRewardsHtml(code) {
  if (!Array.isArray(code.rewards) || !code.rewards.length) return '';
  const loc = gcLang() === 'FR' ? 'fr-FR' : 'en-US';
  const items = code.rewards.map(function (r) {
    const name = gcT(r.name) || gcT(r.item) || '';
    const qty = (r.qty !== undefined && r.qty !== null)
      ? '<span class="gc-rw-qty">' + Number(r.qty).toLocaleString(loc) + '</span>'
      : '';
    return '<li class="gc-rw">' + qty + '<span class="gc-rw-name">' + name + '</span></li>';
  }).join('');
  return '<ul class="gc-rewards">' + items + '</ul>';
}

function renderCodes() {
  const d = gcDict();
  const grid = document.getElementById('gc-codes');
  if (!grid) return;

  const list = gcCodes.filter(function (c) { return c && c.code; });
  if (!list.length) {
    grid.innerHTML = '<p class="gc-empty">' + d.noCodes + '</p>';
    return;
  }

  // Actifs d'abord (expiration la plus proche), expirés en dernier
  list.sort(function (a, b) {
    const ae = a.expiresAt ? gcDaysLeft(a.expiresAt) : Infinity;
    const be = b.expiresAt ? gcDaysLeft(b.expiresAt) : Infinity;
    const aExp = ae < 0, bExp = be < 0;
    if (aExp !== bExp) return aExp ? 1 : -1;
    return ae - be;
  });

  grid.innerHTML = list.map(function (c) {
    const expired = c.expiresAt && gcDaysLeft(c.expiresAt) < 0;
    const expiryLine = c.expiresAt
      ? '<div class="gc-expiry">' + d.expiresOn + ' ' + gcFmtDate(c.expiresAt) + '</div>'
      : '<div class="gc-expiry">' + d.noExpiry + '</div>';
    return '<article class="gc-card' + (expired ? ' is-expired' : '') + '">' +
        '<div class="gc-card-top">' +
          '<code class="gc-code">' + c.code + '</code>' +
          gcExpiryTag(c) +
        '</div>' +
        expiryLine +
        '<div class="gc-rw-title">' + d.rewards + '</div>' +
        gcRewardsHtml(c) +
        '<button type="button" class="btn-modern btn-modern-primary gc-use" data-code="' + c.code + '"' + (expired ? ' disabled' : '') + '>' +
          d.useCode +
        '</button>' +
      '</article>';
  }).join('');

  Array.prototype.forEach.call(grid.querySelectorAll('.gc-use'), function (btn) {
    if (btn.disabled) return;
    btn.addEventListener('click', function () { onUseCode(btn); });
  });
}

async function gcCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fallback ci-dessous */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}

async function onUseCode(btn) {
  const d = gcDict();
  const code = btn.getAttribute('data-code');
  const ok = await gcCopy(code);

  if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
  btn.classList.add('is-copied');
  btn.textContent = '\u2713 ' + d.copied;
  setTimeout(function () {
    btn.classList.remove('is-copied');
    btn.textContent = btn.dataset.label;
  }, 2000);

  if (!ok) showAppAlert(d.manualCopy + ' <strong>' + code + '</strong>');

  window.open(gcRedeemUrl, '_blank', 'noopener');
}

/* ---------------- Chargement ---------------- */
async function loadGiftCodes() {
  const grid = document.getElementById('gc-codes');
  try {
    const res = await fetch(GC_DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    gcCodes = Array.isArray(data.codes) ? data.codes : [];
    if (data.redeemUrl) gcRedeemUrl = data.redeemUrl;
  } catch (e) {
    console.error('Gift codes:', e);
    if (grid) grid.innerHTML = '<p class="gc-empty gc-error">' + gcDict().loadError + '</p>';
    return;
  }
  renderCodes();
}

function initGift() {
  applyTranslations();
  renderIdPanel();
  loadGiftCodes();
  const rl = document.getElementById('gc-reload');
  if (rl) rl.onclick = loadGiftCodes;
}

window.addEventListener('langChanged', function () {
  applyTranslations();
  renderIdPanel();
  renderCodes();
});

document.addEventListener('DOMContentLoaded', initGift);
