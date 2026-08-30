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
const layout = read("lib/world3d/central-world-layout.ts");
const editorCatalogue = read("lib/world3d/central-world-editor-catalog.ts");
const migration = read("supabase/migrations/20260826152000_central_world_customisation_catalogue.sql");
const launchMigration = read("supabase/migrations/20260826173500_central_world_launch_rewards_catalogue.sql");

check(page.includes("CentralWorld3DEntry"), "/world must use the gated central-world entry");
check(entry.includes("resolveRealm3DAccess"), "Central World must reuse the existing 3D rollout resolver");
check(entry.includes('ssr: false'), "Central World 3D bundle must be dynamically client-loaded");
check(world.includes('<WorldHUD context="central"'), "Central World must use the shared minimal HUD");
check(hud.includes("resolveWorldJourney"), "Quick Start and Current Journey must use the shared canonical journey resolver");
check(world.includes("rememberCentralWorldHomeEntry"), "Physical My Home entry must preserve transient return context");
check(world.includes('"/world/tower?teacher_preview=1"'), "3D Tower destination is missing");
check(world.includes("KeyboardWorldAction"), "Keyboard Tower interaction is missing");
check(world.includes("WorldJoystick") && !world.includes("<WorldMovePad"), "Central hub must use the 360-degree touch joystick");
check(world.includes("WorldLookJoystick") && world.includes("lookInput"), "Central hub must provide a separate 360-degree camera joystick");
check(sharedPlayer.includes("analogX") && sharedPlayer.includes("analogY") && sharedPlayer.includes("magnitude"), "Analog camera-relative movement is missing");
check(sharedPlayer.includes('event.pointerType === "touch"') && sharedPlayer.includes("yaw.current -= lookX"), "Touch camera look must use the right joystick instead of canvas dragging");
check(sharedPlayer.includes("setPointerCapture") && sharedPlayer.includes('touchAction: "none"'), "Joystick pointer capture or iPad touch protection is missing");
check(world.includes("__LEVEL_UP_CENTRAL_WORLD_3D_METRICS__"), "Central-world metrics hook is missing");
check(config.includes('towerMainEntrance: "tower-main-entrance"'), "Semantic Tower entrance anchor is missing");
check(config.includes('towerExitSpawn: "tower-exit-spawn"'), "Semantic Tower exit anchor is missing");
check(config.includes('myHomeEntrance: "my-home-entry"'), "Semantic My Home entrance anchor is missing");
check(config.includes('myHomeExitSpawn: "my-home-exit-spawn"'), "Semantic My Home return anchor is missing");
check(config.includes('futureLeaderboardMonument: "future-leaderboard-monument"'), "Future leaderboard reservation is missing");
check(config.includes('futureCollectionArea: "future-collection-area"'), "Future collection reservation is missing");
check(config.includes("maxZ: 54"), "Central world rear meadow must provide substantial playable depth");
check(environment.includes("PlaceholderKnowledgeTower"), "Placeholder Tower is missing");
check(environment.includes("PlaceholderMyHome"), "Physical My Home placeholder is missing");
check(!environment.includes("CustomisationPaths") && !environment.includes("LockedCustomisationPlot") && !environment.includes("EquippedCustomisationPlot"), "Legacy fixed-slot pads or branch paths must not render in the free-placement hub");
check(environment.includes("central-world-valley-panorama.png") && environment.includes("MeadowGround") && environment.includes("GrassTufts"), "V1 valley layers are incomplete");
check(sharedPlayer.includes("SharedThirdPersonPlayer") && numberNexus.includes("TrialStudentAvatar") && numberNexus.includes("WorldMovePad"), "Central World and Number Nexus must share player infrastructure");
check(!world.includes("NumberNexus") && !environment.includes("number-nexus"), "Central World must not import Number Nexus art");
check(navigation.includes('destination: "my-home"') && navigation.includes('spawn=my-home-exit-spawn'), "My Home navigation context is incomplete");
check(home.includes("Return to World") && home.includes("clearWorldNavigationContext"), "Home must offer a conditional semantic return to Central World");
check(!world.includes('>MY HOME<') && !world.includes('>TOWER<') && !world.includes("CLASS BEST"), "Obsolete 3D navigation widgets remain in Central World");
check(!world.includes("CENTRAL_WORLD_CUSTOMISATION_PLOTS") && !world.includes("OPEN MARKETPLACE"), "Legacy fixed-slot interactions must not remain in the free-placement hub");
check(world.includes('searchParams.get("build")') && world.includes("confirmBuildPlacement"), "Marketplace rewards must open the hub placement flow");
check(world.includes("Read build instructions") && world.includes("RotateCw"), "Build Mode must provide spoken instructions and rotation controls");
check(marketplace.includes("Place in world") && marketplace.includes("build=${encodeURIComponent(selected.item_key)}"), "Owned world rewards must launch Build Mode");
check(environment.includes("worldObjectScale") && environment.includes('category === "buildings"') && environment.includes("return 2.45"), "Purchased buildings must render at landmark scale");
check(environment.includes("BuildModeGrid") && environment.includes("PlacedWorldObject"), "Grid placement preview or placed world objects are missing");
check(world.includes("BuildModeCamera") && world.includes("BuildModeSurface") && world.includes("onBuildCell"), "Focused build camera or tap-to-place surface is missing");
check(world.includes("OWNED INVENTORY") && world.includes("ownedWorldItems") && world.includes("chooseInventoryItem"), "Owned marketplace inventory is missing from Edit World");
check(world.includes("paintMode") && world.includes("applyGroundAt"), "Path and ground drag painting is missing");
check(layout.includes("itemId: string") && layout.includes("gridX: number") && layout.includes("gridZ: number") && layout.includes("rotation: 0 | 90 | 180 | 270"), "Saved world placement model is incomplete");
check(layout.includes("isCentralWorldProtectedCell") && layout.includes("validateCentralWorldPlacement"), "Tower, home and path protection rules are missing");
check(world.includes('label: "EDIT WORLD"') && world.includes('aria-label="Edit world controls"'), "Central hub Edit World entry or controls are missing");
check(world.includes('"path"') && world.includes('"road"') && world.includes('"stone"') && world.includes('"erase"'), "Ground painting tools are incomplete");
check(layout.includes("CentralWorldGroundTile") && layout.includes("writeCentralWorldGroundTiles"), "Ground customisation persistence is missing");
check(environment.includes("GroundTile") && environment.includes("StarterScenery"), "Ground tiles or starter scenery do not render in the 3D hub");
for (const item of ["tree", "pine_tree", "flower_bed", "lamp_post"]) check(editorCatalogue.includes(`"${item}"`), `Starter scenery missing: ${item}`);
check(
  marketplace.includes("Buildings")
    && marketplace.includes("Animals")
    && marketplace.includes("Pools & Play")
    && marketplace.includes("Special")
    && marketplace.includes("mergeCentralWorldCatalogue"),
  "Marketplace is not wired to the V1 central-world reward categories",
);
check(catalogue.includes("slot: `world_plot_${entry.plot}`"), "Central-world catalogue item slots are missing");
check((catalogue.match(/assetKey: "/g) ?? []).length === 21, "Central-world catalogue must define the 21 launch reward items");
for (const category of ["buildings", "animals", "pools_play", "special"]) {
  check(catalogue.includes(`area: "${category}"`) && marketplace.includes(category), `Launch category missing: ${category}`);
}
check(catalogue.includes("gridSize") && launchMigration.includes('"gridSize"'), "Launch rewards must carry future grid placement size metadata");
check(migration.includes("world_plot_1") && migration.includes("world_plot_8"), "Central-world catalogue migration does not allow world plot equip slots");
check((launchMigration.match(/central_world_plot_/g) ?? []).length >= 21, "Launch catalogue migration must seed the V1 reward items");
check(launchMigration.includes("active = false") && launchMigration.includes("item_key like 'central_world_plot_%'"), "Launch catalogue migration must retire the old tiny plot items");

console.log("Central World 3D checkpoint audit passed.");
