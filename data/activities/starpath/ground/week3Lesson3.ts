import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { compareShapeTask, mixedShapeHuntTask, shapeSprintTask } from "./week3Tasks";

export function createShapeChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let huntRound = 0;
  let compareRound = 0;
  let sprintRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Shape Explorer challenge",
      prompt: "Recognise, compare and race.",
      speakText: "Today you are a real Shape Explorer! Hunt for familiar shapes, compare what is the same or different, then take on a speed round.",
      target: ++target,
    }),
    activities: [
      () => mixedShapeHuntTask(huntRound++, ++target),
      () => compareShapeTask(compareRound++, ++target),
      () => shapeSprintTask(sprintRound++, ++target),
    ],
  };
}

export const SHAPE_CHALLENGE_CONTENT = {
  missionBrief: "Complete Geospin's Week 3 explorer challenge: hunt familiar shapes, compare what is the same or different, then race the clock in a shape sprint.",
  successCriteria: ["recognise shapes", "compare shapes", "find shapes at speed"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Shape Explorer Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "mixed-shape-hunt", title: "Mixed Shape Hunt", description: "Collect the exact familiar shapes Geospin requests.", taskKinds: ["starpathCollectMission"] },
    { key: "same-or-different-recap", title: "Same or Different?", description: "Decide if two shapes are the same, even when colour and size change.", taskKinds: ["starpathShapeCompare"] },
    { key: "shape-sprint", title: "Shape Sprint", description: "A speed round — find every matching shape before the time runs out.", taskKinds: ["starpathShapeSprint"] },
  ],
  reflection: { prompt: "Which Shape Explorer skill helped you most?", options: ["Recognising shapes", "Comparing shapes", "Finding shapes fast"] },
  practisedSkills: ["Find requested familiar shapes", "Compare shapes past colour and size", "Recognise shapes quickly under a little time pressure"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createShapeChallengeTaskSet,
} satisfies StarpathLessonContent;
