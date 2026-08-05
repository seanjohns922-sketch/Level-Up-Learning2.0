import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getStarMap, listStarMaps, mapLandmarks } from "@/data/activities/starpath/level2/star-maps";

// Level 3 · Week 4 · Lesson 2 — "Explorer's View" (AC9M3SP02).
// The fresh skill for L3: EGOCENTRIC direction. "Ahead / left / right / behind"
// are read from the explorer's own facing, not from map-north — the first time
// the program asks a child to take a viewpoint that isn't the map's. Three
// variants build the idea: name the facing, read what's ahead, then the twist —
// read what's on the explorer's left/right (which flips with the facing).

type Facing = "N" | "E" | "S" | "W";
type Landmark = { id: string; label: string; object: string; r: number; c: number };
type Cell = { r: number; c: number };

const ORDER: Facing[] = ["N", "E", "S", "W"];
const DIR_WORD: Record<Facing, string> = { N: "north", E: "east", S: "south", W: "west" };
const STEP: Record<Facing, { dr: number; dc: number }> = {
  N: { dr: -1, dc: 0 },
  E: { dr: 0, dc: 1 },
  S: { dr: 1, dc: 0 },
  W: { dr: 0, dc: -1 },
};

// Egocentric relation → quarter-turns clockwise from the facing.
const REL_TURN = { ahead: 0, right: 1, behind: 2, left: 3 } as const;
type Rel = keyof typeof REL_TURN;
function ego(facing: Facing, rel: Rel): Facing {
  return ORDER[(ORDER.indexOf(facing) + REL_TURN[rel]) % 4]!;
}

// The single landmark along a ray from `from` heading `dir`. Returns null if the
// ray holds zero or more than one landmark, so "straight ahead" is never ambiguous.
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
  const taken = new Set(landmarks.map((landmark) => `${landmark.r},${landmark.c}`));
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!taken.has(`${r},${c}`)) cells.push({ r, c });
    }
  }
  return cells;
}

// Deterministic search: from a rotation `offset`, return the first (cell, facing)
// whose egocentric `rel` ray holds exactly one landmark.
function findScene(
  cells: Cell[],
  landmarks: Landmark[],
  cols: number,
  rows: number,
  rel: Rel,
  offset: number,
): { cell: Cell; facing: Facing; target: Landmark } | null {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[(offset + i) % cells.length]!;
    for (let j = 0; j < 4; j += 1) {
      const facing = ORDER[(offset + j) % 4]!;
      const target = soleAlong(cell, ego(facing, rel), landmarks, cols, rows);
      if (target) return { cell, facing, target };
    }
  }
  return null;
}

function rotate<T>(items: T[], by: number): T[] {
  if (items.length === 0) return items;
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function landmarkOptions(target: Landmark, landmarks: Landmark[], offset: number) {
  const others = landmarks.filter((landmark) => landmark.id !== target.id).slice(0, 3);
  return rotate([target, ...others].map((landmark) => ({ id: landmark.id, label: landmark.label })), offset % 4);
}

const MAP_IDS = listStarMaps().map((map) => map.id);

type Variant = "facing" | "ahead" | "side";

function viewpointTask(round: number, target: number, variant: Variant): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map) as Landmark[];
  const cols = map.cols;
  const rows = map.rows;
  const cells = emptyCells(landmarks, cols, rows);

  const base = {
    kind: "starpathMapLocate" as const,
    target,
    mapId: map.id,
    cols,
    rows,
    landmarks,
  };

  if (variant === "facing") {
    // Given the explorer's tile and what's straight ahead, name the facing.
    const scene = findScene(cells, landmarks, cols, rows, "ahead", round);
    if (!scene) throw new Error(`[Viewpoint] No facing scene for map ${map.id}.`);
    return {
      ...base,
      mode: "viewpoint",
      explorer: { r: scene.cell.r, c: scene.cell.c }, // facing hidden — it's the answer
      prompt: `The explorer is standing here. Straight ahead they see ${scene.target.label}. Which way are they facing?`,
      speakText: `The explorer is on the glowing tile. Straight ahead of them is ${scene.target.label}. Which way are they facing?`,
      options: rotate(ORDER.map((facing) => ({ id: facing, label: DIR_WORD[facing][0]!.toUpperCase() + DIR_WORD[facing].slice(1) })), round % 4),
      correctOptionId: scene.facing,
      feedback: {
        correct: `Yes — they face ${DIR_WORD[scene.facing]}, straight toward ${scene.target.label}.`,
        wrong: `Look from the explorer to ${scene.target.label}. That is the way they face.`,
      },
    };
  }

  if (variant === "ahead") {
    // Facing is shown. What is straight ahead?
    const scene = findScene(cells, landmarks, cols, rows, "ahead", round);
    if (!scene) throw new Error(`[Viewpoint] No ahead scene for map ${map.id}.`);
    return {
      ...base,
      mode: "viewpoint",
      explorer: { r: scene.cell.r, c: scene.cell.c, facing: scene.facing },
      prompt: `The explorer is facing ${DIR_WORD[scene.facing]}. What is straight ahead of them?`,
      speakText: `The explorer is facing ${DIR_WORD[scene.facing]}. Look straight ahead. What place is there?`,
      options: landmarkOptions(scene.target, landmarks, round),
      correctOptionId: scene.target.id,
      feedback: {
        correct: `Yes — ${scene.target.label} is straight ahead.`,
        wrong: `Face ${DIR_WORD[scene.facing]} and look straight ahead — that is ${scene.target.label}.`,
      },
    };
  }

  // "side": facing is shown; what is on the explorer's left or right? The twist —
  // the map direction of "right" flips depending on which way the explorer faces.
  const rel: Rel = round % 2 === 0 ? "right" : "left";
  const scene = findScene(cells, landmarks, cols, rows, rel, round);
  if (!scene) throw new Error(`[Viewpoint] No ${rel} scene for map ${map.id}.`);
  return {
    ...base,
    mode: "viewpoint",
    explorer: { r: scene.cell.r, c: scene.cell.c, facing: scene.facing },
    prompt: `The explorer is facing ${DIR_WORD[scene.facing]}. What is on their ${rel}?`,
    speakText: `The explorer is facing ${DIR_WORD[scene.facing]}. Which place is on their ${rel}?`,
    options: landmarkOptions(scene.target, landmarks, round),
    correctOptionId: scene.target.id,
    feedback: {
      correct: `Yes — facing ${DIR_WORD[scene.facing]}, ${scene.target.label} is on their ${rel}.`,
      wrong: `Face ${DIR_WORD[scene.facing]} first, then look to your ${rel}.`,
    },
  };
}

export const explorerFacingTask = (round: number, target: number) => viewpointTask(round, target, "facing");
export const explorerAheadTask = (round: number, target: number) => viewpointTask(round, target, "ahead");
export const explorerSideTask = (round: number, target: number) => viewpointTask(round, target, "side");
