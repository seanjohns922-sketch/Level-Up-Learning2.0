import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(message); };

const page = read("app/world/tower/page.tsx");
const entry = read("components/world3d/TowerRealmChamber3DEntry.tsx");
const chamber = read("components/world3d/TowerRealmChamber.tsx");
const environment = read("components/world3d/TowerRealmChamberEnvironment.tsx");
const portal = read("components/world3d/RealmPortal3D.tsx");
const config = read("lib/world3d/tower-realm-chamber-config.ts");
const resolver = read("lib/world3d/tower-realm-entry.ts");
const central = read("components/world3d/CentralWorld.tsx");
const numberNexus = read("components/world3d/NumberNexusLevel3World.tsx");
const hud = read("components/world3d/WorldHUD.tsx");

check(page.includes("TowerRealmChamber3DEntry"), "/world/tower must use the gated Tower entry");
check(entry.includes("resolveRealm3DAccess") && entry.includes("ssr: false"), "Tower must reuse rollout access and dynamically load 3D");
check(config.includes("REALM_REGISTRY[presentation.realmId]"), "Portal presentation must reference canonical realm metadata");
for (const realmId of ["number", "measurement", "pattern", "statistics", "chance", "space", "time", "reading", "writing", "advanced-literacy"]) {
  check(config.includes(`realmId: "${realmId}"`), `Tower portal missing: ${realmId}`);
}
check(environment.includes("<RealmPortal3D"), "Tower must use one shared RealmPortal3D component");
check(portal.includes("ActiveVideoSurface") && portal.includes("videoActive"), "Portal proximity video lifecycle is missing");
check(portal.includes("video.pause()") && portal.includes("texture.dispose()"), "Portal video cleanup is incomplete");
check(portal.includes('quality !== "low"') && portal.includes("!reducedMotion"), "Low-quality and reduced-motion video fallback is missing");
check(portal.includes("COMING SOON") && portal.includes("config.symbol") && !portal.includes(">SEALED<"), "Dormant portals need a readable architectural coming-soon treatment");
check(chamber.includes("distance: 3.45"), "Portal activation must be constrained to the floor ring");
check(chamber.includes("resolveTowerRealmEntry") && chamber.includes("<WorldHUD") && chamber.includes('context="tower"'), "Tower must combine physical portal entry with the shared HUD");
check(hud.includes("resolveTowerRealmEntry") && hud.includes("REALM TELEPORT"), "Fast teleport must use the same canonical Tower resolver");
check(hud.includes("resolveWorldJourney"), "Quick Start must use the canonical journey resolver");
check(chamber.includes('fallbackHref={preview ? "/realms?teacher_preview=1" : "/realms"}'), "2D Realm fallback is missing");
check(resolver.includes("getRealmAvailability") && resolver.includes("resolveRealmEntryRoute"), "Tower resolver must delegate availability and progression");
check(resolver.includes("restoreStudentStateFromServer") && resolver.includes("markRealmEntryRestored"), "Canonical restore handoff is missing");
check(central.includes('"/world/tower?teacher_preview=1"'), "Central World Tower entrance must open the 3D chamber");
check(numberNexus.includes("/world/tower?spawn=number-return"), "Number Nexus Tower return anchor is missing");

const posterAssets = fs.readdirSync(path.join(root, "public/images"))
  .filter((name) => name.startsWith("tower-portal-") && name.endsWith(".jpg"));
const posterBytes = posterAssets.reduce(
  (total, name) => total + fs.statSync(path.join(root, "public/images", name)).size,
  0,
);
check(posterAssets.length >= 5, "Portal-specific poster set is incomplete");
check(posterBytes < 1_000_000, `Portal posters exceed 1 MB (${posterBytes} bytes)`);

console.log(`Tower Realm Chamber audit passed (${posterAssets.length} posters, ${posterBytes} bytes).`);
