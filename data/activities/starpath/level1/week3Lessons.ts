import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathBuildObjectId } from "@/data/activities/starpath/ground/shape-builds";
import {
  buildMatchTask,
  identifyBuildShapesTask,
  shapeBuilderTask,
  spaceMuseumTask,
} from "@/data/activities/starpath/ground/week2Tasks";
import { LEVEL_ONE_ARTWORK } from "./shared";

// Level 1 · Week 3 — Build and Take Apart. Students compose familiar shapes into
// a target (make), decompose a composite into its familiar parts (take apart),
// then reason that one object can be built more than one way. Reuses the shared
// build engine with a richer Year 1 object set.

const BUILD_OBJECTS: StarpathBuildObjectId[] = ["astronaut", "telescope", "ufo", "space-dog", "moon-buggy"];
const DECOMPOSE_OBJECTS: StarpathBuildObjectId[] = ["robot", "space-station", "rocket", "moon-buggy", "astronaut"];
const MATCH_OBJECTS: StarpathBuildObjectId[] = ["ufo", "telescope", "space-dog", "robot", "satellite"];

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createBuildTheTargetTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Build the Target",
      "Familiar shapes join together to make a new object.",
      "Every build is made from familiar shapes. Choose the shapes the target object needs."
    ),
    activities: [
      () => shapeBuilderTask(BUILD_OBJECTS, "guided", a++, ++target),
      () => shapeBuilderTask(BUILD_OBJECTS, "challenge", b++ + 1, ++target),
      () => shapeBuilderTask(BUILD_OBJECTS, "challenge", c++ + 2, ++target),
    ],
  };
}

export function createFindHiddenPartsTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Find the Hidden Parts",
      "Every object can be taken apart into familiar shapes.",
      "Look inside a finished build. Tap every familiar shape that was used to make it."
    ),
    activities: [
      () => identifyBuildShapesTask(DECOMPOSE_OBJECTS, a++, ++target),
      () => identifyBuildShapesTask(DECOMPOSE_OBJECTS, b++ + 1, ++target),
      () => identifyBuildShapesTask(DECOMPOSE_OBJECTS, c++ + 2, ++target),
    ],
  };
}

export function createDesignTwoWaysTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Design Two Ways",
      "The same object can be built more than one way.",
      "Match builds by the shapes they use, and reason about which picture fits a shape rule."
    ),
    activities: [
      () => buildMatchTask(MATCH_OBJECTS, a++, ++target),
      () => spaceMuseumTask(b++, ++target),
      () => buildMatchTask(MATCH_OBJECTS, c++ + 2, ++target),
    ],
  };
}

export const BUILD_THE_TARGET_CONTENT = {
  missionBrief:
    "Report to Geospin's construction bay. Build each target object by choosing the familiar shapes it needs.",
  successCriteria: ["choose the right shapes", "leave out shapes that do not belong", "complete the build"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Build the Target", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "guided-build", title: "Guided Build", description: "Build a target from its shapes.", taskKinds: ["starpathShapeBuilder"] },
    { key: "challenge-build", title: "Challenge Build", description: "Build with a decoy shape in the tray.", taskKinds: ["starpathShapeBuilder"] },
    { key: "solo-build", title: "Solo Build", description: "Complete a build independently.", taskKinds: ["starpathShapeBuilder"] },
  ],
  reflection: {
    prompt: "How did you build the object?",
    options: ["I found the shapes it needed", "I left out shapes that did not fit", "I checked every space"],
  },
  practisedSkills: ["Compose familiar shapes", "Reject shapes that do not belong", "Complete a build"],
  nextUpLabel: "Find the Hidden Parts",
  createTaskSet: createBuildTheTargetTaskSet,
} satisfies StarpathLessonContent;

export const FIND_HIDDEN_PARTS_CONTENT = {
  missionBrief:
    "Scan Geospin's finished builds. Take each one apart in your mind and tap every familiar shape hidden inside.",
  successCriteria: ["look inside a build", "find every familiar shape", "ignore shapes that are not there"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Find the Hidden Parts", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "decompose-1", title: "Take It Apart", description: "Tap every shape used in the build.", taskKinds: ["starpathBuildShapeIdentify"] },
    { key: "decompose-2", title: "Hidden Shapes", description: "Find the shapes inside a composite.", taskKinds: ["starpathBuildShapeIdentify"] },
    { key: "decompose-3", title: "Parts Master", description: "Decompose a tricky build.", taskKinds: ["starpathBuildShapeIdentify"] },
  ],
  reflection: {
    prompt: "How did you find the hidden shapes?",
    options: ["I looked at each part", "I matched parts to shapes", "I ignored shapes that were not there"],
  },
  practisedSkills: ["Decompose a composite", "Identify component shapes", "Ignore absent shapes"],
  nextUpLabel: "Design Two Ways",
  createTaskSet: createFindHiddenPartsTaskSet,
} satisfies StarpathLessonContent;

export const DESIGN_TWO_WAYS_CONTENT = {
  missionBrief:
    "Compare Geospin's designs. Match builds by their shapes and prove one object can be made more than one way.",
  successCriteria: ["match builds by shape", "reason about shape rules", "explain a design choice"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Design Two Ways", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "match-build", title: "Match the Build", description: "Find the build made from the same shapes.", taskKinds: ["starpathBuildMatch"] },
    { key: "shape-rule", title: "Design Gallery", description: "Choose the build that fits a shape rule.", taskKinds: ["starpathSpaceMuseum"] },
    { key: "match-master", title: "Design Master", description: "Match a trickier design.", taskKinds: ["starpathBuildMatch"] },
  ],
  reflection: {
    prompt: "What did you notice about designs?",
    options: ["Different builds can use the same shapes", "One object can be made many ways", "I matched by the shapes used"],
  },
  practisedSkills: ["Match composites by shape", "Reason about shape rules", "Recognise multiple valid designs"],
  nextUpLabel: "Week 3 Voyage Quiz",
  createTaskSet: createDesignTwoWaysTaskSet,
} satisfies StarpathLessonContent;
