import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  countBuildShape,
  getBuildObject,
  getBuildShapes,
  type StarpathBuildObjectId,
} from "@/data/activities/starpath/ground/shape-builds";
import type { FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];
const COLOURS = ["#67e8f9", "#fde047", "#86efac", "#f9a8d4"] as const;

function rotate<T>(items: readonly T[], round: number): T[] {
  return items.map((_, index) => items[(index + round) % items.length]!);
}

export function finishPictureTask(
  objectIds: readonly StarpathBuildObjectId[],
  round: number,
  target: number
): PracticeTask {
  const objectId = objectIds[round % objectIds.length]!;
  const object = getBuildObject(objectId);
  const missingPiece = object.pieces[round % object.pieces.length]!;
  const distractors = SHAPES.filter((shape) => shape !== missingPiece.shape).slice(round % 2, round % 2 + 2);
  const optionShapes = rotate([missingPiece.shape, ...distractors], round);
  const options = optionShapes.map((shape, index) => ({
    id: `${objectId}-${shape}-${target}-${index}`,
    shape,
    colour: shape === missingPiece.shape ? missingPiece.colour : COLOURS[(round + index) % COLOURS.length]!,
  }));
  const correct = options.find((option) => option.shape === missingPiece.shape)!;
  return {
    kind: "starpathFinishPicture",
    prompt: `Finish the ${object.label.toLowerCase()}. Which shape is missing?`,
    speakText: `Finish the ${object.label.toLowerCase()}. Drag or tap the missing shape into the picture.`,
    target,
    objectId,
    missingPieceId: missingPiece.id,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `You finished the ${object.label.toLowerCase()} with a ${missingPiece.shape}.`,
      wrong: `Look at the empty space. The missing shape is a ${missingPiece.shape}.`,
    },
  };
}

export function shapeBuilderTask(
  objectIds: readonly StarpathBuildObjectId[],
  mode: "guided" | "copy" | "challenge" | "free",
  round: number,
  target: number
): PracticeTask {
  const objectId = objectIds[round % objectIds.length]!;
  const object = getBuildObject(objectId);
  const requiredPieceIds = object.pieces.map((item) => item.id);
  const options: Array<{
    id: string;
    pieceId: string | null;
    shape: FoundationShape;
    colour: string;
  }> = object.pieces.map((item, index) => ({
    id: `${objectId}-${item.id}-${target}-${index}`,
    pieceId: item.id,
    shape: item.shape,
    colour: item.colour,
  }));

  if (mode === "challenge") {
    const used = new Set(object.pieces.map((item) => item.shape));
    const distractor = SHAPES.find((shape) => !used.has(shape));
    if (distractor) {
      options.push({
        id: `${objectId}-decoy-${target}`,
        pieceId: null,
        shape: distractor,
        colour: COLOURS[(round + 2) % COLOURS.length]!,
      });
    }
  }

  const verb = mode === "copy" ? "Copy" : mode === "free" ? "Create" : "Build";
  return {
    kind: "starpathShapeBuilder",
    prompt: `${verb} the ${object.label.toLowerCase()} with shapes.`,
    speakText:
      mode === "free"
        ? `Create your own ${object.label.toLowerCase()}. Choose any ${Math.min(3, object.pieces.length)} shapes. There is no wrong answer.`
        : `${verb} the ${object.label.toLowerCase()} by choosing each shape it needs.`,
    target,
    objectId,
    mode,
    requiredPieceIds,
    options: rotate(options, round),
    minimumPieces: mode === "free" ? Math.min(3, object.pieces.length) : requiredPieceIds.length,
    feedback: {
      correct: `Fantastic building! Your ${object.label.toLowerCase()} is made from familiar shapes.`,
      wrong: `That piece does not belong in this build. Look closely at the shape spaces.`,
    },
  };
}

export function identifyBuildShapesTask(
  objectIds: readonly StarpathBuildObjectId[],
  round: number,
  target: number
): PracticeTask {
  const objectId = objectIds[round % objectIds.length]!;
  const object = getBuildObject(objectId);
  const targetShapes = getBuildShapes(objectId);
  return {
    kind: "starpathBuildShapeIdentify",
    prompt: `What shapes can you see in the ${object.label.toLowerCase()}?`,
    speakText: `What shapes can you see in the ${object.label.toLowerCase()}? Tap every shape that was used.`,
    target,
    objectId,
    targetShapes,
    options: SHAPES,
    feedback: {
      correct: `Excellent! You named all the shapes used in the ${object.label.toLowerCase()}.`,
      wrong: `That shape is not in this picture. Look at the parts of the ${object.label.toLowerCase()}.`,
    },
  };
}

export function buildMatchTask(
  objectIds: readonly StarpathBuildObjectId[],
  round: number,
  target: number
): PracticeTask {
  const objectId = objectIds[round % objectIds.length]!;
  const distractorPool: StarpathBuildObjectId[] = [
    "rocket",
    "house",
    "tree",
    "robot",
    "moon-buggy",
    "space-station",
    "planet",
    "alien",
    "satellite",
    "cat",
  ];
  const distractors = rotate(distractorPool.filter((candidate) => candidate !== objectId), round).slice(0, 2);
  const objectOptions = rotate([objectId, ...distractors], round);
  const options = objectOptions.map((candidate, index) => ({
    id: `${candidate}-${target}-${index}`,
    objectId: candidate,
  }));
  return {
    kind: "starpathBuildMatch",
    prompt: `Which picture matches Geospin's ${getBuildObject(objectId).label.toLowerCase()}?`,
    speakText: `Look closely at Geospin's build. Choose the finished picture that uses the same shapes.`,
    target,
    objectId,
    options,
    correctOptionId: options.find((option) => option.objectId === objectId)!.id,
    feedback: {
      correct: "It matches! The shapes are arranged in the same way.",
      wrong: `Look again for the ${getBuildObject(objectId).label.toLowerCase()} with the same shape parts.`,
    },
  };
}

const MUSEUM_CASES: Array<{
  criterion: { type: "contains" | "most"; shape: FoundationShape };
  objectIds: [StarpathBuildObjectId, StarpathBuildObjectId, StarpathBuildObjectId];
  correctObjectId: StarpathBuildObjectId;
}> = [
  {
    criterion: { type: "most", shape: "circle" },
    objectIds: ["tree", "rocket", "house"],
    correctObjectId: "tree",
  },
  {
    criterion: { type: "contains", shape: "triangle" },
    objectIds: ["rocket", "moon-buggy", "satellite"],
    correctObjectId: "rocket",
  },
  {
    criterion: { type: "contains", shape: "square" },
    objectIds: ["robot", "rocket", "planet"],
    correctObjectId: "robot",
  },
];

export function spaceMuseumTask(round: number, target: number): PracticeTask {
  const museumCase = MUSEUM_CASES[round % MUSEUM_CASES.length]!;
  const objectIds = rotate(museumCase.objectIds, round);
  const options = objectIds.map((objectId, index) => ({
    id: `${objectId}-${target}-${index}`,
    objectId,
  }));
  const shape = museumCase.criterion.shape;
  const prompt = museumCase.criterion.type === "most"
    ? `Which picture uses the most ${shape}s?`
    : `Which picture uses a ${shape}?`;
  const count = countBuildShape(museumCase.correctObjectId, shape);
  return {
    kind: "starpathSpaceMuseum",
    prompt,
    speakText: `${prompt} Look carefully at every shape in the museum pictures.`,
    target,
    criterion: museumCase.criterion,
    options,
    correctOptionId: options.find((option) => option.objectId === museumCase.correctObjectId)!.id,
    feedback: {
      correct:
        museumCase.criterion.type === "most"
          ? `Correct! The ${getBuildObject(museumCase.correctObjectId).label.toLowerCase()} uses ${count} ${shape}s.`
          : `Correct! The ${getBuildObject(museumCase.correctObjectId).label.toLowerCase()} contains a ${shape}.`,
      wrong: `Look at each picture again and find the ${shape}${museumCase.criterion.type === "most" ? "s" : ""}.`,
    },
  };
}
