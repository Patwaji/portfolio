import { useEffect, useState } from "react";
import { LenisProvider, useLenis } from "./hooks/useLenis";
import { Preloader } from "./components/Preloader";
import { CustomCursor } from "./components/CustomCursor";
import { Noise } from "./components/Noise";
import { Nav } from "./components/Nav";
import { Hero } from "./sections/Hero";
import { Philosophy } from "./sections/Philosophy";
import { Arsenal } from "./sections/Arsenal";
import { Cogniflow } from "./sections/Cogniflow";
import { Lab } from "./sections/Lab";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

function AppShell() {
  const [loading, setLoading] = useState(true);
  const lenis = useLenis();

  useEffect(() => {
    document.documentElement.style.overflow = loading ? "hidden" : "";
    if (loading) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [loading, lenis]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <CustomCursor />
      <Noise />
      <Nav />
      <main>
        <Hero start={!loading} />
        <Philosophy />
        <Arsenal />
        <Cogniflow />
        <Lab />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <LenisProvider>
      <AppShell />
    </LenisProvider>
  );
}

export default App;
