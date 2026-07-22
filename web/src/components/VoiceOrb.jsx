import { useEffect, useRef, useState } from "react";
import { SLIDES } from "../data/slides.js";
import GlassBubbles from "./GlassBubbles.jsx";

// Build the colour target for one slide: body colour, attenuation (inner
// light tint) and ground-glow colour.
const slideTarget = (s) => ({ c: s.stops[3], a: s.stops[1], g: s.word });

export default function VoiceOrb({ idx, setIdx, heroRef }) {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const audioCtxRef = useRef(null);
  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const userInteractedRef = useRef(false);

  const centerRef = useRef(slideTarget(SLIDES[0]));
  const leftRef = useRef(slideTarget(SLIDES[SLIDES.length - 1]));
  const rightRef = useRef(slideTarget(SLIDES[1]));

  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Tap the orb to listen");

  // Retarget bubble colours whenever the active slide changes, and tint the
  // hero's soft gradient underlay to match.
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

  // Audio level sampling loop (feeds bubble amplitude).
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      const analyser = analyserRef.current;
      let target = 0;
      if (analyser && audio && !audio.paused) {
        analyser.getByteFrequencyData(audioDataRef.current);
        let s = 0;
        for (let i = 0; i < audioDataRef.current.length; i++) s += audioDataRef.current[i];
        target = s / audioDataRef.current.length / 255;
      }
      levelRef.current += (target - levelRef.current) * 0.12;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Gentle auto-advance until the user interacts.
  useEffect(() => {
    const id = setInterval(() => {
      if (!userInteractedRef.current && audioRef.current?.paused) {
        setIdx((i) => (i + 1) % SLIDES.length);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [setIdx]);

  function go(n) {
    userInteractedRef.current = true;
    setIdx((n + SLIDES.length) % SLIDES.length);
  }

  function initAudioGraph() {
    if (analyserRef.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const actx = new AC();
      const src = actx.createMediaElementSource(audioRef.current);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(actx.destination);
      audioCtxRef.current = actx;
      analyserRef.current = analyser;
    } catch (e) {
      analyserRef.current = null;
    }
  }

  async function handlePlayClick() {
    userInteractedRef.current = true;
    initAudioGraph();
    const audio = audioRef.current;
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try { await audioCtxRef.current.resume(); } catch (_) {}
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setStatus("V AI is speaking…");
      } catch (e) {
        setStatus("Add a clip at web/public/assets/hero-voice.mp3 to play");
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      setStatus("Tap the orb to listen");
    }
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
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
          <em>Tap to listen</em>
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
      <audio
        ref={audioRef}
        preload="none"
        src="/assets/hero-voice.mp3"
        onEnded={() => { setPlaying(false); setStatus("Tap again to replay"); }}
      />
    </div>
  );
}
