const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // must have purchased to review
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: { type: String, trim: true, default: null },
    text: { type: String, required: true, trim: true },

    // Photos attached to review
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],

    helpful: { type: Number, default: 0 },
    helpfulVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isVerifiedBuyer: { type: Boolean, default: true },

    // For frontend sorting — snapshot of user's total spend at time of review
    userTotalSpend: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: true }, // admin can hide reviews
    isFeatured: { type: Boolean, default: false }, // auto-set by logic
  },
  { timestamps: true },
);

// ── One review per user per product ───────────────────────────────────────
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
