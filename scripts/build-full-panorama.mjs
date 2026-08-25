import sharp from "sharp";

const [frontPath, rearPath, frontToRearPath, rearToFrontPath, outputPath] = process.argv.slice(2);

if (!frontPath || !rearPath || !frontToRearPath || !rearToFrontPath || !outputPath) {
  throw new Error("Usage: node scripts/build-full-panorama.mjs <front> <rear> <front-to-rear> <rear-to-front> <output>");
}

const width = 4096;
const height = 2224;
const sceneWidth = 3072;
const transitionWidth = 1024;
const transitionHalf = transitionWidth / 2;
const totalWidth = 8192;

const normalizeScene = (path) => sharp(path)
  .resize(width, height, { fit: "fill" })
  .extract({ left: (width - sceneWidth) / 2, top: 0, width: sceneWidth, height })
  .png()
  .toBuffer();
const normalizeTransition = (path) => sharp(path)
  .resize(transitionWidth, height, { fit: "fill" })
  .png()
  .toBuffer();

const [front, rear, frontToRear, rearToFront] = await Promise.all([
  normalizeScene(frontPath),
  normalizeScene(rearPath),
  normalizeTransition(frontToRearPath),
  normalizeTransition(rearToFrontPath),
]);
const [rearToFrontLeft, rearToFrontRight] = await Promise.all([
  sharp(rearToFront).extract({ left: 0, top: 0, width: transitionHalf, height }).png().toBuffer(),
  sharp(rearToFront).extract({ left: transitionHalf, top: 0, width: transitionHalf, height }).png().toBuffer(),
]);

const assembled = await sharp({ create: { width: totalWidth, height, channels: 3, background: "#b98f68" } })
  .composite([
    { input: rearToFrontRight, left: 0, top: 0 },
    { input: front, left: transitionHalf, top: 0 },
    { input: frontToRear, left: transitionHalf + sceneWidth, top: 0 },
    { input: rear, left: transitionHalf + sceneWidth + transitionWidth, top: 0 },
    { input: rearToFrontLeft, left: totalWidth - transitionHalf, top: 0 },
  ])
  .png()
  .toBuffer();

const joinPositions = [transitionHalf, transitionHalf + sceneWidth, transitionHalf + sceneWidth + transitionWidth, totalWidth - transitionHalf];
const joinWidth = 480;
async function bridgeJoin(position) {
  const half = joinWidth / 2;
  const [left, right] = await Promise.all([
    sharp(assembled).extract({ left: position - half, top: 0, width: half, height }).resize(joinWidth, height, { fit: "fill" }).png().toBuffer(),
    sharp(assembled).extract({ left: position, top: 0, width: half, height }).resize(joinWidth, height, { fit: "fill" }).png().toBuffer(),
  ]);
  const mask = Buffer.from(`<svg width="${joinWidth}" height="${height}"><defs><linearGradient id="fade"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset="35%" stop-color="white" stop-opacity="0.18"/><stop offset="65%" stop-color="white" stop-opacity="0.82"/><stop offset="100%" stop-color="white" stop-opacity="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#fade)"/></svg>`);
  const fadedRight = await sharp(right).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return sharp(left).composite([{ input: fadedRight, blend: "over" }]).blur(0.7).png().toBuffer();
}
const softenedJoins = await Promise.all(joinPositions.map(bridgeJoin));
const continuous = await sharp(assembled)
  .composite(softenedJoins.map((input, index) => ({ input, left: joinPositions[index] - joinWidth / 2, top: 0 })))
  .png()
  .toBuffer();

// Rotate the circular strip so the original forward academy remains at the spawn-facing center.
const rotated = await sharp({ create: { width: totalWidth, height, channels: 3, background: "#b98f68" } })
  .composite([
    { input: await sharp(continuous).extract({ left: 6144, top: 0, width: 2048, height }).png().toBuffer(), left: 0, top: 0 },
    { input: await sharp(continuous).extract({ left: 0, top: 0, width: 6144, height }).png().toBuffer(), left: 2048, top: 0 },
  ])
  .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
  .toFile(outputPath);

console.log(`${rotated.width}x${rotated.height} ${outputPath}`);
