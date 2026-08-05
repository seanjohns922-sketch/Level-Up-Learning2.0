import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { gridReferenceForCell } from "@/lib/starpath-grid-reference";

export type GridRouteTask = Extract<PracticeTask, { kind: "starpathGridRoute" }>;
export type GridMove = NonNullable<GridRouteTask["route"]>[number];

const COLUMNS = ["A", "B", "C", "D", "E", "F"];
const ROWS = ["1", "2", "3", "4", "5"];
const DELTA: Record<GridMove, { r: number; c: number }> = {
  up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 },
};

export function runGridRoute(task: Pick<GridRouteTask, "rows" | "cols" | "start" | "goal" | "blocked" | "checkpoints">, route: GridMove[]) {
  let position = { ...task.start };
  const visited = new Set<string>();
  const blocked = new Set((task.blocked ?? []).map((cell) => `${cell.r}:${cell.c}`));
  const required = new Set((task.checkpoints ?? []).map((cell) => `${cell.r}:${cell.c}`));
  for (let index = 0; index < route.length; index += 1) {
    const delta = DELTA[route[index]!];
    position = { r: position.r + delta.r, c: position.c + delta.c };
    const key = `${position.r}:${position.c}`;
    if (position.r < 0 || position.r >= task.rows || position.c < 0 || position.c >= task.cols) return { valid: false, position, firstFault: index };
    if (blocked.has(key)) return { valid: false, position, firstFault: index };
    if (required.has(key)) visited.add(key);
  }
  return { valid: position.r === task.goal.r && position.c === task.goal.c && visited.size === required.size, position, firstFault: null };
}

function routeFor(start: { r: number; c: number }, points: Array<{ r: number; c: number }>): GridMove[] {
  const moves: GridMove[] = [];
  const current = { ...start };
  for (const point of points) {
    while (current.c < point.c) { moves.push("right"); current.c += 1; }
    while (current.r < point.r) { moves.push("down"); current.r += 1; }
    while (current.c > point.c) { moves.push("left"); current.c -= 1; }
    while (current.r > point.r) { moves.push("up"); current.r -= 1; }
  }
  return moves;
}

function ref(rows: number, cols: number, cell: { r: number; c: number }) {
  return gridReferenceForCell({ rows, cols, columnLabels: COLUMNS.slice(0, cols), rowLabels: ROWS.slice(0, rows) }, cell)!;
}

function make(round: number, mode: GridRouteTask["mode"], target: number): GridRouteTask {
  const cols = round % 2 ? 6 : 5;
  const rows = round % 3 ? 5 : 4;
  const start = { r: round % 2, c: 0 };
  const checkpoint = { r: 1 + (round % (rows - 2)), c: 2, label: "Signal relay" };
  const goal = { r: rows - 1 - (round % 2), c: cols - 1, label: "Research base" };
  const route = routeFor(start, mode === "checkpoint" ? [checkpoint, goal] : [goal]);
  const blocked = mode === "checkpoint" || mode === "debug" || mode === "compare" ? [{ r: rows - 1, c: 1 }] : [];
  const expectedReference = ref(rows, cols, goal);
  const base = {
    kind: "starpathGridRoute" as const, mode, target, mapId: `l4-route-${mode}-${round}`,
    cols, rows, columnLabels: COLUMNS.slice(0, cols), rowLabels: ROWS.slice(0, rows), start, goal,
    checkpoints: mode === "checkpoint" ? [checkpoint] : [], blocked, maxSteps: route.length + 3,
    rule: mode === "checkpoint" ? `Visit ${ref(rows, cols, checkpoint)} before ${expectedReference}.` : `Reach ${expectedReference}.`,
    feedback: { correct: "The route is precise and reaches every required sector.", wrong: "Replay the commands and check the first sector where the route breaks its rule." },
  };
  if (mode === "trace" || mode === "missingReference") {
    return { ...base, route, expectedReference, prompt: mode === "trace" ? "Trace the dispatch. Which reference does it reach?" : "Complete the route log with the missing final reference.", speakText: `Start at ${ref(rows, cols, start)}. Follow every command, then type the final cell reference.` };
  }
  if (mode === "author" || mode === "checkpoint") {
    return { ...base, prompt: mode === "author" ? `Write a path from ${ref(rows, cols, start)} to ${expectedReference}.` : `Author a route that visits the relay before ${expectedReference}.`, speakText: `Build the commands, run them, and revise the route until every condition passes.` };
  }
  const invalid = [...route];
  invalid[Math.max(0, invalid.length - 2)] = invalid[Math.max(0, invalid.length - 2)] === "right" ? "down" : "right";
  const options = [
    { id: `valid-${round}`, label: `Route ${String.fromCharCode(65 + (round % 3))}`, route },
    { id: `fault-${round}`, label: `Route ${String.fromCharCode(66 + (round % 3))}`, route: invalid },
  ];
  if (round % 2) options.reverse();
  return { ...base, routeOptions: options, correctOptionId: `valid-${round}`, prompt: mode === "debug" ? "Which repaired route now reaches the destination?" : "Which route satisfies the mission rule?", speakText: `Replay each candidate from ${ref(rows, cols, start)} and choose the route that satisfies the whole rule.` };
}

export const traceRouteTask = (round: number, target: number) => make(round, "trace", target);
export const missingReferenceTask = (round: number, target: number) => make(round + 3, "missingReference", target);
export const authorRouteTask = (round: number, target: number) => make(round + 7, "author", target);
export const checkpointRouteTask = (round: number, target: number) => make(round + 11, "checkpoint", target);
export const debugGridRouteTask = (round: number, target: number) => make(round + 17, "debug", target);
export const compareGridRouteTask = (round: number, target: number) => make(round + 23, "compare", target);
