import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/hero.css";

// ─── Fade colors per character (your theme system) ───────────────────────────
const FADE_COLORS = {
  naruto: "rgba(10,4,0,1)",
  spiderman: "rgba(10,0,0,1)",
  gojo: "rgba(2,0,12,1)",
  luffy: "rgba(0,4,14,1)",
};

// ─── Animation variants ───────────────────────────────────────────────────────
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
  exit: {
    opacity: 0,
    x: -25,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// ════════════════════════════════════════════════════════════════
// CINEMATIC OVERLAY
// ════════════════════════════════════════════════════════════════
function CinematicOverlay({ onComplete }) {
  const overlayRef = useRef(null);
  const topBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    // Phase 1: Gold line appears and expands horizontally
    tl.fromTo(
      lineRef.current,
      { width: 0, opacity: 0 },
      { width: "80%", opacity: 1, duration: 0.8, ease: "power2.out" },
    )
      // Phase 2: Line pulses with accent glow
      .to(lineRef.current, {
        boxShadow:
          "0 0 60px 10px rgba(255,140,0,0.5), 0 0 120px 20px rgba(255,140,0,0.2)",
        duration: 0.3,
        ease: "power2.in",
      })
      // Phase 3: Bars split apart
      .to(
        topBarRef.current,
        { yPercent: -100, duration: 1, ease: "power3.inOut" },
        "-=0.1",
      )
      .to(
        bottomBarRef.current,
        { yPercent: 100, duration: 1, ease: "power3.inOut" },
        "<",
      )
      // Phase 4: Line fades
      .to(
        lineRef.current,
        { opacity: 0, duration: 0.4, ease: "power2.in" },
        "-=0.5",
      )
      // Phase 5: Overlay disappears
      .set(overlayRef.current, { display: "none" });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={overlayRef} className="hero-cinematic-overlay">
      <div
        ref={topBarRef}
        className="hero-cinematic-overlay__bar hero-cinematic-overlay__bar--top"
      />
      <div
        ref={bottomBarRef}
        className="hero-cinematic-overlay__bar hero-cinematic-overlay__bar--bottom"
      />
      <div ref={lineRef} className="hero-cinematic-overlay__line" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CAROUSEL — hooks always called, conditional render inside return
// ════════════════════════════════════════════════════════════════
function CarouselTrack({ images, speed = 0.45 }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);
  const rafRef = useRef(null);
  const { isLowEnd, isMobile } = useDeviceCapabilities();

  useEffect(() => {
    if (isLowEnd) return;
    const track = trackRef.current;
    if (!track || !images.length) return;
    if (tweenRef.current) tweenRef.current.kill();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const items = Array.from(track.children);
      if (!items.length) return;
      const gap = 20;
      const itemW = items[0].offsetWidth + gap;
      const setWidth = itemW * images.length;
      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -setWidth,
        duration: isMobile ? setWidth / (speed * 80) : setWidth / (speed * 60),
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % setWidth) },
      });
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, [images, speed, isMobile, isLowEnd]);

  if (isLowEnd) {
    return (
      <div className="hero-carousel-track hero-carousel-track--static">
        {images.slice(0, 2).map((src, i) => (
          <div key={i} className="hero-carousel-item">
            <img src={src} alt="" draggable={false} loading="lazy" />
          </div>
        ))}
      </div>
    );
  }

  const tripled = isMobile
    ? [...images, ...images]
    : [...images, ...images, ...images];

  return (
    <div className="hero-carousel-track" ref={trackRef}>
      {tripled.map((src, i) => (
        <div key={i} className="hero-carousel-item">
          <img
            src={src.replace("/upload/", "/upload/w_300,q_60,f_webp/")}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN HERO
// ════════════════════════════════════════════════════════════════
export default function Hero({ character }) {
  const heroRef = useRef(null);
  const characterRef = useRef(null);
  const bgRadialRef = useRef(null);
  const bgLinearRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const parallaxTweenRef = useRef(null);
  const [cinematicDone, setCinematicDone] = useState(false);

  const { prefersReducedMotion, isLowEnd, isMobile } = useDeviceCapabilities();

  // Lazy-load model-viewer on capable devices
  useEffect(() => {
    if (!isLowEnd && !isMobile) {
      import("@google/model-viewer");
    }
  }, [isLowEnd, isMobile]);

  // Always call hooks before conditional return
  const gradient = character?.gradient || {};

  const floatVariants = useMemo(
    () => ({
      animate:
        prefersReducedMotion || isLowEnd || isMobile
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
    }),
    [prefersReducedMotion, isLowEnd, isMobile],
  );

  // Background gradient transition on character switch (your theme system)
  useEffect(() => {
    if (!character) return;
    const radial = bgRadialRef.current;
    const linear = bgLinearRef.current;
    const orb1 = orb1Ref.current;
    const orb2 = orb2Ref.current;
    const orb3 = orb3Ref.current;
    if (!radial) return;

    if (isLowEnd || prefersReducedMotion) {
      if (radial) radial.style.background = gradient.radial;
      if (linear) linear.style.background = gradient.linear;
      if (orb1) orb1.style.background = gradient.accent;
      if (orb2) orb2.style.background = gradient.particle;
      if (orb3) orb3.style.background = gradient.glow;
      return;
    }

    // Snapshot gradient values NOW before async onComplete fires
    const snap = { ...gradient };
    const targets = [radial, linear, orb1, orb2, orb3].filter(Boolean);

    const tl = gsap.timeline();
    tl.to(targets, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        if (radial) radial.style.background = snap.radial;
        if (linear) linear.style.background = snap.linear;
        if (orb1) orb1.style.background = snap.accent;
        if (orb2) orb2.style.background = snap.particle;
        if (orb3) orb3.style.background = snap.glow;
      },
    }).to(targets, { opacity: 1, duration: 0.6, ease: "power2.out" });

    return () => {
      tl.kill();
    };
  }, [character?.id, isLowEnd, prefersReducedMotion]);

  // Mouse parallax on character
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

      if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
      parallaxTweenRef.current = gsap.to(el, {
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
    if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
    parallaxTweenRef.current = gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
    });
  }, []);

  // Cleanup all tweens on unmount
  useEffect(() => {
    return () => {
      if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
      gsap.killTweensOf(characterRef.current);
    };
  }, []);

  const handleShopClick = useCallback(() => {
    const s = document.getElementById("shop");
    s
      ? s.scrollIntoView({ behavior: "smooth" })
      : window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }, []);

  if (!character) return null;

  const btnGradient = `linear-gradient(135deg, ${gradient.accent}, ${gradient.particle})`;
  const fadeColor = FADE_COLORS[character.id] || "rgba(0,0,0,1)";
  const characterImage = character.mainImage || character.image;

  return (
    <section
      className="hero"
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--accent": gradient.accent,
        "--accent-glow": gradient.glow,
        "--hero-fade-color": fadeColor,
        "--btn-gradient": btnGradient,
      }}
    >
      {/* ── Cinematic Opening ── */}
      {!cinematicDone && (
        <CinematicOverlay onComplete={() => setCinematicDone(true)} />
      )}

      {/* ── Background Layers ── */}
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
        {!isLowEnd && (
          <>
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
          </>
        )}
      </div>

      <div className="hero-vignette" />

      {/* ── Decorative Lines (desktop only) ── */}
      {!isMobile && (
        <div className="hero-deco-lines">
          <div className="hero-deco-line" />
          <div className="hero-deco-line" />
          <div className="hero-deco-line" />
        </div>
      )}

      {/* ── Carousel ── */}
      <div className="hero-carousel-layer">
        <CarouselTrack images={character.carouselImages || []} />
      </div>

      {/* ── Character Monument ── */}
      <div className="hero-character-wrap">
        <div className="hero-character-ring ring-outer" />
        <div className="hero-character-ring ring-mid" />
        <div className="hero-character-shadow" />
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-char"}
            className="hero-character-inner"
            ref={characterRef}
            variants={characterEnterVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformStyle: "preserve-3d" }}
          >
            {character.model3d && !isMobile && !isLowEnd ? (
              <model-viewer
                src={character.model3d}
                class="hero-character-img"
                camera-controls
                auto-rotate
                disable-zoom
                shadow-intensity={isLowEnd ? "0" : "1"}
                exposure={isLowEnd ? "0.7" : "1"}
                loading="lazy"
              />
            ) : (
              <motion.img
                className="hero-character-img"
                src={(characterImage || "/placeholder.png").replace(
                  "/upload/",
                  "/upload/w_800,q_80,f_webp/",
                )}
                alt={character.name}
                draggable={false}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                variants={
                  prefersReducedMotion || isLowEnd || isMobile
                    ? {}
                    : floatVariants
                }
                animate={
                  prefersReducedMotion || isLowEnd || isMobile ? {} : "animate"
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ DESKTOP CONTENT ═══ */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-text"}
            style={{ display: "contents" }}
          >
            {/* Tag / Status badge */}
            <motion.div
              className="hero-tag"
              custom={0}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              <span className="hero-tag-dot" />
              {character.status}
            </motion.div>

            {/* Edition */}
            <motion.div
              className="hero-edition"
              custom={1}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.edition}
            </motion.div>

            {/* Character Name */}
            <motion.h1
              className="hero-title"
              custom={2}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.name}
            </motion.h1>

            {/* Decorative rule */}
            <motion.div
              className="hero-title-rule"
              custom={2.5}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              <div className="rule-line" />
              <div className="rule-diamond" />
              <div className="rule-line rule-line--short" />
            </motion.div>

            {/* Subtitle */}
            <motion.h2
              className="hero-subtitle"
              custom={3}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="hero-description"
              custom={4}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.description}
            </motion.p>

            {/* Price */}
            <motion.div
              className="hero-price-row"
              custom={5}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
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

            {/* CTAs */}
            <motion.div
              className="hero-cta-row"
              custom={6}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
              exit="exit"
            >
              <button
                className="btn-shop-now"
                onClick={handleShopClick}
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

            {/* Stats */}
            <motion.div
              className="hero-stats"
              custom={7}
              variants={textEnterVariants}
              initial="initial"
              animate={cinematicDone ? "animate" : "initial"}
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

      {/* ── Scroll Hint (desktop only) ── */}
      {!isMobile && (
        <motion.div
          className="hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: cinematicDone ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="hero-scroll-line" />
          <span className="hero-scroll-text">Scroll to explore</span>
        </motion.div>
      )}

      {/* ── Corner Accents (desktop only) ── */}
      {!isMobile && (
        <>
          <div className="hero-corner-accent top-left" />
          <div className="hero-corner-accent bottom-right" />
        </>
      )}

      {/* ═══ MOBILE CARD ═══ */}
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
            <div className="mob-card-header">
              <div className="mob-card-tag">
                <span className="hero-tag-dot" />
                {character.status}
              </div>
              <span className="mob-card-edition">{character.edition}</span>
            </div>

            <h1 className="mob-card-title">{character.name}</h1>

            <div className="mob-card-rule">
              <div className="rule-line" style={{ width: 40 }} />
              <div className="rule-diamond" />
              <div className="rule-line" style={{ width: 16 }} />
            </div>

            <p className="mob-card-subtitle">{character.subtitle}</p>

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
                  onClick={handleShopClick}
                  style={{ background: btnGradient }}
                >
                  Shop Now <span className="btn-shop-now-icon">→</span>
                </button>
                <button className="btn-wishlist mob-wish-btn">♡</button>
              </div>
            </div>

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
