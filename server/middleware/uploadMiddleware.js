const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: 20, // total files per request
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

module.exports = upload;
