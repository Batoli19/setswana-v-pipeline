// "Rooted in culture" — from the standalone design.
export default function CultureSection() {
  return (
    <section className="culture" id="tech">
      <div className="culture-inner">
        <div className="culture-copy">
          <div className="kicker">Rooted in culture</div>
          <h2>Preserving our Tswana DNA</h2>
          <p>
            Every voice we build carries the cadence, warmth and idiom of the
            people who speak it — technology that remembers where it comes from.
          </p>
        </div>
        <div className="culture-visual" aria-hidden="true">
          <span className="cv-ring" />
          <span className="cv-orb" />
          <span className="cv-glow" />
        </div>
      </div>
    </section>
  );
}
