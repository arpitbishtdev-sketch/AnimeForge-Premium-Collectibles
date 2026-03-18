const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // snapshot
  image: { type: String, default: null }, // snapshot
  variantIndex: { type: Number, default: null },
  variantValue: { type: String, default: null },
  variantType: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true }, // snapshot price
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderNumber: {
      type: String,
      unique: true,
    },

    items: [orderItemSchema],

    // ── Shipping address snapshot ──────────────────────────────────────────
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: null },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // ── Pricing ────────────────────────────────────────────────────────────
    itemsTotal: { type: Number, required: true }, // sum of all items
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // final amount paid

    // ── Payment ────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "cod"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Gateway-specific IDs
    razorpay: {
      orderId: { type: String, default: null }, // razorpay order id
      paymentId: { type: String, default: null }, // razorpay payment id
      signature: { type: String, default: null }, // verification signature
    },

    stripe: {
      paymentIntentId: { type: String, default: null },
      clientSecret: { type: String, default: null },
    },

    paypal: {
      orderId: { type: String, default: null },
      captureId: { type: String, default: null },
    },

    // ── Order Status ───────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: [
        "pending", // just placed, payment not confirmed
        "confirmed", // payment confirmed
        "processing", // being packed
        "shipped", // dispatched
        "delivered", // delivered to customer
        "cancelled", // cancelled
        "refunded", // refunded
      ],
      default: "pending",
    },

    // ── Tracking ──────────────────────────────────────────────────────────
    trackingNumber: { type: String, default: null },
    courierName: { type: String, default: null },

    // ── Notes ─────────────────────────────────────────────────────────────
    customerNote: { type: String, default: null },
    adminNote: { type: String, default: null },

    // ── Timestamps ────────────────────────────────────────────────────────
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Auto-generate order number before save ─────────────────────────────────
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `AF-${timestamp}-${random}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
