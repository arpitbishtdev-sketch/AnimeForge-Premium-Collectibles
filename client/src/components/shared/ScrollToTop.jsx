import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "instant" avoids any visible scroll animation between pages
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Renders nothing — purely behavioral
  return null;
}
