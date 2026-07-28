import type { PracticeTask } from "@/data/activities/year1/practice-task";

// Shared route task builders for the Level 1 direction weeks: Build a Route
// (create an ordered algorithm) and Test & Fix (debug and improve a route).

type Dir = "up" | "down" | "left" | "right";
const GOAL_OBJECTS = ["star", "crystal", "flag"] as const;

// ── Build a Route (compose an ordered sequence) ──────────────────────────────
type RouteCase = {
  start: { r: number; c: number };
  goal: { r: number; c: number };
  distance: number;
  preset?: Dir[];
};
const ROUTE_CASES: RouteCase[] = [
  { start: { r: 3, c: 0 }, goal: { r: 1, c: 2 }, distance: 4, preset: ["up"] },
  { start: { r: 3, c: 0 }, goal: { r: 3, c: 3 }, distance: 3, preset: ["right"] },
  { start: { r: 3, c: 0 }, goal: { r: 0, c: 1 }, distance: 4, preset: ["up"] },
  { start: { r: 3, c: 3 }, goal: { r: 1, c: 1 }, distance: 4, preset: ["up"] },
];

export function routeBuildTask(
  round: number,
  target: number,
  mode: "build" | "record" | "improve",
  object = "rover"
): PracticeTask {
  const routeCase = ROUTE_CASES[round % ROUTE_CASES.length]!;
  const goalObject = GOAL_OBJECTS[round % GOAL_OBJECTS.length]!;
  const prompt =
    mode === "record"
      ? `Record a route that takes the rover to the ${goalObject}.`
      : mode === "improve"
        ? `A route was started for you. Finish it so the rover reaches the ${goalObject}.`
        : `Build a route that takes the rover to the ${goalObject}.`;
  return {
    kind: "starpathRouteBuild",
    mode,
    prompt,
    speakText: `${prompt} Add moves in order, then press Run route to test it.`,
    target,
    cols: 4,
    rows: 4,
    object,
    start: routeCase.start,
    goal: { r: routeCase.goal.r, c: routeCase.goal.c, object: goalObject },
    palette: ["up", "down", "left", "right"],
    preset: mode === "improve" ? routeCase.preset : undefined,
    maxSteps: routeCase.distance,
    feedback: {
      correct: "Your route reaches the goal — a clear set of directions!",
      wrong: "The route did not land on the goal. Adjust your moves and run it again.",
    },
  };
}

// ── Test & Fix (find the broken step in a route) ─────────────────────────────
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
