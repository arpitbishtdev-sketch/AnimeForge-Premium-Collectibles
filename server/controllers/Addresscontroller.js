const Address = require("../models/Address");

// ── GET ALL ADDRESSES ──────────────────────────────────────────────────────
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({ success: true, addresses });
  } catch (error) {
    console.error("getAddresses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── ADD ADDRESS ────────────────────────────────────────────────────────────
exports.addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      label,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Max 5 addresses per user
    const count = await Address.countDocuments({ user: req.user._id });
    if (count >= 5) {
      return res
        .status(400)
        .json({
          message: "Maximum 5 addresses allowed. Please delete one first.",
        });
    }

    // If this is set as default, unset all others
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // First address is always default
    const isFirstAddress = count === 0;

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      pincode,
      country: country || "India",
      label: label || "home",
      isDefault: isFirstAddress || isDefault || false,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    console.error("addAddress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE ADDRESS ─────────────────────────────────────────────────────────
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      label,
      isDefault,
    } = req.body;

    // If setting as default, unset all others first
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (country) address.country = country;
    if (label) address.label = label;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({ success: true, address });
  } catch (error) {
    console.error("updateAddress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── SET DEFAULT ADDRESS ────────────────────────────────────────────────────
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Unset all, then set this one
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ success: true, message: "Default address updated", address });
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE ADDRESS ─────────────────────────────────────────────────────────
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default, make the most recent one default
    if (wasDefault) {
      const next = await Address.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("deleteAddress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
