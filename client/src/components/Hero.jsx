import { useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/hero.css";
// const loadModelViewer = () => import("@google/model-viewer");

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

// ════════════════════════════════════════════════════════════════
// CAROUSEL — hooks always called, conditional render inside return
// ════════════════════════════════════════════════════════════════
function CarouselTrack({ images, speed = 0.45 }) {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);
  const rafRef = useRef(null);
  const { isLowEnd, isMobile } = useDeviceCapabilities();

  // FIX 2: hooks BEFORE any conditional return
  useEffect(() => {
    if (isLowEnd) return; // low-end: no animation
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
      <div className="hero-carousel-track">
        {images.slice(0, 2).map((src, i) => (
          <div className="hero-carousel-item" key={i}>
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
        <div className="hero-carousel-item" key={i}>
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
  // FIX 1: store parallax tween ref to kill before creating new
  const parallaxTweenRef = useRef(null);
  const { prefersReducedMotion, isLowEnd, isMobile } = useDeviceCapabilities();

  useEffect(() => {
    if (!isLowEnd && !isMobile) {
      import("@google/model-viewer");
    }
  }, [isLowEnd, isMobile]);

  // hooks always before conditional return
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

  // FIX 3: capture refs at effect time so onComplete uses correct snapshot
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

    const targets = [radial, linear, orb1, orb2, orb3].filter(Boolean);
    // snapshot gradient values NOW before async onComplete fires
    const snap = { ...gradient };

    const tl = gsap.timeline();
    tl.to(targets, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        // FIX 3: use snapshotted refs + values, not live refs
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

      // FIX 1: kill previous tween before new one
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

  // cleanup all tweens on unmount
  useEffect(() => {
    return () => {
      if (parallaxTweenRef.current) parallaxTweenRef.current.kill();
      gsap.killTweensOf(characterRef.current);
    };
  }, []);

  if (!character) return null;

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
        {!isLowEnd && <div className="hero-bg-grid" />}
        {!isLowEnd && <div className="hero-bg-scanlines" />}
      </div>
      <div className="hero-vignette" />
      {!isLowEnd && <div className="hero-grain" />}

      <div className="hero-carousel-layer">
        <CarouselTrack images={character.carouselImages || []} />
      </div>

      {!isMobile && (
        <div className="hero-deco-lines">
          <div className="hero-deco-line" />
          <div className="hero-deco-line" />
          <div className="hero-deco-line" />
        </div>
      )}

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
                src={(character.mainImage || "/placeholder.png").replace(
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

      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={character.id + "-text"}
            style={{ display: "contents" }}
          >
            {[
              {
                className: "hero-tag",
                custom: 0,
                content: (
                  <>
                    <span className="hero-tag-dot" />
                    {character.status}
                  </>
                ),
              },
              {
                className: "hero-edition",
                custom: 1,
                tag: "p",
                content: character.edition,
              },
            ].map(({ className, custom, tag: Tag = "div", content }) => (
              <motion.div
                key={className}
                className={className}
                custom={custom}
                variants={textEnterVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {content}
              </motion.div>
            ))}

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
                onClick={() => {
                  const s = document.getElementById("shop");
                  s
                    ? s.scrollIntoView({ behavior: "smooth" })
                    : window.scrollTo({
                        top: window.innerHeight,
                        behavior: "smooth",
                      });
                }}
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

      {!isMobile && (
        <div className="hero-scroll-hint">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-text">Scroll to explore</span>
        </div>
      )}
      {!isMobile && (
        <>
          <div className="hero-corner-accent top-left" />
          <div className="hero-corner-accent bottom-right" />
        </>
      )}

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
                  onClick={() => {
                    const s = document.getElementById("shop");
                    s
                      ? s.scrollIntoView({ behavior: "smooth" })
                      : window.scrollTo({
                          top: window.innerHeight,
                          behavior: "smooth",
                        });
                  }}
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
