const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { protectAdmin } = require("../middleware/authMiddleware");

const {
  placeOrder,
  verifyRazorpay,
  stripeWebhook,
  capturePayPal,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// ── Stripe webhook (raw body needed — registered in server.js before express.json()) ──
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get("/", protectAdmin, getAllOrders);          
router.put("/:id/status", protectAdmin, updateOrderStatus);   

// ── User routes ────────────────────────────────────────────────────────────
router.post("/place", protect, placeOrder);
router.post("/verify/razorpay", protect, verifyRazorpay);
router.post("/capture/paypal", protect, capturePayPal);
router.get("/my", protect, getMyOrders);
router.patch("/:id/cancel", protect, cancelOrder);
router.get("/:id", protect, getOrderById);            

module.exports = router;
