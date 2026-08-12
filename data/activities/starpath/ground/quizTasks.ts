import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  countBuildShape,
  getBuildObject,
  getBuildShapes,
  type StarpathBuildObjectId,
} from "@/data/activities/starpath/ground/shape-builds";
import {
  buildObjectScene,
  OBJECTS_BY_SHAPE,
  SHAPE_OBJECTS,
} from "@/data/activities/starpath/ground/shape-objects";
import {
  RELATION_PHRASE,
  positionObjectLabel,
  type PositionObjectId,
  type PositionRelation,
} from "@/data/activities/starpath/ground/position-objects";
import type { FoundationShape } from "@/data/activities/starpath/ground/types";

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];
const COLOURS = ["#67e8f9", "#f9a8d4", "#fde047", "#86efac", "#c4b5fd"] as const;
const BUILD_IDS: StarpathBuildObjectId[] = [
  "rocket", "house", "tree", "robot", "moon-buggy", "space-station", "planet",
  "alien", "satellite", "cat", "space-dog", "ufo", "astronaut", "telescope",
];
const POSITION_OBJECTS: PositionObjectId[] = [
  "planet", "moon", "rocket", "flag", "star", "crystal", "alien", "satellite", "explorer", "geospin",
];

function rotate<T>(items: readonly T[], amount: number): T[] {
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function quizShapeOptions(shape: FoundationShape, round: number, target: number) {
  return rotate([shape, ...SHAPES.filter((candidate) => candidate !== shape).slice(0, 2)], round)
    .map((candidate, index) => ({
      id: `quiz-shape-${target}-${candidate}-${index}`,
      shape: candidate,
      colour: COLOURS[(round + index) % COLOURS.length]!,
      scale: 0.82 + ((round + index) % 3) * 0.08,
    }));
}

export function quizShapeFeatureTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  const clues: Record<FoundationShape, string> = {
    circle: "round with no straight sides",
    triangle: "3 straight sides",
    square: "4 equal sides",
    rectangle: "4 sides, with 2 longer sides",
  };
  const options = quizShapeOptions(shape, round + 1, target);
  return {
    kind: "starpathShapeMatch",
    prompt: `Tap the shape with ${clues[shape]}.`,
    speakText: `Tap the shape with ${clues[shape]}.`,
    target,
    targetShape: shape,
    options,
    correctOptionId: options.find((option) => option.shape === shape)!.id,
    feedback: {
      correct: `Correct. That shape is a ${shape}.`,
      wrong: `Look at the sides again. The answer is the ${shape}.`,
    },
  };
}

export function quizShapeNameTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[(round + 1) % SHAPES.length]!;
  const names = rotate([shape, ...SHAPES.filter((candidate) => candidate !== shape).slice(0, 2)], round);
  const options = names.map((name, index) => ({ id: `quiz-name-${target}-${name}-${index}`, name }));
  return {
    kind: "starpathShapeName",
    prompt: "Choose this shape's name.",
    speakText: "Choose the name of the shape shown.",
    target,
    shape,
    options,
    correctOptionId: options.find((option) => option.name === shape)!.id,
    feedback: { correct: `Correct. It is a ${shape}.`, wrong: `This shape is a ${shape}.` },
  };
}

export function quizObjectShapeTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[(round + 2) % SHAPES.length]!;
  const objectId = OBJECTS_BY_SHAPE[shape][(round + 1) % OBJECTS_BY_SHAPE[shape].length]!;
  const options = quizShapeOptions(shape, round + 2, target).map(({ scale: _scale, ...option }) => option);
  const label = SHAPE_OBJECTS[objectId].label.toLowerCase();
  return {
    kind: "starpathObjectShape",
    prompt: `What shape is the ${label}?`,
    speakText: `Look at the ${label}. What familiar shape is it?`,
    target,
    objectId,
    targetShape: shape,
    options,
    correctOptionId: options.find((option) => option.shape === shape)!.id,
    feedback: { correct: `Correct. The ${label} is a ${shape}.`, wrong: `The ${label} is a ${shape}.` },
  };
}

export function quizShapeSceneTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[(round + 3) % SHAPES.length]!;
  const { objects, correctObjectId } = buildObjectScene(shape, round + 1);
  return {
    kind: "starpathShapeScene",
    prompt: `Tap the ${shape}-shaped object.`,
    speakText: `Tap the object shaped like a ${shape}.`,
    target,
    targetShape: shape,
    objects,
    correctObjectId,
    feedback: {
      correct: `Correct. The ${SHAPE_OBJECTS[correctObjectId].label.toLowerCase()} is shaped like a ${shape}.`,
      wrong: `Look again for the ${shape}-shaped object.`,
    },
  };
}

export function quizOddShapeTask(round: number, target: number): PracticeTask {
  const common = SHAPES[round % SHAPES.length]!;
  const odd = SHAPES[(round + 1) % SHAPES.length]!;
  const raw = rotate([common, common, odd, common], round);
  const options = raw.map((shape, index) => ({
    id: `quiz-odd-${target}-${index}`,
    shape,
    colour: COLOURS[(round + index + 1) % COLOURS.length]!,
  }));
  return {
    kind: "starpathOddOneOut",
    prompt: "Tap the shape from a different family.",
    speakText: "Three shapes belong to one family. Tap the shape from a different family.",
    target,
    options,
    oddOptionId: options.find((option) => option.shape === odd)!.id,
    feedback: { correct: `Correct. The ${odd} is different.`, wrong: `The ${odd} is the different shape.` },
  };
}

export function quizBuildShapesTask(round: number, target: number, pool: readonly StarpathBuildObjectId[] = BUILD_IDS): PracticeTask {
  const objectId = pool[round % pool.length]!;
  const label = getBuildObject(objectId).label.toLowerCase();
  return {
    kind: "starpathBuildShapeIdentify",
    prompt: `Tap every shape used in this ${label}.`,
    speakText: `Look at the ${label}. Tap every familiar shape used to make it.`,
    target,
    objectId,
    targetShapes: getBuildShapes(objectId),
    options: SHAPES,
    feedback: { correct: `You found every shape in the ${label}.`, wrong: `Check each part of the ${label}.` },
  };
}

export function quizBuildMatchTask(round: number, target: number, pool: readonly StarpathBuildObjectId[] = BUILD_IDS): PracticeTask {
  const objectId = pool[round % pool.length]!;
  const candidates = rotate([objectId, ...BUILD_IDS.filter((candidate) => candidate !== objectId).slice(0, 2)], round);
  const options = candidates.map((candidate, index) => ({ id: `quiz-build-${target}-${index}`, objectId: candidate }));
  return {
    kind: "starpathBuildMatch",
    prompt: "Which finished model matches the shape plan?",
    speakText: "Choose the finished model made from the matching shape plan.",
    target,
    objectId,
    options,
    correctOptionId: options.find((option) => option.objectId === objectId)!.id,
    feedback: { correct: "Correct. The model matches the plan.", wrong: "Compare the shape parts in each model." },
  };
}

export function quizShapeReasonTask(round: number, target: number): PracticeTask {
  const cases = [
    { shape: "circle" as const, ids: ["tree", "rocket", "house"] as StarpathBuildObjectId[], answer: "tree" as const, type: "most" as const },
    { shape: "triangle" as const, ids: ["cat", "moon-buggy", "satellite"] as StarpathBuildObjectId[], answer: "cat" as const, type: "contains" as const },
    { shape: "square" as const, ids: ["satellite", "rocket", "planet"] as StarpathBuildObjectId[], answer: "satellite" as const, type: "contains" as const },
  ];
  const item = cases[round % cases.length]!;
  const prompt = item.type === "most" ? `Which model has the most ${item.shape}s?` : `Which model contains a ${item.shape}?`;
  const options = rotate(item.ids, round).map((objectId, index) => ({ id: `quiz-reason-${target}-${index}`, objectId }));
  return {
    kind: "starpathSpaceMuseum",
    prompt,
    speakText: `${prompt} Check the parts of every model.`,
    target,
    criterion: { type: item.type, shape: item.shape },
    options,
    correctOptionId: options.find((option) => option.objectId === item.answer)!.id,
    feedback: {
      correct: item.type === "most"
        ? `Correct. It has ${countBuildShape(item.answer, item.shape)} ${item.shape}s.`
        : `Correct. It contains a ${item.shape}.`,
      wrong: `Check every model for ${item.shape}s.`,
    },
  };
}

export function quizShapeCompareTask(round: number, target: number): PracticeTask {
  const leftShape = SHAPES[round % SHAPES.length]!;
  const same = round % 2 === 0;
  const rightShape = same ? leftShape : SHAPES[(round + 1) % SHAPES.length]!;
  return {
    kind: "starpathShapeCompare",
    prompt: "Do these belong to the same shape family?",
    speakText: "Do these belong to the same shape family? Ignore colour and size.",
    target,
    left: { shape: leftShape, colour: COLOURS[round % COLOURS.length]!, scale: 0.88, rotation: 0 },
    right: { shape: rightShape, colour: COLOURS[(round + 2) % COLOURS.length]!, scale: 0.7 + (round % 2) * 0.2, rotation: same ? 12 : 0 },
    answer: same ? "same" : "different",
    feedback: {
      correct: same ? `Correct. Both are ${leftShape}s.` : `Correct. One is a ${leftShape} and one is a ${rightShape}.`,
      wrong: same ? `Both are ${leftShape}s.` : `These are different shape families.`,
    },
  };
}

export function quizWhatChangedTask(round: number, target: number): PracticeTask {
  const change = (["colour", "size", "shape"] as const)[round % 3]!;
  const shape = SHAPES[round % SHAPES.length]!;
  const before = { shape, colour: COLOURS[round % COLOURS.length]!, scale: 0.9 };
  const after = change === "colour"
    ? { shape, colour: COLOURS[(round + 2) % COLOURS.length]!, scale: 0.9 }
    : change === "size"
      ? { shape, colour: before.colour, scale: 0.58 }
      : { shape: SHAPES[(round + 2) % SHAPES.length]!, colour: before.colour, scale: 0.9 };
  return {
    kind: "starpathWhatChanged",
    prompt: "What changed between these shapes?",
    speakText: "Compare the two shapes. Did the colour, size or shape family change?",
    target,
    before,
    after,
    answer: change,
    feedback: { correct: `Correct. The ${change} changed.`, wrong: `Look again. The ${change} changed.` },
  };
}

function relationDecoy(relation: PositionRelation): PositionRelation {
  if (relation === "above") return "below";
  if (relation === "below") return "above";
  if (relation === "behind") return "in-front";
  if (relation === "in-front") return "behind";
  return relation === "inside" ? "above" : "below";
}

export function quizPositionFindTask(round: number, target: number, relations: readonly PositionRelation[]): PracticeTask {
  const relation = relations[round % relations.length]!;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : POSITION_OBJECTS[(round + 1) % POSITION_OBJECTS.length]!;
  const subject = POSITION_OBJECTS.find((candidate, index) => candidate !== anchor && index >= (round + 4) % POSITION_OBJECTS.length)
    ?? POSITION_OBJECTS.find((candidate) => candidate !== anchor)!;
  const side = relation === "beside" ? (round % 2 === 0 ? "left" as const : "right" as const) : undefined;
  const placements = [
    { id: `quiz-position-${target}-yes`, object: subject, relation, side },
    { id: `quiz-position-${target}-no`, object: subject, relation: relationDecoy(relation) },
    { id: `quiz-position-${target}-other`, object: POSITION_OBJECTS[(round + 6) % POSITION_OBJECTS.length]!, relation: "beside" as const, side: "right" as const },
  ];
  const clue = `the ${positionObjectLabel(subject)} ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}`;
  return {
    kind: "starpathPositionFind",
    prompt: `Tap ${clue}.`,
    speakText: `Tap ${clue}.`,
    target,
    anchorObject: anchor,
    placements,
    correctId: `quiz-position-${target}-yes`,
    feedback: { correct: "Correct position.", wrong: `Find ${clue}.` },
  };
}

export function quizPositionWordTask(round: number, target: number, relations: readonly PositionRelation[]): PracticeTask {
  const relation = relations[round % relations.length]!;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : POSITION_OBJECTS[(round + 2) % POSITION_OBJECTS.length]!;
  const subject = POSITION_OBJECTS.find((candidate, index) => candidate !== anchor && index >= (round + 5) % POSITION_OBJECTS.length)
    ?? POSITION_OBJECTS.find((candidate) => candidate !== anchor)!;
  const choices = rotate([relation, ...relations.filter((candidate) => candidate !== relation).slice(0, 2)], round);
  const options = choices.map((candidate, index) => ({ id: `quiz-word-${target}-${index}`, relation: candidate }));
  return {
    kind: "starpathPositionWord",
    prompt: `Choose the word that describes the ${positionObjectLabel(subject)}.`,
    speakText: `Choose where the ${positionObjectLabel(subject)} is compared with the ${positionObjectLabel(anchor)}.`,
    target,
    anchorObject: anchor,
    subjectObject: subject,
    relation,
    side: relation === "beside" ? "right" : undefined,
    options,
    correctOptionId: options.find((option) => option.relation === relation)!.id,
    feedback: { correct: `Correct. It is ${RELATION_PHRASE[relation]}.`, wrong: `It is ${RELATION_PHRASE[relation]}.` },
  };
}

export function quizPositionPictureTask(round: number, target: number, relations: readonly PositionRelation[]): PracticeTask {
  const relation = relations[round % relations.length]!;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : POSITION_OBJECTS[(round + 3) % POSITION_OBJECTS.length]!;
  const subject = POSITION_OBJECTS.find((candidate, index) => candidate !== anchor && index >= (round + 6) % POSITION_OBJECTS.length)
    ?? POSITION_OBJECTS.find((candidate) => candidate !== anchor)!;
  const alternatives = relations.filter((candidate) => candidate !== relation);
  const scenes = rotate([relation, alternatives[round % alternatives.length]!, alternatives[(round + 1) % alternatives.length]!], round)
    .map((candidate, index) => ({
      id: `quiz-picture-${target}-${index}`,
      anchorObject: anchor,
      subjectObject: subject,
      relation: candidate,
      side: candidate === "beside" ? "left" as const : undefined,
    }));
  const clue = `the ${positionObjectLabel(subject)} ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}`;
  return {
    kind: "starpathPositionPicture",
    prompt: `Which scene has ${clue}?`,
    speakText: `Choose the scene with ${clue}.`,
    target,
    options: scenes,
    correctOptionId: scenes.find((scene) => scene.relation === relation)!.id,
    feedback: { correct: "Correct scene.", wrong: `Look for ${clue}.` },
  };
}
