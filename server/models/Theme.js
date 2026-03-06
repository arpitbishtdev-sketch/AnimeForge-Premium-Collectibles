const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["New", "Popular", "Rare", "Featured", "Bestseller", "Ultra Rare"],
      default: "New",
    },

    edition: {
      type: String,
      default: "",
    },

    subtitle: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: String,
      default: "",
    },

    carouselImages: [
      {
        type: String,
      },
    ],

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    accent: {
      type: String,
      required: true,
      default: "#ffffff",
    },

    glow: {
      type: String,
      required: true,
      default: "#ffffff",
    },

    particle: {
      type: String,
      default: "#ffffff",
    },

    radialGradient: {
      type: String,
      default: "",
    },

    linearGradient: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    model3d: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

themeSchema.pre("save", async function () {
  if (this.active) {
    await mongoose
      .model("Theme")
      .updateMany({ _id: { $ne: this._id } }, { active: false });
  }
});

module.exports = mongoose.model("Theme", themeSchema);
