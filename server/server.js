const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const themeRoutes = require("./routes/themeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statusRoutes = require("./routes/statusRoutes");

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
        "https://animeforge-premium-collectibles.onrender.com",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

/* ===============================
   Routes
================================= */

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/auth/admin", adminAuthRoutes);

app.get("/", (req, res) => {
  res.send("AnimeForge API is running 🚀");
});

/* ===============================
   Global Error Handler
================================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

/* ===============================
   Database + Server Start
================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      await seedStatus();
      console.log("Status seeded successfully");
    } catch (err) {
      console.error("Seed error:", err.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
