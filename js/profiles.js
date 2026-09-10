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
  // L'ACCÈS à localStorage peut lever, pas seulement l'écriture : cookies bloqués,
  // modes stricts. Sans ce filet, l'IIFE mourait sur sa première ligne, `window.Profiles`
  // n'existait jamais, et le bandeau censé prévenir le joueur n'était pas posé non plus —
  // on promettait « navigation privée » dans son texte sans couvrir le cas.
  let LS = null;
  try { LS = window.localStorage; LS.getItem('kt_probe'); } catch (e) { LS = null; }

  const PROTO = LS ? Object.getPrototypeOf(LS) : null;   // Storage.prototype
  const _get    = PROTO && PROTO.getItem;
  const _set    = PROTO && PROTO.setItem;
  const _remove = PROTO && PROTO.removeItem;
  const _key    = PROTO && PROTO.key;
  // Une lecture qui échoue vaut « rien en mémoire », jamais une exception : c'est
  // ce que le reste du module attend, et cela évite qu'un stockage capricieux
  // n'interrompe l'amorçage à mi-parcours.
  const nativeGet    = (k)    => { try { return _get.call(LS, k); } catch (e) { return null; } };
  const nativeSet    = (k, v) => _set.call(LS, k, v);
  const nativeRemove = (k)    => { try { return _remove.call(LS, k); } catch (e) { /* rien à retirer */ } };

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
  // Un stockage plein ou interdit ne doit pas empêcher le reste de la page de vivre :
  // sans ce filet, l'exception traversait l'IIFE et `window.Profiles` n'existait jamais.
  let storageOk = true;
  function writeRegistry() {
    try { nativeSet(REGISTRY_KEY, JSON.stringify(registry)); return true; }
    catch (e) { storageOk = false; return false; }
  }

  function genId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }
  function defaultName(n) {
    const lang = (nativeGet('hub_lang') || 'EN').toUpperCase();
    return (lang === 'FR' ? 'Profil ' : 'Profile ') + n;
  }

  // Aucun stockage exploitable : ni profils, ni proxy, mais surtout aucune exception.
  // L'API est exposée inerte pour que ses appelants (header, sauvegarde) continuent
  // de tourner, et le joueur est prévenu une fois que rien ne sera conservé.
  if (!LS) {
    const seul = { id: 'p1', name: defaultName(1), color: COLORS[0] };
    window.Profiles = {
      list: () => [seul], get: () => seul, active: () => seul, activeId: () => seul.id,
      create: () => false, rename: () => false, remove: () => false,
      switch: () => {}, consumeSwitchToast: () => null,
      storageOk: () => false, colors: COLORS.slice()
    };
    if (window.ktWarnUnsaved) window.ktWarnUnsaved();
    return;
  }

  // ---------- Amorçage, PUIS migration ----------
  // Deux opérations distinctes, et les confondre coûtait cher : créer un profil ne
  // demande rien, migrer les clés demande de SAVOIR lesquelles migrer. Les pages qui
  // chargent ce fichier sans `storage-keys.js` (base de données, À propos, Changelog)
  // ont un `BUSINESS_KEYS` vide. Quand la présence du registre signalait à elle seule
  // « migration faite », arriver par une de ces pages écrivait le registre sans rien
  // migrer, et la page d'outil suivante ne migrait plus jamais : la clé à plat restait
  // en place, mais plus personne n'allait la lire. Le registre dit désormais quelle
  // migration a tourné (`mig`), et seule une page qui connaît les clés peut la poser.
  const MIGRATION = 1;

  // Un registre illisible était réamorcé à UN SEUL profil, et les autres comptes
  // devenaient inatteignables : leurs clés `kt::<id>::*` restaient en stockage sans
  // plus rien pour les nommer ni les ouvrir. Trois profils, un registre tronqué, et
  // il n'en restait qu'un à l'écran, sans un mot. On relit donc les identifiants
  // directement dans le stockage : le joueur reperd ses noms et ses couleurs, jamais
  // ses données. Limite assumée : un profil créé mais jamais rempli ne laisse aucune
  // clé derrière lui, donc rien ne permet de le retrouver. Il n'y a rien à y perdre.
  function scanProfileIds() {
    const ids = [];
    try {
      for (let i = 0; i < LS.length; i++) {
        const k = _key.call(LS, i);
        const m = k && k.match(/^kt::([^:]+)::/);
        if (m && ids.indexOf(m[1]) === -1) ids.push(m[1]);
      }
    } catch (e) { /* stockage capricieux : on repart au moins avec p1 */ }
    ids.sort();                                   // ordre stable d'un chargement à l'autre
    const i1 = ids.indexOf('p1');
    if (i1 !== -1) ids.splice(i1, 1);
    ids.unshift('p1');                            // profil d'origine, toujours en tête
    return ids;
  }

  let registry = readRegistry();
  if (!registry) {
    // `p1` est un id FIXE, pas un hasard : si la migration s'interrompt avant d'avoir
    // fini, le chargement suivant retrouve le même espace et reprend là où elle en était.
    const ids = scanProfileIds();
    registry = { v: 1, activeId: ids[0],
                 profiles: ids.map((id, i) => ({ id: id, name: defaultName(i + 1), color: COLORS[i % COLORS.length] })) };
    writeRegistry();
    // Un seul profil retrouvé : c'est le premier passage sur le site, il n'y a rien
    // à signaler. Plusieurs : le joueur doit savoir pourquoi ses noms ont sauté.
    if (ids.length > 1 && window.ktWarnProfilesReset) window.ktWarnProfilesReset();
  }

  // Migration idempotente, reprenable, et qui ne détruit rien : elle ne s'exécute que
  // sur une page qui connaît les clés métier, n'écrase jamais une valeur déjà présente
  // dans le profil, et ne retire une clé à plat qu'APRÈS l'avoir recopiée avec succès.
  if (BUSINESS_KEYS.size && registry.mig !== MIGRATION) {
    const home = registry.profiles[0].id;   // le profil d'origine hérite de l'historique
    let complete = true;
    BUSINESS_KEYS.forEach((key) => {
      const val = nativeGet(key);
      if (val === null) return;                        // rien à plat pour cette clé
      if (nativeGet(NS(home, key)) !== null) return;   // le profil a déjà la sienne : on n'y touche pas
      try { nativeSet(NS(home, key), val); }
      catch (e) { complete = false; return; }          // stockage plein : la clé à plat reste, on retentera
      nativeRemove(key);
    });
    // `mig` n'est posé que si TOUT est passé : une migration partielle reste à reprendre.
    if (complete) { registry.mig = MIGRATION; writeRegistry(); }
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
    // `false` dès qu'une écriture du registre a échoué (navigation privée, quota).
    // Les appelants d'un AUTRE fichier doivent le tester en `typeof` : sans
    // cache-busting sur le site, une page neuve peut tomber sur ce fichier en cache.
    storageOk: () => storageOk,
    colors: COLORS.slice()
  };
})();
