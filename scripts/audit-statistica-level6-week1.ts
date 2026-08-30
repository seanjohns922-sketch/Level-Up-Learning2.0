import { getStatisticaLevel6TaskSet } from "@/data/activities/statistica/level6";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

type Week1Task = Extract<PracticeTask, { kind: "statisticaClassify" | "statisticaSort" | "statisticaShape" }>;

const lessons = [
  {
    id: "y6-statistics-w1-l1",
    teachingText: /continuous/i,
    activityKinds: ["statisticaClassify", "statisticaClassify", "statisticaClassify"],
    activityPrompts: [/between/i, /collection plan/i, /decimal places/i],
  },
  {
    id: "y6-statistics-w1-l2",
    teachingText: /counted|measured/i,
    activityKinds: ["statisticaSort", "statisticaClassify", "statisticaClassify"],
    activityPrompts: [/sort each variable/i, /comparable data/i, /ready to add/i],
  },
  {
    id: "y6-statistics-w1-l3",
    teachingText: /compared/i,
    activityKinds: ["statisticaSort", "statisticaClassify", "statisticaShape"],
    activityPrompts: [/sort the variables/i, /compared meaningfully/i, /higher value/i],
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

function validateAnswers(task: Week1Task, lessonId: string) {
  if (task.kind === "statisticaClassify" || task.kind === "statisticaShape") {
    const optionIds = new Set(task.options.map((option) => option.id));
    check(
      task.correctOptionIds.length > 0 && task.correctOptionIds.every((id) => optionIds.has(id)),
      `${lessonId}: every correct answer must be visible`,
    );
  }
  if (task.kind === "statisticaSort") {
    const categoryIds = new Set(task.categories.map((category) => category.id));
    check(
      task.items.length > 0 && task.items.every((item) => categoryIds.has(item.category)),
      `${lessonId}: every sort item must have a visible destination`,
    );
  }
}

const teachingPrompts: string[] = [];
for (const lesson of lessons) {
  const set = getStatisticaLevel6TaskSet(lesson.id);
  check(Boolean(set), `${lesson.id}: task set is missing`);
  if (!set) continue;

  const teaching = set.teaching() as Week1Task;
  const activities = set.activities.map((makeTask) => makeTask() as Week1Task);
  teachingPrompts.push(teaching.prompt);

  check(lesson.teachingText.test(`${teaching.prompt} ${teaching.speakText ?? ""}`), `${lesson.id}: introduction must teach its new Year 6 focus`);
  check(!activities.some((task) => task.prompt === teaching.prompt), `${lesson.id}: introduction must not repeat as Question 1`);
  check(
    activities.every((task, index) => task.kind === lesson.activityKinds[index]),
    `${lesson.id}: activity sequence must use the intended interactions`,
  );
  activities.forEach((task, index) => {
    check(lesson.activityPrompts[index].test(task.prompt), `${lesson.id}: activity ${index + 1} must address its intended idea`);
  });

  for (const task of [teaching, ...activities]) {
    check(isPracticeTaskSafe(task), `${lesson.id}: ${task.kind} must be renderer-safe`);
    check(Boolean(task.speakText?.trim()), `${lesson.id}: ${task.kind} needs read-aloud text`);
    validateAnswers(task, lesson.id);
  }

  set.activities.forEach((makeTask, index) => {
    const variants = Array.from({ length: 10 }, () => fingerprint(makeTask() as PracticeTask));
    check(new Set(variants).size >= 4, `${lesson.id}: activity ${index + 1} needs useful question variation`);
  });
}

check(new Set(teachingPrompts).size === lessons.length, "Each Week 1 lesson needs a distinct introduction");

if (problems > 0) {
  console.error(`\nStatistica Level 6 Week 1 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 6 Week 1 audit passed: continuous data, collection choices and comparisons form a distinct voiced progression.");
