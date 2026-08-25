import sharp from "sharp";

const [leftPath, rightPath, leftToRightPanelPath, rightToLeftPanelPath, leftOutput, rightOutput] = process.argv.slice(2);

if (!leftPath || !rightPath || !leftToRightPanelPath || !rightToLeftPanelPath || !leftOutput || !rightOutput) {
  throw new Error("Usage: node scripts/blend-panorama-seams.mjs <left> <right> <left-to-right-panel> <right-to-left-panel> <left-output> <right-output>");
}

const leftMeta = await sharp(leftPath).metadata();
const rightMeta = await sharp(rightPath).metadata();
const width = Math.min(leftMeta.width ?? 0, rightMeta.width ?? 0);
const height = Math.min(leftMeta.height ?? 0, rightMeta.height ?? 0);
const panelHalfWidth = Math.round(width * 0.16);
const featherWidth = Math.round(panelHalfWidth * 0.28);

if (!width || !height) throw new Error("Unable to read panorama dimensions");

const normalize = (path) => sharp(path).resize(width, height, { fit: "fill" }).png().toBuffer();
const normalizePanel = (path) => sharp(path).resize(panelHalfWidth * 2, height, { fit: "fill" }).png().toBuffer();
const [leftSource, rightSource, leftToRightPanel, rightToLeftPanel] = await Promise.all([
  normalize(leftPath),
  normalize(rightPath),
  normalizePanel(leftToRightPanelPath),
  normalizePanel(rightToLeftPanelPath),
]);

async function panelHalf(panel, side) {
  const extracted = await sharp(panel)
    .extract({ left: side === "left" ? 0 : panelHalfWidth, top: 0, width: panelHalfWidth, height })
    .png()
    .toBuffer();
  const stops = side === "left"
    ? `<stop offset="0" stop-color="white" stop-opacity="0"/><stop offset="${featherWidth}" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="1"/>`
    : `<stop offset="0" stop-color="white" stop-opacity="1"/><stop offset="${panelHalfWidth - featherWidth}" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="0"/>`;
  const mask = Buffer.from(`<svg width="${panelHalfWidth}" height="${height}"><defs><linearGradient id="fade" gradientUnits="userSpaceOnUse" x1="0" x2="${panelHalfWidth}">${stops}</linearGradient></defs><rect width="100%" height="100%" fill="url(#fade)"/></svg>`);
  return sharp(extracted).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

const [leftEnd, rightStart, rightEnd, leftStart] = await Promise.all([
  panelHalf(leftToRightPanel, "left"),
  panelHalf(leftToRightPanel, "right"),
  panelHalf(rightToLeftPanel, "left"),
  panelHalf(rightToLeftPanel, "right"),
]);

await Promise.all([
  sharp(leftSource)
    .composite([
      { input: leftStart, left: 0, top: 0 },
      { input: leftEnd, left: width - panelHalfWidth, top: 0 },
    ])
    .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
    .toFile(leftOutput),
  sharp(rightSource)
    .composite([
      { input: rightStart, left: 0, top: 0 },
      { input: rightEnd, left: width - panelHalfWidth, top: 0 },
    ])
    .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
    .toFile(rightOutput),
]);
