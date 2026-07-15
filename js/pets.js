/* ============================================================
   js/pets.js — Logique page Familiers
   - Données en dur (MVP). Prod → fetch('data/pets_db.json').
   - Scroll-jacking : molette/flèches/swipe = 1 familier à la fois.
   - Transition "avancer sur le chemin" : le familier actif fuit
     vers l'avant/l'horizon, le suivant surgit de la profondeur.
   - i18n : via GlobalLang + event 'langChanged' (comme le site).
   ============================================================ */
(function () {
  "use strict";

  /* --------------------------------------------------------
     DONNÉES — ordre du + faible au + fort (liste inversée)
     -------------------------------------------------------- */
  const PETS = [
    {name:{EN:"Gray Wolf",FR:"Loup Gris"},rarity:"common",lvl:12,atk:130,def:120,hp:1500,
     bonus:{EN:"+2% March Speed",FR:"+2% Vitesse de Marche"},
     skills:[{n:{EN:"Pack Instinct",FR:"Instinct de Meute"},d:{EN:"Small march-speed boost when a rally starts.",FR:"Léger bonus de vitesse au lancement d'un ralliement."}}]},
    {name:{EN:"Lynx",FR:"Lynx"},rarity:"common",lvl:13,atk:145,def:125,hp:1600,
     bonus:{EN:"+3% Scout Speed",FR:"+3% Vitesse d'Éclaireur"},
     skills:[{n:{EN:"Keen Eyes",FR:"Regard Perçant"},d:{EN:"Reveals enemy march size sooner.",FR:"Révèle plus tôt la taille des marches ennemies."}}]},
    {name:{EN:"Bison",FR:"Bison"},rarity:"common",lvl:14,atk:150,def:150,hp:1700,
     bonus:{EN:"+2% Infantry Defense",FR:"+2% Défense Infanterie"},
     skills:[{n:{EN:"Sturdy Hide",FR:"Cuir Robuste"},d:{EN:"Minor infantry defense in the field.",FR:"Défense d'infanterie mineure sur le terrain."}}]},
    {name:{EN:"Cheetah",FR:"Guépard"},rarity:"rare",lvl:17,atk:250,def:190,hp:2300,
     bonus:{EN:"+4% Cavalry Attack",FR:"+4% Attaque Cavalerie"},
     skills:[{n:{EN:"Burst Sprint",FR:"Sprint Fulgurant"},d:{EN:"Cavalry deals bonus damage on the first hit.",FR:"La cavalerie inflige un bonus au premier coup."}}]},
    {name:{EN:"Moose",FR:"Élan"},rarity:"rare",lvl:18,atk:210,def:220,hp:2500,
     bonus:{EN:"+3% Gathering Speed",FR:"+3% Vitesse de Collecte"},
     skills:[{n:{EN:"Forager",FR:"Fourrageur"},d:{EN:"Increases resource gathering speed.",FR:"Augmente la vitesse de collecte des ressources."}}]},
    {name:{EN:"Lion",FR:"Lion"},rarity:"rare",lvl:20,atk:260,def:230,hp:2700,
     bonus:{EN:"+5% Troop Attack",FR:"+5% Attaque des Troupes"},
     skills:[{n:{EN:"Roar",FR:"Rugissement"},d:{EN:"Briefly boosts all troops' attack.",FR:"Renforce brièvement l'attaque de toutes les troupes."}}]},
    {name:{EN:"Grizzly Bear",FR:"Ours Grizzly"},rarity:"epic",lvl:22,atk:340,def:360,hp:3900,
     bonus:{EN:"+6% Infantry HP",FR:"+6% PV Infanterie"},
     skills:[{n:{EN:"Thick Fur",FR:"Fourrure Épaisse"},d:{EN:"Reduces damage taken by infantry.",FR:"Réduit les dégâts subis par l'infanterie."}},
             {n:{EN:"Maul",FR:"Lacération"},d:{EN:"Chance to stun the enemy front line.",FR:"Chance d'étourdir la ligne de front ennemie."}}]},
    {name:{EN:"Giant Rhino",FR:"Rhinocéros Géant"},rarity:"epic",lvl:23,atk:380,def:400,hp:4100,
     bonus:{EN:"+7% Bear Trap Damage",FR:"+7% Dégâts Piège à Ours"},
     skills:[{n:{EN:"Charge",FR:"Charge"},d:{EN:"Heavy opening damage against the Bear Trap.",FR:"Gros dégâts d'ouverture contre le Piège à Ours."}},
             {n:{EN:"Iron Horn",FR:"Corne de Fer"},d:{EN:"Ignores part of enemy defense.",FR:"Ignore une partie de la défense ennemie."}}]},
    {name:{EN:"Mighty Bison",FR:"Bison Puissant"},rarity:"epic",lvl:25,atk:400,def:420,hp:4300,
     bonus:{EN:"+8% Infantry Defense",FR:"+8% Défense Infanterie"},
     skills:[{n:{EN:"Stampede",FR:"Ruée"},d:{EN:"Damage scales with infantry count.",FR:"Dégâts proportionnels au nombre d'infanterie."}},
             {n:{EN:"Bulwark",FR:"Rempart"},d:{EN:"Grants a defensive shield at battle start.",FR:"Accorde un bouclier défensif en début de combat."}}]},
    {name:{EN:"Great Moose",FR:"Grand Élan"},rarity:"legendary",lvl:28,atk:560,def:540,hp:6200,
     bonus:{EN:"+9% Resource Production",FR:"+9% Production de Ressources"},
     skills:[{n:{EN:"Abundance",FR:"Abondance"},d:{EN:"Boosts hourly resource output.",FR:"Augmente la production horaire de ressources."}},
             {n:{EN:"Guardian",FR:"Gardien"},d:{EN:"Nearby troops regenerate faster.",FR:"Les troupes proches régénèrent plus vite."}}]},
    {name:{EN:"Alpha Black Panther",FR:"Panthère Noire Alpha"},rarity:"legendary",lvl:29,atk:620,def:560,hp:6500,
     bonus:{EN:"+10% Cavalry Attack",FR:"+10% Attaque Cavalerie"},
     skills:[{n:{EN:"Ambush",FR:"Embuscade"},d:{EN:"First cavalry strike is a critical hit.",FR:"La première frappe de cavalerie est critique."}},
             {n:{EN:"Shadow Step",FR:"Pas de l'Ombre"},d:{EN:"Cavalry gains extra march speed.",FR:"La cavalerie gagne en vitesse de marche."}}]},
    {name:{EN:"Regal White Lion",FR:"Lion Blanc Royal"},rarity:"legendary",lvl:30,atk:640,def:600,hp:6800,
     bonus:{EN:"+12% Troop Attack",FR:"+12% Attaque des Troupes"},
     skills:[{n:{EN:"Sovereign Roar",FR:"Rugissement Souverain"},d:{EN:"Large attack boost to all troops.",FR:"Fort bonus d'attaque à toutes les troupes."}},
             {n:{EN:"Royal Aura",FR:"Aura Royale"},d:{EN:"Reduces enemy attack in the field.",FR:"Réduit l'attaque ennemie sur le terrain."}}]},
    {name:{EN:"Ironclad War Elephant",FR:"Éléphant de Guerre Cuirassé"},rarity:"mythic",lvl:33,atk:870,def:900,hp:10000,
     bonus:{EN:"+15% All Troop Defense",FR:"+15% Défense de Toutes les Troupes"},
     skills:[{n:{EN:"Siege Charge",FR:"Charge de Siège"},d:{EN:"Massive damage and armor break.",FR:"Dégâts massifs et brise-armure."}},
             {n:{EN:"Iron Wall",FR:"Mur de Fer"},d:{EN:"Greatly reduces damage taken by all troops.",FR:"Réduit fortement les dégâts subis par toutes les troupes."}}]},
    {name:{EN:"Ironclad War Bear",FR:"Ours de Guerre Cuirassé"},rarity:"mythic",lvl:35,atk:950,def:920,hp:11000,
     bonus:{EN:"+18% All Troop Attack · +10% HP",FR:"+18% Attaque de Toutes les Troupes · +10% PV"},
     skills:[{n:{EN:"Apex Predator",FR:"Prédateur Suprême"},d:{EN:"Empowers the entire army's attack.",FR:"Renforce l'attaque de toute l'armée."}},
             {n:{EN:"Unbreakable",FR:"Indestructible"},d:{EN:"Ignores the first lethal blow each battle.",FR:"Ignore le premier coup fatal de chaque combat."}}]},
  ];

  const RARITY = {
    common:   {v:"--r-common",   EN:"Common",   FR:"Commun"},
    rare:     {v:"--r-rare",     EN:"Rare",     FR:"Rare"},
    epic:     {v:"--r-epic",     EN:"Epic",     FR:"Épique"},
    legendary:{v:"--r-legendary",EN:"Legendary",FR:"Légendaire"},
    mythic:   {v:"--r-mythic",   EN:"Mythic",   FR:"Mythique"},
  };

  /* i18n statique (clés = attributs data-i18n du HTML) */
  const i18n = {
    FR:{collection:"Collection",attributes:"Caractéristiques",armyBonus:"Bonus d'Armée",skills:"Compétences",
        hint:"Molette / flèches pour avancer",levelWord:"Niveau",atk:"Attaque",def:"Défense",hp:"Vie"},
    EN:{collection:"Collection",attributes:"Attributes",armyBonus:"Army Bonus",skills:"Skills",
        hint:"Scroll / arrows to advance",levelWord:"Level",atk:"Attack",def:"Defense",hp:"Health"},
  };

  /* --------------------------------------------------------
     ÉTAT + réglages (à ajuster librement)
     -------------------------------------------------------- */
  let idx = 0, locked = false, transitionDone = true, settleTimer = null;
  const COOLDOWN = 130;              // ms d'apaisement (absorbe l'inertie trackpad)
  const EXIT_MS = 360, ENTER_MS = 540;
  const EASE = "cubic-bezier(.22,.61,.36,1)";
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // "Profondeur" simulée par l'échelle : loin (horizon) ↔ repos ↔ près (passe devant la caméra)
  const DEPTH = {
    far:  {t:"scale(.5) translateY(-6%)",  o:0, f:"blur(3px)"},
    rest: {t:"scale(1) translateY(0)",     o:1, f:"blur(0px)"},
    near: {t:"scale(1.6) translateY(20%)", o:0, f:"blur(2px)"},
  };

  /* Refs DOM (remplies au DOMContentLoaded) */
  let petMain, petHolder, petImg, petPanel, rungs,
      petBadge, petBadgeLabel, petName, petLevel, petStats, petBonus, petSkills,
      petList, progress, cIdx, cTot;

  /* --------------------------------------------------------
     HELPERS
     -------------------------------------------------------- */
  const $ = s => document.querySelector(s);
  const L = () => (window.GlobalLang ? GlobalLang.get() : "FR");
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fmt = n => n.toLocaleString(L() === "FR" ? "fr-FR" : "en-US");
  const imgSrc = p => `img/pets/${slug(p.name.EN)}.webp`;

  // Fallback si une image manque (rarement utilisé, toutes présentes)
  function fallbackSVG(p){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
      <circle cx='120' cy='110' r='90' fill='none' stroke='#f5b840' stroke-opacity='.3' stroke-width='2'/>
      <text x='120' y='120' text-anchor='middle' font-family='Segoe UI,sans-serif' font-size='16' fill='#f5b840'>${p.name[L()]}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* --------------------------------------------------------
     RENDU
     -------------------------------------------------------- */
  function renderStage(){
    const p = PETS[idx], r = RARITY[p.rarity], lang = L(), S = i18n[lang];

    petImg.onerror = () => { petImg.onerror = null; petImg.src = fallbackSVG(p); };
    petImg.src = imgSrc(p);
    petImg.alt = p.name[lang];

    petBadge.style.setProperty("--rc", `var(${r.v})`);
    petBadgeLabel.textContent = r[lang];

    petName.textContent = p.name[lang];
    petLevel.innerHTML = `${S.levelWord} <b>${p.lvl}</b>`;

    petStats.innerHTML =
      `<div class="stat atk"><div class="lbl">${S.atk}</div><div class="val">${fmt(p.atk)}</div></div>` +
      `<div class="stat def"><div class="lbl">${S.def}</div><div class="val">${fmt(p.def)}</div></div>` +
      `<div class="stat hp"><div class="lbl">${S.hp}</div><div class="val">${fmt(p.hp)}</div></div>`;

    petBonus.textContent = p.bonus[lang];

    const skIco = `<svg viewBox="0 0 24 24"><path d="m12 3 1.9 5.8H20l-4.9 3.6L17 18l-5-3.7L7 18l1.9-5.6L4 8.8h6.1z"/></svg>`;
    petSkills.innerHTML = p.skills.map(s =>
      `<div class="pet-skill"><div class="ico">${skIco}</div>` +
      `<div><div class="sk-nm">${s.n[lang]}</div><div class="sk-ds">${s.d[lang]}</div></div></div>`).join("");

    cIdx.textContent = idx + 1;
    updateActive();
  }

  function renderSidebar(){
    const lang = L();
    petList.innerHTML = PETS.map((p, i) =>
      `<button class="pet-list-item" data-i="${i}" style="--rc:var(${RARITY[p.rarity].v})">` +
      `<span class="dot"></span><span class="nm">${p.name[lang]}</span><span class="lv">${p.lvl}</span></button>`).join("");
    petList.querySelectorAll(".pet-list-item").forEach(b =>
      b.addEventListener("click", () => navigate(+b.dataset.i)));
    updateActive();
  }

  function buildProgress(){
    cTot.textContent = PETS.length;
    progress.innerHTML = PETS.map((_, i) =>
      `<button class="pp-dot" data-i="${i}" aria-label="Familier ${i + 1}"></button>`).join("");
    progress.querySelectorAll(".pp-dot").forEach(d =>
      d.addEventListener("click", () => navigate(+d.dataset.i)));
  }

  function updateActive(){
    petList.querySelectorAll(".pet-list-item").forEach((b, i) => b.classList.toggle("active", i === idx));
    progress.querySelectorAll(".pp-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /* --------------------------------------------------------
     TRANSITION "avancer sur le chemin" (Web Animations API)
     -------------------------------------------------------- */
  async function anim(el, frames, dur, delay){
    const a = el.animate(frames, { duration:dur, delay:delay || 0, easing:EASE, fill:"both" });
    await a.finished; a.commitStyles(); a.cancel();
  }

  // Les "barreaux" du sol filent vers l'avant (une période = seamless)
  function rush(dir){
    if (REDUCE) return;
    rungs.animate(
      [{ transform:"translateY(0)" }, { transform:`translateY(${dir > 0 ? 64 : -64}px)` }],
      { duration:EXIT_MS + ENTER_MS, easing:"cubic-bezier(.16,.8,.3,1)" });
  }

  async function transition(dir){
    if (REDUCE){
      await anim(petPanel, [{ opacity:1 }, { opacity:0 }], 120, 0);
      renderStage(); rush(dir);
      petPanel.style.opacity = "";
      petPanel.animate([{ opacity:0 }, { opacity:1 }], { duration:120 });
      return;
    }
    const exitTo    = dir > 0 ? DEPTH.near : DEPTH.far;   // avancer → passe devant ; reculer → recule à l'horizon
    const enterFrom = dir > 0 ? DEPTH.far  : DEPTH.near;

    rush(dir);
    // SORTIE
    await Promise.all([
      anim(petHolder,
        [{ transform:DEPTH.rest.t, opacity:1, filter:DEPTH.rest.f }, { transform:exitTo.t, opacity:0, filter:exitTo.f }],
        EXIT_MS, 0),
      anim(petPanel,
        [{ transform:"translateY(0)", opacity:1 }, { transform:`translateY(${dir > 0 ? 18 : -18}px)`, opacity:0 }],
        EXIT_MS - 40, 0),
    ]);

    renderStage();

    // ENTRÉE
    await Promise.all([
      anim(petHolder,
        [{ transform:enterFrom.t, opacity:0, filter:enterFrom.f }, { transform:DEPTH.rest.t, opacity:1, filter:DEPTH.rest.f }],
        ENTER_MS, 0),
      anim(petPanel,
        [{ transform:`translateY(${dir > 0 ? -18 : 18}px)`, opacity:0 }, { transform:"translateY(0)", opacity:1 }],
        ENTER_MS, 70),
    ]);

    // Nettoie l'inline → la lévitation idle (sur l'<img> enfant) reprend
    petHolder.style.transform = ""; petHolder.style.opacity = ""; petHolder.style.filter = "";
    petPanel.style.transform  = ""; petPanel.style.opacity  = "";
  }

  /* --------------------------------------------------------
     NAVIGATION
     -------------------------------------------------------- */
  function navigate(target){
    if (locked || target === idx || target < 0 || target >= PETS.length) return;
    const dir = target > idx ? 1 : -1;
    idx = target;
    locked = true; transitionDone = false;
    transition(dir).then(() => {
      transitionDone = true;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(release, COOLDOWN);
    });
  }
  function step(dir){ navigate(idx + dir); }
  function release(){ if (transitionDone) locked = false; else settleTimer = setTimeout(release, COOLDOWN); }

  // Rebond en butée (premier / dernier)
  let bouncing = false;
  function rubberBand(dir){
    if (bouncing || REDUCE) return; bouncing = true;
    petHolder.animate(
      [{ transform:"scale(1) translateY(0)" }, { transform:`scale(1) translateY(${dir > 0 ? 3 : -3}%)` }, { transform:"scale(1) translateY(0)" }],
      { duration:280, easing:"ease-out" }).finished.then(() => bouncing = false);
  }

  /* --------------------------------------------------------
     ÉCOUTEURS
     -------------------------------------------------------- */
  function attachEvents(){
    // Molette : preventDefault + verrou + apaisement (1 familier / geste)
    petMain.addEventListener("wheel", (e) => {
      e.preventDefault();
      clearTimeout(settleTimer);
      if (locked){ settleTimer = setTimeout(release, COOLDOWN); return; } // absorbe l'inertie
      if (Math.abs(e.deltaY) < 4) return;
      const dir = e.deltaY > 0 ? 1 : -1, t = idx + dir;
      (t < 0 || t >= PETS.length) ? rubberBand(dir) : navigate(t);
    }, { passive:false });

    // Clavier
    petMain.addEventListener("keydown", (e) => {
      if (["ArrowDown","PageDown"," "].includes(e.key)){ e.preventDefault(); step(1); }
      else if (["ArrowUp","PageUp"].includes(e.key)){ e.preventDefault(); step(-1); }
      else if (e.key === "Home"){ e.preventDefault(); navigate(0); }
      else if (e.key === "End"){ e.preventDefault(); navigate(PETS.length - 1); }
    });

    // Tactile (swipe vertical)
    let touchY = null;
    petMain.addEventListener("touchstart", e => { touchY = e.touches[0].clientY; }, { passive:true });
    petMain.addEventListener("touchend", e => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45){ const dir = dy > 0 ? 1 : -1, t = idx + dir;
        (t < 0 || t >= PETS.length) ? rubberBand(dir) : navigate(t); }
      touchY = null;
    }, { passive:true });
  }

  /* i18n : applique les libellés + re-render dans la langue courante */
  function applyLang(){
    const lang = L();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(i18n[lang]);
    else document.querySelectorAll("[data-i18n]").forEach(e => {
      const k = e.getAttribute("data-i18n"); if (i18n[lang][k] != null) e.textContent = i18n[lang][k];
    });
    renderSidebar(); renderStage();
  }
  window.addEventListener("langChanged", applyLang);

  /* --------------------------------------------------------
     INIT
     -------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    petMain=$("#petMain"); petHolder=$("#petHolder"); petImg=$("#petImg"); petPanel=$("#petPanel");
    rungs=$("#rungs"); petBadge=$("#petBadge"); petBadgeLabel=$("#petBadgeLabel");
    petName=$("#petName"); petLevel=$("#petLevel"); petStats=$("#petStats"); petBonus=$("#petBonus");
    petSkills=$("#petSkills"); petList=$("#petList"); progress=$("#progress");
    cIdx=$("#cIdx"); cTot=$("#cTot");

    buildProgress();
    applyLang();          // rend sidebar + scène dans la langue courante
    petMain.focus();
  });
})();
