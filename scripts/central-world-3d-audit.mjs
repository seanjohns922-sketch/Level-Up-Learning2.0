import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(message); };

const page = read("app/world/page.tsx");
const entry = read("components/world3d/CentralWorld3DEntry.tsx");
const world = read("components/world3d/CentralWorld.tsx");
const environment = read("components/world3d/CentralWorldEnvironment.tsx");
const config = read("lib/world3d/central-world-config.ts");
const sharedPlayer = read("components/world3d/SharedWorldPlayer.tsx");
const numberNexus = read("components/world3d/NumberNexusLevel3World.tsx");
const hud = read("components/world3d/WorldHUD.tsx");
const navigation = read("lib/world3d/world-navigation-context.ts");
const home = read("app/home-base/page.tsx");
const marketplace = read("app/marketplace/page.tsx");
const catalogue = read("lib/world3d/central-world-customisation-catalog.ts");
const migration = read("supabase/migrations/20260826152000_central_world_customisation_catalogue.sql");

check(page.includes("CentralWorld3DEntry"), "/world must use the gated central-world entry");
check(entry.includes("resolveRealm3DAccess"), "Central World must reuse the existing 3D rollout resolver");
check(entry.includes('ssr: false'), "Central World 3D bundle must be dynamically client-loaded");
check(world.includes('<WorldHUD context="central"'), "Central World must use the shared minimal HUD");
check(hud.includes("resolveWorldJourney"), "Quick Start and Current Journey must use the shared canonical journey resolver");
check(world.includes("rememberCentralWorldHomeEntry"), "Physical My Home entry must preserve transient return context");
check(world.includes('"/world/tower?teacher_preview=1"'), "3D Tower destination is missing");
check(world.includes("KeyboardWorldAction"), "Keyboard Tower interaction is missing");
check(world.includes("WorldMovePad"), "Touch movement controls are missing");
check(world.includes("__LEVEL_UP_CENTRAL_WORLD_3D_METRICS__"), "Central-world metrics hook is missing");
check(config.includes('towerMainEntrance: "tower-main-entrance"'), "Semantic Tower entrance anchor is missing");
check(config.includes('towerExitSpawn: "tower-exit-spawn"'), "Semantic Tower exit anchor is missing");
check(config.includes('myHomeEntrance: "my-home-entry"'), "Semantic My Home entrance anchor is missing");
check(config.includes('myHomeExitSpawn: "my-home-exit-spawn"'), "Semantic My Home return anchor is missing");
check(config.includes('futureLeaderboardMonument: "future-leaderboard-monument"'), "Future leaderboard reservation is missing");
check(config.includes('futureCollectionArea: "future-collection-area"'), "Future collection reservation is missing");
check(config.includes("CENTRAL_WORLD_CUSTOMISATION_PLOTS"), "Central world customisation plots are not configured");
check((config.match(/id: "customisation-plot-/g) ?? []).length === 8, "Central world must have exactly eight customisation plots");
const plotPositions = [...config.matchAll(/position: \[(-?\d+(?:\.\d+)?), 0\.75, (-?\d+(?:\.\d+)?)\]/g)]
  .slice(-8)
  .map((match) => ({ x: Number(match[1]), z: Number(match[2]) }));
const plotDistances = plotPositions.map(({ x }) => Math.abs(x));
check(
  plotDistances.length === 8
    && plotDistances[0] < plotDistances[2]
    && plotDistances[2] > plotDistances[4]
    && plotDistances[4] < plotDistances[6]
    && plotDistances[1] < plotDistances[3]
    && plotDistances[3] > plotDistances[5]
    && plotDistances[5] < plotDistances[7],
  "Central world customisation plots must alternate near and far from the hub path",
);
check(config.includes("maxZ: 54"), "Central world rear meadow must provide substantial playable depth");
check(
  plotPositions.slice(0, 4).every(({ z }) => z > 18)
    && plotPositions.slice(2, 4).every(({ z }) => z >= 40),
  "Rear customisation plots must use two spacious rows behind the spawn point",
);
check(
  plotPositions.every(({ x, z }) => Math.abs(x) <= 48 && z >= -35.5 && z <= 54),
  "Customisation plots must remain inside the playable world bounds",
);
check(environment.includes("PlaceholderKnowledgeTower"), "Placeholder Tower is missing");
check(environment.includes("PlaceholderMyHome"), "Physical My Home placeholder is missing");
check(environment.includes("CustomisationPaths"), "Customisation plots are not connected to the hub path network");
check(environment.includes("LockedCustomisationPlot"), "Locked customisation plots are not rendered in the hub");
check(environment.includes("EquippedCustomisationPlot"), "Equipped customisation plots are not rendered in the hub");
check(environment.includes("central-world-valley-panorama.png") && environment.includes("MeadowGround") && environment.includes("GrassTufts"), "V1 valley layers are incomplete");
check(sharedPlayer.includes("SharedThirdPersonPlayer") && numberNexus.includes("TrialStudentAvatar") && numberNexus.includes("WorldMovePad"), "Central World and Number Nexus must share player infrastructure");
check(!world.includes("NumberNexus") && !environment.includes("number-nexus"), "Central World must not import Number Nexus art");
check(navigation.includes('destination: "my-home"') && navigation.includes('spawn=my-home-exit-spawn'), "My Home navigation context is incomplete");
check(home.includes("Return to World") && home.includes("clearWorldNavigationContext"), "Home must offer a conditional semantic return to Central World");
check(!world.includes('>MY HOME<') && !world.includes('>TOWER<') && !world.includes("CLASS BEST"), "Obsolete 3D navigation widgets remain in Central World");
check(world.includes("...CENTRAL_WORLD_CUSTOMISATION_PLOTS.map"), "Customisation plots are not registered as interaction targets");
check(world.includes("getEquippedCentralWorldItems"), "Central World does not read equipped customisation items");
check(world.includes("OPEN MARKETPLACE"), "Locked customisation plot marketplace action is missing");
check(world.includes("activePlotEquipped"), "Equipped customisation plot state is missing");
check(marketplace.includes("World Plots") && marketplace.includes("mergeCentralWorldCatalogue"), "Marketplace is not wired to central-world catalogue items");
check(catalogue.includes("slot: `world_plot_${entry.plot}`"), "Central-world catalogue item slots are missing");
check((catalogue.match(/assetKey: "/g) ?? []).length === 24, "Central-world catalogue must define 24 plot item variants");
check(migration.includes("world_plot_1") && migration.includes("world_plot_8"), "Central-world catalogue migration does not allow world plot equip slots");
check((migration.match(/central_world_plot_/g) ?? []).length >= 24, "Central-world catalogue migration must seed 24 plot items");

console.log("Central World 3D checkpoint audit passed.");
