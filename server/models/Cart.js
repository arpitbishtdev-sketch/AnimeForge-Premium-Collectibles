const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // If a variant is selected (size, color etc.)
    variantIndex: { type: Number, default: null }, // index in product.variants[]
    variantValue: { type: String, default: null }, // e.g. "XL", "Red"
    variantType: { type: String, default: null }, // e.g. "size", "color"

    quantity: { type: Number, required: true, min: 1, default: 1 },

    // Snapshot price at time of adding (in case product price changes later)
    priceAtAdd: { type: Number, required: true },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

// ── Virtual: total price ───────────────────────────────────────────────────
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0,
  );
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
