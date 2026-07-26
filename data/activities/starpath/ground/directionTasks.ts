import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };

const DELTA: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};
const DIRECTION_PHRASE: Record<Direction, string> = { up: "up", down: "down", left: "left", right: "right" };
const ALL_DIRECTIONS: Direction[] = ["up", "down", "left", "right"];
const GOAL_OBJECTS = ["star", "crystal", "flag"] as const;
const GRID = 4;

function inBounds(cell: Cell, cols: number, rows: number): boolean {
  return cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols;
}

function move(cell: Cell, direction: Direction): Cell {
  const delta = DELTA[direction];
  return { r: cell.r + delta.dr, c: cell.c + delta.dc };
}

// Walk from `start` choosing in-bounds directions, biased up/right so a path
// from the bottom-left corner reliably fills `count` steps on a small grid.
function generatePath(cols: number, rows: number, start: Cell, count: number, seed: number): { steps: Direction[]; end: Cell } {
  const order: Direction[] = seed % 2 === 0 ? ["up", "right", "up", "right", "right", "up"] : ["right", "up", "right", "up", "up", "right"];
  const steps: Direction[] = [];
  let cell = start;
  let index = 0;
  let guard = 0;
  while (steps.length < count && guard < count * 8) {
    const direction = order[(seed + index) % order.length]!;
    const next = move(cell, direction);
    if (inBounds(next, cols, rows)) {
      steps.push(direction);
      cell = next;
    }
    index += 1;
    guard += 1;
  }
  return { steps, end: cell };
}

// ── Follow the directions (path across a grid) ───────────────────────────────
export function directionPathTask(
  round: number,
  target: number,
  opts: {
    steps: number;
    object?: string;
    goalObject?: string;
    reveal?: boolean;
    prompt?: string;
    speakText?: string;
    trail?: boolean;
    collect?: boolean;
    surface?: "space" | "planet";
  }
): PracticeTask {
  const object = opts.object ?? "rocket";
  const start: Cell = { r: GRID - 1, c: 0 };
  const { steps: directions, end } = generatePath(GRID, GRID, start, opts.steps, round);
  const goalObject = opts.goalObject ?? GOAL_OBJECTS[round % GOAL_OBJECTS.length]!;
  const steps = directions.map((direction) => ({
    direction,
    instruction: `Move the ${object} ${DIRECTION_PHRASE[direction]}.`,
    speakText: `Move the ${object} ${DIRECTION_PHRASE[direction]}.`,
  }));

  // Stars sit on cells along the route (never the start or the destination) and
  // are gathered automatically as the traveller follows the clues.
  let collectibles: Cell[] | undefined;
  if (opts.collect) {
    const cells: Cell[] = [start];
    let current = start;
    for (const direction of directions) {
      current = move(current, direction);
      cells.push(current);
    }
    const middle = cells.slice(1, -1);
    collectibles = middle.filter((_, index) => index % 2 === 0).slice(0, 2);
    if (collectibles.length === 0 && middle.length > 0) collectibles = [middle[0]!];
  }

  return {
    kind: "starpathDirectionPath",
    prompt: opts.prompt ?? "Follow the directions.",
    speakText: opts.speakText ?? "Follow each direction in order. Tap the arrow that matches the clue.",
    target,
    cols: GRID,
    rows: GRID,
    object,
    start,
    goal: { r: end.r, c: end.c, object: goalObject, reveal: opts.reveal },
    steps,
    trail: opts.trail,
    collectibles,
    surface: opts.surface,
    feedback: {
      correct: opts.reveal ? "You found the treasure!" : "You followed every direction!",
      wrong: "Read the direction again and tap the matching arrow.",
    },
  };
}

// ── Which way? (single-choice) ───────────────────────────────────────────────
export function directionChoiceTask(
  round: number,
  target: number,
  mode: "moved" | "goal",
  object = "rocket",
): PracticeTask {
  const direction = ALL_DIRECTIONS[round % ALL_DIRECTIONS.length]!;
  const delta = DELTA[direction];
  const to: Cell = { r: 1 + (round % 2), c: 1 + (Math.floor(round / 2) % 2) };
  const from: Cell = { r: to.r - delta.dr, c: to.c - delta.dc };
  const goalObject = GOAL_OBJECTS[round % GOAL_OBJECTS.length]!;
  const options = ALL_DIRECTIONS.map((dir, index) => ({ id: `dir-${target}-${dir}-${index}`, direction: dir }));
  const correct = options.find((option) => option.direction === direction)!;
  const prompt = mode === "goal" ? `Which way to reach the ${goalObject}?` : `Which way did the ${object} move?`;
  return {
    kind: "starpathDirectionChoice",
    prompt,
    speakText: `${prompt} Look at where the ${object} is and choose the direction.`,
    target,
    cols: GRID,
    rows: GRID,
    object,
    from,
    to,
    goalObject: mode === "goal" ? goalObject : undefined,
    options,
    correctOptionId: correct.id,
    feedback: {
      correct: `Yes! That is ${DIRECTION_PHRASE[direction]}.`,
      wrong: `Look again — the answer is ${DIRECTION_PHRASE[direction]}.`,
    },
  };
}
