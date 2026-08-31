import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const check = (condition, message) => { if (!condition) throw new Error(message); };

const central = read("components/world3d/CentralWorld.tsx");
const tower = read("components/world3d/TowerRealmChamber.tsx");
const number = read("components/world3d/NumberNexusLevel3World.tsx");
const hud = read("components/world3d/WorldHUD.tsx");
const interaction = read("components/world3d/WorldInteractionPrompt.tsx");
const journey = read("lib/world3d/world-journey.ts");
const worldNavigation = read("lib/world3d/world-navigation-context.ts");
const learningReturn = read("lib/world3d/return-context.ts");
const numberEntry = read("components/world3d/NumberNexus3DEntry.tsx");
const levelConfig = read("lib/number-nexus-visuals.ts");
const levelBrowser = read("components/realms/dashboard/RealmDashboardShell.tsx");

check(central.includes('<WorldHUD context="central"'), "Central World is not using the shared HUD");
check(tower.includes("<WorldHUD") && tower.includes('context="tower"'), "Tower is not using the shared HUD");
check(number.includes("<WorldHUD") && number.includes('context="realm"'), "Number Nexus is not using the shared HUD");
check(hud.includes("fetchStudentEconomy") && hud.includes('router.push("/profile")'), "Compact canonical XP/profile controls are incomplete");
check(hud.includes("resolveWorldJourney") && journey.includes("resolveContinueLearningRoute"), "Current Mission and Quick Start do not share canonical journey resolution");
check(hud.includes("resolveTowerRealmEntry") && hud.includes("TOWER_REALM_PORTALS"), "Realm Teleport does not share Tower realm resolution");
check(hud.includes("2D VIEW") && hud.includes("REALMS") && hud.includes("QUICK START"), "Required fast and fallback actions are missing");
check(interaction.includes("location") && interaction.includes("action"), "Shared environmental interaction presentation is missing");
check(central.includes("WorldInteractionPrompt") && tower.includes("WorldInteractionPrompt") && number.includes("WorldInteractionPrompt"), "Worlds are not sharing interaction presentation");
check(!number.includes("TeleportPanel") && !number.includes("CLASS BEST") && !number.includes("LEVEL 4"), "Obsolete Number Nexus 3D dashboard controls remain");
check(worldNavigation.includes("my-home-exit-spawn") && worldNavigation.includes("sessionStorage"), "My Home return context must be semantic and transient");
check(!worldNavigation.includes("lul:number-nexus:return-context") && learningReturn.includes("sessionStorage"), "Home and learning return contexts must remain isolated");
check(numberEntry.includes("restoreStudentStateFromServer") && numberEntry.includes("setResolvedLevel(restored.progress.year)"), "Number Nexus must auto-resolve canonical student level");
check(levelConfig.includes('experienceMode: "guided-adventure"') && levelConfig.includes('experienceMode: "district-exploration"'), "Ground-Level 2 and Level 3-6 presentation modes are incomplete");
check(levelBrowser.includes("isLevelUnlocked") && levelBrowser.includes("enterReviewMode") && levelBrowser.includes("buildRealmLevelHref"), "2D historical level browser safety contract is missing");

console.log("World-first 3D navigation audit passed.");
