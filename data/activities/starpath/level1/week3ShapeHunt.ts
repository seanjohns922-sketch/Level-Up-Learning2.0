import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";
import { computeHunts, getHuntScene, listHuntScenes } from "./shape-hunt-scenes";

// Level 1 · Week 3 · Lesson 1 — Shape Detectives' Picture. Take a picture apart
// into its familiar shapes: find and tally every shape of each kind. Draws from
// a pool of scenes so each mission round shows a different picture.

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

function scenePool(): string[] {
  return listHuntScenes().map((scene) => scene.id);
}

export function createShapeDetectivesPictureTaskSet(): RealmLessonTaskSet {
  const pool = scenePool();
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading: "Shape Detectives' Picture",
      prompt: "Every picture is made from shapes.",
      speakText:
        "A picture can be taken apart into the shapes that make it. Find and tap all of one shape, then move on to the next kind.",
      target: ++target,
    }),
    activities: [
      () => shapeHuntTask(pool[a++ % pool.length]!, ++target),
      () => shapeHuntTask(pool[(b++ + 1) % pool.length]!, ++target),
      () => shapeHuntTask(pool[(c++ + 2) % pool.length]!, ++target),
    ],
  };
}

export const SHAPE_DETECTIVES_PICTURE_CONTENT = {
  missionBrief:
    "Geospin's scanner sees pictures as shapes. Take each picture apart — find and tally every circle, square, triangle and rectangle inside it.",
  successCriteria: ["find one kind of shape at a time", "count every shape you find", "take the whole picture apart"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Detectives' Picture", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hunt-1", title: "Shape Detective", description: "Find and tally every shape in a picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-2", title: "Detective Case", description: "Take apart a new picture.", taskKinds: ["starpathShapeHunt"] },
    { key: "hunt-3", title: "Master Detective", description: "Find every shape in a busy picture.", taskKinds: ["starpathShapeHunt"] },
  ],
  reflection: {
    prompt: "How did you take the picture apart?",
    options: ["I hunted one shape at a time", "I counted each kind of shape", "I found every shape in the picture"],
  },
  practisedSkills: ["Find shapes inside a picture", "Tally shapes by kind", "Decompose a whole picture"],
  nextUpLabel: "Find the Hidden Parts",
  createTaskSet: createShapeDetectivesPictureTaskSet,
} satisfies StarpathLessonContent;
