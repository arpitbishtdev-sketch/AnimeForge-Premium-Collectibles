import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   ANIMEFORGE — ADMIN LOGIN
   Pure frontend UI with Framer Motion animations.
   No backend calls. All handlers are stubs.
   ═══════════════════════════════════════════════════════════════ */

// ── Google SVG ─────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ── Spinner ────────────────────────────────────────────────────
const Spinner = ({ size = 18, color = "#fff" }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid rgba(255,255,255,0.2)`,
      borderTopColor: color,
      flexShrink: 0,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
  />
);

// ── Particle System ────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const COLORS = [
      [255, 55, 20],
      [255, 110, 40],
      [255, 170, 60],
      [255, 210, 90],
      [180, 60, 255],
    ];

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H + H,
      r: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.9 + 0.2),
      life: Math.random(),
      decay: Math.random() * 0.006 + 0.003,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.life = Math.random() * 0.6 + 0.3;
          p.vy = -(Math.random() * 0.9 + 0.2);
          p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        const [r, g, b] = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.life * 0.8})`;
        ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ── OTP Cell ───────────────────────────────────────────────────
function OtpCell({
  value,
  isFocused,
  isError,
  isSuccess,
  index,
  inputRef,
  onChange,
  onKeyDown,
  onFocus,
  disabled,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        type: "spring",
        stiffness: 300,
        damping: 22,
      }}
      style={{ position: "relative" }}
    >
      <motion.input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        disabled={disabled}
        animate={{
          scale: isFocused ? 1.08 : 1,
          borderColor: isError
            ? "rgba(255,80,80,0.9)"
            : isSuccess
              ? "rgba(80,220,120,0.9)"
              : isFocused
                ? "rgba(255,130,40,0.9)"
                : value
                  ? "rgba(255,110,40,0.5)"
                  : "rgba(255,95,50,0.15)",
          backgroundColor: isError
            ? "rgba(255,60,60,0.08)"
            : isSuccess
              ? "rgba(60,200,100,0.08)"
              : isFocused
                ? "rgba(255,100,30,0.06)"
                : value
                  ? "rgba(255,90,30,0.05)"
                  : "rgba(255,255,255,0.03)",
          boxShadow: isFocused
            ? "0 0 0 3px rgba(255,110,40,0.2), 0 0 24px rgba(255,90,20,0.15)"
            : isError
              ? "0 0 0 3px rgba(255,80,80,0.15)"
              : isSuccess
                ? "0 0 0 3px rgba(60,200,100,0.15)"
                : "none",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          width: 52,
          height: 62,
          borderRadius: 12,
          border: "1px solid",
          outline: "none",
          textAlign: "center",
          fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: isSuccess ? "#4ade80" : isError ? "#ff8080" : "#f5ede0",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.5 : 1,
          caretColor: "transparent",
          MozAppearance: "textfield",
        }}
      />
      {/* Fill indicator dot */}
      <AnimatePresence>
        {value && !isFocused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            style={{
              position: "absolute",
              bottom: 6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: isSuccess ? "#4ade80" : "#ff8040",
              boxShadow: `0 0 8px ${isSuccess ? "#4ade80" : "#ff8040"}`,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Resend Timer ───────────────────────────────────────────────
function ResendTimer({ onResend, disabled }) {
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const handleResend = () => {
    if (!canResend || disabled) return;
    onResend();
    setSeconds(30);
    setCanResend(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      {canResend ? (
        <motion.button
          onClick={handleResend}
          disabled={disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: "none",
            border: "none",
            color: "#ff8040",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            opacity: disabled ? 0.4 : 1,
          }}
        >
          Resend Code
        </motion.button>
      ) : (
        <span
          style={{
            color: "#4a3f36",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
          }}
        >
          Resend in{" "}
          <motion.span
            key={seconds}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: "#ff9a50",
              fontWeight: 700,
              fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
            }}
          >
            {seconds}s
          </motion.span>
        </span>
      )}
    </div>
  );
}

// ── Alert Banner ───────────────────────────────────────────────
function Alert({ type, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 10,
        marginBottom: 18,
        background:
          type === "error" ? "rgba(255,80,80,0.08)" : "rgba(60,200,100,0.08)",
        border: `1px solid ${type === "error" ? "rgba(255,80,80,0.25)" : "rgba(60,200,100,0.25)"}`,
        color: type === "error" ? "#ff9090" : "#6ee7a0",
        fontSize: 13,
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
        {type === "error" ? "⚠" : "✓"}
      </span>
      <span>{message}</span>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email | otp | success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusIdx, setFocusIdx] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [otpState, setOtpState] = useState("idle"); // idle | error | success

  const inputRefs = useRef([]);
  const emailRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX = useTransform(mouseX, [0, window.innerWidth], [-4, 4]);
  const cardY = useTransform(mouseY, [0, window.innerHeight], [-3, 3]);

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ── Stub handlers — wire to your real auth ──────────────────
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // stub
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Enter admin email");
      triggerShake();
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/auth/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpState("idle");
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } catch (err) {
      setError(err.message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length < 6) {
      setError("Enter complete OTP");
      setOtpState("error");
      triggerShake();
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(
        "http://localhost:5000/api/auth/admin/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: code }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("adminToken", data.token);

      setOtpState("success");

      setTimeout(() => {
        navigate("/admin");
      }, 800);
    } catch (err) {
      setOtpState("error");
      setError(err.message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpState("idle");
    setError("");
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // ── OTP cell logic ──────────────────────────────────────────
  const handleOtpChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const n = [...prev];
      n[index] = digit;
      return n;
    });
    setOtpState("idle");
    setError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setOtp((prev) => {
          const n = [...prev];
          n[index - 1] = "";
          return n;
        });
      }
      if (e.key === "ArrowLeft" && index > 0)
        inputRefs.current[index - 1]?.focus();
      if (e.key === "ArrowRight" && index < 5)
        inputRefs.current[index + 1]?.focus();
      if (e.key === "Enter") handleVerifyOtp();
    },
    [otp],
  );

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const otpComplete = otp.join("").length === 6;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Google Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+Antique:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* ── Root ── */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060710",
          fontFamily: "'Outfit', sans-serif",
          WebkitFontSmoothing: "antialiased",
          position: "relative",
          overflow: "hidden",
          padding: "20px",
        }}
      >
        {/* ── Background layers ── */}
        <ParticleField />

        {/* Ambient orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: "-15%",
            left: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            filter: "blur(90px)",
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(255,55,20,0.18), transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          style={{
            position: "fixed",
            bottom: "-15%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            filter: "blur(80px)",
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(160,50,255,0.12), transparent 70%)",
          }}
        />

        {/* Grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(255,85,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,40,0.04) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
            maskImage:
              "radial-gradient(ellipse 75% 75% at 50% 50%, black, transparent)",
          }}
        />

        {/* Kanji glyphs */}
        {[
          { char: "鍛", top: "8%", left: "4%", size: 220 },
          { char: "冶", bottom: "6%", right: "5%", size: 180 },
          { char: "炎", top: "45%", right: "2%", size: 120 },
        ].map(({ char, size, ...pos }) => (
          <motion.div
            key={char}
            animate={{ y: [0, -18, 0], opacity: [0.04, 0.07, 0.04] }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 4,
            }}
            style={{
              position: "fixed",
              ...pos,
              zIndex: 0,
              pointerEvents: "none",
              fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
              fontWeight: 900,
              fontSize: size,
              color: "rgba(255,95,40,0.06)",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            {char}
          </motion.div>
        ))}

        {/* Scanlines */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          }}
        />

        {/* ── Card ── */}
        <motion.div
          style={{
            rotateX: cardY,
            rotateY: cardX,
            z: 0,
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 440,
            perspective: 1200,
          }}
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.45 }}
            style={{
              background: "rgba(7, 9, 20, 0.80)",
              border: "1px solid rgba(255, 90, 40, 0.18)",
              borderRadius: 24,
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              boxShadow:
                "0 0 0 1px rgba(255,90,40,0.07), 0 40px 90px rgba(0,0,0,0.65), 0 0 80px rgba(255,55,20,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top accent bar */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #ff3c1f 20%, #ff7020 50%, #ffcc44 80%, transparent)",
              }}
            />

            {/* Corner brackets */}
            {[
              {
                top: 10,
                left: 10,
                borderWidth: "2px 0 0 2px",
                borderRadius: "5px 0 0 0",
              },
              {
                top: 10,
                right: 10,
                borderWidth: "2px 2px 0 0",
                borderRadius: "0 5px 0 0",
              },
              {
                bottom: 10,
                left: 10,
                borderWidth: "0 0 2px 2px",
                borderRadius: "0 0 0 5px",
              },
              {
                bottom: 10,
                right: 10,
                borderWidth: "0 2px 2px 0",
                borderRadius: "0 0 5px 0",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...s,
                  width: 18,
                  height: 18,
                  borderStyle: "solid",
                  borderColor: "rgba(255,110,40,0.45)",
                }}
              />
            ))}

            {/* Body */}
            <div style={{ padding: "44px 38px 38px" }}>
              {/* Brand */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ textAlign: "center", marginBottom: 32 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 8px 30px rgba(255,60,20,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                      "0 8px 50px rgba(255,60,20,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
                      "0 8px 30px rgba(255,60,20,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    marginBottom: 14,
                    background: "linear-gradient(145deg, #ff3c1f, #ff7020)",
                    fontSize: 26,
                  }}
                >
                  ⚔
                </motion.div>
                <div
                  style={{
                    fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: "0.1em",
                    background: "linear-gradient(135deg, #ffcc44, #f5ede0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ANIMEFORGE
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#5a4a3f",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  Admin Console
                </div>
              </motion.div>

              {/* Step dots */}
              <AnimatePresence>
                {step !== "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 7,
                      marginBottom: 28,
                    }}
                  >
                    {["email", "otp"].map((s, i) => {
                      const isActive =
                        (step === "email" && i === 0) ||
                        (step === "otp" && i === 1) ||
                        (step === "otp" && i === 0);
                      const isCurrent =
                        (step === "email" && i === 0) ||
                        (step === "otp" && i === 1);
                      return (
                        <motion.div
                          key={s}
                          animate={{
                            width: isCurrent ? 28 : 6,
                            background: isActive
                              ? isCurrent
                                ? "linear-gradient(90deg, #ff3c1f, #ff8030)"
                                : "rgba(255,100,40,0.5)"
                              : "rgba(255,255,255,0.08)",
                            boxShadow: isCurrent
                              ? "0 0 10px rgba(255,80,20,0.6)"
                              : "none",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          }}
                          style={{ height: 6, borderRadius: 3 }}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── STEPS ── */}
              <div style={{ minHeight: 300, position: "relative" }}>
                <AnimatePresence mode="wait">
                  {/* ── EMAIL STEP ── */}
                  {step === "email" && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -32 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div style={{ marginBottom: 24 }}>
                        <div
                          style={{
                            fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#f5ede0",
                            marginBottom: 6,
                          }}
                        >
                          Access the Forge
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#6a5a50",
                            lineHeight: 1.6,
                          }}
                        >
                          Authorised admins only. Sign in to manage your
                          platform.
                        </div>
                      </div>

                      {/* Google Button */}
                      <motion.button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        whileHover={{
                          scale: 1.015,
                          borderColor: "rgba(255,255,255,0.22)",
                        }}
                        whileTap={{ scale: 0.985 }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          padding: "13px 20px",
                          borderRadius: 13,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#f5ede0",
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: isLoading ? "not-allowed" : "pointer",
                          opacity: isLoading ? 0.6 : 1,
                          boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                          outline: "none",
                        }}
                      >
                        {isLoading ? (
                          <Spinner size={18} color="rgba(255,255,255,0.7)" />
                        ) : (
                          <GoogleIcon />
                        )}
                        {isLoading ? "Connecting…" : "Continue with Google"}
                      </motion.button>

                      {/* Divider */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          margin: "22px 0",
                        }}
                      >
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 1,
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,90,40,0.18), transparent)",
                            }}
                          />
                        ))}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#3a3028",
                            whiteSpace: "nowrap",
                          }}
                        >
                          or with email
                        </span>
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 1,
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,90,40,0.18), transparent)",
                            }}
                          />
                        ))}
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && <Alert type="error" message={error} />}
                      </AnimatePresence>

                      {/* Email field */}
                      <div style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#6a5a50",
                            marginBottom: 8,
                          }}
                        >
                          Admin Email
                        </label>
                        <motion.div
                          animate={{
                            boxShadow: email
                              ? "0 0 0 2px rgba(255,110,40,0.12), 0 0 20px rgba(255,80,20,0.07)"
                              : "none",
                          }}
                          style={{ borderRadius: 12, position: "relative" }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 16,
                              color: "#4a3830",
                              pointerEvents: "none",
                              zIndex: 1,
                              transition: "color 0.2s",
                            }}
                          >
                            ✉
                          </span>
                          <input
                            ref={emailRef}
                            type="email"
                            placeholder="forge@animeforge.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSendOtp()
                            }
                            disabled={isLoading}
                            autoFocus
                            style={{
                              width: "100%",
                              padding: "12px 14px 12px 44px",
                              borderRadius: 12,
                              border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(255,90,40,0.18)"}`,
                              background: "rgba(255,255,255,0.03)",
                              color: "#f5ede0",
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 14,
                              outline: "none",
                              transition: "border-color 0.2s, background 0.2s",
                              opacity: isLoading ? 0.6 : 1,
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor =
                                "rgba(255,120,50,0.7)")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = error
                                ? "rgba(255,80,80,0.5)"
                                : "rgba(255,90,40,0.18)")
                            }
                          />
                        </motion.div>
                      </div>

                      {/* Send OTP button */}
                      <motion.button
                        onClick={handleSendOtp}
                        disabled={isLoading || !email.trim()}
                        whileHover={
                          !isLoading && email.trim() ? { scale: 1.015 } : {}
                        }
                        whileTap={
                          !isLoading && email.trim() ? { scale: 0.985 } : {}
                        }
                        style={{
                          width: "100%",
                          padding: "14px 24px",
                          borderRadius: 13,
                          border: "none",
                          background:
                            isLoading || !email.trim()
                              ? "rgba(255,90,40,0.3)"
                              : "linear-gradient(135deg, #ff3c1f, #ff7520)",
                          color: "#fff",
                          fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          cursor:
                            isLoading || !email.trim()
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow:
                            !isLoading && email.trim()
                              ? "0 4px 28px rgba(255,60,20,0.4)"
                              : "none",
                          transition: "background 0.25s, box-shadow 0.25s",
                          outline: "none",
                          marginTop: 4,
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Spinner size={17} /> Sending Code…
                          </>
                        ) : (
                          "Send OTP Code →"
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* ── OTP STEP ── */}
                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 28 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Back */}
                      <div style={{ marginBottom: 20 }}>
                        <motion.button
                          onClick={() => {
                            setStep("email");
                            setError("");
                            setOtpState("idle");
                          }}
                          disabled={isLoading}
                          whileHover={{ x: -3 }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#5a4a40",
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            padding: "5px 8px",
                            borderRadius: 7,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            opacity: isLoading ? 0.4 : 1,
                            outline: "none",
                          }}
                        >
                          ← Back
                        </motion.button>
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <div
                          style={{
                            fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#f5ede0",
                            marginBottom: 6,
                          }}
                        >
                          Verify Your Identity
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#6a5a50",
                            lineHeight: 1.6,
                          }}
                        >
                          Code sent to{" "}
                          <span style={{ color: "#ffaa50", fontWeight: 600 }}>
                            {email}
                          </span>
                          <br />
                          Enter it below. Try{" "}
                          <span
                            style={{
                              fontFamily:
                                "'Zen Kaku Gothic Antique', sans-serif",
                              fontWeight: 700,
                              color: "#ff8040",
                            }}
                          >
                            123456
                          </span>{" "}
                          to demo success.
                        </div>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && <Alert type="error" message={error} />}
                      </AnimatePresence>

                      {/* OTP cells */}
                      <motion.div
                        onPaste={handleOtpPaste}
                        style={{
                          display: "flex",
                          gap: 9,
                          justifyContent: "center",
                          marginBottom: 4,
                        }}
                        animate={shake ? { x: [-8, 8, -6, 6, -2, 2, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        {otp.map((val, i) => (
                          <OtpCell
                            key={i}
                            index={i}
                            value={val}
                            isFocused={focusIdx === i}
                            isError={otpState === "error"}
                            isSuccess={otpState === "success"}
                            disabled={isLoading || otpState === "success"}
                            inputRef={(el) => (inputRefs.current[i] = el)}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onFocus={() => setFocusIdx(i)}
                          />
                        ))}
                      </motion.div>

                      {/* Resend */}
                      <ResendTimer
                        onResend={handleResend}
                        disabled={isLoading}
                      />

                      {/* Verify button */}
                      <motion.button
                        onClick={handleVerifyOtp}
                        disabled={
                          isLoading || !otpComplete || otpState === "success"
                        }
                        whileHover={
                          !isLoading && otpComplete ? { scale: 1.015 } : {}
                        }
                        whileTap={
                          !isLoading && otpComplete ? { scale: 0.985 } : {}
                        }
                        style={{
                          width: "100%",
                          padding: "14px 24px",
                          borderRadius: 13,
                          border: "none",
                          background:
                            otpState === "success"
                              ? "linear-gradient(135deg, #22c55e, #16a34a)"
                              : isLoading || !otpComplete
                                ? "rgba(255,90,40,0.3)"
                                : "linear-gradient(135deg, #ff3c1f, #ff7520)",
                          color: "#fff",
                          fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          cursor:
                            isLoading || !otpComplete
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow:
                            !isLoading && otpComplete
                              ? "0 4px 28px rgba(255,60,20,0.4)"
                              : "none",
                          transition: "all 0.3s",
                          marginTop: 22,
                          outline: "none",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Spinner size={17} /> Verifying…
                          </>
                        ) : otpState === "success" ? (
                          "✓ Verified!"
                        ) : (
                          "Verify & Enter →"
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* ── SUCCESS STEP ── */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.55,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      style={{ textAlign: "center", padding: "16px 0" }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, -12, 12, -6, 6, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        style={{
                          fontSize: 58,
                          marginBottom: 18,
                          display: "block",
                        }}
                      >
                        ⚡
                      </motion.div>
                      <div
                        style={{
                          fontFamily: "'Zen Kaku Gothic Antique', sans-serif",
                          fontWeight: 700,
                          fontSize: 22,
                          color: "#4ade80",
                          marginBottom: 10,
                        }}
                      >
                        Access Granted
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#5a7050",
                          lineHeight: 1.7,
                          marginBottom: 28,
                        }}
                      >
                        Forge initialised.
                        <br />
                        Redirecting to your console…
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          height: 2,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1.8, ease: "easeInOut" }}
                          style={{
                            height: "100%",
                            originX: 0,
                            borderRadius: 2,
                            background:
                              "linear-gradient(90deg, #22c55e, #4ade80)",
                            boxShadow: "0 0 12px rgba(74,222,128,0.6)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign: "center",
              marginTop: 18,
              fontSize: 11,
              color: "#2a221e",
              lineHeight: 1.8,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Restricted access · AnimeForge Admin v2.0
            <br />
            <a href="#" style={{ color: "#3a3028", textDecoration: "none" }}>
              Privacy
            </a>
            {" · "}
            <a href="#" style={{ color: "#3a3028", textDecoration: "none" }}>
              Report issue
            </a>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
