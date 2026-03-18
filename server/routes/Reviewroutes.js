const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { protectAdmin } = require("../middleware/authMiddleware");

const {
  getProductReviews,
  addReview,
  editReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  toggleApproval,
} = require("../controllers/reviewController");

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/product/:productId", getProductReviews);

// ── User (login required) ──────────────────────────────────────────────────
router.post("/", protect, addReview);
router.put("/:id", protect, editReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, markHelpful);

// ── Admin ──────────────────────────────────────────────────────────────────
router.get("/admin", protectAdmin, getAllReviews);
router.patch("/:id/approve", protectAdmin, toggleApproval);

module.exports = router;
