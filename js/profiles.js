// ============================================================
//  PROFILES — comptes multiples, données métier isolées par profil
//  Global (partagé entre profils) : langue (hub_lang), thème (hub_theme),
//    aides vues (help_seen_*), registre des profils (kt_profiles).
//  Par profil : toutes les clés de STORAGE_KEYS (rangées sous kt::<id>::<clé>).
//
//  À CHARGER TÔT (juste après storage-keys.js, avant tout script de page) :
//  installe un proxy transparent sur localStorage. Les scripts existants
//  continuent d'appeler localStorage.getItem/setItem(STORAGE_KEYS.x) sans
//  aucune modification — le proxy les redirige vers le profil actif.
// ============================================================
(function () {
  'use strict';
  if (window.Profiles) return; // déjà initialisé (page qui inclut deux fois)

  // --- Méthodes natives capturées sur le prototype (jamais patchées) ---
  const LS   = window.localStorage;
  const PROTO = Object.getPrototypeOf(LS);           // Storage.prototype
  const _get    = PROTO.getItem;
  const _set    = PROTO.setItem;
  const _remove = PROTO.removeItem;
  const _key    = PROTO.key;
  const nativeGet    = (k)    => _get.call(LS, k);
  const nativeSet    = (k, v) => _set.call(LS, k, v);
  const nativeRemove = (k)    => _remove.call(LS, k);

  const REGISTRY_KEY = 'kt_profiles';
  const NS_PREFIX = (id) => 'kt::' + id + '::';
  const NS = (id, key) => NS_PREFIX(id) + key;

  // Clés métier à isoler = valeurs de STORAGE_KEYS (source unique).
  // Sur les pages database/* (pas de STORAGE_KEYS) l'ensemble est vide → le
  // proxy devient un simple passe-plat, mais le registre + l'UI fonctionnent.
  const BUSINESS_KEYS = new Set(Object.values(window.STORAGE_KEYS || {}));
  const isBusiness = (key) => BUSINESS_KEYS.has(key);

  // Palette d'anneaux (identité visuelle par profil) — cf. charte Royal Gold.
  const COLORS = ['#f5b840', '#4ecdc4', '#b98cff', '#ff8c42', '#5aa9e6', '#7ed957', '#e74c5c'];

  // ---------- Registre ----------
  function readRegistry() {
    try {
      const raw = nativeGet(REGISTRY_KEY);
      if (raw) {
        const r = JSON.parse(raw);
        if (r && Array.isArray(r.profiles) && r.profiles.length) return r;
      }
    } catch (e) { /* corrompu → réamorçage */ }
    return null;
  }
  function writeRegistry() { nativeSet(REGISTRY_KEY, JSON.stringify(registry)); }

  function genId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }
  function defaultName(n) {
    const lang = (nativeGet('hub_lang') || 'EN').toUpperCase();
    return (lang === 'FR' ? 'Profil ' : 'Profile ') + n;
  }

  // ---------- Amorçage + migration ----------
  let registry = readRegistry();
  if (!registry) {
    // Premier lancement du système de profils : le 1er profil hérite des
    // données « à plat » déjà présentes (aucune perte pour l'utilisateur).
    const id = 'p1';
    registry = { v: 1, activeId: id, profiles: [{ id, name: defaultName(1), color: COLORS[0] }] };
    BUSINESS_KEYS.forEach((key) => {
      const val = nativeGet(key);
      if (val !== null && nativeGet(NS(id, key)) === null) {
        nativeSet(NS(id, key), val);   // copie vers l'espace du profil
        nativeRemove(key);             // retire la clé à plat (désormais orpheline)
      }
    });
    writeRegistry(); // écrit en DERNIER : sa présence signale « migration faite »
  }

  // Sécurité : le profil actif doit exister.
  let activeId = registry.activeId;
  if (!registry.profiles.some((p) => p.id === activeId)) {
    activeId = registry.profiles[0].id;
    registry.activeId = activeId;
    writeRegistry();
  }

  // ---------- Proxy transparent sur localStorage ----------
  // On patche le prototype et on garde sessionStorage intact via `this`.
  PROTO.getItem = function (key) {
    if (this === LS && isBusiness(key)) return _get.call(this, NS(activeId, key));
    return _get.call(this, key);
  };
  PROTO.setItem = function (key, value) {
    if (this === LS && isBusiness(key)) return _set.call(this, NS(activeId, key), value);
    return _set.call(this, key, value);
  };
  PROTO.removeItem = function (key) {
    if (this === LS && isBusiness(key)) return _remove.call(this, NS(activeId, key));
    return _remove.call(this, key);
  };

  // ---------- API publique ----------
  function list()     { return registry.profiles.slice(); }
  function get(id)    { return registry.profiles.find((p) => p.id === id) || null; }
  function active()   { return get(activeId) || registry.profiles[0]; }
  function getActiveId() { return activeId; }

  function create(name) {
    const id = genId();
    const color = COLORS[registry.profiles.length % COLORS.length];
    const nm = (name && name.trim()) ? name.trim().slice(0, 40) : defaultName(registry.profiles.length + 1);
    registry.profiles.push({ id, name: nm, color });
    writeRegistry();
    return get(id);
  }

  function rename(id, name) {
    const p = get(id);
    if (!p) return false;
    const nm = (name || '').trim().slice(0, 40);
    if (!nm) return false;
    p.name = nm;
    writeRegistry();
    return true;
  }

  // Supprime un profil ET toutes ses données namespacées.
  function remove(id) {
    if (registry.profiles.length <= 1) return false; // jamais 0 profil
    const idx = registry.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    purge(id);
    registry.profiles.splice(idx, 1);
    if (activeId === id) {
      activeId = registry.profiles[0].id;
      registry.activeId = activeId;
    }
    writeRegistry();
    return true;
  }

  function purge(id) {
    const pref = NS_PREFIX(id);
    const doomed = [];
    for (let i = 0; i < LS.length; i++) {
      const k = _key.call(LS, i);
      if (k && k.indexOf(pref) === 0) doomed.push(k);
    }
    doomed.forEach((k) => nativeRemove(k));
  }

  // Bascule de profil : persiste, arme le toast, recharge la page.
  function switchTo(id) {
    if (!get(id) || id === activeId) return;
    activeId = id;
    registry.activeId = id;
    writeRegistry();
    try { sessionStorage.setItem('kt_switched', id); } catch (e) { /* privé */ }
    location.reload();
  }

  // Toast de confirmation post-bascule (consommé une seule fois).
  function consumeSwitchToast() {
    let id = null;
    try { id = sessionStorage.getItem('kt_switched'); sessionStorage.removeItem('kt_switched'); } catch (e) {}
    return id ? get(id) : null;
  }

  window.Profiles = {
    list, get, active, activeId: getActiveId,
    create, rename, remove, switch: switchTo,
    consumeSwitchToast,
    colors: COLORS.slice()
  };
})();
