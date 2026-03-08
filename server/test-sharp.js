const sharp = require("sharp");
const { optimizeImage } = require("./middleware/imageOptimizer");
const fs = require("fs");

async function test() {
  console.log("Sharp version:", sharp.versions);

  const testBuffer = await sharp({
    create: {
      width: 2000,
      height: 2000,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .jpeg()
    .toBuffer();

  console.log("Input size:", testBuffer.length, "bytes");

  const result = await optimizeImage(testBuffer, "product", "image/jpeg");

  const meta = await sharp(result).metadata();
  console.log("Output format:", meta.format);
  console.log("Output width:", meta.width);
  console.log("Output height:", meta.height);
  console.log("Output size:", result.length, "bytes");

  fs.writeFileSync("test-output.webp", result);
  console.log("✅ Done! Open test-output.webp to verify visually");
}

test().catch(console.error);
