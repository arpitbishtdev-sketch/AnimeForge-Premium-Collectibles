/**
 * uploadErrorHandler.js
 * ─────────────────────────────────────────────────────────────────
 * Add this middleware AFTER your routes in server.js so that
 * Multer and Sharp errors return clean JSON instead of HTML stack traces.
 *
 * Usage in server.js:
 *   const uploadErrorHandler = require("./middleware/uploadErrorHandler");
 *   // ... all your app.use(routes) ...
 *   app.use(uploadErrorHandler);   ← must be last
 * ─────────────────────────────────────────────────────────────────
 */

const multer = require("multer");

// eslint-disable-next-line no-unused-vars
module.exports = function uploadErrorHandler(err, req, res, next) {
  // Multer file size exceeded
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "File too large. Maximum raw upload size is 10 MB.",
      });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  // Our custom file-type rejection (thrown in multerFileFilter)
  if (err && err.status === 415) {
    return res.status(415).json({ message: err.message });
  }

  // Sharp processing error
  if (err && err.message && err.message.includes("sharp")) {
    return res.status(422).json({
      message: "Image processing failed. Please upload a valid image file.",
    });
  }

  // Pass everything else to the default Express error handler
  next(err);
};
