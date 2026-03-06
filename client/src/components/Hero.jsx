import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/hero.css";
import "@google/model-viewer";

// ── Gradient fade colours per character ───────────────────────────────────
const FADE_COLORS = {
  naruto: "rgba(10,4,0,1)",
  spiderman: "rgba(10,0,0,1)",
  gojo: "rgba(2,0,12,1)",
  luffy: "rgba(0,4,14,1)",
};

const characterEnterVariants = {
  initial: { opacity: 0, scale: 0.9, y: 40 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -30,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const textEnterVariants = {
  initial: { opacity: 0, x: -50 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, x: -25, transition: { duration: 0.25, ease: "easeIn" } },
};

// ── Infinite Carousel ──────────────────────────────────────────────────────
function CarouselTrack({ images, speed = 0.45 }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !images.length) return;
    if (tweenRef.current) tweenRef.current.kill();

    // Wait one frame so layout is painted & offsetWidth is real
    const raf = requestAnimationFrame(() => {
      const items = Array.from(track.children);
      if (!items.length) return;

      // Total width of ONE full set (images.length items)
      const gap = 20; // must match CSS gap
      const itemW = items[0].offsetWidth + gap;
      const setWidth = itemW * images.length;

      gsap.set(track, { x: 0 });

      tweenRef.current = gsap.to(track, {
        x: -setWidth,
        duration: setWidth / (speed * 60),
        ease: "none",
        repeat: -1,
        // modifiers snaps x back by one full set — seamless loop
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % setWidth),
        },
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [images, speed]);

  // Triple so there's always content filling the viewport
  const tripled = [...images, ...images, ...images];

  return (
    <div className="hero-carousel-track" ref={trackRef}>
      {tripled.map((src, i) => (
        <div className="hero-carousel-item" key={i}>
          <img src={src} alt="" draggable={false} loading="lazy" />
        </div>
      ))}
    </div>
  );
}

// ── Main Hero ──────────────────────────────────────────────────────────────
export default function Hero({ character }) {
  if (!character) return null;

  const heroRef = useRef(null);
  const characterRef = useRef(null);
  const bgRadialRef = useRef(null);
  const bgLinearRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const { prefersReducedMotion, isLowEnd, isMobile } = useDeviceCapabilities();
  const gradient = character?.gradient || {};

  const floatVariants = {
    animate:
      prefersReducedMotion || isLowEnd
        ? {}
        : {
            y: [0, -20, 0],
            transition: {
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          },
  };

  // Smooth bg transition
  useEffect(() => {
    if (!bgRadialRef.current) return;

    //   PERFORMANCE GUARD
    if (isLowEnd || prefersReducedMotion) {
      if (bgRadialRef.current)
        bgRadialRef.current.style.background = gradient.radial;

      if (bgLinearRef.current)
        bgLinearRef.current.style.background = gradient.linear;

      if (orb1Ref.current) orb1Ref.current.style.background = gradient.accent;

      if (orb2Ref.current) orb2Ref.current.style.background = gradient.particle;

      if (orb3Ref.current) orb3Ref.current.style.background = gradient.glow;

      return; //   Skip GSAP animation completely
    }

    //   High-end devices get smooth animation
    const targets = [
      bgRadialRef.current,
      bgLinearRef.current,
      orb1Ref.current,
      orb2Ref.current,
      orb3Ref.current,
    ].filter(Boolean);

    const tl = gsap.timeline();

    tl.to(targets, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (bgRadialRef.current)
          bgRadialRef.current.style.background = gradient.radial;
        if (bgLinearRef.current)
          bgLinearRef.current.style.background = gradient.linear;
        if (orb1Ref.current) orb1Ref.current.style.background = gradient.accent;
        if (orb2Ref.current)
          orb2Ref.current.style.background = gradient.particle;
        if (orb3Ref.current) orb3Ref.current.style.background = gradient.glow;
      },
    }).to(targets, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    return () => tl.kill(); //   Cleanup
  }, [character.id, isLowEnd, prefersReducedMotion]);

  // Mouse parallax
  const handleMouseMove = useCallback(
    (e) => {
      if (isLowEnd || isMobile || prefersReducedMotion) return;

      const el = characterRef.current;
      if (!el) return;

      const { clientX, clientY, currentTarget } = e;
      const { width, height, left, top } =
        currentTarget.getBoundingClientRect();

      const nx = (clientX - left) / width - 0.5;
      const ny = (clientY - top) / height - 0.5;

      gsap.to(el, {
        rotateY: nx * 10,
        rotateX: -ny * 6,
        x: nx * 16,
        y: ny * 10,
        duration: 0.8,
        ease: "power3.out",
        transformPerspective: 1200,
      });
    },
    [isLowEnd, isMobile, prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    const el = characterRef.current;
    if (!el) return;
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
    });
  }, []);

  const handleShopNow = () => {
    const s = document.getElementById("shop");
    if (s) s.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const btnGradient = `linear-gradient(135deg, ${gradient.accent}, ${gradient.particle})`;

  return (
    <section
      className="hero"
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--content-accent": gradient.accent,
        "--content-glow": gradient.glow,
        "--btn-gradient": btnGradient,
        "--hero-fade-color": FADE_COLORS[character.id] || "rgba(0,0,0,1)",
        "--char-glow": gradient.glow,
      }}
    >
      {/* ── BG ── */}
      <div className="hero-bg">
        <div
          className="hero-bg-radial"
          ref={bgRadialRef}
          style={{ background: gradient.radial }}
        />
        <div
          className="hero-bg-linear"
          ref={bgLinearRef}
          style={{ background: gradient.linear }}
        />
        <div
          className="hero-bg-animated-orb orb-1"
          ref={orb1Ref}
          style={{ background: gradient.accent }}
        />
        <div
          className="hero-bg-animated-orb orb-2"
          ref={orb2Ref}
          style={{ background: gradient.particle }}
        />
        <div
          className="hero-bg-animated-orb orb-3"
          ref={orb3Ref}
          style={{ background: gradient.glow }}
        />
        <div className="hero-bg-grid" />
        <div className="hero-bg-scanlines" />
      </div>
      <div className="hero-vignette" />
      <div className="hero-grain" />

      {/* ── Carousel ── */}
      <div className="hero-carousel-layer">
        <CarouselTrack images={character.carouselImages || []} />
      </div>

      {/* ── Deco lines (desktop only) ── */}
      <div className="hero-deco-lines">
        <div className="hero-deco-line" />
        <div className="hero-deco-line" />
        <div className="hero-deco-line" />
      </div>

      {/* ── Character image ── */}
      <div className="hero-character-wrap">
        <div className="hero-character-ring ring-outer" />
        <div className="hero-character-ring ring-mid" />
        <div className="hero-character-shadow" />
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-char"}
            variants={characterEnterVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            ref={characterRef}
            style={{ transformStyle: "preserve-3d" }}
          >
            {character.model3d ? (
              <model-viewer
                src={character.model3d}
                class="hero-character-img"
                camera-controls
                auto-rotate
                disable-zoom
                shadow-intensity="1"
                exposure="1"
                loading="eager"
              />
            ) : (
              <motion.img
                className="hero-character-img"
                src={character.mainImage || "/placeholder.png"}
                alt={character.name}
                draggable={false}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                variants={prefersReducedMotion || isLowEnd ? {} : floatVariants}
                animate="animate"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP + TABLET CONTENT
      ══════════════════════════════════════════ */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-text"}
            style={{ display: "contents" }}
          >
            <motion.div
              className="hero-tag"
              custom={0}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <span className="hero-tag-dot" />
              {character.status}
            </motion.div>

            <motion.p
              className="hero-edition"
              custom={1}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {character.edition}
            </motion.p>

            <motion.h1
              className="hero-title"
              custom={2}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {character.name}
            </motion.h1>

            <motion.div
              className="hero-title-rule"
              custom={2.5}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="rule-line" />
              <div className="rule-diamond" />
              <div className="rule-line rule-line--short" />
            </motion.div>

            <motion.p
              className="hero-subtitle"
              custom={3}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {character.subtitle}
            </motion.p>

            <motion.p
              className="hero-description"
              custom={4}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {character.description}
            </motion.p>

            <motion.div
              className="hero-price-row"
              custom={5}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="hero-price-inner">
                <span className="hero-price-currency">$</span>
                <span className="hero-price">
                  {character.price?.replace("$", "")}
                </span>
              </div>
              <div className="hero-price-meta">
                <span className="hero-price-label">Starting price</span>
                <span className="hero-price-shipping">
                  Free worldwide shipping
                </span>
              </div>
            </motion.div>

            <motion.div
              className="hero-cta-row"
              custom={6}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <button
                className="btn-shop-now"
                onClick={handleShopNow}
                style={{ background: btnGradient }}
              >
                <span className="btn-shop-now-text">Shop Now</span>
                <span className="btn-shop-now-icon">→</span>
              </button>
              <button className="btn-wishlist">
                <span>♡</span>
                <span>Wishlist</span>
              </button>
            </motion.div>

            <motion.div
              className="hero-stats"
              custom={7}
              variants={textEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="hero-stat">
                <span className="hero-stat-value">2.4k+</span>
                <span className="hero-stat-label">Sold</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">4.9★</span>
                <span className="hero-stat-label">Rating</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">Ltd.</span>
                <span className="hero-stat-label">Edition</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scroll hint ── */}
      <div className="hero-scroll-hint">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll to explore</span>
      </div>

      {/* ── Corner accents ── */}
      <div className="hero-corner-accent top-left" />
      <div className="hero-corner-accent bottom-right" />

      {/* ══════════════════════════════════════════
          MOBILE-ONLY BOTTOM CARD
          Shown only on screens < 768px
      ══════════════════════════════════════════ */}
      <div className="hero-mobile-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-mob"}
            className="hero-mobile-card-inner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tag + edition */}
            <div className="mob-card-header">
              <div className="mob-card-tag">
                <span className="hero-tag-dot" />
                {character.status}
              </div>
              <span className="mob-card-edition">{character.edition}</span>
            </div>

            {/* Title */}
            <h1 className="mob-card-title">{character.name}</h1>

            {/* Rule */}
            <div className="mob-card-rule">
              <div className="rule-line" style={{ width: 40 }} />
              <div className="rule-diamond" />
              <div className="rule-line" style={{ width: 16 }} />
            </div>

            {/* Subtitle */}
            <p className="mob-card-subtitle">{character.subtitle}</p>

            {/* Price + buttons */}
            <div className="mob-card-price-row">
              <div className="mob-card-price">
                <span className="hero-price-currency">$</span>
                <span className="mob-card-price-num">
                  {character.price?.replace("$", "")}
                </span>
              </div>
              <div className="mob-card-btns">
                <button
                  className="btn-shop-now mob-shop-btn"
                  onClick={handleShopNow}
                  style={{ background: btnGradient }}
                >
                  Shop Now <span className="btn-shop-now-icon">→</span>
                </button>
                <button className="btn-wishlist mob-wish-btn">♡</button>
              </div>
            </div>

            {/* Stats */}
            <div className="mob-card-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">2.4k+</span>
                <span className="hero-stat-label">Sold</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">4.9★</span>
                <span className="hero-stat-label">Rating</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">Ltd.</span>
                <span className="hero-stat-label">Edition</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
