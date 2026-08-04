import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, listL3Objects, type L3Object } from "./l3-objects";
import { LEVEL_THREE_ARTWORK } from "./week1";

// Level 3 · Week 2 — Object Detectives (AC9M3SP01). Compare and classify objects
// by informal feature: rolls / stacks / slides, flat vs curved. Every task shows
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
  { prompt: "Which object rolls and has one point?", speak: "Which object rolls and has one point? Tap it.", pred: (o) => o.rolls && o.point },
  { prompt: "Which object is round all over?", speak: "Which object is round all over, with no flat side? Tap it.", pred: (o) => o.surface === "curved" },
  { prompt: "Which object rolls and stacks, like a can?", speak: "Which object rolls and also stacks, like a can? Tap it.", pred: (o) => o.rolls && o.stacks },
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
type CompareCase = { a: string; b: string; prompt: string; correct: string; wrong: [string, string] };
const COMPARE_CASES: CompareCase[] = [
  { a: "cube", b: "cylinder", prompt: "What is the same about these two?", correct: "They both stack", wrong: ["They both roll", "They both have a point"] },
  { a: "sphere", b: "cone", prompt: "What is the same about these two?", correct: "They both roll", wrong: ["They both stack", "They both have flat sides"] },
  { a: "sphere", b: "cube", prompt: "What is different about these two?", correct: "One rolls and one does not", wrong: ["They both roll", "They both have a point"] },
  { a: "cone", b: "cylinder", prompt: "What is different about these two?", correct: "One has a point and one does not", wrong: ["Neither of them rolls", "They both stack"] },
  { a: "cube", b: "prism", prompt: "What is the same about these two?", correct: "Neither of them rolls", wrong: ["They both roll", "They both have a point"] },
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
    feedback: { correct: `Yes — ${c.correct.toLowerCase()}.`, wrong: "Look at what each object does — roll, stack or slide." },
  };
}

// L3 — sort by a COMPOUND rule (two conditions at once).
type FeatureCase = { prompt: string; speak: string; pred: Pred; word: string };
const SORT_CASES: FeatureCase[] = [
  { prompt: "Which object rolls but does NOT stack?", speak: "Which object rolls but cannot stack? Tap it.", pred: (o) => o.rolls && !o.stacks, word: "rolls but does not stack" },
  { prompt: "Which object can roll AND stack?", speak: "Which object can both roll and stack? Tap it.", pred: (o) => o.rolls && o.stacks, word: "rolls and stacks" },
  { prompt: "Which object has flat sides but does NOT roll?", speak: "Which object has flat sides and does not roll? Tap it.", pred: (o) => !o.rolls && o.surface === "flat", word: "has flat sides and does not roll" },
];
export function objectSortTask(round: number, target: number): PracticeTask {
  const c = SORT_CASES[round % SORT_CASES.length]!;
  return featureFind(round, target, c.prompt, c.speak, c.pred, (o) => `Yes — the ${o.spaceName} ${c.word}.`, `Look for the object that ${c.word}.`);
}

function teaching(heading: string, prompt: string, speakText: string) {
  let t = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant: "objectFeatures", heading, prompt, speakText, target: ++t }) satisfies PracticeTask;
}
const INTRO = teaching(
  "Rolls, stacks and slides",
  "Objects behave in different ways.",
  "Some objects roll because they are round. Some stack because they have a flat top. Some slide along on their flat sides. Use these clues to tell objects apart."
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
export const COMPARE_OBJECTS_CONTENT = content("Compare Space Objects", "Compare the objects by what they do — which one rolls, stacks or has a point.", ["look at what each does", "roll, stack or point", "choose the object"], ["Rolls", "Stacks", "Compare"], "How did you compare?", ["I saw what each object does", "I looked for rolling or stacking", "I compared the features"], ["Compare by feature", "Use roll, stack, slide", "Reason about objects"], "Space Object Sort", createCompareObjectsTaskSet);
export const OBJECT_SORT_CONTENT = content("Space Object Sort", "Sort the objects — find the one that does or does not do something.", ["read the rule", "sort by the feature", "find the object"], ["Sort 1", "Sort 2", "Sorter"], "What did you learn about objects?", ["Objects roll, stack or slide", "One object can do more than one thing", "I can sort by a feature"], ["Classify by feature", "Sort objects", "Work independently"], "Week 2 Voyage Quiz", createObjectSortTaskSet);
