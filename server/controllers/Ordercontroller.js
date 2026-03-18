const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");

// Payment gateways — only initialised if keys exist in .env
const Razorpay = require("razorpay");
const stripe = require("stripe");
const paypal = require("@paypal/checkout-server-sdk");
const crypto = require("crypto");

// ── Gateway instances ──────────────────────────────────────────────────────

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const getStripe = () => stripe(process.env.STRIPE_SECRET_KEY);

const getPayPalClient = () => {
  const environment =
    process.env.NODE_ENV === "production"
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
        );
  return new paypal.core.PayPalHttpClient(environment);
};

// ── Helper: build order items from cart ───────────────────────────────────
const buildOrderItems = (cartItems) => {
  return cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0]?.url || null,
    variantIndex: item.variantIndex,
    variantValue: item.variantValue,
    variantType: item.variantType,
    quantity: item.quantity,
    priceAtOrder: item.priceAtAdd,
  }));
};

// ── Helper: calculate totals ───────────────────────────────────────────────
const calculateTotals = (cartItems) => {
  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0,
  );
  const shippingCharge = itemsTotal >= 999 ? 0 : 99; // free shipping above ₹999
  const totalAmount = itemsTotal + shippingCharge;
  return { itemsTotal, shippingCharge, totalAmount };
};

// ── Helper: deduct stock after order ──────────────────────────────────────
const deductStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variantIndex !== null && item.variantIndex !== undefined) {
      if (product.variants[item.variantIndex]) {
        product.variants[item.variantIndex].stock -= item.quantity;
      }
    } else {
      product.stock -= item.quantity;
    }

    await product.save();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PLACE ORDER — handles all 4 payment methods
// POST /api/orders/place
// ═══════════════════════════════════════════════════════════════════════════
exports.placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, customerNote } = req.body;

    if (!addressId || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Address and payment method are required" });
    }

    if (!["razorpay", "stripe", "paypal", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Fetch cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `"${product?.name || "A product"}" is no longer available`,
        });
      }

      const availableStock =
        item.variantIndex !== null
          ? product.variants[item.variantIndex]?.stock || 0
          : product.stock;

      if (item.quantity > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} unit(s) of "${product.name}" available`,
        });
      }
    }

    // Fetch address
    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const orderItems = buildOrderItems(cart.items);
    const { itemsTotal, shippingCharge, totalAmount } = calculateTotals(
      cart.items,
    );

    // ── COD ──────────────────────────────────────────────────────────────
    if (paymentMethod === "cod") {
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        itemsTotal,
        shippingCharge,
        totalAmount,
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "confirmed",
        customerNote: customerNote || null,
      });

      await deductStock(orderItems);
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      return res.status(201).json({ success: true, order });
    }

    // ── RAZORPAY ──────────────────────────────────────────────────────────
    if (paymentMethod === "razorpay") {
      const razorpay = getRazorpay();

      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        itemsTotal,
        shippingCharge,
        totalAmount,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        orderStatus: "pending",
        razorpay: { orderId: razorpayOrder.id },
        customerNote: customerNote || null,
      });

      return res.status(201).json({
        success: true,
        order,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // ── STRIPE ────────────────────────────────────────────────────────────
    if (paymentMethod === "stripe") {
      const stripeClient = getStripe();

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // cents
        currency: "usd",
        metadata: { userId: req.user._id.toString() },
      });

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        itemsTotal,
        shippingCharge,
        totalAmount,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        orderStatus: "pending",
        stripe: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        },
        customerNote: customerNote || null,
      });

      return res.status(201).json({
        success: true,
        order,
        clientSecret: paymentIntent.client_secret,
      });
    }

    // ── PAYPAL ────────────────────────────────────────────────────────────
    if (paymentMethod === "paypal") {
      const paypalClient = getPayPalClient();

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalAmount.toFixed(2),
            },
          },
        ],
      });

      const paypalOrder = await paypalClient.execute(request);

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        itemsTotal,
        shippingCharge,
        totalAmount,
        paymentMethod: "paypal",
        paymentStatus: "pending",
        orderStatus: "pending",
        paypal: { orderId: paypalOrder.result.id },
        customerNote: customerNote || null,
      });

      return res.status(201).json({
        success: true,
        order,
        paypalOrderId: paypalOrder.result.id,
      });
    }
  } catch (error) {
    console.error("placeOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VERIFY PAYMENT
// ═══════════════════════════════════════════════════════════════════════════

// ── Razorpay verify ───────────────────────────────────────────────────────
exports.verifyRazorpay = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paidAt = new Date();
    order.razorpay.paymentId = razorpayPaymentId;
    order.razorpay.signature = razorpaySignature;
    await order.save();

    await deductStock(order.items);
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.json({ success: true, order });
  } catch (error) {
    console.error("verifyRazorpay error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Stripe verify (webhook) ───────────────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const order = await Order.findOne({
      "stripe.paymentIntentId": paymentIntent.id,
    });

    if (order) {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paidAt = new Date();
      await order.save();
      await deductStock(order.items);
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    }
  }

  res.json({ received: true });
};

// ── PayPal capture ────────────────────────────────────────────────────────
exports.capturePayPal = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    const paypalClient = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    if (capture.result.status !== "COMPLETED") {
      return res.status(400).json({ message: "PayPal payment not completed" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paidAt = new Date();
    order.paypal.captureId =
      capture.result.purchase_units[0].payments.captures[0].id;
    await order.save();

    await deductStock(order.items);
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.json({ success: true, order });
  } catch (error) {
    console.error("capturePayPal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// USER ORDER ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── Get my orders ─────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name images slug");

    res.json({ success: true, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Get single order ──────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product", "name images slug");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Cancel order ──────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled once it is being processed or shipped",
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      if (item.variantIndex !== null) {
        if (product.variants[item.variantIndex]) {
          product.variants[item.variantIndex].stock += item.quantity;
        }
      } else {
        product.stock += item.quantity;
      }
      await product.save();
    }

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ORDER ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── Get all orders (admin) ────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.orderStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email")
        .populate("items.product", "name images"),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Update order status (admin) ───────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, courierName, adminNote } = req.body;

    const validStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;
    if (adminNote) order.adminNote = adminNote;
    if (orderStatus === "delivered") order.deliveredAt = new Date();
    if (orderStatus === "cancelled") order.cancelledAt = new Date();

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
