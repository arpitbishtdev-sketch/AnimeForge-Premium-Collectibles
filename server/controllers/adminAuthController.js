const Admin = require("../models/Admin");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

//   Generate JWT
const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

//   SEND OTP
exports.sendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(403).json({
        message: "You are not authorized as admin",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    admin.otp = hashedOtp;
    admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    admin.otpAttempts = 0;

    await admin.save();

    //   For now just console log (later integrate nodemailer)
    console.log("Admin OTP:", otp);

    res.json({ message: "OTP sent to admin email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//   VERIFY OTP
exports.verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email, role: "admin" });

    if (!admin || !admin.otp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== admin.otp) {
      admin.otpAttempts += 1;
      await admin.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after success
    admin.otp = undefined;
    admin.otpExpires = undefined;
    admin.otpAttempts = 0;
    await admin.save();

    const token = generateToken(admin);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
