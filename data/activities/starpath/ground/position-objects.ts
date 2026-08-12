// Week 4 (Space Positions) shared catalog. Objects and relations reused across
// Find It / Say Where / Place It / Which Picture / Follow the Clues, and built
// to scale into later-year navigation and map work.

export type PositionObjectId =
  | "planet"
  | "moon"
  | "rocket"
  | "flag"
  | "star"
  | "crystal"
  | "alien"
  | "explorer"
  | "geospin"
  | "satellite"
  | "cave";

export type PositionRelation = "above" | "below" | "beside" | "in-front" | "behind" | "inside";

export const POSITION_OBJECTS: Record<PositionObjectId, { label: string }> = {
  planet: { label: "planet" },
  moon: { label: "moon" },
  rocket: { label: "rocket" },
  flag: { label: "flag" },
  star: { label: "star" },
  crystal: { label: "crystal" },
  alien: { label: "alien" },
  explorer: { label: "explorer" },
  geospin: { label: "Geospin" },
  satellite: { label: "satellite" },
  cave: { label: "cave" },
};

// Phrase used inside a sentence: "the star ABOVE the planet".
export const RELATION_PHRASE: Record<PositionRelation, string> = {
  above: "above",
  below: "below",
  beside: "beside",
  "in-front": "in front of",
  behind: "behind",
  inside: "inside",
};

// Label used on an answer button.
export const RELATION_WORD: Record<PositionRelation, string> = {
  above: "Above",
  below: "Below",
  beside: "Beside",
  "in-front": "In front",
  behind: "Behind",
  inside: "Inside",
};

export function positionObjectLabel(object: string): string {
  return POSITION_OBJECTS[object as PositionObjectId]?.label ?? object;
}
