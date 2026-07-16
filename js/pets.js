/* ============================================================
   js/pets.js — Promenade VERTICALE sur le sentier
   On descend le chemin (molette/flèches) ; les familiers
   montent à notre rencontre puis passent derrière. Le décor
   (champs, grain, pointillés, traces de pas) défile en Y.
   Données : fetch('data/pets_db.json').
   Carte : niveau + avancement par cap -> palier, X du skill, coûts.

   Modèle (miroir des Masters) : 2 statuts indépendants.
   - Niveau (1..maxLevel).
   - Avancement par cap (10,20,..,maxLevel), coûte manuel/potion/médaille.
   Un cap sous le niveau = forcément fait ; au-dessus = impossible ;
   pile au niveau = choix (toggle). Palier skill = nb d'avancements faits.
   ============================================================ */
(function () {
  "use strict";

  /* -------- État données -------- */
  let PETS = [];
  const LS_KEY = (window.STORAGE_KEYS && STORAGE_KEYS.pets) || "pets_levels";
  let DATA = loadData();      // { [petId]: { lvl:Number, adv:{ [cap]:true } } }

  function loadData(){
    const raw = window.safeParse
      ? safeParse(LS_KEY, {})
      : (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch(e){ return {}; } })();
    // Migration : ancien format { petId: number } -> { petId: {lvl, adv} }
    let changed = false;
    for (const id in raw){
      if (typeof raw[id] === "number"){ raw[id] = { lvl: raw[id], adv: {} }; changed = true; }
      else if (raw[id] && typeof raw[id] === "object"){ if (!raw[id].adv){ raw[id].adv = {}; changed = true; } }
    }
    if (changed) try { localStorage.setItem(LS_KEY, JSON.stringify(raw)); } catch(e){}
    return raw;
  }
  function saveData(){ try { localStorage.setItem(LS_KEY, JSON.stringify(DATA)); } catch(e){} }

  const i18n = {
    FR:{ collection:"Collection", genWord:"Génération", yourLevel:"Ton niveau", levelWord:"Niveau",
         tierWord:"Palier", skill:"Compétence", progression:"Progression",
         nextLevel:"Prochain niveau", nextCap:"Prochain cap", levelsRange:"niv.",
         maxReached:"Niveau maximum atteint", readyAdvance:"Prêt à avancer",
         advance:"Avancement", advDone:"Avancement effectué",
         skillLocked:"Compétence verrouillée — débloquée au 1er avancement (niv. 10)",
         matFood:"Nourriture", matManual:"Manuel", matPotion:"Potion", matMedallion:"Médaille",
         hint:"Molette pour descendre" },
    EN:{ collection:"Collection", genWord:"Generation", yourLevel:"Your level", levelWord:"Level",
         tierWord:"Tier", skill:"Skill", progression:"Progression",
         nextLevel:"Next level", nextCap:"Next cap", levelsRange:"lvl",
         maxReached:"Max level reached", readyAdvance:"Ready to advance",
         advance:"Advancement", advDone:"Advancement done",
         skillLocked:"Skill locked — unlocks at the 1st advancement (lvl 10)",
         matFood:"Pet Food", matManual:"Manual", matPotion:"Potion", matMedallion:"Medallion",
         hint:"Scroll to descend" },
  };

  /* -------- Réglages promenade -------- */
  const SPACING = 500, WALK_MS = 720, COOLDOWN = 130;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LAYER_RATES = { field:0.9, trail:1.0 };

  let station = 0, worldY = 0, startY = 0, targetY = 0, startT = 0, dur = WALK_MS;
  let walking = false, locked = false, swapped = false, raf = 0, settleTimer = null;

  let petMain, scene, animalsLayer, animalEls = [], markerEls = [], texLayers = [],
      info, petBadge, petBadgeLabel, petName, petTier, petLevelInput, lvlMinus, lvlPlus,
      petLevelMax, petStars, petAdv, petSkillMain, petSkillLock, petSkillImg, petSkillName,
      petSkillDesc, petSkillEffects, petCost, petList, progress, cIdx, cTot;

  /* -------- Helpers -------- */
  const $ = s => document.querySelector(s);
  const L = () => (window.GlobalLang ? GlobalLang.get() : "FR");
  const fmt = n => Number(n).toLocaleString(L() === "FR" ? "fr-FR" : "en-US");
  const clamp = (v,a,b) => Math.min(Math.max(v,a),b);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const imgSrc = p => `img/pets/${p.id}.webp`;
  const skillSrc = p => `img/pets/skills/${p.id}.webp`;

  const tiersOf = p => (p.skill.effects[0] ? p.skill.effects[0].values.length : 0);
  // caps aux multiples de 10, jusqu'à maxLevel inclus
  const capsOf = p => { const c = []; for (let g = 10; g <= p.maxLevel; g += 10) c.push(g); return c; };
  // coût nourriture pour passer du niveau (m-1) au niveau m : petFood[m-2]
  const foodTo = (p, m) => p.petFood[m-2];

  // entrée sûre d'un pet (structure garantie, sans forcer le niveau)
  function entry(p){
    let e = DATA[p.id];
    if (!e || typeof e !== "object"){ e = { lvl: 1, adv: {} }; DATA[p.id] = e; }
    if (!e.adv) e.adv = {};
    return e;
  }
  // aligne les avancements sur le niveau : > niveau -> forcé ; < niveau -> impossible ; == niveau -> choix
  function normalizeAdv(p, lvl, adv){
    for (const g of capsOf(p)){
      if (lvl > g) adv[g] = true;
      else if (lvl < g) delete adv[g];
    }
    return adv;
  }
  // palier = nb d'avancements faits
  function tierOf(p, e){ let t = 0; for (const g of capsOf(p)) if (e.adv[g]) t++; return t; }
  // fixe le niveau (clamp) puis réaligne les avancements
  function setLevel(p, v){
    const e = entry(p);
    e.lvl = clamp(v, 1, p.maxLevel);
    normalizeAdv(p, e.lvl, e.adv);
    saveData();
    return e.lvl;
  }

  function fallbackSVG(p){
    return "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><circle cx='120' cy='110' r='88' fill='none' stroke='#6f9152' stroke-width='2'/><text x='120' y='120' text-anchor='middle' font-family='sans-serif' font-size='16' fill='#4a6b35'>${p.name[L()]}</text></svg>`);
  }
  const starSVG = "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='m12 3 1.9 5.8H20l-4.9 3.6L17 18l-5-3.7L7 18l1.9-5.6L4 8.8h6.1z' fill='none' stroke='#5a7a3a' stroke-width='2'/></svg>`);

  // remplace X / X% (dans l'ordre) par la valeur du palier courant de chaque effet
  function subX(text, effs, tier){
    let k = 0;
    return text.replace(/X%?/g, () => { const e = effs[k++]; return e ? (e.values[tier-1] ?? "X") : "X"; });
  }

  /* -------- Construction promenade -------- */
  function buildAnimals(){
    animalsLayer.innerHTML = PETS.map((p, i) => {
      const side = i % 2 === 0 ? "left" : "right";
      const top = `calc(50% + ${i * SPACING}px)`;
      return `<div class="animal ${side}" data-i="${i}" style="top:${top}"><img loading="lazy" alt=""><div class="sh"></div></div>` +
             `<div class="marker" data-i="${i}" style="top:${top}">${i + 1}</div>`;
    }).join("");
    animalEls = Array.from(animalsLayer.querySelectorAll(".animal"));
    markerEls = Array.from(animalsLayer.querySelectorAll(".marker"));
    animalEls.forEach((a, i) => {
      const img = a.querySelector("img"), p = PETS[i];
      img.onerror = () => { img.onerror = null; img.src = fallbackSVG(p); };
      img.src = imgSrc(p);
      a.addEventListener("click", () => go(i));
    });
    markerEls.forEach((m, i) => m.addEventListener("click", () => go(i)));
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
      `<button class="pet-list-item" data-i="${i}" style="--rc:var(--gen-${p.generation})">` +
      `<span class="dot"></span><span class="nm">${p.name[lang]}</span><span class="lv">G${p.generation}</span></button>`).join("");
    petList.querySelectorAll(".pet-list-item").forEach(b => b.addEventListener("click", () => go(+b.dataset.i)));
    updateActive();
  }

  /* -------- Carte info -------- */
  function renderInfo(i){
    const p = PETS[i], lang = L(), S = i18n[lang];
    petBadge.style.setProperty("--rc", `var(--gen-${p.generation})`);
    petBadgeLabel.textContent = `${S.genWord} ${p.generation}`;
    petName.textContent = p.name[lang];

    // niveau (sauvegardé ou 1) — clamp + réaligne les avancements
    const lvl = setLevel(p, entry(p).lvl ?? 1);
    petLevelInput.value = lvl;
    petLevelInput.min = 1; petLevelInput.max = p.maxLevel;
    petLevelMax.textContent = `/ ${p.maxLevel}`;

    // skill (statique)
    petSkillName.textContent = p.skill.name[lang];
    petSkillImg.onerror = () => { petSkillImg.onerror = null; petSkillImg.src = starSVG; };
    petSkillImg.src = skillSrc(p);

    updateDerived(p);
    cIdx.textContent = i + 1;
    setCardSide(i);
  }

  // parties dynamiques (palier, avancement, X, effets, coûts) — sans reconstruire l'input
  function updateDerived(p){
    const lang = L(), S = i18n[lang], T = tiersOf(p);
    const e = entry(p);
    e.lvl = clamp(e.lvl ?? 1, 1, p.maxLevel);
    normalizeAdv(p, e.lvl, e.adv);
    const lvl = e.lvl, tier = tierOf(p, e), atCap = (lvl % 10 === 0);

    petTier.textContent = `${S.tierWord} ${tier}/${T}`;
    petStars.innerHTML = Array.from({length:T}, (_,k) => `<span class="pl-star${k < tier ? " on" : ""}"></span>`).join("");

    // Toggle d'avancement : uniquement quand on est pile sur un cap
    renderAdvToggle(p, e, lvl, atCap, S);

    // Compétence : verrouillée tant qu'aucun avancement (palier 0)
    petSkillMain.classList.toggle("locked", tier === 0);
    petSkillLock.hidden = tier !== 0;
    petSkillLock.textContent = S.skillLocked;
    petSkillDesc.textContent = subX(p.skill.desc[lang], p.skill.effects, tier);

    petSkillEffects.innerHTML = p.skill.effects.map(ef => {
      const pips = ef.values.map((v, idx) => `<span class="pip${idx === tier-1 ? " on" : ""}">${v}</span>`).join("");
      return `<div class="eff"><div class="eff-label">${ef.label[lang]}</div><div class="pips">${pips}</div></div>`;
    }).join("");

    petCost.innerHTML = costHTML(p, e, S);
  }

  function renderAdvToggle(p, e, lvl, atCap, S){
    if (!petAdv) return;
    if (!atCap){ petAdv.hidden = true; petAdv.innerHTML = ""; return; }
    const done = !!e.adv[lvl], unlockTier = lvl / 10;
    petAdv.hidden = false;
    petAdv.innerHTML =
      `<label class="pl-adv-pill${done ? " on" : ""}">` +
      `<input type="checkbox" ${done ? "checked" : ""}>` +
      `<span class="pl-adv-txt">${S.advDone}</span>` +
      `<span class="pl-adv-tier">${S.tierWord} ${unlockTier}</span>` +
      `</label>`;
  }
  function toggleAdv(p){
    const e = entry(p), lvl = clamp(e.lvl ?? 1, 1, p.maxLevel);
    if (lvl % 10 !== 0) return;              // avancement seulement à un cap
    if (e.adv[lvl]) delete e.adv[lvl]; else e.adv[lvl] = true;
    saveData();
    updateDerived(p);
  }

  function matChip(type, n, S){
    const key = { food:"matFood", manual:"matManual", potion:"matPotion", medallion:"matMedallion" }[type];
    return `<span class="mat mat-${type}"><span class="mat-l">${S[key]}</span><b>${fmt(n)}</b></span>`;
  }
  function advMats(a, S){
    if (!a) return "";
    const mats = [];
    if (a.growthManual)       mats.push(matChip("manual", a.growthManual, S));
    if (a.nutrientPotion)     mats.push(matChip("potion", a.nutrientPotion, S));
    if (a.promotionMedallion) mats.push(matChip("medallion", a.promotionMedallion, S));
    return mats.join("");
  }

  function costHTML(p, e, S){
    const lvl = e.lvl, atCap = (lvl % 10 === 0);
    const advPending = atCap && !e.adv[lvl];      // pile sur un cap, avancement pas encore fait
    const rows = [];

    // 1) Avancement en attente au cap courant -> action immédiate (débloque le palier lvl/10)
    if (advPending){
      const mats = advMats(p.advancements[lvl/10 - 1], S);
      rows.push(
        `<div class="cost-row cost-adv"><span class="cost-lbl">${S.advance} <b>${S.tierWord} ${lvl/10}</b></span>` +
        `<span class="cost-range ready">${S.readyAdvance}</span></div>`
      );
      if (mats) rows.push(`<div class="cost-mats">${mats}</div>`);
    }

    // 2) Montée de niveau vers le prochain cap (si non bloqué par un avancement en attente et pas au max)
    if (!advPending && lvl < p.maxLevel){
      const nl = lvl + 1, nlCost = foodTo(p, nl);
      const cap = Math.min((Math.floor(lvl/10) + 1) * 10, p.maxLevel);
      let cumul = 0; for (let m = lvl + 1; m <= cap; m++) cumul += foodTo(p, m);
      rows.push(`<div class="cost-row"><span class="cost-lbl">${S.nextLevel} <b>${nl}</b></span>${matChip("food", nlCost, S)}</div>`);
      rows.push(
        `<div class="cost-row"><span class="cost-lbl">${S.nextCap} <b>${cap}</b></span>` +
        `<span class="cost-capval">${matChip("food", cumul, S)}<span class="cost-range">${S.levelsRange} ${lvl+1}–${cap}</span></span></div>`
      );
      const mats = advMats(p.advancements[cap/10 - 1], S);
      if (mats) rows.push(`<div class="cost-mats">${mats}</div>`);
    }

    // 3) Tout est fait : niveau max ET dernier avancement fait
    if (!rows.length) return `<div class="maxed">${S.maxReached} (${p.maxLevel})</div>`;
    return rows.join("");
  }

  function setCardSide(i){
    const onRight = i % 2 === 0;
    info.classList.toggle("on-right", onRight);
    info.classList.toggle("on-left", !onRight);
  }
  function updateActive(){
    petList.querySelectorAll(".pet-list-item").forEach((b, i) => b.classList.toggle("active", i === station));
    progress.querySelectorAll(".pp-dot").forEach((d, i) => d.classList.toggle("active", i === station));
  }

  /* -------- Niveau : saisie -------- */
  function onLevelInput(){
    const p = PETS[station];
    let v = parseInt(petLevelInput.value, 10);
    if (isNaN(v)) return;                 // laisse taper (clamp au blur)
    setLevel(p, v);
    updateDerived(p);
  }
  function onLevelCommit(){
    const p = PETS[station];
    let v = parseInt(petLevelInput.value, 10);
    if (isNaN(v)) v = 1;
    petLevelInput.value = setLevel(p, v);
    updateDerived(p);
  }
  function stepLevel(d){
    const p = PETS[station];
    petLevelInput.value = setLevel(p, (entry(p).lvl ?? 1) + d);
    updateDerived(p);
  }

  /* -------- Défilement + profondeur -------- */
  function applyParallax(t){
    for (const l of texLayers) l.el.style.backgroundPositionY = (-worldY * l.rate) + "px";
    animalsLayer.style.transform = `translateY(${-worldY}px)`;
    for (let i = 0; i < animalEls.length; i++){
      const d = Math.abs(i * SPACING - worldY);
      const s = Math.max(0.68, 1 - (d / SPACING) * 0.16);
      const o = Math.max(0.12, 1 - (d / SPACING) * 0.55);
      const a = animalEls[i];
      a.style.transform = `translateY(-50%) scale(${s.toFixed(3)})`;
      a.style.opacity = o.toFixed(3);
      a.style.zIndex = String(1000 - Math.round(d));
      const m = markerEls[i];
      m.style.transform = `translate(-50%, -50%) scale(${Math.max(0.75, s).toFixed(3)})`;
      m.style.opacity = Math.max(0.08, 1 - (d / SPACING) * 0.7).toFixed(3);
      m.style.zIndex = String(1000 - Math.round(d));
    }
    const sway = (t == null || REDUCE) ? 0 : Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI) * 4;
    scene.style.transform = `translateX(${sway.toFixed(2)}px)`;
  }

  /* -------- Marche vers un familier -------- */
  function go(target){
    if (locked || target < 0 || target >= PETS.length || target === station) return;
    const delta = Math.abs(target - station);
    station = target;
    locked = true; walking = true; swapped = false;
    startY = worldY; targetY = station * SPACING; startT = performance.now();
    dur = REDUCE ? 1 : WALK_MS * Math.min(2.2, Math.max(1, Math.sqrt(delta)));
    updateActive();
    info.style.opacity = "0";
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick(now){
    let t = Math.min((now - startT) / dur, 1);
    worldY = startY + (targetY - startY) * easeInOut(t);
    applyParallax(t);
    if (!swapped && t >= 0.5){ swapped = true; renderInfo(station); info.style.opacity = "1"; }
    if (t < 1){ raf = requestAnimationFrame(tick); }
    else { worldY = targetY; applyParallax(null); walking = false;
           clearTimeout(settleTimer); settleTimer = setTimeout(release, COOLDOWN); }
  }
  function release(){ if (!walking) locked = false; else settleTimer = setTimeout(release, COOLDOWN); }

  function rubberBand(dir){
    if (REDUCE) return;
    scene.animate([{ transform:"translateY(0)" }, { transform:`translateY(${dir>0?-14:14}px)` }, { transform:"translateY(0)" }],
      { duration:260, easing:"ease-out" });
  }

  /* -------- Écouteurs -------- */
  function attachEvents(){
    petMain.addEventListener("wheel", (e) => {
      e.preventDefault();
      clearTimeout(settleTimer);
      if (locked){ settleTimer = setTimeout(release, COOLDOWN); return; }
      if (Math.abs(e.deltaY) < 4) return;
      const dir = e.deltaY > 0 ? 1 : -1, t = station + dir;
      (t < 0 || t >= PETS.length) ? rubberBand(dir) : go(t);
    }, { passive:false });

    // Laisse la carte défiler nativement quand son contenu dépasse (sinon molette = navigation)
    info.addEventListener("wheel", (e) => {
      const c = info.querySelector(".card");
      if (c && c.scrollHeight > c.clientHeight + 1) e.stopPropagation();
    }, { passive:true });

    petMain.addEventListener("keydown", (e) => {
      if (e.target === petLevelInput) return;   // ne pas naviguer en éditant le niveau
      if (["ArrowDown","ArrowRight","PageDown"," "].includes(e.key)){ e.preventDefault(); go(station + 1); }
      else if (["ArrowUp","ArrowLeft","PageUp"].includes(e.key)){ e.preventDefault(); go(station - 1); }
      else if (e.key === "Home"){ e.preventDefault(); go(0); }
      else if (e.key === "End"){ e.preventDefault(); go(PETS.length - 1); }
    });

    let sy = null;
    petMain.addEventListener("touchstart", e => { sy = e.target.closest(".pet-info") ? null : e.touches[0].clientY; }, { passive:true });
    petMain.addEventListener("touchend", e => {
      if (sy === null) return;
      const dy = sy - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45){ const dir = dy > 0 ? 1 : -1, t = station + dir;
        (t < 0 || t >= PETS.length) ? rubberBand(dir) : go(t); }
      sy = null;
    }, { passive:true });

    window.addEventListener("resize", () => applyParallax(walking ? 0.5 : null));

    // Niveau
    petLevelInput.addEventListener("input", onLevelInput);
    petLevelInput.addEventListener("change", onLevelCommit);
    petLevelInput.addEventListener("blur", onLevelCommit);
    petLevelInput.addEventListener("wheel", e => e.stopPropagation(), { passive:true });
    lvlMinus.addEventListener("click", () => stepLevel(-1));
    lvlPlus.addEventListener("click", () => stepLevel(+1));

    // Avancement (délégation : le contenu de #petAdv est recréé à chaque rendu)
    petAdv.addEventListener("change", (e) => {
      if (e.target && e.target.matches('input[type="checkbox"]')) toggleAdv(PETS[station]);
    });
  }

  /* -------- i18n -------- */
  function applyLang(){
    const lang = L();
    if (window.GlobalLang && GlobalLang.applyI18n) GlobalLang.applyI18n(i18n[lang]);
    else document.querySelectorAll("[data-i18n]").forEach(e => { const k = e.getAttribute("data-i18n"); if (i18n[lang][k] != null) e.textContent = i18n[lang][k]; });
    if (!PETS.length) return;
    refreshAlts(); renderSidebar(); renderInfo(station);
  }
  window.addEventListener("langChanged", applyLang);

  /* -------- INIT -------- */
  function boot(){
    petMain=$("#petMain"); scene=$("#scene"); animalsLayer=$("#animals");
    info=$("#petInfo"); petBadge=$("#petBadge"); petBadgeLabel=$("#petBadgeLabel"); petName=$("#petName");
    petTier=$("#petTier"); petLevelInput=$("#petLevelInput"); lvlMinus=$("#lvlMinus"); lvlPlus=$("#lvlPlus");
    petLevelMax=$("#petLevelMax"); petStars=$("#petStars"); petAdv=$("#petAdv");
    petSkillMain=$("#petSkillMain"); petSkillLock=$("#petSkillLock");
    petSkillImg=$("#petSkillImg"); petSkillName=$("#petSkillName"); petSkillDesc=$("#petSkillDesc"); petSkillEffects=$("#petSkillEffects");
    petCost=$("#petCost");
    petList=$("#petList"); progress=$("#progress"); cIdx=$("#cIdx"); cTot=$("#cTot");
    texLayers = Array.from(document.querySelectorAll("[data-rate]")).map(el => ({ el, rate:LAYER_RATES[el.dataset.rate] || 0 }));

    fetch("data/pets_db.json")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(db => {
        PETS = db.pets || [];
        buildAnimals();
        buildProgress();
        applyParallax(null);
        attachEvents();
        applyLang();
        petMain.focus();
      })
      .catch(err => {
        console.error("pets_db.json:", err);
        if (petCost) petCost.textContent = "Erreur de chargement de data/pets_db.json";
      });
  }
  document.addEventListener("DOMContentLoaded", boot);
})();