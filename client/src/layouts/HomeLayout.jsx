// src/layouts/HomeLayout.jsx

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CharacterSwitcher from "../components/Characterswitcher";
import Loader from "../components/Loader";
import Store from "../components/Store";

import { useTheme } from "../context/ThemeContext";

import Collections from "../components/Collections";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

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
          <Navbar accentColor={accentColor} accentGlow={accentGlow} />

          <main>
            {/* ── Hero + Character Switcher ── */}
            <div style={{ position: "relative" }}>
              <Hero character={activeCharacter} />
              <CharacterSwitcher />
            </div>

            {/* ── Shop / Store ── */}
            <Store accentColor={accentColor} accentGlow={accentGlow} />

            {/* ── Collections ── */}
            <Collections accentColor={accentColor} accentGlow={accentGlow} />

            {/* ── Reviews ── */}
            <Reviews accentColor={accentColor} accentGlow={accentGlow} />

            {/* ── Contact ── */}
            <Contact accentColor={accentColor} accentGlow={accentGlow} />
          </main>

          {/* ── Footer (outside <main> intentionally) ── */}
          <Footer accentColor={accentColor} accentGlow={accentGlow} />
        </div>
      )}
    </>
  );
}
