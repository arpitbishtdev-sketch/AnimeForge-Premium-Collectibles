import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/Checkout.css";

// ─── Animation variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideIn = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Step bar ─────────────────────────────────────────────────────────────
function StepBar({ step, accent }) {
  const STEPS = ["Cart", "Delivery", "Payment", "Confirmed"];
  return (
    <div className="ck-stepbar">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="ck-stepbar__item">
            {i > 0 && (
              <div className="ck-stepbar__connector">
                <div
                  className="ck-stepbar__connector-fill"
                  style={{
                    width: done || active ? "100%" : "0%",
                    background: accent,
                  }}
                />
              </div>
            )}
            <div
              className={`ck-stepbar__bubble ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
              style={
                active || done
                  ? {
                      borderColor: accent,
                      color: active ? "#000" : accent,
                      background: active ? accent : "transparent",
                      boxShadow: active
                        ? `0 0 18px color-mix(in srgb,${accent} 50%,transparent)`
                        : "none",
                    }
                  : {}
              }
            >
              {done ? "✓" : n}
            </div>
            <span
              className="ck-stepbar__label"
              style={active ? { color: accent } : {}}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  half,
  accent,
  req,
  inputMode,
  maxLength,
  format,
}) {
  const [focused, setFocused] = useState(false);
  const handleChange = (e) => {
    let v = e.target.value;
    if (format) v = format(v);
    onChange({ target: { name, value: v } });
  };
  return (
    <div
      className={`ck-field${half ? " ck-field--half" : ""}${focused ? " is-focused" : ""}`}
      style={{ "--acc": accent }}
    >
      <label className="ck-field__label">
        {label}
        {req && <span className="ck-req">*</span>}
      </label>
      <input
        className="ck-field__input"
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        inputMode={inputMode}
        maxLength={maxLength}
      />
      <div className="ck-field__bar" />
    </div>
  );
}

// ─── Cart item row ────────────────────────────────────────────────────────
function CartRow({ item, accent, onRemove, onQty }) {
  return (
    <motion.div
      className="ck-cart-row"
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.35 }}
      style={{ "--acc": accent }}
    >
      <div
        className="ck-cart-row__thumb"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb,${accent} 18%,#080810), #080810)`,
        }}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <span className="ck-cart-row__initial">{item.name?.charAt(0)}</span>
        )}
        <span className="ck-cart-row__scale" style={{ background: accent }}>
          {item.scale || "1/6"}
        </span>
      </div>
      <div className="ck-cart-row__info">
        <div className="ck-cart-row__universe" style={{ color: accent }}>
          {item.universe || "Limited Edition"}
        </div>
        <div className="ck-cart-row__name">{item.name}</div>
        <div className="ck-cart-row__meta">
          {item.material || "Premium Resin"}
        </div>
      </div>
      <div className="ck-cart-row__controls">
        <div className="ck-qty">
          <button className="ck-qty__btn" onClick={() => onQty(item.id, -1)}>
            −
          </button>
          <span className="ck-qty__val">{item.qty}</span>
          <button className="ck-qty__btn" onClick={() => onQty(item.id, +1)}>
            +
          </button>
        </div>
        <div className="ck-cart-row__price" style={{ color: accent }}>
          ${((item.price || 0) * item.qty).toFixed(2)}
        </div>
        <button
          className="ck-cart-row__remove"
          onClick={() => onRemove(item.id)}
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────
function Summary({ items, accent, promo }) {
  const sub = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const shipping = sub >= 200 ? 0 : 12.99;
  const discount = promo ? sub * 0.1 : 0;
  const total = sub + shipping - discount;
  return (
    <aside className="ck-summary" style={{ "--acc": accent }}>
      <div className="ck-summary__head">
        <span className="ck-summary__title">Order Summary</span>
        <span className="ck-summary__count">
          {items.reduce((s, i) => s + i.qty, 0)} items
        </span>
      </div>
      <div className="ck-summary__items">
        {items.map((i) => (
          <div key={i.id} className="ck-summary__item">
            <span className="ck-summary__item-name">
              {i.name} <em>×{i.qty}</em>
            </span>
            <span>${((i.price || 0) * i.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="ck-summary__divider" />
      <div className="ck-summary__row">
        <span>Subtotal</span>
        <span>${sub.toFixed(2)}</span>
      </div>
      <div className="ck-summary__row">
        <span>Shipping</span>
        <span className={shipping === 0 ? "ck-free" : ""}>
          {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
        </span>
      </div>
      {promo && (
        <div className="ck-summary__row ck-summary__row--disc">
          <span>Discount (FORGE10)</span>
          <span>−${discount.toFixed(2)}</span>
        </div>
      )}
      <div className="ck-summary__divider" />
      <div className="ck-summary__total">
        <span>Total</span>
        <span style={{ color: accent }}>${total.toFixed(2)}</span>
      </div>
      {shipping > 0 && (
        <div className="ck-summary__free-note">
          ⚡ Add ${(200 - sub).toFixed(2)} more for free shipping
        </div>
      )}
      <div className="ck-summary__trust">
        {["🔒 SSL Secure", "↩ Free Returns", "⭐ 4.97 Rated"].map((b) => (
          <span key={b} className="ck-summary__badge">
            {b}
          </span>
        ))}
      </div>
    </aside>
  );
}

// ─── Step 1 — Cart ────────────────────────────────────────────────────────
function StepCart({ items, onQty, onRemove, onNext, accent }) {
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState(false);
  const [err, setErr] = useState(false);

  const apply = () => {
    if (code.trim().toUpperCase() === "FORGE10") {
      setPromo(true);
      setErr(false);
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2200);
    }
  };

  return (
    <div className="ck-layout">
      <div className="ck-layout__left">
        <motion.p
          className="ck-section-label"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          Review Items
        </motion.p>
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              className="ck-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ck-empty__icon">◈</div>
              <div className="ck-empty__text">Your forge is empty</div>
            </motion.div>
          ) : (
            items.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                accent={accent}
                onRemove={onRemove}
                onQty={onQty}
              />
            ))
          )}
        </AnimatePresence>

        <motion.div
          className="ck-promo"
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="visible"
          style={{ "--acc": accent }}
        >
          <p className="ck-section-label" style={{ marginBottom: 12 }}>
            Promo Code
          </p>
          <div
            className={`ck-promo__row${err ? " is-err" : ""}${promo ? " is-ok" : ""}`}
          >
            <input
              className="ck-promo__input"
              placeholder="e.g. FORGE10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={promo}
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
            <button
              className="ck-promo__btn"
              onClick={apply}
              disabled={promo}
              style={{
                color: promo ? "#000" : accent,
                background: promo ? accent : "transparent",
                borderColor: accent,
              }}
            >
              {promo ? "Applied ✓" : "Apply"}
            </button>
          </div>
          {promo && (
            <p className="ck-promo__ok" style={{ color: accent }}>
              10% discount applied!
            </p>
          )}
          {err && <p className="ck-promo__err">Invalid code. Try FORGE10</p>}
        </motion.div>
      </div>

      <div className="ck-layout__right">
        <Summary items={items} accent={accent} promo={promo} />
        <motion.button
          className="ck-btn-primary"
          variants={fadeUp}
          custom={6}
          initial="hidden"
          animate="visible"
          onClick={onNext}
          disabled={items.length === 0}
          style={{ "--acc": accent }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Continue to Delivery</span>
          <span className="ck-btn-arrow">→</span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Step 2 — Delivery ────────────────────────────────────────────────────
function StepDelivery({ form, onChange, onNext, onBack, accent }) {
  const ok =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.address &&
    form.city &&
    form.zip;
  return (
    <div className="ck-layout ck-layout--single">
      <div className="ck-layout__full">
        <motion.p
          className="ck-section-label"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          Shipping Address
        </motion.p>
        <motion.div
          className="ck-form-grid"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <Field
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            placeholder="Naruto"
            half
            accent={accent}
            req
          />
          <Field
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            placeholder="Uzumaki"
            half
            accent={accent}
            req
          />
          <Field
            label="Email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@mail.com"
            type="email"
            accent={accent}
            req
          />
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+1 555 000 0000"
            type="tel"
            accent={accent}
          />
          <Field
            label="Street Address"
            name="address"
            value={form.address}
            onChange={onChange}
            placeholder="123 Hidden Leaf Ave"
            accent={accent}
            req
          />
          <Field
            label="Apt / Suite"
            name="apt"
            value={form.apt}
            onChange={onChange}
            placeholder="Apt 7"
            half
            accent={accent}
          />
          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={onChange}
            placeholder="Konohagakure"
            half
            accent={accent}
            req
          />
          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={onChange}
            placeholder="Fire Country"
            half
            accent={accent}
          />
          <Field
            label="ZIP"
            name="zip"
            value={form.zip}
            onChange={onChange}
            placeholder="10001"
            half
            accent={accent}
            req
            inputMode="numeric"
          />
          <Field
            label="Country"
            name="country"
            value={form.country}
            onChange={onChange}
            placeholder="Japan"
            half
            accent={accent}
          />
        </motion.div>

        <motion.div
          className="ck-ship-methods"
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          <p className="ck-section-label" style={{ marginBottom: 14 }}>
            Shipping Method
          </p>
          {[
            {
              id: "standard",
              icon: "📦",
              label: "Standard",
              sub: "7–14 business days",
              price: "Free on orders $200+",
            },
            {
              id: "express",
              icon: "⚡",
              label: "Express",
              sub: "3–5 business days",
              price: "$24.99",
            },
            {
              id: "overnight",
              icon: "🚀",
              label: "Overnight",
              sub: "Next business day",
              price: "$49.99",
            },
          ].map((m) => (
            <label
              key={m.id}
              className={`ck-ship-opt${form.shipping === m.id ? " is-sel" : ""}`}
              style={
                form.shipping === m.id
                  ? {
                      "--acc": accent,
                      borderColor: accent,
                      background: `color-mix(in srgb,${accent} 7%,transparent)`,
                    }
                  : { "--acc": accent }
              }
            >
              <input
                type="radio"
                name="shipping"
                value={m.id}
                checked={form.shipping === m.id}
                onChange={onChange}
              />
              <span className="ck-ship-opt__icon">{m.icon}</span>
              <span className="ck-ship-opt__body">
                <span className="ck-ship-opt__label">{m.label}</span>
                <span className="ck-ship-opt__sub">{m.sub}</span>
              </span>
              <span className="ck-ship-opt__price">{m.price}</span>
              {form.shipping === m.id && (
                <span className="ck-ship-opt__check" style={{ color: accent }}>
                  ✓
                </span>
              )}
            </label>
          ))}
        </motion.div>

        <div className="ck-nav">
          <button className="ck-btn-back" onClick={onBack}>
            ← Back
          </button>
          <motion.button
            className="ck-btn-primary"
            onClick={onNext}
            disabled={!ok}
            style={{ "--acc": accent }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Continue to Payment</span>
            <span className="ck-btn-arrow">→</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 — Payment ─────────────────────────────────────────────────────
function StepPayment({ form, onChange, onNext, onBack, accent }) {
  const [placing, setPlacing] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const fmtCard = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  const fmtExpiry = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .slice(0, 5);

  const detectType = (n) => {
    const d = n.replace(/\s/g, "");
    if (/^4/.test(d)) return "VISA";
    if (/^5[1-5]/.test(d)) return "MASTERCARD";
    if (/^3[47]/.test(d)) return "AMEX";
    return "";
  };
  const cardType = detectType(form.cardNumber || "");

  const handlePlace = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPlacing(false);
    onNext();
  };

  const valid =
    (form.cardNumber || "").replace(/\s/g, "").length >= 15 &&
    (form.expiry || "").length === 5 &&
    (form.cvv || "").length >= 3 &&
    form.cardName;

  return (
    <div className="ck-layout ck-layout--single">
      <div className="ck-layout__full">
        <motion.p
          className="ck-section-label"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          Payment Details
        </motion.p>

        {/* Live card visual */}
        <motion.div
          className="ck-card-3d"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <div className={`ck-card-flip${flipped ? " is-flipped" : ""}`}>
            <div
              className="ck-card-face ck-card-face--front"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb,${accent} 22%,#0d0d1a) 0%, #0a0a16 60%, color-mix(in srgb,${accent} 10%,#080810) 100%)`,
              }}
            >
              <div className="ck-card-face__holo" />
              <div className="ck-card-face__chip">
                <div className="ck-chip-lines" />
              </div>
              <div className="ck-card-face__type" style={{ color: accent }}>
                {cardType || "◆◆◆◆"}
              </div>
              <div className="ck-card-face__num">
                {["••••", "••••", "••••", "••••"].map((_, i) => {
                  const parts = (form.cardNumber || "").replace(/\s/g, "");
                  const chunk = parts.slice(i * 4, (i + 1) * 4).padEnd(4, "•");
                  return <span key={i}>{chunk}</span>;
                })}
              </div>
              <div className="ck-card-face__bottom">
                <div>
                  <div className="ck-card-face__sub">Card Holder</div>
                  <div className="ck-card-face__val">
                    {form.cardName || "YOUR NAME"}
                  </div>
                </div>
                <div>
                  <div className="ck-card-face__sub">Expires</div>
                  <div className="ck-card-face__val">
                    {form.expiry || "MM/YY"}
                  </div>
                </div>
              </div>
              <div
                className="ck-card-face__glow"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, color-mix(in srgb,${accent} 20%,transparent), transparent 65%)`,
                }}
              />
            </div>
            <div
              className="ck-card-face ck-card-face--back"
              style={{
                background: `linear-gradient(135deg, #0a0a16, color-mix(in srgb,${accent} 12%,#0d0d1a))`,
              }}
            >
              <div className="ck-card-face__holo" />
              <div className="ck-card-back__stripe" />
              <div className="ck-card-back__cvv-wrap">
                <div className="ck-card-back__cvv-label">CVV</div>
                <div className="ck-card-back__cvv-box">
                  {"•".repeat((form.cvv || "").length || 3)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="ck-form-grid"
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          <Field
            label="Card Number"
            name="cardNumber"
            value={form.cardNumber || ""}
            accent={accent}
            onChange={(e) =>
              onChange({
                target: { name: "cardNumber", value: fmtCard(e.target.value) },
              })
            }
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            maxLength={19}
          />
          <Field
            label="Name on Card"
            name="cardName"
            value={form.cardName || ""}
            onChange={onChange}
            placeholder="Naruto Uzumaki"
            accent={accent}
          />
          <Field
            label="Expiry"
            name="expiry"
            value={form.expiry || ""}
            half
            accent={accent}
            onChange={(e) =>
              onChange({
                target: { name: "expiry", value: fmtExpiry(e.target.value) },
              })
            }
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
          />
          {/* CVV — flip card on focus */}
          <div
            className={`ck-field ck-field--half${flipped ? " is-focused" : ""}`}
            style={{ "--acc": accent }}
          >
            <label className="ck-field__label">CVV</label>
            <input
              className="ck-field__input"
              type="password"
              placeholder="•••"
              value={form.cvv || ""}
              onChange={(e) =>
                onChange({
                  target: {
                    name: "cvv",
                    value: e.target.value.replace(/\D/g, "").slice(0, 4),
                  },
                })
              }
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
            />
            <div className="ck-field__bar" />
          </div>
        </motion.div>

        <motion.div
          className="ck-altpay"
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
        >
          <div className="ck-altpay__divider">
            <div className="ck-altpay__line" />
            <span>or pay with</span>
            <div className="ck-altpay__line" />
          </div>
          <div className="ck-altpay__btns">
            {["PayPal", "Apple Pay", "Google Pay"].map((p) => (
              <button
                key={p}
                className="ck-altpay__btn"
                style={{
                  borderColor: `color-mix(in srgb,${accent} 28%,transparent)`,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="ck-nav">
          <button className="ck-btn-back" onClick={onBack}>
            ← Back
          </button>
          <motion.button
            className={`ck-btn-primary ck-btn-place${placing ? " is-placing" : ""}`}
            onClick={handlePlace}
            disabled={!valid || placing}
            style={{ "--acc": accent }}
            whileTap={{ scale: 0.97 }}
          >
            {placing ? (
              <span className="ck-placing">
                Processing
                <span className="ck-dots">
                  <b>.</b>
                  <b>.</b>
                  <b>.</b>
                </span>
              </span>
            ) : (
              <>
                <span>Place Order</span>
                <span className="ck-btn-arrow">→</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Confirmation ────────────────────────────────────────────────
function StepConfirm({ form, items, accent, onHome }) {
  const orderRef = useRef(null);
  const orderNum = useRef(
    "AF-" + Math.floor(100000 + Math.random() * 900000),
  ).current;
  const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  useEffect(() => {
    if (!orderRef.current) return;
    gsap.fromTo(
      orderRef.current,
      { scale: 0, opacity: 0, rotation: -15 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1,
        ease: "elastic.out(1,0.5)",
        delay: 0.35,
      },
    );
  }, []);

  return (
    <div className="ck-confirm">
      <motion.div
        className="ck-confirm__orb"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: `radial-gradient(circle, color-mix(in srgb,${accent} 28%,transparent), transparent 70%)`,
        }}
      />

      <div
        ref={orderRef}
        className="ck-confirm__check"
        style={{
          borderColor: accent,
          boxShadow: `0 0 50px color-mix(in srgb,${accent} 45%,transparent)`,
        }}
      >
        <span style={{ color: accent }}>✓</span>
      </div>

      <motion.div
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <h2 className="ck-confirm__title">Order Placed!</h2>
        <p className="ck-confirm__sub">
          Your figures are being forged with care
        </p>
      </motion.div>

      <motion.div
        className="ck-confirm__card"
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
        style={{ "--acc": accent }}
      >
        {[
          ["Order #", orderNum, true],
          ["Name", `${form.firstName} ${form.lastName}`, false],
          ["Email", form.email, false],
          [
            "Ship to",
            form.city ? `${form.city}, ${form.country || ""}` : "—",
            false,
          ],
          ["Items", items.reduce((s, i) => s + i.qty, 0), false],
          ["Total Paid", `$${total.toFixed(2)}`, true],
          ["Est. Arrival", "14–21 business days", false],
        ].map(([k, v, hi]) => (
          <div key={k} className="ck-confirm__row">
            <span>{k}</span>
            <span
              className={hi ? "ck-confirm__hi" : ""}
              style={hi ? { color: accent } : {}}
            >
              {v}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="ck-confirm__items"
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
      >
        {items.map((i) => (
          <div
            key={i.id}
            className="ck-confirm__item"
            style={{ "--acc": accent }}
          >
            <span
              className="ck-confirm__item-dot"
              style={{ background: accent }}
            />
            <span className="ck-confirm__item-name">{i.name}</span>
            <span className="ck-confirm__item-qty">×{i.qty}</span>
            <span style={{ color: accent }}>
              ${((i.price || 0) * i.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.button
        className="ck-btn-primary"
        variants={fadeUp}
        custom={4}
        initial="hidden"
        animate="visible"
        onClick={onHome}
        style={{ "--acc": accent }}
        whileTap={{ scale: 0.97 }}
      >
        <span>Back to Home</span>
        <span className="ck-btn-arrow">→</span>
      </motion.button>
    </div>
  );
}

// ─── Root — Checkout page ─────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCharacter } = useTheme();

  // ── Theme accent: ThemeContext is primary (matches rest of site),
  //    navigation state is the fallback for direct URL access
  const themeAccent = activeCharacter?.gradient?.accent;
  const themeGlow = activeCharacter?.gradient?.glow;
  const passedAccent = location?.state?.accent || "#ff8c00";
  const passedGlow = location?.state?.glow || "rgba(255,140,0,0.3)";

  const accent = themeAccent || passedAccent;
  const glow = themeGlow || passedGlow;
  const DEMO_ITEMS = [
    {
      id: 1,
      name: "Naruto Sage Mode",
      universe: "NARUTO",
      price: 149.99,
      qty: 1,
      scale: "1/6",
      material: "Premium Resin",
    },
    {
      id: 2,
      name: "Gojo Infinity",
      universe: "JUJUTSU KAISEN",
      price: 199.99,
      qty: 1,
      scale: "1/7",
      material: "ABS + PVC",
    },
  ];

  const resolveInitialItems = () => {
    // Cart page sends an array
    if (
      Array.isArray(location?.state?.cartItems) &&
      location.state.cartItems.length > 0
    ) {
      return location.state.cartItems;
    }
    // Buy Now sends a single product object
    if (location?.state?.product) {
      const p = location.state.product;
      return [{ ...p, id: p.id || p._id || 1, qty: p.qty || 1 }];
    }
    // Dev / direct URL fallback
    return DEMO_ITEMS;
  };

  const [items, setItems] = useState(resolveInitialItems);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    shipping: "standard",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const orb1 = useRef(null);
  const orb2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (orb1.current)
        gsap.to(orb1.current, {
          y: -60,
          x: 40,
          duration: 13,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      if (orb2.current)
        gsap.to(orb2.current, {
          y: 50,
          x: -35,
          duration: 17,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 4,
        });
    });
    return () => ctx.revert();
  }, []);

  const onChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const next = () => {
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onQty = (id, delta) =>
    setItems((p) =>
      p.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  const onRemove = (id) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <div className="checkout" style={{ "--accent": accent, "--glow": glow }}>
      {/* Background */}
      <div className="ck-bg">
        <div className="ck-bg__radial" />
        <div className="ck-bg__grid" />
        <div className="ck-bg__lines" />
        <div
          ref={orb1}
          className="ck-bg__orb ck-bg__orb--1"
          style={{ background: accent }}
        />
        <div
          ref={orb2}
          className="ck-bg__orb ck-bg__orb--2"
          style={{ background: accent }}
        />
        <div className="ck-bg__vignette" />
      </div>

      {/* Accent rule */}
      <div
        className="ck-rule"
        style={{
          background: `linear-gradient(90deg,transparent,${accent} 40%,${accent} 60%,transparent)`,
        }}
      />

      <main className="ck-main">
        {/* Page title */}
        <motion.div
          className="ck-page-title"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <h1 style={{ textShadow: `0 0 80px ${glow},0 0 160px ${glow}` }}>
            {["CHECKOUT", "DELIVERY", "PAYMENT", "CONFIRMED"][step - 1]}
          </h1>
          <div className="ck-title-rule">
            <div
              className="ck-title-rule__line"
              style={{
                background: `linear-gradient(to right,${accent},transparent)`,
              }}
            />
            <div
              className="ck-title-rule__diamond"
              style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
            />
            <div
              className="ck-title-rule__line ck-title-rule__line--r"
              style={{
                background: `linear-gradient(to left,${accent},transparent)`,
              }}
            />
          </div>
        </motion.div>

        {/* Step bar */}
        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <StepBar step={step} accent={accent} />
        </motion.div>

        {/* Step panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {step === 1 && (
              <StepCart
                items={items}
                onQty={onQty}
                onRemove={onRemove}
                onNext={next}
                accent={accent}
              />
            )}
            {step === 2 && (
              <StepDelivery
                form={form}
                onChange={onChange}
                onNext={next}
                onBack={back}
                accent={accent}
              />
            )}
            {step === 3 && (
              <StepPayment
                form={form}
                onChange={onChange}
                onNext={next}
                onBack={back}
                accent={accent}
                items={items}
              />
            )}
            {step === 4 && (
              <StepConfirm
                form={form}
                items={items}
                accent={accent}
                onHome={() => navigate("/")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="ck-corner ck-corner--tl" />
      <div className="ck-corner ck-corner--br" />
    </div>
  );
}
