import { useRef, useState } from "react";
import { SLIDES } from "../data/slides.js";
import VoiceOrb from "./VoiceOrb.jsx";

const ArrowUpRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M7 17L17 7M17 7H8M17 7v9" />
  </svg>
);

export default function Hero() {
  const heroRef = useRef(null);
  // Monotonic carousel counter (can go negative / past the end); the visible
  // slide is derived by wrapping it. Keeps the orb track sliding one direction
  // per arrow press and feeling infinite.
  const [count, setCount] = useState(0);
  const idx = ((count % SLIDES.length) + SLIDES.length) % SLIDES.length;
  const slide = SLIDES[idx];
  const gradient = `linear-gradient(100deg, ${slide.grad[0]}, ${slide.grad[1]})`;

  return (
    <section className="hero" id="demo" ref={heroRef}>
      <div className="hero-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <div className="hero-inner">
        {/* LEFT: copy */}
        <div className="hero-copy">
          <span className="hero-badge">AI VOICE TECHNOLOGY</span>
          <h1 className="hero-title">
            Voice for
            <br />
            <span className="sector" style={{ backgroundImage: gradient }}>{slide.sector}</span>.
          </h1>
          <p className="hero-sub">{slide.sub}</p>
          <a href="#demo" className="btn-hero">
            Book a demo <ArrowUpRight />
          </a>
        </div>

        {/* RIGHT: liquid-glass bubble carousel */}
        <VoiceOrb count={count} setCount={setCount} idx={idx} heroRef={heroRef} />
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
