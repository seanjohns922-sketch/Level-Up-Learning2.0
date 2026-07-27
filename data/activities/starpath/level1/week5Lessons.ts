import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK } from "./shared";

// Level 1 · Week 5 — Direction Words. The genuine Year 1 jump: directions now
// depend on which way the traveller is FACING. Students connect facing with
// forward/backward, apply left/right turns from a facing, then describe a move.

type Dir = "up" | "down" | "left" | "right";
const FACINGS: Dir[] = ["up", "right", "down", "left"];
const WORD: Record<Dir, string> = { up: "up", down: "down", left: "left", right: "right" };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const TURN_RIGHT: Record<Dir, Dir> = { up: "right", right: "down", down: "left", left: "up" };
const TURN_LEFT: Record<Dir, Dir> = { up: "left", left: "down", down: "right", right: "up" };

function dirOptions(
  target: number,
  correct: Dir
): { options: Array<{ id: string; direction: Dir; label: string }>; correctId: string } {
  const options = FACINGS.map((direction, index) => ({
    id: `${direction}-${target}-${index}`,
    direction,
    label: WORD[direction].charAt(0).toUpperCase() + WORD[direction].slice(1),
  }));
  return { options, correctId: options.find((option) => option.direction === correct)!.id };
}

// L1 — Face and Move: connect facing with forward/backward.
export function faceTask(round: number, target: number, object = "rover"): PracticeTask {
  const facing = FACINGS[round % FACINGS.length]!;
  const forward = round % 2 === 0;
  const correct = forward ? facing : OPPOSITE[facing];
  const { options, correctId } = dirOptions(target, correct);
  return {
    kind: "starpathTurnMove",
    mode: "face",
    prompt: `You are facing ${WORD[facing]}. You move ${forward ? "forward" : "backward"}. Which way do you go?`,
    speakText: `You are facing ${WORD[facing]}. Moving ${forward ? "forward" : "backward"} takes you which way?`,
    target,
    object,
    facing,
    options,
    correctOptionId: correctId,
    feedback: {
      correct: `Yes — facing ${WORD[facing]} and going ${forward ? "forward" : "backward"} means you go ${WORD[correct]}.`,
      wrong: `Forward is the way you face. You are facing ${WORD[facing]}.`,
    },
  };
}

// L2 — Left and Right Turns: apply a turn from a facing.
export function turnTask(round: number, target: number, object = "rover"): PracticeTask {
  const facing = FACINGS[round % FACINGS.length]!;
  const turn: "left" | "right" = round % 2 === 0 ? "right" : "left";
  const correct = turn === "right" ? TURN_RIGHT[facing] : TURN_LEFT[facing];
  const { options, correctId } = dirOptions(target, correct);
  return {
    kind: "starpathTurnMove",
    mode: "turn",
    prompt: `You are facing ${WORD[facing]}. Turn ${turn}. Which way are you facing now?`,
    speakText: `You are facing ${WORD[facing]}. Turn ${turn}. Which way do you face now?`,
    target,
    object,
    facing,
    turn,
    options,
    correctOptionId: correctId,
    feedback: {
      correct: `Correct — turning ${turn} from ${WORD[facing]} faces you ${WORD[correct]}.`,
      wrong: `Turn your body ${turn} from facing ${WORD[facing]} and check again.`,
    },
  };
}

// L3 — Say the Move: name the move that produced a change of facing.
export function describeTask(round: number, target: number, object = "rover"): PracticeTask {
  const facing = FACINGS[round % FACINGS.length]!;
  const turn: "left" | "right" = round % 2 === 0 ? "right" : "left";
  const after = turn === "right" ? TURN_RIGHT[facing] : TURN_LEFT[facing];
  const options = [
    { id: `right-${target}`, label: "Turned right" },
    { id: `left-${target}`, label: "Turned left" },
    { id: `forward-${target}`, label: "Went forward" },
  ];
  const correctOptionId = turn === "right" ? `right-${target}` : `left-${target}`;
  return {
    kind: "starpathTurnMove",
    mode: "describe",
    prompt: `The rover was facing ${WORD[facing]} and now faces ${WORD[after]}. What did it do?`,
    speakText: `The rover was facing ${WORD[facing]} and now faces ${WORD[after]}. Choose the move that describes it.`,
    target,
    object,
    facing,
    options,
    correctOptionId,
    feedback: {
      correct: `Yes — that is a turn to the ${turn}.`,
      wrong: `Compare the before and after facing. It turned ${turn}.`,
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createFaceAndMoveTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Face and Move",
      "Forward is the way you are facing.",
      "Which way is forward depends on which way you face. Turn to face a new way and forward changes too."
    ),
    activities: [
      () => faceTask(a++, ++target),
      () => faceTask(b++ + 1, ++target),
      () => faceTask(c++ + 2, ++target),
    ],
  };
}

export function createTurnsTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Left and Right Turns",
      "A turn changes the way you face.",
      "Turning left or right changes which way you face, but it does not move you to a new spot."
    ),
    activities: [
      () => turnTask(a++, ++target),
      () => turnTask(b++ + 1, ++target),
      () => turnTask(c++ + 2, ++target),
    ],
  };
}

export function createSayTheMoveTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Say the Move",
      "Describe a move by comparing before and after.",
      "To describe a move, compare which way the rover faced before and after. Did it turn, or go forward?"
    ),
    activities: [
      () => describeTask(a++, ++target),
      () => describeTask(b++ + 1, ++target),
      () => turnTask(c++ + 2, ++target),
    ],
  };
}

export const FACE_AND_MOVE_CONTENT = {
  missionBrief:
    "Board Geospin's rover. Learn that 'forward' always means the way you are facing — turn and forward turns with you.",
  successCriteria: ["know forward is the way you face", "work out backward", "use a facing to decide direction"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Face and Move", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "forward-back", title: "Forward and Back", description: "Use a facing to move forward or backward.", taskKinds: ["starpathTurnMove"] },
    { key: "facing-check", title: "Facing Check", description: "Decide direction from a facing.", taskKinds: ["starpathTurnMove"] },
    { key: "facing-master", title: "Pilot Check", description: "Read facings independently.", taskKinds: ["starpathTurnMove"] },
  ],
  reflection: {
    prompt: "What decides which way forward is?",
    options: ["The way I am facing", "Not the screen", "It changes when I turn"],
  },
  practisedSkills: ["Connect facing with forward", "Work out backward", "Use orientation to decide direction"],
  nextUpLabel: "Left and Right Turns",
  createTaskSet: createFaceAndMoveTaskSet,
} satisfies StarpathLessonContent;

export const TURNS_CONTENT = {
  missionBrief:
    "Practise turning the rover. A left or right turn changes the way you face without moving you to a new spot.",
  successCriteria: ["turn left from a facing", "turn right from a facing", "keep your spot when you turn"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Left and Right Turns", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "turn-1", title: "Turn Right", description: "Apply a right turn from a facing.", taskKinds: ["starpathTurnMove"] },
    { key: "turn-2", title: "Turn Left", description: "Apply a left turn from a facing.", taskKinds: ["starpathTurnMove"] },
    { key: "turn-3", title: "Turn Master", description: "Turn from any facing.", taskKinds: ["starpathTurnMove"] },
  ],
  reflection: {
    prompt: "What does a turn do?",
    options: ["It changes the way I face", "It does not move me to a new spot", "Left and right depend on my facing"],
  },
  practisedSkills: ["Apply left turns", "Apply right turns", "Separate turning from moving"],
  nextUpLabel: "Say the Move",
  createTaskSet: createTurnsTaskSet,
} satisfies StarpathLessonContent;

export const SAY_THE_MOVE_CONTENT = {
  missionBrief:
    "Watch the rover change facing and name the move precisely — a left turn, a right turn or a step forward.",
  successCriteria: ["compare before and after", "name a turn", "use precise movement words"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Say the Move", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "describe-1", title: "Name the Move", description: "Describe the rover's move.", taskKinds: ["starpathTurnMove"] },
    { key: "describe-2", title: "Move Check", description: "Name a trickier move.", taskKinds: ["starpathTurnMove"] },
    { key: "describe-3", title: "Move Master", description: "Turn and describe independently.", taskKinds: ["starpathTurnMove"] },
  ],
  reflection: {
    prompt: "How did you name the move?",
    options: ["I compared before and after", "I used turn words", "I checked the facing changed"],
  },
  practisedSkills: ["Describe a movement", "Use turn language", "Compare facings"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createSayTheMoveTaskSet,
} satisfies StarpathLessonContent;
