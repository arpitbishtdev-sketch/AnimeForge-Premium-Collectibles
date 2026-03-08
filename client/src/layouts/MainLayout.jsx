import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import WishlistDrawer from "../components/shared/WishlistDrawer";
import AnnouncementBar from "../components/AnnouncementBar";

export default function MainLayout() {
  const { activeCharacter } = useTheme();
  // AFTER
  return (
    <div className="app">
      <Navbar
        accentColor={activeCharacter?.gradient?.accent}
        accentGlow={activeCharacter?.gradient?.glow}
      />
      <AnnouncementBar accentColor={activeCharacter?.gradient?.accent} />
      <WishlistDrawer />
      <Outlet />
    </div>
  );
}
