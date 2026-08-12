import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SHAPES, SHAPE_IDS, inBounds, rotate, sameShape, translate, translatePoint, type Shape } from "@/data/activities/starpath/level5/transforms";
import type { Point } from "@/data/activities/starpath/level5/coordinates";

type TransformTask = Extract<PracticeTask, { kind: "starpathTransform" }>;
const BOUNDS = { x: 8, y: 8 };
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);
const placed = (id: string, bx: number, by: number): Shape => translate(SHAPES[id] ?? [], bx, by);
const base = (mode: TransformTask["mode"], render: TransformTask["render"], target: number) =>
  ({ kind: "starpathTransform" as const, mode, render, target, bounds: BOUNDS });

const phrase = (d: Point) => {
  const h = d.x ? `${Math.abs(d.x)} ${d.x > 0 ? "right" : "left"}` : "";
  const v = d.y ? `${Math.abs(d.y)} ${d.y > 0 ? "up" : "down"}` : "";
  return [h, v].filter(Boolean).join(" and ") || "no move";
};

// W5 L1 — Transform in Order: apply two slides in sequence, tap the landing point.
export function transformInOrderTask(round: number, target: number): TransformTask {
  const shape = placed(SHAPE_IDS[round % SHAPE_IDS.length]!, 1, 1);
  const mark = shape[0]!;
  const d1 = { x: 2 + (round % 2), y: 1 };
  const d2 = { x: 1, y: 1 + (round % 2) };
  const answer = translatePoint(translatePoint(mark, d1.x, d1.y), d2.x, d2.y);
  return {
    ...base("sequence", "tap", target), shape, markStart: mark, answer,
    prompt: `Slide the shape ${phrase(d1)}, then ${phrase(d2)}. Tap where the marked corner lands.`,
    speakText: "Do the first slide, then the second from there. Combining two slides is the same as one longer slide.",
    feedback: { correct: "Correct — the two slides combine into one overall move.", wrong: "Apply the first slide, then the second from the new spot." },
  };
}

// W5 L2 — Does Order Matter? compare a sequence with its reverse.
export function orderMattersTask(round: number, target: number): TransformTask {
  const shape = placed(SHAPE_IDS[(round + 1) % SHAPE_IDS.length]!, 2, 2);
  const commute = round % 2 === 0;
  const centre: Point = { x: 4, y: 4 };
  // First move is always a slide; the second is a slide (commutes) or a turn (does not).
  const slide = (s: Shape) => translate(s, 3, 0);
  const second = (s: Shape) => (commute ? translate(s, 0, 2) : rotate(s, centre, 90));
  const ab = second(slide(shape));
  const ba = slide(second(shape));
  const same = sameShape(ab, ba);
  const secondName = commute ? "slide it 2 up" : "turn it a quarter-turn about the middle";
  const options = order([
    { id: "same", label: "Same result either way" },
    { id: "diff", label: "Different result depending on order" },
  ], round);
  return {
    ...base("order", "options", target), shape,
    prompt: `You slide the shape 3 right, then ${secondName}. Would doing those two moves in the other order give the same final position?`,
    speakText: "Picture both orders. For some pairs the order changes the result, for others it does not.",
    options, correctOptionIds: [same ? "same" : "diff"],
    feedback: { correct: same ? "Correct — two slides give the same result in any order." : "Correct — a slide and a turn can land in different places depending on the order.", wrong: "Try both orders in your head and compare the final positions." },
  };
}

// W5 L3 — Find the Transformation Chain: which sequence maps the shape to the image?
export function findChainTask(round: number, target: number): TransformTask {
  const shape = placed(SHAPE_IDS[(round + 2) % SHAPE_IDS.length]!, 1, 1);
  const centre: Point = { x: 4, y: 4 };
  const image = rotate(translate(shape, 2, 1), centre, 180);
  const safe = inBounds(image, BOUNDS) ? image : translate(shape, 3, 2);
  const options = order([
    { id: "a", label: "Slide 2 right and 1 up, then turn a half-turn" },
    { id: "b", label: "Turn a half-turn, then slide 2 right and 1 up" },
    { id: "c", label: "Flip across a mirror, then slide up" },
  ], round);
  return {
    ...base("chain", "options", target), shape, image: safe,
    prompt: "Which sequence of moves takes the shape to the blue image?",
    speakText: "Track a corner from the shape to the image. Which two moves, in order, get it there?",
    options, correctOptionIds: ["a"],
    feedback: { correct: "Correct — that sequence lands on the blue image.", wrong: "Follow one corner through each option's moves and see which reaches the image." },
  };
}
