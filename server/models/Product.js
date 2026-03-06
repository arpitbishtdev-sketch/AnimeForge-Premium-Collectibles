const mongoose = require("mongoose");

/* ─────────────────────────────
   Product Schema
───────────────────────────── */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    basePrice: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
    },

    stock: {
      type: Number,
      default: 0,
    },

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

    themeColor: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displaySection: {
      type: String,
      enum: ["shop", "collection"],
      default: "collection",
    },

    /*   Add these for review optimization */
    averageRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/* Auto theme color mapping */
productSchema.pre("save", async function () {
  if (this.displaySection === "shop") {
    const count = await mongoose.models.Product.countDocuments({
      displaySection: "shop",
      _id: { $ne: this._id },
    });

    if (count >= 6) {
      throw new Error("Shop section can only have maximum 6 products");
    }
  }

  if (this.stock <= 0) {
    this.isActive = false;
  } else {
    this.isActive = true;
  }

  // const statusColors = {
  //   new: "#00C8FF",
  //   popular: "#A855F7",
  //   rare: "#EF4444",
  //   featured: "#22C55E",
  //   bestseller: "#F59E0B",
  //   "ultra-rare": "#FF007F",
  // };

  // if (this.status) {
  //   this.themeColor = statusColors[this.status] || "#ff8c00";
  // }

  if (!this.themeColor) {
    this.themeColor = "#ff8c00";
  }
});

module.exports = mongoose.model("Product", productSchema);
