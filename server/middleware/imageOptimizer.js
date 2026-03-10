const sharp = require("sharp");

// ── Profile definitions ───────────────────────────────────────────
const PROFILES = {
  hero: {
    width: 1920,
    height: 800,
    maxBytes: 2 * 1024 * 1024, // 2 MB
    quality: 82,
    fit: "cover",
  },
  product: {
    width: 1000,
    height: 1000,
    maxBytes: 1 * 1024 * 1024, // 1 MB
    quality: 85,
    fit: "cover",
  },
  thumbnail: {
    width: 500,
    height: 500,
    maxBytes: 300 * 1024, // 300 KB
    quality: 80,
    fit: "cover",
  },
  collection: {
    width: 800,
    height: 800,
    maxBytes: 800 * 1024, // 800 KB
    quality: 83,
    fit: "cover",
  },
  character: {
    // character PNGs often need transparency → keep quality high
    width: 1200,
    height: 1200,
    maxBytes: 2 * 1024 * 1024,
    quality: 88,
    fit: "inside", // don't crop — character silhouettes matter
  },
  general: {
    width: 1200,
    height: 1200,
    maxBytes: 2 * 1024 * 1024,
    quality: 82,
    fit: "inside",
  },
};

// ── Allowed MIME types ────────────────────────────────────────────
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif", // kept for sticker-style uploads
]);

/**
 * Validate that the file is an allowed image type.
 * Throws an error (caught by Express error handler) if not.
 */
function validateMimeType(mimetype) {
  if (!ALLOWED_TYPES.has(mimetype)) {
    const err = new Error(
      `Unsupported file type: ${mimetype}. Allowed: JPEG, PNG, WebP.`,
    );
    err.status = 415;
    throw err;
  }
}

/**
 * Core optimizer — takes a raw Buffer, returns an optimised WebP Buffer.
 *
 * @param {Buffer} inputBuffer   - Raw file buffer from multer memoryStorage
 * @param {string} profile       - One of the keys in PROFILES
 * @param {string} mimetype      - Original MIME type (for GIF pass-through)
 * @returns {Promise<Buffer>}    - Optimised WebP buffer
 */
async function optimizeImage(inputBuffer, profile = "general", mimetype = "") {
  const cfg = PROFILES[profile] || PROFILES.general;

  // GIF → pass through unchanged (Sharp GIF support is limited)
  if (mimetype === "image/gif") return inputBuffer;

  // Get metadata to decide whether resize is needed
  const meta = await sharp(inputBuffer).metadata();

  const needsResize = meta.width > cfg.width || meta.height > cfg.height;

  let pipeline = sharp(inputBuffer);

  if (needsResize) {
    pipeline = pipeline.resize(cfg.width, cfg.height, {
      fit: cfg.fit,
      withoutEnlargement: true, // never upscale small images
      position: "attention", // smart crop — focuses on faces/subjects
    });
  }

  // Always convert to WebP with target quality
  const optimised = await pipeline
    .webp({ quality: cfg.quality, effort: 4 })
    .toBuffer();

  return optimised;
}

/**
 * Multer file filter — rejects non-image files before they hit Sharp.
 * Attach this as multer's `fileFilter` option.
 */
function multerFileFilter(req, file, cb) {
  if (ALLOWED_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are accepted.`,
      ),
      false,
    );
  }
}

module.exports = {
  optimizeImage,
  validateMimeType,
  multerFileFilter,
  PROFILES,
};
