// ==========================================
// MODAL TABS — Onglets mobiles des panneaux de détail
// Pages concernées : caserne.html (#hero-modal) et masters.html (#master-modal)
// Les panneaux sont les éléments [data-mtab] placés dans #modal-body.
// Sur desktop la barre est masquée par le CSS et tous les panneaux restent visibles :
// ce module ne modifie donc l'affichage que sous 820px.
// ==========================================

(function () {
    'use strict';

    var PAGES = {
        'hero-modal': [
            { key: 'level',  FR: 'Niveau',      EN: 'Level' },
            { key: 'skills', FR: 'Compétences', EN: 'Skills' },
            { key: 'widget', FR: 'Équipement',  EN: 'Gear' }
        ],
        'master-modal': [
            { key: 'relation', FR: 'Relation',    EN: 'Relationship' },
            { key: 'break',    FR: 'Paliers',     EN: 'Breakthroughs' },
            { key: 'skills',   FR: 'Compétences', EN: 'Skills' }
        ]
    };

    var CLOSE_LABEL = { FR: 'Fermer', EN: 'Close' };
    var instances = [];

    function currentLang() {
        var l = window.GlobalLang ? window.GlobalLang.get() : (localStorage.getItem('hub_lang') || 'EN');
        return String(l).toUpperCase() === 'FR' ? 'FR' : 'EN';
    }

    // Un panneau vide (ex. héros sans équipement exclusif) n'affiche pas son onglet
    function isEmpty(panel) {
        return panel.textContent.trim() === '' && !panel.querySelector('input, select, img');
    }

    function select(inst, key) {
        inst.tabs.forEach(function (t) {
            var on = (t.def.key === key);
            t.panel.classList.toggle('mtab-on', on);
            t.btn.classList.toggle('active', on);
            t.btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        inst.active = key;
        inst.body.scrollTop = 0;
    }

    function refresh(inst) {
        var first = null;
        inst.tabs.forEach(function (t) {
            t.empty = isEmpty(t.panel);
            t.btn.style.display = t.empty ? 'none' : '';
            if (!t.empty && !first) first = t.def.key;
        });
        var cur = null;
        inst.tabs.forEach(function (t) { if (t.def.key === inst.active) cur = t; });
        if (!cur || cur.empty) select(inst, first || inst.tabs[0].def.key);
    }

    function translate(inst) {
        var l = currentLang();
        inst.tabs.forEach(function (t) { t.btn.textContent = t.def[l]; });
        inst.close.setAttribute('aria-label', CLOSE_LABEL[l]);
        inst.close.setAttribute('title', CLOSE_LABEL[l]);
    }

    // Réutilise le bouton Annuler de la page pour garder son comportement exact
    function dismiss(inst) {
        var cancel = inst.modal.querySelector('[data-i18n="modalCancel"], [data-i18n="btnCancel"]');
        if (cancel) { cancel.click(); return; }
        if (typeof window.closeModal === 'function') { window.closeModal(); return; }
        if (typeof window.closeMasterModal === 'function') { window.closeMasterModal(); return; }
        inst.modal.classList.remove('show');
    }

    function watchBody(inst) {
        if (!window.MutationObserver) return;
        var queued = false;
        new MutationObserver(function () {
            if (queued) return;
            queued = true;
            requestAnimationFrame(function () { queued = false; refresh(inst); });
        }).observe(inst.body, { childList: true, subtree: true });
    }

    function watchOpening(inst) {
        if (!window.MutationObserver) return;
        new MutationObserver(function () {
            var open = inst.modal.classList.contains('show');
            if (open && !inst.wasOpen) {
                refresh(inst);
                var first = null;
                inst.tabs.forEach(function (t) { if (!t.empty && !first) first = t.def.key; });
                select(inst, first || inst.tabs[0].def.key);
            }
            inst.wasOpen = open;
        }).observe(inst.modal, { attributes: true, attributeFilter: ['class'] });
    }

    function build(modalId, defs) {
        var modal = document.getElementById(modalId);
        if (!modal) return null;
        var body = modal.querySelector('#modal-body');
        if (!body) return null;

        var inst = { modal: modal, body: body, tabs: [], active: null, wasOpen: false };

        defs.forEach(function (def) {
            var panel = body.querySelector('[data-mtab="' + def.key + '"]');
            if (!panel) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mtab';
            btn.setAttribute('role', 'tab');
            btn.addEventListener('click', function () { select(inst, def.key); });
            inst.tabs.push({ def: def, panel: panel, btn: btn, empty: false });
        });
        if (!inst.tabs.length) return null;

        var bar = document.createElement('div');
        bar.className = 'mtabs';
        bar.setAttribute('role', 'tablist');
        inst.tabs.forEach(function (t) { bar.appendChild(t.btn); });

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'mtab-close';
        close.textContent = '\u00D7';
        close.addEventListener('click', function () { dismiss(inst); });
        bar.appendChild(close);

        inst.bar = bar;
        inst.close = close;
        body.parentNode.insertBefore(bar, body);

        translate(inst);
        refresh(inst);
        watchBody(inst);
        watchOpening(inst);
        return inst;
    }

    function init() {
        Object.keys(PAGES).forEach(function (id) {
            var inst = build(id, PAGES[id]);
            if (inst) instances.push(inst);
        });
        if (!instances.length) return;
        window.addEventListener('langChanged', function () {
            instances.forEach(function (inst) { translate(inst); });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();