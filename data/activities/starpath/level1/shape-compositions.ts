import type { StarpathShape } from "@/data/activities/year1/practice-task";

// "Make a Shape" compositions: a target shape tiled by congruent parts. The
// child taps the piece shape to drop each part into the next slot until the
// target is assembled. viewBox is 0 0 48 48 for every composition.

const STROKE = "#312e81";

export type ComposeSlot = {
  id: string;
  colour: string;
  rect?: { x: number; y: number; w: number; h: number };
  points?: string;
};

export type ShapeComposition = {
  id: string;
  label: string; // "square"
  targetShape: StarpathShape;
  pieceShape: StarpathShape;
  slots: ComposeSlot[];
  decoys: StarpathShape[];
  outline: { x: number; y: number; w: number; h: number };
};

const COMPOSITIONS: Record<string, ShapeComposition> = {
  "big-square-4": {
    id: "big-square-4",
    label: "square",
    targetShape: "square",
    pieceShape: "square",
    outline: { x: 4, y: 4, w: 40, h: 40 },
    slots: [
      { id: "s1", colour: "#67e8f9", rect: { x: 4, y: 4, w: 20, h: 20 } },
      { id: "s2", colour: "#c4b5fd", rect: { x: 24, y: 4, w: 20, h: 20 } },
      { id: "s3", colour: "#86efac", rect: { x: 4, y: 24, w: 20, h: 20 } },
      { id: "s4", colour: "#fde047", rect: { x: 24, y: 24, w: 20, h: 20 } },
    ],
    decoys: ["circle", "triangle"],
  },
  "square-2rect": {
    id: "square-2rect",
    label: "square",
    targetShape: "square",
    pieceShape: "rectangle",
    outline: { x: 4, y: 4, w: 40, h: 40 },
    slots: [
      { id: "s1", colour: "#f9a8d4", rect: { x: 4, y: 4, w: 40, h: 20 } },
      { id: "s2", colour: "#a5f3fc", rect: { x: 4, y: 24, w: 40, h: 20 } },
    ],
    decoys: ["triangle", "circle"],
  },
  "rect-2square": {
    id: "rect-2square",
    label: "rectangle",
    targetShape: "rectangle",
    pieceShape: "square",
    outline: { x: 4, y: 14, w: 40, h: 20 },
    slots: [
      { id: "s1", colour: "#fca5a5", rect: { x: 4, y: 14, w: 20, h: 20 } },
      { id: "s2", colour: "#86efac", rect: { x: 24, y: 14, w: 20, h: 20 } },
    ],
    decoys: ["triangle", "circle"],
  },
  "square-2tri": {
    id: "square-2tri",
    label: "square",
    targetShape: "square",
    pieceShape: "triangle",
    outline: { x: 4, y: 4, w: 40, h: 40 },
    slots: [
      { id: "s1", colour: "#fbbf24", points: "4,4 44,4 4,44" },
      { id: "s2", colour: "#c4b5fd", points: "44,4 44,44 4,44" },
    ],
    decoys: ["circle", "square"],
  },
  "rect-2rect": {
    id: "rect-2rect",
    label: "rectangle",
    targetShape: "rectangle",
    pieceShape: "rectangle",
    outline: { x: 6, y: 14, w: 36, h: 20 },
    slots: [
      { id: "s1", colour: "#93c5fd", rect: { x: 6, y: 14, w: 18, h: 20 } },
      { id: "s2", colour: "#c4b5fd", rect: { x: 24, y: 14, w: 18, h: 20 } },
    ],
    decoys: ["triangle", "circle"],
  },
};

export function getComposition(id: string): ShapeComposition {
  return COMPOSITIONS[id] ?? COMPOSITIONS["big-square-4"]!;
}

export function listCompositions(): ShapeComposition[] {
  return Object.values(COMPOSITIONS);
}

export function composeSlotSvg(slot: ComposeSlot, opts?: { filled?: boolean }): string {
  const filled = opts?.filled ?? true;
  const fill = filled ? slot.colour : "#ffffff";
  const fillOpacity = filled ? 1 : 0.15;
  const stroke = filled ? STROKE : "#a5b4fc";
  const dash = filled ? "" : ` stroke-dasharray="3 2"`;
  const common = `fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="1.1" stroke-linejoin="round"${dash}`;
  if (slot.points) {
    return `<polygon points="${slot.points}" ${common} />`;
  }
  const r = slot.rect!;
  return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="1.5" ${common} />`;
}

// Assembled target (all slots filled) — used by the offline render harness.
export function compositionAssembledSvg(comp: ShapeComposition, opts?: { size?: number }): string {
  const size = opts?.size ?? 120;
  const body = comp.slots.map((slot) => composeSlotSvg(slot, { filled: true })).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">${body}</svg>`;
}
