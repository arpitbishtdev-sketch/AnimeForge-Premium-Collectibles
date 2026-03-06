const StatusConfig = require("../models/StatusConfig");

async function seedStatus() {
  const defaults = [
    { status: "new", color: "#00C8FF" },
    { status: "popular", color: "#A855F7" },
    { status: "rare", color: "#EF4444" },
    { status: "featured", color: "#22C55E" },
    { status: "bestseller", color: "#F59E0B" },
    { status: "ultra-rare", color: "#FF007F" },
  ];

  for (const item of defaults) {
    const exists = await StatusConfig.findOne({ status: item.status });
    if (!exists) {
      await StatusConfig.create(item);
    }
  }

  console.log("Status seeded");
}

module.exports = seedStatus;
