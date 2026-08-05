import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type CompositeTask = Extract<PracticeTask, { kind: "starpathComposite" }>;
export type CompositePlacement = CompositeTask["validSolutions"][number][number];

const PALETTE = [
  { id: "triangle", label: "Triangle", colour: "#f59e0b" },
  { id: "square", label: "Square", colour: "#22c55e" },
  { id: "rectangle", label: "Rectangle", colour: "#06b6d4" },
  { id: "circle", label: "Circle", colour: "#ec4899" },
];
const SOLIDS = [
  { id: "cube-1", label: "1 cube high", colour: "#8b5cf6" },
  { id: "cube-2", label: "2 cubes high", colour: "#0ea5e9" },
  { id: "cube-3", label: "3 cubes high", colour: "#f97316" },
];

const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;
export function isCompositeSolution(task: CompositeTask, placements: CompositePlacement[]) {
  const actual = new Map(placements.map((item) => [key(item), item.pieceId]));
  if (!["solid", "views", "hidden"].includes(task.mode)) {
    const targetKeys = new Set(task.targetCells.map(key));
    const coversBoundary = actual.size === targetKeys.size && [...actual.keys()].every((cellKey) => targetKeys.has(cellKey));
    const respectsBudget = task.maxPieces === undefined || placements.length <= task.maxPieces;
    const usesRequiredPieces = (task.requiredPieceIds ?? []).every((pieceId) => placements.some((item) => item.pieceId === pieceId));
    return coversBoundary && respectsBudget && usesRequiredPieces;
  }
  return task.validSolutions.some((solution) => solution.length === actual.size && solution.every((item) => actual.get(key(item)) === item.pieceId));
}

function target(round: number) {
  const variants = [
    [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }],
    [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 2 }],
    [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
  ];
  return variants[round % variants.length]!;
}

function shapeSolutions(cells: Array<{ r: number; c: number }>, round: number) {
  const first = cells.map((cell, index) => ({ ...cell, pieceId: PALETTE[(index + round) % 3]!.id }));
  const second = cells.map((cell, index) => ({ ...cell, pieceId: PALETTE[(index + round + 1) % 3]!.id }));
  return [first, second];
}

function construct(round: number, mode: CompositeTask["mode"], targetNumber: number): CompositeTask {
  const targetCells = target(mode === "model" ? 2 : round);
  const validSolutions = shapeSolutions(targetCells, round);
  const briefs: Record<string, string> = {
    construct: "Cover the signal outline. Choose, arrange and rotate-equivalent components freely.",
    alternate: "Build the same outer boundary using a different component combination.",
    model: "Make a three-component-wide base, then place two centred components above it to preserve the tower silhouette.",
    simplify: "Keep the defining outline and remove decorative detail.",
  };
  return { kind: "starpathComposite", mode, prompt: mode === "alternate" ? "Build the outline another valid way." : mode === "model" ? "Create a clear approximation from the brief." : "Construct the composite shape.", speakText: briefs[mode] ?? "Choose and place familiar components so the complete design meets the brief.", target: targetNumber, boardId: `l4-composite-${mode}-${round}`, cols: 4, rows: 3, palette: PALETTE, targetCells, validSolutions, requiredPieceIds: mode === "alternate" ? [PALETTE[(round + 1) % 3]!.id] : [], maxPieces: targetCells.length, designBrief: briefs[mode] ?? "Preserve every defining part of the outline.", feedback: { correct: "The construction satisfies the boundary and component conditions.", wrong: "Check the occupied boundary, component budget and required pieces." } };
}

function solid(round: number, mode: CompositeTask["mode"], targetNumber: number): CompositeTask {
  const cells = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }];
  const heights = [1 + (round % 2), 1, 2 + (round % 2), 1];
  const solution = cells.map((cell, index) => ({ ...cell, pieceId: `cube-${heights[index]}` }));
  const views = { front: [heights[1]!, heights[2]!, heights[3]!], side: [heights[2]!, heights[0]!], top: cells.length };
  return { kind: "starpathComposite", mode, prompt: mode === "hidden" ? "Add the smallest hidden support structure." : mode === "views" ? "Build the object to match both camera views." : "Combine solids to satisfy the equipment brief.", speakText: "Choose stack heights and positions. Every visible tower must be supported and the front, side and top evidence must agree.", target: targetNumber, boardId: `l4-solid-${mode}-${round}`, cols: 4, rows: 3, palette: SOLIDS, targetCells: cells, validSolutions: [solution], maxPieces: cells.length, viewLabels: views, designBrief: mode === "hidden" ? "Use the fewest cubes that can support every visible part." : `Front heights ${views.front.join("-")}; side heights ${views.side.join("-")}; top covers ${views.top} cells.`, feedback: { correct: "The structure matches the supplied views and support evidence.", wrong: "Compare every stack with the front, side and top evidence." } };
}

function judgment(round: number, mode: CompositeTask["mode"], targetNumber: number): CompositeTask {
  const correct = round % 2 ? "model-b" : "model-a";
  const reason = mode === "scan" ? "geometry" : mode === "evaluate" ? "purpose" : "feature";
  return { kind: "starpathComposite", mode, prompt: mode === "scan" ? "Which component analysis uses geometry rather than decoration?" : mode === "evaluate" ? "Choose the better model, then identify the decisive reason." : "Which simplified model preserves the defining feature?", speakText: "Inspect both representations. Make the spatial decision, then connect it to the evidence that justifies it.", target: targetNumber, boardId: `l4-judge-${mode}-${round}`, cols: 4, rows: 3, palette: PALETTE, targetCells: target(round), validSolutions: shapeSolutions(target(round), round), options: [{ id: "model-a", label: round % 2 ? "Detailed badge with a narrow base" : "Clear outline with a wide base and pointed top" }, { id: "model-b", label: round % 2 ? "Clear outline preserving the required silhouette" : "Decorative badge missing the pointed top" }], correctOptionId: correct, reasonOptions: [{ id: reason, label: mode === "scan" ? "It identifies components by shape and position." : mode === "evaluate" ? "It communicates the features required for this purpose." : "It preserves the feature that distinguishes the object." }, { id: "colour", label: "It uses the brightest colours." }, { id: "detail", label: "It contains the most decoration." }], correctReasonId: reason, designBrief: "Preserve the spatial features needed by the stated audience and purpose.", feedback: { correct: "The choice and reason both use relevant spatial evidence.", wrong: "Choose using the defining geometry and purpose, not colour or decoration." } };
}

export const componentScanTask = (round: number, targetNumber: number) => judgment(round, "scan", targetNumber);
export const constructShapeTask = (round: number, targetNumber: number) => construct(round, "construct", targetNumber);
export const alternateShapeTask = (round: number, targetNumber: number) => construct(round + 2, "alternate", targetNumber);
export const solidAssemblyTask = (round: number, targetNumber: number) => solid(round, "solid", targetNumber);
export const viewBuildTask = (round: number, targetNumber: number) => solid(round + 2, "views", targetNumber);
export const hiddenStructureTask = (round: number, targetNumber: number) => solid(round + 4, "hidden", targetNumber);
export const simplifyTask = (round: number, targetNumber: number) => judgment(round + 3, "simplify", targetNumber);
export const modelTask = (round: number, targetNumber: number) => construct(round + 5, "model", targetNumber);
export const evaluateModelTask = (round: number, targetNumber: number) => judgment(round + 7, "evaluate", targetNumber);
