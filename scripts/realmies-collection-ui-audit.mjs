import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const page = read("app/my-realmies/page.tsx");
const service = read("lib/realmies.ts");
const header = read("components/economy/EconomyHeader.tsx");
const home = read("app/home-base/page.tsx");
const release = read(
  "supabase/migrations/20260731120000_release_live_realmie_collection_assets.sql",
);

const checks = [
  ["route exists", fs.existsSync(path.join(root, "app/my-realmies/page.tsx"))],
  [
    "navigation and My Home entry exist",
    header.includes("/my-realmies") && home.includes("/my-realmies"),
  ],
  [
    "eight released presentation records exist",
    (service.match(/^\s{4}realmie_key:/gm) ?? []).length === 8,
  ],
  [
    "production ownership and preferences use canonical RPCs",
    [
      "get_student_realmies_secure",
      "set_student_realmie_favourite_secure",
      "set_student_realmie_display_slot_secure",
    ].every((token) => service.includes(token)),
  ],
  [
    "Demo Mode unlocks the released collection only",
    service.includes("isDemoPreviewMode") &&
      service.includes("owned: true") &&
      service.includes("catalogue.length"),
  ],
  [
    "collection includes required interaction states",
    [
      "Home display",
      "Favourites",
      "?????",
      "unlock_clue",
      "celebration",
    ].every((token) => page.includes(token)),
  ],
  [
    "Starpath is Coming Soon and Fog is absent",
    page.includes("Starpath Realmies") &&
      page.includes("Coming Soon") &&
      !page.includes("Fog Collection"),
  ],
  [
    "release migration exposes eight and hides unreleased realms",
    release.includes("v_ready_count <> 8") &&
      release.includes("realm_id = 'space'") &&
      release.includes("'collection_status', 'coming_soon'") &&
      release.includes("realm_id = 'global'") &&
      release.includes("'student_visible', false"),
  ],
];

let failed = false;
for (const [label, condition] of checks) {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}`);
  failed ||= !condition;
}

if (failed) process.exit(1);

console.log(`\nRealmies collection UI audit passed (${checks.length} checks).`);
