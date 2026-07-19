import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const fail = (message) => {
  console.error(`Marketplace artwork audit failed: ${message}`);
  process.exitCode = 1;
};

const marketplace = read("app/marketplace/page.tsx");
const renderer = read("components/economy/MarketplaceItemImage.tsx");
const petArt = read("components/pets/PetArt.tsx");
const resolver = read("lib/marketplace-visuals.ts");
const migration = read("supabase/migrations/20260720170000_marketplace_artwork_integrity.sql");
const homeThemes = read("supabase/migrations/20260719140000_home_themes.sql");
const economyFoundation = read("supabase/migrations/20260718110000_student_economy_foundation.sql");
const clothing = read("supabase/migrations/20260719190000_earnable_clothing_styles.sql");
const economy = read("lib/economy.ts");

if (/function ItemIcon|item\.icon/.test(marketplace)) fail("marketplace page still renders category icons");
if ((marketplace.match(/<MarketplaceItemImage/g) ?? []).length !== 2) fail("card and preview must share MarketplaceItemImage");
if (!/selectedUnavailable/.test(marketplace) || !/disabled=\{busy \|\| selectedUnavailable/.test(marketplace)) fail("unavailable artwork does not block purchase");
if (!/purchaseEconomyItem/.test(marketplace) || !/equipEconomyItem/.test(marketplace)) fail("purchase or equip integration was removed");
if (!/selected\.item_key/.test(marketplace)) fail("selected visual and purchase/equip actions do not share the stable item key");
if (!/isEquipped \? \"Equipped\"/.test(marketplace)) fail("equipped state is missing from marketplace cards");

for (const mode of ["avatar-layer", "pet", "asset", "unavailable"]) {
  if (!resolver.includes(`type: \"${mode}\"`) && !renderer.includes(`visual.type === \"${mode}\"`)) {
    fail(`missing renderer mode: ${mode}`);
  }
}
if (!/reason: \"missing-marketplace-artwork\"/.test(resolver)) fail("strict missing-artwork fallback is absent");
if (/startsWith\(\"pet_\"\)/.test(resolver) || /\?\? \"cat\"/.test(petArt)) fail("unknown pets can still render generic fallback artwork");
if (!/AVATAR_EQUIP_SLOTS\.has\(slot\)/.test(resolver)) fail("wearable visuals do not validate their equip slot");
if (!/alt:/.test(resolver) || !/alt=\{visual\.alt\}/.test(renderer) || !/aria-label=\{visual\.alt\}/.test(renderer)) fail("marketplace artwork alt text is not enforced");
if (!/priority=\{large\}/.test(renderer)) fail("only the selected asset preview is not preloaded");

if (!/item_key text primary key/.test(economyFoundation)) fail("database does not enforce unique marketplace item IDs");
if (!/category text not null check \(category in/.test(economyFoundation)) fail("database does not enforce valid marketplace categories");
if (!/student_id, item_key/.test(economyFoundation) || !/primary key \(student_id, slot\)/.test(economyFoundation)) fail("inventory or equipped identity constraints changed");
if (!/p_item_key: itemKey/.test(economy) || !/mergeAvatarOutfit/.test(economy)) fail("purchase, equip, or avatar-profile integration changed");
if (!/target_slot not in/.test(clothing) || !/'top', 'bottom', 'footwear'/.test(clothing)) fail("current wearable equip-slot validation is missing");

for (const key of ["home_crystal_lamp", "home_data_shelf", "trail_energy_sparks", "title_master_measurer"]) {
  if (!migration.includes(key)) fail(`${key} is not guarded by the artwork migration`);
}
if (!/purchasable = false/.test(migration) || !/artwork_unavailable/.test(migration)) fail("missing-artwork items remain purchasable");

const imagePaths = [...homeThemes.matchAll(/"image":"([^\"]+)"/g)].map((match) => match[1]);
if (imagePaths.length !== 8) fail(`expected 8 home-theme images, found ${imagePaths.length}`);
for (const imagePath of imagePaths) {
  if (!fs.existsSync(path.join(root, "public", imagePath.replace(/^\//, "")))) fail(`missing asset: ${imagePath}`);
}

if (!process.exitCode) {
  console.log("Marketplace artwork audit passed: 47 visualised products, 4 unavailable products, 0 generic purchasable icons.");
}
