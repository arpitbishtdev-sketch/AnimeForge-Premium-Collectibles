import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import "./WishlistDrawer.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const HeartFilledIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CartIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BagIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Wishlist Item Card ─────────────────────────────────────────────────────
function WishlistItem({
  item,
  accent,
  glow,
  index,
  onRemove,
  onAddToCart,
  onBuyNow,
}) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      className="wl-item"
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          delay: index * 0.06,
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      exit={{
        opacity: 0,
        x: 60,
        scale: 0.95,
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ "--item-acc": accent }}
    >
      {/* Image */}
      <div className="wl-item__img-wrap">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="wl-item__img"
            loading="lazy"
          />
        ) : (
          <div className="wl-item__img-placeholder">
            <HeartFilledIcon />
          </div>
        )}
        {item.status && <span className="wl-item__status">{item.status}</span>}
        <div className="wl-item__img-shine" />
      </div>

      {/* Info */}
      <div className="wl-item__body">
        <div className="wl-item__universe">
          {item.universe || item.category || "Collection"}
        </div>
        <h3 className="wl-item__name">{item.name}</h3>

        <div className="wl-item__price-row">
          <span className="wl-item__price" style={{ color: accent }}>
            ₹{item.price?.toLocaleString("en-IN")}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <>
              <span className="wl-item__price-orig">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="wl-item__discount">
                −
                {Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) *
                    100,
                )}
                %
              </span>
            </>
          )}
        </div>

        {item.stock != null && item.stock <= 10 && (
          <div className="wl-item__stock">
            <span
              className="wl-item__stock-dot"
              style={{ background: item.stock <= 3 ? "#ef4444" : "#22c55e" }}
            />
            Only {item.stock} left
          </div>
        )}

        {/* Actions */}
        <div className="wl-item__actions">
          <button
            className={`wl-item__btn wl-item__btn--cart${added ? " wl-item__btn--added" : ""}`}
            onClick={handleAddToCart}
            style={{ "--b-acc": added ? "#22c55e" : accent }}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <CheckIcon /> Added!
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <CartIcon /> Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            className="wl-item__btn wl-item__btn--buy"
            onClick={() => onBuyNow(item)}
            style={{ background: accent, boxShadow: `0 0 16px ${glow}` }}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        className="wl-item__remove"
        onClick={() => onRemove(item.id)}
        aria-label="Remove"
      >
        <TrashIcon />
      </button>
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ accent, glow, onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="wl-empty"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="wl-empty__orb" style={{ background: glow }} />
      <div className="wl-empty__icon" style={{ color: accent }}>
        <BagIcon />
        <div
          className="wl-empty__icon-ring"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
          }}
        />
      </div>
      <div className="wl-empty__title">Your Wishlist Awaits</div>
      <div className="wl-empty__sub">
        Save your favourite figures here and revisit them anytime.
      </div>
      <button
        className="wl-empty__cta"
        onClick={() => {
          onClose();
          navigate("/collections");
        }}
        style={{ "--e-acc": accent, boxShadow: `0 0 28px ${glow}` }}
      >
        <span>Explore Collection</span>
        <ArrowIcon />
      </button>
    </motion.div>
  );
}

// ── Main Drawer ─────────────────────────────────────────────────────────────
export default function WishlistDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, closeWishlist, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { activeCharacter } = useTheme();
  const { addToCart } = useCart();

  const accent = activeCharacter?.gradient?.accent || "#ff8c00";
  const glow = activeCharacter?.gradient?.glow || "rgba(255,140,0,0.3)";

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") closeWishlist();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeWishlist]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Add to Cart — wired to CartContext ──
  const handleAddToCart = useCallback(
    (item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || null,
        category: item.universe || item.category || "",
        quantity: 1,
      });
    },
    [addToCart],
  );

  const handleBuyNow = useCallback(
    (item) => {
      closeWishlist();
      navigate("/checkout", {
        state: {
          product: {
            id: item.id,
            name: item.name,
            universe: item.universe || item.category || "Limited Edition",
            price: item.price,
            image: item.image,
            scale: item.scale || "1/6",
            material: item.material || "Premium Resin",
          },
          accent,
          glow,
        },
      });
    },
    [closeWishlist, navigate, accent, glow],
  );

  const total = items.reduce((s, i) => s + (i.price || 0), 0);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="wl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeWishlist}
          />

          {/* Drawer */}
          <motion.aside
            className="wl-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            style={{ "--acc": accent, "--glow": glow }}
            aria-label="Wishlist"
          >
            <div
              className="wl-drawer__top-bar"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              }}
            />
            <div className="wl-drawer__noise" />

            {/* Header */}
            <div className="wl-header">
              <div className="wl-header__left">
                <div
                  className="wl-header__icon"
                  style={{ color: accent, boxShadow: `0 0 20px ${glow}` }}
                >
                  <HeartFilledIcon />
                </div>
                <div>
                  <div className="wl-header__title">Wishlist</div>
                  <div className="wl-header__count">
                    {items.length} {items.length === 1 ? "item" : "items"} saved
                  </div>
                </div>
              </div>
              <div className="wl-header__right">
                {items.length > 0 && (
                  <button className="wl-header__clear" onClick={clearWishlist}>
                    Clear all
                  </button>
                )}
                <button
                  className="wl-header__close"
                  onClick={closeWishlist}
                  aria-label="Close wishlist"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div
              className="wl-divider"
              style={{
                background: `linear-gradient(90deg, ${accent}44, transparent)`,
              }}
            />

            {/* Body */}
            <div className="wl-body">
              {items.length === 0 ? (
                <EmptyState
                  accent={accent}
                  glow={glow}
                  onClose={closeWishlist}
                />
              ) : (
                <motion.div className="wl-list" layout>
                  <AnimatePresence mode="popLayout">
                    {items.map((item, i) => (
                      <WishlistItem
                        key={item.id}
                        item={item}
                        index={i}
                        accent={accent}
                        glow={glow}
                        onRemove={removeFromWishlist}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  className="wl-footer"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="wl-footer__summary">
                    <span className="wl-footer__label">Total Value</span>
                    <span
                      className="wl-footer__total"
                      style={{ color: accent }}
                    >
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    className="wl-footer__cta"
                    onClick={() => {
                      closeWishlist();
                      navigate("/collections");
                    }}
                    style={{ "--f-acc": accent, boxShadow: `0 0 32px ${glow}` }}
                  >
                    <span>Continue Shopping</span>
                    <ArrowIcon />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
