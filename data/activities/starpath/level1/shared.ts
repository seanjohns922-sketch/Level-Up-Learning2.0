import type { StarpathShape } from "@/data/activities/year1/practice-task";

// Shared palette and shape facts for Starpath Level 1 (Year 1) content.
export const LEVEL_ONE_ARTWORK = "/images/starpath-home-bg-y1.png";

export const SHAPES: StarpathShape[] = ["circle", "oval", "triangle", "square", "rectangle"];
export const COLOURS = ["#67e8f9", "#c4b5fd", "#fde047", "#86efac", "#f9a8d4"] as const;

// Straight-side count used for "number of sides" classification (round = 0).
export const SIDES: Record<StarpathShape, 0 | 3 | 4> = {
  circle: 0,
  oval: 0,
  triangle: 3,
  square: 4,
  rectangle: 4,
};

export const isRound = (shape: StarpathShape): boolean => SIDES[shape] === 0;
export const hasCorners = (shape: StarpathShape): boolean => SIDES[shape] > 0;

export function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function colourFor(index: number): string {
  return COLOURS[((index % COLOURS.length) + COLOURS.length) % COLOURS.length]!;
}
