import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import WhyDifferent from "./components/WhyDifferent.jsx";
import LanguagesShowcase from "./components/LanguagesShowcase.jsx";
import CultureSection from "./components/CultureSection.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <WhyDifferent />
        <LanguagesShowcase />
        <CultureSection />
      </main>
      <Footer />
    </>
  );
}
