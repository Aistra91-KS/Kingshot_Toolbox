/* ============================================================
   js/pets.js — Promenade VERTICALE sur le sentier
   On descend le chemin (molette/flèches) ; les familiers
   montent à notre rencontre puis passent derrière. Le décor
   (champs, grain, pointillés, traces de pas) défile en Y.
   Données : fetch('data/pets_db.json').
   Carte : sélecteur de niveau → palier, X du skill, coûts.
   ============================================================ */
(function () {
  "use strict";

  /* -------- État données -------- */
  let PETS = [];
  const LS_KEY = "pets_levels";   // TODO: centraliser dans storage-keys.js plus tard
  let LEVELS = loadLevels();      // { [petId]: niveau }

  function loadLevels(){ try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch(e){ return {}; } }
  function saveLevels(){ try { localStorage.setItem(LS_KEY, JSON.stringify(LEVELS)); } catch(e){} }

  const i18n = {
    FR:{ collection:"Collection", genWord:"Génération", yourLevel:"Ton niveau", levelWord:"Niveau",
         tierWord:"Palier", skill:"Compétence", progression:"Progression",
         nextLevel:"Prochain niveau", nextCap:"Prochain cap", levelsRange:"niv.",
         maxReached:"Niveau maximum atteint", readyAdvance:"Prêt à avancer",
         matFood:"Nourriture", matManual:"Manuel", matPotion:"Potion", matMedallion:"Médaille",
         hint:"Molette pour descendre" },
    EN:{ collection:"Collection", genWord:"Generation", yourLevel:"Your level", levelWord:"Level",
         tierWord:"Tier", skill:"Skill", progression:"Progression",
         nextLevel:"Next level", nextCap:"Next cap", levelsRange:"lvl",
         maxReached:"Max level reached", readyAdvance:"Ready to advance",
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
      petLevelMax, petStars, petSkillImg, petSkillName, petSkillDesc, petSkillEffects, petCost,
      petList, progress, cIdx, cTot;

  /* -------- Helpers -------- */
  const $ = s => document.querySelector(s);
  const L = () => (window.GlobalLang ? GlobalLang.get() : "FR");
  const fmt = n => Number(n).toLocaleString(L() === "FR" ? "fr-FR" : "en-US");
  const clamp = (v,a,b) => Math.min(Math.max(v,a),b);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const imgSrc = p => `img/pets/${p.id}.webp`;
  const skillSrc = p => `img/pets/skills/${p.id}.webp`;

  const tiersOf = p => (p.skill.effects[0] ? p.skill.effects[0].values.length : 0);
  const tierAt = (lvl, T) => clamp(Math.ceil(lvl/10), 1, T);
  // caps aux multiples de 10 ; si on est pile sur un cap (<max) on peut avancer maintenant
  function capAt(lvl, max){ if (lvl % 10 === 0 && lvl < max) return lvl; return Math.min((Math.floor(lvl/10)+1)*10, max); }
  // coût nourriture pour passer du niveau (m-1) au niveau m : petFood[m-2]
  const foodTo = (p, m) => p.petFood[m-2];

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

    // niveau (sauvegardé ou 1)
    const lvl = clamp(LEVELS[p.id] ?? 1, 1, p.maxLevel);
    LEVELS[p.id] = lvl;
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

  // parties dynamiques (palier, X, effets, coûts) — sans reconstruire l'input
  function updateDerived(p){
    const lang = L(), S = i18n[lang], T = tiersOf(p);
    const lvl = clamp(LEVELS[p.id] ?? 1, 1, p.maxLevel);
    const tier = tierAt(lvl, T);

    petTier.textContent = `${S.tierWord} ${tier}/${T}`;
    petStars.innerHTML = Array.from({length:T}, (_,k) => `<span class="pl-star${k < tier ? " on" : ""}"></span>`).join("");

    petSkillDesc.textContent = subX(p.skill.desc[lang], p.skill.effects, tier);

    petSkillEffects.innerHTML = p.skill.effects.map(e => {
      const pips = e.values.map((v, idx) => `<span class="pip${idx === tier-1 ? " on" : ""}">${v}</span>`).join("");
      return `<div class="eff"><div class="eff-label">${e.label[lang]}</div><div class="pips">${pips}</div></div>`;
    }).join("");

    petCost.innerHTML = costHTML(p, lvl, S);
  }

  function matChip(type, n, S){
    const key = { food:"matFood", manual:"matManual", potion:"matPotion", medallion:"matMedallion" }[type];
    return `<span class="mat mat-${type}"><span class="mat-l">${S[key]}</span><b>${fmt(n)}</b></span>`;
  }

  function costHTML(p, lvl, S){
    if (lvl >= p.maxLevel) return `<div class="maxed">${S.maxReached} (${p.maxLevel})</div>`;
    const nl = lvl + 1, nlCost = foodTo(p, nl);
    const cap = capAt(lvl, p.maxLevel);
    let cumul = 0; for (let m = lvl + 1; m <= cap; m++) cumul += foodTo(p, m);
    const adv = p.advancements[cap/10 - 1];

    const rows = [];
    rows.push(`<div class="cost-row"><span class="cost-lbl">${S.nextLevel} <b>${nl}</b></span>${matChip("food", nlCost, S)}</div>`);

    const capVal = cumul > 0
      ? `${matChip("food", cumul, S)}<span class="cost-range">${S.levelsRange} ${lvl+1}–${cap}</span>`
      : `<span class="cost-range ready">${S.readyAdvance}</span>`;
    rows.push(`<div class="cost-row"><span class="cost-lbl">${S.nextCap} <b>${cap}</b></span><span class="cost-capval">${capVal}</span></div>`);

    if (adv){
      const mats = [];
      if (adv.growthManual)      mats.push(matChip("manual", adv.growthManual, S));
      if (adv.nutrientPotion)    mats.push(matChip("potion", adv.nutrientPotion, S));
      if (adv.promotionMedallion)mats.push(matChip("medallion", adv.promotionMedallion, S));
      if (mats.length) rows.push(`<div class="cost-mats">${mats.join("")}</div>`);
    }
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
    v = clamp(v, 1, p.maxLevel);
    LEVELS[p.id] = v; saveLevels();
    updateDerived(p);
  }
  function onLevelCommit(){
    const p = PETS[station];
    let v = parseInt(petLevelInput.value, 10);
    if (isNaN(v)) v = 1;
    v = clamp(v, 1, p.maxLevel);
    LEVELS[p.id] = v; saveLevels();
    petLevelInput.value = v;
    updateDerived(p);
  }
  function stepLevel(d){
    const p = PETS[station];
    const v = clamp((LEVELS[p.id] ?? 1) + d, 1, p.maxLevel);
    LEVELS[p.id] = v; saveLevels();
    petLevelInput.value = v;
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
    petLevelMax=$("#petLevelMax"); petStars=$("#petStars");
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
