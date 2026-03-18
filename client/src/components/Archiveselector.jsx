import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "../styles/Archiveselector.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * ArchiveSelector
 * Replaces CharacterSwitcher with a collector-house archive navigation.
 * Minimal, horizontal, no glow — active state is a simple underline bar.
 */
export default function ArchiveSelector({ cinematicDone = false }) {
  const { activeId, setActiveId } = useTheme();
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${API_URL}/themes`);
        const data = await res.json();
        setThemes(data);
      } catch (err) {
        console.error("Failed to load themes:", err);
      }
    };
    fetchThemes();
  }, []);

  return (
    <nav
      className={`archive-selector${cinematicDone ? " is-visible" : ""}`}
      aria-label="Archive collection selector"
    >
      <span className="archive-selector__label">Archive</span>
      <div className="archive-selector__divider" />
      <div className="archive-selector__items" role="list">
        {themes.map((theme) => {
          const isActive = activeId === (theme.slug || theme._id);
          return (
            <button
              key={theme._id}
              role="listitem"
              className={`archive-item${isActive ? " is-active" : ""}`}
              onClick={() => setActiveId(theme._id)}
              aria-current={isActive ? "true" : undefined}
              aria-label={`View ${theme.name} collection`}
            >
              {/* Thumbnail — small, muted, no border glow */}
              {theme.image && (
                <span className="archive-item__thumb">
                  <img
                    src={theme.image.replace(
                      "/upload/",
                      "/upload/w_60,h_60,c_fill,q_55,f_webp/"
                    )}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                </span>
              )}
              <span className="archive-item__name">{theme.name}</span>
              {/* Active indicator — thin underline bar, not glow */}
              <span className="archive-item__bar" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}