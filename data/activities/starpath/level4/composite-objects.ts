// Level 4 · Week 2 composite OBJECTS. A composite object is recognisable space
// equipment built from familiar SOLIDS (cube, cylinder, cone, sphere, prism),
// drawn in a simple 3-tone 2.5D style so each solid is identifiable and the whole
// reads as one object. Same part contract as the 2D composite figures (solid /
// ghost socket / hit-box + the solid's familiar-object id) so the build card
// renders both. Colour is coded by solid type to aid recognition.

import type { CompositeFigure, FigurePart } from "./composite-figures";

const S = 'stroke-width="2.6" stroke-linejoin="round"';
const G = 'fill="none" stroke="#67e8f9" stroke-width="3" stroke-dasharray="6 5" stroke-linejoin="round"';
const pad = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 });

// Solid colour sets: [front, top/highlight, dark side/stroke].
const COL = {
  cube: ["#8b5cf6", "#c4b5fd", "#4c1d95"],
  prism: ["#22c55e", "#86efac", "#14532d"],
  cylinder: ["#22d3ee", "#a5f3fc", "#0e7490"],
  cone: ["#ef4444", "#fca5a5", "#7f1d1d"],
  sphere: ["#f59e0b", "#fde68a", "#7c2d12"],
} as const;

function cube(id: string, label: string, x: number, y: number, s: number): FigurePart {
  const d = Math.round(s * 0.34);
  const [f, t, k] = COL.cube;
  const top = `<polygon points="${x},${y} ${x + d},${y - d} ${x + s + d},${y - d} ${x + s},${y}" fill="${t}" stroke="${k}" ${S}/>`;
  const side = `<polygon points="${x + s},${y} ${x + s + d},${y - d} ${x + s + d},${y + s - d} ${x + s},${y + s}" fill="${k}" stroke="${k}" ${S}/>`;
  const front = `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${f}" stroke="${k}" ${S}/>`;
  return { id, label, shape: "cube", solid: top + side + front, ghost: `<rect x="${x}" y="${y}" width="${s}" height="${s}" ${G}/>`, hit: pad({ x, y: y - d, w: s + d, h: s + d }) };
}
function prism(id: string, label: string, x: number, y: number, w: number, h: number): FigurePart {
  const d = Math.round(Math.min(w, h) * 0.28);
  const [f, t, k] = COL.prism;
  const top = `<polygon points="${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}" fill="${t}" stroke="${k}" ${S}/>`;
  const side = `<polygon points="${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}" fill="${k}" stroke="${k}" ${S}/>`;
  const front = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" stroke="${k}" ${S}/>`;
  return { id, label, shape: "prism", solid: top + side + front, ghost: `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${G}/>`, hit: pad({ x, y: y - d, w: w + d, h: h + d }) };
}
function cyl(id: string, label: string, x: number, y: number, w: number, h: number): FigurePart {
  const ry = Math.round(w * 0.22);
  const [f, t, k] = COL.cylinder;
  const body = `<path d="M${x} ${y} V${y + h} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h} V${y} Z" fill="${f}" stroke="${k}" ${S}/>`;
  const cap = `<ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="${ry}" fill="${t}" stroke="${k}" ${S}/>`;
  return { id, label, shape: "cylinder", solid: body + cap, ghost: `<path d="M${x} ${y} V${y + h} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h} V${y} Z" ${G}/>`, hit: pad({ x, y: y - ry, w, h: h + ry }) };
}
function cone(id: string, label: string, x: number, y: number, w: number, h: number, down = false): FigurePart {
  const ry = Math.round(w * 0.22);
  const [f, , k] = COL.cone;
  // Up: apex at top, base ellipse at bottom. Down (drill bit / bucket): base at top, apex at bottom.
  const d = down
    ? `M${x} ${y} A${w / 2} ${ry} 0 0 0 ${x + w} ${y} L${x + w / 2} ${y + h} Z`
    : `M${x + w / 2} ${y} L${x} ${y + h} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h} Z`;
  return { id, label, shape: "cone", solid: `<path d="${d}" fill="${f}" stroke="${k}" ${S}/>`, ghost: `<path d="${d}" ${G}/>`, hit: pad({ x, y: down ? y - ry : y, w, h: h + ry }) };
}
function sphere(id: string, label: string, cx: number, cy: number, r: number): FigurePart {
  const [f, t, k] = COL.sphere;
  const solid = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${k}" ${S}/><ellipse cx="${cx - r * 0.32}" cy="${cy - r * 0.34}" rx="${r * 0.34}" ry="${r * 0.22}" fill="${t}" opacity="0.75"/>`;
  return { id, label, shape: "sphere", solid, ghost: `<circle cx="${cx}" cy="${cy}" r="${r}" ${G}/>`, hit: pad({ x: cx - r, y: cy - r, w: r * 2, h: r * 2 }) };
}

const O = (id: string, name: string, viewBox: string, parts: FigurePart[]): CompositeFigure => ({ id, name, viewBox, parts });

export const L4_OBJECTS: CompositeFigure[] = [
  O("crane", "Crane", "0 0 220 220", [
    cube("base", "Base", 30, 160, 46),
    cyl("mast", "Mast", 44, 60, 22, 104),
    prism("jib", "Jib arm", 60, 60, 120, 22),
    sphere("hook", "Hook", 172, 118, 15),
  ]),
  O("satellite", "Satellite", "0 0 240 200", [
    cube("body", "Body", 96, 82, 48),
    prism("panel-left", "Left panel", 16, 96, 76, 24),
    prism("panel-right", "Right panel", 148, 96, 76, 24),
    cyl("mast", "Mast", 112, 34, 16, 50),
    sphere("dish", "Dish", 120, 30, 18),
  ]),
  O("lander", "Lander", "0 0 220 210", [
    prism("leg-left", "Left leg", 44, 120, 20, 74),
    prism("leg-right", "Right leg", 156, 120, 20, 74),
    cyl("body", "Body", 74, 74, 72, 60),
    sphere("dome", "Dome", 110, 66, 30),
    cone("antenna", "Antenna", 100, 14, 20, 34),
  ]),
  O("robotArm", "Robot Arm", "0 0 240 210", [
    cube("base", "Base", 26, 150, 52),
    cyl("post", "Post", 40, 58, 26, 98),
    prism("arm", "Arm", 54, 56, 130, 22),
    sphere("gripper", "Gripper", 190, 68, 16),
  ]),
  O("drill", "Drill Rig", "0 0 210 240", [
    prism("platform", "Platform", 40, 150, 130, 40),
    cube("housing", "Housing", 86, 94, 52),
    cyl("shaft", "Shaft", 96, 56, 24, 116),
    cone("bit", "Drill bit", 84, 170, 48, 52, true),
  ]),
  O("rover", "Cargo Loader", "0 0 240 190", [
    sphere("wheel-left", "Left wheel", 66, 150, 24),
    sphere("wheel-right", "Right wheel", 174, 150, 24),
    prism("deck", "Deck", 44, 108, 152, 34),
    cube("cab", "Cab", 150, 62, 46),
    cyl("tank", "Tank", 64, 66, 30, 46),
  ]),
  O("forklift", "Forklift", "0 0 240 200", [
    sphere("wheel-front", "Front wheel", 78, 150, 22),
    sphere("wheel-back", "Back wheel", 168, 150, 22),
    cube("body", "Body", 132, 84, 54),
    cyl("mast", "Mast", 52, 46, 18, 110),
    prism("fork", "Fork", 26, 138, 64, 16),
  ]),
  O("beacon", "Signal Beacon", "0 0 180 240", [
    prism("base", "Base", 46, 182, 88, 32),
    cyl("tower", "Tower", 62, 72, 56, 114),
    sphere("light", "Light", 90, 62, 20),
    cone("roof", "Roof", 66, 20, 48, 46),
  ]),
  O("fuelDepot", "Fuel Depot", "0 0 250 190", [
    prism("support", "Support", 34, 150, 182, 30),
    cyl("tank-left", "Left tank", 60, 58, 52, 96),
    cyl("tank-right", "Right tank", 146, 58, 52, 96),
    sphere("valve", "Valve", 120, 66, 16),
  ]),
  O("digger", "Digger", "0 0 250 200", [
    prism("track", "Track", 36, 152, 150, 34),
    cube("cab", "Cab", 46, 96, 50),
    prism("boom", "Boom", 96, 92, 74, 20),
    prism("stick", "Stick", 158, 100, 20, 58),
    cone("bucket", "Bucket", 146, 150, 40, 38, true),
  ]),
];

export function getL4Object(round: number): CompositeFigure {
  return L4_OBJECTS[round % L4_OBJECTS.length]!;
}
