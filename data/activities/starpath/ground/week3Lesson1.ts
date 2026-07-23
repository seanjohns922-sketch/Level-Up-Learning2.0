import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { familySortTask, oddShapeTask } from "./week3Tasks";

export function createShapeFamiliesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let familyRound = 0;
  let groupRound = 0;
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
      () => familySortTask(familyRound++, ++target, "drag"),
      () => familySortTask(groupRound++, ++target, "group"),
      () => oddShapeTask(oddRound++, ++target),
    ],
  };
}

export const SHAPE_FAMILIES_CONTENT = {
  missionBrief: "Help Geospin organise the sorting station. Group familiar shapes into families and find the shape that does not belong.",
  successCriteria: ["put the same shapes together", "recognise different shapes", "explain my choice"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Shape Families", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "shape-families", title: "Shape Families", description: "Sort different colours and sizes into the correct shape family.", taskKinds: ["starpathShapeSort"] },
    { key: "which-group", title: "Which Group?", description: "Choose the family where each shape belongs.", taskKinds: ["starpathShapeSort"] },
    { key: "find-the-odd-shape", title: "Find the Odd Shape", description: "Find the one shape that does not belong with the others.", taskKinds: ["starpathOddOneOut"] },
  ],
  reflection: { prompt: "How did you decide where a shape belonged?", options: ["I looked at its shape", "I found the matching family", "I found what was different"] },
  practisedSkills: ["Sort familiar shapes into groups", "Recognise shape families despite colour or size", "Identify a shape that does not belong"],
  nextUpLabel: "Same or Different?",
  createTaskSet: createShapeFamiliesTaskSet,
} satisfies StarpathLessonContent;
