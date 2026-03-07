const express = require("express");
const router = express.Router();
const {
  getAllCollections,
  getAllCollectionsAdmin,
  getSingleCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");

// ⚠️ Specific string routes MUST come before /:id (Express catches /:id first otherwise)
router.get("/admin/all", getAllCollectionsAdmin);
router.get("/", getAllCollections);
router.get("/:id", getSingleCollection);

router.post("/", createCollection);
router.put("/:id", updateCollection);
router.delete("/:id", deleteCollection);

module.exports = router;
