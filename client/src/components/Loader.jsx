import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdaptiveAnimation } from "../hooks/useAdaptiveAnimation";
import "../styles/Loader.css";

const CHARACTERS = [
  {
    id: "spiderman",
    name: "SPIDER-MAN",
    src: "https://res.cloudinary.com/dirixa5no/image/upload/v1772379494/spiderman2-Home_ndywih.png",
    accent: "#c0392b",
    glow: "rgba(192, 57, 43, 0.55)",
    radial:
      "radial-gradient(ellipse at 60% 40%, rgba(192,57,43,0.22) 0%, transparent 70%)",
    label: "NO WAY HOME",
  },
  {
    id: "naruto",
    name: "NARUTO",
    src: "https://res.cloudinary.com/dirixa5no/image/upload/v1772379492/naruto2-Home_rmcwii.png",
    accent: "#e67e22",
    glow: "rgba(230, 126, 34, 0.55)",
    radial:
      "radial-gradient(ellipse at 60% 40%, rgba(230,126,34,0.22) 0%, transparent 70%)",
    label: "SAGE MODE",
  },
  {
    id: "luffy",
    name: "LUFFY",
    src: "https://res.cloudinary.com/dirixa5no/image/upload/v1772379490/luffy-Home_asfxb7_ubp0bs.png",
    accent: "#2980b9",
    glow: "rgba(41, 128, 185, 0.55)",
    radial:
      "radial-gradient(ellipse at 60% 40%, rgba(41,128,185,0.22) 0%, transparent 70%)",
    label: "GEAR 5",
  },
  {
    id: "gojo",
    name: "GOJO",
    src: "https://res.cloudinary.com/dirixa5no/image/upload/v1772379430/Gojo2-Home_zhpkzy.png",
    accent: "#8e44ad",
    glow: "rgba(142, 68, 173, 0.55)",
    radial:
      "radial-gradient(ellipse at 60% 40%, rgba(142,68,173,0.22) 0%, transparent 70%)",
    label: "INFINITY",
  },
];

const BRAND = "ANIMEFORGE".split("");
const TOTAL_DURATION = 3200;
const CHAR_INTERVAL = 700;
const SEGMENTS = 12;

const characterVariants = {
  initial: { opacity: 0, scale: 0.88, y: 32, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    y: -20,
    filter: "blur(6px)",
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const floatVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 4, ease: "easeInOut", repeat: Infinity },
  },
};

const letterVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: 0.4 + i * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const loaderExitVariants = {
  initial: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: "blur(12px)",
    transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] },
  },
};

// ════════════════════════════════════════════════════════════════
// PARTICLES - DISABLED ON LOW-END
// ════════════════════════════════════════════════════════════════
const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 5,
  opacity: Math.random() * 0.4 + 0.1,
}));

function Particles({ accent }) {
  return (
    <div className="loader-particles">
      {PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          className="loader-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: accent,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ENERGY BAR
// ════════════════════════════════════════════════════════════════
function EnergyBar({ progress, accent }) {
  const filled = Math.round((progress / 100) * SEGMENTS);

  return (
    <div className="loader-energy-wrap">
      <div className="loader-energy-bar">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`loader-energy-seg ${i < filled ? "filled" : ""}`}
            style={
              i < filled
                ? { background: accent, boxShadow: `0 0 8px ${accent}` }
                : {}
            }
          />
        ))}
      </div>
      <div className="loader-energy-meta">
        <span className="loader-energy-label" style={{ color: accent }}>
          LOADING
        </span>
        <span className="loader-energy-pct" style={{ color: accent }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CORNER ACCENTS
// ════════════════════════════════════════════════════════════════
function CornerAccents({ accent, isLow }) {
  if (isLow) return null; // ← HIDE on low-end

  return (
    <>
      <div className="loader-corner top-left" style={{ borderColor: accent }} />
      <div
        className="loader-corner top-right"
        style={{ borderColor: accent }}
      />
      <div
        className="loader-corner bottom-left"
        style={{ borderColor: accent }}
      />
      <div
        className="loader-corner bottom-right"
        style={{ borderColor: accent }}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN LOADER
// ════════════════════════════════════════════════════════════════
export default function Loader({ onComplete, accentColor }) {
  const [charIndex, setCharIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);

  const startTime = useRef(Date.now());
  const rafRef = useRef(null);

  const { tier, shouldAnimate, enableOrbs, enableGrain } =
    useAdaptiveAnimation();
  const isLow = tier === "low" || tier === "reduced";

  const char = CHARACTERS[charIndex];
  const activeAccent = accentColor || char.accent;

  // ════════════════════════════════════════════════════════════════
  // PRELOAD IMAGES
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    CHARACTERS.forEach(({ src }) => {
      const img = new Image();
      img.src = src.replace("/upload/", "/upload/w_400,q_60,f_webp/");
    });
  }, []);

  // ════════════════════════════════════════════════════════════════
  // SMOOTH PROGRESS VIA RAF
  // ════════════════════════════════════════════════════════════════
  const tickProgress = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    const raw = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
    const eased = 100 * (1 - Math.pow(1 - raw / 100, 2.2));
    setProgress(eased);
    if (raw < 100) rafRef.current = requestAnimationFrame(tickProgress);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tickProgress);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tickProgress]);

  // ════════════════════════════════════════════════════════════════
  // CHARACTER ROTATION
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    const t = setInterval(
      () => setCharIndex((p) => (p + 1) % CHARACTERS.length),
      CHAR_INTERVAL,
    );
    return () => clearInterval(t);
  }, []);

  // ════════════════════════════════════════════════════════════════
  // COMPLETION
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 800);
    }, TOTAL_DURATION);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader-root"
          key="loader"
          variants={loaderExitVariants}
          initial="initial"
          exit="exit"
          style={{ "--accent": activeAccent, "--char-glow": char.glow }}
        >
          {/* ── Background ── */}
          <div className="loader-bg">
            <AnimatePresence mode="wait">
              <motion.div
                key={char.id + "-bg"}
                className="loader-bg-radial"
                style={{ background: char.radial }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            {!isLow && <div className="loader-bg-grid" />}
            {!isLow && <div className="loader-bg-scanlines" />}
            <div className="loader-bg-vignette" />
            {enableGrain && !isLow && <div className="loader-bg-grain" />}
          </div>

          {/* Particles — SKIP on low-end */}
          {!isLow && <Particles accent={char.glow} />}

          <CornerAccents accent={char.accent} isLow={isLow} />

          {/* ── Top bar ── */}
          <div className="loader-top-bar">
            <span
              className="loader-top-dot"
              style={{ background: char.accent }}
            />
            <span className="loader-top-label" style={{ color: char.accent }}>
              LIMITED EDITION DROP
            </span>
            <span
              className="loader-top-dot"
              style={{ background: char.accent }}
            />
          </div>

          {/* ── Character stage ── */}
          <div className="loader-stage">
            {/* Glow ring — SKIP on low-end */}
            {enableOrbs && !isLow && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={char.id + "-ring"}
                  className="loader-char-glow-ring"
                  style={{ background: char.glow }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            )}

            {/* Orbit rings — SKIP on low-end */}
            {!isLow && (
              <>
                <motion.div
                  className="loader-char-orbit"
                  style={{ borderColor: char.accent + "44" }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="loader-char-orbit loader-char-orbit--inner"
                  style={{ borderColor: char.accent + "28" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}

            {/* Character image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={char.id + "-char"}
                variants={characterVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="loader-char-wrap"
              >
                <motion.img
                  src={char.src}
                  alt={char.name}
                  className="loader-char-img"
                  variants={!isLow ? floatVariants : undefined}
                  animate={!isLow ? "animate" : undefined}
                  style={{
                    filter:
                      enableOrbs && !isLow
                        ? `drop-shadow(0 0 60px ${char.glow}) drop-shadow(0 0 120px ${char.glow})`
                        : `drop-shadow(0 4px 16px ${char.glow})`,
                  }}
                  draggable={false}
                  loading="eager"
                  decoding="async" // ← DON'T block page
                />
              </motion.div>
            </AnimatePresence>

            {/* Name plate */}
            <AnimatePresence mode="wait">
              <motion.div
                key={char.id + "-name"}
                className="loader-char-nameplate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <span
                  className="loader-char-sublabel"
                  style={{ color: char.accent }}
                >
                  {char.label}
                </span>
                <span
                  className="loader-char-name"
                  style={{
                    textShadow: enableOrbs ? `0 0 30px ${char.glow}` : "none",
                  }}
                >
                  {char.name}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Bottom HUD ── */}
          <div className="loader-hud">
            <div className="loader-brand">
              <div className="loader-brand-pre" style={{ color: char.accent }}>
                ⚡ ANIME
              </div>
              <div className="loader-brand-word">
                {BRAND.slice(5).map((letter, i) => (
                  <motion.span
                    key={letter + i}
                    className="loader-brand-letter"
                    custom={i}
                    variants={letterVariants}
                    initial="initial"
                    animate="animate"
                    style={{ color: i === 0 ? char.accent : "#fff" }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <div className="loader-brand-rule">
                <div
                  className="loader-rule-line"
                  style={{
                    background: `linear-gradient(to right, ${char.accent}, transparent)`,
                  }}
                />
                <div
                  className="loader-rule-diamond"
                  style={{
                    background: char.accent,
                    boxShadow: `0 0 8px ${char.accent}`,
                  }}
                />
                <div
                  className="loader-rule-line loader-rule-line--short"
                  style={{
                    background: `linear-gradient(to left, ${char.accent}, transparent)`,
                  }}
                />
              </div>
              <div className="loader-brand-tagline">
                Premium Anime Collectibles
              </div>
            </div>

            <EnergyBar progress={progress} accent={char.accent} />

            <div className="loader-char-dots">
              {CHARACTERS.map((c, i) => (
                <motion.div
                  key={c.id}
                  className={`loader-char-dot ${i === charIndex ? "active" : ""}`}
                  style={
                    i === charIndex
                      ? {
                          background: c.accent,
                          boxShadow: `0 0 8px ${c.accent}`,
                        }
                      : {}
                  }
                  animate={
                    i === charIndex ? { scale: [1, 1.3, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
