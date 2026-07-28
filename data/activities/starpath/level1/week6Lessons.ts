import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { routeBuildTask } from "./route-tasks";

// Level 1 · Week 6 — Build a Route. The genuine Year 1 step past Foundation:
// the child CREATES an ordered set of moves (an algorithm) to carry the rover
// to a goal, and records a route another explorer could follow.

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
      "You can make the route, not just follow it.",
      "Now you build the route. Choose moves in order that carry the rover to the goal, then run it to test."
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
      "Record a route another explorer could follow. Put the moves in order so it reaches the goal."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "record"),
      () => routeBuildTask(b++ + 1, ++target, "record"),
      () => routeBuildTask(c++ + 2, ++target, "record"),
    ],
  };
}

export function createRouteDesignerTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Route Designer",
      "Design a clear route to any goal.",
      "Design routes to different goals. Build the moves in order and run each one to check it works."
    ),
    activities: [
      () => routeBuildTask(a++ + 2, ++target, "build"),
      () => routeBuildTask(b++ + 3, ++target, "record"),
      () => routeBuildTask(c++ + 1, ++target, "build"),
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
  nextUpLabel: "Route Designer",
  createTaskSet: createDirectionsForAFriendTaskSet,
} satisfies StarpathLessonContent;

export const ROUTE_DESIGNER_CONTENT = {
  missionBrief:
    "Become a route designer. Build clear routes to different goals across the grid and run each one to prove it works.",
  successCriteria: ["design a route to any goal", "keep the moves in order", "test each route"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Route Designer", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "design-1", title: "Design a Route", description: "Design a route to a goal.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-2", title: "Design Round", description: "Design another route.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-3", title: "Design Master", description: "Design routes independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you design a route?",
    options: ["I planned the moves in order", "I ran it to check", "I reached the goal"],
  },
  practisedSkills: ["Design ordered routes", "Reach varied goals", "Test a design"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createRouteDesignerTaskSet,
} satisfies StarpathLessonContent;
