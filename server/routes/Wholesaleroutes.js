const express = require("express");
const router = express.Router();
const { protect, protectAdmin } = require("../middleware/authMiddleware");
const {
  applyWholesale,
  getMyWholesaleStatus,
  getAllApplications,
  approveApplication,
  rejectApplication,
  setUserType,
} = require("../controllers/Wholesalecontroller");

// ── User routes ────────────────────────────────────────────────────────────
router.post("/apply", protect, applyWholesale);
router.get("/status", protect, getMyWholesaleStatus);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get("/admin/applications", protectAdmin, getAllApplications);
router.put("/admin/:userId/approve", protectAdmin, approveApplication);
router.put("/admin/:userId/reject", protectAdmin, rejectApplication);
router.put("/admin/:userId/set-type", protectAdmin, setUserType);

module.exports = router;