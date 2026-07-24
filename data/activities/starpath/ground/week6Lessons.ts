import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { directionChoiceTask, directionPathTask } from "./directionTasks";

// ── Lesson 1 — Guide the Rocket ──────────────────────────────────────────────
export function createGuideTheRocketTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Guide the rocket",
      prompt: "Follow a path of directions.",
      speakText: "A space journey is made of many small moves. Follow each direction in order to guide the rocket across space.",
      target: ++target,
    }),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 3, goalObject: "star", prompt: "Guide the rocket to the star." }),
      () => directionChoiceTask(b++, ++target, "goal"),
      () => directionPathTask(c++, ++target, { steps: 3, prompt: "Guide the rocket along the path." }),
    ],
  };
}

export const GUIDE_THE_ROCKET_CONTENT = {
  missionBrief: "Every space journey is a path of small moves. Guide Geospin's rocket across Starpath by following each direction in order.",
  successCriteria: ["follow a path of directions", "choose the right way", "reach the goal"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Guide the Rocket", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "guide-to-star", title: "Guide to the Star", description: "Follow three directions to reach the star.", taskKinds: ["starpathDirectionPath"] },
    { key: "which-way-goal", title: "Which Way?", description: "Choose the direction toward the goal.", taskKinds: ["starpathDirectionChoice"] },
    { key: "guide-the-path", title: "Guide the Path", description: "Follow the path of directions.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: { prompt: "What helped you guide the rocket?", options: ["Reading each clue", "Following the order", "Watching the goal"] },
  practisedSkills: ["Follow a path of directions", "Choose the direction toward a goal", "Guide an object across a grid"],
  nextUpLabel: "Help Geospin",
  createTaskSet: createGuideTheRocketTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 2 — Help Geospin ──────────────────────────────────────────────────
export function createHelpGeospinTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Help Geospin",
      prompt: "Follow clues to reach a destination.",
      speakText: "Geospin needs to reach a special place. Follow each direction clue in order to help Geospin arrive safely.",
      target: ++target,
    }),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 3, goalObject: "flag", prompt: "Help Geospin reach the flag." }),
      () => directionChoiceTask(b++, ++target, "goal"),
      () => directionPathTask(c++, ++target, { steps: 4, goalObject: "flag", prompt: "Follow the clues to the destination." }),
    ],
  };
}

export const HELP_GEOSPIN_CONTENT = {
  missionBrief: "Geospin needs to reach a landing flag. Follow each direction clue in order to help Geospin arrive.",
  successCriteria: ["follow location clues", "choose the right way", "reach the destination"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Help Geospin", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "reach-the-flag", title: "Reach the Flag", description: "Follow directions to the landing flag.", taskKinds: ["starpathDirectionPath"] },
    { key: "which-way-goal", title: "Which Way?", description: "Choose the direction to the destination.", taskKinds: ["starpathDirectionChoice"] },
    { key: "reach-destination", title: "Reach the Destination", description: "Follow a longer path of clues.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: { prompt: "How did you help Geospin?", options: ["I followed the clues", "I chose each way", "I kept the order"] },
  practisedSkills: ["Follow location clues to a destination", "Choose the direction to a goal", "Follow a four-step path"],
  nextUpLabel: "Hidden Treasure",
  createTaskSet: createHelpGeospinTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 3 — Hidden Treasure ───────────────────────────────────────────────
export function createHiddenTreasureTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Hidden treasure",
      prompt: "Follow the clues to find the treasure.",
      speakText: "Hidden treasure is waiting in space! Follow every direction clue in order and the treasure will appear when you arrive.",
      target: ++target,
    }),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 3, goalObject: "crystal", reveal: true, prompt: "Follow the clues to the treasure." }),
      () => directionChoiceTask(b++, ++target, "goal"),
      () => directionPathTask(c++, ++target, { steps: 4, goalObject: "crystal", reveal: true, prompt: "Find the hidden treasure." }),
    ],
  };
}

export const HIDDEN_TREASURE_CONTENT = {
  missionBrief: "Space treasure is hidden across Starpath. Apply a sequence of location clues and the treasure appears when you arrive.",
  successCriteria: ["follow a sequence of clues", "keep the right order", "find the hidden treasure"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Hidden Treasure", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-treasure", title: "Find the Treasure", description: "Follow three clues to the hidden treasure.", taskKinds: ["starpathDirectionPath"] },
    { key: "which-way-goal", title: "Which Way?", description: "Choose the direction toward the treasure.", taskKinds: ["starpathDirectionChoice"] },
    { key: "treasure-mission", title: "Treasure Mission", description: "Follow a longer clue path to the treasure.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: { prompt: "What made the treasure appear?", options: ["Following every clue", "Keeping the order", "Reaching the spot"] },
  practisedSkills: ["Apply a sequence of location clues", "Choose the direction to a hidden goal", "Complete a four-step treasure path"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createHiddenTreasureTaskSet,
} satisfies StarpathLessonContent;
