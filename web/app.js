/* ============ V AI — voice carousel with a colour-shifting audio-reactive orb ============ */
(() => {
  const canvas = document.getElementById("orbCanvas");
  const orb = document.getElementById("orb");
  const status = document.getElementById("orbStatus");
  const audio = document.getElementById("heroVoice");
  const panel = document.getElementById("stagePanel");
  const sectorEl = document.getElementById("sector");
  const sectorDot = document.getElementById("sectorDot");
  const titleEl = document.getElementById("stageTitle");
  const dotsEl = document.getElementById("dots");
  const ctx = canvas.getContext("2d");

  /* ---- Each slide = one business voice with its own colour identity ---- */
  const SLIDES = [
    {
      sector: "banking", title: "Voice for banking", word: "#8A5CF0",
      stops: ["#FCE0F0", "#EC77B3", "#B15CDA", "#8A5CF0", "#7A4DE0"],
      halo: [138, 92, 240],
      panel: ["#FDE8F3", "#F6ECFF"],
    },
    {
      sector: "telecoms", title: "Voice for telecoms", word: "#2FA84F",
      stops: ["#EAFBD6", "#A6E06B", "#5FC06B", "#2FA84F", "#1E8F45"],
      halo: [60, 190, 100],
      panel: ["#EAF9DD", "#F2FBE9"],
    },
    {
      sector: "insurance", title: "Voice for insurance", word: "#F47A1F",
      stops: ["#FFEBD2", "#FFC078", "#FF9A3D", "#F47A1F", "#E06A0C"],
      halo: [244, 122, 31],
      panel: ["#FFF0DD", "#FFE7CC"],
    },
    {
      sector: "government", title: "Voice for government", word: "#2E6FD0",
      stops: ["#DBEEFF", "#86C2F5", "#4C98E8", "#2E6FD0", "#1E56B0"],
      halo: [46, 111, 208],
      panel: ["#E6F1FF", "#EAF3FF"],
    },
  ];

  /* ---- Colour helpers ---- */
  const hexToRgb = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Live (animating) colour state, seeded from the first slide
  let cur = SLIDES[0].stops.map(hexToRgb);
  let curHalo = SLIDES[0].halo.slice();
  let target = cur.map((c) => c.slice());
  let targetHalo = curHalo.slice();

  /* ---- Hi-DPI canvas ---- */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const SIZE = 640;
  canvas.width = SIZE * DPR;
  canvas.height = SIZE * DPR;
  ctx.scale(DPR, DPR);
  const CX = SIZE / 2, CY = SIZE / 2, BASE_R = SIZE * 0.34;

  /* ---- Audio analysis (orb still animates without it) ---- */
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
      src.connect(analyser);
      analyser.connect(actx.destination);
      audio._actx = actx;
    } catch (e) { analyser = null; }
  }
  function sampleLevel() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(audioData);
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) sum += audioData[i];
    return sum / audioData.length / 255;
  }

  /* ---- Blob path ---- */
  function blobPath(t, amp) {
    const points = 96;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const wobble =
        Math.sin(a * 3 + t * 0.9) * 0.045 +
        Math.sin(a * 5 - t * 0.6) * 0.03 +
        Math.sin(a * 2 + t * 1.4) * 0.035;
      const r = BASE_R * (1 + wobble + amp * 0.18);
      const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  let t = 0;
  function frame() {
    t += 0.016;

    // ease live colours toward the active slide's colours
    for (let i = 0; i < cur.length; i++)
      for (let k = 0; k < 3; k++) cur[i][k] = lerp(cur[i][k], target[i][k], 0.08);
    for (let k = 0; k < 3; k++) curHalo[k] = lerp(curHalo[k], targetHalo[k], 0.08);

    const tgt = analyser && !audio.paused ? sampleLevel() : 0;
    level += (tgt - level) * 0.12;
    const amp = level + (audio.paused ? 0 : 0.05);

    ctx.clearRect(0, 0, SIZE, SIZE);

    // halo
    const halo = ctx.createRadialGradient(CX, CY, BASE_R * 0.6, CX, CY, BASE_R * (1.55 + amp));
    halo.addColorStop(0, `rgba(${curHalo[0] | 0},${curHalo[1] | 0},${curHalo[2] | 0},0.22)`);
    halo.addColorStop(1, `rgba(${curHalo[0] | 0},${curHalo[1] | 0},${curHalo[2] | 0},0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // body
    ctx.save();
    blobPath(t, amp);
    ctx.clip();
    const g = ctx.createRadialGradient(
      CX - BASE_R * 0.35, CY - BASE_R * 0.4, BASE_R * 0.15, CX, CY, BASE_R * 1.25
    );
    g.addColorStop(0.0, rgb(cur[0]));
    g.addColorStop(0.34, rgb(cur[1]));
    g.addColorStop(0.64, rgb(cur[2]));
    g.addColorStop(0.88, rgb(cur[3]));
    g.addColorStop(1.0, rgb(cur[4]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // rotating sheen
    const sx = CX + Math.cos(t * 0.5) * BASE_R * 0.3, sy = CY + Math.sin(t * 0.5) * BASE_R * 0.3;
    const sheen = ctx.createRadialGradient(sx, sy, 0, sx, sy, BASE_R * 0.9);
    sheen.addColorStop(0, "rgba(255,255,255,0.55)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.10)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.restore();

    // rim
    ctx.save();
    blobPath(t, amp);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(frame);
  }
  frame();

  /* ---- Carousel ---- */
  let idx = 0;
  let userInteracted = false;

  // build dots
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
    target = s.stops.map(hexToRgb);
    targetHalo = s.halo.slice();
    sectorEl.textContent = s.sector;
    sectorEl.style.color = s.word;
    sectorDot.style.color = s.word;
    titleEl.textContent = s.title;
    panel.style.background =
      `radial-gradient(120% 110% at 50% 18%, ${s.panel[0]} 0%, ${s.panel[1]} 55%, #FFFFFF 100%)`;
    dotsEl.querySelectorAll(".dot-i").forEach((d, i) =>
      d.classList.toggle("active", i === idx));
  }

  document.getElementById("next").addEventListener("click", () => { userInteracted = true; go(idx + 1); });
  document.getElementById("prev").addEventListener("click", () => { userInteracted = true; go(idx - 1); });

  // gentle auto-advance until the user takes over
  const auto = setInterval(() => { if (!userInteracted && audio.paused) go(idx + 1); }, 5000);

  /* ---- Tap orb to hear the voice ---- */
  orb.addEventListener("click", async () => {
    userInteracted = true;
    initAudioGraph();
    if (audio._actx && audio._actx.state === "suspended") {
      try { await audio._actx.resume(); } catch (_) {}
    }
    if (audio.paused) {
      try {
        await audio.play();
        orb.classList.add("playing");
        status.textContent = "V AI is speaking…";
      } catch (e) {
        status.textContent = "Add a clip at web/assets/hero-voice.mp3 to play";
      }
    } else {
      audio.pause(); audio.currentTime = 0;
      orb.classList.remove("playing");
      status.textContent = "Tap the orb to hear this voice";
    }
  });
  audio.addEventListener("ended", () => {
    orb.classList.remove("playing");
    status.textContent = "Tap again to replay";
  });

  /* ---- Nav shadow on scroll ---- */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.style.boxShadow = window.scrollY > 8 ? "0 1px 12px rgba(0,0,0,0.35)" : "none";
  });
})();
