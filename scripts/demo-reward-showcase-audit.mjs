import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const economy = read("lib/economy.ts");
const gems = read("lib/gems.ts");
const vault = read("app/gem-vault/page.tsx");
const home = read("app/home-base/page.tsx");
const legends = read("components/home/HallOfLegendsWidget.tsx");

const checks = [
  ["Demo economy owns the complete active catalogue", economy.includes("items.map((item) => ({ item_key: item.item_key")],
  ["Demo economy has a showcase wallet", economy.includes("xp_balance: 999999")],
  ["Demo gem vault marks every active definition owned", gems.includes("owned: activeDefinitions.map")],
  ["Demo gem progress is complete", gems.includes("Number(definition.target ?? 1)")],
  ["Demo gem selection stays local", gems.includes("DEMO_FAVOURITE_GEM_STORAGE_KEY")],
  ["Gem Vault uses the demo-aware vault reader", vault.includes("fetchGemVault(studentId)")],
  ["My Home loads the demo gem showcase", home.includes("? fetchGemVault(sid)")],
  ["My Home unlocks every implemented legend in demo", legends.includes("new Set(getAllLegends().map((legend) => legend.id))")],
];

console.log("\nDemo Reward Showcase Audit");
console.log("=".repeat(64));
let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (ok) passed += 1;
}
console.log("=".repeat(64));
console.log(`${passed}/${checks.length} checks passed.`);
if (passed !== checks.length) process.exit(1);
