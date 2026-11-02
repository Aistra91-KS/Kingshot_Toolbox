// ============================================================
//  wa_worker.js  —  affinage du plan KvK de l'Académie de guerre, hors du fil de la page
//  La page (waracademy.js) en lance 1 à 4 ; chacun joue ses départs `j` de
//  `WA_Optimizer.improver` et renvoie le plan de chacun. La page garde le meilleur,
//  décide de l'arrêt et met fin au worker (terminate) : rien à nettoyer ici.
//
//  Messages reçus : { type: 'run', id, w, opts, plan0, starts: [j…], cfg } (w : numéro du worker)
//  Messages rendus : { type: 'start', id, j, plan, gained, iters, anomalie } par départ, puis
//  { type: 'done', id } ; { type: 'unsupported', id } si l'optimiseur chargé n'a pas
//  `improver` (un wa_optimizer.js resté en cache, MAP §9) ; { type: 'error', id, message }.
// ============================================================
'use strict';

let charge = false;

self.onmessage = function (e) {
  const m = e.data || {};
  if (m.type !== 'run') return;
  try {
    if (!charge) { importScripts('wa_optimizer.js'); charge = true; }
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, w: m.w, message: 'chargement de wa_optimizer.js : ' + (err && err.message) });
    return;
  }
  const W = self.WA_Optimizer;
  if (!W || typeof W.improver !== 'function') { self.postMessage({ type: 'unsupported', id: m.id, w: m.w }); return; }
  try {
    const imp = W.improver(m.opts, m.plan0, m.cfg);
    for (const j of m.starts || []) {
      if (!(j >= 0 && j < imp.count)) continue;
      const r = imp.run(j);
      self.postMessage({ type: 'start', id: m.id, j, plan: r.plan, gained: r.gained, iters: r.iters,
                         anomalie: r.anomalie || null });
    }
    self.postMessage({ type: 'done', id: m.id });
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, w: m.w, message: String((err && err.stack) || err) });
  }
};
