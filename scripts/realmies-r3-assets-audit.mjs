import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const migrationPath = path.join(
  root,
  "supabase/migrations/20260731102000_register_realmie_production_assets.sql",
);

const expectedAssets = [
  ["number-nexus-numbot-counter-standard", "number/numbot-counter.png"],
  ["number-nexus-numbot-builder-standard", "number/numbot-builder.png"],
  ["number-nexus-numbot-processor-standard", "number/numbot-processor.png"],
  ["number-nexus-numbot-solver-standard", "number/numbot-solver.png"],
  ["number-nexus-numbot-calculator-standard", "number/numbot-calculator.png"],
  ["number-nexus-numbot-equationator-standard", "number/numbot-equationator.png"],
  ["measurelands-meazurex-ticklet-standard", "measurement/meazurex-ticklet.png"],
  ["measurelands-meazurex-measurer-standard", "measurement/meazurex-measurer.png"],
  ["measurelands-meazurex-tracker-standard", "measurement/meazurex-tracker.png"],
  ["measurelands-meazurex-balancer-standard", "measurement/meazurex-balancer.png"],
  ["measurelands-meazurex-calibrator-standard", "measurement/meazurex-calibrator.png"],
  ["measurelands-meazurex-timewielder-standard", "measurement/meazurex-timewielder.png"],
  ["starpath-geospin-roller-standard", "space/geospin-roller.png"],
  ["starpath-geospin-mapper-standard", "space/geospin-mapper.png"],
  ["starpath-geospin-navigator-standard", "space/geospin-navigator.png"],
  ["starpath-geospin-shapeshifter-standard", "space/geospin-shapeshifter.png"],
  ["starpath-geospin-galaxycrafter-standard", "space/geospin-galaxycrafter.png"],
  ["starpath-geospin-starweaver-standard", "space/geospin-starweaver.png"],
];

const failures = [];
const migration = fs.readFileSync(migrationPath, "utf8");

for (const [key, relativePath] of expectedAssets) {
  const publicPath = `/realmies/${relativePath}`;
  const filePath = path.join(root, "public/realmies", relativePath);

  if (!fs.existsSync(filePath)) {
    failures.push(`Missing asset: ${filePath}`);
    continue;
  }

  const metadata = await sharp(filePath).metadata();
  if (metadata.width !== 1200 || metadata.height !== 1600) {
    failures.push(
      `${relativePath} is ${metadata.width}x${metadata.height}; expected 1200x1600`,
    );
  }
  if (!metadata.hasAlpha) {
    failures.push(`${relativePath} does not have an alpha channel`);
  }

  const alpha = await sharp(filePath).ensureAlpha().extractChannel("alpha").stats();
  if (alpha.channels[0].min !== 0 || alpha.channels[0].max !== 255) {
    failures.push(`${relativePath} does not contain both transparent and opaque pixels`);
  }

  if (!migration.includes(`'${key}', '${publicPath}'`)) {
    failures.push(`Migration does not register ${key} at ${publicPath}`);
  }
}

const discoveredAssets = [];
for (const realm of ["number", "measurement", "space"]) {
  const directory = path.join(root, "public/realmies", realm);
  for (const file of fs.readdirSync(directory)) {
    if (file.endsWith(".png")) discoveredAssets.push(`${realm}/${file}`);
  }
}

if (discoveredAssets.length !== expectedAssets.length) {
  failures.push(
    `Expected exactly ${expectedAssets.length} Realmie PNGs; found ${discoveredAssets.length}`,
  );
}

for (const contract of [
  "'realm_id', 'number'",
  "'realm_id', 'measurement'",
  "'realm_id', 'space'",
  "'status', 'coming_soon'",
  "'collection_status'",
]) {
  if (!migration.includes(contract)) {
    failures.push(`Migration is missing collection availability contract: ${contract}`);
  }
}

if (migration.includes("variant_key")) {
  failures.push("Migration references nonexistent realmie_catalogue.variant_key");
}
if (!migration.includes("variant_type = 'standard'")) {
  failures.push("Migration does not verify the canonical variant_type column");
}

if (failures.length > 0) {
  console.error("Realmies R3 asset audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Realmies R3 asset audit passed: ${expectedAssets.length} transparent 1200x1600 renders registered.`,
);
