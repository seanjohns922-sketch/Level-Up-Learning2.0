/* Audit for Starpath Level 6 Weeks 1-4 (cross-sections SP01, four-quadrant
 * coordinates SP02). Generates every lesson's tasks over several rounds and
 * checks each answer against the engines, plus that the registry marks them
 * implemented. Run: npx tsx scripts/audit-starpath-level6.ts
 */
import { LEVEL_SIX_LESSON_CONTENT } from "@/data/activities/starpath/level6";
import { getCrossObject } from "@/data/activities/starpath/level6/crossSections";
import { CARTESIAN_RANGE, coordLabel, inRange, quadrant, type Point } from "@/data/activities/starpath/level6/cartesian";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let problems = 0;
const check = (cond: boolean, message: string) => { if (!cond) { problems += 1; console.error(`FAIL: ${message}`); } };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type CrossTask = Extract<PracticeTask, { kind: "starpathCrossSection" }>;
type CartTask = Extract<PracticeTask, { kind: "starpathCartesian" }>;

const CROSS_LESSONS = ["y6-space-w1-l1", "y6-space-w1-l2", "y6-space-w1-l3", "y6-space-w2-l1", "y6-space-w2-l2", "y6-space-w2-l3"];
const CART_LESSONS = ["y6-space-w3-l1", "y6-space-w3-l2", "y6-space-w3-l3", "y6-space-w4-l1", "y6-space-w4-l2", "y6-space-w4-l3"];

let taskCount = 0;

function auditCross(lessonId: string, t: CrossTask) {
  const obj = getCrossObject(t.objectId);
  check(obj.id === t.objectId, `${lessonId}: unknown objectId ${t.objectId}`);
  const ids = new Set(t.options.map((o) => o.id));
  check(ids.size === t.options.length && ids.size >= 2, `${lessonId}: options must be unique and >= 2`);
  check(t.correctOptionIds.length === 1 && ids.has(t.correctOptionIds[0]!), `${lessonId}: exactly one valid correct answer`);
  const correct = t.options.find((o) => o.id === t.correctOptionIds[0]);
  if (t.mode === "sliceShape" || t.mode === "predict") {
    check(correct?.label === cap(obj.sectionName), `${lessonId}/${t.mode}: section must be ${obj.sectionName} for ${obj.id}`);
  } else if (t.mode === "sliceChange") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "same" : "smaller"), `${lessonId}/sliceChange: wrong answer for ${obj.id}`);
  } else if (t.mode === "prism") {
    check(t.correctOptionIds[0] === (obj.isPrism ? "yes" : "no"), `${lessonId}/prism: wrong answer for ${obj.id}`);
  } else if (t.mode === "constant") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "congruent" : "smaller"), `${lessonId}/constant: wrong answer for ${obj.id}`);
  } else if (t.mode === "explain") {
    check(t.correctOptionIds[0] === (obj.constantSection ? "prismlike" : "apex"), `${lessonId}/explain: wrong answer for ${obj.id}`);
  }
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

function auditCart(lessonId: string, t: CartTask) {
  check(t.range === CARTESIAN_RANGE, `${lessonId}: range must be ${CARTESIAN_RANGE}`);
  for (const p of t.points ?? []) check(inRange({ x: p.x, y: p.y }), `${lessonId}: point ${coordLabel(p as Point)} off the grid`);
  if (t.render === "tap") {
    check(Boolean(t.answer) && inRange(t.answer as Point), `${lessonId}: tap answer must be on the grid`);
  } else {
    const ids = new Set((t.options ?? []).map((o) => o.id));
    check(ids.size >= 2, `${lessonId}: options need >= 2`);
    check((t.correctOptionIds ?? []).length === 1 && ids.has((t.correctOptionIds ?? [])[0]!), `${lessonId}: one valid correct answer`);
    if (t.mode === "quadrant" || t.mode === "reason") {
      // The star (if shown) must sit in the quadrant named by the correct id.
      const star = (t.points ?? []).find((p) => p.kind === "star");
      if (star) check((t.correctOptionIds ?? [])[0] === `q${quadrant({ x: star.x, y: star.y })}`, `${lessonId}/${t.mode}: quadrant answer mismatch`);
    }
    if (t.mode === "changeWhich") {
      const rover = (t.points ?? []).find((p) => p.kind === "rover");
      const goal = (t.points ?? []).find((p) => p.kind === "goal");
      if (rover && goal) check((t.correctOptionIds ?? [])[0] === (rover.x !== goal.x ? "across" : "up"), `${lessonId}/changeWhich: axis answer mismatch`);
    }
  }
  check(Boolean(t.feedback?.correct && t.feedback?.wrong), `${lessonId}: feedback required`);
}

for (const lessonId of [...CROSS_LESSONS, ...CART_LESSONS]) {
  const content = LEVEL_SIX_LESSON_CONTENT[lessonId];
  check(Boolean(content), `${lessonId}: missing lesson content`);
  if (!content) continue;
  for (let round = 0; round < 8; round += 1) {
    const set = content.createTaskSet();
    for (const activity of set.activities) {
      const task = activity() as PracticeTask;
      if (task.kind === "starpathCrossSection") { taskCount += 1; auditCross(lessonId, task); }
      else if (task.kind === "starpathCartesian") { taskCount += 1; auditCart(lessonId, task); }
    }
  }
}

// Registry: the twelve W1-4 lessons must be flagged implemented.
const program = getStarpathProgram("level-6");
for (let week = 1; week <= 4; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y6-w${week}-l${lesson} should be implemented`);
  }
}

if (problems > 0) {
  console.error(`\nStarpath Level 6 audit failed with ${problems} problem(s).`);
  process.exit(1);
}
console.log(`Starpath Level 6 audit passed: 12 lessons, ${taskCount} generated tasks validated (Weeks 1-4: cross-sections + four-quadrant coordinates).`);
