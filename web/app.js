/* ============ V AI — animated audio-reactive orb (Bland-style bubble) ============ */
(() => {
  const canvas = document.getElementById("orbCanvas");
  const orb = document.getElementById("orb");
  const status = document.getElementById("orbStatus");
  const audio = document.getElementById("heroVoice");
  const ctx = canvas.getContext("2d");

  // Palette (from callab.ai)
  const ACCENT = "#E46A07";
  const PINK = "#F3B0C8";
  const CREAM = "#F7EFE9";

  // Hi-DPI setup
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const SIZE = 640;
  canvas.width = SIZE * DPR;
  canvas.height = SIZE * DPR;
  ctx.scale(DPR, DPR);
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const BASE_R = SIZE * 0.34;

  // Audio analysis (optional — orb still animates without it)
  let analyser = null;
  let audioData = null;
  let level = 0; // smoothed 0..1 amplitude

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
    } catch (e) {
      analyser = null; // graceful: idle animation only
    }
  }

  function sampleLevel() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(audioData);
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) sum += audioData[i];
    return sum / audioData.length / 255; // 0..1
  }

  // Organic blob: radius modulated by several sine waves + audio
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
      const x = CX + Math.cos(a) * r;
      const y = CY + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  let t = 0;
  function frame() {
    t += 0.016;
    const target = analyser && !audio.paused ? sampleLevel() : 0;
    level += (target - level) * 0.12; // smooth
    const amp = level + (audio.paused ? 0 : 0.05);

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Outer glow halo (pulses with audio)
    const halo = ctx.createRadialGradient(CX, CY, BASE_R * 0.6, CX, CY, BASE_R * (1.55 + amp));
    halo.addColorStop(0, "rgba(228,106,7,0.22)");
    halo.addColorStop(1, "rgba(228,106,7,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Main blob body
    ctx.save();
    blobPath(t, amp);
    ctx.clip();
    const g = ctx.createRadialGradient(
      CX - BASE_R * 0.35, CY - BASE_R * 0.4, BASE_R * 0.15,
      CX, CY, BASE_R * 1.25
    );
    g.addColorStop(0, "#FFC9A3");
    g.addColorStop(0.42, ACCENT);
    g.addColorStop(0.82, "#D85E9A");
    g.addColorStop(1, PINK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Rotating inner sheen
    const sx = CX + Math.cos(t * 0.5) * BASE_R * 0.3;
    const sy = CY + Math.sin(t * 0.5) * BASE_R * 0.3;
    const sheen = ctx.createRadialGradient(sx, sy, 0, sx, sy, BASE_R * 0.9);
    sheen.addColorStop(0, "rgba(255,255,255,0.55)");
    sheen.addColorStop(0.5, "rgba(255,246,240,0.10)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.restore();

    // Crisp rim light
    ctx.save();
    blobPath(t, amp);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(frame);
  }
  frame();

  // ---- Interaction: tap orb to hear V AI ----
  let armed = false;
  orb.addEventListener("click", async () => {
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
        // No audio file yet — give a clear, honest hint
        status.textContent = "Add a voice clip at web/assets/hero-voice.mp3 to play";
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      orb.classList.remove("playing");
      status.textContent = "Powered by our own Setswana speech models";
    }
    armed = true;
  });

  audio.addEventListener("ended", () => {
    orb.classList.remove("playing");
    status.textContent = "Tap again to replay";
  });

  // Nav shadow on scroll
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.style.boxShadow = window.scrollY > 8 ? "0 1px 0 rgba(16,16,16,0.06)" : "none";
  });
})();
