/* Audit for Starpath Level 6 Weeks 1-2 (cross-sections, AC9M6SP01).
 * Generates every lesson's tasks over several rounds and checks each answer
 * against the cross-section engine, plus that the registry marks them implemented.
 * Run: npx tsx scripts/audit-starpath-level6.ts
 */
import { LEVEL_SIX_LESSON_CONTENT } from "@/data/activities/starpath/level6";
import { getCrossObject } from "@/data/activities/starpath/level6/crossSections";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (cond: boolean, message: string) => { if (!cond) { problems += 1; console.error(`FAIL: ${message}`); } };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type CrossTask = Extract<PracticeTask, { kind: "starpathCrossSection" }>;

const LESSON_IDS = [
  "y6-space-w1-l1", "y6-space-w1-l2", "y6-space-w1-l3",
  "y6-space-w2-l1", "y6-space-w2-l2", "y6-space-w2-l3",
];

let taskCount = 0;
for (const lessonId of LESSON_IDS) {
  const content = LEVEL_SIX_LESSON_CONTENT[lessonId];
  check(Boolean(content), `${lessonId}: missing lesson content`);
  if (!content) continue;
  // Generate several rounds so the object rotation is exercised.
  for (let round = 0; round < 8; round += 1) {
    const set = content.createTaskSet();
    for (const activity of set.activities) {
      const task = activity() as PracticeTask;
      if (task.kind !== "starpathCrossSection") continue;
      const t = task as CrossTask;
      taskCount += 1;
      const obj = getCrossObject(t.objectId);
      check(obj.id === t.objectId, `${lessonId}: unknown objectId ${t.objectId}`);
      const ids = new Set(t.options.map((o) => o.id));
      check(ids.size === t.options.length && ids.size >= 2, `${lessonId}: options must be unique and >= 2`);
      check(t.correctOptionIds.length === 1 && ids.has(t.correctOptionIds[0]!), `${lessonId}: exactly one valid correct answer`);
      const correct = t.options.find((o) => o.id === t.correctOptionIds[0]);
      check(Boolean(correct), `${lessonId}: correct option resolves`);
      // The answer must match the engine for the mode.
      if (t.mode === "sliceShape" || t.mode === "predict") {
        check(correct?.label === cap(obj.sectionName), `${lessonId}/${t.mode}: section shape must be ${obj.sectionName} for ${obj.id}`);
      } else if (t.mode === "sliceChange") {
        check(t.correctOptionIds[0] === (obj.constantSection ? "same" : "smaller"), `${lessonId}/sliceChange: wrong constant/shrink answer for ${obj.id}`);
      } else if (t.mode === "prism") {
        check(t.correctOptionIds[0] === (obj.isPrism ? "yes" : "no"), `${lessonId}/prism: wrong prism answer for ${obj.id}`);
      } else if (t.mode === "constant") {
        check(t.correctOptionIds[0] === (obj.constantSection ? "congruent" : "smaller"), `${lessonId}/constant: wrong answer for ${obj.id}`);
      } else if (t.mode === "explain") {
        check(t.correctOptionIds[0] === (obj.constantSection ? "prismlike" : "apex"), `${lessonId}/explain: wrong answer for ${obj.id}`);
      }
      check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
    }
  }
}

// Registry: the six W1-2 lessons must be flagged implemented.
const program = getStarpathProgram("level-6");
for (let week = 1; week <= 2; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y6-w${week}-l${lesson} should be implemented`);
  }
}

if (problems > 0) {
  console.error(`\nStarpath Level 6 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Starpath Level 6 audit passed: 6 lessons, ${taskCount} generated tasks validated (Weeks 1-2 cross-sections).`);
