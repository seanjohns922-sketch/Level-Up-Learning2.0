import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, type L3ObjectId } from "./l3-objects";
import { LEVEL_THREE_ARTWORK } from "./week1";

// Level 3 · Week 3 — Building Starpath (AC9M3SP01). Choose the object whose
// feature suits a purpose, and explain why. Options carry a short reason so the
// child connects feature → function (the "explain why" the descriptor asks for).

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}
function optionOf(id: L3ObjectId, reason?: string) {
  const o = getL3Object(id);
  return { id: o.id, svg: l3ObjectSvg(o, { size: 120 }), label: o.label, spaceName: o.spaceName, reason };
}

// L1 — Build the Rover: choose the object that suits each part.
type Part = { prompt: string; speak: string; correct: L3ObjectId; distractors: [L3ObjectId, L3ObjectId] };
const PARTS: Part[] = [
  { prompt: "Choose the nose for the rocket.", speak: "The rocket needs a pointed nose. Which object should be the nose?", correct: "cone", distractors: ["cube", "sphere"] },
  { prompt: "Choose the wheels for the rover.", speak: "The rover needs wheels that roll. Which object should be a wheel?", correct: "sphere", distractors: ["cube", "prism"] },
  { prompt: "Choose the body for the rocket.", speak: "The rocket needs a long round body. Which object should be the body?", correct: "cylinder", distractors: ["cube", "cone"] },
];
export function buildRoverTask(round: number, target: number): PracticeTask {
  const part = PARTS[round % PARTS.length]!;
  const scene = rotate([optionOf(part.correct), optionOf(part.distractors[0]), optionOf(part.distractors[1])], round + 1);
  return {
    kind: "starpathObject",
    mode: "find",
    prompt: part.prompt,
    speakText: part.speak,
    target,
    scene,
    correctObjectId: part.correct,
    feedback: { correct: `Yes — the ${getL3Object(part.correct).spaceName} fits.`, wrong: "Think about which object's shape suits that part." },
  };
}

// L2 — Choose the best object for a stated NEED. Options are objects only (no
// reason handed over): the child must decode the requirement into a feature and
// pick the object. Some needs are compound (roll AND stack) so a single feature
// is not enough.
type Need = { prompt: string; speak: string; correct: L3ObjectId; distractors: [L3ObjectId, L3ObjectId] };
const NEEDS: Need[] = [
  { prompt: "The rover needs wheels that roll. Which object is best?", speak: "The rover needs wheels that roll. Which object is best?", correct: "sphere", distractors: ["cube", "prism"] },
  { prompt: "The base must stay still and not roll away. Which object is best?", speak: "The base must stay still and not roll away. Which object is best?", correct: "cube", distractors: ["sphere", "cone"] },
  { prompt: "The fuel tank must roll into place AND stack. Which object is best?", speak: "The fuel tank must roll into place and also stack. Which object is best?", correct: "cylinder", distractors: ["sphere", "cube"] },
  { prompt: "The tip of the rocket must come to a point. Which object is best?", speak: "The tip of the rocket must come to a point. Which object is best?", correct: "cone", distractors: ["cube", "cylinder"] },
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
  { objectId: "sphere", prompt: "Why is the Planet Ball the best wheel?", correct: "Because it rolls", wrong: ["Because it stacks", "Because it has a point"] },
  { objectId: "cone", prompt: "Why is the Rocket Nose the best tip?", correct: "Because it comes to a point", wrong: ["Because it stacks", "Because it is a flat box"] },
  { objectId: "cube", prompt: "Why is the Cargo Crate a good storage box?", correct: "Because it has flat sides and stacks", wrong: ["Because it rolls", "Because it has a point"] },
  { objectId: "cylinder", prompt: "Why can the Fuel Tank roll and stack?", correct: "Because it is round with a flat top", wrong: ["Because it has a point", "Because it is a flat box"] },
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
  "Every part needs the right object. A wheel must roll, so a round object is best. A nose needs a point, so a cone is best. Choose the object whose feature suits the job, and say why."
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

export const BUILD_THE_ROVER_CONTENT = content("Build the Rover", "Build a space vehicle. Choose the right 3D object for each part.", ["look at each part", "choose a suiting object", "build the vehicle"], ["Nose", "Wheels", "Body"], "How did you choose each part?", ["I thought about the part's job", "I matched the object's shape", "I built it piece by piece"], ["Match object to a part", "Reason about shape", "Build with objects"], "Choose the Best Shape", createBuildTheRoverTaskSet);
export const CHOOSE_BEST_SHAPE_CONTENT = content("Choose the Best Shape", "Choose the best object for the job — and pick the reason why.", ["read the job", "choose the object", "say why it fits"], ["Wheel", "Nose", "Best Shape"], "How did you choose?", ["I thought about the job", "I chose the object that fits", "I could say why"], ["Choose for a purpose", "Explain why", "Connect feature and use"], "Space Engineering", createChooseBestShapeTaskSet);
export const SPACE_ENGINEERING_CONTENT = content("Space Engineering", "Be a space engineer — choose and justify the best object for each design.", ["read each design job", "choose the best object", "justify the choice"], ["Design 1", "Design 2", "Engineer"], "What did you learn about choosing objects?", ["The feature must suit the job", "I can explain my choice", "The best-looking object is not always best"], ["Choose for a purpose", "Justify a design choice", "Work independently"], "Week 3 Voyage Quiz", createSpaceEngineeringTaskSet);
