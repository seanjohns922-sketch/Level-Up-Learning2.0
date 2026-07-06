import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickShape, countOptions, shuffle } from "@/data/activities/year4Measurelands/week5Common";

// ── Measurelands · Level 4 · Week 5 · Lesson 1 — "Measure Area" (AC9M4M02) ──
// Measure the area of rectangles and squares by covering with equal square units
// and counting. No formula. Reuses the Level 3 Area Builder.
// THREE rotating activities:
//   A. cover        — tap tiles to cover the whole rectangle (no gaps).
//   B. countSquares — count the square units.
//   C. whichPart    — which picture shows the area (the inside, not the edge)?

type AreaTask = Extract<PracticeTask, { kind: "area" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"cover" | "count" | "whichPart"> = ["cover", "count", "whichPart", "cover", "count", "whichPart"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): AreaTask {
  const s = pickShape({ min: 3, max: 5 });
  return {
    kind: "area",
    scene: "intro",
    prompt: "What is area?",
    speakText:
      "Professor Gauge says: area is the amount of flat surface inside a shape. We measure it by covering the shape with equal square units and counting them. Area is different from perimeter — perimeter is the distance around the edge, and area is the space inside.",
    badgeLabel: "Meazurex Mission",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    feedback: { correct: "Let's build!", wrong: "Let's build!" },
  };
}

// Activity A — Cover the Rectangle.
function buildCoverTask(): AreaTask {
  const s = pickShape({ min: 3, max: 5 });
  return {
    kind: "area",
    scene: "cover",
    prompt: `Cover the ${s.label} with square tiles.`,
    speakText: `Cover the whole ${s.label} with square tiles — no gaps, no overlaps.`,
    badgeLabel: "Cover the Rectangle",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    feedback: { correct: "Fully covered — that's the area!", wrong: "Fill every square." },
  };
}

// Activity B — Count the Squares.
function buildCountTask(): AreaTask {
  const s = pickShape({ min: 2, max: 6 });
  const opts = new Set<number>([s.area]);
  while (opts.size < 4) { const d = s.area + (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3)); if (d > 0) opts.add(d); }
  return {
    kind: "area",
    scene: "countSquares",
    prompt: `How many square units cover the ${s.label}?`,
    speakText: `Count the square units in the ${s.label}.`,
    badgeLabel: "Count the Squares",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    options: shuffle([...opts]).slice(0, 4),
    correctNumber: s.area,
    feedback: { correct: `Yes — ${s.area} square units.`, wrong: `Count every square once — there are ${s.area}.` },
  };
}

// Activity C — Which Picture Shows the Area? (inside, not the edge).
function buildWhichPartTask(): AreaTask {
  const s = pickShape({ min: 3, max: 5 });
  const options = shuffle([
    { id: "inside", fillType: "inside" as const },
    { id: "edge", fillType: "edge" as const },
    { id: "partial", fillType: "partial" as const },
  ]);
  return {
    kind: "area",
    scene: "whichPart",
    prompt: `Which picture shows the area of the ${s.label}?`,
    speakText: `Which picture shows the area — the whole space inside the ${s.label}?`,
    badgeLabel: "Which Is the Area?",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    partOptions: options, correctPartId: "inside",
    feedback: { correct: "Yes — area fills the whole inside space.", wrong: "Area is the whole inside, not the edge or just part." },
  };
}

export function generateY4MeasurelandsWeek5Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "count") return buildCountTask();
  if (activity === "whichPart") return buildWhichPartTask();
  return buildCoverTask();
}

export function resetY4MeasurelandsWeek5Lesson1TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek5Lesson1QuizTasks(): PracticeTask[] {
  // Determinate MCQ tasks (cover always completes, so it's not assessed).
  return [buildCountTask(), buildWhichPartTask(), buildCountTask(), buildWhichPartTask(), buildCountTask()];
}
