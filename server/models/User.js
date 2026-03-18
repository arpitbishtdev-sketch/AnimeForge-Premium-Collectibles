const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Email verification
    isVerified: { type: Boolean, default: false },
    verifyEmailToken: { type: String, default: null },
    verifyEmailExpires: { type: Date, default: null },

    // Password reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Profile
    phone: { type: String, default: null },
    avatar: { type: String, default: null },

    // Refresh token
    refreshToken: { type: String, default: null },

    // ── Admin OTP fields ──────────────────────────────────────────────────
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },

    // ── Brute force protection (admin login) ──────────────────────────────
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // ── Wholesale / B2B ───────────────────────────────────────────────────────
    userType: {
      type: String,
      enum: ["retail", "wholesale"],
      default: "retail",
    },
    wholesaleStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    wholesaleApplication: {
      companyName: { type: String, default: null },
      gstNumber: { type: String, default: null },
      businessType: { type: String, default: null },
      expectedMonthlyOrder: { type: String, default: null },
      phone: { type: String, default: null },
      appliedAt: { type: Date, default: null },
      reviewedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// ── Hash password before save ──────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Compare password ───────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// ── Check if account is locked ─────────────────────────────────────────────
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// ── Increment failed login attempts (lock after 5 wrong passwords) ─────────
userSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
    this.loginAttempts = 0;
  }
  await this.save();
};

// ── Reset login attempts on success ───────────────────────────────────────
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
};

module.exports = mongoose.model("User", userSchema);