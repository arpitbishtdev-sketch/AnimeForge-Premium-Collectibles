const express = require("express");
const router = express.Router();

const {
  getAllThemes,
  getActiveTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  activateTheme,
  reorderThemes,
} = require("../controllers/themeController");

/* Public */
router.get("/active", getActiveTheme);

/* Admin */
router.get("/", getAllThemes);
router.post("/", createTheme);
router.put("/:id", updateTheme);
router.delete("/:id", deleteTheme);
router.patch("/:id/activate", activateTheme);
router.patch("/reorder", reorderThemes);

module.exports = router;
