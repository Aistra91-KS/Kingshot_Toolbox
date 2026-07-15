/* ============================================================
   js/pets.js — Promenade nature (parallax scroll-jacking)
   Le monde défile horizontalement ; la molette te fait
   "marcher" d'un familier au suivant. Multi-couches parallax
   + profondeur atmosphérique + léger balancement de marche.
   Données en dur (MVP) → prod : fetch('data/pets_db.json').
   i18n via GlobalLang + event 'langChanged'.
   ============================================================ */
(function () {
  "use strict";

  /* -------- DONNÉES (du + faible au + fort) -------- */
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
    common:{v:"--r-common",EN:"Common",FR:"Commun"}, rare:{v:"--r-rare",EN:"Rare",FR:"Rare"},
    epic:{v:"--r-epic",EN:"Epic",FR:"Épique"}, legendary:{v:"--r-legendary",EN:"Legendary",FR:"Légendaire"},
    mythic:{v:"--r-mythic",EN:"Mythic",FR:"Mythique"},
  };
  const i18n = {
    FR:{collection:"Collection",attributes:"Caractéristiques",armyBonus:"Bonus d'Armée",skills:"Compétences",
        hint:"Molette / flèches pour marcher",levelWord:"Niveau",atk:"Attaque",def:"Défense",hp:"Vie"},
    EN:{collection:"Collection",attributes:"Attributes",armyBonus:"Army Bonus",skills:"Skills",
        hint:"Scroll / arrows to walk",levelWord:"Level",atk:"Attack",def:"Defense",hp:"Health"},
  };

  /* -------- ÉTAT + réglages -------- */
  const SPACING = 640;          // distance "monde" entre 2 animaux (px)
  const WALK_MS = 780;          // durée d'un pas
  const COOLDOWN = 130;         // apaisement anti multi-scroll
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let station = 0, worldX = 0, startX = 0, targetX = 0, startT = 0, dur = WALK_MS;
  let walking = false, locked = false, swapped = false, raf = 0, settleTimer = null;

  const LAYER_RATES = { "hills-far":0.12, "hills-mid":0.22, "trees":0.42, "ground-tex":1.0, "grass-fg":1.55 };

  /* Refs */
  let petMain, scene, animalsLayer, animalEls = [], texLayers = [],
      info, petBadge, petBadgeLabel, petName, petLevel, petStats, petBonus, petSkills,
      petList, progress, cIdx, cTot;

  /* -------- Helpers -------- */
  const $ = s => document.querySelector(s);
  const L = () => (window.GlobalLang ? GlobalLang.get() : "FR");
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fmt = n => n.toLocaleString(L() === "FR" ? "fr-FR" : "en-US");
  const imgSrc = p => `img/pets/${slug(p.name.EN)}.webp`;
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const svgURL = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

  function fallbackSVG(p){
    return "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><circle cx='120' cy='110' r='88' fill='none' stroke='#f5b840' stroke-opacity='.3' stroke-width='2'/><text x='120' y='120' text-anchor='middle' font-family='sans-serif' font-size='16' fill='#f5b840'>${p.name[L()]}</text></svg>`);
  }

  /* -------- Décor SVG (collines / arbres / herbe) -------- */
  function setBackgrounds(){
    const hillFar  = `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='160'><path d='M0 160 V100 C90 60 180 60 250 92 C320 124 410 124 500 100 V160 Z' fill='#4a5d4a'/></svg>`;
    const hillMid  = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><path d='M0 200 V120 C110 72 230 72 300 112 C380 152 500 152 600 120 V200 Z' fill='#354a30'/></svg>`;
    let bumps = "M0 120 V95"; for (let x=0; x<360; x+=60) bumps += ` C${x+15} 70 ${x+45} 70 ${x+60} 95`;
    const trees = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='120'><path d='${bumps} V120 Z' fill='#20301a'/></svg>`;
    let spikes = "M0 70 V52"; for (let x=0; x<160; x+=18) spikes += ` L${x+7} 16 L${x+18} 52`;
    const grass = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='70'><path d='${spikes} V70 Z' fill='#16210f'/></svg>`;

    $(".hills-far").style.backgroundImage = svgURL(hillFar);
    $(".hills-mid").style.backgroundImage = svgURL(hillMid);
    $(".trees").style.backgroundImage     = svgURL(trees);
    $(".grass-fg").style.backgroundImage  = svgURL(grass);
    $(".hills-far").style.backgroundSize = "500px 100%";
    $(".hills-mid").style.backgroundSize = "600px 100%";
    $(".trees").style.backgroundSize     = "360px 100%";
    $(".grass-fg").style.backgroundSize  = "160px 100%";
  }

  /* -------- Construction -------- */
  function buildAnimals(){
    animalsLayer.innerHTML = PETS.map((p, i) =>
      `<div class="animal" data-i="${i}" style="left:calc(50% + ${i*SPACING}px)">` +
      `<img loading="lazy" alt=""><div class="sh"></div></div>`).join("");
    animalEls = Array.from(animalsLayer.querySelectorAll(".animal"));
    animalEls.forEach((a, i) => {
      const img = a.querySelector("img"), p = PETS[i];
      img.onerror = () => { img.onerror = null; img.src = fallbackSVG(p); };
      img.src = imgSrc(p);
      a.addEventListener("click", () => go(i));
    });
    refreshAlts();
  }
  function refreshAlts(){ animalEls.forEach((a, i) => a.querySelector("img").alt = PETS[i].name[L()]); }

  function buildProgress(){
    cTot.textContent = PETS.length;
    progress.innerHTML = PETS.map((_, i) => `<button class="pp-dot" data-i="${i}" aria-label="Familier ${i+1}"></button>`).join("");
    progress.querySelectorAll(".pp-dot").forEach(d => d.addEventListener("click", () => go(+d.dataset.i)));
  }
  function renderSidebar(){
    const lang = L();
    petList.innerHTML = PETS.map((p, i) =>
      `<button class="pet-list-item" data-i="${i}" style="--rc:var(${RARITY[p.rarity].v})">` +
      `<span class="dot"></span><span class="nm">${p.name[lang]}</span><span class="lv">${p.lvl}</span></button>`).join("");
    petList.querySelectorAll(".pet-list-item").forEach(b => b.addEventListener("click", () => go(+b.dataset.i)));
    updateActive();
  }
  function renderInfo(i){
    const p = PETS[i], r = RARITY[p.rarity], lang = L(), S = i18n[lang];
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
      `<div class="pet-skill"><div class="ico">${skIco}</div><div><div class="sk-nm">${s.n[lang]}</div><div class="sk-ds">${s.d[lang]}</div></div></div>`).join("");
    cIdx.textContent = i + 1;
  }
  function updateActive(){
    petList.querySelectorAll(".pet-list-item").forEach((b, i) => b.classList.toggle("active", i === station));
    progress.querySelectorAll(".pp-dot").forEach((d, i) => d.classList.toggle("active", i === station));
  }

  /* -------- Parallax (appelé à chaque frame) -------- */
  function applyParallax(t){
    for (const l of texLayers) l.el.style.backgroundPositionX = (-worldX * l.rate) + "px";
    animalsLayer.style.transform = `translateX(${-worldX}px)`;
    for (let i = 0; i < animalEls.length; i++){
      const d = Math.abs(i * SPACING - worldX);
      const s = Math.max(0.62, 1 - (d / SPACING) * 0.28);
      const o = Math.max(0.10, 1 - (d / SPACING) * 0.60);
      const a = animalEls[i];
      a.style.transform = `translateX(-50%) scale(${s.toFixed(3)})`;
      a.style.opacity = o.toFixed(3);
      a.style.zIndex = String(1000 - Math.round(d));
    }
    // balancement de marche (2 pas, amorti aux extrémités)
    const bob = (t == null || REDUCE) ? 0 : Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI) * 6;
    scene.style.transform = `translateY(${bob.toFixed(2)}px)`;
  }

  /* -------- Marche vers un familier -------- */
  function go(target){
    if (locked || target < 0 || target >= PETS.length || target === station) return;
    const delta = Math.abs(target - station);
    station = target;
    locked = true; walking = true; swapped = false;
    startX = worldX; targetX = station * SPACING; startT = performance.now();
    dur = REDUCE ? 1 : WALK_MS * Math.min(2.2, Math.max(1, Math.sqrt(delta)));
    updateActive();
    info.style.opacity = "0";
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick(now){
    let t = Math.min((now - startT) / dur, 1);
    worldX = startX + (targetX - startX) * easeInOut(t);
    applyParallax(t);
    if (!swapped && t >= 0.5){ swapped = true; renderInfo(station); info.style.opacity = "1"; }
    if (t < 1){ raf = requestAnimationFrame(tick); }
    else { worldX = targetX; applyParallax(null); walking = false;
           clearTimeout(settleTimer); settleTimer = setTimeout(release, COOLDOWN); }
  }
  function release(){ if (!walking) locked = false; else settleTimer = setTimeout(release, COOLDOWN); }

  function rubberBand(dir){
    if (REDUCE) return;
    scene.animate([{ transform:"translateX(0)" }, { transform:`translateX(${dir>0?-14:14}px)` }, { transform:"translateX(0)" }],
      { duration:260, easing:"ease-out" });
  }

  /* -------- Écouteurs (BRANCHÉS dans init — le bug précédent) -------- */
  function attachEvents(){
    petMain.addEventListener("wheel", (e) => {
      e.preventDefault();
      clearTimeout(settleTimer);
      if (locked){ settleTimer = setTimeout(release, COOLDOWN); return; }
      if (Math.abs(e.deltaY) < 4) return;
      const dir = e.deltaY > 0 ? 1 : -1, t = station + dir;
      (t < 0 || t >= PETS.length) ? rubberBand(dir) : go(t);
    }, { passive:false });

    petMain.addEventListener("keydown", (e) => {
      if (["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){ e.preventDefault(); go(station + 1); }
      else if (["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){ e.preventDefault(); go(station - 1); }
      else if (e.key === "Home"){ e.preventDefault(); go(0); }
      else if (e.key === "End"){ e.preventDefault(); go(PETS.length - 1); }
    });

    let sx = null;
    petMain.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive:true });
    petMain.addEventListener("touchend", e => {
      if (sx === null) return;
      const dx = sx - e.changedTouches[0].clientX; // swipe gauche = avancer
      if (Math.abs(dx) > 45){ const dir = dx > 0 ? 1 : -1, t = station + dir;
        (t < 0 || t >= PETS.length) ? rubberBand(dir) : go(t); }
      sx = null;
    }, { passive:true });

    window.addEventListener("resize", () => applyParallax(walking ? 0.5 : null));
  }

  /* -------- i18n -------- */
  function applyLang(){
    const lang = L();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(i18n[lang]);
    else document.querySelectorAll("[data-i18n]").forEach(e => { const k = e.getAttribute("data-i18n"); if (i18n[lang][k] != null) e.textContent = i18n[lang][k]; });
    refreshAlts(); renderSidebar(); renderInfo(station);
  }
  window.addEventListener("langChanged", applyLang);

  /* -------- INIT -------- */
  document.addEventListener("DOMContentLoaded", () => {
    petMain=$("#petMain"); scene=$("#scene"); animalsLayer=$("#animals");
    info=$("#petInfo"); petBadge=$("#petBadge"); petBadgeLabel=$("#petBadgeLabel");
    petName=$("#petName"); petLevel=$("#petLevel"); petStats=$("#petStats"); petBonus=$("#petBonus"); petSkills=$("#petSkills");
    petList=$("#petList"); progress=$("#progress"); cIdx=$("#cIdx"); cTot=$("#cTot");

    texLayers = Array.from(document.querySelectorAll("[data-rate]")).map(el => ({ el, rate:LAYER_RATES[el.dataset.rate] || 0 }));

    setBackgrounds();
    buildAnimals();
    buildProgress();
    applyParallax(null);   // positionne tout au départ
    attachEvents();        // <<< branche molette/clavier/swipe (correctif)
    applyLang();           // sidebar + panneau info dans la langue courante
    petMain.focus();
  });
})();
