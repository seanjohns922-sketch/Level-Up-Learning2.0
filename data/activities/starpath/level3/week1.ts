import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { L3_OBJECT_IDS, getL3Object, l3ObjectSvg, type L3Object, type L3ObjectId } from "./l3-objects";

// Level 3 · Week 1 — 3D Discoveries (AC9M3SP01). Recognise and name the five
// Starpath 3D objects: cube, sphere, cylinder, cone, rectangular prism.

export const LEVEL_THREE_ARTWORK = "/images/starpath-home-bg-y3.png";

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function sceneOf(obj: L3Object) {
  return { id: obj.id, svg: l3ObjectSvg(obj, { size: 120 }), label: obj.label, spaceName: obj.spaceName };
}

// L1 — show one object, choose its geometry name from text options.
export function nameObjectTask(round: number, target: number): PracticeTask {
  const obj = getL3Object(L3_OBJECT_IDS[round % L3_OBJECT_IDS.length]!);
  const distractors = rotate(L3_OBJECT_IDS.filter((id) => id !== obj.id), round).slice(0, 2).map(getL3Object);
  const options = rotate([obj, ...distractors], round + 1).map((o) => ({ id: o.id, label: o.label }));
  return {
    kind: "starpathObject",
    mode: "name",
    prompt: "What 3D object is this?",
    speakText: "Look at the space object. What is it called?",
    target,
    scene: [sceneOf(obj)],
    options,
    correctOptionId: obj.id,
    feedback: { correct: `Yes — that is a ${obj.label}.`, wrong: `Look at its shape — this one is a ${obj.label}.` },
  };
}

type ObjectClue = { objectId: L3ObjectId; prompt: string; speakText: string };
const CONTEXT_CLUES: ObjectClue[] = [
  { objectId: "cube", prompt: "Find the object shaped like a cargo crate.", speakText: "Find the solid block shaped like a cargo crate." },
  { objectId: "sphere", prompt: "Find the object shaped like a planet.", speakText: "Find the object that is round all over, like a planet." },
  { objectId: "cylinder", prompt: "Find the object shaped like a fuel tank.", speakText: "Find the object shaped like a fuel tank, with a curved surface and two flat ends." },
  { objectId: "cone", prompt: "Find the object shaped like a rocket nose.", speakText: "Find the object shaped like a rocket nose, with one point." },
  { objectId: "prism", prompt: "Find the object shaped like a long supply box.", speakText: "Find the long box-shaped object used for supplies." },
];

const FEATURE_CLUES: ObjectClue[] = [
  { objectId: "cube", prompt: "Find the equal block with only flat surfaces.", speakText: "Find the equal block with only flat surfaces." },
  { objectId: "sphere", prompt: "Find the object that is curved all over.", speakText: "Find the object that is curved all over and can roll in every direction." },
  { objectId: "cylinder", prompt: "Find the object that can roll and stack.", speakText: "Find the object with one curved surface and two flat ends. It can roll and stack." },
  { objectId: "cone", prompt: "Find the object with one point and one flat end.", speakText: "Find the object with one point, one curved surface and one flat end." },
  { objectId: "prism", prompt: "Find the long box with only flat surfaces.", speakText: "Find the long box-shaped object with only flat surfaces." },
];

function clueObjectTask(round: number, target: number, clues: readonly ObjectClue[]): PracticeTask {
  const clue = clues[round % clues.length]!;
  const wanted = getL3Object(clue.objectId);
  const others = rotate(L3_OBJECT_IDS.filter((id) => id !== wanted.id), round).slice(0, 3).map(getL3Object);
  return {
    kind: "starpathObject",
    mode: "find",
    prompt: clue.prompt,
    speakText: clue.speakText,
    target,
    scene: rotate([wanted, ...others], round + 2).map(sceneOf),
    correctObjectId: wanted.id,
    feedback: { correct: `Yes — that is the ${wanted.spaceName}, a ${wanted.label}.`, wrong: "Listen to the clue and compare every object's shape." },
  };
}

// L2 — identify familiar 3D objects from their use and environmental context.
export function findObjectTask(round: number, target: number): PracticeTask {
  return clueObjectTask(round, target, CONTEXT_CLUES);
}

// L3 — identify objects independently from informal geometric features.
export function featureObjectTask(round: number, target: number): PracticeTask {
  return clueObjectTask(round, target, FEATURE_CLUES);
}

function teaching(heading: string, prompt: string, speakText: string) {
  let t = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant: "objects3d", heading, prompt, speakText, target: ++t }) satisfies PracticeTask;
}

const INTRO = teaching(
  "Meet the space objects",
  "These are the five Starpath 3D objects.",
  "Meet the five space objects: the Cargo Crate is a cube, the Planet Ball is a sphere, the Fuel Tank is a cylinder, the Rocket Nose is a cone, and the Supply Box is a rectangular prism."
);

export function createMeetTheObjectsTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: INTRO,
    activities: [
      () => nameObjectTask(a++, ++target),
      () => nameObjectTask(b++ + 1, ++target),
      () => nameObjectTask(c++ + 2, ++target),
    ],
  };
}

export function createFindTheObjectTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: INTRO,
    activities: [
      () => findObjectTask(a++, ++target),
      () => findObjectTask(b++ + 1, ++target),
      () => findObjectTask(c++ + 2, ++target),
    ],
  };
}

export function create3DObjectChallengeTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: INTRO,
    activities: [
      () => featureObjectTask(a++ + 3, ++target),
      () => findObjectTask(b++ + 3, ++target),
      () => featureObjectTask(c++ + 4, ++target),
    ],
  };
}

export const MEET_THE_OBJECTS_CONTENT = {
  missionBrief:
    "Welcome, Cosmic Navigator. Starpath is full of 3D objects. Meet the five and learn their names.",
  successCriteria: ["name the five 3D objects", "recognise each object", "tell objects apart"],
  artworkSrc: LEVEL_THREE_ARTWORK,
  teaching: { title: "Meet the Space Objects", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "name-1", title: "Name It", description: "Name the 3D object.", taskKinds: ["starpathObject"] },
    { key: "name-2", title: "Name Another", description: "Name the next object.", taskKinds: ["starpathObject"] },
    { key: "name-3", title: "Object Namer", description: "Name objects on your own.", taskKinds: ["starpathObject"] },
  ],
  reflection: {
    prompt: "How did you know the object?",
    options: ["I looked at its shape", "I remembered its name", "I told it from the others"],
  },
  practisedSkills: ["Recognise 3D objects", "Name 3D objects", "Tell objects apart"],
  nextUpLabel: "Find the Space Object",
  createTaskSet: createMeetTheObjectsTaskSet,
} satisfies StarpathLessonContent;

export const FIND_THE_OBJECT_CONTENT = {
  missionBrief:
    "Recognise familiar 3D objects in Starpath by what they resemble and how they are used.",
  successCriteria: ["listen to an object clue", "connect an object to its use", "find it in the scene"],
  artworkSrc: LEVEL_THREE_ARTWORK,
  teaching: { title: "Find the Space Object", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Object Clues", description: "Find an object from a familiar use.", taskKinds: ["starpathObject"] },
    { key: "find-2", title: "Space Equipment", description: "Connect objects to Starpath equipment.", taskKinds: ["starpathObject"] },
    { key: "find-3", title: "Object Finder", description: "Recognise objects in context.", taskKinds: ["starpathObject"] },
  ],
  reflection: {
    prompt: "How did you find the object?",
    options: ["I listened to the clue", "I thought about the object's use", "I matched the shape"],
  },
  practisedSkills: ["Recognise an object in context", "Connect shape and use", "Find an object from a clue"],
  nextUpLabel: "3D Object Challenge",
  createTaskSet: createFindTheObjectTaskSet,
} satisfies StarpathLessonContent;

export const OBJECT_CHALLENGE_CONTENT = {
  missionBrief:
    "Use informal feature clues to distinguish the five Starpath 3D objects.",
  successCriteria: ["notice flat and curved surfaces", "recognise a feature clue", "identify the object independently"],
  artworkSrc: LEVEL_THREE_ARTWORK,
  teaching: { title: "3D Object Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "name-1", title: "Surface Clues", description: "Identify objects by flat and curved surfaces.", taskKinds: ["starpathObject"] },
    { key: "find-1", title: "Object in Context", description: "Recognise an object by its use.", taskKinds: ["starpathObject"] },
    { key: "name-2", title: "Object Detective", description: "Combine context and feature clues.", taskKinds: ["starpathObject"] },
  ],
  reflection: {
    prompt: "What did you learn about 3D objects?",
    options: ["I noticed its surfaces", "I thought about what it does", "I compared it with other objects"],
  },
  practisedSkills: ["Recognise 3D objects", "Use informal feature clues", "Explain how objects differ"],
  nextUpLabel: "Week 1 Voyage Quiz",
  createTaskSet: create3DObjectChallengeTaskSet,
} satisfies StarpathLessonContent;
