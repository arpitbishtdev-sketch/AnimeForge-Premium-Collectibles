import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderApi, addressApi } from "../utils/api";
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
          ₹{((item.price || 0) * item.qty).toFixed(2)}
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
  const shipping = sub >= 999 ? 0 : sub > 0 ? 99 : 0;
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
            <span>₹{((i.price || 0) * i.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="ck-summary__divider" />
      <div className="ck-summary__row">
        <span>Subtotal</span>
        <span>₹{sub.toFixed(2)}</span>
      </div>
      <div className="ck-summary__row">
        <span>Shipping</span>
        <span className={shipping === 0 ? "ck-free" : ""}>
          {shipping === 0 ? "FREE" : `₹${shipping}`}
        </span>
      </div>
      {promo && (
        <div className="ck-summary__row ck-summary__row--disc">
          <span>Discount (FORGE10)</span>
          <span>−₹{discount.toFixed(2)}</span>
        </div>
      )}
      <div className="ck-summary__divider" />
      <div className="ck-summary__total">
        <span>Total</span>
        <span style={{ color: accent }}>₹{total.toFixed(2)}</span>
      </div>
      {shipping > 0 && (
        <div className="ck-summary__free-note">
          ⚡ ₹{(999 - sub).toFixed(0)} more for free shipping
        </div>
      )}
      <div className="ck-summary__trust">
        {["🔒 SSL Secure", "↩ Easy Returns", "⭐ 4.97 Rated"].map((b) => (
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
function StepDelivery({
  form,
  onChange,
  onNext,
  onBack,
  accent,
  savedAddresses,
  onSelectAddress,
}) {
  const ok =
    form.fullName &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.state &&
    form.pincode;

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

        {/* Saved addresses */}
        {savedAddresses.length > 0 && (
          <motion.div
            variants={fadeUp}
            custom={0.5}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: 24 }}
          >
            <p className="ck-section-label" style={{ marginBottom: 12 }}>
              Saved Addresses
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedAddresses.map((addr) => (
                <button
                  key={addr._id}
                  onClick={() => onSelectAddress(addr)}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid color-mix(in srgb,${accent} 30%,transparent)`,
                    borderRadius: 4,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Rajdhani,sans-serif",
                    fontSize: 13,
                    cursor: "pointer",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: accent }}>
                    {addr.label?.toUpperCase() || "ADDRESS"}
                  </strong>{" "}
                  — {addr.fullName}, {addr.addressLine1}, {addr.city},{" "}
                  {addr.state} {addr.pincode}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="ck-form-grid"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <Field
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="Arpit Sharma"
            accent={accent}
            req
          />
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="+91 98765 43210"
            type="tel"
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
            label="Street Address"
            name="addressLine1"
            value={form.addressLine1}
            onChange={onChange}
            placeholder="123 MG Road"
            accent={accent}
            req
          />
          <Field
            label="Landmark / Apt"
            name="addressLine2"
            value={form.addressLine2}
            onChange={onChange}
            placeholder="Near Metro Station"
            half
            accent={accent}
          />
          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={onChange}
            placeholder="Mumbai"
            half
            accent={accent}
            req
          />
          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={onChange}
            placeholder="Maharashtra"
            half
            accent={accent}
            req
          />
          <Field
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={onChange}
            placeholder="400001"
            half
            accent={accent}
            req
            inputMode="numeric"
            maxLength={6}
          />
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
function StepPayment({
  form,
  onChange,
  onNext,
  onBack,
  accent,
  items,
  deliveryForm,
  onOrderPlaced,
}) {
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState("razorpay"); // "razorpay" | "cod"
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");

  const sub = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  const shipping = sub >= 999 ? 0 : 99;
  const totalAmount = sub + shipping;

  // ── Load Razorpay script ─────────────────────────────────────────────
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── Place Order ──────────────────────────────────────────────────────
  const handlePlace = async () => {
    setError("");
    setPlacing(true);

    try {
      const orderItems = items.map((item) => ({
        product: item.productId || item.id,
        name: item.name,
        image: item.image || "",
        price: item.price,
        quantity: item.qty,
        variantIndex: item.variantIndex ?? null,
        variantValue: item.variantValue || null,
        variantType: item.variantType || null,
      }));

      const shippingAddress = {
        fullName: deliveryForm.fullName,
        phone: deliveryForm.phone,
        addressLine1: deliveryForm.addressLine1,
        addressLine2: deliveryForm.addressLine2 || "",
        city: deliveryForm.city,
        state: deliveryForm.state,
        pincode: deliveryForm.pincode,
        country: "India",
      };

      // ── COD ──────────────────────────────────────────────────────────
      if (payMethod === "cod") {
        const data = await orderApi.place({
          items: orderItems,
          shippingAddress,
          paymentMethod: "cod",
          customerNote: "",
        });
        onOrderPlaced(data.order);
        onNext();
        return;
      }

      // ── Razorpay ──────────────────────────────────────────────────────
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Razorpay load nahi hua. Internet check karo.");
        setPlacing(false);
        return;
      }

      // 1. Create order on backend
      const data = await orderApi.place({
        items: orderItems,
        shippingAddress,
        paymentMethod: "razorpay",
        customerNote: "",
      });

      const { order, razorpayOrderId } = data;

      // 2. Open Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: totalAmount * 100, // paise
        currency: "INR",
        name: "AnimeForge",
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: deliveryForm.fullName,
          email: deliveryForm.email,
          contact: deliveryForm.phone,
        },
        theme: { color: accent },
        handler: async (response) => {
          // 3. Verify payment
          await orderApi.verifyRazorpay({
            orderId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onOrderPlaced(order);
          onNext();
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setError("Payment cancel kiya. Dobara try karo.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Order place nahi hua. Dobara try karo.");
      setPlacing(false);
    }
  };

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
          Payment Method
        </motion.p>

        {error && (
          <div
            style={{
              background: "rgba(255,100,100,0.1)",
              border: "1px solid rgba(255,100,100,0.3)",
              borderRadius: 6,
              padding: "12px 16px",
              color: "#ff8888",
              fontFamily: "Rajdhani,sans-serif",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Payment Method Selection */}
        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 28 }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {[
              {
                id: "razorpay",
                label: "💳 Razorpay",
                sub: "Cards, UPI, Net Banking",
              },
              {
                id: "cod",
                label: "💵 Cash on Delivery",
                sub: "Pay when delivered",
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  textAlign: "left",
                  background:
                    payMethod === m.id
                      ? `color-mix(in srgb,${accent} 10%,transparent)`
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${payMethod === m.id ? accent : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: "Bebas Neue,cursive",
                    fontSize: 16,
                    letterSpacing: 1.5,
                    color: "#fff",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: "Rajdhani,sans-serif",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 3,
                  }}
                >
                  {m.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Order summary quick view */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 4,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Rajdhani,sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 8,
              }}
            >
              <span>
                Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)
              </span>
              <span>₹{sub.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Rajdhani,sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 12,
              }}
            >
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? "#4ade80" : "inherit" }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Bebas Neue,cursive",
                fontSize: 22,
                letterSpacing: 2,
              }}
            >
              <span style={{ color: "#fff" }}>Total</span>
              <span style={{ color: accent }}>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        <div className="ck-nav">
          <button className="ck-btn-back" onClick={onBack}>
            ← Back
          </button>
          <motion.button
            className={`ck-btn-primary ck-btn-place${placing ? " is-placing" : ""}`}
            onClick={handlePlace}
            disabled={placing}
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
                <span>
                  {payMethod === "cod"
                    ? "Place Order (COD)"
                    : "Pay with Razorpay"}
                </span>
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
function StepConfirm({ deliveryForm, items, accent, onHome, placedOrder }) {
  const orderRef = useRef(null);
  const orderNum = placedOrder?.orderNumber || "AF-XXXXXXXX";
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
          Your figures are being forged with care 🔥
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
          ["Name", deliveryForm.fullName, false],
          ["Phone", deliveryForm.phone, false],
          ["Ship to", `${deliveryForm.city}, ${deliveryForm.state}`, false],
          ["Items", items.reduce((s, i) => s + i.qty, 0), false],
          ["Total Paid", `₹${total.toFixed(2)}`, true],
          ["Est. Arrival", "5–10 business days", false],
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
              ₹{((i.price || 0) * i.qty).toFixed(2)}
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
  const { user } = useAuth();
  const { clearCart } = useCart();

  const themeAccent = activeCharacter?.gradient?.accent;
  const themeGlow = activeCharacter?.gradient?.glow;
  const accent = themeAccent || location?.state?.accent || "#ff8c00";
  const glow = themeGlow || location?.state?.glow || "rgba(255,140,0,0.3)";

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
    if (
      Array.isArray(location?.state?.cartItems) &&
      location.state.cartItems.length > 0
    )
      return location.state.cartItems;
    if (location?.state?.product) {
      const p = location.state.product;
      return [{ ...p, id: p.id || p._id || 1, qty: p.qty || 1 }];
    }
    return DEMO_ITEMS;
  };

  const [items, setItems] = useState(resolveInitialItems);
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [deliveryForm, setDeliveryForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [payForm, setPayForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const orb1 = useRef(null);
  const orb2 = useRef(null);

  // Load saved addresses if logged in
  useEffect(() => {
    if (user) {
      addressApi
        .getAll()
        .then((data) => setSavedAddresses(data.addresses || []))
        .catch(() => {});
    }
  }, [user]);

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

  const onDeliveryChange = useCallback((e) => {
    setDeliveryForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const onPayChange = useCallback((e) => {
    setPayForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  const onSelectAddress = (addr) => {
    setDeliveryForm((f) => ({
      ...f,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
  };

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

  const handleOrderPlaced = (order) => {
    setPlacedOrder(order);
    clearCart(); // Backend cart bhi clear ho jaati hai
  };

  return (
    <div className="checkout" style={{ "--accent": accent, "--glow": glow }}>
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

      <div
        className="ck-rule"
        style={{
          background: `linear-gradient(90deg,transparent,${accent} 40%,${accent} 60%,transparent)`,
        }}
      />

      <main className="ck-main">
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

        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          <StepBar step={step} accent={accent} />
        </motion.div>

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
                form={deliveryForm}
                onChange={onDeliveryChange}
                onNext={next}
                onBack={back}
                accent={accent}
                savedAddresses={savedAddresses}
                onSelectAddress={onSelectAddress}
              />
            )}
            {step === 3 && (
              <StepPayment
                form={payForm}
                onChange={onPayChange}
                onNext={next}
                onBack={back}
                accent={accent}
                items={items}
                deliveryForm={deliveryForm}
                onOrderPlaced={handleOrderPlaced}
              />
            )}
            {step === 4 && (
              <StepConfirm
                deliveryForm={deliveryForm}
                items={items}
                accent={accent}
                onHome={() => navigate("/")}
                placedOrder={placedOrder}
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
