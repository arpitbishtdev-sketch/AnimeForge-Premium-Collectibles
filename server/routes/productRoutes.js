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
  promoteVariant, // ← add here
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/shop", getShopProducts);
router.get("/collection", getCollectionProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getSingleProduct);
router.post("/:id/promote-variant/:variantIndex", promoteVariant); // ← add here
router.post("/", upload.any(), createProduct);
router.put("/:id", upload.any(), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
