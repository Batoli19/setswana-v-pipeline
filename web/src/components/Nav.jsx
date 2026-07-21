import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="V AI home">
          <span className="brand-mark">V</span>
          <span className="brand-word">AI</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#tech">Technology</a>
          <a href="#demo">Demo</a>
        </nav>
        <div className="nav-right">
          <a href="#demo" className="nav-login">Log in</a>
          <a href="#demo" className="btn btn-primary nav-cta">Book a demo</a>
        </div>
      </div>
    </header>
  );
}
