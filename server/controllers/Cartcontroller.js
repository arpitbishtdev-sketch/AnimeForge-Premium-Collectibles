const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ── Helper: populate cart with product details ─────────────────────────────
const getPopulatedCart = (userId) => {
  return Cart.findOne({ user: userId }).populate(
    "items.product",
    "name slug images basePrice originalPrice stock variants isActive status",
  );
};

// ── GET CART ───────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    if (!cart) {
      return res.json({ success: true, items: [], totalPrice: 0 });
    }

    res.json({ success: true, ...cart.toJSON() });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── ADD TO CART ────────────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantIndex = null } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    // Determine price and stock based on variant
    let priceAtAdd = product.basePrice;
    let variantValue = null;
    let variantType = null;
    let availableStock = product.stock;

    if (variantIndex !== null && variantIndex !== undefined) {
      const variant = product.variants[variantIndex];
      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }

      if (variant.stock < 1) {
        return res
          .status(400)
          .json({ message: "This variant is out of stock" });
      }

      priceAtAdd = product.basePrice + (variant.priceModifier || 0);
      variantValue = variant.value;
      variantType = variant.type;
      availableStock = variant.stock;
    }

    // Check stock availability
    if (quantity > availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} item(s) available in stock`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product+variant already in cart
    const existingIndex = cart.items.findIndex((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameVariant = item.variantIndex === (variantIndex ?? null);
      return sameProduct && sameVariant;
    });

    if (existingIndex > -1) {
      // Update quantity
      const newQty = cart.items[existingIndex].quantity + quantity;

      if (newQty > availableStock) {
        return res.status(400).json({
          message: `Cannot add more. Only ${availableStock} item(s) available`,
        });
      }

      cart.items[existingIndex].quantity = newQty;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variantIndex: variantIndex ?? null,
        variantValue,
        variantType,
        quantity,
        priceAtAdd,
      });
    }

    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, ...populated.toJSON() });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── UPDATE QUANTITY ────────────────────────────────────────────────────────
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Validate stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "Product no longer exists" });
    }

    const availableStock =
      item.variantIndex !== null
        ? product.variants[item.variantIndex]?.stock || 0
        : product.stock;

    if (quantity > availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} item(s) available in stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, ...populated.toJSON() });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── REMOVE ITEM ────────────────────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.deleteOne();
    await cart.save();

    const populated = await getPopulatedCart(req.user._id);
    res.json({ success: true, ...populated.toJSON() });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── CLEAR CART ─────────────────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true },
    );

    res.json({ success: true, items: [], totalPrice: 0 });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
