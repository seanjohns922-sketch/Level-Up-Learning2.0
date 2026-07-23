import type { FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";

// Starpath's cosmic objects and the familiar shape each one is built around.
// Two objects per shape gives scenes real visual variety across lessons.
export type ShapeObjectId =
  | "planet"
  | "moon"
  | "rocket"
  | "flag"
  | "window"
  | "crate"
  | "door"
  | "bridge";

export const SHAPE_OBJECTS: Record<ShapeObjectId, { label: string; shape: FoundationShape; part: string }> = {
  planet: { label: "Planet", shape: "circle", part: "The planet is a circle." },
  moon: { label: "Moon", shape: "circle", part: "The moon is a circle." },
  rocket: { label: "Rocket", shape: "triangle", part: "The rocket nose is a triangle." },
  flag: { label: "Flag", shape: "triangle", part: "The flag is a triangle." },
  window: { label: "Window", shape: "square", part: "The window is a square." },
  crate: { label: "Crate", shape: "square", part: "The crate is a square." },
  door: { label: "Door", shape: "rectangle", part: "The door is a rectangle." },
  bridge: { label: "Bridge", shape: "rectangle", part: "The bridge is a rectangle." },
};

export const OBJECTS_BY_SHAPE: Record<FoundationShape, ShapeObjectId[]> = {
  circle: ["planet", "moon"],
  triangle: ["rocket", "flag"],
  square: ["window", "crate"],
  rectangle: ["door", "bridge"],
};

const SHAPE_ORDER: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];

// Build a 4-object scene (one object per shape) with the target shape's object
// as the correct answer. `variant` rotates which object represents each shape
// so the same lesson never shows an identical picture twice.
export function buildObjectScene(targetShape: FoundationShape, variant: number) {
  const objects = SHAPE_ORDER.map((shape) => {
    const options = OBJECTS_BY_SHAPE[shape];
    return options[variant % options.length]!;
  });
  const correctObjectId = OBJECTS_BY_SHAPE[targetShape][variant % OBJECTS_BY_SHAPE[targetShape].length]!;
  return { objects, correctObjectId };
}
