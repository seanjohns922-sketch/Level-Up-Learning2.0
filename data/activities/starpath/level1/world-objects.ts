import type { StarpathShape } from "@/data/activities/year1/practice-task";
import { huntPieceSvg, type ShapeHuntPiece } from "./shape-hunt-scenes";

// Everyday objects drawn from familiar shapes (tangram style, viewBox 0 0 48 48).
// Each object has one PRIMARY shape — the shape a Year 1 child would name it —
// used by the "shapes in the world" activities (spot / compare / match). The
// inner pieces are just art so the object reads as a real thing.

export type WorldObject = {
  id: string;
  label: string;
  shape: StarpathShape;
  pieces: ShapeHuntPiece[];
};

function p(
  shape: StarpathShape,
  colour: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation?: number
): ShapeHuntPiece {
  return { id: `${shape}-${x}-${y}`, shape, colour, x, y, w, h, rotation };
}

const OBJECTS: WorldObject[] = [
  // ── Circles ────────────────────────────────────────────────────────────────
  {
    id: "clock",
    label: "clock",
    shape: "circle",
    pieces: [
      p("circle", "#fef9c3", 5, 5, 38, 38),
      p("circle", "#fde047", 9, 9, 30, 30),
      p("rectangle", "#312e81", 23, 14, 2, 11),
      p("rectangle", "#312e81", 24, 23, 10, 2),
      p("circle", "#312e81", 22, 22, 4, 4),
    ],
  },
  {
    id: "ball",
    label: "ball",
    shape: "circle",
    pieces: [
      p("circle", "#fca5a5", 6, 6, 36, 36),
      p("rectangle", "#b91c1c", 23, 8, 2, 32),
      p("rectangle", "#b91c1c", 8, 23, 32, 2),
    ],
  },
  {
    id: "wheel",
    label: "wheel",
    shape: "circle",
    pieces: [
      p("circle", "#1e293b", 5, 5, 38, 38),
      p("circle", "#94a3b8", 13, 13, 22, 22),
      p("circle", "#475569", 20, 20, 8, 8),
    ],
  },
  // ── Squares ────────────────────────────────────────────────────────────────
  {
    id: "window",
    label: "window",
    shape: "square",
    pieces: [
      p("square", "#7dd3fc", 8, 8, 32, 32),
      p("rectangle", "#e0f2fe", 22, 8, 4, 32),
      p("rectangle", "#e0f2fe", 8, 22, 32, 4),
    ],
  },
  {
    id: "present",
    label: "present",
    shape: "square",
    pieces: [
      p("square", "#f472b6", 9, 13, 30, 27),
      p("rectangle", "#fde047", 22, 13, 4, 27),
      p("rectangle", "#fde047", 9, 23, 30, 4),
      p("triangle", "#fbbf24", 18, 5, 12, 8),
    ],
  },
  {
    id: "frame",
    label: "picture frame",
    shape: "square",
    pieces: [
      p("square", "#a16207", 7, 7, 34, 34),
      p("square", "#bfdbfe", 12, 12, 24, 24),
      p("circle", "#fde047", 28, 15, 6, 6),
      p("triangle", "#4ade80", 14, 20, 14, 12),
    ],
  },
  // ── Rectangles ─────────────────────────────────────────────────────────────
  {
    id: "door",
    label: "door",
    shape: "rectangle",
    pieces: [
      p("rectangle", "#c084fc", 13, 5, 22, 39),
      p("rectangle", "#a855f7", 16, 9, 16, 13),
      p("rectangle", "#a855f7", 16, 25, 16, 13),
      p("circle", "#fde047", 29, 24, 4, 4),
    ],
  },
  {
    id: "book",
    label: "book",
    shape: "rectangle",
    pieces: [
      p("rectangle", "#60a5fa", 9, 11, 30, 26),
      p("rectangle", "#1d4ed8", 9, 11, 5, 26),
      p("rectangle", "#dbeafe", 18, 18, 15, 2),
      p("rectangle", "#dbeafe", 18, 24, 15, 2),
    ],
  },
  {
    id: "tv",
    label: "TV",
    shape: "rectangle",
    pieces: [
      p("rectangle", "#334155", 7, 10, 34, 24),
      p("rectangle", "#7dd3fc", 10, 13, 24, 18),
      p("rectangle", "#334155", 20, 34, 8, 4),
      p("rectangle", "#334155", 13, 38, 22, 3),
      p("circle", "#fca5a5", 36, 29, 2, 2),
    ],
  },
  // ── Triangles ──────────────────────────────────────────────────────────────
  {
    id: "flag",
    label: "flag",
    shape: "triangle",
    pieces: [
      p("rectangle", "#94a3b8", 13, 6, 3, 34),
      p("triangle", "#ef4444", 16, 8, 20, 16),
    ],
  },
  {
    id: "hat",
    label: "party hat",
    shape: "triangle",
    pieces: [
      p("triangle", "#a855f7", 13, 10, 22, 28),
      p("circle", "#fde047", 20, 4, 8, 8),
      p("circle", "#fbbf24", 18, 22, 3, 3),
      p("circle", "#fbbf24", 26, 28, 3, 3),
    ],
  },
  {
    id: "pizza",
    label: "pizza slice",
    shape: "triangle",
    pieces: [
      p("triangle", "#fbbf24", 12, 8, 24, 30, 180),
      p("rectangle", "#f59e0b", 12, 8, 24, 5),
      p("circle", "#ef4444", 20, 15, 5, 5),
      p("circle", "#ef4444", 26, 22, 4, 4),
      p("circle", "#ef4444", 19, 24, 3, 3),
    ],
  },
];

const BY_ID: Record<string, WorldObject> = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));

export function getWorldObject(id: string): WorldObject {
  return BY_ID[id] ?? OBJECTS[0]!;
}

export function listWorldObjects(): WorldObject[] {
  return OBJECTS;
}

export function worldObjectsByShape(shape: StarpathShape): string[] {
  return OBJECTS.filter((o) => o.shape === shape).map((o) => o.id);
}

export function worldObjectShape(id: string): StarpathShape {
  return getWorldObject(id).shape;
}

// Full SVG string for an object icon (used by the offline harness; the card
// renders the same markup via dangerouslySetInnerHTML).
export function worldObjectSvg(object: WorldObject, opts?: { size?: number }): string {
  const size = opts?.size ?? 64;
  const body = object.pieces.map((piece) => huntPieceSvg(piece, { strokeWidth: 1.2 })).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${object.label}">${body}</svg>`;
}
