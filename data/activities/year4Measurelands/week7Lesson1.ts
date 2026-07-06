import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { angleFigure, lineFigure, rayFigure, shuffle, choose, ANGLE_OBJECTS, type AngleType } from "@/data/activities/year4Measurelands/week7Common";

// ── Measurelands · Level 4 · Week 7 · Lesson 1 — "Meet Angles" (AC9M4M04) ──
// Recognise angles as measures of turn. Tap the angle, not the line.
//   A. find the angle (angle vs straight line vs single ray)
//   B. which shows a turn?
//   C. find the angle in a Measurelands object

type AngleTask = Extract<PracticeTask, { kind: "angleQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"find" | "turn" | "object"> = ["find", "turn", "object", "find", "turn", "object"];

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
    prompt: "An angle measures how much something turns.",
    speakText:
      "Professor Gauge says: angles measure how much something turns. Think of a door opening — as it swings, the angle grows. An angle is the opening between two lines, not the length of the lines.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's explore!", wrong: "Let's explore!" },
  };
}

// Activity A — Which one is an angle?
function buildFindTask(): AngleTask {
  const angle = { ...angleFigure(choose(["acute", "obtuse"] as AngleType[])) };
  const figs = shuffle([angle, lineFigure(), rayFigure()]);
  return {
    kind: "angleQuest",
    scene: "pickAngle",
    prompt: "Which one is an angle?",
    speakText: "An angle is a turn between two lines. Which one is an angle — not a straight line or a single ray?",
    badgeLabel: "Find the Angle",
    figures: figs,
    correctId: angle.id,
    feedback: { correct: "Yes — two lines meeting makes a turn: an angle.", wrong: "An angle needs two lines making a turn, not a single line." },
  };
}

// Activity B — Which shows a turn?
function buildTurnTask(): AngleTask {
  const angle = { ...angleFigure(choose(["acute", "obtuse", "reflex"] as AngleType[])) };
  const figs = shuffle([angle, lineFigure(), rayFigure()]);
  return {
    kind: "angleQuest",
    scene: "pickAngle",
    prompt: "Which picture shows a turn?",
    speakText: "An angle shows a turn. Which picture shows something turning?",
    badgeLabel: "Which Shows a Turn?",
    figures: figs,
    correctId: angle.id,
    feedback: { correct: "Yes — that shows a turn between two lines.", wrong: "A turn needs two lines opening apart." },
  };
}

// Activity C — Find the angle in a Measurelands object.
function buildObjectTask(): AngleTask {
  const obj = choose(ANGLE_OBJECTS.filter((o) => o.types.includes("acute") || o.types.includes("obtuse")));
  const type = choose(obj.types.filter((t) => t === "acute" || t === "obtuse")) ?? "acute";
  const angle = { ...angleFigure(type), emoji: obj.emoji };
  const distractLine = { ...lineFigure(), emoji: "📏" };
  const distractRay = { ...rayFigure(), emoji: "🚩" };
  const figs = shuffle([angle, distractLine, distractRay]);
  return {
    kind: "angleQuest",
    scene: "pickAngle",
    prompt: `Where is the angle in the ${obj.label}?`,
    speakText: `The ${obj.label} makes an angle. Which picture shows the angle?`,
    badgeLabel: "Find Angles Around Measurelands",
    figures: figs,
    correctId: angle.id,
    feedback: { correct: `Yes — the ${obj.label} opens into an angle.`, wrong: "Look for the turn between two lines." },
  };
}

export function generateY4MeasurelandsWeek7Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "turn") return buildTurnTask();
  if (activity === "object") return buildObjectTask();
  return buildFindTask();
}

export function resetY4MeasurelandsWeek7Lesson1TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek7Lesson1QuizTasks(): PracticeTask[] {
  return [buildFindTask(), buildTurnTask(), buildObjectTask(), buildFindTask(), buildTurnTask()];
}
