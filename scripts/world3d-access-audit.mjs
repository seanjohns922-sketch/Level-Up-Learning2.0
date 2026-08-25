import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const accessSource = await readFile(new URL("../lib/world3d/access.ts", import.meta.url), "utf8");
assert.match(accessSource, /NEXT_PUBLIC_ENABLE_REALM_3D === "0"/, "The global 3D kill switch must fail closed when explicitly disabled");
assert.match(accessSource, /NEXT_PUBLIC_REALM_3D_DEFAULT === "0"/, "The 2D-default rollback switch must remain available");

const storage = new Map();
globalThis.window = {
  location: { search: "" },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  matchMedia: () => ({ matches: false }),
};
globalThis.document = {
  createElement: () => ({ getContext: () => null }),
};

const { canBrowserRunRealm3D, resolvePostLoginExperience, resolveRealm3DAccess } = await import("../lib/world3d/access.ts");

assert.deepEqual(canBrowserRunRealm3D(), { ok: false, reason: "webgl-unavailable" });
assert.deepEqual(resolveRealm3DAccess({ realmId: "number" }), {
  canExplore3D: false,
  reason: "webgl-unavailable",
  source: "device",
});
assert.equal(resolveRealm3DAccess({ realmId: "chance" }).reason, "unsupported-realm");

globalThis.window.matchMedia = () => ({ matches: true });
assert.deepEqual(canBrowserRunRealm3D({ respectReducedMotion: true }), { ok: false, reason: "reduced-motion" });

globalThis.window.matchMedia = () => ({ matches: false });
globalThis.document.createElement = () => ({ getContext: () => ({}) });
assert.deepEqual(canBrowserRunRealm3D({ respectReducedMotion: true }), { ok: true });

delete process.env.NEXT_PUBLIC_REALM_3D_DEFAULT;
assert.equal(
  resolvePostLoginExperience({ realmId: "number", fallbackHref: "/realms" }),
  "/world",
  "3D must be the default experience when the kill switch is absent",
);
process.env.NEXT_PUBLIC_REALM_3D_DEFAULT = "0";
assert.equal(
  resolvePostLoginExperience({ realmId: "number", fallbackHref: "/realms" }),
  "/realms",
  "NEXT_PUBLIC_REALM_3D_DEFAULT=0 must restore the 2D default",
);

console.log("World 3D access and fallback audit passed.");
