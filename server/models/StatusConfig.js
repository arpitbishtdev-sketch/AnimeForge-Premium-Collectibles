const mongoose = require("mongoose");

const statusConfigSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("StatusConfig", statusConfigSchema);
