#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const home = read("app/home-base/page.tsx");
const header = read("components/economy/EconomyHeader.tsx");
const continueLearning = read("lib/continue-learning.ts");
const tracker = read("components/student/ActiveLearningTracker.tsx");
const lastRealm = read("lib/last-realm.ts");
const avatar = read("components/avatar/StudentAvatar.tsx");
const rankConfig = read("data/explorer-ranks.ts");
const economy = read("lib/economy.ts");
const identity = read("lib/studentIdentity.ts");
const numberMap = read("components/world/NumberNexusMap.tsx");
const measurelandsMap = read("components/world/MeasurelandsMap.tsx");

const results = [];
const check = (label, ok) => results.push({ label, ok });

check(
  "My Home exposes the current room-first rewards shell",
  ["Continue Learning", "Explorer Rank", "Current room", "Gem Vault", "Hall of Legends", "Change room"]
    .every((label) => home.includes(label)),
);
check(
  "Continue Learning uses the shared destination resolver",
  home.includes("router.push(resolveContinueLearningRoute())") &&
    !home.includes('onClick={() => router.push("/realms")} className="rounded-md bg-slate-900'),
);
check(
  "Continue Learning validates saved lesson and pre-test resume state",
  continueLearning.includes("lessonResumeHasProgress(loadLessonResume") &&
    continueLearning.includes("pretestResumeHasProgress(loadPretestResume") &&
    continueLearning.includes("resolveRealmEntryRoute"),
);
check(
  "Learning routes update the student-scoped active destination",
  tracker.includes("rememberActiveLearningDestination(context)") &&
    continueLearning.includes("`lul:${studentId}:${ACTIVE_LEARNING_KEY_VERSION}`"),
);
check(
  "Last realm and avatar browser state are student-scoped",
  lastRealm.includes("`lul:${studentId}:${LAST_REALM_KEY_VERSION}`") &&
    !lastRealm.includes('"lul:last_realm"') &&
    avatar.includes("`lul:${studentId}:avatar_outfit_v1`") &&
    !avatar.includes('getItem("lul_avatar_outfit_v1")'),
);
check(
  "Direct realm dashboard entry establishes the current realm",
  numberMap.includes('setLastRealm("number-nexus")') &&
    measurelandsMap.includes('setLastRealm("measurelands")'),
);
check(
  "Logout clears My Home browser caches before identity",
  identity.includes("active_learning_v1") &&
    identity.includes("last_realm_v1") &&
    identity.includes("avatar_outfit_v1"),
);
check(
  "Explorer Rank thresholds are centralized and use lifetime XP",
  rankConfig.includes("minimumLevel: 80") &&
    rankConfig.includes("minimumLevel: 50") &&
    rankConfig.includes("minimumLevel: 25") &&
    rankConfig.includes("minimumLevel: 10") &&
    economy.includes("getExplorerRankTitle(level)") &&
    home.includes("state?.wallet.xp_earned"),
);
check(
  "My Home guards against late economy responses from another student",
  home.includes("cancelled || getActiveStudentIdentity().studentId !== requestedStudentId"),
);
check(
  "Global rewards header includes My Home, XP, rank, and student profile",
  header.includes('label: "My Home"') &&
    header.includes("Rank {rankLevel}") &&
    header.includes("toLocaleString()} XP") &&
    header.includes('aria-label="Open student profile"'),
);
check(
  "Avatar motion respects reduced-motion preferences",
  avatar.includes("prefers-reduced-motion: reduce") && avatar.includes("animation: none !important"),
);

const failures = results.filter((result) => !result.ok);
console.log("\nMy Home Shell Audit\n" + "=".repeat(64));
for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
console.log("=".repeat(64));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
