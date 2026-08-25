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
check(environment.includes("PlaceholderKnowledgeTower"), "Placeholder Tower is missing");
check(environment.includes("PlaceholderMyHome"), "Physical My Home placeholder is missing");
check(environment.includes("central-world-valley-panorama.png") && environment.includes("MeadowGround") && environment.includes("GrassTufts"), "V1 valley layers are incomplete");
check(sharedPlayer.includes("SharedThirdPersonPlayer") && numberNexus.includes("TrialStudentAvatar") && numberNexus.includes("WorldMovePad"), "Central World and Number Nexus must share player infrastructure");
check(!world.includes("NumberNexus") && !environment.includes("number-nexus"), "Central World must not import Number Nexus art");
check(navigation.includes('destination: "my-home"') && navigation.includes('spawn=my-home-exit-spawn'), "My Home navigation context is incomplete");
check(home.includes("Return to World") && home.includes("clearWorldNavigationContext"), "Home must offer a conditional semantic return to Central World");
check(!world.includes('>MY HOME<') && !world.includes('>TOWER<') && !world.includes("CLASS BEST"), "Obsolete 3D navigation widgets remain in Central World");

console.log("Central World 3D checkpoint audit passed.");
