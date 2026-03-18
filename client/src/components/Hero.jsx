import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/hero.css";

// ─── Fade colors per character — muted, matte ─────────────────────────────────
const FADE_COLORS = {
  naruto: "rgba(6,4,2,1)",
  spiderman: "rgba(6,2,2,1)",
  gojo: "rgba(2,2,8,1)",
  luffy: "rgba(2,4,8,1)",
};

// ─── Animation variants — slower, more deliberate ────────────────────────────
const characterEnterVariants = {
  initial: { opacity: 0, scale: 0.96, y: 24 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -16,
    transition: { duration: 0.5, ease: "easeIn" },
  },
};

const textEnterVariants = {
  initial: { opacity: 0, y: 18 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ════════════════════════════════════════════════════════════════
// ARCHIVE REVEAL — replaces cinematic bars with an editorial wipe
// ════════════════════════════════════════════════════════════════
function ArchiveReveal({ onComplete }) {
  const overlayRef = useRef(null);
  const curtainRef = useRef(null);
  const eyebrowRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !curtainRef.current) {
      onComplete?.();
      return;
    }

    const tl = gsap.timeline({ onComplete });

    tl.fromTo(
      eyebrowRef.current,
      { opacity: 0, letterSpacing: "0.4em" },
      { opacity: 1, letterSpacing: "0.6em", duration: 0.9, ease: "power2.out" }
    )
      .to(eyebrowRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.3")
      .to(
        curtainRef.current,
        { yPercent: -100, duration: 1.1, ease: "expo.inOut" },
        "-=0.1"
      )
      .set(overlayRef.current, { display: "none" });

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div ref={overlayRef} className="archive-reveal">
      <div ref={curtainRef} className="archive-reveal__curtain">
        <span ref={eyebrowRef} className="archive-reveal__eyebrow">
          BLACK SOUN COLLECTIBLES
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CAROUSEL — reduced opacity, tighter presentation
// ════════════════════════════════════════════════════════════════
function CarouselTrack({ images, speed = 0.38 }) {
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
      const gap = 24;
      const itemW = items[0].offsetWidth + gap;
      const setWidth = itemW * images.length;
      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -setWidth,
        duration: isMobile ? setWidth / (speed * 70) : setWidth / (speed * 55),
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % setWidth) },
      });
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tweenRef.current) { tweenRef.current.kill(); tweenRef.current = null; }
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
            src={src.replace("/upload/", "/upload/w_280,q_55,f_webp/")}
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
export default function Hero({ character, onCinematicDone }) {
  const heroRef = useRef(null);
  const characterRef = useRef(null);
  const bgRef = useRef(null);
  const parallaxTweenRef = useRef(null);
  const [revealDone, setRevealDone] = useState(false);

  const { prefersReducedMotion, isLowEnd, isMobile } = useDeviceCapabilities();

  useEffect(() => {
    if (!isLowEnd && !isMobile) {
      import("@google/model-viewer");
    }
  }, [isLowEnd, isMobile]);

  const gradient = character?.gradient || {};

  // Subtle float — only vertical, amplitude halved
  const floatVariants = useMemo(
    () => ({
      animate:
        prefersReducedMotion || isLowEnd || isMobile
          ? {}
          : {
              y: [0, -10, 0],
              transition: {
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              },
            },
    }),
    [prefersReducedMotion, isLowEnd, isMobile]
  );

  const handleRevealComplete = useCallback(() => {
    setRevealDone(true);
    onCinematicDone?.();
  }, [onCinematicDone]);

  // Background transition — single layer, no orbs
  useEffect(() => {
    if (!character || !bgRef.current) return;
    const bg = bgRef.current;

    if (isLowEnd || prefersReducedMotion) {
      bg.style.background = gradient.radial;
      return;
    }

    const tl = gsap.timeline();
    tl.to(bg, { opacity: 0, duration: 0.4, ease: "power2.in",
      onComplete: () => { bg.style.background = gradient.radial; }
    }).to(bg, { opacity: 1, duration: 0.9, ease: "power2.out" });

    return () => { tl.kill(); };
  }, [character?.id, isLowEnd, prefersReducedMotion]);

  // Parallax — subtle, restrained
  const handleMouseMove = useCallback(
    (e) => {
      if (isLowEnd || isMobile || prefersReducedMotion) return;
      const el = characterRef.current;
      if (!el) return;
      const { clientX, clientY, currentTarget } = e;
      const { width, height, left, top } = currentTarget.getBoundingClientRect();
      const nx = (clientX - left) / width - 0.5;
      const ny = (clientY - top) / height - 0.5;

      if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
      parallaxTweenRef.current = gsap.to(el, {
        rotateY: nx * 5,
        rotateX: -ny * 3,
        x: nx * 10,
        y: ny * 6,
        duration: 1.2,
        ease: "power3.out",
        transformPerspective: 1400,
      });
    },
    [isLowEnd, isMobile, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    const el = characterRef.current;
    if (!el) return;
    if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
    parallaxTweenRef.current = gsap.to(el, {
      rotateY: 0, rotateX: 0, x: 0, y: 0,
      duration: 1.4,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  useEffect(() => {
    return () => {
      if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
      gsap.killTweensOf(characterRef.current);
    };
  }, []);

  const handleShopClick = useCallback(() => {
    const s = document.getElementById("archive");
    s
      ? s.scrollIntoView({ behavior: "smooth" })
      : window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }, []);

  if (!character) return null;

  const fadeColor = FADE_COLORS[character.id] || "rgba(4,4,4,1)";
  const characterImage = character.mainImage || character.image;

  // Derive a single muted accent from character — strip glow usage
  const accentColor = gradient.accent || "#c8a96e";

  return (
    <section
      className="hero"
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--accent": accentColor,
        "--hero-fade-color": fadeColor,
      }}
    >
      {/* ── Archive Reveal ── */}
      {!revealDone && (
        <ArchiveReveal onComplete={handleRevealComplete} />
      )}

      {/* ── Background — single matte layer ── */}
      <div className="hero-bg">
        <div className="hero-bg-base" ref={bgRef} style={{ background: gradient.radial }} />
        <div className="hero-bg-vignette" />
        <div className="hero-bg-grain" />
      </div>

      {/* ── Carousel — far background ── */}
      <div className="hero-carousel-layer">
        <CarouselTrack images={character.carouselImages || []} />
      </div>

      {/* ── Exhibit frame lines — editorial only, desktop ── */}
      {!isMobile && (
        <div className="hero-exhibit-frame">
          <div className="frame-line frame-line--left" />
          <div className="frame-line frame-line--right" />
          <div className="frame-corner frame-corner--tl" />
          <div className="frame-corner frame-corner--br" />
        </div>
      )}

      {/* ── Character — exhibit presentation ── */}
      <div className="hero-character-wrap">
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
                shadow-intensity="0.4"
                exposure="0.85"
                loading="lazy"
              />
            ) : (
              <motion.img
                className="hero-character-img"
                src={(characterImage || "/placeholder.png").replace(
                  "/upload/",
                  "/upload/w_800,q_80,f_webp/"
                )}
                alt={character.name}
                draggable={false}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                variants={prefersReducedMotion || isLowEnd || isMobile ? {} : floatVariants}
                animate={prefersReducedMotion || isLowEnd || isMobile ? {} : "animate"}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Pedestal shadow — grounded, matte */}
        <div className="hero-pedestal" />
      </div>

      {/* ═══ DESKTOP CONTENT ═══ */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div key={character.id + "-text"} style={{ display: "contents" }}>

            {/* Archive label */}
            <motion.div
              className="hero-archive-label"
              custom={0}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              <span className="archive-label-line" />
              <span className="archive-label-text">Archive No. {character.archiveNo || "001"}</span>
            </motion.div>

            {/* Edition */}
            <motion.div
              className="hero-edition"
              custom={1}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.edition}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="hero-title"
              custom={2}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              {character.name}
            </motion.h1>

            {/* Rule */}
            <motion.div
              className="hero-rule"
              custom={2.5}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              <div className="rule-bar" />
            </motion.div>

            {/* Subtitle */}
            <motion.h2
              className="hero-subtitle"
              custom={3}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
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
              animate={revealDone ? "animate" : "initial"}
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
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              <div className="hero-price-block">
                <span className="hero-price-currency">USD</span>
                <span className="hero-price">{character.price?.replace("$", "")}</span>
              </div>
              <div className="hero-price-meta">
                <span className="hero-price-label">Starting price</span>
                <span className="hero-price-shipping">Complimentary worldwide delivery</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="hero-cta-row"
              custom={6}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              <button className="btn-acquire" onClick={handleShopClick}>
                <span className="btn-acquire-text">Acquire Piece</span>
                <span className="btn-acquire-arrow">→</span>
              </button>
              <button className="btn-reserve">
                Reserve
              </button>
            </motion.div>

            {/* Provenance stats */}
            <motion.div
              className="hero-provenance"
              custom={7}
              variants={textEnterVariants}
              initial="initial"
              animate={revealDone ? "animate" : "initial"}
              exit="exit"
            >
              <div className="provenance-item">
                <span className="provenance-value">2,400</span>
                <span className="provenance-label">Units Placed</span>
              </div>
              <div className="provenance-sep" />
              <div className="provenance-item">
                <span className="provenance-value">4.9</span>
                <span className="provenance-label">Collector Rating</span>
              </div>
              <div className="provenance-sep" />
              <div className="provenance-item">
                <span className="provenance-value">Ltd.</span>
                <span className="provenance-label">Run Edition</span>
              </div>
            </motion.div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scroll indicator ── */}
      {!isMobile && (
        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealDone ? 1 : 0 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <div className="scroll-indicator-track">
            <div className="scroll-indicator-thumb" />
          </div>
          <span className="scroll-indicator-label">Scroll</span>
        </motion.div>
      )}

      {/* ═══ MOBILE CARD ═══ */}
      <div className="hero-mobile-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-mob"}
            className="hero-mobile-card-inner"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mob-card-header">
              <span className="mob-archive-label">Archive No. {character.archiveNo || "001"}</span>
              <span className="mob-edition">{character.edition}</span>
            </div>

            <h1 className="mob-card-title">{character.name}</h1>

            <div className="mob-card-rule" />

            <p className="mob-card-subtitle">{character.subtitle}</p>

            <div className="mob-card-price-row">
              <div className="mob-card-price">
                <span className="mob-price-currency">USD</span>
                <span className="mob-price-num">{character.price?.replace("$", "")}</span>
              </div>
              <div className="mob-card-btns">
                <button
                  className="btn-acquire mob-acquire-btn"
                  onClick={handleShopClick}
                >
                  Acquire <span className="btn-acquire-arrow">→</span>
                </button>
                <button className="btn-reserve mob-reserve-btn">♡</button>
              </div>
            </div>

            <div className="mob-card-provenance">
              <div className="provenance-item">
                <span className="provenance-value">2,400</span>
                <span className="provenance-label">Placed</span>
              </div>
              <div className="provenance-sep" />
              <div className="provenance-item">
                <span className="provenance-value">4.9</span>
                <span className="provenance-label">Rating</span>
              </div>
              <div className="provenance-sep" />
              <div className="provenance-item">
                <span className="provenance-value">Ltd.</span>
                <span className="provenance-label">Edition</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}