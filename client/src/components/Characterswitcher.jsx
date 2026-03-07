import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/Characterswitcher.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function CharacterSwitcher() {
  const { activeId, setActiveId } = useTheme();
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${API_URL}/themes`); // ← FIXED
        const data = await res.json();
        setThemes(data);
      } catch (err) {
        console.error("Failed to load themes:", err);
      }
    };

    fetchThemes();
  }, []);

  return (
    <div className="character-switcher">
      {themes.map((theme, index) => {
        const isActive = activeId === (theme.slug || theme._id);

        return (
          <div
            key={theme._id}
            style={{ display: "flex", alignItems: "center", gap: "14px" }}
          >
            <button
              className={`switcher-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveId(theme._id)}
              aria-label={`Switch to ${theme.name}`}
              style={{
                "--btn-accent": theme.accent,
                "--btn-glow": theme.glow,
              }}
            >
              <div className="switcher-avatar">
                {theme.image ? (
                  <img src={theme.image} alt={theme.name} loading="lazy" />
                ) : (
                  <span>{theme.name.slice(0, 2)}</span>
                )}
              </div>

              <span className="switcher-label">{theme.name.toUpperCase()}</span>

              <span className="switcher-dot" />
            </button>

            {index < themes.length - 1 && <div className="switcher-divider" />}
          </div>
        );
      })}
    </div>
  );
}
