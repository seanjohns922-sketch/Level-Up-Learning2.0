import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type SymmetryTask = Extract<PracticeTask, { kind: "starpathSymmetry" }>;
export type SymmetryCell = SymmetryTask["seedCells"][number];
const COLOURS = ["#7c3aed", "#0891b2", "#f59e0b"];
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

export function transformCell(task: Pick<SymmetryTask, "size" | "line" | "rotation" | "centre">, cell: { r: number; c: number }) {
  if (task.line === "vertical") return { r: cell.r, c: task.size - 1 - cell.c };
  if (task.line === "horizontal") return { r: task.size - 1 - cell.r, c: cell.c };
  if (task.line === "diagonal") return { r: cell.c, c: cell.r };
  const centre = task.centre ?? { r: Math.floor(task.size / 2), c: Math.floor(task.size / 2) };
  const dr = cell.r - centre.r;
  const dc = cell.c - centre.c;
  return task.rotation === 90 ? { r: centre.r - dc, c: centre.c + dr } : { r: centre.r - dr, c: centre.c - dc };
}

export function isSymmetricDesign(task: SymmetryTask, cells: SymmetryCell[]) {
  if (cells.length < (task.minSeedCells ?? 1)) return false;
  const map = new Map(cells.map((cell) => [key(cell), cell.colour]));
  return cells.every((cell) => {
    const transformed = transformCell(task, cell);
    return transformed.r >= 0 && transformed.r < task.size && transformed.c >= 0 && transformed.c < task.size && map.get(key(transformed)) === cell.colour;
  });
}

function closure(task: Pick<SymmetryTask, "size" | "line" | "rotation" | "centre">, seeds: SymmetryCell[]) {
  const result = new Map(seeds.map((cell) => [key(cell), cell]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const cell of [...result.values()]) {
      const transformed = { ...transformCell(task, cell), colour: cell.colour };
      if (!result.has(key(transformed))) { result.set(key(transformed), transformed); changed = true; }
    }
  }
  return [...result.values()];
}

function lineTask(round: number, mode: SymmetryTask["mode"], target: number, forcedLine?: SymmetryTask["line"]): SymmetryTask {
  const line = forcedLine ?? (["vertical", "horizontal", "diagonal"] as const)[round % 3];
  const size = 5;
  const seeds = line === "vertical" ? [{ r: 1, c: 1, colour: COLOURS[round % 3]! }, { r: 3, c: 0, colour: COLOURS[(round + 1) % 3]! }] : line === "horizontal" ? [{ r: 0, c: 1, colour: COLOURS[round % 3]! }, { r: 1, c: 3, colour: COLOURS[(round + 1) % 3]! }] : [{ r: 0, c: 2, colour: COLOURS[round % 3]! }, { r: 1, c: 3, colour: COLOURS[(round + 1) % 3]! }];
  const spec = { size, line };
  const expectedCells = closure(spec, seeds);
  // Repair: keep the full symmetric layout but recolour exactly one off-axis
  // tile. That leaves a single, unambiguous mismatch across the line — the tile
  // whose colour no longer matches its mirror partner — so the fix is to recolour
  // it back, not to add or move tiles.
  const shown = mode === "complete" ? seeds : mode === "repair" ? expectedCells.map((cell, index) => index === expectedCells.length - 1 ? { ...cell, colour: COLOURS[(COLOURS.indexOf(cell.colour) + 1) % COLOURS.length]! } : cell) : expectedCells;
  const valid = mode !== "test" || round % 2 === 0;
  const testCells = valid ? expectedCells : expectedCells.slice(0, -1);
  return { kind: "starpathSymmetry", mode, prompt: mode === "test" ? `Does this design have ${line} line symmetry?` : mode === "complete" ? `Complete the ${line} reflection.` : mode === "create" ? `Create a design with ${line} line symmetry.` : "Repair the unmatched tile.", speakText: "Use corresponding positions at equal distances from the stated symmetry line. Test every colour and tile, not just the overall balance.", target, boardId: `l4-line-${mode}-${line}-${round}`, size, line, seedCells: mode === "test" ? testCells : mode === "create" ? [] : shown, expectedCells, minSeedCells: 4, options: mode === "test" ? [{ id: "yes", label: "Yes, every tile has a matching partner" }, { id: "no", label: "No, at least one corresponding tile fails" }] : undefined, correctOptionIds: mode === "test" ? [valid ? "yes" : "no"] : undefined, feedback: { correct: "The reflection test passes for every corresponding position.", wrong: "Check equal distance, corresponding position and colour across the line." } };
}

function rotationTask(round: number, mode: SymmetryTask["mode"], target: number, rotation: 90 | 180 = round % 2 ? 90 : 180): SymmetryTask {
  const size = 5;
  const centre = { r: 2, c: 2 };
  const seeds = [{ r: 1, c: 2, colour: COLOURS[round % 3]! }, { r: 1, c: 3, colour: COLOURS[(round + 1) % 3]! }];
  const spec = { size, rotation, centre };
  const expectedCells = closure(spec, seeds);
  const valid = mode !== "test" || round % 2 === 0;
  // Repair: recolour one tile of the finished pattern so a single tile no longer
  // matches its turn-partners — the same one-clear-fix model as the line repair.
  const shown = mode === "complete" ? seeds : mode === "repair" ? expectedCells.map((cell, index) => index === expectedCells.length - 1 ? { ...cell, colour: COLOURS[(COLOURS.indexOf(cell.colour) + 1) % COLOURS.length]! } : cell) : mode === "create" ? [] : valid ? expectedCells : expectedCells.slice(0, -1);
  const options = mode === "test" ? [{ id: "match", label: `Matches after ${rotation}°` }, { id: "fail", label: `Does not match after ${rotation}°` }] : mode === "record" ? [{ id: "90", label: "Quarter-turn, 90°" }, { id: "180", label: "Half-turn, 180°" }, { id: "360", label: "Full turn only" }] : undefined;
  return { kind: "starpathSymmetry", mode, prompt: mode === "record" ? "Record the smallest tested turn that matches." : mode === "test" ? `Test the design after a ${rotation}° turn.` : mode === "create" ? `Create a pattern that matches after a ${rotation}° turn.` : mode === "repair" ? "Repair the rotational pattern." : "Complete the turning pattern.", speakText: `Rotate every feature ${rotation} degrees around the marked centre. A match must preserve position and colour.`, target, boardId: `l4-rotation-${mode}-${rotation}-${round}`, size, rotation, centre, seedCells: shown, expectedCells, minSeedCells: rotation === 90 ? 4 : 2, options, correctOptionIds: mode === "test" ? [valid ? "match" : "fail"] : mode === "record" ? [String(rotation)] : undefined, feedback: { correct: "The rotation test preserves every feature around the stated centre.", wrong: "Track the turn amount, centre, corresponding position and colour." } };
}

export const lineTestTask = (round: number, target: number) => lineTask(round, "test", target);
export const verticalCompleteTask = (round: number, target: number) => lineTask(round, "complete", target, "vertical");
export const horizontalCompleteTask = (round: number, target: number) => lineTask(round, "complete", target, "horizontal");
export const diagonalCompleteTask = (round: number, target: number) => lineTask(round, "complete", target, "diagonal");
export const lineCreateTask = (round: number, target: number) => lineTask(round, "create", target);
export const lineRepairTask = (round: number, target: number) => lineTask(round, "repair", target);
export const rotationTestTask = (round: number, target: number) => rotationTask(round, "test", target);
export const rotationRecordTask = (round: number, target: number) => rotationTask(round, "record", target);
export const rotationCompleteTask = (round: number, target: number) => rotationTask(round, "complete", target);
export const rotationCreateTask = (round: number, target: number) => rotationTask(round, "create", target);
export const rotationRepairTask = (round: number, target: number) => rotationTask(round, "repair", target);
