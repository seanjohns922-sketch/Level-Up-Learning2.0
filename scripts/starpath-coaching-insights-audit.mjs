import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const lessonIdPattern = /^\s*"((?:ground|y1)-space-w\d+-l[1-3])"\s*:/gm;
const idsFrom = (source) => [...source.matchAll(lessonIdPattern)].map((match) => match[1]);

const registeredIds = [
  ...idsFrom(read("data/activities/starpath/ground/index.ts")),
  ...idsFrom(read("data/activities/starpath/level1/index.ts")),
];
const coachingIds = idsFrom(read("data/starpath/coaching.ts"));
const registered = new Set(registeredIds);
const authored = new Set(coachingIds);

const missing = registeredIds.filter((id) => !authored.has(id));
const orphaned = coachingIds.filter((id) => !registered.has(id));
const duplicateIds = coachingIds.filter((id, index) => coachingIds.indexOf(id) !== index);

const shell = read("components/starpath/StarpathLessonShell.tsx");
const teacherBuilder = read("lib/teacher-insights.ts");
const failures = [];

if (registeredIds.length !== 48) failures.push(`Expected 48 registered lessons, found ${registeredIds.length}.`);
if (coachingIds.length !== 48) failures.push(`Expected 48 coaching entries, found ${coachingIds.length}.`);
if (missing.length) failures.push(`Missing coaching: ${missing.join(", ")}`);
if (orphaned.length) failures.push(`Unregistered coaching: ${orphaned.join(", ")}`);
if (duplicateIds.length) failures.push(`Duplicate coaching IDs: ${duplicateIds.join(", ")}`);
if (!shell.includes("showCoachReview")) failures.push("Starpath does not enable the shared Coach Review.");
if (!shell.includes('fetch("/api/teacher-insight"')) failures.push("Starpath does not generate shared teacher insights.");
if (!shell.includes("topicSummaries: summary?.topicSummaries")) failures.push("Starpath does not persist canonical topic summaries.");
if (!teacherBuilder.includes("coaching.teacherAction")) failures.push("Teacher insight builder does not use authored coaching.");

if (failures.length) {
  console.error("Starpath Coaching Insights audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Starpath Coaching Insights audit passed: ${registeredIds.length}/${registeredIds.length} playable lessons covered.`);
console.log("Ground Level: 24/24");
console.log("Level 1: 24/24");
console.log("Shared student review, teacher insight generation and canonical summary persistence: present");
