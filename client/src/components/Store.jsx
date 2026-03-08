import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

import ProductCard from "./ProductCard";
import "../styles/Store.css";

import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import { createAbortableFetch } from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// ── Animation variants ────────────────────────────────────────────────────
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
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

// Each card: fade up + slight scale on scroll reveal
const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────
function contrastText(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#000" : "#fff";
  } catch (_) {
    return "#000";
  }
}

function hexToGlow(hex, alpha = 0.45) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch (_) {
    return `rgba(255,140,0,${alpha})`;
  }
}

function getStatusColor(product, statusMap, fallbackAccent, fallbackGlow) {
  const hex =
    product?.statusConfig?.color ||
    statusMap[(product?.status || "").toLowerCase().trim()] ||
    statusMap[(product?.badge || "").toLowerCase().trim()] ||
    null;

  if (!hex) return { bg: fallbackAccent, glow: fallbackGlow, text: "#000" };
  return { bg: hex, glow: hexToGlow(hex), text: contrastText(hex) };
}

// ── normalizeProduct — maps DB schema → consistent shape used by cart/checkout
function normalizeProduct(p) {
  return {
    id: p._id,
    name: p.name,
    // basePrice is the DB field; fall back chain for safety
    price: p.basePrice ?? p.price ?? 0,
    // images is [{ public_id, url }] — extract .url
    image: p.images?.[0]?.url || p.image || "",
    category: p.category || "Limited Edition",
    universe: p.universe || p.category || "Limited Edition",
    scale: p.scale || "1/6",
    material: p.material || "Premium Resin",
    slug: p.slug,
    status: p.status,
  };
}

export default function Store({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
  onOpenCart, // optional: called after Add to Cart to open CartDrawer
}) {
  const navigate = useNavigate();
  const { isLowEnd, prefersReducedMotion, isMobile } = useDeviceCapabilities();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted } =
    useWishlist();

  const sectionRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const particleCanvasRef = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});

  // ── Fetch status colors (live from admin) ─────────────────────────────
  const fetchStatusMap = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("status fetch failed");
      const data = await res.json();
      const map = {};
      data.forEach((s) => {
        map[s.status.toLowerCase()] = s.color;
      });
      setStatusMap(map);
    } catch (err) {
      console.warn("Could not load status colors:", err.message);
    }
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.getCollections({ displaySection: "shop" });
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Products fetch failed:", err);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Status colors on mount + on admin save ────────────────────────────
  useEffect(() => {
    const fetchStatusMap = async () => {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("status fetch failed");
        const data = await res.json();
        const map = {};
        data.forEach((s) => {
          map[s.status.toLowerCase()] = s.color;
        });
        setStatusMap(map);
        console.log("✅ Status colors loaded:", map);
      } catch (err) {
        console.warn("⚠️ Could not load status colors:", err.message);
        // Fallback colors
        setStatusMap({
          featured: "#22C55E",
          bestseller: "#F59E0B",
          popular: "#A855F7",
          rare: "#EF4444",
          "ultra-rare": "#FF007F",
          new: "#00C8FF",
        });
      }
    };

    fetchStatusMap();
    window.addEventListener("statusUpdated", fetchStatusMap);
    return () => window.removeEventListener("statusUpdated", fetchStatusMap);
  }, []);

  // ── Smooth accent transition ──────────────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    sectionRef.current.style.setProperty("--store-accent", accentColor);
    sectionRef.current.style.setProperty("--store-glow", accentGlow);
    gsap.to(sectionRef.current, {
      "--store-accent": accentColor,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [accentColor, accentGlow]);

  // ── Orb drift ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLowEnd || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      if (orb1Ref.current)
        gsap.to(orb1Ref.current, {
          y: -50,
          x: 40,
          duration: 12,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      if (orb2Ref.current)
        gsap.to(orb2Ref.current, {
          y: 60,
          x: -30,
          duration: 16,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 3,
        });
      if (orb3Ref.current)
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
  }, [isLowEnd]);

  // ── Particle canvas — LOOPING embers, visible top & bottom ───────────
  useEffect(() => {
    if (isLowEnd || prefersReducedMotion) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const hexToRgb = (hex) => {
      try {
        return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
      } catch (_) {
        return "255,140,0";
      }
    };

    /*
     * Particles spawn at bottom, rise to top, then WRAP BACK to bottom.
     * This keeps embers visible across the full height at all times —
     * no more disappearing at top.
     * life 0 = just spawned at bottom, life 1 = reached top → reset.
     */
    const particleCount = isLowEnd ? 0 : isMobile ? 0 : 40;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * W,
      y: H - Math.random() * H,
      r: Math.random() * 3.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.55,
      speed: Math.random() * 0.85 + 0.3,
      alpha: Math.random() * 0.65 + 0.3,
      wobble: Math.random() * Math.PI * 2,
      phase: Math.random(),
    }));

    const rgb = hexToRgb(accentColor);
    let raf;

    const animate = () => {
      ctx2d.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        p.wobble += 0.022;
        p.x += p.vx + Math.sin(p.wobble) * 0.45;
        p.y -= p.speed;
        p.phase = 1 - p.y / H; // 0 at bottom, 1 at top

        // Wrap: when ember leaves the top, respawn at bottom
        if (p.y < -p.r * 4) {
          p.y = H + p.r;
          p.x = Math.random() * W;
          p.wobble = Math.random() * Math.PI * 2;
          p.r = Math.random() * 3.2 + 0.8;
          p.speed = Math.random() * 0.85 + 0.3;
          p.alpha = Math.random() * 0.65 + 0.3;
          p.phase = 0;
        }

        // Fade: strong in middle, softer at very top (0..0.15) and very bottom (0.85..1)
        const raw = p.phase;
        const fade =
          raw < 0.12
            ? raw / 0.12 // fade in near bottom
            : raw > 0.82
              ? (1 - raw) / 0.18 // fade out near top
              : 1;

        const a = p.alpha * fade;
        if (a <= 0.01) return;

        // Glow halo
        const gr = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        gr.addColorStop(0, `rgba(${rgb},${Math.min(a * 0.85, 1)})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx2d.fillStyle = gr;
        ctx2d.fill();

        // Solid core
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(${rgb},${Math.min(a, 1)})`;
        ctx2d.fill();
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [isLowEnd, prefersReducedMotion, accentColor]);

  return (
    <section
      className="store"
      id="shop"
      ref={sectionRef}
      style={{ "--store-accent": accentColor, "--store-glow": accentGlow }}
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
        <canvas ref={particleCanvasRef} className="store-particles" />
      </div>

      {/* ── Deco lines ── */}
      <div className="store-deco-line store-deco-line--left" />
      <div className="store-deco-line store-deco-line--right" />

      {/* ── Plasma ring ── */}
      <div className="store-plasma-ring" aria-hidden="true">
        <div className="store-plasma-ring__inner" />
        <div className="store-plasma-ring__outer" />
      </div>

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

        <div className="store-title-glitch" aria-hidden="true">
          The Arsenal
        </div>

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
        {loading ? (
          <div className="store-loading">
            <div className="store-loading-ring" />
            <p>Loading products...</p>
          </div>
        ) : (
          products.map((product) => {
            const sc = getStatusColor(
              product,
              statusMap,
              accentColor,
              accentGlow,
            );

            return (
              <motion.div
                key={product._id}
                className="store-card-wrapper"
                variants={cardVariants}
                style={{
                  "--card-status-bg": sc.bg,
                  "--card-status-glow": sc.glow,
                  "--card-status-text": sc.text,
                }}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: -8,
                        scale: 1.018,
                        transition: {
                          type: "spring",
                          stiffness: 320,
                          damping: 22,
                        },
                      }
                }
              >
                <ProductCard
                  product={product}
                  accentColor={accentColor}
                  accentGlow={accentGlow}
                  onAddToCart={() => {
                    addToCart(normalizeProduct(product));
                    onOpenCart?.();
                  }}
                />

                {/* ── Card footer: Buy Now · Add to Cart · Wishlist ── */}
                <div className="store-card-footer">
                  {/* Buy Now */}
                  <button
                    className="store-btn-buy-now"
                    onClick={() => {
                      const np = normalizeProduct(product);
                      navigate("/checkout", {
                        state: {
                          product: np,
                          accent: accentColor,
                          glow: accentGlow,
                        },
                      });
                    }}
                  >
                    <span className="buy-pulse buy-pulse--1" />
                    <span className="buy-pulse buy-pulse--2" />
                    <span className="buy-pulse buy-pulse--3" />
                    <span className="buy-shimmer" aria-hidden="true" />
                    <span className="buy-spark" aria-hidden="true">
                      ⚡
                    </span>
                    <span className="buy-label">Buy Now</span>
                    <span className="buy-arrow">→</span>
                  </button>

                  {/* Add to Cart */}
                  <button
                    className="store-btn-cart"
                    title="Add to Cart"
                    onClick={() => {
                      addToCart(normalizeProduct(product));
                      onOpenCart?.();
                    }}
                  >
                    🛒
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    className={`store-btn-wishlist${isWishlisted(product._id) ? " store-btn-wishlist--active" : ""}`}
                    title={
                      isWishlisted(product._id)
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                    }
                    onClick={() => toggleWishlist(normalizeProduct(product))}
                  >
                    {isWishlisted(product._id) ? "♥" : "♡"}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
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

        <button
          className="store-view-all-btn"
          onClick={() => navigate("/collections")}
        >
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
