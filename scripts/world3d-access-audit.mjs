import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// The 3D world is the only student world: no rollout switches, allowlists or
// reduced-motion fallback may route a student back to the retired 2D maps.
const accessSource = await readFile(new URL("../lib/world3d/access.ts", import.meta.url), "utf8");
assert.doesNotMatch(accessSource, /NEXT_PUBLIC_(ENABLE_REALM_3D|REALM_3D_)/, "3D access must not depend on rollout switches or allowlists");
assert.doesNotMatch(accessSource, /reduced-motion/, "Reduced motion must not send students out of the 3D world");

const storage = new Map();
globalThis.window = {
  location: { search: "" },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  matchMedia: () => ({ matches: true }),
};
globalThis.document = {
  createElement: () => ({ getContext: () => null }),
};

const { canBrowserRunRealm3D, resolveRealm3DAccess } = await import("../lib/world3d/access.ts");
const { getWorld3DReturnPathForWeek, realm3DWorldHref, realmOutside3DHref } = await import("../lib/world3d/return-context.ts");

assert.deepEqual(canBrowserRunRealm3D(), { ok: false, reason: "webgl-unavailable" });
assert.deepEqual(resolveRealm3DAccess({ realmId: "number" }), {
  canExplore3D: false,
  reason: "webgl-unavailable",
  source: "device",
});
assert.equal(resolveRealm3DAccess({ realmId: "chance" }).reason, "webgl-unavailable", "Chance Hollow is supported and must honour the device gate");
assert.equal(resolveRealm3DAccess({ realmId: "unknown-realm" }).reason, "unsupported-realm");

// Reduced motion is still on (matchMedia matches) — a WebGL device still explores.
globalThis.document.createElement = () => ({ getContext: () => ({}) });
assert.deepEqual(canBrowserRunRealm3D(), { ok: true });
for (const realmId of ["number", "measurement", "space", "pattern", "statistics", "chance"]) {
  assert.equal(resolveRealm3DAccess({ realmId }).canExplore3D, true, realmId + " must be available on a supported device");
}

// Every "back to the realm" path resolves to 3D, even on a device with no saved visit.
assert.equal(getWorld3DReturnPathForWeek({ realmId: "measurement", level: "Year 4", week: 2 }), "/world/measurelands?level=Year+4");
assert.equal(realm3DWorldHref("space", "Prep", true), "/world/starpath?level=Prep&teacher_preview=1");
assert.equal(realm3DWorldHref("number", "Year 8"), "/world/expedition?realm=number");
assert.equal(realmOutside3DHref("statistics", "Year 7"), "/world/expedition?realm=statistics");
assert.equal(realmOutside3DHref("pattern", "Year 1"), "/world/tower");
assert.equal(realmOutside3DHref("chance", "Prep", true), "/world/tower?teacher_preview=1");

// Retired 2D addresses redirect into the 3D world.
const nextConfig = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
for (const [from, to] of [["/realms", "/world/tower"], ["/home-base", "/world/treehouse"], ["/number-nexus", "/world/number-nexus"], ["/starpath", "/world/starpath"]]) {
  assert(nextConfig.includes(`"${from}": "${to}"`), `${from} must redirect to ${to}`);
}

console.log("World 3D access audit passed: 3D is the only world.");
