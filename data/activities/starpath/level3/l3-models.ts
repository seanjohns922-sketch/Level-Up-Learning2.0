// Level 3 · Week 3 build models. Each model is ONE connected SVG composition so
// the parts always meet (a nose flush on a body, fins on the base) and it reads
// as a real vehicle. Parts combine 3D objects (cone, cylinder, sphere) with the
// 2D shapes from Levels 1-2 (triangle, circle, square, rectangle). Each part has
// a solid fragment, a dashed "socket" fragment, and a click hit-box in viewBox
// coordinates.

import { getL3Object, l3ObjectSvg, type L3ObjectId } from "./l3-objects";
import { getL2Shape, l2ShapeSvg } from "@/data/activities/starpath/level2/l2-shapes";

export type L3ModelShape =
  | "cone" | "cylinder" | "cube" | "sphere" | "prism"
  | "triangle" | "circle" | "square" | "rectangle";

const THREE_D = new Set<L3ModelShape>(["cone", "cylinder", "cube", "sphere", "prism"]);

export function shapeWord(shape: L3ModelShape): string {
  return shape === "prism" ? "rectangular prism" : shape;
}

// The palette icon a child taps — the recognition art for that shape/object.
export function shapeIconSvg(shape: L3ModelShape): string {
  if (THREE_D.has(shape)) return l3ObjectSvg(getL3Object(shape as L3ObjectId), { size: 96 });
  return l2ShapeSvg(getL2Shape(shape), { size: 96 });
}

export type L3ModelPart = {
  id: string;
  label: string;
  shape: L3ModelShape;
  solid: string;
  ghost: string;
  hit: { x: number; y: number; w: number; h: number };
};
export type L3Model = { id: string; name: string; prompt: string; viewBox: string; defs: string; parts: L3ModelPart[] };

// Uniform glowing-socket outline for any unplaced part.
const G = 'fill="none" stroke="#67e8f9" stroke-width="3.5" stroke-dasharray="7 6" stroke-linejoin="round"';

const ROCKET: L3Model = {
  id: "rocket",
  name: "Star Rocket",
  prompt: "Build the Star Rocket.",
  viewBox: "0 0 200 300",
  defs: `<defs>
    <linearGradient id="rk-body" x1="0" x2="1"><stop offset="0" stop-color="#ddd6fe"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
    <linearGradient id="rk-nose" x1="0" x2="1"><stop offset="0" stop-color="#fecdd3"/><stop offset="0.45" stop-color="#f43f5e"/><stop offset="1" stop-color="#9f1239"/></linearGradient>
    <linearGradient id="rk-fin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
    <radialGradient id="rk-win" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ecfeff"/><stop offset="0.5" stop-color="#67e8f9"/><stop offset="1" stop-color="#0891b2"/></radialGradient>
  </defs>`,
  parts: [
    { id: "fin-left", label: "Left fin", shape: "triangle", hit: { x: 34, y: 194, w: 44, h: 62 },
      solid: `<path d="M72 196 L40 250 L72 240 Z" fill="url(#rk-fin)" stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"/>`,
      ghost: `<path d="M72 196 L40 250 L72 240 Z" ${G}/>` },
    { id: "fin-right", label: "Right fin", shape: "triangle", hit: { x: 122, y: 194, w: 44, h: 62 },
      solid: `<path d="M128 196 L160 250 L128 240 Z" fill="url(#rk-fin)" stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"/>`,
      ghost: `<path d="M128 196 L160 250 L128 240 Z" ${G}/>` },
    { id: "body", label: "Body", shape: "cylinder", hit: { x: 68, y: 100, w: 64, h: 140 },
      solid: `<path d="M72 96 V236 A28 11 0 0 0 128 236 V96 Z" fill="url(#rk-body)" stroke="#4c1d95" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="96" rx="28" ry="11" fill="#ddd6fe" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<path d="M72 96 V236 A28 11 0 0 0 128 236 V96 Z" ${G}/>` },
    { id: "nose", label: "Nose", shape: "cone", hit: { x: 68, y: 28, w: 64, h: 68 },
      solid: `<path d="M100 30 L72 96 A28 11 0 0 0 128 96 Z" fill="url(#rk-nose)" stroke="#881337" stroke-width="3" stroke-linejoin="round"/>`,
      ghost: `<path d="M100 30 L72 96 A28 11 0 0 0 128 96 Z" ${G}/>` },
    { id: "window", label: "Window", shape: "circle", hit: { x: 76, y: 126, w: 48, h: 48 },
      solid: `<circle cx="100" cy="150" r="23" fill="url(#rk-win)" stroke="#155e75" stroke-width="3"/><ellipse cx="92" cy="142" rx="7" ry="4" fill="#fff" opacity="0.55"/>`,
      ghost: `<circle cx="100" cy="150" r="23" ${G}/>` },
  ],
};

const ROVER: L3Model = {
  id: "rover",
  name: "Moon Rover",
  prompt: "Build the Moon Rover.",
  viewBox: "0 0 260 210",
  defs: `<defs>
    <linearGradient id="rv-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0f766e"/></linearGradient>
    <linearGradient id="rv-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5f3fc"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
    <linearGradient id="rv-tank" x1="0" x2="1"><stop offset="0" stop-color="#ddd6fe"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
    <radialGradient id="rv-wheel" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#94a3b8"/><stop offset="1" stop-color="#334155"/></radialGradient>
  </defs>`,
  parts: [
    { id: "wheel-left", label: "Left wheel", shape: "circle", hit: { x: 54, y: 128, w: 66, h: 66 },
      solid: `<circle cx="87" cy="160" r="30" fill="url(#rv-wheel)" stroke="#1e293b" stroke-width="3"/><circle cx="87" cy="160" r="11" fill="#cbd5e1" stroke="#1e293b" stroke-width="2"/>`,
      ghost: `<circle cx="87" cy="160" r="30" ${G}/>` },
    { id: "wheel-right", label: "Right wheel", shape: "circle", hit: { x: 140, y: 128, w: 66, h: 66 },
      solid: `<circle cx="173" cy="160" r="30" fill="url(#rv-wheel)" stroke="#1e293b" stroke-width="3"/><circle cx="173" cy="160" r="11" fill="#cbd5e1" stroke="#1e293b" stroke-width="2"/>`,
      ghost: `<circle cx="173" cy="160" r="30" ${G}/>` },
    { id: "body", label: "Body", shape: "rectangle", hit: { x: 38, y: 84, w: 184, h: 62 },
      solid: `<rect x="40" y="86" width="180" height="58" rx="14" fill="url(#rv-body)" stroke="#134e4a" stroke-width="3"/>`,
      ghost: `<rect x="40" y="86" width="180" height="58" rx="14" ${G}/>` },
    { id: "cabin", label: "Cabin", shape: "square", hit: { x: 78, y: 46, w: 60, h: 44 },
      solid: `<rect x="82" y="50" width="52" height="40" rx="8" fill="url(#rv-cab)" stroke="#134e4a" stroke-width="3"/>`,
      ghost: `<rect x="82" y="50" width="52" height="40" rx="8" ${G}/>` },
    { id: "tank", label: "Fuel tank", shape: "cylinder", hit: { x: 156, y: 46, w: 46, h: 48 },
      solid: `<path d="M164 56 V86 A14 5 0 0 0 192 86 V56 Z" fill="url(#rv-tank)" stroke="#4c1d95" stroke-width="3" stroke-linejoin="round"/><ellipse cx="178" cy="56" rx="14" ry="5" fill="#ddd6fe" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<path d="M164 56 V86 A14 5 0 0 0 192 86 V56 Z" ${G}/>` },
  ],
};

const ROBOT: L3Model = {
  id: "robot",
  name: "Star Robot",
  prompt: "Build the Star Robot.",
  viewBox: "0 0 200 300",
  defs: `<defs>
    <radialGradient id="rb-head" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#e0f2fe"/><stop offset="0.35" stop-color="#38bdf8"/><stop offset="1" stop-color="#075985"/></radialGradient>
    <linearGradient id="rb-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
    <linearGradient id="rb-limb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
  </defs>`,
  parts: [
    { id: "leg-left", label: "Left leg", shape: "rectangle", hit: { x: 66, y: 190, w: 30, h: 66 },
      solid: `<rect x="72" y="192" width="20" height="58" rx="6" fill="url(#rb-limb)" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<rect x="72" y="192" width="20" height="58" rx="6" ${G}/>` },
    { id: "leg-right", label: "Right leg", shape: "rectangle", hit: { x: 104, y: 190, w: 30, h: 66 },
      solid: `<rect x="108" y="192" width="20" height="58" rx="6" fill="url(#rb-limb)" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<rect x="108" y="192" width="20" height="58" rx="6" ${G}/>` },
    { id: "arm-left", label: "Left arm", shape: "rectangle", hit: { x: 32, y: 104, w: 30, h: 76 },
      solid: `<rect x="38" y="108" width="20" height="64" rx="7" fill="url(#rb-limb)" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<rect x="38" y="108" width="20" height="64" rx="7" ${G}/>` },
    { id: "arm-right", label: "Right arm", shape: "rectangle", hit: { x: 138, y: 104, w: 30, h: 76 },
      solid: `<rect x="142" y="108" width="20" height="64" rx="7" fill="url(#rb-limb)" stroke="#4c1d95" stroke-width="3"/>`,
      ghost: `<rect x="142" y="108" width="20" height="64" rx="7" ${G}/>` },
    { id: "body", label: "Body", shape: "square", hit: { x: 60, y: 98, w: 80, h: 96 },
      solid: `<rect x="62" y="100" width="76" height="92" rx="12" fill="url(#rb-body)" stroke="#7c2d12" stroke-width="3"/><rect x="80" y="150" width="40" height="26" rx="6" fill="#fff7ed" stroke="#7c2d12" stroke-width="2"/>`,
      ghost: `<rect x="62" y="100" width="76" height="92" rx="12" ${G}/>` },
    { id: "head", label: "Head", shape: "sphere", hit: { x: 62, y: 18, w: 76, h: 76 },
      solid: `<circle cx="100" cy="56" r="34" fill="url(#rb-head)" stroke="#0c4a6e" stroke-width="3"/><ellipse cx="88" cy="44" rx="9" ry="6" fill="#f0f9ff" opacity="0.55"/><circle cx="89" cy="58" r="5.5" fill="#0c4a6e"/><circle cx="111" cy="58" r="5.5" fill="#0c4a6e"/>`,
      ghost: `<circle cx="100" cy="56" r="34" ${G}/>` },
  ],
};

const SATELLITE: L3Model = {
  id: "satellite",
  name: "Star Satellite",
  prompt: "Build the Star Satellite.",
  viewBox: "0 0 260 200",
  defs: `<defs>
    <linearGradient id="sat-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#0369a1"/></linearGradient>
    <linearGradient id="sat-top" x1="0" x2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient>
    <linearGradient id="sat-side" x1="0" x2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#075985"/></linearGradient>
    <linearGradient id="sat-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient>
    <linearGradient id="sat-mast" x1="0" x2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="0.5" stop-color="#94a3b8"/><stop offset="1" stop-color="#475569"/></linearGradient>
    <radialGradient id="sat-dish" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#f0f9ff"/><stop offset="0.6" stop-color="#a5b4fc"/><stop offset="1" stop-color="#4338ca"/></radialGradient>
  </defs>`,
  parts: [
    { id: "panel-left", label: "Left panel", shape: "rectangle", hit: { x: 20, y: 90, w: 88, h: 44 },
      solid: `<rect x="24" y="94" width="80" height="36" rx="4" fill="url(#sat-panel)" stroke="#0c1e57" stroke-width="3"/><path d="M50 94 V130 M77 94 V130 M24 112 H104" stroke="#93c5fd" stroke-width="1.5" opacity="0.7"/>`,
      ghost: `<rect x="24" y="94" width="80" height="36" rx="4" ${G}/>` },
    { id: "panel-right", label: "Right panel", shape: "rectangle", hit: { x: 152, y: 90, w: 88, h: 44 },
      solid: `<rect x="156" y="94" width="80" height="36" rx="4" fill="url(#sat-panel)" stroke="#0c1e57" stroke-width="3"/><path d="M182 94 V130 M209 94 V130 M156 112 H236" stroke="#93c5fd" stroke-width="1.5" opacity="0.7"/>`,
      ghost: `<rect x="156" y="94" width="80" height="36" rx="4" ${G}/>` },
    { id: "body", label: "Body", shape: "cube", hit: { x: 104, y: 70, w: 66, h: 70 },
      solid: `<path d="M106 86 L120 72 L168 72 L154 86 Z" fill="url(#sat-top)" stroke="#075985" stroke-width="3" stroke-linejoin="round"/><path d="M154 86 L168 72 L168 124 L154 138 Z" fill="url(#sat-side)" stroke="#075985" stroke-width="3" stroke-linejoin="round"/><rect x="106" y="86" width="48" height="52" rx="3" fill="url(#sat-body)" stroke="#075985" stroke-width="3"/>`,
      ghost: `<rect x="106" y="86" width="48" height="52" rx="3" ${G}/>` },
    { id: "mast", label: "Antenna mast", shape: "cylinder", hit: { x: 116, y: 44, w: 28, h: 34 },
      solid: `<path d="M122 50 V72 A8 4 0 0 0 138 72 V50 Z" fill="url(#sat-mast)" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="130" cy="50" rx="8" ry="4" fill="#e2e8f0" stroke="#334155" stroke-width="2.5"/>`,
      ghost: `<path d="M122 50 V72 A8 4 0 0 0 138 72 V50 Z" ${G}/>` },
    { id: "dish", label: "Dish", shape: "circle", hit: { x: 110, y: 16, w: 40, h: 40 },
      solid: `<circle cx="130" cy="36" r="16" fill="url(#sat-dish)" stroke="#3730a3" stroke-width="3"/><circle cx="130" cy="36" r="5" fill="#eef2ff" stroke="#3730a3" stroke-width="2"/>`,
      ghost: `<circle cx="130" cy="36" r="16" ${G}/>` },
  ],
};

export const L3_MODELS: L3Model[] = [ROCKET, ROVER, ROBOT, SATELLITE];

export function getL3Model(round: number): L3Model {
  return L3_MODELS[round % L3_MODELS.length]!;
}
