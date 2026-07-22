// "We focus on native languages" — pinned full-screen section; scrolling
// through its 320vh outer height cycles the language names, each with its
// own colour glow (rebuilt from the standalone design's scroll-canvas).
import { useEffect, useRef, useState } from "react";

const LANGS = [
  { name: "Setswana", grad: ["#8A5CF0", "#EC77B3"] },
  { name: "isiZulu", grad: ["#2FA84F", "#A6E06B"] },
  { name: "isiXhosa", grad: ["#F47A1F", "#FFC078"] },
  { name: "Sesotho", grad: ["#2E6FD0", "#86C2F5"] },
  { name: "Shona", grad: ["#B15CDA", "#F0A08F"] },
];

export default function LanguagesShowcase() {
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = outerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        if (total <= 0) return;
        const p = Math.min(0.999, Math.max(0, -r.top / total));
        setProgress(p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const seg = progress * LANGS.length;
  const idx = Math.floor(seg);
  const local = seg - idx; // 0..1 within the current language
  const lang = LANGS[idx];
  // fade/scale envelope: in 0-0.2, hold, out 0.8-1
  const fade = local < 0.2 ? local / 0.2 : local > 0.8 ? (1 - local) / 0.2 : 1;
  const scale = 0.92 + 0.08 * fade;

  return (
    <section className="langs" id="product" ref={outerRef}>
      <div className="langs-pin">
        <span
          className="langs-glow"
          style={{ background: `radial-gradient(circle, ${lang.grad[0]}55, transparent 65%)` }}
        />
        <div className="langs-kicker">We focus on native languages</div>
        <div
          className="langs-word"
          style={{
            backgroundImage: `linear-gradient(100deg, ${lang.grad[0]}, ${lang.grad[1]})`,
            opacity: fade,
            transform: `scale(${scale})`,
          }}
        >
          {lang.name}
        </div>
        <div className="langs-count">{idx + 1} / {LANGS.length}</div>
      </div>
    </section>
  );
}
