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

export type StarpathBuildDetail = StarpathBuildPiece & {
  parentPieceId: string;
};

export type StarpathBuildObject = {
  id: StarpathBuildObjectId;
  label: string;
  pieces: readonly StarpathBuildPiece[];
  details?: readonly StarpathBuildDetail[];
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

const detail = (
  parentPieceId: string,
  id: string,
  shape: FoundationShape,
  colour: string,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0
): StarpathBuildDetail => ({
  ...piece(id, shape, colour, x, y, width, height, rotation),
  parentPieceId,
});

export const STARPATH_BUILD_OBJECTS: Record<StarpathBuildObjectId, StarpathBuildObject> = {
  rocket: {
    id: "rocket",
    label: "Rocket",
    pieces: [
      piece("body", "rectangle", "#67e8f9", 32, 36, 22, 34),
      piece("nose", "triangle", "#fde047", 32, 13, 22, 20),
      piece("window", "circle", "#c4b5fd", 32, 31, 11, 11),
      piece("fin-left", "triangle", "#fb7185", 20, 48, 15, 17, -12),
      piece("fin-right", "triangle", "#fb7185", 44, 48, 15, 17, 12),
    ],
    details: [
      detail("body", "body-stripe", "rectangle", "#22d3ee", 32, 42, 20, 3),
      detail("body", "flame", "triangle", "#f59e0b", 32, 58, 11, 13, 180),
    ],
  },
  house: {
    id: "house",
    label: "House",
    pieces: [
      piece("home", "square", "#86efac", 32, 43, 36, 36),
      piece("roof", "triangle", "#f9a8d4", 32, 17, 42, 25),
      piece("door", "rectangle", "#c4b5fd", 37, 50, 12, 22),
      piece("window", "square", "#67e8f9", 22, 40, 10, 10),
    ],
    details: [
      detail("door", "door-knob", "circle", "#fde047", 40, 50, 3, 3),
      detail("window", "window-bar", "rectangle", "#312e81", 22, 40, 1.5, 8),
      detail("window", "window-cross", "rectangle", "#312e81", 22, 40, 8, 1.5),
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
      piece("head", "circle", "#f9a8d4", 32, 25, 31, 29),
      piece("ear-left", "triangle", "#f9a8d4", 21, 10, 15, 17, -5),
      piece("ear-right", "triangle", "#f9a8d4", 43, 10, 15, 17, 5),
      piece("body", "rectangle", "#c4b5fd", 32, 49, 25, 27),
    ],
    details: [
      detail("ear-left", "inner-ear-left", "triangle", "#fde047", 21, 11, 7, 8, -5),
      detail("ear-right", "inner-ear-right", "triangle", "#fde047", 43, 11, 7, 8, 5),
      detail("head", "eye-left", "circle", "#1e1b4b", 26, 24, 4, 5),
      detail("head", "eye-right", "circle", "#1e1b4b", 38, 24, 4, 5),
      detail("head", "nose", "triangle", "#7c3aed", 32, 30, 5, 4, 180),
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
