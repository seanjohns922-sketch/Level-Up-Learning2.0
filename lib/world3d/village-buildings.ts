export const VILLAGE_STYLES = { castle: "Castle village", country: "Country village", coastal: "Coastal village" } as const;
export type VillageStyle = keyof typeof VILLAGE_STYLES;
export function villageStyle(value: unknown): VillageStyle {
  return value === "country" || value === "coastal" ? value : "castle";
}
// One XP purchase unlocks the design, its styles and repeat placements.
export const VILLAGE_BUILDINGS = [
  { key: "village_cottage", name: "Village Cottage", price: 350, tier: 1, grid: "5x5", height: 5, width: 7, floors: 1, depth: 5.4, kind: "home", icon: "house" },
  { key: "village_family_house", name: "Family House", price: 850, tier: 2, grid: "6x6", height: 8, width: 8, floors: 2, depth: 6.4, kind: "home", icon: "house" },
  { key: "village_townhouse", name: "Village Townhouse", price: 650, tier: 2, grid: "4x5", height: 8, width: 5, floors: 2, depth: 6.4, kind: "home", icon: "building" },
  { key: "village_manor", name: "Grand Manor", price: 2200, tier: 3, grid: "9x7", height: 9, width: 13, floors: 2, depth: 8, kind: "manor", icon: "landmark" },
  { key: "village_store", name: "General Store", price: 600, tier: 2, grid: "6x5", height: 5.5, width: 8, floors: 1, depth: 5.8, kind: "shop", icon: "store" },
  { key: "village_cafe", name: "Village Café", price: 750, tier: 2, grid: "7x7", height: 8, width: 7.5, floors: 2, depth: 6.4, kind: "cafe", icon: "coffee" },
  { key: "village_library", name: "Village Library", price: 1200, tier: 2, grid: "7x6", height: 7, width: 10, floors: 1, depth: 7, kind: "library", icon: "book-open" },
  { key: "village_town_hall", name: "Town Hall", price: 1800, tier: 3, grid: "8x7", height: 10, width: 12, floors: 1, depth: 8, kind: "hall", icon: "landmark" },
  { key: "village_apartments", name: "City Apartment Tower", price: 2800, tier: 3, grid: "7x7", height: 35, width: 9, floors: 10, depth: 8, kind: "apartments", icon: "building-2" },
] as const;
export const VILLAGE_BUILDING_KEYS = new Set<string>(VILLAGE_BUILDINGS.map(item => item.key));
export function isVillageBuilding(assetKey: unknown) { return typeof assetKey === "string" && VILLAGE_BUILDING_KEYS.has(assetKey); }
