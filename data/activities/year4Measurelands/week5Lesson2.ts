import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickShape, pickDistinct, sameAreaShape, THEMES, shuffle, choose, randInt } from "@/data/activities/year4Measurelands/week5Common";

// ── Measurelands · Level 4 · Week 5 · Lesson 2 — "Compare Area" (AC9M4M02) ──
// Compare and order areas of rectangles and squares by counting square units.
// Two shapes can look different yet cover the same area.
// THREE rotating activities:
//   A. compare   — which has the greater area?
//   B. order     — order from smallest to largest area.
//   C. sameDiff  — same area or different area?

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"compare" | "order" | "sameDiff"> = ["compare", "order", "sameDiff", "compare", "order", "sameDiff"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const asShape = (s: ReturnType<typeof pickShape>) => ({ cells: s.cells, label: s.label, emoji: s.emoji, gridW: s.gridW, gridH: s.gridH });

function buildIntroTask(): AreaTask {
  const s = pickShape({ min: 3, max: 4 });
  return {
    kind: "area",
    scene: "intro",
    prompt: "Two shapes can cover the same amount of space.",
    speakText:
      "Professor Gauge says: two shapes can look different but still cover the same amount of space. To compare areas, count the square units — not just how big the shape looks.",
    badgeLabel: "Meazurex Mission",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    feedback: { correct: "Let's compare!", wrong: "Let's compare!" },
  };
}

// Activity A — Which Has Greater Area?
function buildCompareTask(): AreaTask {
  const [a, b] = pickDistinct(2, { min: 2, max: 6 });
  const bigger = a!.area >= b!.area ? a! : b!;
  return {
    kind: "area",
    scene: "compareArea",
    prompt: "Which has the greater area?",
    speakText: "Count the square units. Which shape covers more space?",
    badgeLabel: "Which Has Greater Area?",
    compareShapes: { a: asShape(a!), b: asShape(b!) },
    feedback: { correct: `Yes — the ${bigger.label} has ${bigger.area} square units.`, wrong: `Count the squares — the ${bigger.label} covers more.` },
  };
}

// Activity B — Order the Areas.
function buildOrderTask(): AreaTask {
  const shapes = pickDistinct(3, { min: 2, max: 6 });
  return {
    kind: "area",
    scene: "orderArea",
    prompt: "Order the shapes from smallest to largest area.",
    speakText: "Count the square units and tap the shapes from smallest area to largest.",
    badgeLabel: "Order by Area",
    orderShapes: shapes.map(asShape),
    feedback: { correct: "Good ordering — smallest to largest!", wrong: "Count the squares — start with the smallest area." },
  };
}

// Activity C — Equal or Different?
function buildSameDiffTask(): AreaTask {
  const a = pickShape({ min: 2, max: 6 });
  const wantSame = randInt(2) === 0;
  const otherTheme = choose(THEMES.filter((t) => t.label !== a.label));
  let b = wantSame ? sameAreaShape(a.area, { w: a.gridW, h: a.gridH }, otherTheme) : null;
  if (!b) {
    // fall back to a genuinely different area
    do { b = pickShape({ min: 2, max: 6, excludeLabels: [a.label] }); } while (b.area === a.area);
  }
  const same = a.area === b.area;
  return {
    kind: "area",
    scene: "sameDiff",
    prompt: "Do these cover the same area?",
    speakText: "Count the square units in each. Do they cover the same area, or different areas?",
    badgeLabel: "Equal or Different?",
    compareShapes: { a: asShape(a), b: asShape(b) },
    feedback: {
      correct: same ? `Yes — both cover ${a.area} square units.` : `Right — ${a.area} and ${b.area} are different.`,
      wrong: "Count the squares in each shape and compare.",
    },
  };
}

export function generateY4MeasurelandsWeek5Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "order") return buildOrderTask();
  if (activity === "sameDiff") return buildSameDiffTask();
  return buildCompareTask();
}

export function resetY4MeasurelandsWeek5Lesson2TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek5Lesson2QuizTasks(): PracticeTask[] {
  return [buildCompareTask(), buildOrderTask(), buildSameDiffTask(), buildCompareTask(), buildSameDiffTask()];
}
