// "Rooted in culture" — subtle video animation underlay; the copy fades in
// 3 seconds after the section scrolls into view. Video only plays while
// visible (saves CPU) and is heavily blended into the page background.
import { useEffect, useRef, useState } from "react";

export default function CultureSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let shown = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = true;
          video.play().catch(() => {});
          if (!shown && timerRef.current == null) {
            timerRef.current = setTimeout(() => {
              shown = true;
              setShowText(true);
            }, 3000);
          }
        } else {
          video.pause();
          // only count time spent in view toward the 3s reveal
          if (!shown) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(section);
    return () => {
      io.disconnect();
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  return (
    <section className="culture" id="tech" ref={sectionRef}>
      {/* subtle animation underlay */}
      <div className="culture-media" aria-hidden="true">
        <video
          ref={videoRef}
          src="/assets/tswana-dna.mp4"
          muted
          loop
          playsInline
          preload="metadata"
        />
        <span className="culture-veil" />
      </div>

      <div className={`culture-inner${showText ? " show" : ""}`}>
        <div className="culture-copy">
          <div className="kicker">Rooted in culture</div>
          <h2>Preserving our Tswana DNA</h2>
          <p>
            Every voice we build carries the cadence, warmth and idiom of the
            people who speak it — technology that remembers where it comes from.
          </p>
        </div>
      </div>
    </section>
  );
}
