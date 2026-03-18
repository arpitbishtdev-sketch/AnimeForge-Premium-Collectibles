const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS,
  },
});

// ═══════════════════════════════════════════════════════════════
// USER — Apply for Wholesale
// POST /api/wholesale/apply
// ═══════════════════════════════════════════════════════════════
exports.applyWholesale = async (req, res) => {
  try {
    const { companyName, gstNumber, businessType, expectedMonthlyOrder, phone } = req.body;

    if (!companyName || !businessType || !expectedMonthlyOrder) {
      return res.status(400).json({ message: "Company name, business type, and expected monthly order are required" });
    }

    const user = await User.findById(req.user._id);

    if (user.userType === "wholesale") {
      return res.status(400).json({ message: "You are already a wholesale member" });
    }

    if (user.wholesaleStatus === "pending") {
      return res.status(400).json({ message: "Your application is already under review" });
    }

    user.wholesaleStatus = "pending";
    user.wholesaleApplication = {
      companyName: companyName.trim(),
      gstNumber: gstNumber?.trim() || null,
      businessType: businessType.trim(),
      expectedMonthlyOrder: expectedMonthlyOrder.trim(),
      phone: phone?.trim() || user.phone,
      appliedAt: new Date(),
      reviewedAt: null,
      rejectionReason: null,
    };
    await user.save();

    // Email to user
    await transporter.sendMail({
      from: `"AnimeForge" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Wholesale Application Received — AnimeForge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 28px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a1a1a;">Wholesale Application Received 📦</h2>
          <p style="color: #555;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #555;">We've received your wholesale application for <strong>${companyName}</strong>. Our team will review it within 2-3 business days.</p>
          <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #777; font-size: 13px;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 4px 0 0; color: #777; font-size: 13px;"><strong>Business Type:</strong> ${businessType}</p>
            <p style="margin: 4px 0 0; color: #777; font-size: 13px;"><strong>Expected Monthly Order:</strong> ${expectedMonthlyOrder}</p>
          </div>
          <p style="color: #999; font-size: 12px;">You'll receive an email once your application is reviewed.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Wholesale application submitted successfully. We'll review it within 2-3 business days." });
  } catch (error) {
    console.error("applyWholesale error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// USER — Get my wholesale status
// GET /api/wholesale/status
// ═══════════════════════════════════════════════════════════════
exports.getMyWholesaleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("userType wholesaleStatus wholesaleApplication");
    res.json({ success: true, userType: user.userType, wholesaleStatus: user.wholesaleStatus, application: user.wholesaleApplication });
  } catch (error) {
    console.error("getMyWholesaleStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Get all wholesale applications
// GET /api/wholesale/admin/applications
// ═══════════════════════════════════════════════════════════════
exports.getAllApplications = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status !== "all") filter.wholesaleStatus = status;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email userType wholesaleStatus wholesaleApplication createdAt")
        .sort({ "wholesaleApplication.appliedAt": -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("getAllApplications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Approve wholesale application
// PUT /api/wholesale/admin/:userId/approve
// ═══════════════════════════════════════════════════════════════
exports.approveApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wholesaleStatus !== "pending") {
      return res.status(400).json({ message: "No pending application found" });
    }

    user.userType = "wholesale";
    user.wholesaleStatus = "approved";
    user.wholesaleApplication.reviewedAt = new Date();
    await user.save();

    // Email to user
    await transporter.sendMail({
      from: `"AnimeForge" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "🎉 Wholesale Application Approved — AnimeForge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 28px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #16a34a;">Wholesale Application Approved! 🎉</h2>
          <p style="color: #555;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #555;">Congratulations! Your wholesale application for <strong>${user.wholesaleApplication.companyName}</strong> has been approved.</p>
          <p style="color: #555;">You now have access to exclusive wholesale pricing on all eligible products. Login to your account to start shopping at wholesale prices.</p>
          <a href="${process.env.FRONTEND_URL}/user" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">View My Account</a>
          <p style="color: #999; font-size: 12px;">Welcome to the AnimeForge wholesale family!</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Application approved successfully" });
  } catch (error) {
    console.error("approveApplication error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Reject wholesale application
// PUT /api/wholesale/admin/:userId/reject
// ═══════════════════════════════════════════════════════════════
exports.rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wholesaleStatus = "rejected";
    user.wholesaleApplication.reviewedAt = new Date();
    user.wholesaleApplication.rejectionReason = reason || "Application does not meet our criteria";
    await user.save();

    // Email to user
    await transporter.sendMail({
      from: `"AnimeForge" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Wholesale Application Update — AnimeForge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 28px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1a1a1a;">Wholesale Application Update</h2>
          <p style="color: #555;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #555;">Unfortunately, your wholesale application could not be approved at this time.</p>
          ${reason ? `<p style="color: #555;"><strong>Reason:</strong> ${reason}</p>` : ""}
          <p style="color: #555;">You're welcome to apply again after 30 days. If you have questions, please contact our support team.</p>
          <p style="color: #999; font-size: 12px;">Thank you for your interest in AnimeForge wholesale.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Application rejected" });
  } catch (error) {
    console.error("rejectApplication error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Manually set user type
// PUT /api/wholesale/admin/:userId/set-type
// ═══════════════════════════════════════════════════════════════
exports.setUserType = async (req, res) => {
  try {
    const { userType } = req.body;
    if (!["retail", "wholesale"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { userType, wholesaleStatus: userType === "wholesale" ? "approved" : "none" },
      { new: true }
    ).select("name email userType wholesaleStatus");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("setUserType error:", error);
    res.status(500).json({ message: "Server error" });
  }
};