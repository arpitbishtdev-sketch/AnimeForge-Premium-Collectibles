import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const res = await fetch("/api/themes/active");
      if (!res.ok) throw new Error("No active theme");

      const theme = await res.json();

      // Convert API theme → character structure used by UI
      const mappedCharacter = {
        id: theme.slug || theme._id,
        name: theme.name,
        status: theme.status,
        edition: theme.edition,
        subtitle: theme.subtitle,
        description: theme.description,
        price: theme.price,
        mainImage: theme.image,
        model3d: theme.model3d,
        carouselImages: theme.carouselImages,
        gradient: {
          accent: theme.accent,
          glow: theme.glow,
          particle: theme.particle,
          radial: theme.radialGradient,
          linear: theme.linearGradient,
        },
      };

      setActiveCharacter(mappedCharacter);

      document.documentElement.style.setProperty("--accent", theme.accent);
      document.documentElement.style.setProperty("--accent-glow", theme.glow);
      document.documentElement.style.setProperty("--particle", theme.particle);
      document.documentElement.style.setProperty(
        "--bg-radial",
        theme.radialGradient,
      );
      document.documentElement.style.setProperty(
        "--bg-linear",
        theme.linearGradient,
      );
    } catch (err) {
      console.warn("Failed to load theme:", err.message);

      // fallback theme
      setActiveCharacter({
        id: "default",
        name: "DEFAULT",
        gradient: {
          accent: "#00f0ff",
          glow: "#00f0ff",
          radial:
            "radial-gradient(ellipse at 60% 40%, #0a1628 0%, #000000 70%)",
          linear: "linear-gradient(135deg, #0a1628 0%, #000000 100%)",
          particle: "#00f0ff",
        },
        mainImage: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveId = useCallback(async (themeId) => {
    try {
      const res = await fetch(`/api/themes/${themeId}/activate`, {
        method: "PATCH",
      });

      const theme = await res.json();

      const mappedCharacter = {
        id: theme.slug || theme._id,
        name: theme.name,
        status: theme.status,
        edition: theme.edition,
        subtitle: theme.subtitle,
        description: theme.description,
        price: theme.price,
        mainImage: theme.image,
        carouselImages: theme.carouselImages,
        gradient: {
          accent: theme.accent,
          glow: theme.glow,
          particle: theme.particle,
          radial: theme.radialGradient,
          linear: theme.linearGradient,
        },
      };

      setActiveCharacter(mappedCharacter);

      document.documentElement.style.setProperty("--accent", theme.accent);
      document.documentElement.style.setProperty("--accent-glow", theme.glow);
      document.documentElement.style.setProperty("--particle", theme.particle);
      document.documentElement.style.setProperty(
        "--bg-radial",
        theme.radialGradient,
      );
      document.documentElement.style.setProperty(
        "--bg-linear",
        theme.linearGradient,
      );
    } catch (err) {
      console.error("Failed to switch theme:", err.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeCharacter,
      activeId: activeCharacter?.id,
      setActiveId,
      loading,
    }),
    [activeCharacter, setActiveId, loading],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
