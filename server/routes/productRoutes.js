const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
  getAllProducts,
  getSingleProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getShopProducts,
  getCollectionProducts,
} = require("../controllers/productController");

router.get("/", getAllProducts);

router.get("/shop", getShopProducts);
router.get("/collection", getCollectionProducts);
router.get("/slug/:slug", getProductBySlug);

router.get("/:id", getSingleProduct);

router.post("/", upload.array("images", 5), createProduct);
router.put("/:id", upload.array("images", 8), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
