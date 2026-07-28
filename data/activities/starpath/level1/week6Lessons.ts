import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import {
  routeBuildTask,
  routeMissionTask,
  routeRecordTask,
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

export function createDirectionsForAFriendTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Directions for a Friend",
      "A planned path can be communicated as ordered directions.",
      "Read a route from its start. Record each move in order so another explorer can follow the same path."
    ),
    activities: [
      () => routeRecordTask(a++, ++target),
      () => routeRecordTask(b++ + 1, ++target),
      () => routeRecordTask(c++ + 2, ++target),
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
      () => routeMissionTask(a++, ++target),
      () => routeMissionTask(b++ + 1, ++target),
      () => routeMissionTask(c++ + 2, ++target),
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
    "A glowing trail is already planned. Translate it into ordered directions and send them to another explorer.",
  successCriteria: ["start at the rover", "read each trail step", "record directions in order"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Directions for a Friend", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "record-1", title: "Read the Trail", description: "Translate a glowing trail into directions.", taskKinds: ["starpathRouteRecord"] },
    { key: "record-2", title: "Send the Route", description: "Record ordered moves for a friend.", taskKinds: ["starpathRouteRecord"] },
    { key: "record-3", title: "Mission Message", description: "Communicate a complete route independently.", taskKinds: ["starpathRouteRecord"] },
  ],
  reflection: {
    prompt: "What makes directions clear?",
    options: ["They begin at the start", "The moves are in order", "They match the pathway"],
  },
  practisedSkills: ["Translate a visual route", "Record ordered directions", "Communicate a pathway"],
  nextUpLabel: "Route Designer",
  createTaskSet: createDirectionsForAFriendTaskSet,
} satisfies StarpathLessonContent;

export const ROUTE_DESIGNER_CONTENT = {
  missionBrief:
    "Plan Starpath missions with checkpoints and blocked squares. Any route works if it follows every rule and reaches the goal.",
  successCriteria: ["follow the mission rule", "avoid blocked squares", "reach the goal"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Route Designer", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "design-1", title: "Checkpoint Mission", description: "Plan a route through a checkpoint.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-2", title: "Asteroid Avoidance", description: "Plan around blocked squares.", taskKinds: ["starpathRouteBuild"] },
    { key: "design-3", title: "Mission Planner", description: "Satisfy several route rules.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you design a route?",
    options: ["I checked every rule", "I planned around obstacles", "I visited the checkpoint"],
  },
  practisedSkills: ["Plan with constraints", "Avoid blocked locations", "Visit required checkpoints"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createRouteDesignerTaskSet,
} satisfies StarpathLessonContent;
