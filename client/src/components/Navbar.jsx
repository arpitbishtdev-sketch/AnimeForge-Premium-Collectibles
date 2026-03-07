import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SearchOverlay from "./Searchoverlay";
import CartDrawer from "./cart/CartDrawer";
import AuthDropdown from "../components/shared/AuthDropdown";
import WishlistNavIcon from "../components/shared/WishlistNavIcon";
import "../styles/navbar.css";

/* ── Icon Components ── */
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NAV_LINKS = [
  { label: "Home", href: "home" },
  { label: "Shop", href: "shop" },
  { label: "Collections", href: "collections" },
  { label: "Contact", href: "contact" },
];

const GLASS_START = 20;
const GLASS_SCROLL_RANGE = 80;

export default function Navbar({ accentColor, accentGlow }) {
  // 0 = fully transparent, 1 = fully glass
  const [glassAlpha, setGlassAlpha] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const navigate = useNavigate();

  const handleCartClick = () => {
    if (cartCount === 0) {
      const btn = document.querySelector(".navbar-icon-btn[aria-label='Cart']");
      if (!btn) return;

      btn.classList.add("cart-empty-shake");

      setTimeout(() => {
        btn.classList.remove("cart-empty-shake");
      }, 400);

      return;
    }

    setCartOpen(true);
  };

  const rafId = useRef(null);

  const handleScroll = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      const sy = window.scrollY;

      // Smooth 0→1 alpha over first GLASS_SCROLL_RANGE px
      const GLASS_SCROLL_RANGE = 60;

      let alpha = Math.min(sy / GLASS_SCROLL_RANGE, 1);
      setGlassAlpha(alpha);

      // Progress bar
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min((sy / docH) * 100, 100) : 0);

      // Active section detection
      for (const { href } of NAV_LINKS) {
        const el = document.getElementById(href);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveLink(href);
            break;
          }
        }
      }

      rafId.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const location = useLocation();

  const handleNavClick = (href) => {
    setActiveLink(href);
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrolled = glassAlpha > 0;

  // Dynamically interpolate background & blur via inline style
  // This gives a perfectly smooth ramp with no CSS breakpoints
  const navStyle = {
    "--accent-color": accentColor,
    "--accent-glow": accentGlow,
    "--glass-alpha": glassAlpha,
    // bg: rgba(10,10,20, 0→0.78) as user scrolls
    background: `rgba(10, 10, 20, ${(glassAlpha * 0.78).toFixed(3)})`,
    // blur: 0→30px
    backdropFilter:
      glassAlpha > 0
        ? `blur(${(glassAlpha * 30).toFixed(1)}px) saturate(${(1 + glassAlpha * 0.8).toFixed(2)}) brightness(${(1 - glassAlpha * 0.08).toFixed(2)})`
        : "none",
    WebkitBackdropFilter:
      glassAlpha > 0
        ? `blur(${(glassAlpha * 30).toFixed(1)}px) saturate(${(1 + glassAlpha * 0.8).toFixed(2)}) brightness(${(1 - glassAlpha * 0.08).toFixed(2)})`
        : "none",
    boxShadow:
      glassAlpha > 0.05
        ? `0 1px 0 rgba(255,255,255,${(glassAlpha * 0.055).toFixed(3)}), 0 8px 40px rgba(0,0,0,${(glassAlpha * 0.55).toFixed(3)}), inset 0 0 0 1px rgba(255,255,255,${(glassAlpha * 0.04).toFixed(3)})`
        : "none",
  };

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : "transparent"} ${mobileOpen ? "mobile-open" : ""}`}
        style={navStyle}
      >
        {/* Scroll progress bar */}
        <div
          className="navbar-progress"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Animated glowing bottom border */}
        <div className="navbar-border-glow" />

        {/* ── Logo ── */}
        <div className="navbar-logo" onClick={() => handleNavClick("home")}>
          <div className="navbar-logo-icon">
            <span className="logo-icon-bolt">⚡</span>
            <div className="logo-icon-ring" />
          </div>
          <div className="navbar-logo-text">
            ANIME<span>FORGE</span>
            <div className="navbar-logo-tagline">Premium Collectibles</div>
          </div>
        </div>

        {/* ── Center Menu (desktop only) ── */}
        <ul className="navbar-menu">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                className={`navbar-link ${activeLink === href ? "active" : ""}`}
                onClick={() => handleNavClick(href)}
              >
                <span className="navbar-link-text">{label}</span>
                <span className="navbar-link-indicator" />
              </button>
            </li>
          ))}
        </ul>

        {/* ── Right Icons ── */}
        <div className="navbar-icons">
          <button
            className={`navbar-icon-btn ${searchOpen ? "active-icon" : ""}`}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </button>

          <button
            className="navbar-icon-btn"
            aria-label="Cart"
            onClick={handleCartClick}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="cart-badge">
                <span className="cart-badge-inner">{cartCount}</span>
              </span>
            )}
          </button>
          <WishlistNavIcon />
          <AuthDropdown />

          <button
            className="navbar-icon-btn navbar-hamburger"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`navbar-mobile-drawer ${mobileOpen ? "open" : ""}`}
        style={{ "--accent-color": accentColor, "--accent-glow": accentGlow }}
      >
        <div className="mobile-drawer-inner">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-label">Navigation</span>
            <div className="mobile-drawer-rule" />
          </div>
          {NAV_LINKS.map(({ label, href }, i) => (
            <button
              key={href}
              className={`mobile-nav-link ${activeLink === href ? "active" : ""}`}
              onClick={() => handleNavClick(href)}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span className="mobile-nav-link-num">0{i + 1}</span>
              <span className="mobile-nav-link-label">{label}</span>
              <span className="mobile-nav-link-arrow">→</span>
            </button>
          ))}
          <div className="mobile-drawer-footer">
            <span>© 2025 AnimeForge</span>
            <span>Premium Collectibles</span>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="navbar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Full-Screen Search Overlay ── */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        accentColor={accentColor}
        accentGlow={accentGlow}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
