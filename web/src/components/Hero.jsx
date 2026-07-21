import { useRef, useState } from "react";
import { SLIDES } from "../data/slides.js";
import VoiceOrb from "./VoiceOrb.jsx";

export default function Hero() {
  const heroRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];

  return (
    <section className="hero" id="demo" ref={heroRef}>
      <div className="hero-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <div className="hero-inner">
        {/* LEFT: minimal copy */}
        <div className="hero-copy">
          <h1 className="hero-title">
            Voice AI for
            <br />
            <span className="sector" style={{ color: slide.word }}>{slide.sector}</span>.
          </h1>
          <a href="#demo" className="btn btn-primary btn-lg hero-cta">Book a demo</a>
        </div>

        {/* RIGHT: standalone bubble carousel */}
        <VoiceOrb idx={idx} setIdx={setIdx} heroRef={heroRef} />
      </div>
    </section>
  );
}
