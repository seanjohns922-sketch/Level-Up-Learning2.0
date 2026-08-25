import assert from "node:assert/strict";

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

const { canBrowserRunRealm3D, resolveRealm3DAccess } = await import("../lib/world3d/access.ts");

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

console.log("World 3D access and fallback audit passed.");
