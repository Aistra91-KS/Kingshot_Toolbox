/* ============================================================
   js/db-heroes.js — fiches Héros (database/heroes/<slug>.html)

   Deux choses, et rien d'autre : la langue, et le niveau de compétence.

   Le HTML servi porte déjà tout — texte anglais, niveau 5 — parce que le
   contenu doit exister sans exécuter le JS (MAP.md §9). Ce fichier ne
   construit rien, il réécrit.

   Aucun nom global n'en sort. Le site n'a pas de cache-busting : un
   visiteur de retour peut mélanger une page neuve et un script en cache, et
   un ReferenceError tue le rendu en plein milieu. Tout est enfermé ici, et
   rien de caserne.js n'est appelé.
   ============================================================ */
(function () {
  'use strict';

  var DICT = {
    FR: { crumb: 'Héros', niveau: 'Niveau de compétence %s' },
    EN: { crumb: 'Heroes', niveau: 'Skill level %s' }
  };

  function lang() {
    return (window.GlobalLang && GlobalLang.get && GlobalLang.get()) || 'FR';
  }

  function esc(txt) {
    return String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // « (2%,3%) » vaut deux valeurs, le reste une seule.
  function parts(valeur) {
    var m = String(valeur).match(/^\((.*)\)$/);
    return m ? m[1].split(',').map(function (v) { return v.trim(); }) : [String(valeur).trim()];
  }

  // MÊME lecture des X que caserneFillX() (js/caserne.js) et que fill_effect()
  // dans tools/build_pages.py. Les trois doivent rester identiques, sinon une
  // valeur s'affiche à un endroit et pas à l'autre. Un X collé à une lettre
  // reste intact : celui d'EXP ou de max n'est pas une valeur. La lettre qui
  // précède est capturée plutôt que testée en arrière — Safari avant la 16.4
  // ne connaît pas le lookbehind.
  function fillX(texte, valeur) {
    var vals = parts(valeur), i = 0;
    return esc(texte).replace(/([A-Za-z]?)X(%?)(?![A-Za-z])/g, function (tout, avant) {
      if (avant) return tout;
      var v = vals[Math.min(i, vals.length - 1)];
      i++;
      return '<b class="hb-v">' + esc(v) + '</b>';
    });
  }

  function niveauCourant() {
    var on = document.querySelector('.hb-lv[aria-pressed="true"]');
    return on ? parseInt(on.getAttribute('data-lv'), 10) : 5;
  }

  function appliqueNiveau(lv, annonce) {
    var suffixe = lang().toLowerCase();
    document.querySelectorAll('.hb-eff[data-levels]').forEach(function (el) {
      var tpl = el.getAttribute('data-tpl-' + suffixe) || el.getAttribute('data-tpl-en');
      var brut = el.getAttribute('data-levels') || '';
      var niveaux = brut ? brut.split('|') : [];
      // Un attribut vide ou absent laisse la valeur du HTML servi en place plutôt
      // que d'écrire un effet sans son chiffre : mieux vaut une valeur figée au
      // niveau 5, qui se voit, qu'une phrase amputée qui ne se voit pas.
      // ('').split('|') vaut [''] : tester la longueur du tableau ne garde rien.
      if (!tpl || !niveaux.length) return;
      el.innerHTML = fillX(tpl, niveaux[Math.min(lv, niveaux.length) - 1]);
    });
    document.querySelectorAll('.hb-lv').forEach(function (b) {
      b.setAttribute('aria-pressed', String(parseInt(b.getAttribute('data-lv'), 10) === lv));
    });
    // Les tableaux portent tous les niveaux : on surligne la colonne choisie
    // pour que le lien avec les cartes se voie.
    document.querySelectorAll('.hb-page [data-lv]').forEach(function (c) {
      if (c.classList.contains('hb-lv')) return;
      c.classList.toggle('is-lv', parseInt(c.getAttribute('data-lv'), 10) === lv);
    });
    // Le bouton dit déjà « enfoncé », mais pas CE qui vient de changer : le message
    // nomme le niveau retenu. Posé au clic seulement — au chargement, la page n'a
    // rien annoncé, elle s'est affichée.
    var dit = document.getElementById('hb-lv-say');
    if (dit && annonce) {
      dit.textContent = (DICT[lang()] || DICT.FR).niveau.replace('%s', lv);
    }
  }

  function appliqueLangue() {
    var l = lang();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(DICT[l] || DICT.FR);
    document.querySelectorAll('[data-en][data-fr]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + l.toLowerCase()) || el.textContent;
    });
    document.documentElement.lang = l.toLowerCase();
    // Les effets ne sont pas de simples [data-en]/[data-fr] : leur texte dépend
    // AUSSI du niveau choisi, d'où la réécriture qui suit le changement de langue.
    appliqueNiveau(niveauCourant());
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.hb-lv') : null;
    if (!b) return;
    appliqueNiveau(parseInt(b.getAttribute('data-lv'), 10), true);
  });

  window.addEventListener('langChanged', appliqueLangue);
  appliqueLangue();
})();
