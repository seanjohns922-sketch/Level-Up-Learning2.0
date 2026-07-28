import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import {
  routeBuildTask,
  routeMissionTask,
} from "./route-tasks";

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

export function createMissionRoutesTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Mission Routes",
      "A route can reach a goal while following a mission rule.",
      "Plan a route to the goal. Check the mission rule before you run it. Your route may need to visit a checkpoint or avoid an asteroid."
    ),
    activities: [
      () => routeMissionTask(a++, ++target, "standard"),
      () => routeMissionTask(b++ + 1, ++target, "standard"),
      () => routeMissionTask(c++ + 2, ++target, "standard"),
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
      "A mission route must reach its goal and follow every rule.",
      "Plan a route that collects checkpoints, avoids blocked squares and reaches the goal. More than one route can work."
    ),
    activities: [
      () => routeMissionTask(a++, ++target, "wide"),
      () => routeMissionTask(b++ + 1, ++target, "wide"),
      () => routeMissionTask(c++ + 2, ++target, "wide"),
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
  nextUpLabel: "Mission Routes",
  createTaskSet: createBuildARouteTaskSet,
} satisfies StarpathLessonContent;

export const MISSION_ROUTES_CONTENT = {
  missionBrief:
    "Plan routes across a 4 by 4 mission grid. Reach the goal while visiting checkpoints or avoiding blocked asteroid squares.",
  successCriteria: ["check the mission rule", "plan a valid route", "reach the goal"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Mission Routes", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "mission-1", title: "Checkpoint Route", description: "Plan a route through a checkpoint.", taskKinds: ["starpathRouteBuild"] },
    { key: "mission-2", title: "Avoid the Asteroid", description: "Plan a route around blocked squares.", taskKinds: ["starpathRouteBuild"] },
    { key: "mission-3", title: "Mission Route", description: "Follow a mission rule independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you make your mission route work?",
    options: ["I checked the rule", "I planned around obstacles", "I made sure I reached the goal"],
  },
  practisedSkills: ["Plan with one constraint", "Avoid blocked locations", "Visit a checkpoint"],
  nextUpLabel: "Wide Grid Route Designer",
  createTaskSet: createMissionRoutesTaskSet,
} satisfies StarpathLessonContent;

export const ROUTE_DESIGNER_CONTENT = {
  missionBrief:
    "Take mission planning onto a wider 8 by 4 grid. Visit multiple checkpoints, avoid several asteroids and still reach the goal.",
  successCriteria: ["plan across the wider grid", "follow every mission rule", "reach the goal"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Wide Grid Route Designer", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "design-1", title: "Double Checkpoint", description: "Visit two checkpoints on a wide grid.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-2", title: "Asteroid Field", description: "Plan around several blocked squares.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-3", title: "Wide Grid Mission", description: "Satisfy every rule across an 8 by 4 grid.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you design a route?",
    options: ["I checked every rule", "I planned around obstacles", "I visited the checkpoint"],
  },
  practisedSkills: ["Plan longer routes", "Combine multiple constraints", "Navigate an 8 by 4 grid"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createRouteDesignerTaskSet,
} satisfies StarpathLessonContent;
