import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("app/demo-review/page.tsx");
const panel = read("components/demo/DemoReviewPanel.tsx");
const navigation = read("components/demo/DemoModeNavigationControls.tsx");
const realmies = read("app/my-realmies/page.tsx");
const progressSync = read("lib/student-progress-sync.ts");

const checks = [
  ["Review route requires an authorised server demo session", page.includes("getServerStarpathAccess") && page.includes('redirect("/login")')],
  ["Review panel also requires the isolated demo identity", panel.includes("isDemoPreviewMode()") && panel.includes('ACTIVE_STUDENT_KEY) !== "demo-preview"')],
  ["Demo navigation exposes the review workspace", navigation.includes('router.push("/demo-review")')],
  ["Pre-Test and Post-Test launchers use real assessment routes", panel.includes('`/${kind}?${params.toString()}`')],
  [
    "Live Starpath assessment buttons follow registered assessment banks",
    panel.includes('getPretestForYearLabel(year, "space").length > 0') &&
      panel.includes('getPosttestForYearLabel(year, "space")?.questions.length') &&
      !panel.includes('pretestAvailable = year !== "Prep" && (realm !== "space" || levelNumber <= 2)') &&
      !panel.includes('posttestAvailable = realm !== "space" || levelNumber <= 3'),
  ],
  ["Weekly lesson and quiz launchers use real runtime routes", panel.includes("buildLessonRoute") && panel.includes('type: "quiz"')],
  ["Result scenarios include pass, targeted, full and fail profiles", ["pre-pass", "pre-targeted", "pre-full", "post-pass", "post-fail"].every((scenario) => panel.includes(scenario))],
  ["Legend reveal state can be reset in the demo scope", panel.includes("resetLegendUnlockVideosForCurrentScope")],
  ["Gem preview queues a catalogue item without awarding it", panel.includes("fetchDemoGemVault") && panel.includes("enqueueReveal") && !panel.includes("awardAndReveal")],
  ["Realmie reveal is explicitly demo-review gated", realmies.includes('requestedStudentId === "demo-preview"') && realmies.includes('get("review_reveal") === "1"')],
  ["Panel does not import canonical assessment persistence", !panel.includes("saveRealmAssessment") && !panel.includes("saveStudentProgressState")],
  ["Canonical assessment persistence still rejects Demo Mode", progressSync.includes("export async function saveRealmAssessment") && progressSync.includes("if (isDemoPreviewMode()) return;")],
];

console.log("\nDemo Review Panel Audit");
console.log("=".repeat(64));
let passed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (ok) passed += 1;
}
console.log("=".repeat(64));
console.log(`${passed}/${checks.length} checks passed.`);
if (passed !== checks.length) process.exit(1);
