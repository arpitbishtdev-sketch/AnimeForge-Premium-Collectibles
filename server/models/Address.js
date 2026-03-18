const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true, default: null },

    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },

    isDefault: { type: Boolean, default: false },

    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Address", addressSchema);
