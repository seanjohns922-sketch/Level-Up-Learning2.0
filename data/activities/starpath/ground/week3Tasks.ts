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
