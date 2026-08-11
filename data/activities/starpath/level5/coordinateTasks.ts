import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { coordLabel, movePhrase, runCommands, shortestSteps, type MoveDir, type Point } from "./coordinates";

type CoordTask = Extract<PracticeTask, { kind: "starpathCoordinate" }>;
type Bounds = { x: number; y: number };

// Week 4 introduces coordinates on a small 6x6 grid; from Week 5 on (and Level 6)
// the realm steps up to the standard 8x8 grid. Generators default to 6x6 so the
// Week 4 intro is unchanged; later weeks pass GRID_8 explicitly.
export const GRID_6: Bounds = { x: 6, y: 6 };
export const GRID_8: Bounds = { x: 8, y: 8 };
const DEFAULT_BOUNDS = GRID_6;

const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);
// Nudge a coordinate to a different value within [1, max].
const bump = (v: number, max: number) => (v % max) + 1;

// A deterministic first-quadrant point (away from the axes) that spreads across
// whatever grid is in use.
function pt(round: number, salt: number, bounds: Bounds): Point {
  const rx = bounds.x - 1, ry = bounds.y - 1;
  const x = 1 + ((round * 2 + salt) % rx);
  let y = 1 + ((round * 3 + salt + 2) % ry);
  if (y === x) y = 1 + (y % ry);
  return { x, y };
}

function coordOptions(correct: Point, extras: Point[], round: number): { options: { id: string; label: string }[]; correctId: string } {
  const seen = new Set<string>();
  const list: Point[] = [];
  for (const point of [correct, ...extras]) {
    const k = coordLabel(point);
    if (!seen.has(k) && point.x >= 0 && point.y >= 0) { seen.add(k); list.push(point); }
  }
  const ordered = order(list, round);
  const options = ordered.map((point, index) => ({ id: `o${index}`, label: coordLabel(point) }));
  const correctId = options[ordered.findIndex((point) => point.x === correct.x && point.y === correct.y)]!.id;
  return { options, correctId };
}

const base = (mode: CoordTask["mode"], render: CoordTask["render"], target: number, bounds: Bounds): Pick<CoordTask, "kind" | "mode" | "render" | "target" | "bounds"> =>
  ({ kind: "starpathCoordinate", mode, render, target, bounds });

// W4 L1 — read across then up; reject the swapped pair.
export function orderTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const p = pt(round, 1, bounds);
  const { options, correctId } = coordOptions(p, [{ x: p.y, y: p.x }, { x: p.x, y: bump(p.y, bounds.y - 1) }], round);
  return {
    ...base("order", "options", target, bounds),
    prompt: "Read across first, then up. What is the star's coordinate?",
    speakText: "A coordinate names how far across, then how far up. Count across from the origin, then up to the star.",
    points: [{ id: "star", x: p.x, y: p.y, kind: "star" }], options, correctOptionIds: [correctId],
    feedback: { correct: "Across first, then up — that names the star.", wrong: "Read the across number first, then the up number. The order matters." },
  };
}

// W4 L1 — locate the origin.
export function originTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  return {
    ...base("origin", "tap", target, bounds),
    prompt: "Tap the origin — the corner (0, 0) where the axes meet.",
    speakText: "Every coordinate is measured from the origin. It is the corner where the across axis and the up axis meet, at zero and zero.",
    answer: { x: 0, y: 0 },
    feedback: { correct: "That is the origin — every coordinate starts here.", wrong: "The origin is (0, 0), the bottom-left corner where the two axes meet." },
  };
}

// W4 L2 — plot an ordered pair.
export function plotTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const p = pt(round, 3, bounds);
  return {
    ...base("plot", "tap", target, bounds),
    prompt: `Plot the point ${coordLabel(p)}.`,
    speakText: `Start at the origin. Count ${p.x} across, then ${p.y} up, and tap that point.`,
    answer: p,
    feedback: { correct: "Plotted correctly — across then up.", wrong: "Count across first to the across number, then up to the up number." },
  };
}

// W4 L2 — read a plotted point.
export function readTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const p = pt(round, 5, bounds);
  const { options, correctId } = coordOptions(p, [{ x: p.y, y: p.x }, { x: bump(p.x, bounds.x - 1), y: p.y }], round);
  return {
    ...base("read", "options", target, bounds),
    prompt: "What are the coordinates of the marked point?",
    speakText: "Read how far across the point is, then how far up. Write the across number first.",
    points: [{ id: "dot", x: p.x, y: p.y, kind: "dot" }], options, correctOptionIds: [correctId],
    feedback: { correct: "Correct — across then up.", wrong: "Count across from the origin first, then up." },
  };
}

// W4 L3 — a scanner mislabels a point (usually swapped); choose the correct pair.
export function errorTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const p = pt(round, 7, bounds);
  const wrong = round % 2 === 0 ? { x: p.y, y: p.x } : { x: p.x, y: bump(p.y, bounds.y - 1) };
  const { options, correctId } = coordOptions(p, [wrong, { x: bump(p.x, bounds.x - 1), y: p.y }], round);
  return {
    ...base("error", "options", target, bounds),
    prompt: `A scanner labelled the star ${coordLabel(wrong)}, but that is wrong. What is its correct coordinate?`,
    speakText: "Check the label. Count across then up to find the real coordinate, and spot the mistake.",
    points: [{ id: "star", x: p.x, y: p.y, kind: "star" }], options, correctOptionIds: [correctId],
    feedback: { correct: "Right — that is the star's true coordinate.", wrong: "Re-count across then up. The scanner swapped or mis-scaled a number." },
  };
}

// W5 L1 — move along one axis, tap where the rover lands.
export function moveTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const start = pt(round, 9, bounds);
  const dir: MoveDir = round % 2 === 0 ? "up" : "right";
  const steps = 2 + (round % 3);
  const cappedSteps = dir === "up" ? Math.min(steps, bounds.y - start.y) || 1 : Math.min(steps, bounds.x - start.x) || 1;
  const end = dir === "up" ? { x: start.x, y: start.y + cappedSteps } : { x: start.x + cappedSteps, y: start.y };
  return {
    ...base("move", "tap", target, bounds),
    prompt: `The rover is at ${coordLabel(start)}. It moves ${movePhrase(dir, cappedSteps)}. Tap where it lands.`,
    speakText: `Moving ${dir} changes only one number. Start at ${coordLabel(start)} and count ${cappedSteps}.`,
    points: [{ id: "rover", x: start.x, y: start.y, kind: "rover" }], start, answer: end,
    feedback: { correct: "Correct — only one coordinate changed.", wrong: `Moving ${dir} changes just one number. Count ${cappedSteps} from the start.` },
  };
}

// W5 L1 — which coordinate changed?
export function moveAxisTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const start = pt(round, 11, bounds);
  const dir: MoveDir = round % 2 === 0 ? "up" : "right";
  const steps = 2 + (round % 3);
  const end = dir === "up" ? { x: start.x, y: Math.min(bounds.y, start.y + steps) } : { x: Math.min(bounds.x, start.x + steps), y: start.y };
  const options = order([
    { id: "across", label: "The across number (x)" },
    { id: "up", label: "The up number (y)" },
    { id: "both", label: "Both numbers" },
  ], round);
  return {
    ...base("moveAxis", "options", target, bounds),
    prompt: `The rover moves from ${coordLabel(start)} to ${coordLabel(end)}. Which number changed?`,
    speakText: "A move along one axis changes only one number. Compare the two coordinates.",
    points: [{ id: "rover", x: start.x, y: start.y, kind: "rover" }, { id: "goal", x: end.x, y: end.y, kind: "goal" }],
    options, correctOptionIds: [dir === "up" ? "up" : "across"],
    feedback: { correct: "Yes — only one number changed.", wrong: "Compare the pairs: only the number for the axis you moved along changes." },
  };
}

// W5 L2 — follow a given command sequence, tap the ending point.
export function followTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const start = { x: 1 + (round % 3), y: 1 + ((round + 1) % 3) };
  const commands: MoveDir[] = [round % 2 ? "up" : "right", "right", "up"];
  const end = runCommands(start, commands, bounds).end;
  return {
    ...base("follow", "tap", target, bounds),
    prompt: "Follow the commands and tap where the rover ends.",
    speakText: "Apply each command in order, one square at a time, starting from the rover.",
    points: [{ id: "rover", x: start.x, y: start.y, kind: "rover" }], start, givenCommands: commands, answer: end,
    feedback: { correct: "Correct — you followed every command.", wrong: "Apply the commands one at a time from the start, then tap the final point." },
  };
}

// W5 L2 — build a command sequence that reaches the star.
export function commandsTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const start = { x: 0 + (round % 2), y: 0 + ((round + 1) % 2) };
  const goal = { x: 3 + (round % 3), y: 3 + ((round + 2) % 3) };
  return {
    ...base("commands", "commands", target, bounds),
    prompt: "Send the rover to the star.",
    speakText: "Build a list of moves, then run it. Each command moves the rover one square.",
    points: [], start, goal, maxSteps: shortestSteps(start, goal) + 4,
    feedback: { correct: "The rover reached the star.", wrong: "Run your commands and check where the rover stops, then adjust the moves." },
  };
}

// W5 L3 — reach the star efficiently, avoiding blocked sectors.
export function routeTask(round: number, target: number, bounds: Bounds = DEFAULT_BOUNDS): CoordTask {
  const start = { x: 0, y: round % 3 };
  const goal = { x: 5, y: 5 - (round % 2) };
  const blocked = [{ x: 2, y: goal.y }, { x: 3, y: start.y }];
  return {
    ...base("route", "commands", target, bounds),
    prompt: "Reach the star with the fewest moves. Avoid the blocked sectors.",
    speakText: "Plan the shortest path. Every extra move or blocked sector fails the route.",
    points: [], start, goal, blocked, maxSteps: shortestSteps(start, goal),
    feedback: { correct: "A clean, shortest route to the star.", wrong: "Stay on the grid, avoid the blocked sectors, and use the fewest moves." },
  };
}
