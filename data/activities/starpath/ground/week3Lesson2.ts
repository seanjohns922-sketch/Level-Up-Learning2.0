import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { compareShapeTask, twinMatchTask, whatChangedTask } from "./week3Tasks";

export function createSameOrDifferentTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let compareRound = 0;
  let twinRound = 0;
  let changeRound = 0;
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
      () => twinMatchTask(twinRound++, ++target),
      () => whatChangedTask(changeRound++, ++target),
    ],
  };
}

export const SAME_OR_DIFFERENT_CONTENT = {
  missionBrief: "Visit the Cosmic Comparison Lab. Decide whether shapes are the same, find shape twins hiding in new colours and sizes, and spot exactly what changed.",
  successCriteria: ["see when shapes are the same", "match a shape to its twin", "notice what changes without changing the shape"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Same or Different?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "same-or-different", title: "Same or Different?", description: "Decide if two shapes are the same, even when their colour and size change.", taskKinds: ["starpathShapeCompare"] },
    { key: "twins-in-disguise", title: "Twins in Disguise", description: "Find the shape that is the same, hiding in a new colour and size.", taskKinds: ["starpathShapeMatch"] },
    { key: "what-changed", title: "What Changed?", description: "Spot what changed: the colour, the size, or the shape itself.", taskKinds: ["starpathWhatChanged"] },
  ],
  reflection: { prompt: "What can change without changing the shape?", options: ["The colour", "The size", "The way it is shown"] },
  practisedSkills: ["Compare two familiar shapes", "Match a shape to its twin across colour and size", "Notice what changes without changing the shape"],
  nextUpLabel: "Shape Challenge",
  createTaskSet: createSameOrDifferentTaskSet,
} satisfies StarpathLessonContent;
