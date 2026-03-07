const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    // e.g. "naruto", "jjk" — used to match against product tags
    tag: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Display fields
    label: { type: String, default: "" }, // "01", "02" ...
    subtitle: { type: String, default: "" }, // "Shinobi Universe"
    title: { type: String, required: true }, // "NARUTO"
    tagLine: { type: String, default: "" }, // "Hokage Edition"
    description: { type: String, default: "" }, // 1-line description

    // 3 bullet points (always exactly 3)
    points: {
      type: [String],
      validate: {
        validator: (v) => v.length === 3,
        message: "Exactly 3 points required",
      },
      default: ["", "", ""],
    },

    // Stats
    material: { type: String, default: "" }, // "Premium Resin"
    scaleFrom: { type: String, default: "" }, // "1/6"
    scaleTo: { type: String, default: "" }, // "1/50"

    // Accent color — pulled from StatusConfig by tag match
    accentColor: { type: String, default: "#7c5cff" },
    glowColor: { type: String, default: "rgba(124,92,255,0.4)" },
    particleColor: { type: String, default: "#a78bfa" },

    // Background image for the card (uploaded via Cloudinary)
    bgImage: { type: String, default: "" },

    badge: { type: String, default: "NEW" }, // "BEST SELLER", "HOT", etc.

    order: { type: Number, default: 0 }, // display order
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Collection", collectionSchema);
