import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import LanguagesShowcase from "./components/LanguagesShowcase.jsx";
import CultureSection from "./components/CultureSection.jsx";
import DifferentSection from "./components/DifferentSection.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <LanguagesShowcase />
        <CultureSection />
        <DifferentSection />
      </main>
      <Footer />
    </>
  );
}
