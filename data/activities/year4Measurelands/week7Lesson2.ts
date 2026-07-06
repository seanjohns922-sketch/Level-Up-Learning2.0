import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { angleFigure, turnForType, typeOf, ANGLE_TYPES, shuffle, choose, randRange, type AngleType } from "@/data/activities/year4Measurelands/week7Common";

// ── Measurelands · Level 4 · Week 7 · Lesson 2 — "Compare Angles" (AC9M4M04) ──
// Compare angles to a right angle; order by size; name the angle. Visual only.
//   A. compareRight — smaller / right / larger than a right angle
//   B. order        — smallest to largest turn
//   C. classify     — name the angle

type AngleTask = Extract<PracticeTask, { kind: "angleQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"compare" | "order" | "classify"> = ["compare", "order", "classify", "compare", "order", "classify"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): AngleTask {
  return {
    kind: "angleQuest",
    scene: "intro",
    prompt: "A right angle is our measuring friend.",
    speakText:
      "Professor Gauge says: a right angle is our measuring friend. We compare every angle to it. Some angles are smaller than a right angle, some are exactly a right angle, and some are larger. Tap to show the right-angle marker whenever you need it.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's compare!", wrong: "Let's compare!" },
  };
}

// Activity A — Smaller, Right, or Larger?
function buildCompareTask(): AngleTask {
  const type = choose(["acute", "acute", "right", "obtuse", "obtuse", "straight", "reflex"] as AngleType[]);
  const fig = angleFigure(type);
  const correct: "smaller" | "equal" | "larger" = type === "acute" ? "smaller" : type === "right" ? "equal" : "larger";
  return {
    kind: "angleQuest",
    scene: "compareRight",
    prompt: "Is this angle smaller than, the same as, or larger than a right angle?",
    speakText: "Compare this angle to a right angle. Is it smaller, exactly a right angle, or larger? Tap to show the right-angle marker.",
    badgeLabel: "Smaller, Equal or Larger?",
    angle: { turn: fig.turn!, rot: fig.rot, arm1: fig.arm1, arm2: fig.arm2 },
    correctCompare: correct,
    feedback: {
      correct: correct === "smaller" ? "Yes — smaller than a right angle." : correct === "equal" ? "Yes — exactly a right angle." : "Yes — larger than a right angle.",
      wrong: "Line it up with the right-angle marker and look at the opening.",
    },
  };
}

// Activity B — Order the Angles.
function buildOrderTask(): AngleTask {
  const types = shuffle(["acute", "right", "obtuse", "straight", "reflex"] as AngleType[]).slice(0, 3);
  const figs = types.map((t) => angleFigure(t));
  // ensure distinct turns
  return {
    kind: "angleQuest",
    scene: "order",
    prompt: "Order the angles from the smallest turn to the largest.",
    speakText: "Look at how much each angle turns. Tap them from the smallest turn to the largest.",
    badgeLabel: "Order the Angles",
    figures: shuffle(figs),
    feedback: { correct: "Good ordering — smallest turn to largest!", wrong: "Compare the openings — start with the smallest turn." },
  };
}

// Activity C — Name the Angle.
function buildClassifyTask(): AngleTask {
  const type = choose(ANGLE_TYPES);
  const turn = turnForType(type);
  const correct = typeOf(turn);
  const distractors = shuffle(ANGLE_TYPES.filter((t) => t !== correct)).slice(0, 3);
  return {
    kind: "angleQuest",
    scene: "classify",
    prompt: "What type of angle is this?",
    speakText: "What type of angle is this?",
    badgeLabel: "Which Matches?",
    angle: { turn, rot: randRange(0, type === "straight" ? 8 : 20) },
    options: shuffle([correct, ...distractors]),
    correctOption: correct,
    feedback: { correct: `Yes — that's ${correct === "acute" || correct === "obtuse" ? "an" : "a"} ${correct} angle.`, wrong: `Compare it to a right angle — it's ${correct}.` },
  };
}

export function generateY4MeasurelandsWeek7Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "order") return buildOrderTask();
  if (activity === "classify") return buildClassifyTask();
  return buildCompareTask();
}

export function resetY4MeasurelandsWeek7Lesson2TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek7Lesson2QuizTasks(): PracticeTask[] {
  return [buildCompareTask(), buildOrderTask(), buildClassifyTask(), buildCompareTask(), buildClassifyTask()];
}
