// Each slide = one business voice with its own colour identity.
export const SLIDES = [
  { sector: "banking", word: "#8A5CF0", halo: [138, 92, 240],
    stops: ["#FCE0F0", "#EC77B3", "#B15CDA", "#8A5CF0", "#7A4DE0"] },
  { sector: "telecoms", word: "#2FA84F", halo: [60, 190, 100],
    stops: ["#EAFBD6", "#A6E06B", "#5FC06B", "#2FA84F", "#1E8F45"] },
  { sector: "insurance", word: "#F47A1F", halo: [244, 122, 31],
    stops: ["#FFEBD2", "#FFC078", "#FF9A3D", "#F47A1F", "#E06A0C"] },
  { sector: "government", word: "#2E6FD0", halo: [46, 111, 208],
    stops: ["#DBEEFF", "#86C2F5", "#4C98E8", "#2E6FD0", "#1E56B0"] },
];

export const hexToRgb = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
export const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
export const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
export const lerp = (a, b, t) => a + (b - a) * t;
