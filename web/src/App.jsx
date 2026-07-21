import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import TrustStrip from "./components/TrustStrip.jsx";
import ProductSection from "./components/ProductSection.jsx";
import TechSection from "./components/TechSection.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <TrustStrip />
        <ProductSection />
        <TechSection />
      </main>
      <Footer />
    </>
  );
}
