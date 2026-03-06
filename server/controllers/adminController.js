import Product from "../models/Product.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      data: {
        totalProducts,
        pendingOrders: 0,
        totalCustomers: 0,
        monthlyRevenue: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
