import { getStatisticaLevel5TaskSet } from "@/data/activities/statistica/level5";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isPracticeTaskSafe } from "@/lib/task-safety";

const lessons = [
  { id: "y5-statistics-w5-l1", mode: "match" },
  { id: "y5-statistics-w5-l2", mode: "compare" },
  { id: "y5-statistics-w5-l3", mode: "design" },
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

const introPrompts: string[] = [];
for (const lesson of lessons) {
  const set = getStatisticaLevel5TaskSet(lesson.id);
  check(Boolean(set), `${lesson.id}: task set is missing`);
  if (!set) continue;

  const teaching = set.teaching() as PracticeTask;
  const activities = set.activities.map((makeTask) => makeTask() as PracticeTask);
  check(teaching.kind === "statisticaDisplayStudio", `${lesson.id}: introduction must use Display Studio`);
  if (teaching.kind === "statisticaDisplayStudio") {
    introPrompts.push(teaching.prompt);
    check(teaching.mode === "guide" && teaching.scene === "intro", `${lesson.id}: guide must be an unscored intro`);
    check((teaching.guideItems?.length ?? 0) === 3, `${lesson.id}: guide needs three clear teaching points`);
  }

  for (const task of [teaching, ...activities]) {
    check(isPracticeTaskSafe(task), `${lesson.id}: ${task.kind} must be renderer-safe`);
    if (task.kind !== "statisticaDisplayStudio") continue;
    check(Boolean(task.speakText), `${lesson.id}: every task needs read-aloud text`);
    check(task.data.labels.length === task.data.values.length && task.data.values.length >= 4, `${lesson.id}: display data must be complete`);
    check(task.displayOptions.includes(task.correctDisplay), `${lesson.id}: correct display must be visible`);
  }

  check(
    activities.every((task) => task.kind === "statisticaDisplayStudio" && task.mode === lesson.mode),
    `${lesson.id}: activities must use the promised ${lesson.mode} interaction`,
  );
  const openingDisplays = activities.flatMap((task) => task.kind === "statisticaDisplayStudio" ? [task.correctDisplay] : []);
  check(new Set(openingDisplays).size === 3, `${lesson.id}: opening cycle must cover line, column and table briefs`);

  for (const task of activities) {
    if (task.kind !== "statisticaDisplayStudio") continue;
    const brief = task.purpose.toLowerCase();
    if (task.correctDisplay === "line") check(/connect|join/.test(brief), `${lesson.id}: line answer needs an explicit connected-trend brief`);
    if (task.correctDisplay === "column") check(/separate bars/.test(brief), `${lesson.id}: column answer needs an explicit separate-bars brief`);
    if (task.correctDisplay === "table") check(/print.*exact|exact.*print/.test(brief), `${lesson.id}: table answer needs an explicit exact-values brief`);
  }

  if (lesson.mode === "design") {
    for (const task of activities) {
      if (task.kind !== "statisticaDisplayStudio") continue;
      check(Boolean(task.correctTitleId && task.titleOptions?.some((option) => option.id === task.correctTitleId)), `${lesson.id}: design needs a valid title answer`);
      check(Boolean(task.correctReasonId && task.reasonOptions?.some((option) => option.id === task.correctReasonId)), `${lesson.id}: design needs a valid justification answer`);
    }
  }

  set.activities.forEach((makeTask, index) => {
    const variants = Array.from({ length: 10 }, () => fingerprint(makeTask() as PracticeTask));
    check(new Set(variants).size >= 8, `${lesson.id}: activity ${index + 1} needs broad dataset variation`);
  });
}

check(new Set(introPrompts).size === 3, "Each Week 5 lesson needs a distinct introduction");

if (problems > 0) {
  console.error(`\nStatistica Level 5 Week 5 audit failed with ${problems} problem(s).`);
  process.exit(1);
}

console.log("Statistica Level 5 Week 5 audit passed: match, compare and design lessons are distinct, visual and voiced.");
