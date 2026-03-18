const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ═══════════════════════════════════════════════════════════════════════════
// GET REVIEWS FOR A PRODUCT
// Sorting logic:
//   Top 2  → 5-star + highest userTotalSpend (isFeatured = true)
//   Rest   → 5-star + highest userTotalSpend descending
// GET /api/reviews/product/:productId
// ═══════════════════════════════════════════════════════════════════════════
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ rating: -1, userTotalSpend: -1, createdAt: -1 });

    // Mark top 2 five-star + highest spend as featured
    let featuredCount = 0;
    const sorted = reviews.map((r) => {
      const obj = r.toObject();
      if (featuredCount < 2 && obj.rating === 5) {
        obj.isFeatured = true;
        featuredCount++;
      } else {
        obj.isFeatured = false;
      }
      return obj;
    });

    res.json({ success: true, reviews: sorted });
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADD REVIEW
// Only verified buyers (delivered order) can review
// POST /api/reviews
// ═══════════════════════════════════════════════════════════════════════════
exports.addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, text } = req.body;

    if (!productId || !orderId || !rating || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify the order belongs to user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        message: "You can only review products from delivered orders",
      });
    }

    // Verify product was in that order
    const productInOrder = order.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!productInOrder) {
      return res.status(403).json({
        message: "This product was not in your order",
      });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already reviewed this product",
      });
    }

    // Calculate user's total spend across all delivered orders
    const allOrders = await Order.find({
      user: req.user._id,
      orderStatus: "delivered",
      paymentStatus: "paid",
    });

    const userTotalSpend = allOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title: title || null,
      text,
      isVerifiedBuyer: true,
      userTotalSpend,
    });

    // Update product's averageRating and reviewCount
    await updateProductRating(productId);

    const populated = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this product" });
    }
    console.error("addReview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EDIT REVIEW
// PUT /api/reviews/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.editReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const { rating, title, text } = req.body;

    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (text) review.text = text;

    await review.save();
    await updateProductRating(review.product);

    res.json({ success: true, review });
  } catch (error) {
    console.error("editReview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DELETE REVIEW
// DELETE /api/reviews/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MARK REVIEW AS HELPFUL
// POST /api/reviews/:id/helpful
// ═══════════════════════════════════════════════════════════════════════════
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const alreadyVoted = review.helpfulVoters.includes(req.user._id);

    if (alreadyVoted) {
      // Unlike
      review.helpfulVoters.pull(req.user._id);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Like
      review.helpfulVoters.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      helpful: review.helpful,
      liked: !alreadyVoted,
    });
  } catch (error) {
    console.error("markHelpful error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN — Get all reviews with pagination
// GET /api/reviews/admin
// ═══════════════════════════════════════════════════════════════════════════
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, isApproved } = req.query;
    const filter = {};

    if (rating) filter.rating = Number(rating);
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email")
        .populate("product", "name"),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN — Toggle review approval
// PATCH /api/reviews/:id/approve
// ═══════════════════════════════════════════════════════════════════════════
exports.toggleApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.isApproved = !review.isApproved;
    await review.save();
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: `Review ${review.isApproved ? "approved" : "hidden"}`,
      review,
    });
  } catch (error) {
    console.error("toggleApproval error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper — Recalculate product average rating
// ═══════════════════════════════════════════════════════════════════════════
async function updateProductRating(productId) {
  const reviews = await Review.find({
    product: productId,
    isApproved: true,
  });

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount,
  });
}
