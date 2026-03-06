const Theme = require("../models/Theme");

// GET /api/themes — list all themes
const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find().sort({ order: 1 });
    res.json(themes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch themes", error: err.message });
  }
};

// GET /api/themes/active — get currently active theme
const getActiveTheme = async (req, res) => {
  try {
    const theme = await Theme.findOne({ active: true });
    if (!theme)
      return res.status(404).json({ message: "No active theme found" });
    res.json(theme);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch active theme", error: err.message });
  }
};

const reorderThemes = async (req, res) => {
  try {
    const { order } = req.body;

    for (let i = 0; i < order.length; i++) {
      await Theme.findByIdAndUpdate(order[i], { order: i });
    }

    res.json({ message: "Theme order updated" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to reorder themes",
      error: err.message,
    });
  }
};

// POST /api/themes — create a new theme
const createTheme = async (req, res) => {
  try {
    const count = await Theme.countDocuments();

    if (count >= 5) {
      return res
        .status(400)
        .json({ message: "Please delete any one theme before adding new." });
    }

    const {
      name,
      status,
      edition,
      subtitle,
      description,
      price,
      carouselImages,
      accent,
      glow,
      particle,
      radialGradient,
      linearGradient,
      image,
      active,
    } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const theme = new Theme({
      name,
      slug,
      status,
      edition,
      subtitle,
      description,
      price,
      carouselImages,
      accent,
      glow,
      particle,
      radialGradient,
      linearGradient,
      image,
      active: active || false,
      order: count,
    });

    await theme.save();

    res.status(201).json(theme);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create theme",
      error: err.message,
    });
  }
};

// PUT /api/themes/:id — update a theme
const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If setting this theme active, deactivate others
    if (updates.active === true) {
      await Theme.updateMany({ _id: { $ne: id } }, { active: false });
    }

    const theme = await Theme.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    res.json(theme);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update theme", error: err.message });
  }
};

// DELETE /api/themes/:id — delete a theme
const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const theme = await Theme.findByIdAndDelete(id);
    if (!theme) return res.status(404).json({ message: "Theme not found" });
    res.json({ message: "Theme deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete theme", error: err.message });
  }
};

// PATCH /api/themes/:id/activate — activate one theme, deactivate all others
const activateTheme = async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate all themes
    await Theme.updateMany({}, { active: false });

    // Activate the target theme
    const theme = await Theme.findByIdAndUpdate(
      id,
      { active: true },
      { returnDocument: "after" },
    );
    if (!theme) return res.status(404).json({ message: "Theme not found" });

    res.json(theme);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to activate theme", error: err.message });
  }
};

module.exports = {
  getAllThemes,
  getActiveTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  activateTheme,
  reorderThemes,
};
