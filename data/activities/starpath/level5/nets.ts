// Cube-net geometry for Starpath Level 5 (Nets). A cube net is a hexomino that
// folds into a cube. We classify and fold nets with the "rolling cube" method:
// walk the net cell by cell, rolling a labelled cube; the label that lands
// face-down at each cell is that cell's cube face. If all six cells receive
// distinct faces the net folds; a repeated face means it overlaps and cannot.

export type Cell = { r: number; c: number };

// Canonical cube faces. Opposite pairs: 1-2 (top/bottom), 3-4 (back/front),
// 5-6 (right/left). The rolling state tracks which face sits in each direction.
export type FaceId = 1 | 2 | 3 | 4 | 5 | 6;
type RollState = { U: FaceId; D: FaceId; N: FaceId; S: FaceId; E: FaceId; W: FaceId };
const START: RollState = { U: 1, D: 2, N: 3, S: 4, E: 5, W: 6 };
const OPPOSITE: Record<FaceId, FaceId> = { 1: 2, 2: 1, 3: 4, 4: 3, 5: 6, 6: 5 };

export const FACE_META: Record<FaceId, { name: string; colour: string }> = {
  1: { name: "Top", colour: "#f59e0b" },
  2: { name: "Bottom", colour: "#7c3aed" },
  3: { name: "Back", colour: "#f43f5e" },
  4: { name: "Front", colour: "#06b6d4" },
  5: { name: "Right", colour: "#10b981" },
  6: { name: "Left", colour: "#3b82f6" },
};

export type NetDir = "N" | "S" | "E" | "W";
const DELTA: Record<NetDir, Cell> = { N: { r: -1, c: 0 }, S: { r: 1, c: 0 }, E: { r: 0, c: 1 }, W: { r: 0, c: -1 } };

// Roll the cube one cell in a net direction; the new down-face is the face that
// was in that direction, and the cube tips over that edge.
function roll(state: RollState, dir: NetDir): RollState {
  switch (dir) {
    case "N": return { U: state.S, D: state.N, N: state.U, S: state.D, E: state.E, W: state.W };
    case "S": return { U: state.N, D: state.S, N: state.D, S: state.U, E: state.E, W: state.W };
    case "E": return { U: state.W, D: state.E, N: state.N, S: state.S, E: state.U, W: state.D };
    case "W": return { U: state.E, D: state.W, N: state.N, S: state.S, E: state.D, W: state.U };
  }
}

const keyOf = (cell: Cell) => `${cell.r}:${cell.c}`;

export type FoldResult = {
  valid: boolean;
  faceOf: Map<string, FaceId>;
  order: Cell[];
  parent: Map<string, { parent: string; dir: NetDir }>;
};

// Fold a connected set of cells, assigning each a cube face via a BFS roll from
// the first cell. `valid` is true only when the six cells map to six faces.
export function foldNet(cells: Cell[]): FoldResult {
  const present = new Map(cells.map((cell) => [keyOf(cell), cell]));
  const faceOf = new Map<string, FaceId>();
  const parent = new Map<string, { parent: string; dir: NetDir }>();
  const order: Cell[] = [];
  const stateOf = new Map<string, RollState>();
  const start = cells[0];
  if (!start) return { valid: false, faceOf, order, parent };
  const startKey = keyOf(start);
  stateOf.set(startKey, START);
  faceOf.set(startKey, START.D);
  order.push(start);
  const queue = [start];
  while (queue.length) {
    const cell = queue.shift()!;
    const state = stateOf.get(keyOf(cell))!;
    (Object.keys(DELTA) as NetDir[]).forEach((dir) => {
      const next = { r: cell.r + DELTA[dir].r, c: cell.c + DELTA[dir].c };
      const nk = keyOf(next);
      if (!present.has(nk) || stateOf.has(nk)) return;
      const nextState = roll(state, dir);
      stateOf.set(nk, nextState);
      faceOf.set(nk, nextState.D);
      parent.set(nk, { parent: keyOf(cell), dir });
      order.push(next);
      queue.push(next);
    });
  }
  const faces = new Set(faceOf.values());
  const valid = cells.length === 6 && faceOf.size === 6 && faces.size === 6;
  return { valid, faceOf, order, parent };
}

export type NetRelation = "opposite" | "adjacent" | "same";
export function relationBetween(fold: FoldResult, a: Cell, b: Cell): NetRelation {
  const fa = fold.faceOf.get(keyOf(a));
  const fb = fold.faceOf.get(keyOf(b));
  if (fa === undefined || fb === undefined) return "adjacent";
  if (fa === fb) return "same";
  return OPPOSITE[fa] === fb ? "opposite" : "adjacent";
}

// A pool of connected hexominoes — some fold into a cube, some do not. The engine
// classifies them, so validity is never hand-asserted.
export const HEXOMINOES: Record<string, Cell[]> = {
  // The classic cross.
  cross: [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }],
  // 1-4-1 staircase variants (all valid).
  tShort: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 1 }],
  zigzag: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 2 }],
  stairs: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }],
  lineFour: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 2, c: -1 }],
  tallCross: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 2 }],
  // Invalid connected hexominoes.
  block: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
  ell: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
  plusStub: [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 0, c: 2 }, { r: 2, c: 1 }],
  square2x2plus: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }],
};

export type NetShape = { id: string; cells: Cell[]; valid: boolean };
export function classifyNet(id: string): NetShape {
  const cells = HEXOMINOES[id] ?? [];
  return { id, cells, valid: foldNet(cells).valid };
}

// Normalise so the top-left of the bounding box is (0,0) — handy for rendering.
export function normalise(cells: Cell[]): Cell[] {
  const minR = Math.min(...cells.map((cell) => cell.r));
  const minC = Math.min(...cells.map((cell) => cell.c));
  return cells.map((cell) => ({ r: cell.r - minR, c: cell.c - minC }));
}

export function netExtent(cells: Cell[]): { rows: number; cols: number } {
  const norm = normalise(cells);
  return { rows: Math.max(...norm.map((cell) => cell.r)) + 1, cols: Math.max(...norm.map((cell) => cell.c)) + 1 };
}

export const VALID_NET_IDS = Object.keys(HEXOMINOES).filter((id) => classifyNet(id).valid);
export const INVALID_NET_IDS = Object.keys(HEXOMINOES).filter((id) => !classifyNet(id).valid);

export const faceColour = (id: FaceId) => FACE_META[id].colour;

// A fold tree the card can render as nested, hinged faces. Re-rooted (by default
// at the Front face) so the base face stays facing the viewer as it folds.
export type FoldNode = { key: string; cell: Cell; faceId: FaceId; dir?: NetDir; children: FoldNode[] };
export function foldTree(cells: Cell[], rootKey?: string): FoldNode | null {
  const norm = normalise(cells);
  const fold = foldNet(norm);
  const present = new Map(norm.map((cell) => [keyOf(cell), cell]));
  const root = (rootKey ? present.get(rootKey) : undefined)
    ?? norm.find((cell) => fold.faceOf.get(keyOf(cell)) === 4)
    ?? norm[0];
  if (!root) return null;
  const visited = new Set<string>();
  const build = (cell: Cell, dir?: NetDir): FoldNode => {
    const k = keyOf(cell);
    visited.add(k);
    const node: FoldNode = { key: k, cell, faceId: fold.faceOf.get(k) ?? 1, dir, children: [] };
    (Object.keys(DELTA) as NetDir[]).forEach((d) => {
      const next = { r: cell.r + DELTA[d].r, c: cell.c + DELTA[d].c };
      const nk = keyOf(next);
      if (present.has(nk) && !visited.has(nk)) node.children.push(build(next, d));
    });
    return node;
  };
  return build(root);
}
