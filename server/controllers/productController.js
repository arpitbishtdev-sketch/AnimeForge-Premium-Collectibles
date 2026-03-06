const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const StatusConfig = require("../models/StatusConfig");

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, limit, displaySection } = req.query;
    console.log("QUERY:", req.query);
    const filter = {};

    // Filter by section (shop / collection)
    if (displaySection) {
      filter.displaySection = displaySection;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Proper production-safe search
    // STRICT search (no loose partial garbage match)
    if (search && search.trim()) {
      const trimmed = search.trim();

      filter.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { tags: { $regex: trimmed, $options: "i" } },
      ];
    }

    let query = Product.find(filter).sort({ createdAt: -1 });

    // Safe limit handling
    if (limit && !isNaN(parseInt(limit))) {
      query = query.limit(Math.min(parseInt(limit), 50)); // cap to 50
    }

    const products = await query;
    const statuses = await StatusConfig.find();

    // const formatted = products.map((p) => {
    //   const obj = p.toObject ? p.toObject() : p;

    //   const statusConfig = statuses.find(
    //     (s) => s.status.toLowerCase() === obj.status.toLowerCase(),
    //   );

    //   return {
    //     ...obj,
    //     image: obj.images?.[0]?.url || null,
    //     themeColor: statusConfig?.color || null,
    //   };
    // });

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
    // 🔹 Parse tags (coming as JSON string)
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

    // 🔹 Shop max 6 validation
    if (req.body.displaySection === "shop") {
      const count = await Product.countDocuments({
        displaySection: "shop",
      });

      if (count >= 6) {
        return res.status(400).json({
          message: "Shop already has 6 products. Remove one first.",
        });
      }
    }

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    // 🔹 Upload multiple images (memory storage)
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64",
        )}`;

        const result = await cloudinary.uploader.upload(base64, {
          folder: "animeforge_products",
        });

        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // 🔹 Create product
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
    // Parse tags safely
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

    // Delete selected images
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

    // Upload new images
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64",
        )}`;

        const result = await cloudinary.uploader.upload(base64, {
          folder: "animeforge_products",
        });

        newUploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // Merge existing + new
    let mergedImages = [...product.images, ...newUploadedImages];

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

        mergedImages = order
          .map((id) => mergedImages.find((img) => img.public_id === id))
          .filter(Boolean);
      } catch (err) {
        console.error("Image order parse error:", err);
      }
    }

    product.images = mergedImages;

    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);
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
    product.tags = tags ?? product.tags;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
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

    // Delete image from Cloudinary
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
    const products = await Product.find({
      displaySection: "collection",
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Collection products
exports.getCollectionProducts = async (req, res) => {
  try {
    const products = await Product.find({
      displaySection: "collection",
    });

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
