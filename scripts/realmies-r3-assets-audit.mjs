import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const brief = fs.readFileSync(
  path.join(root, "docs/REALMIES_PHASE_R3_ARTWORK_BRIEF.md"),
  "utf8",
);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, "docs/realmies-r3a-asset-manifest.json"),
    "utf8",
  ),
);
const migration = fs.readFileSync(
  path.join(
    root,
    "supabase/migrations/20260731103000_correct_realmies_to_discovery_model.sql",
  ),
  "utf8",
);

const packageFiles = [
  "hero-transparent.png",
  "front.png",
  "three-quarter.png",
  "left.png",
  "right.png",
  "back.png",
  "silhouette.png",
  "prototype-grey.png",
  "colour-zones.png",
  "specification.md",
];

let failed = false;
let delivered = 0;
let turnaroundConcepts = 0;
let digitalPrototypes = 0;

if (
  !Array.isArray(manifest.concept_sheets) ||
  manifest.concept_sheets.length !== 5
) {
  failed = true;
  console.log(
    `FAIL expected 5 approved-source concept sheets, found ${manifest.concept_sheets?.length ?? 0}`,
  );
} else {
  for (const sheet of manifest.concept_sheets) {
    const assetPath = path.join(root, "public", sheet.asset.replace(/^\//, ""));

    if (
      !["pending_owner_review", "style_reference_approved"].includes(sheet.status) ||
      sheet.production_asset !== false
    ) {
      failed = true;
      console.log(`FAIL ${sheet.stable_key} is not a valid non-production concept`);
    } else if (!fs.existsSync(assetPath)) {
      failed = true;
      console.log(`FAIL missing concept sheet ${sheet.asset}`);
    } else {
      console.log(`PASS concept sheet ${sheet.stable_key}`);
    }
  }
}

for (const entry of (manifest.realmies ?? []).filter(
  (candidate) => candidate.concept_status === "digital_3d_prototype_complete",
)) {
  const turnaroundPath = entry.turnaround_sheet_asset
    ? path.join(root, "public", entry.turnaround_sheet_asset.replace(/^\//, ""))
    : null;

  const isDigitalPrototype =
    entry.concept_status === "digital_3d_prototype_complete" &&
    ["phase_2_package_complete", "phase_3_package_complete"].includes(
      entry.design_status,
    );

  if (
    !isDigitalPrototype ||
    !turnaroundPath ||
    !fs.existsSync(turnaroundPath)
  ) {
    failed = true;
    console.log(`FAIL invalid digital prototype package status for ${entry.stable_key}`);
  } else {
    turnaroundConcepts += 1;
    console.log(`PASS turnaround source ${entry.stable_key}`);
  }

  if (isDigitalPrototype) {
    const modelAssets = [
      entry.digital_3d_glb_asset,
      entry.digital_3d_stl_asset,
      entry.digital_3d_metadata_asset,
    ];
    const modelFilesExist = modelAssets.every((asset) => {
      if (!asset) return false;
      const assetPath = path.join(root, "public", asset.replace(/^\//, ""));
      return fs.existsSync(assetPath) && fs.statSync(assetPath).size > 0;
    });

    if (!modelFilesExist) {
      failed = true;
      console.log(`FAIL missing 3D prototype files for ${entry.stable_key}`);
    } else {
      digitalPrototypes += 1;
      console.log(`PASS 3D prototype ${entry.stable_key}`);
    }
  }
}

const collectionConcept = manifest.collection_experience_concepts?.[0];
const collectionConceptPath = collectionConcept?.asset
  ? path.join(root, "public", collectionConcept.asset.replace(/^\//, ""))
  : null;
if (
  manifest.collection_experience_concepts?.length !== 1 ||
  collectionConcept?.production_asset !== false ||
  collectionConcept?.status !== "pending_owner_review" ||
  !collectionConceptPath ||
  !fs.existsSync(collectionConceptPath)
) {
  failed = true;
  console.log("FAIL Number Nexus collection detail concept is missing or invalid");
} else {
  console.log("PASS Number Nexus collection detail concept");
}

if (!Array.isArray(manifest.realmies) || manifest.realmies.length !== 15) {
  failed = true;
  console.log(
    `FAIL expected 15 manifest entries, found ${manifest.realmies?.length ?? 0}`,
  );
}

for (const entry of manifest.realmies ?? []) {
  if (!brief.includes(`\`${entry.stable_key}\``)) {
    failed = true;
    console.log(`FAIL artwork brief is missing ${entry.stable_key}`);
    continue;
  }

  if (entry.approval_status !== "pending") {
    failed = true;
    console.log(`FAIL ${entry.stable_key} is not pending owner approval`);
  }

  if (entry.manufacturing_risk === "high") {
    failed = true;
    console.log(`FAIL ${entry.stable_key} retains a high manufacturing risk`);
  }

  const packageRoot = path.join(root, "public/realmies", entry.stable_key);
  const deliveredFiles = packageFiles.filter((file) =>
    fs.existsSync(path.join(packageRoot, file)),
  );

  if (deliveredFiles.length === packageFiles.length) {
    delivered += 1;
    console.log(`PASS delivered complete package ${entry.stable_key}`);
  } else if (deliveredFiles.length > 0) {
    console.log(
      `PENDING ${entry.stable_key} (${deliveredFiles.length}/${packageFiles.length} files)`,
    );
  } else {
    console.log(`PENDING ${entry.stable_key}`);
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

if (failed) {
  process.exit(1);
}

console.log(
  `\nRealmies R3 asset readiness passed: ${delivered}/15 delivered, ${15 - delivered}/15 pending.`,
);
console.log(`${turnaroundConcepts}/8 delivered turnaround sources present.`);
console.log(
  `${digitalPrototypes}/8 Number Nexus and Measurelands digital prototypes complete; owner approval remains pending.`,
);
console.log(
  "Digital collection release boundary: 8 live assets, Starpath Coming Soon, Fog hidden.",
);
