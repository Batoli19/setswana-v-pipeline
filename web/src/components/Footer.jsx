export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <p className="footer-lead">Ready to give your customers a voice they trust?</p>
          <a href="#demo" className="btn btn-primary btn-lg">Book a demo</a>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href="#product">Product</a>
          <a href="#tech">Technology</a>
          <a href="#demo">Demo</a>
          <a href="mailto:hello@v-ai.bw">Contact</a>
        </nav>
      </div>

      <div className="footer-wordmark" aria-hidden="true">V AI</div>

      <div className="footer-bottom">
        <span>© 2026 V AI · Gaborone, Botswana</span>
        <span>Voice AI for Africa</span>
      </div>
    </footer>
  );
}
