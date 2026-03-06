import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function MainLayout() {
  const { activeCharacter } = useTheme();

  return (
    <div className="app">
      <Navbar
        accentColor={activeCharacter?.gradient?.accent}
        accentGlow={activeCharacter?.gradient?.glow}
      />
      <Outlet />
    </div>
  );
}
