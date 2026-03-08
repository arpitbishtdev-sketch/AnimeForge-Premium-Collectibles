const express = require("express");
const router = express.Router();
const {
  uploadMiddleware,
  uploadImage,
} = require("../controllers/Uploadcontroller");

router.post("/", uploadMiddleware, uploadImage);

module.exports = router;
