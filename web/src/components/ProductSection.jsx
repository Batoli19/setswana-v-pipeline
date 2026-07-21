const CARDS = [
  {
    icon: "🎙️",
    title: "Understands code-switching",
    body: "Setswana and English mid-sentence — the way people actually speak to a call centre.",
  },
  {
    icon: "⚡",
    title: "Real-time voice",
    body: "Speech in, speech out, under a few seconds a turn. Talk, don't type.",
  },
  {
    icon: "🔒",
    title: "Models you control",
    body: "Open-weight, on-prem-ready. No foreign API in the middle of your customer's data.",
  },
];

export default function ProductSection() {
  return (
    <section className="section" id="product">
      <div className="section-head">
        <p className="eyebrow">The product</p>
        <h2>A voice agent that sounds like home.</h2>
        <p className="section-sub">
          Commercial Setswana TTS already exists. What doesn't: natural, Botswana-specific,
          code-switched conversation tuned for real institutional calls. That's V AI.
        </p>
      </div>
      <div className="cards">
        {CARDS.map((card) => (
          <article className="card" key={card.title}>
            <div className="card-ic">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
