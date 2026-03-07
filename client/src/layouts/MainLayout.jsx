import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import WishlistDrawer from "../components/shared/WishlistDrawer";

export default function MainLayout() {
  const { activeCharacter } = useTheme();

  return (
    <div className="app">
      <Navbar
        accentColor={activeCharacter?.gradient?.accent}
        accentGlow={activeCharacter?.gradient?.glow}
      />
      <WishlistDrawer />
      <Outlet />
    </div>
  );
}
