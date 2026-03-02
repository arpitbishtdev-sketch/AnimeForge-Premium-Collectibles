import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { PRODUCTS } from "../data/product";
import ProductCard from "./ProductCard";
import "../styles/Store.css";

// ── Section heading animation ─────────────────────────────────────────────
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// ── Store receives accentColor + accentGlow from App (same as Navbar/Hero) ─
export default function Store({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
}) {
  const sectionRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // ── Transition accent colour smoothly when character changes ──────────
  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.to(sectionRef.current, {
      "--store-accent": accentColor,
      duration: 0.6,
      ease: "power2.out",
    });
    sectionRef.current.style.setProperty("--store-accent", accentColor);
    sectionRef.current.style.setProperty("--store-glow", accentGlow);
  }, [accentColor, accentGlow]);

  // ── Ambient orb drift ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, {
        y: -50,
        x: 40,
        duration: 12,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(orb2Ref.current, {
        y: 60,
        x: -30,
        duration: 16,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3,
      });
      gsap.to(orb3Ref.current, {
        y: -35,
        x: -20,
        duration: 10,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 6,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="store"
      id="shop"
      ref={sectionRef}
      style={{
        "--store-accent": accentColor,
        "--store-glow": accentGlow,
      }}
    >
      {/* ── Background ── */}
      <div className="store-bg">
        <div className="store-bg-radial" />
        <div className="store-bg-grid" />
        <div className="store-bg-scanlines" />
        <div className="store-orb store-orb--1" ref={orb1Ref} />
        <div className="store-orb store-orb--2" ref={orb2Ref} />
        <div className="store-orb store-orb--3" ref={orb3Ref} />
        <div className="store-vignette" />
      </div>

      {/* ── Deco lines ── */}
      <div className="store-deco-line store-deco-line--left" />
      <div className="store-deco-line store-deco-line--right" />

      {/* ── Section header ── */}
      <div className="store-header">
        <motion.div
          className="store-eyebrow"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span className="store-eyebrow-dot" />
          Exclusive Collection
        </motion.div>

        <motion.h2
          className="store-title"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        >
          The Arsenal
        </motion.h2>

        <motion.div
          className="store-title-rule"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <div className="store-rule-line" />
          <div className="store-rule-diamond" />
          <div className="store-rule-line store-rule-line--short" />
        </motion.div>

        <motion.p
          className="store-description"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          Handpicked relics from the most iconic anime universes. Each piece is
          a limited edition — once they're gone, they're gone.
        </motion.p>

        {/* ── Stats bar ── */}
        <motion.div
          className="store-stats"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.4 }}
        >
          <div className="store-stat">
            <span className="store-stat-value">12k+</span>
            <span className="store-stat-label">Items Sold</span>
          </div>
          <div className="store-stat-divider" />
          <div className="store-stat">
            <span className="store-stat-value">4.9★</span>
            <span className="store-stat-label">Avg Rating</span>
          </div>
          <div className="store-stat-divider" />
          <div className="store-stat">
            <span className="store-stat-value">48h</span>
            <span className="store-stat-label">Fast Ship</span>
          </div>
          <div className="store-stat-divider" />
          <div className="store-stat">
            <span className="store-stat-value">Ltd.</span>
            <span className="store-stat-label">Stock Only</span>
          </div>
        </motion.div>
      </div>

      {/* ── Product grid ── */}
      <motion.div
        className="store-grid"
        variants={gridVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            accentColor={accentColor}
            accentGlow={accentGlow}
          />
        ))}
      </motion.div>

      {/* ── Footer CTA ── */}
      <motion.div
        className="store-footer-cta"
        variants={headingVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: 0.9 }}
      >
        <div className="store-footer-divider">
          <div className="store-footer-divider-line" />
          <span className="store-footer-divider-text">Explore More</span>
          <div className="store-footer-divider-line" />
        </div>

        <button className="store-view-all-btn">
          <span className="store-btn-shimmer" />
          <span>View Full Collection</span>
          <span className="store-btn-arrow">→</span>
        </button>

        <p className="store-footer-note">
          Free worldwide shipping on orders over $150
        </p>
      </motion.div>

      {/* ── Corner accents ── */}
      <div className="store-corner store-corner--tl" />
      <div className="store-corner store-corner--br" />
    </section>
  );
}
