import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getStarMap, listStarMaps, mapLandmarks } from "@/data/activities/starpath/level2/star-maps";

// Level 3 · Week 6 — "Egocentric Steering" (AC9M3SP02). The movement version of
// W4's Explorer's View: the rover has a HEADING, and it is driven with turn-left /
// turn-right / go-forward. Left and right are relative to the current facing (not
// map-north), and every turn changes the heading the child must keep track of.
// Three activities escalate: track the heading through turns → choose the first
// steer toward a goal → plan and drive a full route.

type Facing = "N" | "E" | "S" | "W";
type Turn = "left" | "right";
type Landmark = { id: string; label: string; object: string; r: number; c: number };
type Cell = { r: number; c: number };

const ORDER: Facing[] = ["N", "E", "S", "W"]; // clockwise
const DIR_WORD: Record<Facing, string> = { N: "north", E: "east", S: "south", W: "west" };
const STEP: Record<Facing, { dr: number; dc: number }> = {
  N: { dr: -1, dc: 0 },
  E: { dr: 0, dc: 1 },
  S: { dr: 1, dc: 0 },
  W: { dr: 0, dc: -1 },
};

function turn(facing: Facing, dir: Turn): Facing {
  return ORDER[(ORDER.indexOf(facing) + (dir === "right" ? 1 : 3)) % 4]!;
}
function applyTurns(facing: Facing, turns: Turn[]): Facing {
  return turns.reduce((f, t) => turn(f, t), facing);
}
// Minimal number of quarter-turns to rotate `from` to `to`.
function turnsBetween(from: Facing, to: Facing): number {
  const d = (ORDER.indexOf(to) - ORDER.indexOf(from) + 4) % 4;
  return d === 3 ? 1 : d;
}

// The single landmark along a ray, or null if zero / more than one — keeps
// "straight ahead / on your left" unambiguous.
function soleAlong(from: Cell, dir: Facing, landmarks: Landmark[], cols: number, rows: number): Landmark | null {
  const step = STEP[dir];
  let found: Landmark | null = null;
  let count = 0;
  for (let n = 1; n <= Math.max(cols, rows); n += 1) {
    const r = from.r + step.dr * n;
    const c = from.c + step.dc * n;
    if (r < 0 || c < 0 || r >= rows || c >= cols) break;
    const hit = landmarks.find((landmark) => landmark.r === r && landmark.c === c);
    if (hit) {
      count += 1;
      if (count === 1) found = hit;
    }
  }
  return count === 1 ? found : null;
}

function emptyCells(landmarks: Landmark[], cols: number, rows: number): Cell[] {
  const taken = new Set(landmarks.map((l) => `${l.r},${l.c}`));
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) if (!taken.has(`${r},${c}`)) cells.push({ r, c });
  return cells;
}

function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

const MAP_IDS = listStarMaps().map((map) => map.id);
const cap = (word: string) => word[0]!.toUpperCase() + word.slice(1);

// Steps to steer from (cell,facing) to `goal` — turn onto each needed axis, then
// go forward. Used to size a fair move budget and to prove solvability.
function driveCost(start: { r: number; c: number; facing: Facing }, goal: Cell): number {
  const dr = goal.r - start.r;
  const dc = goal.c - start.c;
  let facing = start.facing;
  let steps = 0;
  if (dr !== 0) {
    const want: Facing = dr < 0 ? "N" : "S";
    steps += turnsBetween(facing, want) + Math.abs(dr);
    facing = want;
  }
  if (dc !== 0) {
    const want: Facing = dc < 0 ? "W" : "E";
    steps += turnsBetween(facing, want) + Math.abs(dc);
  }
  return steps;
}

// ── L1 · Which Way Now? — track the heading through turns ──────────────────────
function headingTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map) as Landmark[];
  const cell = emptyCells(landmarks, map.cols, map.rows)[round % Math.max(1, emptyCells(landmarks, map.cols, map.rows).length)]!;
  const startFacing = ORDER[round % 4]!;
  // Two turns keep it tractable but genuinely require tracking the heading.
  const turns: Turn[] = [round % 2 === 0 ? "right" : "left", (round >> 1) % 2 === 0 ? "right" : "left"];
  const finalFacing = applyTurns(startFacing, turns);
  const turnWords = turns.map((t) => `turns ${t}`).join(", then ");
  return {
    kind: "starpathSteer",
    mode: "heading",
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rocket",
    start: { r: cell.r, c: cell.c, facing: startFacing },
    turns,
    prompt: `The rover is facing ${DIR_WORD[startFacing]}. It ${turnWords}. Which way is it facing now?`,
    speakText: `The rover starts facing ${DIR_WORD[startFacing]}. It ${turnWords}. Which way is it facing now?`,
    options: rotate(ORDER.map((f) => ({ id: f, label: cap(DIR_WORD[f]) })), round % 4),
    correctOptionId: finalFacing,
    feedback: {
      correct: `Yes — after those turns it faces ${DIR_WORD[finalFacing]}.`,
      wrong: `Start facing ${DIR_WORD[startFacing]} and turn one quarter at a time — it ends facing ${DIR_WORD[finalFacing]}.`,
    },
  };
}

// ── L2 · First Move — choose the first steer toward a goal ─────────────────────
// rel of the goal to the rover's own view → the command that heads for it.
const REL_COMMAND: Record<"ahead" | "left" | "right", { id: string; label: string; verb: string }> = {
  ahead: { id: "forward", label: "Go forward", verb: "straight ahead" },
  left: { id: "left", label: "Turn left", verb: "on their left" },
  right: { id: "right", label: "Turn right", verb: "on their right" },
};
function egoDir(facing: Facing, rel: "ahead" | "left" | "right"): Facing {
  const off = rel === "ahead" ? 0 : rel === "right" ? 1 : 3;
  return ORDER[(ORDER.indexOf(facing) + off) % 4]!;
}
function firstMoveTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map) as Landmark[];
  const cols = map.cols;
  const rows = map.rows;
  const cells = emptyCells(landmarks, cols, rows);
  const rels: Array<"ahead" | "left" | "right"> = ["ahead", "left", "right"];
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[(round + i) % cells.length]!;
    for (let j = 0; j < 4; j += 1) {
      const facing = ORDER[(round + j) % 4]!;
      const rel = rels[(round + i + j) % 3]!;
      const goal = soleAlong(cell, egoDir(facing, rel), landmarks, cols, rows);
      if (!goal) continue;
      const cmd = REL_COMMAND[rel];
      return {
        kind: "starpathSteer",
        mode: "firstMove",
        target,
        mapId: map.id,
        cols,
        rows,
        landmarks,
        object: "rocket",
        start: { r: cell.r, c: cell.c, facing },
        goal: { r: goal.r, c: goal.c, object: goal.object, label: goal.label },
        prompt: `The rover is facing ${DIR_WORD[facing]}. To head for ${goal.label}, what is the first move?`,
        speakText: `The rover faces ${DIR_WORD[facing]}. ${goal.label} is ${cmd.verb}. What is the first move to head for it?`,
        options: rotate(
          [
            { id: "forward", label: "Go forward" },
            { id: "left", label: "Turn left" },
            { id: "right", label: "Turn right" },
          ],
          round % 3,
        ),
        correctOptionId: cmd.id,
        feedback: {
          correct: `Yes — ${goal.label} is ${cmd.verb}, so ${cmd.label.toLowerCase()}.`,
          wrong: `Face ${DIR_WORD[facing]} and look: ${goal.label} is ${cmd.verb}.`,
        },
      };
    }
  }
  throw new Error(`[Steer] No first-move scene for map ${map.id}.`);
}

// ── L3 · Drive the Rover — plan and run a full egocentric route ────────────────
function driveTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map) as Landmark[];
  const cols = map.cols;
  const rows = map.rows;
  const cells = emptyCells(landmarks, cols, rows);
  const startFacing = ORDER[round % 4]!;
  // Choose a start cell and a goal landmark that need at least one turn AND a
  // forward move, so a straight drive never trivially works.
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[(round + i) % cells.length]!;
    const start = { r: cell.r, c: cell.c, facing: startFacing };
    for (let g = 0; g < landmarks.length; g += 1) {
      const goal = landmarks[(round + g) % landmarks.length]!;
      const dr = goal.r - cell.r;
      const dc = goal.c - cell.c;
      if (dr === 0 && dc === 0) continue;
      const cost = driveCost(start, goal);
      // Require a real route: both a turn and multiple forwards.
      const needsTurn = !(dc !== 0 && dr === 0 && egoDir(startFacing, "ahead") === (dc < 0 ? "W" : "E"))
        && !(dr !== 0 && dc === 0 && startFacing === (dr < 0 ? "N" : "S"));
      // Keep the apex challenging but bounded: at least one turn + a few
      // forwards, but never an exhausting cross-map trek.
      if (cost < 3 || cost > 8 || !needsTurn) continue;
      return {
        kind: "starpathSteer",
        mode: "drive",
        target,
        mapId: map.id,
        cols,
        rows,
        landmarks,
        object: "rocket",
        start,
        goal: { r: goal.r, c: goal.c, object: goal.object, label: goal.label },
        palette: ["left", "forward", "right"],
        maxSteps: cost + 2,
        prompt: `Drive the rover to ${goal.label}.`,
        speakText: `Drive the rover to ${goal.label}. Turn left or right to change its heading, then go forward. Build the route, then run it.`,
        feedback: {
          correct: `Mission complete — the rover reached ${goal.label}!`,
          wrong: `Not there yet. Watch which way the rover faces after each turn, then go forward toward ${goal.label}.`,
        },
      };
    }
  }
  throw new Error(`[Steer] No drive scene for map ${map.id}.`);
}

export const steerHeadingTask = headingTask;
export const steerFirstMoveTask = firstMoveTask;
export const steerDriveTask = driveTask;

// Exported for the card + audits: run a command list and report the landing cell.
export function runSteer(
  start: { r: number; c: number; facing: Facing },
  commands: Array<"left" | "right" | "forward">,
  cols: number,
  rows: number,
): { r: number; c: number; facing: Facing; offGrid: boolean } {
  let { r, c, facing } = start;
  for (const cmd of commands) {
    if (cmd === "left" || cmd === "right") {
      facing = turn(facing, cmd);
    } else {
      const step = STEP[facing];
      const nr = r + step.dr;
      const nc = c + step.dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return { r, c, facing, offGrid: true };
      r = nr;
      c = nc;
    }
  }
  return { r, c, facing, offGrid: false };
}
