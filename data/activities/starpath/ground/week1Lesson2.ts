import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { SHAPE_FACTS, type FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";
import { SHAPE_OBJECTS, OBJECTS_BY_SHAPE, buildObjectScene } from "@/data/activities/starpath/ground/shape-objects";

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];
const SHAPE_COLOURS = ["#67e8f9", "#f9a8d4", "#fde047", "#86efac", "#c4b5fd"] as const;

function colour(index: number) {
  return SHAPE_COLOURS[index % SHAPE_COLOURS.length]!;
}

// A1 — Space Object Match: show one space object, choose the shape inside it.
function objectMatchTask(round: number, target: number): PracticeTask {
  const targetShape = SHAPES[round % SHAPES.length]!;
  const objectOptions = OBJECTS_BY_SHAPE[targetShape];
  const objectId = objectOptions[round % objectOptions.length]!;
  const label = SHAPE_OBJECTS[objectId].label.toLowerCase();
  const others = SHAPES.filter((shape) => shape !== targetShape).slice(0, 2);
  const options = [targetShape, ...others]
    .map((shape, index) => ({ id: `${shape}-${target}-${index}`, shape, colour: colour(round + index) }))
    .sort((left, right) => ((SHAPES.indexOf(left.shape) + round) % 3) - ((SHAPES.indexOf(right.shape) + round * 2) % 3));
  const correct = options.find((option) => option.shape === targetShape)!;
  return {
    kind: "starpathObjectShape",
    prompt: `Which shape can you see in the ${label}?`,
    speakText: `Which shape can you see in the ${label}? ${SHAPE_OBJECTS[objectId].part}`,
    target,
    objectId,
    targetShape,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! The ${label} is a ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
      wrong: `Look at the ${label} again — it is a ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
    },
  };
}

// A2 — Shape Explorer: find the object in a varied scene that holds the target shape.
function shapeExplorerTask(round: number, target: number): PracticeTask {
  const targetShape = SHAPES[round % SHAPES.length]!;
  const { objects, correctObjectId } = buildObjectScene(targetShape, round);
  const label = SHAPE_OBJECTS[correctObjectId].label.toLowerCase();
  return {
    kind: "starpathShapeScene",
    prompt: `Find something shaped like a ${targetShape}.`,
    speakText: `Find something shaped like a ${targetShape}. Look for ${SHAPE_FACTS[targetShape].toLowerCase()}`,
    target,
    targetShape,
    objects,
    correctObjectId,
    feedback: {
      correct: `Great spotting! The ${label} is shaped like a ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
      wrong: `The ${label} is the one shaped like a ${targetShape}.`,
    },
  };
}

// A3 — Shape Detective Hunt: tap EVERY item of the target shape in a mixed field.
function shapeDetectiveTask(round: number, target: number): PracticeTask {
  const targetShape = SHAPES[round % SHAPES.length]!;
  const distractorShapes = SHAPES.filter((shape) => shape !== targetShape);
  const targetCount = 2 + (round % 2); // 2 or 3 to find
  const items: Array<{ id: string; shape: FoundationShape; colour: string }> = [];
  for (let i = 0; i < targetCount; i += 1) {
    items.push({ id: `t-${target}-${i}`, shape: targetShape, colour: colour(round + i) });
  }
  for (let i = 0; i < 6 - targetCount; i += 1) {
    const shape = distractorShapes[i % distractorShapes.length]!;
    items.push({ id: `d-${target}-${i}`, shape, colour: colour(round + i + 2) });
  }
  // Deterministic shuffle so the target shapes are not clustered.
  const shuffled = items
    .map((item, index) => ({ item, sort: (index * 7 + round * 3) % items.length }))
    .sort((left, right) => left.sort - right.sort)
    .map((entry) => entry.item);
  return {
    kind: "starpathShapeTapAll",
    prompt: `Tap every ${targetShape}.`,
    speakText: `Tap every ${targetShape} you can find. ${SHAPE_FACTS[targetShape]}`,
    target,
    targetShape,
    items: shuffled,
    feedback: {
      correct: `Detective work complete! You found every ${targetShape}. ${SHAPE_FACTS[targetShape]}`,
      wrong: `Keep looking for the ${targetShape}s. ${SHAPE_FACTS[targetShape]}`,
    },
  };
}

export function createShapeDetectivesTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let matchRound = 0;
  let explorerRound = 0;
  let detectiveRound = 0;

  return {
    teaching: () => {
      target += 1;
      return {
        kind: "starpathShapeIntro",
        scene: "intro",
        variant: "objects",
        prompt: "Shapes are everywhere in Starpath.",
        speakText:
          "Shapes are everywhere! We can find them in rockets, planets, windows and doors. A planet is a circle. A rocket nose is a triangle. A window is a square. A door is a rectangle.",
        target,
      };
    },
    activities: [
      () => {
        target += 1;
        const task = objectMatchTask(matchRound, target);
        matchRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = shapeExplorerTask(explorerRound, target);
        explorerRound += 1;
        return task;
      },
      () => {
        target += 1;
        const task = shapeDetectiveTask(detectiveRound, target);
        detectiveRound += 1;
        return task;
      },
    ],
  };
}

export const SHAPE_DETECTIVES_PRACTISED_SKILLS = [
  "Spot the shape hidden inside a space object",
  "Find familiar shapes inside everyday objects",
  "Find every matching shape in a busy scene",
];

export const SHAPE_DETECTIVES_CONTENT = {
  missionBrief:
    "Become a Shape Detective! Hunt for circles, squares, triangles and rectangles hidden inside the objects of Starpath.",
  successCriteria: [
    "find circles in objects",
    "find squares in objects",
    "find triangles in objects",
    "find rectangles in objects",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Shapes Are Everywhere",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "space-object-match",
      title: "Space Object Match",
      description: "Look at a space object and choose the familiar shape hidden inside it.",
      taskKinds: ["starpathObjectShape"],
    },
    {
      key: "shape-explorer",
      title: "Shape Explorer",
      description: "Explore a Starpath scene and find the object shaped like each familiar shape.",
      taskKinds: ["starpathShapeScene"],
    },
    {
      key: "shape-detective-hunt",
      title: "Shape Detective Hunt",
      description: "Tap every matching shape hidden in a busy cosmic scene.",
      taskKinds: ["starpathShapeTapAll"],
    },
  ],
  reflection: {
    prompt: "What shape was easiest to find today?",
    options: ["Circle", "Triangle", "Square", "Rectangle"],
  },
  practisedSkills: SHAPE_DETECTIVES_PRACTISED_SKILLS,
  nextUpLabel: "Shape Masters",
  createTaskSet: createShapeDetectivesTaskSet,
} satisfies StarpathLessonContent;
