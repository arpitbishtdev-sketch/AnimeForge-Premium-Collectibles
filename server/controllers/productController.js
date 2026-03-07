const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const StatusConfig = require("../models/StatusConfig");

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, limit, displaySection } = req.query;
    console.log("QUERY:", req.query);
    const filter = {};

    if (displaySection) {
      filter.displaySection = displaySection;
    }

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      filter.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { tags: { $regex: trimmed, $options: "i" } },
      ];
    }

    let query = Product.find(filter).sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit))) {
      query = query.limit(Math.min(parseInt(limit), 50));
    }

    const products = await query;
    const statuses = await StatusConfig.find();

    const formatted = products.map((p) => {
      const obj = p.toObject ? p.toObject() : p;

      const statusConfig = statuses.find((s) => {
        if (!s.status || !obj.status) return false;
        return s.status.toLowerCase() === obj.status.toLowerCase();
      });

      return {
        ...obj,
        image: obj.images?.[0]?.url || null,
        themeColor: statusConfig?.color || null,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET single product
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    let tags = [];
    if (req.body && req.body.tags) {
      try {
        tags =
          typeof req.body.tags === "string"
            ? JSON.parse(req.body.tags)
            : req.body.tags;
      } catch (err) {
        console.log("Tag parse error:", err);
        tags = [];
      }
    }

    if (req.body.displaySection === "shop") {
      const count = await Product.countDocuments({ displaySection: "shop" });
      if (count >= 6) {
        return res.status(400).json({
          message: "Shop already has 6 products. Remove one first.",
        });
      }
    }

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
          folder: "animeforge_products",
        });
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const product = await Product.create({
      ...req.body,
      tags,
      images: uploadedImages,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    if (uploadedImages.length > 0) {
      for (const img of uploadedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Slug already exists. Please use a different slug.",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  let newUploadedImages = [];

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse tags
    let tags = [];
    if (req.body && req.body.tags) {
      try {
        tags =
          typeof req.body.tags === "string"
            ? JSON.parse(req.body.tags)
            : req.body.tags;
      } catch (err) {
        console.log("Tag parse error:", err);
        tags = [];
      }
    }

    // Delete removed images from Cloudinary
    if (
      req.body &&
      req.body.deletedImages &&
      req.body.deletedImages !== "undefined"
    ) {
      const deletedImages =
        typeof req.body.deletedImages === "string"
          ? JSON.parse(req.body.deletedImages)
          : req.body.deletedImages;

      for (const imgId of deletedImages) {
        const image = product.images.find((i) => i.public_id === imgId);
        if (image) {
          await cloudinary.uploader.destroy(imgId);
        }
      }

      product.images = product.images.filter(
        (img) => !deletedImages.includes(img.public_id),
      );
    }

    // ── Upload NEW images to Cloudinary ──
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, {
          folder: "animeforge_products",
        });
        newUploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // ── Re-order saved images per imageOrder, then APPEND new uploads ──
    // imageOrder contains public_ids of SAVED images only (in desired order).
    // New uploads are always appended AFTER saved images in the order
    // they appeared in allImages on the frontend.
    let savedImages = [...product.images];

    if (
      req.body &&
      req.body.imageOrder &&
      req.body.imageOrder !== "undefined"
    ) {
      try {
        const order =
          typeof req.body.imageOrder === "string"
            ? JSON.parse(req.body.imageOrder)
            : req.body.imageOrder;

        // Re-order existing saved images according to the frontend order
        const orderedSaved = order
          .map((id) => savedImages.find((img) => img.public_id === id))
          .filter(Boolean);

        // Any saved images not in order (safety net) go at the end
        const unordered = savedImages.filter(
          (img) => !order.includes(img.public_id),
        );

        savedImages = [...orderedSaved, ...unordered];
      } catch (err) {
        console.error("Image order parse error:", err);
      }
    }

    // Final merged list: ordered saved images + newly uploaded images
    product.images = [...savedImages, ...newUploadedImages];

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);
    console.log(
      "FINAL IMAGES:",
      product.images.map((i) => i.public_id),
    );

    // Update fields
    product.name = req.body.name ?? product.name;
    product.slug = req.body.slug ?? product.slug;
    product.category = req.body.category ?? product.category;

    if (req.body.basePrice !== undefined) {
      product.basePrice = Number(req.body.basePrice);
    }

    if (req.body.originalPrice !== undefined && req.body.originalPrice !== "") {
      product.originalPrice = Number(req.body.originalPrice);
    }

    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    product.description = req.body.description ?? product.description;
    product.status = req.body.status ?? product.status;
    product.themeColor = req.body.themeColor ?? product.themeColor;
    product.tags = tags.length > 0 ? tags : product.tags;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    // Cleanup any newly uploaded images if save failed
    if (newUploadedImages.length > 0) {
      for (const img of newUploadedImages) {
        await cloudinary.uploader.destroy(img.public_id).catch(() => {});
      }
    }

    res.status(500).json({ message: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET Shop products
exports.getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({ displaySection: "collection" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Collection products
exports.getCollectionProducts = async (req, res) => {
  try {
    const products = await Product.find({ displaySection: "collection" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET product by SLUG
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const statusConfig = await StatusConfig.findOne({
      status: product.status,
    });

    const obj = product.toObject();

    res.status(200).json({
      ...obj,
      image: obj.images?.[0]?.url || null,
      themeColor: statusConfig?.color || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
