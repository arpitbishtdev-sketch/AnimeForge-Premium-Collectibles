const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/addressController");

// All address routes require login
router.use(protect);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.patch("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
