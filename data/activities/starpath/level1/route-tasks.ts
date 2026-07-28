import type { PracticeTask } from "@/data/activities/year1/practice-task";

// Shared route task builders for the Level 1 direction weeks: Build a Route
// (create an ordered algorithm) and Test & Fix (debug and improve a route).

type Dir = "up" | "down" | "left" | "right";
const GOAL_OBJECTS = ["star", "crystal", "flag"] as const;

// ── Build a Route (compose an ordered sequence) ──────────────────────────────
type RouteCase = {
  start: { r: number; c: number };
  goal: { r: number; c: number };
  preset?: Dir[];
};
const ROUTE_CASES: RouteCase[] = [
  { start: { r: 3, c: 0 }, goal: { r: 1, c: 2 }, preset: ["up"] },
  { start: { r: 3, c: 0 }, goal: { r: 3, c: 3 }, preset: ["right"] },
  { start: { r: 3, c: 0 }, goal: { r: 0, c: 1 }, preset: ["up"] },
  { start: { r: 3, c: 3 }, goal: { r: 1, c: 1 }, preset: ["up"] },
];

const RECORD_CASES: Array<{
  start: { r: number; c: number };
  route: Dir[];
}> = [
  { start: { r: 3, c: 0 }, route: ["up", "right", "up", "right"] },
  { start: { r: 3, c: 0 }, route: ["right", "right", "up", "right"] },
  { start: { r: 3, c: 3 }, route: ["up", "left", "left", "up"] },
  { start: { r: 2, c: 0 }, route: ["up", "right", "right", "down"] },
  { start: { r: 3, c: 1 }, route: ["right", "up", "up", "right"] },
  { start: { r: 1, c: 3 }, route: ["left", "down", "left", "down"] },
];

const MISSION_CASES: Array<{
  start: { r: number; c: number };
  goal: { r: number; c: number };
  blocked: Array<{ r: number; c: number }>;
  checkpoints: Array<{ r: number; c: number; object: string }>;
  rule: string;
}> = [
  {
    start: { r: 3, c: 0 },
    goal: { r: 0, c: 3 },
    blocked: [],
    checkpoints: [{ r: 2, c: 1, object: "crystal" }],
    rule: "Collect the crystal before reaching the goal.",
  },
  {
    start: { r: 3, c: 0 },
    goal: { r: 0, c: 3 },
    blocked: [{ r: 2, c: 0 }, { r: 1, c: 2 }],
    checkpoints: [],
    rule: "Avoid every asteroid square.",
  },
  {
    start: { r: 3, c: 3 },
    goal: { r: 0, c: 0 },
    blocked: [{ r: 1, c: 1 }],
    checkpoints: [{ r: 2, c: 2, object: "crystal" }],
    rule: "Collect the crystal and avoid the asteroid.",
  },
  {
    start: { r: 3, c: 1 },
    goal: { r: 0, c: 2 },
    blocked: [{ r: 2, c: 2 }],
    checkpoints: [{ r: 1, c: 1, object: "satellite" }],
    rule: "Visit the satellite and avoid the asteroid.",
  },
];

function endpoint(start: { r: number; c: number }, route: Dir[]) {
  return route.reduce(
    (cell, direction) => {
      const delta = {
        up: { dr: -1, dc: 0 },
        down: { dr: 1, dc: 0 },
        left: { dr: 0, dc: -1 },
        right: { dr: 0, dc: 1 },
      }[direction];
      return { r: cell.r + delta.dr, c: cell.c + delta.dc };
    },
    start
  );
}

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
    speakText: `${prompt} Any route that stays on the grid and reaches the goal will work. Add moves in order, then press Run route to test it.`,
    target,
    cols: 4,
    rows: 4,
    object,
    start: routeCase.start,
    goal: { r: routeCase.goal.r, c: routeCase.goal.c, object: goalObject },
    palette: ["up", "down", "left", "right"],
    preset: mode === "improve" ? routeCase.preset : undefined,
    // A 4×4 board has 16 cells. This permits every simple path across the
    // board, plus sensible detours, instead of enforcing the shortest route.
    maxSteps: 16,
    feedback: {
      correct: "Your route reaches the goal — one of many routes that can work!",
      wrong: "The route must stay on the grid and finish on the goal. Adjust your moves and run it again.",
    },
  };
}

export function routeRecordTask(round: number, target: number): PracticeTask {
  const routeCase = RECORD_CASES[round % RECORD_CASES.length]!;
  const goalObject = GOAL_OBJECTS[round % GOAL_OBJECTS.length]!;
  const goal = endpoint(routeCase.start, routeCase.route);
  return {
    kind: "starpathRouteRecord",
    prompt: `Record the glowing route so a friend can reach the ${goalObject}.`,
    speakText:
      "Read the numbered trail from the rover to the goal. Add the matching directions in the same order, then send them to your friend.",
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: routeCase.start,
    goal: { ...goal, object: goalObject },
    route: routeCase.route,
    feedback: {
      correct: "Your directions match the trail. Your friend reached the goal!",
      wrong: "Read the numbered trail from the start and check each direction in order.",
    },
  };
}

export function routeMissionTask(round: number, target: number): PracticeTask {
  const mission = MISSION_CASES[round % MISSION_CASES.length]!;
  const goalObject = GOAL_OBJECTS[(round + 1) % GOAL_OBJECTS.length]!;
  return {
    kind: "starpathRouteBuild",
    mode: "mission",
    prompt: `Plan a mission route to the ${goalObject}.`,
    speakText: `${mission.rule} Any route that follows the mission rule and reaches the goal will work.`,
    target,
    cols: 4,
    rows: 4,
    object: "rover",
    start: mission.start,
    goal: { ...mission.goal, object: goalObject },
    palette: ["up", "down", "left", "right"],
    blocked: mission.blocked,
    checkpoints: mission.checkpoints,
    missionRule: mission.rule,
    maxSteps: 16,
    feedback: {
      correct: "Mission complete. Your planned route followed every rule!",
      wrong: "Check the mission rule, stay on the grid and finish on the goal.",
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
