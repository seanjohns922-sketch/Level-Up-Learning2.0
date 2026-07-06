import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickW1Object, rulerFor, shuffle, randInt, W1_MAX_RULER, type W1Object } from "@/data/activities/year4Measurelands/week1Common";

// ── Measurelands · Level 4 · Week 1 · Lesson 3 — "Solve Measurement Problems" (AC9M4M01) ──
// The application lesson: no new ruler skill, students USE their measurements to
// compare, order and reason. Misconceptions: bigger object ≠ always longer,
// "close enough", judging by the picture instead of the measurement.
// THREE rotating activities:
//   A. compare   — which is longer? (and sometimes: how much longer?).
//   B. order     — arrange measured objects shortest → longest.
//   C. spotWrong — Professor Gauge measured several; find the wrong one.

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"compare" | "order" | "spotWrong"> = [
  "compare", "order", "spotWrong", "compare", "order", "spotWrong",
];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

/** Pick n objects with distinct labels AND distinct half-cm lengths. */
function pickDistinct(n: number, maxLen = W1_MAX_RULER): W1Object[] {
  const chosen: W1Object[] = [];
  for (let attempt = 0; attempt < 200 && chosen.length < n; attempt += 1) {
    const o = pickW1Object({ maxLen, exclude: chosen.map((c) => c.label) });
    if (chosen.some((c) => c.lengthCm === o.lengthCm)) continue;
    chosen.push(o);
  }
  return chosen;
}

function buildIntroTask(): RulerTask {
  return {
    kind: "rulerMeasure",
    scene: "intro",
    precision: true,
    prompt: "Measure so you can solve problems.",
    speakText:
      "Professor Gauge says: scientists don't measure just for fun. They measure so they can solve problems. Use the measurement — not just your eyes — to compare, order and reason.",
    badgeLabel: "Meazurex Mission",
    rulerCm: 14,
    object: { label: "paintbrush", icon: "🖌️", lengthCm: 12.5 },
    feedback: { correct: "Let's solve!", wrong: "Let's solve!" },
  };
}

// Activity A — Which Is Longer? (sometimes: how much longer?).
function buildCompareTask(): RulerTask {
  const [a, b] = pickDistinct(2);
  const first = a!;
  const second = b!;
  const longer = first.lengthCm > second.lengthCm ? first : second;
  const rulerCm = rulerFor(Math.max(first.lengthCm, second.lengthCm), 2);
  const askDifference = randInt(2) === 0;
  if (askDifference) {
    const diff = Math.abs(first.lengthCm - second.lengthCm); // whole (both X.5)
    const opts = [diff - 1, diff, diff + 1].filter((v) => v > 0);
    const options = opts.length === 3 ? opts : [diff, diff + 1, diff + 2];
    return {
      kind: "rulerMeasure",
      scene: "compare",
      precision: true,
      prompt: `How much longer is the ${longer.label}?`,
      speakText: `Use the measurements. How much longer is the ${longer.label} than the other object?`,
      badgeLabel: "How Much Longer?",
      rulerCm,
      compareObjects: shuffle([first, second]),
      compareMode: "longer",
      correctLabel: longer.label,
      differenceOptions: shuffle(options),
      correctDifference: diff,
      feedback: {
        correct: `Yes — ${longer.lengthCm} take away the other measurement leaves ${diff} cm.`,
        wrong: `Subtract the two measurements — the difference is ${diff} cm.`,
      },
    };
  }
  return {
    kind: "rulerMeasure",
    scene: "compare",
    precision: true,
    prompt: "Which object is longer?",
    speakText: "Use the measurements, not just the pictures. Which object is longer?",
    badgeLabel: "Which Is Longer?",
    rulerCm,
    compareObjects: shuffle([first, second]),
    compareMode: "longer",
    correctLabel: longer.label,
    feedback: {
      correct: `Yes — the ${longer.label} is longer at ${longer.lengthCm} cm.`,
      wrong: `Check the measurements — the ${longer.label} is ${longer.lengthCm} cm.`,
    },
  };
}

// Activity B — Order the Measurements (shortest → longest).
function buildOrderTask(): RulerTask {
  const objects = pickDistinct(3);
  return {
    kind: "rulerMeasure",
    scene: "order",
    precision: true,
    prompt: "Order the objects from shortest to longest.",
    speakText: "Use the measurements. Tap the objects from the shortest to the longest.",
    badgeLabel: "Order the Measurements",
    rulerCm: 20,
    orderObjects: shuffle(objects),
    feedback: {
      correct: "Good ordering — smallest measurement to largest!",
      wrong: "Use the numbers — start with the smallest measurement.",
    },
  };
}

// Activity C — Measurement Detective (one claim doesn't match its ruler).
function buildSpotWrongTask(): RulerTask {
  const objects = pickDistinct(3, 16.5);
  const wrongIndex = randInt(objects.length);
  const delta = [1, -1, 2][randInt(3)]!;
  const claimObjects = objects.map((o, i) => {
    if (i === wrongIndex) {
      let claim = o.lengthCm + delta;
      if (claim <= 0) claim = o.lengthCm + 1;
      return { label: o.label, icon: o.icon, lengthCm: o.lengthCm, claim, isWrong: true };
    }
    return { label: o.label, icon: o.icon, lengthCm: o.lengthCm, claim: o.lengthCm, isWrong: false };
  });
  const wrong = claimObjects[wrongIndex]!;
  return {
    kind: "rulerMeasure",
    scene: "spotWrong",
    precision: true,
    prompt: "One measurement is wrong. Which one?",
    speakText: "Professor Gauge measured these objects. One measurement doesn't match its ruler. Which one is wrong?",
    badgeLabel: "Measurement Detective",
    rulerCm: 18,
    claimObjects: shuffle(claimObjects),
    feedback: {
      correct: `Yes — the ${wrong.label} reads ${wrong.lengthCm} cm, not ${wrong.claim} cm.`,
      wrong: `Compare each claim to its ruler — the ${wrong.label} is really ${wrong.lengthCm} cm.`,
    },
  };
}

export function generateY4MeasurelandsWeek1Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "order") return buildOrderTask();
  if (activity === "spotWrong") return buildSpotWrongTask();
  return buildCompareTask();
}

export function resetY4MeasurelandsWeek1Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek1Lesson3QuizTasks(): PracticeTask[] {
  return [
    buildCompareTask(),
    buildOrderTask(),
    buildSpotWrongTask(),
    buildCompareTask(),
    buildSpotWrongTask(),
  ];
}
