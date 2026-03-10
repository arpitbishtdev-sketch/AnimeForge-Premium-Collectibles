const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const StatusConfig = require("../models/StatusConfig");
const { optimizeImage } = require("../middleware/imageOptimizer");

// ─────────────────────────────────────────────────────
// Helper: upload a buffer to Cloudinary
// ─────────────────────────────────────────────────────
async function uploadToCloudinary(buffer, mimetype, folder) {
  const optimised = await optimizeImage(buffer, "product", mimetype);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: "webp" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(optimised);
  });
}

// ─────────────────────────────────────────────────────
// Helper: upload all images for a single variant
// ─────────────────────────────────────────────────────
async function uploadVariantImages(files, variantIndex) {
  const variantFiles = files
    .filter(
      (f) =>
        f.fieldname === `variantImage_${variantIndex}` ||
        f.fieldname.startsWith(`variantImage_${variantIndex}_`),
    )
    .sort(
      (a, b) =>
        parseInt(a.fieldname.split("_")[2] || 0) -
        parseInt(b.fieldname.split("_")[2] || 0),
    );

  if (!variantFiles.length) return null;

  const uploaded = [];
  for (const f of variantFiles) {
    const result = await uploadToCloudinary(
      f.buffer,
      f.mimetype,
      "animeforge_products/variants",
    );
    uploaded.push({ url: result.secure_url, public_id: result.public_id });
  }
  return uploaded;
}

// ─────────────────────────────────────────────────────
// Helper: safely parse JSON string or return fallback
// ─────────────────────────────────────────────────────
function safeParseJSON(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────
// GET all products
// ─────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, limit, displaySection, tag } = req.query;
    const filter = {};
    if (displaySection) filter.displaySection = displaySection;
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag.toLowerCase()] };
    if (search && search.trim()) {
      const t = search.trim();
      filter.$or = [
        { name: { $regex: t, $options: "i" } },
        { tags: { $regex: t, $options: "i" } },
      ];
    }

    let query = Product.find(filter).sort({ createdAt: -1 });
    if (limit && !isNaN(parseInt(limit)))
      query = query.limit(Math.min(parseInt(limit), 50));

    const [products, statuses] = await Promise.all([
      query,
      StatusConfig.find(),
    ]);

    const formatted = products.map((p) => {
      const obj = p.toObject();
      const sc = statuses.find(
        (s) => s.status?.toLowerCase() === obj.status?.toLowerCase(),
      );
      return {
        ...obj,
        image: obj.images?.[0]?.url || null,
        themeColor: sc?.color || obj.themeColor || null,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────
// GET single product by ID
// ─────────────────────────────────────────────────────
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────
// GET product by slug
// Also returns sibling products that share the same variantGroup
// ─────────────────────────────────────────────────────
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const statusConfig = await StatusConfig.findOne({ status: product.status });
    const obj = product.toObject();

    // Fetch sibling products that share the same variantGroup
    let siblings = [];
    if (obj.variantGroup) {
      const siblingDocs = await Product.find({
        variantGroup: obj.variantGroup,
        _id: { $ne: obj._id }, // exclude self
      }).select("name slug images basePrice status themeColor variantGroup");

      siblings = siblingDocs.map((s) => {
        const sObj = s.toObject();
        return {
          ...sObj,
          image: sObj.images?.[0]?.url || null,
        };
      });
    }

    res.status(200).json({
      ...obj,
      image: obj.images?.[0]?.url || null,
      themeColor: statusConfig?.color || obj.themeColor || null,
      siblings, // [] if no variantGroup, otherwise the linked products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────
// GET shop products
// ─────────────────────────────────────────────────────
exports.getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({ displaySection: "shop" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────
// GET collection products
// ─────────────────────────────────────────────────────
exports.getCollectionProducts = async (req, res) => {
  try {
    const products = await Product.find({ displaySection: "collection" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────
// CREATE product
// ─────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const tags = safeParseJSON(req.body.tags, []);
    let variants = safeParseJSON(req.body.variants, []);

    // ── Shop section limit check ──
    if (req.body.displaySection === "shop") {
      const count = await Product.countDocuments({ displaySection: "shop" });
      if (count >= 6) {
        return res.status(400).json({
          message:
            "Shop already has 6 products. Remove one before adding another.",
        });
      }
    }

    // ── Upload main product images ──
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === "images") {
          const result = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "animeforge_products",
          );
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }

      // ── Upload variant images ──
      for (let i = 0; i < variants.length; i++) {
        const uploaded = await uploadVariantImages(req.files, i);
        if (uploaded) {
          variants[i].image = uploaded[0];
          variants[i].images = uploaded;
        }
      }
    }

    // ── Normalise variantGroup ──
    const variantGroup = req.body.variantGroup
      ? req.body.variantGroup.trim().toLowerCase().replace(/\s+/g, "-")
      : undefined;

    const product = await Product.create({
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description || "",
      category: req.body.category,
      basePrice: Number(req.body.basePrice),
      originalPrice: req.body.originalPrice
        ? Number(req.body.originalPrice)
        : undefined,
      stock: Number(req.body.stock) || 0,
      status: req.body.status || "new",
      displaySection: req.body.displaySection || "collection",
      themeColor: req.body.themeColor || undefined,
      variantGroup: variantGroup || undefined,
      tags,
      variants,
      images: uploadedImages,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    for (const img of uploadedImages) {
      await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    }

    if (error.code === 11000)
      return res.status(400).json({
        message: "Slug already exists. Use a different product name.",
      });

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message: messages });
    }

    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ─────────────────────────────────────────────────────
// UPDATE product
// ─────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  let newUploadedImages = [];

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ── Shop limit check on section change ──
    if (
      req.body.displaySection === "shop" &&
      product.displaySection !== "shop"
    ) {
      const count = await Product.countDocuments({ displaySection: "shop" });
      if (count >= 6) {
        return res.status(400).json({
          message:
            "Shop already has 6 products. Remove one before moving here.",
        });
      }
    }

    const tags = safeParseJSON(req.body.tags, null);

    // ── Handle variants ──
    if (req.body.variants !== undefined) {
      let variants = safeParseJSON(req.body.variants, product.variants);

      if (Array.isArray(req.files)) {
        for (let i = 0; i < variants.length; i++) {
          const uploaded = await uploadVariantImages(req.files, i);
          if (uploaded) {
            const oldImgs = variants[i]?.images?.length
              ? variants[i].images
              : variants[i]?.image
                ? [variants[i].image]
                : [];
            for (const old of oldImgs) {
              if (old?.public_id)
                await cloudinary.uploader
                  .destroy(old.public_id)
                  .catch(() => {});
            }
            variants[i].image = uploaded[0];
            variants[i].images = uploaded;
          }
        }
      }

      product.variants = variants;
    }

    // ── Handle deleted main images ──
    if (req.body.deletedImages && req.body.deletedImages !== "undefined") {
      const deletedIds = safeParseJSON(req.body.deletedImages, []);
      for (const imgId of deletedIds) {
        if (product.images.find((i) => i.public_id === imgId)) {
          await cloudinary.uploader.destroy(imgId).catch(() => {});
        }
      }
      product.images = product.images.filter(
        (img) => !deletedIds.includes(img.public_id),
      );
    }

    // ── Upload new main product images ──
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.fieldname === "images") {
          const result = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "animeforge_products",
          );
          newUploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    }

    // ── Re-order saved images ──
    let savedImages = [...product.images];
    if (req.body.imageOrder && req.body.imageOrder !== "undefined") {
      const order = safeParseJSON(req.body.imageOrder, []);
      if (order.length) {
        const orderedSaved = order
          .map((id) => savedImages.find((img) => img.public_id === id))
          .filter(Boolean);
        const unordered = savedImages.filter(
          (img) => !order.includes(img.public_id),
        );
        savedImages = [...orderedSaved, ...unordered];
      }
    }
    product.images = [...savedImages, ...newUploadedImages];

    // ── Update scalar fields ──
    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.slug !== undefined) product.slug = req.body.slug;
    if (req.body.category !== undefined) product.category = req.body.category;
    if (req.body.description !== undefined)
      product.description = req.body.description;
    if (req.body.status !== undefined) product.status = req.body.status;
    if (req.body.themeColor !== undefined)
      product.themeColor = req.body.themeColor;
    if (req.body.displaySection !== undefined)
      product.displaySection = req.body.displaySection;
    if (req.body.basePrice !== undefined)
      product.basePrice = Number(req.body.basePrice);
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.originalPrice !== undefined && req.body.originalPrice !== "")
      product.originalPrice = Number(req.body.originalPrice);
    if (tags !== null && tags.length > 0) product.tags = tags;

    // ── Update variantGroup ──
    if (req.body.variantGroup !== undefined) {
      const vg = req.body.variantGroup
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      product.variantGroup = vg || undefined;
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    for (const img of newUploadedImages) {
      await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message: messages });
    }

    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ─────────────────────────────────────────────────────
// DELETE product
// ─────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    for (const img of product.images) {
      if (img.public_id)
        await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    }

    for (const v of product.variants || []) {
      const imgs = v.images?.length ? v.images : v.image ? [v.image] : [];
      for (const img of imgs) {
        if (img?.public_id)
          await cloudinary.uploader.destroy(img.public_id).catch(() => {});
      }
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────
// PROMOTE variant to its own independent product
// ─────────────────────────────────────────────────────
exports.promoteVariant = async (req, res) => {
  try {
    const { id, variantIndex } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const vi = parseInt(variantIndex);
    const variant = product.variants[vi];
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Build slug from parent name + variant value
    const slugBase = `${product.slug}-${variant.value}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    // Check slug uniqueness, append -2/-3 if taken
    let slug = slugBase;
    let suffix = 2;
    while (await Product.findOne({ slug })) {
      slug = `${slugBase}-${suffix++}`;
    }

    // New product inherits parent data, overrides with variant data
    const newProduct = await Product.create({
      name: variant.title?.trim() || `${product.name} — ${variant.value}`,
      slug,
      description: variant.description?.trim() || product.description || "",
      category: variant.category || product.category,
      basePrice: product.basePrice + Number(variant.priceModifier || 0),
      stock: Number(variant.stock) || 0,
      status: variant.status || product.status,
      themeColor: product.themeColor,
      displaySection: product.displaySection,
      // Same variantGroup so it shows as sibling automatically
      variantGroup: product.variantGroup || product.slug,
      tags: variant.tags?.length ? variant.tags : product.tags,
      images: variant.images?.length
        ? variant.images
        : variant.image?.url
          ? [variant.image]
          : product.images,
      variants: [],
    });

    // Also set variantGroup on parent if it didn't have one
    if (!product.variantGroup) {
      product.variantGroup = product.slug;
      await product.save();
    }

    // Auto-delete the promoted variant from parent
    product.variants.splice(vi, 1);
    await product.save();

    res.status(201).json({
      message: "Variant promoted to product successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("PROMOTE VARIANT ERROR:", error);
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "A product with this slug already exists." });
    res.status(500).json({ message: error.message || "Server error" });
  }
};
