import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { shapeExplorerTask } from "./week1Lesson2";
import { familySortTask, mixedShapeHuntTask, oddShapeTask } from "./week3Tasks";

export function createShapeChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let huntRound = 0;
  let sortRound = 0;
  let finalRound = 0;
  const finalMission = (): PracticeTask => {
    const round = finalRound++;
    if (round % 3 === 0) return oddShapeTask(round, ++target);
    if (round % 3 === 1) return shapeExplorerTask(round, ++target);
    return familySortTask(round, ++target, "group");
  };
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Shape Explorer challenge",
      prompt: "Recognise, sort and compare shapes.",
      speakText: "Today you are a real Shape Explorer! Look carefully, sort familiar shapes and compare what is the same or different.",
      target: ++target,
    }),
    activities: [
      () => mixedShapeHuntTask(huntRound++, ++target),
      () => familySortTask(sortRound++, ++target, "drag"),
      finalMission,
    ],
  };
}

export const SHAPE_CHALLENGE_CONTENT = {
  missionBrief: "Complete Geospin's Week 3 explorer challenge by hunting, sorting and comparing familiar shapes across Starpath.",
  successCriteria: ["recognise shapes", "sort shapes", "compare shapes"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Shape Explorer Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "mixed-shape-hunt", title: "Mixed Shape Hunt", description: "Collect the exact familiar shapes Geospin requests.", taskKinds: ["starpathCollectMission"] },
    { key: "space-sorting-station", title: "Space Sorting Station", description: "Sort each familiar shape into the correct family.", taskKinds: ["starpathShapeSort"] },
    { key: "explorers-final-mission", title: "Explorer's Final Mission", description: "Apply shape recognition, sorting and comparing in mixed rounds.", taskKinds: ["starpathOddOneOut", "starpathShapeScene", "starpathShapeSort"] },
  ],
  reflection: { prompt: "Which Shape Explorer skill helped you most?", options: ["Recognising shapes", "Sorting shapes", "Comparing shapes"] },
  practisedSkills: ["Find requested familiar shapes", "Sort shapes into families", "Combine recognition, sorting and comparison"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createShapeChallengeTaskSet,
} satisfies StarpathLessonContent;
