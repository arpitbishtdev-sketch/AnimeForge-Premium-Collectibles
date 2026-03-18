const User = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ── Nodemailer Transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS,
  },
});

// ── Token Generators ───────────────────────────────────────────────────────
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

// ── REGISTER ───────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.create({
      name,
      email,
      password,
      verifyEmailToken: hashedToken,
      verifyEmailExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${user.email}`;

    await transporter.sendMail({
      from: `"AnimeForge" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Verify your AnimeForge account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Welcome to AnimeForge, ${user.name}! 🎉</h2>
          <p style="color: #555;">Please verify your email address to activate your account.</p>
          <a href="${verifyURL}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    console.error("register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── VERIFY EMAIL ───────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email)
      return res.status(400).json({ message: "Invalid verification link" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      verifyEmailToken: hashedToken,
      verifyEmailExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired verification link" });

    user.isVerified = true;
    user.verifyEmailToken = null;
    user.verifyEmailExpires = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (error) {
    console.error("verifyEmail error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── LOGIN (Users) ──────────────────────────────────────────────────────────
// Admin login is separate — see adminLogin + verifyAdminOTP below
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    // Block admin from logging in via normal login
    if (user.role === "admin")
      return res.status(403).json({ message: "Use admin login portal" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email before logging in" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
   user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  phone: user.phone || "",
  createdAt: user.createdAt,
},
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN LOGIN — Step 1: Email + Password → sends OTP ────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });
    if (!user)
      return res.status(403).json({ message: "Not authorized as admin" });

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await user.resetLoginAttempts();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otpAttempts = 0;
    await user.save();

    await transporter.sendMail({
      from: `"AnimeForge Admin" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Your Admin Login OTP — AnimeForge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">AnimeForge Admin Login</h2>
          <p style="color: #555;">Use the OTP below to complete your login. Expires in <strong>10 minutes</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111; margin: 24px 0;">${otp}</div>
          <p style="color: #999; font-size: 12px;">If you did not request this, secure your account immediately.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent to your admin email" });
  } catch (error) {
    console.error("adminLogin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN LOGIN — Step 2: Verify OTP → returns JWT ────────────────────────
exports.verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });

    if (!user || !user.otp)
      return res.status(400).json({ message: "Invalid request. Please login again." });

    if (user.otpExpires < Date.now()) {
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (user.otpAttempts >= 5) {
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: "Too many OTP attempts. Please login again." });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.otp) {
      user.otpAttempts += 1;
      await user.save();
      const attemptsLeft = 5 - user.otpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
      });
    }

    // OTP correct — clear OTP fields
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

res.json({
  success: true,
  accessToken,
  refreshToken,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    phone: user.phone || "",
    createdAt: user.createdAt,
  },
});
  } catch (error) {
    console.error("verifyAdminOTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── REFRESH TOKEN ──────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(user);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// ── FORGOT PASSWORD ────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.json({ success: true, message: "If this email exists, a reset link has been sent." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${user.email}`;

    await transporter.sendMail({
      from: `"AnimeForge" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Reset your AnimeForge password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Password Reset Request</h2>
          <p style="color: #555;">Click below to reset your password. Expires in <strong>15 minutes</strong>.</p>
          <a href="${resetURL}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── RESET PASSWORD ─────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset link" });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE PROFILE ─────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    await user.save();

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── CHANGE PASSWORD ────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: "Password changed successfully. Please login again." });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── LOGOUT ─────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};