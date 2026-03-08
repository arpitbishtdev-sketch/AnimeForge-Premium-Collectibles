import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import "../styles/ProductCard.css";

// ── Card entrance (consumed by parent stagger) ─────────────────────────────
export const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ProductCard({ product, accentColor, accentGlow }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const tagColor = product.themeColor || product.color || "#ff8c00";
  const tagGlow = `${tagColor}55`;
  if (!product.isActive) return null;

  /* ── GSAP 3D tilt + magnetic glow ── */
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const nx = (e.clientX - left) / width - 0.5;
    const ny = (e.clientY - top) / height - 0.5;
    gsap.to(glowRef.current, {
      x: nx * 70,
      y: ny * 70,
      duration: 0.55,
      ease: "power3.out",
    });
    gsap.to(card, {
      rotateY: nx * 7,
      rotateX: -ny * 5,
      duration: 0.45,
      ease: "power3.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(glowRef.current, {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: "elastic.out(1,0.5)",
    });
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <motion.div
      className="product-card"
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ "--tag-color": tagColor, "--tag-glow": tagGlow }}
      whileHover={{
        y: -10,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* ── Magnetic glow orb (follows cursor) ── */}
      <div
        className="pc-glow-orb"
        ref={glowRef}
        style={{ background: tagColor }}
      />

      {/* ── Image area ── */}
      <div className="pc-image-wrap">
        <img
          src={(product.images?.[0]?.url || "/placeholder.webp").replace(
            "/upload/",
            "/upload/w_600,q_70,f_webp/",
          )}
          alt={product.name}
          className="pc-image"
          loading="lazy"
          draggable={false}
        />

        {/* Bottom gradient — blends image into card body */}
        <div className="pc-image-overlay" />

        {/* Top gradient — darkens top for badge legibility */}
        <div className="pc-image-top-fade" />

        {/* Tag badge — top right */}
        <span className="pc-tag" style={{ background: tagColor }}>
          {product.status && product.status !== "active"
            ? product.status.toUpperCase()
            : null}
        </span>

        {/* Quick actions — bottom right, slide up on hover */}
        <div className="pc-quick-actions">
          <button className="pc-action-btn" aria-label="Wishlist">
            ♡
          </button>
          <button
            className="pc-action-btn pc-action-btn--primary"
            style={{ background: tagColor }}
            aria-label="Quick view"
          >
            ⊕
          </button>
        </div>

        {/* Accent glow border that pulses on hover */}
        <div className="pc-image-border-glow" />
      </div>

      {/* ── Card body ── */}
      <div className="pc-body">
        {/* Category */}
        <div className="pc-category">
          <span className="pc-category-dot" />
          {product.category}
        </div>

        {/* Name */}
        <h3 className="pc-name">{product.name}</h3>

        {/* Subtitle */}
        <p className="pc-subtitle">{product.description}</p>

        {/* Divider */}
        <div className="pc-rule">
          <div className="pc-rule-line" />
          <div className="pc-rule-diamond" />
        </div>

        {/* Price + CTA */}
        <div className="pc-footer">
          <div className="pc-price-wrap">
            <span className="pc-price-currency">₹</span>

            <span className="pc-price">{product.basePrice}</span>

            {product.originalPrice &&
              product.originalPrice > product.basePrice && (
                <span className="pc-price-original">
                  ₹{product.originalPrice}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* ── Corner accents (reveal on hover) ── */}
      <div className="pc-corner pc-corner--tl" />
      <div className="pc-corner pc-corner--br" />
    </motion.div>
  );
}
