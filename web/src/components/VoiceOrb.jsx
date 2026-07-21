import { useEffect, useRef, useState } from "react";
import { SLIDES, rgba } from "../data/slides.js";
import { makeOrb, setOrbSlide, drawOrb, sampleLevel } from "../utils/orbRenderer.js";

export default function VoiceOrb({ idx, setIdx, heroRef }) {
  const canvasCenterRef = useRef(null);
  const canvasLeftRef = useRef(null);
  const canvasRightRef = useRef(null);
  const audioRef = useRef(null);

  const orbsRef = useRef(null);
  const userInteractedRef = useRef(false);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const audioCtxRef = useRef(null);
  const levelRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Tap the orb to listen");

  // Build the three orbs once and start the render loop.
  useEffect(() => {
    const center = makeOrb(canvasCenterRef.current, true, 0, SLIDES[0]);
    const left = makeOrb(canvasLeftRef.current, false, 1.7, SLIDES[SLIDES.length - 1]);
    const right = makeOrb(canvasRightRef.current, false, 3.1, SLIDES[1]);
    setOrbSlide(left, SLIDES[SLIDES.length - 1], true);
    setOrbSlide(right, SLIDES[1], true);
    orbsRef.current = { center, left, right };

    let raf;
    let t = 0;
    function frame() {
      t += 0.016;
      const audio = audioRef.current;
      const analyser = analyserRef.current;
      const tgt = analyser && audio && !audio.paused ? sampleLevel(analyser, audioDataRef.current) : 0;
      levelRef.current += (tgt - levelRef.current) * 0.12;
      const centerAmp = levelRef.current + (audio && !audio.paused ? 0.05 : 0.03);
      const peekAmp = 0.03;

      const { center, left, right } = orbsRef.current;
      drawOrb(center, t, centerAmp);
      drawOrb(left, t, peekAmp);
      drawOrb(right, t, peekAmp);

      // hero gradient underlay follows the centre bubble's live colours
      if (heroRef.current) {
        heroRef.current.style.setProperty("--g1", rgba(center.cur[1], 0.5));
        heroRef.current.style.setProperty("--g2", rgba(center.cur[3], 0.45));
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [heroRef]);

  // Retarget orb colours whenever the active slide changes.
  useEffect(() => {
    const orbs = orbsRef.current;
    if (!orbs) return;
    const s = SLIDES[idx];
    setOrbSlide(orbs.center, s, false);
    setOrbSlide(orbs.left, SLIDES[(idx - 1 + SLIDES.length) % SLIDES.length], false);
    setOrbSlide(orbs.right, SLIDES[(idx + 1) % SLIDES.length], false);
  }, [idx]);

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

  async function handleOrbClick() {
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

  function handleEnded() {
    setPlaying(false);
    setStatus("Tap again to replay");
  }

  return (
    <div className="stage">
      <div className="carousel">
        <button className="stage-arrow" onClick={() => go(idx - 1)} aria-label="Previous voice">‹</button>
        <div className="orb-track">
          <canvas className="orb-peek left" ref={canvasLeftRef} width={360} height={360} aria-hidden="true" />
          <button
            className={`orb${playing ? " playing" : ""}`}
            onClick={handleOrbClick}
            aria-label="Tap to hear this voice"
          >
            <canvas ref={canvasCenterRef} width={640} height={640} />
            <span className="orb-hint">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
              <em>Tap to listen</em>
            </span>
          </button>
          <canvas className="orb-peek right" ref={canvasRightRef} width={360} height={360} aria-hidden="true" />
        </div>
        <button className="stage-arrow" onClick={() => go(idx + 1)} aria-label="Next voice">›</button>
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
      <audio ref={audioRef} preload="none" src="/assets/hero-voice.mp3" onEnded={handleEnded} />
    </div>
  );
}
