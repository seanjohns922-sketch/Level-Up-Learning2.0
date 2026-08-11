// Authored 3D solids for Starpath Level 5 (Nets, Weeks 1-3). The live cube card
// classifies cube nets with a rolling engine; these other solids don't fold by
// that method, so each is hand-authored as a tree of hinged faces the card can
// render flat or folded — the same nested-hinge model as the cube card, extended
// with non-square faces (clip-path triangles) and non-90° fold angles.
//
// Hinge dirs mirror the card's HINGE map exactly:
//   N origin 50% 100% -> rotateX(-mag)   S origin 50% 0% -> rotateX(mag)
//   E origin 0% 50%   -> rotateY(-mag)   W origin 100% 50% -> rotateY(mag)

export type SolidKind = "cube" | "cuboid" | "triPrism" | "pyramid";
export type HingeDir = "N" | "S" | "E" | "W";
export type SolidFace = {
  id: string;
  w: number;
  h: number;
  color: string;
  /** clip-path for triangular faces; omitted for rectangles. */
  clip?: string;
  /** hinge to the parent face (absent on the root). */
  hinge?: { dir: HingeDir; mag: number };
  children: SolidFace[];
};

// Palette mirrors FACE_META in nets.ts so solids match the live cube cards.
const C = { amber: "#f59e0b", violet: "#7c3aed", rose: "#f43f5e", cyan: "#06b6d4", green: "#10b981", blue: "#3b82f6" };

const TRI: Record<HingeDir, string> = {
  N: "polygon(50% 0, 100% 100%, 0 100%)",
  S: "polygon(0 0, 100% 0, 50% 100%)",
  E: "polygon(0 0, 100% 50%, 0 100%)",
  W: "polygon(100% 0, 100% 100%, 0 50%)",
};

// Six rectangular faces (a cube is the special case W = D = H). front is the
// root; top/bottom/left/right hinge around it; back hangs off top so it lands
// opposite front once folded.
function cuboid(W: number, D: number, H: number): SolidFace {
  return {
    id: "front", w: W, h: H, color: C.cyan, children: [
      { id: "top", w: W, h: D, color: C.amber, hinge: { dir: "N", mag: 90 }, children: [
        { id: "back", w: W, h: H, color: C.rose, hinge: { dir: "N", mag: 90 }, children: [] },
      ] },
      { id: "bottom", w: W, h: D, color: C.violet, hinge: { dir: "S", mag: 90 }, children: [] },
      { id: "left", w: D, h: H, color: C.blue, hinge: { dir: "W", mag: 90 }, children: [] },
      { id: "right", w: D, h: H, color: C.green, hinge: { dir: "E", mag: 90 }, children: [] },
    ],
  };
}

// Three rectangles (a middle base with two flaps folding up ~120° to a ridge)
// capped by two end triangles that swing up to close the tube.
function triPrism(a: number, L: number, mag: number): SolidFace {
  const slant = Math.round((a * Math.sqrt(3)) / 2);
  return {
    id: "base", w: L, h: a, color: C.cyan, children: [
      { id: "sideA", w: L, h: a, color: C.green, hinge: { dir: "N", mag }, children: [] },
      { id: "sideB", w: L, h: a, color: C.amber, hinge: { dir: "S", mag }, children: [] },
      { id: "capL", w: slant, h: a, color: C.rose, clip: TRI.W, hinge: { dir: "W", mag: 90 }, children: [] },
      { id: "capR", w: slant, h: a, color: C.violet, clip: TRI.E, hinge: { dir: "E", mag: 90 }, children: [] },
    ],
  };
}

// A square base with four triangles that fold up past vertical (mag > 90) so
// their apexes meet over the centre.
function pyramid(b: number, s: number, mag: number): SolidFace {
  return {
    id: "base", w: b, h: b, color: C.blue, children: [
      { id: "triN", w: b, h: s, color: C.cyan, clip: TRI.N, hinge: { dir: "N", mag }, children: [] },
      { id: "triS", w: b, h: s, color: C.amber, clip: TRI.S, hinge: { dir: "S", mag }, children: [] },
      { id: "triW", w: s, h: b, color: C.green, clip: TRI.W, hinge: { dir: "W", mag }, children: [] },
      { id: "triE", w: s, h: b, color: C.rose, clip: TRI.E, hinge: { dir: "E", mag }, children: [] },
    ],
  };
}

// Fold-angle defaults, dialled on the prototype; tweak here to restyle every card.
const PYRAMID_LEAN = 116;
const PRISM_FOLD = 120;

export type SolidMeta = {
  kind: SolidKind;
  name: string;
  faceCount: number;
  /** Plain-language make-up of the net, e.g. "1 square and 4 triangles". */
  parts: string;
  /** Viewing tilt applied to the folded solid. */
  tilt: { x: number; y: number };
};

export const SOLID_META: Record<SolidKind, SolidMeta> = {
  cube: { kind: "cube", name: "Cube", faceCount: 6, parts: "6 squares", tilt: { x: -24, y: -30 } },
  cuboid: { kind: "cuboid", name: "Rectangular prism", faceCount: 6, parts: "6 rectangles", tilt: { x: -24, y: -30 } },
  triPrism: { kind: "triPrism", name: "Triangular prism", faceCount: 5, parts: "3 rectangles and 2 triangles", tilt: { x: -18, y: -26 } },
  pyramid: { kind: "pyramid", name: "Square-based pyramid", faceCount: 5, parts: "1 square and 4 triangles", tilt: { x: -30, y: -24 } },
};

export const SOLID_KINDS: SolidKind[] = ["cube", "cuboid", "triPrism", "pyramid"];

// Build the hinged face tree for a solid, sized to sit comfortably in the card.
export function buildSolid(kind: SolidKind): SolidFace {
  switch (kind) {
    case "cube": return cuboid(64, 64, 64);
    case "cuboid": return cuboid(94, 50, 66);
    case "triPrism": return triPrism(58, 100, PRISM_FOLD);
    case "pyramid": return pyramid(78, 84, PYRAMID_LEAN);
  }
}
