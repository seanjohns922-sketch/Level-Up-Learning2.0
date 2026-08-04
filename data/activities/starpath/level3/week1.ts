import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { L3_OBJECT_IDS, getL3Object, l3ObjectSvg, type L3Object } from "./l3-objects";

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

// L2 — a scene of objects; find and tap the named one.
export function findObjectTask(round: number, target: number): PracticeTask {
  const wanted = getL3Object(L3_OBJECT_IDS[round % L3_OBJECT_IDS.length]!);
  const others = rotate(L3_OBJECT_IDS.filter((id) => id !== wanted.id), round).slice(0, 3).map(getL3Object);
  const scene = rotate([wanted, ...others], round + 2).map(sceneOf);
  return {
    kind: "starpathObject",
    mode: "find",
    prompt: `Find the ${wanted.spaceName}.`,
    speakText: `Find the ${wanted.spaceName} — a ${wanted.label}. Tap it.`,
    target,
    scene,
    correctObjectId: wanted.id,
    feedback: { correct: `That is the ${wanted.spaceName}.`, wrong: `Look for the ${wanted.label}.` },
  };
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
      () => nameObjectTask(a++ + 3, ++target),
      () => findObjectTask(b++ + 3, ++target),
      () => nameObjectTask(c++ + 4, ++target),
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
    "Each space object is somewhere in Starpath. Read the name and find that object.",
  successCriteria: ["read the object name", "find it in the scene", "tap the right object"],
  artworkSrc: LEVEL_THREE_ARTWORK,
  teaching: { title: "Find the Space Object", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Find It", description: "Find the named object.", taskKinds: ["starpathObject"] },
    { key: "find-2", title: "Find Another", description: "Find the next object.", taskKinds: ["starpathObject"] },
    { key: "find-3", title: "Object Finder", description: "Find objects on your own.", taskKinds: ["starpathObject"] },
  ],
  reflection: {
    prompt: "How did you find the object?",
    options: ["I read the name", "I looked at each object", "I matched the shape"],
  },
  practisedSkills: ["Recognise a named object", "Find an object in a scene", "Match name to object"],
  nextUpLabel: "3D Object Challenge",
  createTaskSet: createFindTheObjectTaskSet,
} satisfies StarpathLessonContent;

export const OBJECT_CHALLENGE_CONTENT = {
  missionBrief:
    "Mixed review — name objects and find them on your own.",
  successCriteria: ["name any object", "find any object", "answer on your own"],
  artworkSrc: LEVEL_THREE_ARTWORK,
  teaching: { title: "3D Object Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "name-1", title: "Name It", description: "Name a 3D object.", taskKinds: ["starpathObject"] },
    { key: "find-1", title: "Find It", description: "Find a named object.", taskKinds: ["starpathObject"] },
    { key: "name-2", title: "Object Champion", description: "Recognise objects independently.", taskKinds: ["starpathObject"] },
  ],
  reflection: {
    prompt: "What did you learn about 3D objects?",
    options: ["Each object has a name", "I can find an object by its name", "Objects have different shapes"],
  },
  practisedSkills: ["Recognise 3D objects", "Name and find objects", "Work independently"],
  nextUpLabel: "Week 1 Voyage Quiz",
  createTaskSet: create3DObjectChallengeTaskSet,
} satisfies StarpathLessonContent;
