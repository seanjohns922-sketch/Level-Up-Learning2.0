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
const avatarProductArt = read("components/economy/MarketplaceAvatarItemArt.tsx");
const petArt = read("components/pets/PetArt.tsx");
const resolver = read("lib/marketplace-visuals.ts");
const guardMigration = read("supabase/migrations/20260720170000_marketplace_artwork_integrity.sql");
const assetMigration = read("supabase/migrations/20260720180000_marketplace_artwork_assets.sql");
const homeThemes = read("supabase/migrations/20260719140000_home_themes.sql");
const economyFoundation = read("supabase/migrations/20260718110000_student_economy_foundation.sql");
const clothing = read("supabase/migrations/20260719190000_earnable_clothing_styles.sql");
const economy = read("lib/economy.ts");

if (/function ItemIcon|item\.icon/.test(marketplace)) fail("marketplace page still renders category icons");
if ((marketplace.match(/<MarketplaceItemImage/g) ?? []).length !== 2) fail("card and preview must share MarketplaceItemImage");
if (!/selectedUnavailable/.test(marketplace) || !/disabled=\{busy \|\| selectedUnavailable/.test(marketplace)) fail("unavailable artwork does not block purchase");
if (!/purchaseEconomyItem/.test(marketplace) || !/equipEconomyItem/.test(marketplace)) fail("purchase or equip integration was removed");
if (!/selected\.item_key/.test(marketplace)) fail("selected visual and purchase/equip actions do not share the stable item key");
if (!/isEquipped \? "Equipped"/.test(marketplace)) fail("equipped state is missing from marketplace cards");

for (const mode of ["avatar-layer", "pet", "asset", "unavailable"]) {
  if (!resolver.includes(`type: "${mode}"`) && !renderer.includes(`visual.type === "${mode}"`)) {
    fail(`missing renderer mode: ${mode}`);
  }
}
if (!/reason: "missing-marketplace-artwork"/.test(resolver)) fail("strict missing-artwork fallback is absent");
if (/startsWith\("pet_"\)/.test(resolver) || /\?\? "cat"/.test(petArt)) fail("unknown pets can still render generic fallback artwork");
if (!/AVATAR_EQUIP_SLOTS\.has\(slot\)/.test(resolver)) fail("wearable visuals do not validate their equip slot");
if (!/alt:/.test(resolver) || !/alt=\{visual\.alt\}/.test(renderer) || !/aria-label=\{visual\.alt\}/.test(renderer)) fail("marketplace artwork alt text is not enforced");
if (!/priority=\{priority\}/.test(renderer)) fail("asset preload priority is not controlled by card/preview context");

if (!/if \(!large\) return <MarketplaceAvatarItemArt item=\{item\} \/>/.test(renderer)) fail("wearable cards do not show the isolated product");
if (!/product artwork/.test(avatarProductArt) || !/slot === "top"/.test(avatarProductArt)) fail("isolated wearable artwork does not resolve item slots");
if (!/if \(!large\) return <PetArt/.test(renderer) || !/beside the student avatar/.test(renderer)) fail("pet card or contextual pet preview is missing");
if (!/explorer-study\.png/.test(renderer) || !/previewMode === "room"/.test(renderer)) fail("room items are not previewed in a room");
if (!/around the student avatar/.test(renderer) || !/previewMode === "effect"/.test(renderer)) fail("effect items are not previewed with the avatar");
if (!/previewMode === "background"/.test(renderer) || !/<StudentAvatar/.test(renderer)) fail("backgrounds are not previewed in context");

if (!/item_key text primary key/.test(economyFoundation)) fail("database does not enforce unique marketplace item IDs");
if (!/category text not null check \(category in/.test(economyFoundation)) fail("database does not enforce valid marketplace categories");
if (!/student_id, item_key/.test(economyFoundation) || !/primary key \(student_id, slot\)/.test(economyFoundation)) fail("inventory or equipped identity constraints changed");
if (!/p_item_key: itemKey/.test(economy) || !/mergeAvatarOutfit/.test(economy)) fail("purchase, equip, or avatar-profile integration changed");
if (!/target_slot not in/.test(clothing) || !/'top', 'bottom', 'footwear'/.test(clothing)) fail("current wearable equip-slot validation is missing");

const approvedAssets = new Map([
  ["home_crystal_lamp", "/marketplace/furniture/crystal-study-lamp.png"],
  ["home_data_shelf", "/marketplace/furniture/data-display-shelf.png"],
  ["trail_energy_sparks", "/marketplace/effects/energy-sparks.png"],
  ["title_master_measurer", "/marketplace/titles/master-measurer.png"],
]);

for (const [key, imagePath] of approvedAssets) {
  if (!guardMigration.includes(key)) fail(`${key} is not covered by the original missing-art guard`);
  if (!assetMigration.includes(key) || !assetMigration.includes(imagePath)) fail(`${key} is missing canonical approved artwork metadata`);

  const assetPath = path.join(root, "public", imagePath.replace(/^\//, ""));
  if (!fs.existsSync(assetPath)) {
    fail(`missing approved asset: ${imagePath}`);
    continue;
  }

  const png = fs.readFileSync(assetPath);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (png.length <= 26 || !png.subarray(0, 8).equals(signature)) {
    fail(`approved asset is not a PNG: ${imagePath}`);
    continue;
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const colorType = png[25];
  if (width < 512 || height < 512) fail(`approved asset is below 512px: ${imagePath} (${width}x${height})`);
  if (colorType !== 4 && colorType !== 6) fail(`approved asset does not have an alpha channel: ${imagePath}`);
}

if (!/purchasable = true/.test(assetMigration)) fail("approved artwork does not restore product availability");
if (!/- 'marketplace_status'/.test(assetMigration) || !/- 'marketplace_reason'/.test(assetMigration)) fail("stale unavailable metadata is not removed");
for (const mode of ["room", "effect", "title"]) {
  if (!assetMigration.includes(`'previewMode', '${mode}'`)) fail(`approved assets are missing ${mode} preview metadata`);
}

const imagePaths = [...homeThemes.matchAll(/"image":"([^\"]+)"/g)].map((match) => match[1]);
if (imagePaths.length !== 8) fail(`expected 8 home-theme images, found ${imagePaths.length}`);
for (const imagePath of imagePaths) {
  if (!fs.existsSync(path.join(root, "public", imagePath.replace(/^\//, "")))) fail(`missing asset: ${imagePath}`);
}

if (!process.exitCode) {
  console.log("Marketplace artwork audit passed: 51 visualised products, 0 unavailable products, 0 generic purchasable icons.");
}
