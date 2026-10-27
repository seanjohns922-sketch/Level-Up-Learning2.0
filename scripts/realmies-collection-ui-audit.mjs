import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const page = read("app/my-realmies/page.tsx");
// Check the retired feature stays unreachable throughout application source.
const applicationFiles = ["app", "components", "lib", "data"].flatMap((directory) =>
  fs.readdirSync(path.join(root, directory), { recursive: true })
    .filter((file) => /\.(tsx?|jsx?|json)$/.test(file))
    .map((file) => path.join(directory, file)),
);
const remainingReferences = applicationFiles.filter((file) => /realmies?/i.test(read(file)));
const checks = [
  ["old collection route redirects to My Home", page.includes('redirect("/home-base")')],
  ["retired route has no client-side collection", !page.includes('"use client"') && !page.includes("supabase")],
  ["Realmies UI, assets and RPC references are absent from application source", remainingReferences.length === 0],
  ["unused collection client is removed", !fs.existsSync(path.join(root, "lib/realmies.ts"))],
  ["RELIQ collection remains available", fs.existsSync(path.join(root, "app/legends/page.tsx"))],
  ["Gem Vault remains available", fs.existsSync(path.join(root, "app/gem-vault/page.tsx"))],
  ["My Home retains RELIQ display and Gem Vault", read("app/home-base/page.tsx").includes("<HallOfLegendsWidget") && read("app/home-base/page.tsx").includes('router.push("/gem-vault")')],
];
if (remainingReferences.length) console.error("Retired feature references:", remainingReferences);

let failed = false;
for (const [label, condition] of checks) {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}`);
  failed ||= !condition;
}

if (failed) process.exit(1);

console.log(`\nRealmies retirement audit passed (${checks.length} checks).`);
