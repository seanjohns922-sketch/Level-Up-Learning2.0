import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

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

// Name the Shape — shape shown, choose its name (word). Reinforces vocabulary.
function shapeNameTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  const others = SHAPES.filter((candidate) => candidate !== shape).slice(0, 2);
  const options = [shape, ...others]
    .map((name, index) => ({ id: `${name}-${target}-${index}`, name }))
    .sort((left, right) => ((SHAPES.indexOf(left.name) + round) % 3) - ((SHAPES.indexOf(right.name) + round * 2) % 3));
  const correct = options.find((option) => option.name === shape)!;
  return {
    kind: "starpathShapeName",
    prompt: "What is this shape called?",
    speakText: `What is this shape called? ${SHAPE_FACTS[shape]}`,
    target,
    shape,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! This is a ${shape}. ${SHAPE_FACTS[shape]}`,
      wrong: `This shape is called a ${shape}. ${SHAPE_FACTS[shape]}`,
    },
  };
}

export function createMeetTheShapesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let matchRound = 0;
  let nameRound = 0;
  let sortRound = 0;

  return {
    teaching: () => {
      target += 1;
      return {
        kind: "starpathShapeIntro",
        scene: "intro",
        prompt: "Meet the four cosmic shapes with Geospin.",
        speakText: `Meet the shapes. ${SHAPE_FACTS.circle} ${SHAPE_FACTS.triangle} ${SHAPE_FACTS.square} ${SHAPE_FACTS.rectangle}`,
        target,
      };
    },
    activities: [
      () => {
        target += 1;
        const task = shapeMatchTask(matchRound, target);
        matchRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = shapeNameTask(nameRound, target);
        nameRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = shapeSortTask(sortRound, target);
        sortRound += 1;
        return task;
      },
    ],
  };
}

export const MEET_THE_SHAPES_PRACTISED_SKILLS = [
  "Recognise circles, triangles, squares and rectangles",
  "Name each familiar shape",
  "Sort familiar shapes by name",
];

export const MEET_THE_SHAPES_CONTENT = {
  missionBrief: "Welcome, Explorer! Travel across Starpath and discover the familiar shapes hidden throughout the cosmic world.",
  successCriteria: [
    "name familiar shapes",
    "match familiar shapes",
    "sort familiar shapes",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Meet the Cosmic Shapes",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "cosmic-shape-match",
      title: "Cosmic Shape Match",
      description: "Match each glowing target with the familiar shape that has the same name.",
      taskKinds: ["starpathShapeMatch"],
    },
    {
      key: "name-the-shape",
      title: "Name the Shape",
      description: "See a shape and choose its name in a quick naming round.",
      taskKinds: ["starpathShapeName"],
    },
    {
      key: "shape-sorter",
      title: "Shape Sorter",
      description: "Guide each shape to its matching planet. Drag it across space or tap the correct landing zone.",
      taskKinds: ["starpathShapeSort"],
    },
  ],
  reflection: {
    prompt: "What did you practise today?",
    options: ["I named shapes", "I matched shapes", "I sorted shapes"],
  },
  practisedSkills: MEET_THE_SHAPES_PRACTISED_SKILLS,
  nextUpLabel: "Shape Detectives",
  createTaskSet: createMeetTheShapesTaskSet,
} satisfies StarpathLessonContent;

export { SHAPE_FACTS };
