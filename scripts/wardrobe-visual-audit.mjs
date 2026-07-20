import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const avatar = read("components/avatar/StudentAvatar.tsx");
const wardrobe = read("app/wardrobe/page.tsx");
const results = [];
const check = (label, ok) => results.push({ label, ok });

const hairstyleValues = [...wardrobe.matchAll(/\["(short|swept|sidepart|tuft|spiky|curls|afro|buzz|long|bob|ponytail|pigtails|bun|braids|bald)",/g)]
  .map((match) => match[1]);
const premiumStart = wardrobe.indexOf("function premiumCards");
const premiumEnd = wardrobe.indexOf("\n  }\n\n  return (", premiumStart);
const premiumCards = wardrobe.slice(premiumStart, premiumEnd);
const itemNameIndex = premiumCards.indexOf("{item.name}");
const rarityIndex = premiumCards.indexOf("{rarity.label}");

check("All 15 hairstyle choices remain available", new Set(hairstyleValues).size === 15);
check("Hairstyle selectors use a head-and-shoulders crop", /framing="head"/.test(wardrobe) && /framing\?: "full" \| "head"/.test(avatar));
check("Hair selectors remove hats and glasses", /hairStyle: value, hat: "none", glasses: "none"/.test(wardrobe));
check("Hair uses layered locks, edge definition and directional sheen", /id="lul-hair-lock"/.test(avatar) && /id="lul-hair-sheen"/.test(avatar) && /const lock =/.test(avatar) && /const sep =/.test(avatar));
check("Core silhouettes retain distinct labelled branches", ["short", "swept", "sidepart", "tuft", "spiky", "curls", "afro", "buzz", "long"].every((style) => avatar.includes(`case "${style}"`)));
check("Shared hairline is raised above the eyes", /const HAIR_FRONT = "[^"]*Q66 38 58 40/.test(avatar));
check("All hat shapes use fitted crowns and dedicated brim shading", ["beanie", "cap", "explorer", "crown", "wizard"].every((hat) => avatar.includes(`case "${hat}"`)) && /id="lul-hat-brim"/.test(avatar) && /x="23" y="37" width="74" height="13"/.test(avatar));
check("Premium cards reserve a taller information layout", /h-\[116px\] w-\[82px\]/.test(premiumCards));
check("XP remains the only top-right purchase badge", /absolute right-1 top-1/.test(premiumCards) && !/absolute left-1 top-1/.test(premiumCards));
check("Rarity is a non-overlapping footer below the item name", itemNameIndex >= 0 && rarityIndex > itemNameIndex && !/absolute[^>]*\{rarity\.label\}/.test(premiumCards));

console.log("\nWardrobe Visual Audit");
console.log("=".repeat(64));
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
console.log("=".repeat(64));
const passed = results.filter((result) => result.ok).length;
console.log(`${passed}/${results.length} checks passed.`);
if (passed !== results.length) process.exitCode = 1;
