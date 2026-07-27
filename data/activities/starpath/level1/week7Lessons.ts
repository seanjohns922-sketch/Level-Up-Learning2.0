import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";

// Level 1 · Week 7 — Give the Route. The flagship productive skill: the student
// composes an ordered sequence of moves that carries the traveller from start to
// goal. Self-grading — the built route must land exactly on the goal.

type Dir = "up" | "down" | "left" | "right";
const GOAL_OBJECTS = ["star", "crystal", "flag"] as const;

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

export function createBuildARouteTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Build a Route",
      "You can give directions, not just follow them.",
      "Now you make the route. Choose moves in order that carry the rover to the goal, then test it."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "build"),
      () => routeBuildTask(b++ + 1, ++target, "build"),
      () => routeBuildTask(c++ + 2, ++target, "build"),
    ],
  };
}

export function createDirectionsForAFriendTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Directions for a Friend",
      "Clear directions can be followed by someone else.",
      "Record a route another explorer could follow. Put the moves in the right order so it reaches the goal."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "record"),
      () => routeBuildTask(b++ + 1, ++target, "record"),
      () => routeBuildTask(c++ + 2, ++target, "record"),
    ],
  };
}

export function createTestAndImproveTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Test and Improve",
      "Run a route, then fix it until it works.",
      "A route was started for you. Add the moves it needs, run it, and improve it until the rover reaches the goal."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "improve"),
      () => routeBuildTask(b++ + 1, ++target, "improve"),
      () => routeBuildTask(c++ + 2, ++target, "improve"),
    ],
  };
}

export const BUILD_A_ROUTE_CONTENT = {
  missionBrief:
    "Time to give the orders. Choose moves in order to build a route that carries the rover to the goal, then run it.",
  successCriteria: ["choose moves in order", "reach the goal", "test the route"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Build a Route", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "build-1", title: "First Orders", description: "Build a route to the goal.", taskKinds: ["starpathRouteBuild"] },
    { key: "build-2", title: "Route Orders", description: "Build another route.", taskKinds: ["starpathRouteBuild"] },
    { key: "build-3", title: "Orders Master", description: "Build a route independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you build the route?",
    options: ["I chose moves in order", "I ran it to test", "I checked it reached the goal"],
  },
  practisedSkills: ["Compose an ordered route", "Test a route", "Reach a stated goal"],
  nextUpLabel: "Directions for a Friend",
  createTaskSet: createBuildARouteTaskSet,
} satisfies StarpathLessonContent;

export const DIRECTIONS_FOR_A_FRIEND_CONTENT = {
  missionBrief:
    "Another explorer will follow your directions. Record a route, in order, that gets the rover to the goal.",
  successCriteria: ["record moves in order", "make the route reach the goal", "keep it clear"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Directions for a Friend", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "record-1", title: "Write It Down", description: "Record a route for a friend.", taskKinds: ["starpathRouteBuild"] },
    { key: "record-2", title: "Route Note", description: "Record another route.", taskKinds: ["starpathRouteBuild"] },
    { key: "record-3", title: "Note Master", description: "Record a clear route independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "What makes directions clear?",
    options: ["The moves are in order", "They reach the goal", "Someone else could follow them"],
  },
  practisedSkills: ["Record an ordered route", "Communicate directions", "Reach a goal for another"],
  nextUpLabel: "Test and Improve",
  createTaskSet: createDirectionsForAFriendTaskSet,
} satisfies StarpathLessonContent;

export const TEST_AND_IMPROVE_CONTENT = {
  missionBrief:
    "A route was started for you but it is not finished. Add moves, run it, and improve it until the rover arrives.",
  successCriteria: ["run a route", "spot what is missing", "improve until it works"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Test and Improve", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "improve-1", title: "Finish the Route", description: "Complete a started route.", taskKinds: ["starpathRouteBuild"] },
    { key: "improve-2", title: "Fix and Run", description: "Improve another route.", taskKinds: ["starpathRouteBuild"] },
    { key: "improve-3", title: "Improve Master", description: "Finish and test independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you improve the route?",
    options: ["I ran it to see what happened", "I added the missing moves", "I kept fixing until it worked"],
  },
  practisedSkills: ["Test a route", "Diagnose a gap", "Revise until correct"],
  nextUpLabel: "Week 7 Voyage Quiz",
  createTaskSet: createTestAndImproveTaskSet,
} satisfies StarpathLessonContent;
