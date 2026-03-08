const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 120 },
    label: { type: String, trim: true, maxlength: 16, default: "" },
    icon: { type: String, trim: true, maxlength: 4, default: "" },
    linkText: { type: String, trim: true, maxlength: 24, default: "" },
    linkUrl: { type: String, trim: true, default: "" },
    accentColor: { type: String, default: "#ff8c00" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
