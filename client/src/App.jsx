import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CharacterSwitcher from "./components/CharacterSwitcher";
import Loader from "./components/Loader";
import Store from "./components/Store";
import { CHARACTERS } from "./data/characters";

export default function App() {
  const [activeId, setActiveId] = useState("naruto");
  const [loaded, setLoaded] = useState(false);

  const activeCharacter =
    CHARACTERS.find((c) => c.id === activeId) || CHARACTERS[0];

  // Safety fallback in case loader fails
  useEffect(() => {
    const fallback = setTimeout(() => setLoaded(true), 6000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <>
      {!loaded && (
        <Loader
          accentColor={activeCharacter.gradient.accent}
          onComplete={() => setLoaded(true)}
        />
      )}

      {loaded && (
        <div className="app">
          <Navbar
            accentColor={activeCharacter.gradient.accent}
            accentGlow={activeCharacter.gradient.glow}
          />

          <main>
            {/* Hero section */}
            <div style={{ position: "relative" }}>
              <Hero character={activeCharacter} />
              <CharacterSwitcher
                characters={CHARACTERS}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </div>

            {/* Store — receives same accent as Navbar & Hero */}
            <Store
              accentColor={activeCharacter.gradient.accent}
              accentGlow={activeCharacter.gradient.glow}
            />
          </main>
        </div>
      )}
    </>
  );
}
