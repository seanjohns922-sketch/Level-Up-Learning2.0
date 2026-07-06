import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { makeRect, countOptions, randRange, shuffle, type AreaShape, type Theme } from "@/data/activities/year4Measurelands/week5Common";

// ── Measurelands · Level 4 · Week 5 · Lesson 3 — "Area Problems" (AC9M4M02) ──
// Real-world area: gardens, classroom floors and playgrounds. Rectangles and
// squares only, counting square units.
// THREE rotating activities:
//   A. garden — which garden needs more grass? (greater area)
//   B. floor  — how many square tiles cover the classroom floor? (count)
//   C. design — order the play areas by how much space they have. (order)

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"garden" | "floor" | "design"> = ["garden", "floor", "design", "garden", "floor", "design"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

const asShape = (s: AreaShape) => ({ cells: s.cells, label: s.label, emoji: s.emoji, gridW: s.gridW, gridH: s.gridH });

/** n themed rectangles with distinct areas. */
function distinctThemed(themes: Theme[]): AreaShape[] {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const shapes = themes.map((t) => makeRect(randRange(2, 6), randRange(2, 6), t));
    const areas = new Set(shapes.map((s) => s.area));
    if (areas.size === shapes.length && shapes.every((s) => s.area <= 30)) return shapes;
  }
  return themes.map((t, i) => makeRect(2 + i, 3, t));
}

function buildIntroTask(): AreaTask {
  const s = makeRect(4, 3, { label: "garden", emoji: "🌱" });
  return {
    kind: "area",
    scene: "intro",
    prompt: "Builders and gardeners measure area before they start.",
    speakText:
      "Professor Gauge says: builders and gardeners measure area before they begin. Counting the square units tells us how much grass, or how many tiles, a space needs.",
    badgeLabel: "Meazurex Mission",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    feedback: { correct: "Let's design!", wrong: "Let's design!" },
  };
}

// Activity A — Garden Beds (which needs more grass = greater area).
function buildGardenTask(): AreaTask {
  const [a, b] = distinctThemed([{ label: "garden", emoji: "🌱" }, { label: "lawn", emoji: "🌿" }]);
  const bigger = a!.area >= b!.area ? a! : b!;
  return {
    kind: "area",
    scene: "compareArea",
    prompt: "Which garden needs more grass?",
    speakText: "The bigger area needs more grass. Count the square units — which garden needs more?",
    badgeLabel: "Garden Beds",
    compareShapes: { a: asShape(a!), b: asShape(b!) },
    feedback: { correct: `Yes — the ${bigger.label} has ${bigger.area} square units of grass.`, wrong: `Count the squares — the ${bigger.label} is bigger.` },
  };
}

// Activity B — Floor Tiles (count the square units).
function buildFloorTask(): AreaTask {
  const s = makeRect(randRange(3, 6), randRange(2, 5), { label: "classroom floor", emoji: "🪑" });
  const { options, correct } = countOptions(s);
  return {
    kind: "area",
    scene: "countSquares",
    prompt: "How many square tiles cover the classroom floor?",
    speakText: "Each square is one floor tile. How many tiles cover the whole floor?",
    badgeLabel: "Floor Tiles",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    options, correctNumber: correct,
    feedback: { correct: `Yes — ${correct} tiles cover the floor.`, wrong: `Count every square once — it needs ${correct} tiles.` },
  };
}

// Activity C — Design a Playground (order the play areas by space).
function buildDesignTask(): AreaTask {
  const shapes = distinctThemed([
    { label: "playground", emoji: "🛝" },
    { label: "sandpit", emoji: "🏖️" },
    { label: "ball court", emoji: "⚽" },
  ]);
  return {
    kind: "area",
    scene: "orderArea",
    prompt: "Order the play areas from smallest to largest space.",
    speakText: "You are designing a playground. Count the square units and order the play areas from the smallest space to the largest.",
    badgeLabel: "Design a Playground",
    orderShapes: shapes.map(asShape),
    feedback: { correct: "Nice designing — smallest to largest space!", wrong: "Count the squares — start with the smallest play area." },
  };
}

export function generateY4MeasurelandsWeek5Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "floor") return buildFloorTask();
  if (activity === "design") return buildDesignTask();
  return buildGardenTask();
}

export function resetY4MeasurelandsWeek5Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  return [buildGardenTask(), buildFloorTask(), buildDesignTask(), buildGardenTask(), buildFloorTask()];
}
