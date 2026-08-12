// Cross-section objects for Starpath Level 6 (Weeks 1-2, AC9M6SP01). A standing
// object is sliced by a horizontal plane; students read the 2D cross-section and
// compare parallel slices. The teaching point: a prism (and a cylinder) has a
// CONSTANT cross-section, while a pyramid or cone's slice SHRINKS toward the apex.
//
// Two flags carry the maths:
//   constantSection — true when parallel slices stay congruent (all prisms + cylinder)
//   isPrism         — true only for a right prism (polygonal bases); a cylinder is
//                     curved, so it has a constant section but is NOT a prism.

export type CrossKind = "prism" | "pyramid"; // how the body is drawn (extrude vs apex)
export type CrossBase = "rect" | "tri" | "circ" | "sq" | "hex";

export type CrossObject = {
  id: string;
  name: string;
  /** Body shape for rendering: extruded (prism/cylinder) or apex (pyramid/cone). */
  kind: CrossKind;
  base: CrossBase;
  /** The 2D shape a horizontal cut makes. */
  sectionName: "rectangle" | "triangle" | "circle" | "square" | "hexagon";
  /** Parallel slices stay congruent (prisms and the cylinder). */
  constantSection: boolean;
  /** A right prism (polygonal). The cylinder is curved, so this is false for it. */
  isPrism: boolean;
};

export const CROSS_OBJECTS: Record<string, CrossObject> = {
  rectPrism: { id: "rectPrism", name: "Rectangular prism", kind: "prism", base: "rect", sectionName: "rectangle", constantSection: true, isPrism: true },
  triPrism: { id: "triPrism", name: "Triangular prism", kind: "prism", base: "tri", sectionName: "triangle", constantSection: true, isPrism: true },
  hexPrism: { id: "hexPrism", name: "Hexagonal prism", kind: "prism", base: "hex", sectionName: "hexagon", constantSection: true, isPrism: true },
  cylinder: { id: "cylinder", name: "Cylinder", kind: "prism", base: "circ", sectionName: "circle", constantSection: true, isPrism: false },
  sqPyramid: { id: "sqPyramid", name: "Square pyramid", kind: "pyramid", base: "sq", sectionName: "square", constantSection: false, isPrism: false },
  cone: { id: "cone", name: "Cone", kind: "pyramid", base: "circ", sectionName: "circle", constantSection: false, isPrism: false },
};

export const CROSS_OBJECT_IDS = Object.keys(CROSS_OBJECTS);
export const getCrossObject = (id: string): CrossObject => CROSS_OBJECTS[id] ?? CROSS_OBJECTS.rectPrism!;

// Distinct shape names, for building cross-section multiple-choice options.
export const SECTION_SHAPES: CrossObject["sectionName"][] = ["rectangle", "triangle", "circle", "square", "hexagon"];
