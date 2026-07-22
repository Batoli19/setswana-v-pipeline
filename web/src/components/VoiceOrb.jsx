import { useEffect, useRef, useState } from "react";
import { SLIDES } from "../data/slides.js";
import GlassBubbles from "./GlassBubbles.jsx";

// Build the colour target for one slide: body colour, attenuation (inner
// light tint) and ground-glow colour.
const slideTarget = (s) => ({ c: s.stops[3], a: s.stops[1], g: s.word });

// Pick the nicest available English voice (Google/natural > OS default).
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  const prefer = [/google.*(us|uk|english)/i, /natural/i, /samantha|zira|aria|jenny|libby/i, /female/i];
  for (const rx of prefer) {
    const hit = pool.find((v) => rx.test(v.name));
    if (hit) return hit;
  }
  return pool[0];
}

export default function VoiceOrb({ idx, setIdx, heroRef }) {
  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const speakingRef = useRef(false);
  const voiceRef = useRef(null);
  const userInteractedRef = useRef(false);
  const idxRef = useRef(idx);

  const centerRef = useRef(slideTarget(SLIDES[0]));
  const leftRef = useRef(slideTarget(SLIDES[SLIDES.length - 1]));
  const rightRef = useRef(slideTarget(SLIDES[1]));

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(
    supported ? "Tap the orb to hear this voice" : "Voice needs a modern browser"
  );

  // Load & keep the chosen voice (voices arrive async in some browsers).
  useEffect(() => {
    if (!supported) return;
    const load = () => { voiceRef.current = pickVoice(); };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  // Keep a ref of the active index for use inside speech callbacks.
  useEffect(() => { idxRef.current = idx; }, [idx]);

  // Retarget bubble colours whenever the active slide changes, tint the hero
  // underlay, and stop any voice from the previous sector.
  useEffect(() => {
    const s = SLIDES[idx];
    centerRef.current = slideTarget(s);
    leftRef.current = slideTarget(SLIDES[(idx - 1 + SLIDES.length) % SLIDES.length]);
    rightRef.current = slideTarget(SLIDES[(idx + 1) % SLIDES.length]);
    if (heroRef.current) {
      const [r1, g1, b1] = s.halo;
      heroRef.current.style.setProperty("--g1", `rgba(${r1},${g1},${b1},0.30)`);
      heroRef.current.style.setProperty("--g2", `rgba(${r1},${g1},${b1},0.20)`);
    }
  }, [idx, heroRef]);

  // Bubble amplitude loop. While the voice is speaking we drive a lively
  // synthetic envelope so the centre bubble pulses with the speech.
  useEffect(() => {
    const tick = () => {
      let target = 0;
      if (speakingRef.current) {
        const t = performance.now() / 1000;
        target = 0.34 + 0.28 * Math.abs(Math.sin(t * 7.3)) + 0.12 * Math.abs(Math.sin(t * 13.7));
      }
      levelRef.current += (target - levelRef.current) * 0.18;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Gentle auto-advance until the user interacts (and never mid-speech).
  useEffect(() => {
    const id = setInterval(() => {
      if (!userInteractedRef.current && !speakingRef.current) {
        setIdx((i) => (i + 1) % SLIDES.length);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [setIdx]);

  // Stop speech if the component unmounts.
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  function stopSpeaking() {
    if (supported) window.speechSynthesis.cancel();
    speakingRef.current = false;
    setPlaying(false);
  }

  function go(n) {
    userInteractedRef.current = true;
    stopSpeaking();
    setStatus("Tap the orb to hear this voice");
    setIdx((n + SLIDES.length) % SLIDES.length);
  }

  function handlePlayClick() {
    userInteractedRef.current = true;
    if (!supported) return;

    // Toggle: source of truth is our flag OR the engine's own speaking state
    // (onstart can lag ~1s on Windows, so we can't wait for it).
    if (speakingRef.current || window.speechSynthesis.speaking) {
      stopSpeaking();
      setStatus("Tap the orb to hear this voice");
      return;
    }

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(SLIDES[idxRef.current].greeting);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.98;
    u.pitch = 1.02;
    u.onend = () => { speakingRef.current = false; setPlaying(false); setStatus("Tap again to replay"); };
    u.onerror = () => { speakingRef.current = false; setPlaying(false); setStatus("Tap the orb to hear this voice"); };
    // Flip UI + bubble pulse immediately, without waiting for onstart.
    speakingRef.current = true;
    setPlaying(true);
    setStatus("VoiceAI is speaking…");
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="stage">
      <div className="orb-track">
        <GlassBubbles
          centerRef={centerRef}
          leftRef={leftRef}
          rightRef={rightRef}
          levelRef={levelRef}
        />

        <button className="stage-arrow left" onClick={() => go(idx - 1)} aria-label="Previous voice">
          ‹
        </button>
        <button className="stage-arrow right" onClick={() => go(idx + 1)} aria-label="Next voice">
          ›
        </button>

        {/* Tap-to-listen overlay on the centre bubble */}
        <button
          className={`orb-tap${playing ? " playing" : ""}`}
          onClick={handlePlayClick}
          aria-label="Tap to hear this voice"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            {playing ? (
              <g fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></g>
            ) : (
              <path d="M8 5v14l11-7z" fill="currentColor" />
            )}
          </svg>
          <em>{playing ? "Tap to stop" : "Tap to listen"}</em>
        </button>
      </div>

      <div className="dots" aria-hidden="true">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`dot-i${i === idx ? " active" : ""}`}
            aria-label={`Voice ${i + 1}`}
            onClick={() => go(i)}
          />
        ))}
      </div>

      <p className="orb-status">{status}</p>
    </div>
  );
}
