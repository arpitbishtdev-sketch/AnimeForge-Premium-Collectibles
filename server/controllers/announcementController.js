const Announcement = require("../models/Announcement");

// GET /api/announcements — frontend (active only)
const getAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.find({ isActive: true }).sort({ order: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/announcements/admin/all — admin (all)
const getAllAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.find().sort({ order: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create(req.body);
    res.status(201).json(ann);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/announcements/:id
const updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ann) return res.status(404).json({ message: "Not found" });
    res.json(ann);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
