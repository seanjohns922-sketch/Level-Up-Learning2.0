import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { directionPathTask } from "@/data/activities/starpath/ground/directionTasks";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { belongsTask, reclassifyTask, ruleTask } from "./week2Lessons";
import { shapeHuntTask } from "./week3ShapeHunt";
import { scenesByDifficulty } from "./shape-hunt-scenes";
import { compareTask } from "./week4WorldObjects";
import { sayMoveTask } from "./week5Lessons";
import { routeDebugTask } from "./week6Lessons";
import { routeBuildTask } from "./week7Lessons";

// Level 1 · Week 8 — Pathfinder Challenge. Cumulative: shape classification and
// views serve as landmarks, then routes are planned, tested and repaired.
// Completion unlocks the Level 1 Post-Test. Each lesson mixes skills from the
// whole level so nothing feels like a repeat of a single week.

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

// L1 — Find the Shape Landmark: use shape reasoning to identify landmarks.
export function createFindLandmarkTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  const scenes = scenesByDifficulty("easy", "medium");
  return {
    teaching: teaching(
      "Find the Shape Landmark",
      "Shapes help you name landmarks.",
      "Landmarks on a route can be named by their shape. Use your shape skills to classify, compare and find them."
    ),
    activities: [
      () => belongsTask(a++, ++target),
      () => compareTask(b++ + 1, ++target, "sameDiff"),
      () => shapeHuntTask(scenes[c++ % scenes.length]!, ++target),
    ],
  };
}

// L2 — Plan Around Obstacles: build and repair valid pathways.
export function createPlanAroundObstaclesTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Plan Around Obstacles",
      "Plan a route, then check it works.",
      "Now plan a pathway to the goal. Build a route, test it, and fix any step that heads the wrong way."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "build"),
      () => routeDebugTask(b++ + 1, ++target),
      () => directionPathTask(c++ + 2, ++target, { steps: 4, object: "rover", trail: true }),
    ],
  };
}

// L3 — Explain Your Path: record routes and reason about moves and rules.
export function createExplainYourPathTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Explain Your Path",
      "Give clear directions and explain your choices.",
      "Finish your Pathfinder training: record a clear route, describe a move, and reason about shapes."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "record"),
      () => sayMoveTask(b++ + 1, ++target),
      () => (c % 2 === 0 ? ruleTask(c++, ++target) : reclassifyTask(c++, ++target)),
    ],
  };
}

export const FIND_LANDMARK_CONTENT = {
  missionBrief:
    "Begin Pathfinder graduation. Use everything you know about shapes and views to name the landmarks on the map.",
  successCriteria: ["classify a shape", "reason about a view", "identify a landmark"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Find the Shape Landmark", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "landmark-classify", title: "Landmark Family", description: "Classify a landmark shape.", taskKinds: ["starpathShapeClassify"] },
    { key: "landmark-view", title: "Landmark View", description: "Reason about a landmark's view.", taskKinds: ["starpathViewpoint"] },
    { key: "landmark-match", title: "Landmark Match", description: "Match a landmark to its picture.", taskKinds: ["starpathViewpoint"] },
  ],
  reflection: {
    prompt: "How did you name landmarks?",
    options: ["By their shape family", "By how they look", "By matching pictures"],
  },
  practisedSkills: ["Classify shapes", "Reason about views", "Identify landmarks"],
  nextUpLabel: "Plan Around Obstacles",
  createTaskSet: createFindLandmarkTaskSet,
} satisfies StarpathLessonContent;

export const PLAN_OBSTACLES_CONTENT = {
  missionBrief:
    "Plan the rover's pathway across the map. Build a route, repair a broken one, and follow a route to the goal.",
  successCriteria: ["build a valid route", "repair a broken route", "follow a route"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Plan Around Obstacles", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "plan-build", title: "Plan the Route", description: "Build a route to the goal.", taskKinds: ["starpathRouteBuild"] },
    { key: "plan-repair", title: "Repair the Route", description: "Fix a broken route.", taskKinds: ["starpathRouteDebug"] },
    { key: "plan-follow", title: "Run the Route", description: "Follow a route to the goal.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: {
    prompt: "What did planning a route need?",
    options: ["Moves in the right order", "Checking it reaches the goal", "Fixing wrong steps"],
  },
  practisedSkills: ["Plan a pathway", "Repair a route", "Follow a route"],
  nextUpLabel: "Explain Your Path",
  createTaskSet: createPlanAroundObstaclesTaskSet,
} satisfies StarpathLessonContent;

export const EXPLAIN_PATH_CONTENT = {
  missionBrief:
    "Complete Pathfinder graduation. Record a clear route, describe a move precisely, and reason about shapes.",
  successCriteria: ["give a clear route", "describe a move", "reason about shapes"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Explain Your Path", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "explain-route", title: "Give the Route", description: "Record a clear route.", taskKinds: ["starpathRouteBuild"] },
    { key: "explain-move", title: "Name the Move", description: "Describe a turn or move.", taskKinds: ["starpathTurnMove"] },
    { key: "explain-shape", title: "Shape Reasoning", description: "Reason about a shape rule.", taskKinds: ["starpathShapeClassify"] },
  ],
  reflection: {
    prompt: "You are a Starpath Pathfinder! What did you master?",
    options: ["Comparing and classifying shapes", "Giving and following directions", "Planning and explaining routes"],
  },
  practisedSkills: ["Communicate a route", "Describe movement", "Reason about shapes"],
  nextUpLabel: "Level 1 Post-Test",
  createTaskSet: createExplainYourPathTaskSet,
} satisfies StarpathLessonContent;
