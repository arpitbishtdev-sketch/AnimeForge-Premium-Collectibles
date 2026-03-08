import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Collections.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

// ═══════════════════════════════════════════════════════
//  CINEMATIC OVERLAY
//  — Low-end / reduced-motion: skips overlay entirely
//  — Mid-end: no blur, no scanlines, faster timing
//  — High-end: full experience
// ═══════════════════════════════════════════════════════
function CinematicOverlay({ payload, onDone, tier }) {
  const navigate = useNavigate();

  // Mid-tier gets a shorter hold so it feels snappy
  const holdMs = tier === "high" ? 1800 : 1100;

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(`/collections/${payload.tag}`);
      setTimeout(onDone, 300);
    }, holdMs);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="cin-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: tier === "high" ? 0.18 : 0.12 }}
      style={{
        "--cin-accent": payload.accentColor,
        "--cin-glow": payload.glowColor,
      }}
    >
      {/* Radial color burst — always shown, cheap */}
      <motion.div
        className="cin-burst"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 6, opacity: 1 }}
        transition={{
          duration: tier === "high" ? 0.82 : 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* BG image — skip blur on mid (blur is GPU heavy) */}
      {payload.bgImage && (
        <motion.div
          className="cin-bg-img"
          style={{ backgroundImage: `url(${payload.bgImage})` }}
          initial={{
            scale: tier === "high" ? 1.22 : 1,
            filter: tier === "high" ? "blur(30px)" : "blur(0px)",
            opacity: 0,
          }}
          animate={{
            scale: tier === "high" ? 1.04 : 1,
            filter: "blur(0px)",
            opacity: 0.28,
          }}
          transition={{
            duration: tier === "high" ? 0.85 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}

      {/* Scanlines — skip on mid (extra paint layer) */}
      {tier === "high" && <div className="cin-scanlines" />}

      <div className="cin-vignette" />

      {/* Tag line */}
      <motion.div
        className="cin-tag"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: tier === "high" ? 0.22 : 0.1 }}
      >
        <span className="cin-tag-dot" />
        {payload.tagLine}
      </motion.div>

      {/* Title letters
          High  → full 3D flip per letter
          Mid   → simple fade+y, all letters same delay (no stagger overhead)  */}
      <div className="cin-title-wrap">
        {tier === "high" ? (
          payload.title.split("").map((char, i) => (
            <motion.span
              key={i}
              className="cin-title-char"
              initial={{ opacity: 0, y: 75, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.44,
                delay: 0.26 + i * 0.036,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))
        ) : (
          // Mid: whole word fades in at once — zero per-letter overhead
          <motion.span
            className="cin-title-char"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {payload.title}
          </motion.span>
        )}
      </div>

      {/* Rule */}
      <motion.div
        className="cin-rule"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: tier === "high" ? 0.55 : 0.3,
          delay: tier === "high" ? 0.5 : 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Corners — high only */}
      {tier === "high" && (
        <>
          <motion.div
            className="cin-corner cin-corner--tl"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.14 }}
          />
          <motion.div
            className="cin-corner cin-corner--br"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.22 }}
          />
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
//  SILK RIBBON
// ═══════════════════════════════════════════════════════
function SilkRibbon({ direction = 1, speed = 2, color, glow, top = 0 }) {
  const ribbonRef = useRef(null);
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

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
    return () => window.removeEventListener("resize", setSize);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (tweenRef.current) tweenRef.current.kill();

    const raf = requestAnimationFrame(() => {
      const setWidth = track.scrollWidth / 3;
      if (setWidth === 0) return;

      if (direction === -1) {
        // Left direction: 0 → -setWidth, then jump back to 0
        gsap.set(track, { x: 0 });
        tweenRef.current = gsap.fromTo(
          track,
          { x: 0 },
          {
            x: -setWidth,
            duration: setWidth / (speed * 60),
            ease: "none",
            repeat: -1,
          },
        );
      } else {
        // Right direction: -setWidth → 0, then jump back to -setWidth
        gsap.set(track, { x: -setWidth });
        tweenRef.current = gsap.fromTo(
          track,
          { x: -setWidth },
          {
            x: 0,
            duration: setWidth / (speed * 60),
            ease: "none",
            repeat: -1,
          },
        );
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [speed, direction]);

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
        transform: `rotate(${direction === 1 ? -3 : 3}deg)`,
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
        speed={2}
        color={accentColor}
        glow={accentGlow}
        delay={300}
        top="47px"
      />
      <SilkRibbon
        direction={1}
        speed={2}
        color={accentColor}
        glow={accentGlow}
        delay={300}
        top="47px"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  COLLECTION CARD
// ═══════════════════════════════════════════════════════
function CollectionCard({ collection, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const { isLowEnd, prefersReducedMotion, isMobile } = useDeviceCapabilities();
  const navigate = useNavigate();

  // low  → skip cinematic entirely, direct navigate (zero Framer overhead)
  // high → full 3D letter-slam experience
  const tier = isLowEnd || prefersReducedMotion ? "low" : "high";

  const handleExplore = useCallback(() => {
    if (tier === "low") {
      navigate(`/collections/${collection.tag}`);
    } else {
      setShowCinematic(true);
    }
  }, [tier, collection.tag, navigate]);

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

  return (
    <>
      {/* Cinematic overlay — position:fixed, skipped entirely on low-end */}
      <AnimatePresence>
        {showCinematic && (
          <CinematicOverlay
            payload={{
              tag: collection.tag,
              title: collection.title,
              tagLine: collection.tagLine || "",
              accentColor: collection.accentColor || "#ff8c00",
              glowColor: collection.glowColor || "rgba(255,140,0,0.4)",
              bgImage: collection.bgImage || null,
            }}
            onDone={() => setShowCinematic(false)}
            tier={tier}
          />
        )}
      </AnimatePresence>

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
        onClick={handleExplore}
        style={{
          "--card-accent": collection.accentColor || "#7c5cff",
          "--card-glow": collection.glowColor || "rgba(124,92,255,0.4)",
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        }}
      >
        {collection.bgImage && (
          <div
            className="col-card-bg-img"
            style={{
              backgroundImage: `url(${collection.bgImage?.replace("/upload/", "/upload/w_800,q_70,f_webp/")})`,
            }}
          />
        )}
        <div className="col-card-spotlight" />
        <div className="col-card-badge">{collection.badge}</div>

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

        <div className="col-card-featured">
          {(collection.points || []).filter(Boolean).map((item, i) => (
            <div key={i} className="col-card-featured-item">
              <span className="col-card-featured-dot">◆</span> {item}
            </div>
          ))}
        </div>

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

        <div className="col-card-footer">
          <div className="col-card-price">
            <span className="col-card-price-label">FROM</span>
            <span className="col-card-price-val">{priceRange}</span>
          </div>
          <button
            className="col-card-cta"
            onClick={(e) => {
              e.stopPropagation();
              handleExplore();
            }}
          >
            <span>EXPLORE</span>
            <span className="col-card-cta-arrow">→</span>
          </button>
        </div>
      </motion.div>
    </>
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

// ═══════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════
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
  const { isLowEnd, prefersReducedMotion, isMobile } = useDeviceCapabilities();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/collections`)
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

      <div className="col-fire-base" />
      <div className="col-fire-heat" />
      <div className="col-fire-embers" aria-hidden="true">
        {Array.from({ length: isLowEnd ? 0 : isMobile ? 15 : 40 }).map(
          (_, i) => (
            <div key={i} className={`col-ember col-ember-${i % 15}`} />
          ),
        )}
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
            <p>No collections yet.</p>
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
