import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, listL3Objects, type L3Object, type L3ObjectId } from "./l3-objects";
import { LEVEL_THREE_ARTWORK } from "./week1";

// Level 3 · Week 2 — Object Detectives (AC9M3SP01). Compare and classify objects
// by faces/surfaces, edges and vertices. Every task shows
// a scene with exactly one object satisfying the target rule (unique by
// construction), so the question is always well-posed.

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}
function sceneOf(obj: L3Object) {
  return { id: obj.id, svg: l3ObjectSvg(obj, { size: 120 }), label: obj.label, spaceName: obj.spaceName };
}

type Pred = (o: L3Object) => boolean;

// Build a find task where the scene has exactly one object matching `pred`.
function featureFind(
  round: number,
  target: number,
  prompt: string,
  speakText: string,
  pred: Pred,
  correct: (o: L3Object) => string,
  wrong: string
): PracticeTask {
  const all = listL3Objects();
  const satisfiers = all.filter(pred);
  const answer = satisfiers[round % satisfiers.length]!;
  const nonsat = rotate(all.filter((o) => !pred(o)), round).slice(0, 3);
  const scene = rotate([answer, ...nonsat], round + 1).map(sceneOf);
  return {
    kind: "starpathObject",
    mode: "find",
    prompt,
    speakText,
    target,
    scene,
    correctObjectId: answer.id,
    feedback: { correct: correct(answer), wrong },
  };
}

// L1 — clue that identifies exactly one object across the whole set.
type Clue = { prompt: string; speak: string; pred: Pred };
const CLUES: Clue[] = [
  { prompt: "Which object has five faces and five vertices?", speak: "Which object has five flat faces, eight edges and five vertices?", pred: (o) => o.flatFaces === 5 && o.vertices === 5 },
  { prompt: "Which object has no edges or vertices?", speak: "Which object has one curved surface and no edges or vertices?", pred: (o) => o.edges === 0 && o.vertices === 0 },
  { prompt: "Which object has two flat faces and no vertices?", speak: "Which object has two flat circular faces, two edges and no vertices?", pred: (o) => o.flatFaces === 2 && o.vertices === 0 },
  { prompt: "Which object has one vertex and one edge?", speak: "Which object has one vertex and one circular edge?", pred: (o) => o.vertices === 1 && o.edges === 1 },
];
export function whichObjectTask(round: number, target: number): PracticeTask {
  const clue = CLUES[round % CLUES.length]!;
  return featureFind(
    round,
    target,
    clue.prompt,
    clue.speak,
    clue.pred,
    (o) => `Yes — the ${o.spaceName} is a ${o.label}.`,
    "Read the clue again and check each object's features."
  );
}

// L2 — compare TWO objects and choose the true statement about them.
type CompareCase = { a: L3ObjectId; b: L3ObjectId; prompt: string; correct: string; wrong: [string, string] };
const COMPARE_CASES: CompareCase[] = [
  { a: "cube", b: "prism", prompt: "What is the same about these two?", correct: "Both have 12 edges and 8 vertices", wrong: ["Both have a curved surface", "Both have 5 faces"] },
  { a: "sphere", b: "cylinder", prompt: "What is different about these two?", correct: "The cylinder has two flat faces", wrong: ["The sphere has two edges", "Both have vertices"] },
  { a: "cone", b: "pyramid", prompt: "What is the same about these two?", correct: "Both have at least one vertex", wrong: ["Both have a curved surface", "Both have 5 faces"] },
  { a: "cylinder", b: "cone", prompt: "What is different about these two?", correct: "The cone has one vertex", wrong: ["The cylinder has 8 vertices", "The cone has no edge"] },
  { a: "cube", b: "pyramid", prompt: "What is different about these two?", correct: "They have different numbers of faces", wrong: ["Both have 8 vertices", "Both have a curved surface"] },
];
export function compareObjectsTask(round: number, target: number): PracticeTask {
  const c = COMPARE_CASES[round % COMPARE_CASES.length]!;
  const options = rotate(
    [
      { id: "correct", label: c.correct },
      { id: "w0", label: c.wrong[0] },
      { id: "w1", label: c.wrong[1] },
    ],
    round + 1
  );
  return {
    kind: "starpathObject",
    mode: "compare",
    prompt: c.prompt,
    speakText: `Look at both objects. ${c.prompt}`,
    target,
    scene: [sceneOf(getL3Object(c.a)), sceneOf(getL3Object(c.b))],
    options,
    correctOptionId: "correct",
    feedback: { correct: `Yes — ${c.correct.toLowerCase()}.`, wrong: "Compare the faces, surfaces, edges and vertices of both objects." },
  };
}

// Quiz-sized compound classification questions retain a single answer.
type FeatureCase = { prompt: string; speak: string; pred: Pred; word: string };
const SORT_CASES: FeatureCase[] = [
  { prompt: "Which object has exactly five flat faces?", speak: "Which object has exactly five flat faces?", pred: (o) => o.flatFaces === 5, word: "has exactly five flat faces" },
  { prompt: "Which object has two edges and no vertices?", speak: "Which object has two circular edges and no vertices?", pred: (o) => o.edges === 2 && o.vertices === 0, word: "has two edges and no vertices" },
  { prompt: "Which object has one curved surface and no flat faces?", speak: "Which object has one curved surface and no flat faces?", pred: (o) => o.curvedSurfaces === 1 && o.flatFaces === 0, word: "has one curved surface and no flat faces" },
];
export function objectSortQuizTask(round: number, target: number): PracticeTask {
  const c = SORT_CASES[round % SORT_CASES.length]!;
  return featureFind(round, target, c.prompt, c.speak, c.pred, (o) => `Yes — the ${o.spaceName} ${c.word}.`, `Look for the object that ${c.word}.`);
}

type ClassificationCase = {
  prompt: string;
  speak: string;
  groups: [{ id: string; label: string; speakText: string }, { id: string; label: string; speakText: string }];
  groupFor: (object: L3Object) => string;
};

const CLASSIFICATIONS: ClassificationCase[] = [
  {
    prompt: "Sort every object by whether it has a curved surface.",
    speak: "Sort every object. Put objects with a curved surface in Curved surface. Put the others in Flat faces only.",
    groups: [
      { id: "curved", label: "Curved surface", speakText: "Has a curved surface" },
      { id: "flat", label: "Flat faces only", speakText: "Has flat faces only" },
    ],
    groupFor: (object) => (object.curvedSurfaces ? "curved" : "flat"),
  },
  {
    prompt: "Sort every object by whether it has vertices.",
    speak: "Sort every object. Put objects with one or more vertices in Has vertices. Put the others in No vertices.",
    groups: [
      { id: "vertices", label: "Has vertices", speakText: "Has vertices" },
      { id: "no-vertices", label: "No vertices", speakText: "Has no vertices" },
    ],
    groupFor: (object) => (object.vertices ? "vertices" : "no-vertices"),
  },
  {
    prompt: "Sort every object by whether it has eight vertices.",
    speak: "Sort every object. Put objects with eight vertices in Eight vertices. Put the others in Not eight vertices.",
    groups: [
      { id: "eight", label: "8 vertices", speakText: "Eight vertices" },
      { id: "not-eight", label: "Not 8 vertices", speakText: "Not eight vertices" },
    ],
    groupFor: (object) => (object.vertices === 8 ? "eight" : "not-eight"),
  },
  {
    prompt: "Sort every object by whether it has six flat faces.",
    speak: "Sort every object. Put objects with six flat faces in Six faces. Put the others in Not six faces.",
    groups: [
      { id: "six", label: "6 flat faces", speakText: "Six flat faces" },
      { id: "not-six", label: "Not 6 flat faces", speakText: "Not six flat faces" },
    ],
    groupFor: (object) => (object.flatFaces === 6 ? "six" : "not-six"),
  },
];

export function objectSortTask(round: number, target: number): PracticeTask {
  const classification = CLASSIFICATIONS[round % CLASSIFICATIONS.length]!;
  const objects = rotate(listL3Objects(), round + 1);
  return {
    kind: "starpathObject",
    mode: "classify",
    prompt: classification.prompt,
    speakText: classification.speak,
    target,
    scene: objects.map(sceneOf),
    groups: classification.groups,
    assignments: Object.fromEntries(objects.map((object) => [object.id, classification.groupFor(object)])),
    feedback: {
      correct: "Excellent sorting — every object is in the group that matches its features.",
      wrong: "Check what the selected object does, then try its group again.",
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let t = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant: "objectFeatures", heading, prompt, speakText, target: ++t }) satisfies PracticeTask;
}
const INTRO = teaching(
  "Compare object features",
  "Classify objects using their key features.",
  "Count flat faces, curved surfaces, edges and vertices. Use the same feature rule for every object when you compare and classify them."
);

function makeSet(start: number, gen: (round: number, target: number) => PracticeTask): RealmLessonTaskSet {
  let target = start;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: INTRO,
    activities: [
      () => gen(a++, ++target),
      () => gen(b++ + 1, ++target),
      () => gen(c++ + 2, ++target),
    ],
  };
}

export const createWhichObjectTaskSet = (): RealmLessonTaskSet => makeSet(10, whichObjectTask);
export const createCompareObjectsTaskSet = (): RealmLessonTaskSet => makeSet(20, compareObjectsTask);
export const createObjectSortTaskSet = (): RealmLessonTaskSet => makeSet(30, objectSortTask);
export const createObjectSortQuizTaskSet = (): RealmLessonTaskSet => makeSet(40, objectSortQuizTask);

function content(title: string, brief: string, criteria: [string, string, string], acts: [string, string, string], reflectPrompt: string, reflectOpts: [string, string, string], skills: [string, string, string], nextUp: string, createTaskSet: () => RealmLessonTaskSet): StarpathLessonContent {
  return {
    missionBrief: brief,
    successCriteria: criteria,
    artworkSrc: LEVEL_THREE_ARTWORK,
    teaching: { title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: [
      { key: "a1", title: acts[0], description: acts[0], taskKinds: ["starpathObject"] },
      { key: "a2", title: acts[1], description: acts[1], taskKinds: ["starpathObject"] },
      { key: "a3", title: acts[2], description: acts[2], taskKinds: ["starpathObject"] },
    ],
    reflection: { prompt: reflectPrompt, options: reflectOpts },
    practisedSkills: skills,
    nextUpLabel: nextUp,
    createTaskSet,
  } satisfies StarpathLessonContent;
}

export const WHICH_OBJECT_CONTENT = content("Which Object Is It?", "Be an Object Detective. Use a feature clue to work out which 3D object it is.", ["read the clue", "check the features", "find the object"], ["Clue 1", "Clue 2", "Detective"], "How did you solve the clue?", ["I read the features", "I checked each object", "I matched the clue"], ["Use feature clues", "Reason about objects", "Identify an object"], "Compare Space Objects", createWhichObjectTaskSet);
export const COMPARE_OBJECTS_CONTENT = content("Compare Space Objects", "Compare objects by their faces, surfaces, edges and vertices.", ["examine both objects", "count key features", "choose the true comparison"], ["Compare Faces", "Compare Edges", "Compare Vertices"], "How did you compare?", ["I counted faces", "I counted edges and vertices", "I compared the features"], ["Compare key features", "Use precise geometry words", "Reason about objects"], "Space Object Sort", createCompareObjectsTaskSet);
export const OBJECT_SORT_CONTENT = content("Space Object Sort", "Classify every space object into groups using one shared feature.", ["read the sorting rule", "check every object", "classify the whole set"], ["Roll Sort", "Surface Sort", "Object Classifier"], "What helped you classify the objects?", ["I tested the same feature each time", "I checked every object", "I noticed one object can have several features"], ["Classify a complete set", "Sort by one feature", "Explain a classification"], "Week 2 Voyage Quiz", createObjectSortTaskSet);
