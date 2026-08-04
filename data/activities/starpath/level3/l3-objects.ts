// Level 3 (Year 3, AC9M3SP01) — the five Starpath 3D objects, rendered as
// procedural 3-tone SVG (viewBox 0 0 120 120). Features are informal for Year 3
// — rolls / stacks / slides, and flat vs curved surfaces — never faces / edges /
// vertices (reserved for Level 4). Kept local to Level 3 so it doesn't ripple
// the global task unions.

export type L3ObjectId = "cube" | "sphere" | "cylinder" | "cone" | "prism";

export type L3Object = {
  id: L3ObjectId;
  label: string; // geometry name, e.g. "cube"
  spaceName: string; // Starpath name, e.g. "Cargo Crate"
  colour: string; // representative swatch colour
  rolls: boolean;
  stacks: boolean;
  slides: boolean; // has at least one flat face it can slide on
  surface: "flat" | "curved" | "both";
  point: boolean; // has a single point (cone)
  inner: string; // SVG inner markup for viewBox 0 0 120 120
};

const CUBE = `<defs><linearGradient id="l3cT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#fbbf24"/></linearGradient><linearGradient id="l3cL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient><linearGradient id="l3cR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d97706"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><polygon points="28,46 60,64 60,98 28,80" fill="url(#l3cL)" stroke="#7c2d12" stroke-width="2" stroke-linejoin="round"/><polygon points="60,64 92,46 92,80 60,98" fill="url(#l3cR)" stroke="#7c2d12" stroke-width="2" stroke-linejoin="round"/><polygon points="60,28 92,46 60,64 28,46" fill="url(#l3cT)" stroke="#7c2d12" stroke-width="2" stroke-linejoin="round"/>`;

const SPHERE = `<defs><radialGradient id="l3sph" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#e0f2fe"/><stop offset="0.35" stop-color="#38bdf8"/><stop offset="1" stop-color="#075985"/></radialGradient></defs><circle cx="60" cy="60" r="37" fill="url(#l3sph)" stroke="#0c4a6e" stroke-width="2"/><ellipse cx="48" cy="46" rx="10" ry="6" fill="#f0f9ff" opacity="0.5"/>`;

const CYLINDER = `<defs><linearGradient id="l3cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c4b5fd"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs><path d="M40 40 V92 A20 8 0 0 0 80 92 V40 Z" fill="url(#l3cyl)" stroke="#4c1d95" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="40" rx="20" ry="8" fill="#ddd6fe" stroke="#4c1d95" stroke-width="2"/>`;

const CONE = `<defs><linearGradient id="l3con" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fecdd3"/><stop offset="0.45" stop-color="#f43f5e"/><stop offset="1" stop-color="#9f1239"/></linearGradient></defs><ellipse cx="60" cy="88" rx="30" ry="12" fill="#9f1239" stroke="#881337" stroke-width="2"/><path d="M60 22 L30 88 A30 12 0 0 0 90 88 Z" fill="url(#l3con)" stroke="#881337" stroke-width="2" stroke-linejoin="round"/><ellipse cx="50" cy="54" rx="5.5" ry="15" transform="rotate(-19 50 54)" fill="#fff1f2" opacity="0.4"/>`;

const PRISM = `<defs><linearGradient id="l3pT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#99f6e4"/><stop offset="1" stop-color="#5eead4"/></linearGradient><linearGradient id="l3pL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#14b8a6"/></linearGradient><linearGradient id="l3pR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><polygon points="27,42 69,63 69,91 27,70" fill="url(#l3pL)" stroke="#134e4a" stroke-width="2" stroke-linejoin="round"/><polygon points="93,51 69,63 69,91 93,79" fill="url(#l3pR)" stroke="#134e4a" stroke-width="2" stroke-linejoin="round"/><polygon points="51,30 93,51 69,63 27,42" fill="url(#l3pT)" stroke="#134e4a" stroke-width="2" stroke-linejoin="round"/>`;

export const L3_OBJECTS: Record<L3ObjectId, L3Object> = {
  cube: { id: "cube", label: "cube", spaceName: "Cargo Crate", colour: "#f59e0b", rolls: false, stacks: true, slides: true, surface: "flat", point: false, inner: CUBE },
  sphere: { id: "sphere", label: "sphere", spaceName: "Planet Ball", colour: "#38bdf8", rolls: true, stacks: false, slides: false, surface: "curved", point: false, inner: SPHERE },
  cylinder: { id: "cylinder", label: "cylinder", spaceName: "Fuel Tank", colour: "#8b5cf6", rolls: true, stacks: true, slides: true, surface: "both", point: false, inner: CYLINDER },
  cone: { id: "cone", label: "cone", spaceName: "Rocket Nose", colour: "#f43f5e", rolls: true, stacks: false, slides: true, surface: "both", point: true, inner: CONE },
  prism: { id: "prism", label: "rectangular prism", spaceName: "Supply Box", colour: "#14b8a6", rolls: false, stacks: true, slides: true, surface: "flat", point: false, inner: PRISM },
};

export const L3_OBJECT_IDS: L3ObjectId[] = ["cube", "sphere", "cylinder", "cone", "prism"];

export function getL3Object(id: string): L3Object {
  return L3_OBJECTS[id as L3ObjectId] ?? L3_OBJECTS.cube;
}

export function listL3Objects(): L3Object[] {
  return L3_OBJECT_IDS.map((id) => L3_OBJECTS[id]);
}

export function l3ObjectSvg(obj: L3Object, opts?: { size?: number }): string {
  const size = opts?.size ?? 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${obj.label}">${obj.inner}</svg>`;
}

// A short informal-feature phrase for teaching/feedback ("It rolls and stacks").
export function l3FeaturePhrase(obj: L3Object): string {
  const bits: string[] = [];
  if (obj.rolls) bits.push("rolls");
  if (obj.stacks) bits.push("stacks");
  if (obj.slides && !obj.stacks) bits.push("slides");
  if (obj.point) bits.push("has one point");
  if (bits.length === 0) return "sits flat";
  if (bits.length === 1) return `it ${bits[0]}`;
  return `it ${bits.slice(0, -1).join(", ")} and ${bits[bits.length - 1]}`;
}
