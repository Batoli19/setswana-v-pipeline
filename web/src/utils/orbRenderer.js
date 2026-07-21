// Pure canvas rendering for the morphing voice bubble — framework-agnostic,
// so React components just wire refs/state to these functions.
import { hexToRgb, rgb, rgba, lerp } from "../data/slides.js";

export function makeOrb(canvas, useDPR, phase, seedSlide) {
  const dpr = useDPR ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const S = canvas.width; // internal px (square)
  canvas.width = S * dpr;
  canvas.height = S * dpr;
  const c = canvas.getContext("2d");
  c.scale(dpr, dpr);
  return {
    c, S, phase,
    CX: S / 2, CY: S / 2, R: S * 0.34,
    cur: seedSlide.stops.map(hexToRgb),
    target: seedSlide.stops.map(hexToRgb),
    halo: seedSlide.halo.slice(),
    haloT: seedSlide.halo.slice(),
  };
}

export function setOrbSlide(o, slide, snap) {
  o.target = slide.stops.map(hexToRgb);
  o.haloT = slide.halo.slice();
  if (snap) {
    o.cur = o.target.map((x) => x.slice());
    o.halo = o.haloT.slice();
  }
}

function blobPath(c, CX, CY, R, t, amp) {
  const points = 88;
  c.beginPath();
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const wob =
      Math.sin(a * 3 + t * 0.9) * 0.045 +
      Math.sin(a * 5 - t * 0.6) * 0.03 +
      Math.sin(a * 2 + t * 1.4) * 0.035;
    const r = R * (1 + wob + amp * 0.18);
    const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r;
    i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.closePath();
}

export function drawOrb(o, t, amp) {
  const { c, S, CX, CY, R } = o;
  // ease colours toward the active slide's colours
  for (let i = 0; i < o.cur.length; i++)
    for (let k = 0; k < 3; k++) o.cur[i][k] = lerp(o.cur[i][k], o.target[i][k], 0.08);
  for (let k = 0; k < 3; k++) o.halo[k] = lerp(o.halo[k], o.haloT[k], 0.08);

  const tt = t + o.phase;
  c.clearRect(0, 0, S, S);

  // halo
  const halo = c.createRadialGradient(CX, CY, R * 0.6, CX, CY, R * (1.55 + amp));
  halo.addColorStop(0, rgba(o.halo, 0.22));
  halo.addColorStop(1, rgba(o.halo, 0));
  c.fillStyle = halo;
  c.fillRect(0, 0, S, S);

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
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);

  const sx = CX + Math.cos(tt * 0.5) * R * 0.3, sy = CY + Math.sin(tt * 0.5) * R * 0.3;
  const sheen = c.createRadialGradient(sx, sy, 0, sx, sy, R * 0.9);
  sheen.addColorStop(0, "rgba(255,255,255,0.55)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.10)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = sheen;
  c.fillRect(0, 0, S, S);
  c.restore();

  // rim
  c.save();
  blobPath(c, CX, CY, R, tt, amp);
  c.lineWidth = 2;
  c.strokeStyle = "rgba(255,255,255,0.35)";
  c.stroke();
  c.restore();
}

export function sampleLevel(analyser, dataArray) {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);
  let s = 0;
  for (let i = 0; i < dataArray.length; i++) s += dataArray[i];
  return s / dataArray.length / 255;
}
