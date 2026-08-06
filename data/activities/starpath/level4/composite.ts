import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL4Figure, figureSvg, type CompositeFigure } from "./composite-figures";

export type CompositeTask = Extract<PracticeTask, { kind: "starpathComposite" }>;
export type CompositePlacement = { r: number; c: number; pieceId: string };

const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;

// Legacy cube-board validation (Week 2 solid/views/hidden).
export function isCompositeSolution(task: CompositeTask, placements: CompositePlacement[]) {
  const actual = new Map(placements.map((item) => [key(item), item.pieceId]));
  const solutions = task.validSolutions ?? [];
  return solutions.some((solution) => solution.length === actual.size && solution.every((item) => actual.get(key(item)) === item.pieceId));
}

function rotate<T>(items: T[], by: number): T[] {
  const n = items.length;
  if (!n) return items;
  const s = ((by % n) + n) % n;
  return [...items.slice(s), ...items.slice(0, s)];
}

const SHAPE_ORDER = ["triangle", "square", "rectangle", "circle"] as const;
const ALL_SHAPES: string[] = [...SHAPE_ORDER];
function distinctShapes(fig: CompositeFigure): string[] {
  const set = new Set(fig.parts.map((p) => p.shape));
  return SHAPE_ORDER.filter((s) => set.has(s));
}

// ── Figure build (W1/W3 construct / alternate / model / simplify) ─────────────
function figureBuild(round: number, mode: CompositeTask["mode"], targetNumber: number): CompositeTask {
  const fig = getL4Figure(round);
  const framing: Record<string, string> = {
    construct: `Build the ${fig.name}.`,
    alternate: `Build the ${fig.name} from familiar shapes.`,
    model: `Create a clear ${fig.name} from the brief.`,
    simplify: `Build a simple ${fig.name} icon from familiar shapes.`,
  };
  return {
    kind: "starpathComposite",
    mode,
    target: targetNumber,
    prompt: framing[mode] ?? `Build the ${fig.name}.`,
    speakText: `Pick a familiar shape, then tap the glowing socket it fits. Build the ${fig.name}.`,
    designBrief: `A composite shape is made from familiar shapes. Fill each glowing socket with the shape that matches it to complete the ${fig.name}.`,
    figure: { id: fig.id, name: fig.name, viewBox: fig.viewBox, parts: fig.parts.map((p) => ({ id: p.id, label: p.label, shape: p.shape, solid: p.solid, ghost: p.ghost, hit: p.hit })) },
    buildPalette: ALL_SHAPES,
    feedback: { correct: `The ${fig.name} is complete!`, wrong: "Each glowing socket needs the familiar shape that matches its outline." },
  };
}

// ── Figure scan (W1 "Shapes Within Shapes") — name the components ──────────────
function figureScan(round: number, targetNumber: number): CompositeTask {
  const fig = getL4Figure(round);
  const shapes = distinctShapes(fig);
  const correct = shapes.join(" + ");
  const missing = SHAPE_ORDER.filter((s) => !shapes.includes(s));
  const pool = [
    shapes.length > 1 ? shapes.slice(1).join(" + ") : `${shapes[0]} + circle`,
    [...new Set([...shapes, missing[0] ?? "circle"])].join(" + "),
    `${shapes[0]} + ${missing[0] ?? "circle"}`,
  ];
  const wrong = pool.filter((p) => p && p !== correct);
  const options = rotate([
    { id: "a", label: correct },
    { id: "b", label: wrong[0] ?? "square + circle" },
    { id: "c", label: wrong[1] ?? "triangle + circle" },
  ], round % 3);
  return {
    kind: "starpathComposite",
    mode: "scan",
    target: targetNumber,
    prompt: `Which familiar shapes make this ${fig.name}?`,
    speakText: `Look at the ${fig.name}. Which familiar shapes is it built from?`,
    designBrief: `A composite shape is made from familiar shapes. Name the shapes you can see.`,
    figureSvg: figureSvg(fig, () => true),
    options,
    correctOptionId: "a",
    feedback: { correct: `Yes — a ${fig.name} is ${correct}.`, wrong: `Look at each part: this ${fig.name} is ${correct}.` },
  };
}

// ── Figure compare (W1/W3 "Evaluate") — pick the complete build + reason ───────
function figureCompare(round: number, targetNumber: number): CompositeTask {
  const fig = getL4Figure(round);
  const dropId = fig.parts[round % fig.parts.length]!.id;
  const complete = figureSvg(fig, () => true);
  const broken = figureSvg(fig, (id) => id !== dropId);
  const correctFirst = round % 2 === 0;
  return {
    kind: "starpathComposite",
    mode: "evaluate",
    target: targetNumber,
    prompt: `Two builders made a ${fig.name}. Which one is complete?`,
    speakText: `Two ${fig.name} builds. One is missing a part. Choose the complete one, then the reason.`,
    designBrief: `A good model keeps every part that gives the ${fig.name} its shape.`,
    figureOptions: correctFirst ? [{ id: "a", svg: complete }, { id: "b", svg: broken }] : [{ id: "a", svg: broken }, { id: "b", svg: complete }],
    correctOptionId: correctFirst ? "a" : "b",
    reasonOptions: rotate([
      { id: "whole", label: `It keeps every part of the ${fig.name}.` },
      { id: "colour", label: "It uses the brightest colours." },
      { id: "big", label: "It is the bigger picture." },
    ], round % 3),
    correctReasonId: "whole",
    feedback: { correct: `Right — a complete ${fig.name} keeps every part.`, wrong: `Look for the build with no glowing gap — it keeps every part.` },
  };
}

// ── Week 1 / Week 3 exports (figure-based) ─────────────────────────────────────
export const componentScanTask = (round: number, targetNumber: number) => figureScan(round, targetNumber);
export const constructShapeTask = (round: number, targetNumber: number) => figureBuild(round, "construct", targetNumber);
export const alternateShapeTask = (round: number, targetNumber: number) => figureBuild(round + 2, "alternate", targetNumber);
export const modelTask = (round: number, targetNumber: number) => figureBuild(round + 5, "model", targetNumber);
export const simplifyTask = (round: number, targetNumber: number) => figureBuild(round + 3, "simplify", targetNumber);
export const evaluateModelTask = (round: number, targetNumber: number) => figureCompare(round, targetNumber);

// ── Week 2 exports (cube solids — unchanged this pass) ─────────────────────────
const SOLIDS = [
  { id: "cube-1", label: "1 cube high", colour: "#8b5cf6" },
  { id: "cube-2", label: "2 cubes high", colour: "#0ea5e9" },
  { id: "cube-3", label: "3 cubes high", colour: "#f97316" },
];

function solid(round: number, mode: CompositeTask["mode"], targetNumber: number): CompositeTask {
  const cells = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }];
  const heights = [1 + (round % 2), 1, 2 + (round % 2), 1];
  const solution = cells.map((cell, index) => ({ ...cell, pieceId: `cube-${heights[index]}` }));
  const views = { front: [heights[1]!, heights[2]!, heights[3]!], side: [heights[2]!, heights[0]!], top: cells.length };
  return {
    kind: "starpathComposite",
    mode,
    prompt: mode === "hidden" ? "Add the smallest hidden support structure." : mode === "views" ? "Build the object to match both camera views." : "Combine solids to satisfy the equipment brief.",
    speakText: "Choose stack heights and positions. Every visible tower must be supported and the front, side and top evidence must agree.",
    target: targetNumber,
    boardId: `l4-solid-${mode}-${round}`,
    cols: 4,
    rows: 3,
    palette: SOLIDS,
    targetCells: cells,
    validSolutions: [solution],
    maxPieces: cells.length,
    viewLabels: views,
    designBrief: mode === "hidden" ? "Use the fewest cubes that can support every visible part." : `Front heights ${views.front.join("-")}; side heights ${views.side.join("-")}; top covers ${views.top} cells.`,
    feedback: { correct: "The structure matches the supplied views and support evidence.", wrong: "Compare every stack with the front, side and top evidence." },
  };
}

export const solidAssemblyTask = (round: number, targetNumber: number) => solid(round, "solid", targetNumber);
export const viewBuildTask = (round: number, targetNumber: number) => solid(round + 2, "views", targetNumber);
export const hiddenStructureTask = (round: number, targetNumber: number) => solid(round + 4, "hidden", targetNumber);
