import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type FoundationShape = "circle" | "triangle" | "square" | "rectangle";

const SHAPE_FACTS: Record<FoundationShape, string> = {
  circle: "A circle is round.",
  triangle: "A triangle has 3 straight sides.",
  square: "A square has 4 equal sides.",
  rectangle: "A rectangle has 4 sides, with 2 longer and 2 shorter sides.",
};

const SHAPE_COLOURS = ["#67e8f9", "#f9a8d4", "#fde047", "#86efac", "#c4b5fd"] as const;
const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];

function rotatedShapes(target: FoundationShape, round: number) {
  const otherShapes = SHAPES.filter((shape) => shape !== target);
  const distractors = round < 2
    ? otherShapes.filter((shape) => !(target === "square" && shape === "rectangle")).slice(0, 2)
    : otherShapes.slice(round % otherShapes.length).concat(otherShapes).slice(0, 2);
  return [target, ...distractors]
    .sort((left, right) => ((SHAPES.indexOf(left) + round * 2) % 5) - ((SHAPES.indexOf(right) + round * 3) % 5));
}

function shapeMatchTask(round: number, target: number): PracticeTask {
  const targetShape = SHAPES[round % SHAPES.length]!;
  const options = rotatedShapes(targetShape, round).map((shape, index) => ({
    id: `${shape}-${target}-${index}`,
    shape,
    colour: SHAPE_COLOURS[(round + index) % SHAPE_COLOURS.length]!,
    scale: 0.88 + ((round + index) % 3) * 0.08,
  }));
  const correctOption = options.find((option) => option.shape === targetShape)!;
  return {
    kind: "starpathShapeMatch",
    prompt: `Find the ${targetShape}.`,
    speakText: `Find the ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
    target,
    targetShape,
    options,
    correctOptionId: correctOption.id,
    feedback: {
      correct: `Yes! That is a ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
      wrong: `The correct answer is the ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
    },
  };
}

function shapeSortTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  return {
    kind: "starpathShapeSort",
    prompt: `Drag the ${shape} to its planet.`,
    speakText: `Drag this ${shape} to ${shape} planet. ${SHAPE_FACTS[shape]}`,
    target,
    shape,
    colour: SHAPE_COLOURS[(round * 2 + 1) % SHAPE_COLOURS.length]!,
    scale: 0.84 + (round % 4) * 0.06,
    feedback: {
      correct: `Great sorting! This belongs on ${shape} planet. ${SHAPE_FACTS[shape]}`,
      wrong: `This shape belongs with the ${shape}s. ${SHAPE_FACTS[shape]}`,
    },
  };
}

const SCENE_OBJECTS = {
  circle: { id: "planet", label: "planet" },
  triangle: { id: "flag", label: "flag" },
  square: { id: "window", label: "window" },
  rectangle: { id: "door", label: "door" },
} as const;

function shapeSceneTask(round: number, target: number): PracticeTask {
  const targetShape = SHAPES[round % SHAPES.length]!;
  const object = SCENE_OBJECTS[targetShape];
  return {
    kind: "starpathShapeScene",
    prompt: `Which object contains a ${targetShape}?`,
    speakText: `Which object contains a ${targetShape}? Look for ${SHAPE_FACTS[targetShape].toLowerCase()}`,
    target,
    targetShape,
    correctObjectId: object.id,
    feedback: {
      correct: `Correct! The ${object.label} contains a ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
      wrong: `The ${object.label} contains the ${targetShape}. Look for the object that matches this shape.`,
    },
  };
}

export function createMeetTheShapesTaskGenerator() {
  let taskIndex = 0;
  return (): PracticeTask => {
    const target = taskIndex + 1;
    taskIndex += 1;
    if (taskIndex === 1) {
      return {
        kind: "starpathShapeIntro",
        scene: "intro",
        prompt: "Meet the four cosmic shapes with Geospin.",
        speakText: `Meet the shapes. ${SHAPE_FACTS.circle} ${SHAPE_FACTS.triangle} ${SHAPE_FACTS.square} ${SHAPE_FACTS.rectangle}`,
        target,
      };
    }
    if (taskIndex <= 5) return shapeMatchTask(taskIndex - 2, target);
    if (taskIndex <= 9) return shapeSortTask(taskIndex - 6, target);
    return shapeSceneTask(taskIndex - 10, target);
  };
}

export const MEET_THE_SHAPES_PRACTISED_SKILLS = [
  "Recognise circles, triangles, squares and rectangles",
  "Sort familiar shapes by name",
  "Find familiar shapes inside environmental objects",
];

export { SHAPE_FACTS };
