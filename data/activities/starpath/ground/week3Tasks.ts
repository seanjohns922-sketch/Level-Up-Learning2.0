import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SHAPE_FACTS, type FoundationShape } from "./week1Lesson1";

export const WEEK3_SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];
export const WEEK3_COLOURS = ["#67e8f9", "#f9a8d4", "#fde047", "#86efac", "#c4b5fd"] as const;

export function familySortTask(round: number, target: number, mode: "drag" | "group" = "drag"): PracticeTask {
  const shape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  return {
    kind: "starpathShapeSort",
    prompt: mode === "group" ? `Which family does this ${shape} belong to?` : `Put this ${shape} with its shape family.`,
    speakText: mode === "group"
      ? `Which family does this ${shape} belong to? Look at its shape, not its colour or size.`
      : `Put this ${shape} with the other ${shape}s. Shapes can be different colours and sizes and still belong to the same family.`,
    target,
    shape,
    colour: WEEK3_COLOURS[(round * 2 + (mode === "group" ? 2 : 0)) % WEEK3_COLOURS.length]!,
    scale: 0.78 + (round % 4) * 0.08,
    feedback: {
      correct: `Yes! It belongs with the ${shape}s. ${SHAPE_FACTS[shape]}`,
      wrong: `Look at the shape again. It belongs with the ${shape}s.`,
    },
  };
}

export function compareShapeTask(round: number, target: number): PracticeTask {
  const leftShape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const isSame = round % 2 === 0;
  const rightShape = isSame
    ? leftShape
    : WEEK3_SHAPES[(round + 1 + (round % 2)) % WEEK3_SHAPES.length]!;
  return {
    kind: "starpathShapeCompare",
    prompt: "Are these the same shape?",
    speakText: "Are these the same shape? Ignore their colour and size. Look only at the shapes.",
    target,
    left: {
      shape: leftShape,
      colour: WEEK3_COLOURS[round % WEEK3_COLOURS.length]!,
      scale: 0.82 + (round % 3) * 0.07,
      rotation: 0,
    },
    right: {
      shape: rightShape,
      colour: WEEK3_COLOURS[(round + 2) % WEEK3_COLOURS.length]!,
      scale: 0.72 + ((round + 1) % 3) * 0.09,
      rotation: isSame && rightShape !== "circle" ? (round % 3) * 8 : 0,
    },
    answer: isSame ? "same" : "different",
    feedback: {
      correct: isSame
        ? `Yes. They are both ${leftShape}s. Colour and size do not change the shape.`
        : `Correct. One is a ${leftShape} and one is a ${rightShape}.`,
      wrong: isSame
        ? `They are both ${leftShape}s. Colour and size do not change the shape.`
        : `They are different. One is a ${leftShape} and one is a ${rightShape}.`,
    },
  };
}

export function oddShapeTask(round: number, target: number): PracticeTask {
  const commonShape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const oddShape = WEEK3_SHAPES[(round + 2) % WEEK3_SHAPES.length]!;
  const entries = [
    { shape: commonShape, odd: false },
    { shape: commonShape, odd: false },
    { shape: commonShape, odd: false },
    { shape: oddShape, odd: true },
  ];
  const options = entries
    .map((entry, index) => ({
      id: `${entry.odd ? "odd" : "same"}-${target}-${index}`,
      shape: entry.shape,
      colour: WEEK3_COLOURS[(round + index) % WEEK3_COLOURS.length]!,
      odd: entry.odd,
      order: (index * 5 + round * 3) % entries.length,
    }))
    .sort((left, right) => left.order - right.order);
  return {
    kind: "starpathOddOneOut",
    prompt: "Which shape does not belong?",
    speakText: "Which shape does not belong? Find the one shape that is different from the other three.",
    target,
    options: options.map(({ id, shape, colour }) => ({ id, shape, colour })),
    oddOptionId: options.find((option) => option.odd)!.id,
    feedback: {
      correct: `Correct! The ${oddShape} does not belong. The others are ${commonShape}s.`,
      wrong: `Three shapes are ${commonShape}s. Find the ${oddShape}.`,
    },
  };
}

function rotate<T>(list: readonly T[], by: number): T[] {
  const size = list.length;
  const shift = ((by % size) + size) % size;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// W3 L1 activity 1 — Sorting Station. A queue of shapes across every family,
// varied in colour and size, to drag/tap into the right family bin.
export function familyStationTask(round: number, target: number): PracticeTask {
  const order = rotate(WEEK3_SHAPES, round);
  const queue = [...order, WEEK3_SHAPES[(round + 1) % WEEK3_SHAPES.length]!];
  const items = queue.map((shape, index) => ({
    id: `fam-${target}-${index}`,
    shape,
    colour: WEEK3_COLOURS[(round + index) % WEEK3_COLOURS.length]!,
    scale: 0.78 + ((round + index) % 3) * 0.09,
  }));
  return {
    kind: "starpathFamilySort",
    prompt: "Sort each shape into its family.",
    speakText:
      "Drag each shape into its family bin. Look at the shape, not its colour or size. Circles go with circles, triangles with triangles.",
    target,
    bins: [...WEEK3_SHAPES],
    items,
    feedback: {
      correct: "Sorting station cleared! Every shape is with its family.",
      wrong: "Look at the shape again and find the family it belongs to.",
    },
  };
}

// W3 L1 activity 2 — Collect the Family. Gather every member of one family
// from a mixed field. Grouping by gathering, not single-tap.
export function collectFamilyTask(round: number, target: number): PracticeTask {
  const shape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const others = WEEK3_SHAPES.filter((candidate) => candidate !== shape);
  const raw = [
    { shape, key: "a" },
    { shape, key: "b" },
    { shape, key: "c" },
    { shape: others[0]!, key: "d" },
    { shape: others[1]!, key: "e" },
    { shape: others[2]!, key: "f" },
  ]
    .map((item, index) => ({
      id: `col-${target}-${item.key}`,
      shape: item.shape,
      colour: WEEK3_COLOURS[(round + index) % WEEK3_COLOURS.length]!,
      order: (index * 7 + round * 5) % 6,
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...item }) => item);
  return {
    kind: "starpathCollectMission",
    prompt: `Collect the whole ${shape} family.`,
    speakText: `Collect every ${shape}. A ${shape} can be a different colour or size and still belong to the ${shape} family.`,
    target,
    requests: [{ shape, count: 3 }],
    items: raw,
    feedback: {
      correct: `You gathered the whole ${shape} family!`,
      wrong: `That shape is not a ${shape}. Find the ${shape}s.`,
    },
  };
}

// W3 L2 activity 2 — Twins in Disguise. Find the shape that is the same, shown
// in a deliberately different colour and size. Reuses the match card.
export function twinMatchTask(round: number, target: number): PracticeTask {
  const shape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const others = WEEK3_SHAPES.filter((candidate) => candidate !== shape).slice(0, 2);
  const options = [shape, ...others]
    .map((candidate, index) => ({
      id: `twin-${target}-${index}`,
      shape: candidate,
      colour: WEEK3_COLOURS[(round * 2 + index + 1) % WEEK3_COLOURS.length]!,
      scale: candidate === shape ? 0.66 + (round % 3) * 0.14 : 0.92,
    }))
    .sort(
      (left, right) =>
        ((WEEK3_SHAPES.indexOf(left.shape) + round) % 3) -
        ((WEEK3_SHAPES.indexOf(right.shape) + round * 2) % 3)
    );
  const correct = options.find((option) => option.shape === shape)!;
  return {
    kind: "starpathShapeMatch",
    prompt: `Find the other ${shape}.`,
    speakText: `Find the shape that is also a ${shape}. It can be a different colour and size and still be a ${shape}.`,
    target,
    targetShape: shape,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! Both are ${shape}s, even with a different colour and size.`,
      wrong: `Look for the ${shape}. Colour and size do not change the shape.`,
    },
  };
}

// W3 L2 activity 3 — What Changed? One attribute changes between two views.
export function whatChangedTask(round: number, target: number): PracticeTask {
  const change = (["colour", "size", "shape"] as const)[round % 3]!;
  const shape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const baseColour = WEEK3_COLOURS[round % WEEK3_COLOURS.length]!;
  const before = { shape, colour: baseColour, scale: 0.95 };
  const after =
    change === "colour"
      ? { shape, colour: WEEK3_COLOURS[(round + 2) % WEEK3_COLOURS.length]!, scale: 0.95 }
      : change === "size"
        ? { shape, colour: baseColour, scale: 0.58 }
        : { shape: WEEK3_SHAPES[(round + 2) % WEEK3_SHAPES.length]!, colour: baseColour, scale: 0.95 };
  const changeText =
    change === "colour" ? "the colour changed" : change === "size" ? "the size changed" : "it is a different shape";
  return {
    kind: "starpathWhatChanged",
    prompt: "What changed?",
    speakText: "Look at the first shape, then the second shape. What changed? The colour, the size, or is it a different shape?",
    target,
    before,
    after,
    answer: change,
    feedback: {
      correct: `Yes! ${capitalise(changeText)}.`,
      wrong: `Look again. ${capitalise(changeText)}.`,
    },
  };
}

// W3 L3 capstone — Shape Sprint. A gentle timed hunt: find as many of one
// shape as you can before the fuel runs out. No penalty for wrong taps.
export function shapeSprintTask(round: number, target: number): PracticeTask {
  const shape = WEEK3_SHAPES[round % WEEK3_SHAPES.length]!;
  const others = WEEK3_SHAPES.filter((candidate) => candidate !== shape);
  const composition: FoundationShape[] = [];
  for (let index = 0; index < 5; index += 1) composition.push(shape);
  for (let index = 0; index < 9; index += 1) composition.push(others[index % others.length]!);
  const items = composition
    .map((candidate, index) => ({
      id: `sprint-${target}-${index}`,
      shape: candidate,
      colour: WEEK3_COLOURS[(round + index) % WEEK3_COLOURS.length]!,
      order: (index * 7 + round * 5) % composition.length,
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...item }) => item);
  return {
    kind: "starpathShapeSprint",
    prompt: `Quick! Find all the ${shape}s.`,
    speakText: `Get ready for a speed round! When you start, find as many ${shape}s as you can before the time runs out.`,
    target,
    targetShape: shape,
    seconds: 6,
    items,
    feedback: {
      correct: "Amazing speed exploring!",
      wrong: "Great try, Explorer!",
    },
  };
}

export function mixedShapeHuntTask(round: number, target: number): PracticeTask {
  const requests = [
    { shape: "circle" as const, count: 2 },
    { shape: "triangle" as const, count: 1 },
    { shape: "rectangle" as const, count: 1 },
  ];
  const items = [
    { shape: "circle" as const, id: `circle-a-${target}` },
    { shape: "triangle" as const, id: `triangle-${target}` },
    { shape: "circle" as const, id: `circle-b-${target}` },
    { shape: "rectangle" as const, id: `rectangle-${target}` },
    { shape: "square" as const, id: `extra-square-${target}` },
    { shape: "triangle" as const, id: `extra-triangle-${target}` },
  ]
    .map((item, index) => ({
      ...item,
      colour: WEEK3_COLOURS[(round + index) % WEEK3_COLOURS.length]!,
      order: (index * 7 + round * 5) % 6,
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...item }) => item);
  return {
    kind: "starpathCollectMission",
    prompt: "Find 2 circles, 1 triangle and 1 rectangle.",
    speakText: "Find two circles, one triangle and one rectangle. Tap only the shapes on Geospin's list.",
    target,
    requests,
    items,
    feedback: {
      correct: "Excellent shape hunting! You collected every shape on the list.",
      wrong: "Check Geospin's list and try another shape.",
    },
  };
}
