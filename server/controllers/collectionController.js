const Collection = require("../models/Collection");
const Product = require("../models/Product");
const StatusConfig = require("../models/StatusConfig");

// ── Helper: build glow + particle from a hex accent chosen by admin ────────
function buildAccentPalette(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    accentColor: hex,
    glowColor: `rgba(${r},${g},${b},0.4)`,
    particleColor: hex,
  };
}

// GET /api/collections/status-colors — returns StatusConfig list for the picker
exports.getStatusColors = async (req, res) => {
  try {
    const statuses = await StatusConfig.find().sort({ status: 1 });
    res.status(200).json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Helper: compute price range + item count from products with this tag ───
async function computeStats(tag) {
  const products = await Product.find({
    tags: { $regex: new RegExp(`^${tag}$`, "i") },
    stock: { $gt: 0 },
  }).select("basePrice");

  if (!products.length) return { itemCount: 0, priceMin: null, priceMax: null };

  const prices = products.map((p) => p.basePrice).filter(Boolean);
  return {
    itemCount: products.length,
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
  };
}

// GET /api/collections — public, enriched with live stats
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });

    const enriched = await Promise.all(
      collections.map(async (col) => {
        const stats = await computeStats(col.tag);
        const obj = col.toObject();
        return { ...obj, ...stats };
      }),
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error("GET COLLECTIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/collections/admin — admin, all including inactive
exports.getAllCollectionsAdmin = async (req, res) => {
  try {
    const collections = await Collection.find().sort({
      order: 1,
      createdAt: 1,
    });

    const enriched = await Promise.all(
      collections.map(async (col) => {
        const stats = await computeStats(col.tag);
        const obj = col.toObject();
        return { ...obj, ...stats };
      }),
    );

    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/collections/:id
exports.getSingleCollection = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).json({ message: "Not found" });

    const stats = await computeStats(col.tag);
    res.status(200).json({ ...col.toObject(), ...stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/collections — admin create
exports.createCollection = async (req, res) => {
  try {
    // Max 6 check
    const count = await Collection.countDocuments();
    if (count >= 6) {
      return res.status(400).json({
        message: "Maximum 6 collections allowed. Delete one first.",
      });
    }

    const body = req.body;

    // Parse points
    let points = body.points;
    if (typeof points === "string") {
      try {
        points = JSON.parse(points);
      } catch {
        points = ["", "", ""];
      }
    }
    if (!Array.isArray(points) || points.length !== 3) points = ["", "", ""];

    // Build accent palette — look up StatusConfig by badge name (source of truth)
    let accent = null;
    if (body.badge) {
      const statusEntry = await StatusConfig.findOne({ status: body.badge });
      if (statusEntry?.color) accent = buildAccentPalette(statusEntry.color);
    }
    if (!accent && body.accentColor)
      accent = buildAccentPalette(body.accentColor);

    // Auto-set label = count+1 zero-padded
    const label = String(count + 1).padStart(2, "0");

    const collection = await Collection.create({
      ...body,
      points,
      label,
      ...(accent || {}),
    });

    res.status(201).json(collection);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "A collection with this tag already exists." });
    }
    console.error("CREATE COLLECTION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/collections/:id — admin update
exports.updateCollection = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).json({ message: "Not found" });

    const body = req.body;

    // Parse points
    let points = body.points;
    if (typeof points === "string") {
      try {
        points = JSON.parse(points);
      } catch {
        points = col.points;
      }
    }
    if (!Array.isArray(points) || points.length !== 3) points = col.points;

    // Always re-derive accent from the chosen badge (StatusConfig is the source of truth)
    const badgeKey = body.badge ?? col.badge;
    let accent = null;
    if (badgeKey) {
      const statusEntry = await StatusConfig.findOne({ status: badgeKey });
      if (statusEntry?.color) {
        accent = buildAccentPalette(statusEntry.color);
      }
    }
    // Fallback: use whatever accentColor was sent by frontend
    if (!accent && body.accentColor) {
      accent = buildAccentPalette(body.accentColor);
    }

    Object.assign(col, {
      tag: body.tag ?? col.tag,
      subtitle: body.subtitle ?? col.subtitle,
      title: body.title ?? col.title,
      tagLine: body.tagLine ?? col.tagLine,
      description: body.description ?? col.description,
      points,
      material: body.material ?? col.material,
      scaleFrom: body.scaleFrom ?? col.scaleFrom,
      scaleTo: body.scaleTo ?? col.scaleTo,
      logo: body.logo ?? col.logo,
      bgImage: body.bgImage ?? col.bgImage,
      badge: badgeKey,
      order: body.order != null ? Number(body.order) : col.order,
      isActive:
        body.isActive != null
          ? body.isActive === true || body.isActive === "true"
          : col.isActive,
      ...(accent || {}),
    });

    await col.save();
    res.status(200).json(col);
  } catch (err) {
    console.error("UPDATE COLLECTION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/collections/:id — admin delete
exports.deleteCollection = async (req, res) => {
  try {
    const col = await Collection.findByIdAndDelete(req.params.id);
    if (!col) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Collection deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
