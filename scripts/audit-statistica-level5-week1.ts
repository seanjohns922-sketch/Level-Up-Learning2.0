import { getStatisticaLevel5TaskSet } from "@/data/activities/statistica/level5";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

const lessons = [
  {
    id: "y5-statistics-w1-l1",
    concept: "nominal",
    families: ["statisticaClassify", "statisticaSort", "statisticaClassify"],
  },
  {
    id: "y5-statistics-w1-l2",
    concept: "ordinal",
    families: ["statisticaSort", "statisticaClassify", "statisticaClassify"],
  },
  {
    id: "y5-statistics-w1-l3",
    concept: "discrete",
    families: ["statisticaClassify", "statisticaClassify", "statisticaSort"],
  },
] as const;

let problems = 0;
const check = (condition: boolean, message: string) => {
  if (!condition) {
    problems += 1;
    console.error(`FAIL: ${message}`);
  }
};

function fingerprint(task: PracticeTask) {
  const copy = { ...(task as unknown as Record<string, unknown>) };
  delete copy.target;
  delete copy.feedback;
  return JSON.stringify(copy);
}

function textField(task: PracticeTask, field: "prompt" | "speakText") {
  const value = (task as unknown as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

for (const lesson of lessons) {
  const set = getStatisticaLevel5TaskSet(lesson.id);
  check(Boolean(set), `${lesson.id}: task set is missing`);
  if (!set) continue;

  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);
  const allTasks = [teaching, ...activities];

  check(textField(teaching, "prompt").toLowerCase().includes(lesson.concept), `${lesson.id}: teaching must explicitly introduce ${lesson.concept}`);
  check(
    activities.every((task, index) => task.kind === lesson.families[index]),
    `${lesson.id}: activity sequence does not match the intended lesson progression`,
  );
  check(
    activities.every((task) => fingerprint(task) !== fingerprint(teaching)),
    `${lesson.id}: teaching task must not be repeated as practice`,
  );

  for (const task of allTasks) {
    check(isPracticeTaskSafe(task), `${lesson.id}: ${task.kind} task is not renderer-safe`);
    check(Boolean(textField(task, "speakText")), `${lesson.id}: ${task.kind} task needs read-aloud text`);
    if (task.kind === "statisticaClassify") {
      const optionIds = new Set(task.options.map((option) => option.id));
      check(
        task.correctOptionIds.length > 0 && task.correctOptionIds.every((id) => optionIds.has(id)),
        `${lesson.id}: classify answer must reference a displayed option`,
      );
    }
    if (task.kind === "statisticaSort") {
      const categoryIds = new Set(task.categories.map((category) => category.id));
      check(
        task.items.length >= 3 && task.items.every((item) => categoryIds.has(item.category)),
        `${lesson.id}: every sort item must reference a displayed category`,
      );
    }
  }

  set.activities.forEach((makeTask, index) => {
    const variants = Array.from({ length: 10 }, () => fingerprint(makeTask() as PracticeTask));
    check(new Set(variants).size >= 3, `${lesson.id}: activity ${index + 1} needs at least three variants`);
  });
}

const teachingPrompts = lessons.map((lesson) => {
  const set = getStatisticaLevel5TaskSet(lesson.id);
  return set ? textField(set.teaching() as PracticeTask, "prompt") : "";
});
check(new Set(teachingPrompts).size === lessons.length, "Week 1 lessons must not share the same teaching prompt");

if (problems > 0) {
  console.error(`\nStatistica Level 5 Week 1 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 5 Week 1 audit passed: nominal, ordinal and discrete lessons are distinct and renderer-safe.");
