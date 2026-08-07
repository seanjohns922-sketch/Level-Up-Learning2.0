import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Point } from "./coordinates";
import { SHAPES, SHAPE_IDS, translate, translatePoint, reflect, reflectPoint, rotate, rotatePoint, type MirrorLine, type Shape } from "./transforms";

type TransformTask = Extract<PracticeTask, { kind: "starpathTransform" }>;
const BOUNDS = { x: 6, y: 6 };
// Width-1 figures sit cleanly to the left of a mirror at x=3 and reflect onto the grid.
const REFLECT_SHAPES = ["ell", "corner", "boot"];
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);
const placed = (id: string, bx: number, by: number): Shape => translate(SHAPES[id] ?? [], bx, by);

function transPhrase(dx: number, dy: number): string {
  const h = dx > 0 ? `${dx} right` : dx < 0 ? `${-dx} left` : "";
  const v = dy > 0 ? `${dy} up` : dy < 0 ? `${-dy} down` : "";
  return [h, v].filter(Boolean).join(", ") || "no move";
}

function textOptions(labels: string[], correctIndex: number, round: number) {
  const tagged = labels.map((label, index) => ({ id: `o${index}`, label, correct: index === correctIndex }));
  const ordered = order(tagged, round);
  return { options: ordered.map(({ id, label }) => ({ id, label })), correctId: ordered.find((o) => o.correct)!.id };
}

const base = (mode: TransformTask["mode"], render: TransformTask["render"], target: number): Pick<TransformTask, "kind" | "mode" | "render" | "target" | "bounds"> =>
  ({ kind: "starpathTransform", mode, render, target, bounds: BOUNDS });

// W6 L1 — slide the whole figure; tap where the marked corner lands.
export function translateTapTask(round: number, target: number): TransformTask {
  const id = SHAPE_IDS[round % SHAPE_IDS.length]!;
  const shape = placed(id, 1, 1);
  const dx = 2 + (round % 2);
  const dy = 1 + (round % 2);
  const mark = shape[0]!;
  return {
    ...base("translate", "tap", target), shape, markStart: mark, answer: translatePoint(mark, dx, dy),
    prompt: `Slide the shape ${transPhrase(dx, dy)}. Tap where the marked corner lands.`,
    speakText: `In a slide, every point moves the same. Move the marked corner ${transPhrase(dx, dy)} and tap the new spot.`,
    feedback: { correct: "Correct — every point slides the same amount.", wrong: `Move the marked corner ${transPhrase(dx, dy)} from where it is now.` },
  };
}

// W6 L2 — describe the translation between a shape and its image.
export function describeTask(round: number, target: number): TransformTask {
  const id = SHAPE_IDS[(round + 1) % SHAPE_IDS.length]!;
  const shape = placed(id, 1, 1);
  const dx = 2 + (round % 2);
  const dy = 1 + (round % 2);
  const { options, correctId } = textOptions([transPhrase(dx, dy), transPhrase(dy, dx), transPhrase(-dx, dy)], 0, round);
  return {
    ...base("describe", "options", target), shape, image: translate(shape, dx, dy), options, correctOptionIds: [correctId],
    prompt: "How did the shape slide to the blue image?",
    speakText: "Compare a point on the shape with the matching point on the image. How far across, and how far up?",
    feedback: { correct: "Yes — that is how far it slid.", wrong: "Track one corner from the shape to the image: how far across, then how far up?" },
  };
}

// W6 L3 — judge whether the blue image is a valid slide (translation preserves orientation).
export function checkTask(round: number, target: number): TransformTask {
  const valid = round % 2 === 0;
  const id = valid ? SHAPE_IDS[(round + 2) % SHAPE_IDS.length]! : REFLECT_SHAPES[round % REFLECT_SHAPES.length]!;
  const shape = placed(id, 1, 1);
  const image = valid ? translate(shape, 3, 1) : reflect(shape, { axis: "vertical", at: 3 });
  const { options, correctId } = textOptions(["Yes, it is a correct slide", "No, it is not a slide"], valid ? 0 : 1, round);
  return {
    ...base("check", "options", target), shape, image, options, correctOptionIds: [correctId],
    prompt: "Is the blue image a correct slide of the shape?",
    speakText: "A slide keeps the shape facing the same way. If the image is flipped or turned, it is not a slide.",
    feedback: { correct: "Correct — a slide keeps size, shape and facing the same.", wrong: "Check the facing: a slide never flips or turns the shape." },
  };
}

// W7 L1 — reflect across a vertical mirror line; tap where the marked corner lands.
export function reflectTapTask(round: number, target: number): TransformTask {
  const id = REFLECT_SHAPES[round % REFLECT_SHAPES.length]!;
  const line: MirrorLine = { axis: "vertical", at: 3 };
  const shape = placed(id, 1, 1);
  const mark = shape[shape.length - 1]!;
  return {
    ...base("reflect", "tap", target), shape, line, markStart: mark, answer: reflectPoint(mark, line),
    prompt: "Reflect the shape across the mirror line. Tap where the marked corner lands.",
    speakText: "A reflected point is the same distance from the mirror line, on the other side. Tap the mirror image of the marked corner.",
    feedback: { correct: "Correct — same distance across the line.", wrong: "Count how far the corner is from the line, then go the same distance on the other side." },
  };
}

// W7 L2 — rotate about the centre; tap where the marked corner lands.
export function rotateTapTask(round: number, target: number): TransformTask {
  const centre: Point = { x: 3, y: 3 };
  const shape = placed("corner", 3, 3);
  const deg: 90 | 180 = round % 2 === 0 ? 90 : 180;
  const mark = shape[shape.length - 1]!;
  const turn = deg === 90 ? "a quarter turn clockwise" : "a half turn";
  return {
    ...base("rotate", "tap", target), shape, centre, rotation: deg, markStart: mark, answer: rotatePoint(mark, centre, deg),
    prompt: `Turn the shape ${turn} about the centre. Tap where the marked corner lands.`,
    speakText: `Rotate the marked corner ${turn} around the centre, keeping the same distance from it.`,
    feedback: { correct: "Correct — turned around the centre.", wrong: `Turn the corner ${turn} about the centre; it stays the same distance from the centre.` },
  };
}

// W7 L3 — classify the transformation from a shape and its image.
export function compareTask(round: number, target: number): TransformTask {
  const kind = round % 3;
  const translateShape = placed(SHAPE_IDS[round % SHAPE_IDS.length]!, 1, 1);
  const reflectShape = placed(REFLECT_SHAPES[round % REFLECT_SHAPES.length]!, 1, 1);
  const rotateShape = placed("corner", 3, 3);
  const shownShape = kind === 0 ? translateShape : kind === 1 ? reflectShape : rotateShape;
  const image = kind === 0 ? translate(translateShape, 3, 1) : kind === 1 ? reflect(reflectShape, { axis: "vertical", at: 3 }) : rotate(rotateShape, { x: 3, y: 3 }, 180);
  const { options, correctId } = textOptions(["Translation (slide)", "Reflection (flip)", "Rotation (turn)"], kind, round);
  return {
    ...base("compare", "options", target), shape: shownShape, image, options, correctOptionIds: [correctId],
    prompt: "Which transformation takes the shape to the blue image?",
    speakText: "A slide keeps it facing the same way, a flip mirrors it, and a turn rotates it around a point. Which one is this?",
    feedback: { correct: "Correct — that is the transformation.", wrong: "A slide keeps the facing; a flip mirrors it; a turn rotates it. Compare the facing." },
  };
}
