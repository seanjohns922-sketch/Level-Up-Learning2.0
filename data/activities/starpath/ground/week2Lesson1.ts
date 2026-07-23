import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  finishPictureTask,
  identifyBuildShapesTask,
  shapeBuilderTask,
} from "@/data/activities/starpath/ground/week2Tasks";

const BUILD_OBJECTS = ["rocket", "house", "tree", "robot", "moon-buggy"] as const;

export function createBuildWithShapesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let finishRound = 0;
  let builderRound = 0;
  let identifyRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading: "Shapes are building blocks",
      prompt: "Big things are made from little shapes.",
      speakText:
        "Geospin built a rocket from a rectangle, a triangle and a circle. Big things are made from little shapes. Let's build together!",
      target: ++target,
    }),
    activities: [
      () => finishPictureTask(BUILD_OBJECTS, finishRound++, ++target),
      () => shapeBuilderTask(["rocket", "house", "robot"], "guided", builderRound++, ++target),
      () => identifyBuildShapesTask(BUILD_OBJECTS, identifyRound++, ++target),
    ],
  };
}

export const BUILD_WITH_SHAPES_CONTENT = {
  missionBrief:
    "Join Geospin in the Cosmic Workshop. Finish pictures, build objects and name the familiar shapes that make each creation.",
  successCriteria: [
    "choose the correct shape",
    "build a picture using shapes",
    "name the shapes I used",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Shapes Are Building Blocks",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "finish-the-picture",
      title: "Finish the Picture",
      description: "Drag one missing familiar shape into a nearly complete Starpath picture.",
      taskKinds: ["starpathFinishPicture"],
    },
    {
      key: "shape-builder",
      title: "Shape Builder",
      description: "Assemble a simple object by placing its familiar shape pieces.",
      taskKinds: ["starpathShapeBuilder"],
    },
    {
      key: "which-shapes-did-you-use",
      title: "Which Shapes Did You Use?",
      description: "Look at a finished object and identify every familiar shape used.",
      taskKinds: ["starpathBuildShapeIdentify"],
    },
  ],
  reflection: {
    prompt: "What did you build with shapes today?",
    options: ["A rocket", "A house", "A robot", "Another picture"],
  },
  practisedSkills: [
    "Choose a missing familiar shape",
    "Build a simple picture from familiar shapes",
    "Name the shapes used in a picture",
  ],
  nextUpLabel: "Shape Creators",
  createTaskSet: createBuildWithShapesTaskSet,
} satisfies StarpathLessonContent;
