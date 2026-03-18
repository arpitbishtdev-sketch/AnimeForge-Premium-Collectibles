const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const userAuthRoutes = require("./routes/UserAuthRoutes");
const themeRoutes = require("./routes/themeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statusRoutes = require("./routes/statusRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const uploadErrorHandler = require("./middleware/uploadErrorHandler");
const seedStatus = require("./config/seedStatus");

const app = express();

/* ===============================
   Middleware
================================= */

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://animeforge-premium-collectibles.onrender.com",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ⚠️ Stripe webhook MUST be before express.json()
app.use(
  "/api/orders/webhook/stripe",
  express.raw({ type: "application/json" })
);

app.use(compression());
app.use(express.json());

/* ===============================
   Routes
================================= */

app.use("/api/products", productRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("AnimeForge API is running 🚀");
});

/* ===============================
   Global Error Handler
================================= */

app.use(uploadErrorHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

/* ===============================
   Database + Server Start
================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    try {
      await seedStatus();
      console.log("Status seeded successfully");
    } catch (err) {
      console.error("Seed error:", err);
    }

    // Ensure at least one theme is active
    try {
      const Theme = require("./models/Theme");
      const activeTheme = await Theme.findOne({ active: true });

      if (!activeTheme) {
        const firstTheme = await Theme.findOne().sort({ order: 1 });
        if (firstTheme) {
          await Theme.updateOne({ _id: firstTheme._id }, { active: true });
          console.log(`✅ Theme "${firstTheme.name}" set as active`);
        }
      }
    } catch (err) {
      console.error("Theme activation error:", err);
    }
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });