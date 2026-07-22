// "Why We Are Different" + SIP/PBX integration strip — from the standalone design.
const INTEGRATIONS = ["AVAYA", "CISCO", "KAMAILIO", "OpenSIPS", "OC", "+ any SIP PBX / SBC"];

const POINTS = [
  {
    num: "01",
    title: "Native first",
    body: "Built for Bantu languages and real code-switching — not an English model with a translation bolted on.",
  },
  {
    num: "02",
    title: "On-prem & sovereign",
    body: "Open-weight models that run inside your data centre. No foreign API between you and your customers.",
  },
  {
    num: "03",
    title: "Human cadence",
    body: "Voices with genuine Tswana warmth — the pace, tone and idiom your callers actually recognise.",
  },
];

export default function DifferentSection() {
  return (
    <section className="different" id="solutions">
      <div className="different-inner">
        <div className="integrations" aria-label="Integrations">
          {INTEGRATIONS.map((name) => (
            <span key={name} className="integration">{name}</span>
          ))}
        </div>
        <h2>Why We Are Different</h2>
        <div className="diff-grid">
          {POINTS.map((p) => (
            <article key={p.num} className="diff-card">
              <span className="diff-num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
