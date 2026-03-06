import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Reviews.css";

// ── Review data ────────────────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1,
    name: "Kenji Watanabe",
    handle: "@kenjiwfigures",
    avatar: "K",
    avatarColor: "#ff6b00",
    rating: 5,
    date: "Dec 2024",
    badge: "Verified Buyer",
    product: "Naruto Sage Mode — 1/6 Scale",
    text: "Absolutely insane quality. The detail on the sage markings is photorealistic. Ordered at 2AM and it arrived in 3 days. AnimeForge is the only store I trust for premium pieces.",
    helpful: 142,
    images: true,
    featured: true,
  },
  {
    id: 2,
    name: "Zara Ahmed",
    handle: "@zara.collects",
    avatar: "Z",
    avatarColor: "#7c3aed",
    rating: 5,
    date: "Jan 2025",
    badge: "Top Collector",
    product: "Gojo Satoru — Infinity Edition",
    text: "The Gojo figure broke my brain. I've spent thousands on figures and this is top-5 of all time. The translucent infinity domain effect is a technical achievement.",
    helpful: 203,
    images: true,
    featured: true,
  },
  {
    id: 3,
    name: "Marcus Steele",
    handle: "@marcusfigurehunter",
    avatar: "M",
    avatarColor: "#0ea5e9",
    rating: 5,
    date: "Nov 2024",
    badge: "Verified Buyer",
    product: "Luffy Gear 5 — Grand Line",
    text: "Gear 5 Luffy is EXACTLY what I wanted. The rubbery texture on the lightning effects is insane. Packaging was like a collector's box itself.",
    helpful: 89,
    images: false,
    featured: false,
  },
  {
    id: 4,
    name: "Priya Sharma",
    handle: "@priya_otaku",
    avatar: "P",
    avatarColor: "#e11d48",
    rating: 5,
    date: "Feb 2025",
    badge: "Verified Buyer",
    product: "Rengoku Flame Hashira — 1/7",
    text: "Set Ablaze edition is genuinely the most beautiful figure I own. The flame effect is hand-painted and glows under UV. Worth every single penny.",
    helpful: 167,
    images: true,
    featured: false,
  },
  {
    id: 5,
    name: "Tyler Brooks",
    handle: "@tylercollectshard",
    avatar: "T",
    avatarColor: "#16a34a",
    rating: 5,
    date: "Dec 2024",
    badge: "Elite Collector",
    product: "Eren Founding Titan — Final Season",
    text: "I was skeptical about the price but AnimeForge delivered something museum-quality. The Founding Titan veins are so detailed I had to use a magnifying glass.",
    helpful: 124,
    images: false,
    featured: false,
  },
  {
    id: 6,
    name: "Yuki Tanaka",
    handle: "@yukibuilds",
    avatar: "Y",
    avatarColor: "#f59e0b",
    rating: 5,
    date: "Jan 2025",
    badge: "Verified Buyer",
    product: "Ultra Instinct Goku — DBZ",
    text: "Ultra Instinct aura is incredible. The silver eyes glow under the light. I've bought from three different import stores — AnimeForge's QC is unmatched.",
    helpful: 98,
    images: true,
    featured: false,
  },
];

const STATS = [
  { value: "4.97", label: "Avg Rating", suffix: "★" },
  { value: "3.2k", label: "Reviews", suffix: "+" },
  { value: "98", label: "Recommend", suffix: "%" },
  { value: "12", label: "Countries", suffix: "+" },
];

// ── Star renderer ──────────────────────────────────────────────────────────
function Stars({ count = 5, accent = "#ff8c00" }) {
  return (
    <div className="rev-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`rev-star ${i < count ? "rev-star--filled" : ""}`}
          style={{ color: i < count ? accent : undefined }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────
function ReviewCard({ review, index, isFeatured }) {
  const cardRef = useRef(null);
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();
  const [liked, setLiked] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (isLowEnd || prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cardRef.current.style.setProperty("--mouse-x", `${x}%`);
      cardRef.current.style.setProperty("--mouse-y", `${y}%`);
    },
    [isLowEnd, prefersReducedMotion],
  );

  return (
    <motion.div
      ref={cardRef}
      className={`rev-card ${isFeatured ? "rev-card--featured" : ""}`}
      style={{
        "--card-accent": review.avatarColor,
        "--card-glow": `${review.avatarColor}55`,
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.65,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight */}
      <div className="rev-card-spotlight" />

      {/* Featured tag */}
      {isFeatured && (
        <div className="rev-featured-tag">
          <span>◆</span> Featured Review
        </div>
      )}

      {/* Top border */}
      <div className="rev-card-top-border" />

      {/* Header */}
      <div className="rev-card-header">
        <div className="rev-avatar" style={{ background: review.avatarColor }}>
          <span>{review.avatar}</span>
          <div
            className="rev-avatar-glow"
            style={{ background: review.avatarColor }}
          />
        </div>
        <div className="rev-user-info">
          <span className="rev-user-name">{review.name}</span>
          <span className="rev-user-handle">{review.handle}</span>
        </div>
        <div className="rev-badge">{review.badge}</div>
      </div>

      {/* Rating + date */}
      <div className="rev-meta">
        <Stars count={review.rating} accent={review.avatarColor} />
        <span className="rev-date">{review.date}</span>
      </div>

      {/* Product tag */}
      <div className="rev-product-tag">
        <span className="rev-product-icon">◆</span>
        {review.product}
      </div>

      {/* Text */}
      <blockquote className="rev-text">"{review.text}"</blockquote>

      {/* Footer */}
      <div className="rev-card-footer">
        <button
          className={`rev-helpful-btn ${liked ? "rev-helpful-btn--liked" : ""}`}
          onClick={() => setLiked((v) => !v)}
          style={liked ? { color: review.avatarColor } : {}}
        >
          <span className="rev-helpful-icon">{liked ? "♥" : "♡"}</span>
          <span>{liked ? review.helpful + 1 : review.helpful} helpful</span>
        </button>
        {review.images && (
          <span className="rev-has-images">
            <span>📷</span> Photos attached
          </span>
        )}
      </div>

      {/* Orb */}
      <div
        className="rev-card-orb"
        style={{ background: review.avatarColor }}
      />
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Reviews({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
}) {
  const sectionRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();

  useEffect(() => {
    if (isLowEnd || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      if (orb1Ref.current)
        gsap.to(orb1Ref.current, {
          y: -55,
          x: 30,
          duration: 15,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      if (orb2Ref.current)
        gsap.to(orb2Ref.current, {
          y: 45,
          x: -25,
          duration: 19,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 5,
        });
    }, sectionRef);
    return () => ctx.revert();
  }, [isLowEnd, prefersReducedMotion]);

  useEffect(() => {
    if (!sectionRef.current) return;
    sectionRef.current.style.setProperty("--rev-accent", accentColor);
    sectionRef.current.style.setProperty("--rev-glow", accentGlow);
  }, [accentColor, accentGlow]);

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const featured = REVIEWS.filter((r) => r.featured);
  const regular = REVIEWS.filter((r) => !r.featured);

  return (
    <section
      className="reviews"
      id="reviews"
      ref={sectionRef}
      style={{ "--rev-accent": accentColor, "--rev-glow": accentGlow }}
    >
      {/* Background */}
      <div className="rev-bg">
        <div className="rev-bg-radial" />
        <div className="rev-bg-grid" />
        <div className="rev-bg-scanlines" />
        <div className="rev-orb rev-orb--1" ref={orb1Ref} />
        <div className="rev-orb rev-orb--2" ref={orb2Ref} />
        <div className="rev-vignette" />
      </div>

      <div className="rev-deco-line rev-deco-line--left" />
      <div className="rev-deco-line rev-deco-line--right" />

      {/* Header */}
      <div className="rev-header">
        <motion.div
          className="rev-eyebrow"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span className="rev-eyebrow-dot" />
          Collector Testimonials
        </motion.div>

        <motion.h2
          className="rev-title"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        >
          The Verdict
        </motion.h2>

        <motion.div
          className="rev-title-rule"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <div className="rev-rule-line" />
          <div className="rev-rule-diamond" />
          <div className="rev-rule-line rev-rule-line--short" />
        </motion.div>

        <motion.p
          className="rev-description"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          3,200+ collectors. Every one of them obsessed. Read what the community
          says about our premium pieces.
        </motion.p>

        {/* Stats bar */}
        <motion.div
          className="rev-stats-bar"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.4 }}
        >
          {STATS.map((stat, i) => (
            <div key={i} className="rev-stat-item">
              <span className="rev-stat-val">
                {stat.value}
                <span className="rev-stat-suffix">{stat.suffix}</span>
              </span>
              <span className="rev-stat-lbl">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Featured reviews */}
      <div className="rev-featured-grid">
        {featured.map((r, i) => (
          <ReviewCard key={r.id} review={r} index={i} isFeatured={true} />
        ))}
      </div>

      {/* Divider */}
      <motion.div
        className="rev-section-divider"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rev-divider-line" />
        <span className="rev-divider-text">More Reviews</span>
        <div className="rev-divider-line" />
      </motion.div>

      {/* Regular reviews grid */}
      <div className="rev-grid">
        {regular.map((r, i) => (
          <ReviewCard key={r.id} review={r} index={i} isFeatured={false} />
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        className="rev-trust-row"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {[
          "Verified Reviews",
          "Secure Checkout",
          "Free Returns",
          "Global Shipping",
        ].map((badge, i) => (
          <div key={i} className="rev-trust-badge">
            <span className="rev-trust-check">✓</span>
            <span>{badge}</span>
          </div>
        ))}
      </motion.div>

      {/* Corner accents */}
      <div className="rev-corner rev-corner--tl" />
      <div className="rev-corner rev-corner--br" />
    </section>
  );
}
