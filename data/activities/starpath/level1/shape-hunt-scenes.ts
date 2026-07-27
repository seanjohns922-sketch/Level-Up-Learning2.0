import type { StarpathShape } from "@/data/activities/year1/practice-task";

// A picture built from many familiar shapes. Each piece is an individually
// tappable, countable shape; a lesson asks students to find and tally every
// shape of each kind. viewBox is 0 0 100 120 (portrait) for every scene so the
// picture panel keeps a consistent aspect ratio.

export type ShapeHuntPiece = {
  id: string;
  shape: StarpathShape;
  colour: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
};

export type ShapeHuntScene = {
  id: string;
  label: string;
  pieces: ShapeHuntPiece[];
};

export const HUNT_VIEWBOX = { w: 100, h: 120 } as const;
const STROKE = "#312e81";

function p(
  id: string,
  shape: StarpathShape,
  colour: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation?: number
): ShapeHuntPiece {
  return { id, shape, colour, x, y, w, h, rotation };
}

// ── Robot ────────────────────────────────────────────────────────────────────
// squares 6 · rectangles 8 · triangles 3 · circles 8
const ROBOT: ShapeHuntScene = {
  id: "robot",
  label: "Robot",
  pieces: [
    // antenna
    p("ant-ball", "circle", "#fde047", 44, 8, 12, 12),
    // head + ears
    p("head", "square", "#9bd0ff", 32, 18, 36, 36),
    p("ear-l", "triangle", "#c4b5fd", 24, 30, 9, 11, -90),
    p("ear-r", "triangle", "#c4b5fd", 67, 30, 9, 11, 90),
    p("eye-l", "circle", "#1e293b", 40, 28, 8, 8),
    p("eye-r", "circle", "#1e293b", 52, 28, 8, 8),
    p("mouth", "rectangle", "#1e293b", 41, 43, 18, 5),
    // body
    p("body", "rectangle", "#c4b5fd", 28, 58, 44, 40),
    p("panel", "square", "#a5f3fc", 33, 63, 12, 12),
    p("emblem", "triangle", "#fde047", 33, 80, 13, 13),
    p("btn1", "circle", "#f9a8d4", 52, 65, 7, 7),
    p("btn2", "circle", "#86efac", 52, 76, 7, 7),
    p("btn3", "circle", "#fca5a5", 52, 87, 7, 7),
    p("bolt1", "square", "#94a3b8", 29, 60, 4, 4),
    p("bolt2", "square", "#94a3b8", 67, 60, 4, 4),
    p("bolt3", "square", "#94a3b8", 29, 93, 4, 4),
    p("bolt4", "square", "#94a3b8", 67, 93, 4, 4),
    // arms + hands
    p("arm-l", "rectangle", "#c7cdd6", 15, 60, 10, 27),
    p("arm-r", "rectangle", "#c7cdd6", 75, 60, 10, 27),
    p("hand-l", "circle", "#9bd0ff", 14, 85, 12, 12),
    p("hand-r", "circle", "#9bd0ff", 74, 85, 12, 12),
    // legs + feet
    p("leg-l", "rectangle", "#c7cdd6", 37, 98, 10, 16),
    p("leg-r", "rectangle", "#c7cdd6", 53, 98, 10, 16),
    p("foot-l", "rectangle", "#94a3b8", 33, 113, 15, 6),
    p("foot-r", "rectangle", "#94a3b8", 52, 113, 15, 6),
  ],
};

const SCENES: Record<string, ShapeHuntScene> = {
  robot: ROBOT,
};

export function getHuntScene(id: string): ShapeHuntScene {
  return SCENES[id] ?? ROBOT;
}

export function listHuntScenes(): ShapeHuntScene[] {
  return Object.values(SCENES);
}

// Count each shape in a scene, in a stable hunt order (children learn the
// four families in this order). Only shapes that actually appear are returned.
const HUNT_ORDER: StarpathShape[] = ["square", "rectangle", "triangle", "circle"];

export function computeHunts(scene: ShapeHuntScene): Array<{ shape: StarpathShape; count: number }> {
  return HUNT_ORDER.flatMap((shape) => {
    const count = scene.pieces.filter((piece) => piece.shape === shape).length;
    return count > 0 ? [{ shape, count }] : [];
  });
}

// SVG markup for a single piece. Shared so the card and the offline render
// harness draw pixel-identical pictures.
export function huntPieceSvg(piece: ShapeHuntPiece, opts?: { fillOpacity?: number; strokeWidth?: number }): string {
  const sw = opts?.strokeWidth ?? 1.1;
  const fo = opts?.fillOpacity ?? 1;
  const cx = piece.x + piece.w / 2;
  const cy = piece.y + piece.h / 2;
  const transform = piece.rotation ? ` transform="rotate(${piece.rotation} ${cx} ${cy})"` : "";
  const common = `fill="${piece.colour}" fill-opacity="${fo}" stroke="${STROKE}" stroke-width="${sw}" stroke-linejoin="round"`;
  if (piece.shape === "circle" || piece.shape === "oval") {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${piece.w / 2}" ry="${piece.h / 2}" ${common}${transform} />`;
  }
  if (piece.shape === "triangle") {
    const points = `${cx},${piece.y} ${piece.x + piece.w},${piece.y + piece.h} ${piece.x},${piece.y + piece.h}`;
    return `<polygon points="${points}" ${common}${transform} />`;
  }
  const rx = piece.shape === "square" ? 3 : 3;
  return `<rect x="${piece.x}" y="${piece.y}" width="${piece.w}" height="${piece.h}" rx="${rx}" ${common}${transform} />`;
}

export function huntSceneSvg(scene: ShapeHuntScene, opts?: { width?: number }): string {
  const width = opts?.width ?? 360;
  const height = (width * HUNT_VIEWBOX.h) / HUNT_VIEWBOX.w;
  const body = scene.pieces.map((piece) => huntPieceSvg(piece)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${HUNT_VIEWBOX.w} ${HUNT_VIEWBOX.h}">${body}</svg>`;
}
