import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const brief = fs.readFileSync(
  path.join(root, "docs/REALMIES_PHASE_R3_ARTWORK_BRIEF.md"),
  "utf8",
);
const migration = fs.readFileSync(
  path.join(
    root,
    "supabase/migrations/20260731103000_correct_realmies_to_discovery_model.sql",
  ),
  "utf8",
);

const assets = [
  "number/bitling.png",
  "number/carrybot.png",
  "number/codekeeper.png",
  "number/neon-sentinel.png",
  "measurement/gaugekin.png",
  "measurement/ruleroot.png",
  "measurement/compass-keeper.png",
  "measurement/golden-surveyor.png",
  "space/orbitling.png",
  "space/prism-scout.png",
  "space/constellation-keeper.png",
  "space/aurora-guardian.png",
  "global/fogling.png",
  "global/mist-mischief.png",
  "global/shadow-of-forgetfulness.png",
];

let failed = false;
let delivered = 0;

for (const asset of assets) {
  const publicPath = `/realmies/${asset}`;
  const absolutePath = path.join(root, "public/realmies", asset);
  const isBriefed = brief.includes(publicPath);
  const exists = fs.existsSync(absolutePath);

  if (!isBriefed) {
    failed = true;
    console.log(`FAIL artwork brief is missing ${publicPath}`);
    continue;
  }

  if (exists) {
    delivered += 1;
    const bytes = fs.statSync(absolutePath).size;
    if (bytes < 1024) {
      failed = true;
      console.log(`FAIL ${publicPath} is too small to be production artwork`);
    } else {
      console.log(`PASS delivered ${publicPath}`);
    }
  } else {
    console.log(`PENDING ${publicPath}`);
  }
}

if (!migration.includes('"asset_status":"awaiting_production"')) {
  failed = true;
  console.log("FAIL catalogue does not mark corrected artwork as awaiting production");
} else {
  console.log("PASS catalogue records the production-art blocker");
}

const oldLegendNames = ["numbot", "meazurex", "geospin"];
if (oldLegendNames.some((name) => brief.toLowerCase().includes(`/${name}`))) {
  failed = true;
  console.log("FAIL artwork brief includes a retired main Legend asset");
} else {
  console.log("PASS artwork brief excludes retired main Legend assets");
}

if (assets.length !== 15) {
  failed = true;
  console.log(`FAIL expected 15 production assets, audited ${assets.length}`);
}

if (failed) {
  process.exit(1);
}

console.log(
  `\nRealmies R3 asset readiness passed: ${delivered}/15 delivered, ${15 - delivered}/15 pending.`,
);
console.log("Polished My Realmies UI remains blocked until all 15 are approved.");
