import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { UNIT_PAIRS, CONVERT_MCQ, CONVERT_BUILD, shuffle, choose } from "@/data/activities/year4Measurelands/week6Common";

// ── Measurelands · Level 4 · Week 6 · Lesson 1 — "Convert Time" (AC9M4M03) ──
// Convert between common units of time. Friendly numbers, no drills.
//   A. matchUnits    — connect equivalent units.
//   B. convert       — which conversion is correct? (MCQ)
//   C. convertBuild  — set the number to complete a conversion.

type TimeTask = Extract<PracticeTask, { kind: "timeQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"matchUnits" | "convert" | "convertBuild"> = ["matchUnits", "convert", "convertBuild", "matchUnits", "convert", "convertBuild"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): TimeTask {
  return {
    kind: "timeQuest",
    scene: "intro",
    prompt: "Time is connected.",
    speakText:
      "Professor Gauge says: time is connected. Small units combine to make bigger ones. Sixty seconds make one minute, sixty minutes make one hour, twenty four hours make one day, and seven days make one week.",
    badgeLabel: "Meazurex Mission",
    feedback: { correct: "Let's convert!", wrong: "Let's convert!" },
  };
}

// Activity A — Match the Time Units.
function buildMatchTask(): TimeTask {
  const pairs = shuffle(UNIT_PAIRS).slice(0, 4);
  return {
    kind: "timeQuest",
    scene: "matchUnits",
    prompt: "Match the equal time units.",
    speakText: "Tap a small unit, then tap the bigger unit that equals it.",
    badgeLabel: "Match the Time Units",
    unitPairs: pairs,
    feedback: { correct: "All matched — those units are equal!", wrong: "Not equal — try another match." },
  };
}

// Activity B — Which Conversion Is Correct?
function buildConvertTask(): TimeTask {
  const q = choose(CONVERT_MCQ);
  return {
    kind: "timeQuest",
    scene: "convert",
    prompt: q.prompt,
    speakText: `${q.prompt} Which conversion is correct?`,
    badgeLabel: "Which Conversion Is Correct?",
    options: shuffle([q.correct, ...shuffle(q.distractors).slice(0, 2)]),
    correctOption: q.correct,
    feedback: { correct: `Yes — ${q.prompt.replace(" = ?", "")} = ${q.correct}.`, wrong: `Remember the time units — it's ${q.correct}.` },
  };
}

// Activity C — Time Builder (set the number).
function buildBuildTask(): TimeTask {
  const q = choose(CONVERT_BUILD);
  return {
    kind: "timeQuest",
    scene: "convertBuild",
    prompt: q.prompt,
    speakText: `${q.prompt} Set the number.`,
    badgeLabel: "Time Builder",
    answerNumber: q.ans,
    answerUnitWord: q.unit,
    stepUnit: q.step,
    stepMax: q.max,
    feedback: { correct: `Yes — ${q.prompt.replace(" = ? ", " = ").replace(q.unit, `${q.ans} ${q.unit}`)}.`, wrong: `Count the units carefully — it's ${q.ans} ${q.unit}.` },
  };
}

export function generateY4MeasurelandsWeek6Lesson1Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "convert") return buildConvertTask();
  if (activity === "convertBuild") return buildBuildTask();
  return buildMatchTask();
}

export function resetY4MeasurelandsWeek6Lesson1TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek6Lesson1QuizTasks(): PracticeTask[] {
  return [buildConvertTask(), buildBuildTask(), buildConvertTask(), buildBuildTask(), buildConvertTask()];
}
