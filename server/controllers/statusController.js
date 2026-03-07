const StatusConfig = require("../models/StatusConfig");
const Product = require("../models/Product");
const Collection = require("../models/Collection");

// ── Helper ─────────────────────────────────────────────────────────────────
function buildAccentPalette(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    accentColor: hex,
    glowColor: `rgba(${r},${g},${b},0.4)`,
    particleColor: hex,
  };
}

// GET all statuses
exports.getStatuses = async (req, res) => {
  try {
    console.log("🔵 getStatuses called!"); // ← ADD YEH

    const statuses = await StatusConfig.find().sort({ status: 1 });

    console.log("✅ Statuses found:", statuses); // ← ADD YEH
    res.status(200).json(statuses);
  } catch (error) {
    console.error("❌ Error in getStatuses:", error); // ← ADD YEH
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/status/:id — update color + bulk-sync products + collections
exports.updateStatus = async (req, res) => {
  try {
    const { color } = req.body;

    if (!/^#([0-9A-F]{3,6})$/i.test(color)) {
      return res.status(400).json({ message: "Invalid HEX color" });
    }

    const updated = await StatusConfig.findByIdAndUpdate(
      req.params.id,
      { color },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Status not found" });
    }

    // ✅ Bulk-update ALL products with this status
    await Product.updateMany({ status: updated.status }, { themeColor: color });

    // ✅ Bulk-update ALL collections whose badge matches this status
    const palette = buildAccentPalette(color);
    await Collection.updateMany({ badge: updated.status }, { $set: palette });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
