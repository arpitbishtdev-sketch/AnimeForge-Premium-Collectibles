import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Footer.css";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Collections", href: "collections" },
    { label: "New Arrivals", href: "shop" },
    { label: "Limited Editions", href: "shop" },
    { label: "Pre-Orders", href: "shop" },
    { label: "Sale", href: "shop" },
  ],
  Universes: [
    { label: "Naruto", href: "collections" },
    { label: "Jujutsu Kaisen", href: "collections" },
    { label: "One Piece", href: "collections" },
    { label: "Demon Slayer", href: "collections" },
    { label: "Dragon Ball", href: "collections" },
  ],
  Support: [
    { label: "FAQ", href: "contact" },
    { label: "Shipping Info", href: "contact" },
    { label: "Returns Policy", href: "contact" },
    { label: "Track Order", href: "contact" },
    { label: "Custom Orders", href: "contact" },
  ],
  Company: [
    { label: "About Us", href: "home" },
    { label: "Blog", href: "home" },
    { label: "Careers", href: "home" },
    { label: "Press Kit", href: "home" },
    { label: "Wholesale", href: "contact" },
  ],
};

const SOCIALS = [
  { label: "X", href: "#", icon: "𝕏" },
  { label: "Instagram", href: "#", icon: "◎" },
  { label: "TikTok", href: "#", icon: "♪" },
  { label: "Discord", href: "#", icon: "⬡" },
  { label: "YouTube", href: "#", icon: "▶" },
];

const TRUST_BADGES = [
  { icon: "🔒", label: "SSL Secured" },
  { icon: "⚡", label: "Fast Delivery" },
  { icon: "★", label: "4.9 Rated" },
  { icon: "↩", label: "Free Returns" },
];

const ANIME_UNIVERSES = [
  "NARUTO",
  "JJK",
  "ONE PIECE",
  "AOT",
  "DEMON SLAYER",
  "DRAGON BALL",
  "BLEACH",
  "FULLMETAL",
  "HXH",
  "MOB PSYCHO",
];

export default function Footer({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
}) {
  const footerRef = useRef(null);
  const orb1Ref = useRef(null);
  const marqueeRef = useRef(null);
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const navigate = useNavigate();

  useEffect(() => {
    if (!footerRef.current) return;
    footerRef.current.style.setProperty("--ft-accent", accentColor);
    footerRef.current.style.setProperty("--ft-glow", accentGlow);
  }, [accentColor, accentGlow]);

  useEffect(() => {
    if (isLowEnd || prefersReducedMotion || !orb1Ref.current) return;
    gsap.to(orb1Ref.current, {
      y: -40,
      x: 30,
      duration: 14,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, [isLowEnd, prefersReducedMotion]);

  const handleNav = (href) => {
    const el = document.getElementById(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/");
  };

  const YEAR = new Date().getFullYear();

  return (
    <footer
      className="footer"
      ref={footerRef}
      style={{ "--ft-accent": accentColor, "--ft-glow": accentGlow }}
    >
      {/* Background */}
      <div className="ft-bg">
        <div className="ft-bg-gradient" />
        <div className="ft-bg-grid" />
        <div className="ft-orb ft-orb--1" ref={orb1Ref} />
        <div className="ft-vignette" />
      </div>

      {/* Top marquee */}
      <div className="ft-marquee-wrap">
        <div className="ft-marquee-inner">
          <div className="ft-marquee-track">
            {[...ANIME_UNIVERSES, ...ANIME_UNIVERSES, ...ANIME_UNIVERSES].map(
              (name, i) => (
                <span key={i} className="ft-marquee-item">
                  <span className="ft-marquee-diamond">◆</span>
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ft-main">
        {/* Brand column */}
        <motion.div
          className="ft-brand"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="ft-logo" onClick={() => handleNav("home")}>
            <div className="ft-logo-icon">
              <span className="ft-logo-bolt">⚡</span>
            </div>
            <div className="ft-logo-text">
              ANIME<span>FORGE</span>
              <div className="ft-logo-tagline">Premium Collectibles</div>
            </div>
          </div>

          <p className="ft-brand-desc">
            The world's most premium anime figure store. Limited editions,
            official licenses, and unmatched craftsmanship — delivered
            worldwide.
          </p>

          {/* Socials */}
          <div className="ft-socials">
            {SOCIALS.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="ft-social-btn"
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ft-social-icon">{s.icon}</span>
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <div className="ft-newsletter">
            <div className="ft-newsletter-label">
              <span className="ft-newsletter-dot" />
              New drops & exclusives
            </div>
            <div className="ft-newsletter-form">
              <input
                type="email"
                className="ft-newsletter-input"
                placeholder="your@email.com"
                autoComplete="email"
              />
              <button className="ft-newsletter-btn">
                <span>→</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Links columns */}
        {Object.entries(FOOTER_LINKS).map(([group, links], gi) => (
          <motion.div
            key={group}
            className="ft-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.65,
              delay: 0.08 * (gi + 1),
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="ft-col-header">
              <span className="ft-col-title">{group}</span>
              <div className="ft-col-rule" />
            </div>
            <ul className="ft-col-links">
              {links.map((link, i) => (
                <li key={i}>
                  <button
                    className="ft-link"
                    onClick={() => handleNav(link.href)}
                  >
                    <span className="ft-link-arrow">→</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Trust badges row */}
      <div className="ft-trust-row">
        {TRUST_BADGES.map((b, i) => (
          <div key={i} className="ft-trust-item">
            <span className="ft-trust-icon">{b.icon}</span>
            <span className="ft-trust-label">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="ft-bottom">
        <div className="ft-bottom-rule" />
        <div className="ft-bottom-inner">
          <span className="ft-copyright">
            © {YEAR} AnimeForge. All rights reserved.
          </span>
          <div className="ft-bottom-links">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (label, i) => (
                <button key={i} className="ft-bottom-link">
                  {label}
                </button>
              ),
            )}
          </div>
          <span className="ft-made-with">Crafted with ⚡ for collectors</span>
        </div>
      </div>

      {/* Mega logo watermark */}
      <div className="ft-watermark" aria-hidden="true">
        ANIMEFORGE
      </div>
    </footer>
  );
}
