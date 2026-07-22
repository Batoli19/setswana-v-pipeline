const Caret = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// Waveform logo mark, gradient blue -> purple like the reference image.
const Waveform = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
    <defs>
      <linearGradient id="wf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2E6FD0" />
        <stop offset="1" stopColor="#8A5CF0" />
      </linearGradient>
    </defs>
    <g fill="url(#wf)">
      <rect x="1" y="10" width="3" height="6" rx="1.5" />
      <rect x="6" y="6" width="3" height="14" rx="1.5" />
      <rect x="11" y="2" width="3" height="22" rx="1.5" />
      <rect x="16" y="6" width="3" height="14" rx="1.5" />
      <rect x="21" y="10" width="3" height="6" rx="1.5" />
    </g>
  </svg>
);

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="VoiceAI home">
          <Waveform />
          <span className="brand-word">VoiceAI</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#product">Product <Caret /></a>
          <a href="#solutions">Solutions <Caret /></a>
          <a href="#resources">Resources</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-right">
          <a href="#demo" className="nav-cta">Book a demo</a>
        </div>
      </div>
    </header>
  );
}
