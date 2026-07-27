import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import type { StarpathBuildObjectId } from "@/data/activities/starpath/ground/shape-builds";
import { LEVEL_ONE_ARTWORK, rotate } from "./shared";

// Level 1 · Week 4 — Objects and Views. Students connect a familiar object with
// a simple representation, then reason about how it looks from a viewpoint
// (top/front), then choose the most useful picture. Uses the viewpoint engine.

const MATCH_POOL: StarpathBuildObjectId[] = [
  "ufo",
  "telescope",
  "astronaut",
  "space-dog",
  "robot",
  "satellite",
  "rocket",
  "planet",
];

// L1 — Object or Picture? Match the object to the picture that shows it.
export function objectMatchTask(round: number, target: number): PracticeTask {
  const objectId = MATCH_POOL[round % MATCH_POOL.length]!;
  const distractors = rotate(
    MATCH_POOL.filter((candidate) => candidate !== objectId),
    round
  ).slice(0, 2);
  const optionObjects = rotate([objectId, ...distractors], round);
  const options = optionObjects.map((candidate, index) => ({
    id: `${candidate}-${target}-${index}`,
    render: "object" as const,
    objectId: candidate,
    label: candidate.replace(/-/g, " "),
  }));
  return {
    kind: "starpathViewpoint",
    mode: "match",
    prompt: "Which picture shows this object?",
    speakText: "Look at the object, then choose the picture that shows the same object.",
    target,
    objectId,
    options,
    correctOptionId: options.find((option) => option.objectId === objectId)!.id,
    feedback: {
      correct: "That picture shows the same object.",
      wrong: "Look at the shapes in the object and match them to the picture.",
    },
  };
}

// L2 — Look from Here. Which basic shape do you see from the top?
type ViewCase = { objectId: StarpathBuildObjectId; viewpoint: "top" | "front"; shape: StarpathShape; decoys: StarpathShape[] };
const VIEW_CASES: ViewCase[] = [
  { objectId: "planet", viewpoint: "top", shape: "circle", decoys: ["square", "triangle"] },
  { objectId: "robot", viewpoint: "front", shape: "square", decoys: ["circle", "triangle"] },
  { objectId: "ufo", viewpoint: "front", shape: "oval", decoys: ["square", "triangle"] },
  { objectId: "telescope", viewpoint: "top", shape: "circle", decoys: ["rectangle", "triangle"] },
  { objectId: "satellite", viewpoint: "front", shape: "rectangle", decoys: ["circle", "triangle"] },
];

export function viewpointTask(round: number, target: number): PracticeTask {
  const view = VIEW_CASES[round % VIEW_CASES.length]!;
  const shapeOptions = rotate([view.shape, ...view.decoys], round);
  const options = shapeOptions.map((shape, index) => ({
    id: `${shape}-${target}-${index}`,
    render: "shape" as const,
    shape,
    label: shape,
  }));
  return {
    kind: "starpathViewpoint",
    mode: "viewpoint",
    prompt: `Looking from the ${view.viewpoint}, which shape do you see?`,
    speakText: `Imagine looking at this object from the ${view.viewpoint}. Which basic shape do you see?`,
    target,
    objectId: view.objectId,
    viewpoint: view.viewpoint,
    options,
    correctOptionId: options.find((option) => option.shape === view.shape)!.id,
    feedback: {
      correct: `From the ${view.viewpoint} it looks like a ${view.shape}.`,
      wrong: `Picture the outline from the ${view.viewpoint}. It is a ${view.shape}.`,
    },
  };
}

// L3 — Choose the Best View. Which picture best shows the object's shape?
type BestCase = { objectId: StarpathBuildObjectId; shape: StarpathShape; decoys: StarpathShape[]; feature: string };
const BEST_CASES: BestCase[] = [
  { objectId: "ufo", shape: "oval", decoys: ["square", "triangle"], feature: "round saucer" },
  { objectId: "robot", shape: "square", decoys: ["circle", "oval"], feature: "boxy body" },
  { objectId: "telescope", shape: "rectangle", decoys: ["triangle", "circle"], feature: "long tube" },
];

export function bestViewTask(round: number, target: number): PracticeTask {
  const best = BEST_CASES[round % BEST_CASES.length]!;
  const shapeOptions = rotate([best.shape, ...best.decoys], round);
  const options = shapeOptions.map((shape, index) => ({
    id: `${shape}-${target}-${index}`,
    render: "shape" as const,
    shape,
    label: shape,
  }));
  return {
    kind: "starpathViewpoint",
    mode: "bestview",
    prompt: `Which picture best shows the ${best.feature}?`,
    speakText: `Choose the picture that best shows this object's ${best.feature}.`,
    target,
    objectId: best.objectId,
    options,
    correctOptionId: options.find((option) => option.shape === best.shape)!.id,
    feedback: {
      correct: `Yes — that picture shows the ${best.feature} best.`,
      wrong: `Think about the object's main shape: its ${best.feature}.`,
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createObjectOrPictureTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Object or Picture?",
      "A picture can stand for a real object.",
      "A drawing is not the object itself — it is a picture that shows it. Match each object to its picture."
    ),
    activities: [
      () => objectMatchTask(a++, ++target),
      () => objectMatchTask(b++ + 1, ++target),
      () => objectMatchTask(c++ + 2, ++target),
    ],
  };
}

export function createLookFromHereTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Look from Here",
      "An object can look different from different sides.",
      "The same object can look like different shapes from the top, front or side. Picture the outline you would see."
    ),
    activities: [
      () => viewpointTask(a++, ++target),
      () => viewpointTask(b++ + 1, ++target),
      () => viewpointTask(c++ + 2, ++target),
    ],
  };
}

export function createChooseBestViewTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Choose the Best View",
      "Some pictures show an object more usefully than others.",
      "A good picture shows the object's main shape. Choose the view that shows it best."
    ),
    activities: [
      () => bestViewTask(a++, ++target),
      () => viewpointTask(b++ + 2, ++target),
      () => bestViewTask(c++ + 1, ++target),
    ],
  };
}

export const OBJECT_OR_PICTURE_CONTENT = {
  missionBrief:
    "Geospin's log shows objects and pictures. Match each real object to the picture that stands for it.",
  successCriteria: ["tell an object from its picture", "match by the shapes shown", "choose the matching picture"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Object or Picture?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "match-picture", title: "Match the Picture", description: "Match an object to its picture.", taskKinds: ["starpathViewpoint"] },
    { key: "match-picture-2", title: "Log Check", description: "Match a trickier object.", taskKinds: ["starpathViewpoint"] },
    { key: "match-picture-3", title: "Log Master", description: "Match objects independently.", taskKinds: ["starpathViewpoint"] },
  ],
  reflection: {
    prompt: "How did you match them?",
    options: ["I matched the shapes", "A picture stands for the object", "I checked the whole outline"],
  },
  practisedSkills: ["Connect object and representation", "Match by shape", "Distinguish object from picture"],
  nextUpLabel: "Look from Here",
  createTaskSet: createObjectOrPictureTaskSet,
} satisfies StarpathLessonContent;

export const LOOK_FROM_HERE_CONTENT = {
  missionBrief:
    "Point the viewport at each object. Work out which basic shape you would see from the top or front.",
  successCriteria: ["imagine a viewpoint", "picture the outline", "name the shape you would see"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Look from Here", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "viewpoint-1", title: "From the Top", description: "Name the shape seen from a viewpoint.", taskKinds: ["starpathViewpoint"] },
    { key: "viewpoint-2", title: "From the Front", description: "Name the shape from another view.", taskKinds: ["starpathViewpoint"] },
    { key: "viewpoint-3", title: "Viewport Master", description: "Reason about a tricky view.", taskKinds: ["starpathViewpoint"] },
  ],
  reflection: {
    prompt: "What did you notice about views?",
    options: ["An object can look like different shapes", "The view depends on where you look from", "I pictured the outline"],
  },
  practisedSkills: ["Reason about viewpoints", "Connect views to basic shapes", "Visualise an outline"],
  nextUpLabel: "Choose the Best View",
  createTaskSet: createLookFromHereTaskSet,
} satisfies StarpathLessonContent;

export const CHOOSE_BEST_VIEW_CONTENT = {
  missionBrief:
    "Help Geospin label the archive. Choose the picture that shows each object's main shape most usefully.",
  successCriteria: ["find the object's main shape", "compare possible pictures", "choose the most useful view"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Choose the Best View", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "best-view-1", title: "Best Picture", description: "Choose the most useful view.", taskKinds: ["starpathViewpoint"] },
    { key: "best-view-2", title: "Viewport Check", description: "Confirm a viewpoint shape.", taskKinds: ["starpathViewpoint"] },
    { key: "best-view-3", title: "Archive Master", description: "Choose the best view independently.", taskKinds: ["starpathViewpoint"] },
  ],
  reflection: {
    prompt: "How did you choose the best picture?",
    options: ["It showed the main shape", "It was the most useful view", "I compared the choices"],
  },
  practisedSkills: ["Identify a useful representation", "Compare views", "Justify a view choice"],
  nextUpLabel: "Week 4 Voyage Quiz",
  createTaskSet: createChooseBestViewTaskSet,
} satisfies StarpathLessonContent;
