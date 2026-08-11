import { LEVEL_FIVE_LESSON_CONTENT } from "@/data/activities/starpath/level5";
import { foldNet } from "@/data/activities/starpath/level5/nets";
import { samePoint, shortestSteps, type Point } from "@/data/activities/starpath/level5/coordinates";
import { inBounds, reflectPoint, rotatePoint } from "@/data/activities/starpath/level5/transforms";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

let failures = 0;
const fail = (message: string) => { console.error("FAIL:", message); failures += 1; };
const check = (condition: boolean, message: string) => { if (!condition) fail(message); };

type NetTask = Extract<PracticeTask, { kind: "starpathNet" }>;
type CoordTask = Extract<PracticeTask, { kind: "starpathCoordinate" }>;
type TransformTask = Extract<PracticeTask, { kind: "starpathTransform" }>;
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

// Can the rover reach the goal within maxSteps, on the grid and off blocked cells?
function routeSolvable(task: CoordTask): boolean {
  if (!task.start || !task.goal) return false;
  const blocked = new Set((task.blocked ?? []).map((c) => `${c.x}:${c.y}`));
  const budget = task.maxSteps ?? task.bounds.x + task.bounds.y;
  const seen = new Set<string>();
  let frontier: Point[] = [task.start];
  seen.add(`${task.start.x}:${task.start.y}`);
  for (let step = 0; step <= budget; step += 1) {
    if (frontier.some((p) => p.x === task.goal!.x && p.y === task.goal!.y)) return true;
    const next: Point[] = [];
    for (const p of frontier) {
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const q = { x: p.x + d[0]!, y: p.y + d[1]! };
        const k = `${q.x}:${q.y}`;
        if (q.x < 0 || q.y < 0 || q.x > task.bounds.x || q.y > task.bounds.y || blocked.has(k) || seen.has(k)) continue;
        seen.add(k); next.push(q);
      }
    }
    frontier = next;
  }
  return false;
}

let lessons = 0;
let generators = 0;

for (const [lessonId, content] of Object.entries(LEVEL_FIVE_LESSON_CONTENT)) {
  lessons += 1;
  check(content.teaching.taskKind === "starpathShapeIntro", `${lessonId}: teaching should be starpathShapeIntro`);
  const set = content.createTaskSet();

  const week = Number(lessonId.match(/-w(\d)-/)?.[1] ?? 0);
  const expectVariant = week <= 3 ? "l5Nets" : week <= 5 ? "l5Coord" : week <= 7 ? "l5Trans" : "l5Integrate";
  const intro = set.teaching() as PracticeTask;
  check(intro.kind === "starpathShapeIntro" && (intro as { variant?: string }).variant === expectVariant, `${lessonId}: intro must use the ${expectVariant} teach variant`);

  for (const activity of set.activities) {
    for (let round = 0; round < 4; round += 1) {
      const task = activity() as PracticeTask;
      generators += 1;

      if (task.kind === "starpathCoordinate") {
        const coord = task as CoordTask;
        check(coord.prompt.length > 0 && coord.speakText.length > 0, `${lessonId}: prompt/speakText required`);
        const within = (p?: Point) => Boolean(p && p.x >= 0 && p.y >= 0 && p.x <= coord.bounds.x && p.y <= coord.bounds.y);
        if (coord.render === "tap") {
          check(within(coord.answer), `${lessonId}: tap answer must be on the grid`);
        } else if (coord.render === "options") {
          const ids = new Set((coord.options ?? []).map((o) => o.id));
          check(ids.size >= 2, `${lessonId}: options needed`);
          check((coord.correctOptionIds ?? []).length === 1 && ids.has((coord.correctOptionIds ?? [])[0]!), `${lessonId}: one valid option answer`);
        } else {
          check(within(coord.start) && within(coord.goal), `${lessonId}: commands need start and goal on the grid`);
          check(routeSolvable(coord), `${lessonId}: route must be solvable within maxSteps`);
          if (coord.mode === "route") check(coord.maxSteps === shortestSteps(coord.start!, coord.goal!), `${lessonId}: route maxSteps should be the shortest distance`);
        }
        continue;
      }

      if (task.kind === "starpathTransform") {
        const tf = task as TransformTask;
        check(tf.prompt.length > 0 && tf.speakText.length > 0, `${lessonId}: prompt/speakText required`);
        check(tf.shape.length >= 3 && inBounds(tf.shape, tf.bounds), `${lessonId}: shape must be on the grid`);
        if (tf.image) check(inBounds(tf.image, tf.bounds), `${lessonId}: image must be on the grid`);
        if (tf.render === "tap") {
          check(Boolean(tf.markStart) && Boolean(tf.answer), `${lessonId}: tap needs a marked point and answer`);
          check(inBounds([tf.answer!], tf.bounds), `${lessonId}: answer must be on the grid`);
          check(tf.shape.some((p) => samePoint(p, tf.markStart!)), `${lessonId}: marked point must be part of the shape`);
          if (tf.mode === "reflect" && tf.line) check(samePoint(reflectPoint(tf.markStart!, tf.line), tf.answer!), `${lessonId}: reflect answer must match the engine`);
          if (tf.mode === "rotate" && tf.centre && tf.rotation) check(samePoint(rotatePoint(tf.markStart!, tf.centre, tf.rotation), tf.answer!), `${lessonId}: rotate answer must match the engine`);
          if (tf.mode === "translate") check(!samePoint(tf.markStart!, tf.answer!), `${lessonId}: translate answer must move the point`);
        } else {
          const ids = new Set((tf.options ?? []).map((o) => o.id));
          check(ids.size >= 2 && (tf.correctOptionIds ?? []).length === 1 && ids.has((tf.correctOptionIds ?? [])[0]!), `${lessonId}: one valid option answer`);
        }
        continue;
      }

      if (task.kind !== "starpathNet") { fail(`${lessonId}: expected a Level 5 task, got ${task.kind}`); continue; }
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
      } else if (net.render === "solid") {
        // Authored 3D solid (cuboid / triangular prism / square pyramid): named
        // solid + a single-answer MCQ, no cube-net cells.
        check(Boolean(net.solid), `${lessonId}: solid render needs a solid`);
        const ids = new Set((net.textOptions ?? []).map((option) => option.id));
        check(ids.size >= 2, `${lessonId}: solid MCQ needs options`);
        check((net.correctOptionIds ?? []).length === 1 && ids.has((net.correctOptionIds ?? [])[0]!), `${lessonId}: solid MCQ needs one valid answer`);
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
for (let week = 1; week <= 8; week += 1) {
  for (let lesson = 1; lesson <= 3; lesson += 1) {
    const plan = program.weeks[week - 1]?.lessons[lesson - 1];
    check(plan?.status === "implemented", `registry y5-w${week}-l${lesson} should be implemented`);
  }
}

if (failures === 0) {
  console.log(`Starpath Level 5 audit passed: ${lessons} lessons, ${generators} generated tasks validated across Weeks 1-8 (nets, coordinates, transformations, integration).`);
} else {
  console.error(`Starpath Level 5 audit failed with ${failures} problem(s).`);
  process.exit(1);
}
