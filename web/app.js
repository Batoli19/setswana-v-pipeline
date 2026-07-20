/* ============ V AI — voice carousel with animated, colour-shifting orbs ============ */
(() => {
  const audio = document.getElementById("heroVoice");
  const orb = document.getElementById("orb");
  const status = document.getElementById("orbStatus");
  const heroEl = document.getElementById("demo");
  const sectorEl = document.getElementById("sector");
  const dotsEl = document.getElementById("dots");

  /* ---- Each slide = one business voice with its own colour identity ---- */
  const SLIDES = [
    { sector: "banking",    word: "#8A5CF0", halo: [138, 92, 240],
      stops: ["#FCE0F0", "#EC77B3", "#B15CDA", "#8A5CF0", "#7A4DE0"] },
    { sector: "telecoms",   word: "#2FA84F", halo: [60, 190, 100],
      stops: ["#EAFBD6", "#A6E06B", "#5FC06B", "#2FA84F", "#1E8F45"] },
    { sector: "insurance",  word: "#F47A1F", halo: [244, 122, 31],
      stops: ["#FFEBD2", "#FFC078", "#FF9A3D", "#F47A1F", "#E06A0C"] },
    { sector: "government", word: "#2E6FD0", halo: [46, 111, 208],
      stops: ["#DBEEFF", "#86C2F5", "#4C98E8", "#2E6FD0", "#1E56B0"] },
  ];

  /* ---- Colour helpers ---- */
  const hexToRgb = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const rgb = (c) => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
  const rgba = (c, a) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---- A single animated orb bound to one canvas ---- */
  function makeOrb(canvas, useDPR, phase) {
    const dpr = useDPR ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const S = canvas.width;                 // internal px (square)
    canvas.width = S * dpr; canvas.height = S * dpr;
    const c = canvas.getContext("2d");
    c.scale(dpr, dpr);
    const seed = SLIDES[0];
    return {
      c, S, phase,
      CX: S / 2, CY: S / 2, R: S * 0.34,
      cur: seed.stops.map(hexToRgb), target: seed.stops.map(hexToRgb),
      halo: seed.halo.slice(), haloT: seed.halo.slice(),
    };
  }

  function setOrbSlide(o, slide, snap) {
    o.target = slide.stops.map(hexToRgb);
    o.haloT = slide.halo.slice();
    if (snap) { o.cur = o.target.map((x) => x.slice()); o.halo = o.haloT.slice(); }
  }

  function drawOrb(o, t, amp) {
    const { c, S, CX, CY, R } = o;
    // ease colours
    for (let i = 0; i < o.cur.length; i++)
      for (let k = 0; k < 3; k++) o.cur[i][k] = lerp(o.cur[i][k], o.target[i][k], 0.08);
    for (let k = 0; k < 3; k++) o.halo[k] = lerp(o.halo[k], o.haloT[k], 0.08);

    const tt = t + o.phase;
    c.clearRect(0, 0, S, S);

    // halo
    const halo = c.createRadialGradient(CX, CY, R * 0.6, CX, CY, R * (1.55 + amp));
    halo.addColorStop(0, rgba(o.halo, 0.22));
    halo.addColorStop(1, rgba(o.halo, 0));
    c.fillStyle = halo; c.fillRect(0, 0, S, S);

    // body
    c.save();
    blobPath(c, CX, CY, R, tt, amp);
    c.clip();
    const g = c.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.15, CX, CY, R * 1.25);
    g.addColorStop(0.0, rgb(o.cur[0]));
    g.addColorStop(0.34, rgb(o.cur[1]));
    g.addColorStop(0.64, rgb(o.cur[2]));
    g.addColorStop(0.88, rgb(o.cur[3]));
    g.addColorStop(1.0, rgb(o.cur[4]));
    c.fillStyle = g; c.fillRect(0, 0, S, S);

    const sx = CX + Math.cos(tt * 0.5) * R * 0.3, sy = CY + Math.sin(tt * 0.5) * R * 0.3;
    const sheen = c.createRadialGradient(sx, sy, 0, sx, sy, R * 0.9);
    sheen.addColorStop(0, "rgba(255,255,255,0.55)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.10)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen; c.fillRect(0, 0, S, S);
    c.restore();

    // rim
    c.save();
    blobPath(c, CX, CY, R, tt, amp);
    c.lineWidth = 2; c.strokeStyle = "rgba(255,255,255,0.35)"; c.stroke();
    c.restore();
  }

  function blobPath(c, CX, CY, R, t, amp) {
    const points = 88;
    c.beginPath();
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const wob = Math.sin(a * 3 + t * 0.9) * 0.045 + Math.sin(a * 5 - t * 0.6) * 0.03 + Math.sin(a * 2 + t * 1.4) * 0.035;
      const r = R * (1 + wob + amp * 0.18);
      const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.closePath();
  }

  // center + two peeking neighbours
  const center = makeOrb(document.getElementById("orbCanvas"), true, 0);
  const left = makeOrb(document.getElementById("peekPrev"), false, 1.7);
  const right = makeOrb(document.getElementById("peekNext"), false, 3.1);

  /* ---- Audio (center orb reacts; peeks breathe gently) ---- */
  let analyser = null, audioData = null, level = 0;
  function initAudioGraph() {
    if (analyser) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const actx = new AC();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      audioData = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser); analyser.connect(actx.destination);
      audio._actx = actx;
    } catch (e) { analyser = null; }
  }
  function sampleLevel() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(audioData);
    let s = 0; for (let i = 0; i < audioData.length; i++) s += audioData[i];
    return s / audioData.length / 255;
  }

  let t = 0;
  function frame() {
    t += 0.016;
    const tgt = analyser && !audio.paused ? sampleLevel() : 0;
    level += (tgt - level) * 0.12;
    const centerAmp = level + (audio.paused ? 0.03 : 0.05);
    const peekAmp = 0.03;

    drawOrb(center, t, centerAmp);
    drawOrb(left, t, peekAmp);
    drawOrb(right, t, peekAmp);

    // hero gradient underlay follows the centre bubble's live colours
    heroEl.style.setProperty("--g1", rgba(center.cur[1], 0.5));
    heroEl.style.setProperty("--g2", rgba(center.cur[3], 0.45));

    requestAnimationFrame(frame);
  }
  frame();

  /* ---- Carousel ---- */
  let idx = 0, userInteracted = false;
  SLIDES.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot-i" + (i === 0 ? " active" : "");
    b.setAttribute("aria-label", `Voice ${i + 1}`);
    b.addEventListener("click", () => { userInteracted = true; go(i); });
    dotsEl.appendChild(b);
  });

  function go(n) {
    idx = (n + SLIDES.length) % SLIDES.length;
    const s = SLIDES[idx];
    setOrbSlide(center, s, false);
    setOrbSlide(left, SLIDES[(idx - 1 + SLIDES.length) % SLIDES.length], false);
    setOrbSlide(right, SLIDES[(idx + 1) % SLIDES.length], false);
    sectorEl.textContent = s.sector;
    sectorEl.style.color = s.word;
    dotsEl.querySelectorAll(".dot-i").forEach((d, i) => d.classList.toggle("active", i === idx));
  }
  // seed neighbours immediately (so peeks aren't all banking)
  setOrbSlide(left, SLIDES[SLIDES.length - 1], true);
  setOrbSlide(right, SLIDES[1], true);

  document.getElementById("next").addEventListener("click", () => { userInteracted = true; go(idx + 1); });
  document.getElementById("prev").addEventListener("click", () => { userInteracted = true; go(idx - 1); });
  setInterval(() => { if (!userInteracted && audio.paused) go(idx + 1); }, 5000);

  /* ---- Tap orb to hear the voice ---- */
  orb.addEventListener("click", async () => {
    userInteracted = true;
    initAudioGraph();
    if (audio._actx && audio._actx.state === "suspended") { try { await audio._actx.resume(); } catch (_) {} }
    if (audio.paused) {
      try { await audio.play(); orb.classList.add("playing"); status.textContent = "V AI is speaking…"; }
      catch (e) { status.textContent = "Add a clip at web/assets/hero-voice.mp3 to play"; }
    } else {
      audio.pause(); audio.currentTime = 0;
      orb.classList.remove("playing"); status.textContent = "Tap the orb to listen";
    }
  });
  audio.addEventListener("ended", () => { orb.classList.remove("playing"); status.textContent = "Tap again to replay"; });

  /* ---- Nav: white/blur once scrolled ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll); onScroll();
})();
