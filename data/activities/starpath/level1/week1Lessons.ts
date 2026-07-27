import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import {
  compareShapeTask,
  familyStationTask,
  oddShapeTask,
  twinMatchTask,
  whatChangedTask,
} from "@/data/activities/starpath/ground/week3Tasks";

const LEVEL_ONE_ARTWORK = "/images/starpath-home-bg-y1.png";

export function createShapeReviewMissionTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let matchRound = 0;
  let compareRound = 0;
  let changeRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "A shape stays the same",
      prompt: "Colour, size and a small turn do not change a shape.",
      speakText:
        "Welcome, Junior Space Explorer! A familiar shape can change colour, become bigger or smaller, or turn around and still be the same shape. Look at the shape clues, not its decoration.",
      target: ++target,
    }),
    activities: [
      () => twinMatchTask(matchRound++, ++target),
      () => compareShapeTask(compareRound++, ++target),
      () => whatChangedTask(changeRound++, ++target),
    ],
  };
}

export const SHAPE_REVIEW_MISSION_CONTENT = {
  missionBrief:
    "Begin your Junior Space Explorer training by recognising familiar shapes when their colour, size or direction changes.",
  successCriteria: [
    "recognise familiar shapes",
    "match the same shape in a different size or colour",
    "notice what changed",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Shape Expert Review",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-twins",
      title: "Shape Twins",
      description: "Match familiar shapes despite changes in colour and size.",
      taskKinds: ["starpathShapeMatch"],
    },
    {
      key: "same-or-different",
      title: "Same or Different?",
      description: "Compare two familiar shapes.",
      taskKinds: ["starpathShapeCompare"],
    },
    {
      key: "what-changed",
      title: "What Changed?",
      description: "Decide whether the colour, size or shape changed.",
      taskKinds: ["starpathWhatChanged"],
    },
  ],
  reflection: {
    prompt: "What helped you recognise a shape?",
    options: [
      "I ignored its colour",
      "I ignored its size",
      "I looked at the whole shape",
    ],
  },
  practisedSkills: [
    "Recognise familiar shapes in varied colours and sizes",
    "Compare two familiar shapes",
    "Identify which visual feature changed",
  ],
  nextUpLabel: "Compare the Shapes",
  createTaskSet: createShapeReviewMissionTaskSet,
} satisfies StarpathLessonContent;

export function createCompareTheShapesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let compareRound = 0;
  let changeRound = 0;
  let oddRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Compare like an explorer",
      prompt: "Look for what is the same and what is different.",
      speakText:
        "Space explorers compare carefully. Two shapes can have the same name even when their colour, size or direction is different. Look at both shapes and explain what stayed the same or what changed.",
      target: ++target,
    }),
    activities: [
      () => compareShapeTask(compareRound++, ++target),
      () => whatChangedTask(changeRound++, ++target),
      () => oddShapeTask(oddRound++, ++target),
    ],
  };
}

export const COMPARE_THE_SHAPES_CONTENT = {
  missionBrief:
    "Compare familiar shapes across Starpath. Decide what is the same, what is different and which shape does not belong.",
  successCriteria: [
    "compare two familiar shapes",
    "notice a similarity or difference",
    "find a shape that does not belong",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Compare the Shapes",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-comparison",
      title: "Shape Comparison",
      description: "Decide whether two shapes are the same or different.",
      taskKinds: ["starpathShapeCompare"],
    },
    {
      key: "change-detector",
      title: "Change Detector",
      description: "Identify what changed between two shapes.",
      taskKinds: ["starpathWhatChanged"],
    },
    {
      key: "odd-shape",
      title: "Odd Shape",
      description: "Find the one shape that is different.",
      taskKinds: ["starpathOddOneOut"],
    },
  ],
  reflection: {
    prompt: "How did you compare the shapes?",
    options: [
      "I looked for what stayed the same",
      "I looked for what changed",
      "I ignored colour and size",
    ],
  },
  practisedSkills: [
    "Compare familiar shapes",
    "Identify visual similarities and differences",
    "Use comparison clues to find an odd shape",
  ],
  nextUpLabel: "Shape Detective Challenge",
  createTaskSet: createCompareTheShapesTaskSet,
} satisfies StarpathLessonContent;

export function createShapeDetectiveChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let familyRound = 0;
  let matchRound = 0;
  let oddRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      heading: "Use every shape clue",
      prompt: "Recognise, compare and group familiar shapes.",
      speakText:
        "Junior Space Explorers use every clue they know. Recognise each familiar shape, compare it with the others, then decide which shapes belong together.",
      target: ++target,
    }),
    activities: [
      () => familyStationTask(familyRound++, ++target),
      () => twinMatchTask(matchRound++, ++target),
      () => oddShapeTask(oddRound++, ++target),
    ],
  };
}

export const SHAPE_DETECTIVE_CHALLENGE_CONTENT = {
  missionBrief:
    "Complete Geospin's detective challenge by recognising, comparing and grouping familiar shapes across a busy sorting station.",
  successCriteria: [
    "recognise familiar shapes in different forms",
    "put matching shapes together",
    "explain which shape is different",
  ],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: {
    title: "Shape Detective Challenge",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "shape-families",
      title: "Shape Families",
      description: "Classify familiar shapes into matching groups.",
      taskKinds: ["starpathFamilySort"],
    },
    {
      key: "detective-match",
      title: "Detective Match",
      description: "Find the matching shape despite visual changes.",
      taskKinds: ["starpathShapeMatch"],
    },
    {
      key: "detective-odd-one-out",
      title: "Which Does Not Belong?",
      description: "Use shape clues to find the different shape.",
      taskKinds: ["starpathOddOneOut"],
    },
  ],
  reflection: {
    prompt: "Which clue made you a strong shape detective?",
    options: [
      "I matched the shape",
      "I compared what was different",
      "I grouped the same shapes",
    ],
  },
  practisedSkills: [
    "Recognise familiar shapes despite visual changes",
    "Classify familiar shapes",
    "Explain a simple similarity or difference",
  ],
  nextUpLabel: "Week 1 Voyage Quiz",
  createTaskSet: createShapeDetectiveChallengeTaskSet,
} satisfies StarpathLessonContent;
