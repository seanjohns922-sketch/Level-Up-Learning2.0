import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const artwork = read("components/legends/LegendCardArtwork.tsx");
const reveal = read("components/LegendUnlockReveal.tsx");
const binder = read("components/legends/BinderCard.tsx");
const detail = read("components/legends/LegendDetailModal.tsx");
const hall = read("components/home/HallOfLegendsWidget.tsx");

const checks = [
  ["Shared artwork renderer always contains the full image", artwork.includes("object-contain")],
  ["Unlock reveal uses the shared artwork renderer", reveal.includes("<LegendCardArtwork")],
  ["Unlock reveal uses the canonical card stage ratio", reveal.includes("aspect-[2/3]")],
  ["Unlock reveal no longer crops card artwork", !reveal.includes('className="w-full h-full object-cover"')],
  ["Binder uses the shared artwork renderer", binder.includes("<LegendCardArtwork")],
  ["Detail and enlarged views use the shared artwork renderer", (detail.match(/<LegendCardArtwork/g) ?? []).length === 2],
  ["Hall teaser uses the shared artwork renderer", hall.includes("<LegendCardArtwork")],
];

console.log("\nLegend Card Artwork Audit");
console.log("=".repeat(64));
let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (ok) passed += 1;
}
console.log("=".repeat(64));
console.log(`${passed}/${checks.length} checks passed.`);
if (passed !== checks.length) process.exit(1);
