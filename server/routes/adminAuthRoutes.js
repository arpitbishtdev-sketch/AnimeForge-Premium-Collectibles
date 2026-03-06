const express = require("express");
const router = express.Router();

const {
  sendAdminOTP,
  verifyAdminOTP,
} = require("../controllers/adminAuthController");

router.post("/send-otp", sendAdminOTP);
router.post("/verify-otp", verifyAdminOTP);

module.exports = router;
