import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  RELATION_PHRASE,
  RELATION_WORD,
  positionObjectLabel,
  type PositionObjectId,
  type PositionRelation,
} from "./position-objects";

// General object pool (cave is reserved as the "inside" container).
const OBJECTS: PositionObjectId[] = [
  "star",
  "planet",
  "moon",
  "rocket",
  "crystal",
  "satellite",
  "alien",
  "flag",
];

function pickDistinct(round: number, count: number, avoid: PositionObjectId[]): PositionObjectId[] {
  const chosen: PositionObjectId[] = [];
  let step = 0;
  while (chosen.length < count && step < OBJECTS.length * 2) {
    const candidate = OBJECTS[(round + step) % OBJECTS.length]!;
    if (!avoid.includes(candidate) && !chosen.includes(candidate)) chosen.push(candidate);
    step += 1;
  }
  return chosen;
}

function oppositeSide(side: "left" | "right"): "left" | "right" {
  return side === "left" ? "right" : "left";
}

// The position where a same-object decoy is placed, so the clue can only be
// solved by reading position (not just "find the star").
function decoyOf(relation: PositionRelation, side?: "left" | "right"): { relation: PositionRelation; side?: "left" | "right" } {
  switch (relation) {
    case "above":
      return { relation: "below" };
    case "below":
      return { relation: "above" };
    case "beside":
      return { relation: "beside", side: oppositeSide(side ?? "right") };
    case "behind":
      return { relation: "in-front" };
    case "in-front":
      return { relation: "behind" };
    case "inside":
      // Fillers occupy both beside spots, so the same-object decoy goes above
      // the cave (never on top of a filler).
      return { relation: "above" };
    default:
      return { relation: "below" };
  }
}

// ── Find It ──────────────────────────────────────────────────────────────────
export function findItTask(round: number, target: number, relations: PositionRelation[]): PracticeTask {
  const relation = relations[round % relations.length]!;
  const side: "left" | "right" | undefined = relation === "beside" ? (round % 2 === 0 ? "left" : "right") : undefined;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : pickDistinct(round + 1, 1, [])[0]!;
  const clueObject = pickDistinct(round + 3, 1, [anchor])[0]!;
  const fillers = pickDistinct(round + 5, 2, [anchor, clueObject]);
  const decoy = decoyOf(relation, side);

  // Two "side" spots stay open for filler distractors; if the clue itself uses a
  // beside spot, fillers go above/below instead.
  const fillerSpots: Array<{ relation: PositionRelation; side?: "left" | "right" }> =
    relation === "beside"
      ? [{ relation: "above" }, { relation: "below" }]
      : [
          { relation: "beside", side: "left" },
          { relation: "beside", side: "right" },
        ];

  const placements = [
    { id: `find-${target}-correct`, object: clueObject, relation, side },
    { id: `find-${target}-decoy`, object: clueObject, relation: decoy.relation, side: decoy.side },
    { id: `find-${target}-fa`, object: fillers[0]!, relation: fillerSpots[0]!.relation, side: fillerSpots[0]!.side },
    { id: `find-${target}-fb`, object: fillers[1]!, relation: fillerSpots[1]!.relation, side: fillerSpots[1]!.side },
  ];

  const clueText = `the ${positionObjectLabel(clueObject)} ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}`;
  return {
    kind: "starpathPositionFind",
    prompt: `Tap ${clueText}.`,
    speakText: `Tap ${clueText}. Look carefully at where each object is.`,
    target,
    anchorObject: anchor,
    placements,
    correctId: `find-${target}-correct`,
    feedback: {
      correct: `Yes! That is ${clueText}.`,
      wrong: `Look again for the ${positionObjectLabel(clueObject)} that is ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}.`,
    },
  };
}

// ── Say Where ────────────────────────────────────────────────────────────────
export function sayWhereTask(
  round: number,
  target: number,
  correctRelations: PositionRelation[],
  optionPool: PositionRelation[]
): PracticeTask {
  const relation = correctRelations[round % correctRelations.length]!;
  const side: "left" | "right" | undefined = relation === "beside" ? (round % 2 === 0 ? "left" : "right") : undefined;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : pickDistinct(round + 2, 1, [])[0]!;
  const subject = pickDistinct(round + 4, 1, [anchor])[0]!;

  const distractors = optionPool.filter((candidate) => candidate !== relation);
  const chosenDistractors = [distractors[round % distractors.length]!, distractors[(round + 1) % distractors.length]!]
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 2);
  while (chosenDistractors.length < 2) {
    const extra = optionPool.find((candidate) => candidate !== relation && !chosenDistractors.includes(candidate));
    if (!extra) break;
    chosenDistractors.push(extra);
  }
  const options = [relation, ...chosenDistractors]
    .map((rel, index) => ({ id: `where-${target}-${rel}-${index}`, relation: rel, order: (index * 5 + round * 3) % 3 }))
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...option }) => option);
  const correct = options.find((option) => option.relation === relation)!;

  return {
    kind: "starpathPositionWord",
    prompt: `Where is the ${positionObjectLabel(subject)}?`,
    speakText: `Where is the ${positionObjectLabel(subject)}? Is it ${RELATION_WORD[relation].toLowerCase()} the ${positionObjectLabel(anchor)}, or somewhere else?`,
    target,
    anchorObject: anchor,
    subjectObject: subject,
    relation,
    side,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! The ${positionObjectLabel(subject)} is ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}.`,
      wrong: `Look again. The ${positionObjectLabel(subject)} is ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}.`,
    },
  };
}

// ── Place It (planar: above / below / beside) ────────────────────────────────
export function placeItTask(round: number, target: number): PracticeTask {
  const relation = (["above", "below", "beside"] as const)[round % 3]!;
  const anchor = pickDistinct(round + 1, 1, [])[0]!;
  const mover = pickDistinct(round + 4, 1, [anchor])[0]!;
  const phrase = `${positionObjectLabel(mover)} ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}`;
  return {
    kind: "starpathPositionPlace",
    prompt: `Move the ${phrase}.`,
    speakText: `Move the ${phrase}. Drag it to the right spot.`,
    target,
    anchorObject: anchor,
    moverObject: mover,
    relation,
    slots: ["above", "below", "beside"],
    feedback: {
      correct: `Perfect! The ${positionObjectLabel(mover)} is now ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}.`,
      wrong: `Try again — put it ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}.`,
    },
  };
}

// ── Which Picture ────────────────────────────────────────────────────────────
export function whichPictureTask(round: number, target: number, relations: PositionRelation[]): PracticeTask {
  const relation = relations[round % relations.length]!;
  const side: "left" | "right" | undefined = relation === "beside" ? "right" : undefined;
  const anchor: PositionObjectId = relation === "inside" ? "cave" : pickDistinct(round + 1, 1, [])[0]!;
  const subject = pickDistinct(round + 3, 1, [anchor])[0]!;
  const distractRels = relations.filter((candidate) => candidate !== relation);
  const wrongRels = [distractRels[round % distractRels.length]!, distractRels[(round + 1) % distractRels.length]!];
  const scenes = [
    { relation, side },
    { relation: wrongRels[0]!, side: wrongRels[0] === "beside" ? ("left" as const) : undefined },
    { relation: wrongRels[1]!, side: wrongRels[1] === "beside" ? ("right" as const) : undefined },
  ]
    .map((scene, index) => ({
      id: `pic-${target}-${index}`,
      anchorObject: anchor,
      subjectObject: subject,
      relation: scene.relation,
      side: scene.side,
      isCorrect: index === 0,
      order: (index * 7 + round * 4) % 3,
    }))
    .sort((left, right) => left.order - right.order);
  const correct = scenes.find((scene) => scene.isCorrect)!;
  const clueText = `the ${positionObjectLabel(subject)} ${RELATION_PHRASE[relation]} the ${positionObjectLabel(anchor)}`;
  return {
    kind: "starpathPositionPicture",
    prompt: `Which picture shows ${clueText}?`,
    speakText: `Which picture shows ${clueText}? Look at where the ${positionObjectLabel(subject)} is in each picture.`,
    target,
    options: scenes.map(({ isCorrect: _isCorrect, order: _order, ...scene }) => scene),
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! That picture shows ${clueText}.`,
      wrong: `Look for the picture with ${clueText}.`,
    },
  };
}

// ── Follow the Clues ─────────────────────────────────────────────────────────
export function followCluesTask(round: number, target: number, variant: "clues" | "mission"): PracticeTask {
  const anchor = pickDistinct(round + 1, 1, [])[0]!;
  const objects = pickDistinct(round + 3, 3, [anchor]);
  const layout =
    variant === "clues"
      ? ([
          { relation: "above" as const, side: undefined },
          { relation: "below" as const, side: undefined },
          { relation: "beside" as const, side: "right" as const },
        ])
      : ([
          { relation: "above" as const, side: undefined },
          { relation: "beside" as const, side: "left" as const },
          { relation: "behind" as const, side: undefined },
        ]);
  const decoy = pickDistinct(round + 6, 1, [anchor, ...objects])[0]!;
  const placements = [
    { id: `seq-${target}-0`, object: objects[0]!, relation: layout[0]!.relation, side: layout[0]!.side },
    { id: `seq-${target}-1`, object: objects[1]!, relation: layout[1]!.relation, side: layout[1]!.side },
    { id: `seq-${target}-2`, object: objects[2]!, relation: layout[2]!.relation, side: layout[2]!.side },
    {
      id: `seq-${target}-decoy`,
      object: decoy,
      relation: variant === "clues" ? ("beside" as const) : ("below" as const),
      side: variant === "clues" ? ("left" as const) : undefined,
    },
  ];
  const steps = layout.map((spot, index) => {
    const clue = `the ${positionObjectLabel(objects[index]!)} ${RELATION_PHRASE[spot.relation]} the ${positionObjectLabel(anchor)}`;
    return {
      instruction: `Tap ${clue}.`,
      speakText: `Tap ${clue}.`,
      targetId: `seq-${target}-${index}`,
    };
  });
  return {
    kind: "starpathPositionSequence",
    prompt: variant === "clues" ? "Follow Geospin's clues." : "Complete the explorer mission.",
    speakText:
      variant === "clues"
        ? "Follow the clues one at a time. Read each clue and tap the right object."
        : "Complete the mission. Follow each positional clue in order to help Geospin.",
    target,
    anchorObject: anchor,
    placements,
    steps,
    feedback: {
      correct: variant === "clues" ? "Every clue solved!" : "Mission complete, Explorer!",
      wrong: "Read the clue again and try another object.",
    },
  };
}
