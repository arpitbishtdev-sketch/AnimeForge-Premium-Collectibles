import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Collections.css";

// ── Collection data ────────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    id: "naruto",
    label: "01",
    title: "NARUTO",
    subtitle: "Shinobi Universe",
    tag: "Hokage Edition",
    accent: "#ff6b00",
    glow: "rgba(255,107,0,0.4)",
    particle: "#ffcc00",
    itemCount: 24,
    priceRange: "$49 – $349",
    description:
      "From Shadow Clones to Sage Mode. Every iconic moment forged in premium resin.",
    badge: "BEST SELLER",
    bgImage: null,
    // Public CDN logo — swap to your own asset if you have it
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Naruto_-_Crest_of_the_Hidden_Leaf.svg/512px-Naruto_-_Crest_of_the_Hidden_Leaf.svg.png",
    featured: ["Naruto Sage Mode", "Kurama Awakening", "Pain God Realm"],
    stats: { pieces: "24", materials: "ABS+PVC", scale: "1/6" },
  },
  {
    id: "jjk",
    label: "02",
    title: "JUJUTSU\nKAISEN",
    subtitle: "Cursed Energy",
    tag: "Limitless Edition",
    accent: "#7c3aed",
    glow: "rgba(124,58,237,0.4)",
    particle: "#a78bfa",
    itemCount: 18,
    priceRange: "$59 – $399",
    description:
      "Infinity. Domain Expansion. Six Eyes. The strongest, immortalised.",
    badge: "NEW ARRIVAL",
    bgImage: null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Jujutsu_Kaisen_logo.svg/512px-Jujutsu_Kaisen_logo.svg.png",
    featured: ["Gojo Infinity", "Sukuna King", "Megumi Shikigami"],
    stats: { pieces: "18", materials: "Premium Resin", scale: "1/7" },
  },
  {
    id: "onepiece",
    label: "03",
    title: "ONE\nPIECE",
    subtitle: "Grand Line",
    tag: "King of Pirates",
    accent: "#0ea5e9",
    glow: "rgba(14,165,233,0.4)",
    particle: "#38bdf8",
    itemCount: 31,
    priceRange: "$39 – $449",
    description:
      "From East Blue to the end of the Grand Line. A fleet of legends.",
    badge: "MOST POPULAR",
    bgImage: null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/One_Piece_Logo.svg/512px-One_Piece_Logo.svg.png",
    featured: ["Luffy Gear 5", "Zoro King", "Shanks Legend"],
    stats: { pieces: "31", materials: "Mixed Media", scale: "1/6–1/8" },
  },
  {
    id: "aot",
    label: "04",
    title: "ATTACK ON\nTITAN",
    subtitle: "Survey Corps",
    tag: "Final Season",
    accent: "#16a34a",
    glow: "rgba(22,163,74,0.4)",
    particle: "#4ade80",
    itemCount: 15,
    priceRange: "$69 – $499",
    description:
      "Rumbling. Titans. The final chapter — captured in breathtaking detail.",
    badge: "LIMITED",
    bgImage: null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Attack_on_Titan_Logo.svg/512px-Attack_on_Titan_Logo.svg.png",
    featured: ["Eren Founding", "Levi Captain", "Armored Titan"],
    stats: { pieces: "15", materials: "High-Grade PVC", scale: "1/6" },
  },
  {
    id: "demonslayer",
    label: "05",
    title: "DEMON\nSLAYER",
    subtitle: "Demon Slayer Corps",
    tag: "Hashira Edition",
    accent: "#e11d48",
    glow: "rgba(225,29,72,0.4)",
    particle: "#fb7185",
    itemCount: 20,
    priceRange: "$55 – $379",
    description:
      "Total Concentration Breathing. Nichirin blades forever poised to strike.",
    badge: "HOT",
    bgImage: null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Kimetsu_no_Yaiba_Logo.svg/512px-Kimetsu_no_Yaiba_Logo.svg.png",
    featured: ["Tanjiro Sun Breathing", "Rengoku Flame", "Zenitsu Thunder"],
    stats: { pieces: "20", materials: "PVC+ABS", scale: "1/7" },
  },
  {
    id: "dragonball",
    label: "06",
    title: "DRAGON\nBALL",
    subtitle: "Z Warriors",
    tag: "Ultra Edition",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
    particle: "#fcd34d",
    itemCount: 38,
    priceRange: "$45 – $599",
    description:
      "Power levels that break the scouter. The OG — still unmatched.",
    badge: "CLASSIC",
    bgImage: null,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Dragon_Ball_Z_Logo.svg/512px-Dragon_Ball_Z_Logo.svg.png",
    featured: ["Ultra Instinct", "SSB Vegeta", "Frieza Reborn"],
    stats: { pieces: "38", materials: "Mixed Media", scale: "Various" },
  },
];

// ── Heading animation ──────────────────────────────────────────────────────
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// ── Silk Ribbon Marquee ────────────────────────────────────────────────────
// Two ribbons crossing diagonally like the reference image,
// but with a premium silk / satin feel (dark bg, accent color fill,
// subtle shimmer overlay, soft box-shadows)
const MARQUEE_ITEMS = [
  "NARUTO",
  "JJK",
  "ONE PIECE",
  "AOT",
  "DEMON SLAYER",
  "DBZ",
  "BLEACH",
  "HXH",
];

function SilkRibbon({
  direction = 1,
  speed = 28,
  color,
  glow,
  delay = 0,
  top = 0,
}) {
  const ribbonRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const xRef = useRef(0);

  // Measure true viewport width and size ribbon accordingly
  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    const setSize = () => {
      const vw = window.innerWidth;
      ribbon.style.width = vw + "px";
      ribbon.style.left = "0px";
    };
    setSize();
    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const raf = requestAnimationFrame(() => {
      const totalW = track.scrollWidth / 3;
      xRef.current = direction === -1 ? 0 : -totalW;
      let last = performance.now();
      const tick = (now) => {
        const dt = (now - last) / 1000;
        last = now;
        xRef.current += direction * speed * dt;
        if (direction === 1 && xRef.current >= 0) xRef.current -= totalW;
        if (direction === -1 && xRef.current <= -totalW) xRef.current += totalW;
        track.style.transform = `translateX(${xRef.current}px)`;
        rafRef.current = requestAnimationFrame(tick);
      };
      setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, delay);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [direction, speed, delay]);

  const tripled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      ref={ribbonRef}
      className="silk-ribbon"
      style={{
        "--ribbon-color": color,
        "--ribbon-glow": glow,
        position: "absolute",
        top: top,
        transform: `rotate(${direction === 1 ? -4 : 4}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div className="silk-ribbon-sheen silk-ribbon-sheen--1" />
      <div className="silk-ribbon-sheen silk-ribbon-sheen--2" />
      <div className="silk-ribbon-track" ref={trackRef}>
        {tripled.map((name, i) => (
          <span key={i} className="silk-ribbon-item">
            <span className="silk-ribbon-star">✦</span>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function SilkMarqueeSection({ accentColor, accentGlow }) {
  return (
    <div className="silk-marquee-section">
      <SilkRibbon
        direction={-1}
        speed={55}
        color={accentColor}
        glow={accentGlow}
        delay={0}
        top="20px"
      />
      <SilkRibbon
        direction={1}
        speed={45}
        color={accentColor}
        glow={accentGlow}
        delay={300}
        top="70px"
      />
    </div>
  );
}

// ── Collection Card ────────────────────────────────────────────────────────
function CollectionCard({ collection, index, accentColor, accentGlow }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const navigate = useNavigate();

  const handleMouseMove = useCallback(
    (e) => {
      if (isLowEnd || prefersReducedMotion) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    },
    [isLowEnd, prefersReducedMotion],
  );

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (isLowEnd || prefersReducedMotion || !cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -8,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [isLowEnd, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
    cardRef.current.style.setProperty("--mouse-x", "50%");
    cardRef.current.style.setProperty("--mouse-y", "50%");
  }, []);

  return (
    <motion.div
      className={`col-card ${hovered ? "col-card--hovered" : ""}`}
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/collections/${collection.id}`)}
      style={{
        "--card-accent": collection.accent,
        "--card-glow": collection.glow,
        "--card-particle": collection.particle,
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      }}
    >
      {/* Spotlight effect */}
      <div className="col-card-spotlight" />

      {/* Top border accent */}
      <div className="col-card-top-border" />

      {/* Badge */}
      <div className="col-card-badge">{collection.badge}</div>

      {/* Number label */}
      <div className="col-card-number">{collection.label}</div>

      {/* Header */}
      <div className="col-card-header">
        <div className="col-card-tag">
          <span className="col-card-tag-dot" />
          {collection.tag}
        </div>
        <div className="col-card-subtitle">{collection.subtitle}</div>
      </div>

      {/* Title + Anime Logo side by side */}
      <div className="col-card-title-row">
        <h3 className="col-card-title">{collection.title}</h3>

        {/* Anime logo / icon */}
        <div className="col-card-logo-wrap">
          {collection.logo && !logoError ? (
            <img
              src={collection.logo}
              alt={`${collection.title} logo`}
              className="col-card-logo"
              draggable={false}
              loading="lazy"
              onError={() => setLogoError(true)}
            />
          ) : (
            /* Fallback: stylized initial */
            <div className="col-card-logo-fallback">
              {collection.title.charAt(0)}
            </div>
          )}
          {/* Glow ring behind logo */}
          <div className="col-card-logo-ring" />
        </div>
      </div>

      {/* Rule */}
      <div className="col-card-rule">
        <div className="col-rule-line" />
        <div className="col-rule-diamond" />
        <div className="col-rule-line col-rule-line--short" />
      </div>

      {/* Description */}
      <p className="col-card-desc">{collection.description}</p>

      {/* Featured items */}
      <div className="col-card-featured">
        {collection.featured.map((item, i) => (
          <span key={i} className="col-card-featured-item">
            <span className="col-card-featured-dot">◆</span>
            {item}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="col-card-stats">
        <div className="col-stat">
          <span className="col-stat-val">{collection.stats.pieces}</span>
          <span className="col-stat-lbl">Pieces</span>
        </div>
        <div className="col-stat-div" />
        <div className="col-stat">
          <span className="col-stat-val col-stat-val--sm">
            {collection.stats.materials}
          </span>
          <span className="col-stat-lbl">Material</span>
        </div>
        <div className="col-stat-div" />
        <div className="col-stat">
          <span className="col-stat-val">{collection.stats.scale}</span>
          <span className="col-stat-lbl">Scale</span>
        </div>
      </div>

      {/* Footer */}
      <div className="col-card-footer">
        <div className="col-card-price">
          <span className="col-card-price-label">From</span>
          <span className="col-card-price-val">{collection.priceRange}</span>
        </div>
        <button className="col-card-cta">
          <span>Explore</span>
          <span className="col-card-cta-arrow">→</span>
        </button>
      </div>

      {/* Item count ribbon */}
      <div className="col-card-count">
        <span>{collection.itemCount} Items</span>
      </div>

      {/* Glow orb */}
      <div className="col-card-orb" ref={glowRef} />
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Collections({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
}) {
  const sectionRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const headerRef = useRef(null);
  const wrapRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const navigate = useNavigate();

  // Position the absolute ribbon wrap right below the header
  useLayoutEffect(() => {
    const position = () => {
      if (!headerRef.current || !wrapRef.current || !sectionRef.current) return;
      const headerBottom =
        headerRef.current.offsetTop + headerRef.current.offsetHeight;
      wrapRef.current.style.top = headerBottom + 16 + "px";
    };
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, []);

  // Ambient orb drift
  useEffect(() => {
    if (isLowEnd || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      if (orb1Ref.current)
        gsap.to(orb1Ref.current, {
          y: -60,
          x: 40,
          duration: 14,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      if (orb2Ref.current)
        gsap.to(orb2Ref.current, {
          y: 50,
          x: -35,
          duration: 18,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 4,
        });
    }, sectionRef);
    return () => ctx.revert();
  }, [isLowEnd, prefersReducedMotion]);

  useEffect(() => {
    if (!sectionRef.current) return;
    sectionRef.current.style.setProperty("--col-accent", accentColor);
    sectionRef.current.style.setProperty("--col-glow", accentGlow);
  }, [accentColor, accentGlow]);

  return (
    <section
      className="collections"
      id="collections"
      ref={sectionRef}
      style={{ "--col-accent": accentColor, "--col-glow": accentGlow }}
    >
      {/* ── Background ── */}
      <div className="col-bg">
        <div className="col-bg-radial" />
        <div className="col-bg-grid" />
        <div className="col-bg-scanlines" />
        <div className="col-orb col-orb--1" ref={orb1Ref} />
        <div className="col-orb col-orb--2" ref={orb2Ref} />
        <div className="col-vignette" />
      </div>

      {/* Deco lines */}
      <div className="col-deco-line col-deco-line--left" />
      <div className="col-deco-line col-deco-line--right" />

      {/* ── Header ── */}
      <div className="col-header" ref={headerRef}>
        <motion.div
          className="col-eyebrow"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span className="col-eyebrow-dot" />
          Universe Catalogue
        </motion.div>

        <motion.h2
          className="col-title"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        >
          Collections
        </motion.h2>

        <motion.div
          className="col-title-rule"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <div className="col-rule-line" />
          <div className="col-rule-diamond" />
          <div className="col-rule-line col-rule-line--short" />
        </motion.div>

        <motion.p
          className="col-description"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          Six universes. Hundreds of characters. Each collection is a portal
          into the anime worlds that defined a generation.
        </motion.p>
      </div>

      {/* ── Silk Ribbon Marquee — absolute on section, full viewport width ── */}
      <motion.div
        ref={wrapRef}
        className="col-silk-marquee-wrap"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: 0.4 }}
      >
        <SilkMarqueeSection accentColor={accentColor} accentGlow={accentGlow} />
      </motion.div>

      {/* Spacer that matches the ribbon block height so grid doesn't overlap */}
      <div className="col-silk-spacer" />

      {/* ── Grid ── */}
      <div className="col-grid">
        {COLLECTIONS.map((col, i) => (
          <CollectionCard
            key={col.id}
            collection={col}
            index={i}
            accentColor={accentColor}
            accentGlow={accentGlow}
          />
        ))}
      </div>

      {/* ── Footer CTA ── */}
      <motion.div
        className="col-footer-cta"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: 0.8 }}
      >
        <div className="col-footer-divider">
          <div className="col-footer-divider-line" />
          <span className="col-footer-divider-text">Custom Orders</span>
          <div className="col-footer-divider-line" />
        </div>
        <p className="col-footer-note">
          Can't find your character?{" "}
          <button
            className="col-footer-link"
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Request a custom piece →
          </button>
        </p>
      </motion.div>

      {/* Corner accents */}
      <div className="col-corner col-corner--tl" />
      <div className="col-corner col-corner--br" />
    </section>
  );
}
