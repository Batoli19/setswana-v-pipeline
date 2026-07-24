import { useEffect, useRef, useState } from "react";
import { SLIDES } from "../data/slides.js";
import GlassBubbles from "./GlassBubbles.jsx";

// Build the colour target for one slide: body colour, attenuation (inner
// light tint) and ground-glow colour.
const slideTarget = (s) => ({ c: s.stops[3], a: s.stops[1], g: s.word });

// Pick the nicest available English voice — used only as a fallback if a
// generated clip fails to load.
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
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const srcNodeRef = useRef(null);

  const levelRef = useRef(0);
  const rafRef = useRef(0);
  const speakingRef = useRef(false); // fallback TTS is talking
  const voiceRef = useRef(null);
  const userInteractedRef = useRef(false);
  const idxRef = useRef(idx);

  const centerRef = useRef(slideTarget(SLIDES[0]));
  const leftRef = useRef(slideTarget(SLIDES[SLIDES.length - 1]));
  const rightRef = useRef(slideTarget(SLIDES[1]));

  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Tap the orb to hear this voice");

  // Keep a fallback voice ready (voices load async in some browsers).
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => { voiceRef.current = pickVoice(); };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [ttsSupported]);

  useEffect(() => { idxRef.current = idx; }, [idx]);

  // Retarget bubble colours + hero underlay on slide change, and stop any
  // voice from the previous sector.
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

  // Bubble amplitude loop: real waveform level while a clip plays, a synthetic
  // envelope while the fallback voice talks, else calm.
  useEffect(() => {
    const tick = () => {
      let target = 0;
      const audio = audioRef.current;
      if (audio && !audio.paused && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(audioDataRef.current);
        let s = 0;
        for (let i = 0; i < audioDataRef.current.length; i++) s += audioDataRef.current[i];
        target = (s / audioDataRef.current.length / 255) * 1.6;
      } else if (speakingRef.current) {
        const t = performance.now() / 1000;
        target = 0.34 + 0.28 * Math.abs(Math.sin(t * 7.3)) + 0.12 * Math.abs(Math.sin(t * 13.7));
      }
      levelRef.current += (target - levelRef.current) * 0.16;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Voices change only on manual interaction (arrows / dots) — no auto-advance.

  useEffect(() => () => stopAll(), []); // stop on unmount

  function stopAll() {
    if (ttsSupported) window.speechSynthesis.cancel();
    speakingRef.current = false;
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setPlaying(false);
  }

  function ensureGraph() {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      srcNodeRef.current = src;
    } catch (e) {
      analyserRef.current = null; // reactivity off, playback still works
    }
  }

  function speakFallback(text) {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.98; u.pitch = 1.02;
    u.onend = () => { speakingRef.current = false; setPlaying(false); setStatus("Tap again to replay"); };
    u.onerror = () => { speakingRef.current = false; setPlaying(false); setStatus("Tap the orb to hear this voice"); };
    speakingRef.current = true;
    setPlaying(true);
    setStatus("VoiceAI is speaking…");
    window.speechSynthesis.speak(u);
  }

  function go(n) {
    userInteractedRef.current = true;
    stopAll();
    setStatus("Tap the orb to hear this voice");
    setIdx((n + SLIDES.length) % SLIDES.length);
  }

  async function handlePlayClick() {
    userInteractedRef.current = true;
    const audio = audioRef.current;
    const busy = speakingRef.current || (audio && !audio.paused);
    if (busy) {
      stopAll();
      setStatus("Tap the orb to hear this voice");
      return;
    }

    const slide = SLIDES[idxRef.current];
    ensureGraph();
    if (audioCtxRef.current?.state === "suspended") {
      try { await audioCtxRef.current.resume(); } catch (_) {}
    }

    // Primary path: the real generated clip.
    try {
      audio.src = slide.clip;
      audio.currentTime = 0;
      await audio.play();
      setPlaying(true);
      setStatus("VoiceAI is speaking…");
    } catch (e) {
      // Fallback: browser speech synthesis of the greeting text.
      speakFallback(slide.greeting);
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
            {playing ? (
              <g fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></g>
            ) : (
              <path d="M8 5v14l11-7z" fill="currentColor" />
            )}
          </svg>
        </button>
      </div>

      <button
        className={`agent-cta${playing ? " playing" : ""}`}
        onClick={handlePlayClick}
        aria-label="Click to speak with an agent"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
          {playing ? (
            <g fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></g>
          ) : (
            <path d="M8 5v14l11-7z" fill="currentColor" />
          )}
        </svg>
        <span>{playing ? "Speaking… tap to stop" : "Click to speak with an agent"}</span>
      </button>
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        onEnded={() => { setPlaying(false); setStatus("Tap again to replay"); }}
      />
    </div>
  );
}
