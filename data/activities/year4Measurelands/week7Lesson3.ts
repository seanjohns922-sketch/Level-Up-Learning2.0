import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { angleFigure, turnForType, typeOf, pickObjectForType, ANGLE_TYPES, shuffle, choose, randInt, randRange, type AngleType } from "@/data/activities/year4Measurelands/week7Common";

// ── Measurelands · Level 4 · Week 7 · Lesson 3 — "Angle Explorer" (AC9M4M04) ──
// Apply angle knowledge: find right angles, classify angles in real objects, and
// a mixed explorer challenge. No degrees.
//   A. findRight — tap the right angle.
//   B. hunt      — name the angle in a real object.
//   C. challenge — mixed compare / classify / order.

type AngleTask = Extract<PracticeTask, { kind: "angleQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"findRight" | "hunt" | "challenge"> = ["findRight", "hunt", "challenge", "findRight", "hunt", "challenge"];

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
    prompt: "Angles are everywhere.",
    speakText:
      "Professor Gauge says: angles are everywhere — in scissors, clock hands, road signs, books, doors and windmills. This week you'll spot them and name them all around Measurelands.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's hunt!", wrong: "Let's hunt!" },
  };
}

// Activity A — Find the Right Angle.
function buildFindRightTask(): AngleTask {
  const right = angleFigure("right");
  const others = shuffle(["acute", "obtuse", "acute", "obtuse"] as AngleType[]).slice(0, 2).map((t) => angleFigure(t));
  const figs = shuffle([right, ...others]);
  return {
    kind: "angleQuest",
    scene: "pickAngle",
    prompt: "Which one is a right angle?",
    speakText: "A right angle is a square corner — a quarter turn. Which one is a right angle?",
    badgeLabel: "Find the Right Angle",
    figures: figs,
    correctId: right.id,
    feedback: { correct: "Yes — a square-corner right angle.", wrong: "A right angle makes a square corner." },
  };
}

// Activity B — Real-World Angle Hunt (classify in an object).
function buildHuntTask(): AngleTask {
  const type = choose(["acute", "right", "obtuse", "straight"] as AngleType[]);
  const turn = turnForType(type);
  const correct = typeOf(turn);
  const obj = pickObjectForType(correct);
  const distractors = shuffle(ANGLE_TYPES.filter((t) => t !== correct)).slice(0, 3);
  return {
    kind: "angleQuest",
    scene: "classify",
    prompt: `What type of angle does the ${obj.label} make?`,
    speakText: `Look at the angle in the ${obj.label}. What type of angle is it?`,
    badgeLabel: "Real-World Angle Hunt",
    angle: { turn, rot: randRange(0, correct === "straight" ? 8 : 18) },
    context: obj,
    options: shuffle([correct, ...distractors]),
    correctOption: correct,
    feedback: { correct: `Yes — the ${obj.label} makes ${correct === "acute" || correct === "obtuse" ? "an" : "a"} ${correct} angle.`, wrong: `Compare it to a right angle — it's ${correct}.` },
  };
}

// Activity C — Explorer Challenge (mixed).
function buildCompareChallenge(): AngleTask {
  const type = choose(["acute", "right", "obtuse", "straight", "reflex"] as AngleType[]);
  const fig = angleFigure(type);
  const correct: "smaller" | "equal" | "larger" = type === "acute" ? "smaller" : type === "right" ? "equal" : "larger";
  return {
    kind: "angleQuest",
    scene: "compareRight",
    prompt: "Compare this angle to a right angle.",
    speakText: "Is this angle smaller than, the same as, or larger than a right angle?",
    badgeLabel: "Explorer Challenge",
    angle: { turn: fig.turn!, rot: fig.rot, arm1: fig.arm1, arm2: fig.arm2 },
    correctCompare: correct,
    feedback: { correct: "Right — you compared it to a right angle.", wrong: "Show the right-angle marker and compare the openings." },
  };
}

function buildOrderChallenge(): AngleTask {
  const types = shuffle(["acute", "right", "obtuse", "reflex"] as AngleType[]).slice(0, 3);
  return {
    kind: "angleQuest",
    scene: "order",
    prompt: "Order these angles from smallest to largest turn.",
    speakText: "Order the angles from the smallest turn to the largest.",
    badgeLabel: "Explorer Challenge",
    figures: shuffle(types.map((t) => angleFigure(t))),
    feedback: { correct: "Nice — smallest turn to largest!", wrong: "Compare the openings and start with the smallest." },
  };
}

function buildChallengeTask(): AngleTask {
  const pick = randInt(3);
  if (pick === 0) return buildCompareChallenge();
  if (pick === 1) return buildOrderChallenge();
  return buildHuntTask();
}

export function generateY4MeasurelandsWeek7Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "hunt") return buildHuntTask();
  if (activity === "challenge") return buildChallengeTask();
  return buildFindRightTask();
}

export function resetY4MeasurelandsWeek7Lesson3TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek7Lesson3QuizTasks(): PracticeTask[] {
  return [buildFindRightTask(), buildHuntTask(), buildCompareChallenge(), buildFindRightTask(), buildHuntTask()];
}
