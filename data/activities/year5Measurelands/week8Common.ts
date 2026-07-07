import type { PracticeTask } from "@/data/activities/year1/practice-task";
// Level 5 solve-task sources.
import { buildY5MeasurelandsWeek1Lesson1QuizTasks } from "@/data/activities/year5Measurelands/week1Lesson1";
import { buildY5MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year5Measurelands/week2Lesson1";
import { buildY5MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year5Measurelands/week2Lesson2";
import { buildY5MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year5Measurelands/week3Lesson3";
import { buildY5MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year5Measurelands/week4Lesson3";
import { buildY5MeasurelandsWeek5Lesson2QuizTasks } from "@/data/activities/year5Measurelands/week5Lesson2";
import { buildY5MeasurelandsWeek6Lesson2QuizTasks } from "@/data/activities/year5Measurelands/week6Lesson2";
import { buildY5MeasurelandsWeek6Lesson3QuizTasks } from "@/data/activities/year5Measurelands/week6Lesson3";
import { buildY5MeasurelandsWeek7Lesson1QuizTasks } from "@/data/activities/year5Measurelands/week7Lesson1";
import { buildY5MeasurelandsWeek7Lesson2QuizTasks } from "@/data/activities/year5Measurelands/week7Lesson2";
// Level 4 instruments for mass / capacity / temperature.
import { buildY4MeasurelandsWeek2Lesson1QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson1";
import { buildY4MeasurelandsWeek2Lesson2QuizTasks } from "@/data/activities/year4Measurelands/week2Lesson2";
import { buildY4MeasurelandsWeek3Lesson3QuizTasks } from "@/data/activities/year4Measurelands/week3Lesson3";
// The Week 5 "Measurement Choice" decision (area / perimeter / both).
import { BINARY, BOTH, decisionTask } from "@/data/activities/year5Measurelands/week5Common";

// ── Measurelands · Level 5 · Week 8 — shared helpers (Master Measurement Missions) ──
// The Level 5 capstone. NO new mechanics — every activity either poses a "which
// measurement / tool?" decision or pulls a render-safe solve task from an earlier
// Level 3-5 week. Students choose the mathematics, then solve.

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
/** Pull one fresh, render-safe task from an earlier week's quiz builder. */
export function pull(build: () => PracticeTask[]): PracticeTask {
  return choose(build());
}
export function pullFrom(builders: Array<() => PracticeTask[]>): PracticeTask {
  return pull(choose(builders));
}

// Strand sources.
export const UNITS = [buildY5MeasurelandsWeek1Lesson1QuizTasks];
export const PRECISION = [buildY5MeasurelandsWeek2Lesson1QuizTasks, buildY5MeasurelandsWeek2Lesson2QuizTasks];
export const PERIMETER = [buildY5MeasurelandsWeek3Lesson3QuizTasks];
export const AREA = [buildY5MeasurelandsWeek4Lesson3QuizTasks];
export const AREA_OR_PERIM = [buildY5MeasurelandsWeek5Lesson2QuizTasks];
export const TIME = [buildY5MeasurelandsWeek6Lesson2QuizTasks, buildY5MeasurelandsWeek6Lesson3QuizTasks];
export const ANGLE = [buildY5MeasurelandsWeek7Lesson1QuizTasks, buildY5MeasurelandsWeek7Lesson2QuizTasks];
export const MASS = [buildY4MeasurelandsWeek2Lesson1QuizTasks];
export const CAPACITY = [buildY4MeasurelandsWeek2Lesson2QuizTasks];
export const TEMPERATURE = [buildY4MeasurelandsWeek3Lesson3QuizTasks];

/** A "Measurement Choice" decision (area / perimeter / both). */
export function measurementDecision(): PracticeTask {
  return decisionTask(choose([...BOTH, ...BINARY]), true);
}

// ── Tool-choice decisions (which instrument for the job?) ─────────────────────
type ToolSpec = {
  prompt: string;
  object: { label: string; iconKey: string };
  tools: Array<{ id: string; label: string; iconKey: string }>;
  correctToolId: string;
  correct: string;
  wrong: string;
};

const PARK_TOOLS: ToolSpec[] = [
  {
    prompt: "You need to measure the long fence around the whole park. Which tool is best?",
    object: { label: "park fence", iconKey: "playground" },
    tools: [
      { id: "wheel", label: "Trundle wheel", iconKey: "wheel" },
      { id: "ruler", label: "Small ruler", iconKey: "m-length" },
      { id: "scales", label: "Kitchen scales", iconKey: "m-mass" },
    ],
    correctToolId: "wheel",
    correct: "Yes — a trundle wheel measures long distances outdoors.",
    wrong: "A small ruler would take forever — use the trundle wheel for big distances.",
  },
  {
    prompt: "You need to measure a play-equipment bolt precisely. Which tool is best?",
    object: { label: "bolt", iconKey: "book" },
    tools: [
      { id: "ruler", label: "Precision ruler", iconKey: "m-length" },
      { id: "wheel", label: "Trundle wheel", iconKey: "wheel" },
      { id: "jug", label: "Measuring jug", iconKey: "m-capacity" },
    ],
    correctToolId: "ruler",
    correct: "Yes — a precision ruler measures small lengths accurately.",
    wrong: "A trundle wheel is for big spaces — a bolt needs a precision ruler.",
  },
  {
    prompt: "You want to know how much soil the garden beds need. What should you measure?",
    object: { label: "garden soil", iconKey: "tree" },
    tools: [
      { id: "mass", label: "Mass (scales)", iconKey: "m-mass" },
      { id: "length", label: "Length (ruler)", iconKey: "m-length" },
      { id: "perimeter", label: "Perimeter", iconKey: "m-perimeter" },
    ],
    correctToolId: "mass",
    correct: "Yes — how heavy the soil is means mass, on scales.",
    wrong: "The clue is 'how much soil' by weight — that's mass.",
  },
  {
    prompt: "You want to know how much water the splash pad holds. What should you measure?",
    object: { label: "splash pad", iconKey: "oval" },
    tools: [
      { id: "capacity", label: "Capacity (jug)", iconKey: "m-capacity" },
      { id: "area", label: "Area", iconKey: "m-area" },
      { id: "mass", label: "Mass", iconKey: "m-mass" },
    ],
    correctToolId: "capacity",
    correct: "Yes — how much water it holds is capacity.",
    wrong: "The clue is 'how much water' — that's capacity, with a jug.",
  },
];

export function toolDecision(): ToolTask {
  const spec = choose(PARK_TOOLS);
  return {
    kind: "toolChoice",
    scene: "best",
    prompt: spec.prompt,
    speakText: spec.prompt,
    badgeLabel: "Choose the Right Tool",
    object: spec.object,
    tools: shuffle(spec.tools),
    correctToolId: spec.correctToolId,
    feedback: { correct: spec.correct, wrong: spec.wrong },
  };
}

/** A mission-briefing intro (Professor Gauge briefs, Meazurex badge). */
export function briefingIntro(prompt: string, lines: string[], speak: string): ToolTask {
  return {
    kind: "toolChoice",
    scene: "intro",
    prompt,
    speakText: speak,
    badgeLabel: "Meazurex Mission",
    introLines: lines,
    introTools: [
      { id: "length", label: "Length", focus: "How long?", iconKey: "m-length" },
      { id: "perimeter", label: "Perimeter", focus: "Around the edge", iconKey: "m-perimeter" },
      { id: "area", label: "Area", focus: "Space covered", iconKey: "m-area" },
      { id: "capacity", label: "Capacity", focus: "How much fits?", iconKey: "m-capacity" },
      { id: "time", label: "Time", focus: "When & how long", iconKey: "m-time" },
    ],
    feedback: { correct: "Let's build!", wrong: "First decide what to measure." },
  };
}
