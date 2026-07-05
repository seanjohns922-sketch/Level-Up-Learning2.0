// Grid polyomino shapes + boundary maths for Week 7 (Perimeter — conceptual).
// A shape is a list of filled cells [col,row]; its perimeter is the set of cell
// edges not shared with another filled cell.

export type Side = "top" | "right" | "bottom" | "left";
export type Edge = [number, number, Side];
export type ShapeDef = { cells: Array<[number, number]>; gridW: number; gridH: number; label: string; emoji: string; complex?: boolean };

export function cellKey(c: number, r: number) { return `${c},${r}`; }
export function edgeKey(c: number, r: number, side: Side) { return `${c},${r},${side}`; }

export function boundaryEdges(cells: Array<[number, number]>): Edge[] {
  const set = new Set(cells.map(([c, r]) => cellKey(c, r)));
  const edges: Edge[] = [];
  for (const [c, r] of cells) {
    if (!set.has(cellKey(c, r - 1))) edges.push([c, r, "top"]);
    if (!set.has(cellKey(c + 1, r))) edges.push([c, r, "right"]);
    if (!set.has(cellKey(c, r + 1))) edges.push([c, r, "bottom"]);
    if (!set.has(cellKey(c - 1, r))) edges.push([c, r, "left"]);
  }
  return edges;
}

export function perimeter(cells: Array<[number, number]>) { return boundaryEdges(cells).length; }

// Edges shared between two filled cells (inside the shape) — good "cut across" decoys.
export function internalEdges(cells: Array<[number, number]>): Edge[] {
  const set = new Set(cells.map(([c, r]) => cellKey(c, r)));
  const edges: Edge[] = [];
  for (const [c, r] of cells) {
    if (set.has(cellKey(c + 1, r))) edges.push([c, r, "right"]);
    if (set.has(cellKey(c, r + 1))) edges.push([c, r, "bottom"]);
  }
  return edges;
}

function rect(w: number, h: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let c = 0; c < w; c++) for (let r = 0; r < h; r++) cells.push([c, r]);
  return cells;
}
// L-shape on a wxh grid (left column full + bottom row full).
function lShape(w: number, h: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < h; r++) cells.push([0, r]);
  for (let c = 1; c < w; c++) cells.push([c, h - 1]);
  return cells;
}

// Simple rectangles/squares with real-world labels.
export const SIMPLE_SHAPES: ShapeDef[] = [
  { label: "garden", emoji: "🌷", cells: rect(4, 3), gridW: 4, gridH: 3 },
  { label: "swimming pool", emoji: "🏊", cells: rect(5, 2), gridW: 5, gridH: 2 },
  { label: "picture frame", emoji: "🖼️", cells: rect(3, 4), gridW: 3, gridH: 4 },
  { label: "book", emoji: "📖", cells: rect(3, 3), gridW: 3, gridH: 3 },
  { label: "football field", emoji: "🏉", cells: rect(5, 3), gridW: 5, gridH: 3 },
  { label: "fence", emoji: "🚧", cells: rect(4, 4), gridW: 4, gridH: 4 },
  { label: "vegetable patch", emoji: "🥕", cells: rect(4, 2), gridW: 4, gridH: 2 },
];

// L-shapes / composite (still simple) with real-world labels.
export const COMPLEX_SHAPES: ShapeDef[] = [
  { label: "playground", emoji: "🛝", cells: lShape(3, 3), gridW: 3, gridH: 3, complex: true },
  { label: "house block", emoji: "🏠", cells: lShape(4, 3), gridW: 4, gridH: 3, complex: true },
  { label: "park", emoji: "🌳", cells: lShape(3, 4), gridW: 3, gridH: 4, complex: true },
  { label: "school yard", emoji: "🏫", cells: lShape(4, 4), gridW: 4, gridH: 4, complex: true },
];

export const ALL_SHAPES: ShapeDef[] = [...SIMPLE_SHAPES, ...COMPLEX_SHAPES];
