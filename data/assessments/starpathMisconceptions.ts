export type StarpathMisconception = {
  id: string;
  label: string;
  description: string;
  descriptorCodes: readonly string[];
};

function misconception(
  id: string,
  label: string,
  description: string,
  descriptorCodes: readonly string[],
): StarpathMisconception {
  return { id, label, description, descriptorCodes };
}

export const STARPATH_MISCONCEPTION_LIBRARY: readonly StarpathMisconception[] = [
  misconception("shape-orientation-invariance", "Shape orientation invariance", "Treats a turned or flipped familiar shape as a different shape.", ["AC9MFSP01", "AC9M1SP01", "AC9M2SP01"]),
  misconception("shape-colour-size", "Colour or size defines shape", "Classifies a shape by colour or size instead of its spatial features.", ["AC9MFSP01", "AC9M1SP01"]),
  misconception("shape-feature-count", "Shape feature counting", "Miscounts sides, corners or curved boundaries when naming or classifying a shape.", ["AC9MFSP01", "AC9M1SP01", "AC9M2SP01"]),
  misconception("shape-in-object", "Shape within an object", "Does not recognise a familiar shape when it appears as one component of an environmental object.", ["AC9MFSP01", "AC9M1SP01"]),
  misconception("classification-single-rule", "Only one classification rule", "Assumes a collection can be sorted in only one valid way.", ["AC9MFSP01", "AC9M1SP01", "AC9M2SP01"]),
  misconception("straight-curved-boundary", "Straight and curved boundaries", "Treats a curved boundary as a straight side or ignores mixed boundary types.", ["AC9M2SP01"]),
  misconception("parallel-opposite-confusion", "Parallel and opposite confusion", "Interchanges parallel sides with opposite sides or assumes every opposite pair is parallel.", ["AC9M2SP01"]),
  misconception("position-without-reference", "Position without a reference", "Uses a position word without identifying the object or location it is relative to.", ["AC9MFSP02"]),
  misconception("viewpoint-left-right", "Viewpoint and left-right", "Assumes left and right remain fixed when the viewpoint changes.", ["AC9MFSP02", "AC9M1SP02", "AC9M2SP02"]),
  misconception("route-start-order", "Route start and order", "Follows or gives correct-looking moves without preserving the starting point and instruction order.", ["AC9M1SP02", "AC9M2SP02", "AC9M3SP02"]),
  misconception("route-destination-only", "Destination-only route", "Treats reaching the destination as sufficient when a route misses required checkpoints or constraints.", ["AC9M1SP02", "AC9M2SP02", "AC9M4SP02", "AC9M5SP02"]),
  misconception("map-symbol-representation", "Map symbol representation", "Treats a map symbol as the real object or cannot connect symbols and landmarks through a key.", ["AC9M2SP02", "AC9M3SP02"]),
  misconception("map-viewpoint", "Map viewpoint", "Interprets a top-view representation as though it were a front-view scene.", ["AC9M2SP02", "AC9M3SP02"]),
  misconception("map-relative-location", "Relative landmark location", "Locates a landmark without preserving its stated relationship to another landmark.", ["AC9M2SP02", "AC9M3SP02"]),
  misconception("object-feature-vocabulary", "Object feature vocabulary", "Confuses faces, edges and vertices or counts features that are hidden or shared incorrectly.", ["AC9M3SP01"]),
  misconception("object-use-without-features", "Object use without features", "Chooses an object for a use without connecting the decision to spatial features.", ["AC9M3SP01"]),
  misconception("object-view-consistency", "Object view consistency", "Treats front, side and top views as unrelated objects or exposes features that should be hidden.", ["AC9M3SP01", "AC9M4SP01", "AC9M5SP01"]),
  misconception("composite-decomposition", "Composite decomposition", "Assumes a composite form has only one decomposition or overlooks hidden component shapes and objects.", ["AC9M4SP01"]),
  misconception("approximation-as-exact", "Approximation as exact", "Treats an approximate representation as exact or adds detail that the model cannot justify.", ["AC9M4SP01"]),
  misconception("grid-reference-coordinate-order", "Grid reference and coordinate order", "Reverses a grid reference or treats Year 4 grid references as Cartesian ordered pairs.", ["AC9M4SP02"]),
  misconception("grid-path-reference", "Grid pathway references", "Names cells correctly but cannot use references and directions together to describe a pathway.", ["AC9M4SP02"]),
  misconception("line-symmetry-visual-balance", "Visual balance versus line symmetry", "Accepts a visually balanced design without testing whether corresponding points mirror across the line.", ["AC9M4SP03"]),
  misconception("rotational-line-symmetry", "Rotational and line symmetry", "Assumes line symmetry guarantees rotational symmetry or tests only a full turn.", ["AC9M4SP03"]),
  misconception("net-face-count", "Face count guarantees a net", "Assumes any connected arrangement with the right number of faces forms the object.", ["AC9M5SP01"]),
  misconception("net-adjacency-fold", "Net adjacency after folding", "Assumes faces touching in the flat net always touch after folding or misidentifies opposite faces.", ["AC9M5SP01"]),
  misconception("coordinate-order-scale", "Coordinate order and scale", "Reverses coordinate order, omits the origin or uses inconsistent axis intervals.", ["AC9M5SP02", "AC9M6SP02"]),
  misconception("coordinate-movement-change", "Coordinate movement change", "Changes both coordinates for an axis-aligned move or ignores signed movement across an axis.", ["AC9M5SP02", "AC9M5SP03", "AC9M6SP02"]),
  misconception("transformation-invariants", "Transformation invariants", "Assumes a translation, reflection or rotation changes side lengths, angles or overall size.", ["AC9M5SP03", "AC9M6SP03"]),
  misconception("transformation-reference", "Transformation reference", "Performs a reflection or rotation without preserving the stated mirror line, centre or angle.", ["AC9M4SP03", "AC9M5SP03", "AC9M6SP03"]),
  misconception("cross-section-face", "Cross-section versus face", "Assumes every cross-section must match an existing face of the object.", ["AC9M6SP01"]),
  misconception("parallel-sections-congruent", "Parallel sections are always congruent", "Assumes all parallel cuts through any object produce congruent cross-sections.", ["AC9M6SP01"]),
  misconception("quadrant-sign", "Quadrant signs and axes", "Ignores coordinate signs or assigns a point on an axis to a quadrant.", ["AC9M6SP02"]),
  misconception("transformation-order", "Transformation order", "Assumes changing the order of combined transformations cannot change the result.", ["AC9M6SP03"]),
  misconception("tessellation-gap-overlap", "Tessellation gaps and overlaps", "Treats any repeated decorative pattern as a tessellation without checking gaps and overlaps.", ["AC9M6SP03"]),
];

export const STARPATH_MISCONCEPTION_IDS = new Set(
  STARPATH_MISCONCEPTION_LIBRARY.map((item) => item.id),
);

export function getStarpathMisconception(id: string): StarpathMisconception | undefined {
  return STARPATH_MISCONCEPTION_LIBRARY.find((item) => item.id === id);
}
