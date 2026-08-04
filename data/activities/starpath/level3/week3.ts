import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, type L3ObjectId } from "./l3-objects";
import { LEVEL_THREE_ARTWORK } from "./week1";

// Level 3 · Week 3 — Building Starpath (AC9M3SP01). Construct models from
// familiar objects, choose objects whose features suit a purpose, and explain
// why. The progression is make -> choose -> justify.

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}
function optionOf(id: L3ObjectId, reason?: string) {
  const o = getL3Object(id);
  return { id: o.id, svg: l3ObjectSvg(o, { size: 120 }), label: o.label, spaceName: o.spaceName, reason };
}

type ModelPart = { id: string; label: string; objectId: L3ObjectId };
type Model = { name: string; prompt: string; parts: ModelPart[] };

const MODELS: Model[] = [
  {
    name: "Moon Rover",
    prompt: "Build the Moon Rover from four 3D objects.",
    parts: [
      { id: "chassis", label: "Long chassis", objectId: "prism" },
      { id: "cabin", label: "Driver cabin", objectId: "cube" },
      { id: "wheel-left", label: "Left wheel", objectId: "cylinder" },
      { id: "wheel-right", label: "Right wheel", objectId: "cylinder" },
    ],
  },
  {
    name: "Supply Rocket",
    prompt: "Build the Supply Rocket from three 3D objects.",
    parts: [
      { id: "nose", label: "Pointed nose", objectId: "cone" },
      { id: "body", label: "Long body", objectId: "cylinder" },
      { id: "cargo", label: "Cargo module", objectId: "cube" },
    ],
  },
  {
    name: "Signal Beacon",
    prompt: "Build the Signal Beacon from three 3D objects.",
    parts: [
      { id: "base", label: "Stable base", objectId: "prism" },
      { id: "mast", label: "Tall mast", objectId: "cylinder" },
      { id: "light", label: "Signal light", objectId: "sphere" },
    ],
  },
];

export function buildRoverTask(round: number, target: number): PracticeTask {
  const model = MODELS[round % MODELS.length]!;
  const pieces = rotate(
    model.parts.map((part, index) => ({
      ...optionOf(part.objectId),
      id: `${model.name}-${part.id}-${index}`,
      objectId: part.objectId,
    })),
    round + 1
  );
  return {
    kind: "starpathObject",
    mode: "build",
    prompt: model.prompt,
    speakText: `${model.prompt} Choose each object, then place it in the part it suits.`,
    target,
    modelName: model.name,
    pieces,
    slots: model.parts.map((part) => ({ id: part.id, label: part.label, correctObjectId: part.objectId })),
    feedback: { correct: `${model.name} complete! Every object suits its job.`, wrong: "Think about the part's job and the object's useful features." },
  };
}

// Quiz questions assess one construction decision at a time so the weekly quiz
// remains fifteen independent questions rather than five whole model builds.
type BuildDecision = { prompt: string; correct: L3ObjectId; distractors: [L3ObjectId, L3ObjectId] };
const BUILD_DECISIONS: BuildDecision[] = [
  { prompt: "Which object should make the Moon Rover's long chassis?", correct: "prism", distractors: ["sphere", "cone"] },
  { prompt: "Which object should make a rover wheel?", correct: "cylinder", distractors: ["sphere", "cube"] },
  { prompt: "Which object should make the Supply Rocket's pointed nose?", correct: "cone", distractors: ["cube", "cylinder"] },
  { prompt: "Which object should make the Signal Beacon's tall mast?", correct: "cylinder", distractors: ["cube", "sphere"] },
  { prompt: "Which object should make the Signal Beacon's stable base?", correct: "prism", distractors: ["sphere", "cone"] },
];
function buildModelQuizTask(round: number, target: number): PracticeTask {
  const decision = BUILD_DECISIONS[round % BUILD_DECISIONS.length]!;
  return {
    kind: "starpathObject",
    mode: "find",
    prompt: decision.prompt,
    speakText: decision.prompt,
    target,
    scene: rotate([optionOf(decision.correct), optionOf(decision.distractors[0]), optionOf(decision.distractors[1])], round + 1),
    correctObjectId: decision.correct,
    feedback: { correct: "That object's features suit the part.", wrong: "Think about what the part must do." },
  };
}

// L2 — Choose the best object for a stated NEED. Options are objects only (no
// reason handed over): the child must decode the requirement into a feature and
// pick the object. Some needs are compound (roll AND stack) so a single feature
// is not enough.
type Need = { prompt: string; speak: string; correct: L3ObjectId; distractors: [L3ObjectId, L3ObjectId] };
const NEEDS: Need[] = [
  { prompt: "A rover wheel must roll and stay on its axle. Which object is best?", speak: "A rover wheel must roll and stay on its axle. Which object is best?", correct: "cylinder", distractors: ["sphere", "cube"] },
  { prompt: "A long platform must stay still and support cargo. Which object is best?", speak: "A long platform must stay still and support cargo. Which object is best?", correct: "prism", distractors: ["sphere", "cone"] },
  { prompt: "The fuel tank must roll into place AND stack. Which object is best?", speak: "The fuel tank must roll into place and also stack. Which object is best?", correct: "cylinder", distractors: ["sphere", "cube"] },
  { prompt: "The tip of the rocket must come to a point. Which object is best?", speak: "The tip of the rocket must come to a point. Which object is best?", correct: "cone", distractors: ["cube", "cylinder"] },
  { prompt: "Cargo boxes must stack neatly without rolling. Which object is best?", speak: "Cargo boxes must stack neatly without rolling. Which object is best?", correct: "cube", distractors: ["sphere", "cone"] },
  { prompt: "A signal light should look round from every direction. Which object is best?", speak: "A signal light should look round from every direction. Which object is best?", correct: "sphere", distractors: ["cube", "prism"] },
];
export function chooseBestShapeTask(round: number, target: number): PracticeTask {
  const n = NEEDS[round % NEEDS.length]!;
  const scene = rotate([optionOf(n.correct), optionOf(n.distractors[0]), optionOf(n.distractors[1])], round + 1);
  return {
    kind: "starpathObject",
    mode: "find",
    prompt: n.prompt,
    speakText: n.speak,
    target,
    scene,
    correctObjectId: n.correct,
    feedback: { correct: `Yes — the ${getL3Object(n.correct).spaceName} fits the job.`, wrong: "Work out what feature the job needs, then choose the object." },
  };
}

// L3 — Justify: the object is given; the child chooses WHY it suits the job.
// The reason is the answer, so it can't be read off the object choice.
type Justify = { objectId: L3ObjectId; prompt: string; correct: string; wrong: [string, string] };
const JUSTIFY: Justify[] = [
  { objectId: "cylinder", prompt: "Why is the Fuel Tank shape useful for a rover wheel?", correct: "Its curved surface rolls and its flat ends keep it steady", wrong: ["It rolls in every direction", "It has a pointed end"] },
  { objectId: "cone", prompt: "Why is the Rocket Nose the best tip?", correct: "Because it comes to a point", wrong: ["Because it stacks", "Because it is a flat box"] },
  { objectId: "cube", prompt: "Why is the Cargo Crate a good storage box?", correct: "Its flat surfaces let it stack", wrong: ["Its curved surface makes it roll", "It has a point"] },
  { objectId: "cylinder", prompt: "Why can the Fuel Tank roll and stack?", correct: "It has one curved surface and two flat ends", wrong: ["It has only flat surfaces", "It has a pointed end"] },
  { objectId: "prism", prompt: "Why is the long Supply Block useful as a platform?", correct: "It is long, flat and stable", wrong: ["It rolls in every direction", "It has a pointed end"] },
  { objectId: "sphere", prompt: "Why is the Planet Ball useful as a signal globe?", correct: "It looks round from every direction", wrong: ["It stacks neatly", "It has a long flat surface"] },
];
export function spaceEngineeringTask(round: number, target: number): PracticeTask {
  const j = JUSTIFY[round % JUSTIFY.length]!;
  const options = rotate(
    [
      { id: "correct", label: j.correct },
      { id: "w0", label: j.wrong[0] },
      { id: "w1", label: j.wrong[1] },
    ],
    round + 1
  );
  return {
    kind: "starpathObject",
    mode: "name",
    prompt: j.prompt,
    speakText: `${j.prompt} Choose the reason.`,
    target,
    scene: [optionOf(j.objectId)],
    options,
    correctOptionId: "correct",
    feedback: { correct: `Yes — ${j.correct.toLowerCase()}.`, wrong: "Think about the object's feature and what the job needs." },
  };
}

function teaching(variant: "objects3d" | "objectFeatures", heading: string, prompt: string, speakText: string) {
  let t = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant, heading, prompt, speakText, target: ++t }) satisfies PracticeTask;
}
const INTRO = teaching(
  "objectFeatures",
  "Choose the best object for the job",
  "Every part needs the right object.",
  "Every part needs the right object. A rover wheel needs a cylinder because its curved surface rolls and its flat ends keep it steady. A rocket nose needs a cone because it comes to a point. Choose objects whose features suit each job, then explain why."
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

export const createBuildTheRoverTaskSet = (): RealmLessonTaskSet => makeSet(10, buildRoverTask);
export const createBuildModelsQuizTaskSet = (): RealmLessonTaskSet => makeSet(15, buildModelQuizTask);
export const createChooseBestShapeTaskSet = (): RealmLessonTaskSet => makeSet(20, chooseBestShapeTask);
export const createSpaceEngineeringTaskSet = (): RealmLessonTaskSet => makeSet(30, spaceEngineeringTask);

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

export const BUILD_THE_ROVER_CONTENT = content("Build Starpath Models", "Construct complete Starpath models by placing several 3D objects into the parts they suit.", ["choose useful 3D objects", "place every object in a model", "explain how a feature helps"], ["Moon Rover", "Supply Rocket", "Signal Beacon"], "How did you choose each part?", ["I thought about the part's job", "I matched useful features", "I built the whole model"], ["Construct with 3D objects", "Connect feature and purpose", "Use rectangular prisms"], "Choose the Best Shape", createBuildTheRoverTaskSet);
export const CHOOSE_BEST_SHAPE_CONTENT = content("Choose the Best Shape", "Choose the best object for the job — and pick the reason why.", ["read the job", "choose the object", "say why it fits"], ["Wheel", "Nose", "Best Shape"], "How did you choose?", ["I thought about the job", "I chose the object that fits", "I could say why"], ["Choose for a purpose", "Explain why", "Connect feature and use"], "Space Engineering", createChooseBestShapeTaskSet);
export const SPACE_ENGINEERING_CONTENT = content("Space Engineering", "Be a space engineer — choose and justify the best object for each design.", ["read each design job", "choose the best object", "justify the choice"], ["Design 1", "Design 2", "Engineer"], "What did you learn about choosing objects?", ["The feature must suit the job", "I can explain my choice", "The best-looking object is not always best"], ["Choose for a purpose", "Justify a design choice", "Work independently"], "Week 3 Voyage Quiz", createSpaceEngineeringTaskSet);
