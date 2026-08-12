import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { samePoint, type Point } from "@/data/activities/starpath/level5/coordinates";
import { CARTESIAN_RANGE, QUADRANT_SIGNS, coordLabel, inRange, moveDescription, quadrant } from "./cartesian";

type CartTask = Extract<PracticeTask, { kind: "starpathCartesian" }>;
const R = CARTESIAN_RANGE;
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

// A signed point that rotates through the four quadrants and never lands on an axis.
function signedPt(round: number, salt = 0): Point {
  const mag = 1 + ((round + salt) % (R - 1));
  const magY = 1 + ((round * 2 + salt + 1) % (R - 1));
  const q = (round + salt) % 4;
  const sx = q === 0 || q === 3 ? 1 : -1;
  const sy = q === 0 || q === 1 ? 1 : -1;
  return { x: sx * mag, y: sy * magY };
}

const base = (mode: CartTask["mode"], render: CartTask["render"], target: number): Pick<CartTask, "kind" | "mode" | "render" | "target" | "range"> =>
  ({ kind: "starpathCartesian", mode, render, target, range: R });

function coordOptions(correct: Point, round: number) {
  const cands: Point[] = [correct, { x: correct.y, y: correct.x }, { x: -correct.x, y: correct.y }, { x: correct.x, y: -correct.y }, { x: -correct.x, y: -correct.y }];
  const seen = new Set<string>();
  const list: Point[] = [];
  for (const c of cands) {
    const k = coordLabel(c);
    if (!seen.has(k) && inRange(c)) { seen.add(k); list.push(c); }
    if (list.length >= 3) break;
  }
  const tagged = order(list.map((c, i) => ({ id: `o${i}`, label: coordLabel(c), correct: samePoint(c, correct) })), round);
  return { options: tagged.map(({ id, label }) => ({ id, label })), correctId: tagged.find((o) => o.correct)!.id };
}

const quadOptions = (round: number) => order([
  { id: "q1", label: "Quadrant I" }, { id: "q2", label: "Quadrant II" }, { id: "q3", label: "Quadrant III" }, { id: "q4", label: "Quadrant IV" },
], round);

// W3 L1/L2 — plot a signed ordered pair.
export function plotSignedTask(round: number, target: number): CartTask {
  const p = signedPt(round);
  return {
    ...base("plot", "tap", target),
    prompt: `Plot the point ${coordLabel(p)}.`,
    speakText: `Start at the origin. Count ${Math.abs(p.x)} ${p.x >= 0 ? "right" : "left"}, then ${Math.abs(p.y)} ${p.y >= 0 ? "up" : "down"}, and tap that point.`,
    answer: p, points: [],
    feedback: { correct: "Plotted correctly — across first, then up or down.", wrong: "A negative x goes left; a negative y goes down. Count from the origin." },
  };
}

// W3 L1/L2 — read a plotted point (signed).
export function readSignedTask(round: number, target: number): CartTask {
  const p = signedPt(round, 1);
  const { options, correctId } = coordOptions(p, round);
  return {
    ...base("read", "options", target),
    prompt: "What are the coordinates of the star?",
    speakText: "Read how far across the star is (left is negative), then how far up or down. Write the across number first.",
    points: [{ id: "star", x: p.x, y: p.y, kind: "star" }], options, correctOptionIds: [correctId],
    feedback: { correct: "Correct — across first, then up or down, with the right signs.", wrong: "Check the signs: left of the origin is negative x, below it is negative y." },
  };
}

// W3 L2/L3 — which quadrant is the point in?
export function quadrantTask(round: number, target: number): CartTask {
  const p = signedPt(round, 2);
  const q = quadrant(p) as 1 | 2 | 3 | 4;
  return {
    ...base("quadrant", "options", target),
    prompt: "Which quadrant is the star in?",
    speakText: "The four quadrants go anticlockwise from the top-right. Use the signs of the coordinates to name it.",
    points: [{ id: "star", x: p.x, y: p.y, kind: "star" }], options: quadOptions(round), correctOptionIds: [`q${q}`],
    feedback: { correct: `Right — ${coordLabel(p)} is in Quadrant ${["I", "II", "III", "IV"][q - 1]}.`, wrong: "Quadrant I is (+,+), II is (-,+), III is (-,-), IV is (+,-)." },
  };
}

// W3 L3 — reason about signs without plotting.
export function reasonTask(round: number, target: number): CartTask {
  const q = ((round % 4) + 1) as 1 | 2 | 3 | 4;
  return {
    ...base("reason", "options", target),
    prompt: `A point has ${QUADRANT_SIGNS[q]}. Which quadrant is it in?`,
    speakText: "You do not need to plot it. Use the signs to decide which quadrant.",
    points: [], options: quadOptions(round), correctOptionIds: [`q${q}`],
    feedback: { correct: "Correct — the signs place it exactly.", wrong: "Quadrant I is (+,+), II is (-,+), III is (-,-), IV is (+,-)." },
  };
}

// W4 L1 — a single-axis move: which coordinate changed?
export function changeWhichTask(round: number, target: number): CartTask {
  const start = signedPt(round, 3);
  const horizontal = round % 2 === 0;
  const step = 2 + (round % 2);
  const rawEnd = horizontal ? { x: start.x + step, y: start.y } : { x: start.x, y: start.y + step };
  const end = inRange(rawEnd) ? rawEnd : (horizontal ? { x: start.x - step, y: start.y } : { x: start.x, y: start.y - step });
  const options = order([
    { id: "across", label: "The across number (x)" },
    { id: "up", label: "The up-and-down number (y)" },
    { id: "both", label: "Both numbers" },
  ], round);
  return {
    ...base("changeWhich", "options", target),
    prompt: `The rover moves from ${coordLabel(start)} to ${coordLabel(end)}. Which number changed?`,
    speakText: "Compare the two coordinates. A move along one direction changes only one number.",
    points: [{ id: "rover", x: start.x, y: start.y, kind: "rover" }, { id: "goal", x: end.x, y: end.y, kind: "goal" }],
    options, correctOptionIds: [end.x !== start.x ? "across" : "up"],
    feedback: { correct: "Yes — only the number for the direction it moved changed.", wrong: "Compare the pairs: which of the two numbers is different?" },
  };
}

// W4 L2 — move that crosses an axis; plot where it lands (a coordinate flips sign).
export function crossAxisTask(round: number, target: number): CartTask {
  const horizontal = round % 2 === 0;
  const mag = 2 + (round % 2); // 2..3
  const other = (round % 3) - 1; // -1, 0, 1
  const start = horizontal ? { x: mag, y: other } : { x: other, y: mag };
  const end = horizontal ? { x: -mag, y: other } : { x: other, y: -mag };
  return {
    ...base("crossAxis", "tap", target),
    prompt: `The rover is at ${coordLabel(start)}. It moves ${moveDescription(start, end)}, crossing an axis. Plot where it lands.`,
    speakText: "Keep counting past the origin. As you cross an axis, that coordinate changes sign.",
    points: [{ id: "rover", x: start.x, y: start.y, kind: "rover" }], answer: end,
    feedback: { correct: "Correct — crossing the axis flips that coordinate's sign.", wrong: "Count past the origin; once you cross the axis the number becomes negative." },
  };
}

// W4 L3 — infer the move that takes the dot to the star.
export function reverseTask(round: number, target: number): CartTask {
  const from = signedPt(round, 4);
  const horizontal = round % 2 === 0;
  const step = 2 + (round % 2);
  const rawTo = horizontal ? { x: from.x - step, y: from.y } : { x: from.x, y: from.y - step };
  const to = inRange(rawTo) ? rawTo : (horizontal ? { x: from.x + step, y: from.y } : { x: from.x, y: from.y + step });
  const dx = to.x - from.x, dy = to.y - from.y;
  const oppDir = dx !== 0 ? `${Math.abs(dx)} ${dx > 0 ? "left" : "right"}` : `${Math.abs(dy)} ${dy > 0 ? "down" : "up"}`;
  const otherAxis = dx !== 0 ? `${Math.abs(dx)} up` : `${Math.abs(dy)} right`;
  const options = order([
    { id: "a", label: moveDescription(from, to) },
    { id: "b", label: oppDir },
    { id: "c", label: otherAxis },
  ], round);
  return {
    ...base("reverse", "options", target),
    prompt: "What single move takes the dot to the star?",
    speakText: "Compare the dot and the star. How far, and in which direction, did it move?",
    points: [{ id: "dot", x: from.x, y: from.y, kind: "dot" }, { id: "star", x: to.x, y: to.y, kind: "star" }],
    options, correctOptionIds: ["a"],
    feedback: { correct: "Correct — that is the move from the dot to the star.", wrong: "Count the squares from the dot to the star, and note the direction." },
  };
}
