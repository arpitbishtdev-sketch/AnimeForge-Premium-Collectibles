import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

function useAdaptiveAnimation() {
  return useMemo(() => {
    if (typeof window === "undefined")
      return {
        tier: "reduced",
        shouldAnimate: false,
        blurPx: 0,
        enableOrbs: false,
        enableGrain: false,
      };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return {
        tier: "reduced",
        shouldAnimate: false,
        blurPx: 4,
        enableOrbs: false,
        enableGrain: false,
      };

    const mem = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const sw = window.innerWidth;

    if (mem < 2 || cores <= 2 || sw < 640)
      return {
        tier: "low",
        shouldAnimate: true,
        blurPx: 8,
        enableOrbs: false,
        enableGrain: false,
      };

    if (mem < 4 || cores <= 4 || sw < 1024)
      return {
        tier: "mid",
        shouldAnimate: true,
        blurPx: 20,
        enableOrbs: true,
        enableGrain: false,
      };

    return {
      tier: "high",
      shouldAnimate: true,
      blurPx: 30,
      enableOrbs: true,
      enableGrain: true,
    };
  }, []);
}

// ═══════════════════════════════════════════════════════════════
//  RAF NUMBER TWEEN — ease-out-cubic, zero layout thrash
// ═══════════════════════════════════════════════════════════════
function useAnimatedNumber(target, ms = 420) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(null);
  const t0 = useRef(null);
  const from = useRef(target);

  useEffect(() => {
    const to = target;
    if (from.current === to) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    t0.current = null;
    const tick = (ts) => {
      if (!t0.current) t0.current = ts;
      const p = Math.min((ts - t0.current) / ms, 1);
      const e = 1 - (1 - p) ** 3;
      setDisplay(from.current + (to - from.current) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = to;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, ms]);

  return display;
}

// ═══════════════════════════════════════════════════════════════
//  ICONS (memo — never re-render)
// ═══════════════════════════════════════════════════════════════
const IcoTrash = memo(() => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
));
const IcoPlus = memo(() => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
));
const IcoMinus = memo(() => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
));
const IcoTruck = memo(() => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 11 16 14 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="13.5" cy="18.5" r="2.5" />
  </svg>
));
const IcoBag = memo(() => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
));
const IcoShield = memo(() => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
));
const IcoChevron = memo(() => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
));

// ═══════════════════════════════════════════════════════════════
//  MOTION VARIANTS
// ═══════════════════════════════════════════════════════════════
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
  exit: {
    opacity: 0,
    x: 32,
    scale: 0.97,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// ═══════════════════════════════════════════════════════════════
//  BACKGROUND — mirrors Hero.jsx 1:1
//  Orbs pushed to very low opacity so content is always readable
// ═══════════════════════════════════════════════════════════════
function CartBackground({ character, caps }) {
  const radialRef = useRef(null);
  const linearRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const prevId = useRef(null);
  const { gradient } = character || {};

  const applyGradient = useCallback((g) => {
    if (!g) return;
    if (radialRef.current) radialRef.current.style.background = g.radial;
    if (linearRef.current) linearRef.current.style.background = g.linear;
    if (orb1Ref.current) orb1Ref.current.style.background = g.accent;
    if (orb2Ref.current) orb2Ref.current.style.background = g.particle;
    if (orb3Ref.current) orb3Ref.current.style.background = g.glow;
  }, []);

  // Initial paint
  useEffect(() => {
    applyGradient(gradient);
    prevId.current = character?.id;
  }, []); // eslint-disable-line

  // GSAP crossfade on switch
  useEffect(() => {
    if (!gradient || !character?.id || prevId.current === character.id) return;
    prevId.current = character.id;
    const targets = [
      radialRef.current,
      linearRef.current,
      caps.enableOrbs ? orb1Ref.current : null,
      caps.enableOrbs ? orb2Ref.current : null,
      caps.enableOrbs ? orb3Ref.current : null,
    ].filter(Boolean);

    if (!caps.shouldAnimate) {
      applyGradient(gradient);
      return;
    }

    gsap
      .timeline()
      .to(targets, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => applyGradient(gradient),
      })
      .to(targets, { opacity: 1, duration: 0.65, ease: "power2.out" });
  }, [character?.id]); // eslint-disable-line

  return (
    <>
      <div className="cbg">
        <div className="cbg-radial" ref={radialRef} />
        <div className="cbg-linear" ref={linearRef} />
        {caps.enableOrbs && (
          <>
            <div className="cbg-orb cbg-o1" ref={orb1Ref} />
            <div className="cbg-orb cbg-o2" ref={orb2Ref} />
            <div className="cbg-orb cbg-o3" ref={orb3Ref} />
          </>
        )}
        <div className="cbg-grid" aria-hidden="true" />
        <div className="cbg-scanlines" aria-hidden="true" />
      </div>
      <div className="cbg-vignette" aria-hidden="true" />
      {/* Extra dark overlay so cart content always readable */}
      <div className="cbg-darkener" aria-hidden="true" />
      {caps.enableGrain && <div className="cbg-grain" aria-hidden="true" />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════
function EmptyState({ gradient, shouldAnimate }) {
  const accent = gradient?.accent || "#ff8c00";
  const glow = gradient?.glow || "rgba(255,140,0,0.6)";
  return (
    <motion.div
      className="cart-empty"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
    >
      <motion.div
        className="cart-empty-icon"
        style={{ color: accent }}
        animate={
          shouldAnimate
            ? {
                y: [0, -12, 0],
                filter: [
                  `drop-shadow(0 0 12px ${glow})`,
                  `drop-shadow(0 0 36px ${glow})`,
                  `drop-shadow(0 0 12px ${glow})`,
                ],
              }
            : { filter: `drop-shadow(0 0 16px ${glow})` }
        }
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <IcoBag />
      </motion.div>
      <p className="cart-empty-title">Your collection awaits</p>
      <p className="cart-empty-sub">
        Add premium collectibles to begin your order
      </p>
      <motion.button
        className="cart-empty-cta"
        whileHover={shouldAnimate ? { scale: 1.04 } : {}}
        whileTap={{ scale: 0.96 }}
      >
        Browse Collection <IcoChevron />
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CART ROW
//  Solid dark card — stays legible on ANY character background
// ═══════════════════════════════════════════════════════════════
const CartRow = memo(({ item, onUpdate, onRemove, shouldAnimate }) => {
  const lineTotal = useAnimatedNumber(item.price * item.quantity);

  return (
    <motion.div
      layout
      variants={rowVariants}
      className="cart-row"
      whileHover={
        shouldAnimate
          ? {
              y: -3,
              transition: { type: "spring", stiffness: 340, damping: 22 },
            }
          : {}
      }
    >
      {/* Left accent strip */}
      <div className="crow-strip" aria-hidden="true" />

      {/* Thumbnail */}
      <div className="crow-thumb">
        <motion.img
          src={item.image}
          alt={item.name}
          loading="lazy"
          draggable={false}
          whileHover={shouldAnimate ? { scale: 1.08 } : {}}
          transition={{ duration: 0.38 }}
        />
        <div className="crow-thumb-gloss" aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="crow-info">
        <span className="crow-cat">{item.category}</span>
        <h3 className="crow-name">{item.name}</h3>
        <span className="crow-unit-price">${item.price.toFixed(2)} each</span>
      </div>

      {/* Qty stepper */}
      <div className="crow-stepper">
        <motion.button
          className="stepper-btn"
          onClick={() => onUpdate(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
          whileHover={shouldAnimate ? { scale: 1.18 } : {}}
          whileTap={{ scale: 0.84 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
        >
          <IcoMinus />
        </motion.button>

        <motion.span
          key={item.quantity}
          className="stepper-num"
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          {item.quantity}
        </motion.span>

        <motion.button
          className="stepper-btn"
          onClick={() => onUpdate(item.id, item.quantity + 1)}
          aria-label="Increase quantity"
          whileHover={shouldAnimate ? { scale: 1.18 } : {}}
          whileTap={{ scale: 0.84 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
        >
          <IcoPlus />
        </motion.button>
      </div>

      {/* Line total */}
      <div className="crow-total-wrap">
        <span className="crow-total-label">Total</span>
        <span className="crow-total">${lineTotal.toFixed(2)}</span>
      </div>

      {/* Delete */}
      <motion.button
        className="crow-del"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        whileHover={shouldAnimate ? { scale: 1.12 } : {}}
        whileTap={{ scale: 0.86 }}
        transition={{ type: "spring", stiffness: 600, damping: 18 }}
      >
        <IcoTrash />
      </motion.button>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════
//  ORDER SUMMARY PANEL
// ═══════════════════════════════════════════════════════════════
const SummaryPanel = memo(
  ({ subtotal, shipping, tax, total, shouldAnimate, gradient }) => {
    const aSubtotal = useAnimatedNumber(subtotal);
    const aTax = useAnimatedNumber(tax);
    const aTotal = useAnimatedNumber(total);

    const btnBg = gradient
      ? `linear-gradient(135deg, ${gradient.accent}, ${gradient.particle})`
      : "linear-gradient(135deg, #ff8c00, #ffb300)";
    const glowClr = gradient?.glow || "rgba(255,140,0,0.5)";

    return (
      <motion.aside
        className="cart-summary"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Decorative chrome */}
        <div className="sum-top-line" aria-hidden="true" />
        <div className="sum-ring" aria-hidden="true" />
        <div className="sum-corner-bl" aria-hidden="true" />

        {/* Header */}
        <header className="sum-hdr">
          <div className="sum-hdr-left">
            <h2 className="sum-title">Order Summary</h2>
            <div className="sum-accent-bar" />
          </div>
        </header>

        {/* Line items */}
        <div className="sum-rows">
          <div className="sum-row">
            <span className="sum-lbl">Subtotal</span>
            <span className="sum-val">${aSubtotal.toFixed(2)}</span>
          </div>
          <div className="sum-row">
            <span className="sum-lbl">Shipping</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={shipping === 0 ? "free" : "paid"}
                className={`sum-val ${shipping === 0 ? "sum-free" : ""}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
              >
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="sum-row">
            <span className="sum-lbl">Tax (8%)</span>
            <span className="sum-val">${aTax.toFixed(2)}</span>
          </div>
        </div>

        <div className="sum-divider" />

        {/* Total */}
        <div className="sum-total-row">
          <span className="sum-total-lbl">Total</span>
          <span className="sum-total-val">${aTotal.toFixed(2)}</span>
        </div>

        {/* Checkout CTA — live character gradient */}
        <motion.button
          className="btn-checkout"
          style={{ background: btnBg, boxShadow: `0 4px 32px ${glowClr}` }}
          whileHover={
            shouldAnimate
              ? {
                  scale: 1.025,
                  boxShadow: `0 0 52px ${glowClr}, 0 10px 36px rgba(0,0,0,0.5)`,
                }
              : {}
          }
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
        >
          <span className="btn-sweep" aria-hidden="true" />
          <span className="btn-label">Proceed to Checkout</span>
          <motion.span
            className="btn-arrow"
            animate={shouldAnimate ? { x: [0, 5, 0] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.span>
        </motion.button>

        {/* Secondary CTA */}
        <button className="btn-continue">Continue Shopping</button>

        {/* Trust */}
        <div className="sum-trust">
          <span className="trust-icon">
            <IcoShield />
          </span>
          <div>
            <p className="trust-title">Secure Checkout</p>
            <p className="trust-sub">SSL Encrypted · 256-bit AES</p>
          </div>
        </div>
      </motion.aside>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
//  MAIN CART PAGE
// ═══════════════════════════════════════════════════════════════
export default function Cart() {
  const { activeCharacter } = useTheme();

  const caps = useAdaptiveAnimation();
  const pageRef = useRef(null);
  const gradient = activeCharacter?.gradient;
  const accentColor = gradient?.accent || "#ff8c00";
  const accentGlow = gradient?.glow || "rgba(255,140,0,0.6)";

  // Scope CSS vars to .cart-page — fires on every character switch
  useEffect(() => {
    const el = pageRef.current;
    if (!el || !gradient) return;
    el.style.setProperty("--accent", gradient.accent);
    el.style.setProperty("--accent-glow", gradient.glow);
    el.style.setProperty("--accent-p", gradient.particle);
    el.style.setProperty("--blur-px", `${caps.blurPx}px`);
  }, [activeCharacter?.id, gradient, caps.blurPx]);

  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    tax,
    total,
  } = useCart();

  const updateQty = (id, qty) => updateQuantity(id, qty);
  const removeItem = (id) => removeFromCart(id);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const freeAt = 200;
  const toFree = Math.max(freeAt - subtotal, 0);
  const pct = Math.min((subtotal / freeAt) * 100, 100);

  return (
    <div className="cart-page" ref={pageRef}>
      {/* Navbar */}
      <Navbar accentColor={accentColor} accentGlow={accentGlow} />

      {/* Background — GSAP crossfades on character switch */}
      <CartBackground character={activeCharacter} caps={caps} />

      <main className="cart-main">
        {/* ── Header ── */}
        <motion.header
          className="cart-hdr"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cart-hdr-inner">
            <div>
              <h1 className="cart-title">Shopping Cart</h1>
              <p className="cart-subtitle">
                {itemCount} Premium Item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="cart-title-line" />
        </motion.header>

        {/* ── Two-column layout ── */}
        <div className="cart-grid">
          {/* LEFT — items column */}
          <section className="cart-col-items">
            {/* section header row */}
            <div className="items-hdr">
              <motion.div
                key={itemCount}
                className="items-badge"
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 540, damping: 18 }}
              >
                {itemCount}
              </motion.div>
              <h2 className="items-hdr-label">Cart Items</h2>

              {/* Shipping progress inline */}
              {toFree > 0 && subtotal > 0 && (
                <div className="inline-ship">
                  <span className="inline-ship-txt">
                    <IcoTruck /> ${toFree.toFixed(0)} away from free shipping
                  </span>
                  <div className="inline-ship-track">
                    <motion.div
                      className="inline-ship-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items list */}
            <motion.div
              className="cart-list"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <EmptyState
                    gradient={gradient}
                    shouldAnimate={caps.shouldAnimate}
                  />
                ) : (
                  items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      onUpdate={updateQty}
                      onRemove={removeItem}
                      shouldAnimate={caps.shouldAnimate}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))
                )}
              </AnimatePresence>
            </motion.div>

            {/* Shipping banner — shows when under threshold */}
            <AnimatePresence>
              {shipping > 0 && items.length > 0 && (
                <motion.div
                  className="ship-banner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <span className="ship-icon">
                    <IcoTruck />
                  </span>
                  <div className="ship-body">
                    <p className="ship-main">
                      Add <strong>${toFree.toFixed(2)}</strong> more for{" "}
                      <strong>free worldwide shipping</strong>
                    </p>
                    <div className="ship-track">
                      <motion.div
                        className="ship-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="ship-pct">{Math.round(pct)}%</span>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* RIGHT — summary */}
          <SummaryPanel
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            shouldAnimate={caps.shouldAnimate}
            gradient={gradient}
          />
        </div>
      </main>
    </div>
  );
}
