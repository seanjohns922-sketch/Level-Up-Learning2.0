import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { collectFamilyTask, familyStationTask, oddShapeTask } from "./week3Tasks";

export function createShapeFamiliesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let stationRound = 0;
  let collectRound = 0;
  let oddRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Shapes belong in families",
      prompt: "Put the same shapes together.",
      speakText: "Space explorers keep everything organised. Circles belong with circles, triangles with triangles, squares with squares, and rectangles with rectangles. Let's put the same shapes together!",
      target: ++target,
    }),
    activities: [
      () => familyStationTask(stationRound++, ++target),
      () => collectFamilyTask(collectRound++, ++target),
      () => oddShapeTask(oddRound++, ++target),
    ],
  };
}

export const SHAPE_FAMILIES_CONTENT = {
  missionBrief: "Help Geospin run the sorting station. Sort every shape into its family, gather a whole family together and spot the shape that does not belong.",
  successCriteria: ["sort shapes into families", "gather a whole family", "spot the shape that does not belong"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Shape Families", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "sorting-station", title: "Sorting Station", description: "Sort each shape into the correct family bin.", taskKinds: ["starpathFamilySort"] },
    { key: "collect-the-family", title: "Collect the Family", description: "Gather every shape that belongs to one family.", taskKinds: ["starpathCollectMission"] },
    { key: "find-the-odd-shape", title: "Find the Odd Shape", description: "Find the one shape that does not belong with the others.", taskKinds: ["starpathOddOneOut"] },
  ],
  reflection: { prompt: "How did you decide where a shape belonged?", options: ["I looked at its shape", "I found the matching family", "I found what was different"] },
  practisedSkills: ["Sort several shapes into families", "Gather a whole shape family", "Identify a shape that does not belong"],
  nextUpLabel: "Same or Different?",
  createTaskSet: createShapeFamiliesTaskSet,
} satisfies StarpathLessonContent;
