const express = require("express");
const router = express.Router();
const {
  getStatuses,
  updateStatus,
} = require("../controllers/statusController");

router.get("/", getStatuses);
router.put("/:id", updateStatus);

module.exports = router;
