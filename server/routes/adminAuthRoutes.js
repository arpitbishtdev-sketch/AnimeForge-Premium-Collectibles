const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  adminLogin,
  verifyAdminOTP,
} = require("../controllers/adminAuthController");

// ── Rate Limiters ──────────────────────────────────────────────────────────

// Max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Max 10 OTP attempts per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many OTP attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ─────────────────────────────────────────────────────────────────

// STEP 1: Email + Password → sends OTP
router.post("/login", loginLimiter, adminLogin);

// STEP 2: Email + OTP → returns JWT
router.post("/verify-otp", otpLimiter, verifyAdminOTP);

module.exports = router;
