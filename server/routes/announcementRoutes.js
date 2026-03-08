const express = require("express");
const {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/admin/all", getAllAnnouncements);
router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

module.exports = router;
