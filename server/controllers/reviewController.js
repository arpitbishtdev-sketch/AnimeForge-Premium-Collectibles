const Review = require("../models/Review");
const Product = require("../models/Product");

exports.createReview = async (req, res) => {
  try {
    const { rating, comment, name } = req.body;
    const { productId } = req.params;

    const review = await Review.create({
      product: productId,
      rating,
      comment,
      name,
    });

    //   Update product rating stats
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.count || 0,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
