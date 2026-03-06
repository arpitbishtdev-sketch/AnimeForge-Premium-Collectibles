import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { useDeviceCapabilities } from "../hooks/useDeviceCapabilities";
import "../styles/Contact.css";

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const CONTACT_ITEMS = [
  {
    icon: "✉",
    label: "Email Us",
    value: "support@animeforge.store",
    sub: "Replies within 2 hours",
    accent: "#ff8c00",
  },
  {
    icon: "◎",
    label: "Discord Community",
    value: "discord.gg/animeforge",
    sub: "14k+ members online",
    accent: "#7c3aed",
  },
  {
    icon: "⟳",
    label: "Returns & Exchanges",
    value: "30-day hassle-free returns",
    sub: "No questions asked",
    accent: "#0ea5e9",
  },
  {
    icon: "⚡",
    label: "Custom Orders",
    value: "Bespoke commission pieces",
    sub: "4-8 week turnaround",
    accent: "#16a34a",
  },
];

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Standard global shipping is 7–14 business days. Express options available at checkout for 3–5 day delivery. All orders include tracking.",
  },
  {
    q: "Are the figures officially licensed?",
    a: "All AnimeForge pieces are officially licensed through our manufacturing partners. Each figure comes with an authenticity certificate.",
  },
  {
    q: "Can I request a specific character?",
    a: "Absolutely. Use our custom order form and our team will assess feasibility and pricing. We've fulfilled hundreds of custom commissions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa, Mastercard, PayPal, Apple Pay, and cryptocurrency (BTC, ETH). All transactions are SSL encrypted.",
  },
];

function FaqItem({ item, index, accentColor }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      el.style.maxHeight = el.scrollHeight + "px";
    } else {
      el.style.maxHeight = "0px";
    }
  }, [open]);

  return (
    <motion.div
      className={`contact-faq-item ${open ? "contact-faq-item--open" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      style={{ "--faq-accent": accentColor }}
    >
      <button
        className="contact-faq-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="contact-faq-icon">{open ? "−" : "+"}</span>
        <span className="contact-faq-q">{item.q}</span>
        <span className="contact-faq-arrow">{open ? "↑" : "↓"}</span>
      </button>
      <div className="contact-faq-body" ref={contentRef}>
        <p className="contact-faq-a">{item.a}</p>
      </div>
    </motion.div>
  );
}

export default function Contact({
  accentColor = "#ff8c00",
  accentGlow = "rgba(255,140,0,0.3)",
}) {
  const sectionRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Enquiry",
    message: "",
  });
  const [formStatus, setFormStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const [focused, setFocused] = useState(null);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormStatus("sending");
    await new Promise((r) => setTimeout(r, 1500));
    setFormStatus("sent");
    setFormData({
      name: "",
      email: "",
      subject: "General Enquiry",
      message: "",
    });
    setTimeout(() => setFormStatus(null), 4000);
  }, []);

  useEffect(() => {
    if (isLowEnd || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      if (orb1Ref.current)
        gsap.to(orb1Ref.current, {
          y: -50,
          x: 35,
          duration: 13,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      if (orb2Ref.current)
        gsap.to(orb2Ref.current, {
          y: 40,
          x: -30,
          duration: 17,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 6,
        });
    }, sectionRef);
    return () => ctx.revert();
  }, [isLowEnd, prefersReducedMotion]);

  useEffect(() => {
    if (!sectionRef.current) return;
    sectionRef.current.style.setProperty("--ct-accent", accentColor);
    sectionRef.current.style.setProperty("--ct-glow", accentGlow);
  }, [accentColor, accentGlow]);

  const SUBJECTS = [
    "General Enquiry",
    "Order Support",
    "Custom Commission",
    "Wholesale / Partnerships",
    "Press & Media",
  ];

  return (
    <section
      className="contact"
      id="contact"
      ref={sectionRef}
      style={{ "--ct-accent": accentColor, "--ct-glow": accentGlow }}
    >
      {/* Background */}
      <div className="ct-bg">
        <div className="ct-bg-radial" />
        <div className="ct-bg-grid" />
        <div className="ct-bg-scanlines" />
        <div className="ct-orb ct-orb--1" ref={orb1Ref} />
        <div className="ct-orb ct-orb--2" ref={orb2Ref} />
        <div className="ct-vignette" />
      </div>

      <div className="ct-deco-line ct-deco-line--left" />
      <div className="ct-deco-line ct-deco-line--right" />

      {/* Header */}
      <div className="ct-header">
        <motion.div
          className="ct-eyebrow"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <span className="ct-eyebrow-dot" />
          Get In Touch
        </motion.div>

        <motion.h2
          className="ct-title"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        >
          Contact
        </motion.h2>

        <motion.div
          className="ct-title-rule"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <div className="ct-rule-line" />
          <div className="ct-rule-diamond" />
          <div className="ct-rule-line ct-rule-line--short" />
        </motion.div>

        <motion.p
          className="ct-description"
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          Questions, custom orders, or just want to talk anime? We're here for
          it. Our team responds to every single message.
        </motion.p>
      </div>

      {/* Main layout */}
      <div className="ct-layout">
        {/* Left: Form */}
        <motion.div
          className="ct-form-wrap"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ct-form-header">
            <span className="ct-form-label">Send a Message</span>
            <div className="ct-form-header-rule" />
          </div>

          <form className="ct-form" onSubmit={handleSubmit} noValidate>
            {/* Name + Email row */}
            <div className="ct-form-row">
              <div
                className={`ct-field ${focused === "name" ? "ct-field--focused" : ""} ${formData.name ? "ct-field--filled" : ""}`}
              >
                <label className="ct-label">Name</label>
                <input
                  className="ct-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
                <div className="ct-input-border" />
              </div>

              <div
                className={`ct-field ${focused === "email" ? "ct-field--focused" : ""} ${formData.email ? "ct-field--filled" : ""}`}
              >
                <label className="ct-label">Email</label>
                <input
                  className="ct-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <div className="ct-input-border" />
              </div>
            </div>

            {/* Subject */}
            <div
              className={`ct-field ${focused === "subject" ? "ct-field--focused" : ""}`}
            >
              <label className="ct-label">Subject</label>
              <select
                className="ct-input ct-select"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => setFocused("subject")}
                onBlur={() => setFocused(null)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="ct-input-border" />
              <span className="ct-select-arrow">▾</span>
            </div>

            {/* Message */}
            <div
              className={`ct-field ${focused === "message" ? "ct-field--focused" : ""} ${formData.message ? "ct-field--filled" : ""}`}
            >
              <label className="ct-label">Message</label>
              <textarea
                className="ct-input ct-textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused(null)}
                placeholder="Tell us what's on your mind…"
                rows={5}
                required
              />
              <div className="ct-input-border" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`ct-submit-btn ${formStatus === "sending" ? "ct-submit-btn--sending" : ""} ${formStatus === "sent" ? "ct-submit-btn--sent" : ""}`}
              disabled={formStatus === "sending" || formStatus === "sent"}
            >
              <span className="ct-btn-shimmer" />
              <span className="ct-btn-text">
                {formStatus === "sending"
                  ? "Transmitting…"
                  : formStatus === "sent"
                    ? "✓ Message Sent!"
                    : "Send Message"}
              </span>
              {!formStatus && <span className="ct-btn-arrow">→</span>}
            </button>
          </form>
        </motion.div>

        {/* Right: Info + FAQ */}
        <div className="ct-right">
          {/* Contact items */}
          <motion.div
            className="ct-info-grid"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {CONTACT_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                className="ct-info-item"
                style={{
                  "--item-accent": item.accent,
                  "--item-glow": `${item.accent}55`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="ct-info-icon-wrap">
                  <span className="ct-info-icon">{item.icon}</span>
                </div>
                <div className="ct-info-text">
                  <span className="ct-info-label">{item.label}</span>
                  <span className="ct-info-value">{item.value}</span>
                  <span className="ct-info-sub">{item.sub}</span>
                </div>
                <div className="ct-info-arrow">→</div>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div
            className="ct-faq-wrap"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="ct-faq-header">
              <span className="ct-faq-label">FAQ</span>
              <div className="ct-faq-rule" />
            </div>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} item={faq} index={i} accentColor={accentColor} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="ct-corner ct-corner--tl" />
      <div className="ct-corner ct-corner--br" />
    </section>
  );
}
