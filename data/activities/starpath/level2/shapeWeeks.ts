import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_TWO_ARTWORK } from "./star-maps";
import { getL2Shape, type L2ShapeId } from "./l2-shapes";

// Level 2 · Weeks 1-4 — Shape features (AC9M2SP01). One mechanic
// (starpathShapeFeature), four Year-2 modes: straight/curved edges, number of
// sides, parallel/opposite sides, and comparing two shapes.

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

const CURVED: L2ShapeId[] = ["circle", "oval"];
const STRAIGHT: L2ShapeId[] = ["triangle", "square", "rectangle", "pentagon", "hexagon", "trapezoid"];
const ALL: L2ShapeId[] = [...CURVED, ...STRAIGHT];
const FOUR_SIDED: L2ShapeId[] = ["square", "rectangle", "trapezoid"];
const HAS_PARALLEL: L2ShapeId[] = ["square", "rectangle", "hexagon", "trapezoid"];
const NO_PARALLEL: L2ShapeId[] = ["triangle", "pentagon"];

function teaching(
  variant: "featureEdges" | "featureSides" | "featureParallel" | "featureCompare",
  heading: string,
  prompt: string,
  speakText: string
) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant,
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

// ── W1 · Straight and Curved ─────────────────────────────────────────────────
export function edgeTask(round: number, target: number): PracticeTask {
  const shape = getL2Shape(ALL[round % ALL.length]!);
  return {
    kind: "starpathShapeFeature",
    mode: "edge",
    prompt: `Does this ${shape.label} have straight sides or curved edges?`,
    speakText: `Look at this ${shape.label}. Does it have straight sides or curved edges?`,
    target,
    shapes: [{ id: shape.id }],
    options: [
      { id: "straight", label: "Straight sides" },
      { id: "curved", label: "Curved edges" },
    ],
    correctOptionId: shape.curved ? "curved" : "straight",
    feedback: {
      correct: shape.curved ? `Yes — a ${shape.label} has curved edges.` : `Yes — a ${shape.label} has straight sides.`,
      wrong: shape.curved ? "Trace the edge — it curves all the way around." : "Trace the sides — they are straight.",
    },
  };
}

export function whichEdgeTask(round: number, target: number, want: "curved" | "straight"): PracticeTask {
  const match = (want === "curved" ? CURVED : STRAIGHT)[round % (want === "curved" ? CURVED : STRAIGHT).length]!;
  const others = (want === "curved" ? STRAIGHT : CURVED);
  const distractors = rotate(others, round).slice(0, 2);
  const options = rotate(
    [match, ...distractors].map((id) => ({ id, label: getL2Shape(id).label, shapeId: id })),
    round
  );
  return {
    kind: "starpathShapeFeature",
    mode: "edge",
    prompt: want === "curved" ? "Which shape has curved edges?" : "Which shape has straight sides?",
    speakText: want === "curved" ? "Tap the shape that has curved edges." : "Tap the shape that has straight sides.",
    target,
    shapes: [],
    options,
    correctOptionId: match,
    feedback: {
      correct: want === "curved" ? "That shape has curved edges." : "That shape has straight sides.",
      wrong: want === "curved" ? "Look for the round shape with no corners." : "Look for the shape with straight sides and corners.",
    },
  };
}

// ── W2 · Count the Sides ─────────────────────────────────────────────────────
export function sidesCountTask(round: number, target: number): PracticeTask {
  const shape = getL2Shape(STRAIGHT[round % STRAIGHT.length]!);
  const pool = [3, 4, 5, 6].filter((n) => n !== shape.sides);
  const distractors = rotate(pool, round).slice(0, 2);
  const options = rotate(
    [shape.sides, ...distractors].map((n) => ({ id: `n${n}`, label: `${n} sides` })),
    round
  );
  return {
    kind: "starpathShapeFeature",
    mode: "sides",
    prompt: `How many sides does this ${shape.label} have?`,
    speakText: `Count the straight sides on this ${shape.label}.`,
    target,
    shapes: [{ id: shape.id }],
    options,
    correctOptionId: `n${shape.sides}`,
    feedback: {
      correct: `Yes — a ${shape.label} has ${shape.sides} sides.`,
      wrong: `Count each straight side once. A ${shape.label} has ${shape.sides}.`,
    },
  };
}

export function whichSidesTask(round: number, target: number): PracticeTask {
  const counts = [3, 4] as const;
  const n = counts[round % counts.length]!;
  const match = (n === 3 ? (["triangle"] as L2ShapeId[]) : FOUR_SIDED)[round % (n === 3 ? 1 : FOUR_SIDED.length)]!;
  const others = STRAIGHT.filter((id) => getL2Shape(id).sides !== n);
  const distractors = rotate(others, round).slice(0, 2);
  const options = rotate(
    [match, ...distractors].map((id) => ({ id, label: getL2Shape(id).label, shapeId: id })),
    round + 1
  );
  return {
    kind: "starpathShapeFeature",
    mode: "sides",
    prompt: `Which shape has ${n} sides?`,
    speakText: `Tap the shape that has ${n} straight sides.`,
    target,
    shapes: [],
    options,
    correctOptionId: match,
    feedback: {
      correct: `That shape has ${n} sides.`,
      wrong: `Count the sides on each shape and find the one with ${n}.`,
    },
  };
}

// ── W3 · Parallel and Opposite ───────────────────────────────────────────────
export function parallelYesNoTask(round: number, target: number): PracticeTask {
  const pool = [...HAS_PARALLEL, ...NO_PARALLEL];
  const shape = getL2Shape(rotate(pool, round)[round % pool.length]!);
  const has = shape.parallelPairs > 0;
  return {
    kind: "starpathShapeFeature",
    mode: "parallel",
    prompt: `Does this ${shape.label} have parallel sides?`,
    speakText: `Parallel sides run alongside each other like train tracks and never meet. Does this ${shape.label} have any?`,
    target,
    shapes: [{ id: shape.id }],
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    correctOptionId: has ? "yes" : "no",
    feedback: {
      correct: has ? `Yes — this ${shape.label} has parallel sides.` : `Correct — a ${shape.label} has no parallel sides.`,
      wrong: has ? "Look for two sides that run alongside each other and never meet." : "None of these sides run alongside each other without meeting.",
    },
  };
}

export function whichParallelTask(round: number, target: number): PracticeTask {
  const match = HAS_PARALLEL[round % HAS_PARALLEL.length]!;
  const distractors = rotate(NO_PARALLEL, round).slice(0, 2);
  const options = rotate(
    [match, ...distractors].map((id) => ({ id, label: getL2Shape(id).label, shapeId: id })),
    round
  );
  return {
    kind: "starpathShapeFeature",
    mode: "parallel",
    prompt: "Which shape has parallel sides?",
    speakText: "Tap the shape that has parallel sides — sides that run alongside each other and never meet.",
    target,
    shapes: [],
    options,
    correctOptionId: match,
    feedback: {
      correct: "That shape has parallel sides.",
      wrong: "Look for two sides that never meet, like train tracks.",
    },
  };
}

// ── W4 · Compare Shapes ──────────────────────────────────────────────────────
type CompareCase = {
  a: L2ShapeId;
  b: L2ShapeId;
  same: { correct: string; wrong: [string, string] };
  diff: { correct: string; wrong: [string, string] };
};
const COMPARE_CASES: CompareCase[] = [
  { a: "triangle", b: "square", same: { correct: "Both have straight sides", wrong: ["Both are round", "Both have 4 sides"] }, diff: { correct: "The number of sides", wrong: ["One is round", "One has curved edges"] } },
  { a: "circle", b: "oval", same: { correct: "Both are round", wrong: ["Both have straight sides", "Both have 4 sides"] }, diff: { correct: "One is longer than it is tall", wrong: ["The number of sides", "One has corners"] } },
  { a: "square", b: "hexagon", same: { correct: "Both have parallel sides", wrong: ["Both are round", "Both have 3 sides"] }, diff: { correct: "The number of sides", wrong: ["One is round", "One has curved edges"] } },
  { a: "rectangle", b: "triangle", same: { correct: "Both have straight sides", wrong: ["Both are round", "Both have 4 sides"] }, diff: { correct: "The number of sides", wrong: ["One is round", "The colour"] } },
];

export function compareTask(round: number, target: number, kind: "same" | "diff"): PracticeTask {
  const c = COMPARE_CASES[round % COMPARE_CASES.length]!;
  const q = c[kind];
  const options = rotate(
    [
      { id: "correct", label: q.correct },
      { id: "w1", label: q.wrong[0] },
      { id: "w2", label: q.wrong[1] },
    ],
    round + 1
  );
  return {
    kind: "starpathShapeFeature",
    mode: "compare",
    prompt: kind === "same" ? "What is the same about these two shapes?" : "What is different about these two shapes?",
    speakText: kind === "same" ? "Compare the two shapes. What is the same about them?" : "Compare the two shapes. What is different about them?",
    target,
    shapes: [{ id: c.a }, { id: c.b }],
    options,
    correctOptionId: "correct",
    feedback: {
      correct: kind === "same" ? "Correct — that is the same about both." : "Correct — that is what is different.",
      wrong: "Compare the sides, corners and edges of both shapes.",
    },
  };
}

// ── Task sets ────────────────────────────────────────────────────────────────
function set(start: number, gens: Array<(round: number, target: number) => PracticeTask>, teach: () => PracticeTask): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  const [g0, g1, g2] = gens;
  return {
    teaching: teach,
    activities: [
      () => g0!(a++ + start, ++target),
      () => g1!(b++ + start + 1, ++target),
      () => g2!(c++ + start + 2, ++target),
    ],
  };
}

export const createStraightOrCurvedTaskSet = (): RealmLessonTaskSet =>
  set(0, [edgeTask, edgeTask, edgeTask], teaching("featureEdges", "Straight or Curved?", "Sides can be straight or curved.", "Some shapes have straight sides. Some have curved edges that go round and round. Decide which each shape has."));
export const createSortByEdgeTaskSet = (): RealmLessonTaskSet =>
  set(0, [(r, t) => whichEdgeTask(r, t, "curved"), (r, t) => whichEdgeTask(r, t, "straight"), (r, t) => whichEdgeTask(r, t, "curved")], teaching("featureEdges", "Sort by Edge", "Find shapes by their edges.", "Find the shapes with curved edges and the shapes with straight sides."));
export const createEdgeChallengeTaskSet = (): RealmLessonTaskSet =>
  set(0, [edgeTask, (r, t) => whichEdgeTask(r, t, "straight"), edgeTask], teaching("featureEdges", "Edge Challenge", "Straight and curved, mixed.", "Show what you know about straight sides and curved edges."));

export const createCountTheSidesTaskSet = (): RealmLessonTaskSet =>
  set(0, [sidesCountTask, sidesCountTask, sidesCountTask], teaching("featureSides", "Count the Sides", "Count how many sides a shape has.", "Count each straight side once. Every shape has its own number of sides."));
export const createSidesSortTaskSet = (): RealmLessonTaskSet =>
  set(0, [whichSidesTask, whichSidesTask, whichSidesTask], teaching("featureSides", "Sides Sort", "Find shapes by their number of sides.", "Find the shape with the number of sides asked for."));
export const createSidesChallengeTaskSet = (): RealmLessonTaskSet =>
  set(0, [sidesCountTask, whichSidesTask, sidesCountTask], teaching("featureSides", "Sides Challenge", "Number of sides, mixed.", "Show what you know about counting the sides of shapes."));

export const createOppositeSidesTaskSet = (): RealmLessonTaskSet =>
  set(0, [parallelYesNoTask, parallelYesNoTask, parallelYesNoTask], teaching("featureParallel", "Opposite Sides", "Some shapes have parallel sides.", "Parallel sides run alongside each other like train tracks and never meet. Decide if each shape has any."));
export const createParallelTracksTaskSet = (): RealmLessonTaskSet =>
  set(0, [whichParallelTask, whichParallelTask, whichParallelTask], teaching("featureParallel", "Parallel Tracks", "Find shapes with parallel sides.", "Find the shape that has parallel sides."));
export const createParallelChallengeTaskSet = (): RealmLessonTaskSet =>
  set(0, [parallelYesNoTask, whichParallelTask, parallelYesNoTask], teaching("featureParallel", "Parallel Challenge", "Parallel sides, mixed.", "Show what you know about parallel sides."));

export const createSameFeatureTaskSet = (): RealmLessonTaskSet =>
  set(0, [(r, t) => compareTask(r, t, "same"), (r, t) => compareTask(r, t, "same"), (r, t) => compareTask(r, t, "diff")], teaching("featureCompare", "Same or Different", "Compare two shapes.", "Look at two shapes. Work out what is the same and what is different about them."));
export const createWhatIsDifferentTaskSet = (): RealmLessonTaskSet =>
  set(0, [(r, t) => compareTask(r, t, "diff"), (r, t) => compareTask(r, t, "diff"), (r, t) => compareTask(r, t, "same")], teaching("featureCompare", "What Is Different?", "Find the difference.", "Compare two shapes and find what is different about them."));
export const createCompareChallengeTaskSet = (): RealmLessonTaskSet =>
  set(0, [(r, t) => compareTask(r, t, "same"), (r, t) => compareTask(r, t, "diff"), (r, t) => compareTask(r, t, "same")], teaching("featureCompare", "Compare Challenge", "Same and different, mixed.", "Show what you know about comparing shapes."));

// ── Lesson content ───────────────────────────────────────────────────────────
function content(title: string, brief: string, criteria: [string, string, string], acts: [string, string, string], reflectPrompt: string, reflectOpts: [string, string, string], skills: [string, string, string], nextUp: string, createTaskSet: () => RealmLessonTaskSet): StarpathLessonContent {
  return {
    missionBrief: brief,
    successCriteria: criteria,
    artworkSrc: LEVEL_TWO_ARTWORK,
    teaching: { title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: [
      { key: "a1", title: acts[0], description: acts[0], taskKinds: ["starpathShapeFeature"] },
      { key: "a2", title: acts[1], description: acts[1], taskKinds: ["starpathShapeFeature"] },
      { key: "a3", title: acts[2], description: acts[2], taskKinds: ["starpathShapeFeature"] },
    ],
    reflection: { prompt: reflectPrompt, options: reflectOpts },
    practisedSkills: skills,
    nextUpLabel: nextUp,
    createTaskSet,
  } satisfies StarpathLessonContent;
}

export const STRAIGHT_OR_CURVED_CONTENT = content("Straight or Curved?", "Every shape has an edge. Decide whether each shape has straight sides or curved edges.", ["look at the edge", "tell straight from curved", "decide for each shape"], ["Straight or Curved?", "Edge Check", "Edge Master"], "How did you decide?", ["I traced the edge", "Straight sides are not curved", "Curved edges go round"], ["Tell straight from curved", "Trace an edge", "Describe an edge"], "Sort by Edge", createStraightOrCurvedTaskSet);
export const SORT_BY_EDGE_CONTENT = content("Sort by Edge", "Find shapes by their edges — the ones with curved edges and the ones with straight sides.", ["find curved shapes", "find straight shapes", "sort by edge"], ["Find Curved", "Find Straight", "Edge Sorter"], "How did you sort them?", ["Curved shapes are round", "Straight shapes have corners", "I checked each edge"], ["Recognise curved shapes", "Recognise straight shapes", "Sort by edge"], "Edge Challenge", createSortByEdgeTaskSet);
export const EDGE_CHALLENGE_CONTENT = content("Edge Challenge", "Mixed review — straight sides and curved edges together.", ["tell straight from curved", "find shapes by edge", "answer independently"], ["Edge Quiz", "Edge Hunt", "Edge Champion"], "What did you learn about edges?", ["Sides can be straight", "Edges can be curved", "I can tell them apart"], ["Distinguish edges", "Recognise by edge", "Reason about edges"], "Week 1 Voyage Quiz", createEdgeChallengeTaskSet);

export const COUNT_THE_SIDES_CONTENT = content("Count the Sides", "Count the straight sides on each shape.", ["count each side", "count once", "say the number"], ["Count the Sides", "Side Count", "Count Master"], "How did you count?", ["I counted each side once", "I did not miss any", "I said the number"], ["Count sides", "Count carefully", "Say the number of sides"], "Sides Sort", createCountTheSidesTaskSet);
export const SIDES_SORT_CONTENT = content("Sides Sort", "Find the shape with the number of sides asked for.", ["read the number", "count each shape", "find the match"], ["Find 3 Sides", "Find 4 Sides", "Sides Sorter"], "How did you find it?", ["I counted the sides", "I matched the number", "I checked each shape"], ["Match by side count", "Count sides", "Classify by sides"], "Sides Challenge", createSidesSortTaskSet);
export const SIDES_CHALLENGE_CONTENT = content("Sides Challenge", "Mixed review — counting and matching by number of sides.", ["count sides", "match by sides", "answer independently"], ["Side Quiz", "Side Hunt", "Side Champion"], "What did you learn about sides?", ["Shapes have different numbers of sides", "I can count them", "I can sort by sides"], ["Count sides", "Classify by sides", "Reason about sides"], "Week 2 Voyage Quiz", createSidesChallengeTaskSet);

export const OPPOSITE_SIDES_CONTENT = content("Opposite Sides", "Parallel sides run alongside each other and never meet. Decide if each shape has any.", ["look for parallel sides", "sides that never meet", "decide for each shape"], ["Parallel or Not?", "Track Check", "Parallel Master"], "How did you decide?", ["I looked for sides like train tracks", "Parallel sides never meet", "I checked each shape"], ["Recognise parallel sides", "Understand 'never meet'", "Decide about a shape"], "Parallel Tracks", createOppositeSidesTaskSet);
export const PARALLEL_TRACKS_CONTENT = content("Parallel Tracks", "Find the shape that has parallel sides.", ["find parallel sides", "sides like train tracks", "choose the shape"], ["Find Parallel", "Track Finder", "Parallel Sorter"], "How did you find it?", ["I looked for train-track sides", "Parallel sides never meet", "I checked each shape"], ["Find parallel sides", "Compare shapes", "Choose by feature"], "Parallel Challenge", createParallelTracksTaskSet);
export const PARALLEL_CHALLENGE_CONTENT = content("Parallel Challenge", "Mixed review — parallel sides.", ["decide about parallel", "find parallel shapes", "answer independently"], ["Parallel Quiz", "Parallel Hunt", "Parallel Champion"], "What did you learn about parallel sides?", ["They run alongside each other", "They never meet", "Some shapes have them"], ["Recognise parallel sides", "Reason about sides", "Classify shapes"], "Week 3 Voyage Quiz", createParallelChallengeTaskSet);

export const SAME_FEATURE_CONTENT = content("Same or Different", "Compare two shapes and say what is the same about them.", ["compare two shapes", "find what is shared", "choose the answer"], ["What Is Same?", "Shared Feature", "Same Master"], "How did you compare?", ["I looked at the sides", "I checked the corners", "I found what was shared"], ["Compare shapes", "Identify similarities", "Reason about features"], "What Is Different?", createSameFeatureTaskSet);
export const WHAT_IS_DIFFERENT_CONTENT = content("What Is Different?", "Compare two shapes and find what is different about them.", ["compare two shapes", "find the difference", "choose the answer"], ["Find Difference", "Difference Check", "Difference Master"], "How did you find the difference?", ["I compared the sides", "I checked the number of sides", "I found what changed"], ["Compare shapes", "Identify differences", "Reason about features"], "Compare Challenge", createWhatIsDifferentTaskSet);
export const COMPARE_CHALLENGE_CONTENT = content("Compare Challenge", "Mixed review — same and different.", ["find similarities", "find differences", "answer independently"], ["Compare Quiz", "Compare Hunt", "Compare Champion"], "What did you learn about comparing?", ["Shapes can share features", "Shapes can be different", "I can compare them"], ["Compare shapes", "Identify same and different", "Reason about features"], "Week 4 Voyage Quiz", createCompareChallengeTaskSet);
