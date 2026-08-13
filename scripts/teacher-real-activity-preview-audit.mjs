import { readFileSync } from "node:fs";

const drawerPath = "components/teacher/LessonPreviewDrawer.tsx";
const drawer = readFileSync(drawerPath, "utf8");
const demoModePath = "lib/demo-mode.ts";
const demoMode = readFileSync(demoModePath, "utf8");

const forbiddenDrawerContent = [
  "Sample question tied to the lesson focus",
  "exampleForActivity",
  "activityPreviewData",
  "topicExampleFromMode",
  "See example",
  "Example question",
  "Option A",
  "Option B",
  "Option C",
  "Option D",
  "correct answers award XP",
];

const requiredDrawerContent = [
  "Real student activity preview",
  "Activity preview unavailable",
  "<iframe",
  'loading="lazy"',
  "teacher_preview=1",
  "sandbox=",
  "No progress, XP, attempts or live-class writes are recorded.",
];

const forbiddenWriteTerms = [
  "awardXP",
  "awardGems",
  "completeLesson",
  "markLessonComplete",
  "saveRealm",
  "trackLiveLearningEvent",
  "recordAttempt",
  "submitAttempt",
];

const failures = [];

for (const term of forbiddenDrawerContent) {
  if (drawer.includes(term)) {
    failures.push(`${drawerPath} still contains fake/reconstructed preview content: ${term}`);
  }
}

for (const term of requiredDrawerContent) {
  if (!drawer.includes(term)) {
    failures.push(`${drawerPath} is missing required real-preview contract text/code: ${term}`);
  }
}

for (const term of forbiddenWriteTerms) {
  if (drawer.includes(term)) {
    failures.push(`${drawerPath} should not directly import or call write-capable student progress APIs: ${term}`);
  }
}

if (!drawer.includes("buildLessonRoute")) {
  failures.push(`${drawerPath} must use the shared lesson route builder for production lesson previews.`);
}

if (!drawer.includes("buildTeacherPreviewHref")) {
  failures.push(`${drawerPath} must explicitly append teacher_preview=1 before rendering a preview.`);
}

if (!demoMode.includes('get("teacher_preview") === "1"')) {
  failures.push(`${demoModePath} must treat teacher_preview=1 URLs as no-write demo preview mode.`);
}

if (failures.length) {
  console.error("Teacher real activity preview audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Teacher real activity preview audit passed.");
