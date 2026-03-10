const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },

    images: [{ public_id: String, url: String }],

    basePrice: { type: Number, required: true },
    originalPrice: { type: Number },

    stock: { type: Number, default: 0 },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one tag is required",
      },
    },

    status: {
      type: String,
      enum: ["new", "popular", "rare", "featured", "bestseller", "ultra-rare"],
      default: "new",
    },

    themeColor: { type: String },
    isActive: { type: Boolean, default: true },

    displaySection: {
      type: String,
      enum: ["shop", "collection"],
      default: "collection",
    },

    // ── Variant Group ──────────────────────────────────────────────────────
    // Links TWO OR MORE independent products together as "versions of each other".
    // Set the same string on both products — e.g. "dodge-challenger-series".
    // Both products appear as full separate cards in collections/search/shop.
    // On the product detail page, siblings show in an "Other Versions" row.
    variantGroup: { type: String, trim: true, index: true },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    variants: [
      {
        type: {
          type: String,
          enum: ["size", "color", "material", "custom"],
          default: "size",
        },
        value: { type: String, required: true, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        tags: [{ type: String, trim: true }],
        priceModifier: { type: Number, default: 0 },
        stock: { type: Number, default: 0, min: 0 },
        adminNotes: { type: String, trim: true },
        category: { type: String, trim: true },
        displaySection: { type: String, enum: ["shop", "collection", ""] },
        status: {
          type: String,
          enum: [
            "new",
            "popular",
            "rare",
            "featured",
            "bestseller",
            "ultra-rare",
            "",
          ],
        },
        image: {
          url: { type: String },
          public_id: { type: String },
        },
        images: [
          {
            url: { type: String },
            public_id: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

productSchema.pre("save", function () {
  this.isActive = this.stock > 0;
  if (!this.themeColor) this.themeColor = "#ff8c00";
});

module.exports = mongoose.model("Product", productSchema);
