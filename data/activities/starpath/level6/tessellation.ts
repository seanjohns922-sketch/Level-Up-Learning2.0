// Tessellation tiles for Starpath Level 6 (Weeks 6-7, AC9M6SP03). A tile is
// repeated by a transformation rule to fill the plane. A tessellation has no
// gaps and no overlaps — which happens exactly when the angles meeting at a
// shared corner add to 360 degrees.

export type TileRule = "translate" | "rotate" | "reflect";

export type Tile = {
  id: string;
  name: string;
  /** Fills the plane with no gaps or overlaps. */
  tessellates: boolean;
  /** The transformation rule that generates the tiling (only for tessellating tiles). */
  rule?: TileRule;
  /** Why it does or does not fit — the angle-at-a-corner reason. */
  angleReason: string;
};

export const TILES: Record<string, Tile> = {
  square: { id: "square", name: "Square", tessellates: true, rule: "translate", angleReason: "Four 90-degree corners meet: 4 x 90 = 360." },
  rectangle: { id: "rectangle", name: "Rectangle", tessellates: true, rule: "translate", angleReason: "Four 90-degree corners meet: 360 degrees." },
  parallelogram: { id: "parallelogram", name: "Parallelogram", tessellates: true, rule: "translate", angleReason: "Opposite angles pair up to 360 degrees at each corner." },
  triangle: { id: "triangle", name: "Triangle", tessellates: true, rule: "rotate", angleReason: "Six 60-degree corners meet: 6 x 60 = 360." },
  hexagon: { id: "hexagon", name: "Hexagon", tessellates: true, rule: "translate", angleReason: "Three 120-degree corners meet: 3 x 120 = 360." },
  lshape: { id: "lshape", name: "L-shape", tessellates: true, rule: "rotate", angleReason: "Rotated copies fill the gaps so corners total 360 degrees." },
  pentagon: { id: "pentagon", name: "Regular pentagon", tessellates: false, angleReason: "108-degree corners cannot total 360: 3 x 108 = 324." },
  circle: { id: "circle", name: "Circle", tessellates: false, angleReason: "Round edges never share a full straight edge." },
};

export const TILE_IDS = Object.keys(TILES);
export const TESSELLATING_IDS = TILE_IDS.filter((id) => TILES[id]!.tessellates);
export const getTile = (id: string): Tile => TILES[id] ?? TILES.square!;

export const RULE_LABEL: Record<TileRule, string> = {
  translate: "Slide (translate) copies in two directions",
  rotate: "Rotate every second copy",
  reflect: "Reflect (flip) alternate rows",
};
