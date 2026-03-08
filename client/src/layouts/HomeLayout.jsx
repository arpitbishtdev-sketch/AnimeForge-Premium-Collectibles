// src/layouts/HomeLayout.jsx

import { useState, useEffect, lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CharacterSwitcher from "../components/Characterswitcher";
import Loader from "../components/Loader";
import Store from "../components/Store";

import { useTheme } from "../context/ThemeContext";

const Collections = lazy(() => import("../components/Collections"));
const Reviews = lazy(() => import("../components/Reviews"));
const Contact = lazy(() => import("../components/Contact"));
const Footer = lazy(() => import("../components/Footer"));

export default function HomeLayout() {
  const { activeCharacter, activeId, setActiveId } = useTheme();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("homeLoaded");
    if (hasLoaded) {
      setLoaded(true);
      return;
    }
    const timer = setTimeout(() => {
      setLoaded(true);
      sessionStorage.setItem("homeLoaded", "true");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const accentColor = activeCharacter?.gradient?.accent;
  const accentGlow = activeCharacter?.gradient?.glow;

  return (
    <>
      {!loaded && (
        <Loader accentColor={accentColor} onComplete={() => setLoaded(true)} />
      )}

      {loaded && (
        <div className="app">
          <main>
            {/* ── Hero + Character Switcher ── */}
            <div style={{ position: "relative" }}>
              <Hero character={activeCharacter} />
              <CharacterSwitcher />
            </div>

            {/* ── Shop / Store ── */}
            <Store accentColor={accentColor} accentGlow={accentGlow} />

            <Suspense fallback={null}>
              <Collections accentColor={accentColor} accentGlow={accentGlow} />
              <Reviews accentColor={accentColor} accentGlow={accentGlow} />
              <Contact accentColor={accentColor} accentGlow={accentGlow} />
            </Suspense>
          </main>

          <Suspense fallback={null}>
            <Footer accentColor={accentColor} accentGlow={accentGlow} />
          </Suspense>
        </div>
      )}
    </>
  );
}
