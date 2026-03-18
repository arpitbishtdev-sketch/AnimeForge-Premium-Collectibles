const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/authMiddleware");

const {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  logout,
  adminLogin,
  verifyAdminOTP,
} = require("../controllers/userAuthController");

// ── Rate Limiters ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public Routes ──────────────────────────────────────────────────────────
router.post("/register", authLimiter, register);
router.get("/verify-email", verifyEmail);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// ── Admin Auth Routes ──────────────────────────────────────────────────────
router.post("/admin/login", authLimiter, adminLogin);
router.post("/admin/verify-otp", authLimiter, verifyAdminOTP);

// ── Protected Routes ───────────────────────────────────────────────────────
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

module.exports = router;