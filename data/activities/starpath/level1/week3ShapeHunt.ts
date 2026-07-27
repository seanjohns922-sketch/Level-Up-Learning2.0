import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { computeHunts, getHuntScene, scenesByDifficulty } from "./shape-hunt-scenes";

// Level 1 · Week 3 — Take a picture apart into its familiar shapes. Every lesson
// is a Shape Hunt (find and tally each shape family in a picture); the three
// lessons climb by picture busyness: easy/medium → medium/hard → hard.

export function shapeHuntTask(sceneId: string, target: number): PracticeTask {
  const scene = getHuntScene(sceneId);
  const hunts = computeHunts(scene);
  return {
    kind: "starpathShapeHunt",
    prompt: `Find every shape hidden in the ${scene.label.toLowerCase()}.`,
    speakText: `This ${scene.label.toLowerCase()} is made from shapes. Find and tap all the shapes of each kind, one kind at a time.`,
    target,
    sceneId: scene.id,
    hunts,
    feedback: {
      correct: `You found every shape in the ${scene.label.toLowerCase()}.`,
      wrong: "That is a different shape. Look again for the one you are hunting.",
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

// Rotating pool of scene ids for a lesson's three activity generators.
function huntActivities(pool: string[], start: number) {
  let a = start;
  let b = start + 1;
  let c = start + 2;
  let target = 10;
  return [
    () => shapeHuntTask(pool[a++ % pool.length]!, ++target),
    () => shapeHuntTask(pool[b++ % pool.length]!, ++target),
    () => shapeHuntTask(pool[c++ % pool.length]!, ++target),
  ] as const;
}

export function createShapeDetectivesPictureTaskSet(): RealmLessonTaskSet {
  const pool = scenesByDifficulty("easy", "medium");
  return {
    teaching: teaching(
      "Shape Detectives",
      "Every picture is made from shapes.",
      "A picture can be taken apart into the shapes that make it. Find and tap all of one shape, then move on to the next kind."
    ),
    activities: huntActivities(pool, 0),
  };
}

export function createHiddenShapeHuntTaskSet(): RealmLessonTaskSet {
  const pool = scenesByDifficulty("medium", "hard");
  return {
    teaching: teaching(
      "Hidden Shape Hunt",
      "Busier pictures hide more shapes.",
      "These pictures have more shapes hidden inside. Hunt carefully and count every shape of each kind."
    ),
    activities: huntActivities(pool, 1),
  };
}

export function createMasterDetectiveTaskSet(): RealmLessonTaskSet {
  const pool = scenesByDifficulty("hard");
  return {
    teaching: teaching(
      "Master Detective",
      "Find every shape in the busiest pictures.",
      "This is the big challenge. Take apart the busiest pictures and find every single shape."
    ),
    activities: huntActivities(pool, 0),
  };
}

export const SHAPE_DETECTIVES_PICTURE_CONTENT = {
  missionBrief:
    "Geospin's scanner sees pictures as shapes. Take each picture apart — find and tally every circle, square, triangle and rectangle inside it.",
  successCriteria: ["find one kind of shape at a time", "count every shape you find", "take the whole picture apart"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Detectives", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hunt-1", title: "Shape Detective", description: "Find and tally every shape in a picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-2", title: "Detective Case", description: "Take apart a new picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-3", title: "Case Closed", description: "Find every shape in a fuller picture.", taskKinds: ["starpathShapeHunt"] },
  ],
  reflection: {
    prompt: "How did you take the picture apart?",
    options: ["I hunted one shape at a time", "I counted each kind of shape", "I found every shape in the picture"],
  },
  practisedSkills: ["Find shapes inside a picture", "Tally shapes by kind", "Decompose a whole picture"],
  nextUpLabel: "Hidden Shape Hunt",
  createTaskSet: createShapeDetectivesPictureTaskSet,
} satisfies StarpathLessonContent;

export const HIDDEN_SHAPE_HUNT_CONTENT = {
  missionBrief:
    "The pictures get busier. Hunt down every hidden circle, square, triangle and rectangle and keep an accurate count.",
  successCriteria: ["search a busier picture", "find every hidden shape", "keep your count correct"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Hidden Shape Hunt", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hunt-1", title: "Hidden Hunt", description: "Find every shape in a busier picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-2", title: "Deeper Search", description: "Take apart a fuller picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-3", title: "Sharp Eyes", description: "Find every shape carefully.", taskKinds: ["starpathShapeHunt"] },
  ],
  reflection: {
    prompt: "How did you find every shape?",
    options: ["I searched the whole picture", "I hunted one kind at a time", "I checked my count"],
  },
  practisedSkills: ["Search a busy picture", "Find every hidden shape", "Count accurately"],
  nextUpLabel: "Master Detective",
  createTaskSet: createHiddenShapeHuntTaskSet,
} satisfies StarpathLessonContent;

export const MASTER_DETECTIVE_CONTENT = {
  missionBrief:
    "The final case: the busiest pictures of all. Take them completely apart and find every last shape to earn your detective badge.",
  successCriteria: ["take apart a busy picture", "find every shape of every kind", "finish the whole picture"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Master Detective", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hunt-1", title: "Big Case", description: "Find every shape in a busy picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-2", title: "Master Case", description: "Take apart the busiest picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-3", title: "Detective Badge", description: "Finish the final picture.", taskKinds: ["starpathShapeHunt"] },
  ],
  reflection: {
    prompt: "You are a Shape Detective! What was your trick?",
    options: ["I hunted one kind at a time", "I looked everywhere in the picture", "I counted carefully"],
  },
  practisedSkills: ["Decompose a busy picture", "Find every shape", "Complete the full hunt"],
  nextUpLabel: "Week 3 Voyage Quiz",
  createTaskSet: createMasterDetectiveTaskSet,
} satisfies StarpathLessonContent;
