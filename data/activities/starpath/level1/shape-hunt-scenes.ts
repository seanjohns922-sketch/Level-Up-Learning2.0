import type { StarpathShape } from "@/data/activities/year1/practice-task";

// A picture built from many familiar shapes. Each piece is an individually
// tappable, countable shape; a lesson asks students to find and tally every
// shape of each kind. viewBox is 0 0 100 120 (portrait) for every scene so the
// picture panel keeps a consistent aspect ratio.

export type HuntDifficulty = "easy" | "medium" | "hard";

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
  difficulty: HuntDifficulty;
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

// Corner radius scaled to the piece so small squares stay square (a fixed
// radius rounded tiny bolts into circles). Big panels still get a soft corner.
export function huntCornerRadius(piece: ShapeHuntPiece): number {
  return Math.min(2.5, Math.min(piece.w, piece.h) * 0.16);
}

// ── Robot (medium) ───────────────────────────────────────────────────────────
// squares 6 · rectangles 8 · triangles 3 · circles 8
const ROBOT: ShapeHuntScene = {
  id: "robot",
  label: "Robot",
  difficulty: "medium",
  pieces: [
    p("ant-ball", "circle", "#fde047", 44, 8, 12, 12),
    p("head", "square", "#9bd0ff", 32, 18, 36, 36),
    p("ear-l", "triangle", "#c4b5fd", 24, 30, 9, 11, -90),
    p("ear-r", "triangle", "#c4b5fd", 67, 30, 9, 11, 90),
    p("eye-l", "circle", "#1e293b", 40, 28, 8, 8),
    p("eye-r", "circle", "#1e293b", 52, 28, 8, 8),
    p("mouth", "rectangle", "#1e293b", 41, 43, 18, 5),
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
    p("arm-l", "rectangle", "#c7cdd6", 15, 60, 10, 27),
    p("arm-r", "rectangle", "#c7cdd6", 75, 60, 10, 27),
    p("hand-l", "circle", "#9bd0ff", 14, 85, 12, 12),
    p("hand-r", "circle", "#9bd0ff", 74, 85, 12, 12),
    p("leg-l", "rectangle", "#c7cdd6", 37, 98, 10, 16),
    p("leg-r", "rectangle", "#c7cdd6", 53, 98, 10, 16),
    p("foot-l", "rectangle", "#94a3b8", 33, 113, 15, 6),
    p("foot-r", "rectangle", "#94a3b8", 52, 113, 15, 6),
  ],
};

// ── Rocket (easy) ────────────────────────────────────────────────────────────
// triangles 5 · rectangles 4 · circles 4 · squares 3
const ROCKET: ShapeHuntScene = {
  id: "rocket",
  label: "Rocket",
  difficulty: "easy",
  pieces: [
    p("nose", "triangle", "#fca5a5", 36, 8, 28, 22),
    p("body", "rectangle", "#e0e7ff", 38, 30, 24, 46),
    p("win1", "circle", "#67e8f9", 43, 38, 14, 14),
    p("win2", "circle", "#fde047", 46, 58, 8, 8),
    p("fin-l", "triangle", "#c4b5fd", 22, 58, 18, 26, 200),
    p("fin-r", "triangle", "#c4b5fd", 60, 58, 18, 26, 160),
    p("flame1", "triangle", "#fb923c", 40, 78, 20, 20, 180),
    p("flame2", "triangle", "#fde047", 44, 82, 12, 14, 180),
    p("planet", "circle", "#86efac", 10, 20, 16, 16),
    p("moon", "circle", "#a5f3fc", 78, 26, 12, 12),
    p("star1", "square", "#fde047", 16, 66, 7, 7, 45),
    p("star2", "square", "#fde047", 80, 60, 7, 7, 45),
    p("star3", "square", "#f9a8d4", 74, 86, 6, 6, 45),
    p("pad", "rectangle", "#94a3b8", 30, 102, 40, 8),
    p("leg-l", "rectangle", "#94a3b8", 33, 108, 6, 10),
    p("leg-r", "rectangle", "#94a3b8", 61, 108, 6, 10),
  ],
};

// ── Sailboat (easy) ──────────────────────────────────────────────────────────
// triangles 4 · rectangles 2 · circles 6 · squares 2
const SAILBOAT: ShapeHuntScene = {
  id: "sailboat",
  label: "Sailboat",
  difficulty: "easy",
  pieces: [
    p("sun", "circle", "#fde047", 76, 12, 18, 18),
    p("flag", "triangle", "#fca5a5", 50, 20, 12, 8),
    p("mast", "rectangle", "#94a3b8", 48, 26, 4, 44),
    p("sail1", "triangle", "#f9a8d4", 26, 28, 20, 42),
    p("sail2", "triangle", "#fbbf24", 54, 30, 20, 40),
    p("crate1", "square", "#86efac", 30, 58, 10, 10),
    p("crate2", "square", "#a5f3fc", 58, 58, 10, 10),
    p("deck", "rectangle", "#c084fc", 22, 68, 56, 8),
    p("hull", "triangle", "#7c3aed", 22, 76, 56, 22, 180),
    p("port1", "circle", "#fde047", 40, 80, 8, 8),
    p("port2", "circle", "#fde047", 54, 80, 8, 8),
    p("wave1", "circle", "#67e8f9", 16, 100, 15, 15),
    p("wave2", "circle", "#38bdf8", 42, 102, 15, 15),
    p("wave3", "circle", "#67e8f9", 68, 100, 15, 15),
  ],
};

// ── Truck (medium) ───────────────────────────────────────────────────────────
// squares 6 · rectangles 4 · circles 5 · triangles 1
const TRUCK: ShapeHuntScene = {
  id: "truck",
  label: "Truck",
  difficulty: "medium",
  pieces: [
    p("crate1", "square", "#fca5a5", 14, 30, 13, 13),
    p("crate2", "square", "#86efac", 30, 30, 13, 13),
    p("crate3", "square", "#fbbf24", 46, 30, 13, 13),
    p("cargo", "rectangle", "#93c5fd", 10, 44, 54, 34),
    p("door1", "rectangle", "#60a5fa", 16, 48, 20, 26),
    p("door2", "rectangle", "#60a5fa", 38, 48, 20, 26),
    p("logo", "square", "#fde047", 30, 54, 12, 12),
    p("cab", "square", "#c4b5fd", 64, 50, 26, 26),
    p("cab-win", "square", "#a5f3fc", 68, 54, 13, 13),
    p("flag", "triangle", "#f472b6", 78, 38, 10, 12),
    p("bumper", "rectangle", "#94a3b8", 64, 74, 28, 5),
    p("light", "circle", "#fde047", 86, 66, 6, 6),
    p("wheel1", "circle", "#1e293b", 20, 78, 18, 18),
    p("wheel2", "circle", "#1e293b", 60, 78, 18, 18),
    p("hub1", "circle", "#cbd5e1", 25, 83, 8, 8),
    p("hub2", "circle", "#cbd5e1", 65, 83, 8, 8),
  ],
};

// ── House (medium) ───────────────────────────────────────────────────────────
// triangles 2 · squares 3 · rectangles 4 · circles 6
const HOUSE: ShapeHuntScene = {
  id: "house",
  label: "House",
  difficulty: "medium",
  pieces: [
    p("sun", "circle", "#fde047", 78, 10, 16, 16),
    p("cloud1", "circle", "#e2e8f0", 8, 14, 15, 15),
    p("cloud2", "circle", "#e2e8f0", 18, 16, 15, 15),
    p("tree-top", "triangle", "#4ade80", 2, 56, 22, 28),
    p("tree-trunk", "rectangle", "#a16207", 10, 82, 6, 12),
    p("roof", "triangle", "#fca5a5", 18, 20, 64, 30),
    p("chimney", "rectangle", "#94a3b8", 60, 24, 10, 16),
    p("wall", "square", "#fde68a", 26, 50, 48, 48),
    p("win1", "square", "#7dd3fc", 30, 58, 12, 12),
    p("win2", "square", "#7dd3fc", 58, 58, 12, 12),
    p("door", "rectangle", "#c084fc", 44, 68, 14, 30),
    p("knob", "circle", "#fde047", 54, 84, 4, 4),
    p("bush1", "circle", "#86efac", 18, 92, 14, 14),
    p("bush2", "circle", "#86efac", 70, 92, 14, 14),
    p("path", "rectangle", "#cbd5e1", 46, 98, 10, 14),
  ],
};

// ── Castle (hard) ────────────────────────────────────────────────────────────
// rectangles 5 · triangles 6 · squares 11 · circles 4
const CASTLE: ShapeHuntScene = {
  id: "castle",
  label: "Castle",
  difficulty: "hard",
  pieces: [
    p("sun", "circle", "#fde047", 82, 8, 14, 14),
    p("cloud1", "circle", "#e2e8f0", 6, 12, 14, 14),
    p("flag-l", "triangle", "#f472b6", 16, 12, 9, 8),
    p("flag-c", "triangle", "#f472b6", 46, 4, 9, 8),
    p("flag-r", "triangle", "#f472b6", 76, 12, 9, 8),
    p("roof-l", "triangle", "#7c3aed", 8, 20, 24, 16),
    p("roof-c", "triangle", "#7c3aed", 38, 12, 24, 16),
    p("roof-r", "triangle", "#7c3aed", 68, 20, 24, 16),
    p("tower-l", "rectangle", "#cbd5e1", 12, 36, 16, 58),
    p("tower-c", "rectangle", "#e2e8f0", 42, 28, 16, 66),
    p("tower-r", "rectangle", "#cbd5e1", 72, 36, 16, 58),
    p("wall", "rectangle", "#f1f5f9", 20, 54, 60, 40),
    p("bat1", "square", "#94a3b8", 22, 48, 8, 8),
    p("bat2", "square", "#94a3b8", 34, 48, 8, 8),
    p("bat3", "square", "#94a3b8", 58, 48, 8, 8),
    p("bat4", "square", "#94a3b8", 70, 48, 8, 8),
    p("win-l1", "square", "#38bdf8", 16, 44, 8, 8),
    p("win-l2", "square", "#38bdf8", 16, 66, 8, 8),
    p("win-r1", "square", "#38bdf8", 76, 44, 8, 8),
    p("win-r2", "square", "#38bdf8", 76, 66, 8, 8),
    p("win-c", "square", "#38bdf8", 45, 40, 10, 10),
    p("win-w1", "square", "#38bdf8", 28, 62, 8, 8),
    p("win-w2", "square", "#38bdf8", 64, 62, 8, 8),
    p("gate", "rectangle", "#a16207", 42, 72, 16, 22),
    p("bush1", "circle", "#86efac", 14, 90, 12, 12),
    p("bush2", "circle", "#86efac", 74, 90, 12, 12),
  ],
};

// ── Train (hard) ─────────────────────────────────────────────────────────────
// rectangles 7 · squares 6 · triangles 2 · circles 11
const TRAIN: ShapeHuntScene = {
  id: "train",
  label: "Train",
  difficulty: "hard",
  pieces: [
    p("smoke1", "circle", "#e2e8f0", 30, 8, 12, 12),
    p("smoke2", "circle", "#cbd5e1", 40, 4, 15, 15),
    p("smoke3", "circle", "#e2e8f0", 53, 9, 12, 12),
    p("funnel-top", "rectangle", "#64748b", 28, 22, 14, 6),
    p("funnel", "rectangle", "#94a3b8", 31, 28, 8, 16),
    p("cabin", "square", "#c4b5fd", 8, 30, 20, 20),
    p("cab-win", "square", "#a5f3fc", 12, 34, 12, 12),
    p("roof1", "rectangle", "#7c3aed", 6, 40, 40, 5),
    p("roof2", "rectangle", "#db2777", 50, 42, 44, 5),
    p("engine", "rectangle", "#93c5fd", 8, 45, 36, 29),
    p("carriage", "rectangle", "#f472b6", 50, 47, 44, 27),
    p("light", "circle", "#fde047", 38, 52, 9, 9),
    p("flag", "triangle", "#86efac", 66, 34, 10, 10),
    p("flag2", "triangle", "#fbbf24", 20, 22, 8, 8),
    p("cw1", "square", "#a5f3fc", 54, 51, 11, 11),
    p("cw2", "square", "#a5f3fc", 68, 51, 11, 11),
    p("cw3", "square", "#a5f3fc", 82, 51, 9, 9),
    p("cw4", "square", "#a5f3fc", 30, 52, 10, 10),
    p("wheel1", "circle", "#1e293b", 12, 72, 15, 15),
    p("wheel2", "circle", "#1e293b", 30, 72, 15, 15),
    p("wheel3", "circle", "#1e293b", 54, 72, 15, 15),
    p("wheel4", "circle", "#1e293b", 74, 72, 15, 15),
    p("hub1", "circle", "#cbd5e1", 17, 77, 5, 5),
    p("hub2", "circle", "#cbd5e1", 59, 77, 5, 5),
    p("hub3", "circle", "#cbd5e1", 79, 77, 5, 5),
    p("track", "rectangle", "#94a3b8", 4, 90, 92, 6),
  ],
};

const SCENES: Record<string, ShapeHuntScene> = {
  robot: ROBOT,
  rocket: ROCKET,
  sailboat: SAILBOAT,
  truck: TRUCK,
  house: HOUSE,
  castle: CASTLE,
  train: TRAIN,
};

export function getHuntScene(id: string): ShapeHuntScene {
  return SCENES[id] ?? ROBOT;
}

export function listHuntScenes(): ShapeHuntScene[] {
  return Object.values(SCENES);
}

export function scenesByDifficulty(...tiers: HuntDifficulty[]): string[] {
  const wanted = new Set(tiers);
  const ids = listHuntScenes()
    .filter((scene) => wanted.has(scene.difficulty))
    .map((scene) => scene.id);
  return ids.length > 0 ? ids : listHuntScenes().map((scene) => scene.id);
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
  const rx = huntCornerRadius(piece);
  return `<rect x="${piece.x}" y="${piece.y}" width="${piece.w}" height="${piece.h}" rx="${rx}" ${common}${transform} />`;
}

export function huntSceneSvg(scene: ShapeHuntScene, opts?: { width?: number }): string {
  const width = opts?.width ?? 360;
  const height = (width * HUNT_VIEWBOX.h) / HUNT_VIEWBOX.w;
  const body = scene.pieces.map((piece) => huntPieceSvg(piece)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${HUNT_VIEWBOX.w} ${HUNT_VIEWBOX.h}">${body}</svg>`;
}
