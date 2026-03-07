import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Collections.css";

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
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

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

  useEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    const setSize = () => {
      const section = ribbon.closest(".collections");
      const sectionLeft = section ? section.getBoundingClientRect().left : 0;
      ribbon.style.width = window.innerWidth + "px";
      ribbon.style.left = -sectionLeft + "px";
    };
    setSize();
    window.addEventListener("resize", setSize);
    window.addEventListener("scroll", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("scroll", setSize);
    };
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
        top,
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
        top="47px"
      />
      <SilkRibbon
        direction={1}
        speed={45}
        color={accentColor}
        glow={accentGlow}
        delay={300}
        top="47px"
      />
    </div>
  );
}

function CollectionCard({ collection, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const navigate = useNavigate();

  const handleMouseMove = useCallback(
    (e) => {
      if (isLowEnd || prefersReducedMotion) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--mouse-x",
        `${((e.clientX - rect.left) / rect.width) * 100}%`,
      );
      card.style.setProperty(
        "--mouse-y",
        `${((e.clientY - rect.top) / rect.height) * 100}%`,
      );
    },
    [isLowEnd, prefersReducedMotion],
  );

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (isLowEnd || prefersReducedMotion || !cardRef.current) return;
    gsap.to(cardRef.current, { y: -8, duration: 0.4, ease: "power3.out" });
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

  const priceRange =
    collection.priceMin != null
      ? `₹${collection.priceMin} – ₹${collection.priceMax}`
      : "No products yet";

  const scaleStr =
    collection.scaleFrom && collection.scaleTo
      ? `${collection.scaleFrom}–${collection.scaleTo}`
      : collection.scaleFrom || "Various";

  return (
    <motion.div
      className={`col-card ${hovered ? "col-card--hovered" : ""}`}
      ref={cardRef} // ← GSAP lift on hover
      custom={index}
      variants={cardVariants} // ← fade-in animation
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      onMouseMove={handleMouseMove} // ← spotlight follows cursor
      onMouseEnter={handleMouseEnter} // ← hover lift
      onMouseLeave={handleMouseLeave} // ← bounce back
      onClick={() => navigate(`/collections/${collection.tag}`)} // ← navigation
      style={{
        "--card-accent": collection.accentColor || "#7c5cff", // ← ALL COLORS
        "--card-glow": collection.glowColor || "rgba(124,92,255,0.4)",
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      }}
    >
      {/* Background Image & Effects */}
      {collection.bgImage && (
        <div
          className="col-card-bg-img"
          style={{ backgroundImage: `url(${collection.bgImage})` }}
        />
      )}
      <div className="col-card-spotlight" />
      <div className="col-card-badge">{collection.badge}</div>

      {/* SECTION 1: TOP CONTENT */}
      <div className="col-card-body-top">
        <div className="col-card-number">{collection.label || "01"}</div>
        <div className="col-card-tag">
          <span className="col-card-tag-dot" />
          {collection.tagLine}
        </div>
        <h3 className="col-card-title">{collection.title}</h3>
        <div className="col-card-rule">
          <div className="col-rule-line" />
          <div className="col-rule-diamond" />
        </div>
        <p className="col-card-desc">{collection.description}</p>
      </div>

      {/* SECTION 2: FEATURED ITEMS (Pushed down by margin-top: auto) */}
      <div className="col-card-featured">
        {(collection.points || []).filter(Boolean).map((item, i) => (
          <div key={i} className="col-card-featured-item">
            <span className="col-card-featured-dot">◆</span> {item}
          </div>
        ))}
      </div>

      {/* SECTION 3: STATS GRID */}
      <div className="col-card-stats">
        <div className="col-stat">
          <span className="col-stat-val">5</span>
          <span className="col-stat-lbl">PIECES</span>
        </div>
        <div className="col-stat-div" />
        <div className="col-stat">
          <span className="col-stat-val--sm">PREMIUM STEEL</span>
          <span className="col-stat-lbl">MATERIAL</span>
        </div>
        <div className="col-stat-div" />
        <div className="col-stat">
          <span className="col-stat-val">1/6-1/50</span>
          <span className="col-stat-lbl">SCALE</span>
        </div>
      </div>

      {/* SECTION 4: FOOTER (CTA & PRICE) */}
      <div className="col-card-footer">
        <div className="col-card-price">
          <span className="col-card-price-label">FROM</span>
          <span className="col-card-price-val">{priceRange}</span>
        </div>
        <button className="col-card-cta">
          <span>EXPLORE</span>
          <span className="col-card-cta-arrow">→</span>
        </button>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="col-card-skeleton">
      <div className="col-skel-bar" />
      <div className="col-skel-title" />
      <div className="col-skel-line" />
      <div className="col-skel-line col-skel-line--short" />
    </div>
  );
}

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

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="col-bg">
        <div className="col-bg-radial" />
        <div className="col-bg-grid" />
        <div className="col-bg-scanlines" />
        <div className="col-orb col-orb--1" ref={orb1Ref} />
        <div className="col-orb col-orb--2" ref={orb2Ref} />
        <div className="col-vignette" />
      </div>

      <div className="col-deco-line col-deco-line--left" />
      <div className="col-deco-line col-deco-line--right" />

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

      <div className="col-silk-spacer" />

      <div className="col-grid">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : collections.length === 0 ? (
          <div className="col-empty">
            <p>No collections yet. Add them in the admin panel.</p>
          </div>
        ) : (
          collections.map((col, i) => (
            <CollectionCard key={col._id} collection={col} index={i} />
          ))
        )}
      </div>

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

      <div className="col-corner col-corner--tl" />
      <div className="col-corner col-corner--br" />
    </section>
  );
}
