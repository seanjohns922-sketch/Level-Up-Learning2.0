import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  finishPictureTask,
  shapeBuilderTask,
} from "@/data/activities/starpath/ground/week2Tasks";

const CREATIONS = ["cat", "rocket", "planet", "house", "tree"] as const;

export function createShapeCreatorsTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let copyRound = 0;
  let challengeRound = 0;
  let missingRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading: "We can make almost anything",
      prompt: "Combine familiar shapes to make something new.",
      speakText:
        "We can make almost anything with shapes. A cat, a rocket, a planet, a house or a tree. Choose shapes and combine them to make a new picture.",
      target: ++target,
    }),
    activities: [
      () => shapeBuilderTask(CREATIONS, "copy", copyRound++, ++target),
      () => shapeBuilderTask(["rocket", "space-station"], "challenge", challengeRound++, ++target),
      () => finishPictureTask(CREATIONS, missingRound++, ++target),
    ],
  };
}

export const SHAPE_CREATORS_CONTENT = {
  missionBrief:
    "Enter Geospin's Creation Lab. Copy a picture, solve a build challenge and find the one shape each creation still needs.",
  successCriteria: [
    "choose shapes",
    "combine shapes",
    "talk about my picture",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Create Something New",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "copy-my-picture",
      title: "Copy My Picture",
      description: "Recreate Geospin's picture using three to five familiar shape pieces.",
      taskKinds: ["starpathShapeBuilder"],
    },
    {
      key: "shape-challenge",
      title: "Shape Challenge",
      description: "Choose the pieces needed to build a rocket or space station.",
      taskKinds: ["starpathShapeBuilder"],
    },
    {
      key: "find-the-missing-shape",
      title: "Find the Missing Shape",
      description: "Choose the familiar shape that completes a nearly finished picture.",
      taskKinds: ["starpathFinishPicture"],
    },
  ],
  reflection: {
    prompt: "How did you make a new picture today?",
    options: ["I copied shapes", "I combined shapes", "I found a missing shape"],
  },
  practisedSkills: [
    "Copy a simple picture made from shapes",
    "Combine familiar shapes to create an object",
    "Identify a missing shape",
  ],
  nextUpLabel: "Space Builders",
  createTaskSet: createShapeCreatorsTaskSet,
} satisfies StarpathLessonContent;
