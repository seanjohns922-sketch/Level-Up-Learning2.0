export type GridPoint = {x: number; y: number};
export type TilePlacement = {x: number; y: number; turn: number};
export type IndependentConstructionTask = {
  kind: "starpathIndependentConstruction";
  prompt: string;
  speakText: string;
  target: number;
  instructions?: string[];
  feedback: {correct: string; wrong: string};
} & (
  | {mode: "image"; min: number; max: number; original: GridPoint[]; expected: GridPoint[]; line?: {axis: "x" | "y"; at: number}; centre?: GridPoint}
  | {mode: "tiles"; width: number; height: number; piece: GridPoint[]; outline: GridPoint[]; minimumOrientations: number}
  | {mode: "axes"; size: number; scale: number; point: GridPoint}
  | {mode: "model"; palette: Array<{id: string; label: string; svg: string}>; slots: string[]; accepted: string[][]; reasons: Array<{id: string; label: string}>; correctReason: string}
);
export function samePointSet(actual: GridPoint[], expected: GridPoint[]): boolean {
  const key = (p: GridPoint) => `${p.x}:${p.y}`;
  return actual.length === expected.length && new Set(actual.map(key)).size === actual.length && expected.every(p => actual.some(q => key(q) === key(p)));
}
export function tileCells(piece: GridPoint[], placement: TilePlacement): GridPoint[] {
  let points = piece;
  for (let i = 0; i < ((placement.turn % 4) + 4) % 4; i++) points = points.map(p => ({x: -p.y, y: p.x}));
  const minX = Math.min(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y));
  return points.map(p => ({x: p.x - minX + placement.x, y: p.y - minY + placement.y}));
}
export function tilesAreCorrect(task: Extract<IndependentConstructionTask, {mode: "tiles"}>, placements: TilePlacement[]): boolean {
  return new Set(placements.map(p => ((p.turn % 4) + 4) % 4)).size >= task.minimumOrientations
    && samePointSet(placements.flatMap(p => tileCells(task.piece, p)), task.outline);
}
export function axesAreCorrect(task: Extract<IndependentConstructionTask, {mode: "axes"}>, labels: string[], point: GridPoint | null): boolean {
  const expected = ["x", "y", "0", String(task.scale), String(task.scale * 2)];
  return expected.every((v, i) => labels[i]?.trim().toLowerCase() === v) && point?.x === task.point.x / task.scale && point?.y === task.point.y / task.scale;
}
