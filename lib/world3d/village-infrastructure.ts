/** Modular pieces use the editor's two-metre cells so adjoining edges meet. */
export const VILLAGE_INFRASTRUCTURE = [
  { key: "village_plaza", name: "Village Paving Square", group: "furniture_fun", collection: "castle", grid: "1x1", height: .08, width: 2 },
  { key: "canal_straight", name: "Canal — Straight", group: "rocks_water", collection: "castle", grid: "1x1", height: .22, width: 2 },
  { key: "canal_corner", name: "Canal — Corner", group: "rocks_water", collection: "castle", grid: "1x1", height: .22, width: 2 },
  { key: "canal_junction", name: "Canal — Junction", group: "rocks_water", collection: "castle", grid: "1x1", height: .22, width: 2 },
  { key: "village_footbridge", name: "Stone Footbridge", group: "rocks_water", collection: "castle", grid: "3x2", height: 1.25, width: 4 },
  { key: "garden_gate", name: "Village Garden Gate", group: "furniture_fun", collection: "country", grid: "1x1", height: 1.2, width: 2 },
  { key: "corner_flower_bed", name: "Corner Flower Bed", group: "trees_plants", collection: "country", grid: "1x1", height: .65, width: 2 },
  { key: "double_street_lantern", name: "Double Street Lantern", group: "furniture_fun", collection: "castle", grid: "1x1", height: 3 },
] as const;
export const VILLAGE_INFRASTRUCTURE_KEYS = new Set<string>(VILLAGE_INFRASTRUCTURE.map(item => item.key));
