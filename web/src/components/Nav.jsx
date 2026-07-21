const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M7 17L17 7M17 7H8M17 7v9" />
  </svg>
);
const Caret = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="V AI home">
          <span className="brand-mark">V</span>
          <span className="brand-word">AI</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#tech">Technology</a>
          <a href="#solutions" className="has-caret">Solutions <Caret /></a>
          <a href="#resources" className="has-caret">Resources <Caret /></a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-right">
          <a href="#login" className="nav-login">Log in</a>
          <a href="#demo" className="nav-cta">Book a demo <ArrowUpRight /></a>
        </div>
      </div>
    </header>
  );
}
