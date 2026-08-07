// First-quadrant coordinate geometry for Starpath Level 5 (Weeks 4-5). Year 5
// uses positive whole-number ordered pairs (x across first, then y up), with the
// origin (0,0) at the bottom-left. Four quadrants come in Level 6.

export type Point = { x: number; y: number };
export type MoveDir = "right" | "left" | "up" | "down";

export const DELTA: Record<MoveDir, Point> = {
  right: { x: 1, y: 0 }, left: { x: -1, y: 0 }, up: { x: 0, y: 1 }, down: { x: 0, y: -1 },
};

export const coordLabel = (point: Point) => `(${point.x}, ${point.y})`;
export const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export function applyMove(pos: Point, dir: MoveDir, steps = 1): Point {
  return { x: pos.x + DELTA[dir].x * steps, y: pos.y + DELTA[dir].y * steps };
}

// Run a command sequence from a start point, returning the path and whether it
// stayed on the grid and off any blocked cells.
export function runCommands(
  start: Point,
  commands: MoveDir[],
  bounds: { x: number; y: number },
  blocked: Point[] = [],
): { path: Point[]; end: Point; onGrid: boolean; hitBlock: boolean } {
  const blockedSet = new Set(blocked.map((cell) => `${cell.x}:${cell.y}`));
  let pos = { ...start };
  const path: Point[] = [pos];
  let onGrid = true;
  let hitBlock = false;
  for (const command of commands) {
    pos = applyMove(pos, command);
    if (pos.x < 0 || pos.y < 0 || pos.x > bounds.x || pos.y > bounds.y) onGrid = false;
    if (blockedSet.has(`${pos.x}:${pos.y}`)) hitBlock = true;
    path.push(pos);
  }
  return { path, end: pos, onGrid, hitBlock };
}

// The fewest single-step moves between two points (Manhattan distance).
export const shortestSteps = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// A plain-language description of a single-axis move, e.g. "3 squares up".
export function movePhrase(dir: MoveDir, steps: number): string {
  const unit = steps === 1 ? "square" : "squares";
  return `${steps} ${unit} ${dir}`;
}
