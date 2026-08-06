// Level 4 · Composite figures. A composite shape is a recognisable object made
// from differently-sized, differently-positioned FAMILIAR shapes — a house is a
// square + a triangle roof + a small square chimney. Each figure is one connected
// SVG composition (like the L3 build models) so the pieces meet and the silhouette
// reads as a real object. Every part carries a solid fragment, a dashed socket
// (ghost) fragment, its familiar-shape id, and a click hit-box in viewBox coords.

export type FigureShape = "triangle" | "square" | "rectangle" | "circle";

export type FigurePart = {
  id: string;
  label: string;
  shape: FigureShape;
  solid: string;
  ghost: string;
  hit: { x: number; y: number; w: number; h: number };
};
export type CompositeFigure = { id: string; name: string; viewBox: string; parts: FigurePart[] };

const S = 'stroke-width="3" stroke-linejoin="round"';
const G = 'fill="none" stroke="#67e8f9" stroke-width="3" stroke-dasharray="6 5" stroke-linejoin="round"';
const pad = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 });

function box(id: string, label: string, shape: "square" | "rectangle", x: number, y: number, w: number, h: number, fill: string, stroke: string): FigurePart {
  const g = `x="${x}" y="${y}" width="${w}" height="${h}" rx="3"`;
  return { id, label, shape, solid: `<rect ${g} fill="${fill}" stroke="${stroke}" ${S}/>`, ghost: `<rect ${g} ${G}/>`, hit: pad({ x, y, w, h }) };
}
function tri(id: string, label: string, pts: Array<[number, number]>, fill: string, stroke: string): FigurePart {
  const d = `M${pts[0]![0]} ${pts[0]![1]} L${pts[1]![0]} ${pts[1]![1]} L${pts[2]![0]} ${pts[2]![1]} Z`;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { id, label, shape: "triangle", solid: `<path d="${d}" fill="${fill}" stroke="${stroke}" ${S}/>`, ghost: `<path d="${d}" ${G}/>`, hit: pad({ x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }) };
}
function circ(id: string, label: string, cx: number, cy: number, r: number, fill: string, stroke: string, extra = ""): FigurePart {
  return { id, label, shape: "circle", solid: `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" ${S}/>${extra}`, ghost: `<circle cx="${cx}" cy="${cy}" r="${r}" ${G}/>`, hit: pad({ x: cx - r, y: cy - r, w: r * 2, h: r * 2 }) };
}
// Face detail baked onto a head part (shows once the head is placed).
const PERSON_FACE = `<circle cx="62" cy="38" r="3.6" fill="#1e293b"/><circle cx="78" cy="38" r="3.6" fill="#1e293b"/>`;
const CAT_FACE = `<circle cx="78" cy="68" r="4.5" fill="#1e293b"/><circle cx="102" cy="68" r="4.5" fill="#1e293b"/><path d="M84 82 L96 82 L90 89 Z" fill="#ec4899"/>`;

// Palette colours by role (kept distinct so parts read as separate shapes).
const C = {
  red: ["#ef4444", "#7f1d1d"], blue: ["#3b82f6", "#1e3a8a"], amber: ["#f59e0b", "#7c2d12"],
  brown: ["#7c4a2d", "#3f2412"], green: ["#22c55e", "#14532d"], green2: ["#16a34a", "#14532d"],
  grey: ["#cbd5e1", "#475569"], tyre: ["#334155", "#0f172a"], cyan: ["#22d3ee", "#0e7490"],
  purple: ["#a78bfa", "#4c1d95"], purple2: ["#c4b5fd", "#6d28d9"], pink: ["#f9a8d4", "#9d174d"],
  pink2: ["#f472b6", "#9d174d"], light: ["#e0f2fe", "#0369a1"], white: ["#f1f5f9", "#94a3b8"],
  gold: ["#fcd34d", "#b45309"], teal: ["#0891b2", "#164e63"], slate: ["#64748b", "#334155"], dark: ["#1e293b", "#0f172a"],
} as const;

const F = (id: string, name: string, viewBox: string, parts: FigurePart[]): CompositeFigure => ({ id, name, viewBox, parts });

export const L4_FIGURES: CompositeFigure[] = [
  F("house", "House", "0 0 200 200", [
    box("chimney", "Chimney", "square", 54, 44, 26, 32, ...C.amber),
    box("body", "Wall", "square", 55, 98, 90, 90, ...C.blue),
    tri("roof", "Roof", [[40, 98], [160, 98], [100, 40]], ...C.red),
    box("door", "Door", "rectangle", 88, 140, 24, 48, ...C.brown),
  ]),
  F("rocket", "Rocket", "0 0 160 230", [
    tri("fin-left", "Left fin", [[60, 150], [40, 195], [60, 195]], ...C.amber),
    tri("fin-right", "Right fin", [[100, 150], [120, 195], [100, 195]], ...C.amber),
    box("body", "Body", "rectangle", 60, 70, 40, 120, ...C.grey),
    tri("nose", "Nose", [[60, 70], [100, 70], [80, 26]], ...C.red),
    circ("window", "Window", 80, 110, 14, ...C.cyan),
  ]),
  F("sailboat", "Sailboat", "0 0 210 180", [
    box("hull", "Hull", "rectangle", 40, 132, 130, 26, ...C.brown),
    box("mast", "Mast", "rectangle", 100, 40, 6, 92, ...C.slate),
    tri("sail", "Sail", [[106, 46], [106, 128], [168, 128]], ...C.light),
    tri("flag", "Flag", [[100, 40], [100, 52], [122, 46]], ...C.red),
  ]),
  F("tree", "Tree", "0 0 160 210", [
    box("trunk", "Trunk", "rectangle", 68, 150, 24, 52, ...C.brown),
    tri("leaves-bottom", "Lower leaves", [[36, 152], [124, 152], [80, 92]], ...C.green2),
    tri("leaves-top", "Top leaves", [[48, 112], [112, 112], [80, 54]], ...C.green),
  ]),
  F("car", "Car", "0 0 220 140", [
    circ("wheel-left", "Left wheel", 60, 110, 22, ...C.tyre),
    circ("wheel-right", "Right wheel", 160, 110, 22, ...C.tyre),
    box("body", "Body", "rectangle", 20, 58, 180, 42, ...C.blue),
    box("cabin", "Cabin", "rectangle", 60, 28, 90, 34, ...C.cyan),
  ]),
  F("robot", "Robot", "0 0 180 220", [
    box("arm-left", "Left arm", "rectangle", 30, 84, 18, 62, ...C.amber),
    box("arm-right", "Right arm", "rectangle", 132, 84, 18, 62, ...C.amber),
    box("leg-left", "Left leg", "rectangle", 66, 156, 20, 52, ...C.purple),
    box("leg-right", "Right leg", "rectangle", 94, 156, 20, 52, ...C.purple),
    box("body", "Body", "rectangle", 55, 74, 70, 82, ...C.blue),
    box("head", "Head", "square", 62, 18, 56, 50, ...C.grey),
  ]),
  F("person", "Person", "0 0 140 220", [
    box("leg-left", "Left leg", "rectangle", 56, 172, 14, 40, ...C.brown),
    box("leg-right", "Right leg", "rectangle", 74, 172, 14, 40, ...C.brown),
    tri("body", "Dress", [[70, 64], [28, 172], [112, 172]], ...C.pink),
    circ("head", "Head", 70, 40, 26, ...C.gold, PERSON_FACE),
  ]),
  F("cat", "Cat", "0 0 180 175", [
    tri("ear-left", "Left ear", [[62, 50], [80, 20], [88, 54]], ...C.purple),
    tri("ear-right", "Right ear", [[118, 50], [100, 20], [92, 54]], ...C.purple),
    box("body", "Body", "rectangle", 56, 88, 68, 72, ...C.purple),
    circ("head", "Head", 90, 72, 40, ...C.purple2, CAT_FACE),
  ]),
  F("icecream", "Ice cream", "0 0 120 220", [
    tri("cone", "Cone", [[32, 108], [88, 108], [60, 205]], ...C.amber),
    circ("scoop", "Scoop", 60, 92, 34, ...C.pink),
    circ("cherry", "Cherry", 60, 50, 15, ...C.red),
  ]),
  F("fish", "Fish", "0 0 210 130", [
    tri("tail", "Tail", [[128, 65], [190, 22], [190, 108]], ...C.teal),
    circ("body", "Body", 90, 65, 46, ...C.cyan),
    circ("eye", "Eye", 70, 50, 8, ...C.white),
  ]),
  F("truck", "Truck", "0 0 235 150", [
    circ("wheel-1", "Wheel 1", 55, 110, 20, ...C.tyre),
    circ("wheel-2", "Wheel 2", 115, 110, 20, ...C.tyre),
    circ("wheel-3", "Wheel 3", 180, 110, 20, ...C.tyre),
    box("trailer", "Trailer", "rectangle", 18, 42, 132, 56, ...C.green),
    box("cab", "Cab", "rectangle", 152, 58, 58, 40, ...C.red),
  ]),
  F("snowman", "Snowman", "0 0 160 235", [
    circ("base", "Base", 80, 178, 48, ...C.white),
    circ("middle", "Middle", 80, 118, 36, ...C.white),
    circ("head", "Head", 80, 64, 26, ...C.white),
    box("hat", "Hat", "rectangle", 62, 18, 36, 28, ...C.dark),
    tri("nose", "Nose", [[80, 60], [80, 68], [102, 64]], ...C.amber),
  ]),
  F("train", "Train", "0 0 235 150", [
    circ("wheel-1", "Wheel 1", 55, 112, 18, ...C.tyre),
    circ("wheel-2", "Wheel 2", 120, 112, 18, ...C.tyre),
    box("body", "Body", "rectangle", 20, 58, 150, 46, ...C.blue),
    box("cab", "Cab", "rectangle", 24, 28, 52, 34, ...C.cyan),
    box("chimney", "Funnel", "rectangle", 138, 30, 22, 30, ...C.slate),
  ]),
  F("butterfly", "Butterfly", "0 0 200 180", [
    tri("wing-tl", "Top-left wing", [[100, 55], [38, 28], [48, 92]], ...C.pink),
    tri("wing-bl", "Lower-left wing", [[100, 88], [38, 150], [50, 100]], ...C.pink2),
    tri("wing-tr", "Top-right wing", [[100, 55], [162, 28], [152, 92]], ...C.pink),
    tri("wing-br", "Lower-right wing", [[100, 88], [162, 150], [150, 100]], ...C.pink2),
    box("body", "Body", "rectangle", 95, 42, 10, 92, ...C.purple),
  ]),
];

export function getL4Figure(round: number): CompositeFigure {
  return L4_FIGURES[round % L4_FIGURES.length]!;
}

// Compose the figure SVG: solid for placed parts, glowing socket for the rest.
export function figureSvg(figure: CompositeFigure, placed: (partId: string) => boolean): string {
  const body = figure.parts.map((part) => (placed(part.id) ? part.solid : part.ghost)).join("");
  return `<svg viewBox="${figure.viewBox}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
