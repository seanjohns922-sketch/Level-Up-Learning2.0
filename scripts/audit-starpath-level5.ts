import { LEVEL_FIVE_LESSON_CONTENT } from "@/data/activities/starpath/level5";
import { foldNet } from "@/data/activities/starpath/level5/nets";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let failures = 0;
const fail = (message: string) => { console.error("FAIL:", message); failures += 1; };
const check = (condition: boolean, message: string) => { if (!condition) fail(message); };

type NetTask = Extract<PracticeTask, { kind: "starpathNet" }>;
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

let lessons = 0;
let generators = 0;

for (const [lessonId, content] of Object.entries(LEVEL_FIVE_LESSON_CONTENT)) {
  lessons += 1;
  check(content.teaching.taskKind === "starpathShapeIntro", `${lessonId}: teaching should be starpathShapeIntro`);
  const set = content.createTaskSet();

  const intro = set.teaching() as PracticeTask;
  check(intro.kind === "starpathShapeIntro" && (intro as { variant?: string }).variant === "l5Nets", `${lessonId}: intro must use the l5Nets teach variant`);

  for (const activity of set.activities) {
    for (let round = 0; round < 4; round += 1) {
      const task = activity() as PracticeTask;
      generators += 1;
      if (task.kind !== "starpathNet") { fail(`${lessonId}: expected starpathNet, got ${task.kind}`); continue; }
      const net = task as NetTask;
      check(net.prompt.length > 0 && net.speakText.length > 0, `${lessonId}: prompt/speakText required`);
      check(Boolean(net.feedback?.correct && net.feedback?.wrong), `${lessonId}: feedback required`);

      if (net.render === "options") {
        check(Array.isArray(net.netOptions) && net.netOptions.length >= 2, `${lessonId}: options render needs netOptions`);
        const ids = new Set((net.netOptions ?? []).map((option) => option.id));
        check((net.correctOptionIds ?? []).length > 0, `${lessonId}: options need a correct answer`);
        check((net.correctOptionIds ?? []).every((id) => ids.has(id)), `${lessonId}: correctOptionIds must reference options`);
        // selectValid answers must be exactly the nets that fold.
        if (net.mode === "selectValid") {
          const truth = (net.netOptions ?? []).filter((option) => foldNet(option.cells).valid).map((option) => option.id).sort();
          check(JSON.stringify(truth) === JSON.stringify([...(net.correctOptionIds ?? [])].sort()), `${lessonId}: selectValid answer must match real validity`);
        }
      } else if (net.render === "build") {
        check((net.buildFaces ?? 0) === 6, `${lessonId}: build needs six faces`);
      } else {
        // single
        check(Array.isArray(net.cells) && net.cells!.length >= 5, `${lessonId}: single render needs a net`);
        if (net.mode === "trackCell") {
          const keys = new Set((net.cells ?? []).map(key));
          check((net.answerCells ?? []).length > 0 && (net.answerCells ?? []).every((k) => keys.has(k)), `${lessonId}: trackCell answer must be a real cell`);
          check((net.focusKeys ?? []).every((k) => keys.has(k)), `${lessonId}: focus must be a real cell`);
        } else {
          const ids = new Set((net.textOptions ?? []).map((option) => option.id));
          check(ids.size >= 2, `${lessonId}: single MCQ needs options`);
          check((net.correctOptionIds ?? []).length === 1 && ids.has((net.correctOptionIds ?? [])[0]!), `${lessonId}: single MCQ needs one valid answer`);
        }
        if (net.mode === "foldPredict") {
          const folds = foldNet(net.cells ?? []).valid;
          const answeredYes = (net.correctOptionIds ?? [])[0] === "yes";
          check(folds === answeredYes, `${lessonId}: foldPredict answer must match real validity`);
        }
      }
    }
  }
}

// Registry: the nine W1-3 lessons must be flagged implemented.
const program = getStarpathProgram("level-5");
for (let week = 1; week <= 3; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y5-w${week}-l${lesson} should be implemented`);
  }
}

if (failures === 0) {
  console.log(`Starpath Level 5 nets audit passed: ${lessons} lessons, ${generators} generated tasks validated across Weeks 1-3.`);
} else {
  console.error(`Starpath Level 5 audit failed with ${failures} problem(s).`);
  process.exit(1);
}
