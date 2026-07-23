import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { shapeMatchTask } from "./week1Lesson1";
import { compareShapeTask, oddShapeTask } from "./week3Tasks";

export function createSameOrDifferentTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let compareRound = 0;
  let pairRound = 0;
  let oddRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Same shape or different shape?",
      prompt: "Colour and size do not change a shape.",
      speakText: "Some shapes look alike and some look different. A shape can change colour or size and still be the same shape. Let's compare them!",
      target: ++target,
    }),
    activities: [
      () => compareShapeTask(compareRound++, ++target),
      () => shapeMatchTask(pairRound++, ++target),
      () => oddShapeTask(oddRound++, ++target),
    ],
  };
}

export const SAME_OR_DIFFERENT_CONTENT = {
  missionBrief: "Visit the Cosmic Comparison Lab. Decide whether shapes are the same, match shape partners and spot what is different.",
  successCriteria: ["see when shapes are the same", "see when shapes are different", "explain my thinking"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Same or Different?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "same-shape", title: "Same Shape?", description: "Compare two shapes even when their colours and sizes differ.", taskKinds: ["starpathShapeCompare"] },
    { key: "match-the-pair", title: "Match the Pair", description: "Match a target shape with its shape partner.", taskKinds: ["starpathShapeMatch"] },
    { key: "spot-the-difference", title: "Spot the Difference", description: "Find the different shape in a group of four.", taskKinds: ["starpathOddOneOut"] },
  ],
  reflection: { prompt: "What can change without changing the shape?", options: ["The colour", "The size", "The way it is shown"] },
  practisedSkills: ["Compare two familiar shapes", "Match shapes across colour and size changes", "Identify a visual difference"],
  nextUpLabel: "Shape Challenge",
  createTaskSet: createSameOrDifferentTaskSet,
} satisfies StarpathLessonContent;
