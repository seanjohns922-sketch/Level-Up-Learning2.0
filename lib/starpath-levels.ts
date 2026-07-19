export const STARPATH_LEVEL_IDS = [
  "ground",
  "level-1",
  "level-2",
  "level-3",
  "level-4",
  "level-5",
  "level-6",
] as const;

export type StarpathLevelId = (typeof STARPATH_LEVEL_IDS)[number];

export type StarpathLevelDefinition = {
  id: StarpathLevelId;
  displayLabel: string;
  yearLabel: "Prep" | `Year ${1 | 2 | 3 | 4 | 5 | 6}`;
  levelNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export const STARPATH_LEVELS: readonly StarpathLevelDefinition[] = [
  { id: "ground", displayLabel: "Ground Level", yearLabel: "Prep", levelNumber: 0 },
  { id: "level-1", displayLabel: "Level 1", yearLabel: "Year 1", levelNumber: 1 },
  { id: "level-2", displayLabel: "Level 2", yearLabel: "Year 2", levelNumber: 2 },
  { id: "level-3", displayLabel: "Level 3", yearLabel: "Year 3", levelNumber: 3 },
  { id: "level-4", displayLabel: "Level 4", yearLabel: "Year 4", levelNumber: 4 },
  { id: "level-5", displayLabel: "Level 5", yearLabel: "Year 5", levelNumber: 5 },
  { id: "level-6", displayLabel: "Level 6", yearLabel: "Year 6", levelNumber: 6 },
] as const;

export class InvalidStarpathLevelError extends Error {
  constructor(value: unknown) {
    super(`Unsupported Starpath level: ${String(value ?? "(missing)")}`);
    this.name = "InvalidStarpathLevelError";
  }
}

export function tryNormalizeStarpathLevel(value: unknown): StarpathLevelId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/_/g, "-").replace(/\s+/g, " ");
  if (!normalized) return null;
  if (["ground", "ground level", "prep"].includes(normalized)) return "ground";

  const match = /^(?:level[- ]?|year ?|y)?([1-6])$/.exec(normalized);
  return match ? (`level-${match[1]}` as StarpathLevelId) : null;
}

export function normalizeStarpathLevel(value: unknown): StarpathLevelId {
  const level = tryNormalizeStarpathLevel(value);
  if (!level) throw new InvalidStarpathLevelError(value);
  return level;
}

export function getStarpathLevel(level: StarpathLevelId): StarpathLevelDefinition {
  const definition = STARPATH_LEVELS.find((candidate) => candidate.id === level);
  if (!definition) throw new InvalidStarpathLevelError(level);
  return definition;
}

export function isGroundStarpathLevel(level: StarpathLevelId) {
  return level === "ground";
}
