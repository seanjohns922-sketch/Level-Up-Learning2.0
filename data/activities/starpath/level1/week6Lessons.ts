import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { directionPathTask } from "@/data/activities/starpath/ground/directionTasks";
import { LEVEL_ONE_ARTWORK } from "./shared";

// Level 1 · Week 6 — Follow the Route. Students follow multi-step directions
// from a stated start, then diagnose and repair a broken route. Following
// reuses the shared path engine; the route debugger is a Level 1 mechanic.

type Dir = "up" | "down" | "left" | "right";
const GOAL_OBJECTS = ["star", "crystal", "flag"] as const;

type DebugCase = {
  goal: { r: number; c: number };
  steps: Dir[];
  corruptIndex: number;
  corruptDir: Dir;
  start: { r: number; c: number };
};
const DEBUG_CASES: DebugCase[] = [
  { start: { r: 3, c: 0 }, goal: { r: 1, c: 2 }, steps: ["up", "right", "up", "right"], corruptIndex: 2, corruptDir: "down" },
  { start: { r: 3, c: 0 }, goal: { r: 0, c: 1 }, steps: ["up", "up", "right", "up"], corruptIndex: 1, corruptDir: "right" },
  { start: { r: 3, c: 3 }, goal: { r: 1, c: 1 }, steps: ["up", "left", "up", "left"], corruptIndex: 2, corruptDir: "down" },
];

// L3 — Find the Error: one step is wrong; tap it.
export function routeDebugTask(round: number, target: number, object = "rover"): PracticeTask {
  const debugCase = DEBUG_CASES[round % DEBUG_CASES.length]!;
  const goalObject = GOAL_OBJECTS[round % GOAL_OBJECTS.length]!;
  const steps = debugCase.steps.map((direction, index) => ({
    id: `step-${target}-${index}`,
    direction: index === debugCase.corruptIndex ? debugCase.corruptDir : direction,
  }));
  return {
    kind: "starpathRouteDebug",
    prompt: `This route should reach the ${goalObject}, but one step is wrong. Which step?`,
    speakText: `Follow the steps in your head from the rover. One step goes the wrong way. Tap the step that breaks the route.`,
    target,
    cols: 4,
    rows: 4,
    object,
    start: debugCase.start,
    goal: { r: debugCase.goal.r, c: debugCase.goal.c, object: goalObject },
    steps,
    wrongStepId: `step-${target}-${debugCase.corruptIndex}`,
    feedback: {
      correct: "You found the broken step. Swap it and the route works.",
      wrong: "Follow each step from the start. Find the one that heads the wrong way.",
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createStartHereTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Start Here",
      "Every route needs a starting point.",
      "A route only works if you know where to start. Follow each clue in order from the start."
    ),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 3, object: "rover" }),
      () => directionPathTask(b++ + 1, ++target, { steps: 3, object: "rover" }),
      () => directionPathTask(c++ + 2, ++target, { steps: 4, object: "rover" }),
    ],
  };
}

export function createMissionRouteTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Mission Route",
      "Follow the steps in order to reach the goal.",
      "A route is a list of steps in order. Follow them one at a time to reach the destination."
    ),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 4, object: "rover", trail: true }),
      () => directionPathTask(b++ + 1, ++target, { steps: 4, object: "rover", trail: true, collect: true }),
      () => directionPathTask(c++ + 2, ++target, { steps: 5, object: "rover", trail: true, collect: true }),
    ],
  };
}

export function createFindTheErrorTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Find the Error",
      "A route can have a wrong step. Find and fix it.",
      "Sometimes a route has one wrong step. Follow it in your head and find the step that heads the wrong way."
    ),
    activities: [
      () => routeDebugTask(a++, ++target),
      () => routeDebugTask(b++ + 1, ++target),
      () => routeDebugTask(c++ + 2, ++target),
    ],
  };
}

export const START_HERE_CONTENT = {
  missionBrief:
    "Take the rover's controls. Follow each clue in order from the marked start to reach the goal.",
  successCriteria: ["find the start", "follow clues in order", "reach the destination"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Start Here", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "follow-1", title: "First Route", description: "Follow a short route from the start.", taskKinds: ["starpathDirectionPath"] },
    { key: "follow-2", title: "Route Check", description: "Follow another route in order.", taskKinds: ["starpathDirectionPath"] },
    { key: "follow-3", title: "Route Master", description: "Follow a longer route.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: {
    prompt: "What does a route need?",
    options: ["A starting point", "Steps in order", "A destination"],
  },
  practisedSkills: ["Identify a start", "Follow ordered steps", "Reach a destination"],
  nextUpLabel: "Mission Route",
  createTaskSet: createStartHereTaskSet,
} satisfies StarpathLessonContent;

export const MISSION_ROUTE_CONTENT = {
  missionBrief:
    "Run Geospin's supply routes. Follow the full sequence of steps to guide the rover home, collecting stars on the way.",
  successCriteria: ["follow every step", "keep the order", "reach the goal"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Mission Route", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "mission-1", title: "Supply Run", description: "Follow a full route with a trail.", taskKinds: ["starpathDirectionPath"] },
    { key: "mission-2", title: "Star Run", description: "Follow a route and collect stars.", taskKinds: ["starpathDirectionPath"] },
    { key: "mission-3", title: "Long Haul", description: "Follow a longer supply route.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: {
    prompt: "How did you complete the route?",
    options: ["I followed every step", "I kept them in order", "I checked I reached the goal"],
  },
  practisedSkills: ["Follow multi-step routes", "Keep step order", "Track a destination"],
  nextUpLabel: "Find the Error",
  createTaskSet: createMissionRouteTaskSet,
} satisfies StarpathLessonContent;

export const FIND_THE_ERROR_CONTENT = {
  missionBrief:
    "A route in the flight log is broken. Follow it in your head and find the one step that heads the wrong way.",
  successCriteria: ["follow a route mentally", "spot the wrong step", "explain the fix"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Find the Error", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "debug-1", title: "Broken Route", description: "Find the wrong step in a route.", taskKinds: ["starpathRouteDebug"] },
    { key: "debug-2", title: "Log Repair", description: "Diagnose another broken route.", taskKinds: ["starpathRouteDebug"] },
    { key: "debug-3", title: "Repair Master", description: "Find the error independently.", taskKinds: ["starpathRouteDebug"] },
  ],
  reflection: {
    prompt: "How did you find the wrong step?",
    options: ["I followed each step from the start", "I found the step going the wrong way", "I checked the goal"],
  },
  practisedSkills: ["Trace a route mentally", "Diagnose a wrong step", "Reason about repairs"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createFindTheErrorTaskSet,
} satisfies StarpathLessonContent;
