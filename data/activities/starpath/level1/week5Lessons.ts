import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { directionChoiceTask, directionPathTask } from "@/data/activities/starpath/ground/directionTasks";
import { LEVEL_ONE_ARTWORK } from "./shared";

// Level 1 · Week 5 — Direction Words. The Year 1 foundation for movement:
// name a move, follow a single move, and give the move to reach a goal. Uses
// consistent grid directions (up/down/left/right) — no facing rotation, which
// is a Year 2-3 skill. Sequences come later (Weeks 6-7).

// L1 — Which Way? Name the single move the rover just made.
export function whichWayTask(round: number, target: number): PracticeTask {
  return directionChoiceTask(round, target, "moved", "rover");
}

// L2 — Move the Rover. Follow one direction word and make the single move.
export function moveRoverTask(round: number, target: number): PracticeTask {
  return directionPathTask(round, target, { steps: 1, object: "rover" });
}

// L3 — Say the Move. Give the one direction that reaches the goal.
export function sayMoveTask(round: number, target: number): PracticeTask {
  return directionChoiceTask(round, target, "goal", "rover");
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

export function createWhichWayTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Which Way?",
      "Up, down, left and right tell us which way something moves.",
      "The rover can move up, down, left or right. Watch where it goes and name the direction."
    ),
    activities: [
      () => whichWayTask(a++, ++target),
      () => whichWayTask(b++ + 1, ++target),
      () => whichWayTask(c++ + 2, ++target),
    ],
  };
}

export function createMoveRoverTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Move the Rover",
      "Follow a direction word to move the rover.",
      "You will be told a direction. Tap the matching arrow to move the rover that way."
    ),
    activities: [
      () => moveRoverTask(a++, ++target),
      () => moveRoverTask(b++ + 1, ++target),
      () => moveRoverTask(c++ + 2, ++target),
    ],
  };
}

export function createSayMoveTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Say the Move",
      "Give the direction that reaches the goal.",
      "The goal is one step away. Choose the direction word that moves the rover onto it."
    ),
    activities: [
      () => sayMoveTask(a++, ++target),
      () => sayMoveTask(b++ + 1, ++target),
      () => sayMoveTask(c++ + 2, ++target),
    ],
  };
}

export const WHICH_WAY_CONTENT = {
  missionBrief:
    "Learn the direction words. Watch the rover move on the grid and name which way it went — up, down, left or right.",
  successCriteria: ["watch the rover move", "name up, down, left and right", "choose the direction"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Which Way?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "which-1", title: "Which Way?", description: "Name the direction the rover moved.", taskKinds: ["starpathDirectionChoice"] },
    { key: "which-2", title: "Direction Check", description: "Name another move.", taskKinds: ["starpathDirectionChoice"] },
    { key: "which-3", title: "Direction Master", description: "Name every move confidently.", taskKinds: ["starpathDirectionChoice"] },
  ],
  reflection: {
    prompt: "How did you name the direction?",
    options: ["I saw where the rover went", "I used up, down, left and right", "I checked the move"],
  },
  practisedSkills: ["Name direction words", "Recognise up/down/left/right", "Read a single move"],
  nextUpLabel: "Move the Rover",
  createTaskSet: createWhichWayTaskSet,
} satisfies StarpathLessonContent;

export const MOVE_ROVER_CONTENT = {
  missionBrief:
    "Follow the direction words. When you are told to move up, down, left or right, tap the matching arrow to move the rover.",
  successCriteria: ["read a direction word", "tap the matching arrow", "make the move"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Move the Rover", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "move-1", title: "Move the Rover", description: "Follow one direction word.", taskKinds: ["starpathDirectionPath"] },
    { key: "move-2", title: "Move Again", description: "Follow another direction.", taskKinds: ["starpathDirectionPath"] },
    { key: "move-3", title: "Move Master", description: "Follow directions confidently.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: {
    prompt: "How did you move the rover?",
    options: ["I read the direction word", "I tapped the matching arrow", "I moved it that way"],
  },
  practisedSkills: ["Follow a direction word", "Apply up/down/left/right", "Make a single move"],
  nextUpLabel: "Say the Move",
  createTaskSet: createMoveRoverTaskSet,
} satisfies StarpathLessonContent;

export const SAY_THE_MOVE_CONTENT = {
  missionBrief:
    "Now you give the direction. The goal is one step away — choose the direction word that moves the rover onto it.",
  successCriteria: ["see where the goal is", "choose the right direction", "give the move"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Say the Move", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "say-1", title: "Say the Move", description: "Give the direction to the goal.", taskKinds: ["starpathDirectionChoice"] },
    { key: "say-2", title: "Give Directions", description: "Choose another direction.", taskKinds: ["starpathDirectionChoice"] },
    { key: "say-3", title: "Direction Guide", description: "Give every move confidently.", taskKinds: ["starpathDirectionChoice"] },
  ],
  reflection: {
    prompt: "How did you give the move?",
    options: ["I saw where the goal was", "I chose the right direction", "I used a direction word"],
  },
  practisedSkills: ["Give a direction word", "Choose a move to a goal", "Use up/down/left/right"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createSayMoveTaskSet,
} satisfies StarpathLessonContent;
