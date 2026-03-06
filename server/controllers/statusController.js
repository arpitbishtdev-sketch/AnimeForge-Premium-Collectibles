const StatusConfig = require("../models/StatusConfig");
const Product = require("../models/Product");

// GET all statuses
exports.getStatuses = async (req, res) => {
  try {
    const statuses = await StatusConfig.find().sort({ status: 1 });
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/status/:id — update color + bulk-sync all products with that status
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

    // ✅ Bulk-update ALL existing products that have this status
    await Product.updateMany({ status: updated.status }, { themeColor: color });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
