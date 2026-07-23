import type { FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";

export type StarpathBuildObjectId =
  | "rocket"
  | "house"
  | "tree"
  | "robot"
  | "moon-buggy"
  | "space-station"
  | "planet"
  | "alien"
  | "satellite"
  | "cat";

export type StarpathBuildPiece = {
  id: string;
  shape: FoundationShape;
  colour: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type StarpathBuildObject = {
  id: StarpathBuildObjectId;
  label: string;
  pieces: readonly StarpathBuildPiece[];
};

const piece = (
  id: string,
  shape: FoundationShape,
  colour: string,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0
): StarpathBuildPiece => ({ id, shape, colour, x, y, width, height, rotation });

export const STARPATH_BUILD_OBJECTS: Record<StarpathBuildObjectId, StarpathBuildObject> = {
  rocket: {
    id: "rocket",
    label: "Rocket",
    pieces: [
      piece("body", "rectangle", "#67e8f9", 32, 37, 24, 34),
      piece("nose", "triangle", "#fde047", 32, 14, 28, 24),
      piece("window", "circle", "#c4b5fd", 32, 34, 13, 13),
      piece("flame", "triangle", "#fb7185", 32, 59, 18, 18, 180),
    ],
  },
  house: {
    id: "house",
    label: "House",
    pieces: [
      piece("home", "square", "#86efac", 32, 42, 38, 38),
      piece("roof", "triangle", "#f9a8d4", 32, 18, 48, 30),
      piece("door", "rectangle", "#c4b5fd", 32, 49, 13, 24),
      piece("window", "square", "#67e8f9", 21, 38, 10, 10),
    ],
  },
  tree: {
    id: "tree",
    label: "Tree",
    pieces: [
      piece("trunk", "rectangle", "#a16207", 32, 49, 13, 27),
      piece("leaves-left", "circle", "#86efac", 23, 29, 27, 27),
      piece("leaves-right", "circle", "#22c55e", 41, 29, 27, 27),
      piece("leaves-top", "circle", "#4ade80", 32, 18, 29, 29),
    ],
  },
  robot: {
    id: "robot",
    label: "Robot",
    pieces: [
      piece("body", "square", "#67e8f9", 32, 43, 31, 31),
      piece("head", "rectangle", "#c4b5fd", 32, 20, 35, 22),
      piece("eye-left", "circle", "#fde047", 25, 20, 7, 7),
      piece("eye-right", "circle", "#fde047", 39, 20, 7, 7),
      piece("badge", "triangle", "#f9a8d4", 32, 43, 12, 11),
    ],
  },
  "moon-buggy": {
    id: "moon-buggy",
    label: "Moon buggy",
    pieces: [
      piece("body", "rectangle", "#67e8f9", 32, 37, 45, 19),
      piece("cab", "square", "#c4b5fd", 42, 25, 19, 19),
      piece("wheel-left", "circle", "#475569", 20, 50, 15, 15),
      piece("wheel-right", "circle", "#475569", 46, 50, 15, 15),
    ],
  },
  "space-station": {
    id: "space-station",
    label: "Space station",
    pieces: [
      piece("hub", "square", "#c4b5fd", 32, 32, 22, 22),
      piece("panel-left", "rectangle", "#67e8f9", 13, 32, 23, 14),
      piece("panel-right", "rectangle", "#67e8f9", 51, 32, 23, 14),
      piece("dome", "circle", "#fde047", 32, 17, 16, 16),
      piece("base", "triangle", "#f9a8d4", 32, 51, 22, 20, 180),
    ],
  },
  planet: {
    id: "planet",
    label: "Planet",
    pieces: [
      piece("planet", "circle", "#c4b5fd", 32, 32, 39, 39),
      piece("ring", "rectangle", "#fde047", 32, 32, 57, 8, -14),
      piece("moon", "circle", "#67e8f9", 54, 13, 11, 11),
    ],
  },
  alien: {
    id: "alien",
    label: "Alien",
    pieces: [
      piece("head", "circle", "#86efac", 32, 23, 36, 32),
      piece("body", "rectangle", "#c4b5fd", 32, 48, 27, 28),
      piece("eye-left", "circle", "#1e1b4b", 25, 22, 7, 9),
      piece("eye-right", "circle", "#1e1b4b", 39, 22, 7, 9),
    ],
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    pieces: [
      piece("body", "square", "#fde047", 32, 33, 22, 22),
      piece("panel-left", "rectangle", "#67e8f9", 13, 33, 23, 13),
      piece("panel-right", "rectangle", "#67e8f9", 51, 33, 23, 13),
      piece("dish", "circle", "#c4b5fd", 32, 15, 17, 17),
    ],
  },
  cat: {
    id: "cat",
    label: "Cat",
    pieces: [
      piece("head", "circle", "#f9a8d4", 32, 25, 32, 30),
      piece("ear-left", "triangle", "#fde047", 21, 10, 16, 17),
      piece("ear-right", "triangle", "#fde047", 43, 10, 16, 17),
      piece("body", "rectangle", "#c4b5fd", 32, 49, 27, 28),
    ],
  },
};

export function getBuildObject(objectId: string): StarpathBuildObject {
  return STARPATH_BUILD_OBJECTS[objectId as StarpathBuildObjectId] ?? STARPATH_BUILD_OBJECTS.rocket;
}

export function getBuildShapes(objectId: string): FoundationShape[] {
  return [...new Set(getBuildObject(objectId).pieces.map((item) => item.shape))];
}

export function countBuildShape(objectId: string, shape: FoundationShape): number {
  return getBuildObject(objectId).pieces.filter((item) => item.shape === shape).length;
}
