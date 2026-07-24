import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import WhyDifferent from "./components/WhyDifferent.jsx";
import LanguagesShowcase from "./components/LanguagesShowcase.jsx";
import CultureSection from "./components/CultureSection.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  // Everything lives inside one centred, rail-framed column (like Bland) so the
  // whole site shares the same vertical edges and nothing bleeds past them.
  return (
    <div className="page">
      <Nav />
      <main id="top">
        <Hero />
        <WhyDifferent />
        <LanguagesShowcase />
        <CultureSection />
      </main>
      <Footer />
    </div>
  );
}
