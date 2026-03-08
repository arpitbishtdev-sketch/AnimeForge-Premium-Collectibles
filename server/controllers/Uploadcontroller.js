const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const {
  optimizeImage,
  multerFileFilter,
} = require("../middleware/imageOptimizer");

// ── Multer — memory storage, 10 MB raw limit, image-only filter ──
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB raw — Sharp will compress down
  fileFilter: multerFileFilter,
});

// ── Helper: pick optimisation profile from request ────────────────
function getProfile(req) {
  // Accept from query string (?type=product) or body (uploadType: "product")
  const raw = (
    req.query.type ||
    req.body?.uploadType ||
    "general"
  ).toLowerCase();

  const MAP = {
    product: "product",
    products: "product",
    collection: "collection",
    collections: "collection",
    hero: "hero",
    banner: "hero",
    character: "character",
    theme: "character",
    thumbnail: "thumbnail",
    thumb: "thumbnail",
  };

  return MAP[raw] || "general";
}

// ── Helper: pick Cloudinary folder from profile ───────────────────
function getFolder(profile) {
  const FOLDERS = {
    product: "animeforge/products",
    collection: "animeforge/collections",
    hero: "animeforge/heroes",
    character: "animeforge/characters",
    thumbnail: "animeforge/thumbnails",
    general: "animeforge/general",
  };
  return FOLDERS[profile] || "animeforge/general";
}

// ── Main upload handler ───────────────────────────────────────────
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const profile = getProfile(req);
    const folder = getFolder(profile);

    // 1. Optimise with Sharp (resize + compress + convert to WebP)
    const optimisedBuffer = await optimizeImage(
      req.file.buffer,
      profile,
      req.file.mimetype,
    );

    // 2. Upload optimised buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          format: "webp", // force WebP storage on Cloudinary side too
          // Cloudinary-side transformations disabled — Sharp already did the work
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(optimisedBuffer);
    });

    // 3. Respond — same shape as before so nothing in the frontend breaks
    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    // Multer file-filter errors come with status 415
    const status = err.status || 500;
    res.status(status).json({ message: err.message });
  }
};

// ── Middleware export (unchanged name — routes still work) ─────────
exports.uploadMiddleware = upload.single("file");
