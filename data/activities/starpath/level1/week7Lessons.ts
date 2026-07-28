import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { routeBuildTask, routeDebugTask } from "./route-tasks";

// Level 1 · Week 7 — Test & Fix. Run a route, find the step that breaks it, and
// improve a started route until it reaches the goal. The debugging/repair skill
// that Foundation never covered.

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

export function createFindTheErrorTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Find the Error",
      "A route can have a wrong step. Find it.",
      "Sometimes a route has one wrong step. Follow it in your head and find the step that heads the wrong way."
    ),
    activities: [
      () => routeDebugTask(a++, ++target),
      () => routeDebugTask(b++ + 1, ++target),
      () => routeDebugTask(c++ + 2, ++target),
    ],
  };
}

export function createFixTheRouteTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Fix the Route",
      "Finish a route that was started for you.",
      "A route was started but it is not finished. Add the moves it needs and run it to reach the goal."
    ),
    activities: [
      () => routeBuildTask(a++, ++target, "improve", "rover", "wide"),
      () => routeBuildTask(b++ + 1, ++target, "improve", "rover", "wide"),
      () => routeBuildTask(c++ + 2, ++target, "improve", "rover", "wide"),
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
      "Find broken steps and finish started routes. Run each one and improve it until the rover reaches the goal."
    ),
    activities: [
      () => routeDebugTask(a++ + 1, ++target, "rover", "wide"),
      () => routeBuildTask(b++ + 3, ++target, "improve", "rover", "wide"),
      () => routeDebugTask(c++ + 2, ++target, "rover", "wide"),
    ],
  };
}

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
  nextUpLabel: "Fix the Route",
  createTaskSet: createFindTheErrorTaskSet,
} satisfies StarpathLessonContent;

export const FIX_THE_ROUTE_CONTENT = {
  missionBrief:
    "A route across a wide 8 by 4 grid was started for you but is not finished. Add the moves it needs and run it until the rover arrives.",
  successCriteria: ["see what is missing", "add the moves", "run it to the goal"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Fix the Route", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "fix-1", title: "Finish the Route", description: "Complete a started route.", taskKinds: ["starpathRouteBuild"] },
    { key: "fix-2", title: "Fill the Gap", description: "Add the missing moves.", taskKinds: ["starpathRouteBuild"] },
    { key: "fix-3", title: "Fix Master", description: "Finish routes independently.", taskKinds: ["starpathRouteBuild"] },
  ],
  reflection: {
    prompt: "How did you fix the route?",
    options: ["I saw what was missing", "I added the moves", "I ran it to the goal"],
  },
  practisedSkills: ["Complete a started route", "Diagnose a gap", "Reach the goal"],
  nextUpLabel: "Test and Improve",
  createTaskSet: createFixTheRouteTaskSet,
} satisfies StarpathLessonContent;

export const TEST_AND_IMPROVE_CONTENT = {
  missionBrief:
    "Test routes across a wide 8 by 4 grid: find broken steps, finish started routes, and run each one until the rover arrives.",
  successCriteria: ["test a route", "find or fix the problem", "improve until it works"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Test and Improve", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "improve-1", title: "Test the Route", description: "Find a broken step.", taskKinds: ["starpathRouteDebug"] },
    { key: "improve-2", title: "Fix and Run", description: "Finish a started route.", taskKinds: ["starpathRouteBuild"] },
    { key: "improve-3", title: "Improve Master", description: "Test and fix independently.", taskKinds: ["starpathRouteDebug"] },
  ],
  reflection: {
    prompt: "How did you improve the route?",
    options: ["I found what was wrong", "I added or fixed moves", "I ran it until it worked"],
  },
  practisedSkills: ["Test a route", "Diagnose and fix", "Improve until correct"],
  nextUpLabel: "Week 7 Voyage Quiz",
  createTaskSet: createTestAndImproveTaskSet,
} satisfies StarpathLessonContent;
