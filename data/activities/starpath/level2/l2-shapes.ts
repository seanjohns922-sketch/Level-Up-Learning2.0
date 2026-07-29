// Level 2 shape set (Year 2, AC9M2SP01). A small catalogue with the features
// Year 2 references — number of sides, straight vs curved edges, and
// parallel/opposite sides — rendered as clean polygons in a 0 0 48 48 box.
// Kept local to Level 2 so it doesn't ripple the global StarpathShape union.

const STROKE = "#312e81";

export type L2ShapeId =
  | "circle"
  | "oval"
  | "triangle"
  | "square"
  | "rectangle"
  | "pentagon"
  | "hexagon"
  | "trapezoid";

type Render =
  | { kind: "ellipse"; x: number; y: number; w: number; h: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number }
  | { kind: "poly"; n: number; rot: number; r: number }
  | { kind: "points"; points: string };

export type L2Shape = {
  id: L2ShapeId;
  label: string;
  sides: number;
  curved: boolean;
  parallelPairs: number;
  colour: string;
  render: Render;
};

export const L2_SHAPES: Record<L2ShapeId, L2Shape> = {
  circle: { id: "circle", label: "circle", sides: 0, curved: true, parallelPairs: 0, colour: "#67e8f9", render: { kind: "ellipse", x: 6, y: 6, w: 36, h: 36 } },
  oval: { id: "oval", label: "oval", sides: 0, curved: true, parallelPairs: 0, colour: "#c4b5fd", render: { kind: "ellipse", x: 4, y: 14, w: 40, h: 20 } },
  triangle: { id: "triangle", label: "triangle", sides: 3, curved: false, parallelPairs: 0, colour: "#fde047", render: { kind: "poly", n: 3, rot: -90, r: 21 } },
  square: { id: "square", label: "square", sides: 4, curved: false, parallelPairs: 2, colour: "#86efac", render: { kind: "rect", x: 8, y: 8, w: 32, h: 32 } },
  rectangle: { id: "rectangle", label: "rectangle", sides: 4, curved: false, parallelPairs: 2, colour: "#f9a8d4", render: { kind: "rect", x: 4, y: 14, w: 40, h: 20 } },
  pentagon: { id: "pentagon", label: "pentagon", sides: 5, curved: false, parallelPairs: 0, colour: "#fca5a5", render: { kind: "poly", n: 5, rot: -90, r: 21 } },
  hexagon: { id: "hexagon", label: "hexagon", sides: 6, curved: false, parallelPairs: 3, colour: "#93c5fd", render: { kind: "poly", n: 6, rot: 0, r: 22 } },
  trapezoid: { id: "trapezoid", label: "trapezoid", sides: 4, curved: false, parallelPairs: 1, colour: "#fbbf24", render: { kind: "points", points: "16,12 32,12 42,36 6,36" } },
};

export function getL2Shape(id: string): L2Shape {
  return L2_SHAPES[id as L2ShapeId] ?? L2_SHAPES.circle;
}

export function listL2Shapes(): L2Shape[] {
  return Object.values(L2_SHAPES);
}

function polyPoints(cx: number, cy: number, r: number, n: number, rotDeg: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const a = ((rotDeg + (i * 360) / n) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function l2ShapeInner(shape: L2Shape, opts?: { colour?: string; strokeWidth?: number }): string {
  const fill = opts?.colour ?? shape.colour;
  const sw = opts?.strokeWidth ?? 1.4;
  const common = `fill="${fill}" stroke="${STROKE}" stroke-width="${sw}" stroke-linejoin="round"`;
  const r = shape.render;
  if (r.kind === "ellipse") {
    return `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" ${common} />`;
  }
  if (r.kind === "rect") {
    return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2" ${common} />`;
  }
  if (r.kind === "points") {
    return `<polygon points="${r.points}" ${common} />`;
  }
  return `<polygon points="${polyPoints(24, 24, r.r, r.n, r.rot)}" ${common} />`;
}

export function l2ShapeSvg(shape: L2Shape, opts?: { size?: number; colour?: string }): string {
  const size = opts?.size ?? 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${shape.label}">${l2ShapeInner(shape, { colour: opts?.colour })}</svg>`;
}
