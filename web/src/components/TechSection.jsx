const ITEMS = [
  { num: "01", title: "Speech-to-text", body: "Whisper adapted to real code-switched Setswana speech." },
  { num: "02", title: "Conversation", body: "Open-weight language model tuned for institutional dialogue." },
  { num: "03", title: "Text-to-speech", body: "A Batswana voice — not South African, not robotic." },
  { num: "04", title: "The moat", body: "Our own growing corpus of Botswana conversational audio." },
];

export default function TechSection() {
  return (
    <section className="section section-cream" id="tech">
      <div className="section-head">
        <p className="eyebrow">The technology</p>
        <h2>
          Built on Botswana voice data
          <br />
          no global player has.
        </h2>
      </div>
      <div className="tech-grid">
        {ITEMS.map((item) => (
          <div className="tech-item" key={item.num}>
            <span className="tech-num">{item.num}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
